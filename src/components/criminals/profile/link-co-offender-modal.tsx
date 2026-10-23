"use client";

import React, { useState, useEffect, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SuspectAvatar } from "@/components/criminals/suspect-avatar";
import {
  getCandidateAssociatesAction,
  getCasesForSyndicateLinkAction,
  linkCoOffenderAction,
} from "@/features/criminals/syndicate-actions";
import {
  Search,
  Users,
  FolderKanban,
  Shield,
  ShieldAlert,
  Check,
  Loader2,
  AlertCircle,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface LinkCoOffenderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  primarySubject: {
    id: string;
    criminalId: string;
    name: string;
    mugshotUrl?: string | null;
  };
  onSuccess?: () => void;
}

export function LinkCoOffenderModal({
  open,
  onOpenChange,
  primarySubject,
  onSuccess,
}: LinkCoOffenderModalProps) {
  const [search, setSearch] = useState("");
  const [candidates, setCandidates] = useState<any[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);

  const [linkedCases, setLinkedCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("ACCOMPLICE");

  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Load cases and initial candidates when modal opens
  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedCandidate(null);
      return;
    }

    let isMounted = true;
    setIsLoadingCandidates(true);

    Promise.all([
      getCandidateAssociatesAction(primarySubject.id, ""),
      getCasesForSyndicateLinkAction(primarySubject.id),
    ])
      .then(([candidatesData, casesData]) => {
        if (!isMounted) return;
        setCandidates(candidatesData);
        const combined = [...casesData.linkedCases, ...casesData.otherCases];
        setLinkedCases(combined);
        if (combined.length > 0) {
          setSelectedCaseId(combined[0].id);
        }
      })
      .catch((err) => {
        console.error("Failed to load candidates/cases:", err);
        toast.error("Failed to load candidate database.");
      })
      .finally(() => {
        if (isMounted) setIsLoadingCandidates(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, primarySubject.id]);

  // Handle Search Input
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      setIsLoadingCandidates(true);
      getCandidateAssociatesAction(primarySubject.id, search)
        .then((data) => setCandidates(data))
        .catch(() => {})
        .finally(() => setIsLoadingCandidates(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [search, open, primarySubject.id]);

  const handleLinkSubmit = () => {
    if (!selectedCandidate) {
      toast.error("Please select an associate to link.");
      return;
    }
    if (!selectedCaseId) {
      toast.error("Please select a joint FIR case.");
      return;
    }

    startTransition(async () => {
      try {
        const result = await linkCoOffenderAction({
          subjectId: primarySubject.id,
          targetCriminalId: selectedCandidate.id,
          caseId: selectedCaseId,
          role: selectedRole,
        });

        toast.success(result.message || "Co-offender successfully linked!");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } catch (err: any) {
        toast.error(err?.message || "Failed to link co-offender.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-2xl border-2 border-border bg-card/95 backdrop-blur-xl shadow-2xl">
        {/* Header */}
        <div className="p-4 sm:p-5 pb-3 border-b border-border/60 bg-muted/20">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-[#665AEF]/15 text-[#a594fd] border border-[#665AEF]/30 shrink-0">
                <Users className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Link Syndicate Co-Conspirator
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Establish a verified associative nexus for {primarySubject.name} across mutual FIR files.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[68vh] overflow-y-auto">
          {/* Step 1: Select Suspect */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span>1. Select Suspect from Database</span>
              {selectedCandidate && (
                <span className="text-[10px] text-emerald-400 font-mono font-normal">
                  ✓ Selected: {selectedCandidate.name}
                </span>
              )}
            </label>

            {/* Search Input */}
            <div className="relative">
              <Search className="size-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by suspect name, alias, or ID (e.g. CR-04)..."
                className="pl-8.5 h-8.5 text-xs bg-background/60 border-border/80 rounded-lg"
              />
            </div>

            {/* Suspects Candidate List */}
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1 border border-border/60 rounded-xl p-1 bg-background/40">
              {isLoadingCandidates ? (
                <div className="p-6 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                  <Loader2 className="size-3.5 animate-spin text-[#665AEF]" />
                  <span>Searching forensic database...</span>
                </div>
              ) : candidates.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No matching suspects found.
                </div>
              ) : (
                candidates.map((c) => {
                  const isSelected = selectedCandidate?.id === c.id;
                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCandidate(c)}
                      className={cn(
                        "p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2 text-xs",
                        isSelected
                          ? "bg-[#665AEF]/15 border-[#665AEF] text-foreground"
                          : "bg-card/40 border-border/50 hover:bg-muted/50 hover:border-border"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <SuspectAvatar
                          mugshotUrl={c.mugshotUrl}
                          name={c.name}
                          size="sm"
                          className="size-7.5 rounded-md border border-border/70 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="font-semibold text-foreground truncate text-xs">
                            {c.name}
                          </h5>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {c.criminalId}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] uppercase font-mono px-1.5 py-0 h-4 font-semibold",
                            c.riskLevel === "CRITICAL"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : c.riskLevel === "HIGH"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          )}
                        >
                          {c.riskLevel}
                        </Badge>
                        {isSelected && <Check className="size-3.5 text-[#665AEF]" />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Step 2: Joint FIR Nexus */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <FolderKanban className="size-3.5 text-[#665AEF]" />
              <span>2. Shared FIR Investigation Linkage</span>
            </label>

            {linkedCases.length === 0 ? (
              <div className="p-3 rounded-lg border border-border/60 bg-muted/20 text-xs text-muted-foreground text-center">
                No active FIRs available in database.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-32 overflow-y-auto pr-1">
                {linkedCases.map((cs) => {
                  const isSelected = selectedCaseId === cs.id;
                  return (
                    <div
                      key={cs.id}
                      onClick={() => setSelectedCaseId(cs.id)}
                      className={cn(
                        "p-2 rounded-lg border transition-all cursor-pointer flex flex-col gap-0.5 text-xs",
                        isSelected
                          ? "bg-[#665AEF]/15 border-[#665AEF] text-foreground"
                          : "bg-card/40 border-border/50 hover:bg-muted/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#a594fd] text-[11px]">
                          {cs.caseNumber}
                        </span>
                        {isSelected && <Check className="size-3 text-[#665AEF]" />}
                      </div>
                      <p className="text-[11px] text-foreground/80 truncate">
                        {cs.title}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Alleged Role in Syndicate */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">
              3. Alleged Role & Association Type
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
              {[
                { id: "ACCOMPLICE", label: "Accomplice" },
                { id: "DIRECT_INVOLVEMENT", label: "Co-Conspirator" },
                { id: "POSSIBLE_ASSOCIATE", label: "Possible Associate" },
                { id: "INFORMANT", label: "Informant" },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setSelectedRole(r.id)}
                  className={cn(
                    "p-2 rounded-lg border text-xs font-medium transition-all cursor-pointer text-center",
                    selectedRole === r.id
                      ? "bg-[#665AEF] text-white border-[#665AEF] font-bold shadow-xs"
                      : "bg-muted/30 border-border/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border/60 bg-muted/10 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleLinkSubmit}
            disabled={isPending || !selectedCandidate || !selectedCaseId}
            className="h-8.5 px-3.5 bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold gap-1.5 shadow-sm shadow-[#665AEF]/25 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Linking to Syndicate...</span>
              </>
            ) : (
              <>
                <Plus className="size-3.5" />
                <span>Establish Syndicate Link</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
