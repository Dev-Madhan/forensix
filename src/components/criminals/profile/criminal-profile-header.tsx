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
  Download,
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
} from "lucide-react";
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
import type { Criminal } from "@prisma/client";

interface CriminalProfileHeaderProps {
  criminal: Criminal;
  mugshotDisplayUrl: string | null;
  onNavigateToTab?: (tabId: string) => void;
}

export function CriminalProfileHeader({
  criminal,
  mugshotDisplayUrl,
}: CriminalProfileHeaderProps) {
  const demographics = (criminal.demographics as Record<string, unknown> | null) || {};

  // Dynamic States
  const [isOnWatchlist, setIsOnWatchlist] = useState(
    demographics.watchlistStatus === "On Watchlist" || criminal.status === "WANTED"
  );
  const [generatingReport, setGeneratingReport] = useState(false);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);
  const [isChangePhotoOpen, setIsChangePhotoOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Editable Profile fields (for interactive demo / live edit)
  const [fullName, setFullName] = useState(`${criminal.firstName} ${criminal.lastName}`);
  const [knownAs, setKnownAs] = useState(
    Array.isArray(demographics.aliases)
      ? (demographics.aliases as string[]).slice(0, 2).join(", ")
      : "Karthik A., Black Karthik"
  );
  const [occupation, setOccupation] = useState(
    (demographics.occupation as string) || "Unknown"
  );
  const [lastLocation, setLastLocation] = useState(
    criminal.lastKnownLocation || "Chennai, Tamil Nadu"
  );
  const [fathersName, setFathersName] = useState(
    (demographics.fathersName as string) || "Karthik R."
  );
  const [mothersName, setMothersName] = useState(
    (demographics.mothersName as string) || "Meena R."
  );

  // Fallback image handling
  const resolvedPhoto =
    mugshotDisplayUrl &&
    !mugshotDisplayUrl.includes("fly.storage.tigris.dev//") &&
    !mugshotDisplayUrl.includes("undefined")
      ? mugshotDisplayUrl
      : "/images/suspects/arjun-karthik.jpg";

  const formattedDob = criminal.dateOfBirth
    ? new Date(criminal.dateOfBirth).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + " (32 years)"
    : "Mar 14, 1992 (32 years)";

  const formattedUpdated = new Date(criminal.updatedAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  const aadharId = (demographics.aadharId as string) || "XXXX-XXXX-7789";
  const passportNo = (demographics.passportNo as string) || "Z6543219";
  const drivingLicense = (demographics.drivingLicense as string) || "TN-DL-4382";
  const otherId = (demographics.otherId as string) || "—";
  const riskLevel = (demographics.riskLevel as string) || "High";
  const threatAssessment =
    (demographics.threatAssessment as string) || "Likely to re-offend";

  // Watchlist Toggle
  const handleToggleWatchlist = () => {
    setIsOnWatchlist((prev) => {
      const next = !prev;
      if (next) {
        toast.success(`${fullName} placed on Priority Watchlist`, {
          description: "Alerts dispatched to field patrol units.",
        });
      } else {
        toast.info(`${fullName} removed from Priority Watchlist`);
      }
      return next;
    });
  };

  // Generate Report
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    toast.info(`Compiling forensic intelligence report for ${fullName}...`, {
      duration: 3000,
    });

    try {
      await new Promise((r) => setTimeout(r, 1800));

      // Create a downloadable dossier
      const dossierContent = `=====================================================
FORENSIX AI FORENSIC INTELLIGENCE DOSSIER
CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE
=====================================================
SUBJECT IDENTIFICATION
Criminal ID     : ${criminal.criminalId}
Full Name       : ${fullName}
Known As        : ${knownAs}
Date of Birth   : ${formattedDob}
Gender          : ${criminal.gender || "Male"}
Nationality     : ${criminal.nationality || "Indian"}
Last Location   : ${lastLocation}

IDENTIFIERS
Aadhaar ID      : ${aadharId}
Passport No.    : ${passportNo}
Driving License : ${drivingLicense}

STATUS & CLASSIFICATION
Current Status  : ${criminal.status}
Risk Level      : ${riskLevel}
Threat Level    : ${threatAssessment}
Watchlist Status: ${isOnWatchlist ? "ON WATCHLIST" : "STANDARD"}

PHYSICAL CHARACTERISTICS
Height          : ${(demographics.height as string) || "5'10\" (178 cm)"}
Weight          : ${(demographics.weight as string) || "70 kg"}
Build           : ${(demographics.build as string) || "Athletic"}
Eye Color       : ${(demographics.eyeColor as string) || "Brown"}
Hair Color      : ${(demographics.hairColor as string) || "Black"}
Complexion      : ${(demographics.complexion as string) || "Wheatish"}
Distinctive Mark: ${(demographics.distinctiveMarks as string) || "Scar on left eyebrow"}
Tattoos         : ${(demographics.tattoos as string) || "Dragon (right arm)"}

CRIME SUMMARY
${criminal.description || "Armed robbery at commercial establishments. Known to use two-wheelers."}

Compiled by Forensix Intelligence Core
Generated on: ${new Date().toISOString()}
=====================================================`;

      const blob = new Blob([dossierContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `FORENSIX-DOSSIER-${criminal.criminalId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Forensic Dossier for ${fullName} downloaded successfully.`);
    } catch {
      toast.error("Failed to compile forensic report.");
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleShareProfile = () => {
    setIsShareModalOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    toast.success("Profile URL copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* ─────────────────────────────────────────────────────────────
          TOP BAR: Back link on left, Action buttons on right
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Back Link with Sidebar Toggle */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground cursor-pointer" />
          <Link
            href="/dashboard/criminals"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer w-fit"
          >
            <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Criminal Database</span>
          </Link>
        </div>

        {/* Action Buttons Group */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Add to Watchlist Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleWatchlist}
            className={`h-9 gap-2 rounded-lg border-2 text-xs sm:text-sm font-medium cursor-pointer shadow-xs transition-colors ${
              isOnWatchlist
                ? "border-[#665AEF]/50 bg-[#665AEF]/15 text-[#a594fd] hover:bg-[#665AEF]/25"
                : "border-border/80 bg-card/60 hover:bg-muted/60 hover:text-foreground text-foreground"
            }`}
          >
            <Shield className="size-3.5" />
            <span>{isOnWatchlist ? "On Watchlist" : "Add to Watchlist"}</span>
          </Button>

          {/* Generate Report Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateReport}
            disabled={generatingReport}
            className="h-9 gap-2 rounded-lg border-2 border-border/80 bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer shadow-xs"
          >
            {generatingReport ? (
              <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
            ) : (
              <FileText className="size-3.5 text-muted-foreground" />
            )}
            <span>{generatingReport ? "Generating..." : "Generate Report"}</span>
          </Button>

          {/* Edit Profile Button */}
          <Link
            href={`/dashboard/criminals/${criminal.criminalId}/edit`}
            className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border-2 border-border/80 bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground text-foreground cursor-pointer shadow-xs transition-colors"
          >
            <Edit className="size-3.5 text-muted-foreground" />
            <span>Edit Profile</span>
          </Link>

          {/* More Actions Dropdown Button */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button className="h-9 gap-1.5 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs sm:text-sm font-medium shadow-sm shadow-[#665AEF]/25 px-3.5 cursor-pointer" />
              }
            >
              <span>More Actions</span>
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
                    href={`/dashboard/criminals/${criminal.criminalId}/edit`}
                    className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground flex items-center"
                  />
                }
              >
                <Edit className="size-3.5 text-muted-foreground" />
                <span>Edit Profile Record</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleGenerateReport}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground"
              >
                <Download className="size-3.5 text-muted-foreground" />
                <span>Export Dossier</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => window.print()}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground"
              >
                <Printer className="size-3.5 text-muted-foreground" />
                <span>Print Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={handleShareProfile}
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground"
              >
                <Share2 className="size-3.5 text-muted-foreground" />
                <span>Share Profile Link</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  toast.success("Surveillance flag updated", {
                    description: "Subject marked for continuous monitoring.",
                  })
                }
                className="cursor-pointer gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted font-medium text-foreground"
              >
                <Eye className="size-3.5 text-muted-foreground" />
                <span>Mark Surveillance</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator className="my-1 border-border/60" />

              <DropdownMenuItem
                onClick={() =>
                  toast.error("Supervisory Authorization Required", {
                    description: "Only administrative supervisors can archive criminal records.",
                  })
                }
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
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
          {fullName}
        </h1>
        {riskLevel === "High" ? (
          <span className="inline-flex items-center rounded-[4px] border-2 border-rose-500/40 bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold text-rose-400 tracking-wide">
            High Risk
          </span>
        ) : riskLevel === "Medium" ? (
          <span className="inline-flex items-center rounded-[4px] border-2 border-amber-500/40 bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-400 tracking-wide">
            Medium Risk
          </span>
        ) : (
          <span className="inline-flex items-center rounded-[4px] border-2 border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 tracking-wide">
            Low Risk
          </span>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CRIMINAL ID & LAST UPDATED SUBTITLE
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground">
        <span className="font-mono font-medium tracking-wide text-foreground/80">
          {criminal.criminalId}
        </span>
        <span className="text-muted-foreground/60">•</span>
        <span>Last Updated: {formattedUpdated}</span>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TOP 4-CARD SECTION (Exactly matching reference image)
          Col 1: Mugshot (2 cols)
          Col 2: Personal Information (4 cols)
          Col 3: Identifiers (3 cols)
          Col 4: Status & Classification (3 cols)
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 lg:gap-5 w-full">
        {/* CARD 1: MUGSHOT PHOTO */}
        <div className="xl:col-span-2 2xl:col-span-2 flex flex-col">
          <div className="relative h-full min-h-[260px] w-full rounded-xl overflow-hidden border-2 border-border/80 bg-card/60 shadow-xs group">
            <Image
              src={resolvedPhoto}
              alt={fullName}
              fill
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 240px"
            />

            {/* Gradient shadow overlay at bottom for change photo button */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-black/30 pointer-events-none" />

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
        <div className="xl:col-span-4 2xl:col-span-4 flex flex-col">
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

              {/* 2 Sub-Columns Grid */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 text-xs">
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
        <div className="xl:col-span-3 2xl:col-span-3 flex flex-col">
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
              <div className="space-y-2 pt-3 text-xs">
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
        <div className="xl:col-span-3 2xl:col-span-3 flex flex-col">
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
              <div className="space-y-2 pt-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Current Status</span>
                  <span className="inline-flex items-center rounded-[4px] border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                    {criminal.status === "ACTIVE" ? "Active" : criminal.status}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-muted-foreground text-[11px]">Risk Level</span>
                  <span className="inline-flex items-center rounded-[4px] border border-rose-500/40 bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-400">
                    {riskLevel}
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
                    className={`inline-flex items-center rounded-[4px] border px-2 py-0.5 text-[11px] font-semibold ${
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
                  <span className="inline-flex items-center rounded-[4px] border border-amber-500/40 bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-400">
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
          <div className="relative aspect-[3/4] w-full max-h-[540px] rounded-xl overflow-hidden border border-border/80 bg-black">
            <Image
              src={resolvedPhoto}
              alt={fullName}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 600px"
            />
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
        onClose={() => setIsChangePhotoOpen(false)}
        title="Update Criminal Photo"
        description="Upload a new front-facing booking photo or mugshot."
      >
        <div className="space-y-4 py-2">
          <div className="border-2 border-dashed border-border/70 rounded-xl p-8 flex flex-col items-center justify-center gap-3 text-center bg-muted/10 hover:bg-muted/20 transition-colors cursor-pointer">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#665AEF]/15 text-[#a594fd]">
              <Upload className="size-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Click or drag mugshot file here
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                PNG, JPG, or WEBP up to 10MB
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangePhotoOpen(false)}
              className="h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setIsChangePhotoOpen(false);
                toast.success("Photo update queued for forensic verification");
              }}
              className="h-9 px-4 bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-xs shadow-[#665AEF]/25"
            >
              Save Photo
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
            <Label className="text-xs text-muted-foreground">Direct Dossier URL</Label>
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
    </div>
  );
}
