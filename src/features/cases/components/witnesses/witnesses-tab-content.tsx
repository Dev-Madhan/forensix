"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { WitnessesStatsCards } from "./witnesses-stats-cards";
import { WitnessesHeader } from "./witnesses-header";
import { WitnessesTable } from "./witnesses-table";
import { WitnessCardGrid } from "./witness-card-grid";
import { EnrollWitnessDialog } from "./enroll-witness-dialog";
import { WitnessDossierModal } from "./witness-dossier-modal";
import { WitnessInquiryDialog } from "./witness-inquiry-dialog";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, Sparkles, PhoneCall, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { logCaseActivity } from "../activity";
import { deleteWitness, getWitnessCorroboration } from "../../witnesses/actions";
import { useWitnessRealtime } from "../../witnesses/use-witness-realtime";
import type { WitnessItem, WitnessInquiryItem } from "../../witnesses/types";

interface WitnessesTabContentProps {
  caseId: string;
  caseNumber?: string;
  initialWitnesses: WitnessItem[];
  onWitnessesCountChange?: (count: number) => void;
}

export function WitnessesTabContent({
  caseId,
  caseNumber,
  initialWitnesses = [],
  onWitnessesCountChange,
}: WitnessesTabContentProps) {
  const [witnesses, setWitnesses] = useState<WitnessItem[]>(initialWitnesses);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [availabilityFilter, setAvailabilityFilter] = useState("ALL");
  const [credibilityFilter, setCredibilityFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Modal Dialog States
  const [isEnrollOpen, setIsEnrollOpen] = useState(false);
  const [witnessToEdit, setWitnessToEdit] = useState<WitnessItem | null>(null);
  const [dossierWitness, setDossierWitness] = useState<WitnessItem | null>(null);
  const [inquiryWitness, setInquiryWitness] = useState<WitnessItem | null>(null);
  const [corroboration, setCorroboration] = useState<{
    hasMultiple: boolean;
    count: number;
    score: number;
    corroboratedFacts: string[];
    discrepancies: string[];
    summary: string;
  } | null>(null);

  // Sync state if initialWitnesses prop updates from server hydration
  useEffect(() => {
    if (initialWitnesses) {
      setWitnesses(initialWitnesses);
    }
  }, [initialWitnesses]);

  // Safely notify parent component of witness count changes via a passive effect.
  // This avoids mutating parent state during child render or state updater cycles.
  const onWitnessesCountChangeRef = useRef(onWitnessesCountChange);
  useEffect(() => {
    onWitnessesCountChangeRef.current = onWitnessesCountChange;
  });

  const prevCountRef = useRef(witnesses.length);
  useEffect(() => {
    if (prevCountRef.current !== witnesses.length) {
      prevCountRef.current = witnesses.length;
      onWitnessesCountChangeRef.current?.(witnesses.length);
    }
  }, [witnesses.length]);

  // Stable SSE callbacks — pure state updates without side-effects inside updaters
  const handleWitnessEnrolled = useCallback((newWitness: any) => {
    setWitnesses((prev) => {
      if (prev.some((w) => w.id === newWitness.id)) return prev;
      return [newWitness, ...prev];
    });
  }, []);

  const handleWitnessUpdated = useCallback((updatedWitness: any) => {
    setWitnesses((prev) =>
      prev.map((w) => (w.id === updatedWitness.id ? { ...w, ...updatedWitness } : w))
    );
  }, []);

  const handleWitnessDeleted = useCallback((deletedId: string) => {
    setWitnesses((prev) => prev.filter((w) => w.id !== deletedId));
  }, []);

  // Stable ref to inquiry handler
  const handleInquiryLoggedRef = useRef<((witnessId: string, inquiry: WitnessInquiryItem) => void) | null>(null);

  const handleRealtimeInquiry = useCallback(
    (witnessId: string, inq: WitnessInquiryItem) => {
      handleInquiryLoggedRef.current?.(witnessId, inq);
    },
    []
  );

  // Real-Time Server-Sent Events (SSE) Live Witness Synchronization
  useWitnessRealtime({
    caseId,
    onWitnessEnrolled: handleWitnessEnrolled,
    onWitnessUpdated: handleWitnessUpdated,
    onWitnessDeleted: handleWitnessDeleted,
    onInquiryLogged: handleRealtimeInquiry,
  });

  // Calculate Real-Time Corroboration Index
  useEffect(() => {
    let isMounted = true;
    if (witnesses.length >= 2) {
      getWitnessCorroboration(caseId).then((res) => {
        if (isMounted && res.success && res.data) {
          setCorroboration(res.data);
        }
      });
    } else {
      setCorroboration(null);
    }
    return () => {
      isMounted = false;
    };
  }, [witnesses, caseId]);

  // Filtered witnesses calculation
  const filteredWitnesses = useMemo(() => {
    return witnesses.filter((w) => {
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = w.name.toLowerCase().includes(q);
        const matchCode = w.witnessCode.toLowerCase().includes(q);
        const matchPhone = (w.primaryPhone || "").toLowerCase().includes(q);
        const matchStatement = (w.statement || "").toLowerCase().includes(q);
        const matchAlias = (w.alias || "").toLowerCase().includes(q);
        const matchCity = (w.city || "").toLowerCase().includes(q);
        if (!matchName && !matchCode && !matchPhone && !matchStatement && !matchAlias && !matchCity) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== "ALL" && w.witnessType !== typeFilter) {
        return false;
      }

      // Availability filter
      if (availabilityFilter !== "ALL" && w.availabilityStatus !== availabilityFilter) {
        return false;
      }

      // Credibility filter
      if (credibilityFilter !== "ALL" && w.credibility !== credibilityFilter) {
        return false;
      }

      return true;
    });
  }, [witnesses, searchTerm, typeFilter, availabilityFilter, credibilityFilter]);

  // Handlers
  const handleOpenEnroll = () => {
    setWitnessToEdit(null);
    setIsEnrollOpen(true);
  };

  const handleEditWitness = (witness: WitnessItem) => {
    setWitnessToEdit(witness);
    setIsEnrollOpen(true);
  };

  const handleViewDossier = (witness: WitnessItem) => {
    setDossierWitness(witness);
  };

  const handleOpenInquiry = (witness: WitnessItem) => {
    setInquiryWitness(witness);
  };

  const handleWitnessSaved = (savedWitness: WitnessItem) => {
    let isNew = false;
    setWitnesses((prev) => {
      const existsIndex = prev.findIndex((w) => w.id === savedWitness.id);
      isNew = existsIndex < 0;
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = savedWitness;
        return updated;
      }
      return [savedWitness, ...prev];
    });

    logCaseActivity({
      caseId,
      caseNumber,
      action: isNew ? "Enrolled Witness" : "Updated Witness",
      actionType: "WITNESS",
      category: "Witness",
      details: `${isNew ? "Enrolled" : "Updated"} witness ${savedWitness.name} (${savedWitness.witnessCode || "Registry"}).`,
    });

    // Also update active dossier view if open
    if (dossierWitness && dossierWitness.id === savedWitness.id) {
      setDossierWitness(savedWitness);
    }
  };

  const handleDeleteWitness = async (witness: WitnessItem) => {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete witness record ${witness.name} (${witness.witnessCode})?`
    );
    if (!confirmed) return;

    try {
      const res = await deleteWitness(witness.id, caseId);
      if (res.success) {
        toast.success(`Witness ${witness.name} removed from registry`);
        setWitnesses((prev) => prev.filter((w) => w.id !== witness.id));
        if (dossierWitness?.id === witness.id) {
          setDossierWitness(null);
        }

        logCaseActivity({
          caseId,
          caseNumber,
          action: "Witness Deleted",
          actionType: "DELETE",
          category: "Witness",
          details: `Removed witness ${witness.name} from registry.`,
        });
      } else {
        toast.error(res.error || "Failed to delete witness");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete witness");
    }
  };

  const handleInquiryLogged = (witnessId: string, inquiry: WitnessInquiryItem) => {
    const rawId = inquiry.id || (inquiry as any).inquiryId || `inq-${Date.now()}`;
    const normalizedInquiry: WitnessInquiryItem = {
      ...inquiry,
      id: rawId,
    };

    setWitnesses((prev) =>
      prev.map((w) => {
        if (w.id === witnessId) {
          // Avoid duplicate inquiry entries from simultaneous action resolution and SSE
          if (w.inquiries.some((item) => item.id === rawId)) {
            return w;
          }
          const updatedInquiries = [normalizedInquiry, ...w.inquiries];
          return {
            ...w,
            inquiriesCount: updatedInquiries.length,
            inquiries: updatedInquiries,
          };
        }
        return w;
      })
    );

    // Update active dossier modal if currently inspecting this witness
    if (dossierWitness && dossierWitness.id === witnessId) {
      setDossierWitness((prev) => {
        if (!prev) return null;
        if (prev.inquiries.some((item) => item.id === rawId)) {
          return prev;
        }
        const updatedInquiries = [normalizedInquiry, ...prev.inquiries];
        return {
          ...prev,
          inquiriesCount: updatedInquiries.length,
          inquiries: updatedInquiries,
        };
      });
    }
  };
  // Keep ref in sync so the stable handleRealtimeInquiry always calls the latest version
  useEffect(() => {
    handleInquiryLoggedRef.current = handleInquiryLogged;
  });

  return (
    <div className="space-y-4">
      {/* 1. Filter Toolbar & Actions (with border-2 controls) */}
      <WitnessesHeader
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        availabilityFilter={availabilityFilter}
        onAvailabilityFilterChange={setAvailabilityFilter}
        credibilityFilter={credibilityFilter}
        onCredibilityFilterChange={setCredibilityFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onEnrollClick={handleOpenEnroll}
        totalCount={witnesses.length}
        filteredCount={filteredWitnesses.length}
      />

      {/* Real-Time Multi-Witness Corroboration Matrix */}
      {corroboration && corroboration.hasMultiple && (
        <div className="rounded-xl border-2 border-emerald-500/30 bg-emerald-950/15 p-3 sm:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs shadow-2xs">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Corroboration: {corroboration.score}% Consensus
            </span>
            <span className="hidden sm:inline text-muted-foreground/60">•</span>
            <span className="text-muted-foreground text-[11px] sm:text-xs">
              {corroboration.corroboratedFacts[0] || `${witnesses.length} testimonies cross-referenced`}
            </span>
          </div>
          {corroboration.discrepancies.length > 0 && (
            <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 shrink-0 font-medium">
              {corroboration.discrepancies.length} Discrepancy Flagged
            </span>
          )}
        </div>
      )}

      {/* 2. Main Content: Table, Grid, or Empty State */}
      {witnesses.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/80 bg-card/20 p-6 sm:p-12 text-center flex flex-col items-center justify-center shadow-2xs">
          <h3 className="font-heading font-semibold text-base sm:text-lg text-foreground tracking-tight">
            No Witnesses Enrolled Yet
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-md mt-1.5 leading-relaxed">
            Record eyewitness testimonies and suspect descriptors to generate calibrated composite sketches and establish verifiable leads for cold-case longevity.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Button
              onClick={handleOpenEnroll}
              size="sm"
              className="h-9.5 px-4 text-xs font-semibold bg-[#665AEF] hover:bg-[#5748e6] text-white flex items-center gap-2 shadow-sm cursor-pointer rounded-xl transition-all"
            >
              <UserPlus className="size-4" />
              <span>Enroll First Witness</span>
            </Button>
          </div>
        </div>
      ) : filteredWitnesses.length === 0 ? (
        <div className="rounded-2xl border-2 border-border/80 bg-card/30 p-8 sm:p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No witnesses match your search query or filter criteria.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setTypeFilter("ALL");
              setAvailabilityFilter("ALL");
              setCredibilityFilter("ALL");
            }}
            className="h-9 px-4 text-xs mt-3 cursor-pointer rounded-xl border-2 border-border/80"
          >
            Clear Filters
          </Button>
        </div>
      ) : viewMode === "table" ? (
        <WitnessesTable
          witnesses={filteredWitnesses}
          caseId={caseId}
          caseNumber={caseNumber}
          onViewDossier={handleViewDossier}
          onEditWitness={handleEditWitness}
          onDeleteWitness={handleDeleteWitness}
          onLogRecontact={handleOpenInquiry}
        />
      ) : (
        <WitnessCardGrid
          witnesses={filteredWitnesses}
          caseId={caseId}
          onViewDossier={handleViewDossier}
          onEditWitness={handleEditWitness}
          onLogRecontact={handleOpenInquiry}
        />
      )}

      {/* 4. Modals */}
      <EnrollWitnessDialog
        isOpen={isEnrollOpen}
        onOpenChange={setIsEnrollOpen}
        caseId={caseId}
        caseNumber={caseNumber}
        witnessToEdit={witnessToEdit}
        onWitnessSaved={handleWitnessSaved}
      />

      <WitnessDossierModal
        isOpen={!!dossierWitness}
        onOpenChange={(open) => !open && setDossierWitness(null)}
        witness={dossierWitness}
        caseId={caseId}
        caseNumber={caseNumber}
        onLogRecontact={handleOpenInquiry}
        onEditWitness={handleEditWitness}
      />

      <WitnessInquiryDialog
        isOpen={!!inquiryWitness}
        onOpenChange={(open) => !open && setInquiryWitness(null)}
        witness={inquiryWitness}
        onInquiryLogged={handleInquiryLogged}
      />
    </div>
  );
}
