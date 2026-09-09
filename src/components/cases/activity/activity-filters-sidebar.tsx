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
  { id: "Note", label: "Notes" },
  { id: "Records", label: "Records" },
];

export const DATE_RANGE_OPTIONS = [
  "Oct 1, 2026 - Oct 5, 2026",
  "Last 24 Hours",
  "Last 7 Days",
  "Last 30 Days",
  "All Time",
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
    { id: "Arjun Karthik", label: "Arjun Karthik (Investigator)" },
    { id: "Priya Nair", label: "Priya Nair (Senior Analyst)" },
    { id: "Raghav Menon", label: "Raghav Menon (Field Officer)" },
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
        <label className="text-xs font-semibold text-muted-foreground">
          Date Range
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="w-full min-h-10.5 sm:min-h-9 flex items-center justify-between px-3 py-2 rounded-lg border-2 border-border/80 bg-card/70 hover:bg-card text-xs font-medium text-foreground transition-colors cursor-pointer shadow-2xs touch-manipulation"
          >
            <div className="flex items-center gap-2 truncate">
              <Calendar className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{filters.dateRange}</span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0 ml-1.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-56 bg-card/95 border-2 border-border/80 backdrop-blur-md shadow-xl z-100"
          >
            {DATE_RANGE_OPTIONS.map((range) => (
              <DropdownMenuItem
                key={range}
                onClick={() => onDateRangeChange(range)}
                className="flex items-center justify-between text-xs cursor-pointer py-2 sm:py-1.5"
              >
                <span>{range}</span>
                {filters.dateRange === range && (
                  <Check className="size-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 2. Activity Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          Activity Type
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="w-full min-h-10.5 sm:min-h-9 flex items-center justify-between px-3 py-2 rounded-lg border-2 border-border/80 bg-card/70 hover:bg-card text-xs font-medium text-foreground transition-colors cursor-pointer shadow-2xs touch-manipulation"
          >
            <span className="truncate">{currentTypeLabel}</span>
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0 ml-1.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-52 bg-card/95 border-2 border-border/80 backdrop-blur-md shadow-xl z-100"
          >
            {ACTIVITY_TYPE_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => onActivityTypeChange(opt.id)}
                className="flex items-center justify-between text-xs cursor-pointer py-2 sm:py-1.5"
              >
                <span>{opt.label}</span>
                {filters.activityType.toLowerCase() ===
                  opt.id.toLowerCase() && (
                  <Check className="size-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 3. User */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          User
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="w-full min-h-10.5 sm:min-h-9 flex items-center justify-between px-3 py-2 rounded-lg border-2 border-border/80 bg-card/70 hover:bg-card text-xs font-medium text-foreground transition-colors cursor-pointer shadow-2xs touch-manipulation"
          >
            <div className="flex items-center gap-1.5 truncate">
              <User className="size-3.5 text-muted-foreground shrink-0" />
              <span className="truncate">{currentUserLabel}</span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0 ml-1.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-64 bg-card/95 border-2 border-border/80 backdrop-blur-md shadow-xl z-100"
          >
            {userOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => onUserFilterChange(opt.id)}
                className="flex items-center justify-between text-xs cursor-pointer py-2 sm:py-1.5"
              >
                <span className="truncate">{opt.label}</span>
                {filters.userFilter === opt.id && (
                  <Check className="size-3.5 text-primary shrink-0 ml-2" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 4. Sort By */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-muted-foreground">
          Sort By
        </label>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="w-full min-h-10.5 sm:min-h-9 flex items-center justify-between px-3 py-2 rounded-lg border-2 border-border/80 bg-card/70 hover:bg-card text-xs font-medium text-foreground transition-colors cursor-pointer shadow-2xs touch-manipulation"
          >
            <span className="truncate">{currentSortLabel}</span>
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0 ml-1.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-48 bg-card/95 border-2 border-border/80 backdrop-blur-md shadow-xl z-100"
          >
            {SORT_OPTIONS.map((opt) => (
              <DropdownMenuItem
                key={opt.id}
                onClick={() => onSortByChange(opt.id)}
                className="flex items-center justify-between text-xs cursor-pointer py-2 sm:py-1.5"
              >
                <span>{opt.label}</span>
                {filters.sortBy === opt.id && (
                  <Check className="size-3.5 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 5. Buttons: Apply Filters & Reset */}
      <div className="grid grid-cols-2 gap-2.5 pt-2">
        <Button
          type="button"
          onClick={() => onCloseMobileSheet?.()}
          className="w-full bg-[#1864e8] hover:bg-[#1556c7] text-white text-xs font-semibold h-10 sm:h-9 rounded-lg gap-1.5 cursor-pointer shadow-sm shadow-blue-500/20 active:scale-[0.98] touch-manipulation"
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
          className="w-full border-2 border-border/80 bg-card/60 hover:bg-card text-muted-foreground hover:text-foreground text-xs font-medium h-10 sm:h-9 rounded-lg gap-1.5 cursor-pointer active:scale-[0.98] touch-manipulation"
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
    <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
      <CardHeader className="pb-3.5 border-b-2 border-border/60">
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-blue-400 shrink-0" />
          <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
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
