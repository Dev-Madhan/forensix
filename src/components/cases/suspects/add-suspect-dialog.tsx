"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  UserPlus,
  ScanFace,
  Brain,
  Check,
  ArrowRight,
  FileText,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SuspectItem, SuspectStatus, SuspectRole } from "./types";
import {
  MOCK_CASE_SKETCHES,
  type CaseSketchReference,
  type CaseSketchMatchCandidate,
} from "./mock-case-sketches";

interface AddSuspectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSuspect: (suspect: SuspectItem) => void;
  nextIndexNumber: number;
  existingSuspects?: SuspectItem[];
}

export function AddSuspectDialog({
  isOpen,
  onOpenChange,
  onAddSuspect,
  nextIndexNumber,
  existingSuspects = [],
}: AddSuspectDialogProps) {
  const [activeTab, setActiveTab] = useState<"ai-sketch" | "manual">(
    "ai-sketch"
  );

  // AI Match Tab State
  const [selectedSketchId, setSelectedSketchId] = useState<string>(
    MOCK_CASE_SKETCHES[0].id
  );
  const [candidateRoles, setCandidateRoles] = useState<
    Record<string, { status: SuspectStatus; role: SuspectRole }>
  >({});

  // Manual Form State
  const [manualName, setManualName] = useState("");
  const [manualAlias, setManualAlias] = useState("");
  const [manualStatus, setManualStatus] =
    useState<SuspectStatus>("Person of Interest");
  const [manualRole, setManualRole] =
    useState<SuspectRole>("Possible Associate");
  const [manualMatchConfidence, setManualMatchConfidence] = useState("75");
  const [manualLastSeenDate, setManualLastSeenDate] = useState("Oct 5, 2026");
  const [manualLastSeenTime, setManualLastSeenTime] = useState("10:30 AM");

  // Dynamic Dialog Height Smooth Transition
  const contentMeasureRef = React.useRef<HTMLDivElement>(null);
  const [measuredHeight, setMeasuredHeight] = useState<number | undefined>(undefined);
  const [viewportHeight, setViewportHeight] = useState<number>(800);

  // Track viewport height to clamp dialog within max-height constraints
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const updateViewport = () => setViewportHeight(window.innerHeight);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // Measure content height with ResizeObserver
  React.useEffect(() => {
    const el = contentMeasureRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const h = Math.round(entry.contentRect.height);
        if (h > 0) {
          setMeasuredHeight(h);
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  // Reset when dialog opens so it measures naturally
  React.useEffect(() => {
    if (isOpen) {
      setMeasuredHeight(undefined);
    }
  }, [isOpen]);

  // Calculate target height clamped to modal max-height bounds (88vh mobile / 90vh desktop)
  const isMobileScreen = typeof window !== "undefined" ? window.innerWidth < 640 : false;
  const maxAllowedBodyHeight = isMobileScreen
    ? Math.round(viewportHeight * 0.88 - 120)
    : Math.round(viewportHeight * 0.90 - 136);

  const targetBodyHeight = measuredHeight
    ? Math.min(measuredHeight, Math.max(300, maxAllowedBodyHeight))
    : undefined;

  const selectedSketch: CaseSketchReference =
    MOCK_CASE_SKETCHES.find((s) => s.id === selectedSketchId) ||
    MOCK_CASE_SKETCHES[0];

  const isCandidateInCase = (candidateName: string) => {
    return existingSuspects.some(
      (s) => s.name.toLowerCase() === candidateName.toLowerCase()
    );
  };

  const handleLinkCandidate = (candidate: CaseSketchMatchCandidate) => {
    const customConfig = candidateRoles[candidate.id] || {
      status: candidate.recommendedStatus,
      role: candidate.recommendedRole,
    };

    const newSuspect: SuspectItem = {
      id: `susp-${Date.now().toString().slice(-4)}`,
      numberIndex: String(nextIndexNumber).padStart(2, "0"),
      name: candidate.name,
      alias: candidate.alias,
      photo: candidate.photo,
      status: customConfig.status,
      role: customConfig.role,
      matchConfidence: candidate.matchConfidence,
      lastSeenDate: "Oct 4, 2026",
      lastSeenTime: "09:14 PM",
      dob: candidate.dob,
      age: candidate.age,
      gender: candidate.gender,
      nationality: "Indian",
      knownAddresses: candidate.knownAddresses,
      phone: candidate.phone,
      occupation: "Unknown",
      criminalRecord: candidate.priorCases,
      height: candidate.height,
      build: candidate.build,
      complexion: candidate.complexion,
      hairColor: candidate.hairColor,
      eyeColor: candidate.eyeColor,
      identifyingMarks: candidate.identifyingMarks,
      notes: `${candidate.llmReasoning} Matched from Composite ${selectedSketch.sketchNumber}.`,
    };

    onAddSuspect(newSuspect);
    toast.success(
      `Linked ${candidate.name} to case from ${selectedSketch.sketchNumber} (${candidate.matchConfidence}% confidence)`
    );
    onOpenChange(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) {
      toast.error("Suspect name is required");
      return;
    }

    const newSuspect: SuspectItem = {
      id: `susp-${Date.now().toString().slice(-4)}`,
      numberIndex: String(nextIndexNumber).padStart(2, "0"),
      name: manualName.trim(),
      alias: manualAlias.trim() ? `Alias: ${manualAlias.trim()}` : "Alias: None",
      photo: "/images/suspects/arun-prakash.jpg",
      status: manualStatus,
      role: manualRole,
      matchConfidence: Math.min(
        100,
        Math.max(0, parseInt(manualMatchConfidence, 10) || 50)
      ),
      lastSeenDate: manualLastSeenDate.trim() || "Oct 5, 2026",
      lastSeenTime: manualLastSeenTime.trim() || "12:00 PM",
      notes: "Newly added suspect profile linked to current investigation.",
    };

    onAddSuspect(newSuspect);
    toast.success(`Suspect ${newSuspect.name} added to case.`);
    onOpenChange(false);

    setManualName("");
    setManualAlias("");
    setManualStatus("Person of Interest");
    setManualRole("Possible Associate");
    setManualMatchConfidence("75");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1.25rem)] sm:w-full max-w-2xl lg:max-w-3xl max-h-[88vh] sm:max-h-[90vh] overflow-hidden flex flex-col rounded-xl sm:rounded-2xl border-2 border-border/80 bg-card/95 backdrop-blur-2xl p-0 shadow-2xl">

        {/* ── Fixed Header ── */}
        <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b-2 border-border/40">
          <div className="pr-7 sm:pr-0">
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-base sm:text-lg font-bold font-heading text-foreground tracking-tight">
                Add Suspect to Case
              </DialogTitle>
              <DialogDescription className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed mt-0.5">
                Link AI facial recognition matches from composite sketches or enter a manual profile.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Tab Switcher with Butter-Smooth Gliding Indicator */}
          <div className="relative grid grid-cols-2 gap-1.5 sm:flex sm:items-center sm:gap-2 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("ai-sketch")}
              className={cn(
                "relative inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors cursor-pointer w-full sm:w-auto z-10",
                activeTab === "ai-sketch"
                  ? "border-[#665AEF]/60 text-[#a594fd]"
                  : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {activeTab === "ai-sketch" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-[6px] bg-[#665AEF]/15 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <Sparkles className="size-3.5 text-[#665AEF] shrink-0" />
              <span className="sm:hidden truncate">AI Match</span>
              <span className="hidden sm:inline">From Case Sketch / AI Match</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("manual")}
              className={cn(
                "relative inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded-lg text-xs font-semibold border-2 transition-colors cursor-pointer w-full sm:w-auto z-10",
                activeTab === "manual"
                  ? "border-[#665AEF]/60 text-[#a594fd]"
                  : "border-border/60 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              {activeTab === "manual" && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 rounded-[6px] bg-[#665AEF]/15 -z-10"
                  transition={{ type: "spring", stiffness: 450, damping: 32 }}
                />
              )}
              <UserPlus className="size-3.5 shrink-0" />
              <span>Manual Entry</span>
            </button>
          </div>
        </div>

        {/* ── Dynamic Resizing Body with Buttery Smooth Height Transition ── */}
        <motion.div
          animate={{ height: targetBodyHeight ?? "auto" }}
          transition={{
            height: {
              duration: 0.32,
              ease: [0.22, 1, 0.36, 1],
            },
          }}
          className="overflow-y-auto overflow-x-hidden scrollbar-none [&::-webkit-scrollbar]:hidden max-h-[calc(88vh-7.5rem)] sm:max-h-[calc(90vh-8.5rem)]"
        >
          <div ref={contentMeasureRef} className="flow-root">
            <AnimatePresence mode="wait" initial={false}>
              {activeTab === "ai-sketch" ? (
                <motion.div
                  key="tab-ai-sketch"
                  initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="px-4 sm:px-6 py-4 space-y-4"
                >

              {/* Step 1: Sketch Selector */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <Label className="text-xs font-bold font-heading text-foreground flex items-center gap-1.5">
                    <FileText className="size-3.5 text-muted-foreground shrink-0" />
                    <span>1. Select Generated Case Sketch</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {MOCK_CASE_SKETCHES.length} sketches
                  </span>
                </div>

                {/* Mobile: horizontal scroll row | Desktop: 3-col grid */}
                <div className="flex gap-2 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 sm:gap-2.5 scrollbar-none [&::-webkit-scrollbar]:hidden">
                  {MOCK_CASE_SKETCHES.map((sketch) => {
                    const isSelected = sketch.id === selectedSketchId;
                    return (
                      <div
                        key={sketch.id}
                        onClick={() => setSelectedSketchId(sketch.id)}
                        className={cn(
                          "min-w-50 sm:min-w-0 p-2 sm:p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-2.5 shadow-2xs shrink-0 sm:shrink",
                          isSelected
                            ? "border-[#665AEF] bg-[#665AEF]/10 ring-1 ring-[#665AEF]/50"
                            : "border-border/70 bg-card/40 hover:border-border hover:bg-card/70"
                        )}
                      >
                        <div className="size-11 rounded-lg overflow-hidden border-2 border-border shrink-0 bg-black/40">
                          <img
                            src={sketch.sketchImageUrl}
                            alt={sketch.sketchNumber}
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-xs font-bold text-foreground truncate">
                              {sketch.sketchNumber}
                            </span>
                            <span className="text-[10px] font-semibold text-[#a594fd] sm:bg-[#665AEF]/15 sm:px-1.5 sm:py-px sm:rounded sm:border sm:border-[#665AEF]/30 shrink-0">
                              {sketch.candidates.length} Matches
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">
                            {sketch.witnessStatementRef}
                          </p>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
                            <Clock className="size-2.5 shrink-0" />
                            <span className="truncate">{sketch.dateGenerated}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Witness description */}
              <div className="p-2.5 sm:p-3 rounded-lg border-2 border-border/50 bg-muted/15 flex items-start gap-2.5">
                <Brain className="size-4 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0 space-y-0.5">
                  <span className="text-[11px] font-semibold text-foreground block">
                    Witness Extract ({selectedSketch.witnessStatementRef})
                  </span>
                  <p className="italic text-[11px] text-muted-foreground leading-relaxed">
                    &ldquo;{selectedSketch.witnessDescription}&rdquo;
                  </p>
                </div>
              </div>

              {/* Step 2: AI Candidates */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-1">
                  <Label className="text-xs font-bold font-heading text-foreground flex items-center gap-1.5">
                    <ScanFace className="size-3.5 text-[#665AEF] shrink-0" />
                    <span>2. Local LLM &amp; Vector Matches</span>
                  </Label>
                  <span className="text-[10px] text-emerald-400 font-medium shrink-0">
                    {selectedSketch.candidates.length} potential matches
                  </span>
                </div>

                <div className="space-y-3">
                  {selectedSketch.candidates.map((candidate) => {
                    const inCase = isCandidateInCase(candidate.name);
                    const config = candidateRoles[candidate.id] || {
                      status: candidate.recommendedStatus,
                      role: candidate.recommendedRole,
                    };

                    return (
                      <div
                        key={candidate.id}
                        className={cn(
                          "rounded-xl border-2 transition-all bg-card/60 overflow-hidden",
                          inCase
                            ? "border-border/50 opacity-75"
                            : "border-border/80 hover:border-[#665AEF]/50"
                        )}
                      >
                        {/* ─ Header: photo + identity + match badge ─ */}
                        <div className="flex items-center gap-3 px-3 pt-3 pb-2.5">
                          {/* Mugshot */}
                          <div className="size-11 rounded-md border-2 border-border overflow-hidden shrink-0 bg-black">
                            <img
                              src={candidate.photo}
                              alt={candidate.name}
                              className="size-full object-cover"
                            />
                          </div>

                          {/* Name + ID + alias */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="text-sm font-bold font-heading text-foreground truncate leading-tight">
                                {candidate.name}
                              </h4>
                              <span className="text-[10px] font-mono text-muted-foreground sm:bg-muted/60 sm:px-1.5 sm:py-px sm:rounded sm:border sm:border-border/50 shrink-0 leading-tight">
                                {candidate.criminalId}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                              {candidate.alias} · {candidate.priorCases}
                            </p>
                          </div>

                          {/* Confidence badge (text-only on mobile) */}
                          <span
                            className={cn(
                              "shrink-0 text-xs font-bold sm:px-2 sm:py-0.5 sm:rounded-md sm:border-2",
                              candidate.matchConfidence >= 85
                                ? "text-rose-400 sm:border-rose-500/40 sm:bg-rose-500/15"
                                : "text-amber-400 sm:border-amber-500/40 sm:bg-amber-500/15"
                            )}
                          >
                            {candidate.matchConfidence}%
                          </span>
                        </div>

                        {/* ─ Forensic comparison strip ─ */}
                        <div className="mx-3 mb-2.5 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/30 border border-border/40">
                          {/* Sketch thumbnail */}
                          <div className="relative size-9 rounded border border-border/70 overflow-hidden shrink-0 bg-black">
                            <img
                              src={selectedSketch.sketchImageUrl}
                              alt="Sketch"
                              className="size-full object-cover"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[7px] font-mono text-center text-white/80 leading-tight py-px">
                              Sketch
                            </span>
                          </div>

                          <div className="flex flex-col items-center shrink-0">
                            <ArrowRight className="size-3.5 text-[#665AEF]" />
                            <span className="text-[8px] text-muted-foreground font-mono leading-tight">
                              vector
                            </span>
                          </div>

                          {/* Record thumbnail */}
                          <div className="relative size-9 rounded border border-border/70 overflow-hidden shrink-0 bg-black">
                            <img
                              src={candidate.photo}
                              alt="Record"
                              className="size-full object-cover"
                            />
                            <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[7px] font-mono text-center text-white/80 leading-tight py-px">
                              Record
                            </span>
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-foreground leading-tight">
                              {candidate.matchConfidence}% Facial Match
                            </p>
                            <p className="text-[10px] text-muted-foreground leading-tight truncate">
                              {candidate.gender} · {candidate.age} · {candidate.build}
                            </p>
                          </div>
                        </div>

                        {/* ─ Action Controls: Status on top, button below ─ */}
                        <div className="mx-3 mb-2.5 flex flex-col gap-2">
                          <Select
                            value={config.status}
                            onValueChange={(val) => {
                              if (!val) return;
                              setCandidateRoles((prev) => ({
                                ...prev,
                                [candidate.id]: {
                                  status: val as SuspectStatus,
                                  role: config.role,
                                },
                              }));
                            }}
                          >
                            <SelectTrigger className="h-9 w-full text-xs rounded-md border-2 border-border bg-card/70">
                              <SelectValue placeholder="Set Status" />
                            </SelectTrigger>
                            <SelectContent className="rounded-md border-2 border-border bg-card/95 backdrop-blur-xl">
                              <SelectItem value="Primary Suspect">Primary Suspect</SelectItem>
                              <SelectItem value="Person of Interest">Person of Interest</SelectItem>
                              <SelectItem value="Cleared">Cleared</SelectItem>
                            </SelectContent>
                          </Select>

                          {inCase ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled
                              className="h-9 w-full text-xs rounded-md border-2 border-border/50 text-muted-foreground cursor-not-allowed"
                            >
                              <Check className="size-3.5 mr-1.5 text-emerald-400 shrink-0" />
                              Already Added to Case
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleLinkCandidate(candidate)}
                              className="h-9 w-full text-xs rounded-md font-semibold bg-[#665AEF] hover:bg-[#5749df] text-white cursor-pointer"
                            >
                              <UserPlus className="size-3.5 mr-1.5 shrink-0" />
                              Link Suspect to Case
                            </Button>
                          )}
                        </div>

                        {/* ─ AI Rationale ─ */}
                        <div className="mx-3 mb-3 flex items-start gap-2 px-2.5 py-2 rounded-lg border border-border/40 bg-muted/20">
                          <Sparkles className="size-3 text-[#665AEF] shrink-0 mt-0.5" />
                          <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                            <strong className="text-foreground font-semibold">AI: </strong>
                            {candidate.llmReasoning}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>

          ) : (
            /* ══ Tab 2: Manual Entry ══ */
            <motion.div
              key="tab-manual"
              initial={{ opacity: 0, y: 8, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <form onSubmit={handleManualSubmit} className="px-4 sm:px-6 py-4 space-y-3.5 sm:space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="suspect-name" className="text-xs font-semibold text-foreground">
                    Full Name <span className="text-rose-400">*</span>
                  </Label>
                  <Input
                    id="suspect-name"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    placeholder="e.g. Vikram Sharma"
                    required
                    className="h-9 text-xs rounded-md bg-background/50 border-2 border-border/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="suspect-alias" className="text-xs font-semibold text-foreground">
                    Alias / Street Name
                  </Label>
                  <Input
                    id="suspect-alias"
                    value={manualAlias}
                    onChange={(e) => setManualAlias(e.target.value)}
                    placeholder="e.g. Rocky, Vicky"
                    className="h-9 text-xs rounded-md bg-background/50 border-2 border-border/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="suspect-status" className="text-xs font-semibold text-foreground">
                    Suspect Status
                  </Label>
                  <Select
                    value={manualStatus}
                    onValueChange={(val) => {
                      if (val) setManualStatus(val as SuspectStatus);
                    }}
                  >
                    <SelectTrigger id="suspect-status" className="h-9 w-full text-xs rounded-md bg-background/50 border-2 border-border/80">
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-2 border-border bg-card/95 backdrop-blur-xl min-w-[max(var(--anchor-width),13rem)]">
                      <SelectItem value="Primary Suspect">Primary Suspect</SelectItem>
                      <SelectItem value="Person of Interest">Person of Interest</SelectItem>
                      <SelectItem value="Cleared">Cleared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="suspect-role" className="text-xs font-semibold text-foreground">
                    Investigative Role
                  </Label>
                  <Select
                    value={manualRole}
                    onValueChange={(val) => {
                      if (val) setManualRole(val as SuspectRole);
                    }}
                  >
                    <SelectTrigger id="suspect-role" className="h-9 w-full text-xs rounded-md bg-background/50 border-2 border-border/80">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-2 border-border bg-card/95 backdrop-blur-xl min-w-[max(var(--anchor-width),13rem)]">
                      <SelectItem value="Direct Involvement">Direct Involvement</SelectItem>
                      <SelectItem value="Possible Associate">Possible Associate</SelectItem>
                      <SelectItem value="Accomplice">Accomplice</SelectItem>
                      <SelectItem value="Informant">Informant</SelectItem>
                      <SelectItem value="Witness">Witness</SelectItem>
                      <SelectItem value="Under Investigation">Under Investigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="match-confidence" className="text-xs font-semibold text-foreground">
                    Match Confidence (%)
                  </Label>
                  <Input
                    id="match-confidence"
                    type="number"
                    min="0"
                    max="100"
                    value={manualMatchConfidence}
                    onChange={(e) => setManualMatchConfidence(e.target.value)}
                    placeholder="e.g. 75"
                    className="h-9 text-xs rounded-md bg-background/50 border-2 border-border/80"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="last-seen-date" className="text-xs font-semibold text-foreground">
                    Last Seen Date
                  </Label>
                  <Input
                    id="last-seen-date"
                    value={manualLastSeenDate}
                    onChange={(e) => setManualLastSeenDate(e.target.value)}
                    placeholder="Oct 5, 2026"
                    className="h-9 text-xs rounded-md bg-background/50 border-2 border-border/80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex sm:justify-end gap-2 pt-3 border-t-2 border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="h-9 text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-9 text-xs rounded-lg font-semibold bg-[#665AEF] hover:bg-[#5749df] text-white shadow-xs cursor-pointer"
                >
                  Save Suspect
                </Button>
              </div>
            </form>
          </motion.div>
          )}
            </AnimatePresence>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
