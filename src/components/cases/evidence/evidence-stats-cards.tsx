"use client";

import React from "react";
import { FileText, CheckCircle2, Clock, Flag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "cn";
import type { EvidenceStatus } from "./types";

interface EvidenceStatsCardsProps {
  total: number;
  verified: number;
  underReview: number;
  flagged: number;
  activeStatusFilter: "ALL" | EvidenceStatus;
  onSelectStatusFilter: (status: "ALL" | EvidenceStatus) => void;
}

export function EvidenceStatsCards({
  total,
  verified,
  underReview,
  flagged,
  activeStatusFilter,
  onSelectStatusFilter,
}: EvidenceStatsCardsProps) {
  const cards = [
    {
      id: "ALL" as const,
      label: "Total Evidence",
      count: total,
      icon: FileText,
      iconColor: "text-[#a594fd]",
    },
    {
      id: "Verified" as const,
      label: "Verified",
      count: verified,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
    },
    {
      id: "Under Review" as const,
      label: "Under Review",
      count: underReview,
      icon: Clock,
      iconColor: "text-amber-400",
    },
    {
      id: "Flagged" as const,
      label: "Flagged",
      count: flagged,
      icon: Flag,
      iconColor: "text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeStatusFilter === card.id;

        return (
          <Card
            key={card.id}
            onClick={() => onSelectStatusFilter(card.id)}
            className={cn(
              "group border-2 border-border/80 bg-card/40 backdrop-blur-xs hover:bg-card/70 hover:border-border transition-all p-3.5 sm:p-4 rounded-xl cursor-pointer shadow-xs flex flex-col justify-between select-none",
              isActive && "ring-2 ring-[#665AEF]/60 bg-card/80 border-2 border-[#665AEF]/70"
            )}
          >
            {/* Top row: Label on left, Standalone Icon on right */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                {card.label}
              </span>
              <Icon className={cn("size-4.5 sm:size-5 shrink-0 transition-transform group-hover:scale-110", card.iconColor)} />
            </div>

            {/* Bottom row: Hero metric count */}
            <div className="mt-2.5">
              <span className="text-2xl sm:text-3xl font-bold font-heading text-foreground tabular-nums block leading-tight">
                {card.count}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
