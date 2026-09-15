"use client";

import React, { useState } from "react";
import { Sparkles, Trash2, PenLine, ChevronDown, Check, User, Globe, Lock } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSketch, DetailLevel } from "./sketch-context";
import { ConcentricRings } from "@/components/ui/concentric-rings";

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

export function GenerationControlsPanel() {
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
    generationMode,
    isDemographicsEnabled,
  } = useSketch();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hoveredStyle, setHoveredStyle] = useState<string | null>(null);
  const [isEthnicityOpen, setIsEthnicityOpen] = useState(false);

  const detailLevels: DetailLevel[] = ["Draft", "Standard", "Master"];

  return (
    <div className="rounded-xl border-2 border-border/80 bg-[#0d0d12]/90 backdrop-blur-2xl p-4 flex flex-col shadow-2xl shrink-0">
      {/* Header */}
      <h3 className="font-heading text-sm font-semibold text-foreground tracking-tight pb-2.5 select-none">
        Generation Controls
      </h3>

      {/* Sketch Style Dropdown */}
      <div className="flex flex-col gap-1.5 mt-1">
        <label className="text-[11px] text-muted-foreground/80 font-medium select-none flex items-center gap-1.5">
          <PenLine className="size-3 text-[#665AEF]" />
          <span>Forensic Sketch Style</span>
        </label>
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger
            className={`w-full h-8.5 px-2.5 border-2 rounded-md flex items-center justify-between text-xs text-foreground cursor-pointer outline-none transition-all duration-200 select-none ${
              isDropdownOpen
                ? "border-[#665AEF] bg-black/60 shadow-xs shadow-[#665AEF]/30"
                : "border-border/70 bg-black/40 hover:bg-white/5 hover:border-[#665AEF]/50"
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <span className="truncate font-medium">{sketchStyle}</span>
            </div>
            <ChevronDown
              className={`size-3.5 text-muted-foreground shrink-0 transition-transform duration-300 ease-out ${
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
                        className="relative z-0 flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg text-xs font-medium transition-colors bg-transparent! outline-none select-none group"
                      >
                        {isHighlighted && (
                          <motion.div
                            layoutId="sketch_style_dropdown_hover"
                            className="absolute inset-0 z-[-1] rounded-lg bg-[#665AEF]/20 border-2 border-[#665AEF]/60 shadow-xs shadow-[#665AEF]/20"
                            transition={{
                              type: "spring",
                              bounce: 0.25,
                              duration: 0.35,
                            }}
                          />
                        )}
                        <span
                          className={
                            isSelected
                              ? "text-[#c2b5fd] font-semibold"
                              : "text-foreground group-hover:text-foreground"
                          }
                        >
                          {style}
                        </span>
                        {isSelected && (
                          <Check className="size-3.5 text-[#665AEF] stroke-[2.5] shrink-0" />
                        )}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            )}
          </AnimatePresence>
        </DropdownMenu>
      </div>



      {/* Suspect Demographics: Age, Gender & Heritage */}
      <div className={`flex flex-col gap-1.5 mt-3 transition-opacity duration-200 ${!isDemographicsEnabled ? "opacity-50" : ""}`}>
        <label className="text-[11px] text-muted-foreground/80 font-medium select-none flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <User className="size-3 text-[#665AEF]" />
            <span>Suspect Demographics</span>
          </span>
          {!isDemographicsEnabled ? (
            <span className="flex items-center gap-1 text-[10px] text-[#a594fd] font-medium">
              <Lock className="size-2.5" /> Prompt-Inferred
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground font-mono">{gender}, {ageGroup} · {ethnicity.split(" / ")[0]}</span>
          )}
        </label>
        
        {/* Gender selector */}
        <div className={`grid grid-cols-2 gap-1 p-0.5 rounded-md border border-border/60 bg-black/30 ${!isDemographicsEnabled ? "pointer-events-none" : ""}`}>
          {GENDER_OPTIONS.map((g) => {
            const isSel = gender === g;
            return (
              <button
                key={g}
                type="button"
                disabled={!isDemographicsEnabled}
                onClick={() => setGender(g)}
                className={`h-6 rounded text-[11px] font-medium transition-all select-none cursor-pointer ${
                  isSel
                    ? "bg-[#665AEF]/40 text-white font-semibold border-2 border-[#8579ff]/70"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {g}
              </button>
            );
          })}
        </div>

        {/* Age group selector */}
        <div className={`grid grid-cols-4 gap-1 p-0.5 rounded-md border border-border/60 bg-black/30 mt-0.5 ${!isDemographicsEnabled ? "pointer-events-none" : ""}`}>
          {AGE_OPTIONS.map((ag) => {
            const isSel = ageGroup === ag;
            return (
              <button
                key={ag}
                type="button"
                disabled={!isDemographicsEnabled}
                onClick={() => setAgeGroup(ag)}
                className={`h-6 rounded text-[10.5px] font-medium transition-all select-none cursor-pointer ${
                  isSel
                    ? "bg-[#665AEF]/40 text-white font-semibold border-2 border-[#8579ff]/70"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {ag}
              </button>
            );
          })}
        </div>

        {/* Demographic Heritage / Ethnicity Selector */}
        <div className={`flex flex-col gap-1 mt-1 ${!isDemographicsEnabled ? "pointer-events-none" : ""}`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-muted-foreground/80 font-medium flex items-center gap-1">
              <Globe className="size-2.5 text-[#665AEF]" />
              <span>Demographic Heritage</span>
            </span>
            <span className="text-[9.5px] text-[#c2b5fd] font-medium">{ethnicity}</span>
          </div>
          <DropdownMenu open={isDemographicsEnabled && isEthnicityOpen} onOpenChange={setIsEthnicityOpen}>
            <DropdownMenuTrigger
              disabled={!isDemographicsEnabled}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-md border border-border/60 bg-black/40 text-[11px] font-medium text-foreground hover:border-[#665AEF]/50 transition-colors cursor-pointer select-none outline-none disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-1.5 truncate">
                <Globe className="size-3 text-[#665AEF] shrink-0" />
                <span className="truncate">{ethnicity}</span>
              </span>
              <ChevronDown
                className={`size-3 text-muted-foreground shrink-0 transition-transform duration-200 ${
                  isEthnicityOpen ? "rotate-180 text-[#665AEF]" : ""
                }`}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              sideOffset={4}
              className="w-(--anchor-width) min-w-56 p-1 rounded-xl shadow-2xl bg-[#0e0e14]/95 backdrop-blur-2xl border-2 border-border/80 text-foreground overflow-hidden z-50"
            >
              <DropdownMenuGroup className="space-y-0.5">
                {ETHNICITY_OPTIONS.map((eth) => {
                  const isSel = ethnicity === eth;
                  return (
                    <DropdownMenuItem
                      key={eth}
                      onClick={() => {
                        setEthnicity(eth);
                        setIsEthnicityOpen(false);
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer font-medium transition-colors ${
                        isSel
                          ? "bg-[#665AEF]/25 text-[#c2b5fd] font-semibold border-2 border-[#665AEF]/50"
                          : "text-foreground hover:bg-white/5"
                      }`}
                    >
                      <span>{eth}</span>
                      {isSel && <Check className="size-3 text-[#665AEF] shrink-0 stroke-[2.5]" />}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Detail Level Segmented Buttons */}
      <div className={`flex flex-col gap-1.5 mt-3 transition-opacity duration-200 ${!isDemographicsEnabled ? "opacity-50" : ""}`}>
        <label className="text-[11px] text-muted-foreground/80 font-medium select-none flex items-center justify-between">
          <span>Synthesis Fidelity</span>
          {!isDemographicsEnabled && (
            <span className="flex items-center gap-1 text-[10px] text-[#a594fd] font-medium">
              <Lock className="size-2.5" /> Auto
            </span>
          )}
        </label>
        <div className={`relative grid grid-cols-3 gap-1 p-1 rounded-lg border-2 border-border/70 bg-black/40 ${!isDemographicsEnabled ? "pointer-events-none" : ""}`}>
          {detailLevels.map((lvl) => {
            const isActive = detailLevel === lvl;
            return (
              <motion.button
                key={lvl}
                type="button"
                disabled={!isDemographicsEnabled}
                onClick={() => setDetailLevel(lvl)}
                whileTap={!isDemographicsEnabled ? undefined : { scale: 0.92 }}
                className={`relative h-7 rounded-md text-[11px] font-medium select-none z-10 flex items-center justify-center transition-colors duration-200 ${
                  !isDemographicsEnabled ? "cursor-not-allowed" : "cursor-pointer"
                } ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/4"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="generation_detail_level_pill"
                    className="absolute inset-0 rounded-md bg-[#665AEF] shadow-md shadow-[#665AEF]/35 border-2 border-[#8579ff]/50 -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 24,
                      mass: 0.7,
                    }}
                  />
                )}
                <span className="relative z-10">{lvl}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Primary Action: Generate Sketch */}
      <motion.button
        type="button"
        onClick={generateSketch}
        disabled={isGenerating}
        whileHover={isGenerating ? undefined : { scale: 1.015 }}
        whileTap={isGenerating ? undefined : { scale: 0.95 }}
        transition={{ type: "spring", stiffness: 450, damping: 20 }}
        className="w-full h-10 rounded-md bg-[#665AEF] hover:bg-[#5749DF] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#665AEF]/30 border-2 border-[#8579ff]/50 cursor-pointer mt-4 transition-colors active:shadow-md disabled:opacity-50 disabled:cursor-not-allowed select-none"
      >
        {isGenerating ? (
          <>
            <ConcentricRings size={16} color="#fff" />
            <span className="tracking-wide">Synthesizing...</span>
          </>
        ) : (
          <>
            <Sparkles className="size-4" />
            <span>Generate Sketch</span>
          </>
        )}
      </motion.button>

      {/* Secondary Action: Clear Action */}
      {generationMode === "PROMPT_GENERATION" ? (
        <motion.button
          type="button"
          onClick={() => setPromptText("")}
          disabled={!promptText}
          whileHover={!promptText ? undefined : { scale: 1.01 }}
          whileTap={!promptText ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full h-7.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/5 flex items-center justify-center gap-1.5 cursor-pointer mt-1.5 transition-colors select-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="size-3.5" />
          <span>Clear Witness Prompt</span>
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={clearAllFeatures}
          disabled={selectedCount === 0}
          whileHover={selectedCount === 0 ? undefined : { scale: 1.01 }}
          whileTap={selectedCount === 0 ? undefined : { scale: 0.96 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="w-full h-7.5 rounded-md text-[11px] text-muted-foreground hover:text-foreground hover:bg-white/5 flex items-center justify-center gap-1.5 cursor-pointer mt-1.5 transition-colors select-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 className="size-3.5" />
          <span>Clear All Features</span>
        </motion.button>
      )}
    </div>
  );
}
