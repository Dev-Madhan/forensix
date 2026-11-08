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
  RotateCcw,
  History,
  HardDrive,
  Info,
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
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  getCriminalPhotoHistory,
  rollbackCriminalPhoto,
  deleteCriminalPhoto,
  type CriminalMugshotHistoryItem,
  markCriminalForSurveillance,
  archiveCriminal,
  updateCriminalStatusAndRisk,
  linkCriminalToCase,
} from "@/features/criminals/actions";
import { getCriminalSlug } from "@/features/criminals/slug";
import { formatCriminalDobWithAge } from "@/features/criminals/formatters";
import { SuspectAvatar } from "@/features/criminals/components/suspect-avatar";
import { LinkCriminalCaseDialog } from "@/features/criminals/components/link-criminal-case-dialog";
import { getSafeStorageUrl } from "@/lib/storage-url";
import { cn } from "@/lib/utils";

interface CriminalProfileHeaderProps {
  criminal: Criminal & {
    caseLinks?: Array<{
      id?: string;
      role?: SuspectRole;
      status?: SuspectCaseStatus;
      case: {
        id: string;
        caseNumber: string;
        title: string;
        status?: string;
        priority?: string;
      };
    }>;
  };
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

  // Check if subject is linked to any active case
  const primaryCaseLink = (criminal as any).caseLinks?.[0];
  const linkedCase = primaryCaseLink?.case;
  const totalLinkedCases = (criminal as any).caseLinks?.length || 0;
  const caseButtonLabel = linkedCase
    ? totalLinkedCases > 1
      ? `Case: ${linkedCase.caseNumber} (+${totalLinkedCases - 1})`
      : `Case: ${linkedCase.caseNumber}`
    : "Link to Case";

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
  const [isPhotoDragOver, setIsPhotoDragOver] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloadingDossier, setIsDownloadingDossier] = useState(false);

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

  const [photoLoadError, setPhotoLoadError] = useState(false);
  const [currentMugshot, setCurrentMugshot] = useState<string | null>(() => {
    return (mugshotDisplayUrl && !mugshotDisplayUrl.includes("undefined"))
      ? mugshotDisplayUrl
      : criminal.mugshotUrl || null;
  });

  // Photo Archival History & Rollback States
  const [photoHistoryTab, setPhotoHistoryTab] = useState<string>("upload");
  const [photoHistory, setPhotoHistory] = useState<CriminalMugshotHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const [selectedHistoryKey, setSelectedHistoryKey] = useState<string | null>(null);
  const [isRollingBack, setIsRollingBack] = useState<boolean>(false);
  const [photoToDelete, setPhotoToDelete] = useState<CriminalMugshotHistoryItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState<boolean>(false);

  const loadPhotoHistory = React.useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const res = await getCriminalPhotoHistory(criminal.id || criminal.criminalId);
      if (res.success && res.history) {
        setPhotoHistory(res.history);
        const active = res.history.find((h) => h.isActive);
        if (active) {
          setSelectedHistoryKey(active.storageKey);
        } else if (res.history.length > 0) {
          setSelectedHistoryKey(res.history[0].storageKey);
        }
      }
    } catch (err) {
      console.warn("Could not load photo history:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [criminal.id, criminal.criminalId]);

  React.useEffect(() => {
    if (isChangePhotoOpen) {
      loadPhotoHistory();
    }
  }, [isChangePhotoOpen, loadPhotoHistory]);

  // Sync state if server prop updates
  React.useEffect(() => {
    if (mugshotDisplayUrl && !mugshotDisplayUrl.includes("undefined")) {
      setCurrentMugshot(mugshotDisplayUrl);
    } else if (criminal.mugshotUrl) {
      setCurrentMugshot(criminal.mugshotUrl);
    }
  }, [mugshotDisplayUrl, criminal.mugshotUrl]);

  // Safe resolved photo
  const resolvedPhoto = currentMugshot ? getSafeStorageUrl(currentMugshot) : null;

  const formattedDob = formatCriminalDobWithAge(criminal.dateOfBirth);

  const formattedUpdated = new Date(criminal.updatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const rawAadhar =
    (demographics.nationalId as string) ||
    (demographics.aadharId as string) ||
    (demographics.aadhaarNumber as string) ||
    (demographics.aadharNumber as string) ||
    (criminal as any).nationalId;

  // Format 12-digit Aadhaar nicely: "XXXX XXXX XXXX" or keep clean string
  const formatAadhaar = (val?: string) => {
    if (!val || !val.trim()) return "Not Enrolled";
    const cleaned = val.replace(/\s+/g, "");
    if (/^\d{12}$/.test(cleaned)) {
      return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 8)} ${cleaned.slice(8, 12)}`;
    }
    return val;
  };

  const aadharId = formatAadhaar(rawAadhar);

  const passportNo =
    (demographics.passportNumber as string) ||
    (demographics.passportNo as string) ||
    (demographics.passport as string) ||
    "Not Enrolled";

  const rawDrivingLicense =
    (demographics.drivingLicense as string) ||
    (demographics.drivingLicenseNumber as string) ||
    (demographics.dlNumber as string);

  const drivingLicense = rawDrivingLicense?.trim() ? rawDrivingLicense.trim() : "Not Documented";

  const rawOtherId = (demographics.otherId as string)?.trim();
  // If otherId is equal to drivingLicense (due to the old bug) or empty, show "—"
  const otherId =
    rawOtherId && rawOtherId !== rawDrivingLicense?.trim()
      ? rawOtherId
      : "—";

  const statePoliceId =
    (demographics.statePoliceId as string) ||
    (demographics.policeId as string) ||
    "Not Documented";

  const ncrbId =
    (demographics.ncrbId as string) ||
    (demographics.ncrbNumber as string) ||
    "Not Registered";

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
      formData.append("criminalId", criminal.criminalId || criminal.id);
      const res = await updateCriminalPhoto(criminal.id, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Criminal booking photo updated and verified!");
        if (res.storageKey) {
          setCurrentMugshot(res.storageKey);
          setPhotoLoadError(false);
        }
        setIsChangePhotoOpen(false);
        setNewPhotoFile(null);
        setNewPhotoPreview(null);
        loadPhotoHistory();
        router.refresh();
      }
    } catch (err: any) {
      console.error("Photo upload error:", err);
      toast.error(err?.message || "Failed to upload photo to storage.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRollbackPhoto = async () => {
    if (!selectedHistoryKey) {
      toast.error("Please select a historical mugshot first.");
      return;
    }
    const selectedItem = photoHistory.find((h) => h.storageKey === selectedHistoryKey);
    if (selectedItem?.isActive) {
      toast.info("This mugshot is already the active profile photo.");
      return;
    }

    setIsRollingBack(true);
    try {
      const res = await rollbackCriminalPhoto(criminal.id, selectedHistoryKey);
      if (!res.success || res.error) {
        toast.error(res.error || "Failed to restore historical photo.");
      } else {
        toast.success("Profile photo restored successfully (0 MB storage delta).");
        if (res.storageKey) {
          setCurrentMugshot(res.storageKey);
          setPhotoLoadError(false);
        }
        setPhotoHistory((prev) =>
          prev.map((item) => ({
            ...item,
            isActive: item.storageKey === selectedHistoryKey,
          }))
        );
        setIsChangePhotoOpen(false);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Rollback photo error:", err);
      toast.error(err?.message || "Failed to rollback photo.");
    } finally {
      setIsRollingBack(false);
    }
  };

  const handleConfirmDeletePhoto = async () => {
    if (!photoToDelete) return;

    setIsDeletingPhoto(true);
    try {
      const res = await deleteCriminalPhoto(criminal.id, photoToDelete.storageKey);
      if (!res.success || res.error) {
        toast.error(res.error || "Failed to delete photo from Tigris S3.");
      } else {
        toast.success("Mugshot permanently deleted from Tigris S3.");
        setIsDeleteDialogOpen(false);

        const targetKey = photoToDelete.storageKey;
        const wasActive = photoToDelete.isActive;

        // Update local photoHistory state
        const nextHistory = photoHistory
          .filter((h) => h.storageKey !== targetKey)
          .map((h) => ({
            ...h,
            isActive: wasActive && res.newActiveKey ? h.storageKey === res.newActiveKey : h.isActive,
          }));

        setPhotoHistory(nextHistory);

        // If active photo was deleted, update active mugshot pointer
        if (wasActive) {
          if (res.newActiveKey) {
            setCurrentMugshot(res.newActiveKey);
          } else {
            setCurrentMugshot(null);
          }
          setPhotoLoadError(false);
        }

        // If selected item was deleted, select next available photo
        if (selectedHistoryKey === targetKey) {
          if (nextHistory.length > 0) {
            const nextActive = nextHistory.find((h) => h.isActive) || nextHistory[0];
            setSelectedHistoryKey(nextActive.storageKey);
          } else {
            setSelectedHistoryKey(null);
            setPhotoHistoryTab("upload");
          }
        }

        setPhotoToDelete(null);
        router.refresh();
      }
    } catch (err: any) {
      console.error("Delete photo error:", err);
      toast.error(err?.message || "Failed to delete photo from Tigris S3.");
    } finally {
      setIsDeletingPhoto(false);
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

  const handleDownloadDossier = async () => {
    setIsDownloadingDossier(true);
    const toastId = toast.loading("Compiling official certified criminal dossier & custody certificate...");
    try {
      const res = await fetch(`/api/criminals/${criminal.id}/dossier`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || "Failed to generate PDF dossier");
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `FORENSIX-DOSSIER-${fullName.replace(/\s+/g, "_")}-${criminal.criminalId}.pdf`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }, 2000);
      toast.success("Official Criminal Dossier downloaded successfully", { id: toastId });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Error downloading criminal dossier", { id: toastId });
    } finally {
      setIsDownloadingDossier(false);
    }
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

          {/* Official Certified Dossier (PDF) — desktop only */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadDossier}
            disabled={isDownloadingDossier}
            className="hidden sm:inline-flex h-9 gap-2 rounded-lg border-2 border-border/80 bg-card/60 text-xs font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer shadow-xs"
          >
            {isDownloadingDossier ? (
              <Loader2 className="size-3.5 animate-spin text-[#665AEF]" />
            ) : (
              <FileText className="size-3.5 text-[#665AEF]" />
            )}
            <span>{isDownloadingDossier ? "Generating..." : "Dossier (PDF)"}</span>
          </Button>

          {/* Link to Case / Active Case ID — desktop only */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLinkCaseOpen(true)}
            title={
              linkedCase
                ? `Linked to ${linkedCase.caseNumber}: "${linkedCase.title}". Click to change case.`
                : "Attach suspect to an active case investigation"
            }
            className={cn(
              "hidden sm:inline-flex h-9 gap-1.5 rounded-lg border-2 text-xs font-medium cursor-pointer shadow-xs transition-colors",
              linkedCase
                ? "border-[#665AEF]/60 bg-[#665AEF]/15 hover:bg-[#665AEF]/25 text-foreground"
                : "border-border/80 bg-card/60 hover:bg-muted/60 hover:text-foreground text-foreground"
            )}
          >
            <FolderPlus className={cn("size-3.5", linkedCase ? "text-[#a594fd]" : "text-[#665AEF]")} />
            {linkedCase && (
              <span className="size-1.5 rounded-full bg-emerald-400 shrink-0" />
            )}
            <span className="truncate max-w-[170px]">{caseButtonLabel}</span>
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
              className="w-56 p-1.5 rounded-xl border-2 border-border bg-card/95 backdrop-blur-xl shadow-xl z-50"
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
                onClick={handleDownloadDossier}
                disabled={isDownloadingDossier}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground flex items-center"
              >
                <FileText className="size-3.5 text-[#665AEF]" />
                <span>Download Official Dossier (PDF)</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => setIsLinkCaseOpen(true)}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground sm:hidden"
              >
                <FolderPlus className={cn("size-3.5", linkedCase ? "text-[#a594fd]" : "text-[#665AEF]")} />
                <span>{caseButtonLabel}</span>
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
        <div className="sm:col-span-1 xl:col-span-2 2xl:col-span-2 flex flex-col w-full max-w-md mx-auto sm:max-w-none">
          <div className="relative w-full aspect-4/5 max-h-96 sm:max-h-none sm:aspect-auto sm:h-full sm:min-h-70 rounded-xl overflow-hidden border-2 border-border/80 bg-card/60 shadow-xs group">
            {resolvedPhoto && !photoLoadError ? (
              <Image
                src={resolvedPhoto}
                alt={fullName}
                fill
                priority
                className="object-cover object-top sm:object-center transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 240px"
                onError={() => setPhotoLoadError(true)}
                unoptimized={resolvedPhoto.startsWith("/api/storage")}
              />
            ) : (
              <SuspectAvatar
                name={fullName}
                status={criminal.status}
                riskLevel={riskLevel}
                size="fill"
              />
            )}

            {/* Subtle gradient vignette at bottom for change photo button */}
            <div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/85 via-black/30 to-transparent pointer-events-none" />

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
                className="w-full h-8.5 gap-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white border-white/20 backdrop-blur-md text-xs font-medium shadow-sm cursor-pointer transition-colors active:scale-95"
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
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      aadharId !== "Not Enrolled"
                        ? "text-foreground"
                        : "text-muted-foreground/60 italic font-sans text-[11px]"
                    )}
                  >
                    {aadharId}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Passport No.</span>
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      passportNo !== "Not Enrolled"
                        ? "text-foreground"
                        : "text-muted-foreground/60 italic font-sans text-[11px]"
                    )}
                  >
                    {passportNo}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Driving License</span>
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      drivingLicense !== "Not Documented"
                        ? "text-foreground"
                        : "text-muted-foreground/60 italic font-sans text-[11px]"
                    )}
                  >
                    {drivingLicense}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">State Police ID</span>
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      statePoliceId !== "Not Documented"
                        ? "text-foreground"
                        : "text-muted-foreground/60 italic font-sans text-[11px]"
                    )}
                  >
                    {statePoliceId}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">National Crime Rec.</span>
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      ncrbId !== "Not Registered"
                        ? "text-foreground"
                        : "text-muted-foreground/60 italic font-sans text-[11px]"
                    )}
                  >
                    {ncrbId}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Other ID</span>
                  <span
                    className={cn(
                      "font-mono font-semibold",
                      otherId !== "—" ? "text-foreground" : "text-muted-foreground/60"
                    )}
                  >
                    {otherId}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification Footer */}
            <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-[11px]">
              {rawAadhar ? (
                <>
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="size-3 shrink-0" />
                    <span className="text-[10px] font-medium">Aadhaar & CCTNS Synced</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground/80 font-mono">UIDAI Valid</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1.5 text-amber-400/90">
                    <Clock className="size-3 shrink-0" />
                    <span className="text-[10px] font-medium">National ID Pending</span>
                  </span>
                  <span className="text-[10px] text-muted-foreground/60 font-mono">UIDAI Unenrolled</span>
                </>
              )}
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

      {/* 2. CHANGE PHOTO MODAL & BOOKING ARCHIVE */}
      <Modal
        isOpen={isChangePhotoOpen}
        onClose={() => {
          setIsChangePhotoOpen(false);
          setNewPhotoFile(null);
          setNewPhotoPreview(null);
        }}
        maxWidth="max-w-[560px]"
        title={
          <div className="flex items-center gap-2 text-foreground font-semibold">
            <Camera className="size-4 text-muted-foreground" />
            <span className="text-sm font-semibold tracking-tight">
              Update Criminal Photo
            </span>
          </div>
        }
        description="Enroll a new booking mugshot or restore a previous photo with zero storage delta."
        className="bg-card border-2 border-border/80 text-foreground shadow-2xl rounded-2xl"
      >
        <div className="space-y-3.5 py-0.5">
          <Tabs
            value={photoHistoryTab}
            onValueChange={(val) => setPhotoHistoryTab(val)}
            className="w-full"
          >
            {/* PREMIUM DUAL ACTION TILES WITH BORDER-2 */}
            <div className="grid grid-cols-2 gap-2.5 mb-4" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={photoHistoryTab === "upload"}
                onClick={() => setPhotoHistoryTab("upload")}
                className={cn(
                  "group relative flex items-center justify-center gap-2.5 h-11 px-3.5 rounded-xl border-2 text-xs font-semibold tracking-wide transition-all cursor-pointer select-none outline-none",
                  photoHistoryTab === "upload"
                    ? "border-2 border-[#665AEF] bg-neutral-900 text-white shadow-xs shadow-[#665AEF]/20"
                    : "border-2 border-neutral-800/90 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 hover:bg-neutral-900/40"
                )}
              >
                <div
                  className={cn(
                    "size-6 rounded-lg flex items-center justify-center transition-colors shrink-0",
                    photoHistoryTab === "upload"
                      ? "bg-[#665AEF] text-white shadow-xs"
                      : "bg-neutral-800/80 text-neutral-400 group-hover:text-neutral-200"
                  )}
                >
                  <Upload className="size-3.5 stroke-[2.5]" />
                </div>
                <span>Upload New Photo</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={photoHistoryTab === "archive"}
                onClick={() => setPhotoHistoryTab("archive")}
                className={cn(
                  "group relative flex items-center justify-center gap-2.5 h-11 px-3.5 rounded-xl border-2 text-xs font-semibold tracking-wide transition-all cursor-pointer select-none outline-none",
                  photoHistoryTab === "archive"
                    ? "border-2 border-[#665AEF] bg-neutral-900 text-white shadow-xs shadow-[#665AEF]/20"
                    : "border-2 border-neutral-800/90 bg-neutral-950/60 text-neutral-400 hover:text-neutral-200 hover:border-neutral-700 hover:bg-neutral-900/40"
                )}
              >
                <div
                  className={cn(
                    "size-6 rounded-lg flex items-center justify-center transition-colors shrink-0",
                    photoHistoryTab === "archive"
                      ? "bg-[#665AEF] text-white shadow-xs"
                      : "bg-neutral-800/80 text-neutral-400 group-hover:text-neutral-200"
                  )}
                >
                  <History className="size-3.5 stroke-[2.5]" />
                </div>
                <span>Previous Mugshots</span>
                {photoHistory.length > 0 && (
                  <span
                    className={cn(
                      "text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md border-2 transition-colors",
                      photoHistoryTab === "archive"
                        ? "border-[#665AEF]/60 bg-[#665AEF]/20 text-[#a594fd]"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400"
                    )}
                  >
                    {photoHistory.length}
                  </span>
                )}
              </button>
            </div>

            {/* TAB 1: UPLOAD NEW PHOTO */}
            <TabsContent value="upload" className="space-y-3 outline-none">
              <input
                type="file"
                ref={photoInputRef}
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("Image file size exceeds 5 MB limit");
                      return;
                    }
                    setNewPhotoFile(file);
                    setNewPhotoPreview(URL.createObjectURL(file));
                  }
                }}
              />

              {newPhotoPreview ? (
                <div className="flex flex-col items-center gap-3 py-1">
                  <div className="relative aspect-3/4 w-44 rounded-xl overflow-hidden border-2 border-border/80 bg-card shadow-md">
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
                      className="absolute top-2 right-2 size-6 rounded-md bg-black/80 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer border-2 border-white/20"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                  {newPhotoFile && (
                    <div className="text-center">
                      <p className="text-xs font-semibold text-foreground truncate max-w-xs">{newPhotoFile.name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{(newPhotoFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for S3 enrollment</p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => photoInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPhotoDragOver(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPhotoDragOver(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPhotoDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      if (file.size > 5 * 1024 * 1024) {
                        toast.error("Image file size exceeds 5 MB limit");
                        return;
                      }
                      setNewPhotoFile(file);
                      setNewPhotoPreview(URL.createObjectURL(file));
                    }
                  }}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 sm:p-10 flex flex-col items-center justify-center gap-3 text-center transition-colors cursor-pointer select-none",
                    isPhotoDragOver
                      ? "border-2 border-[#665AEF] bg-[#665AEF]/10 ring-2 ring-[#665AEF]/20"
                      : "border-2 border-border/80 bg-card/40 hover:border-border hover:bg-muted/40"
                  )}
                >
                  <div className="size-12 rounded-xl border-2 border-border/80 bg-muted/60 flex items-center justify-center text-foreground shadow-xs">
                    <Upload className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Click to select or drag & drop booking photo
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG, or WEBP up to 5MB • Front-facing portrait
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: HISTORICAL MUGSHOTS ARCHIVE (PORTION 2: PREMIUM MINIMAL DESIGN WITH BORDER-2) */}
            <TabsContent value="archive" className="space-y-3 outline-none">
              {/* Clean Sub-Header with border-2 */}
              <div className="flex items-center justify-between text-xs text-muted-foreground px-0.5 pb-2 border-b-2 border-border/60">
                <span className="font-semibold text-foreground text-xs tracking-wider uppercase">
                  Booking Archive ({photoHistory.length})
                </span>
                <span className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
                  <HardDrive className="size-3 text-muted-foreground" />
                  0 MB Tigris Delta
                </span>
              </div>

              {isLoadingHistory ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  <Skeleton className="aspect-3/4 rounded-xl border-2 border-border/80 bg-muted/40" />
                  <Skeleton className="aspect-3/4 rounded-xl border-2 border-border/80 bg-muted/40" />
                  <Skeleton className="aspect-3/4 rounded-xl border-2 border-border/80 bg-muted/40" />
                </div>
              ) : photoHistory.length === 0 ? (
                <div className="border-2 border-dashed border-border/80 rounded-xl p-8 text-center bg-card/40">
                  <History className="size-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">No Historical Mugshots Found</p>
                  <p className="text-xs text-muted-foreground mt-1">Uploaded profile mugshots will automatically be archived here for rollback.</p>
                </div>
              ) : photoHistory.length === 1 ? (
                /* SINGLE PHOTO DOSSIER LAYOUT: High-precision side-by-side cards with border-2 */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {(() => {
                    const item = photoHistory[0];
                    const isSelected = selectedHistoryKey === item.storageKey;
                    const displayUrl = item.url || getSafeStorageUrl(item.storageKey) || "/images/suspects/arun-prakash.jpg";
                    return (
                      <div
                        onClick={() => setSelectedHistoryKey(item.storageKey)}
                        className={cn(
                          "group relative aspect-3/4 rounded-xl overflow-hidden cursor-pointer select-none transition-all",
                          isSelected
                            ? "border-2 border-[#665AEF] ring-2 ring-[#665AEF]/25 bg-card shadow-md"
                            : "border-2 border-border/80 hover:border-border bg-card/60"
                        )}
                      >
                        <Image
                          src={displayUrl}
                          alt={item.fileName || "Booking Photo"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                        {/* Badges Header with border-2 */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          {item.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-emerald-500/50 bg-emerald-500/20 text-emerald-400 backdrop-blur-md">
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-border bg-card/90 text-muted-foreground backdrop-blur-md">
                              Archived
                            </span>
                          )}

                          <div className="flex items-center gap-1.5 pointer-events-auto">
                            <button
                              type="button"
                              title="Delete photo from Tigris S3"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhotoToDelete(item);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="size-6 rounded-md bg-black/75 hover:bg-destructive text-muted-foreground hover:text-white border-2 border-border/80 hover:border-destructive flex items-center justify-center transition-all cursor-pointer shadow-xs"
                            >
                              <Trash2 className="size-3" />
                            </button>

                            {isSelected && (
                              <div className="size-5 rounded-md border-2 border-[#665AEF] bg-[#665AEF] text-white flex items-center justify-center shadow-sm">
                                <Check className="size-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Metadata */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none text-left">
                          <p className="text-xs font-semibold text-white drop-shadow-xs">
                            {new Date(item.uploadedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-[11px] text-zinc-300 truncate font-mono mt-0.5">
                            {item.fileName || "Booking Photo"}
                          </p>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Dossier Record Specification Panel with border-2 */}
                  <div className="rounded-xl border-2 border-border/80 bg-card/60 p-4 flex flex-col justify-between text-xs">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b-2 border-border/60 pb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Vault Dossier Spec</span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono border-2 border-border/80 bg-muted/60 text-foreground font-semibold">v1.0 ACTIVE</span>
                      </div>
                      
                      <div className="space-y-2.5 text-foreground">
                        <div>
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Archive File</span>
                          <span className="font-mono text-xs text-foreground truncate block font-medium">
                            {photoHistory[0].fileName || "booking-photo.jpg"}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Enrollment Timestamp</span>
                          <span className="text-xs text-foreground block font-medium">
                            {new Date(photoHistory[0].uploadedAt).toLocaleString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-muted-foreground font-semibold block">Biometric Enrollment</span>
                          <span className="font-mono text-[11px] text-emerald-400 flex items-center gap-1.5 font-medium mt-0.5">
                            <span className="size-1.5 rounded-full bg-emerald-400" />
                            ArcFace 512-dim Vector Enrolled
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-border/60 flex flex-col gap-2">
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Subsequent photo updates will automatically be recorded here for instant 0 MB rollback.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isDeletingPhoto || isRollingBack}
                        onClick={() => {
                          setPhotoToDelete(photoHistory[0]);
                          setIsDeleteDialogOpen(true);
                        }}
                        className="w-full h-8 text-xs font-semibold border-2 border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive/60 rounded-lg cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                      >
                        <Trash2 className="size-3.5" />
                        <span>Purge from Tigris S3</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                /* MULTI-PHOTO GALLERY GRID: All photos with border-2 */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 max-h-[350px] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-0.5">
                  {photoHistory.map((item) => {
                    const isSelected = selectedHistoryKey === item.storageKey;
                    const displayUrl = item.url || getSafeStorageUrl(item.storageKey) || "/images/suspects/arun-prakash.jpg";
                    return (
                      <div
                        key={item.id || item.storageKey}
                        onClick={() => setSelectedHistoryKey(item.storageKey)}
                        className={cn(
                          "group relative aspect-3/4 rounded-xl overflow-hidden cursor-pointer select-none transition-all",
                          isSelected
                            ? "border-2 border-[#665AEF] ring-2 ring-[#665AEF]/25 bg-card shadow-md"
                            : "border-2 border-border/80 hover:border-border bg-card/60"
                        )}
                      >
                        <Image
                          src={displayUrl}
                          alt={item.fileName || "Historical Mugshot"}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />

                        {/* Badges Header with border-2 */}
                        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                          {item.isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-emerald-500/50 bg-emerald-500/20 text-emerald-400 backdrop-blur-md">
                              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-border bg-card/90 text-muted-foreground backdrop-blur-md">
                              Archived
                            </span>
                          )}

                          <div className="flex items-center gap-1.5 pointer-events-auto">
                            <button
                              type="button"
                              title="Delete photo from Tigris S3"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhotoToDelete(item);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="size-6 rounded-md bg-black/75 hover:bg-destructive text-muted-foreground hover:text-white border-2 border-border/80 hover:border-destructive flex items-center justify-center transition-all cursor-pointer shadow-xs"
                            >
                              <Trash2 className="size-3" />
                            </button>

                            {isSelected && (
                              <div className="size-5 rounded-md border-2 border-[#665AEF] bg-[#665AEF] text-white flex items-center justify-center shadow-sm">
                                <Check className="size-3 stroke-[3]" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Metadata */}
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none text-left">
                          <p className="text-xs font-semibold text-white drop-shadow-xs">
                            {new Date(item.uploadedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-[11px] text-zinc-300 truncate font-mono mt-0.5">
                            {item.fileName || "Booking Photo"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Footer Controls with border-2 */}
          <div className="flex items-center justify-between gap-3 pt-3 mt-1 border-t-2 border-border/80">
            <div className="text-xs text-muted-foreground min-w-0 flex items-center gap-2">
              {photoHistoryTab === "archive" && selectedHistoryKey ? (
                <div className="flex items-center gap-2 truncate">
                  <span className="size-2 rounded-full bg-muted-foreground/60 shrink-0" />
                  <span className="text-[11px] font-mono text-foreground font-medium truncate max-w-[200px]">
                    {photoHistory.find((h) => h.storageKey === selectedHistoryKey)?.fileName || "Selected Mugshot"}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] text-muted-foreground">
                  {photoHistoryTab === "upload" ? "Frontal facial biometric standard" : "Select a photo to review or restore"}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                disabled={isUploadingPhoto || isRollingBack}
                onClick={() => {
                  setIsChangePhotoOpen(false);
                  setNewPhotoFile(null);
                  setNewPhotoPreview(null);
                }}
                className="h-9 px-4 border-2 border-border/80 bg-card/60 text-foreground hover:bg-muted/60 hover:text-foreground rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
              >
                Cancel
              </Button>

              {photoHistoryTab === "upload" ? (
                <Button
                  size="sm"
                  disabled={!newPhotoFile || isUploadingPhoto}
                  onClick={handleSaveNewPhoto}
                  className="h-9 px-4 bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-xs shadow-[#665AEF]/25 text-xs font-semibold cursor-pointer rounded-lg gap-2"
                >
                  {isUploadingPhoto ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Uploading to S3...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="size-3.5" />
                      <span>Save & Set Active</span>
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  {selectedHistoryKey && photoHistory.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isRollingBack || isDeletingPhoto}
                      onClick={() => {
                        const selectedItem = photoHistory.find((h) => h.storageKey === selectedHistoryKey);
                        if (selectedItem) {
                          setPhotoToDelete(selectedItem);
                          setIsDeleteDialogOpen(true);
                        }
                      }}
                      className="h-9 px-3 border-2 border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:border-destructive/60 rounded-lg text-xs font-semibold cursor-pointer shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="hidden sm:inline">Delete from Tigris</span>
                      <span className="sm:hidden">Delete</span>
                    </Button>
                  )}

                  {(() => {
                    const selectedItem = photoHistory.find((h) => h.storageKey === selectedHistoryKey);
                    const isCurrentlyActive = selectedItem?.isActive;

                    if (isCurrentlyActive) {
                      return (
                        <Button
                          size="sm"
                          disabled
                          className="h-9 px-4 bg-muted/40 border-2 border-border/80 text-muted-foreground text-xs font-semibold cursor-not-allowed rounded-lg shadow-xs"
                        >
                          Currently Active Photo
                        </Button>
                      );
                    }

                    return (
                      <Button
                        size="sm"
                        disabled={!selectedHistoryKey || isRollingBack || isDeletingPhoto || photoHistory.length === 0}
                        onClick={handleRollbackPhoto}
                        className="h-9 px-4 bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-xs shadow-[#665AEF]/25 text-xs font-semibold cursor-pointer rounded-lg gap-2"
                      >
                        {isRollingBack ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Restoring...</span>
                          </>
                        ) : (
                          <>
                            <RotateCcw className="size-3.5" />
                            <span>Restore as Active Photo</span>
                          </>
                        )}
                      </Button>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* 3.1 CONFIRM DELETE PHOTO FROM TIGRIS S3 DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!isDeletingPhoto) {
            setIsDeleteDialogOpen(false);
            setPhotoToDelete(null);
          }
        }}
        onConfirm={handleConfirmDeletePhoto}
        title="Permanently Delete Mugshot from Tigris S3?"
        description="This action cannot be undone. The selected booking mugshot object will be permanently purged from Tigris S3 bucket storage and removed from the biometric archive."
        confirmText={isDeletingPhoto ? "Deleting from Tigris..." : "Delete from Tigris S3"}
        cancelText="Keep Photo"
        variant="destructive"
        icon={<Trash2 className="size-4" />}
        isLoading={isDeletingPhoto}
        zIndex="z-[80]"
      >
        {photoToDelete && (
          <div className="rounded-xl border-2 border-border/80 bg-card/60 p-3.5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="relative aspect-3/4 w-14 rounded-lg overflow-hidden border-2 border-border/80 bg-muted shrink-0">
                <Image
                  src={photoToDelete.url || getSafeStorageUrl(photoToDelete.storageKey) || "/images/suspects/arun-prakash.jpg"}
                  alt="Mugshot to delete"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  {photoToDelete.isActive ? (
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-emerald-500/40 bg-emerald-500/15 text-emerald-400">
                      <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Profile Photo
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border-2 border-border/80 bg-muted/60 text-muted-foreground">
                      Archived Mugshot
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-foreground truncate font-mono">
                  {photoToDelete.fileName || "booking-photo.jpg"}
                </p>
                <p className="text-[10px] text-muted-foreground truncate font-mono">
                  Key: {photoToDelete.storageKey}
                </p>
              </div>
            </div>

            {photoToDelete.isActive && (
              <div className="flex items-start gap-2.5 rounded-lg border-2 border-destructive/30 bg-destructive/10 p-2.5 text-[11px] text-destructive leading-relaxed">
                <AlertTriangle className="size-4 text-destructive shrink-0 mt-0.5" />
                <p>
                  <strong className="font-semibold">Notice:</strong> Deleting the active photo will automatically promote the latest archive photo or clear the profile mugshot.
                </p>
              </div>
            )}
          </div>
        )}
      </ConfirmDialog>



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
        currentCase={
          linkedCase
            ? {
                id: linkedCase.id,
                caseNumber: linkedCase.caseNumber,
                title: linkedCase.title,
                priority: linkedCase.priority,
                status: linkedCase.status,
                role: primaryCaseLink?.role,
                caseStatus: primaryCaseLink?.status,
              }
            : null
        }
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}
