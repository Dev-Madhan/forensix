"use client";

import * as React from "react";
import { motion } from "motion/react";
import NumberFlow from "@number-flow/react";
import { useInView } from "react-intersection-observer";
import { Card } from "@/components/ui/card";
import { Users, Bot, Eye, AlertTriangle, ArrowUp } from "lucide-react";

export interface CriminalMetrics {
  totalRecords: number;
  identifiedViaAI: number;
  activeWatchlist: number;
  highRiskSubjects: number;
}

interface CriminalSectionCardsProps {
  metrics?: Partial<CriminalMetrics>;
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

export function CriminalSectionCards({ metrics }: CriminalSectionCardsProps) {
  const cards = [
    {
      title: "Total Records",
      value: metrics?.totalRecords ?? 1248,
      change: "12%",
      timeframe: "from last month",
      icon: Users,
    },
    {
      title: "Identified via AI",
      value: metrics?.identifiedViaAI ?? 892,
      change: "28%",
      timeframe: "from last month",
      icon: Bot,
    },
    {
      title: "Active Watchlist",
      value: metrics?.activeWatchlist ?? 156,
      change: "6%",
      timeframe: "from last month",
      icon: Eye,
    },
    {
      title: "High Risk Subjects",
      value: metrics?.highRiskSubjects ?? 94,
      change: "18%",
      timeframe: "from last month",
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
            <Card className="flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card/70 p-4.5 sm:p-5 shadow-xs hover:border-border/90 hover:bg-card/90 transition-all duration-200 h-full">
              {/* Header: Title and Icon aligned across top, matching dashboard */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                  {card.title}
                </span>
                <Icon className="size-4.5 sm:size-5 text-[#665AEF] shrink-0" />
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
                </div>
              </div>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
