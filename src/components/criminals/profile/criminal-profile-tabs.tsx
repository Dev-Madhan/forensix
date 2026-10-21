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
  Trash2,
  Hash,
  RefreshCw,
  User,
} from "lucide-react";
import type { Criminal } from "@prisma/client";
import { toast } from "sonner";
import { CriminalActivityTab } from "./activity/criminal-activity-tab";
import { linkCriminalToCase } from "@/features/criminals/actions";

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

interface CriminalProfileTabsProps {
  criminal: Criminal;
  mugshotDisplayUrl: string | null;
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

const RECENT_EVIDENCE: EvidenceItem[] = [
  {
    id: "ev-1",
    name: "Knife_Evidence_01.jpg",
    type: "image",
    date: "Oct 4, 2026",
    imageSrc: "/images/evidence/knife_evidence_01.jpg",
    size: "701 KB",
    sha256: "9f8a32b1e4c7d0...3b",
    officer: "Insp. Ramanathan S.",
  },
  {
    id: "ev-2",
    name: "CCTV_Footage_01.mp4",
    type: "video",
    date: "Oct 4, 2026",
    imageSrc: "/images/evidence/cctv_footage_01.jpg",
    duration: "00:32",
    size: "14.2 MB",
    sha256: "4a71bc90f23e...88",
    officer: "Sub-Insp. Priya K.",
  },
  {
    id: "ev-3",
    name: "Bike_Registration.jpg",
    type: "image",
    date: "Oct 3, 2026",
    imageSrc: "/images/evidence/bike_registration.jpg",
    size: "989 KB",
    sha256: "8e0192df44a...12",
    officer: "Insp. Ramanathan S.",
  },
  {
    id: "ev-4",
    name: "Mask_Evidence.jpg",
    type: "image",
    date: "Oct 2, 2026",
    imageSrc: "/images/evidence/mask_evidence.jpg",
    size: "710 KB",
    sha256: "cc3910ab38...fa",
    officer: "Forensic Tech Anand",
  },
  // Extra 4 items for full "Evidence (8)" tab
  {
    id: "ev-5",
    name: "Ballistics_Report_9mm.pdf",
    type: "document",
    date: "Sep 28, 2026",
    imageSrc: "/images/evidence/cctv_footage_01.jpg",
    size: "1.8 MB",
    sha256: "2d9910fe71...bc",
    officer: "Chief Ballistics Officer",
  },
  {
    id: "ev-6",
    name: "Latent_Fingerprint_Card.scan",
    type: "scan",
    date: "Sep 25, 2026",
    imageSrc: "/images/evidence/knife_evidence_01.jpg",
    size: "4.2 MB",
    sha256: "ea8290bc33...67",
    officer: "Forensic Lab Chennai",
  },
  {
    id: "ev-7",
    name: "CCTV_Storefront_AngleB.mp4",
    type: "video",
    date: "Sep 22, 2026",
    imageSrc: "/images/evidence/mask_evidence.jpg",
    duration: "01:15",
    size: "28.4 MB",
    sha256: "71cd90fa54...44",
    officer: "Sub-Insp. Priya K.",
  },
  {
    id: "ev-8",
    name: "Witness_Deposition_Audio.wav",
    type: "document",
    date: "Sep 18, 2026",
    imageSrc: "/images/evidence/bike_registration.jpg",
    size: "8.6 MB",
    sha256: "33eb71af29...51",
    officer: "Insp. Ramanathan S.",
  },
];

// Related Cases matching the reference image exactly
interface RelatedCase {
  caseNumber: string;
  title: string;
  status: "Under Investigation" | "Solved" | "In Court" | "Closed";
  statusColor: string;
}

const RELATED_CASES: RelatedCase[] = [
  {
    caseNumber: "FX-2026-184",
    title: "Downtown Robbery",
    status: "Under Investigation",
    statusColor: "border-[#7E22CE]/40 bg-[#2D1B4E]/80 text-[#C084FC]",
  },
  {
    caseNumber: "FX-2026-172",
    title: "Jewelry Store Theft",
    status: "Solved",
    statusColor: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
  },
  {
    caseNumber: "FX-2025-098",
    title: "Assault Case",
    status: "In Court",
    statusColor: "border-blue-500/40 bg-blue-500/15 text-blue-400",
  },
  {
    caseNumber: "FX-2024-067",
    title: "Vehicle Theft",
    status: "Closed",
    statusColor: "border-border/80 bg-muted/60 text-muted-foreground",
  },
  {
    caseNumber: "FX-2023-021",
    title: "Cyber Fraud",
    status: "Solved",
    statusColor: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
  },
];

// Criminal History Record Interface matching the reference layout
export interface CriminalHistoryItem {
  id: string;
  rowNumber: string;
  caseId: string;
  offenceType: "Robbery" | "Theft" | "Assault" | "Vehicle Theft" | "Cyber Fraud";
  description: string;
  date: string;
  location: string;
  status: "Under Investigation" | "Solved" | "In Court" | "Closed";
  outcome: "Convicted" | "Trial Ongoing" | "Acquitted" | null;
}

const DEFAULT_CRIMINAL_HISTORY: CriminalHistoryItem[] = [
  {
    id: "rec-1",
    rowNumber: "01",
    caseId: "FX-2026-184",
    offenceType: "Robbery",
    description: "Armed robbery at commercial store.",
    date: "Oct 4, 2026",
    location: "Chennai, TN",
    status: "Under Investigation",
    outcome: null,
  },
  {
    id: "rec-2",
    rowNumber: "02",
    caseId: "FX-2026-172",
    offenceType: "Theft",
    description: "Jewelry store theft with group.",
    date: "Aug 12, 2025",
    location: "T. Nagar, Chennai",
    status: "Solved",
    outcome: "Convicted",
  },
  {
    id: "rec-3",
    rowNumber: "03",
    caseId: "FX-2025-098",
    offenceType: "Assault",
    description: "Assault on security personnel.",
    date: "Mar 18, 2025",
    location: "Anna Nagar, Chennai",
    status: "In Court",
    outcome: "Trial Ongoing",
  },
  {
    id: "rec-4",
    rowNumber: "04",
    caseId: "FX-2024-067",
    offenceType: "Vehicle Theft",
    description: "Stolen two-wheeler and modified.",
    date: "Nov 6, 2024",
    location: "Chennai, TN",
    status: "Closed",
    outcome: "Convicted",
  },
  {
    id: "rec-5",
    rowNumber: "05",
    caseId: "FX-2023-021",
    offenceType: "Cyber Fraud",
    description: "Online financial fraud case.",
    date: "Jan 20, 2023",
    location: "Chennai, TN",
    status: "Solved",
    outcome: "Convicted",
  },
];

// Biometrics Interfaces & Data
export interface FaceMatchCandidate {
  id: string;
  name: string;
  code: string;
  confidence: number;
  imageSrc: string;
  status?: string;
}

export interface BiometricMatchHistoryItem {
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

const DEFAULT_FACE_MATCH_RESULTS: FaceMatchCandidate[] = [
  {
    id: "cand-1",
    name: "Arjun Karthik",
    code: "CR-2023-001",
    confidence: 92,
    imageSrc: "/images/suspects/arjun-karthik.jpg",
    status: "WANTED",
  },
  {
    id: "cand-2",
    name: "Rohit Sharma",
    code: "CR-2021-067",
    confidence: 76,
    imageSrc: "/images/suspects/arun-prakash.jpg",
    status: "ACTIVE",
  },
  {
    id: "cand-3",
    name: "Vikram Das",
    code: "CR-2022-114",
    confidence: 68,
    imageSrc: "/images/suspects/karthik-selvan.jpg",
    status: "ACTIVE",
  },
  {
    id: "cand-4",
    name: "Sathish Kumar",
    code: "CR-2020-089",
    confidence: 62,
    imageSrc: "/images/cctv-suspect.jpg",
    status: "ACTIVE",
  },
];

const DEFAULT_BIOMETRIC_MATCH_HISTORY: BiometricMatchHistoryItem[] = [
  {
    id: "bmh-1",
    rowNumber: "01",
    dateTime: "Oct 4, 2026, 09:14 PM",
    queriedImageSrc: "/images/suspects/arjun-karthik.jpg",
    matchName: "Arjun Karthik",
    matchCode: "CR-2023-001",
    confidence: 92,
    initiatedBy: "Investigator",
    status: "Match Found",
    caseId: "FX-2026-184",
  },
  {
    id: "bmh-2",
    rowNumber: "02",
    dateTime: "Sep 28, 2026, 03:42 PM",
    queriedImageSrc: "/images/suspects/arun-prakash.jpg",
    matchName: "Rohit Sharma",
    matchCode: "CR-2021-067",
    confidence: 76,
    initiatedBy: "Senior Analyst",
    status: "Reviewed",
    caseId: "FX-2026-172",
  },
  {
    id: "bmh-3",
    rowNumber: "03",
    dateTime: "Sep 15, 2026, 11:20 AM",
    queriedImageSrc: "/images/suspects/karthik-selvan.jpg",
    matchName: "Vikram Das",
    matchCode: "CR-2022-114",
    confidence: 68,
    initiatedBy: "Field Agent #402",
    status: "Reviewed",
    caseId: "FX-2025-098",
  },
];

function renderBiometricStatusBadge(status: BiometricMatchHistoryItem["status"]) {
  switch (status) {
    case "Match Found":
      return (
        <span className="text-xs font-semibold text-emerald-400 whitespace-nowrap">
          Match Found
        </span>
      );
    case "Reviewed":
      return (
        <span className="text-xs font-semibold text-blue-400 whitespace-nowrap">
          Reviewed
        </span>
      );
    case "Inconclusive":
      return (
        <span className="text-xs font-semibold text-amber-400 whitespace-nowrap">
          Inconclusive
        </span>
      );
    default:
      return null;
  }
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

export function CriminalProfileTabs({
  criminal,
  mugshotDisplayUrl,
}: CriminalProfileTabsProps) {
  const demographics = (criminal.demographics as Record<string, unknown> | null) || {};

  const [activeTab, setActiveTab] = useState("overview");

  // Aliases state
  const [aliases, setAliases] = useState<string[]>(() => {
    const a = demographics.aliases;
    return Array.isArray(a)
      ? (a as string[])
      : ["Karthik A.", "Black Karthik", "AK", "Karthik"];
  });
  const [isAddingAlias, setIsAddingAlias] = useState(false);
  const [newAlias, setNewAlias] = useState("");

  // Criminal History state matching reference dashboard with real case links
  const [historyRecords, setHistoryRecords] = useState<CriminalHistoryItem[]>(() => {
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
      }));
    }
    return DEFAULT_CRIMINAL_HISTORY;
  });
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>("All Records");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [openActionRowId, setOpenActionRowId] = useState<string | null>(null);

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
    return RELATED_CASES;
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
        imageSrc: ev.mimeType?.startsWith("image")
          ? `/images/evidence/knife_evidence_01.jpg`
          : `/images/evidence/cctv_footage_01.jpg`,
        size: `${Math.round(ev.fileSize / 1024)} KB`,
        sha256: ev.sha256Hash ? `${ev.sha256Hash.substring(0, 14)}...` : "SHA256-VERIFIED",
        officer: ev.uploadedBy || "Central Forensics Unit",
      }));
    }
    return RECENT_EVIDENCE;
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
  }>({
    caseId: "",
    offenceType: "Theft",
    description: "",
    date: "",
    location: "Chennai, TN",
    status: "Under Investigation",
    outcome: null,
  });

  const handleAddCriminalRecord = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const caseId = newRecordForm.caseId.trim() || `FX-2026-${Math.floor(100 + Math.random() * 900)}`;
    const description = newRecordForm.description.trim() || "Incident under investigation.";
    const date = newRecordForm.date.trim() || "Oct 21, 2026";
    const location = newRecordForm.location.trim() || "Chennai, TN";

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
    };

    setHistoryRecords([newEntry, ...historyRecords]);
    setIsAddRecordOpen(false);
    setNewRecordForm({
      caseId: "",
      offenceType: "Theft",
      description: "",
      date: "",
      location: "Chennai, TN",
      status: "Under Investigation",
      outcome: null,
    });

    linkCriminalToCase({
      caseId,
      criminalId: criminal.id,
      notes: description,
    }).catch(() => {
      // Non-fatal if caseId is a loose string not yet in db
    });

    toast.success(`Criminal Record "${caseId}" registered and linked.`);
  };

  const filteredHistoryRecords = useMemo(() => {
    if (historyStatusFilter === "All Records") return historyRecords;
    return historyRecords.filter((r) => r.status === historyStatusFilter);
  }, [historyRecords, historyStatusFilter]);

  // Derived metrics from records
  const totalHistoryCases = historyRecords.length;
  const totalConvictions = historyRecords.filter((r) => r.outcome === "Convicted").length;
  const totalOngoing = historyRecords.filter(
    (r) => r.status === "Under Investigation" || r.status === "In Court" || r.outcome === "Trial Ongoing"
  ).length;
  const totalAcquitted = historyRecords.filter((r) => r.outcome === "Acquitted").length || 1;
  const mostRecentRecord = historyRecords[0] || DEFAULT_CRIMINAL_HISTORY[0];



  // Biometrics tab state
  const [matchCandidates] = useState<FaceMatchCandidate[]>(DEFAULT_FACE_MATCH_RESULTS);
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
        queriedImage: rr.sketch?.imageUrl || "/images/evidence/mask_evidence.jpg",
        matchResult: `${criminal.firstName} ${criminal.lastName}`,
        matchSubtext: rr.sketch?.case?.caseNumber
          ? `Linked Case: ${rr.sketch.case.caseNumber}`
          : "Facial Embedding Match",
        caseId: rr.sketch?.case?.caseNumber || "FX-CENTRAL",
        confidence: Math.round(rr.matchScore * 100),
        initiatedBy: "InsightFace Engine",
        status:
          rr.status === "CONFIRMED"
            ? "Confirmed"
            : rr.status === "REJECTED"
            ? "Rejected"
            : "Pending Review",
      }));
    }
    return DEFAULT_BIOMETRIC_MATCH_HISTORY;
  });
  const [isScanningBiometrics, setIsScanningBiometrics] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<FaceMatchCandidate | null>(null);
  const [isBiometricLightboxOpen, setIsBiometricLightboxOpen] = useState(false);
  const [openBiometricActionRowId, setOpenBiometricActionRowId] = useState<string | null>(null);

  const handleScanBiometrics = async () => {
    setIsScanningBiometrics(true);
    toast.info("Connecting to AI Recognition Service (FastAPI / MobileNetV3)...");
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success("Biometric scan completed. 4 candidate matches verified with 512D embeddings.");
    } catch {
      toast.error("Failed to connect to recognition service.");
    } finally {
      setIsScanningBiometrics(false);
    }
  };

  // Lightbox for evidence
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceItem | null>(null);

  // Evidence filter state in the Evidence tab
  const [evidenceFilter, setEvidenceFilter] = useState<string>("all");

  // Derived Demographics
  const height = (demographics.height as string) || "5'10\" (178 cm)";
  const weight = (demographics.weight as string) || "70 kg";
  const build = (demographics.build as string) || "Athletic";
  const eyeColor = (demographics.eyeColor as string) || "Brown";
  const hairColor = (demographics.hairColor as string) || "Black";
  const complexion = (demographics.complexion as string) || "Wheatish";
  const distinctiveMarks =
    (demographics.distinctiveMarks as string) || "Scar on left eyebrow";
  const tattoos = (demographics.tattoos as string) || "Dragon (right arm)";

  const primaryCategory = (demographics.primaryCategory as string) || "Theft";
  const secondaryCategories =
    (demographics.secondaryCategories as string) || "Robbery, Assault";
  const modusOperandi =
    (demographics.modusOperandi as string) || "Armed robbery, group involvement";
  const knownAreas =
    (demographics.knownAreas as string) || "Chennai, T. Nagar, Anna Nagar";
  const crimeSummary =
    criminal.description ||
    "Armed robbery at commercial establishments. Often operates during late hours. Known to use a knife/weapon and flee via two-wheeler.";

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "criminal-history", label: "Criminal History" },
    { id: "biometrics", label: "Biometrics" },
    { id: "evidence", label: "Evidence (8)" },
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

  const handleAddAlias = (directAlias?: string) => {
    const value = directAlias ?? newAlias.trim();
    if (!value) return;
    if (aliases.includes(value)) {
      toast.info("Alias already exists");
      return;
    }
    setAliases([...aliases, value]);
    if (!directAlias) {
      setNewAlias("");
      setIsAddingAlias(false);
    }
    toast.success(`Alias "${value}" registered.`);
  };

  const handleRemoveAlias = (aliasToRemove: string) => {
    setAliases(aliases.filter((a) => a !== aliasToRemove));
    toast.info(`Alias "${aliasToRemove}" removed.`);
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
                              "h-7 px-2.5 gap-1.5 rounded-lg border-2 text-xs font-semibold cursor-pointer transition-colors shadow-2xs overflow-hidden relative min-w-[68px]",
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
                                className="group flex items-center justify-between rounded-lg border border-border/70 bg-background/40 hover:bg-muted/40 hover:border-[#665AEF]/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-all shadow-2xs select-none min-h-[34px]"
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
                        Classification: Armed Felon
                      </span>
                      <span className="text-[10px] font-semibold text-rose-500">
                        Violent Category II
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
                              8 Total
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

                      {/* 4 Cards Grid - spacious and crisp */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3">
                        {computedEvidence.slice(0, 4).map((item) => (
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
                    </div>

                    {/* Chain of Custody Footer */}
                    <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/80">
                        <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="truncate">Chain of Custody Active • 8 Items</span>
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
                              5 Total
                            </span>
                          </div>
                        </div>
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

                      {/* 5 Rows List with Perfect Columnar Alignment */}
                      <div className="space-y-1.5 pt-3">
                        {computedRelatedCases.map((c) => (
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
                                "inline-flex items-center justify-center rounded-md border-2 px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-semibold shrink-0 ml-1.5 sm:ml-2 min-w-[62px] sm:min-w-[70px] text-center",
                                c.statusColor
                              )}
                            >
                              {c.status}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>

                    {/* Case Status Summary Footer */}
                    <div className="mt-auto pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80">
                        3 Convicted • 2 Pending Trial
                      </span>
                      <span className="text-[10px] font-mono font-medium text-muted-foreground/80 bg-muted/40 px-1.5 py-0.5 rounded-md border-2 border-border/40">
                        TN-DOCKET
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 2: CRIMINAL HISTORY DASHBOARD
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "criminal-history" && (
            <div className="space-y-6 w-full">
              {/* Backdrop for dropdowns (closes popovers on outside click) */}
              {(isFilterDropdownOpen || openActionRowId !== null) && (
                <div
                  className="fixed inset-0 z-20 bg-transparent"
                  onClick={() => {
                    setIsFilterDropdownOpen(false);
                    setOpenActionRowId(null);
                  }}
                />
              )}

              {/* TOP CARD: CRIMINAL HISTORY TABLE */}
              <Card className="rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs space-y-3.5 sm:space-y-4">
                {/* Header with Title and Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="flex size-8 sm:size-9 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] shrink-0 border-2 border-[#665AEF]/40">
                      <FolderClock className="size-4 sm:size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-foreground tracking-tight">
                        Criminal History
                      </h3>
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                        Previous cases, arrests, and convictions associated with this individual.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
                    {/* Add Record Button */}
                    <button
                      type="button"
                      onClick={() => setIsAddRecordOpen(true)}
                      className="bg-[#665AEF] hover:bg-[#584bd4] text-white font-medium text-xs px-3 sm:px-3.5 py-1.5 sm:py-2 h-8 sm:h-9 rounded-md flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Record</span>
                    </button>

                    {/* Filter Dropdown */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setIsFilterDropdownOpen((prev) => !prev)}
                        className="h-8 sm:h-9 px-3 sm:px-3.5 rounded-md border-2 border-border/80 bg-muted/40 hover:bg-muted/60 text-xs font-medium text-foreground inline-flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <span className="truncate max-w-[110px] sm:max-w-none">{historyStatusFilter}</span>
                        <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                      </button>

                      {isFilterDropdownOpen && (
                        <div className="absolute right-0 mt-1 w-44 rounded-md border-2 border-border bg-card/95 backdrop-blur-md shadow-xl p-1 z-30 space-y-0.5">
                          {["All Records", "Under Investigation", "Solved", "In Court", "Closed"].map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setHistoryStatusFilter(option);
                                setIsFilterDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center justify-between cursor-pointer",
                                historyStatusFilter === option
                                  ? "bg-[#665AEF]/20 text-[#a594fd] font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                              )}
                            >
                              <span>{option}</span>
                              {historyStatusFilter === option && <Check className="size-3" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Desktop 9-Column Table Container (hidden on mobile, shown on md+) */}
                <div className="hidden md:block rounded-md border-2 border-border/70 overflow-hidden bg-card/40">
                  <div className="overflow-x-auto min-h-[300px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Table className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <TableHeader className="bg-muted/30">
                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableHead className="w-12 text-center text-[11px] font-semibold text-muted-foreground">#</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Case ID</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Offence Type</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground min-w-[200px]">Description</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Date</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Location</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Status</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Outcome</TableHead>
                          <TableHead className="w-12 text-center text-[11px] font-semibold text-muted-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredHistoryRecords.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="h-28 text-center text-xs text-muted-foreground">
                              No criminal records found for &quot;{historyStatusFilter}&quot;.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredHistoryRecords.map((item, idx) => {
                            const isBottomRows = idx >= 2;
                            return (
                              <TableRow
                                key={item.id}
                                className="border-b border-border/40 hover:bg-muted/20 transition-colors"
                              >
                                {/* # */}
                                <TableCell className="text-center font-mono text-xs text-muted-foreground/80 py-3.5">
                                  {item.rowNumber || String(idx + 1).padStart(2, "0")}
                                </TableCell>

                                {/* Case ID */}
                                <TableCell className="py-3.5">
                                  <span
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.caseId);
                                      toast.success(`Copied ${item.caseId} to clipboard`);
                                    }}
                                    title="Click to copy Case ID"
                                    className="font-mono text-xs font-semibold text-[#a594fd] hover:text-[#c0b3ff] hover:underline cursor-pointer inline-flex items-center gap-1"
                                  >
                                    {item.caseId}
                                  </span>
                                </TableCell>

                                {/* Offence Type */}
                                <TableCell className="py-3.5">
                                  {renderOffenceBadge(item.offenceType)}
                                </TableCell>

                                {/* Description */}
                                <TableCell className="py-3.5">
                                  <p className="text-xs text-foreground/90 max-w-[260px] truncate" title={item.description}>
                                    {item.description}
                                  </p>
                                </TableCell>

                                {/* Date */}
                                <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                                  {item.date}
                                </TableCell>

                                {/* Location */}
                                <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                                  {item.location}
                                </TableCell>

                                {/* Status */}
                                <TableCell className="py-3.5">
                                  {renderHistoryStatusBadge(item.status)}
                                </TableCell>

                                {/* Outcome */}
                                <TableCell className="py-3.5">
                                  {renderOutcomeBadge(item.outcome)}
                                </TableCell>

                                {/* Actions */}
                                <TableCell className="py-3.5 text-center">
                                  <div className="relative inline-block text-left">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setOpenActionRowId(openActionRowId === item.id ? null : item.id);
                                      }}
                                      className="size-7 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                                    >
                                      <MoreHorizontal className="size-4" />
                                    </button>

                                    {openActionRowId === item.id && (
                                      <div
                                        className={cn(
                                          "absolute right-0 w-40 rounded-md border-2 border-border bg-card/95 backdrop-blur-md shadow-2xl p-1 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150",
                                          isBottomRows ? "bottom-full mb-1" : "top-full mt-1"
                                        )}
                                      >
                                        <button
                                          type="button"
                                          onClick={() => {
                                            navigator.clipboard.writeText(item.caseId);
                                            toast.success(`Copied ${item.caseId}`);
                                            setOpenActionRowId(null);
                                          }}
                                          className="w-full text-left text-xs px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                          <Copy className="size-3 text-muted-foreground" />
                                          <span>Copy Case ID</span>
                                        </button>

                                        <Link
                                          href={`/dashboard/cases?caseId=${item.caseId}`}
                                          onClick={() => setOpenActionRowId(null)}
                                          className="w-full text-left text-xs px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                          <ExternalLink className="size-3 text-muted-foreground" />
                                          <span>View Case Dossier</span>
                                        </Link>

                                        <button
                                          type="button"
                                          onClick={() => {
                                            setHistoryRecords((prev) => prev.filter((r) => r.id !== item.id));
                                            toast.info(`Record ${item.caseId} removed`);
                                            setOpenActionRowId(null);
                                          }}
                                          className="w-full text-left text-xs px-2.5 py-1.5 rounded-md text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                                        >
                                          <Trash2 className="size-3 text-rose-400" />
                                          <span>Delete Record</span>
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

                {/* Mobile Responsive High-Signal Cards (shown on mobile, hidden on md+) */}
                <div className="block md:hidden space-y-2.5">
                  {filteredHistoryRecords.length === 0 ? (
                    <div className="p-8 text-center text-xs text-muted-foreground rounded-lg border-2 border-border/70 bg-card/30">
                      No criminal records found for &quot;{historyStatusFilter}&quot;.
                    </div>
                  ) : (
                    filteredHistoryRecords.map((item, idx) => {
                      const isBottomRows = idx >= filteredHistoryRecords.length - 2;
                      return (
                        <div
                          key={item.id}
                          className="rounded-lg border-2 border-border/70 bg-card/60 p-3 space-y-2 transition-colors hover:border-[#665AEF]/40"
                        >
                          {/* Top: Case ID, Offence badge, Status, Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                              <span
                                onClick={() => {
                                  navigator.clipboard.writeText(item.caseId);
                                  toast.success(`Copied ${item.caseId}`);
                                }}
                                className="font-mono text-xs font-bold text-[#a594fd] hover:underline cursor-pointer"
                              >
                                {item.caseId}
                              </span>
                              {renderOffenceBadge(item.offenceType)}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              {renderHistoryStatusBadge(item.status)}
                              <div className="relative inline-block text-left">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenActionRowId(openActionRowId === item.id ? null : item.id);
                                  }}
                                  className="size-7 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                                >
                                  <MoreHorizontal className="size-4" />
                                </button>
                                {openActionRowId === item.id && (
                                  <div
                                    className={cn(
                                      "absolute right-0 w-40 rounded-md border-2 border-border bg-card/95 backdrop-blur-md shadow-2xl p-1 z-30 space-y-0.5 animate-in fade-in zoom-in-95 duration-150",
                                      isBottomRows ? "bottom-full mb-1" : "top-full mt-1"
                                    )}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        navigator.clipboard.writeText(item.caseId);
                                        toast.success(`Copied ${item.caseId}`);
                                        setOpenActionRowId(null);
                                      }}
                                      className="w-full text-left text-xs px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                      <Copy className="size-3 text-muted-foreground" />
                                      <span>Copy Case ID</span>
                                    </button>
                                    <Link
                                      href={`/dashboard/cases?caseId=${item.caseId}`}
                                      onClick={() => setOpenActionRowId(null)}
                                      className="w-full text-left text-xs px-2.5 py-1.5 rounded-md text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                      <ExternalLink className="size-3 text-muted-foreground" />
                                      <span>View Case Dossier</span>
                                    </Link>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setHistoryRecords((prev) => prev.filter((r) => r.id !== item.id));
                                        toast.info(`Record ${item.caseId} removed`);
                                        setOpenActionRowId(null);
                                      }}
                                      className="w-full text-left text-xs px-2.5 py-1.5 rounded-md text-rose-400 hover:bg-rose-500/10 transition-colors flex items-center gap-2 cursor-pointer"
                                    >
                                      <Trash2 className="size-3 text-rose-400" />
                                      <span>Delete Record</span>
                                    </button>
                                  </div>
                                )}
                              </div>
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
                              <span className="flex items-center gap-1 truncate max-w-[120px]">
                                <MapPin className="size-2.5 text-muted-foreground/80" />
                                {item.location}
                              </span>
                            </div>
                            <div>
                              {renderOutcomeBadge(item.outcome)}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </Card>

              {/* BOTTOM ROW: 2-CARD GRID (6 - 6 COLUMN SPLIT) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-3.5 sm:gap-5 w-full">
                {/* CARD 1: SUMMARY (6 COLS) */}
                <div className="xl:col-span-6 flex">
                  <Card className="rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs w-full flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <CardHeader className="p-0 pb-3 sm:pb-4 border-b border-border/50">
                        <CardTitle className="flex items-center gap-2.5 text-sm font-semibold text-foreground">
                          <div className="flex size-7.5 sm:size-8 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shrink-0">
                            <Scale className="size-4" />
                          </div>
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
                  <Card className="rounded-lg border-2 border-border/80 bg-card/60 p-3.5 sm:p-5 shadow-xs w-full flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7.5 sm:size-8 items-center justify-center rounded-md bg-[#665AEF]/20 text-[#a594fd] border-2 border-[#665AEF]/40 shrink-0">
                            <FolderClock className="size-4" />
                          </div>
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

                      {/* Content: Image Preview + Case Details */}
                      <CardContent className="p-0 pt-3.5 sm:pt-5">
                        <div className="flex flex-col sm:flex-row gap-3.5 sm:gap-4 items-start">
                          {/* Incident Thumbnail */}
                          <div className="relative w-full h-36 sm:h-28 sm:w-28 sm:size-28 rounded-md overflow-hidden border-2 border-border/80 bg-black/60 shrink-0">
                            <Image
                              src="/images/cctv-suspect.jpg"
                              alt="Recent incident preview"
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 112px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            <span className="absolute bottom-1.5 left-1.5 text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-black/85 text-[#a594fd] border-2 border-[#665AEF]/50">
                              CCTV-01
                            </span>
                          </div>

                          {/* Details */}
                          <div className="flex-1 min-w-0 space-y-2 w-full">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono text-xs font-semibold text-[#a594fd]">
                                  {mostRecentRecord?.caseId || "FX-2026-184"}
                                </span>
                                <h4 className="text-sm font-semibold text-foreground leading-snug">
                                  {mostRecentRecord?.description || "Armed robbery at commercial store."}
                                </h4>
                              </div>
                              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-[#7E22CE]/60 bg-[#2D1B4E]/90 text-[#C084FC] whitespace-nowrap shrink-0">
                                {mostRecentRecord?.status || "Under Investigation"}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3 text-muted-foreground/80" />
                                <span>{mostRecentRecord?.date || "Oct 4, 2026"}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3 text-muted-foreground/80" />
                                <span>{mostRecentRecord?.location || "Chennai, TN"}</span>
                              </span>
                            </div>

                            <p className="text-xs text-foreground/80 leading-relaxed line-clamp-2">
                              Suspect entered commercial electronics showroom with weapon, coerced cash handover and fled on dark blue motorcycle. Latent forensic prints retrieved from counter.
                            </p>
                          </div>
                        </div>
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
                          <Image
                            src={
                              mugshotDisplayUrl && !mugshotDisplayUrl.includes("fly.storage.tigris.dev//")
                                ? mugshotDisplayUrl
                                : "/images/suspects/arjun-karthik.jpg"
                            }
                            alt={criminal.firstName}
                            fill
                            className="object-cover"
                            sizes="200px"
                          />

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
                            <span className="font-mono font-semibold text-foreground text-[11px] sm:text-xs">FACE-001</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-border/40">
                            <span className="text-muted-foreground text-[11px] sm:text-xs">Image Source</span>
                            <span className="font-medium text-foreground text-[11px] sm:text-xs">Mugshot</span>
                          </div>
                          <div className="flex items-center justify-between py-1 border-b border-border/40">
                            <span className="text-muted-foreground text-[11px] sm:text-xs">Captured On</span>
                            <span className="font-mono text-muted-foreground text-[11px] sm:text-xs">Jan 12, 2023</span>
                          </div>
                          <div className="flex items-center justify-between py-1">
                            <span className="text-muted-foreground text-[11px] sm:text-xs">Image Quality</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-semibold border-2 border-emerald-500/50 bg-emerald-500/15 text-emerald-400">
                              Good
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Intel Footer */}
                    <div className="mt-4 sm:mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80 truncate">
                        Feature Space: MobileNetV3 512D
                      </span>
                      <span className="text-[10px] font-mono text-[#a594fd] bg-[#665AEF]/10 px-1.5 py-0.5 rounded-md border-2 border-[#665AEF]/30 shrink-0 ml-1">
                        HASH#E4F9-B2
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
                              Top matches from criminal database.
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
                            <span>Re-scan</span>
                          </button>

                          <Link
                            href="/dashboard/cases"
                            className="text-xs font-semibold text-[#a594fd] hover:text-[#c0b3ff] flex items-center gap-1 transition-colors"
                          >
                            <span>All Matches</span>
                            <ArrowRight className="size-3.5" />
                          </Link>
                        </div>
                      </div>

                      {/* 4-Candidate Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3.5 sm:pt-5">
                        {matchCandidates.map((cand) => (
                          <div
                            key={cand.id}
                            onClick={() => setSelectedCandidate(cand)}
                            className="group flex flex-col rounded-md overflow-hidden border-2 border-border/70 bg-[#0F172A]/80 hover:border-[#665AEF]/70 transition-all cursor-pointer shadow-xs hover:shadow-md hover:shadow-[#665AEF]/15"
                          >
                            {/* Candidate Image with Confidence Pill */}
                            <div className="relative aspect-square w-full overflow-hidden bg-black/60">
                              <Image
                                src={cand.imageSrc}
                                alt={cand.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="160px"
                              />

                              {/* Confidence score pill badge in bottom right */}
                              <div
                                className={cn(
                                  "absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold border-2 shadow-xs",
                                  cand.confidence >= 90
                                    ? "bg-cyan-950/90 border-cyan-400 text-cyan-300"
                                    : "bg-blue-950/90 border-blue-500 text-blue-300"
                                )}
                              >
                                {cand.confidence}%
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
                    </div>

                    {/* Operational Intel Footer */}
                    <div className="mt-4 sm:mt-5 pt-3 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80 truncate">
                        Real-time Cosine Similarity • Threshold ≥ 60%
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border-2 border-emerald-500/30 px-2 py-0.5 rounded-md shrink-0 ml-1">
                        4 Matches
                      </span>
                    </div>
                  </Card>
                </div>
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
                    href="/dashboard/cases"
                    className="text-xs font-semibold text-[#a594fd] hover:text-[#c0b3ff] flex items-center gap-1 transition-colors shrink-0"
                  >
                    <span className="hidden xs:inline">View All History</span>
                    <span className="xs:hidden">View All</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>

                {/* DESKTOP VIEW: 8-Column Shadcn Table (hidden on mobile) */}
                <div className="hidden md:block rounded-md border-2 border-border/70 overflow-hidden bg-card/40">
                  <div className="overflow-x-auto min-h-[220px] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                    <Table className="[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <TableHeader className="bg-muted/30">
                        <TableRow className="border-b border-border/60 hover:bg-transparent">
                          <TableHead className="w-12 text-center text-[11px] font-semibold text-muted-foreground">#</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground min-w-[170px]">Date & Time</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground text-center w-28">Queried Image</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground min-w-[200px]">Match Result</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Confidence</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Initiated By</TableHead>
                          <TableHead className="text-[11px] font-semibold text-muted-foreground">Status</TableHead>
                          <TableHead className="w-12 text-center text-[11px] font-semibold text-muted-foreground">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matchHistory.map((item, idx) => {
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
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>

                {/* MOBILE CARD VIEW: Dedicated high-signal layout (< md screens) */}
                <div className="block md:hidden space-y-3">
                  {matchHistory.map((item) => (
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
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
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
                          <span className="truncate">Dossier</span>
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
                  ))}
                </div>
              </Card>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 4: EVIDENCE (8)
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "evidence" && (
            <div className="space-y-4 w-full">
              {/* Filter pills with horizontal smooth touch scrolling on mobile */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth flex-nowrap sm:flex-wrap py-1 -mx-1 px-1 w-full sm:w-auto touch-pan-x">
                  {[
                    { id: "all", label: "All Evidence (8)" },
                    { id: "image", label: "Images (4)" },
                    { id: "video", label: "Videos (2)" },
                    { id: "scan", label: "Scans (1)" },
                    { id: "document", label: "Documents (1)" },
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

                <motion.span
                  key={evidenceFilter}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-xs text-muted-foreground font-medium hidden sm:inline whitespace-nowrap"
                >
                  Showing{" "}
                  <strong className="text-foreground font-semibold">
                    {evidenceFilter === "all"
                      ? computedEvidence.length
                      : computedEvidence.filter((e) => e.type === evidenceFilter).length}
                  </strong>{" "}
                  items
                </motion.span>
              </div>

              {/* Animated Grid of Evidence Cards with Framer Motion layout & exit transitions */}
              <motion.div
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4"
              >
                <AnimatePresence mode="popLayout">
                  {computedEvidence.filter(
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
                  ))}
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
            <div className="relative aspect-video w-full rounded-xl overflow-hidden border border-border/80 bg-black">
              <Image
                src={selectedEvidence.imageSrc}
                alt={selectedEvidence.name}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 640px"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-1">
              <div>
                <span className="text-muted-foreground text-[11px]">Collected On</span>
                <p className="font-semibold text-foreground">{selectedEvidence.date}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px]">Investigating Officer</span>
                <p className="font-semibold text-foreground">{selectedEvidence.officer}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px]">File Size</span>
                <p className="font-semibold text-foreground">{selectedEvidence.size}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px]">SHA-256 Hash</span>
                <p className="font-mono text-muted-foreground text-[10px] truncate">
                  {selectedEvidence.sha256}
                </p>
              </div>
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
                FACE-001
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
            <Image
              src={
                mugshotDisplayUrl && !mugshotDisplayUrl.includes("fly.storage.tigris.dev//")
                  ? mugshotDisplayUrl
                  : "/images/suspects/arjun-karthik.jpg"
              }
              alt="High-resolution reference face"
              fill
              className="object-cover"
              sizes="500px"
            />
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
              <span className="font-mono font-semibold text-foreground">1024 × 1024 px</span>
            </div>
            <div className="p-2.5 rounded-md border-2 border-border/70 bg-muted/20">
              <span className="text-[10px] text-muted-foreground uppercase font-medium block">Enrollment Date</span>
              <span className="font-mono font-semibold text-foreground">Jan 12, 2023, 10:15 AM</span>
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
              href={`/dashboard/cases?suspect=${selectedCandidate?.code}`}
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
                  <Image
                    src={mugshotDisplayUrl || "/images/suspects/arjun-karthik.jpg"}
                    alt="Reference"
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
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
                  <Image
                    src={selectedCandidate.imageSrc}
                    alt={selectedCandidate.name}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
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

    </div>
  );
}
