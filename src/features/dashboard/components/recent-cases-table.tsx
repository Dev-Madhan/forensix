"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, MoreHorizontal, Eye, Copy, Check } from "lucide-react"
import { toast } from "sonner"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export interface CaseItem {
  id: string
  caseId: string
  title: string
  date: string
  status: "Under Investigation" | "Open" | "Solved" | "Closed"
}

const defaultCases: CaseItem[] = [
  {
    id: "1",
    caseId: "FX-2026-184",
    title: "Downtown Robbery",
    date: "Oct 4, 2026",
    status: "Under Investigation",
  },
  {
    id: "2",
    caseId: "FX-2026-183",
    title: "Missing Person",
    date: "Oct 3, 2026",
    status: "Open",
  },
  {
    id: "3",
    caseId: "FX-2026-182",
    title: "Fraud Identification",
    date: "Oct 2, 2026",
    status: "Open",
  },
  {
    id: "4",
    caseId: "FX-2026-181",
    title: "Assault Investigation",
    date: "Oct 1, 2026",
    status: "Solved",
  },
  {
    id: "5",
    caseId: "FX-2026-180",
    title: "Unknown Suspect",
    date: "Sep 30, 2026",
    status: "Under Investigation",
  },
]

function getStatusBadge(status: CaseItem["status"]) {
  switch (status) {
    case "Under Investigation":
      return (
        <span className="inline-flex items-center rounded-md border-2 border-[#665AEF]/30 bg-[#665AEF]/15 px-2 py-0.5 text-[11px] font-medium text-[#a594fd]">
          Under Investigation
        </span>
      )
    case "Open":
      return (
        <span className="inline-flex items-center rounded-md border-2 border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-[11px] font-medium text-blue-400">
          Open
        </span>
      )
    case "Solved":
      return (
        <span className="inline-flex items-center rounded-md border-2 border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
          Solved
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center rounded-md border-2 border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
          {status}
        </span>
      )
  }
}

interface RecentCasesTableProps {
  cases?: CaseItem[]
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
        className="w-36 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
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
            render={<Link href="/dashboard/cases" />}
            onPointerEnter={() => setHoveredAction("view")}
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs font-medium"
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
            <span>View Case</span>
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
            <span>Copy ID</span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function RecentCasesTable({ cases = defaultCases }: RecentCasesTableProps) {
  const [copiedId, setCopiedId] = React.useState<string | null>(null)

  const handleCopyId = (caseId: string) => {
    navigator.clipboard.writeText(caseId)
    setCopiedId(caseId)
    toast.success(`Copied ${caseId} to clipboard`)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <Card className="@container/card rounded-xl border border-border/70 bg-card/70 shadow-xs h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between gap-3 sm:gap-4 border-b border-border/40 px-5 sm:px-6 py-4">
        <div className="space-y-1 min-w-0 flex-1">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Recent Cases
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Latest cases added to the system.
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
        <Table>
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
            {cases.map((item) => (
              <TableRow
                key={item.id}
                className="border-border/40 hover:bg-muted/30 transition-colors"
              >
                <TableCell className="pl-5 sm:pl-6 text-xs font-mono font-medium text-foreground/90">
                  {item.caseId}
                </TableCell>
                <TableCell className="text-xs font-medium text-foreground">
                  {item.title}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
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
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
