"use client";

import React, { useEffect } from "react";
import { CompositeSketchHeader } from "./composite-sketch-header";
import { CompositeCanvasViewport } from "./composite-canvas-viewport";
import { CompositePromptInput } from "./composite-prompt-input";
import { CompositeOutputPreview } from "./composite-output-preview";
import { useSketch } from "./sketch-context";

export function CompositeSketchWorkspace() {
  const { isFullscreen, setIsFullscreen } = useSketch();

  // Escape key listener to exit fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
        try {
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          }
        } catch {
          // Safe ignore
        }
      }
    };

    const handleFsChange = () => {
      if (!document.fullscreenElement && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", handleFsChange);
    };
  }, [isFullscreen, setIsFullscreen]);

  return (
    <div className="flex-1 h-full flex flex-col gap-3 min-w-0 overflow-y-auto pr-1">
      {/* 1. Upper Workspace: Drafting Canvas & Cranial Morphing Engine */}
      <div
        className={`flex flex-col overflow-hidden shadow-2xl transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          isFullscreen
            ? "fixed inset-0 z-50 rounded-none border-0 bg-[#0d0d12]"
            : "min-h-87.5 flex-1 rounded-xl border-2 border-border/80 bg-[#0d0d12]/90 backdrop-blur-2xl relative"
        }`}
      >
        <CompositeSketchHeader />
        <CompositeCanvasViewport />
      </div>

      {/* 2. Middle: Prompt Input Bar */}
      <CompositePromptInput />

      {/* 3. Lower: Output Preview Space for Presenting Synthesized Sketch */}
      <CompositeOutputPreview />
    </div>
  );
}
