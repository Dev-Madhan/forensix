"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Folder,
  FileText,
  Plus,
  Clock,
  Shield,
  Users,
  Database,
  Download,
  Tag,
  CheckCircle2,
  FileSpreadsheet,
  Film,
  Fingerprint,
  Layers,
  History,
  Send,
  X,
  ChevronRight,
  MapPin,
  Calendar,
  AlertTriangle,
  User,
  Activity,
  ArrowRight,
  Edit,
} from "lucide-react";
import type { ResolvedCaseDetail } from "@/features/cases/resolve-case";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { resolveCaseLocation } from "@/lib/case-location-resolver";
import { CaseStatusCard } from "@/components/cases/case-status-card";
import { CaseKeyDetailsCard } from "@/components/cases/case-key-details-card";
import { CaseIncidentMediaCard } from "@/components/cases/case-incident-media-card";
import { CaseIncidentLocationCard } from "@/components/cases/case-incident-location-card";
import { EvidenceTabContent } from "@/components/cases/evidence/evidence-tab-content";

interface CaseDetailsTabsProps {
  caseData: ResolvedCaseDetail;
}

const tabContentVariants = {
  initial: {
    opacity: 0,
    y: 6,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: "easeIn" as const,
    },
  },
};

export function CaseDetailsTabs({ caseData }: CaseDetailsTabsProps) {
  const { data: session } = authClient.useSession();
  const resolvedLoc = React.useMemo(
    () => resolveCaseLocation(caseData),
    [caseData]
  );
  const assignedUserName =
    caseData.assignedToName ||
    session?.user?.name ||
    "Madhan Kumar";
  const assignedUserAvatar = session?.user?.image || undefined;
  const assignedUserInitials =
    assignedUserName
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";

  const [activeTab, setActiveTab] = useState("overview");

  const tabs = React.useMemo(
    () => [
      { id: "overview", label: "Overview" },
      { id: "evidence", label: `Evidence (${caseData.evidenceCount || 8})` },
      { id: "suspects", label: `Suspects (${caseData.suspectsCount || 2})` },
      { id: "activity", label: "Activity Log" },
    ],
    [caseData.evidenceCount, caseData.suspectsCount]
  );

  // Interactive tags state
  const [tags, setTags] = useState<string[]>(
    caseData.tags || ["Robbery", "Theft", "CCTV", "Armed", "Commercial Area"]
  );
  const [newTagInput, setNewTagInput] = useState("");
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Interactive notes state
  const [notes, setNotes] = useState([
    {
      id: "1",
      author: "Arjun Karthik",
      role: "Lead Investigator",
      avatar: "/images/avatar-investigator.jpg",
      initials: "AK",
      timestamp: "Oct 5, 2026, 10:22 AM",
      content: "Possible link to similar theft cases in nearby areas.",
    },
    {
      id: "2",
      author: "Priya Nair",
      role: "Digital Forensics",
      avatar: "/images/avatar-analyst.jpg",
      initials: "PN",
      timestamp: "Oct 4, 2026, 09:40 PM",
      content: "CCTV shows suspect wearing a black hoodie and carrying a bag.",
    },
  ]);
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTag = newTagInput.trim();
    if (!cleanTag) return;
    if (tags.includes(cleanTag)) {
      toast.info("Tag already exists");
      return;
    }
    setTags([...tags, cleanTag]);
    setNewTagInput("");
    setIsAddingTag(false);
    toast.success(`Tag "${cleanTag}" added`);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
    toast.info(`Tag "${tagToRemove}" removed`);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const newNote = {
      id: Date.now().toString(),
      author: caseData.assignedToName?.split(" ")[0] || "Arjun Karthik",
      role: "Lead Investigator",
      avatar: "/images/avatar-investigator.jpg",
      initials: "AK",
      timestamp: new Date().toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      content: newNoteText.trim(),
    };

    setNotes([newNote, ...notes]);
    setNewNoteText("");
    setIsAddingNote(false);
    toast.success("Investigative case note added");
  };

  // Status styling for Case Information: use only text color, remove background & border
  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes("investigation")) {
      return (
        <span className="text-xs sm:text-sm font-semibold text-[#C084FC]">
          Under Investigation
        </span>
      );
    }
    if (s.includes("open")) {
      return (
        <span className="text-xs sm:text-sm font-semibold text-blue-400">
          Open
        </span>
      );
    }
    if (s.includes("solved") || s.includes("closed")) {
      return (
        <span className="text-xs sm:text-sm font-semibold text-emerald-400">
          {status}
        </span>
      );
    }
    return (
      <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
        {status}
      </span>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* Tab Navigation List: Buttery Smooth Framer Motion Tabs */}
      <div className="relative border-b border-border/60 pb-px">
        <div
          role="tablist"
          aria-label="Case details tabs"
          className="flex w-full justify-start overflow-x-auto no-scrollbar gap-1 sm:gap-2 h-11 px-0 relative"
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`case-tab-${tab.id}`}
                aria-controls={`case-tabpanel-${tab.id}`}
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={(e) => {
                  const currentIndex = tabs.findIndex((t) => t.id === tab.id);
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    const nextTab = tabs[(currentIndex + 1) % tabs.length];
                    setActiveTab(nextTab.id);
                    document.getElementById(`case-tab-${nextTab.id}`)?.focus();
                  } else if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    const prevTab = tabs[(currentIndex - 1 + tabs.length) % tabs.length];
                    setActiveTab(prevTab.id);
                    document.getElementById(`case-tab-${prevTab.id}`)?.focus();
                  }
                }}
                className={cn(
                  "relative inline-flex items-center justify-center px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#665AEF]/50",
                  isActive
                    ? "text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <span className="relative z-10">{tab.label}</span>

                {/* Sliding Active Underline Indicator Bar */}
                {isActive && (
                  <motion.div
                    layoutId="case-active-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#665AEF] rounded-full z-10"
                    transition={{
                      type: "spring",
                      stiffness: 400,
                      damping: 32,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content Panels with Smooth AnimatePresence */}
      <div className="w-full min-h-[450px]">
        <AnimatePresence mode="wait" initial={false}>
          {/* 1. OVERVIEW TAB PANEL */}
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              role="tabpanel"
              id="case-tabpanel-overview"
              aria-labelledby="case-tab-overview"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="outline-none"
            >
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
                <div className="xl:col-span-8 2xl:col-span-8 space-y-6 min-w-0">
                  {/* A. 4 Quick Stat Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    {/* Card 1: Evidence Files */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      <Card
                        onClick={() => setActiveTab("evidence")}
                        className="group border border-border/80 bg-card/40 hover:bg-card/70 hover:border-border transition-all p-3.5 sm:p-4 rounded-xl cursor-pointer shadow-2xs flex flex-col justify-between h-full"
                      >
                        <div className="flex items-center justify-between">
                          <Folder className="size-5 text-[#665AEF] group-hover:scale-110 transition-transform" />
                          <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="mt-3">
                          <span className="text-2xl font-bold font-heading text-foreground block leading-tight">
                            {caseData.evidenceCount || 8}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium block mt-1 truncate">
                            Evidence Files
                          </span>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Card 2: Suspects Linked */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      <Card
                        onClick={() => setActiveTab("suspects")}
                        className="group border border-border/80 bg-card/40 hover:bg-card/70 hover:border-border transition-all p-3.5 sm:p-4 rounded-xl cursor-pointer shadow-2xs flex flex-col justify-between h-full"
                      >
                        <div className="flex items-center justify-between">
                          <Users className="size-5 text-[#665AEF] group-hover:scale-110 transition-transform" />
                          <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="mt-3">
                          <span className="text-2xl font-bold font-heading text-foreground block leading-tight">
                            {caseData.suspectsCount || 2}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium block mt-1 truncate">
                            Suspects Linked
                          </span>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Card 3: Related Records */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      <Card className="group border border-border/80 bg-card/40 hover:bg-card/70 hover:border-border transition-all p-3.5 sm:p-4 rounded-xl cursor-pointer shadow-2xs flex flex-col justify-between h-full">
                        <div className="flex items-center justify-between">
                          <Database className="size-5 text-[#665AEF] group-hover:scale-110 transition-transform" />
                          <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="mt-3">
                          <span className="text-2xl font-bold font-heading text-foreground block leading-tight">
                            3
                          </span>
                          <span className="text-xs text-muted-foreground font-medium block mt-1 truncate">
                            Related Records
                          </span>
                        </div>
                      </Card>
                    </motion.div>

                    {/* Card 4: Investigation Notes */}
                    <motion.div
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="h-full"
                    >
                      <Card
                        onClick={() => {
                          const el = document.getElementById("case-notes-section");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="group border border-border/80 bg-card/40 hover:bg-card/70 hover:border-border transition-all p-3.5 sm:p-4 rounded-xl cursor-pointer shadow-2xs flex flex-col justify-between h-full"
                      >
                        <div className="flex items-center justify-between">
                          <FileText className="size-5 text-[#665AEF] group-hover:scale-110 transition-transform" />
                          <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                        </div>
                        <div className="mt-3">
                          <span className="text-2xl font-bold font-heading text-foreground block leading-tight">
                            {notes.length}
                          </span>
                          <span className="text-xs text-muted-foreground font-medium block mt-1 truncate">
                            Investigation Notes
                          </span>
                        </div>
                      </Card>
                    </motion.div>
                  </div>

          {/* B. Two Side-by-Side Cards: Case Information & Case Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Case Information */}
            <Card className="border border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                  Case Information
                </CardTitle>
                <CardAction>
                  <Link
                    href={`/case-details/${caseData.caseNumber}/edit`}
                    className="inline-flex items-center gap-1.5 h-7.5 px-3 rounded-lg border-2 border-border/80 bg-card/60 text-xs font-medium hover:bg-muted/60 hover:text-foreground text-foreground cursor-pointer shadow-2xs transition-colors"
                  >
                    <Edit className="size-3 text-muted-foreground" />
                    <span>Edit Case</span>
                  </Link>
                </CardAction>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                <div className="space-y-2.5 text-xs sm:text-sm">
                  {/* Case ID */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Fingerprint className="size-3.5 shrink-0" />
                      <span>Case ID</span>
                    </div>
                    <span className="font-mono font-medium text-foreground">
                      {caseData.caseNumber}
                    </span>
                  </div>

                  {/* Case Title */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="size-3.5 shrink-0" />
                      <span>Case Title</span>
                    </div>
                    <span className="font-medium text-foreground truncate max-w-[180px]">
                      {caseData.title}
                    </span>
                  </div>

                  {/* Case Type */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="size-3.5 shrink-0" />
                      <span>Case Type</span>
                    </div>
                    <span className="font-medium text-foreground text-xs sm:text-sm">
                      {caseData.caseType}
                    </span>
                  </div>

                  {/* Date Reported */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="size-3.5 shrink-0" />
                      <span>Date Reported</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {caseData.dateReported}
                    </span>
                  </div>

                  {/* Time of Incident */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="size-3.5 shrink-0" />
                      <span>Time of Incident</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {caseData.timeOfIncident}
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="size-3.5 shrink-0" />
                      <span>Location</span>
                    </div>
                    <span className="font-medium text-foreground">
                      {resolvedLoc.title
                        ? `${resolvedLoc.title}, ${resolvedLoc.city}`
                        : caseData.location}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Activity className="size-3.5 shrink-0" />
                      <span>Status</span>
                    </div>
                    <div>{renderStatusBadge(caseData.status)}</div>
                  </div>

                  {/* Date Closed (if Solved/Closed) */}
                  {(caseData.status?.toLowerCase().includes("closed") ||
                    caseData.status?.toLowerCase().includes("solved") ||
                    caseData.status?.toLowerCase().includes("resolved") ||
                    caseData.rawStatus === "CLOSED") && (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="size-3.5 text-emerald-400 shrink-0" />
                        <span>Date Closed</span>
                      </div>
                      <span className="font-medium text-foreground text-xs sm:text-sm">
                        {caseData.closedDate || "Oct 3, 2026"}
                      </span>
                    </div>
                  )}

                  {/* Priority */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertTriangle className="size-3.5 shrink-0" />
                      <span>Priority</span>
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-rose-400">
                      {caseData.priority === "HIGH" || caseData.priority === "CRITICAL"
                        ? "High"
                        : caseData.priority}
                    </span>
                  </div>

                  {/* Assigned To */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="size-3.5 shrink-0" />
                      <span>Assigned To</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Avatar size="sm" className="size-5 border border-border">
                        {assignedUserAvatar && (
                          <AvatarImage src={assignedUserAvatar} alt={assignedUserName} />
                        )}
                        <AvatarFallback className="text-[9px] bg-primary/20 text-primary font-medium">
                          {assignedUserInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span
                        className="font-medium text-foreground text-xs sm:text-sm"
                        suppressHydrationWarning
                      >
                        {assignedUserName}
                      </span>
                    </div>
                  </div>

                  {/* Created By */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Shield className="size-3.5 shrink-0" />
                      <span>Created By</span>
                    </div>
                    <span className="font-medium text-foreground text-xs sm:text-sm">
                      {caseData.createdBy || "System"}
                    </span>
                  </div>

                  {/* Last Updated */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <History className="size-3.5 shrink-0" />
                      <span>Last Updated</span>
                    </div>
                    <span className="font-medium text-foreground text-xs">
                      {caseData.lastUpdated || "Oct 5, 2026, 11:32 AM"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Case Description & Tags */}
            <Card className="border border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs flex flex-col justify-between">
              <div>
                <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                    Case Description
                  </CardTitle>
                  <CardAction>
                    <Link
                      href={`/case-details/${caseData.caseNumber}/edit`}
                      className="inline-flex items-center gap-1.5 h-7.5 px-3 rounded-lg border-2 border-border/80 bg-card/60 text-xs font-medium hover:bg-muted/60 hover:text-foreground text-foreground cursor-pointer shadow-2xs transition-colors"
                    >
                      <Edit className="size-3 text-muted-foreground" />
                      <span>Edit Description</span>
                    </Link>
                  </CardAction>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed">
                    {caseData.detailedDescription ||
                      "Armed robbery at a commercial establishment in T. Nagar. The suspect entered the store around 09:14 PM, threatened the staff with a weapon, and fled with cash. CCTV footage shows the suspect escaping towards North Boag Road. Investigation is currently in progress, and nearby area surveillance is being analyzed."}
                  </p>
                </CardContent>
              </div>

              {/* Tags Section */}
              <div className="p-4 sm:p-5 pt-3 border-t border-border/40 space-y-2.5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Tags
                </h4>
                <div className="flex flex-wrap items-center gap-2.5">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="group h-8 pl-3.5 pr-2.5 border-2 border-border/80 bg-muted/40 hover:bg-muted/70 text-foreground text-xs font-medium rounded-md transition-colors cursor-default inline-flex items-center gap-2 shadow-2xs"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-muted-foreground hover:text-foreground opacity-60 hover:opacity-100 transition-opacity p-0.5 rounded-sm hover:bg-foreground/10 cursor-pointer"
                        aria-label={`Remove tag ${tag}`}
                      >
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}

                  {/* Add Tag Interactive Form or Button */}
                  {isAddingTag ? (
                    <form
                      onSubmit={handleAddTag}
                      className="inline-flex items-center gap-1.5"
                    >
                      <Input
                        autoFocus
                        placeholder="Tag name..."
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Escape") setIsAddingTag(false);
                        }}
                        className="h-8 w-32 text-xs px-3 py-1.5 rounded-md border-2 border-border bg-card"
                      />
                      <Button
                        type="submit"
                        size="xs"
                        variant="secondary"
                        className="h-8 px-2.5 text-xs rounded-md cursor-pointer"
                      >
                        Add
                      </Button>
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={() => setIsAddingTag(false)}
                        className="h-8 px-1.5 text-xs text-muted-foreground cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </form>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => setIsAddingTag(true)}
                      className="h-8 gap-1.5 px-3.5 text-xs font-medium rounded-md border-2 border-dashed border-border/80 hover:border-border hover:bg-muted/50 cursor-pointer shadow-2xs"
                    >
                      <Plus className="size-3.5" />
                      <span>Add Tag</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          </div>

          {/* C. Card 3: Recent Activity */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b-2 border-border/60">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-[#665AEF] shrink-0" />
                <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                  Recent Activity
                </CardTitle>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("activity")}
                  className="text-xs text-[#665AEF] hover:underline inline-flex items-center gap-1 cursor-pointer font-medium whitespace-nowrap"
                >
                  <span>View All Activity</span>
                  <ArrowRight className="size-3 shrink-0" />
                </button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    const el = document.getElementById("case-notes-section");
                    el?.scrollIntoView({ behavior: "smooth" });
                    setIsAddingNote(true);
                  }}
                  className="h-7.5 gap-1.5 rounded-md border-2 border-border/80 bg-card/60 px-3 text-xs font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer shadow-2xs shrink-0"
                >
                  <Plus className="size-3" />
                  <span>Add Note</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                {[
                  {
                    name: assignedUserName,
                    avatar: assignedUserAvatar,
                    initials: assignedUserInitials,
                    action: "Added new evidence CCTV_Footage_01.mp4",
                    time: "Oct 5, 2026, 11:32 AM",
                  },
                  {
                    name: "Priya Nair",
                    avatar: "/images/avatar-analyst.jpg",
                    initials: "PN",
                    action: "Updated case status to Under Investigation",
                    time: "Oct 4, 2026, 08:21 PM",
                  },
                  {
                    name: "System",
                    avatar: null,
                    initials: "SY",
                    action: "Case created",
                    time: "Oct 4, 2026, 07:14 PM",
                  },
                ].map((act, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 text-xs sm:text-sm py-2 border-b border-border/30 last:border-0 last:pb-0 first:pt-0"
                  >
                    <Avatar size="sm" className="size-6 sm:size-7 border border-border shrink-0 mt-0.5">
                      {act.avatar && <AvatarImage src={act.avatar} />}
                      <AvatarFallback className="text-[9px] bg-muted font-medium text-foreground">
                        {act.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0">
                        <span className="font-semibold text-foreground text-xs sm:text-sm shrink-0">
                          {act.name}
                        </span>
                        <span className="text-muted-foreground text-xs sm:text-sm leading-relaxed sm:truncate">
                          {act.action}
                        </span>
                      </div>
                      <span className="text-[11px] sm:text-xs text-muted-foreground shrink-0 font-medium whitespace-nowrap block sm:inline">
                        {act.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* D. Card 4: Investigation Notes */}
          <Card
            id="case-notes-section"
            className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs"
          >
            <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b-2 border-border/60">
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-[#665AEF] shrink-0" />
                <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                  Investigation Notes
                </CardTitle>
              </div>
              <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                <span className="text-xs text-[#665AEF] inline-flex items-center gap-1 font-medium cursor-default whitespace-nowrap">
                  <span>View All Notes</span>
                  <ArrowRight className="size-3 shrink-0" />
                </span>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => setIsAddingNote((v) => !v)}
                  className="h-7.5 gap-1.5 rounded-md border-2 border-border/80 bg-card/60 px-3 text-xs font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer shadow-2xs shrink-0"
                >
                  <Plus className="size-3" />
                  <span>Add Note</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Add Note Form */}
              {isAddingNote && (
                <form
                  onSubmit={handleAddNote}
                  className="p-3.5 rounded-lg border-2 border-border bg-card/80 space-y-2.5"
                >
                  <Textarea
                    autoFocus
                    placeholder="Enter observation or investigation update..."
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    rows={2}
                    className="text-xs sm:text-sm bg-background border-border resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      size="xs"
                      variant="ghost"
                      onClick={() => setIsAddingNote(false)}
                      className="text-xs cursor-pointer"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="xs"
                      className="gap-1 bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs cursor-pointer"
                    >
                      <Send className="size-3" />
                      <span>Save Note</span>
                    </Button>
                  </div>
                </form>
              )}

              {/* Notes List */}
              <div className="space-y-3">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="flex items-start gap-2.5 text-xs sm:text-sm py-2 border-b border-border/30 last:border-0 last:pb-0 first:pt-0"
                  >
                    <Avatar size="sm" className="size-6 sm:size-7 border border-border shrink-0 mt-0.5">
                      <AvatarImage src={note.avatar} />
                      <AvatarFallback className="text-[9px] bg-muted font-medium text-foreground">
                        {note.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-semibold text-foreground text-xs sm:text-sm">
                          {note.author}
                        </span>
                        <span className="text-[11px] sm:text-xs text-muted-foreground shrink-0 font-medium whitespace-nowrap">
                          {note.timestamp}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed break-words">
                        {note.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column for Overview: Case Status, Key Details, Incident Media & Location */}
        <div className="space-y-6 xl:col-span-4 2xl:col-span-4 min-w-0">
          <CaseStatusCard caseData={caseData} />
          <CaseKeyDetailsCard caseData={caseData} />
          <CaseIncidentMediaCard caseData={caseData} />
          <CaseIncidentLocationCard caseData={caseData} />
        </div>
      </div>
    </motion.div>
  )}

  {/* 2. EVIDENCE TAB PANEL */}
          {activeTab === "evidence" && (
            <motion.div
              key="evidence"
              role="tabpanel"
              id="case-tabpanel-evidence"
              aria-labelledby="case-tab-evidence"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="outline-none"
            >
              <EvidenceTabContent caseNumber={caseData.caseNumber} />
            </motion.div>
          )}

          {/* 3. SUSPECTS TAB PANEL */}
          {activeTab === "suspects" && (
            <motion.div
              key="suspects"
              role="tabpanel"
              id="case-tabpanel-suspects"
              aria-labelledby="case-tab-suspects"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4 outline-none"
            >
              <Card className="border border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <Users className="size-4" />
                    </div>
                    <CardTitle className="text-base sm:text-lg font-bold font-heading text-foreground">
                      Linked Suspect Profiles & Sketch Matches ({caseData.suspectsCount || 2})
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        name: "Unknown Suspect (CCTV Subject A)",
                        alias: "Boag Road Flee",
                        match: "89% Confidence",
                        record: "CRIM-2026-091",
                        status: "WANTED",
                        description: "Male, 5'10\", slim build, captured in black hoodie leaving store perimeter.",
                      },
                      {
                        name: "Ramesh 'Shadow' Kumar",
                        alias: "Phantom",
                        match: "64% Match",
                        record: "CRIM-2025-442",
                        status: "ON PAROLE",
                        description: "Prior offenses include commercial cash register access in Central division.",
                      },
                    ].map((s) => (
                      <div
                        key={s.name}
                        className="p-4 rounded-xl border border-border/80 bg-card/70 space-y-3 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Avatar size="default" className="size-10 border border-border">
                              <AvatarFallback className="bg-muted text-foreground text-xs font-semibold">
                                {s.alias.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-foreground text-sm leading-snug">
                                {s.name}
                              </h4>
                              <span className="text-xs text-muted-foreground font-mono">
                                {s.record}
                              </span>
                            </div>
                          </div>
                          <Badge
                            variant="destructive"
                            className="text-[10px] font-bold tracking-wider"
                          >
                            {s.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {s.description}
                        </p>
                        <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
                          <span className="text-muted-foreground">AI Match Score:</span>
                          <span className="font-semibold text-emerald-400">{s.match}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* 4. ACTIVITY LOG TAB PANEL */}
          {activeTab === "activity" && (
            <motion.div
              key="activity"
              role="tabpanel"
              id="case-tabpanel-activity"
              aria-labelledby="case-tab-activity"
              variants={tabContentVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-4 outline-none"
            >
              <Card className="border border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
                <CardHeader className="pb-4 border-b border-border/40">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
                      <History className="size-4" />
                    </div>
                    <CardTitle className="text-base sm:text-lg font-bold font-heading text-foreground">
                      Chain of Custody & Activity Timeline
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-border/60">
                    {[
                      {
                        action: "Added new evidence CCTV_Footage_01.mp4",
                        actor: assignedUserName,
                        time: "Oct 5, 2026, 11:32 AM",
                        icon: Film,
                      },
                      {
                        action: "Updated case status to Under Investigation",
                        actor: "Priya Nair",
                        time: "Oct 4, 2026, 08:21 PM",
                        icon: CheckCircle2,
                      },
                      {
                        action: "Case created in system repository",
                        actor: "System",
                        time: "Oct 4, 2026, 07:14 PM",
                        icon: History,
                      },
                    ].map((act, index) => (
                      <div key={index} className="relative flex items-start gap-3">
                        <div className="absolute -left-6 top-1 size-3 rounded-full border-2 border-card bg-primary ring-4 ring-card" />
                        <div className="space-y-0.5 text-xs sm:text-sm">
                          <p className="font-medium text-foreground">{act.action}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>by {act.actor}</span>
                            <span>•</span>
                            <span>{act.time}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
