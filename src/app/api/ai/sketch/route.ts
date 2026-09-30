import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { buildForensicPrompt } from "@/services/ai/sketch-prompt-builder";
import { synthesizeProceduralSketch } from "@/services/ai/forensic-procedural-synthesizer";
import { env } from "@/env";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

// Maximum duration for Vercel Serverless Function execution (RTX 4050 GPU generation takes ~12-25s)
export const maxDuration = 60;
export const dynamic = "force-dynamic";

// Global in-memory queue to prevent concurrency issues (GPU OOM / Ngrok connection limits)
// This ensures that even if 5 users request an image at the exact same time, 
// they are processed 1 by 1 sequentially by the local AI worker.
const jobQueue: { id: string, execute: () => Promise<void> }[] = [];
let isProcessingQueue = false;

async function processQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  
  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    if (job) {
      try {
        await job.execute();
      } catch (e) {
        console.error(`[Queue] Error executing job ${job.id}:`, e);
      }
    }
  }
  
  isProcessingQueue = false;
}

/**
 * Next.js server route proxy for forensic sketch synthesis.
 * Now using Asynchronous Job Architecture.
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

    // Create the Job in the Database immediately
    const job = await prisma.generationJob.create({
      data: {
        prompt: prompt || JSON.stringify(attributes),
        status: "PENDING",
        caseId: caseId,
      }
    });

    // Define the async generation task
    const executeJob = async () => {
      try {
        // Update status to processing
        await prisma.generationJob.update({
          where: { id: job.id },
          data: { status: "PROCESSING" }
        });

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

        // Strategy 1: Local FastAPI AI Microservice
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
            signal: AbortSignal.timeout(180_000),
          });

          if (fastApiRes.ok) {
            const fastApiData = await fastApiRes.json();
            const imageRelativeUrl: string | undefined = fastApiData.image?.url;

            if (imageRelativeUrl) {
              const imageAbsoluteUrl = `${aiServiceUrl}${imageRelativeUrl.startsWith("/") ? "" : "/"}${imageRelativeUrl}`;
              const imgRes = await fetch(imageAbsoluteUrl, {
                headers: {
                  "bypass-tunnel-reminder": "true",
                  "ngrok-skip-browser-warning": "true",
                },
                signal: AbortSignal.timeout(30_000),
              });

              if (imgRes.ok) {
                const imgBuffer = await imgRes.arrayBuffer();
                const b64 = Buffer.from(imgBuffer).toString("base64");
                const contentType = fastApiData.image?.content_type || "image/png";
                finalImageUrl = `data:${contentType};base64,${b64}`;
              }
            }
          } else {
            console.warn(`[AI Route] FastAPI returned HTTP ${fastApiRes.status}`);
          }
        } catch (fastApiErr) {
          console.warn("[AI Route] Local ai-service unavailable, trying cloud fallback.");
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
              });

              if (geminiRes.ok) {
                const geminiData = await geminiRes.json();
                const b64 = geminiData.predictions?.[0]?.bytesBase64Encoded;
                if (b64) {
                  finalImageUrl = `data:image/jpeg;base64,${b64}`;
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
        }

        // Update Job as COMPLETED
        await prisma.generationJob.update({
          where: { id: job.id },
          data: {
            status: "COMPLETED",
            imageUrl: finalImageUrl
          }
        });

      } catch (err) {
        console.error("[Job Processing Error]:", err);
        await prisma.generationJob.update({
          where: { id: job.id },
          data: {
            status: "FAILED",
            error: err instanceof Error ? err.message : "Unknown error occurred"
          }
        });
      }
    };

    // Push task to the queue and trigger processor
    jobQueue.push({ id: job.id, execute: executeJob });
    after(() => {
      processQueue();
    });

    // Return jobId immediately so the client can start polling
    return NextResponse.json({
      job_id: job.id,
      status: "pending",
      message: "Image generation started asynchronously."
    });

  } catch (error: unknown) {
    console.error("[AI Route] Unexpected error in sketch route:", error);
    const message = error instanceof Error ? error.message : "Internal sketch generator error";
    return NextResponse.json({ error: { code: "GENERATION_ERROR", message } }, { status: 500 });
  }
}
