import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface CaseFormSkeletonProps {
  mode?: "new" | "edit";
}

export function CaseFormSkeleton({ mode = "new" }: CaseFormSkeletonProps) {
  const isNew = mode === "new";

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto pb-28 sm:pb-16 min-w-0 animate-pulse duration-1000">
      {/* Top Header Bar Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-4 border-b-2 border-border/60">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 -mt-1 sm:-mt-1.5 mb-1.5 sm:mb-2.5">
            <Skeleton className="h-4 w-28 rounded-md bg-muted/50" />
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Skeleton className="h-8 w-28 sm:w-36 rounded-lg bg-muted/60" />
            <Skeleton className="h-8 w-32 sm:w-36 rounded-lg bg-[#665AEF]/25 border-2 border-[#665AEF]/30" />
            {isNew && (
              <Skeleton className="h-5 w-20 rounded-md bg-emerald-500/20" />
            )}
          </div>
          <Skeleton className="h-4 w-72 sm:w-96 max-w-full rounded-md bg-muted/40 mt-1" />
        </div>

        {/* Action Controls Skeleton */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <Skeleton className="h-10 sm:h-9 w-full sm:w-20 rounded-lg border-2 border-border/70 bg-card/60" />
          <Skeleton className="h-10 sm:h-9 w-full sm:w-20 rounded-lg border-2 border-border/70 bg-card/60" />
          <Skeleton className="h-10 sm:h-9 w-full sm:w-32 rounded-lg bg-[#665AEF]/70" />
        </div>
      </div>

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column (8 cols): Primary Details, Narrative, Location */}
        <div className="xl:col-span-8 space-y-5 sm:space-y-6 min-w-0">
          {/* Card 1: Core Classification & Status Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <Skeleton className="size-4 sm:size-4.5 rounded-md bg-[#665AEF]/30 shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-44 sm:w-56 rounded-md bg-muted/60" />
                  <Skeleton className="h-3.5 w-60 sm:w-72 rounded bg-muted/40" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5">
              {/* Row 1: Case Number & Case Title */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4">
                <div className="sm:col-span-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-3 w-20 rounded bg-muted/50" />
                    {isNew && <Skeleton className="h-3 w-14 rounded bg-[#665AEF]/30" />}
                  </div>
                  <Skeleton className="h-10 w-full rounded-lg border-2 border-border/60 bg-muted/30" />
                </div>
                <div className="sm:col-span-8 space-y-2">
                  <Skeleton className="h-3 w-24 rounded bg-muted/50" />
                  <Skeleton className="h-10 w-full rounded-lg border-2 border-border/70 bg-background/50" />
                </div>
              </div>

              {/* Row 2: Case Type, Status, Priority, Date, Time Dropdowns */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20 rounded bg-muted/50" />
                    <Skeleton className="h-10 w-full rounded-lg border-2 border-border/70 bg-background/50" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Incident Timeline & Location Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <Skeleton className="size-4 sm:size-4.5 rounded-md bg-[#665AEF]/30 shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-48 sm:w-60 rounded-md bg-muted/60" />
                  <Skeleton className="h-3.5 w-56 sm:w-68 rounded bg-muted/40" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5">
              {/* Row 1: Region / City & Street Landmark */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-28 rounded bg-muted/50" />
                  <Skeleton className="h-10 w-full rounded-lg border-2 border-border/70 bg-background/50" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-3 w-36 rounded bg-muted/50" />
                  <Skeleton className="h-10 w-full rounded-lg border-2 border-border/70 bg-background/50" />
                </div>
              </div>

              {/* Quick Location Presets */}
              <div className="space-y-2 pt-0.5">
                <Skeleton className="h-3 w-32 rounded bg-muted/50" />
                <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-7 w-24 sm:w-28 rounded-md border-2 border-border/70 bg-card/60" />
                  ))}
                </div>
              </div>

              {/* GPS Coordinates Box Skeleton */}
              <div className="p-3 sm:p-4 rounded-xl border-2 border-border/80 bg-muted/20 space-y-3 sm:space-y-3.5">
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b-2 border-border/60">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-3.5 rounded bg-[#665AEF]/30" />
                    <Skeleton className="h-4 w-44 rounded bg-muted/60" />
                  </div>
                  <Skeleton className="h-4 w-20 rounded bg-emerald-500/20" />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <Skeleton className="h-8 rounded-lg border-2 border-border/70 bg-card/60" />
                  <Skeleton className="h-8 rounded-lg border-2 border-border/70 bg-card/60" />
                  <Skeleton className="h-8 rounded-lg border-2 border-border/70 bg-card/60" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-20 rounded bg-muted/40" />
                    <Skeleton className="h-9 w-full rounded-md bg-muted/30 border border-border/60" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-22 rounded bg-muted/40" />
                    <Skeleton className="h-9 w-full rounded-md bg-muted/30 border border-border/60" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Forensic Narrative & Investigative Log Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <Skeleton className="size-4 sm:size-4.5 rounded-md bg-[#665AEF]/30 shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-56 sm:w-64 rounded-md bg-muted/60" />
                  <Skeleton className="h-3.5 w-60 sm:w-80 rounded bg-muted/40" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5">
              <div className="space-y-2">
                <Skeleton className="h-3 w-40 rounded bg-muted/50" />
                <Skeleton className="h-20 w-full rounded-lg border-2 border-border/70 bg-background/50" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-56 rounded bg-muted/50" />
                <Skeleton className="h-28 w-full rounded-lg border-2 border-border/70 bg-background/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Personnel, Tags, and Audit Meta */}
        <div className="xl:col-span-4 space-y-5 sm:space-y-6 min-w-0">
          {/* Card 4: Personnel Assignment Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <Skeleton className="size-4 sm:size-4.5 rounded-md bg-[#665AEF]/30 shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-36 sm:w-44 rounded-md bg-muted/60" />
                  <Skeleton className="h-3.5 w-48 sm:w-56 rounded bg-muted/40" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-28 rounded bg-muted/50" />
                  <Skeleton className="h-10 w-full rounded-lg border-2 border-border/70 bg-background/50" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Card 5: Classification Tags Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <Skeleton className="size-4 sm:size-4.5 rounded-md bg-[#665AEF]/30 shrink-0" />
                <div className="space-y-1">
                  <Skeleton className="h-5 w-32 sm:w-40 rounded-md bg-muted/60" />
                  <Skeleton className="h-3.5 w-44 sm:w-52 rounded bg-muted/40" />
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24 rounded bg-muted/50" />
                <div className="p-3 rounded-lg border-2 border-border/70 bg-background/40 min-h-16 flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-20 rounded-md bg-muted/50" />
                  <Skeleton className="h-7 w-24 rounded-md bg-muted/50" />
                  <Skeleton className="h-7 w-28 rounded-md bg-muted/50" />
                </div>
              </div>

              <div className="space-y-2">
                <Skeleton className="h-3 w-28 rounded bg-muted/50" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 flex-1 rounded-lg border-2 border-border/70 bg-background/50" />
                  <Skeleton className="h-10 w-16 rounded-lg border-2 border-border/70 bg-card/60" />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Skeleton className="h-3 w-24 rounded bg-muted/50" />
                <div className="flex items-center gap-2 overflow-x-auto sm:flex-wrap">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-7 w-20 sm:w-24 rounded-md border-2 border-border/70 bg-card/60" />
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 6: Audit & Security Ledger Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-5 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded bg-muted/50" />
                <Skeleton className="h-4 w-36 rounded bg-muted/60" />
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 pt-3.5 sm:pt-4 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-1 gap-2.5">
                <Skeleton className="h-10 rounded-lg border-2 border-border/60 bg-muted/20" />
                <Skeleton className="h-10 rounded-lg border-2 border-border/60 bg-muted/20" />
              </div>
              <Separator className="my-2 bg-border/40" />
              <div className="flex items-start gap-2">
                <Skeleton className="size-3.5 rounded-full bg-[#665AEF]/30 shrink-0 mt-0.5" />
                <Skeleton className="h-8 flex-1 rounded bg-muted/30" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Sticky Action Bar Skeleton */}
      <div className="sticky bottom-0 sm:bottom-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 p-3 sm:p-3.5 rounded-t-xl sm:rounded-xl border-t-2 sm:border-2 border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2">
          <Skeleton className="size-3.5 rounded-full bg-amber-400/30 shrink-0" />
          <Skeleton className="h-3.5 w-72 sm:w-96 rounded bg-muted/40" />
        </div>
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Skeleton className="h-10 sm:h-9 w-full sm:w-20 rounded-lg border-2 border-border/70 bg-card" />
          <Skeleton className="h-10 sm:h-9 w-full sm:w-28 rounded-lg bg-[#665AEF]/70" />
        </div>
      </div>
    </div>
  );
}
