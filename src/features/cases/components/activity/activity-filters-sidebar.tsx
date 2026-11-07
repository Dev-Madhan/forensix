"use client";

import React, { useState } from "react";
import {
  Filter,
  Calendar,
  ChevronDown,
  Send,
  RotateCcw,
  User,
  Check,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { ActivityFilterState, ActivityCategory } from "./types";

export interface ActivityFiltersFormProps {
  filters: ActivityFilterState;
  onActivityTypeChange: (type: string) => void;
  onUserFilterChange: (user: string) => void;
  onDateRangeChange: (range: string) => void;
  onSortByChange: (sortBy: "LATEST_FIRST" | "OLDEST_FIRST") => void;
  onResetFilters: () => void;
  currentUserName: string;
  onCloseMobileSheet?: () => void;
}

export const ACTIVITY_TYPE_OPTIONS: { id: string; label: string }[] = [
  { id: "ALL", label: "All Activity" },
  { id: "Evidence", label: "Evidence" },
  { id: "Case", label: "Case Updates" },
  { id: "Analysis", label: "AI Analysis" },
  { id: "Suspect", label: "Suspect Actions" },
  { id: "Witness", label: "Witnesses" },
  { id: "Note", label: "Notes" },
  { id: "Records", label: "Records" },
];

export const DATE_RANGE_OPTIONS = [
  "All Time",
  "Today",
  "Last 24 Hours",
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
];

export const SORT_OPTIONS: { id: "LATEST_FIRST" | "OLDEST_FIRST"; label: string }[] = [
  { id: "LATEST_FIRST", label: "Latest First" },
  { id: "OLDEST_FIRST", label: "Oldest First" },
];

export function ActivityFiltersForm({
  filters,
  onActivityTypeChange,
  onUserFilterChange,
  onDateRangeChange,
  onSortByChange,
  onResetFilters,
  currentUserName,
  onCloseMobileSheet,
}: ActivityFiltersFormProps) {
  // Available user filter options
  const userOptions = [
    { id: "ALL", label: "All Users" },
    { id: "CURRENT_USER", label: `${currentUserName} (You)` },
    { id: "System", label: "System (Forensix AI)" },
  ];

  const currentTypeLabel =
    ACTIVITY_TYPE_OPTIONS.find(
      (opt) => opt.id.toLowerCase() === filters.activityType.toLowerCase()
    )?.label || "All Activity";

  const currentUserLabel =
    userOptions.find((opt) => opt.id === filters.userFilter)?.label ||
    "All Users";

  const currentSortLabel =
    SORT_OPTIONS.find((opt) => opt.id === filters.sortBy)?.label ||
    "Latest First";

  return (
    <div className="space-y-4">
      {/* 1. Date Range */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-neutral-400">
          Date Range
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "w-full min-h-10.5 sm:min-h-9 flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer shadow-xs select-none",
              filters.dateRange !== "All Time"
                ? "border-[#665AEF]/50 bg-[#665AEF]/15 text-white font-semibold"
                : "border-neutral-800 bg-[#0d0d0d] hover:bg-neutral-800/80 text-neutral-200"
            )}
          >
            <div className="flex items-center gap-2 truncate">
              <Calendar
                className={cn(
                  "size-3.5 shrink-0",
                  filters.dateRange !== "All Time" ? "text-[#665AEF]" : "text-neutral-400"
                )}
              />
              <span className="truncate">{filters.dateRange}</span>
            </div>
            <ChevronDown className="size-3.5 text-neutral-400 shrink-0 ml-1.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 rounded-xl border border-neutral-800 bg-[#0d0d0d] text-neutral-200 shadow-2xl p-1 z-100"
          >
            {DATE_RANGE_OPTIONS.map((range) => {
              const isSelected = filters.dateRange === range;
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

      {/* 2. Activity Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-neutral-400">
          Activity Type
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "w-full min-h-10.5 sm:min-h-9 flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer shadow-xs select-none",
              filters.activityType !== "ALL"
                ? "border-[#665AEF]/50 bg-[#665AEF]/15 text-white font-semibold"
                : "border-neutral-800 bg-[#0d0d0d] hover:bg-neutral-800/80 text-neutral-200"
            )}
          >
            <span className="truncate">{currentTypeLabel}</span>
            <ChevronDown className="size-3.5 text-neutral-400 shrink-0 ml-1.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 rounded-xl border border-neutral-800 bg-[#0d0d0d] text-neutral-200 shadow-2xl p-1 z-100"
          >
            {ACTIVITY_TYPE_OPTIONS.map((opt) => {
              const isSelected = filters.activityType.toLowerCase() === opt.id.toLowerCase();
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
      </div>

      {/* 3. User */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-neutral-400">
          User
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "w-full min-h-10.5 sm:min-h-9 flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer shadow-xs select-none",
              filters.userFilter !== "ALL"
                ? "border-[#665AEF]/50 bg-[#665AEF]/15 text-white font-semibold"
                : "border-neutral-800 bg-[#0d0d0d] hover:bg-neutral-800/80 text-neutral-200"
            )}
          >
            <div className="flex items-center gap-1.5 truncate">
              <User className="size-3.5 text-neutral-400 shrink-0" />
              <span className="truncate">{currentUserLabel}</span>
            </div>
            <ChevronDown className="size-3.5 text-neutral-400 shrink-0 ml-1.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 rounded-xl border border-neutral-800 bg-[#0d0d0d] text-neutral-200 shadow-2xl p-1 z-100"
          >
            {userOptions.map((opt) => {
              const isSelected = filters.userFilter === opt.id;
              return (
                <DropdownMenuItem
                  key={opt.id}
                  onClick={() => onUserFilterChange(opt.id)}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors",
                    isSelected
                      ? "bg-neutral-800/80 text-white font-semibold"
                      : "text-neutral-300 hover:text-white hover:bg-neutral-800/50"
                  )}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check className="size-3.5 text-[#665AEF] shrink-0 ml-2" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 4. Sort By */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-neutral-400">
          Sort By
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "w-full min-h-10.5 sm:min-h-9 flex items-center justify-between px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer shadow-xs select-none",
              filters.sortBy !== "LATEST_FIRST"
                ? "border-[#665AEF]/50 bg-[#665AEF]/15 text-white font-semibold"
                : "border-neutral-800 bg-[#0d0d0d] hover:bg-neutral-800/80 text-neutral-200"
            )}
          >
            <span className="truncate">{currentSortLabel}</span>
            <ChevronDown className="size-3.5 text-neutral-400 shrink-0 ml-1.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 rounded-xl border border-neutral-800 bg-[#0d0d0d] text-neutral-200 shadow-2xl p-1 z-100"
          >
            {SORT_OPTIONS.map((opt) => {
              const isSelected = filters.sortBy === opt.id;
              return (
                <DropdownMenuItem
                  key={opt.id}
                  onClick={() => onSortByChange(opt.id)}
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
      </div>

      {/* 5. Buttons: Apply Filters & Reset */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <Button
          type="button"
          onClick={() => onCloseMobileSheet?.()}
          className="w-full bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold h-10 sm:h-9 rounded-lg gap-1.5 cursor-pointer shadow-xs shadow-[#665AEF]/25 active:scale-[0.98] touch-manipulation"
        >
          <Send className="size-3" />
          <span>Apply Filters</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            onResetFilters();
          }}
          className="w-full border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-medium h-10 sm:h-9 rounded-lg gap-1.5 cursor-pointer active:scale-[0.98] touch-manipulation"
        >
          <RotateCcw className="size-3" />
          <span>Reset</span>
        </Button>
      </div>
    </div>
  );
}

export function ActivityFiltersSidebar(props: ActivityFiltersFormProps) {
  return (
    <Card className="border border-neutral-800 bg-[#0d0d0d] rounded-xl shadow-xs overflow-hidden">
      <CardHeader className="pb-3.5 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-[#665AEF] shrink-0" />
          <CardTitle className="text-sm sm:text-base font-bold font-heading text-white">
            Activity Filters
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <ActivityFiltersForm {...props} />
      </CardContent>
    </Card>
  );
}
