"use client";

import React from "react";
import { Users, Target, UserCheck, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SuspectStatus } from "./types";

interface SuspectsStatsCardsProps {
  total: number;
  primaryCount: number;
  personOfInterestCount: number;
  clearedCount: number;
  activeStatusFilter: "ALL" | SuspectStatus;
  onSelectStatusFilter: (status: "ALL" | SuspectStatus) => void;
}

export function SuspectsStatsCards({
  total,
  primaryCount,
  personOfInterestCount,
  clearedCount,
  activeStatusFilter,
  onSelectStatusFilter,
}: SuspectsStatsCardsProps) {
  const cards = [
    {
      id: "ALL" as const,
      label: "Total Suspects",
      count: total,
      icon: Users,
      iconColor: "text-[#a594fd]",
    },
    {
      id: "Primary Suspect" as const,
      label: "Primary Suspect",
      count: primaryCount,
      icon: Target,
      iconColor: "text-rose-400",
    },
    {
      id: "Person of Interest" as const,
      label: "Person of Interest",
      count: personOfInterestCount,
      icon: UserCheck,
      iconColor: "text-amber-400",
    },
    {
      id: "Cleared" as const,
      label: "Cleared",
      count: clearedCount,
      icon: CheckCircle2,
      iconColor: "text-emerald-400",
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
              <Icon
                className={cn(
                  "size-4.5 sm:size-5 shrink-0 transition-transform group-hover:scale-110",
                  card.iconColor
                )}
              />
            </div>

            {/* Bottom row: Hero metric count */}
            <div className="mt-3 sm:mt-4">
              <span className="text-2xl sm:text-3xl font-bold font-heading text-foreground tracking-tight block leading-tight">
                {card.count}
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
