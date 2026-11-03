"use client";

import * as React from "react";
import { motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Folder, User, Sparkles, Target, ArrowUp, ArrowDown } from "lucide-react";
import type { DashboardMetrics } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";

export type { DashboardMetrics };

function RollingNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = React.useState(value);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  React.useEffect(() => {
    if (inView) {
      setDisplayValue(value);
    }
  }, [inView, value]);

  return (
    <span ref={ref} className="inline-block">
      <NumberFlow
        value={displayValue}
        trend={1}
        className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground tabular-nums font-heading"
      />
    </span>
  );
}

interface SectionCardsProps {
  metrics?: DashboardMetrics;
}

export function SectionCards({ metrics }: SectionCardsProps) {
  const cards = [
    {
      title: "Total Cases",
      value: metrics?.totalCases ?? 1,
      change: metrics?.totalCasesDelta ?? "+0%",
      timeframe: "vs last month",
      icon: Folder,
      color: "text-[#a594fd]",
    },
    {
      title: "Suspects in DB",
      value: metrics?.totalSuspects ?? 1,
      change: metrics?.totalSuspectsDelta ?? "+0%",
      timeframe: "vs last month",
      icon: User,
      color: "text-blue-400",
    },
    {
      title: "Sketches Synthesized",
      value: metrics?.sketchesGenerated ?? 0,
      change: metrics?.sketchesGeneratedDelta ?? "+0%",
      timeframe: "vs last month",
      icon: Sparkles,
      color: "text-[#c4b8ff]",
    },
    {
      title: "Cases Resolved",
      value: metrics?.casesResolved ?? 0,
      change: metrics?.casesResolvedDelta ?? "+0%",
      timeframe: "vs last month",
      icon: Target,
      color: "text-emerald-400",
    },
  ];

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      className="grid grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 lg:grid-cols-4 max-w-7xl mx-auto w-full"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isNegative = card.change.startsWith("-");

        return (
          <motion.div
            key={card.title}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.04,
              ease: [0.16, 1, 0.3, 1],
              layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            }}
            className="h-full"
          >
            <Card className="flex flex-col justify-between gap-2.5 sm:gap-3 rounded-xl border border-border/70 bg-card/75 p-3.5 sm:p-5 shadow-xs hover:border-border/90 hover:bg-card/90 transition-all duration-200 h-full">
              {/* Header: Title and pure icon only */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  {card.title}
                </span>
                <Icon className={cn("size-4 sm:size-5 shrink-0", card.color)} />
              </div>

              {/* Metric Hero Number & Delta Trend */}
              <div className="space-y-1 sm:space-y-1.5">
                <div className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  <RollingNumber value={card.value} />
                </div>
                <div className="flex items-center gap-1.5 text-[11px] sm:text-xs flex-wrap">
                  <span
                    className={cn(
                      "inline-flex items-center gap-0.5 font-medium",
                      isNegative ? "text-amber-400" : "text-emerald-400"
                    )}
                  >
                    {isNegative ? (
                      <ArrowDown className="size-3 shrink-0" />
                    ) : (
                      <ArrowUp className="size-3 shrink-0" />
                    )}
                    {card.change}
                  </span>
                  <span className="text-muted-foreground text-[10px] sm:text-xs truncate">
                    {card.timeframe}
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
