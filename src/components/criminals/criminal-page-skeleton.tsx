import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function CriminalSectionCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card
          key={i}
          className="flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card/70 p-4.5 sm:p-5 shadow-xs"
        >
          <div className="flex items-center justify-between gap-2">
            <Skeleton className="h-4 w-28 rounded bg-muted/50" />
            <Skeleton className="size-4.5 rounded-md bg-[#665AEF]/30 shrink-0" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-8 w-20 rounded-md bg-muted/60" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-10 rounded bg-emerald-500/20" />
              <Skeleton className="h-3 w-24 rounded bg-muted/40" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function CriminalsTableSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_400px] items-start w-full">
      <div className="space-y-4 min-w-0 w-full">
        {/* Filter bar skeleton */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <Skeleton className="h-10 flex-1 rounded-lg border-2 border-border/70 bg-background/50" />
          <div className="flex items-end gap-2.5">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 rounded bg-muted/40" />
              <Skeleton className="h-10 w-32 rounded-lg border-2 border-border/70 bg-card/60" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 rounded bg-muted/40" />
              <Skeleton className="h-10 w-32 rounded-lg border-2 border-border/70 bg-card/60" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 rounded bg-muted/40" />
              <Skeleton className="h-10 w-32 rounded-lg border-2 border-border/70 bg-card/60" />
            </div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-xl border-2 border-border bg-card/40 overflow-hidden shadow-xs">
          <Table>
            <TableHeader className="bg-card/70 border-b-2 border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-9 px-2.5 py-3">
                  <Skeleton className="size-4 rounded bg-muted/40" />
                </TableHead>
                {[60, 36, 100, 64, 72, 100, 60, 60, 32].map((w, i) => (
                  <TableHead key={i} className="px-2.5 py-3">
                    <Skeleton className={`h-3.5 rounded bg-muted/50`} style={{ width: w }} />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <TableRow key={i} className="border-border/40">
                  <TableCell className="px-2.5 py-3">
                    <Skeleton className="size-4 rounded bg-muted/30" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3">
                    <Skeleton className="size-9 rounded-full bg-muted/40" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3">
                    <div className="space-y-1">
                      <Skeleton className="h-4 w-28 rounded bg-muted/50" />
                      <Skeleton className="h-3 w-20 rounded bg-muted/30" />
                    </div>
                  </TableCell>
                  <TableCell className="px-2.5 py-3">
                    <Skeleton className="h-3.5 w-16 rounded bg-muted/40" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3">
                    <Skeleton className="h-3.5 w-24 rounded bg-muted/40" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3">
                    <Skeleton className="h-5 w-20 rounded-md bg-muted/40" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3">
                    <Skeleton className="h-5 w-14 rounded-md bg-muted/40" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3">
                    <Skeleton className="h-5 w-16 rounded-md bg-muted/40" />
                  </TableCell>
                  <TableCell className="px-2.5 py-3 text-right">
                    <Skeleton className="size-6 rounded-md bg-muted/30 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border-t-2 border-border/40">
            <Skeleton className="h-4 w-44 rounded bg-muted/40" />
            <div className="flex items-center gap-1.5">
              <Skeleton className="size-8 rounded-md bg-muted/30" />
              <Skeleton className="size-8 rounded-md bg-[#665AEF]/70" />
              <Skeleton className="size-8 rounded-md bg-muted/30" />
              <Skeleton className="size-8 rounded-md bg-muted/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Profile preview skeleton */}
      <div className="w-full xl:w-[380px] 2xl:w-[400px] xl:sticky xl:top-6 min-w-0">
        <div className="rounded-xl border-2 border-border bg-card/40 p-4 sm:p-5 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-36 rounded bg-muted/60" />
              <Skeleton className="h-3.5 w-24 rounded bg-muted/40" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full bg-rose-500/20" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="size-24 sm:size-28 rounded-lg bg-muted/40" />
            <div className="flex-1 space-y-2.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="space-y-1">
                  <Skeleton className="h-3 w-20 rounded bg-muted/40" />
                  <Skeleton className="h-3 w-32 rounded bg-muted/30" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3.5 w-14 rounded bg-muted/50" />
            <div className="flex gap-1.5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-16 rounded-md bg-muted/40" />
              ))}
            </div>
          </div>
          <Skeleton className="h-10 w-full rounded-lg bg-[#665AEF]/70" />
        </div>
      </div>
    </div>
  );
}

export function CriminalPageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full animate-pulse duration-1000">
      {/* Header: Title & Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 sm:w-64 rounded-lg bg-muted/60" />
          <Skeleton className="h-4 w-72 sm:w-96 rounded-md bg-muted/40" />
        </div>
        <Skeleton className="h-10 w-28 sm:w-32 rounded-lg bg-[#665AEF]/70" />
      </div>

      {/* 4 Section Cards Skeleton */}
      <CriminalSectionCardsSkeleton />

      {/* Criminals Table Skeleton */}
      <CriminalsTableSkeleton />
    </div>
  );
}
