"use client";

import * as React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  Check,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CRIME_CATEGORIES = [
  "All Categories",
  "Theft",
  "Assault",
  "Fraud",
  "Cyber Crime",
  "Drug Offense",
  "Violence",
  "Arson",
  "Robbery",
  "Burglary",
  "Forgery",
  "Extortion",
  "Smuggling",
];

const RISK_LEVELS = ["All Levels", "High", "Medium", "Low"];

const STATUSES = [
  "All Statuses",
  "Active",
  "Wanted",
  "In Custody",
  "Under Surveillance",
  "Inactive",
];

const SORT_OPTIONS: { key: "name" | "id" | "dob" | "risk" | "status"; label: string }[] = [
  { key: "name", label: "Full Name" },
  { key: "id", label: "Criminal ID" },
  { key: "dob", label: "Date of Birth" },
  { key: "risk", label: "Risk Level" },
  { key: "status", label: "Status" },
];

interface CriminalsFilterDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryFilter: string | null;
  onSelectCategory: (cat: string | null) => void;
  riskFilter: string | null;
  onSelectRisk: (risk: string | null) => void;
  statusFilter: string | null;
  onSelectStatus: (status: string | null) => void;
  sortKey: "name" | "id" | "dob" | "risk" | "status" | null;
  sortOrder: "asc" | "desc";
  onToggleSort: (key: "name" | "id" | "dob" | "risk" | "status") => void;
  onResetFilters: () => void;
  totalMatches: number;
}

export function CriminalsFilterDrawer({
  isOpen,
  onOpenChange,
  categoryFilter,
  onSelectCategory,
  riskFilter,
  onSelectRisk,
  statusFilter,
  onSelectStatus,
  sortKey,
  sortOrder,
  onToggleSort,
  onResetFilters,
  totalMatches,
}: CriminalsFilterDrawerProps) {
  const activeFiltersCount =
    (categoryFilter ? 1 : 0) +
    (riskFilter ? 1 : 0) +
    (statusFilter ? 1 : 0) +
    (sortKey ? 1 : 0);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent className="max-h-[85dvh] rounded-t-2xl border-t-2 border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <DrawerHeader className="p-4 pb-2 border-b border-border/50 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-[#665AEF]/20 text-[#a594fd] flex items-center justify-center">
                <SlidersHorizontal className="size-4" />
              </div>
              <div>
                <DrawerTitle className="text-base font-bold text-foreground font-heading">
                  Filter & Sort Registry
                </DrawerTitle>
                <DrawerDescription className="text-xs text-muted-foreground">
                  Refine suspects by crime category, threat level, and status
                </DrawerDescription>
              </div>
            </div>

            <DrawerClose
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer -mr-1"
                />
              }
            >
              <X className="size-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Scrollable Filter Form Controls */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs">
          {/* 1. Sort Controls */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-foreground/90 uppercase tracking-wider block">
              Sort By
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {SORT_OPTIONS.map((opt) => {
                const isSelected = sortKey === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => onToggleSort(opt.key)}
                    className={cn(
                      "flex items-center justify-between h-9 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors",
                      isSelected
                        ? "border-[#665AEF] bg-[#665AEF]/15 text-white"
                        : "border-border/70 bg-background/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="size-4 flex items-center justify-center text-[#a594fd]">
                        {sortOrder === "asc" ? (
                          <ArrowUp className="size-3.5" />
                        ) : (
                          <ArrowDown className="size-3.5" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Risk Level */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-foreground/90 uppercase tracking-wider block">
              Risk Level
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {RISK_LEVELS.map((level) => {
                const isAll = level === "All Levels";
                const isSelected = isAll ? !riskFilter : riskFilter === level;
                return (
                  <button
                    key={level}
                    type="button"
                    onClick={() => onSelectRisk(isAll ? null : level)}
                    className={cn(
                      "h-8 rounded-lg border text-xs font-medium cursor-pointer transition-colors flex items-center justify-center truncate px-1",
                      isSelected
                        ? "border-[#665AEF] bg-[#665AEF]/20 text-white font-semibold"
                        : "border-border/70 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <span>{level}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Status */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-foreground/90 uppercase tracking-wider block">
              Operational Status
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {STATUSES.map((st) => {
                const isAll = st === "All Statuses";
                const isSelected = isAll ? !statusFilter : statusFilter === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => onSelectStatus(isAll ? null : st)}
                    className={cn(
                      "flex items-center justify-between h-8.5 px-3 rounded-lg border text-xs font-medium cursor-pointer transition-colors",
                      isSelected
                        ? "border-[#665AEF] bg-[#665AEF]/20 text-white font-semibold"
                        : "border-border/70 bg-background/50 text-muted-foreground hover:text-foreground hover:bg-muted/60"
                    )}
                  >
                    <span>{st}</span>
                    {isSelected && <Check className="size-3 text-[#a594fd]" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Crime Categories */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-foreground/90 uppercase tracking-wider block">
              Crime Categories
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CRIME_CATEGORIES.map((cat) => {
                const isAll = cat === "All Categories";
                const isSelected = isAll ? !categoryFilter : categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => onSelectCategory(isAll ? null : cat)}
                    className={cn(
                      "px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors",
                      isSelected
                        ? "border-[#665AEF] bg-[#665AEF]/25 text-white font-semibold shadow-xs"
                        : "border-border/70 bg-background/40 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Pinned Bottom CTA in Thumb Zone */}
        <DrawerFooter className="p-3 border-t border-border/60 bg-card/90 backdrop-blur-md flex flex-row items-center gap-2 pb-[max(env(safe-area-inset-bottom,12px),12px)]">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            disabled={activeFiltersCount === 0}
            className="flex-1 h-10 rounded-xl border-2 border-border/80 text-xs font-medium cursor-pointer gap-1.5 disabled:opacity-40"
          >
            <RotateCcw className="size-3.5" />
            <span>Reset All</span>
          </Button>

          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex-2 h-10 rounded-xl bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold shadow-sm shadow-[#665AEF]/25 cursor-pointer"
          >
            Show {totalMatches} {totalMatches === 1 ? "Record" : "Records"}
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

