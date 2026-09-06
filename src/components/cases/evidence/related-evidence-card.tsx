"use client";

import React from "react";
import { Layers, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "cn";
import { EvidenceThumbnail } from "./evidence-thumbnail";
import type { EvidenceItem } from "./types";

interface RelatedEvidenceCardProps {
  items: EvidenceItem[];
  currentSelectedId: string;
  onSelectEvidence: (item: EvidenceItem) => void;
  onViewAllRelated?: () => void;
}

export function RelatedEvidenceCard({
  items,
  currentSelectedId,
  onSelectEvidence,
  onViewAllRelated,
}: RelatedEvidenceCardProps) {
  // Show 4 related evidence items
  const displayItems = items.slice(0, 4);

  return (
    <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden py-0 [--card-spacing:--spacing(3.5)]">
      {/* Header with purple Layers icon & View All link */}
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3.5 sm:px-4 border-b-2 border-border/50">
        <div className="flex items-center gap-2">
          <Layers className="size-4.5 text-[#665AEF] shrink-0" />
          <CardTitle className="text-xs sm:text-sm font-bold font-heading text-foreground">
            Related Evidence
          </CardTitle>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onViewAllRelated) {
              onViewAllRelated();
            } else {
              toast.info("Viewing all connected evidence items");
            }
          }}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#665AEF] hover:text-[#5749DF] hover:underline transition-colors cursor-pointer"
        >
          <span>View All ({displayItems.length})</span>
          <ArrowRight className="size-3" />
        </button>
      </CardHeader>

      <CardContent className="p-3 sm:p-3.5">
        {/* 4 Cards Grid */}
        <div className="grid grid-cols-4 gap-2">
          {displayItems.map((item) => {
            const isSelected = item.id === currentSelectedId;

            return (
              <div
                key={item.id}
                onClick={() => onSelectEvidence(item)}
                className={cn(
                  "group flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 border-border/80 bg-card/60 hover:bg-card hover:border-[#665AEF]/50 transition-all cursor-pointer shadow-2xs text-center select-none",
                  isSelected && "ring-2 ring-[#665AEF] border-transparent bg-card"
                )}
              >
                {/* Thumbnail */}
                <div className="relative aspect-square w-full rounded overflow-hidden flex items-center justify-center bg-black/40">
                  <EvidenceThumbnail item={item} size="lg" />
                </div>
                {/* File name truncate */}
                <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate w-full px-0.5">
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
