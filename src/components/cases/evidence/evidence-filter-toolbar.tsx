"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, Calendar, ChevronDown, X, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { EvidenceType, EvidenceStatus, EvidenceSource } from "./types";

interface EvidenceFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  typeFilter: "ALL" | EvidenceType;
  onTypeFilterChange: (t: "ALL" | EvidenceType) => void;
  statusFilter?: "ALL" | EvidenceStatus;
  onStatusFilterChange?: (s: "ALL" | EvidenceStatus) => void;
  sourceFilter: "ALL" | EvidenceSource;
  onSourceFilterChange: (s: "ALL" | EvidenceSource) => void;
  dateRange: string;
  onDateRangeChange: (d: string) => void;
  onResetFilters?: () => void;
}

export function EvidenceFilterToolbar({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  statusFilter,
  onStatusFilterChange,
  sourceFilter,
  onSourceFilterChange,
  dateRange,
  onDateRangeChange,
  onResetFilters,
}: EvidenceFilterToolbarProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    typeFilter !== "ALL" ||
    (statusFilter && statusFilter !== "ALL") ||
    sourceFilter !== "ALL" ||
    (dateRange !== "Date Range" && dateRange !== "All Dates");

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      {/* 1. Search Bar */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search evidence by name, type, or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9.5 pl-8.5 pr-7 text-xs rounded-lg border-2 border-border bg-card/60 text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-[#665AEF]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        {/* 2. All Types Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-between gap-1.5 h-9.5 px-2.5 rounded-lg border-2 border-border bg-card/60 text-xs font-normal text-foreground hover:bg-muted/60 cursor-pointer transition-colors shrink-0"
          >
            <span>{typeFilter === "ALL" ? "All Types" : typeFilter}</span>
            <ChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={4}
            className="w-36 text-xs bg-card/95 backdrop-blur-xl border-2 border-border p-1 shadow-xl z-[100] overflow-hidden"
            onPointerLeave={() => setHoveredType(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-0.5"
            >
              {[
                { label: "All Types", value: "ALL" as const },
                { label: "Video", value: "Video" as const },
                { label: "Image", value: "Image" as const },
                { label: "Document", value: "Document" as const },
                { label: "Audio", value: "Audio" as const },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  onPointerEnter={() => setHoveredType(item.value)}
                  onClick={() => onTypeFilterChange(item.value)}
                  className="relative z-0 group flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer text-xs transition-colors hover:!bg-transparent focus:!bg-transparent text-foreground"
                >
                  {hoveredType === item.value && (
                    <motion.div
                      layoutId="evidence-filter-type-hover"
                      className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    />
                  )}
                  <span className={typeFilter === item.value ? "font-semibold text-foreground" : ""}>{item.label}</span>
                  {typeFilter === item.value && <Check className="size-3.5 text-[#665AEF] shrink-0" />}
                </DropdownMenuItem>
              ))}
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 3. All Sources Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-between gap-1.5 h-9.5 px-2.5 rounded-lg border-2 border-border bg-card/60 text-xs font-normal text-foreground hover:bg-muted/60 cursor-pointer transition-colors shrink-0"
          >
            <span>{sourceFilter === "ALL" ? "All Sources" : sourceFilter}</span>
            <ChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={4}
            className="w-36 text-xs bg-card/95 backdrop-blur-xl border-2 border-border p-1 shadow-xl z-[100] overflow-hidden"
            onPointerLeave={() => setHoveredSource(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-0.5"
            >
              {[
                { label: "All Sources", value: "ALL" as const },
                { label: "CCTV", value: "CCTV" as const },
                { label: "Crime Scene", value: "Crime Scene" as const },
                { label: "Investigator", value: "Investigator" as const },
                { label: "Phone Record", value: "Phone Record" as const },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  onPointerEnter={() => setHoveredSource(item.value)}
                  onClick={() => onSourceFilterChange(item.value)}
                  className="relative z-0 group flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer text-xs transition-colors hover:!bg-transparent focus:!bg-transparent text-foreground"
                >
                  {hoveredSource === item.value && (
                    <motion.div
                      layoutId="evidence-filter-source-hover"
                      className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    />
                  )}
                  <span className={sourceFilter === item.value ? "font-semibold text-foreground" : ""}>{item.label}</span>
                  {sourceFilter === item.value && <Check className="size-3.5 text-[#665AEF] shrink-0" />}
                </DropdownMenuItem>
              ))}
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 4. Date Range Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex items-center justify-between gap-1.5 h-9.5 px-2.5 rounded-lg border-2 border-border bg-card/60 text-xs font-normal text-foreground hover:bg-muted/60 cursor-pointer transition-colors shrink-0"
          >
            <Calendar className="size-3 text-muted-foreground shrink-0" />
            <span>{dateRange}</span>
            <ChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={4}
            className="w-36 text-xs bg-card/95 backdrop-blur-xl border-2 border-border p-1 shadow-xl z-[100] overflow-hidden"
            onPointerLeave={() => setHoveredDate(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-0.5"
            >
              {[
                { label: "All Dates", value: "Date Range" },
                { label: "Today", value: "Today" },
                { label: "Last 24 Hours", value: "Last 24 Hours" },
                { label: "Last 7 Days", value: "Last 7 Days" },
                { label: "October 2026", value: "Oct 2026" },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  onPointerEnter={() => setHoveredDate(item.value)}
                  onClick={() => onDateRangeChange(item.value)}
                  className="relative z-0 group flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer text-xs transition-colors hover:!bg-transparent focus:!bg-transparent text-foreground"
                >
                  {hoveredDate === item.value && (
                    <motion.div
                      layoutId="evidence-filter-date-hover"
                      className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    />
                  )}
                  <span className={dateRange === item.value ? "font-semibold text-foreground" : ""}>{item.label}</span>
                  {dateRange === item.value && <Check className="size-3.5 text-[#665AEF] shrink-0" />}
                </DropdownMenuItem>
              ))}
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reset Filters button */}
        {hasActiveFilters && onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="text-xs text-[#665AEF] hover:underline font-medium px-1.5 py-1 cursor-pointer transition-colors shrink-0"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
