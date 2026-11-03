import * as React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function DashboardHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="space-y-2">
        <Skeleton className="h-8 w-52 sm:w-64 rounded-lg bg-muted/60" />
        <Skeleton className="h-4 w-64 sm:w-80 rounded-md bg-muted/40" />
      </div>
      <div className="flex items-center">
        <Skeleton className="h-8.5 w-[180px] sm:w-[210px] rounded-lg border-2 border-border/40 bg-muted/30" />
      </div>
    </div>
  )
}

export function SectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 lg:grid-cols-4 max-w-7xl mx-auto w-full">
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={i}
          className="flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card/75 p-3.5 sm:p-5 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-3.5 w-20 sm:w-24 rounded bg-muted/50" />
            <Skeleton className="size-4.5 rounded bg-muted/40" />
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Skeleton className="h-7 sm:h-8 w-14 sm:w-20 rounded-md bg-muted/60" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="h-3.5 w-9 rounded bg-emerald-500/20" />
              <Skeleton className="h-3 w-16 sm:w-20 rounded bg-muted/40" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <Card className="rounded-xl border border-border/70 bg-card/75 shadow-xs overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border/40 px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-40 sm:w-44 rounded bg-muted/60" />
            <Skeleton className="h-3.5 w-60 sm:w-80 rounded bg-muted/40" />
          </div>
          <div className="flex items-center">
            <Skeleton className="h-7.5 w-[160px] rounded-lg border border-border/60 bg-muted/30" />
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6 pb-4 space-y-4 sm:space-y-6">
          {/* Chart placeholder */}
          <div className="h-[210px] sm:h-[260px] w-full rounded-xl border border-dashed border-border/40 bg-muted/10 p-4 flex flex-col justify-end gap-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent pointer-events-none" />
            <div className="flex items-end justify-between gap-2 h-32 px-2 opacity-30">
              <Skeleton className="w-full h-10 rounded-t bg-muted/40" />
              <Skeleton className="w-full h-14 rounded-t bg-muted/40" />
              <Skeleton className="w-full h-8 rounded-t bg-muted/40" />
              <Skeleton className="w-full h-20 rounded-t bg-muted/40" />
              <Skeleton className="w-full h-28 rounded-t bg-muted/50" />
              <Skeleton className="w-full h-24 rounded-t bg-muted/40" />
              <Skeleton className="w-full h-16 rounded-t bg-muted/40" />
              <Skeleton className="w-full h-12 rounded-t bg-muted/40" />
            </div>
            <Skeleton className="h-3 w-full rounded bg-muted/30" />
          </div>

          {/* Legend dots */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-1 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Skeleton className="size-2 sm:size-2.5 rounded-full bg-blue-500/40" />
              <Skeleton className="h-3 w-18 rounded bg-muted/40" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Skeleton className="size-2 sm:size-2.5 rounded-full bg-[#665AEF]/40" />
              <Skeleton className="h-3 w-22 rounded bg-muted/40" />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Skeleton className="size-2 sm:size-2.5 rounded-full bg-emerald-500/40" />
              <Skeleton className="h-3 w-20 rounded bg-muted/40" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function RecentCasesTableSkeleton() {
  return (
    <Card className="rounded-xl border border-border/70 bg-card/75 shadow-xs h-full flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 sm:gap-4 border-b border-border/40 px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-28 rounded bg-muted/60" />
          <Skeleton className="h-3.5 w-48 rounded bg-muted/40" />
        </div>
        <Skeleton className="h-3.5 w-16 rounded bg-muted/40" />
      </CardHeader>
      <CardContent className="p-0 flex-1">
        {/* Mobile card stack skeleton */}
        <div className="block sm:hidden divide-y divide-border/40">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3.5 space-y-2">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-20 rounded bg-muted/50" />
                <Skeleton className="h-4 w-24 rounded-md bg-muted/40" />
              </div>
              <Skeleton className="h-4 w-3/4 rounded bg-muted/40" />
              <div className="flex justify-between items-center pt-1">
                <Skeleton className="h-3 w-16 rounded bg-muted/30" />
                <Skeleton className="h-3 w-10 rounded bg-muted/30" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table skeleton */}
        <div className="hidden sm:block overflow-x-auto">
          <Table className="w-full">
            <TableHeader>
              <TableRow className="border-border/40 hover:bg-transparent">
                <TableHead className="w-[120px] pl-5 sm:pl-6 text-xs font-medium">
                  <Skeleton className="h-3 w-16 rounded bg-muted/40" />
                </TableHead>
                <TableHead className="text-xs font-medium">
                  <Skeleton className="h-3 w-12 rounded bg-muted/40" />
                </TableHead>
                <TableHead className="w-[110px] text-xs font-medium">
                  <Skeleton className="h-3 w-10 rounded bg-muted/40" />
                </TableHead>
                <TableHead className="w-[150px] text-xs font-medium">
                  <Skeleton className="h-3 w-14 rounded bg-muted/40" />
                </TableHead>
                <TableHead className="w-[60px] pr-5 sm:pr-6 text-right">
                  <Skeleton className="h-3 w-10 rounded bg-muted/40 ml-auto" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell className="pl-5 sm:pl-6">
                    <Skeleton className="h-3.5 w-20 rounded bg-muted/50" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-36 rounded bg-muted/40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-3.5 w-18 rounded bg-muted/30" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24 rounded-md bg-muted/30" />
                  </TableCell>
                  <TableCell className="pr-5 sm:pr-6 text-right">
                    <Skeleton className="size-6 rounded-md bg-muted/30 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}

export function RecentSketchesSkeleton() {
  return (
    <Card className="rounded-xl border border-border/70 bg-card/75 shadow-xs h-full flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 sm:gap-4 border-b border-border/40 px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="space-y-1.5">
          <Skeleton className="h-5 w-32 rounded bg-muted/60" />
          <Skeleton className="h-3.5 w-52 rounded bg-muted/40" />
        </div>
        <Skeleton className="h-3.5 w-16 rounded bg-muted/40" />
      </CardHeader>
      <CardContent className="p-3.5 sm:p-5 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-border/60 bg-card/40 p-2 space-y-2">
              <Skeleton className="aspect-square w-full rounded-lg bg-muted/50" />
              <Skeleton className="h-3.5 w-24 rounded bg-muted/40" />
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-16 rounded bg-muted/30" />
                <Skeleton className="h-3 w-8 rounded bg-muted/30" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 animate-pulse duration-1000 w-full">
      {/* 1. Header Skeleton */}
      <DashboardHeaderSkeleton />

      {/* 2. Metric Cards Skeleton */}
      <SectionCardsSkeleton />

      {/* 3. Area Chart Skeleton */}
      <ChartSkeleton />

      {/* 4. Bottom Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 px-4 sm:px-6 lg:px-8 lg:grid-cols-12 max-w-7xl mx-auto w-full items-stretch">
        <div className="lg:col-span-7 flex flex-col">
          <RecentCasesTableSkeleton />
        </div>
        <div className="lg:col-span-5 flex flex-col">
          <RecentSketchesSkeleton />
        </div>
      </div>
    </div>
  )
}
