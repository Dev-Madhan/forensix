"use client";

import * as React from "react";
import { motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Users, Bot, Eye, AlertTriangle, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CriminalMetrics {
  totalRecords: number;
  identifiedViaAI: number;
  activeWatchlist: number;
  highRiskSubjects: number;
}

export interface CriminalSectionCardsProps {
  metrics?: Partial<CriminalMetrics>;
  activeFilterKey?: string | null;
  onSelectFilter?: (key: string) => void;
}

function RollingNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = React.useState(0);
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
        className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums font-heading"
      />
    </span>
  );
}

export function CriminalSectionCards({
  metrics,
  activeFilterKey,
  onSelectFilter,
}: CriminalSectionCardsProps) {
  const cards = [
    {
      key: "TOTAL",
      title: "Total Records",
      value: metrics?.totalRecords ?? 0,
      change: "Active",
      timeframe: "in registry",
      icon: Users,
    },
    {
      key: "AI",
      title: "Identified via AI",
      value: metrics?.identifiedViaAI ?? 0,
      change: "Enrolled",
      timeframe: "with biometrics",
      icon: Bot,
    },
    {
      key: "WATCHLIST",
      title: "Active Watchlist",
      value: metrics?.activeWatchlist ?? 0,
      change: "Active",
      timeframe: "under monitoring",
      icon: Eye,
    },
    {
      key: "HIGH_RISK",
      title: "High Risk Subjects",
      value: metrics?.highRiskSubjects ?? 0,
      change: "Priority",
      timeframe: "critical threat",
      icon: AlertTriangle,
    },
  ];

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {cards.map((card, index) => {
        const Icon = card.icon;
        const isActive = activeFilterKey === card.key;
        return (
          <motion.div
            key={card.title}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: [0.16, 1, 0.3, 1],
              layout: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            }}
            className="h-full"
          >
            <Card
              onClick={() => onSelectFilter?.(card.key)}
              className={cn(
                "flex flex-col justify-between gap-3 rounded-xl border p-4.5 sm:p-5 shadow-xs transition-all duration-200 h-full cursor-pointer select-none",
                isActive
                  ? "border-[#665AEF] bg-[#665AEF]/10 ring-2 ring-[#665AEF]/30 shadow-md shadow-[#665AEF]/10"
                  : "border-border/70 bg-card/70 hover:border-border/90 hover:bg-card/90"
              )}
            >
              {/* Header: Title and Icon aligned across top */}
              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "text-xs sm:text-sm font-medium truncate transition-colors",
                    isActive ? "text-white font-semibold" : "text-muted-foreground"
                  )}
                >
                  {card.title}
                </span>
                <Icon
                  className={cn(
                    "size-4.5 sm:size-5 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-[#665AEF]"
                  )}
                />
              </div>

              {/* Content: Hero metric rolling value and trend text */}
              <div className="space-y-1.5">
                <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums">
                  <RollingNumber value={card.value} />
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="inline-flex items-center gap-0.5 font-medium text-emerald-400">
                    <ArrowUp className="size-3 shrink-0" />
                    {card.change}
                  </span>
                  <span className="text-muted-foreground text-[11px] sm:text-xs truncate">
                    {card.timeframe}
                  </span>
                  {isActive && (
                    <span className="ml-auto text-[10px] font-mono font-semibold text-[#a594fd] uppercase tracking-wider bg-[#665AEF]/20 px-1.5 py-0.5 rounded">
                      Filtered
                    </span>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
