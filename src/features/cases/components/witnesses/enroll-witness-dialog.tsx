"use client";

// Fresh Turbopack module evaluation
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AnimatedSelect,
  type AnimatedSelectOption,
} from "./animated-select";
import {
  Phone,
  Sparkles,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar as CalendarIcon,
  X,
  User,
  Shield,
  MapPin,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  createWitness,
  updateWitness,
  extractFacialDescriptorsFromStatement,
} from "../../witnesses/actions";
import type {
  WitnessItem,
  WitnessType,
  WitnessCredibility,
  WitnessAvailability,
  IdentificationType,
} from "../../witnesses/types";

interface EnrollWitnessDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  caseId: string;
  caseNumber?: string;
  witnessToEdit?: WitnessItem | null;
  onWitnessSaved: (witness: WitnessItem) => void;
}

const WITNESS_ROLE_OPTIONS: AnimatedSelectOption[] = [
  { label: "Direct Eyewitness", value: "EYEWITNESS" },
  { label: "Victim Witness", value: "VICTIM_WITNESS" },
  { label: "Earwitness (Heard Event)", value: "EARWITNESS" },
  { label: "First Responder / Officer", value: "FIRST_RESPONDER" },
  { label: "Confidential Informant", value: "INFORMANT" },
  { label: "Expert / Specialist", value: "EXPERT_WITNESS" },
];

const CREDIBILITY_OPTIONS: AnimatedSelectOption[] = [
  { label: "High Credibility (Corroborated)", value: "HIGH" },
  { label: "Medium Credibility (Plausible)", value: "MEDIUM" },
  { label: "Low Credibility (Inconsistent)", value: "LOW" },
  { label: "Unverified / Preliminary", value: "UNVERIFIED" },
];

const ID_TYPE_OPTIONS: AnimatedSelectOption[] = [
  { label: "National ID", value: "NATIONAL_ID" },
  { label: "Aadhaar Card", value: "AADHAAR" },
  { label: "Passport", value: "PASSPORT" },
  { label: "Driver's License", value: "DRIVERS_LICENSE" },
  { label: "Voter ID Card", value: "VOTER_ID" },
  { label: "Other Official ID", value: "OTHER" },
];

const AVAILABILITY_OPTIONS: AnimatedSelectOption[] = [
  { label: "Active & Contactable", value: "ACTIVE_AVAILABLE" },
  { label: "Under State Protection", value: "UNDER_PROTECTION" },
  { label: "Relocated (Reachable)", value: "RELOCATED" },
  { label: "Unreachable / Missing", value: "UNREACHABLE" },
];

const GENDER_OPTIONS: AnimatedSelectOption[] = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Non-Binary", value: "Non-Binary" },
  { label: "Other", value: "Other" },
  { label: "Unspecified", value: "Unspecified" },
];

const LIGHTING_OPTIONS: AnimatedSelectOption[] = [
  { label: "Clear Daylight", value: "Clear Daylight" },
  { label: "Overhead Streetlamp", value: "Overhead Streetlamp" },
  { label: "Dusk / Twilight", value: "Dusk / Twilight" },
  { label: "Dim Interior", value: "Dim Interior" },
  { label: "Near Darkness / Flashlight", value: "Near Darkness" },
];

export function EnrollWitnessDialog({
  isOpen,
  onOpenChange,
  caseId,
  caseNumber,
  witnessToEdit,
  onWitnessSaved,
}: EnrollWitnessDialogProps) {
  const [activeTab, setActiveTab] = useState<"contact" | "testimony">("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Tab 1: Identity, Verification & Contact
  const [name, setName] = useState("");
  const [alias, setAlias] = useState("");
  const [gender, setGender] = useState("Unspecified");
  const [ageAtIncident, setAgeAtIncident] = useState("");
  const [occupation, setOccupation] = useState("");
  const [witnessType, setWitnessType] = useState<WitnessType>("EYEWITNESS");
  const [credibility, setCredibility] = useState<WitnessCredibility>("HIGH");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [secondaryPhone, setSecondaryPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idType, setIdType] = useState<IdentificationType>("NATIONAL_ID");
  const [idNumber, setIdNumber] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [emergencyContactName, setEmergencyContactName] = useState("");
  const [emergencyRelationship, setEmergencyRelationship] = useState("");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<WitnessAvailability>("ACTIVE_AVAILABLE");

  // Tab 2: Testimony & Suspect Descriptors
  const [statement, setStatement] = useState("");
  const [keyFacialFeatures, setKeyFacialFeatures] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [isInterviewDateOpen, setIsInterviewDateOpen] = useState(false);
  const [lightingCondition, setLightingCondition] = useState("Clear Daylight");
  const [incidentDistanceMeters, setIncidentDistanceMeters] = useState("");
  const [observationDurationSec, setObservationDurationSec] = useState("");
  const [confidenceScore, setConfidenceScore] = useState("85");
  const [isExtracting, setIsExtracting] = useState(false);

  const handleExtractDescriptors = async () => {
    if (!statement.trim() || statement.trim().length < 5) {
      toast.error("Please enter or record a deposition statement first.");
      return;
    }
    setIsExtracting(true);
    try {
      const res = await extractFacialDescriptorsFromStatement(statement);
      if (res.success && res.descriptors) {
        setKeyFacialFeatures(res.descriptors);
        toast.success("AI extracted suspect descriptors from testimony.");
      } else {
        toast.error(res.error || "Could not parse descriptors.");
      }
    } catch {
      toast.error("Failed to analyze testimony.");
    } finally {
      setIsExtracting(false);
    }
  };

  // Populate on edit or reset
  useEffect(() => {
    if (witnessToEdit) {
      setName(witnessToEdit.name || "");
      setAlias(witnessToEdit.alias || "");
      setGender(witnessToEdit.gender || "Unspecified");
      setAgeAtIncident(witnessToEdit.ageAtIncident ? String(witnessToEdit.ageAtIncident) : "");
      setOccupation(witnessToEdit.occupation || "");
      setWitnessType(witnessToEdit.witnessType || "EYEWITNESS");
      setCredibility(witnessToEdit.credibility || "HIGH");
      setPrimaryPhone(witnessToEdit.primaryPhone || "");
      setSecondaryPhone(witnessToEdit.secondaryPhone || "");
      setEmail(witnessToEdit.email || "");
      setIdType(witnessToEdit.idType || "NATIONAL_ID");
      setIdNumber(witnessToEdit.idNumberMasked || "");
      setCity(witnessToEdit.city || "");
      setState(witnessToEdit.state || "");
      setCurrentAddress(witnessToEdit.currentAddress || "");
      setPermanentAddress(witnessToEdit.permanentAddress || "");
      setEmergencyContactName(witnessToEdit.emergencyContactName || "");
      setEmergencyRelationship(witnessToEdit.emergencyRelationship || "");
      setEmergencyContactPhone(witnessToEdit.emergencyContactPhone || "");
      setAvailabilityStatus(witnessToEdit.availabilityStatus || "ACTIVE_AVAILABLE");
      setStatement(witnessToEdit.statement || "");
      setKeyFacialFeatures(witnessToEdit.keyFacialFeatures || "");
      setInterviewDate(witnessToEdit.interviewDate || "");
      setLightingCondition(witnessToEdit.lightingCondition || "Clear Daylight");
      setIncidentDistanceMeters(
        witnessToEdit.incidentDistanceMeters ? String(witnessToEdit.incidentDistanceMeters) : ""
      );
      setObservationDurationSec(
        witnessToEdit.observationDurationSec ? String(witnessToEdit.observationDurationSec) : ""
      );
      setConfidenceScore(
        witnessToEdit.confidenceScore !== null && witnessToEdit.confidenceScore !== undefined
          ? String(witnessToEdit.confidenceScore)
          : "85"
      );
    } else {
      resetForm();
    }
  }, [witnessToEdit, isOpen]);

  const resetForm = () => {
    setName("");
    setAlias("");
    setGender("Unspecified");
    setAgeAtIncident("");
    setOccupation("");
    setWitnessType("EYEWITNESS");
    setCredibility("HIGH");
    setPrimaryPhone("");
    setSecondaryPhone("");
    setEmail("");
    setIdType("NATIONAL_ID");
    setIdNumber("");
    setCity("");
    setState("");
    setCurrentAddress("");
    setPermanentAddress("");
    setEmergencyContactName("");
    setEmergencyRelationship("");
    setEmergencyContactPhone("");
    setAvailabilityStatus("ACTIVE_AVAILABLE");
    setStatement("");
    setKeyFacialFeatures("");
    setInterviewDate("");
    setLightingCondition("Clear Daylight");
    setIncidentDistanceMeters("");
    setObservationDurationSec("");
    setConfidenceScore("85");
    setActiveTab("contact");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!caseId) {
      toast.error("Case reference missing. Please refresh and try again.");
      return;
    }

    if (!name.trim()) {
      toast.error("Please enter the witness name");
      setActiveTab("contact");
      return;
    }

    if (!primaryPhone.trim()) {
      toast.error("Please provide a contact phone number for future verification");
      setActiveTab("contact");
      return;
    }

    if (!statement.trim()) {
      toast.error("Please record the witness statement or testimony");
      setActiveTab("testimony");
      return;
    }

    setIsSubmitting(true);

    const parsedAge = ageAtIncident && !isNaN(parseInt(ageAtIncident, 10)) ? parseInt(ageAtIncident, 10) : null;
    const parsedDistance = incidentDistanceMeters && !isNaN(parseFloat(incidentDistanceMeters)) ? parseFloat(incidentDistanceMeters) : null;
    const parsedDuration = observationDurationSec && !isNaN(parseInt(observationDurationSec, 10)) ? parseInt(observationDurationSec, 10) : null;
    const parsedConfidence = confidenceScore && !isNaN(parseInt(confidenceScore, 10)) ? parseInt(confidenceScore, 10) : null;

    try {
      if (witnessToEdit) {
        const res = await updateWitness({
          id: witnessToEdit.id,
          name: name.trim(),
          alias: alias.trim() || null,
          gender: gender || null,
          ageAtIncident: parsedAge,
          occupation: occupation.trim() || null,
          witnessType,
          credibility,
          primaryPhone: primaryPhone.trim(),
          secondaryPhone: secondaryPhone.trim() || null,
          email: email.trim() || null,
          idType,
          idNumber: idNumber.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          currentAddress: currentAddress.trim() || null,
          permanentAddress: permanentAddress.trim() || null,
          emergencyContactName: emergencyContactName.trim() || null,
          emergencyRelationship: emergencyRelationship.trim() || null,
          emergencyContactPhone: emergencyContactPhone.trim() || null,
          availabilityStatus,
          statement: statement.trim(),
          keyFacialFeatures: keyFacialFeatures.trim() || null,
          interviewDate: interviewDate || null,
          lightingCondition: lightingCondition || null,
          incidentDistanceMeters: parsedDistance,
          observationDurationSec: parsedDuration,
          confidenceScore: parsedConfidence,
        });

        if (res.success && res.data) {
          toast.success(`Witness ${res.data.name} updated successfully`);
          onWitnessSaved?.(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error || "Failed to update witness");
        }
      } else {
        const res = await createWitness({
          caseId,
          name: name.trim(),
          alias: alias.trim() || null,
          gender: gender || null,
          ageAtIncident: parsedAge,
          occupation: occupation.trim() || null,
          witnessType,
          credibility,
          primaryPhone: primaryPhone.trim(),
          secondaryPhone: secondaryPhone.trim() || null,
          email: email.trim() || null,
          idType,
          idNumber: idNumber.trim() || null,
          city: city.trim() || null,
          state: state.trim() || null,
          currentAddress: currentAddress.trim() || null,
          permanentAddress: permanentAddress.trim() || null,
          emergencyContactName: emergencyContactName.trim() || null,
          emergencyRelationship: emergencyRelationship.trim() || null,
          emergencyContactPhone: emergencyContactPhone.trim() || null,
          availabilityStatus,
          statement: statement.trim(),
          keyFacialFeatures: keyFacialFeatures.trim() || null,
          interviewDate: interviewDate || null,
          lightingCondition: lightingCondition || null,
          incidentDistanceMeters: parsedDistance,
          observationDurationSec: parsedDuration,
          confidenceScore: parsedConfidence,
        });

        if (res.success && res.data) {
          toast.success(`Witness ${res.data.name} enrolled in case registry`);
          onWitnessSaved?.(res.data);
          onOpenChange(false);
          resetForm();
        } else {
          toast.error(res.error || "Failed to enroll witness");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "An error occurred while saving witness");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-1.25rem)] sm:w-full sm:max-w-2xl md:max-w-3xl max-h-[90vh] flex flex-col rounded-xl border border-neutral-800 bg-[#0a0a0a] p-0 shadow-2xl gap-0 text-neutral-100 overflow-hidden no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header without icon card: Clean, modern, typography-first (Page theme dark/black) */}
          <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-neutral-800 bg-[#0d0d0d]">
            <div className="flex items-center justify-between gap-2.5">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-heading font-semibold text-white tracking-tight">
                  {witnessToEdit ? "Edit Witness Record" : "Enroll Witness"}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-400 mt-0.5 truncate sm:whitespace-normal">
                  Record witness details for cold-case verification and AI sketch generation.
                </DialogDescription>
              </div>

              {caseNumber && (
                <span className="font-mono text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-md bg-[#665AEF]/15 border border-[#665AEF]/30 text-[#a89dff] shrink-0 font-medium">
                  {caseNumber}
                </span>
              )}
            </div>

            {/* Clean Segmented Tab Control: Full width on mobile, inline on desktop */}
            <div className="mt-3">
              <div className="grid grid-cols-2 p-0.5 rounded-lg bg-black/60 border border-neutral-800 gap-1 w-full sm:w-auto sm:inline-flex">
                <button
                  type="button"
                  onClick={() => setActiveTab("contact")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none",
                    activeTab === "contact"
                      ? "bg-[#665AEF] text-white shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <Phone className="size-3.5 shrink-0" />
                  <span className="truncate">Witness & Contact</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("testimony")}
                  className={cn(
                    "flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-md text-xs font-medium transition-all cursor-pointer select-none",
                    activeTab === "testimony"
                      ? "bg-[#665AEF] text-white shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                  )}
                >
                  <Sparkles className="size-3.5 shrink-0" />
                  <span className="truncate">Testimony & Sketch</span>
                </button>
              </div>
            </div>
          </div>

          {/* Body: Responsive grid with scroll containment (Page theme black/dark) */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 text-xs bg-[#0a0a0a] no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden space-y-4">
            {/* TAB 1: WITNESS & CONTACT */}
            {activeTab === "contact" && (
              <div className="space-y-4">
                {/* 1. Demographic Particulars & Identity */}
                <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5 space-y-3.5 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2.5">
                    <User className="size-3.5 text-[#665AEF]" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-200 font-heading">
                      Personal & Demographic Particulars
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 ml-auto">REGISTRY PROFILE</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">
                        Full Legal Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Ramesh Verma"
                        required
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Alias / Known As</Label>
                      <Input
                        value={alias}
                        onChange={(e) => setAlias(e.target.value)}
                        placeholder="e.g. Ramu"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Gender</Label>
                      <AnimatedSelect
                        options={GENDER_OPTIONS}
                        value={gender}
                        onChange={setGender}
                        className="h-9.5 bg-black/60 border-2 border-neutral-800 rounded-md text-neutral-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Age at Incident</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          value={ageAtIncident}
                          onChange={(e) => setAgeAtIncident(e.target.value)}
                          placeholder="e.g. 34"
                          className="h-9.5 pr-12 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 font-mono placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-neutral-400 pointer-events-none select-none">
                          years
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Occupation</Label>
                      <Input
                        value={occupation}
                        onChange={(e) => setOccupation(e.target.value)}
                        placeholder="e.g. Retail Store Manager / Engineer"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Witness Role</Label>
                      <AnimatedSelect
                        options={WITNESS_ROLE_OPTIONS}
                        value={witnessType}
                        onChange={(val) => setWitnessType(val as WitnessType)}
                        className="h-9.5 bg-black/60 border-2 border-neutral-800 rounded-md text-neutral-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Credibility Rating</Label>
                      <AnimatedSelect
                        options={CREDIBILITY_OPTIONS}
                        value={credibility}
                        onChange={(val) => setCredibility(val as WitnessCredibility)}
                        className="h-9.5 bg-black/60 border-2 border-neutral-800 rounded-md text-neutral-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Availability Status</Label>
                      <AnimatedSelect
                        options={AVAILABILITY_OPTIONS}
                        value={availabilityStatus}
                        onChange={(val) => setAvailabilityStatus(val as WitnessAvailability)}
                        className="h-9.5 bg-black/60 border-2 border-neutral-800 rounded-md text-neutral-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Govt ID Type</Label>
                      <AnimatedSelect
                        options={ID_TYPE_OPTIONS}
                        value={idType}
                        onChange={(val) => setIdType(val as IdentificationType)}
                        className="h-9.5 bg-black/60 border-2 border-neutral-800 rounded-md text-neutral-100"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Govt ID Document Number</Label>
                      <Input
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        placeholder="e.g. 5489-XXXX-1290"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 font-mono placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Cold-Case Verification & Reachability Matrix */}
                <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5 space-y-3.5 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2.5">
                    <Phone className="size-3.5 text-emerald-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-200 font-heading">
                      Contact & Reachability Matrix
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 ml-auto">VERIFICATION</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">
                        Primary Mobile <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="tel"
                        value={primaryPhone}
                        onChange={(e) => setPrimaryPhone(e.target.value)}
                        placeholder="+91 98450 12345"
                        required
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 font-mono placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Secondary / Landline</Label>
                      <Input
                        type="tel"
                        value={secondaryPhone}
                        onChange={(e) => setSecondaryPhone(e.target.value)}
                        placeholder="044-2456789 / +91 98765 43210"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 font-mono placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium text-neutral-300">Email Address</Label>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="witness@example.com"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium text-neutral-300">Current Living Address</Label>
                      <Input
                        value={currentAddress}
                        onChange={(e) => setCurrentAddress(e.target.value)}
                        placeholder="e.g. Flat 4B, Metro Towers, Anna Nagar"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">City</Label>
                      <Input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Chennai"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">State / Region</Label>
                      <Input
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="e.g. Tamil Nadu"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-medium text-neutral-300">Permanent Hometown Address</Label>
                      <Input
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                        placeholder="e.g. Same as current residence, or ancestral town address"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Emergency Next of Kin / Redundant Contact */}
                <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5 space-y-3.5 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2.5">
                    <Shield className="size-3.5 text-amber-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-200 font-heading">
                      Emergency Secondary Contact / Next of Kin
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 ml-auto">REDUNDANT</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Contact Name</Label>
                      <Input
                        value={emergencyContactName}
                        onChange={(e) => setEmergencyContactName(e.target.value)}
                        placeholder="e.g. Priya Shankar"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Relationship</Label>
                      <Input
                        value={emergencyRelationship}
                        onChange={(e) => setEmergencyRelationship(e.target.value)}
                        placeholder="e.g. Spouse / Sibling / Family"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Emergency Phone</Label>
                      <Input
                        type="tel"
                        value={emergencyContactPhone}
                        onChange={(e) => setEmergencyContactPhone(e.target.value)}
                        placeholder="+91 94440 12345"
                        className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 font-mono placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: TESTIMONY & SUSPECT DESCRIPTORS */}
            {activeTab === "testimony" && (
              <div className="space-y-4">
                {/* Deposition & Interview Date (with Calendar component) */}
                <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2.5 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-3.5 text-[#665AEF]" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-neutral-200 font-heading">
                        Eyewitness Deposition & Recalled Features
                      </span>
                    </div>

                    {/* Interview Date Picker using Calendar component */}
                    <div className="flex items-center gap-2">
                      <Label className="text-xs font-medium text-neutral-400">Interview Date:</Label>
                      <Popover open={isInterviewDateOpen} onOpenChange={setIsInterviewDateOpen}>
                        <PopoverTrigger
                          render={
                            <button
                              type="button"
                              className="h-8 px-2.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 hover:border-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer select-none"
                            />
                          }
                        >
                          <CalendarIcon className="size-3 text-[#a89dff]" />
                          <span className={interviewDate ? "text-neutral-100 font-medium" : "text-neutral-400"}>
                            {interviewDate && isValid(parseISO(interviewDate))
                              ? format(parseISO(interviewDate), "MMM d, yyyy")
                              : "Today / Recorded"}
                          </span>
                        </PopoverTrigger>
                        <PopoverContent
                          align="end"
                          sideOffset={6}
                          className="w-auto p-2 rounded-xl shadow-2xl bg-[#0d0d0d] border border-neutral-800 text-neutral-100"
                        >
                          <CalendarPicker
                            mode="single"
                            selected={interviewDate && isValid(parseISO(interviewDate)) ? parseISO(interviewDate) : undefined}
                            defaultMonth={interviewDate && isValid(parseISO(interviewDate)) ? parseISO(interviewDate) : new Date()}
                            onSelect={(date) => {
                              if (date) {
                                setInterviewDate(format(date, "yyyy-MM-dd"));
                                setIsInterviewDateOpen(false);
                              }
                            }}
                          />
                          <div className="flex items-center justify-between pt-2 border-t border-neutral-800 mt-1 px-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-neutral-400 hover:text-white"
                              onClick={() => {
                                setInterviewDate("");
                                setIsInterviewDateOpen(false);
                              }}
                            >
                              Reset
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-[#a89dff] hover:text-white"
                              onClick={() => {
                                setInterviewDate(format(new Date(), "yyyy-MM-dd"));
                                setIsInterviewDateOpen(false);
                              }}
                            >
                              Today
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-neutral-300">
                        Eyewitness Deposition Statement <span className="text-destructive">*</span>
                      </Label>
                      <span className="text-[10.5px] font-mono text-neutral-500">
                        {statement.trim() ? `${statement.trim().split(/\s+/).length} words` : "Empty"}
                      </span>
                    </div>
                    <Textarea
                      rows={4}
                      value={statement}
                      onChange={(e) => setStatement(e.target.value)}
                      placeholder="Describe what the witness saw: sequence of events, suspect actions, vehicle sightings, and environmental circumstances..."
                      required
                      className="rounded-md border-2 border-neutral-800 bg-black/60 p-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF] resize-none leading-relaxed transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-neutral-300">
                        Key Recalled Facial & Physical Descriptors
                      </Label>
                      <button
                        type="button"
                        onClick={handleExtractDescriptors}
                        disabled={isExtracting || !statement.trim()}
                        className="inline-flex items-center gap-1.5 text-xs font-mono text-[#a89dff] hover:text-white cursor-pointer disabled:opacity-40 transition-colors select-none font-medium"
                      >
                        {isExtracting ? (
                          <>
                            <Loader2 className="size-3 animate-spin" />
                            <span>Parsing Biometrics...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="size-3" />
                            <span>AI Extract Descriptors</span>
                          </>
                        )}
                      </button>
                    </div>
                    <Textarea
                      rows={3}
                      value={keyFacialFeatures}
                      onChange={(e) => setKeyFacialFeatures(e.target.value)}
                      placeholder="e.g. Male in early 30s, sharp jawline, scar across right cheekbone, wavy dark hair, deep-set eyes, wearing dark jacket..."
                      className="rounded-md border-2 border-neutral-800 bg-black/60 p-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF] resize-none leading-relaxed"
                    />
                  </div>
                </div>

                {/* Observation Environmental Parameters - Clean, Spacious 2-Column Grid */}
                <div className="rounded-lg border border-neutral-800 bg-[#0d0d0d] p-4 sm:p-5 space-y-3.5 shadow-xs">
                  <div className="flex items-center gap-2 border-b border-neutral-800/80 pb-2.5">
                    <Clock className="size-3.5 text-cyan-400" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-200 font-heading">
                      Scene Calibration & Observation Metrics
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 ml-auto">TELEMETRY</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Field 1: Lighting Condition (Full half-width, no truncation!) */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Lighting Condition</Label>
                      <AnimatedSelect
                        options={LIGHTING_OPTIONS}
                        value={lightingCondition}
                        onChange={setLightingCondition}
                        className="h-9.5 bg-black/60 border-2 border-neutral-800 rounded-md text-neutral-100"
                      />
                    </div>

                    {/* Field 2: Sighting Distance with inline unit suffix */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Sighting Distance</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          value={incidentDistanceMeters}
                          onChange={(e) => setIncidentDistanceMeters(e.target.value)}
                          placeholder="e.g. 12"
                          className="h-9.5 pr-14 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 font-mono placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-neutral-400 pointer-events-none select-none">
                          meters
                        </span>
                      </div>
                    </div>

                    {/* Field 3: Duration Observed with inline unit suffix */}
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-neutral-300">Duration Observed</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          value={observationDurationSec}
                          onChange={(e) => setObservationDurationSec(e.target.value)}
                          placeholder="e.g. 20"
                          className="h-9.5 pr-14 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 font-mono placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-neutral-400 pointer-events-none select-none">
                          seconds
                        </span>
                      </div>
                    </div>

                    {/* Field 4: Recall Confidence with inline % badge */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-medium text-neutral-300">Recall Confidence</Label>
                        {confidenceScore && (
                          <span className="font-mono text-[11px] text-[#a89dff] font-semibold">
                            {confidenceScore}% Reliability
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={confidenceScore}
                          onChange={(e) => setConfidenceScore(e.target.value)}
                          placeholder="85"
                          className="h-9.5 pr-8 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 font-mono placeholder:text-neutral-500 focus-visible:border-[#665AEF]"
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono text-neutral-400 pointer-events-none select-none">
                          %
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer: Firmly anchored inside modal with full visibility (Page theme black/dark & reduced radius) */}
          <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-neutral-800 bg-[#0d0d0d] flex items-center justify-between gap-2.5 z-10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-9 px-3 text-xs text-neutral-400 hover:text-white cursor-pointer"
            >
              Cancel
            </Button>

            <div className="flex items-center gap-2">
              {activeTab === "contact" ? (
                <Button
                  type="button"
                  onClick={() => {
                    if (!name.trim()) {
                      toast.error("Please enter witness name");
                      return;
                    }
                    if (!primaryPhone.trim()) {
                      toast.error("Please enter primary contact number");
                      return;
                    }
                    setActiveTab("testimony");
                  }}
                  className="h-9 px-4 text-xs font-semibold rounded-lg bg-[#665AEF] hover:bg-[#5748e6] text-white cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  <span>Next: Testimony</span>
                  <ArrowRight className="size-3.5" />
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActiveTab("contact")}
                    className="h-9 px-3 text-xs font-medium rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer flex items-center gap-1.5"
                  >
                    <ArrowLeft className="size-3.5" />
                    <span>Back</span>
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="h-9 px-5 text-xs font-semibold rounded-lg bg-[#665AEF] hover:bg-[#5748e6] text-white cursor-pointer shadow-sm flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="size-3.5" />
                        <span>{witnessToEdit ? "Save Changes" : "Enroll Witness"}</span>
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
