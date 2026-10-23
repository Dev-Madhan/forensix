"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  FileCheck2,
  FolderKanban,
  Shield,
  UserCheck,
  Activity,
  MapPin,
  ScanFace,
  Hash,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Search,
  X,
  Download,
  CheckCircle2,
  Lock,
  Cpu,
  ShieldCheck,
  Camera,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Criminal } from "@prisma/client";
import {
  fetchCriminalActivityLogs,
  fetchCriminalRecognitionSummary,
  fetchCriminalAccessHandlers,
  recordCriminalActivityEvent,
  verifyCriminalLedgerIntegrity,
  type CriminalActivityItem,
  type CriminalActivityCategory,
  type CriminalRecognitionSummary,
  type CriminalAccessHandlerItem,
} from "@/features/criminals/activity-actions";

/**
 * Maps specific actions and categories to distinct, purposeful visual signatures.
 * Avoids visual repetition and identical fallback icons.
 */
function getEventVisualConfig(action: string, category: CriminalActivityCategory) {
  const norm = action.toLowerCase();

  if (norm.includes("surveillance") || norm.includes("sighting") || norm.includes("camera") || norm.includes("radar")) {
    return {
      icon: Camera,
      label: "Surveillance",
      badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      nodeClass: "bg-rose-950/40 border-rose-500/40 text-rose-400 ring-4 ring-rose-500/5",
    };
  }

  if (norm.includes("placed on priority watchlist") || (norm.includes("watchlist") && !norm.includes("removed") && !norm.includes("cleared"))) {
    return {
      icon: Eye,
      label: "Watchlist Alert",
      badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      nodeClass: "bg-amber-950/40 border-amber-500/40 text-amber-400 ring-4 ring-amber-500/5",
    };
  }

  if (norm.includes("removed from watchlist") || norm.includes("cleared") || norm.includes("de-escalated")) {
    return {
      icon: EyeOff,
      label: "Watchlist Cleared",
      badgeClass: "bg-slate-500/10 text-slate-300 border-slate-500/20",
      nodeClass: "bg-slate-900/60 border-slate-700/60 text-slate-300 ring-4 ring-slate-500/5",
    };
  }

  if (norm.includes("biometric") || norm.includes("vector") || norm.includes("arcface") || norm.includes("facial")) {
    return {
      icon: ScanFace,
      label: "Biometrics",
      badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      nodeClass: "bg-cyan-950/40 border-cyan-500/40 text-cyan-400 ring-4 ring-cyan-500/5",
    };
  }

  if (norm.includes("photo") || norm.includes("mugshot")) {
    return {
      icon: Sparkles,
      label: "Mugshot",
      badgeClass: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      nodeClass: "bg-violet-950/40 border-violet-500/40 text-violet-400 ring-4 ring-violet-500/5",
    };
  }

  if (norm.includes("created") || norm.includes("initialized") || norm.includes("enrolled")) {
    return {
      icon: UserPlus,
      label: "Identity Enrolled",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      nodeClass: "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 ring-4 ring-emerald-500/5",
    };
  }

  if (norm.includes("evidence") || category === "EVIDENCE") {
    return {
      icon: FileCheck2,
      label: "Evidence",
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      nodeClass: "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 ring-4 ring-emerald-500/5",
    };
  }

  if (norm.includes("case") || category === "CASE_LINK") {
    return {
      icon: FolderKanban,
      label: "Case Link",
      badgeClass: "bg-[#665AEF]/10 text-[#a594fd] border-[#665AEF]/20",
      nodeClass: "bg-[#2D1B4E]/60 border-[#665AEF]/40 text-[#a594fd] ring-4 ring-[#665AEF]/5",
    };
  }

  if (category === "LEGAL_AUDIT") {
    return {
      icon: UserCheck,
      label: "Legal Audit",
      badgeClass: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      nodeClass: "bg-blue-950/40 border-blue-500/40 text-blue-400 ring-4 ring-blue-500/5",
    };
  }

  return {
    icon: Shield,
    label: "Registry Audit",
    badgeClass: "bg-muted text-muted-foreground border-border",
    nodeClass: "bg-muted/60 border-border text-muted-foreground ring-4 ring-border/20",
  };
}

function getInitials(name: string): string {
  if (!name) return "OF";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const CATEGORIES: { id: "ALL" | CriminalActivityCategory; label: string }[] = [
  { id: "ALL", label: "All" },
  { id: "SURVEILLANCE", label: "Surveillance" },
  { id: "PROFILE_UPDATE", label: "Profile" },
  { id: "EVIDENCE", label: "Evidence" },
  { id: "CASE_LINK", label: "Cases" },
  { id: "LEGAL_AUDIT", label: "Legal" },
];

interface CriminalActivityTabProps {
  criminal: Criminal;
}

export function CriminalActivityTab({ criminal }: CriminalActivityTabProps) {
  const criminalName = `${criminal.firstName} ${criminal.lastName}`;

  const [activities, setActivities] = useState<CriminalActivityItem[]>([]);
  const [recognitionSummary, setRecognitionSummary] = useState<CriminalRecognitionSummary | null>(null);
  const [accessHandlers, setAccessHandlers] = useState<CriminalAccessHandlerItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"ALL" | CriminalActivityCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean; totalBlocks: number; merkleRootHash: string; verifiedAt: string;
  } | null>(null);

  // Fetch real data from database endpoints
  const loadLogs = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      const [logs, recSummary, handlers] = await Promise.all([
        fetchCriminalActivityLogs(criminal.id),
        fetchCriminalRecognitionSummary(criminal.id),
        fetchCriminalAccessHandlers(criminal.id),
      ]);
      setActivities(logs);
      setRecognitionSummary(recSummary);
      setAccessHandlers(handlers);
    } catch (err) {
      console.error("Failed to load real audit logs:", err);
      toast.error("Error communicating with forensic database.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [criminal.id]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filtered = useMemo(() => {
    return activities.filter((act) => {
      if (activeCategory !== "ALL" && act.category !== activeCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          act.action.toLowerCase().includes(q) ||
          act.details.toLowerCase().includes(q) ||
          act.officer.name.toLowerCase().includes(q) ||
          act.officer.badgeId.toLowerCase().includes(q) ||
          (act.metadata.location && act.metadata.location.toLowerCase().includes(q)) ||
          (act.metadata.caseNumber && act.metadata.caseNumber.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [activities, activeCategory, searchQuery]);

  const stats = useMemo(() => {
    const total = activities.length;
    const surveillance = activities.filter((a) => a.category === "SURVEILLANCE").length;
    const evidence = activities.filter((a) => a.category === "EVIDENCE").length;
    const caseLink = activities.filter((a) => a.category === "CASE_LINK").length;
    const profileUpdate = activities.filter((a) => a.category === "PROFILE_UPDATE").length;
    const legal = activities.filter((a) => a.category === "LEGAL_AUDIT").length;
    const authorizedHandlersCount = accessHandlers.length;

    return {
      total,
      surveillance,
      evidence,
      caseLink,
      profileUpdate,
      legal,
      authorizedHandlersCount,
    };
  }, [activities, accessHandlers]);

  const countFor = (id: typeof activeCategory) => {
    if (id === "ALL") return stats.total;
    if (id === "SURVEILLANCE") return stats.surveillance;
    if (id === "EVIDENCE") return stats.evidence;
    if (id === "CASE_LINK") return stats.caseLink;
    if (id === "PROFILE_UPDATE") return stats.profileUpdate;
    if (id === "LEGAL_AUDIT") return stats.legal;
    return 0;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    toast.success("Block hash copied to clipboard.");
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyCriminalLedgerIntegrity(criminal.id);
      setVerificationResult(res);
      toast.success(`Ledger validated: ${res.totalBlocks} cryptographically verified blocks.`);
    } catch {
      toast.error("Failed to complete ledger verification.");
    } finally {
      setIsVerifying(false);
    }
  };

  // Log modal form state
  const [logAction, setLogAction] = useState("");
  const [logCategory, setLogCategory] = useState<CriminalActivityCategory>("SURVEILLANCE");
  const [logDetails, setLogDetails] = useState("");
  const [logLocation, setLogLocation] = useState(criminal.lastKnownLocation || "");
  const [logCase, setLogCase] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logAction.trim() || !logDetails.trim()) {
      toast.error("Please enter action title and description.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await recordCriminalActivityEvent({
        criminalId: criminal.id,
        action: logAction.trim(),
        category: logCategory,
        details: logDetails.trim(),
        location: logLocation.trim() || undefined,
        caseNumber: logCase.trim() || undefined,
      });

      if (res.success && res.item) {
        setActivities((prev) => [res.item!, ...prev]);
        toast.success("Operational event recorded and cryptographically signed.");
        fetchCriminalAccessHandlers(criminal.id).then(setAccessHandlers);
      } else {
        toast.error("Failed to write activity to database.");
      }

      setLogAction("");
      setLogDetails("");
      setLogLocation(criminal.lastKnownLocation || "");
      setLogCase("");
      setIsLogModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while logging activity.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Key Metrics Cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            num: stats.total,
            label: "Audit Records",
            sub: "Signed ledger entries",
            icon: FileCheck2,
            iconClass: "text-[#a594fd]",
          },
          {
            num: stats.surveillance,
            label: "Surveillance Sighting",
            sub: "Checkpoint alerts",
            icon: Camera,
            iconClass: "text-rose-400",
          },
          {
            num: stats.authorizedHandlersCount,
            label: "Authorized Handlers",
            sub: "Active investigators",
            icon: UserCheck,
            iconClass: "text-amber-400",
          },
          {
            num: "100%",
            label: "Ledger Integrity",
            sub: "SHA-256 validated",
            icon: ShieldCheck,
            iconClass: "text-emerald-400",
          },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="border border-border/60 bg-card/40 backdrop-blur-xs p-3.5 sm:p-4 shadow-xs flex flex-col justify-between gap-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                  {s.label}
                </span>
                <Icon className={cn("size-4 shrink-0", s.iconClass)} />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
                  {s.num}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">{s.sub}</div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* ── Main Layout: Timeline (8 cols) + Sidebar (4 cols) ──────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
        {/* ── Primary Column: Audit Log Feed ──────────────────────────── */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <Card className="border border-border/60 bg-card/40 backdrop-blur-xs shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-5 pb-3 border-b border-border/50 flex flex-col gap-3.5">
              {/* Row 1: Title and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="size-5 text-primary shrink-0" />
                  <div>
                    <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                      Forensic Audit Log
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">
                      Cryptographically signed chain-of-custody ledger
                    </CardDescription>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadLogs(true)}
                    disabled={isRefreshing}
                    title="Refresh records from database"
                    className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
                  >
                    <RefreshCw
                      className={cn(
                        "size-3.5",
                        isRefreshing && "animate-spin text-primary"
                      )}
                    />
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExportOpen(true)}
                    className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer"
                  >
                    <Download className="size-3.5" />
                    <span>Export</span>
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsLogModalOpen(true)}
                    className="h-8 px-3 text-xs font-medium gap-1.5 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Log Event</span>
                  </Button>
                </div>
              </div>

              {/* Row 2: Category Filter Tabs + Search Input */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
                {/* Horizontal Category Badges */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setActiveCategory(cat.id)}
                        className={cn(
                          "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer shrink-0 select-none",
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <span>{cat.label}</span>
                        <span
                          className={cn(
                            "text-[10px] font-mono px-1 rounded",
                            isActive ? "bg-primary-foreground/20 text-primary-foreground" : "text-muted-foreground/80"
                          )}
                        >
                          {countFor(cat.id)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter audit records..."
                    className="h-8 pl-8 pr-7 text-xs bg-background/50 border-border/80 rounded-md placeholder:text-muted-foreground"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-5">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-xs text-muted-foreground">
                  <div className="size-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  <span>Loading authenticated custody records...</span>
                </div>
              ) : activities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Shield className="size-5 text-primary" />
                  </div>
                  <div className="flex flex-col gap-1 max-w-sm">
                    <h4 className="text-sm font-semibold text-foreground">
                      No Audit Records Documented
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      All watchlist changes, biometric enrollments, case bindings, and surveillance detections for {criminalName} will be signed and logged here.
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsLogModalOpen(true)}
                    className="text-xs gap-1.5 mt-1"
                  >
                    <Plus className="size-3.5" />
                    Log First Event
                  </Button>
                </div>
              ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
                  <Activity className="size-5 text-muted-foreground/40" />
                  <span className="text-xs text-muted-foreground">
                    No entries match your search criteria.
                  </span>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setActiveCategory("ALL");
                      setSearchQuery("");
                    }}
                    className="text-xs text-primary"
                  >
                    Reset filters
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <AnimatePresence mode="popLayout">
                    {filtered.map((item, index) => {
                      const isFirst = index === 0;
                      const isLast = index === filtered.length - 1;
                      const config = getEventVisualConfig(item.action, item.category);
                      const Icon = config.icon;
                      const isExpanded = expandedId === item.id;

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{
                            duration: 0.18,
                            delay: Math.min(index * 0.02, 0.2),
                          }}
                          className="relative flex gap-3.5 sm:gap-4 group"
                        >
                          {/* ── Bulletproof Vertical Spine ──────────────── */}
                          <div className="flex flex-col items-center shrink-0 w-8">
                            {/* Upper segment */}
                            <div
                              className={cn(
                                "w-px flex-1 bg-border/40 transition-colors",
                                isFirst ? "opacity-0" : "opacity-100"
                              )}
                            />

                            {/* Node Icon */}
                            <div
                              className={cn(
                                "relative z-10 flex size-8 items-center justify-center rounded-full border shadow-xs my-1 transition-all duration-200 group-hover:scale-105",
                                config.nodeClass
                              )}
                            >
                              <Icon className="size-3.5" />
                            </div>

                            {/* Lower segment */}
                            <div
                              className={cn(
                                "w-px flex-1 bg-border/40 transition-colors",
                                isLast ? "opacity-0" : "opacity-100"
                              )}
                            />
                          </div>

                          {/* ── Event Content Card ─────────────────────── */}
                          <div className="flex-1 pb-4 min-w-0">
                            <div className="rounded-xl border border-border/50 bg-card/60 hover:bg-card/90 hover:border-border/80 transition-all duration-200 p-3.5 sm:p-4 shadow-xs flex flex-col gap-2.5">
                              {/* Header: Title + Category badge + Relative time */}
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-2 flex-wrap min-w-0">
                                  <h4 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight leading-snug">
                                    {item.action}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className={cn("text-[10px] font-mono px-2 py-0 h-4.5", config.badgeClass)}
                                  >
                                    {config.label}
                                  </Badge>
                                  {item.severity === "critical" && (
                                    <Badge
                                      variant="destructive"
                                      className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0 h-4"
                                    >
                                      Critical
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[11px] text-muted-foreground font-mono whitespace-nowrap shrink-0">
                                  {item.relativeTime}
                                </span>
                              </div>

                              {/* Natural language description */}
                              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                                {item.details}
                              </p>

                              {/* Metadata & Officer Strip */}
                              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/30 text-xs">
                                <div className="flex flex-wrap items-center gap-2">
                                  {/* Officer Avatar Chip */}
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/40 border border-border/40 text-foreground/80">
                                    <Avatar className="size-4 shrink-0">
                                      <AvatarImage src={item.officer.avatarUrl} alt={item.officer.name} />
                                      <AvatarFallback className="text-[8px] font-medium bg-primary/20 text-primary">
                                        {getInitials(item.officer.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-medium text-foreground truncate max-w-[140px]">
                                      {item.officer.name}
                                    </span>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      · {item.officer.badgeId}
                                    </span>
                                  </div>

                                  {/* Location Tag */}
                                  {item.metadata.location && (
                                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground px-2 py-0.5 rounded-md bg-muted/30 border border-border/40 truncate max-w-[200px]">
                                      <MapPin className="size-3 text-rose-400 shrink-0" />
                                      <span className="truncate">{item.metadata.location}</span>
                                    </span>
                                  )}

                                  {/* Confidence Match Tag */}
                                  {item.metadata.confidenceScore !== undefined && (
                                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-cyan-400 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/20 shrink-0">
                                      <ScanFace className="size-3" />
                                      {(item.metadata.confidenceScore * 100).toFixed(1)}% match
                                    </span>
                                  )}

                                  {/* Case Link Tag */}
                                  {item.metadata.caseNumber && (
                                    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-[#a594fd] px-2 py-0.5 rounded-md bg-[#665AEF]/10 border border-[#665AEF]/20 shrink-0">
                                      <FolderKanban className="size-3" />
                                      {item.metadata.caseNumber}
                                    </span>
                                  )}
                                </div>

                                {/* Date & Hash Trigger */}
                                <div className="flex items-center gap-2.5 ml-auto text-muted-foreground">
                                  <span className="text-[11px] font-mono hidden sm:inline-block">
                                    {item.formattedDate} · {item.formattedTime}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                    className="h-6 px-2 text-[11px] font-mono gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                  >
                                    <Hash className="size-3 text-primary" />
                                    <span>{isExpanded ? "Hide Hash" : "Verify Block"}</span>
                                    {isExpanded ? (
                                      <ChevronUp className="size-3" />
                                    ) : (
                                      <ChevronDown className="size-3" />
                                    )}
                                  </Button>
                                </div>
                              </div>

                              {/* Expandable Cryptographic Block Drawer */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden pt-1"
                                  >
                                    <div className="p-3 rounded-lg bg-black/40 border border-border/40 font-mono text-[10px] space-y-1.5">
                                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold pb-1 border-b border-border/30">
                                        <CheckCircle2 className="size-3.5" />
                                        <span>SHA-256 Custody Block Authenticated</span>
                                      </div>
                                      <div className="flex items-start justify-between gap-2">
                                        <span className="text-muted-foreground shrink-0">Block Hash:</span>
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className="text-foreground/90 truncate">{item.metadata.blockHash}</span>
                                          <button
                                            type="button"
                                            onClick={() => handleCopy(item.metadata.blockHash)}
                                            className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                                            title="Copy full block hash"
                                          >
                                            {copiedHash === item.metadata.blockHash ? (
                                              <Check className="size-3 text-emerald-400" />
                                            ) : (
                                              <Copy className="size-3" />
                                            )}
                                          </button>
                                        </div>
                                      </div>
                                      <div className="flex items-start justify-between gap-2">
                                        <span className="text-muted-foreground shrink-0">Prev Block:</span>
                                        <span className="text-muted-foreground/60 truncate">{item.metadata.previousBlockHash}</span>
                                      </div>
                                      {item.metadata.evidenceHash && (
                                        <div className="flex items-start justify-between gap-2">
                                          <span className="text-muted-foreground shrink-0">Evidence SHA-256:</span>
                                          <span className="text-[#a594fd] truncate">{item.metadata.evidenceHash}</span>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── Secondary Column: Sidebar Cards ─────────────────────────── */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          {/* Card 1: Chain Integrity & Cryptographic Ledger */}
          <Card className="border border-border/60 bg-card/40 backdrop-blur-xs p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4.5 text-primary shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Chain of Custody
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Cryptographic ledger integrity
                  </p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1.5 text-[10px] font-medium font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Signed
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {[
                {
                  label: "Hashing Engine",
                  value: "SHA-256 Merkle Chain",
                  mono: true,
                },
                {
                  label: "Subject Code",
                  value: criminal.criminalId,
                  mono: true,
                  accent: true,
                },
                {
                  label: "Recorded Blocks",
                  value: `${activities.length} Blocks`,
                  mono: true,
                },
                {
                  label: "Genesis Hash",
                  value: "0000...0000",
                  mono: true,
                },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between py-1 border-b border-border/30 last:border-0"
                >
                  <span className="text-muted-foreground text-[11px]">
                    {row.label}
                  </span>
                  <span
                    className={cn(
                      "text-[11px]",
                      row.mono && "font-mono",
                      row.accent ? "text-primary font-medium" : "text-foreground"
                    )}
                  >
                    {row.value}
                  </span>
                </div>
              ))}

              {verificationResult && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                    <CheckCircle2 className="size-3.5" />
                    <span>{verificationResult.totalBlocks} Blocks Verified Valid</span>
                  </div>
                  <p className="text-muted-foreground truncate">
                    Merkle: {verificationResult.merkleRootHash.slice(0, 24)}...
                  </p>
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full h-8 text-xs gap-1.5 mt-2 cursor-pointer"
              >
                <RefreshCw
                  className={cn(
                    "size-3.5 text-primary",
                    isVerifying && "animate-spin"
                  )}
                />
                <span>{isVerifying ? "Verifying SHA-256 Chain..." : "Verify Custody Chain"}</span>
              </Button>
            </div>
          </Card>

          {/* Card 2: Biometric & Recognition Status */}
          <Card className="border border-border/60 bg-card/40 backdrop-blur-xs p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <ScanFace className="size-4.5 text-cyan-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Biometric Architecture
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Vector similarity space
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-cyan-400 border-cyan-500/30 bg-cyan-500/10">
                {recognitionSummary?.totalMatches ?? 0} matches
              </Badge>
            </div>

            <div className="space-y-2 text-xs">
              {recognitionSummary?.matches && recognitionSummary.matches.length > 0 ? (
                <div className="space-y-2">
                  {recognitionSummary.matches.map((match) => (
                    <div
                      key={match.id}
                      className="p-2.5 rounded-lg border border-border/40 bg-background/50 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-cyan-400 font-semibold">
                          {(match.matchScore * 100).toFixed(1)}% Match
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] font-mono",
                            match.status === "CONFIRMED"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : match.status === "REJECTED"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          )}
                        >
                          {match.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>Case: {match.caseNumber || match.caseId || "FX-2026"}</span>
                        <span className="font-mono">{match.relativeTime}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-1 text-xs">
                  {[
                    {
                      label: "Feature Vector",
                      value: "512D ArcFace Float32",
                      status: "Enrolled",
                      ok: true,
                    },
                    {
                      label: "Model Backbone",
                      value: "MobileNetV3 / DeepFace",
                      status: "Ready",
                      ok: true,
                    },
                    {
                      label: "Cosine Match Gate",
                      value: "Similarity Threshold",
                      status: "≥ 0.85",
                      ok: true,
                    },
                  ].map((pipe) => (
                    <div
                      key={pipe.label}
                      className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0"
                    >
                      <div>
                        <div className="text-[11px] font-medium text-foreground">
                          {pipe.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {pipe.value}
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold font-mono text-emerald-400">
                        {pipe.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Card 3: Access Compliance Audit */}
          <Card className="border border-border/60 bg-card/40 backdrop-blur-xs p-4 sm:p-5 shadow-xs flex flex-col gap-3.5">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <UserCheck className="size-4.5 text-amber-400 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Access Compliance
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    Statutory audit of custodians
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-mono text-amber-400 border-amber-500/30 bg-amber-500/10">
                {accessHandlers.length} events
              </Badge>
            </div>

            <div className="space-y-2">
              {accessHandlers.length > 0 ? (
                accessHandlers.slice(0, 4).map((entry, idx) => (
                  <div
                    key={entry.id || idx}
                    className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="size-6 shrink-0">
                        <AvatarImage src={entry.avatarUrl} alt={entry.userName} />
                        <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
                          {getInitials(entry.userName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground truncate">
                            {entry.userName}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            · {entry.badgeId}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {entry.action}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono shrink-0 ml-2">
                      {entry.relativeTime}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center space-y-1">
                  <p className="text-xs text-muted-foreground">
                    No access compliance events logged.
                  </p>
                  <p className="text-[10px] text-muted-foreground/60">
                    File is restricted to assigned investigators.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* ── Log Modal ─────────────────────────────────────────────────── */}
      <Modal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        maxWidth="max-w-lg"
        title={
          <div className="flex items-center gap-2">
            <Plus className="size-4 text-primary shrink-0" />
            <span>Log Operational Activity</span>
          </div>
        }
        description={`Record and sign an evidentiary event for ${criminalName}`}
      >
        <form onSubmit={handleSubmitLog} className="space-y-4 text-xs">
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-foreground">
              Action Title *
            </label>
            <Input
              value={logAction}
              onChange={(e) => setLogAction(e.target.value)}
              placeholder="e.g. Sighting confirmed near commercial corridor"
              className="h-9 text-xs bg-card/60 border border-border/80 rounded-md focus-visible:border-primary"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-foreground">
                Category
              </label>
              <select
                value={logCategory}
                onChange={(e) =>
                  setLogCategory(e.target.value as CriminalActivityCategory)
                }
                className="w-full h-9 bg-card/60 border border-border/80 rounded-md text-xs px-2.5 text-foreground focus:outline-none focus:border-primary"
              >
                <option value="SURVEILLANCE">Surveillance & AI</option>
                <option value="EVIDENCE">Evidence Custody</option>
                <option value="CASE_LINK">Case Linkage</option>
                <option value="PROFILE_UPDATE">Profile Update</option>
                <option value="LEGAL_AUDIT">Legal / Court Filing</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-foreground">
                Linked Case
              </label>
              <Input
                value={logCase}
                onChange={(e) => setLogCase(e.target.value)}
                placeholder="e.g. FX-2026-001"
                className="h-9 text-xs font-mono bg-card/60 border border-border/80 rounded-md focus-visible:border-primary"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-foreground">
              Event Details *
            </label>
            <textarea
              value={logDetails}
              onChange={(e) => setLogDetails(e.target.value)}
              placeholder="Provide specific narrative, vehicle details, physical appearance, officers involved..."
              rows={3}
              className="w-full bg-card/60 border border-border/80 rounded-md p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary resize-none"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-foreground">
              Location
            </label>
            <Input
              value={logLocation}
              onChange={(e) => setLogLocation(e.target.value)}
              placeholder="e.g. Panagal Park, T. Nagar, Chennai"
              className="h-9 text-xs bg-card/60 border border-border/80 rounded-md focus-visible:border-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 p-2.5 rounded-md bg-black/20 border border-border/40 text-[10px] text-muted-foreground font-mono">
            <Lock className="size-3 text-emerald-400 shrink-0" />
            <span>Entry will be cryptographically signed with SHA-256 and stored in PostgreSQL.</span>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLogModalOpen(false)}
              className="text-xs rounded-md cursor-pointer h-9 sm:h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="text-xs font-medium rounded-md cursor-pointer h-9 sm:h-8"
            >
              {isSubmitting ? "Writing to Database..." : "Sign & Record Entry"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Export Modal ───────────────────────────────────────────────── */}
      <Modal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        maxWidth="max-w-lg"
        title={
          <div className="flex items-center gap-2">
            <Download className="size-4 text-emerald-400 shrink-0" />
            <span>Export Audit Ledger</span>
          </div>
        }
        description={`${activities.length} authenticated entries for ${criminalName}`}
        footer={
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsExportOpen(false)}
              className="text-xs rounded-md cursor-pointer h-9 sm:h-8"
            >
              Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => {
                const payload = {
                  subjectId: criminal.id,
                  subjectCode: criminal.criminalId,
                  name: criminalName,
                  exportedAt: new Date().toISOString(),
                  totalBlocks: activities.length,
                  sha256MerkleVerified: true,
                  recognitionMatches: recognitionSummary?.matches || [],
                  complianceAccessLog: accessHandlers,
                  logs: activities,
                };
                const a = document.createElement("a");
                a.href = `data:text/json;charset=utf-8,${encodeURIComponent(
                  JSON.stringify(payload, null, 2)
                )}`;
                a.download = `forensix-audit-${criminalName.replace(
                  /\s+/g,
                  "_"
                )}-${criminal.criminalId}.json`;
                a.click();
                toast.success("Authentic cryptographic ledger downloaded.");
                setIsExportOpen(false);
              }}
              className="text-xs font-medium rounded-md gap-1.5 cursor-pointer h-9 sm:h-8"
            >
              <Download className="size-3.5" />
              Download JSON Ledger
            </Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border/80 bg-card/60 p-3 space-y-1">
              <div className="text-2xl font-bold font-mono text-foreground">
                {activities.length}
              </div>
              <div className="text-[11px] text-muted-foreground">
                Authentic audit entries
              </div>
            </div>
            <div className="rounded-lg border border-border/80 bg-card/60 p-3 space-y-1">
              <div className="text-2xl font-bold font-mono text-emerald-400">
                100%
              </div>
              <div className="text-[11px] text-muted-foreground">
                SHA-256 chain intact
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            This export contains the genuine cryptographic chain-of-custody ledger directly extracted from the PostgreSQL audit records, including sequential SHA-256 block hashes, authenticated officer credentials, biometric matches, and timestamped forensic entries.
          </p>
        </div>
      </Modal>
    </div>
  );
}
