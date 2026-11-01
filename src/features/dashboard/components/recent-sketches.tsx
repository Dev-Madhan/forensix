"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Maximize2,
  Download,
  ShieldCheck,
  User,
  Hash,
  Tag,
} from "lucide-react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

export interface SketchItem {
  id: string;
  title: string;
  prompt?: string;
  date: string;
  imageUrl: string;
  caseNumber?: string;
  caseTitle?: string;
}

interface RecentSketchesProps {
  sketches?: SketchItem[];
}

/**
 * Format sketch title to avoid awkward cuts or raw prompt text
 */
function cleanSketchTitle(title: string, prompt?: string, index = 1): string {
  if (
    title &&
    !title.toLowerCase().startsWith("i saw a man") &&
    !title.toLowerCase().startsWith("suspect was")
  ) {
    return title;
  }
  if (prompt) {
    const lower = prompt.toLowerCase();
    const gender =
      lower.includes("female") || lower.includes("woman")
        ? "Female Suspect"
        : "Male Suspect";
    const ageMatch = prompt.match(/(\d{2})\s*(?:to\s*(\d{2}))?\s*(?:years|yr|yo|s\b)?/i);
    if (ageMatch) {
      if (ageMatch[2]) return `${gender} • ~${ageMatch[1]}–${ageMatch[2]} Yrs`;
      return `${gender} • ~${ageMatch[1]} Yrs`;
    }
    return `${gender} • Composite #${index}`;
  }
  return `Composite Portrait #${index}`;
}

/**
 * Extract physical attribute tags from witness prompt
 */
function extractDescriptors(prompt?: string): string[] {
  if (!prompt) return ["Cognitive Synthesis", "Witness Corroborated"];
  const tags: string[] = [];
  const lower = prompt.toLowerCase();

  if (lower.includes("male") && !lower.includes("female")) tags.push("Male");
  if (lower.includes("female")) tags.push("Female");

  const ageMatch = prompt.match(/(\d{2})\s*(?:to\s*(\d{2}))?\s*(?:years|yr|yo)?/i);
  if (ageMatch) {
    tags.push(ageMatch[2] ? `Age ${ageMatch[1]}–${ageMatch[2]}` : `Age ~${ageMatch[1]}`);
  }

  if (
    lower.includes("beard") ||
    lower.includes("moustache") ||
    lower.includes("stubble") ||
    lower.includes("facial hair")
  )
    tags.push("Facial Hair");

  if (lower.includes("scar")) tags.push("Facial Scar");
  if (lower.includes("dark eyes") || lower.includes("brown eyes")) tags.push("Dark Eyes");
  if (lower.includes("narrow") || lower.includes("oval") || lower.includes("sharp"))
    tags.push("Defined Jawline");
  if (lower.includes("short hair") || lower.includes("black hair")) tags.push("Dark Hair");

  if (tags.length === 0) tags.push("Cognitive Synthesis", "Witness Corroborated");

  return tags.slice(0, 5);
}

export function RecentSketches({ sketches = [] }: RecentSketchesProps) {
  const [selectedSketch, setSelectedSketch] = React.useState<SketchItem | null>(null);
  const [copiedPrompt, setCopiedPrompt] = React.useState(false);
  const hasSketches = sketches && sketches.length > 0;

  const handleCopyPrompt = (text?: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    toast.success("Witness descriptors copied to clipboard");
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleDownloadImage = (url: string, filename: string) => {
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Composite portrait exported");
    } catch {
      toast.error("Failed to export composite portrait");
    }
  };

  return (
    <>
      {/* ── Recent Sketches Card ── */}
      <Card className="@container/card rounded-xl border border-border/70 bg-card/70 shadow-xs h-full flex flex-col justify-between overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-3 sm:gap-4 border-b border-border/40 px-5 sm:px-6 py-4">
          <div className="space-y-1 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold tracking-tight text-foreground">
                Recent Sketches
              </CardTitle>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono font-medium select-none">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>LIVE</span>
              </div>
              {hasSketches && (
                <Badge variant="secondary" className="text-[10px] font-mono h-4 px-1.5 font-medium">
                  {sketches.length}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground truncate">
              Composite suspect portraits generated from witness statements.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs font-medium text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
            render={<Link href="/sketch" />}
            nativeButton={false}
          >
            <span>Open Studio</span>
            <ArrowRight className="size-3.5" />
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
          {hasSketches ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <AnimatePresence initial={false} mode="popLayout">
                {sketches.slice(0, 4).map((sketch, idx) => {
                  const displayTitle = cleanSketchTitle(sketch.title, sketch.prompt, idx + 1);
                  const caseNum =
                    sketch.caseNumber && sketch.caseNumber.startsWith("FX-")
                      ? sketch.caseNumber
                      : "FX-2026-185";

                  return (
                    <motion.div
                      key={sketch.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() =>
                        setSelectedSketch({ ...sketch, title: displayTitle, caseNumber: caseNum })
                      }
                      className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card/60 hover:bg-muted/30 hover:border-border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-sm"
                    >
                      {/* Portrait */}
                      <div className="relative aspect-[4/3] sm:aspect-square w-full overflow-hidden bg-neutral-950">
                        <Image
                          src={sketch.imageUrl}
                          alt={displayTitle}
                          fill
                          unoptimized
                          className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                        />
                        {/* Case badge overlay */}
                        <div className="absolute top-2 left-2 z-10">
                          <Badge
                            variant="secondary"
                            className="bg-black/75 backdrop-blur-md text-white border-0 text-[10px] font-mono px-1.5 py-0.5 font-medium shadow-xs"
                          >
                            {caseNum}
                          </Badge>
                        </div>
                        {/* Hover inspect icon */}
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <span className="flex size-6 items-center justify-center rounded-full bg-black/75 backdrop-blur-md text-white shadow-xs">
                            <Maximize2 className="size-3" />
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-2.5 sm:p-3 flex flex-col gap-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {displayTitle}
                        </span>
                        <div className="flex items-center justify-between gap-1 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1 truncate font-mono">
                            <Calendar className="size-3 shrink-0 opacity-70" />
                            {sketch.date}
                          </span>
                          <span className="text-[10px] text-muted-foreground/70 font-mono shrink-0">
                            POI #{idx + 1}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <Empty className="py-10 border-2 border-dashed border-border/60 rounded-xl bg-card/30">
              <EmptyHeader>
                <EmptyTitle className="text-sm font-semibold text-foreground">
                  No composite sketches generated yet
                </EmptyTitle>
                <EmptyDescription className="text-xs text-muted-foreground max-w-[270px]">
                  Synthesize composite suspect faces using witness descriptors in the Forensic Studio.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-medium cursor-pointer shadow-xs shadow-[#665AEF]/25"
                  render={<Link href="/sketch" />}
                  nativeButton={false}
                >
                  <Sparkles className="size-3.5" />
                  <span>Launch AI Studio</span>
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </CardContent>
      </Card>

      {/* ── Forensic Inspection Dialog — compact, no scrollbars ── */}
      <Dialog
        open={!!selectedSketch}
        onOpenChange={(open) => !open && setSelectedSketch(null)}
      >
        <DialogContent className="w-full max-w-[560px] p-0 gap-0 bg-card border border-border/70 shadow-2xl overflow-hidden rounded-2xl">

          {/* Header */}
          <DialogHeader className="px-5 pt-5 pb-4 border-b border-border/40">
            <div className="flex items-start justify-between gap-3 pr-7">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-sm font-semibold text-foreground leading-tight">
                    {selectedSketch?.title || "Composite Suspect Portrait"}
                  </DialogTitle>
                  <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-px rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium leading-none">
                    <ShieldCheck className="size-2.5" />
                    Verified
                  </span>
                </div>
                <DialogDescription className="text-[11px] text-muted-foreground leading-snug">
                  Forensic composite from witness cognitive interview
                </DialogDescription>
              </div>
              <Badge
                variant="secondary"
                className="font-mono text-[10px] h-5 px-1.5 shrink-0 mt-0.5"
              >
                {selectedSketch?.caseNumber || "FX-2026-185"}
              </Badge>
            </div>
          </DialogHeader>

          {/* Body: 2-col, fully contained */}
          {selectedSketch && (
            <div className="px-5 py-4 grid grid-cols-[152px_1fr] gap-4 items-start">

              {/* Left — Portrait */}
              <div className="flex flex-col gap-2">
                <div className="relative w-full aspect-square overflow-hidden rounded-xl border border-border/60 bg-neutral-950">
                  <Image
                    src={selectedSketch.imageUrl}
                    alt={selectedSketch.title}
                    fill
                    unoptimized
                    className="object-cover object-top"
                  />
                  {/* Bottom label gradient */}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent px-2.5 pb-2 pt-5 pointer-events-none">
                    <p className="text-[9px] font-mono tracking-widest uppercase text-white/55 leading-none">
                      AI Composite
                    </p>
                  </div>
                </div>

                {/* Export button */}
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadImage(
                      selectedSketch.imageUrl,
                      `composite_${selectedSketch.caseNumber || "portrait"}.png`
                    )
                  }
                  className="flex items-center justify-center gap-1.5 w-full h-[30px] rounded-lg border border-border/60 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border/80 transition-colors cursor-pointer"
                >
                  <Download className="size-3 shrink-0" />
                  Export Portrait
                </button>
              </div>

              {/* Right — Dossier */}
              <div className="flex flex-col gap-3 min-w-0">

                {/* Investigation block */}
                <div className="rounded-lg border border-border/50 bg-muted/10 overflow-hidden">
                  <div className="px-3 py-1.5 border-b border-border/40 flex items-center gap-1.5">
                    <Hash className="size-2.5 text-muted-foreground/50 shrink-0" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                      Investigation
                    </span>
                  </div>
                  <div className="px-3 py-2 space-y-1">
                    <p className="text-[11px] font-medium text-foreground leading-snug line-clamp-2">
                      {selectedSketch.caseTitle ||
                        "Operation Apex: Downtown Transit Incident"}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Calendar className="size-2.5 shrink-0" />
                      <span>{selectedSketch.date}</span>
                    </div>
                  </div>
                </div>

                {/* Physical markers */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Tag className="size-2.5 text-muted-foreground/50 shrink-0" />
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                      Physical Markers
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {extractDescriptors(selectedSketch.prompt).map((tag, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center text-[10px] px-1.5 py-0.5 font-medium rounded-md border border-border/50 bg-muted/40 text-foreground/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Witness statement — clamped, no scroll */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <User className="size-2.5 text-muted-foreground/50 shrink-0" />
                      <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                        Witness Statement
                      </span>
                    </div>
                    {selectedSketch.prompt && (
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(selectedSketch.prompt)}
                        className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                      >
                        {copiedPrompt ? (
                          <Check className="size-2.5 text-emerald-400" />
                        ) : (
                          <Copy className="size-2.5" />
                        )}
                        {copiedPrompt ? "Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                  {/* line-clamp-5 — no internal scrollbar */}
                  <div className="rounded-lg border border-border/50 border-l-2 border-l-primary/35 bg-muted/10 px-3 py-2.5">
                    <p className="text-[11px] text-foreground/75 leading-relaxed italic line-clamp-5">
                      &ldquo;
                      {selectedSketch.prompt ||
                        "Witness provided visual facial reconstruction cues during cognitive interview."}
                      &rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between gap-3">
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Dismiss
                </Button>
              }
            />
            <Button
              size="sm"
              className="h-8 gap-1.5 bg-[#665AEF] hover:bg-[#5749DF] text-white cursor-pointer text-xs font-medium shadow-xs shadow-[#665AEF]/20"
              render={<Link href="/sketch" />}
              nativeButton={false}
            >
              Open in Studio
              <ExternalLink className="size-3" />
            </Button>
          </div>

        </DialogContent>
      </Dialog>
    </>
  );
}
