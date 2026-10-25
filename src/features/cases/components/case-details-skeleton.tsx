import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CaseDetailsSkeleton() {
  return (
    <div className="flex flex-col gap-6 w-full animate-pulse duration-1000">
      {/* 1. Case Details Header Skeleton */}
      <div className="flex flex-col gap-5 w-full pb-2">
        {/* Top Bar: Back link on left, Action buttons on right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Back to Cases Link & Sidebar Trigger Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="size-7 rounded-md bg-muted/50" />
            <div className="flex items-center gap-2">
              <Skeleton className="size-4 rounded-full bg-muted/40" />
              <Skeleton className="h-4 w-24 rounded-md bg-muted/50" />
            </div>
          </div>

          {/* Action Buttons: Edit Case, Generate Report, More Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Skeleton className="h-9 w-24 rounded-lg border-2 border-border/80 bg-card/60" />
            <Skeleton className="h-9 w-32 rounded-lg border-2 border-border/80 bg-card/60" />
            <Skeleton className="h-9 w-28 rounded-lg bg-[#665AEF]/70" />
          </div>
        </div>

        {/* Case ID and Status Badge */}
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-8 sm:h-9 w-36 sm:w-44 rounded-lg bg-muted/60" />
          <Skeleton className="h-6 w-32 rounded-md border-2 border-[#7E22CE]/40 bg-[#2D1B4E]/60" />
        </div>

        {/* Case Title and Description */}
        <div className="space-y-2">
          <Skeleton className="h-6 sm:h-7 w-72 sm:w-96 max-w-full rounded-md bg-muted/60" />
          <div className="space-y-1.5 max-w-4xl pt-0.5">
            <Skeleton className="h-4 w-full rounded bg-muted/40" />
            <Skeleton className="h-4 w-4/5 rounded bg-muted/30" />
          </div>
        </div>

        {/* Diffused Horizontal Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-border/80 to-transparent my-1" />

        {/* 4 Metadata Columns row */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full pt-1">
          <div className="xl:col-span-8 2xl:col-span-8 min-w-0">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {[
                { w1: "w-24", w2: "w-20" },
                { w1: "w-20", w2: "w-24" },
                { w1: "w-28", w2: "w-16" },
                { w1: "w-24", w2: "w-18" },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 min-w-0">
                  <Skeleton className="size-5 rounded-md bg-muted/50 shrink-0" />
                  <div className="space-y-1 min-w-0">
                    <Skeleton className={`h-4 ${item.w1} rounded bg-muted/60`} />
                    <Skeleton className={`h-3 ${item.w2} rounded bg-muted/40`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Grid: Left Tabs Column & Right Inspector Column */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
        {/* Left Column (8 cols): Tabs, Stats, Info, Narrative, Activity & Notes */}
        <div className="xl:col-span-8 2xl:col-span-8 space-y-6 min-w-0">
          {/* Tab Navigation List Skeleton */}
          <div className="border-b border-border/60 pb-px">
            <div className="flex w-full justify-start overflow-x-auto gap-2 sm:gap-4 h-11 items-center px-0">
              <Skeleton className="h-8 w-20 rounded-md bg-muted/60 border-b-2 border-[#665AEF]" />
              <Skeleton className="h-8 w-28 rounded-md bg-muted/40" />
              <Skeleton className="h-8 w-24 rounded-md bg-muted/40" />
              <Skeleton className="h-8 w-28 rounded-md bg-muted/40" />
            </div>
          </div>

          {/* Quick Stat Cards Skeleton (4 cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="border border-border/80 bg-card/40 p-3.5 sm:p-4 rounded-xl shadow-2xs flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <Skeleton className="size-5 rounded-md bg-[#665AEF]/30" />
                  <Skeleton className="size-4 rounded-md bg-muted/30" />
                </div>
                <div className="mt-3 space-y-1.5">
                  <Skeleton className="h-7 w-10 rounded-md bg-muted/60" />
                  <Skeleton className="h-3 w-20 rounded bg-muted/40" />
                </div>
              </div>
            ))}
          </div>

          {/* Side-by-Side Cards: Case Information & Case Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Case Information */}
            <Card className="border border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Skeleton className="size-4 rounded bg-[#665AEF]/30" />
                  <Skeleton className="h-5 w-32 rounded bg-muted/60" />
                </div>
                <Skeleton className="h-7.5 w-24 rounded-lg border-2 border-border/80 bg-card/60" />
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-3 text-xs sm:text-sm">
                  {[
                    { label: "w-16", val: "w-24" },
                    { label: "w-20", val: "w-36" },
                    { label: "w-18", val: "w-20" },
                    { label: "w-24", val: "w-24" },
                    { label: "w-28", val: "w-20" },
                    { label: "w-16", val: "w-32" },
                    { label: "w-14", val: "w-28" },
                    { label: "w-20", val: "w-28" },
                  ].map((row, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="size-3.5 rounded bg-muted/40 shrink-0" />
                        <Skeleton className={`h-3.5 ${row.label} rounded bg-muted/40`} />
                      </div>
                      <Skeleton className={`h-3.5 ${row.val} rounded bg-muted/60`} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Case Description & Tags */}
            <Card className="border border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs flex flex-col justify-between">
              <div>
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                  <div className="flex items-center gap-2">
                    <Skeleton className="size-4 rounded bg-[#665AEF]/30" />
                    <Skeleton className="h-5 w-36 rounded bg-muted/60" />
                  </div>
                  <Skeleton className="h-7.5 w-32 rounded-lg border-2 border-border/80 bg-card/60" />
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  <Skeleton className="h-3.5 w-full rounded bg-muted/40" />
                  <Skeleton className="h-3.5 w-full rounded bg-muted/40" />
                  <Skeleton className="h-3.5 w-11/12 rounded bg-muted/40" />
                  <Skeleton className="h-3.5 w-4/5 rounded bg-muted/40" />
                  <Skeleton className="h-3.5 w-3/4 rounded bg-muted/40" />
                </CardContent>
              </div>

              {/* Tags Section */}
              <div className="p-4 sm:p-5 pt-3 border-t border-border/40 space-y-2.5">
                <Skeleton className="h-3 w-12 rounded bg-muted/40" />
                <div className="flex flex-wrap items-center gap-2">
                  {[1, 2, 3, 4, 5].map((t) => (
                    <Skeleton
                      key={t}
                      className="h-8 w-20 sm:w-24 rounded-md border-2 border-border/80 bg-muted/40"
                    />
                  ))}
                  <Skeleton className="h-8 w-24 rounded-md border-2 border-dashed border-border/80 bg-card/40" />
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity Card Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b-2 border-border/60">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded bg-[#665AEF]/30 shrink-0" />
                <Skeleton className="h-5 w-32 rounded bg-muted/60" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-28 rounded bg-muted/40" />
                <Skeleton className="h-7.5 w-24 rounded-md border-2 border-border/80 bg-card/60" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {[1, 2, 3].map((act) => (
                <div
                  key={act}
                  className="flex items-start gap-2.5 py-2 border-b border-border/30 last:border-0 last:pb-0 first:pt-0"
                >
                  <Skeleton className="size-6 sm:size-7 rounded-full bg-muted/50 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
                    <div className="space-y-1 min-w-0">
                      <Skeleton className="h-4 w-28 rounded bg-muted/60" />
                      <Skeleton className="h-3.5 w-60 sm:w-80 max-w-full rounded bg-muted/40" />
                    </div>
                    <Skeleton className="h-3 w-28 rounded bg-muted/40 shrink-0" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Investigation Notes Card Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b-2 border-border/60">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded bg-[#665AEF]/30 shrink-0" />
                <Skeleton className="h-5 w-36 rounded bg-muted/60" />
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-28 rounded bg-muted/40" />
                <Skeleton className="h-7.5 w-24 rounded-md border-2 border-border/80 bg-card/60" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              {[1, 2].map((note) => (
                <div
                  key={note}
                  className="flex items-start gap-2.5 py-2.5 border-b border-border/30 last:border-0 last:pb-0 first:pt-0"
                >
                  <Skeleton className="size-6 sm:size-7 rounded-full bg-muted/50 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <Skeleton className="h-4 w-28 rounded bg-muted/60" />
                      <Skeleton className="h-3 w-24 rounded bg-muted/40" />
                    </div>
                    <Skeleton className="h-3.5 w-full rounded bg-muted/40" />
                    <Skeleton className="h-3.5 w-4/5 rounded bg-muted/40" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (4 cols): Case Status, Key Details, Incident Media & Location */}
        <div className="space-y-6 xl:col-span-4 2xl:col-span-4 min-w-0">
          {/* Card 1: Case Status Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-4.5 rounded bg-[#665AEF]/30 shrink-0" />
                <Skeleton className="h-5 w-28 rounded bg-muted/60" />
              </div>
              <Skeleton className="h-6 w-32 rounded-md border-2 border-[#7E22CE]/40 bg-[#2D1B4E]/60" />
            </CardHeader>
            <CardContent className="pt-5 pb-5 px-2 sm:px-4">
              <div className="grid grid-cols-4 w-full">
                {[
                  { label: "Reported", active: true },
                  { label: "Investigating", active: true },
                  { label: "Analysis", active: false },
                  { label: "Closed", active: false },
                ].map((step, idx) => (
                  <div key={idx} className="relative flex flex-col items-center">
                    {idx < 3 && (
                      <div className="absolute top-3 left-1/2 w-full h-[2px] -translate-y-1/2 z-0">
                        <div
                          className={`w-full h-full ${
                            idx === 0 ? "bg-[#665AEF]/50" : "bg-border/70"
                          }`}
                        />
                      </div>
                    )}
                    <div className="relative z-10 flex items-center justify-center size-6">
                      {step.active ? (
                        <div className="size-5 rounded-full bg-[#665AEF]/70 ring-4 ring-card" />
                      ) : (
                        <div className="size-3.5 rounded-full bg-muted-foreground/30 ring-4 ring-card" />
                      )}
                    </div>
                    <div className="mt-2.5 flex flex-col items-center text-center space-y-1">
                      <Skeleton className="h-3.5 w-14 rounded bg-muted/50" />
                      <Skeleton className="h-2.5 w-10 rounded bg-muted/30" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Key Details Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-4.5 rounded bg-[#665AEF]/30 shrink-0" />
                <Skeleton className="h-5 w-28 rounded bg-muted/60" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-4 px-4 sm:px-5">
              <div className="flex flex-col divide-y divide-border/25">
                {[
                  { w1: "w-20", w2: "w-32" },
                  { w1: "w-24", w2: "w-36" },
                  { w1: "w-20", w2: "w-20" },
                  { w1: "w-16", w2: "w-14" },
                  { w1: "w-24", w2: "w-28" },
                  { w1: "w-24", w2: "w-32" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1 gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <Skeleton className="size-4 rounded bg-muted/40 shrink-0" />
                      <Skeleton className={`h-3.5 ${item.w1} rounded bg-muted/40`} />
                    </div>
                    <Skeleton className={`h-3.5 ${item.w2} rounded bg-muted/60`} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Incident Media Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-4.5 rounded bg-[#665AEF]/30 shrink-0" />
                <Skeleton className="h-5 w-32 rounded bg-muted/60" />
              </div>
            </CardHeader>
            <CardContent className="pt-4 pb-4 px-4 sm:px-5">
              {/* Media Frame Viewer Skeleton */}
              <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border-2 border-border/80 bg-muted/20">
                {/* Top-Right Tag Skeleton */}
                <div className="absolute top-2.5 right-2.5 flex flex-col items-end gap-1">
                  <Skeleton className="h-4 w-16 rounded bg-black/60" />
                  <Skeleton className="h-3 w-28 rounded bg-black/50" />
                </div>
                {/* Left/Right Controls */}
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/50 border border-white/20" />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/50 border border-white/20" />
                {/* Bottom-Right Counter */}
                <div className="absolute bottom-2.5 right-2.5">
                  <Skeleton className="h-5 w-10 rounded bg-black/60" />
                </div>
              </div>

              {/* Caption & View All Media Link */}
              <div className="mt-3 flex items-center justify-between gap-3">
                <Skeleton className="h-3.5 w-44 rounded bg-muted/40" />
                <Skeleton className="h-3.5 w-24 rounded bg-[#665AEF]/40" />
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Incident Location Skeleton */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5">
                <Skeleton className="size-4.5 rounded bg-[#665AEF]/30 shrink-0" />
                <Skeleton className="h-5 w-36 rounded bg-muted/60" />
              </div>
              <Skeleton className="h-3.5 w-24 rounded bg-[#665AEF]/40" />
            </CardHeader>
            <CardContent className="pt-4 pb-4 px-4 sm:px-5">
              {/* Map Container Skeleton */}
              <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border-2 border-border/80 bg-[#090D14] flex items-center justify-center">
                {/* Top-Left GPS Tag */}
                <div className="absolute top-2.5 left-2.5">
                  <Skeleton className="h-6 w-36 rounded-md border-2 border-border/80 bg-background/85" />
                </div>
                {/* Center Radar Pulsing Blip */}
                <div className="relative flex items-center justify-center size-8">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#665AEF]/30 animate-ping" />
                  <div className="size-4 rounded-full bg-[#665AEF]/80 ring-2 ring-white/60" />
                </div>
                {/* Bottom-Left Location Badge */}
                <div className="absolute bottom-2.5 left-2.5">
                  <Skeleton className="h-7 w-48 rounded-md border-2 border-border/80 bg-background/85" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
