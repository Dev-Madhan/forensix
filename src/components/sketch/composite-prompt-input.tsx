"use client";

import React from "react";
import { Sparkles, Send, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useSketch } from "./sketch-context";

export function CompositePromptInput() {
  const { promptText, setPromptText, isGenerating, generateSketch } = useSketch();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      generateSketch();
    }
  };

  return (
    <div className="flex flex-col shrink-0">
      {/* Prompt Card */}
      <div className="rounded-xl border-2 border-border/80 bg-[#0d0d12]/95 backdrop-blur-2xl p-2 sm:p-2.5 flex items-center gap-2.5 shadow-xl transition-all focus-within:border-border">
        {/* Left: Sparkles Icon Box */}
        <div className="size-8.5 rounded-md border-2 border-border/70 bg-black/40 flex items-center justify-center shrink-0 text-[#a594fd] shadow-inner">
          <Sparkles className="size-4" />
        </div>

        {/* Center: Input */}
        <input
          type="text"
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the criminal with a text based description so that the AI can generate the sketch..."
          className="h-8 bg-transparent border-0 outline-none text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-0 focus-visible:outline-none shadow-none px-1 flex-1 min-w-0"
        />

        {/* Right: Theme Send Button with Jelly Spring */}
        <motion.button
          type="button"
          onClick={generateSketch}
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
