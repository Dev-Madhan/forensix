"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { gsap } from "gsap";
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
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ArrowRight,
  X,
  MapPin,
  Calendar as CalendarIcon,
  User,
  Shield,
  Bookmark,
  PenLine,
  Fingerprint,
  Globe,
} from "lucide-react";

import { INITIAL_CRIMINALS, type CriminalItem } from "@/constants/mock-criminals";
export { INITIAL_CRIMINALS, type CriminalItem };

const MotionTableBody = motion.create(TableBody);

/* ──────────────────────────────────────────────
   Row Actions Dropdown (matches CaseRowActions)
   ────────────────────────────────────────────── */
function CriminalRowActions({
  criminal,
  isSelected,
  onToggleSelect,
}: {
  criminal: CriminalItem;
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
            render={<Link href={`/dashboard/criminals/${criminal.id}`} />}
            onPointerEnter={() => setHoveredAction("details")}
            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs font-medium"
          >
            {hoveredAction === "details" && (
              <motion.div
                layoutId={`criminal-row-action-hover-${criminal.id}`}
                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                transition={{
                  type: "spring",
                  bounce: 0.3,
                  duration: 0.4,
                }}
              />
            )}
            <span>View Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onToggleSelect}
            onPointerEnter={() => setHoveredAction("select")}
            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs font-medium"
          >
            {hoveredAction === "select" && (
              <motion.div
                layoutId={`criminal-row-action-hover-${criminal.id}`}
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

/* ──────────────────────────────────────────────
   Main Criminals Table
   ────────────────────────────────────────────── */
interface CriminalsTableProps {
  initialCriminals?: CriminalItem[];
}

export function CriminalsTable({ initialCriminals = [] }: CriminalsTableProps) {
  // Combine incoming criminals with baseline reference dataset
  const allCriminals = React.useMemo(() => {
    if (!initialCriminals || initialCriminals.length === 0) {
      return INITIAL_CRIMINALS;
    }
    const existingIds = new Set(initialCriminals.map((c) => c.criminalId));
    const dedupedInitial = INITIAL_CRIMINALS.filter((c) => !existingIds.has(c.criminalId));
    return [...initialCriminals, ...dedupedInitial];
  }, [initialCriminals]);

  // Filter states
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);
  const [riskFilter, setRiskFilter] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);
  const [hoveredRisk, setHoveredRisk] = React.useState<string | null>(null);
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null);

  // Selection states (first item selected by default)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    new Set([allCriminals[0]?.id || "1"])
  );
  // Active criminal for Profile Preview
  const [activeCriminalId, setActiveCriminalId] = React.useState<string>(
    allCriminals[0]?.id || "1"
  );
  const activeCriminal =
    allCriminals.find((c) => c.id === activeCriminalId) || allCriminals[0];

  // Profile preview visibility state with GSAP animation control
  const [showPreview, setShowPreview] = React.useState(true);
  const [isClosing, setIsClosing] = React.useState(false);
  const previewContainerRef = React.useRef<HTMLDivElement>(null);

  // Smooth GSAP Entrance transition when preview becomes visible
  React.useEffect(() => {
    if (showPreview && previewContainerRef.current) {
      gsap.killTweensOf(previewContainerRef.current);
      gsap.fromTo(
        previewContainerRef.current,
        {
          opacity: 0,
          x: 40,
          scale: 0.95,
        },
        {
          opacity: 1,
          x: 0,
          scale: 1,
          duration: 0.4,
          ease: "power3.out",
          clearProps: "transform,opacity",
        }
      );
    }
  }, [showPreview]);

  // Smooth GSAP Exit transition when closing preview
  const handleClosePreview = React.useCallback(() => {
    if (isClosing) return;
    if (!previewContainerRef.current) {
      setShowPreview(false);
      return;
    }

    setIsClosing(true);
    gsap.killTweensOf(previewContainerRef.current);
    gsap.to(previewContainerRef.current, {
      opacity: 0,
      x: 40,
      scale: 0.95,
      duration: 0.3,
      ease: "power3.in",
      onComplete: () => {
        setShowPreview(false);
        setIsClosing(false);
      },
    });
  }, [isClosing]);

  // Smooth GSAP Open handler
  const handleOpenPreview = React.useCallback((criminalId?: string) => {
    if (criminalId) {
      setActiveCriminalId(criminalId);
    }
    if (previewContainerRef.current) {
      gsap.killTweensOf(previewContainerRef.current);
    }
    setIsClosing(false);
    setShowPreview(true);
  }, []);

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const pageSize = 10;

  // Filter logic
  const filteredCriminals = React.useMemo(() => {
    return allCriminals.filter((item) => {
      // Search term filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesName = `${item.firstName} ${item.lastName}`.toLowerCase().includes(query);
        const matchesId = item.criminalId.toLowerCase().includes(query);
        const matchesAlias = item.alias?.toLowerCase().includes(query);
        const matchesLocation = item.lastKnownLocation.toLowerCase().includes(query);
        const matchesAliases = item.aliases?.some((a) =>
          a.toLowerCase().includes(query)
        );
        if (
          !matchesName &&
          !matchesId &&
          !matchesAlias &&
          !matchesLocation &&
          !matchesAliases
        ) {
          return false;
        }
      }

      // Category filter
      if (categoryFilter && categoryFilter !== "ALL") {
        if (
          !item.crimeCategories.some(
            (cat) => cat.toLowerCase() === categoryFilter.toLowerCase()
          )
        ) {
          return false;
        }
      }

      // Risk level filter
      if (riskFilter && riskFilter !== "ALL") {
        if (item.riskLevel.toLowerCase() !== riskFilter.toLowerCase()) {
          return false;
        }
      }

      // Status filter
      if (statusFilter && statusFilter !== "ALL") {
        if (item.status.toLowerCase() !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [allCriminals, searchTerm, categoryFilter, riskFilter, statusFilter]);

  // Pagination calculations
  const totalItems = filteredCriminals.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentCriminals = filteredCriminals.slice(startIndex, startIndex + pageSize);

  // Selection handlers
  const isAllSelected =
    currentCriminals.length > 0 &&
    currentCriminals.every((c) => selectedIds.has(c.id));

  const toggleSelectAll = () => {
    const next = new Set(selectedIds);
    if (isAllSelected) {
      currentCriminals.forEach((c) => next.delete(c.id));
    } else {
      currentCriminals.forEach((c) => next.add(c.id));
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

  // Status badge styling helper matching Cases table design
  const renderStatusBadge = (status: CriminalItem["status"]) => {
    switch (status) {
      case "Active":
        return (
          <span className="inline-flex items-center rounded-[4px] border-2 border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 whitespace-nowrap">
            Active
          </span>
        );
      case "Wanted":
        return (
          <span className="inline-flex items-center rounded-[4px] border-2 border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-400 whitespace-nowrap">
            Wanted
          </span>
        );
      case "In Custody":
        return (
          <span className="inline-flex items-center rounded-[4px] border-2 border-blue-500/40 bg-blue-500/15 px-2 py-0.5 text-[11px] font-medium text-blue-400 whitespace-nowrap">
            In Custody
          </span>
        );
      case "Under Surveillance":
        return (
          <span className="inline-flex items-center rounded-[4px] border-2 border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-400 whitespace-nowrap">
            Under Surveillance
          </span>
        );
      case "Inactive":
      default:
        return (
          <span className="inline-flex items-center rounded-[4px] border-2 border-border/80 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  // Risk level badge styling
  const renderRiskBadge = (riskLevel: CriminalItem["riskLevel"]) => {
    switch (riskLevel) {
      case "High":
        return (
          <span className="inline-flex items-center rounded-[4px] border-2 border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-400 whitespace-nowrap">
            High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center rounded-[4px] border-2 border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-400 whitespace-nowrap">
            Medium
          </span>
        );
      case "Low":
      default:
        return (
          <span className="inline-flex items-center rounded-[4px] border-2 border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 whitespace-nowrap">
            Low
          </span>
        );
    }
  };

  // Generate pagination numbers with ellipsis for large page counts
  const getPageNumbers = () => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [];
    if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return pages;
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 items-start w-full transition-all duration-300",
        showPreview
          ? "xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_400px]"
          : "grid-cols-1"
      )}
    >
      {/* Left Column: Criminals Table (expands to 100% when preview is closed) */}
      <div className="space-y-4 min-w-0 w-full">
        {/* 1. Filter Bar matching reference image with border-2 */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name, alias, ID, or other details..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="h-10 pl-9.5 rounded-lg border-2 border-border bg-card/60 text-sm placeholder:text-muted-foreground/70 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
            />
          </div>

          <div className="flex flex-wrap items-end gap-2.5 sm:gap-3">
            {/* Category Dropdown */}
            <div className="space-y-1 shrink-0">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Category
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-10 min-w-32.5 justify-between rounded-lg border-2 border-border bg-card/60 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer"
                    />
                  }
                >
                  <span>{categoryFilter || "All Categories"}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  className="w-44 max-h-80 overflow-y-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border"
                  onPointerLeave={() => setHoveredCategory(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-0.5"
                  >
                    {[
                      "All Categories",
                      "Theft",
                      "Assault",
                      "Fraud",
                      "Cyber Crime",
                      "Drug Offense",
                      "Violence",
                      "Arson",
                      "Robbery",
                      "Burglary",
                      "Forgery",
                      "Extortion",
                      "Smuggling",
                    ].map((cat) => {
                      const isAll = cat === "All Categories";
                      return (
                        <DropdownMenuItem
                          key={cat}
                          onPointerEnter={() => setHoveredCategory(cat)}
                          onClick={() => {
                            setCategoryFilter(isAll ? null : cat);
                            setCurrentPage(1);
                          }}
                          className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs font-medium"
                        >
                          {hoveredCategory === cat && (
                            <motion.div
                              layoutId="category-filter-hover"
                              className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                              transition={{
                                type: "spring",
                                bounce: 0.3,
                                duration: 0.4,
                              }}
                            />
                          )}
                          <span>{cat}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Risk Level Dropdown */}
            <div className="space-y-1 shrink-0">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Risk Level
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="h-10 min-w-32.5 justify-between rounded-lg border-2 border-border bg-card/60 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer"
                    />
                  }
                >
                  <span>{riskFilter || "All Levels"}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={6}
                  className="w-44 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                  onPointerLeave={() => setHoveredRisk(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-0.5"
                  >
                    {["All Levels", "High", "Medium", "Low"].map((level) => {
                      const isAll = level === "All Levels";
                      return (
                        <DropdownMenuItem
                          key={level}
                          onPointerEnter={() => setHoveredRisk(level)}
                          onClick={() => {
                            setRiskFilter(isAll ? null : level);
                            setCurrentPage(1);
                          }}
                          className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs font-medium"
                        >
                          {hoveredRisk === level && (
                            <motion.div
                              layoutId="risk-filter-hover"
                              className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                              transition={{
                                type: "spring",
                                bounce: 0.3,
                                duration: 0.4,
                              }}
                            />
                          )}
                          <span>{level}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
                      className="h-10 min-w-32.5 justify-between rounded-lg border-2 border-border bg-card/60 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer"
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
                      "Active",
                      "Wanted",
                      "In Custody",
                      "Under Surveillance",
                      "Inactive",
                    ].map((s) => {
                      const isAll = s === "All Statuses";
                      return (
                        <DropdownMenuItem
                          key={s}
                          onPointerEnter={() => setHoveredStatus(s)}
                          onClick={() => {
                            setStatusFilter(isAll ? null : s);
                            setCurrentPage(1);
                          }}
                          className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs font-medium"
                        >
                          {hoveredStatus === s && (
                            <motion.div
                              layoutId="status-filter-hover-criminal"
                              className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                              transition={{
                                type: "spring",
                                bounce: 0.3,
                                duration: 0.4,
                              }}
                            />
                          )}
                          <span>{s}</span>
                        </DropdownMenuItem>
                      );
                    })}
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Toggle button to reopen preview when closed */}
            {!showPreview && (
              <Button
                variant="outline"
                onClick={() => handleOpenPreview()}
                className="h-10 px-3 rounded-lg border-2 border-border bg-card/60 text-xs font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer gap-1.5 transition-colors shrink-0 self-end"
              >
                <User className="size-3.5 text-muted-foreground" />
                <span>Show Profile</span>
              </Button>
            )}
          </div>
        </div>

        {/* 2. Table Container with border-2 */}
        <div className="rounded-xl border-2 border-border bg-card/40 overflow-hidden shadow-xs [&>div]:overflow-x-auto [&>div]:scrollbar-none [&>div::-webkit-scrollbar]:hidden">
          <Table>
            <TableHeader className="bg-card/70 border-b-2 border-border/60">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-9 px-2.5 py-3">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all criminals"
                  />
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Photo
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Name
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Aliases
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Date of Birth
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Crime Categories
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Risk Level
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Status
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase text-right pr-3 py-3 whitespace-nowrap w-12">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <AnimatePresence mode="wait" initial={false}>
              <MotionTableBody
                key={`${categoryFilter || "all"}-${riskFilter || "all"}-${statusFilter || "all"}-${currentPage}-${searchTerm}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="divide-y divide-border/40"
              >
                {currentCriminals.map((c) => {
                  const isSelected = selectedIds.has(c.id) || activeCriminalId === c.id;
                  return (
                    <TableRow
                      key={c.id}
                      data-state={isSelected ? "selected" : undefined}
                      className={cn(
                        "transition-colors hover:bg-muted/30 cursor-pointer",
                        isSelected && "bg-[#665AEF]/15 hover:bg-[#665AEF]/20"
                      )}
                      onClick={() => {
                        handleOpenPreview(c.id);
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
                            handleOpenPreview(c.id);
                            toggleSelect(c.id);
                          }}
                          aria-label={`Select ${c.criminalId}`}
                        />
                      </TableCell>
                      {/* Photo column */}
                      <TableCell className="px-2.5 py-3">
                        <div className="relative size-9 rounded-full overflow-hidden border border-border/60 bg-muted/60 shrink-0">
                          {c.mugshotUrl ? (
                            <Image
                              src={c.mugshotUrl}
                              alt={`${c.firstName} ${c.lastName}`}
                              fill
                              className="object-cover"
                              sizes="36px"
                            />
                          ) : (
                            <div className="size-full flex items-center justify-center text-muted-foreground">
                              <User className="size-4" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      {/* Name + ID */}
                      <TableCell className="px-2.5 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <Link
                            href={`/dashboard/criminals/${c.id}`}
                            className="font-medium text-sm text-foreground hover:text-[#a594fd] transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {c.firstName} {c.lastName}
                          </Link>
                          <span className="font-heading text-[11px] font-medium text-muted-foreground">
                            {c.criminalId}
                          </span>
                        </div>
                      </TableCell>
                      {/* Aliases */}
                      <TableCell className="text-xs text-muted-foreground px-2.5 py-3 whitespace-nowrap max-w-28 truncate">
                        {c.alias || "N/A"}
                      </TableCell>
                      {/* DOB + Age */}
                      <TableCell className="px-2.5 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs text-foreground/90">
                            {c.dateOfBirth}
                          </span>
                          <span className="text-[11px] text-muted-foreground">
                            ({c.age} years)
                          </span>
                        </div>
                      </TableCell>
                      {/* Crime Categories */}
                      <TableCell className="px-2.5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-medium bg-muted/60 text-muted-foreground border-2 border-border/50 whitespace-nowrap">
                            {c.crimeCategories[0]}
                          </span>
                          {c.crimeCategories.length > 1 && (
                            <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-[#665AEF]/15 text-[#a594fd] border border-[#665AEF]/30 whitespace-nowrap">
                              +{c.crimeCategories.length - 1}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      {/* Risk Level */}
                      <TableCell className="px-2.5 py-3 whitespace-nowrap">
                        {renderRiskBadge(c.riskLevel)}
                      </TableCell>
                      {/* Status */}
                      <TableCell className="px-2.5 py-3 whitespace-nowrap">
                        {renderStatusBadge(c.status)}
                      </TableCell>
                      {/* Actions */}
                      <TableCell
                        className="text-right pr-3 py-3 whitespace-nowrap w-12"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <CriminalRowActions
                          criminal={c}
                          isSelected={isSelected}
                          onToggleSelect={() => toggleSelect(c.id)}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}

                {currentCriminals.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="py-12 text-center text-sm text-muted-foreground"
                    >
                      No criminals match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </MotionTableBody>
            </AnimatePresence>
          </Table>

          {/* 3. Table Pagination Footer with border-t-2 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 border-t-2 border-border/40 text-xs text-muted-foreground bg-card/20">
            <div>
              Showing {totalItems === 0 ? 0 : startIndex + 1} to{" "}
              {Math.min(startIndex + pageSize, totalItems)} of {totalItems} records
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

              {getPageNumbers().map((pageNum, idx) =>
                typeof pageNum === "string" ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="size-8 flex items-center justify-center text-xs text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "ghost"}
                    size="xs"
                    onClick={() => setCurrentPage(pageNum)}
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
                )
              )}

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
      </div>

      {/* Right Column: Criminal Profile Preview (fixed optimal width) with GSAP transition */}
      {showPreview && activeCriminal && (
        <div
          ref={previewContainerRef}
          className="w-full xl:w-[380px] 2xl:w-[400px] xl:sticky xl:top-6 min-w-0 will-change-[transform,opacity]"
        >
          <CriminalProfilePreview
            criminal={activeCriminal}
            onClose={handleClosePreview}
          />
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Criminal Profile Preview Card
   (Replaces CaseDetailsPreview — same card chrome)
   ────────────────────────────────────────────── */
interface CriminalProfilePreviewProps {
  criminal: CriminalItem;
  onClose?: () => void;
}

function CriminalProfilePreview({
  criminal,
  onClose,
}: CriminalProfilePreviewProps) {
  const cardContentRef = React.useRef<HTMLDivElement>(null);

  // GSAP smooth punch-in when active criminal changes
  React.useEffect(() => {
    if (cardContentRef.current) {
      gsap.fromTo(
        cardContentRef.current,
        { opacity: 0.4, y: 8, scale: 0.99 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.28,
          ease: "power2.out",
          clearProps: "opacity,transform",
        }
      );
    }
  }, [criminal.id]);

  // Risk level badge for top of card
  const renderRiskTag = (riskLevel: CriminalItem["riskLevel"]) => {
    switch (riskLevel) {
      case "High":
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-rose-500/15 text-rose-400 border-2 border-rose-500/30">
            High Risk
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-amber-500/15 text-amber-400 border-2 border-amber-500/30">
            Medium Risk
          </span>
        );
      case "Low":
      default:
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border-2 border-emerald-500/30">
            Low Risk
          </span>
        );
    }
  };

  const renderStatusDot = (status: CriminalItem["status"]) => {
    const isGreen = status === "Active";
    const isRed = status === "Wanted";
    const isBlue = status === "In Custody";
    const isAmber = status === "Under Surveillance";

    const dotColor = isGreen
      ? "bg-emerald-400"
      : isRed
      ? "bg-rose-400"
      : isBlue
      ? "bg-blue-400"
      : isAmber
      ? "bg-amber-400"
      : "bg-muted-foreground";

    const textColor = isGreen
      ? "text-emerald-400"
      : isRed
      ? "text-rose-400"
      : isBlue
      ? "text-blue-400"
      : isAmber
      ? "text-amber-400"
      : "text-muted-foreground";

    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor}`}>
        <span className={`size-1.5 rounded-full ${dotColor}`} />
        {status}
      </span>
    );
  };

  return (
    <div className="rounded-xl border-2 border-border bg-card/40 p-4 sm:p-5 shadow-xs overflow-hidden w-full max-w-[400px] 2xl:max-w-[420px] mx-auto xl:max-w-none">
      <div
        ref={cardContentRef}
        className="w-full flex flex-col gap-4 will-change-[transform,opacity]"
      >
        {/* Top: Name + Risk Badge + Close Button */}
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
                    {criminal.firstName} {criminal.lastName}
                  </h2>
                  {renderRiskTag(criminal.riskLevel)}
                </div>
                <p className="font-heading text-xs font-medium text-muted-foreground tracking-wider">
                  {criminal.criminalId}
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="size-7 -mr-1 -mt-1 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors cursor-pointer"
                aria-label="Close preview"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Mugshot + Key Info */}
            <div className="flex gap-4">
              {/* Mugshot (Portrait aspect ~3:4.2 matching key info height) */}
              <div className="relative w-[130px] sm:w-[138px] h-[190px] rounded-lg overflow-hidden border-2 border-border/80 bg-black/40 shrink-0 shadow-inner">
                {criminal.mugshotUrl ? (
                  <Image
                    src={criminal.mugshotUrl}
                    alt={`${criminal.firstName} ${criminal.lastName} mugshot`}
                    fill
                    className="object-cover"
                    sizes="140px"
                    priority
                  />
                ) : (
                  <div className="size-full flex items-center justify-center text-muted-foreground bg-muted/30">
                    <User className="size-10 opacity-40" />
                  </div>
                )}
              </div>

              {/* Key metadata list evenly distributed */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 text-xs">
                {/* Date of Birth */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <CalendarIcon className="size-3.5 shrink-0 text-muted-foreground/70" />
                    <span>Date of Birth</span>
                  </div>
                  <p className="pl-5 text-xs font-medium text-foreground">
                    {criminal.dateOfBirth} ({criminal.age} years)
                  </p>
                </div>

                {/* Gender */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <User className="size-3.5 shrink-0 text-muted-foreground/70" />
                    <span>Gender</span>
                  </div>
                  <p className="pl-5 text-xs font-medium text-foreground">
                    {criminal.gender}
                  </p>
                </div>

                {/* Nationality */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Globe className="size-3.5 shrink-0 text-muted-foreground/70" />
                    <span>Nationality</span>
                  </div>
                  <p className="pl-5 text-xs font-medium text-foreground">
                    {criminal.nationality}
                  </p>
                </div>

                {/* Status */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Shield className="size-3.5 shrink-0 text-muted-foreground/70" />
                    <span>Status</span>
                  </div>
                  <div className="pl-5">
                    {renderStatusDot(criminal.status)}
                  </div>
                </div>

                {/* Last Known Location */}
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <MapPin className="size-3.5 shrink-0 text-muted-foreground/70" />
                    <span>Last Known Location</span>
                  </div>
                  <p className="pl-5 text-xs font-medium text-foreground leading-snug truncate" title={criminal.lastKnownLocation}>
                    {criminal.lastKnownLocation}
                  </p>
                </div>
              </div>
            </div>

            {/* Aliases */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground/90 tracking-wide block">
                Aliases
              </span>
              <div className="flex flex-wrap gap-1.5">
                {criminal.aliases.map((alias) => (
                  <span
                    key={alias}
                    className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-normal bg-muted/40 text-muted-foreground border-2 border-border/80"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>

            {/* Crime Categories */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground/90 tracking-wide block">
                Crime Categories
              </span>
              <div className="flex flex-wrap gap-1.5">
                {criminal.crimeCategories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center rounded-md px-2.5 py-1 text-xs font-normal bg-[#665AEF]/15 text-[#a594fd] border-2 border-[#665AEF]/30"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>

            {/* Physical Description */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground/90 tracking-wide block">
                Physical Description
              </span>
              <div className="grid grid-cols-2 gap-x-5 text-xs">
                {/* Left Column: Height, Weight, Build */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Height</span>
                    <span className="text-foreground font-medium text-xs">{criminal.height}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Weight</span>
                    <span className="text-foreground font-medium text-xs">{criminal.weight}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Build</span>
                    <span className="text-foreground font-medium text-xs">{criminal.build}</span>
                  </div>
                </div>

                {/* Right Column: Hair Color, Eye Color, Complexion, Distinctive Marks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Hair Color</span>
                    <span className="text-foreground font-medium text-xs">{criminal.hairColor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Eye Color</span>
                    <span className="text-foreground font-medium text-xs">{criminal.eyeColor}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-[11px]">Complexion</span>
                    <span className="text-foreground font-medium text-xs">{criminal.complexion}</span>
                  </div>
                  <div className="flex items-start justify-between gap-1.5">
                    <span className="text-muted-foreground text-[11px] leading-tight shrink-0">
                      Distinctive Marks
                    </span>
                    <span className="text-foreground font-medium text-xs text-right leading-tight">
                      {criminal.distinctiveMarks}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA Buttons */}
            <div className="flex flex-col gap-2 pt-1 mt-auto">
              <Button
                className="w-full h-10 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-sm font-medium shadow-sm shadow-[#665AEF]/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                render={<Link href={`/dashboard/criminals/${criminal.id}`} />}
                nativeButton={false}
              >
                <span>View Full Profile</span>
                <ArrowRight className="size-4" />
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 h-9 rounded-lg border-2 border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-medium text-foreground/90 hover:text-foreground cursor-pointer gap-1.5 transition-colors"
                >
                  <Shield className="size-3.5 text-muted-foreground" />
                  <span>Add to Watchlist</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-9 rounded-lg border-2 border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-medium text-foreground/90 hover:text-foreground cursor-pointer gap-1.5 transition-colors"
                >
                  <PenLine className="size-3.5 text-muted-foreground" />
                  <span>Generate Sketch</span>
                </Button>
              </div>
            </div>
      </div>
    </div>
  );
}
