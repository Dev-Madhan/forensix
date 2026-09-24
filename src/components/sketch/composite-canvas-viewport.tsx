"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { gsap } from "gsap";
import { useSketch } from "./sketch-context";
import { CompositeFloatingDock } from "./composite-floating-dock";
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

export function CompositeCanvasViewport() {
  const {
    zoom,
    pan,
    setPan,
    activeTool,
    setActiveTool,
    selectedFeatures,
    selectedCount,
    isGenerating,
    isFullscreen,
  } = useSketch();

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const isMouseInsideRef = useRef(false);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  const dragStartRef = useRef<{ x: number; y: number; panX: number; panY: number }>({
    x: 0,
    y: 0,
    panX: 0,
    panY: 0,
  });

  const handleMouseEnter = useCallback(() => {
    isMouseInsideRef.current = true;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (activeTool !== "pan") {
      setActiveTool("pan");
    }
  }, [activeTool, setActiveTool]);

  const handleMouseLeave = useCallback(() => {
    isMouseInsideRef.current = false;
    if (isDragging) return;
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setActiveTool("select");
    }, 140);
  }, [isDragging, setActiveTool]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore clicks on buttons, inputs, dock controls, etc.
    if (
      (e.target as HTMLElement).closest(
        "button, [role='button'], a, input, select, textarea, [data-floating-dock]"
      )
    ) {
      return;
    }
    if (activeTool !== "pan" && e.button !== 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      setPan({
        x: dragStartRef.current.panX + dx,
        y: dragStartRef.current.panY + dy,
      });
    },
    [isDragging, setPan]
  );

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Safe ignore
      }
      if (!isMouseInsideRef.current) {
        if (leaveTimeoutRef.current) {
          clearTimeout(leaveTimeoutRef.current);
        }
        leaveTimeoutRef.current = setTimeout(() => {
          setActiveTool("select");
        }, 140);
      }
    }
  };

  // Parametric Cranial State for GSAP Morphing
  const [animatedParams, setAnimatedParams] = useState<CranialAnchorPoints>(() =>
    sanitizeCranialParams(OVAL_ARCHETYPE)
  );
  const currentParamsRef = useRef<CranialAnchorPoints>(
    sanitizeCranialParams(OVAL_ARCHETYPE)
  );

  const faceShapeId = selectedFeatures["face_shape"]?.id;
  const jawlineId = selectedFeatures["jawline"]?.id;
  const chinId = selectedFeatures["chin"]?.id;
  const earId = selectedFeatures["ears"]?.id;
  const neckId = selectedFeatures["neck"]?.id;

  // Trigger GSAP Morph on Feature Selection
  useEffect(() => {
    currentParamsRef.current = sanitizeCranialParams(currentParamsRef.current);
    const targets = computeTargetCranialParams(faceShapeId, jawlineId, chinId, earId, neckId);

    const tween = gsap.to(currentParamsRef.current, {
      ...targets,
      duration: 0.72,
      ease: "power2.out",
      onUpdate: () => {
        setAnimatedParams({ ...currentParamsRef.current });
      },
    });

    return () => {
      tween.kill();
    };
  }, [faceShapeId, jawlineId, chinId, earId, neckId, selectedCount]);

  const safeParams = sanitizeCranialParams(animatedParams);

  // SVG Wireframe Element
  const renderWireframeSvg = (isMirrored = false) => (
    <div
      className={`relative w-full h-full flex items-center justify-center select-none ${
        isMirrored ? "scale-x-[-1]" : ""
      }`}
    >
      <svg
        viewBox="0 0 320 400"
        className="w-full h-full select-none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="forensic-sketch-line" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.96" />
            <stop offset="85%" stopColor="#E2E8F0" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#CBD5E1" stopOpacity="0.75" />
          </linearGradient>
        </defs>

        {/* Left Neck Line */}
        <path
          d={generateLeftNeckPath(safeParams)}
          fill="none"
          stroke="url(#forensic-sketch-line)"
          strokeWidth="1.3"
          strokeLinecap="round"
          className="opacity-80"
        />

        {/* Right Neck Line */}
        <path
          d={generateRightNeckPath(safeParams)}
          fill="none"
          stroke="url(#forensic-sketch-line)"
          strokeWidth="1.3"
          strokeLinecap="round"
          className="opacity-80"
        />

        {/* Clavicle Accents */}
        <path
          d={generateClaviclePaths().left}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.0"
          strokeLinecap="round"
          className="opacity-25"
        />
        <path
          d={generateClaviclePaths().right}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.0"
          strokeLinecap="round"
          className="opacity-25"
        />

        {/* Left Anatomical Ear */}
        <path
          d={generateLeftEarPath(safeParams).outer}
          fill="none"
          stroke="url(#forensic-sketch-line)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
        <path
          d={generateLeftEarPath(safeParams).inner}
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.0"
          strokeLinecap="round"
          className="opacity-50"
        />

        {/* Right Anatomical Ear */}
        <path
          d={generateRightEarPath(safeParams).outer}
          fill="none"
          stroke="url(#forensic-sketch-line)"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-90"
        />
        <path
          d={generateRightEarPath(safeParams).inner}
          fill="none"
          stroke="#94A3B8"
          strokeWidth="1.0"
          strokeLinecap="round"
          className="opacity-50"
        />

        {/* Cranial Morphing Contour */}
        <path
          d={generateCranialPath(safeParams)}
          fill="none"
          stroke="url(#forensic-sketch-line)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-100"
        />
      </svg>

      {/* Portrait Features Layer */}
      <ForensicPortraitFeatures
        selectedFeatures={selectedFeatures}
        cranialParams={safeParams}
      />
    </div>
  );

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className={`relative flex-1 bg-[#08080c] overflow-hidden flex items-center justify-center select-none min-h-0 transition-[box-shadow,background-color] duration-500 ease-out ${
        activeTool === "pan"
          ? isDragging
            ? "cursor-grabbing shadow-[inset_0_0_50px_rgba(102,90,239,0.06)]"
            : "cursor-grab shadow-[inset_0_0_30px_rgba(102,90,239,0.02)]"
          : "cursor-default"
      }`}
    >
      {/* Dot Grid Matrix Background */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-700 ease-out ${
          activeTool === "pan" ? "opacity-100" : "opacity-70"
        }`}
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 255, 255, 0.08) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />

      {/* Subtle vignette edges */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 60%, rgba(8,8,12,0.55) 100%)",
        }}
      />

      {/* Main Canvas Viewport with Responsive Sizing */}
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
              width: isFullscreen ? "min(72vh, 520px)" : "min(54vh, 410px)",
              aspectRatio: "4 / 5",
            }}
          >
            {renderWireframeSvg()}
          </div>
        </div>
      </div>

      {/* Floating Canvas Dock */}
      <CompositeFloatingDock />
    </div>
  );
}
