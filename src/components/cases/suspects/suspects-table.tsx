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
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Trash2,
  Copy,
  UserX,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SuspectItem, SuspectStatus } from "./types";

interface SuspectsTableProps {
  items: SuspectItem[];
  selectedSuspectId: string;
  onSelectSuspect: (suspect: SuspectItem) => void;
  selectedRowIds: Set<string>;
  onToggleRowSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onUpdateStatus: (id: string, newStatus: SuspectStatus) => void;
  onDeleteSuspect: (id: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalCount: number;
  className?: string;
}

const MotionTableBody = motion.create(TableBody);

export function SuspectsTable({
  items,
  selectedSuspectId,
  onSelectSuspect,
  selectedRowIds,
  onToggleRowSelect,
  onToggleSelectAll,
  onUpdateStatus,
  onDeleteSuspect,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  className,
}: SuspectsTableProps) {
  const isAllSelected =
    items.length > 0 && items.every((i) => selectedRowIds.has(i.id));

  const renderStatusBadge = (status: SuspectStatus) => {
    switch (status) {
      case "Primary Suspect":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border border-rose-500/30 bg-rose-500/15 text-rose-400 whitespace-nowrap shadow-2xs">
            Primary Suspect
          </span>
        );
      case "Person of Interest":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border border-amber-500/30 bg-amber-500/15 text-amber-400 whitespace-nowrap shadow-2xs">
            Person of Interest
          </span>
        );
      case "Cleared":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 whitespace-nowrap shadow-2xs">
            Cleared
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border border-border/80 bg-muted/50 text-muted-foreground whitespace-nowrap shadow-2xs">
            {status}
          </span>
        );
    }
  };

  const getConfidenceTextColor = (confidence: number) => {
    if (confidence >= 85) {
      return "text-rose-400";
    }
    if (confidence >= 60) {
      return "text-amber-400";
    }
    return "text-emerald-400";
  };

  const copyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    toast.success(`Suspect ID copied to clipboard: ${id}`);
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-border bg-card/40 overflow-hidden shadow-xs [&>div]:overflow-x-auto [&>div]:scrollbar-none [&>div::-webkit-scrollbar]:hidden flex flex-col",
        className
      )}
    >
      <Table>
        <TableHeader className="bg-card/70 border-b-2 border-border/60">
          <TableRow className="hover:bg-transparent">
            {/* Checkbox column */}
            <TableHead className="w-9 px-2.5 py-3">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label="Select all suspects"
              />
            </TableHead>

            {/* Number column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap w-8">
              #
            </TableHead>

            {/* Photo column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap w-12">
              Photo
            </TableHead>

            {/* Name / Alias column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
              Name / Alias
            </TableHead>

            {/* Status column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap">
              Status
            </TableHead>

            {/* Role column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap">
              Role
            </TableHead>

            {/* Match Confidence column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap text-center">
              Match Confidence
            </TableHead>

            {/* Last Seen column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap">
              Last Seen
            </TableHead>

            {/* Actions column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase text-right pr-3 py-3 whitespace-nowrap w-12">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <AnimatePresence mode="wait" initial={false}>
          <MotionTableBody
            key={`${currentPage}-${items.map((i) => i.id).join(",")}`}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="divide-y divide-border/40"
          >
            {items.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="py-12 text-center text-sm text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <UserX className="size-8 text-muted-foreground/40" />
                    <p className="font-medium text-foreground">
                      No suspects found
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Try adjusting your search query or clear current filter options.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              items.map((item) => {
                const isSelected = item.id === selectedSuspectId;
                const isChecked = selectedRowIds.has(item.id);

                return (
                  <TableRow
                    key={item.id}
                    onClick={() => onSelectSuspect(item)}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(
                      "transition-colors hover:bg-muted/30 cursor-pointer",
                      isSelected && "bg-[#665AEF]/15 hover:bg-[#665AEF]/20",
                      isChecked && !isSelected && "bg-muted/20"
                    )}
                  >
                    {/* Checkbox */}
                    <TableCell
                      className="w-9 px-2.5 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={() => onToggleRowSelect(item.id)}
                        aria-label={`Select ${item.name}`}
                      />
                    </TableCell>

                    {/* Number */}
                    <TableCell className="font-sans tabular-nums font-medium text-xs text-muted-foreground px-2 py-3 whitespace-nowrap w-8">
                      {item.numberIndex}
                    </TableCell>

                    {/* Photo Thumbnail */}
                    <TableCell className="px-2 py-2 whitespace-nowrap w-12">
                      <div className="size-9 rounded-md border-2 border-border overflow-hidden bg-muted/40 shrink-0 relative shadow-2xs">
                        <img
                          src={item.photo}
                          alt={item.name}
                          className="size-full object-cover"
                        />
                      </div>
                    </TableCell>

                    {/* Name & Alias */}
                    <TableCell className="px-2.5 py-3 whitespace-nowrap max-w-35 2xl:max-w-45">
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-semibold text-foreground text-xs sm:text-sm block hover:text-[#665AEF] transition-colors truncate">
                          {item.name}
                        </span>
                        <span className="text-[11px] text-muted-foreground block truncate">
                          {item.alias}
                        </span>
                      </div>
                    </TableCell>

                    {/* Status Badge */}
                    <TableCell className="px-2 py-3 whitespace-nowrap">
                      {renderStatusBadge(item.status)}
                    </TableCell>

                    {/* Role */}
                    <TableCell className="text-xs text-muted-foreground px-2 py-3 whitespace-nowrap font-medium">
                      {item.role}
                    </TableCell>

                    {/* Match Confidence */}
                    <TableCell className="px-2 py-3 whitespace-nowrap text-center">
                      <span
                        className={cn(
                          "font-semibold text-xs tabular-nums inline-block",
                          getConfidenceTextColor(item.matchConfidence)
                        )}
                      >
                        {item.matchConfidence}%
                      </span>
                    </TableCell>

                    {/* Last Seen */}
                    <TableCell className="text-xs text-muted-foreground px-2 py-3 whitespace-nowrap">
                      <div className="space-y-0.5">
                        <span className="font-medium text-foreground text-xs block">
                          {item.lastSeenDate}
                        </span>
                        <span className="text-[11px] text-muted-foreground block">
                          {item.lastSeenTime}
                        </span>
                      </div>
                    </TableCell>

                    {/* Actions Dropdown */}
                    <TableCell
                      className="text-right pr-3 py-3 whitespace-nowrap w-12"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <button
                              type="button"
                              aria-label={`Actions for ${item.name}`}
                              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Row actions</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          side="bottom"
                          sideOffset={6}
                          className="w-48 min-w-48 p-1.5 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border text-xs z-50 overflow-hidden"
                        >
                          <DropdownMenuItem
                            onClick={() => onSelectSuspect(item)}
                            className="cursor-pointer"
                          >
                            <Eye className="size-3.5 mr-2 text-muted-foreground" />
                            <span>Inspect Profile</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => copyId(item.id, e)}
                            className="cursor-pointer"
                          >
                            <Copy className="size-3.5 mr-2 text-muted-foreground" />
                            <span>Copy Suspect ID</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuGroup>
                            <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
                              Change Status
                            </DropdownMenuLabel>
                            <DropdownMenuItem
                              className="text-rose-400 focus:text-rose-400 cursor-pointer"
                              onClick={() =>
                                onUpdateStatus(item.id, "Primary Suspect")
                              }
                            >
                              <ShieldAlert className="size-3.5 mr-2 text-rose-400" />
                              <span>Primary Suspect</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-amber-400 focus:text-amber-400 cursor-pointer"
                              onClick={() =>
                                onUpdateStatus(item.id, "Person of Interest")
                              }
                            >
                              <UserCheck className="size-3.5 mr-2 text-amber-400" />
                              <span>Person of Interest</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-emerald-400 focus:text-emerald-400 cursor-pointer"
                              onClick={() =>
                                onUpdateStatus(item.id, "Cleared")
                              }
                            >
                              <CheckCircle2 className="size-3.5 mr-2 text-emerald-400" />
                              <span>Cleared</span>
                            </DropdownMenuItem>
                          </DropdownMenuGroup>
                          <DropdownMenuSeparator className="my-1" />
                          <DropdownMenuItem
                            className="text-rose-400 focus:text-rose-400 cursor-pointer"
                            onClick={() => onDeleteSuspect(item.id)}
                          >
                            <Trash2 className="size-3.5 mr-2 text-rose-400" />
                            <span>Remove from Case</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </MotionTableBody>
        </AnimatePresence>
      </Table>

      {/* Table Pagination Footer matching Evidence Table */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t-2 border-border/40 text-xs text-muted-foreground bg-card/20">
        <div>
          Showing {items.length > 0 ? 1 : 0} to {items.length} of {totalCount} suspects
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-xs"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
            className="size-8 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
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
                "size-8 rounded-md text-xs font-medium font-inter tabular-nums transition-colors cursor-pointer",
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
            className="size-8 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
