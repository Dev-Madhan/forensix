"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { motion } from "motion/react";
import { Activity } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { ActivityChartPoint } from "@/features/dashboard/queries";
import { cn } from "@/lib/utils";

export type { ActivityChartPoint };

const timeOptions = [
  { value: "7d", label: "7 Days", short: "7D" },
  { value: "30d", label: "30 Days", short: "30D" },
  { value: "90d", label: "90 Days", short: "90D" },
];

const chartConfig = {
  cases: {
    label: "Cases Created",
    color: "#3b82f6",
  },
  sketches: {
    label: "Sketches Generated",
    color: "#665AEF",
  },
  searches: {
    label: "Surveillance Hits",
    color: "#10b981",
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  data?: ActivityChartPoint[];
}

export function ChartAreaInteractive({ data = [] }: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");

  // Filter the full dataset based on selected timeRange (7d, 30d, 90d)
  const filteredData = React.useMemo(() => {
    if (!data || data.length === 0) {
      // Generate clean zero-filled array up to today
      const count = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
      const now = new Date();
      const points: ActivityChartPoint[] = [];
      for (let i = count; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        points.push({
          date: d.toISOString().slice(0, 10),
          cases: 0,
          sketches: 0,
          searches: 0,
        });
      }
      return points;
    }

    const daysCount = timeRange === "7d" ? 7 : timeRange === "90d" ? 90 : 30;
    // Take the last N days from the sorted chronological dataset
    return data.slice(-daysCount - 1);
  }, [data, timeRange]);

  // Dynamically calculate clean Y-Axis boundary
  const { maxY, yTicks } = React.useMemo(() => {
    const maxVal = Math.max(
      ...filteredData.map((d) => Math.max(d.cases || 0, d.sketches || 0, d.searches || 0)),
      0
    );
    // Upper boundary at least 4 for clean ticks
    const upperLimit = Math.max(Math.ceil((maxVal + 1) / 4) * 4, 4);
    const step = upperLimit / 4;
    return {
      maxY: upperLimit,
      yTicks: [0, step, step * 2, step * 3, upperLimit],
    };
  }, [filteredData]);

  return (
    <Card className="@container/card rounded-xl border border-border/70 bg-card/75 shadow-xs overflow-hidden">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border/40 px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-[#665AEF] shrink-0" />
            <CardTitle className="text-sm sm:text-base font-semibold tracking-tight text-foreground font-heading">
              Investigation Activity
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-muted-foreground">
            Unified activity tracking of cases, composite sketches, and surveillance hits.
          </CardDescription>
        </div>

        {/* Ergonomic Segmented Pill Controls for 1-Tap Switching on Mobile & Desktop */}
        <div className="flex items-center rounded-lg border border-border/80 bg-secondary/40 p-1 self-start sm:self-auto">
          {timeOptions.map((opt) => {
            const isActive = timeRange === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setTimeRange(opt.value as "7d" | "30d" | "90d")}
                className={cn(
                  "relative px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer select-none",
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="chart-time-pill"
                    className="absolute inset-0 rounded-md bg-card border border-border/70 shadow-xs"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}
                <span className="relative z-10 hidden sm:inline">{opt.label}</span>
                <span className="relative z-10 sm:hidden">{opt.short}</span>
              </button>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 pb-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[210px] sm:h-[260px] w-full"
        >
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -14, bottom: 0 }}
          >
            <defs>
              {/* Blue Cases gradient */}
              <linearGradient id="fillCases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.12} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>

              {/* Sketches Generated: #665AEF gradient */}
              <linearGradient id="fillSketches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#665AEF" stopOpacity={0.42} />
                <stop offset="60%" stopColor="#665AEF" stopOpacity={0.14} />
                <stop offset="95%" stopColor="#665AEF" stopOpacity={0.0} />
              </linearGradient>

              {/* Surveillance Hits: soft emerald */}
              <linearGradient id="fillSearches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="60%" stopColor="#10b981" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              className="stroke-border/40"
            />

            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              minTickGap={28}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
              className="text-xs fill-muted-foreground"
            />

            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              domain={[0, maxY]}
              ticks={yTicks}
              className="text-xs fill-muted-foreground"
            />

            <ChartTooltip
              cursor={{
                stroke: "rgba(102, 90, 239, 0.35)",
                strokeWidth: 1,
                strokeDasharray: "3 3",
              }}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="searches"
              type="monotone"
              fill="url(#fillSearches)"
              stroke="#10b981"
              strokeWidth={1.5}
              isAnimationActive={true}
              animationDuration={450}
            />
            <Area
              dataKey="sketches"
              type="monotone"
              fill="url(#fillSketches)"
              stroke="#665AEF"
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={450}
            />
            <Area
              dataKey="cases"
              type="monotone"
              fill="url(#fillCases)"
              stroke="#3b82f6"
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={450}
            />
          </AreaChart>
        </ChartContainer>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 sm:pt-4 text-[11px] sm:text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="size-2 sm:size-2.5 rounded-full bg-[#3b82f6]" />
            <span className="font-medium text-foreground/90">Cases Created</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="size-2 sm:size-2.5 rounded-full bg-[#665AEF]" />
            <span className="font-medium text-foreground/90">Sketches Generated</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="size-2 sm:size-2.5 rounded-full bg-[#10b981]" />
            <span className="font-medium text-foreground/90">Surveillance Hits</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
