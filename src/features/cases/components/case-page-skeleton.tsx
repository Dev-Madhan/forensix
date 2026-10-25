import * as React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function CaseSectionCardsSkeleton() {
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

export function CasesTableSkeleton() {
  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 shadow-xs overflow-hidden">
      {/* Table Toolbar Skeleton */}
      <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Skeleton className="h-10 w-full rounded-lg border-2 border-border/70 bg-background/50" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Skeleton className="h-9 w-24 rounded-lg border-2 border-border/70 bg-card/60" />
            <Skeleton className="h-9 w-28 rounded-lg border-2 border-border/70 bg-card/60" />
            <Skeleton className="h-9 w-24 rounded-lg border-2 border-border/70 bg-card/60" />
          </div>
        </div>
      </div>

      {/* Table Body Skeleton */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/40 hover:bg-transparent">
              <TableHead className="w-12 pl-4 sm:pl-6">
                <Skeleton className="size-4 rounded bg-muted/40" />
              </TableHead>
              <TableHead className="w-[130px]">
                <Skeleton className="h-3.5 w-18 rounded bg-muted/50" />
              </TableHead>
              <TableHead className="min-w-[200px]">
                <Skeleton className="h-3.5 w-24 rounded bg-muted/50" />
              </TableHead>
              <TableHead className="w-[120px]">
                <Skeleton className="h-3.5 w-14 rounded bg-muted/50" />
              </TableHead>
              <TableHead className="w-[140px]">
                <Skeleton className="h-3.5 w-18 rounded bg-muted/50" />
              </TableHead>
              <TableHead className="w-[120px]">
                <Skeleton className="h-3.5 w-12 rounded bg-muted/50" />
              </TableHead>
              <TableHead className="w-[140px]">
                <Skeleton className="h-3.5 w-16 rounded bg-muted/50" />
              </TableHead>
              <TableHead className="w-[140px]">
                <Skeleton className="h-3.5 w-20 rounded bg-muted/50" />
              </TableHead>
              <TableHead className="w-14 pr-4 sm:pr-6 text-right">
                <Skeleton className="size-4 rounded bg-muted/40 ml-auto" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <TableRow key={i} className="border-border/40">
                <TableCell className="pl-4 sm:pl-6">
                  <Skeleton className="size-4 rounded bg-muted/30" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24 rounded-md bg-[#665AEF]/20 border border-[#665AEF]/30" />
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-44 sm:w-56 rounded bg-muted/50" />
                    <Skeleton className="h-3 w-64 rounded bg-muted/30" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-16 rounded bg-muted/40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-24 rounded bg-muted/40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-20 rounded bg-muted/40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-28 rounded-md bg-muted/40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-3.5 w-24 rounded bg-muted/40" />
                </TableCell>
                <TableCell className="pr-4 sm:pr-6 text-right">
                  <Skeleton className="size-6 rounded-md bg-muted/30 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Bar Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-t border-border/40">
        <Skeleton className="h-4 w-44 rounded bg-muted/40" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="size-8 rounded-md bg-muted/30" />
          <Skeleton className="size-8 rounded-md bg-[#665AEF]/70" />
          <Skeleton className="size-8 rounded-md bg-muted/30" />
          <Skeleton className="size-8 rounded-md bg-muted/30" />
        </div>
      </div>
    </Card>
  );
}

export function CasePageSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full animate-pulse duration-1000">
      {/* Header: Title & Action Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 sm:w-64 rounded-lg bg-muted/60" />
          <Skeleton className="h-4 w-72 sm:w-80 rounded-md bg-muted/40" />
        </div>
        <Skeleton className="h-10 w-28 sm:w-32 rounded-lg bg-[#665AEF]/70" />
      </div>

      {/* 4 Section Cards Skeleton */}
      <CaseSectionCardsSkeleton />

      {/* Cases Table Skeleton */}
      <CasesTableSkeleton />
    </div>
  );
}
