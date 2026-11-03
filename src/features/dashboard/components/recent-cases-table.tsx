"use client";

import * as React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, MoreHorizontal, Eye, Copy, Check, FolderOpen } from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface CaseItem {
  id: string;
  caseId: string;
  title: string;
  date: string;
  status: "Under Investigation" | "Open" | "Solved" | "Closed" | "Cold";
}

function getStatusBadge(status: CaseItem["status"]) {
  switch (status) {
    case "Under Investigation":
      return (
        <span className="inline-flex items-center rounded-md border border-[#665AEF]/40 bg-[#665AEF]/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-[#a594fd] whitespace-nowrap">
          Under Investigation
        </span>
      );
    case "Open":
      return (
        <span className="inline-flex items-center rounded-md border border-blue-500/40 bg-blue-500/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-blue-400 whitespace-nowrap">
          Open
        </span>
      );
    case "Solved":
      return (
        <span className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-emerald-400 whitespace-nowrap">
          Solved
        </span>
      );
    case "Cold":
      return (
        <span className="inline-flex items-center rounded-md border border-cyan-500/40 bg-cyan-500/15 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-cyan-300 whitespace-nowrap">
          Cold
        </span>
      );
    case "Closed":
      return (
        <span className="inline-flex items-center rounded-md border border-zinc-600/40 bg-zinc-800/40 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-zinc-300 whitespace-nowrap">
          Closed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-muted-foreground whitespace-nowrap">
          {status}
        </span>
      );
  }
}

interface RecentCasesTableProps {
  cases?: CaseItem[];
}

function RecentCaseRowActions({
  item,
  copiedId,
  onCopyId,
}: {
  item: CaseItem;
  copiedId: string | null;
  onCopyId: (id: string) => void;
}) {
  const [hoveredAction, setHoveredAction] = React.useState<string | null>(null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Case actions"
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
          />
        }
      >
        <MoreHorizontal className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="bottom"
        sideOffset={6}
        className="w-38 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border border-border overflow-hidden"
        onPointerLeave={() => setHoveredAction(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-0.5"
        >
          <DropdownMenuItem
            render={
              <Link
                href={`/case-details/${item.caseId}`}
                className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs font-medium"
              />
            }
            onPointerEnter={() => setHoveredAction("view")}
          >
            {hoveredAction === "view" && (
              <motion.div
                layoutId={`recent-action-hover-${item.id}`}
                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                transition={{
                  type: "spring",
                  bounce: 0.3,
                  duration: 0.4,
                }}
              />
            )}
            <Eye className="size-3.5 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
            <span>Open Case File</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onCopyId(item.caseId)}
            onPointerEnter={() => setHoveredAction("copy")}
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs font-medium"
          >
            {hoveredAction === "copy" && (
              <motion.div
                layoutId={`recent-action-hover-${item.id}`}
                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                transition={{
                  type: "spring",
                  bounce: 0.3,
                  duration: 0.4,
                }}
              />
            )}
            {copiedId === item.caseId ? (
              <Check className="size-3.5 text-emerald-400" />
            ) : (
              <Copy className="size-3.5 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
            )}
            <span>Copy Case ID</span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RecentCasesTable({ cases = [] }: RecentCasesTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const handleCopyId = (caseId: string) => {
    navigator.clipboard.writeText(caseId);
    setCopiedId(caseId);
    toast.success(`Copied ${caseId} to clipboard`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Card className="@container/card rounded-xl border border-border/70 bg-card/75 shadow-xs h-full flex flex-col justify-between overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between gap-3 sm:gap-4 border-b border-border/40 px-4 sm:px-6 py-3.5 sm:py-4">
        <div className="space-y-1 min-w-0 flex-1">
          <CardTitle className="text-sm sm:text-base font-semibold tracking-tight text-foreground font-heading">
            Recent Cases
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Live investigation files registered in the forensic database.
          </CardDescription>
        </div>
        <Link
          href="/dashboard/cases"
          className="group shrink-0 whitespace-nowrap inline-flex items-center gap-1 text-xs font-medium text-[#a594fd] hover:text-[#c4b8ff] transition-colors"
        >
          <span className="whitespace-nowrap">View all</span>
          <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        {cases.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 px-4 text-center">
            <FolderOpen className="size-8 text-muted-foreground/40" />
            <p className="font-medium text-foreground text-sm">No active cases registered</p>
            <p className="text-xs text-muted-foreground max-w-xs">
              All new investigation files logged in Forensix will appear here in real-time.
            </p>
          </div>
        ) : (
          <>
            {/* 1. Mobile Adaptive Card View (Zero Horizontal Scrolling) */}
            <div className="block sm:hidden divide-y divide-border/40">
              <AnimatePresence initial={false}>
                {cases.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="p-3.5 space-y-2 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/case-details/${item.caseId}`}
                          className="font-mono text-xs font-semibold text-[#a594fd] hover:underline"
                        >
                          {item.caseId}
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleCopyId(item.caseId)}
                          aria-label="Copy case ID"
                          className="p-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                        >
                          {copiedId === item.caseId ? (
                            <Check className="size-3 text-emerald-400" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <Link
                      href={`/case-details/${item.caseId}`}
                      className="block text-xs font-medium text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug"
                    >
                      {item.title}
                    </Link>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span className="font-mono">{item.date}</span>
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/case-details/${item.caseId}`}
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-[#a594fd] hover:underline"
                        >
                          <span>Open</span>
                          <ArrowRight className="size-3" />
                        </Link>
                        <RecentCaseRowActions
                          item={item}
                          copiedId={copiedId}
                          onCopyId={handleCopyId}
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* 2. Desktop High-Density Data Table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="w-[120px] pl-5 sm:pl-6 text-xs text-muted-foreground font-medium">
                      Case ID
                    </TableHead>
                    <TableHead className="text-xs text-muted-foreground font-medium">
                      Title
                    </TableHead>
                    <TableHead className="w-[110px] text-xs text-muted-foreground font-medium">
                      Date
                    </TableHead>
                    <TableHead className="w-[150px] text-xs text-muted-foreground font-medium">
                      Status
                    </TableHead>
                    <TableHead className="w-[60px] pr-5 sm:pr-6 text-right text-xs text-muted-foreground font-medium">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {cases.map((item) => (
                      <motion.tr
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="border-b border-border/40 hover:bg-muted/30 transition-colors"
                      >
                        <TableCell className="pl-5 sm:pl-6 text-xs font-mono font-medium text-foreground/90">
                          <Link
                            href={`/case-details/${item.caseId}`}
                            className="hover:text-[#a594fd] transition-colors"
                          >
                            {item.caseId}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs font-medium text-foreground">
                          <Link
                            href={`/case-details/${item.caseId}`}
                            className="hover:underline hover:text-foreground line-clamp-1"
                          >
                            {item.title}
                          </Link>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {item.date}
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell className="pr-5 sm:pr-6 text-right">
                          <RecentCaseRowActions
                            item={item}
                            copiedId={copiedId}
                            onCopyId={handleCopyId}
                          />
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
