"use client";

import React from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import { cn } from "cn";
import type { EvidenceItem } from "./types";

interface EvidenceThumbnailProps {
  item: EvidenceItem;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function EvidenceThumbnail({
  item,
  className,
  size = "md",
}: EvidenceThumbnailProps) {
  const sizeClasses = {
    sm: "size-8 rounded",
    md: "size-10 sm:size-11 rounded-md",
    lg: "w-full h-full rounded-lg",
  }[size];

  switch (item.thumbnailType) {
    case "cctv":
    case "suspect":
      return (
        <div
          className={cn(
            "relative overflow-hidden bg-black/80 border-2 border-border/80 flex items-center justify-center shrink-0 group shadow-2xs",
            sizeClasses,
            className
          )}
        >
          <Image
            src="/images/cctv-suspect.jpg"
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
          {item.type === "Video" && (
            <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
              <div className="size-4.5 rounded-full bg-black/60 border border-white/40 flex items-center justify-center text-white shadow-xs">
                <Play className="size-2.5 fill-white text-white ml-0.5" />
              </div>
            </div>
          )}
        </div>
      );

    case "fingerprint":
      return (
        <div
          className={cn(
            "relative overflow-hidden bg-zinc-950 border-2 border-border/80 flex items-center justify-center shrink-0 p-1 shadow-2xs",
            sizeClasses,
            className
          )}
        >
          {/* Authentic forensic fingerprint SVG */}
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="w-full h-full text-zinc-300 stroke-current stroke-[1.8] opacity-90"
          >
            <path d="M24 10C16.8 10 12 14.8 12 21v11" strokeLinecap="round" />
            <path d="M24 6c-9.5 0-16 6.5-16 16v10" strokeLinecap="round" />
            <path d="M36 21c0-6.2-4.8-11-12-11" strokeLinecap="round" />
            <path d="M40 22c0-9.5-6.5-16-16-16" strokeLinecap="round" />
            <path d="M24 16c-3.3 0-6 2.7-6 6v12" strokeLinecap="round" />
            <path d="M30 22c0-3.3-2.7-6-6-6" strokeLinecap="round" />
            <path d="M24 22v14" strokeLinecap="round" />
            <path d="M18 36c1.5 2 3.5 3 6 3s4.5-1 6-3" strokeLinecap="round" />
            <path d="M14 38c2.5 3 6 4.5 10 4.5s7.5-1.5 10-4.5" strokeLinecap="round" />
            <circle cx="24" cy="22" r="1.5" fill="currentColor" />
          </svg>
        </div>
      );

    case "document":
      return (
        <div
          className={cn(
            "relative overflow-hidden bg-zinc-900 border-2 border-border/80 flex items-center justify-center shrink-0 p-1 shadow-2xs",
            sizeClasses,
            className
          )}
        >
          {/* Realistic PDF Document SVG */}
          <svg viewBox="0 0 40 48" className="w-full h-full text-zinc-400">
            <rect
              x="6"
              y="4"
              width="28"
              height="40"
              rx="2"
              fill="#F4F4F5"
              stroke="#D4D4D8"
              strokeWidth="1.5"
            />
            {/* Top corner fold */}
            <path d="M26 4 L34 12 L26 12 Z" fill="#E4E4E7" />
            {/* Document Lines */}
            <line x1="10" y1="16" x2="24" y2="16" stroke="#52525B" strokeWidth="2" strokeLinecap="round" />
            <line x1="10" y1="21" x2="30" y2="21" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="25" x2="28" y2="25" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="29" x2="30" y2="29" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="10" y1="33" x2="22" y2="33" stroke="#71717A" strokeWidth="1.5" strokeLinecap="round" />
            {/* Red Evidence / Confidential Stamp */}
            <rect x="16" y="36" width="14" height="5" rx="1" fill="#EF4444" opacity="0.8" />
            <text x="23" y="39.8" fontSize="3" fontWeight="bold" fill="white" textAnchor="middle">
              VERIFIED
            </text>
          </svg>
        </div>
      );

    case "weapon":
      return (
        <div
          className={cn(
            "relative overflow-hidden bg-zinc-950 border-2 border-border/80 flex items-center justify-center shrink-0 p-1 shadow-2xs",
            sizeClasses,
            className
          )}
        >
          {/* Handgun Silhouette with Forensic Metric Scale */}
          <svg viewBox="0 0 52 40" className="w-full h-full">
            {/* Gun silhouette */}
            <path
              d="M10 14h28v7h-5v13h-7l-2-4h-4v-7h-10z"
              fill="#D4D4D8"
              stroke="#71717A"
              strokeWidth="1"
            />
            <circle cx="28" cy="23" r="2.5" fill="none" stroke="#27272A" strokeWidth="1" />
            {/* Yellow forensic measure scale at bottom */}
            <rect x="6" y="34" width="40" height="4" fill="#FACC15" />
            <line x1="10" y1="34" x2="10" y2="37" stroke="#000" strokeWidth="0.8" />
            <line x1="16" y1="34" x2="16" y2="37" stroke="#000" strokeWidth="0.8" />
            <line x1="22" y1="34" x2="22" y2="38" stroke="#000" strokeWidth="1" />
            <line x1="28" y1="34" x2="28" y2="37" stroke="#000" strokeWidth="0.8" />
            <line x1="34" y1="34" x2="34" y2="37" stroke="#000" strokeWidth="0.8" />
            <line x1="40" y1="34" x2="40" y2="38" stroke="#000" strokeWidth="1" />
          </svg>
        </div>
      );

    case "audio":
      return (
        <div
          className={cn(
            "relative overflow-hidden bg-zinc-950 border-2 border-border/80 flex items-center justify-center shrink-0 px-1 shadow-2xs",
            sizeClasses,
            className
          )}
        >
          {/* Audio Waveform visualization */}
          <svg viewBox="0 0 48 36" className="w-full h-full text-cyan-400">
            <line x1="4" y1="18" x2="4" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="12" x2="8" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="12" y1="8" x2="12" y2="28" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="16" y1="14" x2="16" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="20" y1="6" x2="20" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="24" y1="10" x2="24" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="28" y1="4" x2="28" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="32" y1="11" x2="32" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="36" y1="7" x2="36" y2="29" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="40" y1="13" x2="40" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <line x1="44" y1="16" x2="44" y2="20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );

    case "receipt":
      return (
        <div
          className={cn(
            "relative overflow-hidden bg-zinc-950 border-2 border-border/80 flex items-center justify-center shrink-0 p-1 shadow-2xs",
            sizeClasses,
            className
          )}
        >
          {/* Till Receipt SVG */}
          <svg viewBox="0 0 36 48" className="w-full h-full">
            <rect x="5" y="4" width="26" height="40" rx="1" fill="#FAFAFA" stroke="#E4E4E7" strokeWidth="1" />
            {/* Receipt Lines */}
            <line x1="9" y1="9" x2="27" y2="9" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="14" x2="23" y2="14" stroke="#71717A" strokeWidth="1" strokeLinecap="round" />
            <line x1="9" y1="18" x2="27" y2="18" stroke="#71717A" strokeWidth="1" strokeLinecap="round" />
            <line x1="9" y1="22" x2="20" y2="22" stroke="#71717A" strokeWidth="1" strokeLinecap="round" />
            <line x1="9" y1="26" x2="27" y2="26" stroke="#18181B" strokeWidth="1.2" strokeLinecap="round" />
            {/* Barcode */}
            <rect x="9" y="31" width="1.5" height="8" fill="#18181B" />
            <rect x="12" y="31" width="1" height="8" fill="#18181B" />
            <rect x="14" y="31" width="2.5" height="8" fill="#18181B" />
            <rect x="18" y="31" width="1" height="8" fill="#18181B" />
            <rect x="20" y="31" width="2" height="8" fill="#18181B" />
            <rect x="24" y="31" width="1.5" height="8" fill="#18181B" />
          </svg>
        </div>
      );

    case "vehicle":
      return (
        <div
          className={cn(
            "relative overflow-hidden bg-zinc-950 border-2 border-border/80 flex items-center justify-center shrink-0 p-1 shadow-2xs",
            sizeClasses,
            className
          )}
        >
          {/* Car Front Silhouette with headlights */}
          <svg viewBox="0 0 48 38" className="w-full h-full">
            {/* Car body */}
            <path
              d="M10 24 L14 14 L34 14 L38 24 L42 27 L42 32 L39 32 L39 30 L9 30 L9 32 L6 32 L6 27 Z"
              fill="#A1A1AA"
              stroke="#71717A"
              strokeWidth="1"
            />
            {/* Windshield */}
            <polygon points="15,15 33,15 35,23 13,23" fill="#18181B" />
            {/* Headlights */}
            <circle cx="11" cy="26" r="2.5" fill="#FEF08A" />
            <circle cx="37" cy="26" r="2.5" fill="#FEF08A" />
            {/* Grill / Plate */}
            <rect x="19" y="27" width="10" height="3" fill="#27272A" rx="0.5" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}
