"use client";

import React, { useState, useEffect } from "react";
import { useSketch } from "./sketch-context";
import {
  Sparkles,
  Download,
  Contrast,
  Loader2,
  ScanLine,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const TELEMETRY_PHASES = [
  "Analyzing witness testimony & prompt...",
  "Extracting facial landmarks & cranial geometry...",
  "Calibrating camera angle & perspective shadows...",
  "Synthesizing forensic pencil composite...",
  "Finalizing evidence contrast & paper texture...",
];

export function CompositeOutputPreview() {
  const {
    generatedImageUrl,
    isGenerating,
    generationStatus,
    sketchStyle,
    cameraAngle,
    forensicFilter,
    setForensicFilter,
  } = useSketch();

  const [telemetryIndex, setTelemetryIndex] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isGenerating) {
      setTelemetryIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % TELEMETRY_PHASES.length);
    }, 1100);
    return () => clearInterval(interval);
  }, [isGenerating]);

  const toggleFilter = () => {
    setForensicFilter((prev) => (prev === "normal" ? "darkroom_negative" : "normal"));
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const isSvg = generatedImageUrl.startsWith("data:image/svg");
    const link = document.createElement("a");
    link.href = generatedImageUrl;
    link.download = `forensix_composite_${Date.now()}.${isSvg ? "svg" : "jpg"}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`rounded-xl border-2 border-border/80 bg-[#0d0d12]/95 backdrop-blur-2xl shadow-2xl flex flex-col transition-all duration-500 overflow-hidden ${
        isExpanded
          ? "fixed inset-4 z-50 rounded-xl"
          : "flex-1 min-h-[320px] max-h-[460px]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-border/60 bg-[#0c0c11]/90 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="size-6 rounded-md bg-[#665AEF]/15 border border-[#665AEF]/30 flex items-center justify-center text-[#8579ff]">
            <ScanLine className="size-3.5" />
          </div>
          <span className="font-heading text-xs font-semibold text-foreground tracking-tight select-none">
            Output Preview
          </span>

          {/* Status Badge */}
          {generationStatus === "generating" ? (
            <Badge
              variant="outline"
              className="rounded-full px-2 py-0.2 text-[10.5px] font-medium border border-amber-500/40 bg-amber-950/20 text-amber-400 flex items-center gap-1"
            >
              <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
              Synthesizing...
            </Badge>
          ) : generationStatus === "generated" && generatedImageUrl ? (
            <Badge
              variant="outline"
              className="rounded-full px-2 py-0.2 text-[10.5px] font-medium border border-emerald-500/40 bg-emerald-950/20 text-emerald-400 flex items-center gap-1"
            >
              <span className="size-1.5 rounded-full bg-emerald-400" />
              Generated Output
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="rounded-full px-2 py-0.2 text-[10.5px] font-medium border border-border/70 bg-black/30 text-muted-foreground"
            >
              Awaiting Synthesis
            </Badge>
          )}
        </div>

        {/* Right Tools (Available when sketch is generated) */}
        {generatedImageUrl && (
          <div className="flex items-center gap-1.5">
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

      {/* Preview Viewport Canvas */}
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

        {/* Generating Overlay */}
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center gap-3 z-20 text-center px-4">
            <div className="relative">
              <Loader2 className="size-8 text-[#665AEF] animate-spin" />
              <div className="absolute inset-0 blur-md bg-[#665AEF]/40 rounded-full" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1.5">
                <Sparkles className="size-3 text-[#8579ff] animate-pulse" />
                <span>Generating Forensic Sketch...</span>
              </p>
              <p className="text-[11px] text-[#a594fd] font-mono mt-1">
                {TELEMETRY_PHASES[telemetryIndex]}
              </p>
            </div>
          </div>
        ) : generatedImageUrl ? (
          /* Render Output Sketch — absolute-fill parent gives real height, portrait frame constrains image */
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div
              className={`relative flex items-center justify-center transition-all duration-300 ${
                forensicFilter === "darkroom_negative"
                  ? "invert hue-rotate-180 contrast-125 brightness-95"
                  : ""
              }`}
              style={{
                /* Portrait 4:5 frame — height drives the size so the full sketch is always visible */
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
              Use the workspace above to choose facial features or enter a witness statement, then click{" "}
              <span className="text-[#8579ff] font-medium">Generate Sketch</span> to present the output here.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Footer Info Bar (When sketch is generated) */}
      {generatedImageUrl && (
        <div className="px-4 py-1.5 border-t border-border/40 bg-[#0a0a0e] flex items-center justify-between text-[10.5px] font-mono text-muted-foreground shrink-0 select-none">
          <span className="truncate">Style: {sketchStyle} • Angle: {cameraAngle}</span>
          <span className="text-emerald-400 shrink-0">96.4% Match Fidelity</span>
        </div>
      )}
    </div>
  );
}
