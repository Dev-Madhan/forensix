"use client";

import React, { createContext, useContext, useState } from "react";
import { GenerationMode, PendingModeSwitch } from "@/types/sketch-generation";

export interface FeatureItem {
  id: string;
  name: string;
  category: "face" | "eyes" | "nose" | "mouth" | "other";
  subcategory: string;
  subcategoryLabel: string;
  image?: string;
  svgType: string;
  description: string;
  token: string;
}

export type DetailLevel = "Draft" | "Standard" | "Master";
export type CameraAngle = "frontal" | "three_quarter" | "profile";
export type ForensicFilter = "normal" | "darkroom_negative" | "sepia_evidence";
export type GenerationStatus = "not_generated" | "generating" | "generated";

export interface LLMAnalysisData {
  feature_summary?: Record<string, string>;
  morphological_traits?: string[];
  demographic_heritage?: string;
  age_markers?: string[];
  perspective_parameters?: Record<string, unknown>;
  style_execution?: Record<string, unknown>;
  confidence_score?: number;
  reasoning?: string;
  feature_count?: number;
}

export interface SketchMetadata {
  caseId?: string;
  witnessId?: string;
  style?: string;
  angle?: string;
  demographics?: string;
  confidenceScore?: number;
  resolution?: number;
  promptUsed?: string;
  generationTimeMs?: number;
  engine?: string;
  llm_analysis?: LLMAnalysisData;
}

interface SketchContextType {
  // Generation Mode State Machine
  generationMode: GenerationMode;
  setGenerationMode: React.Dispatch<React.SetStateAction<GenerationMode>>;
  isPromptEnabled: boolean;
  isSidebarEnabled: boolean;
  isDemographicsEnabled: boolean;
  pendingModeSwitch: PendingModeSwitch | null;
  requestModeChange: (targetMode: GenerationMode, onConfirmed?: () => void) => void;
  confirmModeSwitch: () => void;
  cancelModeSwitch: () => void;

  // Feature selections
  selectedFeatures: Record<string, FeatureItem>;
  toggleFeature: (feature: FeatureItem) => void;
  removeFeature: (subcategory: string) => void;
  clearAllFeatures: () => void;
  isFeatureSelected: (id: string) => boolean;
  selectedCount: number;

  // History (Undo / Redo)
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  // Sidebar & Display modes
  sidebarCollapsed: boolean;
  setSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: "lineart" | "dataset";
  setViewMode: (mode: "lineart" | "dataset") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Canvas Viewport Controls
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  zoomIn: () => void;
  zoomOut: () => void;
  pan: { x: number; y: number };
  setPan: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  activeTool: "select" | "pan";
  setActiveTool: React.Dispatch<React.SetStateAction<"select" | "pan">>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  resetCanvas: () => void;

  // Prompt & Generation Controls
  promptText: string;
  setPromptText: React.Dispatch<React.SetStateAction<string>>;
  sketchStyle: string;
  setSketchStyle: React.Dispatch<React.SetStateAction<string>>;
  cameraAngle: CameraAngle;
  setCameraAngle: React.Dispatch<React.SetStateAction<CameraAngle>>;
  ageGroup: string;
  setAgeGroup: React.Dispatch<React.SetStateAction<string>>;
  gender: string;
  setGender: React.Dispatch<React.SetStateAction<string>>;
  ethnicity: string;
  setEthnicity: React.Dispatch<React.SetStateAction<string>>;
  lightingMood: "neutral_studio" | "crime_scene";
  setLightingMood: React.Dispatch<React.SetStateAction<"neutral_studio" | "crime_scene">>;
  detailLevel: DetailLevel;
  setDetailLevel: React.Dispatch<React.SetStateAction<DetailLevel>>;

  // Inspection Tools
  comparisonMode: boolean;
  setComparisonMode: React.Dispatch<React.SetStateAction<boolean>>;
  splitPosition: number;
  setSplitPosition: React.Dispatch<React.SetStateAction<number>>;
  forensicFilter: ForensicFilter;
  setForensicFilter: React.Dispatch<React.SetStateAction<ForensicFilter>>;

  // Generation Output
  isGenerating: boolean;
  generationStatus: GenerationStatus;
  generatedImageUrl: string | null;
  sketchMetadata: SketchMetadata | null;
  llmAnalysis: LLMAnalysisData | null;
  generateSketch: () => Promise<void>;
  generateVariation: () => Promise<void>;
}

const SketchContext = createContext<SketchContextType | undefined>(undefined);

export function SketchProvider({ children }: { children: React.ReactNode }) {
  // Feature selections
  const [selectedFeatures, setSelectedFeatures] = useState<Record<string, FeatureItem>>({});

  // Generation Mode State Machine
  const [generationMode, setGenerationMode] = useState<GenerationMode>("IDLE");
  const [pendingModeSwitch, setPendingModeSwitch] = useState<PendingModeSwitch | null>(null);

  const isPromptEnabled = generationMode !== "DATASET_COMPOSITE";
  const isSidebarEnabled = generationMode !== "PROMPT_GENERATION";
  const isDemographicsEnabled = generationMode !== "PROMPT_GENERATION";

  // History stack for Undo / Redo
  const [history, setHistory] = useState<Record<string, FeatureItem>[]>([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Sidebar & Search
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<"lineart" | "dataset">("lineart");
  const [searchQuery, setSearchQuery] = useState("");

  // Canvas Navigation
  const [zoom, setZoom] = useState(100);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<"select" | "pan">("select");
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Prompt & Generation Controls
  const [promptText, setPromptText] = useState("");
  const [sketchStyle, setSketchStyle] = useState("Forensic Graphite (Pencil)");
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>("frontal");
  const [ageGroup, setAgeGroup] = useState("26-35");
  const [gender, setGender] = useState("Male");
  const [ethnicity, setEthnicity] = useState("General / Neutral");
  const [lightingMood, setLightingMood] = useState<"neutral_studio" | "crime_scene">("neutral_studio");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("Standard");

  // Inspection Tools
  const [comparisonMode, setComparisonMode] = useState(false);
  const [splitPosition, setSplitPosition] = useState(50);
  const [forensicFilter, setForensicFilter] = useState<ForensicFilter>("normal");

  // Output
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus>("not_generated");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [sketchMetadata, setSketchMetadata] = useState<SketchMetadata | null>(null);
  const [llmAnalysis, setLlmAnalysis] = useState<LLMAnalysisData | null>(null);

  // Helper to commit new selection state to history
  const commitFeatures = (newFeatures: Record<string, FeatureItem>) => {
    setSelectedFeatures(newFeatures);
    setHistory((prev) => {
      const upToCurrent = prev.slice(0, historyIndex + 1);
      return [...upToCurrent, newFeatures];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const requestModeChange = (targetMode: GenerationMode, onConfirmed?: () => void) => {
    if (targetMode === generationMode) {
      if (onConfirmed) onConfirmed();
      return;
    }

    if (targetMode === "PROMPT_GENERATION") {
      const hasFeatures = Object.keys(selectedFeatures).length > 0;
      if (hasFeatures) {
        setPendingModeSwitch({
          targetMode: "PROMPT_GENERATION",
          description: `You have ${Object.keys(selectedFeatures).length} facial feature(s) selected in your composite. Switching to Prompt Generation mode will discard these feature selections.`,
          onConfirm: () => {
            clearAllFeatures();
            setGenerationMode("PROMPT_GENERATION");
            setPendingModeSwitch(null);
            if (onConfirmed) onConfirmed();
          },
        });
        return;
      }
      setGenerationMode("PROMPT_GENERATION");
      if (onConfirmed) onConfirmed();
      return;
    }

    if (targetMode === "DATASET_COMPOSITE") {
      const hasPrompt = promptText.trim().length > 0;
      if (hasPrompt) {
        setPendingModeSwitch({
          targetMode: "DATASET_COMPOSITE",
          description: "You have an active witness statement prompt. Switching to Dataset Composite mode will clear your prompt text.",
          onConfirm: () => {
            setPromptText("");
            setGenerationMode("DATASET_COMPOSITE");
            setPendingModeSwitch(null);
            if (onConfirmed) onConfirmed();
          },
        });
        return;
      }
      setGenerationMode("DATASET_COMPOSITE");
      if (onConfirmed) onConfirmed();
      return;
    }

    if (targetMode === "IDLE") {
      setGenerationMode("IDLE");
      if (onConfirmed) onConfirmed();
    }
  };

  const confirmModeSwitch = () => {
    if (pendingModeSwitch) {
      pendingModeSwitch.onConfirm();
    }
  };

  const cancelModeSwitch = () => {
    setPendingModeSwitch(null);
  };

  const doToggleFeature = (feature: FeatureItem) => {
    const isAlready = selectedFeatures[feature.subcategory]?.id === feature.id;
    let next: Record<string, FeatureItem>;
    if (isAlready) {
      next = { ...selectedFeatures };
      delete next[feature.subcategory];
    } else {
      next = {
        ...selectedFeatures,
        [feature.subcategory]: feature,
      };
    }
    commitFeatures(next);
    if (Object.keys(next).length === 0 && promptText.trim().length === 0) {
      setGenerationMode("IDLE");
    }
  };

  const toggleFeature = (feature: FeatureItem) => {
    if (generationMode === "PROMPT_GENERATION") {
      requestModeChange("DATASET_COMPOSITE", () => {
        doToggleFeature(feature);
      });
      return;
    }
    if (generationMode === "IDLE") {
      setGenerationMode("DATASET_COMPOSITE");
    }
    doToggleFeature(feature);
  };

  const removeFeature = (subcategory: string) => {
    const next = { ...selectedFeatures };
    delete next[subcategory];
    commitFeatures(next);
    if (Object.keys(next).length === 0 && promptText.trim().length === 0) {
      setGenerationMode("IDLE");
    }
  };

  const clearAllFeatures = () => {
    commitFeatures({});
    if (generationMode === "DATASET_COMPOSITE" && promptText.trim().length === 0) {
      setGenerationMode("IDLE");
    }
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const undo = () => {
    if (!canUndo) return;
    const targetIndex = historyIndex - 1;
    setSelectedFeatures(history[targetIndex]);
    setHistoryIndex(targetIndex);
  };

  const redo = () => {
    if (!canRedo) return;
    const targetIndex = historyIndex + 1;
    setSelectedFeatures(history[targetIndex]);
    setHistoryIndex(targetIndex);
  };

  const isFeatureSelected = (id: string) => {
    return Object.values(selectedFeatures).some((f) => f.id === id);
  };

  const selectedCount = Object.keys(selectedFeatures).length;

  const zoomIn = () => setZoom((z) => Math.min(z + 10, 200));
  const zoomOut = () => setZoom((z) => Math.max(z - 10, 50));

  const resetCanvas = () => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
    setActiveTool("select");
    setComparisonMode(false);
    setSplitPosition(50);
    setForensicFilter("normal");
    setGeneratedImageUrl(null);
    setGenerationStatus("not_generated");
    setSketchMetadata(null);
    setLlmAnalysis(null);
  };

  const generateSketch = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setGenerationStatus("generating");
    setGeneratedImageUrl(null);

    try {
      // Build rich attribute payload from selected dataset features
      // Uses the feature `token` field (e.g. "almond_eyes") which is specifically
      // engineered for SD prompt conditioning — far more specific than just the name.
      const attributes: Record<string, string> = {};
      const featureTokens: string[] = [];
      const featureDescriptions: string[] = [];

      Object.values(selectedFeatures).forEach((feat) => {
        // Primary: use the token (SD-optimized descriptor like "almond_eyes")
        attributes[feat.subcategory] = feat.token;
        // Also store human name for geometry/fallback
        attributes[`${feat.subcategory}_name`] = feat.name.toLowerCase();
        // Canonical aliases for eyewear / glasses so both terms are always present
        if (feat.subcategory === "eyewear" || feat.id.startsWith("glasses_")) {
          attributes["glasses"] = feat.token;
          attributes["eyewear"] = feat.token;
          attributes["accessories"] = feat.token;
        }
        // Collect tokens for direct prompt injection
        featureTokens.push(feat.token);
        // Collect descriptions for LLM understanding
        if (feat.description) {
          featureDescriptions.push(feat.description);
        }
      });

      // Pass the full token list for direct SD prompt injection
      if (featureTokens.length > 0) {
        attributes["_feature_tokens"] = featureTokens.join(", ");
        attributes["_feature_count"] = String(featureTokens.length);
      }
      if (featureDescriptions.length > 0) {
        attributes["_feature_descriptions"] = featureDescriptions.join(". ");
      }

      const isPromptMode = generationMode === "PROMPT_GENERATION" || (generationMode === "IDLE" && promptText.trim().length > 0);
      const activeMode = isPromptMode ? "PROMPT_GENERATION" : "DATASET_COMPOSITE";

      // Build components map for dataset composite mode
      const components: Record<string, string> = {};
      Object.entries(selectedFeatures).forEach(([subcat, feat]) => {
        components[subcat] = feat.id;
      });

      const requestPayload = isPromptMode
        ? {
            mode: "PROMPT_GENERATION" as const,
            case_id: "CASE-2026-X49",
            witness_id: "WITNESS-01",
            prompt: promptText.trim(),
            sketch_style: sketchStyle,
            camera_angle: cameraAngle,
            age_group: ageGroup,
            gender,
            ethnicity,
            lighting_mood: lightingMood,
            detail_level: detailLevel,
            resolution: 512,
          }
        : {
            mode: "DATASET_COMPOSITE" as const,
            case_id: "CASE-2026-X49",
            witness_id: "WITNESS-01",
            attributes,
            components,
            sketch_style: sketchStyle,
            camera_angle: cameraAngle,
            age_group: ageGroup,
            gender,
            ethnicity,
            lighting_mood: lightingMood,
            detail_level: detailLevel,
            resolution: 512,
          };

      const response = await fetch("/api/ai/sketch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        throw new Error("Failed to generate sketch from server");
      }

      const data = await response.json();
      if (data.image?.url) {
        setGeneratedImageUrl(data.image.url);
      }
      if (data.metadata) {
        setSketchMetadata(data.metadata);
      }
      if (data.llm_analysis) {
        setLlmAnalysis(data.llm_analysis);
      } else if (data.metadata?.llm_analysis) {
        setLlmAnalysis(data.metadata.llm_analysis);
      }
      setGenerationStatus("generated");
    } catch (err) {
      console.error("[generateSketch] error:", err);
      setGenerationStatus("generated");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVariation = async () => {
    // Re-synthesizes with a fresh random seed using the identical prompt & feature attributes
    await generateSketch();
  };

  return (
    <SketchContext.Provider
      value={{
        generationMode,
        setGenerationMode,
        isPromptEnabled,
        isSidebarEnabled,
        isDemographicsEnabled,
        pendingModeSwitch,
        requestModeChange,
        confirmModeSwitch,
        cancelModeSwitch,

        selectedFeatures,
        toggleFeature,
        removeFeature,
        clearAllFeatures,
        isFeatureSelected,
        selectedCount,

        canUndo,
        canRedo,
        undo,
        redo,

        sidebarCollapsed,
        setSidebarCollapsed,
        viewMode,
        setViewMode,
        searchQuery,
        setSearchQuery,

        zoom,
        setZoom,
        zoomIn,
        zoomOut,
        pan,
        setPan,
        activeTool,
        setActiveTool,
        isFullscreen,
        setIsFullscreen,
        resetCanvas,

        promptText,
        setPromptText,
        sketchStyle,
        setSketchStyle,
        cameraAngle,
        setCameraAngle,
        ageGroup,
        setAgeGroup,
        gender,
        setGender,
        ethnicity,
        setEthnicity,
        lightingMood,
        setLightingMood,
        detailLevel,
        setDetailLevel,

        comparisonMode,
        setComparisonMode,
        splitPosition,
        setSplitPosition,
        forensicFilter,
        setForensicFilter,

        isGenerating,
        generationStatus,
        generatedImageUrl,
        sketchMetadata,
        llmAnalysis,
        generateSketch,
        generateVariation,
      }}
    >
      {children}
    </SketchContext.Provider>
  );
}

export function useSketch() {
  const context = useContext(SketchContext);
  if (!context) {
    throw new Error("useSketch must be used within a SketchProvider");
  }
  return context;
}
