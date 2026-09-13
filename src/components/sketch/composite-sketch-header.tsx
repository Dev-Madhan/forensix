"use client";

import React from "react";
import { Undo2, Redo2, Trash2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

  const getStatusDisplay = () => {
    switch (generationStatus) {
      case "generating":
        return (
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium border-2 border-border/80 bg-[#16161f] text-amber-400 flex items-center gap-1.5 shadow-sm"
          >
            <span className="size-1.5 rounded-full bg-amber-400 animate-ping" />
            Generating...
          </Badge>
        );
      case "generated":
        return (
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium border-2 border-emerald-500/40 bg-emerald-950/20 text-emerald-400 flex items-center gap-1.5 shadow-sm"
          >
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Generated
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="rounded-full px-2.5 py-0.5 text-[11px] font-medium border-2 border-border/70 bg-[#13131a] text-muted-foreground flex items-center gap-1.5 shadow-sm"
          >
            <span className="size-1.5 rounded-full bg-zinc-400" />
            Not generated
          </Badge>
        );
    }
  };

  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-border/60 shrink-0 bg-[#0c0c11]/80 backdrop-blur-md">
      {/* Left: Title + Status Pill */}
      <div className="flex items-center gap-3">
        <h2 className="font-heading text-base font-bold text-foreground tracking-tight select-none">
          Composite Sketch
        </h2>
        {getStatusDisplay()}
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
          <span>Undo</span>
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
          <span>Redo</span>
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
          <span>Clear</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetCanvas}
          className="h-8 px-2.5 text-xs font-medium border-2 border-border/70 bg-black/30 hover:bg-white/5 rounded-md flex items-center gap-1.5 text-foreground cursor-pointer transition-all shadow-sm"
        >
          <RotateCcw className="size-3.5" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  );
}
