"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Play, Pause, Download, Volume2, RotateCcw, Maximize2, Shield } from "lucide-react";
import { toast } from "sonner";
import type { EvidenceItem } from "./types";

interface EvidenceMediaModalProps {
  item: EvidenceItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EvidenceMediaModal({
  item,
  open,
  onOpenChange,
}: EvidenceMediaModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-zinc-950/95 backdrop-blur-xl border-2 border-border/80 text-foreground p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b-2 border-border/60 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Shield className="size-5 text-[#665AEF] shrink-0" />
            <div className="min-w-0">
              <DialogTitle className="text-sm sm:text-base font-bold font-heading text-white truncate">
                {item.name}
              </DialogTitle>
              <span className="text-xs text-zinc-400 block font-sans tabular-nums">
                {item.source} • {item.dateAdded} {item.timeAdded}
              </span>
            </div>
          </div>
        </DialogHeader>

        {/* Media Player / Inspector Area */}
        <div className="relative aspect-[16/10] w-full bg-black flex items-center justify-center overflow-hidden">
          {item.previewImage ? (
            <Image
              src={item.previewImage}
              alt={item.name}
              fill
              className="object-contain"
              sizes="800px"
              priority
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-zinc-400">
              <Volume2 className="size-12 text-[#665AEF] animate-pulse" />
              <p className="text-sm font-medium text-white">{item.name}</p>
              <p className="text-xs text-zinc-400">{item.fullDescription}</p>
            </div>
          )}

          {/* CCTV Forensic Overlay */}
          <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded border border-white/20 text-[11px] font-sans font-medium text-white tracking-wider">
            REC • FORENSIC PLAYER [SECURE]
          </div>
          <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-xs px-2.5 py-1 rounded border border-white/20 text-[11px] font-sans font-medium text-[#C084FC] tabular-nums">
            {item.camId || "CAM 01"} | {item.timestamp || "2026-10-04 21:14:32"}
          </div>

          {/* Big Center Play/Pause toggle */}
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? "Pause playback" : "Start playback"}
            className="absolute inset-0 m-auto size-14 rounded-full bg-[#665AEF]/80 hover:bg-[#665AEF] text-white flex items-center justify-center transition-transform hover:scale-105 shadow-xl cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="size-6 fill-white" />
            ) : (
              <Play className="size-6 fill-white ml-0.5" />
            )}
          </button>
        </div>

        {/* Player Controls Bar */}
        <div className="p-4 bg-zinc-900/90 border-t-2 border-border/60 flex items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="size-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
            </button>
            <span className="font-sans tabular-nums font-medium text-zinc-300">
              {isPlaying ? "00:14 / 02:45" : "00:00 / 02:45"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="xs"
              variant="outline"
              onClick={() => toast.success(`Exporting forensic frame...`)}
              className="h-8 gap-1.5 border-2 border-white/20 text-white hover:bg-white/10 cursor-pointer"
            >
              <Maximize2 className="size-3" />
              <span>Snapshot</span>
            </Button>
            <Button
              size="xs"
              onClick={() => toast.success(`Downloading ${item.name}...`)}
              className="h-8 gap-1.5 bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-xs shadow-[#665AEF]/25 cursor-pointer"
            >
              <Download className="size-3" />
              <span>Download</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
