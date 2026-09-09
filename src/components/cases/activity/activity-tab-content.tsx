"use client";

import React, { useState, useMemo } from "react";
import { Clock, Calendar, Filter, X } from "lucide-react";
import { ActivityHeader } from "./activity-header";
import { ActivityTable } from "./activity-table";
import {
  ActivityFiltersSidebar,
  ActivityFiltersForm,
} from "./activity-filters-sidebar";
import { ActivityTimelineCard } from "./activity-timeline-card";
import { useCaseActivityHistory } from "./activity-session-store";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface ActivityTabContentProps {
  caseId?: string;
  caseNumber?: string;
}

export function ActivityTabContent({
  caseId,
  caseNumber = "FX-2026-184",
}: ActivityTabContentProps) {
  const {
    currentUser,
    activities,
    allFilteredCount,
    totalCount,
    timelineMilestones,
    filters,
    currentPage,
    totalPages,
    isLiveActive,
    setCurrentPage,
    resetFilters,
    setActivityType,
    setUserFilter,
    setSortBy,
    setDateRange,
  } = useCaseActivityHistory({ caseId, caseNumber });

  // Mobile segmented view state: "activity" stream or "timeline" milestones
  const [mobileTab, setMobileTab] = useState<"activity" | "timeline">("activity");

  // Mobile filter bottom drawer
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Compute active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.activityType && filters.activityType !== "ALL") count++;
    if (filters.userFilter && filters.userFilter !== "ALL") count++;
    if (
      filters.dateRange &&
      filters.dateRange !== "Oct 1, 2026 - Oct 5, 2026" &&
      filters.dateRange !== "All Time"
    )
      count++;
    if (filters.sortBy && filters.sortBy !== "LATEST_FIRST") count++;
    return count;
  }, [filters]);

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Mobile & Tablet Segmented View Switcher (visible only on screens < xl) */}
      <div className="xl:hidden flex items-center p-1 rounded-xl bg-card/60 border-2 border-border/70 backdrop-blur-xs shadow-2xs">
        <button
          type="button"
          onClick={() => setMobileTab("activity")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none touch-manipulation",
            mobileTab === "activity"
              ? "bg-[#665AEF] text-white shadow-xs shadow-[#665AEF]/30"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Clock className="size-3.5" />
          <span>Activity Log</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono leading-tight">
            {allFilteredCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab("timeline")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer select-none touch-manipulation",
            mobileTab === "timeline"
              ? "bg-[#665AEF] text-white shadow-xs shadow-[#665AEF]/30"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Calendar className="size-3.5" />
          <span>Timeline</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono leading-tight">
            {timelineMilestones.length}
          </span>
        </button>
      </div>

      {/* Active Filter Chips Bar (visible on all screen sizes when filters are applied) */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 px-0.5">
          <span className="text-[11px] font-medium text-muted-foreground mr-1">
            Active Filters:
          </span>

          {filters.activityType !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-blue-500/25 bg-blue-500/10 text-blue-400 shadow-2xs">
              <span>Type: {filters.activityType}</span>
              <button
                type="button"
                onClick={() => setActivityType("ALL")}
                className="hover:text-blue-200 cursor-pointer p-0.5"
                aria-label="Remove type filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {filters.userFilter !== "ALL" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-purple-500/25 bg-purple-500/10 text-purple-400 shadow-2xs">
              <span>
                User:{" "}
                {filters.userFilter === "CURRENT_USER"
                  ? "You"
                  : filters.userFilter}
              </span>
              <button
                type="button"
                onClick={() => setUserFilter("ALL")}
                className="hover:text-purple-200 cursor-pointer p-0.5"
                aria-label="Remove user filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          {filters.dateRange !== "Oct 1, 2026 - Oct 5, 2026" &&
            filters.dateRange !== "All Time" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-teal-500/25 bg-teal-500/10 text-teal-400 shadow-2xs">
                <span>Date: {filters.dateRange}</span>
                <button
                  type="button"
                  onClick={() => setDateRange("Oct 1, 2026 - Oct 5, 2026")}
                  className="hover:text-teal-200 cursor-pointer p-0.5"
                  aria-label="Remove date range filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

          {filters.sortBy !== "LATEST_FIRST" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-amber-500/25 bg-amber-500/10 text-amber-400 shadow-2xs">
              <span>Oldest First</span>
              <button
                type="button"
                onClick={() => setSortBy("LATEST_FIRST")}
                className="hover:text-amber-200 cursor-pointer p-0.5"
                aria-label="Remove sort filter"
              >
                <X className="size-3" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={resetFilters}
            className="text-[11px] font-semibold text-muted-foreground hover:text-foreground underline underline-offset-2 ml-1 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Responsive Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-4.5 items-start w-full">
        {/* Left Column: Header & Data Table (or feed on mobile) */}
        <div
          className={cn(
            "xl:col-span-8 flex flex-col gap-4 min-w-0",
            mobileTab === "timeline" && "hidden xl:flex"
          )}
        >
          {/* 1. Activity Log Header with Quick Dropdowns & Mobile Filter Trigger */}
          <ActivityHeader
            activityType={filters.activityType}
            onActivityTypeChange={setActivityType}
            dateRange={filters.dateRange}
            onDateRangeChange={setDateRange}
            isLiveActive={isLiveActive}
            onOpenMobileFilters={() => setIsMobileFilterOpen(true)}
            activeFilterCount={activeFilterCount}
          />

          {/* 2. Main Activity Data Table (Mobile Feed Cards on < sm, Table on >= sm) */}
          <ActivityTable
            items={activities}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            filteredCount={allFilteredCount}
            onPageChange={setCurrentPage}
          />
        </div>

        {/* Right Column: Filters & Timeline (Visible side-by-side on desktop, or when Timeline tab active on mobile) */}
        <div
          className={cn(
            "xl:col-span-4 flex flex-col gap-4 min-w-0",
            mobileTab === "activity" && "hidden xl:flex"
          )}
        >
          {/* 1. Activity Filters Panel (Always shown on desktop) */}
          <div className="hidden xl:block">
            <ActivityFiltersSidebar
              filters={filters}
              onActivityTypeChange={setActivityType}
              onUserFilterChange={setUserFilter}
              onDateRangeChange={setDateRange}
              onSortByChange={setSortBy}
              onResetFilters={resetFilters}
              currentUserName={currentUser.name}
            />
          </div>

          {/* 2. Activity Timeline Milestones */}
          <ActivityTimelineCard milestones={timelineMilestones} />
        </div>
      </div>

      {/* Mobile Slide-Over / Bottom Drawer for Filters */}
      <Sheet open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
        <SheetContent
          side="bottom"
          className="bg-card/95 backdrop-blur-xl border-t-2 border-border/80 p-5 rounded-t-2xl max-h-[85vh] overflow-y-auto"
        >
          <SheetHeader className="pb-3 border-b border-border/40">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-bold font-heading text-foreground flex items-center gap-2">
                <Filter className="size-4 text-blue-400" />
                <span>Filter Activity Logs</span>
              </SheetTitle>
              {activeFilterCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#665AEF]/20 text-[#a594fd] font-semibold">
                  {activeFilterCount} active
                </span>
              )}
            </div>
            <SheetDescription className="text-xs text-muted-foreground">
              Filter case activity by date range, type, or user.
            </SheetDescription>
          </SheetHeader>

          <div className="pt-4">
            <ActivityFiltersForm
              filters={filters}
              onActivityTypeChange={setActivityType}
              onUserFilterChange={setUserFilter}
              onDateRangeChange={setDateRange}
              onSortByChange={setSortBy}
              onResetFilters={resetFilters}
              currentUserName={currentUser.name}
              onCloseMobileSheet={() => setIsMobileFilterOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
