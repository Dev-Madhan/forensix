"use client";

import React from "react";
import { Clock, Calendar, ChevronDown, Check, Sparkles, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ActivityCategory } from "./types";

interface ActivityHeaderProps {
  activityType: string;
  onActivityTypeChange: (type: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  isLiveActive?: boolean;
  onOpenMobileFilters?: () => void;
  activeFilterCount?: number;
}

const ACTIVITY_TYPE_OPTIONS: { id: string; label: string }[] = [
  { id: "ALL", label: "All Activity" },
  { id: "Evidence", label: "Evidence" },
  { id: "Case", label: "Case Updates" },
  { id: "Analysis", label: "AI Analysis" },
  { id: "Suspect", label: "Suspect Actions" },
  { id: "Note", label: "Notes" },
  { id: "Records", label: "Records" },
];

const DATE_RANGE_OPTIONS = [
  "Oct 1, 2026 - Oct 5, 2026",
  "Last 24 Hours",
  "Last 7 Days",
  "Last 30 Days",
  "All Time",
];

export function ActivityHeader({
  activityType,
  onActivityTypeChange,
  dateRange,
  onDateRangeChange,
  isLiveActive = true,
  onOpenMobileFilters,
  activeFilterCount = 0,
}: ActivityHeaderProps) {
  const currentTypeLabel =
    ACTIVITY_TYPE_OPTIONS.find(
      (opt) => opt.id.toLowerCase() === activityType.toLowerCase()
    )?.label || "All Activity";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 p-3.5 sm:p-5 rounded-xl border-2 border-border/80 bg-card/40 backdrop-blur-xs shadow-xs">
      {/* Left: Title & Subtitle */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Clock className="size-4.5 sm:size-5 text-blue-400 shrink-0" />
          <h2 className="text-sm sm:text-base md:text-lg font-bold font-heading text-foreground tracking-tight">
            Activity Log
          </h2>
        </div>
        <p className="text-[11px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1 leading-snug">
          Complete history of all activities, updates, and actions performed on this case.
        </p>
      </div>

      {/* Right: Quick Activity Type & Date Range Selectors + Mobile Filter Button */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0">
        {/* Mobile Filter Button (visible on mobile / tablet screens < xl) */}
        {onOpenMobileFilters && (
          <Button
            type="button"
            variant="outline"
            onClick={onOpenMobileFilters}
            className="xl:hidden inline-flex items-center gap-1.5 h-8.5 px-2.5 rounded-lg border-2 border-border/80 bg-card/70 hover:bg-card text-xs font-semibold text-foreground cursor-pointer shadow-2xs touch-manipulation active:scale-95"
          >
            <Filter className="size-3 text-blue-400" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <span className="size-4 rounded-full bg-[#665AEF] text-white text-[10px] font-bold flex items-center justify-center ml-0.5">
                {activeFilterCount}
              </span>
            )}
          </Button>
        )}

        {/* Activity Type Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-between gap-1.5 h-8.5 px-2.5 sm:px-3 rounded-lg border-2 border-border/80 bg-card/70 hover:bg-card text-xs font-medium text-foreground cursor-pointer shadow-2xs transition-colors touch-manipulation max-w-37.5 sm:max-w-none"
          >
            <span className="truncate">{currentTypeLabel}</span>
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-44 bg-card/95 border-2 border-border/80 backdrop-blur-md shadow-xl"
          >
            {ACTIVITY_TYPE_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => onActivityTypeChange(opt.id)}
                className="flex items-center justify-between text-xs cursor-pointer"
              >
                <span>{opt.label}</span>
                {activityType.toLowerCase() === opt.id.toLowerCase() && (
                  <Check className="size-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-between gap-2 h-8.5 px-3 rounded-lg border-2 border-border/80 bg-card/70 hover:bg-card text-xs font-medium text-foreground cursor-pointer shadow-2xs transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-muted-foreground" />
              <span>{dateRange}</span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 bg-card/95 border-2 border-border/80 backdrop-blur-md shadow-xl"
          >
            {DATE_RANGE_OPTIONS.map((range) => (
              <DropdownMenuItem
                key={range}
                onClick={() => onDateRangeChange(range)}
                className="flex items-center justify-between text-xs cursor-pointer"
              >
                <span>{range}</span>
                {dateRange === range && (
                  <Check className="size-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
