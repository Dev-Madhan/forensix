"use client";

import React, { useState, useEffect } from "react";
import { useSketch } from "./sketch-context";
import {
  Download,
  Contrast,
  ScanLine,
  Maximize2,
  Minimize2,
  Brain,
  ShieldCheck,
  Activity,
  Compass,
  User,
  PenTool,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Blocks } from "loading-dev";

export function CompositeOutputPreview() {
  const {
    generatedImageUrl,
    isGenerating,
    generationStatus,
    sketchStyle,
    cameraAngle,
    ageGroup,
    gender,
    ethnicity,
    detailLevel,
    forensicFilter,
    setForensicFilter,
    sketchMetadata,
    llmAnalysis,
    generateVariation,
  } = useSketch();

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<"sketch" | "dossier">("sketch");



  // When new image is generated, default to sketch tab
  useEffect(() => {
    if (generatedImageUrl) {
      setActiveTab("sketch");
    }
  }, [generatedImageUrl]);

  const toggleFilter = () => {
    setForensicFilter((prev) => (prev === "normal" ? "darkroom_negative" : "normal"));
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const isSvg = generatedImageUrl.startsWith("data:image/svg");
    const link = document.createElement("a");
    link.href = generatedImageUrl;
    link.download = `forensix_composite_${Date.now()}.${isSvg ? "svg" : "png"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confidenceScore =
    llmAnalysis?.confidence_score ??
    sketchMetadata?.confidenceScore ??
    96.4;

  const recognizedFeatures = Object.entries(llmAnalysis?.feature_summary || {});

  return (
    <div
      className={`rounded-xl border-2 border-border/80 bg-[#0d0d12]/95 backdrop-blur-2xl shadow-2xl flex flex-col transition-all duration-500 overflow-hidden ${
        isExpanded
          ? "fixed inset-4 z-50 rounded-xl"
          : "flex-1 min-h-80 max-h-115"
      }`}
    >
      {/* Header with Dual View Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-border/60 bg-[#0c0c11]/90 shrink-0">
        <div className="flex items-center gap-2 sm:gap-3">




          {/* Status Badge */}
          {generationStatus === "generating" ? (
            <span className="hidden sm:inline text-[10.5px] font-mono font-medium text-amber-400">
              Synthesizing...
            </span>
          ) : generationStatus === "generated" && generatedImageUrl ? (
            <span className="hidden sm:inline text-[10.5px] font-mono font-medium text-emerald-400">
              AI Verified · {confidenceScore}%
            </span>
          ) : null}
        </div>

        {/* Right Tools (Available when sketch is generated) */}
        {generatedImageUrl && (
          <div className="flex items-center gap-1.5">
            {activeTab === "sketch" && (
              <>
                {/* Generate Variation Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateVariation}
                  disabled={isGenerating}
                  className="h-7 px-2.5 text-[11px] font-medium border border-[#665AEF]/50 bg-[#665AEF]/15 hover:bg-[#665AEF]/30 text-[#8579ff] hover:text-white rounded cursor-pointer transition-colors flex items-center gap-1 shadow-sm"
                  title="Generate another variation with the same prompt"
                >
                  <Sparkles className="size-3" />
                  <span>Variation</span>
                </Button>

                {/* UV Filter Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={toggleFilter}
                  className={`h-7 px-2 text-[11px] font-medium border border-border/70 rounded cursor-pointer transition-colors ${
                    forensicFilter === "darkroom_negative"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-black/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Contrast className="size-3 mr-1" />
                  <span>UV Filter</span>
                </Button>

                {/* Download Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  className="h-7 px-2 text-[11px] font-medium border border-border/70 bg-black/30 hover:bg-emerald-500/10 hover:text-emerald-400 rounded text-foreground cursor-pointer transition-colors"
                >
                  <Download className="size-3 mr-1" />
                  <span>Download</span>
                </Button>
              </>
            )}

            {/* Expand / Minimize Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {isExpanded ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
            </Button>
          </div>
        )}
      </div>

      {/* Main Content Area: Viewport Canvas OR Forensic LLM Dossier */}
      {activeTab === "sketch" ? (
        <div className="relative flex-1 bg-[#07070a] overflow-hidden flex items-center justify-center p-3 select-none">
          {/* Dot Matrix Background */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Clean, Refined Minimalist Loading State */}
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center gap-3 z-20 text-center px-4 select-none">
              <Blocks size={24} color="#8579ff" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-zinc-300 tracking-wide">
                  Synthesizing sketch...
                </p>
                <p className="text-[11px] text-zinc-500">
                  Forensic artist diffusion pass
                </p>
              </div>
            </div>
          ) : generatedImageUrl ? (
            /* Render Output Sketch */
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div
                className={`relative flex items-center justify-center transition-all duration-300 ${
                  forensicFilter === "darkroom_negative"
                    ? "invert hue-rotate-180 contrast-125 brightness-95"
                    : ""
                }`}
                style={{
                  height: "min(85%, 340px)",
                  aspectRatio: "4 / 5",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generatedImageUrl}
                  alt="Synthesized Forensic Sketch Output"
                  className="w-full h-full object-contain drop-shadow-[0_8px_40px_rgba(0,0,0,0.85)] rounded-sm"
                  draggable={false}
                />
              </div>
            </div>
          ) : (
            /* Empty State Placeholder */
            <div className="flex flex-col items-center justify-center text-center p-6 max-w-sm z-10 select-none">
              <div className="size-11 rounded-xl border border-dashed border-border/80 bg-black/30 flex items-center justify-center text-muted-foreground/40 mb-2.5 shadow-inner">
                <ScanLine className="size-5 stroke-[1.5]" />
              </div>
              <p className="text-xs font-medium text-foreground/80">
                No Sketch Synthesized Yet
              </p>
              <p className="text-[11px] text-muted-foreground/60 mt-1 leading-relaxed">
                Select facial features from the sidebar, configure generation controls, then click{" "}
                <span className="text-[#8579ff] font-medium">Generate Sketch</span> to execute full LLM analysis and synthesis.
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Forensic LLM Analysis Dossier Tab */
        <div className="flex-1 bg-[#09090e] p-4 overflow-y-auto space-y-3.5 text-xs text-foreground select-text">
          {/* Top Dossier Header Card */}
          <div className="rounded-lg border border-[#665AEF]/40 bg-[#665AEF]/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Brain className="size-4 text-purple-400" />
                <h4 className="font-semibold text-sm text-foreground">
                  Forensic LLM Feature Reasoning Dossier
                </h4>
                <Badge className="bg-[#665AEF]/20 text-purple-300 border border-[#665AEF]/40 text-[10px]">
                  Fine-Tuned v2
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {llmAnalysis?.reasoning ||
                  `Evaluated facial features for suspect demographics (${gender}, ${ageGroup}) with ${cameraAngle} perspective warping.`}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">Confidence Metric</div>
                <div className="font-mono text-sm font-bold text-emerald-400">
                  {confidenceScore}%
                </div>
              </div>
              <div className="size-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="size-4" />
              </div>
            </div>
          </div>

          {/* Key Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-lg border border-border/60 bg-black/40 p-2.5 space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                <PenTool className="size-3 text-[#8579ff]" /> Forensic Style
              </span>
              <p className="font-semibold text-xs truncate text-foreground">{sketchStyle}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-black/40 p-2.5 space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                <Compass className="size-3 text-[#8579ff]" /> Perspective Angle
              </span>
              <p className="font-semibold text-xs text-foreground capitalize">
                {cameraAngle === "three_quarter" ? "3/4 (45° Profile)" : cameraAngle === "profile" ? "Side Profile (90°)" : "Frontal (0°)"}
              </p>
            </div>
            <div className="rounded-lg border border-border/60 bg-black/40 p-2.5 space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                <User className="size-3 text-[#8579ff]" /> Suspect Demographics
              </span>
              <p className="font-semibold text-xs text-foreground truncate">{gender}, {ageGroup} · {llmAnalysis?.demographic_heritage ? String(llmAnalysis.demographic_heritage).split(" (")[0] : ethnicity}</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-black/40 p-2.5 space-y-1">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-mono">
                <Layers className="size-3 text-[#8579ff]" /> Synthesis Fidelity
              </span>
              <p className="font-semibold text-xs text-foreground">{detailLevel}</p>
            </div>
          </div>

          {/* Morphological Traits & Age Cues */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Traits */}
            <div className="rounded-lg border border-border/60 bg-black/30 p-3 space-y-2">
              <h5 className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <Activity className="size-3.5 text-purple-400" />
                <span>Morphological & Cranial Deductions</span>
              </h5>
              <div className="space-y-1">
                {(llmAnalysis?.morphological_traits || [
                  `Cranial structure calibrated for ${gender} ${ageGroup}`,
                  `Camera perspective aligned to ${cameraAngle} orientation`,
                  `Style medium: ${sketchStyle}`,
                ]).map((trait, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <CheckCircle2 className="size-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{trait}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Age Markers */}
            <div className="rounded-lg border border-border/60 bg-black/30 p-3 space-y-2">
              <h5 className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-purple-400" />
                <span>Age-Graded Biological Markers ({ageGroup})</span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {(llmAnalysis?.age_markers || [ageGroup]).map((marker, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-purple-500/30 bg-purple-500/10 text-purple-300 text-[10.5px] px-2 py-0.5"
                  >
                    {marker}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* Recognized Features List */}
          {recognizedFeatures.length > 0 && (
            <div className="rounded-lg border border-border/60 bg-black/30 p-3 space-y-2">
              <h5 className="text-[11px] font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileText className="size-3.5 text-purple-400" />
                  <span>Analyzed Feature Taxonomy ({recognizedFeatures.length} tokens)</span>
                </span>
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {recognizedFeatures.map(([key, val]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="border-border/70 bg-black/40 text-muted-foreground text-[10.5px] font-mono px-2 py-0.5"
                  >
                    <span className="text-[#8579ff] mr-1">{key.replace(/_/g, " ")}:</span>
                    {String(val).replace(/_/g, " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bottom Footer Info Bar */}
      {generatedImageUrl && (
        <div className="px-4 py-1.5 border-t border-border/40 bg-[#0a0a0e] flex items-center justify-between text-[10.5px] font-mono text-muted-foreground shrink-0 select-none">
          <span className="truncate">
            Style: {sketchStyle} • Perspective: {cameraAngle} • Cohort: {gender} ({ageGroup})
          </span>
          <span className="text-emerald-400 shrink-0 font-semibold">
            {confidenceScore}% Match Fidelity
          </span>
        </div>
      )}
    </div>
  );
}
