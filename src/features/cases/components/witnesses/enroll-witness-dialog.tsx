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
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
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
  const [witnessType, setWitnessType] = useState<WitnessType>("EYEWITNESS");
  const [credibility, setCredibility] = useState<WitnessCredibility>("HIGH");
  const [primaryPhone, setPrimaryPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idType, setIdType] = useState<IdentificationType>("NATIONAL_ID");
  const [idNumber, setIdNumber] = useState("");
  const [city, setCity] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<WitnessAvailability>("ACTIVE_AVAILABLE");

  // Tab 2: Testimony & Suspect Descriptors
  const [statement, setStatement] = useState("");
  const [keyFacialFeatures, setKeyFacialFeatures] = useState("");
  const [lightingCondition, setLightingCondition] = useState("Clear Daylight");
  const [incidentDistanceMeters, setIncidentDistanceMeters] = useState("");
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
      setWitnessType(witnessToEdit.witnessType || "EYEWITNESS");
      setCredibility(witnessToEdit.credibility || "HIGH");
      setPrimaryPhone(witnessToEdit.primaryPhone || "");
      setEmail(witnessToEdit.email || "");
      setIdType(witnessToEdit.idType || "NATIONAL_ID");
      setIdNumber(witnessToEdit.idNumberMasked || "");
      setCity(witnessToEdit.city || "");
      setAvailabilityStatus(witnessToEdit.availabilityStatus || "ACTIVE_AVAILABLE");
      setStatement(witnessToEdit.statement || "");
      setKeyFacialFeatures(witnessToEdit.keyFacialFeatures || "");
      setLightingCondition(witnessToEdit.lightingCondition || "Clear Daylight");
      setIncidentDistanceMeters(
        witnessToEdit.incidentDistanceMeters ? String(witnessToEdit.incidentDistanceMeters) : ""
      );
    } else {
      resetForm();
    }
  }, [witnessToEdit, isOpen]);

  const resetForm = () => {
    setName("");
    setAlias("");
    setWitnessType("EYEWITNESS");
    setCredibility("HIGH");
    setPrimaryPhone("");
    setEmail("");
    setIdType("NATIONAL_ID");
    setIdNumber("");
    setCity("");
    setAvailabilityStatus("ACTIVE_AVAILABLE");
    setStatement("");
    setKeyFacialFeatures("");
    setLightingCondition("Clear Daylight");
    setIncidentDistanceMeters("");
    setActiveTab("contact");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

    try {
      if (witnessToEdit) {
        const res = await updateWitness({
          id: witnessToEdit.id,
          name: name.trim(),
          alias: alias.trim() || null,
          witnessType,
          credibility,
          primaryPhone: primaryPhone.trim(),
          email: email.trim() || null,
          idType,
          idNumber: idNumber.trim() || null,
          city: city.trim() || null,
          availabilityStatus,
          statement: statement.trim(),
          keyFacialFeatures: keyFacialFeatures.trim() || null,
          lightingCondition: lightingCondition || null,
          incidentDistanceMeters: incidentDistanceMeters ? parseFloat(incidentDistanceMeters) : null,
        });

        if (res.success && res.data) {
          toast.success(`Witness ${res.data.name} updated successfully`);
          onWitnessSaved(res.data);
          onOpenChange(false);
        } else {
          toast.error(res.error || "Failed to update witness");
        }
      } else {
        const res = await createWitness({
          caseId,
          name: name.trim(),
          alias: alias.trim() || null,
          witnessType,
          credibility,
          primaryPhone: primaryPhone.trim(),
          email: email.trim() || null,
          idType,
          idNumber: idNumber.trim() || null,
          city: city.trim() || null,
          availabilityStatus,
          statement: statement.trim(),
          keyFacialFeatures: keyFacialFeatures.trim() || null,
          lightingCondition: lightingCondition || null,
          incidentDistanceMeters: incidentDistanceMeters ? parseFloat(incidentDistanceMeters) : null,
        });

        if (res.success && res.data) {
          toast.success(`Witness ${res.data.name} enrolled in case registry`);
          onWitnessSaved(res.data);
          onOpenChange(false);
          resetForm();
        } else {
          toast.error(res.error || "Failed to enroll witness");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred while saving witness");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-1.25rem)] sm:w-full sm:max-w-xl md:max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border-2 border-border/80 bg-[#0c0c12]/98 backdrop-blur-2xl p-0 shadow-2xl gap-0 text-foreground overflow-hidden no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Header without icon card: Clean, modern, typography-first */}
          <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 border-b border-border/60 bg-muted/10">
            <div className="flex items-center justify-between gap-2.5">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-heading font-semibold text-foreground tracking-tight">
                  {witnessToEdit ? "Edit Witness Record" : "Enroll Witness"}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 truncate sm:whitespace-normal">
                  Record witness details for cold-case verification and AI sketch generation.
                </DialogDescription>
              </div>

              {caseNumber && (
                <span className="font-mono text-[11px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-md bg-[#665AEF]/10 border border-[#665AEF]/25 text-[#a89dff] shrink-0 font-medium">
                  {caseNumber}
                </span>
              )}
            </div>

            {/* Clean Segmented Tab Control: Full width on mobile, inline on desktop */}
            <div className="mt-3">
              <div className="grid grid-cols-2 p-0.5 rounded-lg bg-card border border-border/70 gap-1 w-full sm:w-auto sm:inline-flex">
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

          {/* Body: Responsive grid with scroll containment */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-5 text-xs no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden">
            {/* TAB 1: WITNESS & CONTACT */}
            {activeTab === "contact" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                {/* Row 1 */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">
                    Full Legal Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Verma"
                    required
                    className="h-9.5 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground focus-visible:border-[#665AEF]"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">Alias / Known As</Label>
                  <Input
                    value={alias}
                    onChange={(e) => setAlias(e.target.value)}
                    placeholder="e.g. Ramu"
                    className="h-9.5 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground focus-visible:border-[#665AEF]"
                  />
                </div>

                {/* Row 2: Role & Credibility */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">Witness Role</Label>
                  <AnimatedSelect
                    options={WITNESS_ROLE_OPTIONS}
                    value={witnessType}
                    onChange={(val) => setWitnessType(val as WitnessType)}
                    className="h-9.5 bg-background/50"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">Credibility Rating</Label>
                  <AnimatedSelect
                    options={CREDIBILITY_OPTIONS}
                    value={credibility}
                    onChange={(val) => setCredibility(val as WitnessCredibility)}
                    className="h-9.5 bg-background/50"
                  />
                </div>

                {/* Row 3: Contact Channels */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">
                    Primary Phone <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="tel"
                    value={primaryPhone}
                    onChange={(e) => setPrimaryPhone(e.target.value)}
                    placeholder="+91 98450 12345"
                    required
                    className="h-9.5 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground font-mono focus-visible:border-[#665AEF]"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-muted-foreground">Email Address</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="witness@example.com"
                    className="h-9.5 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground focus-visible:border-[#665AEF]"
                  />
                </div>

                {/* Row 4: Govt ID Type & ID Number */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">Govt ID Type</Label>
                  <AnimatedSelect
                    options={ID_TYPE_OPTIONS}
                    value={idType}
                    onChange={(val) => setIdType(val as IdentificationType)}
                    className="h-9.5 bg-background/50"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">ID Document Number</Label>
                  <Input
                    value={idNumber}
                    onChange={(e) => setIdNumber(e.target.value)}
                    placeholder="e.g. 5489-XXXX-1290"
                    className="h-9.5 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground font-mono focus-visible:border-[#665AEF]"
                  />
                </div>

                {/* Row 5: City & Long-term Availability */}
                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">City / Residence</Label>
                  <Input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Madurai"
                    className="h-9.5 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground focus-visible:border-[#665AEF]"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-medium text-foreground">Availability Status</Label>
                  <AnimatedSelect
                    options={AVAILABILITY_OPTIONS}
                    value={availabilityStatus}
                    onChange={(val) => setAvailabilityStatus(val as WitnessAvailability)}
                    className="h-9.5 bg-background/50"
                  />
                </div>
              </div>
            )}

            {/* TAB 2: TESTIMONY & SUSPECT DESCRIPTORS */}
            {activeTab === "testimony" && (
              <div className="space-y-3 sm:space-y-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-foreground">
                      Eyewitness Deposition Statement <span className="text-destructive">*</span>
                    </Label>
                    <span className="text-[10.5px] font-mono text-muted-foreground">
                      {statement.trim() ? `${statement.trim().split(/\s+/).length} words` : "Empty"}
                    </span>
                  </div>
                  <Textarea
                    rows={4}
                    value={statement}
                    onChange={(e) => setStatement(e.target.value)}
                    placeholder="Describe what the witness saw: sequence of events, suspect actions, vehicle sightings, and environmental circumstances..."
                    required
                    className="rounded-lg border-2 border-border/80 bg-background/50 p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:border-[#665AEF] resize-none leading-relaxed transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-foreground">
                      Suspect Facial & Physical Descriptors
                    </Label>
                    <button
                      type="button"
                      onClick={handleExtractDescriptors}
                      disabled={isExtracting || !statement.trim()}
                      className="inline-flex items-center gap-1 text-[11px] font-mono text-[#8579ff] hover:text-[#a89dff] cursor-pointer disabled:opacity-40 transition-colors select-none"
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
                    rows={2}
                    value={keyFacialFeatures}
                    onChange={(e) => setKeyFacialFeatures(e.target.value)}
                    placeholder="e.g. Male in early 30s, sharp jawline, scar across right cheekbone, wavy dark hair, deep-set eyes, wearing dark jacket..."
                    className="rounded-lg border-2 border-border/80 bg-background/50 p-2.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus-visible:border-[#665AEF] resize-none leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 pt-0.5">
                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Lighting Condition</Label>
                    <AnimatedSelect
                      options={LIGHTING_OPTIONS}
                      value={lightingCondition}
                      onChange={setLightingCondition}
                      className="h-9.5 bg-background/50"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs font-medium text-muted-foreground">Distance (Meters)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={incidentDistanceMeters}
                      onChange={(e) => setIncidentDistanceMeters(e.target.value)}
                      placeholder="e.g. 10"
                      className="h-9.5 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground focus-visible:border-[#665AEF]"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer: Firmly anchored inside modal with full visibility */}
          <div className="shrink-0 px-4 sm:px-6 py-3 border-t border-border/60 bg-[#0e0e16]/98 flex items-center justify-between gap-2.5 z-10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="h-9 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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
                    className="h-9 px-3 text-xs font-medium rounded-lg border-2 border-border/80 bg-card hover:bg-muted/50 text-foreground cursor-pointer flex items-center gap-1.5"
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
