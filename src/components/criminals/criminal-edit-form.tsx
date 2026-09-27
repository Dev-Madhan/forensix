"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format, isValid } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Shield,
  User,
  Fingerprint,
  Calendar,
  Lock,
  ChevronDown,
  Check,
  Plus,
  X,
  UploadCloud,
  FileText,
  MapPin,
  Tag,
  Sparkles,
  Camera,
  Activity,
  AlertTriangle,
  BookOpen,
  Dna,
  Scan,
  Compass,
  CheckCircle2,
  RefreshCw,
  Eye,
} from "lucide-react";
import { useMediaDrop } from "react-mediadrop";
import type { Criminal } from "@prisma/client";
import { CriminalStatus } from "@prisma/client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateCriminal, uploadMugshot } from "@/features/criminals/actions";
import { cn } from "@/lib/utils";

interface CriminalEditFormProps {
  criminal: Criminal;
  mugshotDisplayUrl?: string | null;
}

const CRIME_CATEGORIES = [
  "Theft",
  "Armed Robbery",
  "Burglary",
  "Assault",
  "Fraud",
  "Cyber Crime",
  "Drug Offense",
  "Extortion",
  "Homicide",
  "Kidnapping",
  "Smuggling",
  "Forgery",
  "Vandalism",
  "Other",
];

const STATUS_OPTIONS: { label: string; value: CriminalStatus; color: string }[] = [
  { label: "Active", value: CriminalStatus.ACTIVE, color: "bg-emerald-400" },
  { label: "Wanted", value: CriminalStatus.WANTED, color: "bg-rose-400" },
  { label: "In Custody", value: CriminalStatus.ARCHIVED, color: "bg-blue-400" },
  { label: "Under Surveillance", value: CriminalStatus.ACTIVE, color: "bg-amber-400" },
  { label: "Inactive", value: CriminalStatus.INACTIVE, color: "bg-muted-foreground" },
];

const RISK_LEVELS = ["High", "Medium", "Low"];
const GENDER_OPTIONS = ["Male", "Female", "Non-Binary", "Other"];
const NATIONALITY_OPTIONS = [
  "Indian",
  "American",
  "British",
  "Canadian",
  "Australian",
  "German",
  "French",
  "Singaporean",
  "Emirati",
  "Other",
];
const BUILD_OPTIONS = ["Athletic", "Medium", "Heavy", "Slim", "Muscular"];
const EYE_COLORS = ["Brown", "Black", "Hazel", "Blue", "Green", "Gray"];
const HAIR_COLORS = ["Black", "Dark Brown", "Light Brown", "Gray", "Bald", "White"];
const COMPLEXION_OPTIONS = ["Wheatish", "Fair", "Dusky", "Dark", "Olive"];
const MARITAL_STATUS_OPTIONS = ["Single", "Married", "Divorced", "Widowed", "Separated"];

const DEFAULT_SUGGESTED_ALIASES = [
  "Shadow",
  "Phantom",
  "Ghost",
  "Viper",
  "The Blade",
  "Night Runner",
  "Cobra",
  "The Fox",
  "AK",
  "Black Karthik",
  "Quickfinger",
];

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getStatusLabel(s: CriminalStatus): string {
  switch (s) {
    case CriminalStatus.ACTIVE:
      return "Active";
    case CriminalStatus.WANTED:
      return "Wanted";
    case CriminalStatus.ARCHIVED:
      return "In Custody";
    case CriminalStatus.INACTIVE:
      return "Inactive";
    default:
      return s;
  }
}

export function CriminalEditForm({
  criminal,
  mugshotDisplayUrl,
}: CriminalEditFormProps) {
  const router = useRouter();

  const demographics = (criminal.demographics as Record<string, unknown> | null) || {};

  // Form State
  const [isSaving, setIsSaving] = React.useState(false);

  // Core & Identification
  const [fullName, setFullName] = React.useState(
    (demographics.fullName as string) || `${criminal.firstName} ${criminal.lastName}`.trim()
  );
  const [status, setStatus] = React.useState<CriminalStatus>(criminal.status);
  const [riskLevel, setRiskLevel] = React.useState<string>(
    (demographics.riskLevel as string) || "High"
  );
  const [primaryCategory, setPrimaryCategory] = React.useState<string>(
    (demographics.primaryCategory as string) || "Theft"
  );
  const [secondaryCategory, setSecondaryCategory] = React.useState<string>(
    (demographics.secondaryCategory as string) || "Armed Robbery, Assault"
  );

  // Personal Background
  const initialDob = criminal.dateOfBirth ? new Date(criminal.dateOfBirth) : undefined;
  const [dateOfBirth, setDateOfBirth] = React.useState<Date | undefined>(
    initialDob && isValid(initialDob) ? initialDob : undefined
  );
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [gender, setGender] = React.useState<string>(criminal.gender || "Male");
  const [nationality, setNationality] = React.useState<string>(criminal.nationality || "Indian");
  const [knownAs, setKnownAs] = React.useState<string>(
    criminal.alias || (demographics.knownAs as string) || ""
  );
  const [fathersName, setFathersName] = React.useState<string>(
    (demographics.fathersName as string) || ""
  );
  const [mothersName, setMothersName] = React.useState<string>(
    (demographics.mothersName as string) || ""
  );
  const [occupation, setOccupation] = React.useState<string>(
    (demographics.occupation as string) || ""
  );
  const [maritalStatus, setMaritalStatus] = React.useState<string>(
    (demographics.maritalStatus as string) || "Single"
  );
  const [placeOfBirth, setPlaceOfBirth] = React.useState<string>(
    (demographics.placeOfBirth as string) || "Chennai, Tamil Nadu"
  );

  // Identifiers
  const [nationalId, setNationalId] = React.useState<string>(
    (demographics.nationalId as string) || ""
  );
  const [passportNumber, setPassportNumber] = React.useState<string>(
    (demographics.passportNumber as string) || ""
  );
  const [drivingLicense, setDrivingLicense] = React.useState<string>(
    (demographics.drivingLicense as string) || "TN-DL-4382"
  );
  const [otherId, setOtherId] = React.useState<string>(
    (demographics.otherId as string) || ""
  );

  // Physical Characteristics
  const [height, setHeight] = React.useState<string>(
    (demographics.height as string)?.replace(/[^0-9]/g, "") || "178"
  );
  const [weight, setWeight] = React.useState<string>(
    (demographics.weight as string)?.replace(/[^0-9]/g, "") || "70"
  );
  const [build, setBuild] = React.useState<string>(
    (demographics.build as string) || "Athletic"
  );
  const [eyeColor, setEyeColor] = React.useState<string>(
    (demographics.eyeColor as string) || "Brown"
  );
  const [hairColor, setHairColor] = React.useState<string>(
    (demographics.hairColor as string) || "Black"
  );
  const [complexion, setComplexion] = React.useState<string>(
    (demographics.complexion as string) || "Wheatish"
  );
  const [distinctiveMarks, setDistinctiveMarks] = React.useState<string>(
    (demographics.distinctiveMarks as string) || "Scar on left eyebrow"
  );
  const [tattoos, setTattoos] = React.useState<string>(
    (demographics.tattoos as string) || "Dragon (right arm)"
  );

  // Location & Narrative
  const [address, setAddress] = React.useState<string>(
    criminal.address || (demographics.knownAddresses as string) || ""
  );
  const [lastKnownLocation, setLastKnownLocation] = React.useState<string>(
    criminal.lastKnownLocation || "Chennai, Tamil Nadu"
  );
  const [knownAssociates, setKnownAssociates] = React.useState<string>(
    (demographics.knownAssociates as string) || "Selvam, Muthu (Local Gang)"
  );
  const [modusOperandi, setModusOperandi] = React.useState<string>(
    (demographics.modusOperandi as string) ||
      "Armed robbery at commercial establishments. Operates late hours with two-wheelers."
  );
  const [description, setDescription] = React.useState<string>(
    criminal.description ||
      "Armed robbery at commercial establishments. Often operates during late hours. Known to use a knife/weapon and flee via two-wheeler."
  );

  // Aliases with Suggested Tags
  const [aliases, setAliases] = React.useState<string[]>(() => {
    if (Array.isArray(demographics.aliases)) {
      return demographics.aliases as string[];
    }
    if (criminal.alias) {
      return [criminal.alias];
    }
    return ["Karthik A.", "Black Karthik", "AK"];
  });
  const [newAlias, setNewAlias] = React.useState("");
  const [isAddingAlias, setIsAddingAlias] = React.useState(false);

  // Photo Upload State
  const [newMugshotFile, setNewMugshotFile] = React.useState<File | null>(null);
  const [mugshotPreview, setMugshotPreview] = React.useState<string | null>(null);

  // Dropdown hover animations
  const [hoveredCategory, setHoveredCategory] = React.useState<string | null>(null);
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null);
  const [hoveredRisk, setHoveredRisk] = React.useState<string | null>(null);
  const [hoveredGender, setHoveredGender] = React.useState<string | null>(null);
  const [hoveredNationality, setHoveredNationality] = React.useState<string | null>(null);
  const [hoveredBuild, setHoveredBuild] = React.useState<string | null>(null);
  const [hoveredEye, setHoveredEye] = React.useState<string | null>(null);
  const [hoveredHair, setHoveredHair] = React.useState<string | null>(null);
  const [hoveredComplexion, setHoveredComplexion] = React.useState<string | null>(null);
  const [hoveredMarital, setHoveredMarital] = React.useState<string | null>(null);

  // Suggested Aliases list
  const suggestedAliases = React.useMemo(() => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const dynamic: string[] = [];
    if (parts[0]) dynamic.push(parts[0]);
    if (parts.length > 1) dynamic.push(parts[parts.length - 1]);
    if (parts[0] && parts.length > 1) {
      dynamic.push(`${parts[0][0]}. ${parts[parts.length - 1]}`);
    }
    const all = Array.from(new Set([...dynamic, ...DEFAULT_SUGGESTED_ALIASES]));
    return all.filter((s) => !aliases.includes(s));
  }, [fullName, aliases]);

  const handleAddAlias = (aliasToAdd?: string) => {
    const val = aliasToAdd ?? newAlias.trim();
    if (!val) return;
    if (aliases.includes(val)) {
      toast.info("Alias already registered");
      return;
    }
    setAliases([...aliases, val]);
    if (!aliasToAdd) {
      setNewAlias("");
      setIsAddingAlias(false);
    }
    toast.success(`Alias "${val}" added`);
  };

  const handleRemoveAlias = (aliasToRemove: string) => {
    setAliases(aliases.filter((a) => a !== aliasToRemove));
    toast.info(`Alias "${aliasToRemove}" removed`);
  };

  // MediaDrop Upload Component Hook
  const {
    acceptedFiles,
    rejectedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useMediaDrop({
    restrictions: {
      accept: ["image/jpeg", "image/png", "image/webp"],
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024,
    },
  });

  React.useEffect(() => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const mf: any = acceptedFiles[acceptedFiles.length - 1];
      const file = (mf?.file instanceof File ? mf.file : (mf instanceof File ? mf : null)) as File | null;
      if (file) {
        setNewMugshotFile(file);
        const url = URL.createObjectURL(file);
        setMugshotPreview(url);
        toast.success(`Mugshot "${file.name}" staged for upload`);
      }
    }
  }, [acceptedFiles]);

  React.useEffect(() => {
    if (rejectedFiles && rejectedFiles.length > 0) {
      toast.error("File rejected: Please select a valid JPEG, PNG, or WebP image under 10MB");
    }
  }, [rejectedFiles]);

  const handleRevertPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setNewMugshotFile(null);
    setMugshotPreview(null);
    toast.info("Reverted to original profile mugshot");
  };

  // Reset Form
  const handleReset = () => {
    setFullName((demographics.fullName as string) || `${criminal.firstName} ${criminal.lastName}`.trim());
    setStatus(criminal.status);
    setRiskLevel((demographics.riskLevel as string) || "High");
    setPrimaryCategory((demographics.primaryCategory as string) || "Theft");
    setSecondaryCategory((demographics.secondaryCategory as string) || "Armed Robbery, Assault");
    setDateOfBirth(initialDob && isValid(initialDob) ? initialDob : undefined);
    setGender(criminal.gender || "Male");
    setNationality(criminal.nationality || "Indian");
    setKnownAs(criminal.alias || (demographics.knownAs as string) || "");
    setFathersName((demographics.fathersName as string) || "");
    setMothersName((demographics.mothersName as string) || "");
    setOccupation((demographics.occupation as string) || "");
    setMaritalStatus((demographics.maritalStatus as string) || "Single");
    setPlaceOfBirth((demographics.placeOfBirth as string) || "Chennai, Tamil Nadu");
    setNationalId((demographics.nationalId as string) || "");
    setPassportNumber((demographics.passportNumber as string) || "");
    setDrivingLicense((demographics.drivingLicense as string) || "TN-DL-4382");
    setOtherId((demographics.otherId as string) || "");
    setHeight((demographics.height as string)?.replace(/[^0-9]/g, "") || "178");
    setWeight((demographics.weight as string)?.replace(/[^0-9]/g, "") || "70");
    setBuild((demographics.build as string) || "Athletic");
    setEyeColor((demographics.eyeColor as string) || "Brown");
    setHairColor((demographics.hairColor as string) || "Black");
    setComplexion((demographics.complexion as string) || "Wheatish");
    setDistinctiveMarks((demographics.distinctiveMarks as string) || "Scar on left eyebrow");
    setTattoos((demographics.tattoos as string) || "Dragon (right arm)");
    setAddress(criminal.address || (demographics.knownAddresses as string) || "");
    setLastKnownLocation(criminal.lastKnownLocation || "Chennai, Tamil Nadu");
    setKnownAssociates((demographics.knownAssociates as string) || "Selvam, Muthu (Local Gang)");
    setModusOperandi((demographics.modusOperandi as string) || "Armed robbery at commercial establishments.");
    setDescription(criminal.description || "");
    setNewMugshotFile(null);
    setMugshotPreview(null);
    toast.info("All fields have been reset to current database values.");
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (!primaryCategory.trim()) {
      toast.error("Primary category is required");
      return;
    }

    setIsSaving(true);

    try {
      let finalMugshotUrl = criminal.mugshotUrl || undefined;

      // Upload new mugshot if selected
      if (newMugshotFile) {
        const formData = new FormData();
        formData.append("file", newMugshotFile);
        const uploadRes = await uploadMugshot(formData);
        if (uploadRes.success && uploadRes.storageKey) {
          finalMugshotUrl = uploadRes.storageKey;
        } else if (uploadRes.error) {
          console.warn("Mugshot upload fallback:", uploadRes.error);
        }
      }

      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || fullName.trim();
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";

      const updatedDemographics = {
        ...demographics,
        fullName: fullName.trim(),
        knownAs: knownAs.trim(),
        fathersName: fathersName.trim(),
        mothersName: mothersName.trim(),
        occupation: occupation.trim(),
        maritalStatus,
        placeOfBirth: placeOfBirth.trim(),
        nationalId: nationalId.trim(),
        passportNumber: passportNumber.trim(),
        drivingLicense: drivingLicense.trim(),
        otherId: drivingLicense.trim() || otherId.trim(),
        primaryCategory,
        secondaryCategory,
        riskLevel,
        height: height ? `${height} cm` : undefined,
        weight: weight ? `${weight} kg` : undefined,
        eyeColor,
        hairColor,
        build,
        complexion,
        distinctiveMarks: distinctiveMarks.trim(),
        tattoos: tattoos.trim(),
        knownAddresses: address.trim(),
        knownAssociates: knownAssociates.trim(),
        modusOperandi: modusOperandi.trim(),
        aliases,
      };

      const result = await updateCriminal({
        id: criminal.id,
        firstName,
        lastName,
        alias: knownAs || aliases[0] || undefined,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
        gender: gender || undefined,
        nationality: nationality || undefined,
        address: address.trim() || undefined,
        lastKnownLocation: lastKnownLocation.trim() || undefined,
        description: description.trim() || undefined,
        status,
        mugshotUrl: finalMugshotUrl,
        demographics: updatedDemographics,
      });

      if (result.error) {
        toast.error(`Update failed: ${result.error}`);
        setIsSaving(false);
        return;
      }

      toast.success("Criminal record successfully updated!");
      router.push(`/dashboard/criminals/${criminal.criminalId}`);
      router.refresh();
    } catch (err) {
      console.error("Save criminal error:", err);
      toast.error("Failed to update criminal profile.");
      setIsSaving(false);
    }
  };

  const displayPhoto =
    mugshotPreview ||
    mugshotDisplayUrl ||
    criminal.mugshotUrl ||
    "/images/suspects/arjun-karthik.jpg";

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 sm:space-y-6 w-full max-w-7xl mx-auto pb-10 sm:pb-12 min-w-0"
    >
      {/* ─────────────────────────────────────────────────────────────
          TOP STICKY / HEADER BAR
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 sm:gap-4 pb-4 border-b-2 border-border/60">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground -mt-1 sm:-mt-1.5 mb-2 sm:mb-2.5">
            <Link
              href={`/dashboard/criminals/${criminal.criminalId}`}
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer text-xs sm:text-sm font-medium"
            >
              <ArrowLeft className="size-3.5 sm:size-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Profile {criminal.criminalId}</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-foreground tracking-tight flex flex-wrap items-baseline gap-1.5 sm:gap-3">
            <span>Edit Profile:</span>
            <span className="text-[#665AEF] font-heading font-bold">{criminal.criminalId}</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
            Update biographical details, biometric identifiers, classification, physical markers, and judicial records.
          </p>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="h-9 gap-1.5 rounded-lg border-2 border-border/80 bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 cursor-pointer shadow-2xs justify-center"
          >
            <RotateCcw className="size-3.5 text-muted-foreground shrink-0" />
            <span>Reset</span>
          </Button>

          <Link
            href={`/dashboard/criminals/${criminal.criminalId}`}
            className="inline-flex items-center justify-center h-9 px-3 rounded-lg border-2 border-border/80 bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 text-foreground cursor-pointer shadow-2xs transition-colors"
          >
            Cancel
          </Link>

          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="h-9 gap-1.5 sm:gap-2 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs sm:text-sm font-medium shadow-sm shadow-[#665AEF]/25 px-3 sm:px-4 cursor-pointer justify-center"
          >
            {isSaving ? (
              <>
                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span className="truncate">Saving...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5 shrink-0" />
                <span className="truncate">
                  <span className="sm:hidden">Save</span>
                  <span className="hidden sm:inline">Save Changes</span>
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN BENTO GRID
          ───────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-stretch">
        {/* TILE 1 (12 COLS): CORE CLASSIFICATION & OPERATIONAL STATUS */}
        <div className="xl:col-span-12 min-w-0">
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <Shield className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Core Classification & Status
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none mt-0.5">
                    Define primary identification, operational status, threat tier, and crime categories
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5">
              {/* Row 1: Criminal ID (Locked) & Full Name */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4">
                <div className="sm:col-span-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="criminal-id"
                      className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                    >
                      Criminal ID
                    </Label>
                    <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                      <Lock className="size-2.5" /> Locked
                    </span>
                  </div>
                  <Input
                    id="criminal-id"
                    value={criminal.criminalId}
                    disabled
                    readOnly
                    className="h-10 font-heading font-bold text-base sm:text-sm bg-muted/40 border-2 border-border/60 text-muted-foreground tracking-wide cursor-not-allowed font-mono"
                  />
                </div>

                <div className="sm:col-span-8 space-y-1.5">
                  <Label
                    htmlFor="full-name"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Subject Full Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    placeholder="e.g. Arjun Karthik"
                    className="h-10 text-xs sm:text-sm font-medium border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>
              </div>

              {/* Row 2: Status, Risk Level, Primary Category, Secondary Category, Known As */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 sm:gap-4">
                {/* Status Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Operational Status
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs"
                        />
                      }
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span
                          className={cn(
                            "size-2 rounded-full shrink-0",
                            STATUS_OPTIONS.find((o) => o.value === status)?.color || "bg-emerald-400"
                          )}
                        />
                        <span className="truncate">{getStatusLabel(status)}</span>
                      </div>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-(--anchor-width) min-w-45 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      onPointerLeave={() => setHoveredStatus(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onPointerEnter={() => setHoveredStatus(opt.value)}
                            onClick={() => setStatus(opt.value)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs sm:text-sm font-medium"
                          >
                            {hoveredStatus === opt.value && (
                              <motion.div
                                layoutId="criminal-edit-status-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <div className="flex items-center gap-2">
                              <span className={cn("size-2 rounded-full", opt.color)} />
                              <span>{opt.label}</span>
                            </div>
                            {status === opt.value && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Risk Level Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Threat / Risk Level
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs"
                        />
                      }
                    >
                      <span className="truncate">{riskLevel}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-(--anchor-width) min-w-40 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      onPointerLeave={() => setHoveredRisk(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {RISK_LEVELS.map((level) => (
                          <DropdownMenuItem
                            key={level}
                            onPointerEnter={() => setHoveredRisk(level)}
                            onClick={() => setRiskLevel(level)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs sm:text-sm font-medium"
                          >
                            {hoveredRisk === level && (
                              <motion.div
                                layoutId="criminal-edit-risk-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <span>{level}</span>
                            {riskLevel === level && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Primary Category Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Primary Crime Category
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs"
                        />
                      }
                    >
                      <span className="truncate">{primaryCategory}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-(--anchor-width) min-w-45 max-h-60 overflow-y-auto no-scrollbar scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      onPointerLeave={() => setHoveredCategory(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {CRIME_CATEGORIES.map((cat) => (
                          <DropdownMenuItem
                            key={cat}
                            onPointerEnter={() => setHoveredCategory(cat)}
                            onClick={() => setPrimaryCategory(cat)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs sm:text-sm font-medium"
                          >
                            {hoveredCategory === cat && (
                              <motion.div
                                layoutId="criminal-edit-cat-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <span>{cat}</span>
                            {primaryCategory === cat && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Secondary Category Input */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="secondary-category"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Secondary Categories
                  </Label>
                  <Input
                    id="secondary-category"
                    value={secondaryCategory}
                    onChange={(e) => setSecondaryCategory(e.target.value)}
                    placeholder="e.g. Robbery, Assault"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TILE 2 (7 COLS): PERSONAL BACKGROUND & DEMOGRAPHICS */}
        <div className="xl:col-span-7 min-w-0 flex flex-col xl:self-stretch">
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <User className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Personal & Demographic Profile
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none mt-0.5">
                    Vital statistics, citizenship, and parentage records
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 flex-1 flex flex-col space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Date of Birth Picker */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="dob"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Calendar className="size-3 text-[#665AEF] shrink-0" />
                    <span>Date of Birth</span>
                  </Label>
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          id="dob"
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs text-left"
                        />
                      }
                    >
                      <span className="truncate">
                        {dateOfBirth ? format(dateOfBirth, "MMM d, yyyy") : "Select date"}
                      </span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </PopoverTrigger>
                    <PopoverContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-auto p-2 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                    >
                      <CalendarPicker
                        mode="single"
                        selected={dateOfBirth}
                        defaultMonth={dateOfBirth || new Date(1995, 0, 1)}
                        onSelect={(date) => {
                          if (date) {
                            setDateOfBirth(date);
                            setIsDatePickerOpen(false);
                          }
                        }}
                      />
                      <div className="flex items-center justify-between pt-2 border-t border-border/60 mt-1 px-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="xs"
                          className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground cursor-pointer"
                          onClick={() => {
                            setDateOfBirth(new Date());
                            setIsDatePickerOpen(false);
                          }}
                        >
                          Today
                        </Button>
                        {dateOfBirth && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="xs"
                            className="text-xs h-7 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                            onClick={() => {
                              setDateOfBirth(undefined);
                              setIsDatePickerOpen(false);
                            }}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Gender Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Gender
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs"
                        />
                      }
                    >
                      <span className="truncate">{gender}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-(--anchor-width) min-w-40 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      onPointerLeave={() => setHoveredGender(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {GENDER_OPTIONS.map((g) => (
                          <DropdownMenuItem
                            key={g}
                            onPointerEnter={() => setHoveredGender(g)}
                            onClick={() => setGender(g)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs sm:text-sm font-medium"
                          >
                            {hoveredGender === g && (
                              <motion.div
                                layoutId="criminal-edit-gender-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <span>{g}</span>
                            {gender === g && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Nationality Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Nationality
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs"
                        />
                      }
                    >
                      <span className="truncate">{nationality}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-(--anchor-width) min-w-40 max-h-60 overflow-y-auto no-scrollbar scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      onPointerLeave={() => setHoveredNationality(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {NATIONALITY_OPTIONS.map((nat) => (
                          <DropdownMenuItem
                            key={nat}
                            onPointerEnter={() => setHoveredNationality(nat)}
                            onClick={() => setNationality(nat)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs sm:text-sm font-medium"
                          >
                            {hoveredNationality === nat && (
                              <motion.div
                                layoutId="criminal-edit-nat-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <span>{nat}</span>
                            {nationality === nat && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Marital Status Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Marital Status
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs"
                        />
                      }
                    >
                      <span className="truncate">{maritalStatus}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-(--anchor-width) min-w-40 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      onPointerLeave={() => setHoveredMarital(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {MARITAL_STATUS_OPTIONS.map((ms) => (
                          <DropdownMenuItem
                            key={ms}
                            onPointerEnter={() => setHoveredMarital(ms)}
                            onClick={() => setMaritalStatus(ms)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs sm:text-sm font-medium"
                          >
                            {hoveredMarital === ms && (
                              <motion.div
                                layoutId="criminal-edit-marital-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <span>{ms}</span>
                            {maritalStatus === ms && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Primary Alias / Known As */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="known-as"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Primary Moniker / Known As
                  </Label>
                  <Input
                    id="known-as"
                    value={knownAs}
                    onChange={(e) => setKnownAs(e.target.value)}
                    placeholder="e.g. Karthik A."
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Occupation */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="occupation"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Occupation / Front
                  </Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Mechanic / Unemployed"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Father's Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="fathers-name"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Father's Name
                  </Label>
                  <Input
                    id="fathers-name"
                    value={fathersName}
                    onChange={(e) => setFathersName(e.target.value)}
                    placeholder="Father's full name"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Mother's Name */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="mothers-name"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Mother's Name
                  </Label>
                  <Input
                    id="mothers-name"
                    value={mothersName}
                    onChange={(e) => setMothersName(e.target.value)}
                    placeholder="Mother's full name"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Place of Birth / Native Town */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="place-of-birth"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Place of Birth / Native Town
                  </Label>
                  <Input
                    id="place-of-birth"
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    placeholder="e.g. Chennai, Tamil Nadu"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Driving License Number */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="driving-license"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Driving License Number
                  </Label>
                  <Input
                    id="driving-license"
                    value={drivingLicense}
                    onChange={(e) => setDrivingLicense(e.target.value)}
                    placeholder="e.g. TN-DL-4382"
                    className="h-10 text-xs sm:text-sm font-mono border-2 border-border/80 bg-background/50 focus-visible:border-ring uppercase"
                  />
                </div>

                {/* National ID / Aadhaar */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="national-id"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    National ID / Aadhaar
                  </Label>
                  <Input
                    id="national-id"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="e.g. 5489-3210-9844"
                    className="h-10 text-xs sm:text-sm font-mono border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Passport Number */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="passport-number"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Passport Number
                  </Label>
                  <Input
                    id="passport-number"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    placeholder="e.g. Z5489102"
                    className="h-10 text-xs sm:text-sm font-mono border-2 border-border/80 bg-background/50 focus-visible:border-ring uppercase"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TILE 3 (5 COLS): MUGSHOT & BIOMETRIC DATA */}
        <div className="xl:col-span-5 min-w-0 flex flex-col xl:self-stretch">
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <Camera className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Mugshot & Biometrics
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none mt-0.5">
                    Subject facial photo and biometric profile records
                  </CardDescription>
                </div>
              </div>
              <div className="shrink-0 mt-0.5">
                {newMugshotFile ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#665AEF]/15 text-[#a594fd] border border-[#665AEF]/30 whitespace-nowrap">
                    <CheckCircle2 className="size-3" /> Staged
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted/40 text-muted-foreground border border-border/60 whitespace-nowrap">
                    Active Dossier
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-3.5 sm:p-6 pt-3.5 sm:pt-5 flex-1 flex flex-col justify-between gap-4 sm:gap-5">
              {/* Photo & Upload Component Side-by-Side */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4">
                  {/* Photo Display Card */}
                  <div className="relative w-full sm:w-44 h-60 sm:h-auto sm:min-h-[220px] rounded-xl overflow-hidden border-2 border-border/80 bg-black/40 shadow-sm shrink-0 group flex items-center justify-center">
                    {/* Ambient Blurred Backdrop for seamless aspect ratio framing */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <Image
                        src={displayPhoto}
                        alt=""
                        fill
                        className="object-cover blur-2xl scale-125 opacity-35 brightness-70 transition-transform duration-300 group-hover:scale-130"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/50" />
                    </div>

                    {/* Foreground Subject Mugshot (fully uncropped on mobile, properly framed on desktop) */}
                    <div className="relative w-full h-full flex items-center justify-center z-10 py-1">
                      <Image
                        src={displayPhoto}
                        alt={fullName}
                        fill
                        className="object-contain sm:object-cover object-center transition-transform duration-300 group-hover:scale-105 drop-shadow-md"
                        unoptimized
                      />
                    </div>

                    {/* Status Chip */}
                    <div className="absolute top-2.5 left-2.5 z-20">
                      {newMugshotFile ? (
                        <span className="px-2 py-0.5 rounded-md bg-[#665AEF] text-[9px] font-bold text-white shadow-xs">
                          NEW STAGED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-xs text-[9px] font-semibold text-white/90 border border-white/10">
                          CURRENT
                        </span>
                      )}
                    </div>

                    {/* Revert / Cancel Button */}
                    {newMugshotFile && (
                      <button
                        type="button"
                        onClick={handleRevertPhoto}
                        className="absolute top-2.5 right-2.5 z-20 size-6 rounded-full bg-black/80 hover:bg-rose-500 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
                        title="Revert to original mugshot"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}

                    {/* Bottom ID label */}
                    <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/95 via-black/60 to-transparent px-3 py-2.5 pt-6">
                      <p className="text-xs font-mono font-semibold text-white truncate">
                        {criminal.criminalId}
                      </p>
                      <p className="text-[10px] text-white/75 truncate mt-0.5">
                        {newMugshotFile ? formatBytes(newMugshotFile.size) : "Original Archive"}
                      </p>
                    </div>
                  </div>

                  {/* Drag-and-Drop Media Zone using useMediaDrop */}
                  <div
                    {...getRootProps()}
                    className={cn(
                      "flex-1 min-h-[140px] sm:min-h-[210px] rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-3.5 sm:p-4 text-center select-none group relative overflow-hidden",
                      isDragActive && !isDragReject && "border-[#665AEF] bg-[#665AEF]/15 scale-[0.99] shadow-md shadow-[#665AEF]/10",
                      isDragReject && "border-rose-500 bg-rose-500/10",
                      !isDragActive && "border-border/80 bg-muted/10 hover:bg-muted/25 hover:border-[#665AEF]/60"
                    )}
                  >
                    <input {...getInputProps()} />

                    <div className="size-9 sm:size-11 rounded-full bg-[#665AEF]/12 group-hover:bg-[#665AEF]/20 text-[#665AEF] flex items-center justify-center mb-1.5 sm:mb-2.5 transition-all duration-200 group-hover:scale-110 shadow-xs">
                      <UploadCloud className="size-4.5 sm:size-5.5" />
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-foreground leading-tight">
                      {isDragActive
                        ? isDragReject
                          ? "Unsupported file format"
                          : "Drop new mugshot image..."
                        : newMugshotFile
                        ? "Drop new photo to replace"
                        : "Drop new mugshot here"}
                    </p>

                    <p className="text-[11px] sm:text-xs text-[#a594fd] group-hover:text-[#665AEF] mt-0.5 sm:mt-1 transition-colors font-medium">
                      or click to browse files
                    </p>

                    <div className="flex items-center gap-1.5 mt-2 sm:mt-3 px-2.5 py-0.5 sm:py-1 rounded-full bg-muted/40 border border-border/60 text-[10px] sm:text-[11px] text-muted-foreground">
                      <span>JPG, PNG, WEBP</span>
                      <span>•</span>
                      <span>Max 10MB</span>
                    </div>
                  </div>
                </div>

                {/* Staged File Feedback Banner */}
                {newMugshotFile && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg border-2 border-[#665AEF]/30 bg-[#665AEF]/10 text-xs">
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <CheckCircle2 className="size-4 text-[#665AEF] shrink-0" />
                      <span className="font-medium text-foreground truncate text-xs">
                        {newMugshotFile.name}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                        ({formatBytes(newMugshotFile.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRevertPhoto}
                      className="text-xs text-muted-foreground hover:text-rose-400 font-medium cursor-pointer ml-2 shrink-0 transition-colors"
                    >
                      Revert
                    </button>
                  </div>
                )}
              </div>

              {/* Biometrics Status Grid */}
              <div className="pt-3.5 sm:pt-5 border-t border-border/60 space-y-2.5 sm:space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Sparkles className="size-3.5 text-[#665AEF] shrink-0" />
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider truncate">
                      Registered Biometrics
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-mono text-emerald-400 font-medium shrink-0">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" /> ISO/IEC 19794
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
                  {/* Fingerprints */}
                  <div className="p-2.5 sm:p-3.5 rounded-xl border-2 border-border/70 bg-card/60 hover:bg-muted/30 hover:border-[#665AEF]/40 transition-all duration-200 flex flex-col justify-between gap-1 sm:gap-1.5 group">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-foreground text-xs sm:text-sm truncate">
                        Fingerprints
                      </span>
                      <span className="size-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-emerald-400 font-medium truncate leading-tight">
                      10 Digits Cataloged
                    </span>
                  </div>

                  {/* Iris Scan */}
                  <div className="p-2.5 sm:p-3.5 rounded-xl border-2 border-border/70 bg-card/60 hover:bg-muted/30 hover:border-[#665AEF]/40 transition-all duration-200 flex flex-col justify-between gap-1 sm:gap-1.5 group">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-foreground text-xs sm:text-sm truncate">
                        Iris Scan
                      </span>
                      <span className="size-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-emerald-400 font-medium truncate leading-tight">
                      Bilateral Verified
                    </span>
                  </div>

                  {/* DNA Profile */}
                  <div className="p-2.5 sm:p-3.5 rounded-xl border-2 border-border/70 bg-card/60 hover:bg-muted/30 hover:border-[#665AEF]/40 transition-all duration-200 flex flex-col justify-between gap-1 sm:gap-1.5 group">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-foreground text-xs sm:text-sm truncate">
                        DNA Profile
                      </span>
                      <span className="size-1.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-emerald-400 font-medium truncate leading-tight">
                      CODIS Profile Linked
                    </span>
                  </div>

                  {/* Vector Embedding */}
                  <div className="p-2.5 sm:p-3.5 rounded-xl border-2 border-border/70 bg-card/60 hover:bg-muted/30 hover:border-[#665AEF]/40 transition-all duration-200 flex flex-col justify-between gap-1 sm:gap-1.5 group">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-semibold text-foreground text-xs sm:text-sm truncate">
                        Vector Embedding
                      </span>
                      <span className="size-1.5 rounded-full bg-[#665AEF] shrink-0 animate-pulse" />
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-[#a594fd] font-medium truncate leading-tight">
                      512-dim Active
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TILE 4 (7 COLS): PHYSICAL CHARACTERISTICS & FORENSIC MARKS */}
        <div className="xl:col-span-7 min-w-0 flex flex-col xl:self-stretch">
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <BookOpen className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Physical Characteristics & Forensic Marks
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none mt-0.5">
                    Visual identifying characteristics, scars, tattoos, and biological traits
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 flex-1 flex flex-col space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4">
                {/* Height */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="height"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="178"
                    className="h-10 text-xs sm:text-sm font-medium border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="weight"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="70"
                    className="h-10 text-xs sm:text-sm font-medium border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Build */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Build
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs"
                        />
                      }
                    >
                      <span className="truncate">{build}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-(--anchor-width) min-w-35 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      onPointerLeave={() => setHoveredBuild(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {BUILD_OPTIONS.map((b) => (
                          <DropdownMenuItem
                            key={b}
                            onPointerEnter={() => setHoveredBuild(b)}
                            onClick={() => setBuild(b)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs sm:text-sm font-medium"
                          >
                            {hoveredBuild === b && (
                              <motion.div
                                layoutId="criminal-edit-build-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <span>{b}</span>
                            {build === b && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Eye Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Eye Color
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs"
                        />
                      }
                    >
                      <span className="truncate">{eyeColor}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-(--anchor-width) min-w-35 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      onPointerLeave={() => setHoveredEye(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {EYE_COLORS.map((eye) => (
                          <DropdownMenuItem
                            key={eye}
                            onPointerEnter={() => setHoveredEye(eye)}
                            onClick={() => setEyeColor(eye)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs sm:text-sm font-medium"
                          >
                            {hoveredEye === eye && (
                              <motion.div
                                layoutId="criminal-edit-eye-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <span>{eye}</span>
                            {eyeColor === eye && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Hair Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Hair Color
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs"
                        />
                      }
                    >
                      <span className="truncate">{hairColor}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-(--anchor-width) min-w-35 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      onPointerLeave={() => setHoveredHair(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {HAIR_COLORS.map((hair) => (
                          <DropdownMenuItem
                            key={hair}
                            onPointerEnter={() => setHoveredHair(hair)}
                            onClick={() => setHairColor(hair)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs sm:text-sm font-medium"
                          >
                            {hoveredHair === hair && (
                              <motion.div
                                layoutId="criminal-edit-hair-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <span>{hair}</span>
                            {hairColor === hair && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Complexion */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Complexion
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs"
                        />
                      }
                    >
                      <span className="truncate">{complexion}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-(--anchor-width) min-w-35 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      onPointerLeave={() => setHoveredComplexion(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {COMPLEXION_OPTIONS.map((c) => (
                          <DropdownMenuItem
                            key={c}
                            onPointerEnter={() => setHoveredComplexion(c)}
                            onClick={() => setComplexion(c)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! text-xs sm:text-sm font-medium"
                          >
                            {hoveredComplexion === c && (
                              <motion.div
                                layoutId="criminal-edit-comp-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <span>{c}</span>
                            {complexion === c && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Distinctive Marks & Tattoos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="distinctive-marks"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Distinctive Marks / Scars
                  </Label>
                  <Input
                    id="distinctive-marks"
                    value={distinctiveMarks}
                    onChange={(e) => setDistinctiveMarks(e.target.value)}
                    placeholder="e.g. Scar on left eyebrow, burn mark on wrist"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="tattoos"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    Tattoos & Markings
                  </Label>
                  <Input
                    id="tattoos"
                    value={tattoos}
                    onChange={(e) => setTattoos(e.target.value)}
                    placeholder="e.g. Dragon on right forearm"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TILE 5 (5 COLS): ALIASES & MONIKERS WITH SUGGESTED TAGS */}
        <div className="xl:col-span-5 min-w-0 flex flex-col xl:self-stretch">
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs flex-1 flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <Tag className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Aliases & Suggested Tags
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none mt-0.5">
                    Registered street monikers and intelligence aliases
                  </CardDescription>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="shrink-0 mt-0.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddingAlias(!isAddingAlias)}
                  className={cn(
                    "h-8 px-3 gap-1.5 rounded-lg border-2 text-xs font-semibold cursor-pointer transition-colors shadow-2xs overflow-hidden relative min-w-[76px]",
                    isAddingAlias
                      ? "border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 hover:border-rose-500/60"
                      : "border-border/80 bg-background/50 hover:bg-muted/60 hover:border-[#665AEF]/50 text-foreground"
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isAddingAlias ? (
                      <motion.span
                        key="cancel"
                        initial={{ opacity: 0, y: -4, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.92 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="inline-flex items-center gap-1.5"
                      >
                        <X className="size-3.5" />
                        <span>Cancel</span>
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0, y: -4, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.92 }}
                        transition={{ duration: 0.16, ease: "easeOut" }}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Plus className="size-3.5 text-[#665AEF]" />
                        <span>Add</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                {/* Current Aliases List with Layout & PopLayout Animation */}
                <div className="flex flex-wrap gap-2">
                  <AnimatePresence mode="popLayout">
                    {aliases.map((alias) => (
                      <motion.div
                        layout
                        key={alias}
                        initial={{ opacity: 0, scale: 0.8, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.75, filter: "blur(2px)" }}
                        transition={{
                          layout: { type: "spring", stiffness: 500, damping: 32 },
                          opacity: { duration: 0.18 },
                          scale: { duration: 0.18 },
                        }}
                        whileHover={{ y: -1, scale: 1.02 }}
                        className="group inline-flex items-center gap-1.5 rounded-lg border-2 border-border/80 bg-card/60 hover:bg-muted/40 hover:border-[#665AEF]/40 px-2.5 py-1 text-xs font-medium text-foreground transition-colors shadow-2xs select-none"
                      >
                        <span className="truncate">{alias}</span>
                        <motion.button
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.85 }}
                          type="button"
                          onClick={() => handleRemoveAlias(alias)}
                          className="text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 p-0.5 rounded transition-colors cursor-pointer"
                          title={`Remove ${alias}`}
                        >
                          <X className="size-3" />
                        </motion.button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Inline Add Input with Smooth Slide & Expand Animation */}
                <AnimatePresence>
                  {isAddingAlias && (
                    <motion.div
                      key="add-alias-input"
                      initial={{ opacity: 0, height: 0, y: -6 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -6 }}
                      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-2 pt-3 pb-0.5">
                        <Input
                          placeholder="New alias name..."
                          value={newAlias}
                          onChange={(e) => setNewAlias(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddAlias();
                            } else if (e.key === "Escape") {
                              setIsAddingAlias(false);
                              setNewAlias("");
                            }
                          }}
                          className="h-9 text-xs sm:text-sm rounded-lg border-2 border-border/80 bg-background/50 focus-visible:border-ring placeholder:text-muted-foreground/60 transition-colors"
                          autoFocus
                        />
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="shrink-0">
                          <Button
                            type="button"
                            onClick={() => handleAddAlias()}
                            className="h-9 px-3.5 gap-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white cursor-pointer shadow-sm shadow-[#665AEF]/25 shrink-0 transition-colors flex items-center"
                          >
                            <Check className="size-3.5" />
                            <span>Save</span>
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.96 }} className="shrink-0">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setIsAddingAlias(false);
                              setNewAlias("");
                            }}
                            className="h-9 px-2.5 text-xs font-medium rounded-lg border-2 border-border/80 bg-background/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer transition-colors shadow-2xs shrink-0"
                          >
                            Cancel
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Suggested Aliases Section with PopLayout and Smooth Chip Spring */}
              <AnimatePresence>
                {suggestedAliases.length > 0 && (
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="pt-3 border-t border-border/50 space-y-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="size-3 text-[#665AEF] shrink-0" />
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Suggested Aliases
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <AnimatePresence mode="popLayout">
                        {suggestedAliases.slice(0, 8).map((sug) => (
                          <motion.button
                            layout
                            key={sug}
                            type="button"
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.75, filter: "blur(2px)" }}
                            whileHover={{ scale: 1.04, y: -1 }}
                            whileTap={{ scale: 0.94 }}
                            transition={{
                              layout: { type: "spring", stiffness: 500, damping: 32 },
                              duration: 0.18,
                              ease: "easeOut",
                            }}
                            onClick={() => handleAddAlias(sug)}
                            className="group inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border-2 border-border/80 bg-card/60 hover:bg-[#665AEF]/10 hover:border-[#665AEF]/50 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0 font-medium select-none shadow-2xs"
                            title={`Click to add ${sug}`}
                          >
                            <Plus className="size-3 text-[#665AEF] group-hover:rotate-90 transition-transform duration-200" />
                            <span className="whitespace-nowrap">{sug}</span>
                          </motion.button>
                        ))}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

        {/* TILE 6 (12 COLS): LOCATION, MODUS OPERANDI & NARRATIVE */}
        <div className="xl:col-span-12 min-w-0">
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-start justify-between gap-3 p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-start gap-2.5 min-w-0 flex-1">
                <FileText className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Locations, Modus Operandi & Case Narrative
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none mt-0.5">
                    Residential addresses, criminal methodology, and comprehensive intelligence summary
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Last Known Location */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="last-location"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <MapPin className="size-3 text-[#665AEF] shrink-0" />
                    <span>Last Known Location / City</span>
                  </Label>
                  <Input
                    id="last-location"
                    value={lastKnownLocation}
                    onChange={(e) => setLastKnownLocation(e.target.value)}
                    placeholder="e.g. T. Nagar, Chennai, Tamil Nadu"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Known Addresses */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="address"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Compass className="size-3 text-[#665AEF] shrink-0" />
                    <span>Known Residential Addresses</span>
                  </Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 14B North Boag Road, T. Nagar"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Known Associates */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="known-associates"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <User className="size-3 text-[#665AEF] shrink-0" />
                    <span>Known Associates & Gang Affiliation</span>
                  </Label>
                  <Input
                    id="known-associates"
                    value={knownAssociates}
                    onChange={(e) => setKnownAssociates(e.target.value)}
                    placeholder="e.g. Muthu (Bail guarantor), Selvam (Lookout)"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Modus Operandi */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="modus-operandi"
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Activity className="size-3 text-[#665AEF] shrink-0" />
                    <span>Modus Operandi (MO Pattern)</span>
                  </Label>
                  <Input
                    id="modus-operandi"
                    value={modusOperandi}
                    onChange={(e) => setModusOperandi(e.target.value)}
                    placeholder="e.g. Operates after dusk; targets jewelry shops with two-wheelers"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>
              </div>

              {/* Comprehensive Description / Narrative */}
              <div className="space-y-1.5 pt-1">
                <Label
                  htmlFor="description"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"
                >
                  <FileText className="size-3 text-[#665AEF] shrink-0" />
                  <span>Forensic Summary & Investigation Notes</span> <span className="text-rose-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  placeholder="Provide comprehensive details on crimes committed, forensic history, modus operandi, officer safety warnings, and surveillance directives..."
                  className="text-xs sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring leading-relaxed"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          BOTTOM ACTION BAR (SAVE, RESET, CANCEL)
          ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 border-border/80 bg-card/40 backdrop-blur-xs shadow-xs">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">
            Verify criminal intelligence records and biometric parameters before committing changes.
          </span>
          <span className="sm:hidden text-[11px] leading-tight">
            Verify all fields before saving changes.
          </span>
        </div>

        <div className="grid grid-cols-3 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={isSaving}
            className="h-9 gap-1.5 rounded-lg border-2 border-border/80 bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 cursor-pointer shadow-2xs justify-center"
          >
            <RotateCcw className="size-3.5 text-muted-foreground shrink-0" />
            <span>Reset</span>
          </Button>

          <Link
            href={`/dashboard/criminals/${criminal.criminalId}`}
            className="inline-flex items-center justify-center h-9 px-3 rounded-lg border-2 border-border/80 bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 text-foreground cursor-pointer shadow-2xs transition-colors"
          >
            Cancel
          </Link>

          <Button
            type="submit"
            size="sm"
            disabled={isSaving}
            className="h-9 gap-1.5 sm:gap-2 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs sm:text-sm font-medium shadow-sm shadow-[#665AEF]/25 px-3 sm:px-4 cursor-pointer justify-center"
          >
            {isSaving ? (
              <>
                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span className="truncate">Saving...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5 shrink-0" />
                <span className="truncate">
                  <span className="sm:hidden">Save</span>
                  <span className="hidden sm:inline">Save Changes</span>
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
