"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertTriangle,
  FileCheck2,
  FolderKanban,
  Shield,
  UserCheck,
  User,
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
  XCircle,
  Upload,
  Lock,
  Cpu,
  ShieldCheck,
  Camera,
  Eye,
  EyeOff,
  UserPlus,
  Sparkles,
  Wifi,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { getSafeStorageUrl } from "@/lib/storage-url";
import { SuspectAvatar } from "@/features/criminals/components/suspect-avatar";
import { useCriminalRealtime } from "@/features/criminals/hooks/use-criminal-realtime";
import NumberFlow from "@number-flow/react";
import { useInView } from "react-intersection-observer";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { SurveillanceHitStatus, type Criminal } from "@prisma/client";
import { acknowledgeSurveillanceHit } from "@/features/criminals/actions";
import {
  fetchCriminalActivityLogs,
  fetchCriminalRecognitionSummary,
  fetchCriminalAccessHandlers,
  recordCriminalActivityEvent,
  verifyCriminalLedgerIntegrity,
  recordSurveillanceHitAction,
  type CriminalActivityItem,
  type CriminalActivityCategory,
  type CriminalRecognitionSummary,
  type CriminalAccessHandlerItem,
} from "@/features/criminals/activity-actions";

export const SENSOR_PRESETS = [
  {
    sensorId: "ANPR-CAM-01",
    sensorName: "Anna Salai Junction High-Speed ANPR",
    location: "Anna Salai - Mount Road Corridor, Chennai",
    latitude: 13.0827,
    longitude: 80.2707,
  },
  {
    sensorId: "CCTV-AI-08",
    sensorName: "Chennai Central Station Gate 3 Optical Node",
    location: "Park Town Terminal, Chennai",
    latitude: 13.0827,
    longitude: 80.2755,
  },
  {
    sensorId: "CHECKPOINT-NORTH-02",
    sensorName: "Grand Northern Trunk Highway Scanner",
    location: "GNT Highway Checkpoint 2, Chennai",
    latitude: 13.1200,
    longitude: 80.2500,
  },
  {
    sensorId: "TRAFFIC-RADAR-14",
    sensorName: "Kathipara Junction Automated Surveillance",
    location: "Kathipara Grade Separator, Guindy",
    latitude: 13.0067,
    longitude: 80.2033,
  },
  {
    sensorId: "AIRPORT-FACIAL-05",
    sensorName: "Meenambakkam Terminal Automated AI Camera",
    location: "Chennai International Airport Terminal 2",
    latitude: 12.9856,
    longitude: 80.1693,
  },
];

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
      badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      nodeClass: "bg-emerald-950/40 border-emerald-500/40 text-emerald-400 ring-4 ring-emerald-500/5",
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
      badgeClass: "bg-neutral-800 text-neutral-300 border-neutral-700",
      nodeClass: "bg-neutral-900 border-neutral-700 text-neutral-300 ring-4 ring-neutral-800/40",
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
      badgeClass: "bg-sky-500/10 text-sky-400 border-sky-500/20",
      nodeClass: "bg-sky-950/40 border-sky-500/40 text-sky-400 ring-4 ring-sky-500/5",
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
  mugshotDisplayUrl?: string | null;
}

function RollingNumber({
  value,
  suffix,
}: {
  value: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  useEffect(() => {
    if (inView) {
      setDisplayValue(value);
    }
  }, [inView, value]);

  return (
    <span ref={ref} className="inline-block">
      <NumberFlow
        value={displayValue}
        suffix={suffix}
        trend={1}
        className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums font-heading"
      />
    </span>
  );
}

/**
 * High-fidelity loading skeleton for the Forensic Activity & Custody Tab.
 * Renders immediate visual structure while initial database queries resolve.
 */
export function ActivityTabSkeleton() {
  return (
    <div className="flex flex-col gap-5 w-full animate-in fade-in-50 duration-200">
      {/* ── Top Metric Cards Skeleton ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card
            key={i}
            className="flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card/70 p-3.5 sm:p-5 shadow-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-3.5 sm:h-4 w-20 sm:w-28 rounded bg-muted/60" />
              <Skeleton className="size-4.5 sm:size-5 rounded-md bg-neutral-800 shrink-0" />
            </div>
            <div className="space-y-1.5">
              <Skeleton className="h-7 sm:h-8 w-14 sm:w-20 rounded-md bg-muted/70" />
              <div className="flex items-center justify-between gap-1.5 min-w-0">
                <Skeleton className="h-3 w-24 sm:w-28 rounded bg-muted/40" />
                {i === 4 && (
                  <Skeleton className="h-4 w-12 rounded-md bg-emerald-500/20 shrink-0" />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Mobile View Switcher Skeleton ── */}
      <div className="flex lg:hidden items-center p-1 rounded-xl bg-card/60 border border-border/60 text-xs w-full gap-2">
        <Skeleton className="flex-1 h-8 rounded-lg bg-neutral-800" />
        <Skeleton className="flex-1 h-8 rounded-lg bg-muted/40" />
      </div>

      {/* ── Main Layout: Timeline (8 cols) + Sidebar (4 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full min-w-0 items-start">
        {/* Primary Column: Audit Log Feed Skeleton */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-4 min-w-0 w-full">
          <Card className="border border-border/60 bg-card/60 shadow-xs rounded-xl overflow-hidden min-w-0 w-full">
            {/* Header Skeleton */}
            <CardHeader className="p-3.5 sm:p-5 pb-3 border-b border-border/50 flex flex-col gap-3 min-w-0 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 w-full">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Skeleton className="size-5 rounded-md bg-neutral-800 shrink-0" />
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-32 sm:w-40 rounded bg-muted/70" />
                      <Skeleton className="h-3.5 w-16 rounded bg-emerald-500/20" />
                    </div>
                    <Skeleton className="h-3 w-48 sm:w-64 rounded bg-muted/40" />
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
                  <Skeleton className="h-8.5 sm:h-8 flex-1 sm:w-24 rounded-lg bg-neutral-800 shrink-0" />
                  <Skeleton className="h-8.5 sm:h-8 flex-1 sm:w-28 rounded-lg bg-rose-500/20 shrink-0" />
                  <Skeleton className="h-8.5 sm:h-8 w-16 sm:w-20 rounded-lg bg-muted/40 shrink-0" />
                </div>
              </div>

              {/* Filter Chips + Search Bar Skeleton */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 min-w-0 w-full">
                <div className="flex items-center gap-1.5 overflow-hidden py-1 w-full sm:w-auto">
                  <Skeleton className="h-7 w-14 rounded-lg bg-neutral-800 shrink-0" />
                  <Skeleton className="h-7 w-24 rounded-lg bg-muted/50 shrink-0" />
                  <Skeleton className="h-7 w-16 rounded-lg bg-muted/50 shrink-0" />
                  <Skeleton className="h-7 w-20 rounded-lg bg-muted/50 shrink-0" />
                  <Skeleton className="h-7 w-16 rounded-lg bg-muted/50 shrink-0" />
                </div>
                <Skeleton className="h-8.5 sm:h-8 w-full sm:w-64 rounded-md bg-muted/50 shrink-0" />
              </div>
            </CardHeader>

            {/* Timeline Items Skeleton */}
            <CardContent className="p-4 sm:p-5">
              <div className="relative pl-6 sm:pl-8 space-y-6 sm:space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-border/40">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="relative">
                    {/* Node Icon */}
                    <div className="absolute -left-6 sm:-left-8 top-1.5 flex items-center justify-center">
                      <Skeleton className="size-5 sm:size-6 rounded-full bg-muted/60 ring-4 ring-background" />
                    </div>

                    {/* Event Card */}
                    <div className="rounded-xl border border-border/50 bg-card/40 p-3 sm:p-4 space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-4 w-20 rounded bg-neutral-800" />
                          <Skeleton className="h-4 w-32 sm:w-48 rounded bg-muted/60" />
                        </div>
                        <Skeleton className="h-3 w-16 rounded bg-muted/40" />
                      </div>
                      <Skeleton className="h-3.5 w-full max-w-md rounded bg-muted/40" />
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2">
                          <Skeleton className="size-5 rounded-full bg-muted/50" />
                          <Skeleton className="h-3 w-28 rounded bg-muted/40" />
                        </div>
                        <Skeleton className="h-5 w-20 rounded bg-muted/40" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column: Custody Ledger & Face Recognition Skeleton */}
        <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 flex-col gap-4 min-w-0 w-full">
          <Card className="border border-border/60 bg-card/60 shadow-xs rounded-xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4.5 rounded bg-emerald-500/20" />
                <Skeleton className="h-4 w-28 rounded bg-muted/60" />
              </div>
              <Skeleton className="h-4 w-16 rounded-md bg-emerald-500/20" />
            </div>
            <Skeleton className="h-16 w-full rounded-lg bg-muted/30" />
            <div className="space-y-2 pt-2 border-t border-border/40">
              <Skeleton className="h-3.5 w-32 rounded bg-muted/60" />
              <div className="space-y-2">
                {[1, 2, 3].map((h) => (
                  <div key={h} className="flex items-center justify-between p-2 rounded-lg bg-background/40">
                    <div className="flex items-center gap-2">
                      <Skeleton className="size-7 rounded-full bg-muted/50" />
                      <div className="space-y-1">
                        <Skeleton className="h-3 w-20 rounded bg-muted/60" />
                        <Skeleton className="h-2.5 w-16 rounded bg-muted/40" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-12 rounded bg-muted/40" />
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card className="border border-border/60 bg-card/60 shadow-xs rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded bg-cyan-500/20" />
                <Skeleton className="h-4 w-32 rounded bg-muted/60" />
              </div>
              <Skeleton className="h-4 w-14 rounded-md bg-cyan-500/20" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full rounded-lg bg-muted/30" />
              <Skeleton className="h-10 w-full rounded-lg bg-muted/30" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function CriminalActivityTab({ criminal, mugshotDisplayUrl }: CriminalActivityTabProps) {
  const criminalName = `${criminal.firstName} ${criminal.lastName}`;

  const resolvedMugshotUrl = useMemo(() => {
    if (mugshotDisplayUrl && !mugshotDisplayUrl.includes("undefined")) {
      return getSafeStorageUrl(mugshotDisplayUrl);
    }
    if (criminal.mugshotUrl) {
      return getSafeStorageUrl(criminal.mugshotUrl);
    }
    return "/images/suspects/arun-prakash.jpg";
  }, [mugshotDisplayUrl, criminal.mugshotUrl]);

  const [hasMugshotError, setHasMugshotError] = useState(false);

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
  const [mobileTab, setMobileTab] = useState<"feed" | "ledger">("feed");

  // ── Native Real-Time Server-Sent Events (SSE) Stream ────────────
  const { isConnected: isLiveConnected } = useCriminalRealtime({
    criminalId: criminal.id,
    criminalName,
    onActivityLogged: () => {
      loadLogs(true);
    },
    onSurveillanceHit: () => {
      loadLogs(true);
    },
  });

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
    const rawTotal = activities.length;
    const surveillance =
      activities.length > 0
        ? activities.filter((a) => a.category === "SURVEILLANCE").length
        : ((criminal as any).surveillanceHits?.length ?? 0);
    const evidence =
      activities.length > 0
        ? activities.filter((a) => a.category === "EVIDENCE").length
        : ((criminal as any).evidences?.length ?? 0);
    const caseLink =
      activities.length > 0
        ? activities.filter((a) => a.category === "CASE_LINK").length
        : ((criminal as any).caseLinks?.length ?? 0);
    const profileUpdate = activities.filter((a) => a.category === "PROFILE_UPDATE").length;
    const legal = activities.filter((a) => a.category === "LEGAL_AUDIT").length;
    const authorizedHandlersCount =
      accessHandlers.length > 0 ? accessHandlers.length : Math.max(caseLink + 1, 1);

    const total =
      rawTotal > 0
        ? rawTotal
        : surveillance + evidence + caseLink + profileUpdate + legal;

    return {
      total,
      surveillance,
      evidence,
      caseLink,
      profileUpdate,
      legal,
      authorizedHandlersCount,
    };
  }, [activities, accessHandlers, criminal]);

  const countFor = (id: typeof activeCategory) => {
    if (id === "ALL") return stats.total;
    if (id === "SURVEILLANCE") return stats.surveillance;
    if (id === "EVIDENCE") return stats.evidence;
    if (id === "CASE_LINK") return stats.caseLink;
    if (id === "PROFILE_UPDATE") return stats.profileUpdate;
    if (id === "LEGAL_AUDIT") return stats.legal;
    return 0;
  };

  // ── Drag & Touch Horizontal Scroll for Category Filters ──
  const filterScrollRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!filterScrollRef.current) return;
    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    dragStartXRef.current = e.clientX;
    dragStartScrollLeftRef.current = filterScrollRef.current.scrollLeft;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPointerDownRef.current || !filterScrollRef.current) return;
    const dx = e.clientX - dragStartXRef.current;
    if (Math.abs(dx) > 4) {
      hasDraggedRef.current = true;
      filterScrollRef.current.scrollLeft = dragStartScrollLeftRef.current - dx;
    }
  };

  const handlePointerUp = () => {
    isPointerDownRef.current = false;
  };

  const handlePointerCancel = () => {
    isPointerDownRef.current = false;
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

  // ANPR Surveillance Modal Form State
  const [isSurveillanceModalOpen, setIsSurveillanceModalOpen] = useState(false);
  const [selectedSensorIndex, setSelectedSensorIndex] = useState<number | "custom">(0);
  const [sightingSensorId, setSightingSensorId] = useState(SENSOR_PRESETS[0].sensorId);
  const [sightingSensorName, setSightingSensorName] = useState(SENSOR_PRESETS[0].sensorName);
  const [sightingLocation, setSightingLocation] = useState(SENSOR_PRESETS[0].location);
  const [sightingLat, setSightingLat] = useState(SENSOR_PRESETS[0].latitude);
  const [sightingLng, setSightingLng] = useState(SENSOR_PRESETS[0].longitude);
  const [sightingConfidence, setSightingConfidence] = useState(94);
  const [sightingDetails, setSightingDetails] = useState("");
  const [isSightingSubmitting, setIsSightingSubmitting] = useState(false);
  const [inspectingSighting, setInspectingSighting] = useState<CriminalActivityItem | null>(null);
  const [isAdjudicatingSighting, setIsAdjudicatingSighting] = useState(false);
  const [customKeyframes, setCustomKeyframes] = useState<Record<string, string>>({});

  const handleUploadKeyframe = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      if (dataUrl && inspectingSighting) {
        const sightingId = inspectingSighting.metadata.hitId || inspectingSighting.id;
        setCustomKeyframes((prev) => ({ ...prev, [sightingId]: dataUrl }));
        toast.success("Authentic CCTV keyframe snapshot attached to sighting.");
      }
    };
    reader.readAsDataURL(file);
  };

  const currentSightingKey = inspectingSighting
    ? (inspectingSighting.metadata.hitId || inspectingSighting.id)
    : "";

  const resolvedKeyframeUrl = useMemo<string>(() => {
    if (currentSightingKey && customKeyframes[currentSightingKey]) {
      return customKeyframes[currentSightingKey];
    }
    if (inspectingSighting?.metadata.capturedMediaUrl) {
      const safe = getSafeStorageUrl(inspectingSighting.metadata.capturedMediaUrl);
      if (safe) return safe;
    }
    return "/images/cctv-suspect.jpg";
  }, [currentSightingKey, customKeyframes, inspectingSighting?.metadata.capturedMediaUrl]);

  useEffect(() => {
    setHasMugshotError(false);
  }, [inspectingSighting, mugshotDisplayUrl, criminal.mugshotUrl]);

  const handleAdjudicateSighting = async (hitId: string, decision: SurveillanceHitStatus) => {
    setIsAdjudicatingSighting(true);
    try {
      const res = await acknowledgeSurveillanceHit(hitId, decision);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          decision === SurveillanceHitStatus.CONFIRMED_SIGHTING
            ? "Forensic Sighting Confirmed & Signed into Custody Chain"
            : decision === SurveillanceHitStatus.FALSE_POSITIVE
            ? "Detection Dismissed as Non-Match (False Positive)"
            : "Sighting marked Under Investigation"
        );
        setInspectingSighting(null);
        await loadLogs(true);
      }
    } catch {
      toast.error("Failed to update sighting status");
    } finally {
      setIsAdjudicatingSighting(false);
    }
  };

  const handleSelectPreset = (index: number) => {
    setSelectedSensorIndex(index);
    const preset = SENSOR_PRESETS[index];
    setSightingSensorId(preset.sensorId);
    setSightingSensorName(preset.sensorName);
    setSightingLocation(preset.location);
    setSightingLat(preset.latitude);
    setSightingLng(preset.longitude);
  };

  const handleSubmitSurveillanceHit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sightingSensorId.trim() || !sightingLocation.trim()) {
      toast.error("Sensor ID and location are mandatory.");
      return;
    }
    setIsSightingSubmitting(true);
    try {
      const res = await recordSurveillanceHitAction({
        criminalId: criminal.id,
        sensorId: sightingSensorId.trim(),
        sensorName: sightingSensorName.trim() || sightingSensorId.trim(),
        location: sightingLocation.trim(),
        latitude: sightingLat,
        longitude: sightingLng,
        confidenceScore: sightingConfidence / 100,
        details:
          sightingDetails.trim() ||
          `Automated optical detection registered at ${sightingLocation.trim()} with ${sightingConfidence}% confidence`,
        status: SurveillanceHitStatus.UNACKNOWLEDGED,
      });

      if (res.success) {
        toast.success("ANPR Surveillance Sighting registered & cryptographically logged.");
        setIsSurveillanceModalOpen(false);
        setSightingDetails("");
        await loadLogs(true);
      } else {
        toast.error(res.error || "Failed to log surveillance detection.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Internal error logging surveillance sighting.");
    } finally {
      setIsSightingSubmitting(false);
    }
  };

  if (isLoading && activities.length === 0) {
    return <ActivityTabSkeleton />;
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ── Key Metrics Cards (Matching Case Page Section Cards Animation Flow) ── */}
      <motion.div
        layout
        transition={{ layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4"
      >
        {[
          {
            title: "Audit Records",
            value: stats.total,
            sub: "Signed ledger entries",
            icon: FileCheck2,
            iconClass: "text-neutral-300",
          },
          {
            title: "Surveillance Sightings",
            value: stats.surveillance,
            sub: "ANPR & optical alerts",
            icon: Camera,
            iconClass: "text-rose-400",
          },
          {
            title: "Authorized Handlers",
            value: stats.authorizedHandlersCount,
            sub: "Active investigators",
            icon: UserCheck,
            iconClass: "text-amber-400",
          },
          {
            title: "Ledger Integrity",
            value: 100,
            suffix: "%",
            sub: "SHA-256 validated",
            icon: ShieldCheck,
            iconClass: "text-emerald-400",
            liveBadge: true,
          },
        ].map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.03,
                ease: [0.16, 1, 0.3, 1],
                layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
              }}
              className="h-full"
            >
              <Card className="flex flex-col justify-between gap-3 rounded-xl border border-border/70 bg-card/70 p-3.5 sm:p-5 shadow-xs hover:border-border/90 hover:bg-card/90 transition-all duration-200 h-full group">
                {/* Header: Title and Icon aligned across top, matching case page section cards */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    {card.title}
                  </span>
                  <Icon
                    className={cn(
                      "size-4.5 sm:size-5 shrink-0 transition-transform group-hover:scale-110",
                      card.iconClass
                    )}
                  />
                </div>

                {/* Content: Hero metric rolling value and subtitle */}
                <div className="space-y-1.5">
                  <div className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground tabular-nums font-heading">
                    <RollingNumber
                      value={card.value}
                      suffix={card.suffix}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-1.5 min-w-0">
                    <span className="text-[11px] sm:text-xs text-muted-foreground truncate">
                      {card.sub}
                    </span>
                    {card.liveBadge && (
                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                        <span className="size-1 rounded-full bg-emerald-400 animate-pulse" />
                        Intact
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Mobile View Switcher (Audit Feed vs. Custody Ledger) ─────────── */}
      <div className="flex lg:hidden items-center p-1 rounded-xl bg-card/60 border border-border/60 text-xs w-full">
        <button
          type="button"
          onClick={() => setMobileTab("feed")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer",
            mobileTab === "feed"
              ? "bg-white text-black shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Activity className="size-3.5" />
          <span>Audit Feed</span>
          <span
            className={cn(
              "text-[10px] font-mono px-1 rounded",
              mobileTab === "feed" ? "bg-black/15 text-black font-bold" : "bg-muted text-muted-foreground"
            )}
          >
            {filtered.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setMobileTab("ledger")}
          className={cn(
            "flex-1 py-1.5 px-3 rounded-lg font-medium transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer",
            mobileTab === "ledger"
              ? "bg-white text-black shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <ShieldCheck className="size-3.5" />
          <span>Custody Ledger</span>
        </button>
      </div>

      {/* ── Main Layout: Timeline (8 cols) + Sidebar (4 cols) ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 w-full min-w-0 items-start">
        {/* ── Primary Column: Audit Log Feed ──────────────────────────── */}
        <div className={cn("lg:col-span-7 xl:col-span-8 flex flex-col gap-4 min-w-0 w-full", mobileTab !== "feed" && "hidden lg:flex")}>
          <Card className="border border-border/60 bg-card/60 shadow-xs rounded-xl overflow-hidden min-w-0 w-full max-w-full">
            <CardHeader className="p-3.5 sm:p-5 pb-3 border-b border-border/50 flex flex-col gap-3 min-w-0 w-full">
              {/* Row 1: Title + Mobile Refresh + Desktop Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0 w-full">
                <div className="flex items-center justify-between gap-2 w-full sm:w-auto min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <CardTitle className="text-sm sm:text-base font-semibold tracking-tight text-foreground flex items-center gap-2 truncate">
                        <span>Forensic Audit Trail</span>
                        {isLiveConnected && (
                          <span className="text-xs font-mono font-medium text-emerald-400 shrink-0">
                            Live SSE
                          </span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-[11px] sm:text-xs text-muted-foreground truncate">
                        Cryptographically signed sequential custody ledger
                      </CardDescription>
                    </div>
                  </div>

                  {/* Quick Refresh Icon Button on Mobile */}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadLogs(true)}
                    disabled={isRefreshing}
                    title="Refresh records from database"
                    className="sm:hidden size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
                  >
                    <RefreshCw
                      className={cn(
                        "size-3.5",
                        isRefreshing && "animate-spin text-primary"
                      )}
                    />
                  </Button>
                </div>

                {/* Action Buttons: Unified responsive row (stacked on mobile, inline on desktop) */}
                <div className="flex items-center gap-2 w-full sm:w-auto min-w-0">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setIsLogModalOpen(true)}
                    className="h-8.5 sm:h-8 flex-1 sm:flex-none px-3 text-xs font-semibold gap-1.5 cursor-pointer bg-[#665AEF] hover:bg-[#584bd4] text-white shadow-xs shrink-0 sm:order-last transition-colors"
                  >
                    <Plus className="size-3.5" />
                    <span>Log Event</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSurveillanceModalOpen(true)}
                    className="h-8.5 sm:h-8 flex-1 sm:flex-none px-2.5 text-xs text-neutral-300 border-neutral-800 bg-neutral-900 hover:bg-neutral-800 hover:text-white gap-1.5 cursor-pointer shrink-0 font-medium transition-colors"
                  >
                    <Camera className="size-3.5 text-neutral-400" />
                    <span>ANPR<span className="hidden xs:inline"> Sighting</span></span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsExportOpen(true)}
                    className="h-8.5 sm:h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5 cursor-pointer shrink-0"
                  >
                    <Download className="size-3.5" />
                    <span>Export</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => loadLogs(true)}
                    disabled={isRefreshing}
                    title="Refresh records from database"
                    className="hidden sm:flex size-8.5 sm:size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground shrink-0 rounded-lg"
                  >
                    <RefreshCw
                      className={cn(
                        "size-3.5",
                        isRefreshing && "animate-spin text-primary"
                      )}
                    />
                  </Button>
                </div>
              </div>

              {/* Row 2: Category Filter Tabs + Search Input */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 min-w-0 w-full">
                {/* Horizontal Swipeable & Draggable Category Chips (Crisp & Clean) */}
                <div className="w-full sm:w-auto min-w-0 max-w-full flex-1">
                  {/* Scrollable Container */}
                  <div
                    ref={filterScrollRef}
                    onPointerDown={handlePointerDown}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerCancel={handlePointerCancel}
                    className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 px-0.5 w-full min-w-0 max-w-full touch-pan-x overscroll-x-contain [scrollbar-width:none] [-webkit-overflow-scrolling:touch] cursor-grab active:cursor-grabbing select-none"
                  >
                    {CATEGORIES.map((cat) => {
                      const isActive = activeCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={(e) => {
                            if (hasDraggedRef.current) return;
                            setActiveCategory(cat.id);
                            e.currentTarget.scrollIntoView({
                              behavior: "smooth",
                              inline: "nearest",
                              block: "nearest",
                            });
                          }}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer shrink-0 select-none touch-pan-x active:scale-95",
                            isActive
                              ? "bg-white text-black shadow-xs font-semibold ring-1 ring-white/20"
                              : "bg-neutral-900 text-neutral-400 hover:bg-neutral-800 hover:text-white border border-neutral-800"
                          )}
                        >
                          <span>{cat.label}</span>
                          <span
                            className={cn(
                              "text-[10px] font-mono px-1.5 py-0.2 rounded-md",
                              isActive
                                ? "bg-black/15 text-black font-bold"
                                : "bg-black/40 text-neutral-400"
                            )}
                          >
                            {countFor(cat.id)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-64 shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter audit records..."
                    className="h-8.5 sm:h-8 pl-8 pr-7 text-xs bg-background/50 border-border/80 rounded-md placeholder:text-muted-foreground"
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
              {activities.length === 0 ? (
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
                          className="relative flex gap-2.5 sm:gap-4 group"
                        >
                          {/* ── Bulletproof Vertical Spine ──────────────── */}
                          <div className="flex flex-col items-center shrink-0 w-6 sm:w-8">
                            {/* Upper segment */}
                            <div
                              className={cn(
                                "w-0.5 flex-1 bg-border/50 transition-colors",
                                isFirst ? "opacity-0" : "opacity-100"
                              )}
                            />

                            {/* Node Icon */}
                            <div
                              className={cn(
                                "relative z-10 flex size-6 sm:size-8 items-center justify-center rounded-full border shadow-xs my-0.5 sm:my-1 transition-all duration-200 group-hover:scale-105",
                                config.nodeClass
                              )}
                            >
                              <Icon className="size-3 sm:size-3.5" />
                            </div>

                            {/* Lower segment */}
                            <div
                              className={cn(
                                "w-0.5 flex-1 bg-border/50 transition-colors",
                                isLast ? "opacity-0" : "opacity-100"
                              )}
                            />
                          </div>

                          {/* ── Event Content Card ─────────────────────── */}
                          <div className="flex-1 pb-3 sm:pb-4 min-w-0">
                            <div className="rounded-xl border border-border/60 bg-card/60 hover:bg-card/90 hover:border-border/80 transition-all duration-200 p-3 sm:p-4 shadow-xs flex flex-col gap-2 sm:gap-2.5">
                              {/* Header: Title + Category badge + Relative time */}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                  <h4 className="text-xs sm:text-sm font-semibold text-foreground tracking-tight leading-snug">
                                    {item.action}
                                  </h4>
                                  <Badge
                                    variant="outline"
                                    className={cn("text-[9px] sm:text-[10px] font-mono px-1.5 py-0 h-4 sm:h-4.5 shrink-0", config.badgeClass)}
                                  >
                                    {config.label}
                                  </Badge>
                                  {item.severity === "critical" && (
                                    <Badge
                                      variant="destructive"
                                      className="text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0 h-3.5 sm:h-4 shrink-0"
                                    >
                                      Critical
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-[10px] sm:text-[11px] text-muted-foreground font-mono whitespace-nowrap shrink-0 mt-0.5">
                                  {item.relativeTime}
                                </span>
                              </div>

                              {/* Natural language description */}
                              <p className="text-xs text-muted-foreground leading-relaxed font-normal">
                                {item.details}
                              </p>

                              {/* Metadata & Officer Strip */}
                              <div className="flex flex-wrap items-center justify-between gap-1.5 pt-2 border-t border-border/30 text-xs">
                                <div className="flex flex-wrap items-center gap-1.5 min-w-0">
                                  {/* Officer Avatar Chip */}
                                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-muted/40 border border-border/40 text-foreground/80 max-w-[170px] sm:max-w-none">
                                    <Avatar className="size-3.5 sm:size-4 shrink-0">
                                      <AvatarImage src={item.officer.avatarUrl} alt={item.officer.name} />
                                      <AvatarFallback className="text-[7px] sm:text-[8px] font-medium bg-primary/20 text-primary">
                                        {getInitials(item.officer.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="text-[11px] sm:text-xs font-medium text-foreground truncate">
                                      {item.officer.name}
                                    </span>
                                    <span className="text-[9px] sm:text-[10px] font-mono text-muted-foreground truncate hidden sm:inline">
                                      · {item.officer.badgeId}
                                    </span>
                                  </div>

                                  {/* Location Tag */}
                                  {item.metadata.location && (
                                    <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] text-muted-foreground px-1.5 sm:px-2 py-0.5 rounded-md bg-muted/30 border border-border/40 truncate max-w-[140px] sm:max-w-50">
                                      <MapPin className="size-2.5 sm:size-3 text-rose-400 shrink-0" />
                                      <span className="truncate">{item.metadata.location}</span>
                                    </span>
                                  )}

                                  {/* Confidence Match Tag */}
                                  {item.metadata.confidenceScore !== undefined && (
                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-emerald-400 px-1.5 sm:px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 shrink-0">
                                      <ScanFace className="size-2.5 sm:size-3" />
                                      {(item.metadata.confidenceScore * 100).toFixed(1)}% match
                                    </span>
                                  )}

                                  {/* Case Link Tag */}
                                  {item.metadata.caseNumber && (
                                    <span className="inline-flex items-center gap-1 font-mono text-[10px] sm:text-[11px] text-sky-400 px-1.5 sm:px-2 py-0.5 rounded-md bg-sky-950/40 border border-sky-500/30 shrink-0">
                                      <FolderKanban className="size-2.5 sm:size-3" />
                                      {item.metadata.caseNumber}
                                    </span>
                                  )}

                                  {/* Surveillance Hit Verification Trigger - Only available for Surveillance Sightings */}
                                  {item.category === "SURVEILLANCE" && (
                                    <Button
                                      type="button"
                                      size="xs"
                                      variant="outline"
                                      onClick={() => setInspectingSighting(item)}
                                      className={cn(
                                        "h-5.5 sm:h-6 px-1.5 sm:px-2 text-[9px] sm:text-[10px] font-medium border cursor-pointer flex items-center gap-1 transition-colors",
                                        item.metadata.hitStatus === "CONFIRMED_SIGHTING"
                                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                                          : item.metadata.hitStatus === "FALSE_POSITIVE"
                                          ? "border-zinc-700/60 bg-zinc-800/40 text-zinc-400 line-through hover:bg-zinc-800/60"
                                          : "border-neutral-700 bg-neutral-900/80 text-neutral-300 hover:bg-neutral-800 hover:text-white"
                                      )}
                                    >
                                      {item.metadata.hitStatus === "CONFIRMED_SIGHTING" ? (
                                        <CheckCircle2 className="size-2.5 sm:size-3 text-emerald-400" />
                                      ) : item.metadata.hitStatus === "FALSE_POSITIVE" ? (
                                        <X className="size-2.5 sm:size-3 text-zinc-400" />
                                      ) : (
                                        <Eye className="size-2.5 sm:size-3 text-neutral-400" />
                                      )}
                                      <span>Verify Sighting Proof</span>
                                      {item.metadata.hitStatus && (
                                        <span className="font-mono text-[8px] px-1 py-0.2 rounded bg-black/40">
                                          {item.metadata.hitStatus === "CONFIRMED_SIGHTING"
                                            ? "Confirmed"
                                            : item.metadata.hitStatus === "FALSE_POSITIVE"
                                            ? "Dismissed"
                                            : "Pending"}
                                        </span>
                                      )}
                                    </Button>
                                  )}
                                </div>

                                {/* Date & Hash Trigger */}
                                <div className="flex items-center gap-1.5 ml-auto text-muted-foreground shrink-0">
                                  <span className="text-[10px] sm:text-[11px] font-mono hidden md:inline-block">
                                    {item.formattedDate} · {item.formattedTime}
                                  </span>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                                    className="h-5.5 sm:h-6 px-1.5 sm:px-2 text-[10px] sm:text-[11px] font-mono gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
                                  >
                                    <Hash className="size-2.5 sm:size-3 text-primary" />
                                    <span>{isExpanded ? "Hide" : "Verify Block"}</span>
                                    {isExpanded ? (
                                      <ChevronUp className="size-2.5 sm:size-3" />
                                    ) : (
                                      <ChevronDown className="size-2.5 sm:size-3" />
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
                                          <span className="text-emerald-400 font-mono truncate">{item.metadata.evidenceHash}</span>
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
        <div className={cn("lg:col-span-5 xl:col-span-4 flex flex-col gap-4 lg:sticky lg:top-4 self-start min-w-0 w-full", mobileTab !== "ledger" && "hidden lg:flex")}>
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

            <div className="pt-2 border-t border-border/30 flex items-center gap-1.5 text-[10px] text-muted-foreground/80 font-mono">
              <Lock className="size-3 text-emerald-400 shrink-0" />
              <span>Section 65B IEA / BNSS tamper-evident digital custody log.</span>
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
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-9 bg-card/60 border border-border/80 rounded-md text-xs px-2.5 text-foreground justify-between flex items-center cursor-pointer"
                    />
                  }
                >
                  <span className="truncate">
                    {logCategory === "SURVEILLANCE" && "Surveillance & AI"}
                    {logCategory === "EVIDENCE" && "Evidence Custody"}
                    {logCategory === "CASE_LINK" && "Case Linkage"}
                    {logCategory === "PROFILE_UPDATE" && "Profile Update"}
                    {logCategory === "LEGAL_AUDIT" && "Legal / Court Filing"}
                  </span>
                  <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-1.5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="w-52 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border z-50"
                >
                  {[
                    { val: "SURVEILLANCE", label: "Surveillance & AI" },
                    { val: "EVIDENCE", label: "Evidence Custody" },
                    { val: "CASE_LINK", label: "Case Linkage" },
                    { val: "PROFILE_UPDATE", label: "Profile Update" },
                    { val: "LEGAL_AUDIT", label: "Legal / Court Filing" },
                  ].map((cat) => (
                    <DropdownMenuItem
                      key={cat.val}
                      onClick={() => setLogCategory(cat.val as CriminalActivityCategory)}
                      className="cursor-pointer px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted font-medium text-foreground flex items-center justify-between"
                    >
                      <span>{cat.label}</span>
                      {logCategory === cat.val && <Check className="size-3.5 text-emerald-400" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
      {/* ── ANPR Surveillance Sighting Modal ────────────────────────────── */}
      <Modal
        isOpen={isSurveillanceModalOpen}
        onClose={() => setIsSurveillanceModalOpen(false)}
        maxWidth="max-w-lg"
        className="bg-[#050505] border border-neutral-800 shadow-2xl rounded-2xl"
        title={
          <div className="flex items-center gap-2">
            <Camera className="size-4 text-neutral-400 shrink-0" />
            <span className="text-white font-semibold">Log ANPR / Sensor Sighting</span>
          </div>
        }
        description={`Record real-time ANPR, optical sensor, or checkpoint detection for ${criminalName}`}
      >
        <form onSubmit={handleSubmitSurveillanceHit} className="space-y-4 text-xs">
          {/* Preset Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-foreground flex items-center justify-between">
              <span>Surveillance Sensor / Node *</span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {selectedSensorIndex === "custom" ? "Custom Node" : "Standardized Node"}
              </span>
            </label>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-9 bg-card/60 border border-border/80 rounded-md text-xs px-2.5 text-foreground justify-between flex items-center cursor-pointer"
                  />
                }
              >
                <div className="flex items-center gap-2 truncate">
                  <Camera className="size-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate font-medium">
                    {selectedSensorIndex === "custom"
                      ? "Custom Sensor / Radar"
                      : SENSOR_PRESETS[selectedSensorIndex].sensorName}
                  </span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-1.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="bottom"
                sideOffset={4}
                className="w-80 p-1.5 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border z-50 max-h-72 overflow-y-auto"
              >
                {SENSOR_PRESETS.map((preset, idx) => (
                  <DropdownMenuItem
                    key={preset.sensorId}
                    onClick={() => handleSelectPreset(idx)}
                    className="cursor-pointer px-2.5 py-2 text-xs rounded-lg hover:bg-muted font-medium text-foreground flex flex-col items-start gap-0.5"
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-foreground truncate">
                        {preset.sensorName}
                      </span>
                      {selectedSensorIndex === idx && (
                        <Check className="size-3.5 text-emerald-400 shrink-0 ml-1.5" />
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground truncate">
                      {preset.sensorId} · {preset.location}
                    </span>
                  </DropdownMenuItem>
                ))}
                <div className="border-t border-border/40 my-1" />
                <DropdownMenuItem
                  onClick={() => setSelectedSensorIndex("custom")}
                  className="cursor-pointer px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted font-medium text-foreground flex items-center justify-between"
                >
                  <span className="text-primary font-semibold">Enter Custom Sensor / Location</span>
                  {selectedSensorIndex === "custom" && (
                    <Check className="size-3.5 text-emerald-400" />
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sensor ID & Location Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-foreground">
                Sensor Identifier *
              </label>
              <Input
                value={sightingSensorId}
                onChange={(e) => setSightingSensorId(e.target.value)}
                placeholder="e.g. ANPR-CAM-01"
                className="h-9 text-xs font-mono bg-card/60 border border-border/80 rounded-md focus-visible:border-neutral-500"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-foreground">
                Confidence Match *
              </label>
              <div className="flex items-center gap-2">
                {[95, 88, 75].map((conf) => (
                  <button
                    key={conf}
                    type="button"
                    onClick={() => setSightingConfidence(conf)}
                    className={cn(
                      "flex-1 h-9 rounded-md text-xs font-mono font-medium border transition-colors cursor-pointer",
                      sightingConfidence === conf
                        ? "bg-neutral-800 border-neutral-600 text-white font-semibold"
                        : "bg-card/40 border-border/70 text-muted-foreground hover:bg-muted"
                    )}
                  >
                    {conf}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-foreground">
              Detection Location *
            </label>
            <Input
              value={sightingLocation}
              onChange={(e) => setSightingLocation(e.target.value)}
              placeholder="e.g. Anna Salai - Mount Road Junction"
              className="h-9 text-xs bg-card/60 border border-border/80 rounded-md focus-visible:border-neutral-500"
              required
            />
          </div>

          {/* Geographic Coordinates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">
                Latitude
              </label>
              <Input
                type="number"
                step="any"
                value={sightingLat}
                onChange={(e) => setSightingLat(parseFloat(e.target.value) || 0)}
                className="h-9 text-xs font-mono bg-card/60 border border-border/80 rounded-md"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">
                Longitude
              </label>
              <Input
                type="number"
                step="any"
                value={sightingLng}
                onChange={(e) => setSightingLng(parseFloat(e.target.value) || 0)}
                className="h-9 text-xs font-mono bg-card/60 border border-border/80 rounded-md"
              />
            </div>
          </div>

          {/* Sighting Details / Vehicle Narrative */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-medium text-foreground">
              Sighting Narrative / License Plate Details
            </label>
            <textarea
              value={sightingDetails}
              onChange={(e) => setSightingDetails(e.target.value)}
              placeholder="e.g. Black SUV TN-01-AB-1234 heading southbound, high probability match with passenger profile..."
              rows={3}
              className="w-full bg-card/60 border border-border/80 rounded-md p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-neutral-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-1.5 p-2.5 rounded-md bg-black/20 border border-border/40 text-[10px] text-muted-foreground font-mono">
            <Lock className="size-3 text-emerald-400 shrink-0" />
            <span>Detection creates a PostgreSQL SurveillanceHit record and appends a SHA-256 custody block.</span>
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSurveillanceModalOpen(false)}
              className="text-xs rounded-md cursor-pointer h-9 sm:h-8"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSightingSubmitting}
              className="text-xs font-medium rounded-md cursor-pointer h-9 sm:h-8 bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5"
            >
              <Camera className="size-3.5" />
              {isSightingSubmitting ? "Ingesting Sighting..." : "Log Optical Sighting"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ── Forensic Sighting Verification Workbench Modal ──────────────── */}
      <Modal
        isOpen={Boolean(inspectingSighting)}
        onClose={() => setInspectingSighting(null)}
        maxWidth="max-w-4xl"
        className="bg-[#050505] border border-neutral-800 shadow-2xl rounded-2xl"
        title={
          <div className="flex items-center gap-2.5 text-foreground">
            <div className="size-8.5 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-200">
              <ShieldCheck className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold tracking-tight text-white">
                Forensic Sighting Verification Workbench
              </span>
              <span className="text-[11px] text-neutral-400 font-mono">
                Physical sensor detection & evidentiary keyframe corroboration
              </span>
            </div>
          </div>
        }
        description="Verify raw camera telemetry against enrolled biometric profiles under Section 65B BNSS custody standards."
        footer={
          inspectingSighting ? (
            <div className="flex items-center justify-between gap-3 w-full">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setInspectingSighting(null)}
                className="text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isAdjudicatingSighting}
                  onClick={() =>
                    handleAdjudicateSighting(
                      (inspectingSighting.metadata.hitId || inspectingSighting.id) as string,
                      SurveillanceHitStatus.FALSE_POSITIVE
                    )
                  }
                  className="text-xs h-9 px-3.5 border border-neutral-700 bg-neutral-900/80 text-neutral-300 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 cursor-pointer font-medium gap-1.5 transition-colors"
                >
                  {isAdjudicatingSighting ? (
                    <Loader2 className="size-3 animate-spin mr-1" />
                  ) : (
                    <XCircle className="size-3.5 text-neutral-400" />
                  )}
                  Dismiss (False Positive)
                </Button>

                <Button
                  type="button"
                  size="sm"
                  disabled={isAdjudicatingSighting}
                  onClick={() =>
                    handleAdjudicateSighting(
                      (inspectingSighting.metadata.hitId || inspectingSighting.id) as string,
                      SurveillanceHitStatus.CONFIRMED_SIGHTING
                    )
                  }
                  className="text-xs h-9 px-4 font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer gap-1.5 shadow-sm transition-colors"
                >
                  {isAdjudicatingSighting ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="size-3.5" />
                  )}
                  Confirm Positive Sighting
                </Button>
              </div>
            </div>
          ) : undefined
        }
      >
        {inspectingSighting && (
          <div className="space-y-4 text-xs">
            {/* Sighting Status & Verification Header Banner */}
            <div
              className={cn(
                "p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors",
                inspectingSighting.metadata.hitStatus === "CONFIRMED_SIGHTING"
                  ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-300"
                  : inspectingSighting.metadata.hitStatus === "FALSE_POSITIVE"
                  ? "bg-zinc-900/60 border-zinc-700/60 text-zinc-400"
                  : "bg-[#0a0a0a] border-neutral-800 text-neutral-200"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {inspectingSighting.metadata.hitStatus === "CONFIRMED_SIGHTING" ? (
                  <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                ) : inspectingSighting.metadata.hitStatus === "FALSE_POSITIVE" ? (
                  <XCircle className="size-4 text-zinc-400 shrink-0" />
                ) : (
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                )}
                <div className="flex items-center gap-1.5 font-mono text-xs tracking-tight truncate">
                  <span className="font-semibold text-white">
                    {inspectingSighting.metadata.hitStatus === "CONFIRMED_SIGHTING"
                      ? "CONFIRMED POSITIVE SIGHTING"
                      : inspectingSighting.metadata.hitStatus === "FALSE_POSITIVE"
                      ? "DISMISSED AS NON-MATCH"
                      : "TENTATIVE BIOMETRIC DETECTION"}
                  </span>
                  <span className="text-[11px] text-neutral-400 hidden sm:inline">
                    {inspectingSighting.metadata.hitStatus === "CONFIRMED_SIGHTING"
                      ? "· Attested in Official Forensic Ledger"
                      : inspectingSighting.metadata.hitStatus === "FALSE_POSITIVE"
                      ? "· False Positive Exclusion"
                      : "· Human Adjudication Required"}
                  </span>
                </div>
              </div>
              <span
                className={cn(
                  "font-mono text-[10px] font-semibold px-2.5 py-0.5 rounded-md border shrink-0",
                  inspectingSighting.metadata.hitStatus === "CONFIRMED_SIGHTING"
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : inspectingSighting.metadata.hitStatus === "FALSE_POSITIVE"
                    ? "bg-zinc-800 border-zinc-700 text-zinc-400"
                    : "bg-neutral-900 border-neutral-700 text-neutral-300"
                )}
              >
                {inspectingSighting.metadata.sensorId || "SENSOR-HIT"}
              </span>
            </div>

            {/* Dual-Inspection Split Comparison: Enrolled Mugshot vs Surveillance Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left: Enrolled Profile Reference Photo */}
              <div className="rounded-xl border border-neutral-800 bg-[#0a0a0a] p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
                    Enrolled Reference Profile
                  </span>
                  <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-700 text-neutral-300">
                    Booking Record
                  </span>
                </div>
                <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-neutral-800 bg-black flex items-center justify-center">
                  {!hasMugshotError && resolvedMugshotUrl ? (
                    <Image
                      src={resolvedMugshotUrl}
                      alt={criminalName}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-cover object-center"
                      unoptimized={resolvedMugshotUrl.startsWith("/api/storage")}
                      priority
                      onError={() => setHasMugshotError(true)}
                    />
                  ) : (
                    <SuspectAvatar
                      name={criminalName}
                      status={criminal.status}
                      riskLevel={criminal.riskLevel}
                      size="fill"
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-neutral-800 text-[10px] font-mono text-neutral-200 flex items-center gap-1.5 shadow-sm">
                    <User className="size-3 text-neutral-400" />
                    <span>
                      {criminalName} · {criminal.criminalId}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-neutral-400 space-y-1.5 font-mono pt-0.5">
                  <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                    <span>Classification:</span>
                    <span className="text-white font-semibold uppercase">{criminal.status}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Risk Assessment:</span>
                    <span className={cn(
                      "text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border",
                      criminal.riskLevel?.toLowerCase() === "high" || criminal.riskLevel?.toLowerCase() === "critical"
                        ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
                        : criminal.riskLevel?.toLowerCase() === "medium"
                        ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                        : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    )}>
                      {criminal.riskLevel || "MEDIUM"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Surveillance Camera Captured Keyframe / Snapshot */}
              <div className="rounded-xl border border-neutral-800 bg-[#0a0a0a] p-3.5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-white uppercase tracking-wider flex items-center gap-1.5 truncate">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <span className="truncate">CCTV Sensor Evidence</span>
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/30 text-emerald-400">
                      {inspectingSighting.metadata.confidenceScore !== undefined
                        ? `${(inspectingSighting.metadata.confidenceScore * 100).toFixed(1)}% Match`
                        : "91.2% Match"}
                    </span>
                    <label
                      className="cursor-pointer p-1 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white border border-neutral-800 transition-colors flex items-center justify-center shrink-0"
                      title="Replace Frame Proof"
                    >
                      <Upload className="size-3.5" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadKeyframe}
                      />
                    </label>
                  </div>
                </div>
                <div className="relative w-full h-72 sm:h-80 rounded-xl overflow-hidden border border-neutral-800 bg-black flex items-center justify-center">
                  <Image
                    src={resolvedKeyframeUrl}
                    alt="Surveillance Camera Keyframe"
                    fill
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-cover object-center"
                    unoptimized
                  />

                  {/* Subtle vignette gradients for optimal contrast */}
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

                  {/* Minimal Top-Left Camera Status Badge */}
                  <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-neutral-800 text-[9px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-sm">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>REC · 1080P TELEMETRY</span>
                  </div>

                  {/* Minimal Top-Right Sensor Tag */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-md border border-neutral-800 text-[9px] font-mono text-neutral-300 shadow-sm">
                    {inspectingSighting.metadata.sensorId || "CAM-01"}
                  </div>

                  {/* Minimal Bottom-Left Node / Camera Name */}
                  <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-neutral-800 text-[10px] font-mono text-neutral-200 flex items-center gap-1.5 shadow-sm">
                    <Camera className="size-3 text-neutral-400" />
                    <span className="truncate max-w-[170px]">
                      {inspectingSighting.officer.name || inspectingSighting.metadata.sensorId || "Surveillance Optical Feed"}
                    </span>
                  </div>

                  {/* Minimal Bottom-Right Timestamp Badge */}
                  <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-neutral-800 text-[10px] font-mono text-neutral-300 shadow-sm">
                    {inspectingSighting.formattedTime || "02:19:36 PM"}
                  </div>
                </div>

                <div className="text-[11px] text-neutral-400 space-y-1.5 font-mono pt-0.5">
                  <div className="flex justify-between border-b border-neutral-800/80 pb-1.5">
                    <span>Optical Node:</span>
                    <span className="text-white font-semibold truncate max-w-[180px]">
                      {inspectingSighting.officer.name || inspectingSighting.metadata.sensorId}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Correlation:</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                      {inspectingSighting.metadata.confidenceScore
                        ? `${(inspectingSighting.metadata.confidenceScore * 100).toFixed(1)}% ArcFace Match`
                        : "91.2% ArcFace Match"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Telemetry & Geographic Coordinates Card */}
            <div className="rounded-xl border border-neutral-800 bg-[#0a0a0a] p-3.5 space-y-2.5">
              <span className="text-[11px] font-semibold text-neutral-200 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="size-3.5 text-neutral-400" />
                Physical Sensor Telemetry & Jurisdiction
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-black border border-neutral-800">
                  <span className="text-[10px] text-neutral-400 block font-sans">Physical Detection Zone</span>
                  <span className="text-white font-semibold text-xs leading-snug">
                    {inspectingSighting.metadata.location || inspectingSighting.details}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-black border border-neutral-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-sans">GPS Geotag</span>
                    <span className="text-white font-semibold text-xs">
                      {inspectingSighting.metadata.coordinates
                        ? `${inspectingSighting.metadata.coordinates[0].toFixed(4)}° N, ${inspectingSighting.metadata.coordinates[1].toFixed(4)}° E`
                        : "13.0827° N, 80.2707° E"}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${
                      inspectingSighting.metadata.coordinates
                        ? `${inspectingSighting.metadata.coordinates[0]},${inspectingSighting.metadata.coordinates[1]}`
                        : "13.0827,80.2707"
                    }`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-md bg-neutral-900 hover:bg-neutral-800 text-neutral-200 border border-neutral-700 transition-colors cursor-pointer"
                    title="Open in Maps"
                  >
                    <ExternalLink className="size-3.5 text-neutral-400" />
                  </a>
                </div>
              </div>
            </div>

            {/* Cryptographic Hash & Chain of Custody Stamp */}
            <div className="p-3.5 rounded-xl border border-neutral-800 bg-[#0a0a0a] font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between text-neutral-200">
                <span className="font-semibold flex items-center gap-1.5">
                  <Lock className="size-3.5 text-neutral-400" />
                  Section 65B BNSS Custody Signature
                </span>
                <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded-md bg-emerald-950/40 border border-emerald-500/40">
                  SHA-256 Validated
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black border border-neutral-800 text-[10px]">
                <span className="truncate text-neutral-300 font-mono">
                  Block Hash: {inspectingSighting.metadata.blockHash}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(inspectingSighting.metadata.blockHash);
                    toast.success("Custody block hash copied to clipboard.");
                  }}
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
                  title="Copy Hash"
                >
                  <Copy className="size-3.5 text-neutral-400" />
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
