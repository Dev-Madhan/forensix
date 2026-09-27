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
} from "lucide-react";
import type { Criminal } from "@prisma/client";
import { toast } from "sonner";

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
    <div className="w-full space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          TAB NAVIGATION BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="relative border-b border-border/70 pb-px">
        <div
          role="tablist"
          aria-label="Criminal profile sections"
          className="flex w-full justify-start overflow-x-auto no-scrollbar gap-2 sm:gap-4 h-11 px-0 relative"
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
                  "relative inline-flex items-center justify-center px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none outline-none",
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
              Row 1: Physical Description (4), Aliases (3), Crime Info (5)
              Row 2: Recent Evidence (7), Related Cases (5)
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "overview" && (
            <div className="space-y-5 w-full">
              {/* ROW 1: 3 CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 lg:gap-5 w-full">
                {/* CARD 1: PHYSICAL DESCRIPTION */}
                <div className="xl:col-span-4 2xl:col-span-4 flex flex-col">
                  <div className="h-full rounded-xl border-2 border-border/80 bg-card/60 p-4 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                            <Ruler className="size-4" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Physical Description
                          </h3>
                        </div>
                      </div>

                      {/* 2-Column Key-Values */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 text-xs">
                        {/* Left Column */}
                        <div className="space-y-2.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[11px]">Height</span>
                            <span className="font-semibold text-foreground leading-tight">
                              {height}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[11px]">Weight</span>
                            <span className="font-semibold text-foreground leading-tight">
                              {weight}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[11px]">Build</span>
                            <span className="font-semibold text-foreground leading-tight">
                              {build}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[11px]">Eye Color</span>
                            <span className="font-semibold text-foreground leading-tight">
                              {eyeColor}
                            </span>
                          </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-2.5">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[11px]">Hair Color</span>
                            <span className="font-semibold text-foreground leading-tight">
                              {hairColor}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[11px]">Complexion</span>
                            <span className="font-semibold text-foreground leading-tight">
                              {complexion}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[11px]">
                              Distinctive Marks
                            </span>
                            <span className="font-semibold text-foreground leading-tight">
                              {distinctiveMarks}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[11px]">Tattoos</span>
                            <span className="font-semibold text-foreground leading-tight">
                              {tattoos}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Forensic Verification Footnote */}
                    <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80">Forensic Physical Record</span>
                      <span className="text-[10px] text-muted-foreground/80 font-mono">CONF-A1</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: ALIASES */}
                <div className="xl:col-span-3 2xl:col-span-3 flex flex-col">
                  <div className="h-full rounded-xl border-2 border-border/80 bg-card/60 p-4 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                            <Tag className="size-4" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Aliases ({aliases.length})
                          </h3>
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
                        <div className="grid grid-cols-2 gap-2">
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
                                whileHover={{ y: -1, scale: 1.02 }}
                                className="group flex items-center justify-between rounded-lg border-2 border-border/80 bg-card/60 hover:bg-muted/40 hover:border-[#665AEF]/40 px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors shadow-2xs select-none"
                              >
                                <span className="truncate">{alias}</span>
                                <motion.button
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.85 }}
                                  type="button"
                                  onClick={() => handleRemoveAlias(alias)}
                                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 p-0.5 rounded cursor-pointer ml-1"
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
                              className="pt-2.5 space-y-1.5"
                            >
                              <div className="flex items-center gap-1.5">
                                <Sparkles className="size-3 text-[#665AEF]" />
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                                  Suggested
                                </span>
                              </div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <AnimatePresence mode="popLayout">
                                  {suggestedAliases.slice(0, 6).map((sug) => (
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
                                      className="group inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md border-2 border-border/80 bg-card/40 hover:bg-[#665AEF]/10 hover:border-[#665AEF]/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 font-medium select-none shadow-2xs"
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
                    <div className="mt-3 pt-2.5 border-t border-border/40">
                      {!isAddingAlias && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setIsAddingAlias(true)}
                          className="w-full h-7.5 border-dashed border-border/80 hover:border-[#665AEF]/60 bg-muted/15 hover:bg-[#665AEF]/10 text-xs text-muted-foreground hover:text-foreground cursor-pointer gap-1.5 transition-colors"
                        >
                          <Plus className="size-3 text-muted-foreground" />
                          <span>Register New Moniker</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* CARD 3: CRIME INFORMATION */}
                <div className="xl:col-span-5 2xl:col-span-5 flex flex-col">
                  <div className="h-full rounded-xl border-2 border-border/80 bg-card/60 p-4 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                            <BookOpen className="size-4" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Crime Information
                          </h3>
                        </div>
                      </div>

                      {/* Key Values & Summary */}
                      <div className="space-y-2 pt-3 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground text-[11px]">
                              Primary Category
                            </span>
                            <span className="font-semibold text-foreground">
                              {primaryCategory}
                            </span>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground text-[11px]">
                              Secondary Categories
                            </span>
                            <span className="font-semibold text-foreground">
                              {secondaryCategories}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground text-[11px] shrink-0">
                            Typical Modus Operandi
                          </span>
                          <span className="font-medium text-foreground text-right truncate">
                            {modusOperandi}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground text-[11px] shrink-0">
                            Known Areas
                          </span>
                          <span className="font-medium text-foreground text-right truncate">
                            {knownAreas}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-border/40">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-muted-foreground text-[11px]">Summary</span>
                            <p className="text-xs text-foreground/90 leading-relaxed line-clamp-2">
                              {crimeSummary}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Operational Intel Footer */}
                    <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80">Classification: Armed Felon</span>
                      <span className="text-[10px] text-rose-400 font-medium">Violent Category II</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ROW 2: 2 BALANCED CARDS (QUICK STATS REMOVED, ARCHITECTURAL 7-5 RATIO) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5 w-full">
                {/* CARD 4: RECENT EVIDENCE (8) - 7 COLS (ALIGNED WITH ROW 1 CARDS 1+2) */}
                <div className="xl:col-span-7 2xl:col-span-7 flex flex-col">
                  <div className="h-full rounded-xl border-2 border-border/80 bg-card/60 p-4 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                            <Camera className="size-4" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Recent Evidence (8)
                          </h3>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          onClick={() => setActiveTab("evidence")}
                          className="h-6 gap-1 text-xs font-medium text-[#a594fd] hover:text-foreground hover:bg-muted/60 cursor-pointer"
                        >
                          <span>View All</span>
                          <ArrowRight className="size-3" />
                        </Button>
                      </div>

                      {/* 4 Cards Grid - spacious and crisp */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                        {RECENT_EVIDENCE.slice(0, 4).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setSelectedEvidence(item)}
                            className="group relative flex flex-col rounded-lg overflow-hidden border border-border/70 bg-[#0F172A]/70 hover:border-[#665AEF]/60 transition-all cursor-pointer shadow-xs"
                          >
                            {/* Image Box */}
                            <div className="relative aspect-video sm:aspect-square w-full overflow-hidden bg-black/40">
                              <Image
                                src={item.imageSrc}
                                alt={item.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 180px"
                              />
                              {/* Overlay Badge */}
                              <div className="absolute top-1.5 left-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-medium text-white/90">
                                {item.type === "video" ? (
                                  <>
                                    <Play className="size-2.5 fill-current" />
                                    <span>Video</span>
                                  </>
                                ) : (
                                  <>
                                    <Camera className="size-2.5" />
                                    <span>Image</span>
                                  </>
                                )}
                              </div>

                              {/* Video Duration */}
                              {item.duration && (
                                <div className="absolute bottom-1.5 right-1.5 px-1 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white/90">
                                  {item.duration}
                                </div>
                              )}
                            </div>

                            {/* Details below image */}
                            <div className="p-2 flex flex-col gap-0.5 bg-card/80">
                              <span
                                className="text-[11px] font-medium text-foreground truncate"
                                title={item.name}
                              >
                                {item.name}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {item.date}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Chain of Custody Footer */}
                    <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80">Chain of Custody Active • 8 Items Logged</span>
                      <span className="text-[10px] text-emerald-400 font-medium">Integrity Verified</span>
                    </div>
                  </div>
                </div>

                {/* CARD 5: RELATED CASES (5) - 5 COLS (ALIGNED WITH ROW 1 CARD 3) */}
                <div className="xl:col-span-5 2xl:col-span-5 flex flex-col">
                  <div className="h-full rounded-xl border-2 border-border/80 bg-card/60 p-4 shadow-xs flex flex-col justify-between">
                    <div>
                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 border-b border-border/50">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                            <FolderKanban className="size-4" />
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Related Cases (5)
                          </h3>
                        </div>
                        <Button
                          variant="ghost"
                          size="xs"
                          render={<Link href="/dashboard/cases" />}
                          className="h-6 gap-1 text-xs font-medium text-[#a594fd] hover:text-foreground hover:bg-muted/60 cursor-pointer"
                          nativeButton={false}
                        >
                          <span>View All</span>
                          <ArrowRight className="size-3" />
                        </Button>
                      </div>

                      {/* 5 Rows List */}
                      <div className="space-y-1.5 pt-2.5">
                        {RELATED_CASES.map((c) => (
                          <Link
                            key={c.caseNumber}
                            href={`/case-details/${c.caseNumber}`}
                            className="flex items-center justify-between py-1.5 px-2.5 rounded-lg hover:bg-muted/40 transition-colors text-xs group"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="font-mono text-[11px] text-[#a594fd] group-hover:underline shrink-0">
                                {c.caseNumber}
                              </span>
                              <span className="text-foreground font-medium truncate">
                                {c.title}
                              </span>
                            </div>
                            <span
                              className={cn(
                                "inline-flex items-center rounded-[4px] border px-2 py-0.5 text-[10px] font-semibold shrink-0 ml-2",
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
                    <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="text-[10px] text-muted-foreground/80">3 Convicted • 2 Pending Trial</span>
                      <span className="text-[10px] font-mono text-muted-foreground/80">TN-DOCKET</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 2: CRIMINAL HISTORY
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "criminal-history" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
              {/* Timeline Column */}
              <div className="xl:col-span-8 space-y-5">
                <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-5 shadow-xs">
                  <CardHeader className="p-0 pb-4 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                        <BookOpen className="size-4" />
                      </div>
                      Criminal Record History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-5">
                    <div className="space-y-6">
                      {[
                        {
                          caseNo: "FX-2026-184",
                          title: "Downtown Armed Robbery",
                          date: "Oct 1, 2026",
                          location: "T. Nagar, Chennai",
                          status: "Under Investigation",
                          details:
                            "Suspect entered commercial electronics showroom with knife weapon, coerced cash handover and fled on dark blue motorcycle.",
                          badgeColor: "border-[#7E22CE]/40 bg-[#2D1B4E]/80 text-[#C084FC]",
                        },
                        {
                          caseNo: "FX-2026-172",
                          title: "Jewelry Store Night Break-in",
                          date: "May 14, 2026",
                          location: "Anna Nagar, Chennai",
                          status: "Solved",
                          details:
                            "Shutter compromised during early morning hours. Recovered ornaments matched latent fingerprint signatures.",
                          badgeColor: "border-emerald-500/40 bg-emerald-500/15 text-emerald-400",
                        },
                        {
                          caseNo: "FX-2025-098",
                          title: "Aggravated Assault Case",
                          date: "Nov 22, 2025",
                          location: "Central Bus Terminal, Chennai",
                          status: "In Court",
                          details:
                            "Physical altercation during dispute. Charged under Sections 324 & 341. Trial currently pending hearing.",
                          badgeColor: "border-blue-500/40 bg-blue-500/15 text-blue-400",
                        },
                      ].map((item, idx) => (
                        <div key={item.caseNo} className="relative flex gap-4">
                          {/* Step Marker */}
                          <div className="flex flex-col items-center shrink-0">
                            <div className="flex size-8 items-center justify-center rounded-full bg-[#665AEF]/20 border border-[#665AEF]/50 text-xs font-bold text-[#a594fd]">
                              {idx + 1}
                            </div>
                            {idx < 2 && (
                              <div className="w-0.5 flex-1 bg-border/60 min-h-12 mt-1" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-mono text-xs font-semibold text-[#a594fd]">
                                  {item.caseNo}
                                </span>
                                <h4 className="text-sm font-semibold text-foreground">
                                  {item.title}
                                </h4>
                              </div>
                              <span
                                className={cn(
                                  "inline-flex items-center rounded-[4px] border px-2 py-0.5 text-xs font-semibold",
                                  item.badgeColor
                                )}
                              >
                                {item.status}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="size-3" />
                                {item.date}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="size-3" />
                                {item.location}
                              </span>
                            </div>

                            <p className="text-xs text-foreground/80 leading-relaxed pt-1">
                              {item.details}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Panels */}
              <div className="xl:col-span-4 space-y-5">
                {/* Risk Assessment */}
                <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-5 shadow-xs">
                  <CardHeader className="p-0 pb-3 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                        <Shield className="size-4" />
                      </div>
                      Risk Assessment Matrix
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 space-y-4">
                    {[
                      { label: "Recidivism Risk", value: "85%", color: "bg-rose-500", level: "High" },
                      { label: "Violence Risk", value: "65%", color: "bg-amber-500", level: "Medium" },
                      { label: "Flight / Escape Risk", value: "70%", color: "bg-rose-500", level: "High" },
                    ].map((meter) => (
                      <div key={meter.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">{meter.label}</span>
                          <span className="font-semibold text-foreground">{meter.level}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", meter.color)}
                            style={{ width: meter.value }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Modus Operandi Details */}
                <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-5 shadow-xs">
                  <CardHeader className="p-0 pb-3 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                        <Zap className="size-4" />
                      </div>
                      Modus Operandi
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 text-xs space-y-3">
                    <p className="text-foreground/90 leading-relaxed">
                      {modusOperandi}
                    </p>
                    <div className="p-2.5 rounded-lg border border-border/50 bg-muted/20">
                      <span className="text-[11px] text-muted-foreground uppercase font-medium">
                        Target Profile
                      </span>
                      <p className="text-foreground mt-0.5">
                        Retail outlets, jewelry stores, commercial premises after 9:00 PM.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 3: BIOMETRICS
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "biometrics" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
              {/* Biometric Status Row */}
              <div className="xl:col-span-8 space-y-5">
                <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-5 shadow-xs">
                  <CardHeader className="p-0 pb-3 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                        <Scan className="size-4" />
                      </div>
                      Biometric Enrollment Records
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        {
                          title: "Fingerprints",
                          status: "Enrolled",
                          enrolled: true,
                          desc: "10-finger slap cards recorded",
                          icon: Fingerprint,
                        },
                        {
                          title: "Facial Recognition",
                          status: "Enrolled",
                          enrolled: true,
                          desc: "512-dim vector embedding indexed",
                          icon: Scan,
                        },
                        {
                          title: "DNA Profile",
                          status: "Pending Sample",
                          enrolled: false,
                          desc: "Awaiting court authorization",
                          icon: Activity,
                        },
                      ].map((item) => (
                        <div
                          key={item.title}
                          className="flex flex-col items-center text-center p-4 rounded-xl border border-border/60 bg-muted/20 gap-2.5"
                        >
                          <div
                            className={cn(
                              "flex size-12 items-center justify-center rounded-xl",
                              item.enrolled
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-muted/40 text-muted-foreground"
                            )}
                          >
                            <item.icon className="size-6" />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-foreground">
                              {item.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                          <span
                            className={cn(
                              "mt-auto inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded",
                              item.enrolled
                                ? "bg-emerald-500/15 text-emerald-400"
                                : "bg-muted/60 text-muted-foreground"
                            )}
                          >
                            {item.enrolled ? (
                              <CheckCircle2 className="size-3" />
                            ) : (
                              <XCircle className="size-3" />
                            )}
                            {item.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Scars & Tattoos */}
                <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-5 shadow-xs">
                  <CardHeader className="p-0 pb-3 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                        <Star className="size-4" />
                      </div>
                      Marks & Tattoos Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                        <span className="text-[11px] text-muted-foreground uppercase font-medium">
                          Distinctive Scars
                        </span>
                        <p className="font-semibold text-foreground">{distinctiveMarks}</p>
                        <p className="text-muted-foreground text-[11px]">
                          Location: Left eyebrow arc, 2.5cm linear scar.
                        </p>
                      </div>

                      <div className="p-3 rounded-lg border border-border/60 bg-muted/20 space-y-1">
                        <span className="text-[11px] text-muted-foreground uppercase font-medium">
                          Identified Tattoos
                        </span>
                        <p className="font-semibold text-foreground">{tattoos}</p>
                        <p className="text-muted-foreground text-[11px]">
                          Location: Right arm forearm to bicep, black ink dragon design.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Mugshot Reference */}
              <div className="xl:col-span-4 space-y-5">
                <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-5 shadow-xs">
                  <CardHeader className="p-0 pb-3 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                        <Camera className="size-4" />
                      </div>
                      Enrolled Reference Mugshot
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    <div className="relative aspect-[3/4] w-full rounded-xl overflow-hidden border border-border/80 bg-black">
                      <Image
                        src={
                          mugshotDisplayUrl && !mugshotDisplayUrl.includes("fly.storage.tigris.dev//")
                            ? mugshotDisplayUrl
                            : "/images/suspects/arjun-karthik.jpg"
                        }
                        alt={criminal.firstName}
                        fill
                        className="object-cover"
                        sizes="300px"
                      />
                    </div>
                    <p className="text-center text-xs text-muted-foreground mt-3">
                      Enrolled on Jan 12, 2023 • State Forensic Database
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 4: EVIDENCE (8)
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "evidence" && (
            <div className="space-y-4 w-full">
              {/* Filter pills */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { id: "all", label: "All Evidence (8)" },
                    { id: "image", label: "Images (4)" },
                    { id: "video", label: "Videos (2)" },
                    { id: "scan", label: "Forensic Scans (1)" },
                    { id: "document", label: "Documents (1)" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setEvidenceFilter(f.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer",
                        evidenceFilter === f.id
                          ? "border-[#665AEF] bg-[#665AEF]/15 text-[#a594fd]"
                          : "border-border/70 bg-card/60 text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <span className="text-xs text-muted-foreground">
                  Showing{" "}
                  {evidenceFilter === "all"
                    ? RECENT_EVIDENCE.length
                    : RECENT_EVIDENCE.filter((e) => e.type === evidenceFilter).length}{" "}
                  items
                </span>
              </div>

              {/* Grid of Evidence Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {RECENT_EVIDENCE.filter(
                  (e) => evidenceFilter === "all" || e.type === evidenceFilter
                ).map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvidence(ev)}
                    className="group rounded-xl overflow-hidden border-2 border-border/80 bg-card/60 hover:border-[#665AEF]/60 transition-all cursor-pointer shadow-xs flex flex-col"
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
                      <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded bg-black/75 backdrop-blur-xs text-[10px] font-medium text-white">
                        {ev.type === "video" ? (
                          <>
                            <Play className="size-2.5 fill-current" />
                            <span>Video</span>
                          </>
                        ) : (
                          <>
                            <Camera className="size-2.5" />
                            <span>Image</span>
                          </>
                        )}
                      </div>

                      {ev.duration && (
                        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-white">
                          {ev.duration}
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-semibold text-foreground truncate" title={ev.name}>
                          {ev.name}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-1">
                          <span>{ev.date}</span>
                          <span>{ev.size}</span>
                        </div>
                      </div>
                      <div className="pt-2 border-t border-border/40 text-[10px] text-muted-foreground flex justify-between">
                        <span className="truncate">{ev.officer}</span>
                        <span className="text-[#a594fd] group-hover:underline">Inspect</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════
              TAB 5: ACTIVITY LOG
              ═══════════════════════════════════════════════════════════ */}
          {activeTab === "activity" && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 w-full">
              <div className="xl:col-span-8 space-y-5">
                <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-5 shadow-xs">
                  <CardHeader className="p-0 pb-3 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                        <Activity className="size-4" />
                      </div>
                      Forensic Audit & Surveillance Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4">
                    <div className="space-y-4">
                      {[
                        {
                          action: "Surveillance Alert Triggered",
                          time: "Oct 5, 2026, 11:32 AM",
                          officer: "Automated ANPR Camera (T. Nagar)",
                          details:
                            "Subject's registered two-wheeler recognized near Panagal Park intersection.",
                          icon: AlertTriangle,
                          color: "text-rose-400 bg-rose-500/15",
                        },
                        {
                          action: "Case Association Linked",
                          time: "Oct 1, 2026, 04:15 PM",
                          officer: "Insp. Ramanathan S.",
                          details:
                            "Linked as primary suspect to Case FX-2026-184 (Downtown Robbery).",
                          icon: FolderKanban,
                          color: "text-blue-400 bg-blue-500/15",
                        },
                        {
                          action: "Evidence Enrolled",
                          time: "Oct 4, 2026, 02:40 PM",
                          officer: "Sub-Insp. Priya K.",
                          details:
                            "Added Knife_Evidence_01.jpg and CCTV_Footage_01.mp4 to digital evidence locker.",
                          icon: Camera,
                          color: "text-emerald-400 bg-emerald-500/15",
                        },
                        {
                          action: "Watchlist Status Modified",
                          time: "Sep 25, 2026, 09:10 AM",
                          officer: "Supervisor Officer",
                          details:
                            "Subject escalated to Priority Watchlist following recidivism review.",
                          icon: Shield,
                          color: "text-amber-400 bg-amber-500/15",
                        },
                      ].map((log, i) => (
                        <div
                          key={log.time}
                          className="flex items-start gap-3.5 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                        >
                          <div
                            className={cn(
                              "flex size-8 items-center justify-center rounded-lg shrink-0 mt-0.5",
                              log.color
                            )}
                          >
                            <log.icon className="size-4" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <h4 className="text-xs font-semibold text-foreground">
                                {log.action}
                              </h4>
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {log.time}
                              </span>
                            </div>
                            <p className="text-xs text-foreground/80 leading-relaxed">
                              {log.details}
                            </p>
                            <span className="text-[10px] text-muted-foreground">
                              By: {log.officer}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Side Card: Record Integrity */}
              <div className="xl:col-span-4 space-y-5">
                <Card className="rounded-xl border-2 border-border/80 bg-card/60 p-5 shadow-xs">
                  <CardHeader className="p-0 pb-3 border-b border-border/50">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                        <Info className="size-4" />
                      </div>
                      Record Cryptographic Integrity
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 pt-4 space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Database UUID</span>
                      <span className="font-mono text-foreground">{criminal.id.slice(0, 10)}...</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-border/50">
                      <span className="text-muted-foreground">Chain of Custody</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="size-3" />
                        Verified
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted-foreground">Record Status</span>
                      <span className="text-foreground font-semibold">Active Monitoring</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
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


    </div>
  );
}
