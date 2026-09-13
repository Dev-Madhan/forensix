"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ConcentricRingsProps {
  className?: string;
  /** Size in pixels of the outermost ring container */
  size?: number;
  /** Primary color — defaults to the project accent purple */
  color?: string;
}

/**
 * ConcentricRings — three concentric orbiting rings loader.
 * Inspired by @shadcnloaders/concentric-rings (registry offline; implemented natively).
 * Pure CSS — zero runtime dependencies.
 */
export function ConcentricRings({
  className,
  size = 64,
  color = "#665AEF",
}: ConcentricRingsProps) {
  const rings = [
    { scale: 1,    opacity: 0.90, duration: "1.1s", delay: "0s"    },
    { scale: 0.68, opacity: 0.60, duration: "1.6s", delay: "0.18s" },
    { scale: 0.38, opacity: 0.35, duration: "2.2s", delay: "0.32s" },
  ];

  return (
    <div
      className={cn("relative flex items-center justify-center shrink-0", className)}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      {rings.map((ring, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            width:  `${size * ring.scale}px`,
            height: `${size * ring.scale}px`,
            borderRadius: "50%",
            border: `1.5px solid ${color}`,
            opacity: ring.opacity,
            animation: `concentric-spin ${ring.duration} linear infinite`,
            animationDelay: ring.delay,
            borderTopColor: "transparent",
            borderLeftColor: i % 2 === 0 ? "transparent" : color,
          }}
        />
      ))}

      {/* Pulse dot at center */}
      <span
        style={{
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: color,
          opacity: 0.8,
          animation: "concentric-pulse 1.6s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes concentric-spin {
          to { transform: rotate(360deg); }
        }
        @keyframes concentric-pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
