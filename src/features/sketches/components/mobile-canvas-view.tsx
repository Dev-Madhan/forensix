"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { gsap } from "gsap";
import {
  Undo2,
  Redo2,
  Trash2,
  RotateCcw,
  Sparkles,
  Send,
  Loader2,
  Lock,
  ArrowLeftRight,
  Hand,
  Minus,
  Plus,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useSketch } from "./sketch-context";
import { ConcentricRings } from "@/components/ui/concentric-rings";
import {
  CranialAnchorPoints,
  OVAL_ARCHETYPE,
  computeTargetCranialParams,
  sanitizeCranialParams,
  generateCranialPath,
  generateLeftNeckPath,
  generateRightNeckPath,
  generateLeftEarPath,
  generateRightEarPath,
  generateClaviclePaths,
} from "./forensic-cranial-morph-engine";
import { ForensicPortraitFeatures } from "./forensic-portrait-features";
import { ModeSwitchDialog } from "./mode-switch-dialog";

export function MobileCanvasView() {
  const {
    zoom,
    setZoom,
    pan,
    setPan,
    activeTool,
    setActiveTool,
    selectedFeatures,
    selectedCount,
    isGenerating,
    canUndo,
    canRedo,
    undo,
    redo,
    clearAllFeatures,
    resetCanvas,
    generationStatus,
    promptText,
    setPromptText,
    generateSketch,
    generationMode,
    isPromptEnabled,
    requestModeChange,
  } = useSketch();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0, y: 0, panX: 0, panY: 0,
  });

  // Pinch-to-zoom state
  const lastPinchDistRef = useRef<number | null>(null);
  const lastPinchCenterRef = useRef<{ x: number; y: number } | null>(null);

  // AI Status
  const [aiStatus, setAiStatus] = React.useState<"checking" | "online" | "offline">("checking");
  React.useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/ai/health", { cache: "no-store" });
        if (isMounted) setAiStatus(res.ok ? "online" : "offline");
      } catch {
        if (isMounted) setAiStatus("offline");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => { isMounted = false; clearInterval(interval); };
  }, []);

  // Single-finger pan
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("button, [role='button'], a, input, select, textarea, [data-floating-dock]")) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({ x: dragStartRef.current.panX + dx, y: dragStartRef.current.panY + dy });
    },
    [isDragging, setPan]
  );

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
    }
  };

  // Pinch-to-zoom touch handling
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastPinchDistRef.current = Math.hypot(dx, dy);
      lastPinchCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2 && lastPinchDistRef.current !== null) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const newDist = Math.hypot(dx, dy);
      const scale = newDist / lastPinchDistRef.current;
      setZoom((z) => Math.min(200, Math.max(50, Math.round(z * scale))));
      lastPinchDistRef.current = newDist;
    }
  }, [setZoom]);

  const handleTouchEnd = useCallback(() => {
    lastPinchDistRef.current = null;
    lastPinchCenterRef.current = null;
  }, []);

  // Cranial morphing
  const [animatedParams, setAnimatedParams] = useState<CranialAnchorPoints>(() =>
    sanitizeCranialParams(OVAL_ARCHETYPE)
  );
  const currentParamsRef = useRef<CranialAnchorPoints>(sanitizeCranialParams(OVAL_ARCHETYPE));

  const faceShapeId = selectedFeatures["face_shape"]?.id;
  const jawlineId = selectedFeatures["jawline"]?.id;
  const chinId = selectedFeatures["chin"]?.id;
  const earId = selectedFeatures["ears"]?.id;
  const neckId = selectedFeatures["neck"]?.id;

  useEffect(() => {
    currentParamsRef.current = sanitizeCranialParams(currentParamsRef.current);
    const targets = computeTargetCranialParams(faceShapeId, jawlineId, chinId, earId, neckId);
    const tween = gsap.to(currentParamsRef.current, {
      ...targets,
      duration: 0.72,
      ease: "power2.out",
      onUpdate: () => setAnimatedParams({ ...currentParamsRef.current }),
    });
    return () => { tween.kill(); };
  }, [faceShapeId, jawlineId, chinId, earId, neckId, selectedCount]);

  const safeParams = sanitizeCranialParams(animatedParams);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isPromptEnabled) {
      e.preventDefault();
      generateSketch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPromptEnabled) {
      requestModeChange("PROMPT_GENERATION");
      return;
    }
    const val = e.target.value;
    setPromptText(val);
    if (generationMode === "IDLE" && val.trim().length > 0) {
      requestModeChange("PROMPT_GENERATION");
    }
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 50));

  return (
    <div className="flex flex-col h-full">
      <ModeSwitchDialog />

      {/* Compact Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b-2 border-border/60 shrink-0 bg-[#0c0c11]/80 backdrop-blur-md">
        {/* Left: Title + Status */}
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="font-heading text-sm font-bold text-foreground tracking-tight select-none truncate">
            Composite
          </h2>
          {generationStatus === "generating" ? (
            <span className="text-[10px] font-mono font-medium text-amber-400 shrink-0">
              Generating...
            </span>
          ) : generationStatus === "generated" ? (
            <span className="text-[10px] font-mono font-medium text-emerald-400 shrink-0">
              Generated
            </span>
          ) : null}
          <div
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-mono border border-border/60 bg-black/40 shrink-0"
          >
            <span
              className={`size-1.5 rounded-full ${
                aiStatus === "online"
                  ? "bg-emerald-400 shadow-xs shadow-emerald-400/50 animate-pulse"
                  : aiStatus === "offline"
                  ? "bg-amber-400/80"
                  : "bg-muted-foreground/50"
              }`}
            />
            <span className="text-muted-foreground">
              {aiStatus === "online" ? "GPU" : aiStatus === "offline" ? "OFF" : "..."}
            </span>
          </div>
        </div>

        {/* Right: Icon-only action buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!canUndo}
            className="size-8 rounded-md border border-border/60 bg-black/30 flex items-center justify-center text-foreground disabled:opacity-30 cursor-pointer active:scale-95 transition-all"
          >
            <Undo2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!canRedo}
            className="size-8 rounded-md border border-border/60 bg-black/30 flex items-center justify-center text-foreground disabled:opacity-30 cursor-pointer active:scale-95 transition-all"
          >
            <Redo2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={clearAllFeatures}
            disabled={selectedCount === 0}
            className="size-8 rounded-md border border-border/60 bg-black/30 flex items-center justify-center text-foreground disabled:opacity-30 cursor-pointer active:scale-95 transition-all"
          >
            <Trash2 className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={resetCanvas}
            className="size-8 rounded-md border border-border/60 bg-black/30 flex items-center justify-center text-foreground cursor-pointer active:scale-95 transition-all"
          >
            <RotateCcw className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Canvas Viewport */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={cn(
          "relative flex-1 bg-[#08080c] overflow-hidden flex items-center justify-center select-none min-h-0 touch-none",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
      >
        {/* Dot Grid Matrix Background */}
        <div
          className="absolute inset-0 pointer-events-none opacity-70"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Vignette — lighter on mobile */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: "radial-gradient(ellipse 95% 95% at 50% 50%, transparent 65%, rgba(8,8,12,0.4) 100%)",
          }}
        />

        {/* Canvas Content */}
        <div
          className="relative flex flex-col items-center justify-center"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`,
            transformOrigin: "center center",
            transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div className="flex flex-col items-center justify-center transition-all duration-500">
            <div
              className="relative transition-[width,height] duration-500 cubic-bezier(0.16, 1, 0.3, 1)"
              style={{
                width: "min(70vw, 340px)",
                aspectRatio: "4 / 5",
              }}
            >
              {/* SVG Wireframe */}
              <div className="relative w-full h-full flex items-center justify-center select-none">
                <svg
                  viewBox="0 0 320 400"
                  className="w-full h-full select-none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="mobile-forensic-line" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
                      <stop offset="85%" stopColor="#E2E8F0" stopOpacity="0.92" />
                      <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.75" />
                    </linearGradient>
                  </defs>
                  <path d={generateLeftNeckPath(safeParams)} fill="none" stroke="url(#mobile-forensic-line)" strokeWidth="1.3" strokeLinecap="round" className="opacity-80" />
                  <path d={generateRightNeckPath(safeParams)} fill="none" stroke="url(#mobile-forensic-line)" strokeWidth="1.3" strokeLinecap="round" className="opacity-80" />
                  <path d={generateClaviclePaths().left} fill="none" stroke="#FFFFFF" strokeWidth="1.0" strokeLinecap="round" className="opacity-25" />
                  <path d={generateClaviclePaths().right} fill="none" stroke="#FFFFFF" strokeWidth="1.0" strokeLinecap="round" className="opacity-25" />
                  <path d={generateLeftEarPath(safeParams).outer} fill="none" stroke="url(#mobile-forensic-line)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="opacity-90" />
                  <path d={generateLeftEarPath(safeParams).inner} fill="none" stroke="#94A3B8" strokeWidth="1.0" strokeLinecap="round" className="opacity-50" />
                  <path d={generateRightEarPath(safeParams).outer} fill="none" stroke="url(#mobile-forensic-line)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className="opacity-90" />
                  <path d={generateRightEarPath(safeParams).inner} fill="none" stroke="#94A3B8" strokeWidth="1.0" strokeLinecap="round" className="opacity-50" />
                  <path d={generateCranialPath(safeParams)} fill="none" stroke="url(#mobile-forensic-line)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="opacity-100" />
                </svg>
                <ForensicPortraitFeatures selectedFeatures={selectedFeatures} cranialParams={safeParams} />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Compact Floating Dock */}
        <div
          data-floating-dock="true"
          className="absolute z-20 bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 p-1 bg-[#111116]/95 backdrop-blur-xl border-2 border-border/80 rounded-lg shadow-2xl select-none"
        >
          <button
            type="button"
            onClick={() => setActiveTool((prev) => (prev === "pan" ? "select" : "pan"))}
            className={cn(
              "size-9 rounded-md flex items-center justify-center cursor-pointer transition-all",
              activeTool === "pan"
                ? "bg-[#665AEF]/25 text-[#a594fd] border border-[#665AEF]/50"
                : "text-muted-foreground border border-transparent"
            )}
          >
            <Hand className="size-4" />
          </button>
          <div className="w-px h-5 bg-border/70" />
          <button type="button" onClick={zoomOut} disabled={zoom <= 50} className="size-9 rounded-md flex items-center justify-center text-muted-foreground disabled:opacity-30 cursor-pointer">
            <Minus className="size-4" />
          </button>
          <span className="text-[11px] font-mono font-medium text-foreground px-1 min-w-8 text-center select-none">
            {zoom}%
          </span>
          <button type="button" onClick={zoomIn} disabled={zoom >= 200} className="size-9 rounded-md flex items-center justify-center text-muted-foreground disabled:opacity-30 cursor-pointer">
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      {/* Prompt Input — sticky at bottom */}
      <div className="shrink-0 p-2 bg-[#0a0a0e] border-t-2 border-border/60">
        {/* Mode indicator */}
        <div className="flex items-center justify-between px-1 mb-1.5 text-[10px]">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground/70 font-medium">Mode:</span>
            {generationMode === "PROMPT_GENERATION" ? (
              <span className="text-[#a594fd] font-semibold tracking-wide">PROMPT</span>
            ) : generationMode === "DATASET_COMPOSITE" ? (
              <span className="text-amber-400 font-semibold tracking-wide">DATASET</span>
            ) : (
              <span className="text-muted-foreground font-semibold tracking-wide">IDLE</span>
            )}
          </div>
          {generationMode === "DATASET_COMPOSITE" && (
            <button
              type="button"
              onClick={() => requestModeChange("PROMPT_GENERATION")}
              className="flex items-center gap-1 text-[10px] text-amber-400 font-medium cursor-pointer"
            >
              <ArrowLeftRight className="size-2.5" />
              <span>Switch Mode</span>
            </button>
          )}
        </div>

        {/* Input Row */}
        <div
          className={cn(
            "rounded-xl border-2 p-2 flex items-center gap-2 shadow-lg transition-all",
            !isPromptEnabled
              ? "border-border/50 bg-[#0d0d12]/60 opacity-70 cursor-pointer"
              : "border-border/80 bg-[#0d0d12]/95 backdrop-blur-2xl focus-within:border-[#665AEF]/70"
          )}
          onClick={() => {
            if (!isPromptEnabled) requestModeChange("PROMPT_GENERATION");
          }}
        >
          <div
            className={cn(
              "size-9 rounded-lg border-2 flex items-center justify-center shrink-0 shadow-inner",
              !isPromptEnabled
                ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                : "border-border/70 bg-black/40 text-[#a594fd]"
            )}
          >
            {!isPromptEnabled ? <Lock className="size-4" /> : <Sparkles className="size-4" />}
          </div>

          <input
            type="text"
            value={promptText}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            readOnly={!isPromptEnabled}
            placeholder={
              !isPromptEnabled
                ? "Dataset mode. Tap to switch..."
                : "Describe the suspect..."
            }
            className={cn(
              "h-9 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 focus-visible:outline-none shadow-none px-1 flex-1 min-w-0",
              !isPromptEnabled ? "cursor-pointer text-muted-foreground" : "text-foreground"
            )}
          />

          <motion.button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (isPromptEnabled) generateSketch();
              else requestModeChange("PROMPT_GENERATION");
            }}
            disabled={isGenerating}
            whileTap={isGenerating ? undefined : { scale: 0.9 }}
            transition={{ type: "spring", stiffness: 450, damping: 20 }}
            className="size-9 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#665AEF]/35 border-2 border-[#8579ff]/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
