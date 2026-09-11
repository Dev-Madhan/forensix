"use client";

import * as React from "react";
import { Sliders, User, Eye, Smile, Scissors, Layers } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface FacialAttributesEditorProps {
  attributes: Record<string, any>;
  onChangeAttribute: (key: string, value: any) => void;
  controlStrength: number;
  onChangeControlStrength: (val: number) => void;
  steps: number;
  onChangeSteps: (val: number) => void;
}

const FACE_SHAPES = ["oval", "square", "round", "heart", "oblong"];
const EYE_SHAPES = ["almond", "round", "narrow", "deep-set", "hooded"];
const EYE_COLORS = ["dark brown", "black", "hazel", "blue", "gray"];
const BROW_TYPES = ["arched", "straight", "bushy", "thin", "heavy"];
const NOSE_SHAPES = ["straight", "aquiline", "button", "wide", "pointed"];
const LIP_TYPES = ["thin", "medium", "full", "compressed", "wide"];
const FACIAL_HAIR = ["none", "light stubble", "mustache", "goatee", "full beard"];

export function FacialAttributesEditor({
  attributes,
  onChangeAttribute,
  controlStrength,
  onChangeControlStrength,
  steps,
  onChangeSteps,
}: FacialAttributesEditorProps) {
  // Normalize current values with defaults
  const gender = attributes.gender || "male";
  const faceShape = attributes.face_shape || "oval";
  const eyeShape = attributes.eye_shape || attributes.eyes?.shape || "almond";
  const eyeColor = attributes.eye_color || attributes.eyes?.color || "dark brown";
  const eyebrow = attributes.eyebrows || attributes.brows || "arched";
  const nose = attributes.nose || attributes.nose_shape || "straight";
  const lips = attributes.lips || attributes.mouth || "thin";
  const facialHair = attributes.facial_hair || attributes.beard || "light stubble";

  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="p-5 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-400 font-mono text-xs font-bold">
              2
            </span>
            <CardTitle className="text-base font-semibold text-foreground">
              Facial Taxonomy & Geometry Controls
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-border text-muted-foreground">
            CelebAMask-HQ Anchors
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Adjust facial anatomy parameters and ControlNet conditioning parameters prior to synthesis.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Component Selectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Face Structure */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <User className="size-3.5 text-purple-400" />
              <span>Face Structure / Jawline</span>
            </div>
            <select
              value={faceShape}
              onChange={(e) => onChangeAttribute("face_shape", e.target.value)}
              className="w-full text-xs rounded-lg border border-border/70 bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50 capitalize"
            >
              {FACE_SHAPES.map((s) => (
                <option key={s} value={s}>
                  {s} Jawline
                </option>
              ))}
            </select>
          </div>

          {/* Eye Anatomy */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Eye className="size-3.5 text-purple-400" />
              <span>Eye Contour & Aperture</span>
            </div>
            <select
              value={eyeShape}
              onChange={(e) => onChangeAttribute("eye_shape", e.target.value)}
              className="w-full text-xs rounded-lg border border-border/70 bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50 capitalize"
            >
              {EYE_SHAPES.map((s) => (
                <option key={s} value={s}>
                  {s} Eyes
                </option>
              ))}
            </select>
          </div>

          {/* Eyebrows */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Layers className="size-3.5 text-purple-400" />
              <span>Eyebrow Arch & Density</span>
            </div>
            <select
              value={eyebrow}
              onChange={(e) => onChangeAttribute("eyebrows", e.target.value)}
              className="w-full text-xs rounded-lg border border-border/70 bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50 capitalize"
            >
              {BROW_TYPES.map((b) => (
                <option key={b} value={b}>
                  {b} Eyebrows
                </option>
              ))}
            </select>
          </div>

          {/* Nose Bridge */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Sliders className="size-3.5 text-purple-400" />
              <span>Nose Bridge & Tip</span>
            </div>
            <select
              value={nose}
              onChange={(e) => onChangeAttribute("nose", e.target.value)}
              className="w-full text-xs rounded-lg border border-border/70 bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50 capitalize"
            >
              {NOSE_SHAPES.map((n) => (
                <option key={n} value={n}>
                  {n} Nose
                </option>
              ))}
            </select>
          </div>

          {/* Mouth & Lips */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Smile className="size-3.5 text-purple-400" />
              <span>Mouth & Lip Profile</span>
            </div>
            <select
              value={lips}
              onChange={(e) => onChangeAttribute("lips", e.target.value)}
              className="w-full text-xs rounded-lg border border-border/70 bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50 capitalize"
            >
              {LIP_TYPES.map((l) => (
                <option key={l} value={l}>
                  {l} Lips
                </option>
              ))}
            </select>
          </div>

          {/* Facial Hair */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
              <Scissors className="size-3.5 text-purple-400" />
              <span>Facial Hair / Stubble</span>
            </div>
            <select
              value={facialHair}
              onChange={(e) => onChangeAttribute("facial_hair", e.target.value)}
              className="w-full text-xs rounded-lg border border-border/70 bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50 capitalize"
            >
              {FACIAL_HAIR.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Hyperparameters & Sliders */}
        <div className="rounded-lg border border-border/50 bg-surface/40 p-4 space-y-4">
          <span className="text-xs font-semibold text-foreground block">
            Diffusion & Lineart Conditioning Parameters
          </span>

          {/* ControlNet Conditioning Scale Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">ControlNet Conditioning Strength</span>
              <span className="font-mono text-purple-400 font-medium">
                {controlStrength.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="1.0"
              step="0.05"
              value={controlStrength}
              onChange={(e) => onChangeControlStrength(parseFloat(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-border/60 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>0.50 (Flexible)</span>
              <span>0.85 (Forensic Standard)</span>
              <span>1.00 (Strict Anchor)</span>
            </div>
          </div>

          {/* Inference Steps Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Diffusion Inference Steps</span>
              <span className="font-mono text-purple-400 font-medium">{steps}</span>
            </div>
            <input
              type="range"
              min="15"
              max="30"
              step="1"
              value={steps}
              onChange={(e) => onChangeSteps(parseInt(e.target.value, 10))}
              className="w-full accent-purple-500 cursor-pointer h-1.5 bg-border/60 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
              <span>15 (Rapid Draft)</span>
              <span>24 (Recommended)</span>
              <span>30 (Ultra Fine)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
