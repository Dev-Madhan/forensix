"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Clock,
  MapPin,
  Tag,
  User,
  ArrowRight,
} from "lucide-react";

export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  location: string;
  date: string;
  timestamp?: string;
  status: "Under Investigation" | "Open" | "Solved" | "Closed";
  description?: string;
  assignedTo?: string;
}

export const INITIAL_CASES: CaseItem[] = [
  {
    id: "1",
    caseNumber: "FX-2026-184",
    title: "Downtown Robbery",
    type: "Theft",
    location: "Chennai, TN",
    date: "Oct 4, 2026",
    timestamp: "09:14 PM",
    status: "Under Investigation",
    description:
      "Armed robbery at a commercial establishment in T. Nagar. Suspect seen on CCTV fleeing towards North Boag Road.",
    assignedTo: "Unknown Suspect",
  },
  {
    id: "2",
    caseNumber: "FX-2026-183",
    title: "Missing Person",
    type: "Missing Person",
    location: "Coimbatore, TN",
    date: "Oct 3, 2026",
    timestamp: "04:30 PM",
    status: "Open",
    description:
      "Individual last seen near Gandhipuram bus terminal. Investigation into transit footage ongoing.",
    assignedTo: "Officer Raman",
  },
  {
    id: "3",
    caseNumber: "FX-2026-182",
    title: "Fraud Identification",
    type: "Fraud",
    location: "Bengaluru, KA",
    date: "Oct 2, 2026",
    timestamp: "11:20 AM",
    status: "Open",
    description:
      "Multi-tier identity impersonation at banking branches. Digital audit logs under forensic analysis.",
    assignedTo: "Special Agent Priya",
  },
  {
    id: "4",
    caseNumber: "FX-2026-181",
    title: "Assault Investigation",
    type: "Assault",
    location: "Madurai, TN",
    date: "Oct 1, 2026",
    timestamp: "08:45 PM",
    status: "Solved",
    description:
      "Assault incident outside commercial hub. Suspect apprehended with matching physical sketch.",
    assignedTo: "Inspector Selvam",
  },
  {
    id: "5",
    caseNumber: "FX-2026-180",
    title: "Unknown Suspect",
    type: "Unknown",
    location: "Trichy, TN",
    date: "Sep 30, 2026",
    timestamp: "02:15 AM",
    status: "Under Investigation",
    description:
      "Unidentified person captured on private surveillance tampering with telecom infrastructure.",
    assignedTo: "Investigator K.",
  },
  {
    id: "6",
    caseNumber: "FX-2026-179",
    title: "Identity Verification",
    type: "Identity",
    location: "Salem, TN",
    date: "Sep 28, 2026",
    timestamp: "06:10 PM",
    status: "Closed",
    description:
      "Verification of disputed biometric records. Discrepancies cleared and verified.",
    assignedTo: "Officer Meera",
  },
  {
    id: "7",
    caseNumber: "FX-2026-178",
    title: "Cyber Crime",
    type: "Cyber",
    location: "Chennai, TN",
    date: "Sep 27, 2026",
    timestamp: "10:05 PM",
    status: "Open",
    description:
      "Ransomware assault on municipal healthcare server. IP tracing in progress.",
    assignedTo: "Cyber Forensics Unit",
  },
  {
    id: "8",
    caseNumber: "FX-2026-177",
    title: "Homicide Case",
    type: "Homicide",
    location: "Tirunelveli, TN",
    date: "Sep 25, 2026",
    timestamp: "01:40 AM",
    status: "Under Investigation",
    description:
      "Crime scene analysis with multiple physical evidence items submitted for lab sequencing.",
    assignedTo: "Senior Det. Murugan",
  },
  {
    id: "9",
    caseNumber: "FX-2026-176",
    title: "Stolen Vehicle",
    type: "Theft",
    location: "Erode, TN",
    date: "Sep 24, 2026",
    timestamp: "07:50 PM",
    status: "Solved",
    description:
      "Commercial freight vehicle recovered at highway toll booth using automated license plate recognition.",
    assignedTo: "Highway Patrol",
  },
  {
    id: "10",
    caseNumber: "FX-2026-175",
    title: "Vandalism",
    type: "Property Crime",
    location: "Vellore, TN",
    date: "Sep 22, 2026",
    timestamp: "03:30 AM",
    status: "Closed",
    description:
      "Defacement of public historical monument. Perpetrator identified and penal fine imposed.",
    assignedTo: "District Station",
  },
];

function CaseRowActions({
  caseItem,
  isSelected,
  onToggleSelect,
}: {
  caseItem: CaseItem;
  isSelected: boolean;
  onToggleSelect: () => void;
}) {
  const [hoveredAction, setHoveredAction] = React.useState<string | null>(null);

  return (
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
            render={<Link href={`/dashboard/cases/${caseItem.id}`} />}
            onPointerEnter={() => setHoveredAction("details")}
            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs font-medium"
          >
            {hoveredAction === "details" && (
              <motion.div
                layoutId={`row-action-hover-${caseItem.id}`}
                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                transition={{
                  type: "spring",
                  bounce: 0.3,
                  duration: 0.4,
                }}
              />
            )}
            <span>View Details</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onToggleSelect}
            onPointerEnter={() => setHoveredAction("select")}
            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs font-medium"
          >
            {hoveredAction === "select" && (
              <motion.div
                layoutId={`row-action-hover-${caseItem.id}`}
                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                transition={{
                  type: "spring",
                  bounce: 0.3,
                  duration: 0.4,
                }}
              />
            )}
            <span>{isSelected ? "Deselect" : "Select"}</span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface CasesTableProps {
  initialCases?: CaseItem[];
}

export function CasesTable({ initialCases = [] }: CasesTableProps) {
  // Combine incoming cases with baseline reference dataset
  const allCases = React.useMemo(() => {
    if (!initialCases || initialCases.length === 0) {
      return INITIAL_CASES;
    }
    const existingIds = new Set(initialCases.map((c) => c.caseNumber));
    const dedupedInitial = INITIAL_CASES.filter((c) => !existingIds.has(c.caseNumber));
    return [...initialCases, ...dedupedInitial];
  }, [initialCases]);

  // Filter states
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [typeFilter, setTypeFilter] = React.useState<string | null>(null);
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(undefined);
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null);
  const [hoveredType, setHoveredType] = React.useState<string | null>(null);

  // Selection states (first item selected by default as in reference image)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set([allCases[0]?.id || "1"])
  );
  // Active case for Case Details Preview
  const [activeCaseId, setActiveCaseId] = React.useState<string>(
    allCases[0]?.id || "1"
  );
  const activeCase =
    allCases.find((c) => c.id === activeCaseId) ||
    allCases[0];

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Filter logic
  const filteredCases = React.useMemo(() => {
    return allCases.filter((item) => {
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesNumber = item.caseNumber.toLowerCase().includes(query);
        const matchesLocation = item.location.toLowerCase().includes(query);
        const matchesType = item.type.toLowerCase().includes(query);
        const matchesSuspect = item.assignedTo?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesNumber && !matchesLocation && !matchesType && !matchesSuspect) {
          return false;
        }
      }

      // Status filter
      if (statusFilter && statusFilter !== "ALL") {
        if (item.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // Type filter
      if (typeFilter && typeFilter !== "ALL") {
        if (item.type.toLowerCase() !== typeFilter.toLowerCase()) {
          return false;
        }
      }

      // Date range filter
      if (dateRange?.from) {
        const itemDate = new Date(item.date);
        if (isNaN(itemDate.getTime())) return true;
        if (itemDate < dateRange.from) return false;
        if (dateRange.to && itemDate > dateRange.to) return false;
      }

      return true;
    });
  }, [allCases, searchTerm, statusFilter, typeFilter, dateRange]);

  // Pagination calculations
  const totalItems = filteredCases.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentCases = filteredCases.slice(startIndex, startIndex + pageSize);

  // Selection handlers
  const isAllSelected =
    currentCases.length > 0 && currentCases.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) {
      currentCases.forEach((c) => next.delete(c.id));
    } else {
      currentCases.forEach((c) => next.add(c.id));
    }
    setSelectedIds(next);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Status badge styling helper matching dashboard table
  const renderStatusBadge = (status: CaseItem["status"]) => {
    switch (status) {
      case "Under Investigation":
        return (
          <span className="inline-flex items-center rounded-md border-2 border-[#665AEF]/30 bg-[#665AEF]/15 px-2 py-0.5 text-[11px] font-medium text-[#a594fd] whitespace-nowrap">
            Under Investigation
          </span>
        );
      case "Open":
        return (
          <span className="inline-flex items-center rounded-md border-2 border-blue-500/30 bg-blue-500/15 px-2 py-0.5 text-[11px] font-medium text-blue-400 whitespace-nowrap">
            Open
          </span>
        );
      case "Solved":
        return (
          <span className="inline-flex items-center rounded-md border-2 border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 whitespace-nowrap">
            Solved
          </span>
        );
      case "Closed":
      default:
        return (
          <span className="inline-flex items-center rounded-md border-2 border-border bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
      className="grid grid-cols-1 gap-6 xl:grid-cols-12 items-start w-full"
    >
      {/* Left Column: Cases Table (Reduced horizontally to col-span-8 to give required spacing for details component) */}
      <motion.div
        layout
        transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
        className="xl:col-span-8 2xl:col-span-8 space-y-4 min-w-0"
      >
        {/* 1. Filter Bar matching reference image with border-2 */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search cases by title, ID, location, or suspect..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 pl-9.5 rounded-lg border-2 border-border bg-card/60 text-sm placeholder:text-muted-foreground/70 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
            />
          </div>

          <div className="flex flex-wrap items-end gap-2.5 sm:gap-3">
            {/* Status Dropdown */}
            <div className="space-y-1 shrink-0">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Status
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-10 min-w-[130px] justify-between rounded-lg border-2 border-border bg-card/60 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer"
                    />
                  }
                >
                  <span>{statusFilter || "All Statuses"}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  className="w-44 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                  onPointerLeave={() => setHoveredStatus(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-0.5"
                  >
                    {[
                      "All Statuses",
                      "Open",
                      "Under Investigation",
                      "Solved",
                      "Closed",
                    ].map((status) => {
                      const isAll = status === "All Statuses";
                      return (
                        <DropdownMenuItem
                          key={status}
                          onPointerEnter={() => setHoveredStatus(status)}
                          onClick={() => {
                            setStatusFilter(isAll ? null : status);
                            setCurrentPage(1);
                          }}
                          className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs font-medium"
                        >
                          {hoveredStatus === status && (
                            <motion.div
                              layoutId="status-filter-hover"
                              className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                              transition={{
                                type: "spring",
                                bounce: 0.3,
                                duration: 0.4,
                              }}
                            />
                          )}
                          <span>{status}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Case Type Dropdown */}
            <div className="space-y-1 shrink-0">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Case Type
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-10 min-w-[130px] justify-between rounded-lg border-2 border-border bg-card/60 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer"
                    />
                  }
                >
                  <span>{typeFilter || "All Types"}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  className="w-44 max-h-80 overflow-y-auto no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border"
                  onPointerLeave={() => setHoveredType(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-0.5"
                  >
                    {[
                      "All Types",
                      "Theft",
                      "Missing Person",
                      "Fraud",
                      "Assault",
                      "Unknown",
                      "Identity",
                      "Cyber",
                      "Homicide",
                      "Property Crime",
                    ].map((t) => {
                      const isAll = t === "All Types";
                      return (
                        <DropdownMenuItem
                          key={t}
                          onPointerEnter={() => setHoveredType(t)}
                          onClick={() => {
                            setTypeFilter(isAll ? null : t);
                            setCurrentPage(1);
                          }}
                          className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs font-medium"
                        >
                          {hoveredType === t && (
                            <motion.div
                              layoutId="type-filter-hover"
                              className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                              transition={{
                                type: "spring",
                                bounce: 0.3,
                                duration: 0.4,
                              }}
                            />
                          )}
                          <span>{t}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Date Range Picker */}
            <div className="space-y-1 shrink-0">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Date Range
              </span>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-10 min-w-[150px] justify-between rounded-lg border-2 border-border bg-card/60 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer"
                    />
                  }
                >
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="size-3.5 text-muted-foreground" />
                    <span>
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM d")} -{" "}
                            {format(dateRange.to, "MMM d")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM d, yyyy")
                        )
                      ) : (
                        "Select range"
                      )}
                    </span>
                  </div>
                  <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border-2 border-border bg-card/95 backdrop-blur-xl shadow-xl rounded-xl overflow-hidden"
                  align="end"
                  side="bottom"
                  sideOffset={6}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range);
                        setCurrentPage(1);
                      }}
                      numberOfMonths={2}
                    />
                  </motion.div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* 2. Table Container with border-2 */}
        <div className="rounded-xl border-2 border-border bg-card/40 overflow-hidden shadow-xs [&>div]:overflow-x-auto [&>div]:[scrollbar-width:none] [&>div::-webkit-scrollbar]:hidden">
          <Table>
            <TableHeader className="bg-card/70 border-b-2 border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-9 px-2.5 py-3">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all cases"
                  />
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Case ID
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Title
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Type
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Location
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Date
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase text-right pr-3 py-3 whitespace-nowrap w-12">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border/40">
              {currentCases.map((c) => {
                const isSelected = selectedIds.has(c.id) || activeCaseId === c.id;
                return (
                  <TableRow
                    key={c.id}
                    data-state={isSelected ? "selected" : undefined}
                    className={cn(
                      "transition-colors hover:bg-muted/30 cursor-pointer",
                      isSelected && "bg-[#665AEF]/15 hover:bg-[#665AEF]/20"
                    )}
                    onClick={() => {
                      setActiveCaseId(c.id);
                      toggleSelect(c.id);
                    }}
                  >
                    <TableCell
                      className="w-9 px-2.5 py-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => {
                          setActiveCaseId(c.id);
                          toggleSelect(c.id);
                        }}
                        aria-label={`Select ${c.caseNumber}`}
                      />
                    </TableCell>
                    <TableCell className="font-heading text-xs font-medium text-foreground px-2.5 py-3 whitespace-nowrap">
                      <Link
                        href={`/dashboard/cases/${c.id}`}
                        className="hover:text-[#a594fd] transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {c.caseNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium text-sm text-foreground px-2.5 py-3 whitespace-nowrap max-w-[130px] 2xl:max-w-[170px] truncate">
                      {c.title}
                    </TableCell>
                    <TableCell className="px-2.5 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-muted/60 text-muted-foreground border-2 border-border/50 whitespace-nowrap">
                        {c.type}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground px-2.5 py-3 whitespace-nowrap">
                      {c.location}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground px-2.5 py-3 whitespace-nowrap">
                      {c.date}
                    </TableCell>
                    <TableCell className="px-2.5 py-3 whitespace-nowrap">
                      {renderStatusBadge(c.status)}
                    </TableCell>
                    <TableCell
                      className="text-right pr-3 py-3 whitespace-nowrap w-12"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <CaseRowActions
                        caseItem={c}
                        isSelected={isSelected}
                        onToggleSelect={() => toggleSelect(c.id)}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}

              {currentCases.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No cases match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* 3. Table Pagination Footer with border-t-2 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t-2 border-border/40 text-xs text-muted-foreground bg-card/20">
            <div>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + pageSize, totalItems)} of {totalItems} cases
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-xs"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="size-8 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="size-4" />
              </Button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "ghost"}
                  size="xs"
                  onClick={() => setCurrentPage(pageNum)}
                  className={cn(
                    "size-8 rounded-md text-xs font-medium transition-colors cursor-pointer",
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
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="size-8 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Column: Case Details Component (col-span-4) matching screenshot */}
      <motion.div
        layout
        transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
        className="xl:col-span-4 2xl:col-span-4 xl:sticky xl:top-6 min-w-0"
      >
        <CaseDetailsPreview caseItem={activeCase} />
      </motion.div>
    </motion.div>
  );
}

interface CaseDetailsPreviewProps {
  caseItem: CaseItem;
}

function CaseDetailsPreview({ caseItem }: CaseDetailsPreviewProps) {
  const [cctvIndex, setCctvIndex] = React.useState(1);
  const totalCctvAngles = 4;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCctvIndex((prev) => (prev > 1 ? prev - 1 : totalCctvAngles));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCctvIndex((prev) => (prev < totalCctvAngles ? prev + 1 : 1));
  };

  // Status text only (no badge) for the card
  const renderStatusText = (status: CaseItem["status"]) => {
    switch (status) {
      case "Under Investigation":
        return (
          <span className="text-xs font-semibold text-[#a594fd] whitespace-nowrap">
            Under Investigation
          </span>
        );
      case "Open":
        return (
          <span className="text-xs font-semibold text-blue-400 whitespace-nowrap">
            Open
          </span>
        );
      case "Solved":
        return (
          <span className="text-xs font-semibold text-emerald-400 whitespace-nowrap">
            Solved
          </span>
        );
      case "Closed":
      default:
        return (
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  return (
    <motion.div
      layout
      transition={{ layout: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
      className="rounded-xl border-2 border-border bg-card/40 p-4 sm:p-5 flex flex-col gap-4 shadow-xs"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={caseItem.id}
          initial={{ opacity: 0.78, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.78, scale: 0.985 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col gap-4 h-full"
        >
          {/* CCTV Camera Feed Carousel matching screenshot */}
          <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border/60 bg-black/80 shadow-inner group">
            <Image
              src="/images/cctv-suspect.jpg"
              alt="CCTV surveillance footage"
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 400px"
              priority
            />
            {/* Timestamp & Camera ID Overlay */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-white/90 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded">
              <span>{`CAM 0${cctvIndex}`}</span>
            </div>
            <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-white/90 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded">
              <span>{caseItem.date} {caseItem.timestamp || "21:14:32"}</span>
            </div>

            {/* Carousel Prev / Next Arrows */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous CCTV angle"
              className="absolute left-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next CCTV angle"
              className="absolute right-2 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="size-4" />
            </button>

            {/* Bottom-right 1/4 Pagination badge */}
            <div className="absolute bottom-2.5 right-2.5 font-mono text-[10px] text-white/90 bg-black/75 backdrop-blur-xs px-2 py-0.5 rounded">
              {cctvIndex}/{totalCctvAngles}
            </div>
          </div>

          {/* Case Header: Case ID & Status Text */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <span className="font-heading text-xs font-semibold text-muted-foreground tracking-wider">
              {caseItem.caseNumber}
            </span>
            {renderStatusText(caseItem.status)}
          </div>

          {/* Case Title & Description */}
          <div className="space-y-1.5">
            <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
              {caseItem.title}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
              {caseItem.description ||
                "Armed robbery at a commercial establishment in T. Nagar. Suspect seen on CCTV fleeing towards North Boag Road."}
            </p>
          </div>

          {/* Metadata Detail List matching screenshot */}
          <div className="space-y-3 pt-1 text-xs text-muted-foreground">
            {/* Row 1: Date & Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarIcon className="size-3.5 text-muted-foreground/80 shrink-0" />
                <span className="text-foreground/90 font-medium">{caseItem.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="size-3.5 text-muted-foreground/80 shrink-0" />
                <span className="text-foreground/90 font-medium">{caseItem.timestamp || "09:14 PM"}</span>
              </div>
            </div>

            {/* Row 2: Location */}
            <div className="flex items-center gap-2">
              <MapPin className="size-3.5 text-muted-foreground/80 shrink-0" />
              <span className="text-foreground/90 font-medium">{caseItem.location}</span>
            </div>

            {/* Row 3: Case Type */}
            <div className="flex items-center gap-2">
              <Tag className="size-3.5 text-muted-foreground/80 shrink-0" />
              <span className="text-foreground/90 font-medium">{caseItem.type}</span>
            </div>

            {/* Row 4: Suspect / Assignee */}
            <div className="flex items-center gap-2">
              <User className="size-3.5 text-muted-foreground/80 shrink-0" />
              <span className="text-foreground/90 font-medium">
                {caseItem.assignedTo || "Unknown Suspect"}
              </span>
            </div>
          </div>

          {/* Bottom CTA Button */}
          <div className="pt-2 mt-auto">
            <Button
              className="w-full h-10 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-sm font-medium shadow-sm shadow-[#665AEF]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              render={<Link href={`/dashboard/cases/${caseItem.id}`} />}
              nativeButton={false}
            >
              <span>View Case Details</span>
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
