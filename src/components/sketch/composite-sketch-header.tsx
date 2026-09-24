"use client";

import React from "react";
import { Undo2, Redo2, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSketch } from "./sketch-context";

export function CompositeSketchHeader() {
  const {
    selectedCount,
    canUndo,
    canRedo,
    undo,
    redo,
    clearAllFeatures,
    resetCanvas,
    generationStatus,
  } = useSketch();

  const [aiStatus, setAiStatus] = React.useState<"checking" | "online" | "offline">("checking");

  React.useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/ai/health", { cache: "no-store" });
        if (isMounted) {
          setAiStatus(res.ok ? "online" : "offline");
        }
      } catch {
        if (isMounted) setAiStatus("offline");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getStatusDisplay = () => {
    switch (generationStatus) {
      case "generating":
        return (
          <span className="text-[11px] font-mono font-medium text-amber-400">
            Generating...
          </span>
        );
      case "generated":
        return (
          <span className="text-[11px] font-mono font-medium text-emerald-400">
            Generated
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono font-medium text-muted-foreground/60">
            Not generated
          </span>
        );
    }
  };

  return (
    <div className="flex items-center justify-between px-3 py-2.5 md:px-5 md:py-3.5 border-b-2 border-border/60 shrink-0 bg-[#0c0c11]/80 backdrop-blur-md">
      {/* Left: Title + Status Pill + GPU Worker Badge */}
      <div className="flex items-center gap-3">
        <h2 className="font-heading text-base font-bold text-foreground tracking-tight select-none">
          Composite Sketch
        </h2>
        {getStatusDisplay()}
        <div
          title={
            aiStatus === "online"
              ? "Local AI GPU Service Connected"
              : aiStatus === "offline"
              ? "GPU Offline — Procedural Fallback"
              : "Checking AI Service..."
          }
          className="cursor-default select-none flex items-center"
        >
          <span
            className={`size-2.5 rounded-full border-2 border-[#0c0c11] transition-colors duration-500 ${
              aiStatus === "online"
                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                : aiStatus === "offline"
                ? "bg-amber-400/70"
                : "bg-muted-foreground/40 animate-pulse"
            }`}
          />
        </div>
      </div>

      {/* Right: Action Buttons (Undo, Redo, Clear, Reset) */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 px-2.5 text-xs font-medium border-2 border-border/70 bg-black/30 hover:bg-white/5 rounded-md flex items-center gap-1.5 text-foreground disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
        >
          <Undo2 className="size-3.5" />
          <span className="hidden sm:inline">Undo</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 px-2.5 text-xs font-medium border-2 border-border/70 bg-black/30 hover:bg-white/5 rounded-md flex items-center gap-1.5 text-foreground disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
        >
          <Redo2 className="size-3.5" />
          <span className="hidden sm:inline">Redo</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearAllFeatures}
          disabled={selectedCount === 0}
          className="h-8 px-2.5 text-xs font-medium border-2 border-border/70 bg-black/30 hover:bg-white/5 rounded-md flex items-center gap-1.5 text-foreground disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
        >
          <Trash2 className="size-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetCanvas}
          className="h-8 px-2.5 text-xs font-medium border-2 border-border/70 bg-black/30 hover:bg-white/5 rounded-md flex items-center gap-1.5 text-foreground cursor-pointer transition-all shadow-sm"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
    </div>
  );
}
