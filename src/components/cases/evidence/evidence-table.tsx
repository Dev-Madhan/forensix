"use client";

import React, { useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Copy,
  Trash2,
  AlertTriangle,
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
  pageSize?: number;
  onDeleteEvidence?: (item: EvidenceItem) => void;
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
  pageSize = 8,
  onDeleteEvidence,
  className,
}: EvidenceTableProps) {
  const [deleteTarget, setDeleteTarget] = useState<EvidenceItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const promptDelete = (item: EvidenceItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTarget(item);
    setIsDeleteDialogOpen(true);
  };

  const isAllSelected =
    items.length > 0 && items.every((i) => selectedRowIds.has(i.id));

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case "Video":
        return "border-2 border-blue-500/40 bg-blue-500/15 text-blue-400";
      case "Image":
        return "border-2 border-sky-500/40 bg-sky-500/15 text-sky-400";
      case "Document":
        return "border-2 border-indigo-500/40 bg-indigo-500/15 text-indigo-400";
      case "Audio":
        return "border-2 border-teal-500/40 bg-teal-500/15 text-teal-400";
      default:
        return "border-2 border-border/80 bg-muted/40 text-muted-foreground";
    }
  };

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium border-2 border-emerald-500/40 bg-emerald-500/15 text-emerald-400 whitespace-nowrap shadow-2xs">
            <span className="size-1.5 rounded-full bg-emerald-400" />
            Verified
          </span>
        );
      case "Under Review":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium border-2 border-amber-500/40 bg-amber-500/15 text-amber-400 whitespace-nowrap shadow-2xs">
            <span className="size-1.5 rounded-full bg-amber-400" />
            Under Review
          </span>
        );
      case "Flagged":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium border-2 border-rose-500/40 bg-rose-500/15 text-rose-400 whitespace-nowrap shadow-2xs">
            <span className="size-1.5 rounded-full bg-rose-400" />
            Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-medium border-2 border-border/80 bg-muted/50 text-muted-foreground whitespace-nowrap">
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
        "rounded-xl border-2 border-border bg-card/40 overflow-hidden shadow-xs flex flex-col w-full [&>div]:overflow-x-auto [&>div]:scrollbar-none [&>div::-webkit-scrollbar]:hidden [&>div]:[-ms-overflow-style:none]",
        className
      )}
    >
      <Table>
        <TableHeader className="bg-card/70 border-b-2 border-border/60">
          <TableRow className="hover:bg-transparent">
            {/* Checkbox column */}
            <TableHead className="w-8 px-2 py-3">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onToggleSelectAll}
                aria-label="Select all evidence items"
              />
            </TableHead>

            {/* Number column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-1.5 py-3 whitespace-nowrap w-8 text-center">
              #
            </TableHead>

            {/* Preview column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-1.5 py-3 whitespace-nowrap w-11 text-center">
              Preview
            </TableHead>

            {/* Evidence Name column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2 py-3 whitespace-nowrap">
              Evidence Name
            </TableHead>

            {/* Type column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-1.5 py-3 whitespace-nowrap">
              Type
            </TableHead>

            {/* Source column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-1.5 py-3 whitespace-nowrap">
              Source
            </TableHead>

            {/* Added By column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-1.5 py-3 whitespace-nowrap">
              Added By
            </TableHead>

            {/* Date Added column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-1.5 py-3 whitespace-nowrap">
              Date Added
            </TableHead>

            {/* Status column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-1.5 py-3 whitespace-nowrap">
              Status
            </TableHead>

            {/* Actions column */}
            <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase text-right pr-3 py-3 whitespace-nowrap w-10">
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
            items.map((item, index) => {
              const isSelected = item.id === selectedEvidenceId;
              const isChecked = selectedRowIds.has(item.id);
              const serialNumber = String(
                (currentPage - 1) * pageSize + index + 1
              ).padStart(2, "0");

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
                    className="w-8 px-2 py-2.5"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => onToggleRowSelect(item.id)}
                      aria-label={`Select ${item.name}`}
                    />
                  </TableCell>

                  {/* Serial Number */}
                  <TableCell className="font-sans tabular-nums font-medium text-xs text-muted-foreground px-1.5 py-2.5 whitespace-nowrap w-8 text-center">
                    {serialNumber}
                  </TableCell>

                  {/* Preview Thumbnail */}
                  <TableCell className="px-1.5 py-2 whitespace-nowrap w-11">
                    <EvidenceThumbnail item={item} size="md" />
                  </TableCell>

                  {/* Evidence Name & Description */}
                  <TableCell className="px-2 py-2.5 min-w-0 max-w-36 lg:max-w-44">
                    <div className="space-y-0.5 min-w-0">
                      <span
                        className="font-semibold text-foreground text-xs block hover:text-[#665AEF] transition-colors truncate"
                        title={item.name}
                      >
                        {item.name}
                      </span>
                      <span
                        className="text-[11px] text-muted-foreground block truncate"
                        title={item.description}
                      >
                        {item.description}
                      </span>
                    </div>
                  </TableCell>

                  {/* Type Badge */}
                  <TableCell className="px-1.5 py-2.5 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-lg px-1.5 py-0.5 text-[10.5px] font-medium border-2 whitespace-nowrap shadow-2xs",
                        getTypeBadgeStyle(item.type)
                      )}
                    >
                      {item.type}
                    </span>
                  </TableCell>

                  {/* Source */}
                  <TableCell className="text-xs text-muted-foreground px-1.5 py-2.5 whitespace-nowrap">
                    {item.source}
                  </TableCell>

                  {/* Added By */}
                  <TableCell className="px-1.5 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Avatar className="size-5 border border-border shrink-0">
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
                      <span className="font-medium text-foreground text-xs truncate max-w-20">
                        {item.addedBy.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Date Added */}
                  <TableCell className="text-xs text-muted-foreground px-1.5 py-2.5 whitespace-nowrap">
                    <div className="space-y-0.5">
                      <span className="font-medium text-foreground text-[11px] block">
                        {item.dateAdded}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {item.timeAdded}
                      </span>
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell className="px-1.5 py-2.5 whitespace-nowrap">
                    {renderStatusBadge(item.status)}
                  </TableCell>

                  {/* Actions column */}
                  <TableCell
                    className="text-right pr-3 py-2.5 whitespace-nowrap w-10"
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
                            className="text-rose-400 focus:text-rose-400 focus:bg-rose-500/10 cursor-pointer"
                            onClick={(e) => promptDelete(item, e)}
                          >
                            <Trash2 className="size-3.5 mr-2 text-rose-400" />
                            <span>Delete Evidence</span>
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-2 border-border/80 text-foreground p-6 gap-0 shadow-2xl rounded-2xl">
          <DialogHeader className="pb-2 space-y-1.5 pr-6">
            <DialogTitle className="text-base font-bold font-heading text-foreground tracking-tight">
              Delete Evidence
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
              Are you sure want to delete it? This action cannot be reversed.
            </DialogDescription>
          </DialogHeader>

          {deleteTarget && (
            <div className="mt-3 p-3 rounded-md bg-muted/30 border-2 border-border text-xs space-y-1.5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>File Name:</span>
                <span className="font-semibold text-foreground truncate max-w-48">
                  {deleteTarget.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Category:</span>
                <span className="font-medium text-foreground">
                  {deleteTarget.type} ({deleteTarget.source})
                </span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Evidence ID / Hash:</span>
                <span className="font-mono text-[11px] text-muted-foreground truncate max-w-48">
                  {deleteTarget.hash}
                </span>
              </div>
            </div>
          )}

          <div className="mt-3 text-xs text-rose-400 flex items-start gap-1.5 leading-relaxed">
            <AlertTriangle className="size-3.5 shrink-0 text-rose-400 mt-0.5" />
            <span>
              This file will be permanently removed from this case. Chain-of-custody records will reflect its deletion.
            </span>
          </div>

          <DialogFooter className="mt-5 flex flex-row items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer text-xs"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeleteTarget(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="cursor-pointer text-xs bg-rose-600 hover:bg-rose-700 text-white font-medium"
              onClick={() => {
                if (deleteTarget) {
                  onDeleteEvidence?.(deleteTarget);
                  setIsDeleteDialogOpen(false);
                  setDeleteTarget(null);
                }
              }}
            >
              <Trash2 className="size-3.5 mr-1.5" />
              Delete Evidence
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
