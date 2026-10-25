"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ShieldCheck,
  Film,
  Play,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  FileText,
  Volume2,
  FileImage,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { EvidenceThumbnail } from "./evidence-thumbnail";
import type { EvidenceItem } from "./types";

interface EvidencePreviewCardProps {
  item: EvidenceItem;
  onPrevMedia?: () => void;
  onNextMedia?: () => void;
  mediaIndex?: number;
  totalMedia?: number;
  onPlayMedia?: (item: EvidenceItem) => void;
}

export function EvidencePreviewCard({
  item,
  onPrevMedia,
  onNextMedia,
  mediaIndex = 1,
  totalMedia = 4,
  onPlayMedia,
}: EvidencePreviewCardProps) {
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(item.hash);
    setCopiedHash(true);
    toast.success(`Integrity hash copied to clipboard: ${item.hash}`);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const getPrimaryButtonLabel = () => {
    switch (item.type) {
      case "Video":
        return { label: "Play Video", icon: Play };
      case "Audio":
        return { label: "Play Audio", icon: Volume2 };
      case "Document":
        return { label: "View Document", icon: FileText };
      default:
        return { label: "Inspect Image", icon: FileImage };
    }
  };

  const primaryBtn = getPrimaryButtonLabel();
  const PrimaryIcon = primaryBtn.icon;

  const renderStatusDot = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Verified
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400">
            <span className="size-1.5 rounded-full bg-amber-400" />
            Under Review
          </span>
        );
      case "Flagged":
        return (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-400">
            <span className="size-1.5 rounded-full bg-rose-400" />
            Flagged
          </span>
        );
      default:
        return <span className="text-xs text-muted-foreground">{status}</span>;
    }
  };

  return (
    <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden py-0 [--card-spacing:--spacing(3.5)]">
      {/* Header with purple ShieldCheck icon */}
      <CardHeader className="flex flex-row items-center justify-between py-2.5 px-3.5 sm:px-4 border-b-2 border-border/50">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4.5 text-[#665AEF] shrink-0" />
          <CardTitle className="text-xs sm:text-sm font-bold font-heading text-foreground">
            Evidence Preview
          </CardTitle>
        </div>
      </CardHeader>

      <div className="relative grid grid-cols-1 grid-rows-1">
        <AnimatePresence initial={false}>
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="col-start-1 row-start-1 w-full"
          >
            <CardContent className="p-3.5 sm:p-4 space-y-2.5">
        {/* Media Frame Viewport */}
        <div className="relative aspect-[16/9] max-h-[160px] w-full rounded-lg overflow-hidden border-2 border-border/80 bg-black/90 group shadow-inner">
          {item.previewImage ? (
            <Image
              src={item.previewImage}
              alt={item.name}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 1280px) 100vw, 450px"
              priority
            />
          ) : (
            <div className="size-full flex items-center justify-center p-4 bg-gradient-to-b from-card/80 to-card/40">
              <div className="w-20 h-20 flex items-center justify-center">
                <EvidenceThumbnail item={item} size="lg" />
              </div>
            </div>
          )}

          {/* Forensic HUD Overlay: Camera ID & Timestamp (top right) */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded border-2 border-white/20 text-[10px] font-sans font-medium text-white shadow-sm tabular-nums">
            <span className="font-bold tracking-wider text-[#C084FC]">
              {item.camId || (item.source === "CCTV" ? "CAM 01" : item.source.toUpperCase())}
            </span>
            <span className="text-zinc-400">|</span>
            <span className="text-zinc-200">
              {item.timestamp || `${item.dateAdded} ${item.timeAdded}`}
            </span>
          </div>

          {/* Prev / Next navigation overlay buttons */}
          {onPrevMedia && (
            <button
              type="button"
              onClick={onPrevMedia}
              aria-label="Previous preview frame"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <ChevronLeft className="size-4" />
            </button>
          )}

          {onNextMedia && (
            <button
              type="button"
              onClick={onNextMedia}
              aria-label="Next preview frame"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-xs border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
            >
              <ChevronRight className="size-4" />
            </button>
          )}

          {/* Bottom Right Counter Badge (1/4) */}
          <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs border-2 border-white/20 text-[11px] font-sans font-semibold text-white shadow-sm tabular-nums tracking-wide">
            {mediaIndex}/{totalMedia}
          </div>

          {/* Center Play Button on hover for videos */}
          {item.type === "Video" && (
            <button
              type="button"
              onClick={() => onPlayMedia?.(item)}
              aria-label="Play video"
              className="absolute inset-0 flex items-center justify-center bg-black/25 opacity-80 hover:opacity-100 transition-opacity cursor-pointer group/play"
            >
              <div className="size-11 rounded-full bg-[#665AEF]/90 group-hover/play:scale-110 group-hover/play:bg-[#665AEF] text-white flex items-center justify-center shadow-lg transition-transform">
                <Play className="size-5 fill-white ml-0.5" />
              </div>
            </button>
          )}
        </div>

        {/* File Name & Summary Line */}
        <div className="space-y-0.5 pt-0.5">
          <div className="flex items-center gap-1.5">
            <Film className="size-3.5 text-[#665AEF] shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold font-heading text-foreground truncate">
              {item.name}
            </h3>
          </div>
          <p className="text-[11px] text-muted-foreground leading-snug truncate">
            {item.fullDescription}
          </p>
        </div>

        {/* Metadata Properties List (matching screenshot 100%) */}
        <div className="space-y-1.5 pt-2 border-t-2 border-border/40 text-[11px] sm:text-xs">
          {/* Type */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium text-foreground">{item.type}</span>
          </div>

          {/* Source */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Source</span>
            <span className="font-medium text-foreground">{item.source}</span>
          </div>

          {/* Date Added */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Date Added</span>
            <span className="font-medium text-foreground">
              {item.dateAdded}, {item.timeAdded}
            </span>
          </div>

          {/* Added By */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Added By</span>
            <span className="font-medium text-foreground">{item.addedBy.name}</span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Status</span>
            <div>{renderStatusDot(item.status)}</div>
          </div>

          {/* File Size */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">File Size</span>
            <span className="font-medium text-foreground">{item.fileSize}</span>
          </div>

          {/* Hash (SHA256) */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Hash (SHA256)</span>
            <button
              type="button"
              onClick={handleCopyHash}
              title="Click to copy full SHA-256 hash"
              className="font-sans tabular-nums font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-[11px] cursor-pointer transition-colors"
            >
              <span>{item.hash}</span>
              <Copy className="size-3" />
            </button>
          </div>

          {/* Location */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground">Location</span>
            <span className="font-sans text-muted-foreground text-[11px] truncate max-w-[190px]">
              {item.location}
            </span>
          </div>

          {/* Description */}
          <div className="flex items-start justify-between gap-2 pt-1 border-t-2 border-border/20">
            <span className="text-muted-foreground shrink-0">Description</span>
            <span className="text-foreground/90 text-right leading-relaxed max-w-[210px] truncate text-[11px]">
              {item.fullDescription}
            </span>
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex items-center gap-2 pt-1 flex-wrap sm:flex-nowrap mt-auto">
          {/* Primary Action Button */}
          <Button
            type="button"
            size="sm"
            onClick={() => {
              if (onPlayMedia) {
                onPlayMedia(item);
              } else {
                toast.info(`Opening viewer for ${item.name}`);
              }
            }}
            className="flex-1 h-8 px-2.5 gap-1.5 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold cursor-pointer shadow-xs shadow-[#665AEF]/25 transition-colors whitespace-nowrap"
          >
            <PrimaryIcon className="size-3 fill-current" />
            <span>{primaryBtn.label}</span>
          </Button>

          {/* Download Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              toast.success(`Downloading ${item.name} (${item.fileSize})...`)
            }
            className="h-8 px-2.5 gap-1.5 rounded-lg border-2 border-border/80 bg-card/60 text-xs font-medium hover:bg-muted/60 text-foreground cursor-pointer shadow-2xs transition-colors"
          >
            <Download className="size-3 text-muted-foreground" />
            <span>Download</span>
          </Button>

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex items-center justify-between gap-1 h-8 px-2 rounded-lg border-2 border-border/80 bg-card/60 text-xs font-medium text-foreground hover:bg-muted/60 cursor-pointer shadow-2xs transition-colors shrink-0"
            >
              <span>More Actions</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 text-xs bg-card/95 backdrop-blur-md border-2 border-border/80">
              <DropdownMenuItem onClick={handleCopyHash}>
                <Copy className="size-3.5 mr-2 text-muted-foreground" />
                <span>Copy SHA-256 Hash</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info(`Viewing chain of custody record for ${item.name}`)}
              >
                <ShieldCheck className="size-3.5 mr-2 text-muted-foreground" />
                <span>Chain of Custody</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => toast.info(`Exporting forensic report with ${item.name}`)}
              >
                <ExternalLink className="size-3.5 mr-2 text-muted-foreground" />
                <span>Export Metadata</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-amber-400"
                onClick={() => toast.warning(`Flagged ${item.name} for re-examination`)}
              >
                <span>Re-examine Evidence</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
          </CardContent>
        </motion.div>
      </AnimatePresence>
    </div>
  </Card>
);
}
