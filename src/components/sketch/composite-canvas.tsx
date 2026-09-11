"use client";

import * as React from "react";
import Image from "next/image";
import {
  Sparkles,
  RefreshCw,
  Download,
  Save,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Sliders,
  ShieldCheck,
  FileDown,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CompositeCanvasProps {
  sketchUrl: string | null;
  seed: number;
  onRegenerateSeed: () => void;
  isGenerating: boolean;
  onGenerate: () => void;
  onSaveToCase: () => void;
  isSaving: boolean;
  savedSketchId: string | null;
  onSearchSuspects: () => void;
  isSearchingSuspects: boolean;
  steps: number;
  controlStrength: number;
}

export function CompositeCanvas({
  sketchUrl,
  seed,
  onRegenerateSeed,
  isGenerating,
  onGenerate,
  onSaveToCase,
  isSaving,
  savedSketchId,
  onSearchSuspects,
  isSearchingSuspects,
  steps,
  controlStrength,
}: CompositeCanvasProps) {
  const [downloadSuccess, setDownloadSuccess] = React.useState(false);

  const handleDownload = () => {
    if (!sketchUrl) return;
    const a = document.createElement("a");
    a.href = sketchUrl;
    a.download = `forensix-sketch-${seed}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 backdrop-blur-md shadow-sm flex flex-col h-full">
      <CardHeader className="p-5 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-400 font-mono text-xs font-bold">
              3
            </span>
            <CardTitle className="text-base font-semibold text-foreground">
              Synthesized Forensic Composite
            </CardTitle>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[11px] font-mono border-purple-500/30 text-purple-300">
              512×512 PNG
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Stable Diffusion 1.5 conditioned on geometry lineart anchors at FP16 precision.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5 flex-1 flex flex-col items-center justify-center">
        {/* Canvas Display Frame */}
        <div className="relative aspect-square w-full max-w-[420px] rounded-xl overflow-hidden border-2 border-border/70 bg-zinc-950 shadow-inner flex items-center justify-center group">
          {sketchUrl ? (
            <div className="relative size-full">
              <Image
                src={sketchUrl}
                alt="Forensic Composite Sketch"
                fill
                priority
                unoptimized
                className="object-contain p-2 grayscale contrast-110"
              />
              {/* Overlay Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
                <span className="rounded-md bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-purple-300 border border-purple-500/30">
                  Seed: {seed}
                </span>
                <span className="rounded-md bg-black/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-zinc-400 border border-border/40">
                  Steps: {steps} | Ctrl: {controlStrength.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <div className="size-16 rounded-full border border-dashed border-border/60 bg-surface/40 flex items-center justify-center mb-3">
                <Eye className="size-8 text-muted-foreground/40" />
              </div>
              <p className="text-xs font-medium text-foreground">No Composite Synthesized</p>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[240px]">
                Click "Synthesize Composite" below to execute the local diffusion rendering pipeline.
              </p>
            </div>
          )}

          {/* Loading Overlay */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20">
              <RefreshCw className="size-8 text-purple-400 animate-spin" />
              <div className="text-center">
                <p className="text-xs font-semibold text-foreground">Executing Diffusion Pipeline</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                  SD 1.5 + Lineart Conditioning ({steps} steps)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Quick Seed Bar */}
        <div className="w-full max-w-[420px] flex items-center justify-between mt-3 text-xs text-muted-foreground">
          <span className="font-mono text-[11px]">Generation Seed: {seed}</span>
          <button
            type="button"
            onClick={onRegenerateSeed}
            disabled={isGenerating}
            className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="size-3" />
            <span>Randomize Seed</span>
          </button>
        </div>
      </CardContent>

      <CardFooter className="p-5 border-t border-border/40 flex flex-col gap-2.5">
        {/* Primary Synthesize Button */}
        <Button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full cursor-pointer bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2.5 rounded-lg shadow-sm transition-all"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="size-3.5 animate-spin mr-2" />
              Synthesizing Composite...
            </>
          ) : (
            <>
              <Sparkles className="size-3.5 mr-2 text-purple-200" />
              Synthesize Composite Sketch
            </>
          )}
        </Button>

        {/* Secondary Action Grid */}
        <div className="grid grid-cols-3 gap-2 w-full">
          <Button
            type="button"
            variant="outline"
            onClick={onSaveToCase}
            disabled={!sketchUrl || isSaving || Boolean(savedSketchId)}
            className="text-[11px] py-1.5 px-2 cursor-pointer border-border/70 hover:bg-surface"
          >
            {savedSketchId ? (
              <>
                <CheckCircle2 className="size-3 mr-1 text-emerald-400" />
                Saved
              </>
            ) : (
              <>
                <Save className="size-3 mr-1 text-purple-400" />
                Save Case
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={handleDownload}
            disabled={!sketchUrl}
            className="text-[11px] py-1.5 px-2 cursor-pointer border-border/70 hover:bg-surface"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle2 className="size-3 mr-1 text-emerald-400" />
                Saved
              </>
            ) : (
              <>
                <Download className="size-3 mr-1 text-purple-400" />
                Download
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onSearchSuspects}
            disabled={!sketchUrl || isSearchingSuspects}
            className="text-[11px] py-1.5 px-2 cursor-pointer border-purple-500/40 text-purple-300 hover:bg-purple-500/10"
          >
            {isSearchingSuspects ? (
              <>
                <RefreshCw className="size-3 mr-1 animate-spin" />
                Matching...
              </>
            ) : (
              <>
                <Search className="size-3 mr-1 text-purple-400" />
                Match Face
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
