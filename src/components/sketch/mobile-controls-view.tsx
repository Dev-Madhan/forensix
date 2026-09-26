"use client";

import React, { useState } from "react";
import {
  Loader2,
  Trash2,
  PenLine,
  ChevronDown,
  Check,
  User,
  Globe,
  Lock,
  Inbox,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSketch, DetailLevel } from "./sketch-context";
import { AnimatedButton } from "@/components/ui/animated-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FacialFeatureIcon } from "./facial-feature-icon";
import { cn } from "@/lib/utils";

const SKETCH_STYLES = [
  "Forensic Graphite (Pencil)",
  "Monochrome Inversion (Black Background)",
  "Realistic Charcoal",
  "Digital Identi-Kit (Lineart)",
  "Color Age-Progressed",
];

const AGE_OPTIONS = ["18-25", "26-35", "36-50", "50+"];
const GENDER_OPTIONS = ["Male", "Female"];
const ETHNICITY_OPTIONS = [
  "General / Neutral",
  "Caucasian / European",
  "East Asian",
  "South Asian",
  "Hispanic / Latino",
  "Middle Eastern",
  "African / Black",
];

export function MobileControlsView() {
  const {
    sketchStyle,
    setSketchStyle,
    ageGroup,
    setAgeGroup,
    gender,
    setGender,
    ethnicity,
    setEthnicity,
    detailLevel,
    setDetailLevel,
    isGenerating,
    generateSketch,
    clearAllFeatures,
    promptText,
    setPromptText,
    selectedCount,
    selectedFeatures,
    generationMode,
    isDemographicsEnabled,
    generatedImageUrl,
    removeFeature,
  } = useSketch();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
  const [isEthnicityOpen, setIsEthnicityOpen] = useState(false);

  const detailOptions: { value: DetailLevel; label: string }[] = [
    { value: "Draft", label: "Draft (Fast)" },
    { value: "Standard", label: "Standard" },
    { value: "Master", label: "High Detail" },
  ];
  const featureList = Object.values(selectedFeatures);

  const isPromptMode =
    generationMode === "PROMPT_GENERATION" ||
    (generationMode === "IDLE" && promptText.trim().length > 0);
  const isPromptFinished = promptText.trim().length > 0;

  const selectedFeatureList = Object.values(selectedFeatures || {});
  const hasFace = selectedFeatureList.some((f) => f.category === "face");
  const hasEyes = selectedFeatureList.some((f) => f.category === "eyes");
  const hasNose = selectedFeatureList.some((f) => f.category === "nose");
  const hasMouth = selectedFeatureList.some((f) => f.category === "mouth");
  const allFacialDatasetsFinished =
    (hasFace && hasEyes && hasNose && hasMouth) || selectedCount >= 4;

  const generalControlsFinished = Boolean(
    sketchStyle && gender && ageGroup && ethnicity && detailLevel
  );

  const isAnimationActive = Boolean(
    !isGenerating &&
      (generatedImageUrl ||
        (isPromptMode
          ? isPromptFinished
          : allFacialDatasetsFinished && generalControlsFinished))
  );

  const canClickGenerate = Boolean(
    generatedImageUrl ||
      (isPromptMode ? isPromptFinished : selectedCount > 0)
  );

  return (
    <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden overscroll-contain">
      <div className="p-3 space-y-4">
        {/* ── Selected Features Section ── */}
        <div className="rounded-xl border-2 border-border/80 bg-[#0d0d12]/90 backdrop-blur-2xl p-3.5 shadow-xl">
          <div className="flex items-center justify-between pb-2.5">
            <h3 className="font-heading text-sm font-semibold text-foreground tracking-tight select-none">
              Selected Features
            </h3>
            <Badge
              variant="outline"
              className="text-xs font-mono px-2 py-0.5 rounded-md border-2 border-border/70 bg-black/40 text-muted-foreground min-w-6 text-center"
            >
              {selectedCount}
            </Badge>
          </div>

          {selectedCount === 0 ? (
            <div className="border border-dashed border-border/60 rounded-lg p-5 flex flex-col items-center justify-center text-center select-none bg-black/20">
              <div className="size-12 rounded-lg flex items-center justify-center text-muted-foreground/50 mb-2">
                <Inbox className="size-8 stroke-[1.5]" />
              </div>
              <p className="text-xs font-semibold text-foreground/90">No features selected</p>
              <p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed max-w-55">
                Select features from the Dataset tab to build the suspect profile.
              </p>
            </div>
          ) : (
            /* Horizontal chip scroll for mobile */
            <div className="flex flex-wrap gap-2">
              {featureList.map((feat) => (
                <div
                  key={feat.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border-2 border-border/70 bg-black/40 transition-colors group"
                >
                  <div className="size-7 rounded-md bg-[#0a0a0f] border border-border/70 p-0.5 flex items-center justify-center shrink-0">
                    <FacialFeatureIcon svgType={feat.svgType} className="size-full text-foreground/90" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate max-w-24">{feat.name}</p>
                    <p className="text-[9px] text-muted-foreground capitalize">{feat.subcategoryLabel || feat.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(feat.subcategory)}
                    className="size-7 flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-md cursor-pointer shrink-0 active:scale-90 transition-all"
                    aria-label={`Remove ${feat.name}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Generation Controls Section ── */}
        <div className="rounded-xl border-2 border-border/80 bg-[#0d0d12]/90 backdrop-blur-2xl p-3.5 shadow-xl space-y-4">
          <h3 className="font-heading text-sm font-semibold text-foreground tracking-tight select-none">
            Generation Controls
          </h3>

          {/* Sketch Style Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted-foreground/80 font-medium select-none flex items-center gap-1.5">
              <PenLine className="size-3 text-[#665AEF]" />
              <span>Forensic Sketch Style</span>
            </label>
            <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
              <DropdownMenuTrigger
                className={`w-full h-10 px-3 border-2 rounded-lg flex items-center justify-between text-xs text-foreground cursor-pointer outline-none transition-all select-none ${
                  isDropdownOpen
                    ? "border-[#665AEF] bg-black/60 shadow-xs shadow-[#665AEF]/30"
                    : "border-border/70 bg-black/40 hover:border-[#665AEF]/50"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="truncate font-medium">{sketchStyle}</span>
                </div>
                <ChevronDown
                  className={`size-4 text-muted-foreground shrink-0 transition-transform duration-300 ${
                    isDropdownOpen ? "rotate-180 text-[#665AEF]" : ""
                  }`}
                />
              </DropdownMenuTrigger>
              <AnimatePresence>
                {isDropdownOpen && (
                  <DropdownMenuContent
                    align="start"
                    sideOffset={6}
                    className="w-(--anchor-width) min-w-60 p-1.5 rounded-xl shadow-2xl bg-[#0e0e14]/95 backdrop-blur-2xl border-2 border-border/80 text-foreground overflow-hidden z-50"
                  >
                    <DropdownMenuGroup
                      className="space-y-0.5"
                      onPointerLeave={() => setHoveredStyle(null)}
                    >
                      {SKETCH_STYLES.map((style) => {
                        const isSelected = sketchStyle === style;
                        const isHighlighted = hoveredStyle ? hoveredStyle === style : isSelected;
                        return (
                          <DropdownMenuItem
                            key={style}
                            onPointerEnter={() => setHoveredStyle(style)}
                            onClick={() => {
                              setSketchStyle(style);
                              setIsDropdownOpen(false);
                            }}
                            className="relative z-0 flex items-center justify-between cursor-pointer px-3 py-2.5 rounded-lg text-xs font-medium transition-colors bg-transparent! outline-none select-none"
                          >
                            {isHighlighted && (
                              <motion.div
                                layoutId="mobile_sketch_style_hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-[#665AEF]/20 border-2 border-[#665AEF]/60"
                                transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
                              />
                            )}
                            <span className={isSelected ? "text-[#c2b5fd] font-semibold" : "text-foreground"}>
                              {style}
                            </span>
                            {isSelected && <Check className="size-4 text-[#665AEF] stroke-[2.5] shrink-0" />}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                )}
              </AnimatePresence>
            </DropdownMenu>
          </div>

          {/* Suspect Demographics */}
          <div className={`flex flex-col gap-2 transition-opacity duration-200 ${!isDemographicsEnabled ? "opacity-50" : ""}`}>
            <label className="text-[11px] text-muted-foreground/80 font-medium select-none flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <User className="size-3 text-[#665AEF]" />
                <span>Suspect Demographics</span>
              </span>
              {!isDemographicsEnabled && (
                <span className="flex items-center gap-1 text-[10px] text-[#a594fd] font-medium">
                  <Lock className="size-2.5" /> Prompt-Inferred
                </span>
              )}
            </label>

            {/* Gender — larger buttons for mobile */}
            <div className={`grid grid-cols-2 gap-1.5 p-1 rounded-lg border border-border/60 bg-black/30 ${!isDemographicsEnabled ? "pointer-events-none" : ""}`}>
              {GENDER_OPTIONS.map((g) => {
                const isSel = gender === g;
                return (
                  <button
                    key={g}
                    type="button"
                    disabled={!isDemographicsEnabled}
                    onClick={() => setGender(g)}
                    className={`h-9 rounded-lg text-xs font-medium transition-all select-none cursor-pointer active:scale-95 ${
                      isSel
                        ? "bg-[#665AEF]/40 text-white font-semibold border-2 border-[#8579ff]/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            {/* Age group — larger buttons */}
            <div className={`grid grid-cols-4 gap-1.5 p-1 rounded-lg border border-border/60 bg-black/30 ${!isDemographicsEnabled ? "pointer-events-none" : ""}`}>
              {AGE_OPTIONS.map((ag) => {
                const isSel = ageGroup === ag;
                return (
                  <button
                    key={ag}
                    type="button"
                    disabled={!isDemographicsEnabled}
                    onClick={() => setAgeGroup(ag)}
                    className={`h-9 rounded-lg text-[11px] font-medium transition-all select-none cursor-pointer active:scale-95 ${
                      isSel
                        ? "bg-[#665AEF]/40 text-white font-semibold border-2 border-[#8579ff]/70"
                        : "text-muted-foreground"
                    }`}
                  >
                    {ag}
                  </button>
                );
              })}
            </div>

            {/* Ethnicity */}
            <div className={`flex flex-col gap-1.5 ${!isDemographicsEnabled ? "pointer-events-none" : ""}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground/80 font-medium flex items-center gap-1">
                  <Globe className="size-2.5 text-[#665AEF]" />
                  <span>Demographic Heritage</span>
                </span>
                <span className="text-[9.5px] text-[#c2b5fd] font-medium truncate max-w-32">{ethnicity}</span>
              </div>
              <DropdownMenu open={isDemographicsEnabled && isEthnicityOpen} onOpenChange={setIsEthnicityOpen}>
                <DropdownMenuTrigger
                  disabled={!isDemographicsEnabled}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border/60 bg-black/40 text-xs font-medium text-foreground cursor-pointer select-none outline-none disabled:cursor-not-allowed"
                >
                  <span className="flex items-center gap-1.5 truncate">
                    <Globe className="size-3 text-[#665AEF] shrink-0" />
                    <span className="truncate">{ethnicity}</span>
                  </span>
                  <ChevronDown className={`size-3.5 text-muted-foreground shrink-0 transition-transform duration-200 ${isEthnicityOpen ? "rotate-180 text-[#665AEF]" : ""}`} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  sideOffset={4}
                  className="w-(--anchor-width) min-w-56 p-1 rounded-xl shadow-2xl bg-[#0e0e14]/95 backdrop-blur-2xl border-2 border-border/80 text-foreground z-50"
                >
                  <DropdownMenuGroup className="space-y-0.5">
                    {ETHNICITY_OPTIONS.map((eth) => {
                      const isSel = ethnicity === eth;
                      return (
                        <DropdownMenuItem
                          key={eth}
                          onClick={() => { setEthnicity(eth); setIsEthnicityOpen(false); }}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs cursor-pointer font-medium ${
                            isSel
                              ? "bg-[#665AEF]/25 text-[#c2b5fd] font-semibold border-2 border-[#665AEF]/50"
                              : "text-foreground"
                          }`}
                        >
                          <span>{eth}</span>
                          {isSel && <Check className="size-3.5 text-[#665AEF] shrink-0 stroke-[2.5]" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Detail Level / Sketch Quality */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-muted-foreground/80 font-medium select-none flex items-center justify-between">
              <span>Sketch Quality</span>
              <span className="text-[10px] text-[#c2b5fd] font-mono">
                {detailLevel === "Master" ? "High Detail" : detailLevel === "Draft" ? "Draft (Fast)" : "Standard"}
              </span>
            </label>
            <div className="relative grid grid-cols-3 gap-1 p-1 rounded-lg border-2 border-border/70 bg-black/40">
              {detailOptions.map(({ value, label }) => {
                const isActive = detailLevel === value;
                return (
                  <motion.button
                    key={value}
                    type="button"
                    onClick={() => setDetailLevel(value)}
                    whileTap={{ scale: 0.92 }}
                    className={`relative h-9 rounded-lg text-xs font-medium select-none z-10 flex items-center justify-center transition-colors cursor-pointer active:scale-95 ${
                      isActive
                        ? "text-white font-semibold"
                        : "text-muted-foreground"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="mobile_detail_level_pill"
                        className="absolute inset-0 rounded-lg bg-[#665AEF] shadow-md shadow-[#665AEF]/35 border-2 border-[#8579ff]/50 -z-10"
                        transition={{ type: "spring", stiffness: 450, damping: 24, mass: 0.7 }}
                      />
                    )}
                    <span className="relative z-10">{label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Generate CTA */}
      <div className="sticky bottom-0 shrink-0 p-3 pt-2 bg-[#070709]/95 backdrop-blur-lg border-t border-border/40">
        <AnimatedButton
          type="button"
          onClick={generateSketch}
          disabled={isGenerating || !canClickGenerate}
          isAnimated={isAnimationActive}
          className={cn(
            "w-full h-12 rounded-xl bg-[#665AEF] hover:bg-[#5749DF] text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed select-none",
            isAnimationActive
              ? "shadow-lg shadow-[#665AEF]/40 border border-[#a594fd]/80 ring-1 ring-[#8579ff]/30"
              : "shadow-sm border border-[#8579ff]/40"
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-5 animate-spin text-white" />
              <span className="tracking-wide font-medium">Synthesizing...</span>
            </>
          ) : generatedImageUrl ? (
            <span>Generate Next Variation</span>
          ) : (
            <span>Generate Sketch</span>
          )}
        </AnimatedButton>

        {/* Secondary clear action */}
        {generationMode === "PROMPT_GENERATION" ? (
          <motion.button
            type="button"
            onClick={() => setPromptText("")}
            disabled={!promptText}
            whileTap={!promptText ? undefined : { scale: 0.98 }}
            className="group w-full h-9 rounded-lg border-2 border-white/10 hover:border-red-500/40 bg-white/2 hover:bg-red-500/8 text-[11px] font-medium text-muted-foreground/75 hover:text-red-400 flex items-center justify-center gap-1.5 cursor-pointer mt-2 transition-all select-none disabled:opacity-30 disabled:pointer-events-none"
          >
            <Trash2 className="size-3" />
            <span>Clear Prompt</span>
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={clearAllFeatures}
            disabled={selectedCount === 0}
            whileTap={selectedCount === 0 ? undefined : { scale: 0.98 }}
            className="group w-full h-9 rounded-lg border-2 border-white/10 hover:border-red-500/40 bg-white/2 hover:bg-red-500/8 text-[11px] font-medium text-muted-foreground/75 hover:text-red-400 flex items-center justify-center gap-1.5 cursor-pointer mt-2 transition-all select-none disabled:opacity-30 disabled:pointer-events-none"
          >
            <Trash2 className="size-3" />
            <span>Clear All Features</span>
          </motion.button>
        )}
      </div>
    </div>
  );
}
