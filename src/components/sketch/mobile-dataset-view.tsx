"use client";

import React, { useState, useMemo } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useSketch, FeatureItem } from "./sketch-context";
import { FACIAL_DATASET, SubcategoryGroup } from "./facial-dataset-data";
import { FacialFeatureIcon } from "./facial-feature-icon";

export function MobileDatasetView() {
  const {
    selectedFeatures,
    toggleFeature,
    isFeatureSelected,
    selectedCount,
    searchQuery,
    setSearchQuery,
    generationMode,
    isSidebarEnabled,
    requestModeChange,
    gender,
    setGender,
  } = useSketch();

  const handleFeatureClick = (item: FeatureItem) => {
    if (!isSidebarEnabled) {
      requestModeChange("DATASET_COMPOSITE", () => toggleFeature(item));
    } else {
      toggleFeature(item);
    }
  };

  // Gender Switcher filter: "all" | "male" | "female"
  const [genderFilter, setGenderFilter] = useState<"all" | "male" | "female">("all");

  // Calculate total counts per gender
  const { allCount, maleCount, femaleCount } = useMemo(() => {
    let all = 0;
    let male = 0;
    let female = 0;
    for (const cat of FACIAL_DATASET) {
      for (const sub of cat.subcategories) {
        for (const item of sub.items) {
          all++;
          if (!item.gender || item.gender === "all" || item.gender === "male") male++;
          if (!item.gender || item.gender === "all" || item.gender === "female") female++;
        }
      }
    }
    return { allCount: all, maleCount: male, femaleCount: female };
  }, []);

  const handleGenderSwitch = (target: "all" | "male" | "female") => {
    setGenderFilter(target);
    if (target === "male") setGender("Male");
    if (target === "female") setGender("Female");
  };

  const genderTabs = useMemo(
    () => [
      { id: "all" as const, label: "All", count: allCount },
      { id: "male" as const, label: "♂ Male", count: maleCount },
      { id: "female" as const, label: "♀ Female", count: femaleCount },
    ],
    [allCount, maleCount, femaleCount]
  );

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    face: true,
    eyes: true,
    nose: false,
    mouth: false,
    other: false,
  });

  const [viewAllSubcategory, setViewAllSubcategory] = useState<SubcategoryGroup | null>(null);
  const [modalSearch, setModalSearch] = useState("");
  const [filterSelectedOnly, setFilterSelectedOnly] = useState(false);

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const filteredDataset = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return FACIAL_DATASET.map((category) => {
      const filteredSub = category.subcategories
        .map((sub) => {
          // When female filter is selected, omit facial hair (beard/moustache)
          if (genderFilter === "female" && (sub.id === "beard" || sub.id === "moustache")) {
            return null;
          }

          let items = sub.items;

          // Filter by gender
          if (genderFilter !== "all") {
            items = items.filter(
              (item) => !item.gender || item.gender === "all" || item.gender === genderFilter
            );
          }

          if (filterSelectedOnly) {
            items = items.filter((item) => isFeatureSelected(item.id));
          }
          if (query) {
            items = items.filter(
              (item) =>
                item.name.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query) ||
                item.token.toLowerCase().includes(query)
            );
          }
          if (items.length > 0) return { ...sub, items };
          if (!filterSelectedOnly && query && sub.label.toLowerCase().includes(query)) return sub;
          return null;
        })
        .filter(Boolean) as SubcategoryGroup[];
      return { ...category, subcategories: filteredSub };
    }).filter((category) => category.subcategories.length > 0);
  }, [searchQuery, filterSelectedOnly, isFeatureSelected, genderFilter]);

  const modalFilteredItems = useMemo(() => {
    if (!viewAllSubcategory) return [];
    let items = viewAllSubcategory.items;
    if (genderFilter !== "all") {
      items = items.filter(
        (item) => !item.gender || item.gender === "all" || item.gender === genderFilter
      );
    }
    if (!modalSearch.trim()) return items;
    const q = modalSearch.toLowerCase().trim();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.token.toLowerCase().includes(q)
    );
  }, [viewAllSubcategory, modalSearch, genderFilter]);

  const renderCategoryIcon = (iconName: string) => {
    const iconClass = "size-4 text-foreground/80";
    switch (iconName) {
      case "ScanFace": return <ScanFace className={iconClass} />;
      case "Eye": return <Eye className={iconClass} />;
      case "Activity": return <Activity className={iconClass} />;
      case "Smile": return <Smile className={iconClass} />;
      case "Sparkles": return <Sparkles className={iconClass} />;
      default: return <ScanFace className={iconClass} />;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Top Header Bar */}
      <div className="px-3 pt-3 pb-2 space-y-2 shrink-0 bg-[#070709]">
        {/* Title Row */}
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

          {/* Filter Toggle */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterSelectedOnly(!filterSelectedOnly)}
              className={cn(
                "h-8 px-2.5 rounded-lg border-2 text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5",
                filterSelectedOnly
                  ? "border-[#665AEF] bg-[#665AEF]/20 text-[#a594fd]"
                  : "border-border/60 bg-black/40 text-muted-foreground"
              )}
            >
              <SlidersHorizontal className="size-3" />
              {filterSelectedOnly ? "Selected" : "All"}
            </button>
          </div>
        </div>

        {/* Gender Segmented Switcher for Mobile */}
        <div className="relative grid grid-cols-3 gap-1 p-0.5 bg-black/50 rounded-lg border-2 border-border/70">
          {genderTabs.map((tab) => {
            const isActive = genderFilter === tab.id;
            return (
              <motion.button
                key={tab.id}
                type="button"
                onClick={() => handleGenderSwitch(tab.id)}
                whileTap={{ scale: 0.94 }}
                className={cn(
                  "relative py-1.5 px-2 rounded-md text-xs font-medium select-none z-10 flex items-center justify-center gap-1.5 cursor-pointer transition-colors duration-200",
                  isActive
                    ? "text-white font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobile_dataset_gender_filter_pill"
                    className="absolute inset-0 rounded-md bg-[#665AEF] shadow-md shadow-[#665AEF]/35 border-2 border-[#8579ff]/50 -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 24,
                      mass: 0.7,
                    }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span
                  className={cn(
                    "relative z-10 px-1 py-0.2 rounded-full text-[9px] font-mono transition-colors duration-200",
                    isActive
                      ? "bg-white/20 text-white font-bold"
                      : "bg-surface/80 text-muted-foreground"
                  )}
                >
                  {tab.count}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Search Bar — larger touch target */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              genderFilter === "female"
                ? "Search female features..."
                : genderFilter === "male"
                ? "Search male features..."
                : "Search facial features..."
            }
            className="h-10 pl-10 pr-9 text-sm bg-black/50 border-2 border-border/70 rounded-lg placeholder:text-muted-foreground/60 focus-visible:ring-[#665AEF]/50 focus-visible:border-[#665AEF]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Prompt Mode Warning Banner */}
      {!isSidebarEnabled && (
        <div className="mx-3 mb-2 p-3 rounded-lg border-2 border-[#665AEF]/40 bg-[#665AEF]/10 flex flex-col gap-2 shadow-sm shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#a594fd]">
              <Lock className="size-3.5" />
              <span>Prompt Mode Active</span>
            </div>
            <Badge
              variant="outline"
              className="h-5 px-1.5 text-[9px] font-mono border-[#665AEF]/50 text-[#c2b5fd] bg-[#665AEF]/20 uppercase"
            >
              Read-Only
            </Badge>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => requestModeChange("DATASET_COMPOSITE")}
            className="h-8 text-[11px] font-medium border-[#665AEF]/50 text-[#a594fd] hover:bg-[#665AEF]/20 hover:text-white cursor-pointer w-full flex items-center justify-center gap-1.5 rounded-md"
          >
            <ArrowLeftRight className="size-3" />
            <span>Switch to Dataset Mode</span>
          </Button>
        </div>
      )}

      {/* Scrollable Feature Categories */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 space-y-2.5 overscroll-contain touch-pan-y">
        {filteredDataset.length === 0 ? (
          <div className="p-10 text-center space-y-2.5">
            <p className="text-xs text-muted-foreground">
              {filterSelectedOnly
                ? "No suspect features selected yet."
                : searchQuery.trim()
                ? `No features match "${searchQuery}"`
                : "No categories match the active filters."}
            </p>
            {filterSelectedOnly && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilterSelectedOnly(false)}
                className="h-8 text-[11px] border-border/80 hover:border-[#665AEF] cursor-pointer"
              >
                View All Features
              </Button>
            )}
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
                className="rounded-lg border-2 border-border/70 bg-[#121217]/50 overflow-hidden"
              >
                {/* Category Header — larger tap area */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between px-3.5 py-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    {renderCategoryIcon(category.iconName)}
                    <span className="font-heading text-xs font-bold uppercase tracking-wider text-foreground">
                      {category.label}
                    </span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-foreground"
                    )}
                  />
                </button>

                {/* Subcategories */}
                {isOpen && (
                  <div className="p-3 pt-2 space-y-3 border-t-2 border-border/50">
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="space-y-2">
                        {/* Subcategory Label */}
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
                            className="text-[11px] font-medium text-[#665AEF] hover:text-[#8E85FF] transition-colors cursor-pointer px-2 py-1 -mr-2"
                          >
                            View all
                          </button>
                        </div>

                        {/* Feature grid — 3 columns for mobile, larger touch targets */}
                        <div className="grid grid-cols-5 gap-2 py-0.5">
                          {subcategory.items.slice(0, 10).map((item) => {
                            const isSelected = isFeatureSelected(item.id);
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleFeatureClick(item)}
                                className={cn(
                                  "group relative aspect-square rounded-lg border-2 transition-all duration-150 flex flex-col items-center justify-center p-0.5 cursor-pointer select-none active:scale-95",
                                  isSelected
                                    ? "border-[#665AEF] ring-2 ring-[#665AEF]/60 shadow-md shadow-[#665AEF]/30"
                                    : "border-border/70 bg-[#16161f] active:border-[#665AEF]/50"
                                )}
                              >
                                {isSelected && (
                                  <span className="absolute -top-1.5 -right-1.5 size-4.5 rounded-full bg-[#665AEF] text-white flex items-center justify-center shadow-md ring-2 ring-[#0d0d12] z-20">
                                    <Check className="size-2.5 stroke-3" />
                                  </span>
                                )}

                                {/* Gender indicator badge */}
                                {item.gender && item.gender !== "all" && (
                                  <span
                                    className={cn(
                                      "absolute bottom-0.5 right-0.5 z-10 px-0.8 py-0.2 rounded text-[7px] font-mono leading-none border shadow-xs pointer-events-none",
                                      item.gender === "female"
                                        ? "bg-rose-950/90 text-rose-300 border-rose-500/50"
                                        : "bg-sky-950/90 text-sky-300 border-sky-500/50"
                                    )}
                                  >
                                    {item.gender === "female" ? "♀" : "♂"}
                                  </span>
                                )}

                                <div className="relative size-full flex items-center justify-center overflow-hidden rounded bg-[#FAFAFA] border border-[#E5E7EB] shadow-2xs">
                                  <FacialFeatureIcon
                                    svgType={item.svgType}
                                    className="size-full"
                                  />
                                </div>
                              </button>
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

      {/* View All Modal — Full-Screen on mobile */}
      <Dialog
        open={!!viewAllSubcategory}
        onOpenChange={(open) => !open && setViewAllSubcategory(null)}
      >
        <DialogContent className="max-h-dvh w-full h-full sm:max-w-2xl sm:h-auto rounded-none sm:rounded-xl bg-[#0e0e13]/98 backdrop-blur-2xl border-0 sm:border-2 sm:border-border p-4 sm:p-5 shadow-2xl">
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

            {/* Filter in Modal: Gender Switcher + Search */}
            <div className="flex flex-col gap-2 mt-3">
              <div className="relative grid grid-cols-3 gap-1 p-0.5 bg-black/40 rounded-lg border-2 border-border/70 shrink-0">
                {genderTabs.map((tab) => {
                  const isActive = genderFilter === tab.id;
                  return (
                    <motion.button
                      key={tab.id}
                      type="button"
                      onClick={() => handleGenderSwitch(tab.id)}
                      whileTap={{ scale: 0.94 }}
                      className={cn(
                        "relative py-1 px-2 rounded-md text-xs font-medium select-none z-10 transition-colors duration-200 cursor-pointer text-center flex items-center justify-center",
                        isActive
                          ? "text-white font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="mobile_modal_gender_filter_pill"
                          className="absolute inset-0 rounded-md bg-[#665AEF] shadow-sm shadow-[#665AEF]/35 border border-[#8579ff]/50 -z-10"
                          transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 24,
                            mass: 0.7,
                          }}
                        />
                      )}
                      <span className="relative z-10">{tab.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  value={modalSearch}
                  onChange={(e) => setModalSearch(e.target.value)}
                  placeholder={`Search ${viewAllSubcategory?.label.toLowerCase()} variants...`}
                  className="h-10 pl-10 text-sm bg-black/40 border-2 border-border/70 rounded-lg"
                />
              </div>
            </div>
          </DialogHeader>

          {/* Grid of items */}
          <div className="grid grid-cols-2 gap-3 py-3 flex-1 overflow-y-auto overscroll-contain pr-1">
            {modalFilteredItems.map((item) => {
              const isSelected = isFeatureSelected(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleFeatureClick(item)}
                  className={cn(
                    "relative text-left p-3 rounded-xl border-2 transition-all duration-200 flex flex-col gap-2.5 cursor-pointer group select-none active:scale-[0.97]",
                    isSelected
                      ? "border-[#665AEF] bg-linear-to-b from-[#665AEF]/15 via-[#665AEF]/8 to-transparent ring-2 ring-[#665AEF]/50 shadow-xl shadow-[#665AEF]/20"
                      : "border-border/70 bg-[#14141c] active:bg-[#191924]"
                  )}
                >
                  <div className={cn(
                    "relative w-full aspect-4/3 rounded-lg border transition-all duration-200 flex items-center justify-center p-2.5 overflow-hidden",
                    isSelected
                      ? "bg-[#0b0a14] border-[#665AEF]/40 shadow-inner"
                      : "bg-[#0a0a0f] border-border/60"
                  )}>
                    <div className="size-20 rounded-md overflow-hidden bg-[#FAFAFA] border border-[#E5E7EB] shadow-md shadow-black/60 flex items-center justify-center shrink-0">
                      <FacialFeatureIcon
                        svgType={item.svgType}
                        className="size-full"
                      />
                    </div>
                    {isSelected ? (
                      <span className="absolute top-2 right-2 z-10 size-6 rounded-full bg-[#665AEF] text-white flex items-center justify-center shadow-lg ring-2 ring-[#0b0a14]">
                        <Check className="size-3 stroke-3" />
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 z-10 size-6 rounded-full border border-white/20 bg-black/40 opacity-0 group-active:opacity-100 transition-opacity flex items-center justify-center text-white/70">
                        <Check className="size-3 opacity-40" />
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className={cn(
                        "font-heading font-bold text-xs transition-colors truncate",
                        isSelected ? "text-white" : "text-foreground"
                      )}>
                        {item.name}
                      </span>
                      {item.gender && item.gender !== "all" && (
                        <span className={cn(
                          "text-[9px] font-mono px-1.5 py-0.5 rounded border transition-colors shrink-0",
                          item.gender === "female"
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/30"
                            : "bg-sky-500/15 text-sky-300 border-sky-500/30"
                        )}>
                          {item.gender === "female" ? "♀" : "♂"}
                        </span>
                      )}
                    </div>
                    <p className={cn(
                      "text-[11px] leading-snug line-clamp-2 transition-colors",
                      isSelected ? "text-muted-foreground/90" : "text-muted-foreground/70"
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
    </div>
  );
}
