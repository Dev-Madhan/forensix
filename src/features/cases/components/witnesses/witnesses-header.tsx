"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  AnimatedSelect,
  type AnimatedSelectOption,
} from "./animated-select";
import {
  Search,
  UserPlus,
  LayoutGrid,
  List,
  X,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WitnessesHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  availabilityFilter: string;
  onAvailabilityFilterChange: (value: string) => void;
  credibilityFilter: string;
  onCredibilityFilterChange: (value: string) => void;
  viewMode: "table" | "grid";
  onViewModeChange: (mode: "table" | "grid") => void;
  onEnrollClick: () => void;
  totalCount: number;
  filteredCount: number;
}

const ROLE_OPTIONS: AnimatedSelectOption[] = [
  { label: "All Roles", value: "ALL" },
  { label: "Eyewitness", value: "EYEWITNESS" },
  { label: "Victim Witness", value: "VICTIM_WITNESS" },
  { label: "Earwitness", value: "EARWITNESS" },
  { label: "First Responder", value: "FIRST_RESPONDER" },
  { label: "Informant", value: "INFORMANT" },
  { label: "Expert Witness", value: "EXPERT_WITNESS" },
  { label: "Character Witness", value: "CHARACTER_WITNESS" },
];

const CREDIBILITY_OPTIONS: AnimatedSelectOption[] = [
  { label: "All Credibility", value: "ALL" },
  { label: "High", value: "HIGH" },
  { label: "Medium", value: "MEDIUM" },
  { label: "Low", value: "LOW" },
  { label: "Unverified", value: "UNVERIFIED" },
];

const AVAILABILITY_OPTIONS: AnimatedSelectOption[] = [
  { label: "All Status", value: "ALL" },
  { label: "Active Contactable", value: "ACTIVE_AVAILABLE" },
  { label: "Protected", value: "UNDER_PROTECTION" },
  { label: "Relocated", value: "RELOCATED" },
  { label: "Unreachable", value: "UNREACHABLE" },
  { label: "Deceased", value: "DECEASED" },
];

export function WitnessesHeader({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  availabilityFilter,
  onAvailabilityFilterChange,
  credibilityFilter,
  onCredibilityFilterChange,
  viewMode,
  onViewModeChange,
  onEnrollClick,
  totalCount,
  filteredCount,
}: WitnessesHeaderProps) {
  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    typeFilter !== "ALL" ||
    availabilityFilter !== "ALL" ||
    credibilityFilter !== "ALL";

  const handleResetFilters = () => {
    onSearchChange("");
    onTypeFilterChange("ALL");
    onAvailabilityFilterChange("ALL");
    onCredibilityFilterChange("ALL");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top row: Title/Count + View Toggles + Enroll Button */}
      <div className="flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-base sm:text-lg font-heading font-semibold text-foreground tracking-tight">
            Case Witnesses & Testimonies
          </h2>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary/80 text-muted-foreground border border-border/60">
            {filteredCount} {filteredCount === 1 ? "witness" : "witnesses"}
            {totalCount !== filteredCount && ` of ${totalCount}`}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Sync
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border-2 border-border/80 bg-card/60 p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => onViewModeChange("table")}
              title="Table view"
              className={cn(
                "p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                viewMode === "table"
                  ? "bg-[#665AEF] text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange("grid")}
              title="Card grid view"
              className={cn(
                "p-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer",
                viewMode === "grid"
                  ? "bg-[#665AEF] text-white shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <LayoutGrid className="size-4" />
            </button>
          </div>

          {/* Enroll Witness Button */}
          <Button
            onClick={onEnrollClick}
            size="sm"
            className="h-9.5 px-4 text-xs font-semibold bg-[#665AEF] hover:bg-[#5748e6] text-white shadow-sm flex items-center gap-2 cursor-pointer rounded-xl transition-all"
          >
            <UserPlus className="size-4" />
            <span>Enroll Witness</span>
          </Button>
        </div>
      </div>

      {/* Filter Toolbar: Inline with Animated Avatar-Style Dropdowns */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-0.5">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search witness name, phone, code, statement..."
            className="h-9.5 pl-8.5 pr-8 text-xs bg-card/60 border-2 border-border/80 rounded-xl focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] text-foreground placeholder:text-muted-foreground/70"
          />
          {searchTerm && (
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

        {/* Filter Dropdowns with Gliding Hover Animation (Mobile swipeable, desktop inline) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1 sm:mx-0 sm:px-0">
          {/* Role Filter */}
          <AnimatedSelect
            options={ROLE_OPTIONS}
            value={typeFilter}
            onChange={onTypeFilterChange}
            prefix="Role:"
            className={cn(
              "w-auto min-w-[130px] rounded-xl bg-card/60",
              typeFilter !== "ALL" && "border-[#665AEF]/70 bg-[#665AEF]/10 text-foreground"
            )}
            align="end"
          />

          {/* Credibility Filter */}
          <AnimatedSelect
            options={CREDIBILITY_OPTIONS}
            value={credibilityFilter}
            onChange={onCredibilityFilterChange}
            prefix="Cred:"
            className={cn(
              "w-auto min-w-[120px] rounded-xl bg-card/60",
              credibilityFilter !== "ALL" && "border-[#665AEF]/70 bg-[#665AEF]/10 text-foreground"
            )}
            align="end"
          />

          {/* Availability Status Filter */}
          <AnimatedSelect
            options={AVAILABILITY_OPTIONS}
            value={availabilityFilter}
            onChange={onAvailabilityFilterChange}
            prefix="Status:"
            className={cn(
              "w-auto min-w-[130px] rounded-xl bg-card/60",
              availabilityFilter !== "ALL" && "border-[#665AEF]/70 bg-[#665AEF]/10 text-foreground"
            )}
            align="end"
          />

          {/* Reset Active Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9.5 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl cursor-pointer shrink-0"
              title="Reset all filters"
            >
              <RotateCcw className="size-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
