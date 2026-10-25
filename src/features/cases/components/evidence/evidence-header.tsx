"use client";

import React from "react";
import { Folder, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EvidenceHeaderProps {
  totalCount: number;
  onAddClick: () => void;
}

export function EvidenceHeader({
  totalCount,
  onAddClick,
}: EvidenceHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-xl border-2 border-border/80 bg-card/40 backdrop-blur-xs shadow-xs">
      <div className="flex items-center gap-3">
        <Folder className="size-6 text-[#665AEF] shrink-0" />
        <div>
          <h2 className="text-lg sm:text-xl font-bold font-heading text-foreground tracking-tight">
            Evidence
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {totalCount} pieces of evidence linked to this case.
          </p>
        </div>
      </div>

      <div className="flex items-center">
        <Button
          type="button"
          size="sm"
          onClick={onAddClick}
          className="h-9 px-4 gap-1.5 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs sm:text-sm font-medium cursor-pointer shadow-xs shadow-[#665AEF]/25 transition-colors"
        >
          <Plus className="size-4" />
          <span>Add Evidence</span>
        </Button>
      </div>
    </div>
  );
}
