"use client";

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  ScanFace,
  Eye,
  Activity,
  Smile,
  Sparkles,
  Check,
  X,
  RotateCcw,
  Lock,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSketch, FeatureItem } from "./sketch-context";
import { FACIAL_DATASET, SubcategoryGroup } from "./facial-dataset-data";
import { FacialFeatureIcon } from "./facial-feature-icon";

export function FacialDatasetSidebar() {
  const {
    selectedFeatures,
    toggleFeature,
    isFeatureSelected,
    selectedCount,
    sidebarCollapsed,
    setSidebarCollapsed,
    searchQuery,
    setSearchQuery,
    generationMode,
    isSidebarEnabled,
    requestModeChange,
  } = useSketch();

  const handleFeatureClick = (item: FeatureItem) => {
    if (!isSidebarEnabled) {
      requestModeChange("DATASET_COMPOSITE", () => toggleFeature(item));
    } else {
      toggleFeature(item);
    }
  };

  // Accordions open by default: FACE and EYES
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    face: true,
    eyes: true,
    nose: false,
    mouth: false,
    other: false,
  });

  // State for "View All" modal
  const [viewAllSubcategory, setViewAllSubcategory] = useState<SubcategoryGroup | null>(null);
  const [modalSearch, setModalSearch] = useState("");

  // Dataset Filter state
  const [filterSelectedOnly, setFilterSelectedOnly] = useState(false);
  const [activeCategoryFilters, setActiveCategoryFilters] = useState<Record<string, boolean>>({
    face: true,
    eyes: true,
    nose: true,
    mouth: true,
    other: true,
  });
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const toggleCategoryFilter = (catId: string) => {
    setActiveCategoryFilters((prev) => ({
      ...prev,
      [catId]: !prev[catId],
    }));
  };

  const selectAllCategories = () => {
    setActiveCategoryFilters({
      face: true,
      eyes: true,
      nose: true,
      mouth: true,
      other: true,
    });
  };

  const deselectAllCategories = () => {
    setActiveCategoryFilters({
      face: false,
      eyes: false,
      nose: false,
      mouth: false,
      other: false,
    });
  };

  const resetFilters = () => {
    setFilterSelectedOnly(false);
    selectAllCategories();
  };

  const isFilterActive =
    filterSelectedOnly ||
    Object.values(activeCategoryFilters).some((enabled) => !enabled);

  const activeCategoryCount = Object.values(activeCategoryFilters).filter(Boolean).length;

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  // Filter dataset by search query, selected status, and category visibility
  const filteredDataset = useMemo(() => {
    // 1. Filter by category visibility
    const visibleCategories = FACIAL_DATASET.filter(
      (cat) => activeCategoryFilters[cat.id]
    );

    const query = searchQuery.toLowerCase().trim();

    return visibleCategories
      .map((category) => {
        const filteredSub = category.subcategories
          .map((sub) => {
            let items = sub.items;

            // 2. Filter by "selected only"
            if (filterSelectedOnly) {
              items = items.filter((item) => isFeatureSelected(item.id));
            }

            // 3. Filter by search query
            if (query) {
              items = items.filter(
                (item) =>
                  item.name.toLowerCase().includes(query) ||
                  item.description.toLowerCase().includes(query) ||
                  item.token.toLowerCase().includes(query)
              );
            }

            if (items.length > 0) {
              return {
                ...sub,
                items,
              };
            }

            // If searching and subcategory label matches (and not selectedOnly)
            if (!filterSelectedOnly && query && sub.label.toLowerCase().includes(query)) {
              return sub;
            }

            return null;
          })
          .filter(Boolean) as SubcategoryGroup[];

        return {
          ...category,
          subcategories: filteredSub,
        };
      })
      .filter((category) => category.subcategories.length > 0);
  }, [searchQuery, filterSelectedOnly, activeCategoryFilters, isFeatureSelected]);

  // Icons mapping for category headers
  const renderCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "ScanFace":
        return <ScanFace className="size-3.5 text-foreground/80" />;
      case "Eye":
        return <Eye className="size-3.5 text-foreground/80" />;
      case "Activity":
        return <Activity className="size-3.5 text-foreground/80" />;
      case "Smile":
        return <Smile className="size-3.5 text-foreground/80" />;
      case "Sparkles":
        return <Sparkles className="size-3.5 text-foreground/80" />;
      default:
        return <ScanFace className="size-3.5 text-foreground/80" />;
    }
  };

  // Modal filtered items
  const modalFilteredItems = useMemo(() => {
    if (!viewAllSubcategory) return [];
    if (!modalSearch.trim()) return viewAllSubcategory.items;
    const q = modalSearch.toLowerCase().trim();
    return viewAllSubcategory.items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.token.toLowerCase().includes(q)
    );
  }, [viewAllSubcategory, modalSearch]);

  // === COLLAPSED ICON-RAIL VIEW ===
  if (sidebarCollapsed) {
    return (
      <aside className="w-14 shrink-0 h-full rounded-xl border-2 border-border/80 bg-[#0d0d12]/95 backdrop-blur-2xl flex flex-col items-center py-4 justify-between transition-all duration-300 shadow-2xl z-20 select-none">
        <div className="flex flex-col items-center gap-3.5 w-full">
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed(false)}
                  className="size-9 rounded-lg border-2 border-border/80 bg-surface/80 hover:bg-[#665AEF]/20 hover:border-[#665AEF] flex items-center justify-center text-foreground transition-all cursor-pointer shadow-xs"
                />
              }
            >
              <ChevronRight className="size-4 text-[#665AEF]" />
            </TooltipTrigger>
            <TooltipContent side="right">Expand Facial Dataset</TooltipContent>
          </Tooltip>

          <div className="w-7 h-0.5 bg-border/80" />

          {FACIAL_DATASET.map((category) => (
            <Tooltip key={category.id}>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => {
                      setSidebarCollapsed(false);
                      setOpenCategories((prev) => ({ ...prev, [category.id]: true }));
                    }}
                    className="size-9 rounded-lg border-2 border-transparent hover:border-border/80 hover:bg-surface/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  />
                }
              >
                {renderCategoryIcon(category.iconName)}
              </TooltipTrigger>
              <TooltipContent side="right">{category.label}</TooltipContent>
            </Tooltip>
          ))}
        </div>

        <div className="flex flex-col items-center gap-2">
          {selectedCount > 0 && (
            <span className="size-6 rounded-full bg-[#665AEF] text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-[#665AEF]/40">
              {selectedCount}
            </span>
          )}
        </div>
      </aside>
    );
  }

  // === EXPANDED FULL SIDEBAR VIEW ===
  return (
    <>
      <aside className="w-87.5 sm:w-90 lg:w-92.5 shrink-0 h-full rounded-xl border-2 border-border/80 bg-[#0d0d12]/95 backdrop-blur-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 z-20 select-none">
        {/* Top Header */}
        <div className="p-4 pb-3 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-foreground text-sm tracking-tight flex items-center gap-2">
                Facial Dataset
                {selectedCount > 0 && (
                  <Badge
                    variant="outline"
                    className="h-5 px-1.5 text-[10px] font-mono border-2 border-[#665AEF]/40 bg-[#665AEF]/15 text-[#a594fd]"
                  >
                    {selectedCount}
                  </Badge>
                )}
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5 font-normal">
                Build the suspect profile
              </p>
            </div>

            {/* Close / Collapse Sidebar Button */}
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed(true)}
                    className="size-8 rounded-lg border-2 border-border/70 bg-black/40 hover:bg-[#665AEF]/15 hover:border-[#665AEF]/60 flex items-center justify-center text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-xs active:scale-95 group"
                    aria-label="Close sidebar"
                  />
                }
              >
                <PanelLeftClose className="size-4 text-muted-foreground group-hover:text-[#a594fd] transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="left">Collapse Sidebar</TooltipContent>
            </Tooltip>
          </div>

          {/* Search features input with filter button */}
          <div className="flex items-center gap-1.5">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search features..."
                className="h-8.5 pl-8 pr-7 text-xs bg-black/50 border-2 border-border/70 rounded-md placeholder:text-muted-foreground/60 focus-visible:ring-[#665AEF]/50 focus-visible:border-[#665AEF]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            {/* Functional Dataset Filter Popover */}
            <Popover open={filterPopoverOpen} onOpenChange={setFilterPopoverOpen}>
              <PopoverTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className={cn(
                      "relative size-8.5 rounded-md border-2 transition-all cursor-pointer",
                      isFilterActive
                        ? "border-[#665AEF] bg-[#665AEF]/20 text-[#a594fd] shadow-xs shadow-[#665AEF]/30"
                        : "border-border/70 bg-black/50 text-muted-foreground hover:text-foreground hover:border-[#665AEF]/60"
                    )}
                  />
                }
              >
                <SlidersHorizontal className="size-3.5" />
                {isFilterActive && (
                  <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-[#665AEF] ring-2 ring-[#0d0d12]" />
                )}
              </PopoverTrigger>

              <PopoverContent
                align="end"
                side="bottom"
                sideOffset={6}
                className="w-72 p-3 bg-[#111116]/98 backdrop-blur-xl border-2 border-border/80 rounded-xl shadow-2xl space-y-3 z-50 text-foreground"
              >
                {/* Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-1.5">
                    <SlidersHorizontal className="size-3.5 text-[#665AEF]" />
                    <span className="font-heading text-xs font-bold text-foreground">
                      Dataset Filter
                    </span>
                  </div>
                  {isFilterActive && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="flex items-center gap-1 text-[10px] font-medium text-[#665AEF] hover:text-[#8E85FF] transition-colors cursor-pointer"
                    >
                      <RotateCcw className="size-2.5" />
                      Reset
                    </button>
                  )}
                </div>

                {/* Filter by Status: All vs Selected Only */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                    View Mode
                  </span>
                  <div className="grid grid-cols-2 gap-1 p-1 bg-black/40 rounded-lg border-2 border-border/70">
                    <button
                      type="button"
                      onClick={() => setFilterSelectedOnly(false)}
                      className={cn(
                        "py-1 text-xs font-medium rounded-md transition-colors text-center cursor-pointer",
                        !filterSelectedOnly
                          ? "bg-[#665AEF] text-white shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      All Features
                    </button>
                    <button
                      type="button"
                      onClick={() => setFilterSelectedOnly(true)}
                      className={cn(
                        "py-1 text-xs font-medium rounded-md transition-colors text-center flex items-center justify-center gap-1 cursor-pointer",
                        filterSelectedOnly
                          ? "bg-[#665AEF] text-white shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <span>Selected</span>
                      {selectedCount > 0 && (
                        <span
                          className={cn(
                            "px-1.5 py-0.2 rounded-full text-[9px] font-mono",
                            filterSelectedOnly
                              ? "bg-white/20 text-white"
                              : "bg-[#665AEF]/30 text-[#a594fd]"
                          )}
                        >
                          {selectedCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>

                {/* Filter by Category */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                      Categories ({activeCategoryCount}/5)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={selectAllCategories}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        All
                      </button>
                      <span className="text-muted-foreground/40 text-[10px]">|</span>
                      <button
                        type="button"
                        onClick={deselectAllCategories}
                        className="text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      >
                        None
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 pt-0.5">
                    {FACIAL_DATASET.map((category) => {
                      const isChecked = !!activeCategoryFilters[category.id];
                      const count = category.subcategories.reduce(
                        (acc, sub) => acc + sub.items.length,
                        0
                      );

                      return (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => toggleCategoryFilter(category.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border-2 text-xs transition-colors cursor-pointer",
                            isChecked
                              ? "border-[#665AEF] bg-[#665AEF]/12 text-foreground"
                              : "border-border/60 bg-black/20 text-muted-foreground hover:border-border hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            {renderCategoryIcon(category.iconName)}
                            <span className="text-[11px] font-medium font-heading">
                              {category.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-muted-foreground">
                              {count}
                            </span>
                            <div
                              className={cn(
                                "size-4 rounded-lg border-2 flex items-center justify-center transition-colors",
                                isChecked
                                  ? "bg-[#665AEF] border-[#665AEF] text-white"
                                  : "border-border/80 bg-surface/50"
                              )}
                            >
                              {isChecked && <Check className="size-2.5 stroke-3" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Active Filter Chips Banner */}
          {isFilterActive && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] text-muted-foreground">Filters:</span>
              {filterSelectedOnly && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#665AEF]/20 text-[#c2b5fd] border-2 border-[#665AEF]/50">
                  Selected only
                  <button
                    type="button"
                    onClick={() => setFilterSelectedOnly(false)}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              )}
              {activeCategoryCount < 5 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface/80 text-foreground border-2 border-border/70">
                  {activeCategoryCount} of 5 Categories
                  <button
                    type="button"
                    onClick={selectAllCategories}
                    className="hover:text-white cursor-pointer ml-0.5"
                  >
                    <X className="size-2.5" />
                  </button>
                </span>
              )}
              <button
                type="button"
                onClick={resetFilters}
                className="text-[10px] text-[#665AEF] hover:text-[#8E85FF] underline underline-offset-2 ml-auto cursor-pointer"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Prompt Mode Active Warning Banner */}
        {!isSidebarEnabled && (
          <div className="mx-3.5 mb-2.5 p-2.5 rounded-lg border-2 border-[#665AEF]/40 bg-[#665AEF]/10 flex flex-col gap-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#a594fd]">
                <Lock className="size-3.5" />
                <span>Prompt Mode Active</span>
              </div>
              <Badge
                variant="outline"
                className="h-4.5 px-1.5 text-[9px] font-mono border-[#665AEF]/50 text-[#c2b5fd] bg-[#665AEF]/20 uppercase"
              >
                Read-Only
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Feature selection is locked while generating from witness prompt.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => requestModeChange("DATASET_COMPOSITE")}
              className="mt-0.5 h-6.5 text-[11px] font-medium border-[#665AEF]/50 text-[#a594fd] hover:bg-[#665AEF]/20 hover:text-white cursor-pointer w-full flex items-center justify-center gap-1.5 rounded-md"
            >
              <ArrowLeftRight className="size-3" />
              <span>Switch to Dataset Mode</span>
            </Button>
          </div>
        )}

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 pb-2 space-y-3 custom-scrollbar">
          {filteredDataset.length === 0 ? (
            <div className="p-8 text-center space-y-2.5">
              <p className="text-xs text-muted-foreground">
                {filterSelectedOnly
                  ? "No suspect features selected yet."
                  : searchQuery.trim()
                  ? `No features match "${searchQuery}"`
                  : "No categories match the active filters."}
              </p>
              {filterSelectedOnly ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFilterSelectedOnly(false)}
                  className="h-7 text-[11px] border-border/80 hover:border-[#665AEF] cursor-pointer"
                >
                  View All Features
                </Button>
              ) : isFilterActive ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="h-7 text-[11px] border-border/80 hover:border-[#665AEF] cursor-pointer"
                >
                  Reset Filters
                </Button>
              ) : null}
            </div>
          ) : (
            filteredDataset.map((category) => {
              const isOpen =
                !!openCategories[category.id] ||
                !!searchQuery.trim() ||
                filterSelectedOnly;

              return (
                <div
                  key={category.id}
                  className="rounded-md border-2 border-border/70 bg-[#121217]/50 overflow-hidden transition-colors"
                >
                  {/* Category Header */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold tracking-wider text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {renderCategoryIcon(category.iconName)}
                      <span className="font-heading text-[11px] font-bold uppercase tracking-wider text-foreground">
                        {category.label}
                      </span>
                    </div>

                    <ChevronDown
                      className={cn(
                        "size-3.5 text-muted-foreground transition-transform duration-200",
                        isOpen && "rotate-180 text-foreground"
                      )}
                    />
                  </button>

                  {/* Subcategories */}
                  {isOpen && (
                    <div className="p-3 pt-1.5 space-y-3 border-t-2 border-border/50">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="space-y-1.5">
                          {/* Subcategory Label + View all link */}
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-medium text-foreground/90">
                              {subcategory.label}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setViewAllSubcategory(subcategory);
                                setModalSearch("");
                              }}
                              className="text-[10px] font-medium text-[#665AEF] hover:text-[#8E85FF] transition-colors cursor-pointer"
                            >
                              View all
                            </button>
                          </div>

                          {/* Horizontal feature cards row: 6 cards fit cleanly */}
                          <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 px-1 no-scrollbar scroll-smooth">
                            {subcategory.items.map((item) => {
                              const isSelected = isFeatureSelected(item.id);

                              return (
                                <Tooltip key={item.id}>
                                  <TooltipTrigger
                                    render={
                                      <button
                                        type="button"
                                        onClick={() => handleFeatureClick(item)}
                                        className={cn(
                                          "group relative shrink-0 size-11 sm:size-11.5 rounded-md border-2 transition-all duration-150 flex flex-col items-center justify-center p-0.5 cursor-pointer select-none",
                                          isSelected
                                            ? "border-[#665AEF] ring-2 ring-[#665AEF]/60 shadow-md shadow-[#665AEF]/30 scale-[1.04]"
                                            : "border-border/70 bg-[#16161f] hover:border-[#665AEF]/50 hover:scale-[1.02]"
                                        )}
                                      />
                                    }
                                  >
                                    {/* Selection badge */}
                                    {isSelected && (
                                      <span className="absolute -top-1 -right-1 size-4 rounded-full bg-[#665AEF] text-white flex items-center justify-center shadow-md ring-2 ring-[#0d0d12] z-20">
                                        <Check className="size-2.5 stroke-3" />
                                      </span>
                                    )}

                                    {/* Evidence Card thumbnail */}
                                    <div className="relative size-full flex items-center justify-center overflow-hidden rounded-sm bg-[#FAFAFA] border border-[#E5E7EB] shadow-2xs">
                                      <FacialFeatureIcon
                                        svgType={item.svgType}
                                        className="size-full"
                                      />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="top" sideOffset={6} className="px-2 py-0.5 text-[11px] font-medium bg-[#191924] text-white border border-border/80 rounded-md shadow-lg">
                                    {item.name}
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Footer: Collapse Sidebar */}
        <div className="p-2.5 border-t-2 border-border/60 bg-surface/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(true)}
            className="w-full h-8.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 border-2 border-border/50 hover:border-border flex items-center justify-center gap-1.5 cursor-pointer rounded-md"
          >
            <ChevronLeft className="size-3.5" />
            <span>Collapse Sidebar</span>
          </Button>
        </div>
      </aside>

      {/* "View All" Modal / Dialog for Subcategory */}
      <Dialog
        open={!!viewAllSubcategory}
        onOpenChange={(open) => !open && setViewAllSubcategory(null)}
      >
        <DialogContent className="sm:max-w-2xl bg-[#0e0e13]/95 backdrop-blur-2xl border-2 border-border p-5 rounded-xl shadow-2xl">
          <DialogHeader className="pb-3 border-b-2 border-border/80">
            <div className="flex items-center justify-between pr-6">
              <div>
                <DialogTitle className="font-heading text-base font-bold text-foreground">
                  {viewAllSubcategory?.label} Library
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Explore and select from verified forensic dataset references
                </DialogDescription>
              </div>
            </div>

            {/* Filter in Modal */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder={`Search ${viewAllSubcategory?.label.toLowerCase()} variants...`}
                className="h-8.5 pl-8 text-xs bg-black/40 border-2 border-border/70 rounded-md"
              />
            </div>
          </DialogHeader>

          {/* Grid of items in modal */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 py-3 max-h-[55vh] overflow-y-auto custom-scrollbar pr-1">
            {modalFilteredItems.map((item) => {
              const isSelected = isFeatureSelected(item.id);

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFeatureClick(item)}
                  className={cn(
                    "relative text-left p-3 rounded-xl border-2 transition-all duration-200 flex flex-col gap-2.5 cursor-pointer group select-none",
                    isSelected
                      ? "border-[#665AEF] bg-linear-to-b from-[#665AEF]/15 via-[#665AEF]/8 to-transparent ring-2 ring-[#665AEF]/50 shadow-xl shadow-[#665AEF]/20"
                      : "border-border/70 bg-[#14141c] hover:bg-[#191924] hover:border-border/90 hover:scale-[1.01]"
                  )}
                >
                  {/* Forensic Specimen Stage / Viewport */}
                  <div className={cn(
                    "relative w-full aspect-4/3 rounded-lg border transition-all duration-200 flex items-center justify-center p-2.5 overflow-hidden",
                    isSelected
                      ? "bg-[#0b0a14] border-[#665AEF]/40 shadow-inner"
                      : "bg-[#0a0a0f] border-border/60 group-hover:border-border/90"
                  )}>
                    {/* The 1:1 Clinical Forensic Evidence Tile */}
                    <div className="size-22 sm:size-24 rounded-md overflow-hidden bg-[#FAFAFA] border border-[#E5E7EB] shadow-md shadow-black/60 flex items-center justify-center shrink-0 group-hover:scale-[1.02] transition-transform">
                      <FacialFeatureIcon
                        svgType={item.svgType}
                        className="size-full"
                      />
                    </div>

                    {/* Selection Indicator: Pinned safely in the top-right corner of specimen stage, NEVER clipped */}
                    {isSelected ? (
                      <span className="absolute top-2.5 right-2.5 z-10 size-5.5 rounded-full bg-[#665AEF] text-white flex items-center justify-center shadow-lg ring-2 ring-[#0b0a14] animate-in zoom-in-75 duration-150">
                        <Check className="size-3 stroke-3" />
                      </span>
                    ) : (
                      <span className="absolute top-2.5 right-2.5 z-10 size-5.5 rounded-full border border-white/20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white/70">
                        <Check className="size-2.5 opacity-40" />
                      </span>
                    )}
                  </div>

                  {/* Card Details */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={cn(
                        "font-heading font-bold text-xs transition-colors truncate",
                        isSelected ? "text-white" : "text-foreground"
                      )}>
                        {item.name}
                      </span>
                      <span className={cn(
                        "text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded transition-colors shrink-0",
                        isSelected
                          ? "bg-[#665AEF]/25 text-[#c2b5fd] border border-[#665AEF]/40 font-semibold"
                          : "bg-surface/80 text-muted-foreground/80 border border-border/50"
                      )}>
                        {item.subcategory.replace("_", " ")}
                      </span>
                    </div>
                    <p className={cn(
                      "text-[11px] leading-snug line-clamp-2 transition-colors",
                      isSelected ? "text-muted-foreground/90 font-normal" : "text-muted-foreground/70"
                    )}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
