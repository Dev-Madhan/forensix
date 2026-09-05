"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { motion } from "motion/react"
import { ChevronDown, Check } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export const description = "Investigation activity area chart"

const timeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
]

const chartData = [
  // July 2026
  { date: "2026-07-06", cases: 7, sketches: 4, searches: 9 },
  { date: "2026-07-10", cases: 9, sketches: 6, searches: 11 },
  { date: "2026-07-14", cases: 12, sketches: 8, searches: 14 },
  { date: "2026-07-18", cases: 8, sketches: 5, searches: 10 },
  { date: "2026-07-22", cases: 14, sketches: 10, searches: 15 },
  { date: "2026-07-26", cases: 11, sketches: 7, searches: 12 },
  { date: "2026-07-30", cases: 9, sketches: 6, searches: 10 },
  // August 2026
  { date: "2026-08-03", cases: 6, sketches: 4, searches: 8 },
  { date: "2026-08-07", cases: 10, sketches: 7, searches: 12 },
  { date: "2026-08-11", cases: 13, sketches: 9, searches: 14 },
  { date: "2026-08-15", cases: 8, sketches: 5, searches: 9 },
  { date: "2026-08-19", cases: 11, sketches: 8, searches: 12 },
  { date: "2026-08-23", cases: 15, sketches: 10, searches: 16 },
  { date: "2026-08-27", cases: 9, sketches: 6, searches: 11 },
  { date: "2026-08-31", cases: 7, sketches: 4, searches: 8 },
  // September 2026 (Focus 30-day range matching reference image)
  { date: "2026-09-01", cases: 4, sketches: 2, searches: 6 },
  { date: "2026-09-02", cases: 5, sketches: 3, searches: 7 },
  { date: "2026-09-03", cases: 4, sketches: 2, searches: 5 },
  { date: "2026-09-04", cases: 3, sketches: 2, searches: 5 },
  { date: "2026-09-05", cases: 4, sketches: 2, searches: 6 },
  { date: "2026-09-06", cases: 3, sketches: 3, searches: 5 },
  { date: "2026-09-07", cases: 5, sketches: 4, searches: 7 },
  { date: "2026-09-08", cases: 4, sketches: 3, searches: 6 },
  { date: "2026-09-09", cases: 6, sketches: 5, searches: 8 },
  { date: "2026-09-10", cases: 8, sketches: 6, searches: 9 },
  { date: "2026-09-11", cases: 11, sketches: 8, searches: 12 },
  { date: "2026-09-12", cases: 10, sketches: 9, searches: 11 },
  { date: "2026-09-13", cases: 8, sketches: 7, searches: 8 },
  { date: "2026-09-14", cases: 6, sketches: 5, searches: 7 },
  { date: "2026-09-15", cases: 7, sketches: 6, searches: 9 },
  { date: "2026-09-16", cases: 10, sketches: 8, searches: 11 },
  { date: "2026-09-17", cases: 9, sketches: 7, searches: 10 },
  { date: "2026-09-18", cases: 8, sketches: 6, searches: 8 },
  { date: "2026-09-19", cases: 7, sketches: 5, searches: 7 },
  { date: "2026-09-20", cases: 9, sketches: 6, searches: 8 },
  { date: "2026-09-21", cases: 11, sketches: 8, searches: 10 },
  { date: "2026-09-22", cases: 10, sketches: 7, searches: 9 },
  { date: "2026-09-23", cases: 8, sketches: 6, searches: 8 },
  { date: "2026-09-24", cases: 14, sketches: 10, searches: 11 },
  { date: "2026-09-25", cases: 22, sketches: 15, searches: 14 },
  { date: "2026-09-26", cases: 30, sketches: 20, searches: 18 },
  { date: "2026-09-27", cases: 35, sketches: 24, searches: 20 },
  { date: "2026-09-28", cases: 28, sketches: 22, searches: 17 },
  { date: "2026-09-29", cases: 24, sketches: 19, searches: 15 },
  { date: "2026-09-30", cases: 26, sketches: 20, searches: 16 },
  // October 2026
  { date: "2026-10-01", cases: 28, sketches: 21, searches: 18 },
  { date: "2026-10-02", cases: 24, sketches: 18, searches: 15 },
  { date: "2026-10-03", cases: 16, sketches: 13, searches: 12 },
  { date: "2026-10-04", cases: 12, sketches: 10, searches: 9 },
]

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
    label: "Database Searches",
    color: "#94a3b8",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("30d")
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)

  const filteredData = React.useMemo(() => {
    const referenceDate = new Date("2026-10-04")
    let daysToSubtract = 30
    if (timeRange === "90d") {
      daysToSubtract = 90
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)

    return chartData.filter((item) => {
      const date = new Date(item.date)
      return date >= startDate && date <= referenceDate
    })
  }, [timeRange])

  // Dynamically calculate clean Y-Axis boundary for optimal visualization
  const { maxY, yTicks } = React.useMemo(() => {
    const max = Math.max(
      ...filteredData.map((d) => Math.max(d.cases, d.sketches, d.searches)),
      30
    )
    const upperLimit = Math.ceil(max / 10) * 10
    const step = upperLimit / 4
    return {
      maxY: upperLimit,
      yTicks: [0, step, step * 2, step * 3, upperLimit],
    }
  }, [filteredData])

  return (
    <Card className="@container/card rounded-xl border border-border/70 bg-card/70 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/40 px-5 sm:px-6 py-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Investigation Activity
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Overview of cases, sketches and database searches over time.
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
                    onClick={() => setTimeRange(option.value)}
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
              {/* Blue Cases gradient with subtle #665AEF purple blend */}
              <linearGradient id="fillCases" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                <stop offset="50%" stopColor="#665AEF" stopOpacity={0.16} />
                <stop offset="95%" stopColor="#665AEF" stopOpacity={0.0} />
              </linearGradient>

              {/* Sketches Generated: #665AEF gradient with professional subtle decay */}
              <linearGradient id="fillSketches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#665AEF" stopOpacity={0.38} />
                <stop offset="55%" stopColor="#665AEF" stopOpacity={0.14} />
                <stop offset="95%" stopColor="#665AEF" stopOpacity={0.0} />
              </linearGradient>

              {/* Database Searches: soft slate gradient with a subtle touch of #665AEF */}
              <linearGradient id="fillSearches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity={0.20} />
                <stop offset="60%" stopColor="#665AEF" stopOpacity={0.06} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.0} />
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
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
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
                    })
                  }}
                  indicator="dot"
                />
              }
            />

            <Area
              dataKey="searches"
              type="natural"
              fill="url(#fillSearches)"
              stroke="#94a3b8"
              strokeWidth={1.5}
              isAnimationActive={true}
              animationDuration={450}
            />
            <Area
              dataKey="sketches"
              type="natural"
              fill="url(#fillSketches)"
              stroke="#665AEF"
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={450}
            />
            <Area
              dataKey="cases"
              type="natural"
              fill="url(#fillCases)"
              stroke="#3b82f6"
              strokeWidth={2}
              isAnimationActive={true}
              animationDuration={450}
            />
          </AreaChart>
        </ChartContainer>

        {/* Legend matching reference image */}
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
            <span className="size-2.5 rounded-full bg-[#94a3b8]" />
            <span className="font-medium text-foreground/90">Database Searches</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
