"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  User,
  Tag,
  Shield,
  Fingerprint,
  FileText,
  UploadCloud,
  X,
  Plus,
  RotateCcw,
  Save,
  Calendar as CalendarIcon,
  ChevronDown,
  Lock,
  ArrowLeft,
  Dna,
  Smile,
  AlertCircle,
  Loader2,
  Check,
  Sparkles,
  Image as ImageIcon,
  Zap,
} from "lucide-react";

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
import { createCriminal } from "@/features/criminals/actions";
import { CriminalStatus } from "@prisma/client";

// Form Constants
const CRIME_CATEGORIES = [
  "Theft",
  "Assault",
  "Fraud",
  "Cyber Crime",
  "Drug Offense",
  "Violence",
  "Arson",
  "Robbery",
  "Burglary",
  "Extortion",
  "Smuggling",
  "Forgery",
  "Kidnapping",
  "Homicide",
];

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

const RISK_LEVELS = ["High", "Medium", "Low"];

const STATUS_OPTIONS: { label: string; value: CriminalStatus; color: string }[] = [
  { label: "Active", value: CriminalStatus.ACTIVE, color: "bg-emerald-400" },
  { label: "Wanted", value: CriminalStatus.WANTED, color: "bg-rose-400" },
  { label: "In Custody", value: CriminalStatus.ARCHIVED, color: "bg-blue-400" },
  { label: "Under Surveillance", value: CriminalStatus.ACTIVE, color: "bg-amber-400" },
  { label: "Inactive", value: CriminalStatus.INACTIVE, color: "bg-muted-foreground" },
];

const EYE_COLORS = ["Brown", "Black", "Hazel", "Blue", "Green", "Gray"];
const HAIR_COLORS = ["Black", "Dark Brown", "Light Brown", "Gray", "Bald", "White"];
const BUILD_OPTIONS = ["Athletic", "Medium", "Heavy", "Slim", "Muscular"];

const DEFAULT_SUGGESTED_ALIASES = [
  "Karthik A.",
  "Black Karthik",
  "AK",
  "Shadow",
  "Phantom",
  "Ghost",
  "Viper",
];

interface CriminalNewFormProps {
  suggestedCriminalId?: string;
}

export function CriminalNewForm({
  suggestedCriminalId = "CR-2026-105",
}: CriminalNewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  // 1. Personal Information State
  const [fullName, setFullName] = React.useState("");
  const [dateOfBirth, setDateOfBirth] = React.useState<Date | undefined>(undefined);
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [gender, setGender] = React.useState("");
  const [nationality, setNationality] = React.useState("Indian");
  const [knownAs, setKnownAs] = React.useState("");
  const [fathersName, setFathersName] = React.useState("");
  const [mothersName, setMothersName] = React.useState("");

  // 2. Identifiers State
  const [criminalId, setCriminalId] = React.useState(suggestedCriminalId);
  const [nationalId, setNationalId] = React.useState("");
  const [passportNumber, setPassportNumber] = React.useState("");
  const [otherId, setOtherId] = React.useState("");

  // 3. Crime Information State
  const [primaryCategory, setPrimaryCategory] = React.useState("");
  const [secondaryCategory, setSecondaryCategory] = React.useState("");
  const [riskLevel, setRiskLevel] = React.useState("High");
  const [status, setStatus] = React.useState<string>("Active");
  const [description, setDescription] = React.useState("");

  // 4. Physical Description State
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [eyeColor, setEyeColor] = React.useState("");
  const [hairColor, setHairColor] = React.useState("");
  const [build, setBuild] = React.useState("");
  const [distinctiveMarks, setDistinctiveMarks] = React.useState("");

  // 5. Additional Details State
  const [knownAddresses, setKnownAddresses] = React.useState("");
  const [knownAssociates, setKnownAssociates] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Sidebar States: Profile Photo
  const [mugshotUrl, setMugshotUrl] = React.useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sidebar States: Aliases List
  const [aliases, setAliases] = React.useState<string[]>([
    "Karthik A.",
    "Black Karthik",
    "AK",
  ]);
  const [newAlias, setNewAlias] = React.useState("");
  const [showAliasSuggestions, setShowAliasSuggestions] = React.useState(false);
  const aliasInputWrapperRef = React.useRef<HTMLDivElement>(null);

  // Close suggestions dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        aliasInputWrapperRef.current &&
        !aliasInputWrapperRef.current.contains(event.target as Node)
      ) {
        setShowAliasSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic & Default Suggested Aliases
  const suggestedAliases = React.useMemo(() => {
    const list: string[] = [];

    if (knownAs.trim()) {
      list.push(knownAs.trim());
    }

    if (fullName.trim()) {
      const parts = fullName.trim().split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        list.push(`${parts[0]} ${parts[parts.length - 1][0]}.`);
        list.push(parts.map((p) => p[0].toUpperCase()).join(""));
        list.push(parts[0]);
      } else if (parts.length === 1 && parts[0].length > 2) {
        list.push(parts[0]);
      }
    }

    return Array.from(new Set([...list, ...DEFAULT_SUGGESTED_ALIASES]));
  }, [fullName, knownAs]);

  // Filtered suggestions for autocomplete dropdown
  const matchingSuggestions = React.useMemo(() => {
    if (!newAlias.trim()) {
      return suggestedAliases.filter((s) => !aliases.includes(s));
    }
    return suggestedAliases.filter(
      (s) =>
        !aliases.some((a) => a.toLowerCase() === s.toLowerCase()) &&
        s.toLowerCase().includes(newAlias.trim().toLowerCase())
    );
  }, [suggestedAliases, aliases, newAlias]);

  // Sidebar States: Biometrics
  const [activeBiometricTab, setActiveBiometricTab] = React.useState<"fingerprint" | "dna" | "face">("fingerprint");
  const [biometricFileName, setBiometricFileName] = React.useState<string | null>(null);
  const biometricInputRef = React.useRef<HTMLInputElement>(null);

  // Validation Errors
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Add Alias Handler
  const handleAddAlias = (aliasToAdd?: string) => {
    const clean = (aliasToAdd || newAlias).trim();
    if (!clean) return;
    if (aliases.some((a) => a.toLowerCase() === clean.toLowerCase())) {
      toast.info(`Alias "${clean}" already added`);
      setNewAlias("");
      setShowAliasSuggestions(false);
      return;
    }
    setAliases((prev) => [...prev, clean]);
    setNewAlias("");
    setShowAliasSuggestions(false);
    toast.success(`Alias "${clean}" added`);
  };

  const handleRemoveAlias = (aliasToRemove: string) => {
    setAliases((prev) => prev.filter((a) => a !== aliasToRemove));
  };

  // Image Upload Handler
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size exceeds 5 MB limit");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoPreview(dataUrl);
      setMugshotUrl(dataUrl);
      toast.success("Photo selected");
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setMugshotUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Biometric file handler
  const handleBiometricSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Biometric file exceeds 10 MB limit");
      return;
    }
    setBiometricFileName(file.name);
    toast.success(`${activeBiometricTab.toUpperCase()} biometric record attached`);
  };

  // Form Reset Handler
  const handleReset = () => {
    setFullName("");
    setDateOfBirth(undefined);
    setGender("");
    setNationality("Indian");
    setKnownAs("");
    setFathersName("");
    setMothersName("");
    setCriminalId(suggestedCriminalId);
    setNationalId("");
    setPassportNumber("");
    setOtherId("");
    setPrimaryCategory("");
    setSecondaryCategory("");
    setRiskLevel("High");
    setStatus("Active");
    setDescription("");
    setHeight("");
    setWeight("");
    setEyeColor("");
    setHairColor("");
    setBuild("");
    setDistinctiveMarks("");
    setKnownAddresses("");
    setKnownAssociates("");
    setNotes("");
    setPhotoPreview(null);
    setMugshotUrl(null);
    setAliases(["Karthik A.", "Black Karthik", "AK"]);
    setBiometricFileName(null);
    setErrors({});
    toast.info("Form reset to initial values");
  };

  // Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    if (!primaryCategory) {
      newErrors.primaryCategory = "Primary crime category is required";
    }
    if (!description.trim()) {
      newErrors.description = "Brief description is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("Please fill in all mandatory fields indicated in red.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      // Split full name into first and last name
      const nameParts = fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || fullName.trim();
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Unknown";

      // Map status string to Prisma CriminalStatus enum
      let prismaStatus: CriminalStatus = CriminalStatus.ACTIVE;
      if (status === "Wanted") prismaStatus = CriminalStatus.WANTED;
      else if (status === "Inactive") prismaStatus = CriminalStatus.INACTIVE;
      else if (status === "In Custody") prismaStatus = CriminalStatus.ARCHIVED;

      const payload = {
        criminalId: criminalId.trim() || undefined,
        firstName,
        lastName,
        alias: knownAs || aliases[0] || undefined,
        dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : undefined,
        gender: gender || undefined,
        nationality: nationality || undefined,
        address: knownAddresses || undefined,
        description: description.trim(),
        status: prismaStatus,
        lastKnownLocation: knownAddresses || "Chennai, Tamil Nadu",
        mugshotUrl: mugshotUrl || undefined,
        demographics: {
          fullName,
          knownAs,
          fathersName,
          mothersName,
          nationalId,
          passportNumber,
          otherId,
          primaryCategory,
          secondaryCategory,
          riskLevel,
          height: height ? `${height} cm` : undefined,
          weight: weight ? `${weight} kg` : undefined,
          eyeColor,
          hairColor,
          build,
          distinctiveMarks,
          knownAssociates,
          notes,
          aliases,
          biometricFileName,
          biometricType: biometricFileName ? activeBiometricTab : undefined,
        },
      };

      const result = await createCriminal(payload);

      if (result.error) {
        toast.error(result.error);
        setIsSubmitting(false);
        return;
      }

      toast.success("Criminal record successfully created!");
      router.push("/dashboard/criminals");
      router.refresh();
    } catch (err) {
      console.error("Failed to submit criminal record:", err);
      toast.error("An unexpected error occurred while saving the record.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
      {/* Top Header Row matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <Link
            href="/dashboard/criminals"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>Back to Criminal Database</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
            Add Criminal Record
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Enter the details of the individual to add a new record to the criminal database.
          </p>
        </div>

        {/* Encrypted storage security badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border-2 border-border/80 bg-card/60 backdrop-blur-xs text-xs text-muted-foreground self-start sm:self-center shadow-xs">
          <Lock className="size-3.5 text-[#665AEF]" />
          <span>All information is encrypted and stored securely.</span>
        </div>
      </div>

      {/* Main 2-Column Responsive Form Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_400px] gap-6 items-start w-full">
        {/* Left Column: 5 Main Section Cards */}
        <div className="space-y-6 min-w-0 w-full">
          {/* Card 1: Personal Information */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-5 border-b-2 border-border/60">
              <User className="size-5 text-[#665AEF] shrink-0" />
              <div>
                <CardTitle className="text-base font-bold font-heading text-foreground">
                  Personal Information
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Basic identity details of the individual.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Row 1: Full Name, DOB, Gender, Nationality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="full-name" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <span>Full Name</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (errors.fullName) setErrors({ ...errors, fullName: "" });
                    }}
                    placeholder="Enter full name"
                    className={cn(
                      "h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]",
                      errors.fullName && "border-rose-500/80 focus-visible:border-rose-500"
                    )}
                  />
                  {errors.fullName && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="size-3 shrink-0" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <span>Date of Birth</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                    <PopoverTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center"
                        />
                      }
                    >
                      <span className="truncate flex items-center gap-2 text-foreground/90">
                        <CalendarIcon className="size-3.5 text-muted-foreground/70 shrink-0" />
                        {dateOfBirth ? format(dateOfBirth, "MMM d, yyyy") : "Select date of birth"}
                      </span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
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
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <span>Gender</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center"
                        />
                      }
                    >
                      <span>{gender || "Select gender"}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-48 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      onPointerLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      >
                        {GENDER_OPTIONS.map((g) => (
                          <DropdownMenuItem
                            key={g}
                            onClick={() => setGender(g)}
                            onPointerEnter={() => setHoveredItem(`gender-${g}`)}
                            className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-medium hover:!bg-transparent focus:!bg-transparent transition-colors"
                          >
                            {hoveredItem === `gender-${g}` && (
                              <motion.div
                                layoutId="gender-dropdown-hover"
                                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            {g}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Nationality */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <span>Nationality</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center"
                        />
                      }
                    >
                      <span>{nationality || "Select nationality"}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-48 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      onPointerLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      >
                        {NATIONALITY_OPTIONS.map((n) => (
                          <DropdownMenuItem
                            key={n}
                            onClick={() => setNationality(n)}
                            onPointerEnter={() => setHoveredItem(`nationality-${n}`)}
                            className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-medium hover:!bg-transparent focus:!bg-transparent transition-colors"
                          >
                            {hoveredItem === `nationality-${n}` && (
                              <motion.div
                                layoutId="nationality-dropdown-hover"
                                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            {n}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Row 2: Known As, Father's Name, Mother's Name */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                <div className="space-y-1.5">
                  <Label htmlFor="known-as" className="text-xs font-semibold text-muted-foreground">
                    Known As / Nickname(s)
                  </Label>
                  <Input
                    id="known-as"
                    value={knownAs}
                    onChange={(e) => setKnownAs(e.target.value)}
                    placeholder="Enter nickname(s) if any"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="fathers-name" className="text-xs font-semibold text-muted-foreground">
                    Father&apos;s Name
                  </Label>
                  <Input
                    id="fathers-name"
                    value={fathersName}
                    onChange={(e) => setFathersName(e.target.value)}
                    placeholder="Enter father's name"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="mothers-name" className="text-xs font-semibold text-muted-foreground">
                    Mother&apos;s Name
                  </Label>
                  <Input
                    id="mothers-name"
                    value={mothersName}
                    onChange={(e) => setMothersName(e.target.value)}
                    placeholder="Enter mother's name"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Identifiers */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-5 border-b-2 border-border/60">
              <Tag className="size-5 text-[#665AEF] shrink-0" />
              <div>
                <CardTitle className="text-base font-bold font-heading text-foreground">
                  Identifiers
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Unique identification numbers and references.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Criminal ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="criminal-id" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <span>Criminal ID</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="criminal-id"
                    value={criminalId}
                    onChange={(e) => setCriminalId(e.target.value)}
                    placeholder="CR-2026-XXX"
                    className="h-10 text-xs sm:text-sm font-mono border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <span className="text-[#a594fd]">ⓘ</span> Format: CR-YYYY-XXX
                  </p>
                </div>

                {/* National ID / Aadhaar */}
                <div className="space-y-1.5">
                  <Label htmlFor="national-id" className="text-xs font-semibold text-muted-foreground">
                    National ID / Aadhaar
                  </Label>
                  <Input
                    id="national-id"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    placeholder="Enter national ID (if available)"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>

                {/* Passport Number */}
                <div className="space-y-1.5">
                  <Label htmlFor="passport-number" className="text-xs font-semibold text-muted-foreground">
                    Passport Number
                  </Label>
                  <Input
                    id="passport-number"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                    placeholder="Enter passport number (if available)"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>

                {/* Other ID */}
                <div className="space-y-1.5">
                  <Label htmlFor="other-id" className="text-xs font-semibold text-muted-foreground">
                    Other ID
                  </Label>
                  <Input
                    id="other-id"
                    value={otherId}
                    onChange={(e) => setOtherId(e.target.value)}
                    placeholder="Enter other ID (e.g., license, voter ID)"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Crime Information */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-5 border-b-2 border-border/60">
              <Shield className="size-5 text-[#665AEF] shrink-0" />
              <div>
                <CardTitle className="text-base font-bold font-heading text-foreground">
                  Crime Information
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Primary criminal details and classification.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Row 1: Primary Category, Secondary Category, Risk Level, Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Primary Crime Category */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <span>Primary Crime Category</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center",
                            errors.primaryCategory && "border-rose-500/80"
                          )}
                        />
                      }
                    >
                      <span className="truncate">{primaryCategory || "Select crime category"}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-52 max-h-60 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      onPointerLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      >
                        {CRIME_CATEGORIES.map((cat) => (
                          <DropdownMenuItem
                            key={cat}
                            onClick={() => {
                              setPrimaryCategory(cat);
                              if (errors.primaryCategory) setErrors({ ...errors, primaryCategory: "" });
                            }}
                            onPointerEnter={() => setHoveredItem(`p-cat-${cat}`)}
                            className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-medium hover:!bg-transparent focus:!bg-transparent transition-colors"
                          >
                            {hoveredItem === `p-cat-${cat}` && (
                              <motion.div
                                layoutId="pcat-dropdown-hover"
                                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            {cat}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {errors.primaryCategory && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-0.5">
                      <AlertCircle className="size-3 shrink-0" />
                      {errors.primaryCategory}
                    </p>
                  )}
                </div>

                {/* Secondary Category */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Secondary Category
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center"
                        />
                      }
                    >
                      <span className="truncate">{secondaryCategory || "Select secondary category"}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-52 max-h-60 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      onPointerLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      >
                        <DropdownMenuItem
                          onClick={() => setSecondaryCategory("")}
                          onPointerEnter={() => setHoveredItem("s-cat-none")}
                          className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:!bg-transparent focus:!bg-transparent transition-colors"
                        >
                          {hoveredItem === "s-cat-none" && (
                            <motion.div
                              layoutId="scat-dropdown-hover"
                              className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                            />
                          )}
                          None
                        </DropdownMenuItem>
                        {CRIME_CATEGORIES.map((cat) => (
                          <DropdownMenuItem
                            key={cat}
                            onClick={() => setSecondaryCategory(cat)}
                            onPointerEnter={() => setHoveredItem(`s-cat-${cat}`)}
                            className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-medium hover:!bg-transparent focus:!bg-transparent transition-colors"
                          >
                            {hoveredItem === `s-cat-${cat}` && (
                              <motion.div
                                layoutId="scat-dropdown-hover"
                                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            {cat}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Risk Level */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <span>Risk Level</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center"
                        />
                      }
                    >
                      <span>{riskLevel || "Select risk level"}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-44 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      onPointerLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      >
                        {RISK_LEVELS.map((level) => (
                          <DropdownMenuItem
                            key={level}
                            onClick={() => setRiskLevel(level)}
                            onPointerEnter={() => setHoveredItem(`risk-${level}`)}
                            className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-medium hover:!bg-transparent focus:!bg-transparent transition-colors"
                          >
                            {hoveredItem === `risk-${level}` && (
                              <motion.div
                                layoutId="risk-dropdown-hover"
                                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            {level}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                    <span>Status</span>
                    <span className="text-rose-500">*</span>
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center"
                        />
                      }
                    >
                      <span className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-emerald-400" />
                        <span>{status}</span>
                      </span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-48 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      onPointerLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <DropdownMenuItem
                            key={opt.label}
                            onClick={() => setStatus(opt.label)}
                            onPointerEnter={() => setHoveredItem(`status-${opt.label}`)}
                            className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-medium hover:!bg-transparent focus:!bg-transparent flex items-center gap-2 transition-colors"
                          >
                            {hoveredItem === `status-${opt.label}` && (
                              <motion.div
                                layoutId="status-dropdown-hover"
                                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            <span className={cn("size-2 rounded-full", opt.color)} />
                            <span>{opt.label}</span>
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Row 2: Brief Description */}
              <div className="space-y-1.5 pt-1">
                <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <span>Brief Description</span>
                  <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Textarea
                    id="description"
                    value={description}
                    maxLength={1000}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (errors.description) setErrors({ ...errors, description: "" });
                    }}
                    placeholder="Enter a brief description of the individual and their criminal background..."
                    className={cn(
                      "min-h-24 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg p-3 leading-relaxed focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] resize-none pb-7",
                      errors.description && "border-rose-500/80 focus-visible:border-rose-500"
                    )}
                  />
                  <span className="absolute bottom-2 right-2.5 text-[10px] text-muted-foreground/70 font-mono tabular-nums">
                    {description.length}/1000
                  </span>
                </div>
                {errors.description && (
                  <p className="text-[11px] text-rose-400 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="size-3 shrink-0" />
                    {errors.description}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Physical Description */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-5 border-b-2 border-border/60">
              <Fingerprint className="size-5 text-[#665AEF] shrink-0" />
              <div>
                <CardTitle className="text-base font-bold font-heading text-foreground">
                  Physical Description
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Physical appearance details for identification.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {/* Height */}
                <div className="space-y-1.5">
                  <Label htmlFor="height" className="text-xs font-semibold text-muted-foreground">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Enter height"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>

                {/* Weight */}
                <div className="space-y-1.5">
                  <Label htmlFor="weight" className="text-xs font-semibold text-muted-foreground">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Enter weight"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>

                {/* Eye Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Eye Color
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-2.5 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center"
                        />
                      }
                    >
                      <span className="truncate">{eyeColor || "Select eye color"}</span>
                      <ChevronDown className="size-3 text-muted-foreground opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-38 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      onPointerLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      >
                        <DropdownMenuItem
                          onClick={() => setEyeColor("")}
                          onPointerEnter={() => setHoveredItem("eye-none")}
                          className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:!bg-transparent focus:!bg-transparent transition-colors"
                        >
                          {hoveredItem === "eye-none" && (
                            <motion.div
                              layoutId="eye-dropdown-hover"
                              className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                            />
                          )}
                          None
                        </DropdownMenuItem>
                        {EYE_COLORS.map((col) => (
                          <DropdownMenuItem
                            key={col}
                            onClick={() => setEyeColor(col)}
                            onPointerEnter={() => setHoveredItem(`eye-${col}`)}
                            className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-medium hover:!bg-transparent focus:!bg-transparent transition-colors"
                          >
                            {hoveredItem === `eye-${col}` && (
                              <motion.div
                                layoutId="eye-dropdown-hover"
                                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            {col}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Hair Color */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Hair Color
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-2.5 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center"
                        />
                      }
                    >
                      <span className="truncate">{hairColor || "Select hair color"}</span>
                      <ChevronDown className="size-3 text-muted-foreground opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-38 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      onPointerLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      >
                        <DropdownMenuItem
                          onClick={() => setHairColor("")}
                          onPointerEnter={() => setHoveredItem("hair-none")}
                          className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:!bg-transparent focus:!bg-transparent transition-colors"
                        >
                          {hoveredItem === "hair-none" && (
                            <motion.div
                              layoutId="hair-dropdown-hover"
                              className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                            />
                          )}
                          None
                        </DropdownMenuItem>
                        {HAIR_COLORS.map((hc) => (
                          <DropdownMenuItem
                            key={hc}
                            onClick={() => setHairColor(hc)}
                            onPointerEnter={() => setHoveredItem(`hair-${hc}`)}
                            className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-medium hover:!bg-transparent focus:!bg-transparent transition-colors"
                          >
                            {hoveredItem === `hair-${hc}` && (
                              <motion.div
                                layoutId="hair-dropdown-hover"
                                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            {hc}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Build */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Build
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-2.5 text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center"
                        />
                      }
                    >
                      <span className="truncate">{build || "Select build"}</span>
                      <ChevronDown className="size-3 text-muted-foreground opacity-70 shrink-0" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-38 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      onPointerLeave={() => setHoveredItem(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="flex flex-col max-h-[300px] overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                      >
                        <DropdownMenuItem
                          onClick={() => setBuild("")}
                          onPointerEnter={() => setHoveredItem("build-none")}
                          className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs text-muted-foreground hover:!bg-transparent focus:!bg-transparent transition-colors"
                        >
                          {hoveredItem === "build-none" && (
                            <motion.div
                              layoutId="build-dropdown-hover"
                              className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                            />
                          )}
                          None
                        </DropdownMenuItem>
                        {BUILD_OPTIONS.map((b) => (
                          <DropdownMenuItem
                            key={b}
                            onClick={() => setBuild(b)}
                            onPointerEnter={() => setHoveredItem(`build-${b}`)}
                            className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-medium hover:!bg-transparent focus:!bg-transparent transition-colors"
                          >
                            {hoveredItem === `build-${b}` && (
                              <motion.div
                                layoutId="build-dropdown-hover"
                                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                              />
                            )}
                            {b}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Distinctive Marks */}
                <div className="space-y-1.5">
                  <Label htmlFor="distinctive-marks" className="text-xs font-semibold text-muted-foreground">
                    Distinctive Marks
                  </Label>
                  <Input
                    id="distinctive-marks"
                    value={distinctiveMarks}
                    onChange={(e) => setDistinctiveMarks(e.target.value)}
                    placeholder="e.g., scars, tattoos, birthmarks"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 5: Additional Details */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-5 border-b-2 border-border/60">
              <FileText className="size-5 text-[#665AEF] shrink-0" />
              <div>
                <CardTitle className="text-base font-bold font-heading text-foreground">
                  Additional Details
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Extra information for reference.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Known Addresses */}
                <div className="space-y-1.5">
                  <Label htmlFor="known-addresses" className="text-xs font-semibold text-muted-foreground">
                    Known Addresses
                  </Label>
                  <Input
                    id="known-addresses"
                    value={knownAddresses}
                    onChange={(e) => setKnownAddresses(e.target.value)}
                    placeholder="Enter known addresses (comma separated)"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>

                {/* Known Associates */}
                <div className="space-y-1.5">
                  <Label htmlFor="known-associates" className="text-xs font-semibold text-muted-foreground">
                    Known Associates
                  </Label>
                  <Input
                    id="known-associates"
                    value={knownAssociates}
                    onChange={(e) => setKnownAssociates(e.target.value)}
                    placeholder="Enter known associates (comma separated)"
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>

                {/* Notes */}
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs font-semibold text-muted-foreground">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes..."
                    className="h-10 text-xs sm:text-sm border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: 4 Sidebar Action & Media Cards */}
        <div className="space-y-6 w-full xl:w-[380px] 2xl:w-[400px] shrink-0 xl:sticky xl:top-6">
          {/* Card 1: Profile Photo */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-5 border-b-2 border-border/60">
              <ImageIcon className="size-5 text-[#665AEF] shrink-0" />
              <div>
                <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                  Profile Photo
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Upload a clear frontal photo of the individual.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
                id="photo-upload-input"
              />

              {photoPreview ? (
                <div className="relative aspect-[3/4] w-full max-w-[200px] mx-auto rounded-lg overflow-hidden border-2 border-border/80 bg-black/60 shadow-inner group">
                  <Image
                    src={photoPreview}
                    alt="Uploaded criminal mugshot"
                    fill
                    className="object-cover"
                    sizes="220px"
                  />
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="absolute top-2 right-2 size-7 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center transition-opacity cursor-pointer shadow-md"
                    title="Remove photo"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="photo-upload-input"
                  className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-border/80 bg-background/30 hover:bg-muted/30 hover:border-[#665AEF]/60 transition-all cursor-pointer text-center group"
                >
                  <div className="size-11 rounded-full bg-muted/60 group-hover:bg-[#665AEF]/15 border-2 border-border/60 group-hover:border-[#665AEF]/40 flex items-center justify-center text-muted-foreground group-hover:text-[#a594fd] transition-colors">
                    <UploadCloud className="size-5" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">
                      Drag and drop an image here or click to browse
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Supports JPG, PNG, WEBP. Max size 5 MB.
                    </p>
                  </div>
                </label>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Aliases */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-visible">
            <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-5 border-b-2 border-border/60">
              <User className="size-5 text-[#665AEF] shrink-0" />
              <div>
                <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                  Aliases
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Add known aliases or alternative names.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Input + Add Button with Autocomplete Dropdown */}
              <div ref={aliasInputWrapperRef} className="relative flex gap-2">
                <div className="relative flex-1">
                  <Input
                    value={newAlias}
                    onChange={(e) => {
                      setNewAlias(e.target.value);
                      setShowAliasSuggestions(true);
                    }}
                    onFocus={() => setShowAliasSuggestions(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAlias();
                      } else if (e.key === "Escape") {
                        setShowAliasSuggestions(false);
                      }
                    }}
                    placeholder="Enter alias name"
                    className="h-9 text-xs border-2 border-border/80 bg-background/50 rounded-lg focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
                  />

                  {/* Autocomplete Dropdown using Avatar Dropdown Animation */}
                  <AnimatePresence>
                    {showAliasSuggestions && matchingSuggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 6 }}
                        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                        className="absolute top-full left-0 right-0 mt-1.5 z-50 p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]"
                        onPointerLeave={() => setHoveredItem(null)}
                      >
                        <div className="px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between border-b border-border/40 mb-1">
                          <span className="flex items-center gap-1">
                            <Sparkles className="size-2.5 text-[#665AEF]" />
                            Suggested Matches
                          </span>
                          <span className="text-[9px] text-muted-foreground/60">Click to add</span>
                        </div>
                        <div className="flex flex-col max-h-[180px] overflow-y-auto scrollbar-width-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
                          {matchingSuggestions.map((sug) => (
                            <button
                              key={sug}
                              type="button"
                              onClick={() => handleAddAlias(sug)}
                              onPointerEnter={() => setHoveredItem(`alias-popover-${sug}`)}
                              className="relative z-0 cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-medium text-left flex items-center justify-between transition-colors text-foreground"
                            >
                              {hoveredItem === `alias-popover-${sug}` && (
                                <motion.div
                                  layoutId="alias-popover-hover"
                                  className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                                  transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                                />
                              )}
                              <span className="truncate">{sug}</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 shrink-0 pl-2">
                                <Plus className="size-3 text-[#665AEF]" /> Add
                              </span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Button
                  type="button"
                  onClick={() => handleAddAlias()}
                  size="sm"
                  className="h-9 px-3 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-medium shrink-0 cursor-pointer shadow-xs gap-1"
                >
                  <Plus className="size-3.5" />
                  <span>Add</span>
                </Button>
              </div>

              {/* Active Badges List with X removal */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Active Aliases {aliases.length > 0 && `(${aliases.length})`}
                  </Label>
                  {aliases.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setAliases([])}
                      className="text-[10px] text-muted-foreground hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5 min-h-[38px] p-2 rounded-lg border-2 border-border/80 bg-background/40 items-center">
                  <AnimatePresence initial={false}>
                    {aliases.map((alias) => (
                      <motion.span
                        key={alias}
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        transition={{ duration: 0.18 }}
                        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-normal bg-muted/40 text-foreground border-2 border-border/80 hover:bg-muted/60 transition-colors shadow-2xs"
                      >
                        <span>{alias}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAlias(alias)}
                          className="text-muted-foreground hover:text-foreground p-0.5 rounded cursor-pointer touch-manipulation active:scale-90"
                          title={`Remove ${alias}`}
                          aria-label={`Remove alias ${alias}`}
                        >
                          <X className="size-3" />
                        </button>
                      </motion.span>
                    ))}
                  </AnimatePresence>
                  {aliases.length === 0 && (
                    <p className="text-xs text-muted-foreground/60 italic">
                      No aliases added yet. Click a suggestion below to add.
                    </p>
                  )}
                </div>
              </div>

              {/* Workable Suggested Aliases Section */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="size-3 text-[#665AEF]" />
                  <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Suggested Aliases
                  </Label>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {suggestedAliases.slice(0, 7).map((sug) => {
                    const isAdded = aliases.includes(sug);
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          if (isAdded) {
                            handleRemoveAlias(sug);
                          } else {
                            handleAddAlias(sug);
                          }
                        }}
                        className={cn(
                          "inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-md border-2 transition-all touch-manipulation active:scale-95 shrink-0 cursor-pointer",
                          isAdded
                            ? "border-[#665AEF]/50 bg-[#665AEF]/15 text-[#a594fd] font-medium shadow-2xs hover:bg-[#665AEF]/25"
                            : "border-border/80 bg-card/60 text-muted-foreground hover:text-foreground hover:bg-muted/80 hover:border-neutral-600/70"
                        )}
                        title={isAdded ? `Click to remove ${sug}` : `Click to add ${sug}`}
                      >
                        {isAdded ? (
                          <Check className="size-3 text-[#665AEF]" />
                        ) : (
                          <Plus className="size-3 opacity-70" />
                        )}
                        <span className="whitespace-nowrap">{sug}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Biometric Data (Optional) */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-5 border-b-2 border-border/60">
              <Fingerprint className="size-5 text-[#665AEF] shrink-0" />
              <div>
                <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                  Biometric Data (Optional)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Add biometric data for advanced search.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-3.5">
              {/* Tabs: Fingerprint | DNA | Face */}
              <div className="relative grid grid-cols-3 gap-1 p-1 rounded-lg border-2 border-border/70 bg-black/40">
                {[
                  { id: "fingerprint" as const, label: "Fingerprint", icon: Fingerprint },
                  { id: "dna" as const, label: "DNA", icon: Dna },
                  { id: "face" as const, label: "Face", icon: Smile },
                ].map(({ id, label, icon: TabIcon }) => {
                  const isActive = activeBiometricTab === id;
                  return (
                    <motion.button
                      key={id}
                      type="button"
                      onClick={() => setActiveBiometricTab(id)}
                      whileTap={{ scale: 0.92 }}
                      className={`relative h-7.5 sm:h-8 rounded-md text-xs font-medium select-none z-10 flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                        isActive
                          ? "text-white font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="biometric_active_tab_pill"
                          className="absolute inset-0 rounded-md bg-[#665AEF] shadow-md shadow-[#665AEF]/35 border-2 border-[#8579ff]/50 -z-10"
                          transition={{
                            type: "spring",
                            stiffness: 450,
                            damping: 24,
                            mass: 0.7,
                          }}
                        />
                      )}
                      <span className="relative z-10 flex items-center justify-center gap-1.5">
                        <TabIcon className="size-3.5 shrink-0" />
                        <span>{label}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Biometric Upload Area */}
              <input
                ref={biometricInputRef}
                type="file"
                onChange={handleBiometricSelect}
                className="hidden"
                id="biometric-upload-input"
              />

              {biometricFileName ? (
                <div className="flex items-center justify-between p-3 rounded-lg border-2 border-[#665AEF]/40 bg-[#665AEF]/10 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <Check className="size-4 text-emerald-400 shrink-0" />
                    <span className="font-medium text-foreground truncate">{biometricFileName}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBiometricFileName(null)}
                    className="text-muted-foreground hover:text-foreground p-1 rounded cursor-pointer shrink-0"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="biometric-upload-input"
                  className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border-2 border-dashed border-border/80 bg-background/30 hover:bg-muted/30 hover:border-[#665AEF]/60 transition-all cursor-pointer text-center group"
                >
                  <div className="size-10 rounded-full bg-muted/60 group-hover:bg-[#665AEF]/15 border-2 border-border/60 group-hover:border-[#665AEF]/40 flex items-center justify-center text-muted-foreground group-hover:text-[#a594fd] transition-colors">
                    {activeBiometricTab === "fingerprint" && <Fingerprint className="size-4.5" />}
                    {activeBiometricTab === "dna" && <Dna className="size-4.5" />}
                    {activeBiometricTab === "face" && <Smile className="size-4.5" />}
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">
                      Upload {activeBiometricTab} file
                    </p>
                    <p className="text-[10.5px] text-muted-foreground">
                      Supports PNG, JPG, or WSQ. Max 10 MB.
                    </p>
                  </div>
                </label>
              )}
            </CardContent>
          </Card>

          {/* Card 4: Quick Actions */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-5 border-b-2 border-border/60">
              <Zap className="size-5 text-[#665AEF] shrink-0" />
              <div>
                <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Save or reset the form.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-lg border-2 border-border/80 bg-muted/30 hover:bg-muted/60 text-xs font-medium text-foreground/90 hover:text-foreground cursor-pointer gap-1.5 transition-colors"
                >
                  <RotateCcw className="size-3.5 text-muted-foreground" />
                  <span>Reset</span>
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-10 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-medium shadow-sm shadow-[#665AEF]/25 flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      <span>Save Record</span>
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
