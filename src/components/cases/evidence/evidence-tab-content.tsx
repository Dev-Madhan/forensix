"use client";

import React, { useState, useMemo } from "react";
import { EvidenceHeader } from "./evidence-header";
import { EvidenceStatsCards } from "./evidence-stats-cards";
import { EvidenceFilterToolbar } from "./evidence-filter-toolbar";
import { EvidenceTable } from "./evidence-table";
import { EvidencePreviewCard } from "./evidence-preview-card";
import { EvidenceAiAnalysisCard } from "./evidence-ai-analysis-card";
import { RelatedEvidenceCard } from "./related-evidence-card";
import { EvidenceUploadDialog } from "./evidence-upload-dialog";
import { EvidenceMediaModal } from "./evidence-media-modal";
import { MOCK_EVIDENCE_ITEMS } from "./mock-evidence";
import type {
  EvidenceItem,
  EvidenceType,
  EvidenceStatus,
  EvidenceSource,
} from "./types";
import { toast } from "sonner";
import { logCaseActivity } from "@/components/cases/activity";



interface EvidenceTabContentProps {
  caseNumber?: string;
}

export function EvidenceTabContent({ caseNumber }: EvidenceTabContentProps) {
  // 1. Evidence dataset
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(MOCK_EVIDENCE_ITEMS);

  // 2. Currently active / selected evidence item for the Right Column Inspector
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>("01");

  // 3. Selection checkboxes
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // 4. Filtering state
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ALL" | EvidenceType>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | EvidenceStatus>("ALL");
  const [sourceFilter, setSourceFilter] = useState<"ALL" | EvidenceSource>("ALL");
  const [dateRange, setDateRange] = useState("Date Range");

  // 5. Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // 6. Modal dialogs
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState<EvidenceItem | null>(null);

  // 7. Media frame index for the preview card (< > arrows)
  const [mediaFrameIndex, setMediaFrameIndex] = useState(1);
  const totalMediaFrames = 4;

  // Compute metric cards stats
  const totalCount = evidenceList.length;
  const verifiedCount = useMemo(
    () => evidenceList.filter((e) => e.status === "Verified").length,
    [evidenceList]
  );
  const underReviewCount = useMemo(
    () => evidenceList.filter((e) => e.status === "Under Review").length,
    [evidenceList]
  );
  const flaggedCount = useMemo(
    () => evidenceList.filter((e) => e.status === "Flagged").length,
    [evidenceList]
  );

  // Filtered evidence list
  const filteredList = useMemo(() => {
    return evidenceList.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesSource = item.source.toLowerCase().includes(q);
        const matchesType = item.type.toLowerCase().includes(q);
        const matchesAssignee = item.addedBy.name.toLowerCase().includes(q);
        if (
          !matchesName &&
          !matchesDesc &&
          !matchesSource &&
          !matchesType &&
          !matchesAssignee
        ) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== "ALL" && item.type !== typeFilter) {
        return false;
      }

      // Status filter
      if (statusFilter !== "ALL" && item.status !== statusFilter) {
        return false;
      }

      // Source filter
      if (sourceFilter !== "ALL" && item.source !== sourceFilter) {
        return false;
      }

      return true;
    });
  }, [evidenceList, searchQuery, typeFilter, statusFilter, sourceFilter]);

  // Paginated list
  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const paginatedList = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredList.slice(start, start + pageSize);
  }, [filteredList, currentPage, pageSize]);

  // Selected item object
  const selectedEvidence = useMemo(() => {
    return (
      evidenceList.find((e) => e.id === selectedEvidenceId) ||
      evidenceList[0] ||
      MOCK_EVIDENCE_ITEMS[0]
    );
  }, [evidenceList, selectedEvidenceId]);

  // Related evidence items (picks items 03, 08, 07, 05 as shown in reference: Suspect_Image_02, Vehicle_Image_01, Store_Receipt, Weapon_01)
  const relatedItems = useMemo(() => {
    const preferredIds = ["03", "08", "07", "05"];
    const found = preferredIds
      .map((id) => evidenceList.find((e) => e.id === id))
      .filter(Boolean) as EvidenceItem[];
    if (found.length >= 4) return found;
    // Fallback if some deleted or uploaded
    const remaining = evidenceList.filter(
      (e) => !found.some((f) => f.id === e.id)
    );
    return [...found, ...remaining].slice(0, 4);
  }, [evidenceList]);

  // Handlers
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
    if (paginatedList.every((i) => selectedRowIds.has(i.id))) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(paginatedList.map((i) => i.id)));
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setTypeFilter("ALL");
    setStatusFilter("ALL");
    setSourceFilter("ALL");
    setDateRange("Date Range");
    setCurrentPage(1);
  };

  const handleAddEvidence = (item: EvidenceItem) => {
    setEvidenceList((prev) => [item, ...prev]);
    setSelectedEvidenceId(item.id);

    // Dispatch real-time activity for this case
    logCaseActivity({
      caseNumber,
      action: "Added Evidence",
      actionType: "EVIDENCE",
      category: "Evidence",
      details: `Added ${item.name} to the case.`,
      user: {
        name: item.addedBy.name,
        role: "Investigator",
        avatar: item.addedBy.avatar,
        initials: item.addedBy.initials,
      },
    });
  };

  const handlePlayMedia = (item: EvidenceItem) => {
    setActiveModalItem(item);
    setIsMediaModalOpen(true);
  };

  const handlePrevMedia = () => {
    setMediaFrameIndex((prev) => (prev <= 1 ? totalMediaFrames : prev - 1));
  };

  const handleNextMedia = () => {
    setMediaFrameIndex((prev) => (prev >= totalMediaFrames ? 1 : prev + 1));
  };

  return (
    <div className="w-full space-y-6">
      {/* 2-Column Responsive Layout strictly matching the reference screenshot */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4.5 items-start w-full">
        {/* Left Column: Evidence List, Stats & Filters (8 cols) */}
        <div className="xl:col-span-8 2xl:col-span-8 flex flex-col gap-3.5 min-w-0">
          {/* 1. Evidence Header Bar */}
          <EvidenceHeader
            totalCount={totalCount}
            onAddClick={() => setIsUploadOpen(true)}
          />

          {/* 2. 4 Stat Cards Row */}
          <EvidenceStatsCards
            total={totalCount}
            verified={verifiedCount}
            underReview={underReviewCount}
            flagged={flaggedCount}
            activeStatusFilter={statusFilter}
            onSelectStatusFilter={(st) => {
              setStatusFilter(st);
              setCurrentPage(1);
            }}
          />

          {/* 3. Search & Filters Toolbar */}
          <EvidenceFilterToolbar
            searchQuery={searchQuery}
            onSearchChange={(q) => {
              setSearchQuery(q);
              setCurrentPage(1);
            }}
            typeFilter={typeFilter}
            onTypeFilterChange={(t) => {
              setTypeFilter(t);
              setCurrentPage(1);
            }}
            statusFilter={statusFilter}
            onStatusFilterChange={(s) => {
              setStatusFilter(s);
              setCurrentPage(1);
            }}
            sourceFilter={sourceFilter}
            onSourceFilterChange={(src) => {
              setSourceFilter(src);
              setCurrentPage(1);
            }}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            onResetFilters={handleResetFilters}
          />

          {/* 4. Evidence Data Table */}
          <EvidenceTable
            items={paginatedList}
            selectedEvidenceId={selectedEvidenceId}
            onSelectEvidence={(item) => setSelectedEvidenceId(item.id)}
            selectedRowIds={selectedRowIds}
            onToggleRowSelect={handleToggleRowSelect}
            onToggleSelectAll={handleToggleSelectAll}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalCount={filteredList.length}
          />
        </div>

        {/* Right Column: Evidence Preview, AI Analysis, Related Evidence (4 cols) */}
        <div className="xl:col-span-4 2xl:col-span-4 flex flex-col gap-3.5 min-w-0">
          {/* 1. Evidence Preview Card */}
          <EvidencePreviewCard
            item={selectedEvidence}
            mediaIndex={mediaFrameIndex}
            totalMedia={totalMediaFrames}
            onPrevMedia={handlePrevMedia}
            onNextMedia={handleNextMedia}
            onPlayMedia={handlePlayMedia}
          />

          {/* 2. AI Analysis Card */}
          <EvidenceAiAnalysisCard
            analysis={selectedEvidence.aiAnalysis}
            evidenceId={selectedEvidence.id}
            onViewFullAnalysis={() => {
              toast.info(
                `Full AI match confidence matrix: ${selectedEvidence.aiAnalysis.title} (${selectedEvidence.aiAnalysis.score}%)`
              );
            }}
          />

          {/* 3. Related Evidence Card */}
          <RelatedEvidenceCard
            items={relatedItems}
            currentSelectedId={selectedEvidenceId}
            onSelectEvidence={(item) => setSelectedEvidenceId(item.id)}
            onViewAllRelated={() => {
              toast.info("Displaying all 4 related forensic items");
            }}
          />
        </div>
      </div>

      {/* Upload Evidence Dialog */}
      <EvidenceUploadDialog
        open={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        onAddEvidence={handleAddEvidence}
      />

      {/* Media Player / Inspector Modal */}
      <EvidenceMediaModal
        item={activeModalItem}
        open={isMediaModalOpen}
        onOpenChange={setIsMediaModalOpen}
      />
    </div>
  );
}
