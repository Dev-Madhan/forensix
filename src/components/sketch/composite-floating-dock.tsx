"use client";

import React from "react";
import {
  Hand,
  Minus,
  Plus,
  Maximize2,
  Minimize2,
  Contrast,
  Download,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSketch } from "./sketch-context";

export function CompositeFloatingDock() {
  const {
    zoom,
    zoomIn,
    zoomOut,
    activeTool,
    setActiveTool,
    isFullscreen,
    setIsFullscreen,
    generatedImageUrl,
    comparisonMode,
    setComparisonMode,
    forensicFilter,
    setForensicFilter,
  } = useSketch();

  const togglePan = () => {
    setActiveTool((prev) => (prev === "pan" ? "select" : "pan"));
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => {
      const next = !prev;
      try {
        if (next) {
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen?.().catch(() => {});
          }
        } else {
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          }
        }
      } catch {
        // Safe ignore
      }
      return next;
    });
  };

  const toggleComparison = () => {
    setComparisonMode(!comparisonMode);
  };

  const toggleFilter = () => {
    setForensicFilter((prev) => (prev === "normal" ? "darkroom_negative" : "normal"));
  };

  const handleDownload = () => {
    if (!generatedImageUrl) return;
    const link = document.createElement("a");
    link.href = generatedImageUrl;
    link.download = `forensix_composite_sketch_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TooltipProvider delay={200}>
      <div
        data-floating-dock="true"
        className={`absolute z-20 flex items-center gap-1 p-1 bg-[#111116]/95 backdrop-blur-xl border-2 border-border/80 rounded-md shadow-2xl select-none transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
          isFullscreen ? "bottom-6 right-6" : "bottom-4 right-4 md:bottom-4 md:right-4"
        }`}
      >
        {/* Pan Tool Toggle */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={togglePan}
                className={`size-7 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 ease-out ${
                  activeTool === "pan"
                    ? "bg-[#665AEF]/25 text-[#a594fd] border border-[#665AEF]/50 shadow-[0_0_12px_rgba(102,90,239,0.35)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent"
                }`}
                aria-label="Pan tool"
              />
            }
          >
            <Hand
              className={`size-3.5 transition-transform duration-300 ease-out ${
                activeTool === "pan" ? "scale-110" : "scale-100"
              }`}
            />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            {activeTool === "pan" ? "Pan Mode (Active)" : "Pan Mode"}
          </TooltipContent>
        </Tooltip>

        {/* Vertical Divider */}
        <Separator orientation="vertical" className="h-4 mx-0.5 bg-border/70" />

        {/* Zoom Out Button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={zoomOut}
                disabled={zoom <= 50}
                className="size-7 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Zoom out"
              />
            }
          >
            <Minus className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            Zoom Out
          </TooltipContent>
        </Tooltip>

        {/* Zoom Level Indicator */}
        <span className="text-xs font-mono font-medium text-foreground px-1.5 select-none min-w-10 text-center">
          {zoom}%
        </span>

        {/* Zoom In Button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={zoomIn}
                disabled={zoom >= 200}
                className="size-7 rounded-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                aria-label="Zoom in"
              />
            }
          >
            <Plus className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            Zoom In
          </TooltipContent>
        </Tooltip>

        {/* Extended Tools for Generated Output */}
        {generatedImageUrl && (
          <>


            {/* Forensic Darkroom UV Filter Toggle */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={toggleFilter}
                    className={`size-7 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 ease-out ${
                      forensicFilter === "darkroom_negative"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                        : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                    aria-label="Forensic Darkroom UV Mode"
                  />
                }
              >
                <Contrast className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px]">
                {forensicFilter === "darkroom_negative" ? "Standard View" : "Forensic UV Negative Mode"}
              </TooltipContent>
            </Tooltip>

            {/* Download Evidence Image */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="size-7 rounded-sm flex items-center justify-center border border-transparent text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer transition-colors"
                    aria-label="Download Evidence Composite"
                  />
                }
              >
                <Download className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-[11px]">
                Download Evidence Composite
              </TooltipContent>
            </Tooltip>
          </>
        )}

        {/* Fullscreen / Fit Button */}
        <Separator orientation="vertical" className="h-4 mx-0.5 bg-border/70" />
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={toggleFullscreen}
                className={`size-7 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-300 ease-out ${
                  isFullscreen
                    ? "bg-[#665AEF]/25 text-[#a594fd] border border-[#665AEF]/50 shadow-[0_0_12px_rgba(102,90,239,0.35)]"
                    : "border border-transparent text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
                aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              />
            }
          >
            {isFullscreen ? (
              <Minimize2 className="size-3.5" />
            ) : (
              <Maximize2 className="size-3.5" />
            )}
          </TooltipTrigger>
          <TooltipContent side="top" className="text-[11px]">
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
