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
  Zap,
  Download,
  FileSpreadsheet,
  Layers,
  CheckSquare,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Check,
  FolderPlus,
  ScanFace,
} from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";
import {
  updateCriminalStatusAndRisk,
  bulkToggleCriminalWatchlist,
  bulkUpdateCriminalStatus,
  bulkLinkCriminalsToCase,
  toggleCriminalWatchlist,
} from "@/features/criminals/actions";
import { CriminalStatus, SuspectRole, SuspectCaseStatus } from "@prisma/client";
import { Modal } from "@/components/ui/modal";
import { CriminalSectionCards, type CriminalMetrics } from "./criminal-section-cards";
import { OpticalFaceSearchModal } from "./optical-face-search-modal";

import { type CriminalItem } from "@/features/criminals/types";
import { getSafeStorageUrl } from "@/lib/storage-url";
import { SuspectAvatar } from "./suspect-avatar";
import { getCriminalSlug } from "@/features/criminals/slug";
export { type CriminalItem };

/**
 * Export suspects list to RFC 4180 compliant CSV format
 */
function exportCriminalsToCSV(
  criminals: CriminalItem[],
  filename = `forensix-criminals-${new Date().toISOString().slice(0, 10)}.csv`
) {
  if (!criminals || criminals.length === 0) {
    toast.error("No criminal records to export");
    return;
  }

  const headers = [
    "Criminal ID",
    "First Name",
    "Last Name",
    "Alias",
    "Aliases",
    "Date of Birth",
    "Status",
    "Risk Level",
    "Crime Categories",
    "Last Known Location",
    "Distinctive Marks",
    "National ID",
  ];

  const escapeCSV = (val: unknown) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = criminals.map((c) => [
    escapeCSV(c.criminalId),
    escapeCSV(c.firstName),
    escapeCSV(c.lastName),
    escapeCSV(c.alias || ""),
    escapeCSV((c.aliases || []).join("; ")),
    escapeCSV(c.dateOfBirth),
    escapeCSV(c.status),
    escapeCSV(c.riskLevel),
    escapeCSV(c.crimeCategories.join("; ")),
    escapeCSV(c.lastKnownLocation),
    escapeCSV(c.distinctiveMarks || ""),
    escapeCSV((c as any).nationalId || c.nationality || ""),
  ]);

  const csvContent =
    [headers.map(escapeCSV).join(","), ...rows.map((r) => r.join(","))].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`Exported ${criminals.length} suspect records to CSV`, {
    description: `File saved as ${filename}`,
  });
}

/**
 * Export suspects list to formatted JSON
 */
function exportCriminalsToJSON(
  criminals: CriminalItem[],
  filename = `forensix-criminals-${new Date().toISOString().slice(0, 10)}.json`
) {
  if (!criminals || criminals.length === 0) {
    toast.error("No suspect records to export.");
    return;
  }

  const jsonContent = JSON.stringify(criminals, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  toast.success(`Exported ${criminals.length} suspect records to JSON`, {
    description: `File saved as ${filename}`,
  });
}


const MotionTableBody = motion.create(TableBody);

/* ──────────────────────────────────────────────
   Row Actions Dropdown (matches CaseRowActions)
   ────────────────────────────────────────────── */
function CriminalRowActions({
  criminal,
  isSelected,
  onToggleSelect,
  onWatchlistChanged,
}: {
  criminal: CriminalItem;
  isSelected: boolean;
  onToggleSelect: () => void;
  onWatchlistChanged?: () => void;
}) {
  const [hoveredAction, setHoveredAction] = React.useState<string | null>(null);
  const [isTogglingWatchlist, setIsTogglingWatchlist] = React.useState(false);

  const handleToggleWatchlist = async () => {
    setIsTogglingWatchlist(true);
    const nextWatchlist = criminal.status !== "Wanted";
    try {
      const res = await toggleCriminalWatchlist(criminal.id, nextWatchlist);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          nextWatchlist
            ? `${criminal.firstName} ${criminal.lastName} placed on Priority Watchlist`
            : `Removed from Priority Watchlist`
        );
        onWatchlistChanged?.();
      }
    } catch {
      toast.error("Failed to update watchlist status");
    } finally {
      setIsTogglingWatchlist(false);
    }
  };

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
        className="w-44 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
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
            render={<Link href={`/dashboard/criminals/${getCriminalSlug(criminal)}`} />}
            onPointerEnter={() => setHoveredAction("details")}
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted text-xs font-medium text-foreground"
          >
            <User className="size-3.5 text-muted-foreground" />
            <span>View Profile</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            render={<Link href={`/dashboard/criminals/${getCriminalSlug(criminal)}/edit`} />}
            onPointerEnter={() => setHoveredAction("edit")}
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted text-xs font-medium text-foreground"
          >
            <PenLine className="size-3.5 text-muted-foreground" />
            <span>Edit Record</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleToggleWatchlist}
            disabled={isTogglingWatchlist}
            onPointerEnter={() => setHoveredAction("watchlist")}
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-amber-500/10 text-xs font-medium text-amber-300"
          >
            <Shield className="size-3.5 text-amber-400" />
            <span>{criminal.status === "Wanted" ? "Clear Watchlist" : "Add to Watchlist"}</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={onToggleSelect}
            onPointerEnter={() => setHoveredAction("select")}
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <CheckSquare className="size-3.5" />
            <span>{isSelected ? "Deselect Row" : "Select Row"}</span>
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
  metrics?: Partial<CriminalMetrics>;
}

export function CriminalsTable({
  initialCriminals = [],
  metrics,
}: CriminalsTableProps) {
  // Set local state strictly from incoming database records
  const [criminalsList, setCriminalsList] = React.useState<CriminalItem[]>(() => {
    return initialCriminals || [];
  });

  // Keep state synchronized with prop updates
  React.useEffect(() => {
    setCriminalsList(initialCriminals || []);
  }, [initialCriminals]);

  const allCriminals = criminalsList;

  const searchParams = useSearchParams();

  // Metric card active filter
  const [activeCardFilter, setActiveCardFilter] = React.useState<string | null>(null);

  // Sorting state
  const [sortKey, setSortKey] = React.useState<"name" | "id" | "dob" | "risk" | "status" | null>(null);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc");

  // Bulk Link to Case Modal state
  const [isBulkLinkOpen, setIsBulkLinkOpen] = React.useState(false);
  const [bulkCaseInput, setBulkCaseInput] = React.useState("");
  const [bulkRole, setBulkRole] = React.useState<SuspectRole>(SuspectRole.UNDER_INVESTIGATION);
  const [bulkStatus, setBulkStatus] = React.useState<SuspectCaseStatus>(SuspectCaseStatus.PERSON_OF_INTEREST);
  const [isBulkLinking, setIsBulkLinking] = React.useState(false);

  // Filter states initialized from URL search params
  const [searchTerm, setSearchTerm] = React.useState(
    () => searchParams?.get("q") || ""
  );
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(
    () => searchParams?.get("category") || null
  );
  const [riskFilter, setRiskFilter] = React.useState<string | null>(
    () => searchParams?.get("risk") || null
  );
  const [statusFilter, setStatusFilter] = React.useState<string | null>(
    () => searchParams?.get("status") || null
  );
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);
  const [hoveredRisk, setHoveredRisk] = React.useState<string | null>(null);
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null);

  const handleSelectMetricCard = (key: string) => {
    if (activeCardFilter === key || key === "TOTAL") {
      setActiveCardFilter(null);
      setStatusFilter(null);
      setRiskFilter(null);
      setCategoryFilter(null);
      setSearchTerm("");
      setCurrentPage(1);
      return;
    }

    setActiveCardFilter(key);
    setCurrentPage(1);

    if (key === "WATCHLIST") {
      setStatusFilter("Wanted");
      setRiskFilter(null);
      setCategoryFilter(null);
    } else if (key === "HIGH_RISK") {
      setRiskFilter("High");
      setStatusFilter(null);
      setCategoryFilter(null);
    } else if (key === "AI") {
      setRiskFilter(null);
      setStatusFilter(null);
      setCategoryFilter(null);
    }
  };

  const handleToggleSort = (key: "name" | "id" | "dob" | "risk" | "status") => {
    if (sortKey === key) {
      if (sortOrder === "asc") {
        setSortOrder("desc");
      } else {
        setSortKey(null);
        setSortOrder("asc");
      }
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };


  // Synchronize filter changes with URL query string
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (statusFilter) params.set("status", statusFilter);
    if (riskFilter) params.set("risk", riskFilter);
    if (categoryFilter) params.set("category", categoryFilter);
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", newUrl);
  }, [searchTerm, statusFilter, riskFilter, categoryFilter]);

  // Selection states (for bulk operations)
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [isBulkUpdating, setIsBulkUpdating] = React.useState(false);
  const [isOpticalSearchOpen, setIsOpticalSearchOpen] = React.useState(false);

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

      // AI Identified filter
      if (activeCardFilter === "AI") {
        if (!item.mugshotUrl || item.mugshotUrl.includes("placeholder")) {
          return false;
        }
      }

      return true;
    });
  }, [allCriminals, searchTerm, categoryFilter, riskFilter, statusFilter, activeCardFilter]);

  // Sort logic
  const sortedCriminals = React.useMemo(() => {
    if (!sortKey) return filteredCriminals;
    return [...filteredCriminals].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        cmp = `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      } else if (sortKey === "id") {
        cmp = a.criminalId.localeCompare(b.criminalId);
      } else if (sortKey === "dob") {
        cmp = (a.dateOfBirth || "").localeCompare(b.dateOfBirth || "");
      } else if (sortKey === "risk") {
        const order: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        cmp = (order[a.riskLevel] || 0) - (order[b.riskLevel] || 0);
      } else if (sortKey === "status") {
        cmp = a.status.localeCompare(b.status);
      }
      return sortOrder === "asc" ? cmp : -cmp;
    });
  }, [filteredCriminals, sortKey, sortOrder]);

  // Pagination calculations
  const totalItems = sortedCriminals.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentCriminals = sortedCriminals.slice(startIndex, startIndex + pageSize);

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
          <span className="inline-flex items-center rounded-lg border-2 border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 whitespace-nowrap">
            Active
          </span>
        );
      case "Wanted":
        return (
          <span className="inline-flex items-center rounded-lg border-2 border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-400 whitespace-nowrap">
            Wanted
          </span>
        );
      case "In Custody":
        return (
          <span className="inline-flex items-center rounded-lg border-2 border-blue-500/40 bg-blue-500/15 px-2 py-0.5 text-[11px] font-medium text-blue-400 whitespace-nowrap">
            In Custody
          </span>
        );
      case "Under Surveillance":
        return (
          <span className="inline-flex items-center rounded-lg border-2 border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-400 whitespace-nowrap">
            Under Surveillance
          </span>
        );
      case "Inactive":
      default:
        return (
          <span className="inline-flex items-center rounded-lg border-2 border-border/80 bg-muted/50 px-2 py-0.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
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
          <span className="inline-flex items-center rounded-lg border-2 border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[11px] font-medium text-rose-400 whitespace-nowrap">
            High
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center rounded-lg border-2 border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-medium text-amber-400 whitespace-nowrap">
            Medium
          </span>
        );
      case "Low":
      default:
        return (
          <span className="inline-flex items-center rounded-lg border-2 border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-medium text-emerald-400 whitespace-nowrap">
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
    <div className="flex flex-col gap-6 w-full">
      {metrics && (
        <CriminalSectionCards
          metrics={metrics}
          activeFilterKey={activeCardFilter}
          onSelectFilter={handleSelectMetricCard}
        />
      )}
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
        {/* 1. Filter & Command Bar: 2-tier responsive layout preventing search input collapse */}
        <div className="flex flex-col gap-3">
          {/* Row 1: Full-width Search Bar with Clear Button & Real-time Live Radar Telemetry */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by name, alias, ID, or other details..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-10 pl-9.5 pr-8 rounded-lg border-2 border-border bg-card/60 text-sm placeholder:text-muted-foreground/70 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] w-full"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Optical Biometric Face Probe Button */}
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpticalSearchOpen(true)}
              className="h-10 px-3.5 rounded-lg border-2 border-[#665AEF]/40 bg-[#665AEF]/10 text-xs font-semibold text-[#a594fd] hover:bg-[#665AEF]/20 hover:text-white cursor-pointer gap-2 transition-colors shrink-0 shadow-xs"
              title="Reverse Face Search across all enrolled criminals"
            >
              <ScanFace className="size-4 text-[#665AEF]" />
              <span>Scan Face</span>
            </Button>

            {/* Toggle button to reopen preview when closed */}
            {!showPreview && (
              <Button
                variant="outline"
                onClick={() => handleOpenPreview()}
                className="h-10 px-3 rounded-lg border-2 border-border bg-card/60 text-xs font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer gap-1.5 transition-colors shrink-0"
              >
                <User className="size-3.5 text-muted-foreground" />
                <span>Show Profile</span>
              </Button>
            )}
          </div>

          {/* Row 2: Filter Dropdowns, Active Filter Reset & Export Action */}
          <div className="flex flex-wrap items-end justify-between gap-2.5 sm:gap-3">
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

              {/* Reset Filters button when any filter or search query is active */}
              {(categoryFilter || riskFilter || statusFilter || searchTerm) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCategoryFilter(null);
                    setRiskFilter(null);
                    setStatusFilter(null);
                    setSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="h-10 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 rounded-lg border border-dashed border-border/80 hover:border-border transition-colors self-end"
                >
                  <X className="size-3.5" />
                  <span>Reset Filters</span>
                </Button>
              )}
            </div>

            {/* Export Filtered CSV Button */}
            <Button
              variant="outline"
              onClick={() => exportCriminalsToCSV(filteredCriminals)}
              className="h-10 px-3 rounded-lg border-2 border-border bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer gap-2 transition-colors shrink-0 self-end ml-auto sm:ml-0"
              title={`Export ${filteredCriminals.length} matching suspects to CSV`}
            >
              <Download className="size-3.5 text-muted-foreground" />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </Button>
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
                  <button
                    type="button"
                    onClick={() => handleToggleSort("name")}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group"
                  >
                    <span>Name</span>
                    {sortKey === "name" ? (
                      sortOrder === "asc" ? <ArrowUp className="size-3 text-[#665AEF]" /> : <ArrowDown className="size-3 text-[#665AEF]" />
                    ) : (
                      <ArrowUpDown className="size-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Aliases
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleToggleSort("dob")}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group"
                  >
                    <span>Date of Birth</span>
                    {sortKey === "dob" ? (
                      sortOrder === "asc" ? <ArrowUp className="size-3 text-[#665AEF]" /> : <ArrowDown className="size-3 text-[#665AEF]" />
                    ) : (
                      <ArrowUpDown className="size-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  Crime Categories
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleToggleSort("risk")}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group"
                  >
                    <span>Risk Level</span>
                    {sortKey === "risk" ? (
                      sortOrder === "asc" ? <ArrowUp className="size-3 text-[#665AEF]" /> : <ArrowDown className="size-3 text-[#665AEF]" />
                    ) : (
                      <ArrowUpDown className="size-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
                </TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-2.5 py-3 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => handleToggleSort("status")}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors cursor-pointer group"
                  >
                    <span>Status</span>
                    {sortKey === "status" ? (
                      sortOrder === "asc" ? <ArrowUp className="size-3 text-[#665AEF]" /> : <ArrowDown className="size-3 text-[#665AEF]" />
                    ) : (
                      <ArrowUpDown className="size-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                    )}
                  </button>
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
                  const isSelected = selectedIds.has(c.id);
                  const isActive = activeCriminalId === c.id;
                  return (
                    <TableRow
                      key={c.id}
                      data-state={isSelected ? "selected" : undefined}
                      className={cn(
                        "transition-colors hover:bg-muted/30 cursor-pointer",
                        isSelected && "bg-[#665AEF]/15 hover:bg-[#665AEF]/20",
                        !isSelected && isActive && "bg-muted/40"
                      )}
                      onClick={() => {
                        handleOpenPreview(c.id);
                      }}
                    >
                      <TableCell
                        className="w-9 px-2.5 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => {
                            toggleSelect(c.id);
                          }}
                          aria-label={`Select ${c.criminalId}`}
                        />
                      </TableCell>
                      {/* Photo column */}
                      <TableCell className="px-2.5 py-3">
                        <SuspectAvatar
                          mugshotUrl={c.mugshotUrl}
                          firstName={c.firstName}
                          lastName={c.lastName}
                          status={c.status as any}
                          riskLevel={c.riskLevel as any}
                          size="sm"
                          className="size-9 rounded-full border border-border/60"
                        />
                      </TableCell>
                      {/* Name + ID */}
                      <TableCell className="px-2.5 py-3 whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <Link
                            href={`/dashboard/criminals/${getCriminalSlug(c)}`}
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
          className="w-full xl:w-95 2xl:w-100 xl:sticky xl:top-6 min-w-0 will-change-[transform,opacity]"
        >
          <CriminalProfilePreview
            criminal={activeCriminal}
            onClose={handleClosePreview}
          />
        </div>
      )}

      {/* Floating Bulk Operations Bar */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-wrap items-center gap-2.5 sm:gap-3 px-4 py-2.5 rounded-2xl bg-card/95 backdrop-blur-2xl border-2 border-[#665AEF]/40 shadow-2xl shadow-black/60 text-foreground"
          >
            <div className="flex items-center gap-2 pr-2.5 sm:pr-3 border-r-2 border-border/60">
              <span className="flex size-2 rounded-full bg-[#665AEF] animate-pulse" />
              <span className="text-xs font-semibold font-mono tracking-wider text-foreground whitespace-nowrap">
                {selectedIds.size} SELECTED
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Export Selected Suspects CSV */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const selectedItems = allCriminals.filter((c) => selectedIds.has(c.id));
                  exportCriminalsToCSV(
                    selectedItems,
                    `selected-suspects-${new Date().toISOString().slice(0, 10)}.csv`
                  );
                }}
                className="h-8 px-2.5 sm:px-3 rounded-lg border-2 border-border bg-card/80 hover:bg-muted/60 text-xs font-medium cursor-pointer gap-1.5"
              >
                <FileSpreadsheet className="size-3.5 text-emerald-400" />
                <span>Export CSV</span>
              </Button>

              {/* Export Selected Suspects JSON */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const selectedItems = allCriminals.filter((c) => selectedIds.has(c.id));
                  exportCriminalsToJSON(
                    selectedItems,
                    `selected-suspects-${new Date().toISOString().slice(0, 10)}.json`
                  );
                }}
                className="h-8 px-2.5 sm:px-3 rounded-lg border-2 border-border bg-card/80 hover:bg-muted/60 text-xs font-medium cursor-pointer gap-1.5"
              >
                <Download className="size-3.5 text-cyan-400" />
                <span>Export JSON</span>
              </Button>

              {/* Priority Watchlist Bulk Toggle */}
              <Button
                size="sm"
                variant="outline"
                disabled={isBulkUpdating}
                onClick={async () => {
                  setIsBulkUpdating(true);
                  const ids = Array.from(selectedIds);
                  toast.promise(
                    bulkToggleCriminalWatchlist(ids, true).finally(() => setIsBulkUpdating(false)),
                    {
                      loading: `Adding ${ids.length} suspects to priority watchlist...`,
                      success: (res) => {
                        if (res.error) throw new Error(res.error);
                        return `Placed ${ids.length} suspects on Priority Watchlist`;
                      },
                      error: "Failed to update watchlist",
                    }
                  );
                }}
                className="h-8 px-2.5 sm:px-3 rounded-lg border-2 border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium cursor-pointer gap-1.5"
              >
                <Shield className="size-3.5 text-amber-400" />
                <span className="hidden sm:inline">Add to Watchlist</span>
                <span className="sm:hidden">Watchlist</span>
              </Button>

              {/* Bulk Status Update Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isBulkUpdating}
                      className="h-8 px-2.5 sm:px-3 rounded-lg border-2 border-border bg-card/80 hover:bg-muted/60 text-xs font-medium cursor-pointer gap-1.5"
                    />
                  }
                >
                  <Layers className="size-3.5 text-[#665AEF]" />
                  <span>Update Status</span>
                  <ChevronDown className="size-3 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  side="top"
                  sideOffset={8}
                  className="w-40 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border"
                >
                  {[
                    { label: "Active", value: "ACTIVE" },
                    { label: "Wanted", value: "WANTED" },
                    { label: "In Custody", value: "IN_CUSTODY" },
                    { label: "Inactive", value: "INACTIVE" },
                  ].map((st) => (
                    <DropdownMenuItem
                      key={st.value}
                      onClick={async () => {
                        setIsBulkUpdating(true);
                        const ids = Array.from(selectedIds);
                        toast.promise(
                          bulkUpdateCriminalStatus(ids, st.value as CriminalStatus).finally(() =>
                            setIsBulkUpdating(false)
                          ),
                          {
                            loading: `Setting status to ${st.label}...`,
                            success: () => `Updated ${ids.length} suspects to ${st.label}`,
                            error: "Failed to update status",
                          }
                        );
                      }}
                      className="cursor-pointer text-xs font-medium px-2.5 py-1.5 rounded-md hover:bg-accent/80"
                    >
                      Mark as {st.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Link to Case Modal Trigger */}
              <Button
                size="sm"
                variant="outline"
                disabled={isBulkUpdating}
                onClick={() => setIsBulkLinkOpen(true)}
                className="h-8 px-2.5 sm:px-3 rounded-lg border-2 border-border bg-card/80 hover:bg-muted/60 text-xs font-medium cursor-pointer gap-1.5"
              >
                <FolderPlus className="size-3.5 text-[#665AEF]" />
                <span className="hidden sm:inline">Link to Case</span>
                <span className="sm:hidden">Link</span>
              </Button>

              {/* Clear Selection */}
              <Button
                size="icon-xs"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
                title="Clear Selection"
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer ml-1"
              >
                <X className="size-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>

      {/* Bulk Link to Case Modal */}
      <Modal
        isOpen={isBulkLinkOpen}
        onClose={() => setIsBulkLinkOpen(false)}
        title="Link Suspects to Active Case"
        description={`Attach ${selectedIds.size} selected suspects to an ongoing investigation record.`}
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Case Number or Case ID</label>
            <Input
              placeholder="e.g. CAS-2026-001 or case UUID"
              value={bulkCaseInput}
              onChange={(e) => setBulkCaseInput(e.target.value)}
              className="h-9 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Suspect Role</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-9 justify-between rounded-lg border-2 border-border/80 bg-background/60 px-2.5 text-xs text-foreground cursor-pointer"
                    />
                  }
                >
                  <span className="truncate">
                    {bulkRole === SuspectRole.DIRECT_INVOLVEMENT && "Direct Involvement"}
                    {bulkRole === SuspectRole.POSSIBLE_ASSOCIATE && "Possible Associate"}
                    {bulkRole === SuspectRole.ACCOMPLICE && "Accomplice"}
                    {bulkRole === SuspectRole.INFORMANT && "Informant"}
                    {bulkRole === SuspectRole.WITNESS && "Witness"}
                    {bulkRole === SuspectRole.UNDER_INVESTIGATION && "Under Investigation"}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-1.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="w-48 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border z-50"
                >
                  {[
                    { val: SuspectRole.DIRECT_INVOLVEMENT, label: "Direct Involvement" },
                    { val: SuspectRole.POSSIBLE_ASSOCIATE, label: "Possible Associate" },
                    { val: SuspectRole.ACCOMPLICE, label: "Accomplice" },
                    { val: SuspectRole.INFORMANT, label: "Informant" },
                    { val: SuspectRole.WITNESS, label: "Witness" },
                    { val: SuspectRole.UNDER_INVESTIGATION, label: "Under Investigation" },
                  ].map((r) => (
                    <DropdownMenuItem
                      key={r.val}
                      onClick={() => setBulkRole(r.val)}
                      className="cursor-pointer px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted font-medium text-foreground flex items-center justify-between"
                    >
                      <span>{r.label}</span>
                      {bulkRole === r.val && <Check className="size-3.5 text-[#665AEF]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Case Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-9 justify-between rounded-lg border-2 border-border/80 bg-background/60 px-2.5 text-xs text-foreground cursor-pointer"
                    />
                  }
                >
                  <span className="truncate">
                    {bulkStatus === SuspectCaseStatus.PRIMARY_SUSPECT && "Primary Suspect"}
                    {bulkStatus === SuspectCaseStatus.PERSON_OF_INTEREST && "Person of Interest"}
                    {bulkStatus === SuspectCaseStatus.ACCOMPLICE && "Accomplice"}
                    {bulkStatus === SuspectCaseStatus.CLEARED && "Cleared"}
                    {bulkStatus === SuspectCaseStatus.CONVICTED && "Convicted"}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-1.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="w-48 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border z-50"
                >
                  {[
                    { val: SuspectCaseStatus.PRIMARY_SUSPECT, label: "Primary Suspect" },
                    { val: SuspectCaseStatus.PERSON_OF_INTEREST, label: "Person of Interest" },
                    { val: SuspectCaseStatus.ACCOMPLICE, label: "Accomplice" },
                    { val: SuspectCaseStatus.CLEARED, label: "Cleared" },
                    { val: SuspectCaseStatus.CONVICTED, label: "Convicted" },
                  ].map((st) => (
                    <DropdownMenuItem
                      key={st.val}
                      onClick={() => setBulkStatus(st.val)}
                      className="cursor-pointer px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted font-medium text-foreground flex items-center justify-between"
                    >
                      <span>{st.label}</span>
                      {bulkStatus === st.val && <Check className="size-3.5 text-[#665AEF]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsBulkLinkOpen(false)}
              className="h-9 px-3 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!bulkCaseInput.trim() || isBulkLinking}
              onClick={async () => {
                setIsBulkLinking(true);
                const ids = Array.from(selectedIds);
                try {
                  const res = await bulkLinkCriminalsToCase(
                    bulkCaseInput.trim(),
                    ids,
                    bulkRole,
                    bulkStatus
                  );
                  if (res.error) {
                    toast.error(res.error);
                  } else {
                    toast.success(
                      `Linked ${res.count} suspects to Case ${res.caseNumber || bulkCaseInput}`
                    );
                    setIsBulkLinkOpen(false);
                    setBulkCaseInput("");
                    setSelectedIds(new Set());
                  }
                } catch (err: any) {
                  toast.error(err?.message || "Failed to link suspects to case");
                } finally {
                  setIsBulkLinking(false);
                }
              }}
              className="h-9 px-4 text-xs bg-[#665AEF] hover:bg-[#5749DF] text-white"
            >
              {isBulkLinking ? "Linking..." : `Link ${selectedIds.size} Suspects`}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Optical Biometric Face Search Modal */}
      <OpticalFaceSearchModal
        isOpen={isOpticalSearchOpen}
        onClose={() => setIsOpticalSearchOpen(false)}
      />
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
    <div className="rounded-xl border-2 border-border bg-card/40 p-4 sm:p-5 shadow-xs overflow-hidden w-full max-w-100 2xl:max-w-105 mx-auto xl:max-w-none">
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
              <div className="relative w-32.5 sm:w-34.5 h-47.5 rounded-lg overflow-hidden border-2 border-border/80 bg-black/40 shrink-0 shadow-inner">
                <SuspectAvatar
                  mugshotUrl={criminal.mugshotUrl}
                  firstName={criminal.firstName}
                  lastName={criminal.lastName}
                  status={criminal.status as any}
                  riskLevel={criminal.riskLevel as any}
                  size="fill"
                  className="size-full rounded-none"
                  priority
                />
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
                render={<Link href={`/dashboard/criminals/${getCriminalSlug(criminal)}`} />}
                nativeButton={false}
              >
                <span>View Full Profile</span>
                <ArrowRight className="size-4" />
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    const nextStatus = criminal.status === "Wanted" ? "ACTIVE" : "WANTED";
                    toast.promise(
                      updateCriminalStatusAndRisk({
                        criminalId: criminal.id,
                        status: nextStatus,
                      }),
                      {
                        loading: "Updating watchlist status...",
                        success: `Status updated to ${nextStatus}`,
                        error: "Failed to update status",
                      }
                    );
                  }}
                  className="flex-1 h-9 rounded-lg border-2 border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-medium text-foreground/90 hover:text-foreground cursor-pointer gap-1.5 transition-colors"
                >
                  <Shield className="size-3.5 text-muted-foreground" />
                  <span>{criminal.status === "Wanted" ? "Remove Wanted" : "Add to Watchlist"}</span>
                </Button>
                <Button
                  variant="outline"
                  render={<Link href={`/sketch?criminalId=${criminal.id}&alias=${encodeURIComponent(criminal.alias || '')}`} />}
                  nativeButton={false}
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
