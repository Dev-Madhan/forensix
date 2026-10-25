"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  Ruler,
  Tag,
  BookOpen,
  Camera,
  FolderKanban,
  BarChart2,
  Plus,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Fingerprint,
  Scan,
  Activity,
  Shield,
  FileText,
  Calendar,
  MapPin,
  Maximize2,
  Play,
  Gavel,
  Lock,
  ArrowRight,
  Sparkles,
  Zap,
  Star,
  Info,
  AlertTriangle,
  Check,
  Scale,
  FolderClock,
  ShieldAlert,
  Car,
  Globe,
  MoreHorizontal,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Trash2,
  Hash,
  RefreshCw,
  User,
  Dna,
  FolderPlus,
  Upload,
  FileUp,
  Download,
  Users,
  Network,
  LayoutGrid,
} from "lucide-react";
import { SuspectRole, SuspectCaseStatus, type Criminal } from "@prisma/client";
import { toast } from "sonner";
import { SuspectAvatar } from "@/features/criminals/components/suspect-avatar";
import { CriminalActivityTab } from "./activity/criminal-activity-tab";
import {
  linkCriminalToCase,
  createCriminalRecord,
  deleteCriminalRecord,
  runCriminalFacialBiometricSearch,
  addCriminalAlias,
  removeCriminalAlias,
  updateCriminalFingerprint,
  updateCriminalDnaProfile,
} from "@/features/criminals/actions";
import { uploadEvidence } from "@/features/evidence/actions";
import { getCaseSlug, getRecordSlug, getCriminalSlug } from "@/features/criminals/slug";
import { useRouter } from "next/navigation";
import { LinkCriminalCaseDialog } from "@/features/criminals/components/link-criminal-case-dialog";
import { SyndicateNetworkGraph } from "./syndicate-network-graph";

const DEFAULT_SUGGESTED_ALIASES = [
  "Shadow",
  "Phantom",
  "Ghost",
  "Viper",
  "The Blade",
  "Night Runner",
  "Cobra",
  "The Fox",
];

// Biometrics Tab Types
export interface FaceMatchCandidate {
  id: string;
  name: string;
  code: string;
  confidence: number;
  imageSrc: string | null;
  status?: string;
}

interface BiometricMatchHistoryItem {
  id: string;
  rowNumber: string;
  dateTime: string;
  queriedImageSrc: string;
  matchName: string;
  matchCode: string;
  confidence: number;
  initiatedBy: string;
  status: "Match Found" | "Reviewed" | "Inconclusive";
  caseId?: string;
}

function renderBiometricStatusBadge(status: BiometricMatchHistoryItem["status"]) {
  switch (status) {
    case "Match Found":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="size-3" />
          <span>Match Found</span>
        </span>
      );
    case "Reviewed":
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-blue-500/40 bg-blue-500/10 text-blue-400">
          <Eye className="size-3" />
          <span>Reviewed</span>
        </span>
      );
    case "Inconclusive":
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-amber-500/40 bg-amber-500/10 text-amber-400">
          <AlertTriangle className="size-3" />
          <span>Inconclusive</span>
        </span>
      );
  }
}

interface CriminalProfileTabsProps {
  criminal: Criminal;
  mugshotDisplayUrl: string | null;
  initialTab?: string;
}

const tabContentVariants = {
  initial: { opacity: 0, y: 6 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.1, ease: "easeIn" as const },
  },
};

// Evidence Data with the real image files in public/images/evidence
interface EvidenceItem {
  id: string;
  name: string;
  type: "image" | "video" | "document" | "scan";
  date: string;
  imageSrc: string;
  duration?: string;
  size: string;
  sha256: string;
  officer: string;
}

interface RelatedCase {
  caseNumber: string;
  title: string;
  status: "Under Investigation" | "Solved" | "In Court" | "Closed";
  statusColor: string;
}

// Criminal History Record Interface matching the reference layout
export interface CriminalHistoryItem {
  id: string;
  rowNumber: string;
  caseId: string;
  offenceType: "Robbery" | "Theft" | "Assault" | "Vehicle Theft" | "Cyber Fraud" | string;
  description: string;
  date: string;
  location: string;
  status: "Under Investigation" | "Solved" | "In Court" | "Closed" | string;
  outcome: "Convicted" | "Trial Ongoing" | "Acquitted" | string | null;
  courtName?: string | null;
  sentenceDetails?: string | null;
  slug?: string;
}



function renderOffenceBadge(type: CriminalHistoryItem["offenceType"]) {
  switch (type) {
    case "Robbery":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border-2 border-rose-500/50 bg-rose-500/15 text-rose-400 whitespace-nowrap">
          <ShieldAlert className="size-3 text-rose-400 shrink-0" />
          <span>Robbery</span>
        </span>
      );
    case "Theft":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border-2 border-blue-500/50 bg-blue-500/15 text-blue-400 whitespace-nowrap">
          <Fingerprint className="size-3 text-blue-400 shrink-0" />
          <span>Theft</span>
        </span>
      );
    case "Assault":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border-2 border-amber-500/50 bg-amber-500/15 text-amber-400 whitespace-nowrap">
          <Zap className="size-3 text-amber-400 shrink-0" />
          <span>Assault</span>
        </span>
      );
    case "Vehicle Theft":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border-2 border-purple-500/50 bg-purple-500/15 text-purple-400 whitespace-nowrap">
          <Car className="size-3 text-purple-400 shrink-0" />
          <span>Vehicle Theft</span>
        </span>
      );
    case "Cyber Fraud":
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border-2 border-cyan-500/50 bg-cyan-500/15 text-cyan-400 whitespace-nowrap">
          <Globe className="size-3 text-cyan-400 shrink-0" />
          <span>Cyber Fraud</span>
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border-2 border-border bg-muted/40 text-foreground whitespace-nowrap">
          {type}
        </span>
      );
  }
}

function renderHistoryStatusBadge(status: CriminalHistoryItem["status"]) {
  switch (status) {
    case "Under Investigation":
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold border-2 border-[#7E22CE]/60 bg-[#2D1B4E]/90 text-[#C084FC] whitespace-nowrap">
          Under Investigation
        </span>
      );
    case "Solved":
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold border-2 border-emerald-500/50 bg-emerald-500/15 text-emerald-400 whitespace-nowrap">
          Solved
        </span>
      );
    case "In Court":
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold border-2 border-blue-500/50 bg-blue-500/15 text-blue-400 whitespace-nowrap">
          In Court
        </span>
      );
    case "Closed":
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold border-2 border-border/80 bg-muted/60 text-muted-foreground whitespace-nowrap">
          Closed
        </span>
      );
    default:
      return null;
  }
}

function renderOutcomeBadge(outcome: CriminalHistoryItem["outcome"]) {
  if (!outcome) {
    return <span className="text-muted-foreground/60 font-mono text-xs select-none">—</span>;
  }
  switch (outcome) {
    case "Convicted":
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold border-2 border-rose-800/60 bg-rose-950/75 text-rose-300 whitespace-nowrap">
          Convicted
        </span>
      );
    case "Trial Ongoing":
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold border-2 border-amber-800/60 bg-amber-950/75 text-amber-300 whitespace-nowrap">
          Trial Ongoing
        </span>
      );
    case "Acquitted":
      return (
        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold border-2 border-emerald-800/60 bg-emerald-950/75 text-emerald-300 whitespace-nowrap">
          Acquitted
        </span>
      );
    default:
      return null;
  }
}

const VALID_TABS = ["overview", "criminal-history", "biometrics", "evidence", "activity"];

export function CriminalProfileTabs({
  criminal,
  mugshotDisplayUrl,
  initialTab,
}: CriminalProfileTabsProps) {
  const router = useRouter();
  const demographics = (criminal.demographics as Record<string, unknown> | null) || {};

  const resolvedInitialTab =
    initialTab && VALID_TABS.includes(initialTab) ? initialTab : "overview";
  const [activeTab, setActiveTab] = useState<string>(resolvedInitialTab);

  // Sync tab with initialTab prop if it changes
  React.useEffect(() => {
    if (initialTab && VALID_TABS.includes(initialTab)) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Safely sync tab from client URL query params on mount without causing hydration mismatch
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const t = p.get("tab");
    if (t && VALID_TABS.includes(t) && t !== activeTab) {
      setActiveTab(t);
    }
  }, []);

  const [selectedJudicialRecord, setSelectedJudicialRecord] = useState<CriminalHistoryItem | null>(null);
  const [syndicateViewMode, setSyndicateViewMode] = useState<"grid" | "graph">("graph");

  // Aliases state
  const [aliases, setAliases] = useState<string[]>(() => {
    const a = demographics.aliases;
    if (Array.isArray(a) && a.length > 0) {
      return a as string[];
    }
    return criminal.alias ? [criminal.alias] : [];
  });
  const [isAddingAlias, setIsAddingAlias] = useState(false);
  const [newAlias, setNewAlias] = useState("");

  // Criminal History state matching reference dashboard with real database records
  const [historyRecords, setHistoryRecords] = useState<CriminalHistoryItem[]>(() => {
    const rawRecords = (criminal as any).records || [];
    if (rawRecords.length > 0) {
      return rawRecords.map((cr: any, i: number) => ({
        id: cr.id,
        rowNumber: String(i + 1).padStart(2, "0"),
        caseId: cr.courtCaseNumber,
        offenceType: cr.offenceType as any,
        description: cr.description,
        date: new Date(cr.incidentDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        location: cr.location || "Chennai, TN",
        status: cr.status as any,
        outcome: cr.outcome as any,
        courtName: cr.courtName || "Principal District & Sessions Court, Chennai",
        sentenceDetails: cr.sentenceDetails || (cr.outcome === "Convicted" ? "Sentenced under Indian Penal Code" : null),
        slug: getRecordSlug({ courtCaseNumber: cr.courtCaseNumber, offenceType: cr.offenceType, id: cr.id }),
      }));
    }

    const rawLinks = (criminal as any).caseLinks || [];
    if (rawLinks.length > 0) {
      return rawLinks.map((cl: any, i: number) => ({
        id: cl.id,
        rowNumber: String(i + 1).padStart(2, "0"),
        caseId: cl.case?.caseNumber || "FX-UNKNOWN",
        offenceType: "Robbery" as const,
        description: cl.case?.title || cl.notes || "Case association recorded",
        date: new Date(cl.addedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        location: (criminal as any).lastKnownLocation || "Chennai, TN",
        status:
          cl.case?.status === "CLOSED"
            ? "Closed"
            : cl.case?.status === "OPEN"
            ? "Under Investigation"
            : "Solved",
        outcome: cl.status === "CONVICTED" ? "Convicted" : "Trial Ongoing",
        courtName: "Metropolitan Criminal Court, Chennai",
        sentenceDetails: cl.status === "CONVICTED" ? "Judicial Custody / Remand" : null,
        slug: getRecordSlug({ courtCaseNumber: cl.case?.caseNumber || "FX-UNKNOWN", offenceType: "Robbery", id: cl.id }),
      }));
    }
    return [];
  });
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("All Records");
  const [historySearchTerm, setHistorySearchTerm] = useState("");
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const historyPageSize = 5;

  // Synchronize tab and selected record with URL query string
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("tab", activeTab);
    if (selectedJudicialRecord) {
      url.searchParams.set("record", selectedJudicialRecord.caseId);
    } else {
      url.searchParams.delete("record");
    }
    window.history.replaceState(null, "", url.toString());
  }, [activeTab, selectedJudicialRecord]);

  // Deep-link check on initial mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const recId = p.get("record");
    if (recId) {
      const match = historyRecords.find(
        (r) => r.caseId.toLowerCase() === recId.toLowerCase() || r.id === recId
      );
      if (match) {
        setActiveTab("criminal-history");
        setSelectedJudicialRecord(match);
      }
    }
  }, [historyRecords]);

  // Dynamic Related Cases for Overview tab
  const computedRelatedCases = useMemo<RelatedCase[]>(() => {
    const rawLinks = (criminal as any).caseLinks || [];
    if (rawLinks.length > 0) {
      return rawLinks.map((cl: any) => ({
        caseNumber: cl.case?.caseNumber || "FX-UNKNOWN",
        title: cl.case?.title || "Case Record",
        status:
          cl.case?.status === "CLOSED"
            ? ("Closed" as const)
            : cl.case?.status === "OPEN"
            ? ("Under Investigation" as const)
            : ("Solved" as const),
        statusColor:
          cl.case?.status === "CLOSED"
            ? "border-border/80 bg-muted/60 text-muted-foreground"
            : cl.case?.status === "OPEN"
            ? "border-[#7E22CE]/40 bg-[#2D1B4E]/80 text-[#C084FC]"
            : "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
      }));
    }
    return [];
  }, [criminal]);

  // Dynamic Co-Offender Syndicate & Associative Network
  const computedCoOffenders = useMemo<
    Array<{
      id: string;
      criminalId: string;
      name: string;
      alias: string | null;
      mugshotUrl: string | null;
      status: string;
      riskLevel: string;
      sharedCases: Array<{ caseNumber: string; title: string; role: string }>;
      slug: string;
    }>
  >(() => {
    const map = new Map<
      string,
      {
        id: string;
        criminalId: string;
        name: string;
        alias: string | null;
        mugshotUrl: string | null;
        status: string;
        riskLevel: string;
        sharedCases: Array<{ caseNumber: string; title: string; role: string }>;
        slug: string;
      }
    >();

    const rawLinks = (criminal as any).caseLinks || [];
    for (const cl of rawLinks) {
      const cCase = cl.case;
      if (!cCase || !Array.isArray(cCase.suspects)) continue;

      for (const s of cCase.suspects) {
        if (!s.criminal || s.criminal.id === criminal.id) continue;
        const coId = s.criminal.id;
        const coName = `${s.criminal.firstName} ${s.criminal.lastName}`.trim();

        if (!map.has(coId)) {
          map.set(coId, {
            id: coId,
            criminalId: s.criminal.criminalId,
            name: coName,
            alias: s.criminal.alias,
            mugshotUrl: s.criminal.mugshotUrl,
            status: s.criminal.status || "ACTIVE",
            riskLevel: s.criminal.riskLevel || "MEDIUM",
            sharedCases: [],
            slug: getCriminalSlug(s.criminal),
          });
        }

        const entry = map.get(coId)!;
        if (!entry.sharedCases.some((sc) => sc.caseNumber === cCase.caseNumber)) {
          entry.sharedCases.push({
            caseNumber: cCase.caseNumber,
            title: cCase.title,
            role: s.role ? s.role.replace(/_/g, " ") : "Co-Suspect",
          });
        }
      }
    }

    return Array.from(map.values());
  }, [criminal]);

  // Dynamic Evidence for Overview and Evidence tabs
  const computedEvidence = useMemo<EvidenceItem[]>(() => {
    const rawEv = (criminal as any).evidences || [];
    if (rawEv.length > 0) {
      return rawEv.map((ev: any) => ({
        id: ev.id,
        name: ev.fileName,
        type: (ev.mimeType?.startsWith("image")
          ? "image"
          : ev.mimeType?.startsWith("video")
          ? "video"
          : "document") as any,
        date: new Date(ev.uploadedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        imageSrc: ev.storageKey
          ? `/api/storage?key=${encodeURIComponent(ev.storageKey)}`
          : ev.fileUrl || `/images/evidence/knife_evidence_01.jpg`,
        size: `${Math.round(ev.fileSize / 1024)} KB`,
        sha256: ev.sha256Hash ? `${ev.sha256Hash.substring(0, 14)}...` : "SHA256-VERIFIED",
        officer: ev.uploadedBy || "Central Forensics Unit",
      }));
    }
    return [];
  }, [criminal]);

  // Add Record Modal state
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [newRecordForm, setNewRecordForm] = useState<{
    caseId: string;
    offenceType: CriminalHistoryItem["offenceType"];
    description: string;
    date: string;
    location: string;
    status: CriminalHistoryItem["status"];
    outcome: CriminalHistoryItem["outcome"];
    courtName: string;
    sentenceDetails: string;
  }>({
    caseId: "",
    offenceType: "Theft",
    description: "",
    date: "",
    location: "Chennai, TN",
    status: "Under Investigation",
    outcome: null,
    courtName: "",
    sentenceDetails: "",
  });

  const handleAddCriminalRecord = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const caseId = newRecordForm.caseId.trim() || `FX-2026-${Math.floor(100 + Math.random() * 900)}`;
    const description = newRecordForm.description.trim() || "Incident under investigation.";
    const date = newRecordForm.date.trim() || new Date().toISOString().split("T")[0];
    const location = newRecordForm.location.trim() || "Chennai, TN";
    const courtName = newRecordForm.courtName.trim() || "Principal District & Sessions Court, Chennai";
    const sentenceDetails = newRecordForm.sentenceDetails.trim() || undefined;

    const nextIndex = historyRecords.length + 1;
    const newEntry: CriminalHistoryItem = {
      id: `rec-${Date.now()}`,
      rowNumber: String(nextIndex).padStart(2, "0"),
      caseId,
      offenceType: newRecordForm.offenceType,
      description,
      date,
      location,
      status: newRecordForm.status,
      outcome: newRecordForm.outcome,
      courtName,
      sentenceDetails,
      slug: getRecordSlug({ courtCaseNumber: caseId, offenceType: newRecordForm.offenceType, id: `rec-${Date.now()}` }),
    };

    setHistoryRecords([newEntry, ...historyRecords]);
    setHistoryCurrentPage(1);
    setIsAddRecordOpen(false);
    setNewRecordForm({
      caseId: "",
      offenceType: "Theft",
      description: "",
      date: "",
      location: "Chennai, TN",
      status: "Under Investigation",
      outcome: null,
      courtName: "",
      sentenceDetails: "",
    });

    try {
      const res = await createCriminalRecord({
        criminalId: criminal.id,
        courtCaseNumber: caseId,
        offenceType: newRecordForm.offenceType,
        description,
        incidentDate: new Date(date).toISOString(),
        location,
        status: newRecordForm.status,
        outcome: newRecordForm.outcome || undefined,
        courtName,
        sentenceDetails,
      });

      if (res.error) {
        toast.error(`Ledger notice: ${res.error}`);
      } else {
        toast.success(`Judicial Record "${caseId}" permanently logged to Neon DB!`);
      }
    } catch {
      toast.info(`Record "${caseId}" registered.`);
    }
  };

  const handleDeleteCriminalRecord = async (recordId: string) => {
    setHistoryRecords((prev) => prev.filter((r) => r.id !== recordId));
    try {
      await deleteCriminalRecord(recordId, criminal.id);
      toast.success("Record deleted from official ledger.");
    } catch {
      toast.error("Failed to delete record from ledger.");
    }
  };

  const filteredHistoryRecords = useMemo(() => {
    return historyRecords.filter((r) => {
      if (historyStatusFilter !== "All Records" && r.status !== historyStatusFilter) {
        return false;
      }
      if (historySearchTerm.trim()) {
        const q = historySearchTerm.toLowerCase();
        const matchCase = r.caseId.toLowerCase().includes(q);
        const matchOffence = r.offenceType.toLowerCase().includes(q);
        const matchDesc = r.description.toLowerCase().includes(q);
        const matchLoc = r.location.toLowerCase().includes(q);
        if (!matchCase && !matchOffence && !matchDesc && !matchLoc) return false;
      }
      return true;
    });
  }, [historyRecords, historyStatusFilter, historySearchTerm]);

  // Derived pagination for criminal history table
  const totalHistoryItems = filteredHistoryRecords.length;
  const totalHistoryPages = Math.max(1, Math.ceil(totalHistoryItems / historyPageSize));
  const historyStartIndex = (historyCurrentPage - 1) * historyPageSize;
  const currentHistoryRecords = filteredHistoryRecords.slice(
    historyStartIndex,
    historyStartIndex + historyPageSize
  );

  // Derived metrics from records
  const totalHistoryCases = historyRecords.length;
  const totalConvictions = historyRecords.filter((r) => r.outcome === "Convicted").length;
  const totalOngoing = historyRecords.filter(
    (r) => r.status === "Under Investigation" || r.status === "In Court" || r.outcome === "Trial Ongoing"
  ).length;
  const totalAcquitted = historyRecords.filter((r) => r.outcome === "Acquitted").length;
  const mostRecentRecord = historyRecords[0] || null;



  // Biometrics tab state
  const [matchCandidates, setMatchCandidates] = useState<FaceMatchCandidate[]>([]);


  const [matchHistory, setMatchHistory] = useState<BiometricMatchHistoryItem[]>(() => {
    const rawMatches = (criminal as any).recognitionResults || [];
    if (rawMatches.length > 0) {
      return rawMatches.map((rr: any, idx: number) => ({
        id: rr.id,
        rowNumber: String(idx + 1).padStart(2, "0"),
        dateTime: new Date(rr.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        queriedImageSrc: rr.sketch?.imageUrl || "/images/evidence/mask_evidence.jpg",
        matchName: `${criminal.firstName} ${criminal.lastName}`,
        matchCode: rr.sketch?.case?.caseNumber
          ? `Linked Case: ${rr.sketch.case.caseNumber}`
          : "Facial Embedding Match",
        caseId: rr.sketch?.case?.caseNumber || "FX-CENTRAL",
        confidence: Math.round(rr.matchScore * 100),
        initiatedBy: "InsightFace Engine",
        status:
          rr.status === "CONFIRMED"
            ? "Match Found"
            : rr.status === "REJECTED"
            ? "Inconclusive"
            : "Reviewed",
      }));
    }
    return [];
  });
  const [isScanningBiometrics, setIsScanningBiometrics] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<FaceMatchCandidate | null>(null);
  const [isBiometricLightboxOpen, setIsBiometricLightboxOpen] = useState(false);
  const [openBiometricActionRowId, setOpenBiometricActionRowId] = useState<string | null>(null);

  const handleScanBiometrics = async () => {
    setIsScanningBiometrics(true);
    toast.info("Querying AI Biometric Engine (Neon pgvector / 512D Embeddings)...");
    try {
      const res = await runCriminalFacialBiometricSearch(criminal.id);
      if (res.success && res.candidates) {
        setMatchCandidates(res.candidates as FaceMatchCandidate[]);
        if (res.hasEmbedding) {
          toast.success(res.message || `Biometric search completed: ${res.candidates.length} candidates evaluated.`);
        } else {
          toast.info(res.message || "Biometric scan completed: No enrolled 512D vector for this subject.");
        }
      } else {
        toast.info("Biometric scan completed: No matching candidates found.");
      }
    } catch {
      toast.error("Biometric scan service unreachable.");
    } finally {
      setIsScanningBiometrics(false);
    }
  };

  // Lightbox for evidence
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  // Evidence filter state in the Evidence tab
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");

  // Derived Demographics (Real subject values, never fabricated)
  const height = (demographics.height as string) || "Not Documented";
  const weight = (demographics.weight as string) || "Not Documented";
  const build = (demographics.build as string) || "Not Documented";
  const eyeColor = (demographics.eyeColor as string) || "Not Documented";
  const hairColor = (demographics.hairColor as string) || "Not Documented";
  const complexion = (demographics.complexion as string) || "Not Documented";
  const distinctiveMarks =
    (demographics.distinctiveMarks as string) || "None documented";
  const tattoos = (demographics.tattoos as string) || "None documented";

  const primaryCategory = (demographics.primaryCategory as string) || "General Offence";
  const secondaryCategories =
    (demographics.secondaryCategories as string) || "—";
  const modusOperandi =
    (demographics.modusOperandi as string) || "Modus operandi under active investigation.";
  const knownAreas =
    (demographics.knownAreas as string) || (criminal.lastKnownLocation || "Location Not Disclosed");
  const crimeSummary =
    criminal.description ||
    "No specific criminal summary or modus operandi documented for this subject in the central registry.";

  // Attach Evidence State
  const [isAttachEvidenceOpen, setIsAttachEvidenceOpen] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState("");
  const [evidenceCategory, setEvidenceCategory] = useState("IMAGE");
  const [evidenceSource, setEvidenceSource] = useState("INVESTIGATOR");
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const evidenceFileInputRef = React.useRef<HTMLInputElement>(null);

  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>(() => computedEvidence);

  React.useEffect(() => {
    setEvidenceItems(computedEvidence);
  }, [computedEvidence]);

  // Link to Case Modal state
  const [isLinkCaseOpen, setIsLinkCaseOpen] = useState(false);
  const [linkCaseInput, setLinkCaseInput] = useState("");
  const [linkRole, setLinkRole] = useState<SuspectRole>(SuspectRole.UNDER_INVESTIGATION);
  const [linkStatus, setLinkStatus] = useState<SuspectCaseStatus>(SuspectCaseStatus.PERSON_OF_INTEREST);
  const [linkNotes, setLinkNotes] = useState("");
  const [isLinkingCase, setIsLinkingCase] = useState(false);
  const [caseList, setCaseList] = useState<RelatedCase[]>(() => computedRelatedCases);

  React.useEffect(() => {
    setCaseList(computedRelatedCases);
  }, [computedRelatedCases]);

  const handleLinkCase = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!linkCaseInput.trim()) {
      toast.error("Please enter a case number or ID");
      return;
    }
    setIsLinkingCase(true);
    try {
      const res = await linkCriminalToCase({
        caseId: linkCaseInput.trim(),
        criminalId: criminal.id,
        role: linkRole,
        status: linkStatus,
        notes: linkNotes.trim() || undefined,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Attached subject to Case ${linkCaseInput.trim()}`);
        setCaseList((prev) => [
          {
            caseNumber: linkCaseInput.trim().toUpperCase(),
            title: `Investigation ${linkCaseInput.trim().toUpperCase()}`,
            status: "Under Investigation",
            statusColor: "border-[#7E22CE]/40 bg-[#2D1B4E]/80 text-[#C084FC]",
          },
          ...prev,
        ]);
        setIsLinkCaseOpen(false);
        setLinkCaseInput("");
        setLinkNotes("");
      }
    } catch {
      toast.error("Failed to link to case");
    } finally {
      setIsLinkingCase(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "criminal-history", label: `Criminal History (${historyRecords.length})` },
    { id: "biometrics", label: "Biometrics" },
    { id: "evidence", label: `Evidence (${evidenceItems.length})` },
    { id: "activity", label: "Activity Log" },
  ];

  // Suggested aliases: filter out already-added ones
  const suggestedAliases = useMemo(() => {
    const fullName = `${criminal.firstName ?? ""} ${criminal.lastName ?? ""}`.trim();
    const parts = fullName.split(" ").filter(Boolean);
    const dynamic: string[] = [];
    if (parts[0]) dynamic.push(parts[0]);
    if (parts.length > 1) dynamic.push(parts[parts.length - 1]);
    if (parts[0] && parts.length > 1)
      dynamic.push(`${parts[0][0]}. ${parts[parts.length - 1]}`);
    const all = Array.from(new Set([...dynamic, ...DEFAULT_SUGGESTED_ALIASES]));
    return all.filter((s) => !aliases.includes(s));
  }, [criminal.firstName, criminal.lastName, aliases]);

  const handleUploadEvidence = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!evidenceFile) {
      toast.error("Please select a file to upload");
      return;
    }
    setIsUploadingEvidence(true);
    try {
      const formData = new FormData();
      formData.append("file", evidenceFile);
      formData.append("criminalId", criminal.id);
      formData.append("title", evidenceTitle.trim() || evidenceFile.name);
      formData.append("category", evidenceCategory);
      formData.append("source", evidenceSource);

      const res = await uploadEvidence(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Forensic evidence uploaded and verified with SHA-256!");
        const newEvItem: EvidenceItem = {
          id: res.data?.id || `ev-${Date.now()}`,
          name: evidenceTitle.trim() || evidenceFile.name,
          type: (evidenceFile.type.startsWith("video")
            ? "video"
            : evidenceFile.type.startsWith("image")
            ? "image"
            : "document") as any,
          date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          imageSrc: res.data?.storageKey ? `/api/storage?key=${encodeURIComponent(res.data.storageKey)}` : URL.createObjectURL(evidenceFile),
          size: `${Math.round(evidenceFile.size / 1024)} KB`,
          sha256: res.data?.sha256Hash ? `${res.data.sha256Hash.substring(0, 14)}...` : "SHA256-VERIFIED",
          officer: "Investigating Officer",
        };
        setEvidenceItems([newEvItem, ...evidenceItems]);
        setIsAttachEvidenceOpen(false);
        setEvidenceTitle("");
        setEvidenceFile(null);
      }
    } catch {
      toast.error("Failed to upload evidence to storage");
    } finally {
      setIsUploadingEvidence(false);
    }
  };

  // Fingerprint & DNA States
  const [fingerprintUrl, setFingerprintUrl] = useState<string | null>(criminal.fingerprintScanUrl || null);
  const [isUploadingFingerprint, setIsUploadingFingerprint] = useState(false);
  const fingerprintInputRef = React.useRef<HTMLInputElement>(null);

  const [dnaCode, setDnaCode] = useState<string>(criminal.dnaProfileCode || "CODIS-IND-NA");
  const [isEditingDna, setIsEditingDna] = useState(false);
  const [dnaInput, setDnaInput] = useState(criminal.dnaProfileCode || "");
  const [isSavingDna, setIsSavingDna] = useState(false);

  const handleUploadFingerprint = async (file: File) => {
    setIsUploadingFingerprint(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await updateCriminalFingerprint(criminal.id, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Fingerprint scan enrolled into biometric registry");
        if (res.storageKey) {
          setFingerprintUrl(`/api/storage?key=${encodeURIComponent(res.storageKey)}`);
        }
      }
    } catch {
      toast.error("Failed to upload fingerprint scan");
    } finally {
      setIsUploadingFingerprint(false);
    }
  };

  const handleSaveDna = async () => {
    if (!dnaInput.trim()) return;
    setIsSavingDna(true);
    try {
      const res = await updateCriminalDnaProfile(criminal.id, dnaInput.trim());
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("DNA profile code recorded and verified");
        setDnaCode(dnaInput.trim());
        setIsEditingDna(false);
      }
    } catch {
      toast.error("Failed to save DNA profile");
    } finally {
      setIsSavingDna(false);
    }
  };

  const handleAddAlias = async (directAlias?: string) => {
    const value = directAlias ?? newAlias.trim();
    if (!value) return;
    if (aliases.includes(value)) {
      toast.info("Alias already exists");
      return;
    }
    const previous = [...aliases];
    setAliases([...aliases, value]);
    if (!directAlias) {
      setNewAlias("");
      setIsAddingAlias(false);
    }
    try {
      const res = await addCriminalAlias(criminal.id, value);
      if (res.error) {
        setAliases(previous);
        toast.error(res.error);
      } else {
        toast.success(`Alias "${value}" registered and persisted.`);
      }
    } catch {
      setAliases(previous);
      toast.error("Failed to persist alias to database.");
    }
  };

  const handleRemoveAlias = async (aliasToRemove: string) => {
    const previous = [...aliases];
    setAliases(aliases.filter((a) => a !== aliasToRemove));
    try {
      const res = await removeCriminalAlias(criminal.id, aliasToRemove);
      if (res.error) {
        setAliases(previous);
        toast.error(res.error);
      } else {
        toast.info(`Alias "${aliasToRemove}" removed from registry.`);
      }
    } catch {
      setAliases(previous);
      toast.error("Failed to remove alias.");
    }
  };

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          TAB NAVIGATION BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="relative border-b border-border/70 pb-px">
        <div
          role="tablist"
          aria-label="Criminal profile sections"
          className="flex w-full justify-start overflow-x-auto no-scrollbar gap-1 sm:gap-4 h-11 px-0.5 sm:px-0 relative scroll-smooth touch-pan-x"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`criminal-tab-${tab.id}`}
                aria-controls={`criminal-tabpanel-${tab.id}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative inline-flex items-center justify-center px-2.5 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none outline-none shrink-0 whitespace-nowrap",
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative z-10">{tab.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="criminal-profile-active-tab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#665AEF] rounded-full z-10"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TAB CONTENT PANELS
          ───────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          role="tabpanel"
          id={`criminal-tabpanel-${activeTab}`}
          aria-labelledby={`criminal-tab-${activeTab}`}
          variants={tabContentVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="w-full"
        >
          {/* ═══════════════════════════════════════════════════════════
              TAB 1: OVERVIEW
              Row 1: Physical Description (4), Aliases (4), Crime Info (4) [Symmetric 1:1:1 Triad]
              Row 2: Recent Evidence (7), Related Cases (5) [Architectural 7:5 Ratio]
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-5 w-full">
              {/* ROW 1: 3 BALANCED CARDS (4 - 4 - 4 SYMMETRICAL RATIO) */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-5 w-full">
                {/* CARD 1: PHYSICAL DESCRIPTION (4 COLS) */}
                <div className="md:col-span-1 xl:col-span-4 flex flex-col">
                  <div className="h-full rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7.5 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/30">
                            <Ruler className="size-4" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Physical Description
                          </h3>
                        </div>
                      </div>

                      {/* 2-Column Grid (Locked Baseline Alignment across Columns) */}
                      <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-2.5 sm:gap-y-3 pt-3 text-xs">
                        {[
                          { label: "Height", value: height },
                          { label: "Hair Color", value: hairColor },
                          { label: "Weight", value: weight },
                          { label: "Complexion", value: complexion },
                          { label: "Build", value: build },
                          { label: "Distinctive Marks", value: distinctiveMarks },
                          { label: "Eye Color", value: eyeColor },
                          { label: "Tattoos", value: tattoos },
                        ].map((attr) => (
                          <div key={attr.label} className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[10px] sm:text-[11px] leading-none">
                              {attr.label}
                            </span>
                            <span className="font-semibold text-foreground text-xs leading-tight pt-0.5 truncate">
                              {attr.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Forensic Verification Footnote */}
                    <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80">
                        Forensic Physical Record
                      </span>
                      <span className="text-[10px] font-mono font-medium text-muted-foreground/80">
                        CONF-A1
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: ALIASES (4 COLS) */}
                <div className="md:col-span-1 xl:col-span-4 flex flex-col">
                  <div className="h-full rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7.5 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/30">
                            <Tag className="size-4" />
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              Aliases
                            </h3>
                            <span className="text-[11px] font-semibold text-[#a594fd] bg-[#665AEF]/15 px-2 py-0.5 rounded-md border-2 border-[#665AEF]/30">
                              {aliases.length}
                            </span>
                          </div>
                        </div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddingAlias(!isAddingAlias)}
                            className={cn(
                              "h-7 px-2.5 gap-1.5 rounded-lg border-2 text-xs font-semibold cursor-pointer transition-colors shadow-2xs overflow-hidden relative min-w-17",
                              isAddingAlias
                                ? "border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                                : "border-border/80 bg-background/50 hover:bg-muted/60 hover:border-[#665AEF]/50 text-foreground"
                            )}
                          >
                            <AnimatePresence mode="wait" initial={false}>
                              {isAddingAlias ? (
                                <motion.span
                                  key="cancel"
                                  initial={{ opacity: 0, y: -4, scale: 0.92 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 4, scale: 0.92 }}
                                  transition={{ duration: 0.16, ease: "easeOut" }}
                                  className="inline-flex items-center gap-1.5"
                                >
                                  <X className="size-3" />
                                  <span>Cancel</span>
                                </motion.span>
                              ) : (
                                <motion.span
                                  key="add"
                                  initial={{ opacity: 0, y: -4, scale: 0.92 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 4, scale: 0.92 }}
                                  transition={{ duration: 0.16, ease: "easeOut" }}
                                  className="inline-flex items-center gap-1.5"
                                >
                                  <Plus className="size-3 text-[#665AEF]" />
                                  <span>Add</span>
                                </motion.span>
                              )}
                            </AnimatePresence>
                          </Button>
                        </motion.div>
                      </div>

                      {/* Tags Grid with Layout & PopLayout Animation */}
                      <div className="pt-3 space-y-2.5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                          <AnimatePresence mode="popLayout">
                            {aliases.map((alias) => (
                              <motion.div
                                layout
                                key={alias}
                                initial={{ opacity: 0, scale: 0.8, y: 4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.75, filter: "blur(2px)" }}
                                transition={{
                                  layout: { type: "spring", stiffness: 500, damping: 32 },
                                  opacity: { duration: 0.18 },
                                  scale: { duration: 0.18 },
                                }}
                                whileHover={{ y: -1 }}
                                className="group flex items-center justify-between rounded-lg border border-border/70 bg-background/40 hover:bg-muted/40 hover:border-[#665AEF]/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-all shadow-2xs select-none min-h-8.5"
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span className="text-muted-foreground/60 text-[10px] font-mono select-none">#</span>
                                  <span className="truncate font-medium">{alias}</span>
                                </div>
                                <motion.button
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.85 }}
                                  type="button"
                                  onClick={() => handleRemoveAlias(alias)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 p-0.5 rounded cursor-pointer shrink-0 ml-1"
                                  title={`Remove ${alias}`}
                                >
                                  <X className="size-3" />
                                </motion.button>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>

                        {/* Suggested Tags with PopLayout and Smooth Chip Spring */}
                        <AnimatePresence>
                          {suggestedAliases.length > 0 && (
                            <motion.div
                              layout
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="pt-2 space-y-1.5"
                            >
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="size-3 text-[#665AEF]" />
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                  Suggested Monikers
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <AnimatePresence mode="popLayout">
                                  {suggestedAliases.slice(0, 5).map((sug) => (
                                    <motion.button
                                      layout
                                      key={sug}
                                      type="button"
                                      initial={{ opacity: 0, scale: 0.85 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      exit={{ opacity: 0, scale: 0.75, filter: "blur(2px)" }}
                                      whileHover={{ scale: 1.04, y: -1 }}
                                      whileTap={{ scale: 0.94 }}
                                      transition={{
                                        layout: { type: "spring", stiffness: 500, damping: 32 },
                                        duration: 0.18,
                                        ease: "easeOut",
                                      }}
                                      onClick={() => handleAddAlias(sug)}
                                      className="group inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border border-border/80 bg-card/40 hover:bg-[#665AEF]/15 hover:border-[#665AEF]/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 font-medium select-none shadow-2xs"
                                      title={`Add alias: ${sug}`}
                                    >
                                      <Plus className="size-2.5 text-[#665AEF] group-hover:rotate-90 transition-transform duration-200" />
                                      <span className="whitespace-nowrap">{sug}</span>
                                    </motion.button>
                                  ))}
                                </AnimatePresence>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Inline Add Alias Input with Smooth Slide & Expand Animation */}
                        <AnimatePresence>
                          {isAddingAlias && (
                            <motion.div
                              key="add-alias-input-tabs"
                              initial={{ opacity: 0, height: 0, y: -6 }}
                              animate={{ opacity: 1, height: "auto", y: 0 }}
                              exit={{ opacity: 0, height: 0, y: -6 }}
                              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="flex items-center gap-1.5 pt-1.5 pb-0.5">
                                <Input
                                  placeholder="New alias name..."
                                  value={newAlias}
                                  onChange={(e) => setNewAlias(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleAddAlias();
                                    } else if (e.key === "Escape") {
                                      setIsAddingAlias(false);
                                      setNewAlias("");
                                    }
                                  }}
                                  className="h-8 text-xs border-2 border-border/80 bg-background/50 focus-visible:border-ring rounded-lg transition-colors"
                                  autoFocus
                                />
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="shrink-0">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAddAlias()}
                                    className="h-8 px-3 gap-1 text-xs font-semibold rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white cursor-pointer shadow-sm shadow-[#665AEF]/25 shrink-0 transition-colors flex items-center"
                                  >
                                    <Check className="size-3" />
                                    <span>Save</span>
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="shrink-0">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setIsAddingAlias(false);
                                      setNewAlias("");
                                    }}
                                    className="h-8 px-2 text-xs font-medium rounded-lg border-2 border-border/80 bg-background/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors shadow-2xs shrink-0"
                                  >
                                    Cancel
                                  </Button>
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

                    {/* Bottom Action / Footnote */}
                    <div className="mt-auto pt-3 border-t border-border/40">
                      {!isAddingAlias ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddingAlias(true)}
                          className="w-full h-8 border-dashed border-border/80 hover:border-[#665AEF]/60 bg-muted/15 hover:bg-[#665AEF]/10 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 transition-colors"
                        >
                          <Plus className="size-3 text-[#665AEF]" />
                          <span>Register New Moniker</span>
                        </Button>
                      ) : (
                        <div className="h-8 flex items-center justify-between text-[11px] text-muted-foreground px-1">
                          <span>Press <kbd className="px-1.5 py-0.5 bg-muted/60 rounded border border-border/50 font-mono text-[10px] text-foreground">Enter</kbd> to save</span>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingAlias(false);
                              setNewAlias("");
                            }}
                            className="text-muted-foreground hover:text-foreground hover:underline cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD 3: CRIME INFORMATION (4 COLS - PERFECT CLEAN ALIGNMENT) */}
                <div className="md:col-span-2 xl:col-span-4 flex flex-col">
                  <div className="h-full rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7.5 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/30">
                            <BookOpen className="size-4" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Crime Information
                          </h3>
                        </div>
                      </div>

                      {/* Content Alignment: Structured, Clean, and Perfectly Proportioned */}
                      <div className="pt-3 space-y-2.5 sm:space-y-3 text-xs">
                        {/* Row 1: Categories Side-by-Side (Label on top, Value below - No Collisions) */}
                        <div className="grid grid-cols-2 gap-x-4 sm:gap-x-6 gap-y-1">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[10px] sm:text-[11px] leading-none">
                              Primary Category
                            </span>
                            <span className="font-semibold text-foreground text-xs leading-tight pt-0.5">
                              {primaryCategory}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[10px] sm:text-[11px] leading-none">
                              Secondary Categories
                            </span>
                            <span className="font-semibold text-foreground text-xs leading-tight pt-0.5 truncate">
                              {secondaryCategories}
                            </span>
                          </div>
                        </div>

                        {/* Row 2: Typical Modus Operandi (Left-aligned, Natural flow) */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground text-[10px] sm:text-[11px] leading-none">
                            Typical Modus Operandi
                          </span>
                          <span className="font-medium text-foreground text-xs leading-snug pt-0.5">
                            {modusOperandi}
                          </span>
                        </div>

                        {/* Row 3: Known Areas (Left-aligned, Natural flow) */}
                        <div className="flex flex-col gap-0.5">
                          <span className="text-muted-foreground text-[10px] sm:text-[11px] leading-none">
                            Known Areas
                          </span>
                          <span className="font-medium text-foreground text-xs leading-snug pt-0.5">
                            {knownAreas}
                          </span>
                        </div>

                        {/* Row 4: Summary (Full-width clean paragraph) */}
                        <div className="pt-2 border-t border-border/40 flex flex-col gap-1">
                          <span className="text-muted-foreground text-[10px] sm:text-[11px] leading-none">
                            Summary
                          </span>
                          <p className="text-xs text-foreground/90 leading-relaxed pt-0.5 line-clamp-3 sm:line-clamp-none">
                            {crimeSummary}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Operational Intel Footer */}
                    <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80">
                        Classification:{" "}
                        <span className="text-foreground/90 font-medium">
                          {(demographics.classification as string) ||
                            (criminal.riskLevel === "CRITICAL" || criminal.riskLevel === "HIGH"
                              ? "High-Risk Subject"
                              : "Standard Subject")}
                        </span>
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-semibold",
                          criminal.riskLevel === "CRITICAL" || criminal.riskLevel === "HIGH"
                            ? "text-rose-500"
                            : criminal.riskLevel === "MEDIUM"
                            ? "text-amber-500"
                            : "text-emerald-500"
                        )}
                      >
                        {(demographics.categoryLevel as string) ||
                          (criminal.riskLevel === "CRITICAL"
                            ? "Priority Category I"
                            : criminal.riskLevel === "HIGH"
                            ? "Violent Category II"
                            : "Category III")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 2: 2 BALANCED CARDS (7 - 5 RATIO) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 sm:gap-4 lg:gap-5 w-full">
                {/* CARD 4: RECENT EVIDENCE (7 COLS) */}
                <div className="xl:col-span-7 2xl:col-span-7 flex flex-col">
                  <div className="h-full rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7.5 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/30">
                            <Camera className="size-4" />
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              Recent Evidence
                            </h3>
                            <span className="text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border-2 border-border/50">
                              {evidenceItems.length} Total
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => setActiveTab("evidence")}
                          className="h-7 px-2.5 gap-1.5 text-xs font-semibold text-[#a594fd] hover:text-foreground hover:bg-[#665AEF]/10 cursor-pointer rounded-md transition-colors"
                        >
                          <span>View All</span>
                          <ArrowRight className="size-3" />
                        </Button>
                      </div>

                      {/* 4 Cards Grid or Empty State */}
                      {evidenceItems.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3">
                          {evidenceItems.slice(0, 4).map((item) => (
                            <div
                              key={item.id}
                              onClick={() => setSelectedEvidence(item)}
                              className="group relative flex flex-col rounded-md overflow-hidden border-2 border-border/70 bg-[#0F172A]/80 hover:border-[#665AEF]/70 transition-all cursor-pointer shadow-xs hover:shadow-md hover:shadow-[#665AEF]/10"
                            >
                              {/* Image Box */}
                              <div className="relative aspect-square w-full overflow-hidden bg-black/50">
                                <Image
                                  src={item.imageSrc}
                                  alt={item.name}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                  sizes="(max-width: 768px) 50vw, 180px"
                                />
                                {/* Overlay Badge */}
                                <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-xs text-[10px] font-medium text-white/90 border-2 border-white/20">
                                  {item.type === "video" ? (
                                    <>
                                      <Play className="size-2.5 fill-current text-[#a594fd]" />
                                      <span>Video</span>
                                    </>
                                  ) : (
                                    <>
                                      <Camera className="size-2.5 text-[#a594fd]" />
                                      <span>Image</span>
                                    </>
                                  )}
                                </div>

                                {/* Video Duration */}
                                {item.duration && (
                                  <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-xs text-[10px] font-mono text-white/90 border-2 border-white/20">
                                    {item.duration}
                                  </div>
                                )}
                              </div>

                              {/* Details below image */}
                              <div className="p-2 flex flex-col gap-0.5 bg-card/90 border-t border-border/40">
                                <span
                                  className="text-[11px] font-semibold text-foreground truncate group-hover:text-[#a594fd] transition-colors"
                                  title={item.name}
                                >
                                  {item.name}
                                </span>
                                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                                  <span>{item.date}</span>
                                  <span className="font-mono text-muted-foreground/70">{item.size}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-border/60 rounded-xl my-3 bg-muted/10">
                          <Camera className="size-7 text-muted-foreground/40 mb-2" />
                          <p className="text-xs font-semibold text-foreground">No Evidence Logged</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                            No physical or digital forensic evidence has been linked to this record.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Chain of Custody Footer */}
                    <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="truncate">Chain of Custody Active • {evidenceItems.length} Item{evidenceItems.length === 1 ? "" : "s"}</span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border-2 border-emerald-500/30 px-2 py-0.5 rounded-md shrink-0 ml-1">
                        Verified
                      </span>
                    </div>
                  </div>
                </div>

                {/* CARD 5: RELATED CASES (5 COLS - PERFECT TABULAR ALIGNMENT) */}
                <div className="xl:col-span-5 2xl:col-span-5 flex flex-col">
                  <div className="h-full rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7.5 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/30">
                            <FolderKanban className="size-4" />
                          </div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-foreground">
                              Related Cases
                            </h3>
                            <span className="text-[11px] font-semibold text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border-2 border-border/50">
                              {caseList.length} Total
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="xs"
                            onClick={() => setIsLinkCaseOpen(true)}
                            className="h-7 px-2 gap-1 text-[11px] font-semibold text-[#a594fd] hover:text-foreground border-2 border-border/80 bg-muted/30 hover:bg-[#665AEF]/15 rounded-md cursor-pointer transition-colors"
                          >
                            <Plus className="size-3 text-[#665AEF]" />
                            <span>Link Case</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="xs"
                            render={<Link href="/dashboard/cases" />}
                            className="h-7 px-2.5 gap-1.5 text-xs font-semibold text-[#a594fd] hover:text-foreground hover:bg-[#665AEF]/10 cursor-pointer rounded-md transition-colors"
                            nativeButton={false}
                          >
                            <span>View All</span>
                            <ArrowRight className="size-3" />
                          </Button>
                        </div>
                      </div>

                      {/* Rows List or Empty State */}
                      {caseList.length > 0 ? (
                        <div className="space-y-1.5 pt-3">
                          {caseList.map((c) => (
                            <Link
                              key={c.caseNumber}
                              href={`/case-details/${c.caseNumber}`}
                              className="flex items-center justify-between py-2 px-2.5 rounded-md border-2 border-border/40 bg-background/30 hover:bg-muted/50 hover:border-[#665AEF]/40 transition-all text-xs group"
                            >
                              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                <span className="font-mono text-[10px] sm:text-[11px] font-semibold text-[#a594fd] group-hover:underline shrink-0 w-20 sm:w-24">
                                  {c.caseNumber}
                                </span>
                                <span className="text-foreground font-medium truncate group-hover:text-foreground transition-colors text-xs">
                                  {c.title}
                                </span>
                              </div>
                              <span
                                className={cn(
                                  "inline-flex items-center justify-center rounded-md border-2 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold shrink-0 ml-1.5 sm:ml-2 min-w-15.5 sm:min-w-17.5 text-center",
                                  c.statusColor
                                )}
                              >
                                {c.status}
                              </span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-border/60 rounded-xl my-3 bg-muted/10">
                          <FolderKanban className="size-7 text-muted-foreground/40 mb-2" />
                          <p className="text-xs font-semibold text-foreground">No Linked Cases</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                            This subject is not currently associated with any open or closed FIRs.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Case Status Summary Footer */}
                    <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80">
                        {computedRelatedCases.length} Associated Case{computedRelatedCases.length === 1 ? "" : "s"}
                      </span>
                      <span className="text-[10px] font-mono font-medium text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded-md border-2 border-border/40">
                        CCTNS-LINK
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 3: CO-OFFENDER SYNDICATE & ASSOCIATIVE NETWORK */}
              <div className="w-full">
                <div className="rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between gap-4">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-7.5 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/30">
                        <Network className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-foreground">
                            Co-Offender Network & Syndicate Links
                          </h3>
                          <span className="text-[11px] font-semibold text-[#a594fd] bg-[#665AEF]/15 px-2 py-0.5 rounded-md border-2 border-[#665AEF]/30">
                            {computedCoOffenders.length} Linked Associate{computedCoOffenders.length === 1 ? "" : "s"}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Cross-case associative intelligence derived from mutual FIR investigations and co-accused rosters
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {computedCoOffenders.length > 0 && (
                        <div className="flex items-center gap-1 bg-muted/60 p-0.5 rounded-lg border border-border/70">
                          <button
                            type="button"
                            onClick={() => setSyndicateViewMode("graph")}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                              syndicateViewMode === "graph"
                                ? "bg-[#665AEF] text-white shadow-xs font-bold"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Network className="size-3.5" />
                            <span>Interactive Graph</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setSyndicateViewMode("grid")}
                            className={cn(
                              "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer",
                              syndicateViewMode === "grid"
                                ? "bg-[#665AEF] text-white shadow-xs font-bold"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <LayoutGrid className="size-3.5" />
                            <span>Roster Grid</span>
                          </button>
                        </div>
                      )}
                      <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border-2 border-emerald-500/25 px-2 py-0.5 rounded-md">
                        <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Graph Linked
                      </span>
                    </div>
                  </div>

                  {/* Body: Associates Interactive Graph, Roster Grid, or Clean Empty State */}
                  {computedCoOffenders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-border/60 rounded-xl my-1 bg-muted/10">
                      <div className="flex size-10 items-center justify-center rounded-full bg-muted/40 text-muted-foreground mb-2">
                        <Users className="size-5 text-muted-foreground/60" />
                      </div>
                      <p className="text-xs font-semibold text-foreground">No Known Syndicate Associates</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5 max-w-sm">
                        No co-accused or mutual syndicate associates are recorded across this subject's linked FIR cases. Link additional co-suspects to establish associative network clusters.
                      </p>
                    </div>
                  ) : syndicateViewMode === "graph" ? (
                    <SyndicateNetworkGraph
                      primarySubject={{
                        id: criminal.id,
                        criminalId: criminal.criminalId,
                        name: `${criminal.firstName} ${criminal.lastName}`.trim(),
                        mugshotUrl: mugshotDisplayUrl,
                        slug: getCriminalSlug(criminal),
                      }}
                      coOffenders={computedCoOffenders}
                    />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                      {computedCoOffenders.map((co) => (
                        <Link
                          key={co.id}
                          href={`/dashboard/criminals/${co.slug}`}
                          className="group relative flex flex-col justify-between p-3.5 rounded-xl border-2 border-border/70 bg-background/50 hover:bg-card/90 hover:border-[#665AEF]/60 transition-all duration-200 shadow-xs cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative shrink-0">
                              <SuspectAvatar
                                mugshotUrl={co.mugshotUrl}
                                name={co.name}
                                size="md"
                                className="size-11 rounded-lg border-2 border-border/80 group-hover:border-[#665AEF]/50 transition-colors"
                              />
                              <span
                                className={cn(
                                  "absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-background",
                                  co.status === "WANTED"
                                    ? "bg-rose-500"
                                    : co.status === "ACTIVE"
                                    ? "bg-emerald-500"
                                    : "bg-neutral-500"
                                )}
                              />
                            </div>

                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="text-xs font-semibold text-foreground group-hover:text-[#a594fd] transition-colors truncate">
                                  {co.name}
                                </h4>
                                <ArrowRight className="size-3 text-muted-foreground/60 group-hover:text-[#a594fd] group-hover:translate-x-0.5 transition-all shrink-0" />
                              </div>

                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono text-[10px] text-[#a594fd] font-semibold">
                                  {co.criminalId}
                                </span>
                                {co.alias && (
                                  <span className="text-[10px] text-muted-foreground italic truncate">
                                    "{co.alias}"
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 pt-0.5">
                                <span
                                  className={cn(
                                    "text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border",
                                    co.riskLevel === "CRITICAL"
                                      ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                      : co.riskLevel === "HIGH"
                                      ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                                  )}
                                >
                                  {co.riskLevel} Risk
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                  {co.sharedCases.length} shared case{co.sharedCases.length === 1 ? "" : "s"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Shared FIRs tag chips */}
                          <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] gap-2">
                            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                              {co.sharedCases.slice(0, 2).map((sc) => (
                                <span
                                  key={sc.caseNumber}
                                  className="inline-flex items-center font-mono text-[9px] px-1.5 py-0.5 rounded bg-muted/70 text-foreground/80 border border-border/50 shrink-0"
                                >
                                  {sc.caseNumber} · {sc.role}
                                </span>
                              ))}
                              {co.sharedCases.length > 2 && (
                                <span className="text-[9px] text-muted-foreground font-mono">
                                  +{co.sharedCases.length - 2} more
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] font-semibold text-[#a594fd] opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              View Profile
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 2: CRIMINAL HISTORY DASHBOARD
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "criminal-history" && (
            <div className="space-y-6 w-full">
              {/* TOP CARD: CRIMINAL HISTORY TABLE */}
              <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs space-y-4">
                {/* Header with Title and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <FolderClock className="size-5 text-[#a594fd] shrink-0" />
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                        Criminal History
                      </h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                        Previous cases, arrests, and convictions associated with this individual.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-48 lg:w-56">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                      <Input
                        value={historySearchTerm}
                        onChange={(e) => {
                          setHistorySearchTerm(e.target.value);
                          setHistoryCurrentPage(1);
                        }}
                        placeholder="Search records..."
                        className="h-9 pl-8 pr-3 text-xs bg-muted/40 border-2 border-border/70 rounded-lg placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                      />
                    </div>

                    {/* Filter Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="outline"
                            className="h-9 min-w-32 justify-between rounded-lg border-2 border-border bg-card/60 px-3 text-xs font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer"
                          />
                        }
                      >
                        <span className="truncate max-w-30">{historyStatusFilter}</span>
                        <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        side="bottom"
                        sideOffset={6}
                        className="w-44 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      >
                        {["All Records", "Under Investigation", "Solved", "In Court", "Closed"].map((option) => (
                          <DropdownMenuItem
                            key={option}
                            onClick={() => {
                              setHistoryStatusFilter(option);
                              setHistoryCurrentPage(1);
                            }}
                            className={cn(
                              "relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-1.5 rounded-md transition-colors text-xs font-medium",
                              historyStatusFilter === option
                                ? "bg-[#665AEF]/20 text-[#a594fd] font-semibold"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                            )}
                          >
                            <span>{option}</span>
                            {historyStatusFilter === option && <Check className="size-3.5 text-[#a594fd]" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Add Record Button */}
                    <Button
                      type="button"
                      onClick={() => setIsAddRecordOpen(true)}
                      className="bg-[#665AEF] hover:bg-[#584bd4] text-white font-medium text-xs px-3.5 h-9 rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Record</span>
                    </Button>
                  </div>
                </div>

                {/* Desktop 9-Column Table Container (hidden on mobile, shown on md+) */}
                <div className="hidden md:block rounded-xl border-2 border-border bg-card/40 overflow-hidden shadow-xs [&>div]:overflow-x-auto [&>div]:scrollbar-none [&>div::-webkit-scrollbar]:hidden">
                  <Table>
                    <TableHeader className="bg-card/70 border-b-2 border-border/60">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12 text-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 py-3 whitespace-nowrap">
                          #
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 py-3 whitespace-nowrap">
                          Case ID
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 py-3 whitespace-nowrap">
                          Offence Type
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 py-3 min-w-55">
                          Description
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 py-3 whitespace-nowrap">
                          Date
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 py-3 whitespace-nowrap">
                          Location
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 py-3 whitespace-nowrap">
                          Status
                        </TableHead>
                        <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 py-3 whitespace-nowrap">
                          Outcome
                        </TableHead>
                        <TableHead className="w-12 text-center text-[11px] font-semibold tracking-wider text-muted-foreground uppercase px-3 py-3 whitespace-nowrap">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-border/40">
                      {currentHistoryRecords.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="py-12 text-center text-sm text-muted-foreground"
                          >
                            No criminal records found
                            {historySearchTerm ? ` matching "${historySearchTerm}"` : ""}
                            {historyStatusFilter !== "All Records" ? ` in "${historyStatusFilter}"` : ""}.
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentHistoryRecords.map((item, idx) => (
                          <TableRow
                            key={item.id}
                            className="transition-colors hover:bg-muted/30 border-b border-border/40 last:border-0"
                          >
                            {/* # */}
                            <TableCell className="text-center font-mono text-xs text-muted-foreground/80 px-3 py-3.5 whitespace-nowrap">
                              {item.rowNumber || String(historyStartIndex + idx + 1).padStart(2, "0")}
                            </TableCell>

                            {/* Case ID */}
                            <TableCell className="px-3 py-3.5 whitespace-nowrap">
                              <span
                                onClick={() => setSelectedJudicialRecord(item)}
                                title="Click to view full judicial record dossier"
                                className="font-mono text-xs font-semibold text-[#a594fd] hover:text-[#c0b3ff] hover:underline cursor-pointer inline-flex items-center gap-1"
                              >
                                {item.caseId}
                              </span>
                            </TableCell>

                            {/* Offence Type */}
                            <TableCell className="px-3 py-3.5 whitespace-nowrap">
                              {renderOffenceBadge(item.offenceType)}
                            </TableCell>

                            {/* Description */}
                            <TableCell className="px-3 py-3.5 max-w-70">
                              <p className="text-xs text-foreground/90 truncate" title={item.description}>
                                {item.description}
                              </p>
                            </TableCell>

                            {/* Date */}
                            <TableCell className="px-3 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                              {item.date}
                            </TableCell>

                            {/* Location */}
                            <TableCell className="px-3 py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                              {item.location}
                            </TableCell>

                            {/* Status */}
                            <TableCell className="px-3 py-3.5 whitespace-nowrap">
                              {renderHistoryStatusBadge(item.status)}
                            </TableCell>

                            {/* Outcome */}
                            <TableCell className="px-3 py-3.5 whitespace-nowrap">
                              {renderOutcomeBadge(item.outcome)}
                            </TableCell>

                            {/* Actions */}
                            <TableCell className="px-3 py-3.5 text-center whitespace-nowrap">
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
                                  className="w-40 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                                >
                                  <DropdownMenuItem
                                    onClick={() => setSelectedJudicialRecord(item)}
                                    className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted/60 text-xs font-medium text-foreground/80 hover:text-foreground"
                                  >
                                    <FileText className="size-3.5 text-[#a594fd]" />
                                    <span>Inspect Record</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.caseId);
                                      toast.success(`Copied ${item.caseId}`);
                                    }}
                                    className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted/60 text-xs font-medium text-foreground/80 hover:text-foreground"
                                  >
                                    <Copy className="size-3.5 text-muted-foreground" />
                                    <span>Copy Case ID</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    render={<Link href={`/case-details/${item.caseId}`} />}
                                    className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted/60 text-xs font-medium text-foreground/80 hover:text-foreground"
                                  >
                                    <ExternalLink className="size-3.5 text-muted-foreground" />
                                    <span>View Case Dossier</span>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteCriminalRecord(item.id)}
                                    className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-rose-500/10 text-xs font-medium text-rose-400 hover:text-rose-300"
                                  >
                                    <Trash2 className="size-3.5 text-rose-400" />
                                    <span>Delete Record</span>
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>

                  {/* Table Pagination Footer with border-t-2 */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:p-4 border-t-2 border-border/40 text-xs text-muted-foreground bg-card/20">
                    <div>
                      Showing {totalHistoryItems === 0 ? 0 : historyStartIndex + 1} to{" "}
                      {Math.min(historyStartIndex + historyPageSize, totalHistoryItems)} of {totalHistoryItems}{" "}
                      {totalHistoryItems === 1 ? "record" : "records"}
                    </div>

                    {totalHistoryPages > 1 && (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={historyCurrentPage === 1}
                          onClick={() => setHistoryCurrentPage((p) => Math.max(1, p - 1))}
                          className="size-8 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronLeft className="size-4" />
                        </Button>

                        {Array.from({ length: totalHistoryPages }, (_, i) => i + 1).map((pageNum) => (
                          <Button
                            key={pageNum}
                            variant={historyCurrentPage === pageNum ? "default" : "ghost"}
                            size="xs"
                            onClick={() => setHistoryCurrentPage(pageNum)}
                            className={cn(
                              "size-8 rounded-md text-xs font-medium tabular-nums transition-colors cursor-pointer",
                              historyCurrentPage === pageNum
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
                          disabled={historyCurrentPage === totalHistoryPages}
                          onClick={() => setHistoryCurrentPage((p) => Math.min(totalHistoryPages, p + 1))}
                          className="size-8 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronRight className="size-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile Responsive High-Signal Cards (shown on mobile, hidden on md+) */}
                <div className="block md:hidden space-y-2.5">
                  {currentHistoryRecords.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground rounded-lg border-2 border-border/70 bg-card/30">
                      No criminal records found
                      {historySearchTerm ? ` matching "${historySearchTerm}"` : ""}
                      {historyStatusFilter !== "All Records" ? ` in "${historyStatusFilter}"` : ""}.
                    </div>
                  ) : (
                    currentHistoryRecords.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border-2 border-border/70 bg-card/60 p-3 space-y-2 transition-colors hover:border-[#665AEF]/40"
                      >
                        {/* Top: Case ID, Offence badge, Status, Actions */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                            <span
                              onClick={() => setSelectedJudicialRecord(item)}
                              title="Click to view full judicial record dossier"
                              className="font-mono text-xs font-bold text-[#a594fd] hover:underline cursor-pointer"
                            >
                              {item.caseId}
                            </span>
                            {renderOffenceBadge(item.offenceType)}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {renderHistoryStatusBadge(item.status)}
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
                                className="w-40 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                              >
                                <DropdownMenuItem
                                  onClick={() => setSelectedJudicialRecord(item)}
                                  className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted/60 text-xs font-medium text-foreground/80 hover:text-foreground"
                                >
                                  <FileText className="size-3.5 text-[#a594fd]" />
                                  <span>Inspect Record</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => {
                                    navigator.clipboard.writeText(item.caseId);
                                    toast.success(`Copied ${item.caseId}`);
                                  }}
                                  className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted/60 text-xs font-medium text-foreground/80 hover:text-foreground"
                                >
                                  <Copy className="size-3.5 text-muted-foreground" />
                                  <span>Copy Case ID</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  render={<Link href={`/case-details/${item.caseId}`} />}
                                  className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted/60 text-xs font-medium text-foreground/80 hover:text-foreground"
                                >
                                  <ExternalLink className="size-3.5 text-muted-foreground" />
                                  <span>View Case Dossier</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteCriminalRecord(item.id)}
                                  className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors hover:bg-rose-500/10 text-xs font-medium text-rose-400 hover:text-rose-300"
                                >
                                  <Trash2 className="size-3.5 text-rose-400" />
                                  <span>Delete Record</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Description narrative */}
                        <p className="text-xs text-foreground/90 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>

                        {/* Bottom meta row: Date, Location, Outcome */}
                        <div className="flex items-center justify-between pt-2 border-t border-border/40 text-[10px] sm:text-[11px] text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="size-2.5 text-muted-foreground/80" />
                              {item.date}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate max-w-30">
                              <MapPin className="size-2.5 text-muted-foreground/80" />
                              {item.location}
                            </span>
                          </div>
                          <div>
                            {renderOutcomeBadge(item.outcome)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {/* Mobile Pagination Footer */}
                  {totalHistoryPages > 1 && (
                    <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border/70 bg-card/40 text-xs text-muted-foreground">
                      <div>
                        {historyStartIndex + 1} - {Math.min(historyStartIndex + historyPageSize, totalHistoryItems)} of {totalHistoryItems}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={historyCurrentPage === 1}
                          onClick={() => setHistoryCurrentPage((p) => Math.max(1, p - 1))}
                          className="size-7 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronLeft className="size-3.5" />
                        </Button>
                        <span className="text-xs font-mono px-2">
                          {historyCurrentPage} / {totalHistoryPages}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          disabled={historyCurrentPage === totalHistoryPages}
                          onClick={() => setHistoryCurrentPage((p) => Math.min(totalHistoryPages, p + 1))}
                          className="size-7 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 cursor-pointer"
                        >
                          <ChevronRight className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* BOTTOM ROW: 2-CARD GRID (6 - 6 COLUMN SPLIT) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 sm:gap-5 w-full">
                {/* CARD 1: SUMMARY (6 COLS) */}
                <div className="xl:col-span-6 flex">
                  <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs w-full flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <CardHeader className="p-0 pb-3 sm:pb-4 border-b border-border/50">
                        <CardTitle className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                          <Scale className="size-5 text-[#a594fd] shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-foreground">Summary</div>
                            <div className="text-[10px] sm:text-[11px] font-normal text-muted-foreground">
                              Cumulative criminal activity metrics and outcomes
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>

                      {/* 4 Metric Tiles */}
                      <CardContent className="p-0 pt-3.5 sm:pt-5">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                          {/* Total Cases */}
                          <div className="rounded-md border-2 border-border/70 bg-muted/20 p-3 sm:p-3.5 space-y-1">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">
                              {totalHistoryCases}
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                              Total Cases
                            </span>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 truncate">Recorded incidents</p>
                          </div>

                          {/* Convictions */}
                          <div className="rounded-md border-2 border-border/70 bg-muted/20 p-3 sm:p-3.5 space-y-1">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">
                              {totalConvictions}
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                              Convictions
                            </span>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 truncate">Guilty verdicts</p>
                          </div>

                          {/* Ongoing */}
                          <div className="rounded-md border-2 border-border/70 bg-muted/20 p-3 sm:p-3.5 space-y-1">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">
                              {totalOngoing}
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                              Ongoing
                            </span>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 truncate">Under trial / active</p>
                          </div>

                          {/* Acquitted */}
                          <div className="rounded-md border-2 border-border/70 bg-muted/20 p-3 sm:p-3.5 space-y-1">
                            <div className="text-xl sm:text-2xl font-bold font-mono text-white leading-tight">
                              {totalAcquitted}
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-wider block">
                              Acquitted
                            </span>
                            <p className="text-[9px] sm:text-[10px] text-muted-foreground/80 truncate">Charges dismissed</p>
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    {/* Summary Card Footer */}
                    <div className="mt-4 sm:mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80 truncate">
                        Verified against Tamil Nadu State Criminal Database
                      </span>
                      <span className="text-[10px] font-mono font-medium text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded-md border-2 border-border/60 shrink-0 ml-1">
                        TN-DOCKET
                      </span>
                    </div>
                  </Card>
                </div>

                {/* CARD 2: MOST RECENT CASE (6 COLS) */}
                <div className="xl:col-span-6 flex">
                  <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs w-full flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <FolderClock className="size-5 text-[#a594fd] shrink-0" />
                          <div>
                            <div className="text-sm font-semibold text-foreground">Most Recent Case</div>
                            <div className="text-[10px] sm:text-[11px] font-normal text-muted-foreground">
                              Latest incident registered on docket
                            </div>
                          </div>
                        </div>

                        <Link
                          href="/dashboard/cases"
                          className="text-xs font-semibold text-[#a594fd] hover:text-[#c0b3ff] flex items-center gap-1 transition-colors"
                        >
                          <span>View All</span>
                          <ArrowRight className="size-3" />
                        </Link>
                      </div>

                      {/* Content: Image Preview + Case Details or Empty State */}
                      <CardContent className="p-0 pt-3.5 sm:pt-5">
                        {mostRecentRecord ? (
                          <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start">
                            {/* Incident Record Badge */}
                            <div className="relative w-full h-28 sm:size-28 rounded-md overflow-hidden border-2 border-[#665AEF]/30 bg-[#665AEF]/10 flex flex-col items-center justify-center p-2 text-center shrink-0">
                              <ShieldAlert className="size-6 text-[#a594fd] mb-1" />
                              <span className="text-[10px] font-semibold text-[#a594fd] line-clamp-1">
                                {mostRecentRecord.offenceType}
                              </span>
                              <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
                                {mostRecentRecord.rowNumber ? `REC-${mostRecentRecord.rowNumber}` : "LATEST"}
                              </span>
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 space-y-2 w-full">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="font-mono text-xs font-semibold text-[#a594fd]">
                                    {mostRecentRecord.caseId}
                                  </span>
                                  <h4 className="text-sm font-semibold text-foreground leading-snug">
                                    {mostRecentRecord.description}
                                  </h4>
                                </div>
                                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-[#7E22CE]/60 bg-[#2D1B4E]/90 text-[#C084FC] whitespace-nowrap shrink-0">
                                  {mostRecentRecord.status}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="size-3 text-muted-foreground/80" />
                                  <span>{mostRecentRecord.date}</span>
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="size-3 text-muted-foreground/80" />
                                  <span>{mostRecentRecord.location}</span>
                                </span>
                              </div>

                              <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">
                                Offence: {mostRecentRecord.offenceType} • Outcome: {mostRecentRecord.outcome || "Pending Court Trial"}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-6 text-center border-2 border-dashed border-border/60 rounded-xl my-2 bg-muted/10">
                            <FolderClock className="size-7 text-muted-foreground/40 mb-2" />
                            <p className="text-xs font-semibold text-foreground">No Incident On Record</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-xs">
                              No prior arrests, convictions, or penal incidents registered on docket for this subject.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </div>

                    {/* Most Recent Case Footer */}
                    <div className="mt-4 sm:mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80 truncate">
                        Offence classification: {mostRecentRecord?.offenceType || "Robbery"}
                      </span>
                      <span className="text-[10px] font-mono text-[#a594fd] bg-[#665AEF]/10 px-1.5 py-0.5 rounded-md border-2 border-[#665AEF]/30 shrink-0 ml-1">
                        INC-REF#99201
                      </span>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 3: BIOMETRICS
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "biometrics" && (
            <div className="space-y-4 sm:space-y-6 w-full">
              {/* Backdrop for dropdowns */}
              {openBiometricActionRowId !== null && (
                <div
                  className="fixed inset-0 z-20 bg-transparent"
                  onClick={() => setOpenBiometricActionRowId(null)}
                />
              )}

              {/* TOP ROW: 2 BALANCED CARDS (FACIAL RECOGNITION + FACE MATCH RESULTS) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 w-full">
                {/* CARD 1: FACIAL RECOGNITION (5 COLS) */}
                <div className="xl:col-span-5 flex flex-col">
                  <Card className="h-full rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 sm:pb-4 border-b border-border/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-7 sm:size-8 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shrink-0">
                            <Scan className="size-3.5 sm:size-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-foreground truncate">Facial Recognition</div>
                            <div className="text-[10px] sm:text-[11px] font-normal text-muted-foreground truncate">
                              Reference image for AI face matching.
                            </div>
                          </div>
                        </div>

                        <Button
                          type="button"
                          variant="outline"
                          size="xs"
                          onClick={() => setIsBiometricLightboxOpen(true)}
                          className="h-7 px-2 sm:px-2.5 gap-1.5 text-xs font-semibold rounded-md border-2 border-border/80 bg-muted/30 hover:bg-muted/60 text-foreground cursor-pointer transition-colors shrink-0"
                        >
                          <Maximize2 className="size-3 text-[#a594fd]" />
                          <span>View Full</span>
                        </Button>
                      </div>

                      {/* Content: Image with Cyber HUD + Metadata table */}
                      <div className="pt-3.5 sm:pt-5 flex flex-col sm:flex-row gap-3.5 sm:gap-5 items-start">
                        {/* Reference Face Image with AI HUD corner brackets */}
                        <div className="relative w-full sm:w-44 h-48 sm:h-44 rounded-md overflow-hidden border-2 border-border/80 bg-black/80 shrink-0 group">
                          {mugshotDisplayUrl && !mugshotDisplayUrl.includes("fly.storage.tigris.dev//") ? (
                            <Image
                              src={mugshotDisplayUrl}
                              alt={criminal.firstName}
                              fill
                              className="object-cover"
                              sizes="200px"
                            />
                          ) : (
                            <SuspectAvatar
                              firstName={criminal.firstName}
                              lastName={criminal.lastName}
                              status={criminal.status}
                              riskLevel={criminal.riskLevel}
                              className="size-full rounded-none"
                            />
                          )}

                          {/* Cybernetic Face Detection HUD corner brackets */}
                          <div className="absolute inset-2.5 pointer-events-none">
                            <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400" />
                            <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400" />
                            <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400" />
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400" />
                          </div>

                          {/* Live Enrolled Tag */}
                          <span className="absolute bottom-2 left-2 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded bg-black/85 text-cyan-400 border border-cyan-400/50 flex items-center gap-1">
                            <span className="size-1 rounded-full bg-cyan-400 animate-pulse" />
                            <span>AI-INDEXED</span>
                          </span>
                        </div>

                        {/* Metadata Rows */}
                        <div className="flex-1 w-full space-y-2 text-xs">
                          <div className="flex items-center justify-between py-1 border-b border-border/40">
                            <span className="text-muted-foreground text-[11px] sm:text-xs">Face ID</span>
                            <span className="font-mono font-semibold text-foreground text-[11px] sm:text-xs">{criminal.criminalId}</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-border/40">
                            <span className="text-muted-foreground text-[11px] sm:text-xs">Image Source</span>
                            <span className="font-medium text-foreground text-[11px] sm:text-xs">
                              {mugshotDisplayUrl ? "Tigris Enrolled Mugshot" : "Pending Mugshot"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-border/40">
                            <span className="text-muted-foreground text-[11px] sm:text-xs">Enrolled Date</span>
                            <span className="font-mono text-muted-foreground text-[11px] sm:text-xs">
                              {criminal.biometricEnrolledAt
                                ? new Date(criminal.biometricEnrolledAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })
                                : "Not Enrolled"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-muted-foreground text-[11px] sm:text-xs">Embedding Status</span>
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold border-2",
                                criminal.biometricEnrolledAt || mugshotDisplayUrl
                                  ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-400"
                                  : "border-amber-500/50 bg-amber-500/15 text-amber-400"
                              )}
                            >
                              {criminal.biometricEnrolledAt || mugshotDisplayUrl ? "Enrolled" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Intel Footer */}
                    <div className="mt-4 sm:mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80 truncate">
                        Feature Space: MobileNetV3 / InsightFace 512D
                      </span>
                      <span className="text-[10px] font-mono text-[#a594fd] bg-[#665AEF]/10 px-1.5 py-0.5 rounded-md border-2 border-[#665AEF]/30 shrink-0 ml-1">
                        VECTOR#512D
                      </span>
                    </div>
                  </Card>
                </div>

                {/* CARD 2: FACE MATCH RESULTS (7 COLS) */}
                <div className="xl:col-span-7 flex flex-col">
                  <Card className="h-full rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3.5 sm:pb-4 border-b border-border/50">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-7 sm:size-8 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shrink-0">
                            <BarChart2 className="size-3.5 sm:size-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs sm:text-sm font-semibold text-foreground truncate">Face Match Results</div>
                            <div className="text-[10px] sm:text-[11px] font-normal text-muted-foreground truncate">
                              pgvector cosine distance comparison across central database.
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={handleScanBiometrics}
                            disabled={isScanningBiometrics}
                            title="Trigger real-time AI vector match re-scan"
                            className="h-7 px-2 sm:px-2.5 rounded-md border-2 border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-50"
                          >
                            <RefreshCw className={cn("size-3 text-[#a594fd]", isScanningBiometrics && "animate-spin")} />
                            <span>{isScanningBiometrics ? "Scanning..." : "Re-scan"}</span>
                          </button>

                          <Link
                            href="/dashboard/criminals"
                            className="text-xs font-semibold text-[#a594fd] hover:text-[#c0b3ff] flex items-center gap-1 transition-colors"
                          >
                            <span>All Matches</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* Candidate Comparison View */}
                      {matchCandidates.length === 0 ? (
                        <div className="pt-3.5 sm:pt-5 flex flex-col items-center justify-center p-6 rounded-md border-2 border-dashed border-border/70 bg-card/40 text-center">
                          <div className="flex size-10 items-center justify-center rounded-full bg-[#665AEF]/10 border border-[#665AEF]/30 text-[#a594fd] mb-3">
                            <Scan className="size-5" />
                          </div>
                          <div className="text-xs font-semibold text-foreground">
                            No Biometric Comparisons Evaluated
                          </div>
                          <div className="text-[11px] text-muted-foreground max-w-sm mt-1">
                            Run a pgvector 512D cosine distance search to compare this subject against all database suspects.
                          </div>
                          <Button
                            type="button"
                            size="xs"
                            onClick={handleScanBiometrics}
                            disabled={isScanningBiometrics}
                            className="mt-3.5 h-8 px-3 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold gap-1.5 shadow-sm shadow-[#665AEF]/20 cursor-pointer"
                          >
                            <RefreshCw className={cn("size-3.5", isScanningBiometrics && "animate-spin")} />
                            <span>{isScanningBiometrics ? "Searching pgvector..." : "Run Vector Biometric Scan"}</span>
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3.5 sm:pt-5">
                          {matchCandidates.map((cand) => (
                            <div
                              key={cand.id}
                              onClick={() => setSelectedCandidate(cand)}
                              className="group flex flex-col rounded-md overflow-hidden border-2 border-border/70 bg-[#0F172A]/80 hover:border-[#665AEF]/70 transition-all cursor-pointer shadow-xs hover:shadow-md hover:shadow-[#665AEF]/15"
                            >
                              {/* Candidate Image with Confidence Pill */}
                              <div className="relative aspect-square w-full overflow-hidden bg-black/60">
                                {cand.imageSrc ? (
                                  <Image
                                    src={cand.imageSrc}
                                    alt={cand.name}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                                    sizes="160px"
                                  />
                                ) : (
                                  <SuspectAvatar
                                    firstName={cand.name}
                                    status={cand.status as any}
                                    className="size-full rounded-none"
                                  />
                                )}

                                {/* Confidence score pill badge in bottom right */}
                                <div
                                  className={cn(
                                    "absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border-2 shadow-xs",
                                    cand.confidence >= 90
                                      ? "bg-cyan-950/90 border-cyan-400 text-cyan-300"
                                      : cand.confidence > 0
                                      ? "bg-blue-950/90 border-blue-500 text-blue-300"
                                      : "bg-slate-900/90 border-border text-muted-foreground"
                                  )}
                                >
                                  {cand.confidence > 0 ? `${cand.confidence}%` : "Catalog"}
                                </div>
                              </div>

                              {/* Candidate Name & Code */}
                              <div className="p-2 sm:p-2.5 flex flex-col gap-0.5 bg-card/90 border-t border-border/40">
                                <span
                                  className="text-xs font-semibold text-foreground truncate group-hover:text-[#a594fd] transition-colors"
                                  title={cand.name}
                                >
                                  {cand.name}
                                </span>
                                <span className="font-mono text-[10px] text-muted-foreground truncate">
                                  {cand.code}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Operational Intel Footer */}
                    <div className="mt-4 sm:mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80 truncate">
                        Real-time Cosine Similarity • pgvector HNSW
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border-2 border-emerald-500/30 px-2 py-0.5 rounded-md shrink-0 ml-1">
                        {matchCandidates.length} Matches
                      </span>
                    </div>
                  </Card>
                </div>
              </div>

              {/* ROW 2: FINGERPRINT SCAN & DNA PROFILE ENROLMENT CARDS (6 COLS + 6 COLS) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 w-full">
                {/* CARD A: FINGERPRINT ENROLMENT */}
                <Card className="rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2.5 pb-3.5 border-b border-border/50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex size-7.5 sm:size-8 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shrink-0">
                          <Fingerprint className="size-3.5 sm:size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-foreground truncate">Fingerprint Latent Registry</div>
                          <div className="text-[10px] sm:text-[11px] font-normal text-muted-foreground truncate">
                            Automated Fingerprint Identification System (AFIS)
                          </div>
                        </div>
                      </div>

                      <input
                        ref={fingerprintInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadFingerprint(file);
                        }}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        disabled={isUploadingFingerprint}
                        onClick={() => fingerprintInputRef.current?.click()}
                        className="h-7 px-2.5 gap-1.5 text-xs font-semibold rounded-md border-2 border-border/80 bg-muted/30 hover:bg-muted/60 text-foreground cursor-pointer"
                      >
                        <Upload className="size-3 text-[#a594fd]" />
                        <span>{isUploadingFingerprint ? "Uploading..." : fingerprintUrl ? "Replace Scan" : "Upload Scan"}</span>
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="pt-4 flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                      <div className="relative size-32 rounded-lg overflow-hidden border-2 border-border/80 bg-black/80 flex items-center justify-center shrink-0 group">
                        {fingerprintUrl ? (
                          <Image
                            src={fingerprintUrl}
                            alt="Fingerprint Scan"
                            fill
                            className="object-cover"
                            sizes="128px"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-center p-2 text-muted-foreground">
                            <Fingerprint className="size-10 text-muted-foreground/30 mb-1" />
                            <span className="text-[10px] font-mono">No Scan Enrolled</span>
                          </div>
                        )}
                        <span className="absolute bottom-1 right-1 text-[8px] font-mono px-1 py-0.5 rounded bg-black/85 text-emerald-400 border border-emerald-400/40">
                          500 DPI
                        </span>
                      </div>

                      <div className="flex-1 w-full space-y-2 text-xs">
                        <div className="flex items-center justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground text-[11px]">Enrolment Status</span>
                          <span className={`font-semibold text-[11px] px-2 py-0.5 rounded border ${fingerprintUrl ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" : "text-amber-400 bg-amber-500/10 border-amber-500/30"}`}>
                            {fingerprintUrl ? "AFIS Verified" : "Pending Enrolment"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground text-[11px]">Minutiae Count</span>
                          <span className="font-mono font-semibold text-foreground text-[11px]">{fingerprintUrl ? "48 Verified Points" : "—"}</span>
                        </div>
                        <div className="flex items-center justify-between py-1 border-b border-border/40">
                          <span className="text-muted-foreground text-[11px]">Scan Format</span>
                          <span className="font-mono text-muted-foreground text-[11px]">NIST WSQ / ISO 19794</span>
                        </div>
                        <div className="flex items-center justify-between py-1">
                          <span className="text-muted-foreground text-[11px]">Database Docket</span>
                          <span className="font-mono text-[#a594fd] text-[11px]">{criminal.criminalId}-FP</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="text-[10px]">CCTNS AFIS Interoperable</span>
                    <span className="text-[10px] font-mono text-emerald-400">STATUS: ACTIVE</span>
                  </div>
                </Card>

                {/* CARD B: DNA STR PROFILE */}
                <Card className="rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2.5 pb-3.5 border-b border-border/50">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex size-7.5 sm:size-8 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shrink-0">
                          <Dna className="size-3.5 sm:size-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm font-semibold text-foreground truncate">DNA Genotype Profile</div>
                          <div className="text-[10px] sm:text-[11px] font-normal text-muted-foreground truncate">
                            Combined DNA Index System (CODIS STR Loci)
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        onClick={() => setIsEditingDna(!isEditingDna)}
                        className="h-7 px-2.5 gap-1.5 text-xs font-semibold rounded-md border-2 border-border/80 bg-muted/30 hover:bg-muted/60 text-foreground cursor-pointer"
                      >
                        <Hash className="size-3 text-[#a594fd]" />
                        <span>{isEditingDna ? "Cancel" : "Update Code"}</span>
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="pt-4 space-y-3">
                      {isEditingDna ? (
                        <div className="p-3 rounded-lg border-2 border-[#665AEF]/40 bg-card/80 space-y-2">
                          <label className="text-[11px] font-semibold text-foreground">CODIS DNA Profile Identifier</label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="e.g. CODIS-TN-2026-9921"
                              value={dnaInput}
                              onChange={(e) => setDnaInput(e.target.value)}
                              className="h-8 text-xs font-mono"
                            />
                            <Button
                              size="xs"
                              disabled={!dnaInput.trim() || isSavingDna}
                              onClick={handleSaveDna}
                              className="h-8 px-3 text-xs bg-[#665AEF] hover:bg-[#5749DF] text-white"
                            >
                              {isSavingDna ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between p-3 rounded-lg border-2 border-border/60 bg-muted/20">
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-mono block">Registered Code</span>
                            <span className="text-xs font-mono font-bold text-[#a594fd]">{dnaCode}</span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            Lab Certified
                          </span>
                        </div>
                      )}

                      {/* 13 Core Loci Mini Grid */}
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono block mb-1.5">13 Core CODIS Loci Markers</span>
                        <div className="grid grid-cols-4 xs:grid-cols-6 sm:grid-cols-7 gap-1">
                          {["D3S1358", "vWA", "FGA", "D8S1179", "D21S11", "D18S51", "D5S818", "D13S317", "D7S820", "TH01", "TPOX", "CSF1PO", "AMEL"].map((locus) => (
                            <span key={locus} className="text-[9px] font-mono text-center py-1 px-1 rounded bg-muted/40 border border-border/40 text-foreground/80 truncate">
                              {locus}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="text-[10px]">Forensic Science Laboratory (FSL) Synced</span>
                    <span className="text-[10px] font-mono text-emerald-400">MATCH PROB: 1 in 10¹⁴</span>
                  </div>
                </Card>
              </div>

              {/* BOTTOM ROW: MATCH HISTORY TABLE (DESKTOP) & HIGH-SIGNAL CARDS (MOBILE) */}
              <Card className="rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs space-y-3.5 sm:space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-7.5 sm:size-8 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shrink-0">
                      <Clock className="size-3.5 sm:size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs sm:text-sm font-semibold text-foreground truncate">
                          Match History
                        </h3>
                        <span className="hidden xs:inline-flex text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50">
                          {matchHistory.length} Records
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate">
                        Recent face matching analysis performed on this individual.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/dashboard/criminals"
                    className="text-xs font-semibold text-[#a594fd] hover:text-[#c0b3ff] flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span className="hidden xs:inline">View All History</span>
                    <span className="xs:hidden">View All</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                {/* DESKTOP VIEW: 8-Column Shadcn Table (hidden on mobile) */}
                <div className="hidden md:block rounded-md border-2 border-border/70 overflow-hidden bg-card/40">
                  <div className="overflow-x-auto min-h-55 scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Table className="scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <TableHeader className="bg-muted/30">
                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableHead className="w-12 text-center text-[11px] font-semibold text-muted-foreground">#</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground min-w-42.5">Date & Time</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground text-center w-28">Queried Image</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground min-w-50">Match Result</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Confidence</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Initiated By</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Status</TableHead>
                          <TableHead className="w-12 text-center text-[11px] font-semibold text-muted-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchHistory.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={8} className="py-10 text-center">
                              <div className="flex flex-col items-center justify-center text-center">
                                <Clock className="size-6 text-muted-foreground/40 mb-2" />
                                <div className="text-xs font-semibold text-foreground">
                                  No Biometric Match History
                                </div>
                                <div className="text-[11px] text-muted-foreground max-w-sm mt-0.5">
                                  No surveillance hits, sketch correlations, or automated facial recognition audits have been recorded for this subject.
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : (
                          matchHistory.map((item, idx) => {
                            const isBottomRows = idx >= 1;
                            return (
                            <TableRow
                              key={item.id}
                              className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                            >
                              {/* # */}
                              <TableCell className="text-center font-mono text-xs text-muted-foreground/80 py-3">
                                {item.rowNumber}
                              </TableCell>

                              {/* Date & Time */}
                              <TableCell className="py-3 text-xs text-muted-foreground whitespace-nowrap font-mono">
                                {item.dateTime}
                              </TableCell>

                              {/* Queried Image Thumbnail */}
                              <TableCell className="py-3 text-center">
                                <div className="inline-block relative size-9 rounded-md overflow-hidden border-2 border-border/80 bg-black/60 align-middle">
                                  <Image
                                    src={item.queriedImageSrc}
                                    alt="Queried Face"
                                    fill
                                    className="object-cover"
                                    sizes="36px"
                                  />
                                </div>
                              </TableCell>

                              {/* Match Result */}
                              <TableCell className="py-3">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-semibold text-foreground">
                                    {item.matchName}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#a594fd] bg-[#665AEF]/15 px-1.5 py-0.5 rounded border border-[#665AEF]/30">
                                    {item.matchCode}
                                  </span>
                                </div>
                              </TableCell>

                              {/* Confidence */}
                              <TableCell className="py-3">
                                <span
                                  className={cn(
                                    "font-mono text-xs font-bold",
                                    item.confidence >= 90
                                      ? "text-cyan-400"
                                      : item.confidence >= 75
                                      ? "text-blue-400"
                                      : "text-amber-400"
                                  )}
                                >
                                  {item.confidence}%
                                </span>
                              </TableCell>

                              {/* Initiated By */}
                              <TableCell className="py-3 text-xs text-muted-foreground">
                                {item.initiatedBy}
                              </TableCell>

                              {/* Status Badge */}
                              <TableCell className="py-3">
                                {renderBiometricStatusBadge(item.status)}
                              </TableCell>

                              {/* Actions Dropdown */}
                              <TableCell className="py-3 text-center">
                                <div className="relative inline-block text-left">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenBiometricActionRowId(
                                        openBiometricActionRowId === item.id ? null : item.id
                                      );
                                    }}
                                    className="size-7 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </button>

                                  {openBiometricActionRowId === item.id && (
                                    <div
                                      className={cn(
                                        "absolute right-0 w-44 rounded-md border-2 border-border bg-card/95 backdrop-blur-md shadow-2xl p-1 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150",
                                        isBottomRows ? "bottom-full mb-1" : "top-full mt-1"
                                      )}
                                    >
                                      <Link
                                        href={`/case-details/${item.caseId || "FX-2026-184"}`}
                                        onClick={() => setOpenBiometricActionRowId(null)}
                                        className="w-full text-left text-xs px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-2 cursor-pointer"
                                      >
                                        <ExternalLink className="size-3 text-muted-foreground" />
                                        <span>View Case Dossier</span>
                                      </Link>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedCandidate({
                                            id: item.id,
                                            name: item.matchName,
                                            code: item.matchCode,
                                            confidence: item.confidence,
                                            imageSrc: item.queriedImageSrc,
                                          });
                                          setOpenBiometricActionRowId(null);
                                        }}
                                        className="w-full text-left text-xs px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-2 cursor-pointer"
                                      >
                                        <Scan className="size-3 text-muted-foreground" />
                                        <span>Compare Vectors</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(item.matchCode);
                                          toast.success(`Copied ${item.matchCode}`);
                                          setOpenBiometricActionRowId(null);
                                        }}
                                        className="w-full text-left text-xs px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-2 cursor-pointer"
                                      >
                                        <Copy className="size-3 text-muted-foreground" />
                                        <span>Copy Match ID</span>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* MOBILE CARD VIEW: Dedicated high-signal layout (< md screens) */}
                <div className="block md:hidden space-y-3">
                  {matchHistory.length === 0 ? (
                    <div className="p-6 rounded-xl border-2 border-dashed border-border/80 bg-card/50 text-center flex flex-col items-center">
                      <Clock className="size-6 text-muted-foreground/40 mb-2" />
                      <div className="text-xs font-semibold text-foreground">No Match History</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">
                        No face matching analysis on record for this individual.
                      </div>
                    </div>
                  ) : (
                    matchHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 sm:p-4 rounded-xl border-2 border-border/80 bg-card/70 hover:bg-card/90 transition-all space-y-3 shadow-xs"
                    >
                      {/* Top row: # badge, Date, Status Badge */}
                      <div className="flex items-center justify-between gap-2 border-b border-border/40 pb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-mono text-[10px] font-bold text-foreground/85 px-1.5 py-0.5 rounded-md bg-muted/70 border border-border/60 shrink-0">
                            #{item.rowNumber}
                          </span>
                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono truncate">
                            <Calendar className="size-3 shrink-0 text-muted-foreground/70" />
                            <span className="truncate">{item.dateTime}</span>
                          </div>
                        </div>
                        <div className="shrink-0">
                          {renderBiometricStatusBadge(item.status)}
                        </div>
                      </div>

                      {/* Middle row: Thumbnail + Match Info + Similarity Badge */}
                      <div className="flex items-center gap-3">
                        {/* Queried Face Thumbnail */}
                        <div className="relative size-13 sm:size-14 rounded-lg overflow-hidden border-2 border-border/80 bg-black/80 shrink-0 shadow-inner group">
                          <Image
                            src={item.queriedImageSrc}
                            alt={item.matchName}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                        </div>

                        {/* Candidate Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                              {item.matchName}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] text-[#a594fd] bg-[#665AEF]/15 px-1.5 py-0.5 rounded border border-[#665AEF]/30 font-medium">
                              {item.matchCode}
                            </span>
                            <span className="text-[11px] text-muted-foreground/50">•</span>
                            <span className="text-[11px] text-muted-foreground truncate">
                              {item.initiatedBy}
                            </span>
                          </div>
                        </div>

                        {/* Match Confidence Score - Text Color Only */}
                        <div className="shrink-0 flex items-center justify-end pl-2">
                          <span
                            className={cn(
                              "font-mono font-bold text-sm sm:text-base tracking-tight",
                              item.confidence >= 90
                                ? "text-cyan-400"
                                : item.confidence >= 75
                                ? "text-blue-400"
                                : "text-amber-400"
                            )}
                          >
                            {item.confidence}%
                          </span>
                        </div>
                      </div>

                      {/* Action row: 3 Equal-Width, Perfectly Aligned Touch Buttons */}
                      <div className="pt-2.5 border-t border-border/40 grid grid-cols-3 gap-2 text-xs">
                        <Link
                          href={`/case-details/${item.caseId || "FX-2026-184"}`}
                          className="h-8.5 px-2 rounded-lg border-2 border-border/80 hover:border-[#665AEF]/50 bg-muted/20 hover:bg-muted/40 text-[11px] font-semibold text-foreground transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <ExternalLink className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">Case File</span>
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCandidate({
                              id: item.id,
                              name: item.matchName,
                              code: item.matchCode,
                              confidence: item.confidence,
                              imageSrc: item.queriedImageSrc,
                            });
                          }}
                          className="h-8.5 px-2 rounded-lg border-2 border-[#665AEF]/40 hover:border-[#665AEF]/70 bg-[#665AEF]/15 hover:bg-[#665AEF]/25 text-[11px] font-semibold text-[#c0b3ff] transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Scan className="size-3 text-[#a594fd] shrink-0" />
                          <span className="truncate">Compare</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(item.matchCode);
                            toast.success(`Copied ${item.matchCode}`);
                          }}
                          className="h-8.5 px-2 rounded-lg border-2 border-border/80 hover:border-[#665AEF]/50 bg-muted/20 hover:bg-muted/40 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                          title={`Copy ${item.matchCode}`}
                        >
                          <Copy className="size-3 text-muted-foreground shrink-0" />
                          <span className="truncate">Copy ID</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </Card>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 4: EVIDENCE (8)
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "evidence" && (
            <div className="space-y-4 w-full">
              {/* Filter pills and action bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap sm:flex-wrap py-1 -mx-1 px-1 w-full sm:w-auto touch-pan-x">
                  {[
                    { id: "all", label: `All Evidence (${evidenceItems.length})` },
                    { id: "image", label: `Images (${evidenceItems.filter((e) => e.type === "image").length})` },
                    { id: "video", label: `Videos (${evidenceItems.filter((e) => e.type === "video").length})` },
                    { id: "scan", label: `Scans (${evidenceItems.filter((e) => e.type === "scan").length})` },
                    { id: "document", label: `Documents (${evidenceItems.filter((e) => e.type === "document").length})` },
                  ].map((f) => {
                    const isSelected = evidenceFilter === f.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        onClick={() => setEvidenceFilter(f.id)}
                        className={cn(
                          "relative shrink-0 whitespace-nowrap px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all cursor-pointer select-none",
                          isSelected
                            ? "border-[#665AEF] text-white shadow-sm shadow-[#665AEF]/20"
                            : "border-border/70 bg-card/60 text-muted-foreground hover:text-foreground hover:border-border"
                        )}
                      >
                        {isSelected && (
                          <motion.div
                            layoutId="activeEvidenceFilterPill"
                            className="absolute inset-0 rounded-[6px] bg-[#665AEF]/20 -z-10"
                            transition={{ type: "spring", stiffness: 450, damping: 32 }}
                          />
                        )}
                        <span>{f.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
                  <motion.span
                    key={evidenceFilter}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                    className="text-xs text-muted-foreground font-medium hidden md:inline whitespace-nowrap"
                  >
                    Showing{" "}
                    <strong className="text-foreground font-semibold">
                      {evidenceFilter === "all"
                        ? evidenceItems.length
                        : evidenceItems.filter((e) => e.type === evidenceFilter).length}
                    </strong>{" "}
                    items
                  </motion.span>

                  <Button
                    type="button"
                    onClick={() => setIsAttachEvidenceOpen(true)}
                    className="h-8.5 px-3.5 rounded-lg bg-[#665AEF] hover:bg-[#584be2] text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-[#665AEF]/25 cursor-pointer shrink-0"
                  >
                    <Plus className="size-3.5" />
                    <span>Attach Evidence</span>
                  </Button>
                </div>
              </div>

              {/* Animated Grid of Evidence Cards with Framer Motion layout & exit transitions */}
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {evidenceItems.filter(
                    (e) => evidenceFilter === "all" || e.type === evidenceFilter
                  ).length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-border/60 rounded-xl bg-card/40 my-4">
                      <Camera className="size-10 text-muted-foreground/40 mb-3" />
                      <h4 className="text-sm font-semibold text-foreground">No Evidence Logged</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                        No physical or digital forensic evidence has been associated with this criminal profile.
                      </p>
                      <Button
                        type="button"
                        onClick={() => setIsAttachEvidenceOpen(true)}
                        variant="outline"
                        size="sm"
                        className="mt-4 h-8 px-3 text-xs gap-1.5 border-2 border-[#665AEF]/40 text-[#a594fd] hover:bg-[#665AEF]/15 cursor-pointer"
                      >
                        <Plus className="size-3.5" />
                        <span>Upload First Item</span>
                      </Button>
                    </div>
                  ) : (
                    evidenceItems.filter(
                      (e) => evidenceFilter === "all" || e.type === evidenceFilter
                    ).map((ev) => (
                    <motion.div
                      layout
                      key={ev.id}
                      initial={{ opacity: 0, scale: 0.9, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{
                        opacity: 0,
                        scale: 0.85,
                        y: -12,
                        filter: "blur(4px)",
                        transition: { duration: 0.2 },
                      }}
                      transition={{
                        layout: { type: "spring", stiffness: 380, damping: 30 },
                        opacity: { duration: 0.24 },
                        scale: { duration: 0.22 },
                        ease: "easeOut",
                      }}
                      whileHover={{ y: -4, transition: { duration: 0.18 } }}
                      onClick={() => setSelectedEvidence(ev)}
                      className="group rounded-xl overflow-hidden border-2 border-border/80 bg-card/60 hover:border-[#665AEF]/70 transition-colors cursor-pointer shadow-xs hover:shadow-lg hover:shadow-[#665AEF]/10 flex flex-col will-change-transform"
                    >
                      {/* Thumbnail Box */}
                      <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                        <Image
                          src={ev.imageSrc}
                          alt={ev.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 280px"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-medium text-white border border-white/20">
                          {ev.type === "video" ? (
                            <>
                              <Play className="size-2.5 fill-current text-[#a594fd]" />
                              <span>Video</span>
                            </>
                          ) : (
                            <>
                              <Camera className="size-2.5 text-[#a594fd]" />
                              <span>Image</span>
                            </>
                          )}
                        </div>

                        {ev.duration && (
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/85 text-[10px] font-mono text-white border border-white/20">
                            {ev.duration}
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="p-3 sm:p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <h4
                            className="text-xs font-semibold text-foreground truncate group-hover:text-[#a594fd] transition-colors"
                            title={ev.name}
                          >
                            {ev.name}
                          </h4>
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                            <span>{ev.date}</span>
                            <span className="font-mono text-muted-foreground/80">{ev.size}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex justify-between items-center">
                          <span className="truncate">{ev.officer}</span>
                          <span className="text-[#a594fd] group-hover:underline font-semibold flex items-center gap-0.5">
                            Inspect
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 5: ACTIVITY LOG (Real-Time Forensic Audit & Surveillance Ledger)
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "activity" && (
            <CriminalActivityTab criminal={criminal} />
          )}
        </motion.div>
      </AnimatePresence>

      {/* ─────────────────────────────────────────────────────────────
          LIGHTBOX MODAL FOR EVIDENCE
          ───────────────────────────────────────────────────────────── */}
      {selectedEvidence && (
        <Modal
          isOpen={!!selectedEvidence}
          onClose={() => setSelectedEvidence(null)}
          maxWidth="max-w-2xl"
          title={
            <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
              <Camera className="size-4 text-[#a594fd]" />
              <span>Evidence Detail — {selectedEvidence.name}</span>
            </div>
          }
        >
          <div className="space-y-4">
            {selectedEvidence.type === "video" ? (
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/80 bg-black flex items-center justify-center">
                <video
                  src={selectedEvidence.imageSrc}
                  controls
                  playsInline
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/80 bg-black">
                <Image
                  src={selectedEvidence.imageSrc}
                  alt={selectedEvidence.name}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 640px"
                />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg border border-border/60 bg-muted/20 text-xs">
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">Collected On</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedEvidence.date}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">Investigating Officer</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedEvidence.officer}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">File Size</span>
                <p className="font-semibold text-foreground mt-0.5">{selectedEvidence.size}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[10px] uppercase font-semibold">SHA-256 Hash</span>
                <p className="font-mono text-muted-foreground text-[10px] truncate mt-0.5" title={selectedEvidence.sha256}>
                  {selectedEvidence.sha256}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <span className="text-[11px] text-muted-foreground">Tigris S3 Authenticated Custody Chain</span>
              <a
                href={selectedEvidence.imageSrc}
                download={selectedEvidence.name}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#665AEF] hover:bg-[#5749DF] text-white transition-colors cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>Download Forensic File</span>
              </a>
            </div>
          </div>
        </Modal>
      )}

      {/* ═══════════════════════════════════════════════════════════
          ADD CRIMINAL RECORD MODAL
          ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={isAddRecordOpen}
        onClose={() => setIsAddRecordOpen(false)}
        maxWidth="max-w-2xl"
        className="border-2 border-border/90 bg-[#0B0F17]/95 backdrop-blur-xl shadow-2xl rounded-lg"
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shadow-xs shadow-[#665AEF]/20 shrink-0">
              <FolderClock className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">Add Criminal Record</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#665AEF]/15 text-[#a594fd] border-2 border-[#665AEF]/30 uppercase tracking-wider">
                New Docket
              </span>
            </div>
          </div>
        }
        description="Register a new offence, incident dossier, or court conviction to this suspect's profile."
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground/80 self-start sm:self-auto">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="truncate">Ready to index on Tamil Nadu Central Criminal Database</span>
            </div>
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddRecordOpen(false)}
                className="h-9 px-4 text-xs font-semibold rounded-md border-2 border-border/80 bg-background/50 hover:bg-muted cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleAddCriminalRecord()}
                className="h-9 px-4 text-xs font-semibold rounded-md bg-[#665AEF] hover:bg-[#5749DF] text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#665AEF]/25 hover:shadow-[#665AEF]/40 transition-all cursor-pointer"
              >
                <Plus className="size-3.5" />
                <span>Save Record</span>
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleAddCriminalRecord} className="space-y-4 pt-1">
          {/* SECTION 1: CASE ID & INCIDENT DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Case ID */}
            <div className="space-y-1.5">
              <div className="h-6 flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Hash className="size-3 text-[#a594fd]" />
                  <span>Case ID</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNewRecordForm((prev) => ({
                      ...prev,
                      caseId: `FX-2026-${Math.floor(100 + Math.random() * 900)}`,
                    }))
                  }
                  className="h-5 text-[10px] font-mono text-[#a594fd] hover:text-white bg-[#665AEF]/15 hover:bg-[#665AEF]/30 border-2 border-[#665AEF]/30 px-1.5 rounded-md transition cursor-pointer inline-flex items-center gap-1 shrink-0 select-none"
                >
                  <Sparkles className="size-2.5" />
                  <span>Auto-ID</span>
                </button>
              </div>
              <Input
                placeholder="FX-2026-### (auto if blank)"
                value={newRecordForm.caseId}
                onChange={(e) =>
                  setNewRecordForm({ ...newRecordForm, caseId: e.target.value })
                }
                className="h-9 text-xs font-mono border-2 border-border/80 bg-background/60 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] rounded-md"
              />
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <div className="h-6 flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3 text-[#a594fd]" />
                  <span>Incident Date</span>
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setNewRecordForm((prev) => ({
                      ...prev,
                      date: "Oct 21, 2026",
                    }))
                  }
                  className="h-5 text-[10px] font-mono text-[#a594fd] hover:text-white bg-[#665AEF]/15 hover:bg-[#665AEF]/30 border-2 border-[#665AEF]/30 px-1.5 rounded-md transition cursor-pointer inline-flex items-center gap-1 shrink-0 select-none"
                >
                  <Clock className="size-2.5" />
                  <span>Today</span>
                </button>
              </div>
              <Input
                placeholder="e.g. Oct 21, 2026"
                value={newRecordForm.date}
                onChange={(e) =>
                  setNewRecordForm({ ...newRecordForm, date: e.target.value })
                }
                className="h-9 text-xs border-2 border-border/80 bg-background/60 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] rounded-md"
              />
            </div>
          </div>

          {/* SECTION 2: OFFENCE CLASSIFICATION (5 INTERACTIVE BUTTON CHIPS) */}
          <div className="space-y-1.5">
            <div className="h-6 flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ShieldAlert className="size-3 text-[#a594fd]" />
                <span>Offence Classification</span>
              </label>
              <span className="text-[10px] text-muted-foreground">Select one category</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { type: "Robbery" as const, icon: ShieldAlert, color: "border-rose-500/60 bg-rose-500/15 text-rose-400" },
                { type: "Theft" as const, icon: Fingerprint, color: "border-blue-500/60 bg-blue-500/15 text-blue-400" },
                { type: "Assault" as const, icon: Zap, color: "border-amber-500/60 bg-amber-500/15 text-amber-400" },
                { type: "Vehicle Theft" as const, icon: Car, color: "border-purple-500/60 bg-purple-500/15 text-purple-400" },
                { type: "Cyber Fraud" as const, icon: Globe, color: "border-cyan-500/60 bg-cyan-500/15 text-cyan-400" },
              ].map(({ type, icon: Icon, color }) => {
                const isSelected = newRecordForm.offenceType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewRecordForm({ ...newRecordForm, offenceType: type })}
                    className={cn(
                      "flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md text-xs font-semibold border-2 transition-all cursor-pointer select-none",
                      isSelected
                        ? cn(color, "shadow-sm")
                        : "border-border/70 bg-background/40 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <Icon className="size-3 shrink-0" />
                    <span className="truncate">{type}</span>
                    {isSelected && <Check className="size-3 shrink-0 ml-auto sm:ml-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: LOCATION & CASE STATUS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Location */}
            <div className="space-y-1.5">
              <div className="h-6 flex items-center">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <MapPin className="size-3 text-[#a594fd]" />
                  <span>Location / Jurisdiction</span>
                </label>
              </div>
              <Input
                placeholder="e.g. Chennai, TN"
                value={newRecordForm.location}
                onChange={(e) =>
                  setNewRecordForm({ ...newRecordForm, location: e.target.value })
                }
                className="h-9 text-xs border-2 border-border/80 bg-background/60 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] rounded-md"
              />
            </div>

            {/* Case Status */}
            <div className="space-y-1.5">
              <div className="h-6 flex items-center">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Activity className="size-3 text-[#a594fd]" />
                  <span>Case Status</span>
                </label>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {(["Under Investigation", "Solved", "In Court", "Closed"] as const).map((status) => {
                  const isSelected = newRecordForm.status === status;
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setNewRecordForm({ ...newRecordForm, status })}
                      className={cn(
                        "px-2 py-1.5 rounded-md text-[11px] font-semibold border-2 transition-all cursor-pointer text-center truncate",
                        isSelected
                          ? status === "Under Investigation"
                            ? "border-[#7E22CE]/70 bg-[#2D1B4E]/90 text-[#C084FC]"
                            : status === "Solved"
                            ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-400"
                            : status === "In Court"
                            ? "border-blue-500/60 bg-blue-500/15 text-blue-400"
                            : "border-border bg-muted text-foreground"
                          : "border-border/70 bg-background/40 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 4: JUDICIAL OUTCOME */}
          <div className="space-y-1.5">
            <div className="h-6 flex items-center">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Gavel className="size-3 text-[#a594fd]" />
                <span>Judicial Outcome</span>
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { val: null, label: "None / Pending", color: "border-border/80 bg-muted/60 text-muted-foreground" },
                { val: "Convicted" as const, label: "Convicted", color: "border-rose-800/60 bg-rose-950/80 text-rose-300" },
                { val: "Trial Ongoing" as const, label: "Trial Ongoing", color: "border-amber-800/60 bg-amber-950/80 text-amber-300" },
                { val: "Acquitted" as const, label: "Acquitted", color: "border-emerald-800/60 bg-emerald-950/80 text-emerald-300" },
              ].map(({ val, label, color }) => {
                const isSelected = newRecordForm.outcome === val;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setNewRecordForm({ ...newRecordForm, outcome: val })}
                    className={cn(
                      "px-2.5 py-1.5 rounded-md text-xs font-semibold border-2 transition-all cursor-pointer text-center truncate",
                      isSelected
                        ? color
                        : "border-border/70 bg-background/40 hover:bg-muted/40 text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 4B: COURT & SENTENCE DETAILS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Presiding Court Name */}
            <div className="space-y-1.5">
              <div className="h-6 flex items-center">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Scale className="size-3 text-[#a594fd]" />
                  <span>Presiding Court / Jurisdiction</span>
                </label>
              </div>
              <Input
                placeholder="e.g. Principal District & Sessions Court, Chennai"
                value={newRecordForm.courtName}
                onChange={(e) =>
                  setNewRecordForm({ ...newRecordForm, courtName: e.target.value })
                }
                className="h-9 text-xs border-2 border-border/80 bg-background/60 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] rounded-md"
              />
            </div>

            {/* Sentence & Penalty Details */}
            <div className="space-y-1.5">
              <div className="h-6 flex items-center">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Gavel className="size-3 text-[#a594fd]" />
                  <span>Sentence / Penalty Details</span>
                </label>
              </div>
              <Input
                placeholder="e.g. 3 Years Rigorous Imprisonment + ₹25,000 fine"
                value={newRecordForm.sentenceDetails}
                onChange={(e) =>
                  setNewRecordForm({ ...newRecordForm, sentenceDetails: e.target.value })
                }
                className="h-9 text-xs border-2 border-border/80 bg-background/60 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] rounded-md"
              />
            </div>
          </div>

          {/* SECTION 5: DESCRIPTION */}
          <div className="space-y-1.5">
            <div className="h-6 flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="size-3 text-[#a594fd]" />
                <span>Incident Description & Narrative</span>
              </label>
              <span className="text-[10px] text-muted-foreground font-mono">
                {newRecordForm.description.length} chars
              </span>
            </div>
            <textarea
              rows={3}
              placeholder="Provide a detailed factual summary of charges, modus operandi, physical evidence, or incident details..."
              value={newRecordForm.description}
              onChange={(e) =>
                setNewRecordForm({ ...newRecordForm, description: e.target.value })
              }
              className="w-full rounded-md border-2 border-border/80 bg-background/60 p-3 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-[#665AEF] focus:ring-1 focus:ring-[#665AEF] resize-none leading-relaxed"
            />
          </div>

          {/* SECURITY FOOTNOTE BANNER */}
          <div className="p-2.5 rounded-md border-2 border-border/60 bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Lock className="size-3.5 text-[#a594fd] shrink-0" />
              <span className="text-[11px]">
                Cryptographically hashed and indexed in State Criminal Dossier.
              </span>
            </div>
            <span className="text-[10px] font-mono font-medium text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded border border-border/40">
              TN-DOCKET
            </span>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════
          MODAL 1B: JUDICIAL RECORD INSPECTOR MODAL
          ═══════════════════════════════════════════════════════════ */}
      <Modal
        isOpen={selectedJudicialRecord !== null}
        onClose={() => setSelectedJudicialRecord(null)}
        maxWidth="max-w-2xl"
        className="border-2 border-border/90 bg-[#0B0F17]/95 backdrop-blur-xl shadow-2xl rounded-lg"
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shadow-xs shrink-0">
              <Gavel className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">Judicial Record Dossier</span>
              <span className="font-mono text-xs font-semibold text-[#a594fd] px-2 py-0.5 rounded-md bg-[#665AEF]/15 border border-[#665AEF]/30">
                {selectedJudicialRecord?.caseId}
              </span>
            </div>
          </div>
        }
        description="Official judicial court record, charges, presiding bench, and final conviction disposition."
        footer={
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 w-full">
            <Link
              href={`/case-details/${selectedJudicialRecord?.caseId}`}
              className="text-xs font-semibold text-[#a594fd] hover:text-[#c0b3ff] flex items-center gap-1.5"
            >
              <span>Open Linked Case File</span>
              <ExternalLink className="size-3" />
            </Link>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}${window.location.pathname}?tab=criminal-history&record=${selectedJudicialRecord?.caseId}`
                  );
                  toast.success("Record permalink copied to clipboard");
                }}
                className="h-8 px-3 text-xs font-semibold rounded-md border-2 border-border/80 bg-background/50 hover:bg-muted cursor-pointer"
              >
                <Copy className="size-3 text-muted-foreground mr-1" />
                <span>Copy Permalink</span>
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setSelectedJudicialRecord(null)}
                className="h-8 px-4 text-xs font-semibold rounded-md bg-[#665AEF] hover:bg-[#5749DF] text-white cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        }
      >
        {selectedJudicialRecord && (
          <div className="space-y-4 pt-1 text-xs">
            {/* Top Grid: Case Number, Offence, Status, Outcome */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg border-2 border-border/70 bg-card/60">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Docket Number</span>
                <p className="font-mono font-bold text-[#a594fd] text-xs mt-0.5">{selectedJudicialRecord.caseId}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Offence Type</span>
                <div className="mt-0.5">{renderOffenceBadge(selectedJudicialRecord.offenceType as any)}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Status</span>
                <div className="mt-0.5">{renderHistoryStatusBadge(selectedJudicialRecord.status as any)}</div>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Disposition</span>
                <div className="mt-0.5">{renderOutcomeBadge(selectedJudicialRecord.outcome as any)}</div>
              </div>
            </div>

            {/* Middle Grid: Court Name, Sentence, Incident Date, Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  <Scale className="size-3 text-[#a594fd]" />
                  <span>Presiding Court & Jurisdiction</span>
                </span>
                <p className="font-medium text-foreground text-xs mt-1">
                  {selectedJudicialRecord.courtName || "Principal District & Sessions Court, Chennai"}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  <Gavel className="size-3 text-[#a594fd]" />
                  <span>Sentencing & Penalty</span>
                </span>
                <p className="font-medium text-foreground text-xs mt-1">
                  {selectedJudicialRecord.sentenceDetails ||
                    (selectedJudicialRecord.outcome === "Convicted"
                      ? "Sentenced under provisions of Indian Penal Code"
                      : "Pending final judicial pronouncement")}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  <Calendar className="size-3 text-[#a594fd]" />
                  <span>Incident Date</span>
                </span>
                <p className="font-medium text-foreground text-xs mt-1">{selectedJudicialRecord.date}</p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
                  <MapPin className="size-3 text-[#a594fd]" />
                  <span>Crime Scene Location</span>
                </span>
                <p className="font-medium text-foreground text-xs mt-1">{selectedJudicialRecord.location}</p>
              </div>
            </div>

            {/* Incident Narrative */}
            <div className="space-y-1.5 p-3 rounded-lg border border-border/60 bg-muted/10">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
                Official Incident Summary & Judicial Narrative
              </span>
              <p className="text-foreground/90 text-xs leading-relaxed whitespace-pre-wrap">
                {selectedJudicialRecord.description}
              </p>
            </div>

            {/* Cryptographic Footnote */}
            <div className="p-2.5 rounded-md border border-border/40 bg-muted/20 flex items-center justify-between text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Lock className="size-3.5 text-[#a594fd] shrink-0" />
                <span>Indexed in Tamil Nadu State Judicial Police Repository.</span>
              </div>
              <span className="font-mono text-[10px] text-[#a594fd] bg-muted/40 px-1.5 py-0.5 rounded border border-border/40">
                VERIFIED-RECORD
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 2: BIOMETRIC FULL-IMAGE INSPECTOR LIGHTBOX
          ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isBiometricLightboxOpen}
        onClose={() => setIsBiometricLightboxOpen(false)}
        maxWidth="max-w-xl"
        className="border-2 border-border/90 bg-[#0B0F17]/95 backdrop-blur-xl shadow-2xl rounded-lg"
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shadow-xs shadow-[#665AEF]/20 shrink-0">
              <Scan className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">Biometric Reference Crop</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#665AEF]/15 text-[#a594fd] border-2 border-[#665AEF]/30 uppercase tracking-wider">
                FACE-{(criminal.criminalId || criminal.id).slice(-4).toUpperCase()}
              </span>
            </div>
          </div>
        }
        description="High-resolution enrolled mugshot frame with active 512D biometric vector signature."
        footer={
          <div className="flex items-center justify-between w-full">
            <span className="text-[11px] text-muted-foreground/80 font-mono">
              ArcFace • 68 Facial Landmarks Extracted
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBiometricLightboxOpen(false)}
              className="h-8 px-4 text-xs font-semibold rounded-md border-2 border-border/80 bg-background/50 hover:bg-muted cursor-pointer"
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <div className="relative aspect-square w-full rounded-md overflow-hidden border-2 border-border/80 bg-black">
            {mugshotDisplayUrl && !mugshotDisplayUrl.includes("fly.storage.tigris.dev//") ? (
              <Image
                src={mugshotDisplayUrl}
                alt="High-resolution reference face"
                fill
                className="object-cover"
                sizes="500px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/40">
                <SuspectAvatar
                  name={`${criminal.firstName} ${criminal.lastName}`}
                  status={criminal.status}
                  riskLevel={criminal.riskLevel}
                  size="fill"
                />
              </div>
            )}
            {/* Cyber HUD targeting reticle */}
            <div className="absolute inset-4 pointer-events-none">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
              <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-400/20" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-400/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 rounded-md border-2 border-border/70 bg-muted/20">
              <span className="text-[10px] text-muted-foreground uppercase font-medium block">Resolution</span>
              <span className="font-mono font-semibold text-foreground">
                {mugshotDisplayUrl ? "512 × 512 px (ArcFace)" : "N/A (Avatar Reference)"}
              </span>
            </div>
            <div className="p-2.5 rounded-md border-2 border-border/70 bg-muted/20">
              <span className="text-[10px] text-muted-foreground uppercase font-medium block">Enrollment Date</span>
              <span className="font-mono font-semibold text-foreground">
                {(criminal as any).biometricEnrolledAt
                  ? new Date((criminal as any).biometricEnrolledAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : criminal.createdAt
                  ? new Date(criminal.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })
                  : "Not Enrolled"}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 3: CANDIDATE VECTOR COMPARISON MODAL
          ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={selectedCandidate !== null}
        onClose={() => setSelectedCandidate(null)}
        maxWidth="max-w-lg"
        className="border-2 border-border/90 bg-[#0B0F17]/95 backdrop-blur-xl shadow-2xl rounded-lg"
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shadow-xs shadow-[#665AEF]/20 shrink-0">
              <BarChart2 className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">Candidate Comparison</span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-cyan-950/90 text-cyan-300 border-2 border-cyan-400 uppercase tracking-wider">
                {selectedCandidate?.confidence}% MATCH
              </span>
            </div>
          </div>
        }
        description="Side-by-side vector landmark similarity comparison against reference mugshot."
        footer={
          <div className="flex items-center justify-between w-full">
            <Link
              href={`/dashboard/criminals/${selectedCandidate?.code}`}
              onClick={() => setSelectedCandidate(null)}
              className="text-xs font-semibold text-[#a594fd] hover:underline flex items-center gap-1"
            >
              <span>Open Suspect Profile</span>
              <ExternalLink className="size-3" />
            </Link>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedCandidate(null)}
              className="h-8 px-4 text-xs font-semibold rounded-md border-2 border-border/80 bg-background/50 hover:bg-muted cursor-pointer"
            >
              Close
            </Button>
          </div>
        }
      >
        {selectedCandidate && (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3.5">
              {/* Reference */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                  Reference Mugshot
                </span>
                <div className="relative aspect-square rounded-md overflow-hidden border-2 border-border/80 bg-black">
                  {mugshotDisplayUrl && !mugshotDisplayUrl.includes("fly.storage.tigris.dev//") ? (
                    <Image
                      src={mugshotDisplayUrl}
                      alt="Reference"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-black/40">
                      <SuspectAvatar
                        name={`${criminal.firstName} ${criminal.lastName}`}
                        status={criminal.status}
                        riskLevel={criminal.riskLevel}
                        size="fill"
                      />
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/80 text-foreground border border-border">
                    {criminal.firstName} {criminal.lastName}
                  </span>
                </div>
              </div>

              {/* Matched Candidate */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#a594fd] uppercase tracking-wider block">
                  Candidate Match
                </span>
                <div className="relative aspect-square rounded-md overflow-hidden border-2 border-[#665AEF]/60 bg-black">
                  {selectedCandidate.imageSrc ? (
                    <Image
                      src={selectedCandidate.imageSrc}
                      alt={selectedCandidate.name}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  ) : (
                    <SuspectAvatar
                      name={selectedCandidate.name}
                      status={selectedCandidate.status}
                      size="fill"
                    />
                  )}
                  <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-black/85 text-cyan-300 border border-cyan-400/60">
                    {selectedCandidate.name}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-md border-2 border-border/70 bg-muted/20 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cosine Similarity Score:</span>
                <span className="font-mono font-bold text-white text-sm">{selectedCandidate.confidence}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Database Docket Code:</span>
                <span className="font-mono font-semibold text-[#a594fd]">{selectedCandidate.code}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Verification Model:</span>
                <span className="font-mono text-muted-foreground">MobileNetV3 (512D)</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 4: ATTACH FORENSIC EVIDENCE MODAL
          ───────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isAttachEvidenceOpen}
        onClose={() => {
          if (!isUploadingEvidence) {
            setIsAttachEvidenceOpen(false);
            setEvidenceFile(null);
            setEvidenceTitle("");
          }
        }}
        maxWidth="max-w-lg"
        className="border-2 border-border/90 bg-[#0B0F17]/95 backdrop-blur-xl shadow-2xl rounded-lg"
        title={
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shadow-xs shadow-[#665AEF]/20 shrink-0">
              <Upload className="size-5" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">Attach Forensic Evidence</span>
            </div>
          </div>
        }
        description={`Securely upload physical or digital forensic evidence for ${criminal.firstName} ${criminal.lastName} (${criminal.criminalId}).`}
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUploadingEvidence}
              onClick={() => {
                setIsAttachEvidenceOpen(false);
                setEvidenceFile(null);
                setEvidenceTitle("");
              }}
              className="h-8.5 px-3.5 text-xs font-semibold rounded-lg border-2 border-border/80 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isUploadingEvidence || !evidenceFile}
              onClick={handleUploadEvidence}
              className="h-8.5 px-4 text-xs font-semibold rounded-lg bg-[#665AEF] hover:bg-[#584be2] text-white flex items-center gap-1.5 shadow-md shadow-[#665AEF]/25 cursor-pointer disabled:opacity-50"
            >
              {isUploadingEvidence ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Uploading to Tigris...</span>
                </>
              ) : (
                <>
                  <Upload className="size-3.5" />
                  <span>Upload & Verify SHA-256</span>
                </>
              )}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleUploadEvidence} className="space-y-4 pt-2">
          {/* File Drag / Select Box */}
          <div
            onClick={() => evidenceFileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all",
              evidenceFile
                ? "border-[#665AEF] bg-[#665AEF]/10"
                : "border-border/80 hover:border-[#665AEF]/60 bg-muted/20 hover:bg-muted/30"
            )}
          >
            <input
              ref={evidenceFileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setEvidenceFile(e.target.files[0]);
                  if (!evidenceTitle) {
                    setEvidenceTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                  }
                }
              }}
            />
            {evidenceFile ? (
              <div className="flex flex-col items-center text-center">
                <div className="size-10 rounded-full bg-[#665AEF]/20 flex items-center justify-center text-[#a594fd] mb-1">
                  <CheckCircle2 className="size-5" />
                </div>
                <span className="text-xs font-semibold text-foreground max-w-65 truncate">
                  {evidenceFile.name}
                </span>
                <span className="text-[11px] font-mono text-muted-foreground">
                  {(evidenceFile.size / 1024).toFixed(1)} KB • {evidenceFile.type || "binary"}
                </span>
                <span className="text-[10px] text-[#a594fd] mt-1 underline">Click to change file</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center">
                <div className="size-10 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground mb-1">
                  <FileUp className="size-5" />
                </div>
                <span className="text-xs font-semibold text-foreground">
                  Choose a file or drag & drop here
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Images, CCTV clips, ballistic reports, or scans (up to 50MB)
                </span>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Evidence Title / Description</label>
            <Input
              value={evidenceTitle}
              onChange={(e) => setEvidenceTitle(e.target.value)}
              placeholder="e.g. 9mm casing recovered from perimeter"
              className="h-9 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Category</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-full justify-between rounded-md border-2 border-border/80 bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:border-[#665AEF] cursor-pointer"
                    />
                  }
                >
                  <span className="truncate">
                    {evidenceCategory === "IMAGE" && "Image / Photograph"}
                    {evidenceCategory === "VIDEO" && "Surveillance Footage"}
                    {evidenceCategory === "FORENSIC_REPORT" && "Forensic Report"}
                    {evidenceCategory === "DOCUMENT" && "Judicial Document"}
                    {evidenceCategory === "OTHER" && "Physical Artifact"}
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
                    { val: "IMAGE", label: "Image / Photograph" },
                    { val: "VIDEO", label: "Surveillance Footage" },
                    { val: "FORENSIC_REPORT", label: "Forensic Report" },
                    { val: "DOCUMENT", label: "Judicial Document" },
                    { val: "OTHER", label: "Physical Artifact" },
                  ].map((cat) => (
                    <DropdownMenuItem
                      key={cat.val}
                      onClick={() => setEvidenceCategory(cat.val)}
                      className="cursor-pointer px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted font-medium text-foreground flex items-center justify-between"
                    >
                      <span>{cat.label}</span>
                      {evidenceCategory === cat.val && <Check className="size-3.5 text-[#665AEF]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">Source</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className="h-9 w-full justify-between rounded-md border-2 border-border/80 bg-background px-2.5 text-xs font-medium text-foreground outline-none focus:border-[#665AEF] cursor-pointer"
                    />
                  }
                >
                  <span className="truncate">
                    {evidenceSource === "INVESTIGATOR" && "Lead Investigator"}
                    {evidenceSource === "FORENSIC_LAB" && "Forensics Lab"}
                    {evidenceSource === "SURVEILLANCE" && "CCTV / Camera"}
                    {evidenceSource === "PUBLIC_SUBMISSION" && "Public Tip / Informant"}
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
                    { val: "INVESTIGATOR", label: "Lead Investigator" },
                    { val: "FORENSIC_LAB", label: "Forensics Lab" },
                    { val: "SURVEILLANCE", label: "CCTV / Camera" },
                    { val: "PUBLIC_SUBMISSION", label: "Public Tip / Informant" },
                  ].map((src) => (
                    <DropdownMenuItem
                      key={src.val}
                      onClick={() => setEvidenceSource(src.val)}
                      className="cursor-pointer px-2.5 py-1.5 text-xs rounded-lg hover:bg-muted font-medium text-foreground flex items-center justify-between"
                    >
                      <span>{src.label}</span>
                      {evidenceSource === src.val && <Check className="size-3.5 text-[#665AEF]" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </form>
      </Modal>

      {/* ─────────────────────────────────────────────────────────────
          MODAL 5: LINK CRIMINAL TO CASE MODAL (THEMED PROFESSIONAL DIALOG)
          ───────────────────────────────────────────────────────────── */}
      <LinkCriminalCaseDialog
        isOpen={isLinkCaseOpen}
        onClose={() => setIsLinkCaseOpen(false)}
        criminal={criminal}
        onSuccess={() => {
          setIsLinkCaseOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
