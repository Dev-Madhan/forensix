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
import { getSafeStorageUrl } from "@/lib/storage-url";

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

function SafeSketchImage({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  const fallbackSrc = "/images/sketches/sketch-01.jpg";
  const safeSrc = React.useMemo(
    () => getSafeStorageUrl(src, fallbackSrc) || src || fallbackSrc,
    [src]
  );
  const [imgSrc, setImgSrc] = React.useState(safeSrc);
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    setImgSrc(getSafeStorageUrl(src, fallbackSrc) || src || fallbackSrc);
    setHasError(false);
  }, [src]);

  return (
    <Image
      src={hasError ? fallbackSrc : imgSrc || fallbackSrc}
      alt={alt}
      fill
      unoptimized
      className={className || "object-cover object-top"}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}

/**
 * Format sketch title compactly so it never cuts off awkwardly in 2-col mobile cards
 */
function cleanSketchTitle(title: string, prompt?: string, index = 1): string {
  if (
    title &&
    !title.toLowerCase().startsWith("i saw a man") &&
    !title.toLowerCase().startsWith("suspect was") &&
    title.length <= 22
  ) {
    return title;
  }
  if (prompt) {
    const lower = prompt.toLowerCase();
    const gender =
      lower.includes("female") || lower.includes("woman")
        ? "Female"
        : "Male";
    const ageMatch = prompt.match(/(\d{2})\s*(?:to\s*(\d{2}))?\s*(?:years|yr|yo|s\b)?/i);
    if (ageMatch) {
      if (ageMatch[2]) return `${gender} • ${ageMatch[1]}–${ageMatch[2]} Yrs`;
      return `${gender} • ~${ageMatch[1]} Yrs`;
    }
    return `${gender} • POI #${index}`;
  }
  return `Composite #${index}`;
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
      <Card className="@container/card rounded-xl border border-border/70 bg-card/75 shadow-xs h-full flex flex-col justify-between overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between gap-2 border-b border-border/40 px-4 sm:px-6 py-3.5 sm:py-4">
          <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm sm:text-base font-semibold tracking-tight text-foreground font-heading whitespace-nowrap">
                Recent Sketches
              </CardTitle>
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" title="Live sync" />
              {hasSketches && (
                <Badge variant="secondary" className="text-[10px] font-mono h-4 px-1.5 font-medium shrink-0">
                  {sketches.length}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-muted-foreground truncate">
              Composite suspect portraits from witness statements.
            </CardDescription>
          </div>
          <Link
            href="/sketch"
            className="group shrink-0 whitespace-nowrap inline-flex items-center gap-1.5 text-xs font-medium text-[#a594fd] hover:text-[#c4b8ff] transition-colors bg-secondary/40 hover:bg-secondary/70 border border-border/50 px-2.5 py-1 rounded-lg"
          >
            <span>Open Studio</span>
            <ArrowRight className="size-3 shrink-0 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-3 sm:p-4.5 flex-1 flex flex-col justify-center">
          {hasSketches ? (
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5">
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
                      {/* Portrait in clean square 1:1 format */}
                      <div className="relative aspect-square w-full overflow-hidden bg-neutral-950">
                        <SafeSketchImage
                          src={sketch.imageUrl}
                          alt={displayTitle}
                          className="object-cover object-top group-hover:scale-[1.03] transition-transform duration-300"
                        />
                        {/* Case badge overlay */}
                        <div className="absolute top-2 left-2 z-10">
                          <Badge
                            variant="secondary"
                            className="bg-black/80 backdrop-blur-md text-white border-0 text-[10px] font-mono px-1.5 py-0.5 font-medium shadow-xs"
                          >
                            {caseNum}
                          </Badge>
                        </div>
                        {/* Hover inspect icon */}
                        <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                          <span className="flex size-6 items-center justify-center rounded-full bg-black/80 backdrop-blur-md text-white shadow-xs">
                            <Maximize2 className="size-3" />
                          </span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="p-2 sm:p-2.5 flex flex-col gap-1 min-w-0">
                        <span className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {displayTitle}
                        </span>
                        <div className="flex items-center justify-between gap-1 text-[10px] text-muted-foreground font-mono">
                          <span className="flex items-center gap-1 truncate">
                            <Calendar className="size-3 shrink-0 opacity-70" />
                            {sketch.date}
                          </span>
                          <span className="text-muted-foreground/70 shrink-0">
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
            <div className="flex flex-col items-center justify-center text-center py-6 px-4 border border-dashed border-border/70 rounded-xl bg-card/40 my-auto">
              <div className="size-10 rounded-xl bg-[#665AEF]/15 border border-[#665AEF]/30 flex items-center justify-center text-[#a594fd] mb-2.5 shadow-xs">
                <Sparkles className="size-4.5" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">
                No composite sketches generated yet
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground max-w-[260px] mt-1 mb-3.5 leading-relaxed">
                Synthesize composite suspect faces using witness descriptors in the Forensic Studio.
              </p>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-medium cursor-pointer shadow-xs shadow-[#665AEF]/25"
                render={<Link href="/sketch" />}
                nativeButton={false}
              >
                <Sparkles className="size-3.5" />
                <span>Launch AI Studio</span>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Optimized Forensic Inspection Dialog (Compact, Zero Scroll On Mobile) ── */}
      <Dialog
        open={!!selectedSketch}
        onOpenChange={(open) => !open && setSelectedSketch(null)}
      >
        <DialogContent className="w-[calc(100vw-32px)] max-w-[500px] p-0 gap-0 bg-card border border-border/70 shadow-2xl overflow-hidden rounded-2xl">
          {/* Header */}
          <DialogHeader className="px-4 sm:px-5 pt-4 pb-3 border-b border-border/40">
            <div className="flex items-center justify-between gap-2 pr-7">
              <div className="flex items-center gap-2 flex-wrap min-w-0">
                <DialogTitle className="text-sm sm:text-base font-semibold text-foreground leading-tight truncate font-heading">
                  {selectedSketch?.title || "Composite Suspect Portrait"}
                </DialogTitle>
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium leading-none shrink-0">
                  <ShieldCheck className="size-2.5" />
                  Verified
                </span>
              </div>
              <Badge
                variant="secondary"
                className="font-mono text-[10px] h-5 px-1.5 shrink-0 bg-secondary/80"
              >
                {selectedSketch?.caseNumber || "FX-2026-185"}
              </Badge>
            </div>
            <DialogDescription className="text-[11px] text-muted-foreground leading-snug">
              Forensic composite reconstruction from witness cognitive interview.
            </DialogDescription>
          </DialogHeader>

          {/* Body: Compact Side-by-Side Portrait & Metadata */}
          {selectedSketch && (
            <div className="px-4 sm:px-5 py-3.5 sm:py-4 space-y-3.5 max-h-[75vh] overflow-y-auto">
              {/* Row 1: Portrait + Investigation Details */}
              <div className="flex gap-3 sm:gap-4 items-start">
                {/* Portrait with download quick action */}
                <div className="relative size-24 sm:size-28 rounded-xl overflow-hidden border border-border/70 bg-neutral-950 shrink-0 shadow-xs">
                  <SafeSketchImage
                    src={selectedSketch.imageUrl}
                    alt={selectedSketch.title}
                    className="object-cover object-top"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-1 pb-1 pt-3 pointer-events-none text-center">
                    <span className="text-[8px] font-mono tracking-wider uppercase text-white/60">
                      AI COMPOSITE
                    </span>
                  </div>
                </div>

                {/* Investigation Details */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="rounded-lg border border-border/50 bg-muted/20 p-2 sm:p-2.5 space-y-1">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground block">
                      Investigation File
                    </span>
                    <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
                      {selectedSketch.caseTitle || "Operation Apex: Downtown Transit Incident"}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono pt-0.5">
                      <Calendar className="size-3 shrink-0 opacity-70" />
                      <span>{selectedSketch.date}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row 2: Physical Markers Tags */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Tag className="size-3 text-muted-foreground/60 shrink-0" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                    Physical Markers
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {extractDescriptors(selectedSketch.prompt).map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center text-[10px] px-2 py-0.5 font-medium rounded-md border border-border/60 bg-muted/40 text-foreground/85"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Row 3: Witness Statement Quote */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <User className="size-3 text-muted-foreground/60 shrink-0" />
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
                      <span>{copiedPrompt ? "Copied" : "Copy"}</span>
                    </button>
                  )}
                </div>
                <div className="rounded-lg border border-border/50 border-l-2 border-l-[#665AEF] bg-muted/15 px-3 py-2">
                  <p className="text-[11px] text-foreground/80 leading-relaxed italic line-clamp-3 sm:line-clamp-4">
                    &ldquo;
                    {selectedSketch.prompt ||
                      "Witness provided visual facial reconstruction cues during cognitive interview."}
                    &rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 sm:px-5 py-3 border-t border-border/40 flex items-center justify-between gap-3 bg-muted/10">
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
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  selectedSketch &&
                  handleDownloadImage(
                    selectedSketch.imageUrl,
                    `composite_${selectedSketch.caseNumber || "portrait"}.png`
                  )
                }
                className="h-8 gap-1.5 text-xs font-medium cursor-pointer"
              >
                <Download className="size-3.5" />
                <span>Export</span>
              </Button>
              <Button
                size="sm"
                className="h-8 gap-1.5 bg-[#665AEF] hover:bg-[#5749DF] text-white cursor-pointer text-xs font-medium shadow-xs shadow-[#665AEF]/20"
                render={<Link href="/sketch" />}
                nativeButton={false}
              >
                <span>Open in Studio</span>
                <ExternalLink className="size-3" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
