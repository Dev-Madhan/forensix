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
  "All Time",
  "Today",
  "Last 24 Hours",
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
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

  const isDateFiltered = dateRange !== "All Time";
  const isTypeFiltered = activityType.toLowerCase() !== "all";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 p-3.5 sm:p-5 rounded-xl border border-neutral-800 bg-[#0d0d0d] shadow-xs">
      {/* Left: Title & Subtitle */}
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Clock className="size-4.5 sm:size-5 text-[#665AEF] shrink-0" />
          <h2 className="text-sm sm:text-base md:text-lg font-bold font-heading text-white tracking-tight">
            Activity Log
          </h2>
        </div>
        <p className="text-[11px] sm:text-xs md:text-sm text-neutral-400 mt-0.5 sm:mt-1 leading-snug">
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
            className="xl:hidden inline-flex items-center gap-1.5 h-8.5 px-2.5 rounded-lg border border-neutral-800 bg-black/60 hover:bg-neutral-800 text-xs font-semibold text-neutral-200 cursor-pointer shadow-xs touch-manipulation active:scale-95"
          >
            <Filter className="size-3 text-[#665AEF]" />
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
            className={cn(
              "inline-flex items-center justify-between gap-1.5 h-8.5 px-2.5 sm:px-3 rounded-lg border text-xs font-medium cursor-pointer shadow-xs transition-colors touch-manipulation max-w-37.5 sm:max-w-none select-none",
              isTypeFiltered
                ? "border-[#665AEF]/50 bg-[#665AEF]/15 text-white"
                : "border-neutral-800 bg-black/60 hover:bg-neutral-800/80 text-neutral-200"
            )}
          >
            <span className="truncate">{currentTypeLabel}</span>
            <ChevronDown className="size-3.5 text-neutral-400 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 rounded-xl border border-neutral-800 bg-[#0d0d0d] text-neutral-200 shadow-2xl p-1 z-50"
          >
            {ACTIVITY_TYPE_OPTIONS.map((opt) => {
              const isSelected = activityType.toLowerCase() === opt.id.toLowerCase();
              return (
                <DropdownMenuItem
                  key={opt.id}
                  onClick={() => onActivityTypeChange(opt.id)}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors",
                    isSelected
                      ? "bg-neutral-800/80 text-white font-semibold"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="size-3.5 text-[#665AEF]" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Range Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "inline-flex items-center justify-between gap-2 h-8.5 px-3 rounded-lg border text-xs font-medium cursor-pointer shadow-xs transition-colors select-none",
              isDateFiltered
                ? "border-[#665AEF]/50 bg-[#665AEF]/15 text-white font-semibold"
                : "border-neutral-800 bg-black/60 hover:bg-neutral-800/80 text-neutral-200"
            )}
          >
            <div className="flex items-center gap-1.5">
              <Calendar
                className={cn(
                  "size-3.5",
                  isDateFiltered ? "text-[#665AEF]" : "text-neutral-400"
                )}
              />
              <span className="truncate">{dateRange}</span>
            </div>
            <ChevronDown className="size-3.5 text-neutral-400 shrink-0" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 rounded-xl border border-neutral-800 bg-[#0d0d0d] text-neutral-200 shadow-2xl p-1 z-50"
          >
            {DATE_RANGE_OPTIONS.map((range) => {
              const isSelected = dateRange === range;
              return (
                <DropdownMenuItem
                  key={range}
                  onClick={() => onDateRangeChange(range)}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors",
                    isSelected
                      ? "bg-neutral-800/80 text-white font-semibold"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                  )}
                >
                  <span>{range}</span>
                  {isSelected && <Check className="size-3.5 text-[#665AEF]" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
