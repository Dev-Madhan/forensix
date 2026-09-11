"use client";

import * as React from "react";
import {
  Sparkles,
  Shield,
  Layers,
  History,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { WitnessStatementInput } from "./witness-statement-input";
import { FacialAttributesEditor } from "./facial-attributes-editor";
import { CompositeCanvas } from "./composite-canvas";
import { SuspectMatchPanel, MatchCandidate } from "./suspect-match-panel";
import {
  StudioCaseOption,
  StudioCriminalOption,
  attachSketchToCase,
  saveRecognitionMatch,
} from "@/features/sketches/actions";
import { toast } from "sonner";

interface ForensicSketchStudioProps {
  initialCases: StudioCaseOption[];
  initialCriminals: StudioCriminalOption[];
}

export function ForensicSketchStudio({
  initialCases,
  initialCriminals,
}: ForensicSketchStudioProps) {
  const [cases] = React.useState<StudioCaseOption[]>(initialCases);
  const [criminals] = React.useState<StudioCriminalOption[]>(initialCriminals);

  const [selectedCaseId, setSelectedCaseId] = React.useState<string>(
    initialCases[0]?.id || "case-default"
  );
  const [selectedWitnessId, setSelectedWitnessId] = React.useState<string>(
    initialCases[0]?.witnesses[0]?.id || "wit-default"
  );

  const [statement, setStatement] = React.useState<string>(
    "Male suspect in his mid-thirties with a sharp angular jawline, dark arched eyebrows, narrow almond brown eyes, straight pointed nose bridge, thin compressed lips, and light 5 o'clock stubble."
  );

  const [attributes, setAttributes] = React.useState<Record<string, any>>({
    gender: "male",
    face_shape: "oval",
    eye_shape: "almond",
    eye_color: "dark brown",
    eyebrows: "arched",
    nose: "straight",
    lips: "thin",
    facial_hair: "light stubble",
  });

  const [seed, setSeed] = React.useState<number>(458921);
  const [steps, setSteps] = React.useState<number>(24);
  const [controlStrength, setControlStrength] = React.useState<number>(0.85);

  const [sketchUrl, setSketchUrl] = React.useState<string | null>(null);
  const [isExtracting, setIsExtracting] = React.useState<boolean>(false);
  const [isGenerating, setIsGenerating] = React.useState<boolean>(false);
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [savedSketchId, setSavedSketchId] = React.useState<string | null>(null);

  const [matches, setMatches] = React.useState<MatchCandidate[]>([]);
  const [isSearchingSuspects, setIsSearchingSuspects] = React.useState<boolean>(false);
  const [confirmedMatches, setConfirmedMatches] = React.useState<Record<string, boolean>>({});

  const handleRegenerateSeed = () => {
    setSeed(Math.floor(100000 + Math.random() * 900000));
  };

  const handleChangeAttribute = (key: string, value: any) => {
    setAttributes((prev) => ({ ...prev, [key]: value }));
  };

  const handleAttributesExtracted = (extracted: Record<string, any>) => {
    setAttributes((prev) => ({ ...prev, ...extracted }));
    toast.success("Facial attributes extracted and mapped to studio controls.");
  };

  const handleGenerateSketch = async () => {
    setIsGenerating(true);
    setSavedSketchId(null);

    try {
      const res = await fetch("/api/ai/sketch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: selectedCaseId,
          witness_id: selectedWitnessId,
          attributes,
          seed,
          resolution: 512,
          steps,
          control_strength: controlStrength,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to synthesize composite sketch.");
      }

      setSketchUrl(data.image?.url || null);
      toast.success(`Forensic sketch synthesized in ${data.processing_time_ms}ms.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sketch synthesis error.";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToCase = async () => {
    if (!sketchUrl) return;
    setIsSaving(true);

    try {
      const res = await attachSketchToCase({
        caseId: selectedCaseId,
        witnessId: selectedWitnessId,
        imageUrl: sketchUrl,
        description: `Forensic composite sketch generated with seed ${seed}`,
      });

      if (res.error || !res.sketch) {
        throw new Error(res.error || "Failed to attach sketch to case.");
      }

      setSavedSketchId(res.sketch.id);
      toast.success("Sketch permanently linked to case investigation file.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error saving sketch.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearchSuspects = async () => {
    if (!sketchUrl) {
      toast.error("Please generate a sketch first before executing biometric search.");
      return;
    }

    setIsSearchingSuspects(true);
    try {
      const res = await fetch("/api/ai/recognition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: selectedCaseId,
          image_reference: sketchUrl,
          limit: 5,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to search suspect database.");
      }

      const rawMatches: MatchCandidate[] = data.matches || [];
      setMatches(rawMatches);
      toast.success(`Found ${rawMatches.length} suspect candidates from biometric index.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Biometric search error.";
      toast.error(msg);
    } finally {
      setIsSearchingSuspects(false);
    }
  };

  const handleConfirmMatch = async (criminalId: string, score: number) => {
    if (!savedSketchId) {
      toast.error("Please click 'Save Case' on the sketch before confirming biometric matches.");
      return;
    }

    try {
      const res = await saveRecognitionMatch({
        sketchId: savedSketchId,
        criminalId,
        matchScore: score,
        status: "CONFIRMED",
      });

      if (res.error) {
        throw new Error(res.error);
      }

      setConfirmedMatches((prev) => ({ ...prev, [criminalId]: true }));
      toast.success("Suspect match confirmed and registered in criminal investigation record.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Confirmation error.";
      toast.error(msg);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 max-w-7xl mx-auto w-full">
      {/* Studio Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs font-mono text-purple-300 mb-2">
            <Sparkles className="size-3" />
            <span>Forensic Studio v2.0 • Phase 7 Live Inference</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground font-heading">
            AI Forensic Composite Sketch Studio
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            End-to-end investigative workbench: witness NLP tokenization (Qwen), geometry lineart conditioning (ControlNet), diffusion synthesis (SD1.5), and biometric face recognition (InsightFace ArcFace 512D & Neon pgvector).
          </p>
        </div>
      </div>

      {/* Primary Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Intake & Taxonomy (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <WitnessStatementInput
            cases={cases}
            selectedCaseId={selectedCaseId}
            onSelectCase={setSelectedCaseId}
            selectedWitnessId={selectedWitnessId}
            onSelectWitness={setSelectedWitnessId}
            statement={statement}
            onStatementChange={setStatement}
            onAttributesExtracted={handleAttributesExtracted}
            isExtracting={isExtracting}
            setIsExtracting={setIsExtracting}
          />

          <FacialAttributesEditor
            attributes={attributes}
            onChangeAttribute={handleChangeAttribute}
            controlStrength={controlStrength}
            onChangeControlStrength={setControlStrength}
            steps={steps}
            onChangeSteps={setSteps}
          />
        </div>

        {/* Right Column: Composite Canvas & Biometrics (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <CompositeCanvas
            sketchUrl={sketchUrl}
            seed={seed}
            onRegenerateSeed={handleRegenerateSeed}
            isGenerating={isGenerating}
            onGenerate={handleGenerateSketch}
            onSaveToCase={handleSaveToCase}
            isSaving={isSaving}
            savedSketchId={savedSketchId}
            onSearchSuspects={handleSearchSuspects}
            isSearchingSuspects={isSearchingSuspects}
            steps={steps}
            controlStrength={controlStrength}
          />

          <SuspectMatchPanel
            matches={matches}
            isSearching={isSearchingSuspects}
            criminalsCatalog={criminals}
            onConfirmMatch={handleConfirmMatch}
            confirmedMatches={confirmedMatches}
          />
        </div>
      </div>
    </div>
  );
}
