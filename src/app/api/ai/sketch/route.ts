import { NextRequest, NextResponse } from "next/server";
import { buildForensicPrompt } from "@/services/ai/sketch-prompt-builder";
import { synthesizeProceduralSketch } from "@/services/ai/forensic-procedural-synthesizer";
import { env } from "@/env";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Maximum duration for Vercel Serverless Function execution (RTX 4050 GPU generation takes ~12-25s)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * Next.js server route proxy for forensic sketch synthesis.
 *
 * Architecture: Synchronous inline generation.
 * The POST handler generates the image directly and returns the complete result.
 * This avoids the in-memory queue + after() pattern which is incompatible with
 * Vercel's stateless serverless containers (each invocation is isolated — the
 * polling GET would hit a different container with no access to the queue state).
 *
 * The DB job record is still created for audit trail and as a fallback for the
 * polling endpoint, but the primary response contains the image directly.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.json();

    const caseId = rawBody.case_id || `CASE-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const witnessId = rawBody.witness_id || "WIT-01";
    const attributes = (rawBody.attributes && typeof rawBody.attributes === "object") ? rawBody.attributes : {};
    const prompt = rawBody.prompt || "";
    const sketchStyle = rawBody.sketch_style || "Forensic Graphite (Pencil)";
    const cameraAngle = rawBody.camera_angle || "frontal";
    const ageGroup = rawBody.age_group || "26-35";
    const gender = rawBody.gender || "Male";
    const ethnicity = rawBody.ethnicity || "Unspecified";
    const lightingMood = rawBody.lighting_mood || "neutral_studio";
    const detailLevel = rawBody.detail_level || "Standard";
    const resolution = rawBody.resolution ?? 640;
    const seed = rawBody.seed ?? Math.floor(100000 + Math.random() * 900000);
    const mode = rawBody.mode || (rawBody.prompt?.trim() ? "PROMPT_GENERATION" : "DATASET_COMPOSITE");
    const components = rawBody.components || undefined;

    // Create the Job in the Database for audit trail
    const job = await prisma.generationJob.create({
      data: {
        prompt: prompt || JSON.stringify(attributes),
        status: "PROCESSING",
        caseId: caseId,
      }
    });

    // --- Generate image SYNCHRONOUSLY inline ---
    try {
      // Build the master forensic prompt
      const engineeredPrompt = buildForensicPrompt({
        witnessStatement: prompt,
        attributes,
        sketchStyle,
        cameraAngle,
        ageGroup,
        gender,
        ethnicity,
        lightingMood,
        detailLevel,
      });

      let finalImageUrl: string | null = null;
      let generationEngine: string = "procedural_svg_fallback";
      let fastApiMetadata: Record<string, unknown> = {};

      // Strategy 1: Local FastAPI AI Microservice (GPU via ngrok tunnel)
      const aiServiceUrl = (env.AI_SERVICE_URL || "http://localhost:8000").replace(/\/$/, "");
      const aiSecret = env.AI_SERVICE_SECRET || "";

      try {
        const requestId = `req_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
        const steps = detailLevel === "Master" ? 36 : detailLevel === "Draft" ? 14 : 24;
        const controlStrength = typeof rawBody.control_strength === "number" ? rawBody.control_strength : undefined;

        const fastApiRes = await fetch(`${aiServiceUrl}/api/v1/sketch/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-AI-Secret": aiSecret,
            "X-Request-ID": requestId,
            "bypass-tunnel-reminder": "true",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            mode,
            case_id: caseId,
            witness_id: witnessId,
            attributes: mode === "DATASET_COMPOSITE" ? attributes : undefined,
            components: mode === "DATASET_COMPOSITE" ? components : undefined,
            seed,
            resolution: typeof resolution === "number" ? Math.min(resolution, 512) : 512,
            steps,
            ...(controlStrength !== undefined ? { control_strength: controlStrength } : {}),
            sketch_style: sketchStyle,
            camera_angle: cameraAngle,
            age_group: ageGroup,
            gender,
            ethnicity,
            lighting_mood: lightingMood,
            detail_level: detailLevel,
            prompt: mode === "PROMPT_GENERATION" ? (prompt.trim() || undefined) : undefined,
          }),
          signal: AbortSignal.timeout(50_000), // 50s hard timeout (leaves 10s buffer in 60s maxDuration)
        });

        if (fastApiRes.ok) {
          const fastApiData = await fastApiRes.json();
          const imageRelativeUrl: string | undefined = fastApiData.image?.url;

          // Capture metadata from the AI service response
          fastApiMetadata = fastApiData.metadata || {};
          if (fastApiData.llm_analysis) {
            fastApiMetadata.llm_analysis = fastApiData.llm_analysis;
          }

          if (imageRelativeUrl) {
            const imageAbsoluteUrl = `${aiServiceUrl}${imageRelativeUrl.startsWith("/") ? "" : "/"}${imageRelativeUrl}`;
            const imgRes = await fetch(imageAbsoluteUrl, {
              headers: {
                "bypass-tunnel-reminder": "true",
                "ngrok-skip-browser-warning": "true",
              },
              signal: AbortSignal.timeout(15_000),
            });

            if (imgRes.ok) {
              const imgBuffer = await imgRes.arrayBuffer();
              const b64 = Buffer.from(imgBuffer).toString("base64");
              const contentType = fastApiData.image?.content_type || "image/png";
              finalImageUrl = `data:${contentType};base64,${b64}`;
              generationEngine = "diffusion_local_sd15_controlnet";
            } else {
              console.warn(`[AI Route] Image fetch failed: HTTP ${imgRes.status}`);
            }
          }
        } else {
          const errText = await fastApiRes.text().catch(() => "");
          console.warn(`[AI Route] FastAPI returned HTTP ${fastApiRes.status}: ${errText.slice(0, 200)}`);
        }
      } catch (fastApiErr) {
        console.warn("[AI Route] Local ai-service unavailable, trying cloud fallback.", fastApiErr instanceof Error ? fastApiErr.message : "");
      }

      // Strategy 2: Gemini / Imagen 3 Cloud API (if Strategy 1 failed)
      if (!finalImageUrl) {
        const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (geminiKey) {
          try {
            const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict?key=${geminiKey}`;
            const geminiRes = await fetch(geminiEndpoint, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                instances: [{ prompt: engineeredPrompt.prompt }],
                parameters: {
                  sampleCount: 1,
                  aspectRatio: "4:5",
                  negativePrompt: engineeredPrompt.negativePrompt,
                },
              }),
              signal: AbortSignal.timeout(30_000),
            });

            if (geminiRes.ok) {
              const geminiData = await geminiRes.json();
              const b64 = geminiData.predictions?.[0]?.bytesBase64Encoded;
              if (b64) {
                finalImageUrl = `data:image/jpeg;base64,${b64}`;
                generationEngine = "gemini_imagen_3_cloud";
              }
            }
          } catch (geminiErr) {
            console.warn("[AI Route] Gemini image generation failed:", geminiErr);
          }
        }
      }

      // Strategy 3: Resilient High-Fidelity Forensic Procedural SVG Synthesizer
      if (!finalImageUrl) {
        const proceduralResult = synthesizeProceduralSketch({
          witnessStatement: prompt,
          attributes,
          sketchStyle,
          cameraAngle,
          ageGroup,
          gender,
          ethnicity,
          lightingMood,
          detailLevel,
          caseId,
          witnessId,
          seed,
          resolution,
        });
        finalImageUrl = proceduralResult.imageUrl;
        generationEngine = "procedural_svg_fallback";
      }

      // Update Job as COMPLETED in DB (for audit trail / polling fallback)
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "COMPLETED",
          imageUrl: finalImageUrl,
        }
      });

      // Return the complete result directly — no polling needed
      return NextResponse.json({
        job_id: job.id,
        status: "completed",
        image: {
          url: finalImageUrl,
          content_type: finalImageUrl?.startsWith("data:image/svg") ? "image/svg+xml" : "image/png",
        },
        metadata: {
          engine: generationEngine,
          case_id: caseId,
          witness_id: witnessId,
          seed,
          sketch_style: sketchStyle,
          camera_angle: cameraAngle,
          detail_level: detailLevel,
          ...(generationEngine === "procedural_svg_fallback" ? { fallback_notice: "GPU AI worker unreachable — used procedural SVG synthesis." } : {}),
          ...fastApiMetadata,
        },
        llm_analysis: fastApiMetadata.llm_analysis || null,
      });

    } catch (genErr) {
      // Mark job as failed in DB
      const errorMessage = genErr instanceof Error ? genErr.message : "Unknown generation error";
      await prisma.generationJob.update({
        where: { id: job.id },
        data: {
          status: "FAILED",
          error: errorMessage,
        }
      }).catch(() => {}); // Don't let DB error mask the original error

      console.error("[AI Route] Generation failed:", errorMessage);
      return NextResponse.json({
        job_id: job.id,
        status: "failed",
        error: { code: "GENERATION_ERROR", message: errorMessage },
      }, { status: 500 });
    }

  } catch (error: unknown) {
    console.error("[AI Route] Unexpected error in sketch route:", error);
    const message = error instanceof Error ? error.message : "Internal sketch generator error";
    return NextResponse.json({ error: { code: "GENERATION_ERROR", message } }, { status: 500 });
  }
}
