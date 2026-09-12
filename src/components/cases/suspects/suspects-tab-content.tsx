"use client";

import React, { useState, useMemo } from "react";
import { SuspectsHeader } from "./suspects-header";
import { SuspectsStatsCards } from "./suspects-stats-cards";
import { SuspectsFilterToolbar } from "./suspects-filter-toolbar";
import { SuspectsTable } from "./suspects-table";
import { SuspectPreviewCard } from "./suspect-preview-card";
import { SuspectKeyInfoCard } from "./suspect-key-info-card";
import { SuspectAssociatedEvidenceCard } from "./suspect-associated-evidence-card";
import { SuspectAiInsightsCard } from "./suspect-ai-insights-card";
import { AddSuspectDialog } from "./add-suspect-dialog";
import { INITIAL_SUSPECTS } from "./mock-suspects";

import type { SuspectItem, SuspectStatus, SuspectRole } from "./types";
import { toast } from "sonner";
import { logCaseActivity } from "@/components/cases/activity";



interface SuspectsTabContentProps {
  caseNumber?: string;
}

export function SuspectsTabContent({ caseNumber }: SuspectsTabContentProps) {
  // 1. Suspects Dataset
  const [suspectsList, setSuspectsList] = useState<SuspectItem[]>(INITIAL_SUSPECTS);

  // 2. Currently selected suspect for the Right Column Inspector
  const [selectedSuspectId, setSelectedSuspectId] = useState<string>(
    INITIAL_SUSPECTS[0]?.id || "susp-01"
  );

  // Synchronize suspects with localStorage (saved additions and removals)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const cleanCase = (caseNumber || "default").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();

    try {
      const deletedIds = new Set<string>(
        JSON.parse(localStorage.getItem(`forensix_deleted_suspects_${cleanCase}`) || "[]")
      );
      const customSuspects: SuspectItem[] = JSON.parse(
        localStorage.getItem(`forensix_suspects_${cleanCase}`) || "[]"
      );

      const combined = [...customSuspects, ...INITIAL_SUSPECTS];
      const seen = new Set<string>();
      const deduped: SuspectItem[] = [];
      for (const s of combined) {
        if (!deletedIds.has(s.id) && !seen.has(s.id)) {
          seen.add(s.id);
          deduped.push(s);
        }
      }
      setSuspectsList(deduped);
      if (deduped.length > 0 && !deduped.some((s) => s.id === selectedSuspectId)) {
        setSelectedSuspectId(deduped[0].id);
      }
    } catch (e) {
      console.warn("Failed loading suspects from storage:", e);
    }
  }, [caseNumber]);

  // 3. Selection checkboxes
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // 4. Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | SuspectStatus>("ALL");
  const [roleFilter, setRoleFilter] = useState<"ALL" | SuspectRole>("ALL");

  // 5. Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // 6. Add Suspect Modal
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Stats computation
  const total = suspectsList.length;
  const primaryCount = useMemo(
    () => suspectsList.filter((s) => s.status === "Primary Suspect").length,
    [suspectsList]
  );
  const personOfInterestCount = useMemo(
    () => suspectsList.filter((s) => s.status === "Person of Interest").length,
    [suspectsList]
  );
  const clearedCount = useMemo(
    () => suspectsList.filter((s) => s.status === "Cleared").length,
    [suspectsList]
  );

  // Filtered Suspects List
  const filteredList = useMemo(() => {
    return suspectsList.filter((item) => {
      // Search matching
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAlias = item.alias.toLowerCase().includes(q);
        const matchesRole = item.role.toLowerCase().includes(q);
        const matchesStatus = item.status.toLowerCase().includes(q);
        if (!matchesName && !matchesAlias && !matchesRole && !matchesStatus) {
          return false;
        }
      }

      // Status filter matching
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }

      // Role filter matching
      if (roleFilter !== "ALL" && item.role !== roleFilter) {
        return false;
      }

      return true;
    });
  }, [suspectsList, searchQuery, statusFilter, roleFilter]);

  // Paginated Suspects List
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Selected suspect object for Inspector
  const selectedSuspect = useMemo(() => {
    return (
      suspectsList.find((s) => s.id === selectedSuspectId) ||
      suspectsList[0] ||
      INITIAL_SUSPECTS[0]
    );
  }, [suspectsList, selectedSuspectId]);

  // Selection handlers
  const handleToggleRowSelect = (id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (paginatedList.every((item) => selectedRowIds.has(item.id))) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(paginatedList.map((item) => item.id)));
    }
  };

  // Status Filter Handler (toggle filter if clicked again)
  const handleSelectStatusFilter = (status: "ALL" | SuspectStatus) => {
    if (statusFilter === status && status !== "ALL") {
      setStatusFilter("ALL");
    } else {
      setStatusFilter(status);
    }
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setRoleFilter("ALL");
    setCurrentPage(1);
  };

  // Update Suspect Status
  const handleUpdateStatus = (id: string, newStatus: SuspectStatus) => {
    setSuspectsList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    );
    toast.success(`Suspect status updated to ${newStatus}`);
  };

  // Delete / Remove Suspect
  const handleDeleteSuspect = (id: string) => {
    const target = suspectsList.find((s) => s.id === id);
    setSuspectsList((prev) => prev.filter((s) => s.id !== id));
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (selectedSuspectId === id) {
      const remaining = suspectsList.filter((s) => s.id !== id);
      if (remaining.length > 0) {
        setSelectedSuspectId(remaining[0].id);
      }
    }

    if (typeof window !== "undefined") {
      const cleanCase = (caseNumber || "default").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      try {
        const deletedIds = JSON.parse(
          localStorage.getItem(`forensix_deleted_suspects_${cleanCase}`) || "[]"
        );
        if (!deletedIds.includes(id)) {
          localStorage.setItem(
            `forensix_deleted_suspects_${cleanCase}`,
            JSON.stringify([...deletedIds, id])
          );
        }
        const customSuspects = JSON.parse(
          localStorage.getItem(`forensix_suspects_${cleanCase}`) || "[]"
        );
        localStorage.setItem(
          `forensix_suspects_${cleanCase}`,
          JSON.stringify(customSuspects.filter((s: any) => s.id !== id))
        );
      } catch (e) {
        console.warn("Failed updating deleted suspects in storage:", e);
      }
      window.dispatchEvent(new CustomEvent("forensix:suspects-updated"));
    }

    toast.info(`Suspect ${target?.name || id} removed from this case.`);

    logCaseActivity({
      caseNumber,
      action: "Removed Suspect",
      actionType: "DELETE",
      category: "Suspect",
      details: `Removed suspect ${target?.name || id} from case file.`,
    });
  };

  // Add new suspect handler
  const handleAddSuspect = (newSuspect: SuspectItem) => {
    setSuspectsList((prev) => [newSuspect, ...prev]);
    setSelectedSuspectId(newSuspect.id);

    if (typeof window !== "undefined") {
      const cleanCase = (caseNumber || "default").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
      try {
        const customSuspects = JSON.parse(
          localStorage.getItem(`forensix_suspects_${cleanCase}`) || "[]"
        );
        localStorage.setItem(
          `forensix_suspects_${cleanCase}`,
          JSON.stringify([newSuspect, ...customSuspects.filter((s: any) => s.id !== newSuspect.id)])
        );
        const deletedIds = JSON.parse(
          localStorage.getItem(`forensix_deleted_suspects_${cleanCase}`) || "[]"
        );
        if (deletedIds.includes(newSuspect.id)) {
          localStorage.setItem(
            `forensix_deleted_suspects_${cleanCase}`,
            JSON.stringify(deletedIds.filter((id: string) => id !== newSuspect.id))
          );
        }
      } catch (e) {
        console.warn("Failed saving suspect to storage:", e);
      }
      window.dispatchEvent(new CustomEvent("forensix:suspects-updated"));
    }

    logCaseActivity({
      caseNumber,
      action: "Added Suspect",
      actionType: "SUSPECT",
      category: "Suspect",
      details: `Added ${newSuspect.name} as ${newSuspect.status.toLowerCase()}.`,
    });
  };

  return (
    <div className="w-full space-y-6">
      {/* 2-Column Responsive Layout matching Evidence Tab */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4.5 items-start w-full">
        {/* Left Column: Suspects List, Stats, Filters & AI Insights (8 cols) */}
        <div className="xl:col-span-8 2xl:col-span-8 flex flex-col gap-3.5 min-w-0">
          {/* 1. Header Bar */}
          <SuspectsHeader
            totalCount={total}
            onAddClick={() => setIsAddDialogOpen(true)}
          />

          {/* 2. 4 Stat Cards Row */}
          <SuspectsStatsCards
            total={total}
            primaryCount={primaryCount}
            personOfInterestCount={personOfInterestCount}
            clearedCount={clearedCount}
            activeStatusFilter={statusFilter}
            onSelectStatusFilter={handleSelectStatusFilter}
          />

          {/* 3. Search & Filters Toolbar */}
          <SuspectsFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(st) => {
              setStatusFilter(st);
              setCurrentPage(1);
            }}
            roleFilter={roleFilter}
            onRoleFilterChange={(rf) => {
              setRoleFilter(rf);
              setCurrentPage(1);
            }}
            onResetFilters={handleResetFilters}
          />

          {/* 4. Suspects Data Table */}
          <SuspectsTable
            items={paginatedList}
            selectedSuspectId={selectedSuspectId}
            onSelectSuspect={(s) => setSelectedSuspectId(s.id)}
            selectedRowIds={selectedRowIds}
            onToggleRowSelect={handleToggleRowSelect}
            onToggleSelectAll={handleToggleSelectAll}
            onUpdateStatus={handleUpdateStatus}
            onDeleteSuspect={handleDeleteSuspect}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalCount={filteredList.length}
          />

          {/* 5. AI Insights Card */}
          <SuspectAiInsightsCard />
        </div>

        {/* Right Column: Suspect Profile Inspector, Key Info, Physical Description, Associated Evidence (4 cols) */}
        <div className="xl:col-span-4 2xl:col-span-4 flex flex-col gap-3.5 min-w-0">
          {/* Suspect Profile Preview Card */}
          <SuspectPreviewCard
            suspect={selectedSuspect}
            onUpdateStatus={handleUpdateStatus}
            onDeleteSuspect={handleDeleteSuspect}
          />

          {/* Key Information & Physical Description */}
          <SuspectKeyInfoCard suspect={selectedSuspect} />

          {/* Associated Evidence */}
          <SuspectAssociatedEvidenceCard
            evidenceList={selectedSuspect.associatedEvidence}
          />
        </div>
      </div>

      {/* Add Suspect Modal Dialog */}
      <AddSuspectDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddSuspect={handleAddSuspect}
        nextIndexNumber={suspectsList.length + 1}
        existingSuspects={suspectsList}
      />
    </div>
  );
}
