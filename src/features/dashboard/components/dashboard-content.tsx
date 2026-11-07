"use client";

import * as React from "react";
import { motion } from "motion/react";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { SectionCards } from "@/features/dashboard/components/section-cards";
import { ChartAreaInteractive } from "@/features/dashboard/components/chart-area-interactive";
import { RecentCasesTable, type CaseItem } from "@/features/dashboard/components/recent-cases-table";
import { RecentSketches, type SketchItem } from "@/features/dashboard/components/recent-sketches";
import { useDashboardRealtime } from "@/features/dashboard/hooks/use-dashboard-realtime";
import type { DashboardMetrics, ActivityChartPoint } from "@/features/dashboard/queries";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

interface DashboardContentProps {
  userName: string;
  metrics?: DashboardMetrics;
  recentCases?: CaseItem[];
  recentSketches?: SketchItem[];
  chartData?: ActivityChartPoint[];
}

export function DashboardContent({
  userName,
  metrics,
  recentCases = [],
  recentSketches = [],
  chartData = [],
}: DashboardContentProps) {
  const [currentMetrics, setCurrentMetrics] = React.useState<DashboardMetrics | undefined>(metrics);
  const [currentCases, setCurrentCases] = React.useState<CaseItem[]>(recentCases);
  const [currentSketches, setCurrentSketches] = React.useState<SketchItem[]>(recentSketches);
  const [currentChartData, setCurrentChartData] = React.useState<ActivityChartPoint[]>(chartData);

  // Sync state if server props change
  React.useEffect(() => {
    if (metrics) setCurrentMetrics(metrics);
  }, [metrics]);

  React.useEffect(() => {
    setCurrentCases(recentCases);
  }, [recentCases]);

  React.useEffect(() => {
    setCurrentSketches(recentSketches);
  }, [recentSketches]);

  React.useEffect(() => {
    setCurrentChartData(chartData);
  }, [chartData]);

  // Connect to live unified forensic SSE stream
  const { isConnected } = useDashboardRealtime({
    onCaseCreated: (newCase) => {
      setCurrentCases((prev) => [newCase, ...prev.filter((c) => c.id !== newCase.id)].slice(0, 6));
      setCurrentMetrics((prev) =>
        prev
          ? {
              ...prev,
              totalCases: prev.totalCases + 1,
            }
          : undefined
      );

      // Increment today's cases on chart
      const todayStr = new Date().toISOString().slice(0, 10);
      setCurrentChartData((prev) => {
        const found = prev.some((p) => p.date === todayStr);
        if (found) {
          return prev.map((p) => (p.date === todayStr ? { ...p, cases: p.cases + 1 } : p));
        }
        return [...prev, { date: todayStr, cases: 1, sketches: 0, searches: 0 }];
      });
    },

    onCaseStatusChanged: (update) => {
      setCurrentCases((prev) =>
        prev.map((c) => {
          if (c.id === update.id || c.caseId === update.caseNumber) {
            let mappedStatus: CaseItem["status"] = "Open";
            if (update.status === "UNDER_INVESTIGATION") mappedStatus = "Under Investigation";
            else if (update.status === "ARCHIVED") mappedStatus = "Archived";
            else if (update.status === "CLOSED") mappedStatus = "Closed";
            else if (update.status === "COLD") mappedStatus = "Cold";
            else if (update.status === "SOLVED") mappedStatus = "Solved";
            return { ...c, status: mappedStatus };
          }
          return c;
        })
      );

      if (update.status === "CLOSED" || update.status === "ARCHIVED" || update.status === "SOLVED") {
        setCurrentMetrics((prev) =>
          prev
            ? {
                ...prev,
                casesResolved: prev.casesResolved + 1,
              }
            : undefined
        );
      }
    },

    onCriminalEnrolled: () => {
      setCurrentMetrics((prev) =>
        prev
          ? {
              ...prev,
              totalSuspects: prev.totalSuspects + 1,
            }
          : undefined
      );
    },

    onSketchGenerated: (newSketch) => {
      setCurrentSketches((prev) => {
        const filtered = prev.filter(
          (s) => s.id !== newSketch.id && (!s.imageUrl || s.imageUrl !== newSketch.imageUrl)
        );
        return [newSketch, ...filtered].slice(0, 4);
      });
      setCurrentMetrics((prev) =>
        prev
          ? {
              ...prev,
              sketchesGenerated: prev.sketchesGenerated + 1,
            }
          : undefined
      );

      // Increment today's sketches on chart
      const todayStr = new Date().toISOString().slice(0, 10);
      setCurrentChartData((prev) => {
        const found = prev.some((p) => p.date === todayStr);
        if (found) {
          return prev.map((p) => (p.date === todayStr ? { ...p, sketches: p.sketches + 1 } : p));
        }
        return [...prev, { date: todayStr, cases: 0, sketches: 1, searches: 0 }];
      });
    },

    onSketchesSync: (freshSketches) => {
      if (freshSketches && Array.isArray(freshSketches)) {
        setCurrentSketches((prev) => {
          if (freshSketches.length === 0) return [];
          const prevKeys = prev.map((s) => `${s.id}-${s.imageUrl}`).join("|");
          const nextKeys = freshSketches.slice(0, 4).map((s) => `${s.id}-${s.imageUrl}`).join("|");
          if (prevKeys !== nextKeys) {
            return freshSketches.slice(0, 4);
          }
          return prev;
        });
      }
    },

    onSurveillanceHit: () => {
      setCurrentMetrics((prev) =>
        prev
          ? {
              ...prev,
              activeSightings: (prev.activeSightings || 0) + 1,
            }
          : undefined
      );

      // Increment today's searches/hits on chart
      const todayStr = new Date().toISOString().slice(0, 10);
      setCurrentChartData((prev) => {
        const found = prev.some((p) => p.date === todayStr);
        if (found) {
          return prev.map((p) => (p.date === todayStr ? { ...p, searches: p.searches + 1 } : p));
        }
        return [...prev, { date: todayStr, cases: 0, sketches: 0, searches: 1 }];
      });
    },
  });

  return (
    <motion.div
      layout
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
      className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
    >
      {/* 1. Header (Welcome text, SSE connection status pill & Date Range Picker) */}
      <motion.div
        layout
        variants={itemVariants}
        transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
      >
        <DashboardHeader initialUserName={userName} isConnected={isConnected} />
      </motion.div>

      {/* 2. Metric Cards */}
      <motion.div
        layout
        variants={itemVariants}
        transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
      >
        <SectionCards metrics={currentMetrics} />
      </motion.div>

      {/* 3. Dynamic Area Chart */}
      <motion.div
        layout
        variants={itemVariants}
        transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
        className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full"
      >
        <ChartAreaInteractive data={currentChartData} />
      </motion.div>

      {/* 4. Bottom Section: Recent Cases & Recent Sketches */}
      <motion.div
        layout
        variants={itemVariants}
        transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
        className="grid grid-cols-1 gap-4 px-4 sm:px-6 lg:px-8 lg:grid-cols-12 max-w-7xl mx-auto w-full items-stretch"
      >
        <motion.div
          layout
          transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
          className="lg:col-span-7 flex flex-col"
        >
          <RecentCasesTable cases={currentCases} />
        </motion.div>
        <motion.div
          layout
          transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
          className="lg:col-span-5 flex flex-col"
        >
          <RecentSketches sketches={currentSketches} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
