"use client";

import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Edit3,
  Brain,
  UserCheck,
  ScanFace,
  StickyNote,
  Link2,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Activity,
  Clock,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ActivityItem, ActivityCategory } from "./types";

interface ActivityTableProps {
  items: ActivityItem[];
  currentPage: number;
  totalPages: number;
  totalCount: number;
  filteredCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const MotionTableBody = motion.create(TableBody);

export function ActivityTable({
  items,
  currentPage,
  totalPages,
  totalCount,
  filteredCount,
  onPageChange,
  className,
}: ActivityTableProps) {
  const getActionIcon = (action: string) => {
    const act = action.toLowerCase();
    let Icon = Edit3;
    let iconColor = "text-purple-400";

    if (act.includes("evidence") || act.includes("cctv") || act.includes("weapon")) {
      Icon = FileText;
      iconColor = "text-blue-400";
    } else if (act.includes("suspect")) {
      Icon = UserCheck;
      iconColor = "text-rose-400";
    } else if (act.includes("facial") || act.includes("recognition") || act.includes("scan")) {
      Icon = ScanFace;
      iconColor = "text-purple-400";
    } else if (act.includes("ai") || act.includes("analysis") || act.includes("match")) {
      Icon = Brain;
      iconColor = "text-teal-400";
    } else if (act.includes("note") || act.includes("observation")) {
      Icon = StickyNote;
      iconColor = "text-amber-400";
    } else if (act.includes("link") || act.includes("record")) {
      Icon = Link2;
      iconColor = "text-cyan-400";
    } else if (act.includes("create")) {
      Icon = Plus;
      iconColor = "text-emerald-400";
    } else if (act.includes("delete") || act.includes("remove")) {
      Icon = Trash2;
      iconColor = "text-rose-400";
    }

    return { Icon, iconColor };
  };

  // Helper to render action label with clean inline icon (no icon card box)
  const renderActionBadge = (action: string) => {
    const { Icon, iconColor } = getActionIcon(action);

    return (
      <div className="flex items-center gap-1.5">
        <Icon className={cn("size-3.5 shrink-0", iconColor)} />
        <span className="font-medium text-foreground text-xs whitespace-nowrap">
          {action}
        </span>
      </div>
    );
  };

  // Helper to render Category pill badge matching reference image
  const renderCategoryBadge = (category: ActivityCategory) => {
    switch (category) {
      case "Evidence":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-blue-500/25 bg-blue-500/10 text-blue-400 whitespace-nowrap">
            Evidence
          </span>
        );
      case "Case":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-purple-500/25 bg-purple-500/10 text-purple-400 whitespace-nowrap">
            Case
          </span>
        );
      case "Analysis":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-teal-500/25 bg-teal-500/10 text-teal-400 whitespace-nowrap">
            Analysis
          </span>
        );
      case "Suspect":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-rose-500/25 bg-rose-500/10 text-rose-400 whitespace-nowrap">
            Suspect
          </span>
        );
      case "Note":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-amber-500/25 bg-amber-500/10 text-amber-400 whitespace-nowrap">
            Note
          </span>
        );
      case "Records":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-sky-500/25 bg-sky-500/10 text-sky-400 whitespace-nowrap">
            Records
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-border/60 bg-muted/40 text-muted-foreground whitespace-nowrap">
            {category}
          </span>
        );
    }
  };

  const startEntry = items.length > 0 ? (currentPage - 1) * 10 + 1 : 0;
  const endEntry = (currentPage - 1) * 10 + items.length;

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-border bg-card/40 overflow-hidden shadow-xs [&>div]:scrollbar-none [&>div::-webkit-scrollbar]:hidden flex flex-col",
        className
      )}
    >
      {/* 1. Mobile Feed Card View (visible only on mobile < sm) */}
      <div className="block sm:hidden divide-y divide-border/40">
        {items.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <Activity className="size-7 text-muted-foreground/50 mx-auto mb-2" />
            <p className="font-semibold text-foreground text-sm">
              No activity logs match your filters
            </p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
              Try adjusting your date range or clearing user filters to view case history.
            </p>
          </div>
        ) : (
          items.map((item, index) => {
            const formattedNum = String(startEntry + index).padStart(2, "0");
            const { Icon, iconColor } = getActionIcon(item.action);

            return (
              <div
                key={item.id}
                className="p-3.5 space-y-2.5 transition-colors active:bg-muted/20"
              >
                {/* Header: User Avatar + Name + Role + Category badge */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar size="sm" className="size-7 border border-border/80 shrink-0">
                      {item.user.avatar && (
                        <AvatarImage src={item.user.avatar} alt={item.user.name} />
                      )}
                      <AvatarFallback className="text-[10px] bg-primary/15 text-primary font-bold">
                        {item.user.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-foreground text-xs truncate">
                          {item.user.name}
                        </span>
                        {item.user.isCurrentUser && (
                          <span className="text-[9px] px-1 py-0.5 rounded bg-sky-500/20 text-sky-400 font-medium shrink-0 leading-none">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {item.user.role}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {renderCategoryBadge(item.category)}
                  </div>
                </div>

                {/* Body: Action + Details */}
                <div className="space-y-1 pl-1">
                  <div className="flex items-center gap-1.5">
                    <Icon className={cn("size-3.5 shrink-0", iconColor)} />
                    <span className="font-semibold text-foreground text-xs">
                      {item.action}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/85 leading-relaxed pl-5 font-sans wrap-break-word">
                    {item.details}
                  </p>
                </div>

                {/* Footer: # Index + Formatted Timestamp */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground border-t border-border/30">
                  <span className="font-mono font-medium">#{formattedNum}</span>
                  <span className="font-medium">
                    {item.formattedDate} • {item.formattedTime}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 2. Desktop/Tablet Data Table (visible for sm and above) - No horizontal scrollbar, styled matching Evidence Table */}
      <div className="hidden sm:block [&>div]:overflow-x-auto [&>div]:scrollbar-none [&>div::-webkit-scrollbar]:hidden scrollbar-none [&::-webkit-scrollbar]:hidden">
        <Table>
          <TableHeader className="bg-card/70 border-b-2 border-border/60">
            <TableRow className="hover:bg-transparent">
              {/* 1. # Index */}
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 sm:px-2.5 py-3 whitespace-nowrap w-8 text-center">
                #
              </TableHead>

              {/* 2. Time */}
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 sm:px-2.5 py-3 whitespace-nowrap">
                Time
              </TableHead>

              {/* 3. User */}
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 sm:px-2.5 py-3 whitespace-nowrap">
                User
              </TableHead>

              {/* 4. Action */}
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 sm:px-2.5 py-3 whitespace-nowrap">
                Action
              </TableHead>

              {/* 5. Details */}
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 sm:px-3 py-3 whitespace-nowrap">
                Details
              </TableHead>

              {/* 6. Category */}
              <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 sm:px-4 py-3 whitespace-nowrap text-right">
                Category
              </TableHead>
            </TableRow>
          </TableHeader>

          <AnimatePresence mode="wait" initial={false}>
            <MotionTableBody
              key={`${currentPage}-${items.map((i) => i.id).join(",")}`}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="divide-y divide-border/40"
            >
              {items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="py-14 text-center text-sm text-muted-foreground"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Activity className="size-7 text-muted-foreground/50" />
                      <p className="font-semibold text-foreground text-sm">
                        No activity logs match your filters
                      </p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        Try adjusting your date range, switching activity category, or clearing user filter to view case history.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => {
                  const formattedNum = String(startEntry + index).padStart(2, "0");

                  return (
                    <TableRow
                      key={item.id}
                      className="transition-colors hover:bg-muted/30 group"
                    >
                      {/* Column 1: # Number */}
                      <TableCell className="font-mono tabular-nums font-semibold text-xs text-muted-foreground px-2 sm:px-2.5 py-3.5 whitespace-nowrap text-center w-8">
                        {formattedNum}
                      </TableCell>

                      {/* Column 2: Time */}
                      <TableCell className="px-2 sm:px-2.5 py-3.5 whitespace-nowrap">
                        <div className="flex flex-col text-xs leading-tight">
                          <span className="font-medium text-foreground text-xs">
                            {item.formattedDate}
                          </span>
                          <span className="text-[11px] text-muted-foreground mt-0.5">
                            {item.formattedTime}
                          </span>
                        </div>
                      </TableCell>

                      {/* Column 3: User */}
                      <TableCell className="px-2 sm:px-2.5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Avatar size="sm" className="size-6 sm:size-7 border border-border/80 shrink-0">
                            {item.user.avatar && (
                              <AvatarImage
                                src={item.user.avatar}
                                alt={item.user.name}
                              />
                            )}
                            <AvatarFallback className="text-[10px] bg-primary/15 text-primary font-bold">
                              {item.user.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 max-w-24 sm:max-w-28 xl:max-w-32">
                            <div className="flex items-center gap-1 min-w-0">
                              <span className="font-semibold text-foreground text-xs truncate">
                                {item.user.name}
                              </span>
                              {item.user.isCurrentUser && (
                                <span className="text-[9px] px-1 rounded bg-sky-500/20 text-sky-400 font-medium shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {item.user.role}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Column 4: Action */}
                      <TableCell className="px-2 sm:px-2.5 py-3.5 whitespace-nowrap">
                        {renderActionBadge(item.action)}
                      </TableCell>

                      {/* Column 5: Details */}
                      <TableCell className="px-2.5 sm:px-3 py-3.5 whitespace-nowrap max-w-44 sm:max-w-60 md:max-w-80 xl:max-w-56 2xl:max-w-96">
                        <span
                          className="text-xs text-foreground/90 font-sans block truncate"
                          title={item.details}
                        >
                          {item.details}
                        </span>
                      </TableCell>

                      {/* Column 6: Category Pill */}
                      <TableCell className="px-3 sm:px-4 py-3.5 text-right whitespace-nowrap">
                        {renderCategoryBadge(item.category)}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </MotionTableBody>
          </AnimatePresence>
        </Table>
      </div>

      {/* Table & Feed Pagination Footer matching Reference Screenshot & Cases Table */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t-2 border-border/40 text-xs text-muted-foreground bg-card/20">
        <div className="text-center sm:text-left text-[11px] sm:text-xs">
          Showing {items.length > 0 ? startEntry : 0} to {endEntry} of {filteredCount} activities
          {totalCount !== filteredCount && ` (filtered from ${totalCount} total)`}
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
            className="size-9 sm:size-8 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer touch-manipulation"
          >
            <ChevronLeft className="size-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Button
              key={pageNum}
              variant={currentPage === pageNum ? "default" : "ghost"}
              size="xs"
              onClick={() => onPageChange(pageNum)}
              className={cn(
                "size-9 sm:size-8 rounded-md text-xs font-semibold tabular-nums transition-colors cursor-pointer touch-manipulation",
                currentPage === pageNum
                  ? "bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-xs shadow-[#665AEF]/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {pageNum}
            </Button>
          ))}

          <Button
            variant="ghost"
            size="icon-xs"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
            className="size-9 sm:size-8 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer touch-manipulation"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
