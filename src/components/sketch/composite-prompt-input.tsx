"use client";

import React from "react";
import { Sparkles, Send, Loader2, Lock, ArrowLeftRight } from "lucide-react";
import { motion } from "motion/react";
import { useSketch } from "./sketch-context";
import { ModeSwitchDialog } from "./mode-switch-dialog";

export function CompositePromptInput() {
  const {
    promptText,
    setPromptText,
    isGenerating,
    generateSketch,
    generationMode,
    isPromptEnabled,
    requestModeChange,
  } = useSketch();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey && isPromptEnabled) {
      e.preventDefault();
      generateSketch();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPromptEnabled) {
      requestModeChange("PROMPT_GENERATION");
      return;
    }
    const val = e.target.value;
    setPromptText(val);
    if (generationMode === "IDLE" && val.trim().length > 0) {
      requestModeChange("PROMPT_GENERATION");
    }
  };

  return (
    <div className="flex flex-col shrink-0">
      <ModeSwitchDialog />

      {/* Mode Status & Selector Banner */}
      <div className="flex items-center justify-between px-1 mb-1.5 text-[11px]">
        <div className="flex items-center gap-1.5">
          <span className="text-muted-foreground/70 font-medium">Mode:</span>
          {generationMode === "PROMPT_GENERATION" ? (
            <span className="px-2 py-0.5 rounded-full bg-[#665AEF]/20 border border-[#665AEF]/40 text-[#a594fd] font-semibold text-[10px] tracking-wide">
              PROMPT GENERATION
            </span>
          ) : generationMode === "DATASET_COMPOSITE" ? (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 font-semibold text-[10px] tracking-wide">
              DATASET COMPOSITE
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-muted-foreground font-semibold text-[10px] tracking-wide">
              IDLE (SELECT MODE)
            </span>
          )}
        </div>

        {generationMode === "DATASET_COMPOSITE" && (
          <button
            type="button"
            onClick={() => requestModeChange("PROMPT_GENERATION")}
            className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 font-medium cursor-pointer transition-colors"
          >
            <ArrowLeftRight className="size-3" />
            <span>Switch to Prompt Mode</span>
          </button>
        )}
      </div>

      {/* Prompt Card */}
      <div
        className={`rounded-xl border-2 p-2 sm:p-2.5 flex items-center gap-2.5 shadow-xl transition-all ${
          !isPromptEnabled
            ? "border-border/50 bg-[#0d0d12]/60 opacity-70 cursor-pointer"
            : "border-border/80 bg-[#0d0d12]/95 backdrop-blur-2xl focus-within:border-[#665AEF]/70"
        }`}
        onClick={() => {
          if (!isPromptEnabled) {
            requestModeChange("PROMPT_GENERATION");
          }
        }}
      >
        {/* Left: Sparkles or Lock Icon Box */}
        <div
          className={`size-8.5 rounded-md border-2 flex items-center justify-center shrink-0 shadow-inner ${
            !isPromptEnabled
              ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
              : "border-border/70 bg-black/40 text-[#a594fd]"
          }`}
        >
          {!isPromptEnabled ? <Lock className="size-4" /> : <Sparkles className="size-4" />}
        </div>

        {/* Center: Input */}
        <input
          type="text"
          value={promptText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          readOnly={!isPromptEnabled}
          placeholder={
            !isPromptEnabled
              ? "Dataset Composite mode active. Click to switch to Prompt Generation..."
              : "Describe the criminal with a text based description so that the AI can generate the sketch..."
          }
          className={`h-8 bg-transparent border-0 outline-none text-xs placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 focus-visible:outline-none shadow-none px-1 flex-1 min-w-0 ${
            !isPromptEnabled ? "cursor-pointer text-muted-foreground" : "text-foreground"
          }`}
        />

        {/* Right: Theme Send Button with Jelly Spring */}
        <motion.button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (isPromptEnabled) {
              generateSketch();
            } else {
              requestModeChange("PROMPT_GENERATION");
            }
          }}
          disabled={isGenerating}
          whileHover={isGenerating ? undefined : { scale: 1.08 }}
          whileTap={isGenerating ? undefined : { scale: 0.9 }}
          transition={{ type: "spring", stiffness: 450, damping: 20 }}
          className="size-8 rounded-md bg-[#665AEF] hover:bg-[#5749DF] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#665AEF]/35 border-2 border-[#8579ff]/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors select-none"
          aria-label="Generate sketch from description"
        >
          {isGenerating ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Send className="size-3.5" />
          )}
        </motion.button>
      </div>

      {/* Tip under input */}
      <p className="text-[11px] text-muted-foreground/60 text-center mt-2 font-normal select-none">
        Tip: Be specific about facial features, age, ethnicity, and distinguishing characteristics.
      </p>
    </div>
  );
}
