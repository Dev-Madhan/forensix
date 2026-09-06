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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Copy,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { EvidenceThumbnail } from "./evidence-thumbnail";
import type { EvidenceItem } from "./types";

interface EvidenceTableProps {
  items: EvidenceItem[];
  selectedEvidenceId: string;
  onSelectEvidence: (item: EvidenceItem) => void;
  selectedRowIds: Set<string>;
  onToggleRowSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  totalCount: number;
  className?: string;
}

const MotionTableBody = motion.create(TableBody);

export function EvidenceTable({
  items,
  selectedEvidenceId,
  onSelectEvidence,
  selectedRowIds,
  onToggleRowSelect,
  onToggleSelectAll,
  currentPage,
  totalPages,
  onPageChange,
  totalCount,
  className,
}: EvidenceTableProps) {
  const isAllSelected =
    items.length > 0 && items.every((i) => selectedRowIds.has(i.id));

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Video":
        return "border-2 border-blue-500/50 bg-blue-500/15 text-blue-400";
      case "Image":
        return "border-2 border-sky-500/50 bg-sky-500/15 text-sky-400";
      case "Document":
        return "border-2 border-indigo-500/50 bg-indigo-500/15 text-indigo-400";
      case "Audio":
        return "border-2 border-teal-500/50 bg-teal-500/15 text-teal-400";
      default:
        return "border-2 border-border bg-muted/40 text-muted-foreground";
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border-2 border-emerald-500/40 bg-emerald-500/15 text-emerald-400 whitespace-nowrap shadow-2xs">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Verified
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border-2 border-amber-500/40 bg-amber-500/15 text-amber-400 whitespace-nowrap shadow-2xs">
            <span className="size-1.5 rounded-full bg-amber-400" />
            Under Review
          </span>
        );
      case "Flagged":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border-2 border-rose-500/40 bg-rose-500/15 text-rose-400 whitespace-nowrap shadow-2xs">
            <span className="size-1.5 rounded-full bg-rose-400" />
            Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium border-2 border-border bg-muted/50 text-muted-foreground whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  const copyHash = (hash: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(hash);
    toast.success("Integrity hash copied to clipboard");
  };

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-border bg-card/40 overflow-hidden shadow-xs [&>div]:overflow-x-auto [&>div]:[scrollbar-width:none] [&>div::-webkit-scrollbar]:hidden flex flex-col",
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
                aria-label="Select all evidence items"
              />
            </TableHead>

            {/* Number column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap w-8">
              #
            </TableHead>

            {/* Preview column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap w-12">
              Preview
            </TableHead>

            {/* Evidence Name column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
              Evidence Name
            </TableHead>

            {/* Type column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap">
              Type
            </TableHead>

            {/* Source column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap">
              Source
            </TableHead>

            {/* Added By column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap">
              Added By
            </TableHead>

            {/* Date Added column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap">
              Date Added
            </TableHead>

            {/* Status column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap">
              Status
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
                colSpan={10}
                className="py-12 text-center text-sm text-muted-foreground"
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className="font-medium text-foreground">
                    No evidence files found
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Try adjusting your search query or clear current filter options.
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => {
              const isSelected = item.id === selectedEvidenceId;
              const isChecked = selectedRowIds.has(item.id);

              return (
                <TableRow
                  key={item.id}
                  onClick={() => onSelectEvidence(item)}
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
                    {item.id}
                  </TableCell>

                  {/* Preview Thumbnail */}
                  <TableCell className="px-2 py-2 whitespace-nowrap w-12">
                    <EvidenceThumbnail item={item} size="md" />
                  </TableCell>

                  {/* Evidence Name & Description */}
                  <TableCell className="px-2.5 py-3 whitespace-nowrap max-w-[130px] 2xl:max-w-[170px]">
                    <div className="space-y-0.5 min-w-0">
                      <span className="font-semibold text-foreground text-xs sm:text-sm block hover:text-[#665AEF] transition-colors truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground block truncate">
                        {item.description}
                      </span>
                    </div>
                  </TableCell>

                  {/* Type Badge */}
                  <TableCell className="px-2 py-3 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium border-2 whitespace-nowrap shadow-2xs",
                        getTypeBadgeStyle(item.type)
                      )}
                    >
                      {item.type}
                    </span>
                  </TableCell>

                  {/* Source */}
                  <TableCell className="text-xs text-muted-foreground px-2 py-3 whitespace-nowrap">
                    {item.source}
                  </TableCell>

                  {/* Added By */}
                  <TableCell className="px-2 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="size-5 border-2 border-border shrink-0">
                        {item.addedBy.avatar && (
                          <AvatarImage
                            src={item.addedBy.avatar}
                            alt={item.addedBy.name}
                          />
                        )}
                        <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-medium">
                          {item.addedBy.initials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-foreground text-xs truncate max-w-[85px]">
                        {item.addedBy.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Date Added */}
                  <TableCell className="text-xs text-muted-foreground px-2 py-3 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <span className="font-medium text-foreground text-xs block">
                        {item.dateAdded}
                      </span>
                      <span className="text-[11px] text-muted-foreground block">
                        {item.timeAdded}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-2 py-3 whitespace-nowrap">
                    {renderStatusBadge(item.status)}
                  </TableCell>

                  {/* Actions dropdown */}
                  <TableCell
                    className="text-right pr-3 py-3 whitespace-nowrap w-12"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-7 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
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
                        className="w-44 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border text-xs"
                      >
                        <DropdownMenuItem onClick={() => onSelectEvidence(item)}>
                          <Eye className="size-3.5 mr-2 text-muted-foreground" />
                          <span>Preview Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => copyHash(item.hash, e)}>
                          <Copy className="size-3.5 mr-2 text-muted-foreground" />
                          <span>Copy SHA-256</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.success(`Downloading ${item.name}`)
                          }
                        >
                          <Download className="size-3.5 mr-2 text-muted-foreground" />
                          <span>Download File</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-rose-400 focus:text-rose-400"
                          onClick={() =>
                            toast.info(`Flagged ${item.name} for chain of custody review`)
                          }
                        >
                          <Trash2 className="size-3.5 mr-2" />
                          <span>Flag for Review</span>
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

      {/* Table Pagination Footer matching Case Page */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t-2 border-border/40 text-xs text-muted-foreground bg-card/20">
        <div>
          Showing {items.length > 0 ? 1 : 0} to {items.length} of {totalCount} evidence items
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
              style={{
                fontFamily:
                  'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
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
