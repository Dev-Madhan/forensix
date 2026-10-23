"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Shield,
  FileText,
  Edit,
  ChevronDown,
  Printer,
  Share2,
  Eye,
  Trash2,
  Camera,
  Maximize2,
  Fingerprint,
  User as UserIcon,
  Check,
  Copy,
  Clock,
  AlertTriangle,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  MapPin,
  FolderPlus,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CriminalStatus,
  CriminalRiskLevel,
  SuspectRole,
  SuspectCaseStatus,
  type Criminal,
} from "@prisma/client";
import {
  toggleCriminalWatchlist,
  updateCriminalPhoto,
  markCriminalForSurveillance,
  archiveCriminal,
  updateCriminalStatusAndRisk,
  linkCriminalToCase,
} from "@/features/criminals/actions";
import { getCriminalSlug } from "@/features/criminals/slug";
import { SuspectAvatar } from "@/components/criminals/suspect-avatar";
import { LinkCriminalCaseDialog } from "@/components/criminals/link-criminal-case-dialog";

interface CriminalProfileHeaderProps {
  criminal: Criminal;
  mugshotDisplayUrl: string | null;
  onNavigateToTab?: (tabId: string) => void;
}

export function CriminalProfileHeader({
  criminal,
  mugshotDisplayUrl,
}: CriminalProfileHeaderProps) {
  const router = useRouter();
  const profileSlug = getCriminalSlug(criminal);
  const demographics = (criminal.demographics as Record<string, unknown> | null) || {};

  // Dynamic States
  const [isOnWatchlist, setIsOnWatchlist] = useState(
    demographics.watchlistStatus === "On Watchlist" || criminal.status === "WANTED"
  );
  const [currentStatus, setCurrentStatus] = useState<CriminalStatus>(criminal.status);
  const [currentRisk, setCurrentRisk] = useState<CriminalRiskLevel>(criminal.riskLevel);
  const [isSurveillanceFlagged, setIsSurveillanceFlagged] = useState<boolean>(
    Boolean(
      (demographics as any)?.surveillanceFlag ||
      (demographics as any)?.surveillanceStatus === "UNDER_SURVEILLANCE"
    )
  );

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveReason, setArchiveReason] = useState("");
  const [isArchiving, setIsArchiving] = useState(false);

  const [isLinkCaseOpen, setIsLinkCaseOpen] = useState(false);
  const [caseInput, setCaseInput] = useState("");
  const [suspectRole, setSuspectRole] = useState<SuspectRole>(SuspectRole.UNDER_INVESTIGATION);
  const [suspectCaseStatus, setSuspectCaseStatus] = useState<SuspectCaseStatus>(
    SuspectCaseStatus.PERSON_OF_INTEREST
  );
  const [isLinkingCase, setIsLinkingCase] = useState(false);

  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);
  const [isChangePhotoOpen, setIsChangePhotoOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Editable Profile fields (for interactive demo / live edit)
  const [fullName, setFullName] = useState(`${criminal.firstName} ${criminal.lastName}`.trim());
  const [knownAs, setKnownAs] = useState(
    Array.isArray(demographics.aliases) && demographics.aliases.length > 0
      ? (demographics.aliases as string[]).slice(0, 2).join(", ")
      : criminal.alias || "None documented"
  );
  const [occupation, setOccupation] = useState(
    (demographics.occupation as string) || "Not Specified"
  );
  const [lastLocation, setLastLocation] = useState(
    criminal.lastKnownLocation || "Location Not Documented"
  );
  const [fathersName, setFathersName] = useState(
    (demographics.fathersName as string) || "Not Documented"
  );
  const [mothersName, setMothersName] = useState(
    (demographics.mothersName as string) || "Not Documented"
  );

  // Safe resolved photo
  const resolvedPhoto =
    mugshotDisplayUrl && !mugshotDisplayUrl.includes("undefined")
      ? mugshotDisplayUrl
      : criminal.mugshotUrl
      ? `/api/storage?key=${encodeURIComponent(criminal.mugshotUrl)}`
      : null;

  const formattedDob = criminal.dateOfBirth
    ? (() => {
        const dob = new Date(criminal.dateOfBirth);
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        return `${dob.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })} (${age} years)`;
      })()
    : "Not Documented";

  const formattedUpdated = new Date(criminal.updatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const aadharId = (demographics.aadharId as string) || "Not Enrolled";
  const passportNo = (demographics.passportNo as string) || "Not Enrolled";
  const drivingLicense = (demographics.drivingLicense as string) || "Not Documented";
  const otherId = (demographics.otherId as string) || "—";
  const riskLevel = (demographics.riskLevel as string) || criminal.riskLevel || "Medium";
  const threatAssessment =
    (demographics.threatAssessment as string) || (criminal.status === "WANTED" ? "High Priority Capture" : "Under Evaluation");

  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  // Watchlist Toggle with DB Persistence
  const handleToggleWatchlist = async () => {
    const next = !isOnWatchlist;
    setIsOnWatchlist(next);
    try {
      const res = await toggleCriminalWatchlist(criminal.id, next);
      if (res.error) {
        setIsOnWatchlist(!next);
        toast.error("Failed to update watchlist status on server.");
      } else {
        if (next) {
          toast.success(`${fullName} placed on Priority Watchlist`, {
            description: "Automated alert flags and surveillance monitoring activated.",
          });
        } else {
          toast.info(`${fullName} removed from Priority Watchlist`);
        }
      }
    } catch {
      setIsOnWatchlist(!next);
      toast.error("Error communicating with registry.");
    }
  };

  const handleSaveNewPhoto = async () => {
    if (!newPhotoFile) {
      toast.error("Please select a photo file first.");
      return;
    }
    setIsUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append("file", newPhotoFile);
      const res = await updateCriminalPhoto(criminal.id, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Criminal booking photo updated and verified!");
        setIsChangePhotoOpen(false);
        setNewPhotoFile(null);
        setNewPhotoPreview(null);
      }
    } catch {
      toast.error("Failed to upload photo to storage.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleToggleSurveillance = async () => {
    const next = !isSurveillanceFlagged;
    setIsSurveillanceFlagged(next);
    try {
      const res = await markCriminalForSurveillance(
        criminal.id,
        next,
        "ACTIVE_TARGET",
        "Marked via criminal profile header controls"
      );
      if (res.error) {
        setIsSurveillanceFlagged(!next);
        toast.error(res.error);
      } else {
        if (next) {
          toast.success("Subject flagged for continuous surveillance", {
            description: "ANPR cameras, biometric hits, and live telemetry activated.",
          });
        } else {
          toast.info("Surveillance monitoring deactivated for subject.");
        }
      }
    } catch {
      setIsSurveillanceFlagged(!next);
      toast.error("Failed to update surveillance status");
    }
  };

  const handleArchiveRecord = async () => {
    setIsArchiving(true);
    try {
      const res = await archiveCriminal(
        criminal.id,
        archiveReason || "Archived by investigator from profile header"
      );
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Criminal profile ${criminal.criminalId} archived successfully`);
        setIsArchiveModalOpen(false);
        router.push("/dashboard/criminals");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to archive record");
    } finally {
      setIsArchiving(false);
    }
  };

  const handleLinkCase = async () => {
    if (!caseInput.trim()) {
      toast.error("Please provide a case number or ID");
      return;
    }
    setIsLinkingCase(true);
    try {
      const res = await linkCriminalToCase({
        caseId: caseInput.trim(),
        criminalId: criminal.id,
        role: suspectRole,
        status: suspectCaseStatus,
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Attached ${fullName} to Case ${caseInput}`);
        setIsLinkCaseOpen(false);
        setCaseInput("");
      }
    } catch (e: any) {
      toast.error(e?.message || "Failed to link to case");
    } finally {
      setIsLinkingCase(false);
    }
  };

  const handleUpdateStatusAndRisk = async (
    newStatus: CriminalStatus,
    newRisk: CriminalRiskLevel
  ) => {
    setCurrentStatus(newStatus);
    setCurrentRisk(newRisk);
    try {
      const res = await updateCriminalStatusAndRisk({
        criminalId: criminal.id,
        status: newStatus,
        riskLevel: newRisk,
      });
      if (res.error) {
        toast.error(res.error);
        setCurrentStatus(criminal.status);
        setCurrentRisk(criminal.riskLevel);
      } else {
        toast.success("Classification updated", {
          description: `Status: ${newStatus} • Risk: ${newRisk}`,
        });
      }
    } catch {
      toast.error("Failed to update classification");
      setCurrentStatus(criminal.status);
      setCurrentRisk(criminal.riskLevel);
    }
  };

  const handleShareProfile = () => {
    setIsShareModalOpen(true);
  };

  const handleCopyLink = () => {
    const canonicalUrl = `${window.location.origin}/dashboard/criminals/${profileSlug}`;
    navigator.clipboard.writeText(canonicalUrl);
    setCopiedLink(true);
    toast.success("Canonical profile URL copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-4 sm:gap-5 w-full">
      {/* ─────────────────────────────────────────────────────────────
          TOP BAR: Back link on left, Action buttons on right
          ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        {/* Back Link with Sidebar Toggle */}
        <div className="flex items-center gap-2 min-w-0">
          <SidebarTrigger className="-ml-1 size-7 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer" />
          <Link
            href="/dashboard/criminals"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer w-fit"
          >
            <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
            <span className="hidden sm:inline">Back to Criminal Database</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Watchlist — always visible */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleWatchlist}
            className={`h-8 sm:h-9 gap-1.5 rounded-lg border-2 text-xs font-medium cursor-pointer shadow-xs transition-colors ${
              isOnWatchlist
                ? "border-[#665AEF]/50 bg-[#665AEF]/15 text-[#a594fd] hover:bg-[#665AEF]/25"
                : "border-border/80 bg-card/60 hover:bg-muted/60 hover:text-foreground text-foreground"
            }`}
          >
            <Shield className="size-3.5" />
            <span className="hidden xs:inline">{isOnWatchlist ? "On Watchlist" : "Watchlist"}</span>
          </Button>

          {/* Print Profile — desktop only */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="hidden sm:inline-flex h-9 gap-2 rounded-lg border-2 border-border/80 bg-card/60 text-xs font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer shadow-xs"
          >
            <Printer className="size-3.5 text-muted-foreground" />
            <span>Print Profile</span>
          </Button>

          {/* Link to Case — desktop only */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLinkCaseOpen(true)}
            className="hidden sm:inline-flex h-9 gap-1.5 rounded-lg border-2 border-border/80 bg-card/60 text-xs font-medium hover:bg-muted/60 hover:text-foreground text-foreground cursor-pointer shadow-xs"
          >
            <FolderPlus className="size-3.5 text-[#665AEF]" />
            <span>Link to Case</span>
          </Button>

          {/* Edit Profile — desktop only */}
          <Link
            href={`/dashboard/criminals/${profileSlug}/edit`}
            className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-lg border-2 border-border/80 bg-card/60 text-xs font-medium hover:bg-muted/60 hover:text-foreground text-foreground cursor-pointer shadow-xs transition-colors"
          >
            <Edit className="size-3.5 text-muted-foreground" />
            <span>Edit Profile</span>
          </Link>

          {/* More Actions Dropdown — always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button className="h-8 sm:h-9 gap-1.5 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-medium shadow-sm shadow-[#665AEF]/25 px-2.5 sm:px-3.5 cursor-pointer" />
              }
            >
              <span className="hidden sm:inline">More Actions</span>
              <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="w-52 p-1.5 rounded-xl border-2 border-border bg-card/95 backdrop-blur-xl shadow-xl z-50"
            >
              <DropdownMenuItem
                render={
                  <Link
                    href={`/dashboard/criminals/${profileSlug}/edit`}
                    className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground flex items-center"
                  />
                }
              >
                <Edit className="size-3.5 text-muted-foreground" />
                <span>Edit Profile Record</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => window.print()}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground flex items-center"
              >
                <Printer className="size-3.5 text-muted-foreground" />
                <span>Print Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsLinkCaseOpen(true)}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground sm:hidden"
              >
                <FolderPlus className="size-3.5 text-[#665AEF]" />
                <span>Link to Case</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleShareProfile}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground"
              >
                <Share2 className="size-3.5 text-muted-foreground" />
                <span>Share Profile Link</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleToggleSurveillance}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground"
              >
                <Eye className={`size-3.5 ${isSurveillanceFlagged ? "text-amber-400" : "text-muted-foreground"}`} />
                <span>{isSurveillanceFlagged ? "Deactivate Surveillance" : "Mark Surveillance"}</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-border/60" />

              <DropdownMenuItem
                onClick={() => setIsArchiveModalOpen(true)}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md font-medium text-destructive hover:bg-destructive/10 focus:bg-destructive/10"
              >
                <Trash2 className="size-3.5 text-destructive" />
                <span>Archive Record</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TITLE & RISK BADGE ROW
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-heading">
          {fullName}
        </h1>

        {/* Interactive Risk Level Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide cursor-pointer transition-colors ${
                  currentRisk === "CRITICAL"
                    ? "border-purple-500/50 bg-purple-500/15 text-purple-400 hover:bg-purple-500/25"
                    : currentRisk === "HIGH"
                    ? "border-rose-500/40 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                    : currentRisk === "MEDIUM"
                    ? "border-amber-500/40 bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
                    : "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                }`}
              />
            }
          >
            <span>{currentRisk} Risk</span>
            <ChevronDown className="size-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36 p-1 border-2 border-border bg-card/95 backdrop-blur-xl">
            {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as CriminalRiskLevel[]).map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => handleUpdateStatusAndRisk(currentStatus, r)}
                className="text-xs font-medium cursor-pointer"
              >
                {r} Risk
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Interactive Status Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className={`inline-flex items-center gap-1.5 rounded-lg border-2 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide cursor-pointer transition-colors ${
                  currentStatus === "WANTED"
                    ? "border-rose-500/40 bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                    : currentStatus === "ACTIVE"
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                    : currentStatus === "ARCHIVED"
                    ? "border-blue-500/40 bg-blue-500/15 text-blue-400 hover:bg-blue-500/25"
                    : "border-border bg-muted/40 text-muted-foreground hover:bg-muted/60"
                }`}
              />
            }
          >
            <span>{currentStatus === "ARCHIVED" ? "In Custody / Archived" : currentStatus}</span>
            <ChevronDown className="size-3 opacity-60" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 p-1 border-2 border-border bg-card/95 backdrop-blur-xl">
            {[
              { label: "Active", value: CriminalStatus.ACTIVE },
              { label: "Wanted", value: CriminalStatus.WANTED },
              { label: "In Custody (Archived)", value: CriminalStatus.ARCHIVED },
              { label: "Inactive", value: CriminalStatus.INACTIVE },
            ].map((st) => (
              <DropdownMenuItem
                key={st.value}
                onClick={() => handleUpdateStatusAndRisk(st.value, currentRisk)}
                className="text-xs font-medium cursor-pointer"
              >
                Mark as {st.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {isSurveillanceFlagged && (
          <span className="inline-flex items-center gap-1 rounded-lg border-2 border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400 animate-pulse">
            <Eye className="size-3" />
            <span>24/7 Monitored</span>
          </span>
        )}
      </div>

      {/* CRIMINAL ID & LAST UPDATED SUBTITLE */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground -mt-1">
        <span className="font-mono font-medium tracking-wide text-foreground/80">
          {criminal.criminalId}
        </span>
        <span className="text-muted-foreground/40">•</span>
        <span className="hidden sm:inline">Last Updated: {formattedUpdated}</span>
        <span className="sm:hidden">{new Date(criminal.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP 4-CARD SECTION (Exactly matching reference image)
          Col 1: Mugshot (2 cols)
          Col 2: Personal Information (4 cols)
          Col 3: Identifiers (3 cols)
          Col 4: Status & Classification (3 cols)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-3 sm:gap-4 lg:gap-5 w-full">
        {/* CARD 1: MUGSHOT PHOTO */}
        <div className="sm:col-span-1 xl:col-span-2 2xl:col-span-2 flex flex-col">
          <div className="relative h-full min-h-50 sm:min-h-65 w-full rounded-xl overflow-hidden border-2 border-border/80 bg-card/60 shadow-xs group">
            {resolvedPhoto ? (
              <Image
                src={resolvedPhoto}
                alt={fullName}
                fill
                priority
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 240px"
              />
            ) : (
              <SuspectAvatar
                name={fullName}
                status={criminal.status}
                riskLevel={riskLevel}
                size="fill"
              />
            )}

            {/* Gradient shadow overlay at bottom for change photo button */}
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/10 to-black/30 pointer-events-none" />

            {/* Top Right: Expand / Fullscreen icon */}
            <Button
              type="button"
              variant="outline"
              size="icon-xs"
              onClick={() => setIsPhotoLightboxOpen(true)}
              className="absolute top-2.5 right-2.5 size-7 rounded-lg bg-black/60 hover:bg-black/80 text-white/90 hover:text-white border-white/20 backdrop-blur-md cursor-pointer"
              title="Expand Photo"
            >
              <Maximize2 className="size-3.5" />
            </Button>

            {/* Bottom Overlay: Change Photo Button */}
            <div className="absolute bottom-2.5 inset-x-2.5 flex justify-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsChangePhotoOpen(true)}
                className="w-full h-8 gap-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white border-white/20 backdrop-blur-md text-xs font-medium shadow-sm cursor-pointer"
              >
                <Camera className="size-3.5" />
                <span>Change Photo</span>
              </Button>
            </div>
          </div>
        </div>

        {/* CARD 2: PERSONAL INFORMATION */}
        <div className="sm:col-span-1 xl:col-span-4 2xl:col-span-4 flex flex-col">
          <div className="h-full rounded-xl border-2 border-border/80 bg-card/60 p-4 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                    <UserIcon className="size-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Personal Information
                  </h3>
                </div>
              </div>

              {/* 2 Sub-Columns Grid — single col on mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-3 text-xs">
                {/* Left Sub-Column */}
                <div className="space-y-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px]">Full Name</span>
                    <span className="font-semibold text-foreground leading-tight">
                      {fullName}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px]">Known As</span>
                    <span className="font-semibold text-foreground leading-tight">
                      {knownAs}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px]">Date of Birth</span>
                    <span className="font-semibold text-foreground leading-tight">
                      {formattedDob}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px]">Gender / Nationality</span>
                    <span className="font-semibold text-foreground leading-tight">
                      {criminal.gender || "Male"} • {criminal.nationality || "Indian"}
                    </span>
                  </div>
                </div>

                {/* Right Sub-Column */}
                <div className="space-y-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px]">Father's Name</span>
                    <span className="font-semibold text-foreground leading-tight">
                      {fathersName}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px]">Mother's Name</span>
                    <span className="font-semibold text-foreground leading-tight">
                      {mothersName}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px]">Occupation</span>
                    <span className="font-semibold text-foreground leading-tight">
                      {occupation}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <span className="text-muted-foreground text-[11px]">
                      Last Known Location
                    </span>
                    <span className="font-semibold text-foreground leading-tight">
                      {lastLocation}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Jurisdiction Footer */}
            <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <MapPin className="size-3 text-[#a594fd]" />
                <span>TN Crime Investigation Dept.</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground/80">REG-TN-2023</span>
            </div>
          </div>
        </div>

        {/* CARD 3: IDENTIFIERS */}
        <div className="sm:col-span-1 xl:col-span-3 2xl:col-span-3 flex flex-col">
          <div className="h-full rounded-xl border-2 border-border/80 bg-card/60 p-4 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                    <Fingerprint className="size-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground">Identifiers</h3>
                </div>
              </div>

              {/* List */}
              <div className="space-y-2 pt-3 text-xs grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-1 gap-y-2 gap-x-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Criminal ID</span>
                  <span className="font-mono font-semibold text-foreground">
                    {criminal.criminalId}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Aadhaar ID</span>
                  <span className="font-mono font-semibold text-foreground">
                    {aadharId}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Passport No.</span>
                  <span className="font-mono font-semibold text-foreground">
                    {passportNo}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Driving License</span>
                  <span className="font-mono font-semibold text-foreground">
                    {drivingLicense}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">State Police ID</span>
                  <span className="font-mono font-semibold text-foreground">
                    {(demographics.statePoliceId as string) || "TN-CR-9921"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">National Crime Rec.</span>
                  <span className="font-mono font-semibold text-foreground">
                    {(demographics.ncrbId as string) || "NCRB-IN-8821"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Other ID</span>
                  <span className="font-mono font-semibold text-foreground">{otherId}</span>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="size-3 shrink-0" />
                <span className="text-[10px] font-medium">Aadhaar & CCTNS Synced</span>
              </span>
              <span className="text-[10px] text-muted-foreground/80 font-mono">UIDAI Valid</span>
            </div>
          </div>
        </div>

        {/* CARD 4: STATUS & CLASSIFICATION */}
        <div className="sm:col-span-1 xl:col-span-3 2xl:col-span-3 flex flex-col">
          <div className="h-full rounded-xl border-2 border-border/80 bg-card/60 p-4 shadow-xs flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center gap-2.5 pb-3 border-b border-border/50">
                <div className="flex size-7 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd]">
                  <Shield className="size-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">
                  Status & Classification
                </h3>
              </div>

              {/* List */}
              <div className="space-y-2 pt-3 text-xs grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-1 gap-y-2 gap-x-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Current Status</span>
                  <span className="inline-flex items-center rounded-lg border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                    {currentStatus === "ARCHIVED" ? "In Custody" : currentStatus}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Risk Level</span>
                  <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                    currentRisk === "CRITICAL"
                      ? "border-purple-500/40 bg-purple-500/15 text-purple-400"
                      : currentRisk === "HIGH"
                      ? "border-rose-500/40 bg-rose-500/15 text-rose-400"
                      : currentRisk === "MEDIUM"
                      ? "border-amber-500/40 bg-amber-500/15 text-amber-400"
                      : "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                  }`}>
                    {currentRisk}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">
                    Threat Assessment
                  </span>
                  <span className="font-medium text-foreground text-right truncate">
                    {threatAssessment}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Watchlist Status</span>
                  <span
                    className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${
                      isOnWatchlist
                        ? "border-[#665AEF]/50 bg-[#665AEF]/15 text-[#a594fd]"
                        : "border-border/70 bg-muted/40 text-muted-foreground"
                    }`}
                  >
                    {isOnWatchlist ? "On Watchlist" : "Not Enrolled"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Custody Status</span>
                  <span className="inline-flex items-center rounded-lg border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
                    At Large / Wanted
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Added On</span>
                  <span className="font-medium text-foreground">
                    {new Date(criminal.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Last Updated</span>
                  <span className="font-medium text-foreground">{formattedUpdated}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Created By</span>
                  <span className="font-medium text-foreground">System</span>
                </div>
              </div>
            </div>

            {/* Live Surveillance Footer */}
            <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className="text-[10px] font-medium text-rose-400">Tier-1 Surveillance Priority</span>
              </span>
              <span className="text-[10px] text-muted-foreground/80 font-mono">24/7 Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          INTERACTIVE MODALS
          ───────────────────────────────────────────────────────────── */}
      {/* 1. MUGSHOT LIGHTBOX MODAL */}
      <Modal
        isOpen={isPhotoLightboxOpen}
        onClose={() => setIsPhotoLightboxOpen(false)}
        maxWidth="max-w-2xl"
        title={
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Camera className="size-4 text-[#a594fd]" />
            <span>Mugshot Preview — {fullName}</span>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="relative aspect-3/4 w-full max-h-135 rounded-xl overflow-hidden border border-border/80 bg-black">
            {resolvedPhoto ? (
              <Image
                src={resolvedPhoto}
                alt={fullName}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 600px"
              />
            ) : (
              <SuspectAvatar
                name={fullName}
                status={status}
                riskLevel={riskLevel}
                size="fill"
              />
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span>Subject ID: {criminal.criminalId}</span>
            <span>Date Enrolled: {new Date(criminal.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </Modal>

      {/* 2. CHANGE PHOTO MODAL */}
      <Modal
        isOpen={isChangePhotoOpen}
        onClose={() => {
          setIsChangePhotoOpen(false);
          setNewPhotoFile(null);
          setNewPhotoPreview(null);
        }}
        title="Update Criminal Photo"
        description="Upload a new front-facing booking photo or mugshot to Tigris S3."
      >
        <div className="space-y-4 py-2">
          <input
            type="file"
            ref={photoInputRef}
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (file.size > 10 * 1024 * 1024) {
                  toast.error("Image file size exceeds 10 MB limit");
                  return;
                }
                setNewPhotoFile(file);
                setNewPhotoPreview(URL.createObjectURL(file));
              }
            }}
          />

          {newPhotoPreview ? (
            <div className="relative aspect-3/4 w-48 mx-auto rounded-xl overflow-hidden border-2 border-[#665AEF]/50 shadow-md">
              <Image
                src={newPhotoPreview}
                alt="New Photo Preview"
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => {
                  setNewPhotoFile(null);
                  setNewPhotoPreview(null);
                }}
                className="absolute top-2 right-2 size-6 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black cursor-pointer"
              >
                <X className="size-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => photoInputRef.current?.click()}
              className="border-2 border-dashed border-border/70 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer"
            >
              <div className="flex size-12 items-center justify-center rounded-full bg-[#665AEF]/15 text-[#a594fd]">
                <Upload className="size-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  Click to select booking mugshot file
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  PNG, JPG, or WEBP up to 10MB
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isUploadingPhoto}
              onClick={() => {
                setIsChangePhotoOpen(false);
                setNewPhotoFile(null);
                setNewPhotoPreview(null);
              }}
              className="h-9 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!newPhotoFile || isUploadingPhoto}
              onClick={handleSaveNewPhoto}
              className="h-9 px-4 bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-xs shadow-[#665AEF]/25 cursor-pointer gap-2"
            >
              {isUploadingPhoto ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Uploading to S3...</span>
                </>
              ) : (
                <span>Save Photo</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>



      {/* 4. SHARE PROFILE MODAL */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Subject Profile"
        description="Share direct encrypted access to this subject record."
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Direct Profile URL</Label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="h-9 text-xs font-mono bg-muted/30"
              />
              <Button
                size="sm"
                onClick={handleCopyLink}
                className="h-9 px-3 gap-1.5 bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-xs shadow-[#665AEF]/25 cursor-pointer"
              >
                {copiedLink ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                <span>{copiedLink ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* 5. ARCHIVE RECORD CONFIRMATION MODAL */}
      <Modal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        title="Archive Subject Profile"
        description={`Archive ${fullName} (${criminal.criminalId}) record from active operations. An immutable entry will be written to the forensic audit log.`}
      >
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Reason for Archiving</Label>
            <Input
              placeholder="e.g. Subject deceased, trial concluded, extradited..."
              value={archiveReason}
              onChange={(e) => setArchiveReason(e.target.value)}
              className="h-9 text-xs"
            />
          </div>

          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2.5">
            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
            <p>
              Archiving marks this subject as INACTIVE/ARCHIVED. Intelligence monitors and ANPR real-time surveillance triggers will be deactivated.
            </p>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isArchiving}
              onClick={() => setIsArchiveModalOpen(false)}
              className="h-9 px-4 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isArchiving}
              onClick={handleArchiveRecord}
              className="h-9 px-4 bg-destructive hover:bg-destructive/90 text-white cursor-pointer gap-2"
            >
              {isArchiving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Archiving...</span>
                </>
              ) : (
                <span>Confirm Archive</span>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* 6. LINK TO CASE MODAL — Professional Themed Dialog */}
      <LinkCriminalCaseDialog
        isOpen={isLinkCaseOpen}
        onClose={() => setIsLinkCaseOpen(false)}
        criminal={criminal}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
