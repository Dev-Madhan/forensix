"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import NumberFlow from "@number-flow/react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { AiAnalysisData } from "./types";

interface EvidenceAiAnalysisCardProps {
  analysis: AiAnalysisData;
  evidenceId?: string;
  onViewFullAnalysis?: () => void;
}

export function EvidenceAiAnalysisCard({
  analysis,
  evidenceId,
  onViewFullAnalysis,
}: EvidenceAiAnalysisCardProps) {
  // SVG circular progress calculation
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (analysis.score / 100) * circumference;

  return (
    <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden py-0 [--card-spacing:--spacing(3.5)]">
      {/* Header with purple Sparkles icon & View Full Analysis Link */}
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3.5 sm:px-4 border-b-2 border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4.5 text-[#665AEF] shrink-0" />
          <CardTitle className="text-xs sm:text-sm font-bold font-heading text-foreground">
            AI Analysis
          </CardTitle>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onViewFullAnalysis) {
              onViewFullAnalysis();
            } else {
              toast.info("Opening full AI forensic analysis breakdown...");
            }
          }}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#665AEF] hover:text-[#5749DF] hover:underline transition-colors cursor-pointer"
        >
          <span>View Full Analysis</span>
          <ArrowRight className="size-3" />
        </button>
      </CardHeader>

      <CardContent className="p-3 sm:p-3.5">
        <div className="flex items-center gap-3 sm:gap-3.5">
          {/* Circular Gauge Meter (Left) - Persistent with smooth NumberFlow & circle glide */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="size-13 -rotate-90 transform" viewBox="0 0 56 56">
              {/* Background track */}
              <circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-muted-foreground/20 fill-none"
                strokeWidth="4.5"
              />
              {/* Animated progress track */}
              <motion.circle
                cx="28"
                cy="28"
                r={radius}
                className="stroke-[#665AEF] fill-none"
                strokeWidth="4.5"
                strokeLinecap="round"
                strokeDasharray={circumference}
                animate={{ strokeDashoffset }}
                transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  filter: "drop-shadow(0 0 6px rgba(102, 90, 239, 0.45))",
                }}
              />
            </svg>
            {/* Centered Percentage with NumberFlow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <NumberFlow
                value={analysis.score}
                suffix="%"
                className="text-xs sm:text-sm font-extrabold font-heading text-foreground tabular-nums"
              />
            </div>
          </div>

          {/* Analysis Details (Center & Right) - In-place crossfade */}
          <div className="relative flex-1 min-w-0 grid grid-cols-1 grid-rows-1">
            <AnimatePresence initial={false}>
              <motion.div
                key={evidenceId || analysis.title}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="col-start-1 row-start-1 w-full flex items-center justify-between gap-2 min-w-0"
              >
                {/* Analysis Details (Center) */}
                <div className="space-y-0.5 min-w-0 flex-1">
                  <h4 className="font-bold text-foreground text-xs sm:text-sm leading-tight truncate">
                    {analysis.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">
                    {analysis.subtitle}
                  </p>
                </div>

                {/* Feature Attributes List (Right) - matching reference screenshot */}
                <div className="hidden sm:flex flex-col gap-1 text-[11px] text-foreground/90 font-medium shrink-0 border-l-2 border-border/40 pl-3">
                  {analysis.attributes.slice(0, 4).map((attr, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-[#665AEF] shrink-0" />
                      <span className="truncate max-w-[130px] text-[10.5px] leading-tight">{attr}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Fallback for smaller mobile viewports */}
        <div className="sm:hidden relative grid grid-cols-1 grid-rows-1 mt-2 pt-2 border-t-2 border-border/40">
          <AnimatePresence initial={false}>
            <motion.div
              key={evidenceId || analysis.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="col-start-1 row-start-1 w-full grid grid-cols-2 gap-1 text-[11px]"
            >
              {analysis.attributes.map((attr, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-foreground/90 font-medium">
                  <span className="size-1.5 rounded-full bg-[#665AEF] shrink-0" />
                  <span className="truncate text-[10.5px]">{attr}</span>
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
