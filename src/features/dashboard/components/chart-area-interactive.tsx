"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { motion } from "motion/react";
import { ChevronDown, Check } from "lucide-react";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ActivityChartPoint } from "@/features/dashboard/queries";

export type { ActivityChartPoint };

const timeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
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
    label: "Telemetry & Hits",
    color: "#10b981",
  },
} satisfies ChartConfig;

interface ChartAreaInteractiveProps {
  data?: ActivityChartPoint[];
}

export function ChartAreaInteractive({ data = [] }: ChartAreaInteractiveProps) {
  const [timeRange, setTimeRange] = React.useState<"7d" | "30d" | "90d">("30d");
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

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
    // Upper boundary at least 5 for clean ticks
    const upperLimit = Math.max(Math.ceil((maxVal + 1) / 4) * 4, 4);
    const step = upperLimit / 4;
    return {
      maxY: upperLimit,
      yTicks: [0, step, step * 2, step * 3, upperLimit],
    };
  }, [filteredData]);

  return (
    <Card className="@container/card rounded-xl border border-border/70 bg-card/70 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/40 px-5 sm:px-6 py-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Investigation Activity
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Live database telemetry of cases, composite sketches, and surveillance signals.
          </CardDescription>
        </div>
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <button
                  type="button"
                  className="flex h-8 w-[124px] items-center justify-between gap-2 rounded-lg border-2 border-border bg-secondary/35 px-3 text-xs font-medium text-foreground/90 shadow-xs hover:border-border hover:bg-secondary/60 hover:text-foreground focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40 transition-all duration-150 cursor-pointer"
                />
              }
            >
              <span>
                {timeOptions.find((opt) => opt.value === timeRange)?.label ||
                  "Last 30 days"}
              </span>
              <ChevronDown className="size-3.5 text-muted-foreground opacity-80" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              side="bottom"
              sideOffset={6}
              className="w-36 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
              onPointerLeave={() => setHoveredItem(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -6 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-0.5"
              >
                {timeOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.value}
                    onPointerEnter={() => setHoveredItem(option.value)}
                    onClick={() => setTimeRange(option.value as "7d" | "30d" | "90d")}
                    className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs font-medium"
                  >
                    {hoveredItem === option.value && (
                      <motion.div
                        layoutId="chart-days-hover"
                        className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                        transition={{
                          type: "spring",
                          bounce: 0.3,
                          duration: 0.4,
                        }}
                      />
                    )}
                    <span
                      className={
                        timeRange === option.value
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground"
                      }
                    >
                      {option.label}
                    </span>
                    {timeRange === option.value && (
                      <Check className="size-3.5 text-[#665AEF]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </motion.div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 pb-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[260px] w-full"
        >
          <AreaChart
            data={filteredData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
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

              {/* Telemetry & Hits: soft emerald */}
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
              minTickGap={24}
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
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#3b82f6]" />
            <span className="font-medium text-foreground/90">Cases Created</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#665AEF]" />
            <span className="font-medium text-foreground/90">Sketches Generated</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-[#10b981]" />
            <span className="font-medium text-foreground/90">Telemetry & Hits</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
