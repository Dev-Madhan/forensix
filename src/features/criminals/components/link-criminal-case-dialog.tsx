"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FolderPlus,
  Search,
  Check,
  ChevronDown,
  X,
  AlertCircle,
  FileText,
  Clock,
  ShieldAlert,
  UserCheck,
  Tag,
  ExternalLink,
  Sparkles,
  Loader2,
  Trash2,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { SuspectRole, SuspectCaseStatus } from "@prisma/client";
import {
  linkCriminalToCase,
  unlinkCriminalFromCase,
  searchCasesForLinking,
} from "@/features/criminals/actions";
import { getCaseSlug } from "@/features/criminals/slug";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface LinkCriminalCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  criminal: {
    id: string;
    criminalId?: string | null;
    firstName: string;
    lastName: string;
  };
  currentCase?: {
    id: string;
    caseNumber: string;
    title: string;
    priority?: string;
    status?: string;
    role?: SuspectRole;
    caseStatus?: SuspectCaseStatus;
  } | null;
  onSuccess?: () => void;
}

const ROLE_CONFIGS: Record<
  SuspectRole,
  { label: string; badge: string; color: string; desc: string }
> = {
  [SuspectRole.DIRECT_INVOLVEMENT]: {
    label: "Direct Involvement",
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    color: "bg-rose-500",
    desc: "Primary active perpetrator at crime scene",
  },
  [SuspectRole.POSSIBLE_ASSOCIATE]: {
    label: "Possible Associate",
    badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    color: "bg-amber-500",
    desc: "Identified accomplice or syndicate affiliate",
  },
  [SuspectRole.ACCOMPLICE]: {
    label: "Accomplice",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    color: "bg-orange-500",
    desc: "Aided in planning, getaway, or disposal",
  },
  [SuspectRole.INFORMANT]: {
    label: "Informant",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    color: "bg-emerald-500",
    desc: "Confidential human intelligence asset",
  },
  [SuspectRole.WITNESS]: {
    label: "Witness",
    badge: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    color: "bg-blue-500",
    desc: "Eyewitness giving judicial testimony",
  },
  [SuspectRole.UNDER_INVESTIGATION]: {
    label: "Under Investigation",
    badge: "bg-purple-500/15 text-[#C084FC] border-purple-500/30",
    color: "bg-[#665AEF]",
    desc: "Preliminary suspect pending evidence triage",
  },
};

const STATUS_CONFIGS: Record<
  SuspectCaseStatus,
  { label: string; badge: string; color: string }
> = {
  [SuspectCaseStatus.PRIMARY_SUSPECT]: {
    label: "Primary Suspect",
    badge: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    color: "bg-rose-500",
  },
  [SuspectCaseStatus.PERSON_OF_INTEREST]: {
    label: "Person of Interest",
    badge: "bg-purple-500/15 text-[#C084FC] border-purple-500/30",
    color: "bg-[#665AEF]",
  },
  [SuspectCaseStatus.ACCOMPLICE]: {
    label: "Accomplice",
    badge: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    color: "bg-orange-500",
  },
  [SuspectCaseStatus.CLEARED]: {
    label: "Cleared",
    badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    color: "bg-slate-500",
  },
  [SuspectCaseStatus.CONVICTED]: {
    label: "Convicted",
    badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    color: "bg-emerald-500",
  },
};

export function LinkCriminalCaseDialog({
  isOpen,
  onClose,
  criminal,
  currentCase,
  onSuccess,
}: LinkCriminalCaseDialogProps) {
  const fullName = `${criminal.firstName} ${criminal.lastName}`.trim();
  const criminalCode = criminal.criminalId || criminal.id;

  const [caseInput, setCaseInput] = useState("");
  const [selectedCase, setSelectedCase] = useState<{
    id: string;
    caseNumber: string;
    title: string;
    priority?: string;
    status?: string;
  } | null>(null);

  const [role, setRole] = useState<SuspectRole>(SuspectRole.UNDER_INVESTIGATION);
  const [status, setStatus] = useState<SuspectCaseStatus>(SuspectCaseStatus.PERSON_OF_INTEREST);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnlinking, setIsUnlinking] = useState(false);
  const [showUnlinkConfirm, setShowUnlinkConfirm] = useState(false);

  // Live Case Suggestions
  const [caseSuggestions, setCaseSuggestions] = useState<any[]>([]);
  const [isLoadingCases, setIsLoadingCases] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Hover states for smooth dropdown animations
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);
  const [hoveredStatus, setHoveredStatus] = useState<string | null>(null);

  // Populate from currentCase or reset when opened
  useEffect(() => {
    if (!isOpen) return;
    if (currentCase) {
      setSelectedCase({
        id: currentCase.id,
        caseNumber: currentCase.caseNumber,
        title: currentCase.title,
        priority: currentCase.priority,
        status: currentCase.status,
      });
      setCaseInput(currentCase.caseNumber);
      if (currentCase.role) setRole(currentCase.role);
      if (currentCase.caseStatus) setStatus(currentCase.caseStatus);
    } else {
      setSelectedCase(null);
      setCaseInput("");
      setRole(SuspectRole.UNDER_INVESTIGATION);
      setStatus(SuspectCaseStatus.PERSON_OF_INTEREST);
    }
    setNotes("");
  }, [isOpen, currentCase]);

  // Load initial cases when opened
  useEffect(() => {
    if (!isOpen) return;
    let isCancelled = false;

    async function loadInitial() {
      setIsLoadingCases(true);
      try {
        const results = await searchCasesForLinking("");
        if (!isCancelled) {
          setCaseSuggestions(results);
        }
      } catch {
        // Fallback silently
      } finally {
        if (!isCancelled) setIsLoadingCases(false);
      }
    }

    loadInitial();
    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  // Live search debounced
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(async () => {
      if (selectedCase && caseInput === selectedCase.caseNumber) return;
      setIsLoadingCases(true);
      try {
        const results = await searchCasesForLinking(caseInput);
        setCaseSuggestions(results);
      } catch {
        // Silent fallback
      } finally {
        setIsLoadingCases(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [caseInput, isOpen, selectedCase]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCase = (c: any) => {
    setSelectedCase(c);
    setCaseInput(c.caseNumber);
    setShowSuggestions(false);
  };

  const handleClearSelection = () => {
    setSelectedCase(null);
    setCaseInput("");
  };

  const handleConfirmUnlink = async () => {
    if (!currentCase) return;

    setIsUnlinking(true);
    try {
      const res = await unlinkCriminalFromCase(currentCase.id, criminal.id);
      if (res.error) {
        toast.error(`Unlink failed: ${res.error}`);
      } else {
        toast.success(`Unlinked ${fullName} from Case ${currentCase.caseNumber}`);
        setShowUnlinkConfirm(false);
        onSuccess?.();
        handleClose();
      }
    } catch {
      toast.error("Failed to detach suspect from case.");
    } finally {
      setIsUnlinking(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const finalCaseQuery = caseInput.trim();
    if (!finalCaseQuery) {
      toast.error("Please enter or select a valid Case Number or UUID");
      return;
    }

    setIsSubmitting(true);
    try {
      // If changing from an existing case to a different case, detach from old case first
      const isChangingCase =
        currentCase &&
        (selectedCase
          ? selectedCase.id !== currentCase.id
          : finalCaseQuery.toLowerCase() !== currentCase.caseNumber.toLowerCase() &&
            finalCaseQuery !== currentCase.id);

      if (isChangingCase) {
        await unlinkCriminalFromCase(currentCase.id, criminal.id);
      }

      const res = await linkCriminalToCase({
        caseId: finalCaseQuery,
        criminalId: criminal.id,
        role,
        status,
        notes: notes.trim() || undefined,
        matchConfidence: 0,
      });

      if (res.error) {
        toast.error(`Case linkage failed: ${res.error}`);
        setIsSubmitting(false);
        return;
      }

      const caseNumber = res.data?.case?.caseNumber || finalCaseQuery;
      toast.success(
        isChangingCase
          ? `Transferred case link to Case ${caseNumber}`
          : `Suspect ${fullName} associated with Case ${caseNumber}`,
        {
          description: `Role assigned: ${ROLE_CONFIGS[role].label} • Status: ${STATUS_CONFIGS[status].label}`,
        }
      );

      onSuccess?.();
      handleClose();
    } catch {
      toast.error("An unexpected error occurred while linking case.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isUnlinking) return;
    onClose();
    setTimeout(() => {
      setCaseInput("");
      setSelectedCase(null);
      setNotes("");
      setRole(SuspectRole.UNDER_INVESTIGATION);
      setStatus(SuspectCaseStatus.PERSON_OF_INTEREST);
      setShowSuggestions(false);
    }, 200);
  };

  const currentRoleConfig = ROLE_CONFIGS[role];
  const currentStatusConfig = STATUS_CONFIGS[status];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      maxWidth="max-w-lg"
      className="border-2 border-border/80 bg-black/95 backdrop-blur-2xl shadow-2xl rounded-2xl"
      title={
        <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0 pr-1">
          <FolderPlus className="size-4.5 sm:size-5 text-[#665AEF] shrink-0 mt-0.5 sm:mt-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                {currentCase ? "Change Case Association" : "Associate with Case"}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-[#665AEF]/20 text-[#a594fd] border border-[#665AEF]/40 uppercase tracking-wider shrink-0">
                {criminalCode}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-muted-foreground truncate mt-0.5">
              {currentCase ? (
                <span>
                  Currently linked to{" "}
                  <strong className="text-emerald-400 font-mono">
                    {currentCase.caseNumber}
                  </strong>
                  . Select another case to change.
                </span>
              ) : (
                <span>
                  Establish a verified judicial linkage for{" "}
                  <span className="text-foreground font-semibold">
                    {fullName}
                  </span>
                  .
                </span>
              )}
            </p>
          </div>
        </div>
      }
      footer={
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 w-full">
          {currentCase ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting || isUnlinking}
              onClick={() => setShowUnlinkConfirm(true)}
              className="h-10 sm:h-9 px-3 text-xs font-semibold rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-2 border-rose-500/30 cursor-pointer w-full sm:w-auto flex items-center justify-center gap-1.5"
            >
              {isUnlinking ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Unlinking...</span>
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5" />
                  <span>Unlink Case</span>
                </>
              )}
            </Button>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>CCTNS Judicial Ledger</span>
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto sm:ml-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting || isUnlinking}
              onClick={handleClose}
              className="h-10 sm:h-9 px-4 text-xs font-semibold rounded-lg border-2 border-border/80 bg-zinc-950/80 hover:bg-zinc-900 text-foreground cursor-pointer transition-colors flex-1 sm:flex-none justify-center"
            >
              Cancel
            </Button>

            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || isUnlinking || !caseInput.trim()}
              onClick={handleSubmit}
              className="h-10 sm:h-9 px-4 text-xs font-semibold rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white flex items-center justify-center gap-2 border-2 border-[#665AEF] shadow-md shadow-[#665AEF]/30 hover:shadow-[#665AEF]/50 transition-all cursor-pointer disabled:opacity-50 flex-1 sm:flex-none whitespace-nowrap"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>
                    {currentCase ? "Updating..." : "Linking..."}
                  </span>
                </>
              ) : (
                <>
                  <FolderPlus className="size-3.5" />
                  <span>
                    {currentCase ? "Change Case Link" : "Confirm Association"}
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {/* Case Search / Selector Box */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="size-3.5 text-[#a594fd]" />
              <span>FIR Case Docket / UUID <span className="text-rose-500">*</span></span>
            </Label>
            {selectedCase && (
              <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="size-3" /> Case Resolved
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              value={caseInput}
              onChange={(e) => {
                setCaseInput(e.target.value);
                setSelectedCase(null);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Search active cases or type FX-2026-###..."
              className="h-10 pl-9 pr-9 text-xs sm:text-sm font-mono border-2 border-border/80 bg-zinc-950/80 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] rounded-lg"
            />
            {caseInput && (
              <button
                type="button"
                onClick={handleClearSelection}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5 rounded"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Autocomplete Suggestions Menu */}
          <AnimatePresence>
            {showSuggestions && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border-2 border-border/90 bg-zinc-950 shadow-2xl overflow-hidden max-h-48 sm:max-h-56 overflow-y-auto no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden"
              >
                <div className="p-1.5 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-mono text-muted-foreground uppercase tracking-widest flex items-center justify-between border-b-2 border-border/60 pb-1.5 mb-1">
                    <span>Active Investigation Dockets</span>
                    {isLoadingCases && <Loader2 className="size-3 animate-spin text-[#a594fd]" />}
                  </div>

                  {caseSuggestions.length > 0 ? (
                    caseSuggestions.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCase(c)}
                        className={cn(
                          "px-2.5 py-2 rounded-lg cursor-pointer transition-colors flex items-center justify-between gap-2 text-xs",
                          selectedCase?.id === c.id
                            ? "bg-[#665AEF]/20 text-white border-2 border-[#665AEF]/50"
                            : "hover:bg-zinc-900/80 text-foreground"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-[11px]">{c.caseNumber}</span>
                            {c.priority && (
                              <span className={cn(
                                "text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border-2 uppercase",
                                c.priority === "CRITICAL" ? "bg-rose-500/15 text-rose-400 border-rose-500/30" : "bg-neutral-900 text-neutral-300 border-neutral-700"
                              )}>
                                {c.priority}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate mt-0.5">{c.title}</p>
                        </div>

                        {selectedCase?.id === c.id && (
                          <Check className="size-3.5 text-[#a594fd] shrink-0" />
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-muted-foreground">
                      No matching cases found. Press &ldquo;Confirm&rdquo; to auto-index case code <span className="font-mono text-white">&ldquo;{caseInput}&rdquo;</span>.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Case Preview Tag */}
        {selectedCase && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="p-2.5 rounded-lg border-2 border-zinc-800 bg-zinc-950 flex items-center justify-between gap-2 text-xs"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-mono font-bold text-[#a594fd] shrink-0">{selectedCase.caseNumber}:</span>
              <span className="text-foreground truncate font-medium">{selectedCase.title}</span>
            </div>
            <Link
              href={`/case-details/${getCaseSlug(selectedCase)}`}
              target="_blank"
              className="text-[11px] text-[#a594fd] hover:text-white underline inline-flex items-center gap-1 shrink-0 font-medium"
            >
              <span>Preview</span>
              <ExternalLink className="size-3" />
            </Link>
          </motion.div>
        )}

        {/* Row 2: Custom Dropdowns for Role & Status (ZERO NATIVE SELECTS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Suspect Role Dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Suspect Role
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-zinc-950/80 px-3 text-xs sm:text-sm font-medium hover:bg-zinc-900 text-foreground cursor-pointer flex items-center shadow-xs"
                  />
                }
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={cn("size-2 rounded-full shrink-0", currentRoleConfig.color)} />
                  <span className="truncate">{currentRoleConfig.label}</span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-1.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="bottom"
                sideOffset={6}
                className="w-(--anchor-width) min-w-48 max-w-[calc(100vw-2.5rem)] p-1.5 rounded-xl shadow-2xl bg-zinc-950 backdrop-blur-xl border-2 border-border/90 z-50"
                onPointerLeave={() => setHoveredRole(null)}
              >
                <div className="space-y-0.5">
                  {(Object.keys(ROLE_CONFIGS) as SuspectRole[]).map((r) => {
                    const cfg = ROLE_CONFIGS[r];
                    const isSelected = role === r;
                    return (
                      <DropdownMenuItem
                        key={r}
                        onPointerEnter={() => setHoveredRole(r)}
                        onClick={() => setRole(r)}
                        className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors bg-transparent! text-xs font-medium"
                      >
                        {hoveredRole === r && (
                          <motion.div
                            layoutId="dialog-role-hover"
                            className="absolute inset-0 z-[-1] rounded-lg bg-zinc-800/80"
                            transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
                          />
                        )}
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn("size-2 rounded-full shrink-0", cfg.color)} />
                          <div className="min-w-0">
                            <span className="block truncate font-semibold text-foreground">{cfg.label}</span>
                            <span className="block truncate text-[10px] text-muted-foreground">{cfg.desc}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="size-3.5 text-[#665AEF] shrink-0 ml-2" />}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Case Status Dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Case Status
            </Label>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-zinc-950/80 px-3 text-xs sm:text-sm font-medium hover:bg-zinc-900 text-foreground cursor-pointer flex items-center shadow-xs"
                  />
                }
              >
                <div className="flex items-center gap-2 truncate">
                  <span className={cn("size-2 rounded-full shrink-0", currentStatusConfig.color)} />
                  <span className="truncate">{currentStatusConfig.label}</span>
                </div>
                <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-1.5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="start"
                side="bottom"
                sideOffset={6}
                className="w-(--anchor-width) min-w-48 max-w-[calc(100vw-2.5rem)] p-1.5 rounded-xl shadow-2xl bg-zinc-950 backdrop-blur-xl border-2 border-border/90 z-50"
                onPointerLeave={() => setHoveredStatus(null)}
              >
                <div className="space-y-0.5">
                  {(Object.keys(STATUS_CONFIGS) as SuspectCaseStatus[]).map((st) => {
                    const cfg = STATUS_CONFIGS[st];
                    const isSelected = status === st;
                    return (
                      <DropdownMenuItem
                        key={st}
                        onPointerEnter={() => setHoveredStatus(st)}
                        onClick={() => setStatus(st)}
                        className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors bg-transparent! text-xs font-medium"
                      >
                        {hoveredStatus === st && (
                          <motion.div
                            layoutId="dialog-status-hover"
                            className="absolute inset-0 z-[-1] rounded-lg bg-zinc-800/80"
                            transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
                          />
                        )}
                        <div className="flex items-center gap-2">
                          <span className={cn("size-2 rounded-full shrink-0", cfg.color)} />
                          <span className="font-semibold text-foreground">{cfg.label}</span>
                        </div>
                        {isSelected && <Check className="size-3.5 text-[#665AEF] shrink-0" />}
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Investigative Notes */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Investigative Notes <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <span className="text-[10px] text-muted-foreground font-mono">{notes.length}/250</span>
          </div>
          <Input
            value={notes}
            maxLength={250}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Sighted near crime scene perimeter, ANPR hit at junction..."
            className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-zinc-950/80 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] rounded-lg"
          />
        </div>
      </form>

      {/* Sleek Confirm Dialog Matching Project Theme */}
      <ConfirmDialog
        isOpen={showUnlinkConfirm}
        onClose={() => setShowUnlinkConfirm(false)}
        onConfirm={handleConfirmUnlink}
        title={`Are you sure you want to detach ${fullName} from case ${currentCase?.caseNumber}?`}
        description="This action cannot be undone!"
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        icon={<Trash2 className="size-4" />}
        isLoading={isUnlinking}
      />
    </Modal>
  );
}
