"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ScanFace,
  UploadCloud,
  X,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Shield,
  RefreshCw,
  Sparkles,
  MapPin,
  Lock,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { searchCriminalsByPhotoAction } from "@/features/criminals/actions";
import { SuspectAvatar } from "./suspect-avatar";

interface OpticalCandidate {
  id: string;
  criminalId: string;
  name: string;
  alias: string | null;
  status: string;
  riskLevel: string;
  mugshotUrl: string;
  location: string;
  matchScore: number;
  matchPercent: string;
  slug: string;
  primaryCrime: string;
}

interface OpticalFaceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OpticalFaceSearchModal({
  isOpen,
  onClose,
}: OpticalFaceSearchModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [threshold, setThreshold] = useState<number>(80);
  const [candidates, setCandidates] = useState<OpticalCandidate[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setCandidates([]);
    setHasSearched(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleExecuteScan = async () => {
    if (!selectedFile) {
      toast.error("Please select a photo to execute biometric lookup.");
      return;
    }

    setIsScanning(true);
    setHasSearched(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await searchCriminalsByPhotoAction(formData);

      if (res.error) {
        toast.error(res.error);
        setCandidates([]);
      } else {
        const hits = (res.candidates || []) as OpticalCandidate[];
        setCandidates(hits);
        if (hits.length > 0) {
          toast.success(`Identified ${hits.length} ranked candidate matches.`, {
            description: `Top match: ${hits[0].name} (${hits[0].matchPercent}% similarity)`,
          });
        } else {
          toast.info("No biometric matches found in database.");
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to communicate with optical recognition engine.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCandidates([]);
    setHasSearched(false);
  };

  const filteredCandidates = candidates.filter(
    (c) => c.matchScore * 100 >= threshold
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-2xl"
      className="border-2 border-border/80 bg-black/95 backdrop-blur-2xl shadow-2xl rounded-2xl"
      title={
        <div className="flex items-start sm:items-center gap-2 sm:gap-2.5 min-w-0 pr-1">
          <ScanFace className="size-4.5 sm:size-5 text-[#665AEF] shrink-0 mt-0.5 sm:mt-0" />
          <div className="space-y-0.5 min-w-0 flex-1">
            <span className="text-sm sm:text-base font-semibold text-foreground tracking-tight block truncate">
              Optical Face Recognition Search
            </span>
            <span className="text-[11px] sm:text-xs text-muted-foreground font-normal block truncate">
              1:N Biometric facial feature matching
            </span>
          </div>
        </div>
      }
      footer={
        <div className="flex items-center justify-between w-full text-[11px] font-mono text-muted-foreground gap-2">
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <Lock className="size-3 text-emerald-400 shrink-0" />
            <span className="truncate text-[10px] sm:text-[11px]">
              Evidentiary protocol audit active
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8.5 sm:h-8 px-4 text-xs font-semibold rounded-lg border-2 border-border/80 hover:bg-muted text-foreground cursor-pointer shrink-0"
          >
            Close
          </Button>
        </div>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Top Dropzone / Preview Area */}
        {!previewUrl ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "relative border-2 border-dashed rounded-2xl p-8 sm:p-10 flex flex-col items-center justify-center text-center gap-3.5 cursor-pointer transition-all duration-200",
              isDragging
                ? "border-[#665AEF] bg-[#665AEF]/10 scale-[0.99]"
                : "border-border/80 bg-card/40 hover:bg-card/70 hover:border-[#665AEF]/50"
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />
            <div className="size-12 rounded-xl bg-[#665AEF]/15 border-2 border-[#665AEF]/30 flex items-center justify-center text-[#a594fd] shadow-inner">
              <UploadCloud className="size-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <p className="text-sm font-semibold text-foreground tracking-tight">
                Drop CCTV Snapshot or Scene Photo Here
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Supports JPG, PNG, WEBP files up to 25MB. Extracts 512D ArcFace facial embedding vectors automatically.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground px-3 py-1.5 rounded-lg bg-zinc-950/80 border-2 border-border/60 mt-0.5">
              <ScanFace className="size-3.5 text-[#665AEF]" />
              <span>Click to Browse Local File</span>
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border-2 border-border/80 bg-zinc-950/80 shadow-xs">
            {/* Image Preview with Cyber Laser Scanning HUD */}
            <div className="relative w-full sm:w-44 h-56 sm:h-auto sm:self-stretch rounded-xl overflow-hidden border-2 border-[#665AEF]/50 shrink-0 bg-black/60 shadow-md">
              <Image
                src={previewUrl}
                alt="Query Probe"
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 176px"
              />
              {/* Laser Scanning Animation */}
              {isScanning && (
                <motion.div
                  className="absolute left-0 right-0 h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee]"
                  animate={{ top: ["0%", "95%", "0%"] }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: "easeInOut",
                  }}
                />
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold bg-black/85 text-cyan-400 border-2 border-cyan-500/40 backdrop-blur-xs tracking-wider shadow-xs">
                PROBE
              </div>
            </div>

            {/* Probe Details & Execution Controls */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-border/40">
                <div className="space-y-0.5 min-w-0">
                  <div className="text-sm font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs tracking-tight">
                    {selectedFile?.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono flex items-center gap-1.5">
                    <span>{Math.round((selectedFile?.size || 0) / 1024)} KB</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-medium">Probe Loaded</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="size-7.5 rounded-lg border-2 border-border/60 hover:border-destructive/60 hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer transition-all shrink-0"
                  title="Remove probe image"
                >
                  <X className="size-3.5" />
                </Button>
              </div>

              {/* Threshold Selection Tabs */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground tracking-tight">
                    Match Sensitivity Gate:
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    Min. Threshold: <span className="text-[#a594fd] font-semibold">≥{threshold}%</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl bg-background/60 border-2 border-border/80 shadow-inner">
                  {[
                    { val: 85, label: "Strict", sub: "≥ 85%" },
                    { val: 75, label: "Medium", sub: "≥ 75%" },
                    { val: 60, label: "Broad", sub: "≥ 60%" },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setThreshold(t.val)}
                      className={cn(
                        "h-8.5 sm:h-9 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 text-center",
                        threshold === t.val
                          ? "bg-[#665AEF] text-white shadow-xs font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                      )}
                    >
                      <span>{t.label}</span>
                      <span
                        className={cn(
                          "text-[10px] font-mono",
                          threshold === t.val ? "text-white/80" : "text-muted-foreground/70"
                        )}
                      >
                        ({t.sub})
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleExecuteScan}
                  disabled={isScanning}
                  className="h-9.5 px-4 text-xs font-semibold bg-[#665AEF] hover:bg-[#5748e6] text-white gap-2 cursor-pointer shadow-xs rounded-xl transition-all"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Scanning Database...</span>
                    </>
                  ) : (
                    <>
                      <ScanFace className="size-4" />
                      <span>Execute Biometric Lookup</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-9.5 px-3.5 text-xs font-medium rounded-xl border-2 border-border/80 hover:bg-muted/60 text-foreground cursor-pointer transition-all"
                >
                  Change Photo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Results Area */}
        <AnimatePresence mode="wait">
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-10 px-4 flex flex-col items-center justify-center gap-3 text-center border-2 rounded-2xl border-border/70 bg-card/40"
            >
              <div className="relative size-12 flex items-center justify-center">
                <div className="size-12 rounded-full border-2 border-[#665AEF] border-t-transparent animate-spin" />
                <ScanFace className="size-5 text-[#665AEF] absolute inset-0 m-auto" />
              </div>
              <div className="space-y-1 max-w-sm">
                <p className="text-xs font-semibold text-foreground">
                  Analyzing Biometric Landmark Geometry
                </p>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Calculating cosine distance across enrolled subject gallery...
                </p>
              </div>
            </motion.div>
          )}

          {!isScanning && hasSearched && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3 pt-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-foreground tracking-tight">
                    Ranked Identity Matches ({filteredCandidates.length})
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-mono text-muted-foreground border-border/70 px-2 py-0.5"
                >
                  Threshold: ≥{threshold}% Cosine Similarity
                </Badge>
              </div>

              {filteredCandidates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                  {filteredCandidates.map((c) => (
                    <Link
                      key={c.id}
                      href={`/dashboard/criminals/${c.slug}`}
                      onClick={onClose}
                      className="group p-3 rounded-xl border-2 border-border/80 bg-card/60 hover:bg-card hover:border-[#665AEF]/70 transition-all flex items-center gap-3 shadow-xs cursor-pointer"
                    >
                      <div className="relative shrink-0">
                        <SuspectAvatar
                          mugshotUrl={c.mugshotUrl}
                          name={c.name}
                          size="md"
                          className="size-12 rounded-lg border border-border/80 group-hover:border-[#665AEF]/50 transition-colors"
                        />
                        <span
                          className={cn(
                            "absolute -bottom-1 -right-1 size-2.5 rounded-full border border-background",
                            c.status === "WANTED"
                              ? "bg-rose-500"
                              : c.status === "ACTIVE"
                              ? "bg-emerald-500"
                              : "bg-neutral-500"
                          )}
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-semibold text-foreground group-hover:text-[#a594fd] transition-colors truncate">
                            {c.name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-cyan-400 shrink-0">
                            {c.matchPercent}%
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                          <span className="font-mono text-[#a594fd] font-semibold">
                            {c.criminalId}
                          </span>
                          {c.alias && (
                            <span className="italic truncate">"{c.alias}"</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 pt-0.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[9px] uppercase px-1 py-0 h-4 font-mono",
                              c.riskLevel === "CRITICAL"
                                ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                : c.riskLevel === "HIGH"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            )}
                          >
                            {c.riskLevel}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground truncate flex items-center gap-0.5">
                            <MapPin className="size-2.5 shrink-0 text-muted-foreground" />
                            {c.location}
                          </span>
                        </div>
                      </div>

                      <ArrowRight className="size-4 text-muted-foreground/40 group-hover:text-[#a594fd] group-hover:translate-x-0.5 transition-all shrink-0" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 px-4 flex flex-col items-center justify-center text-center gap-2.5 border-2 border-dashed rounded-2xl border-border/60 bg-muted/10">
                  <div className="size-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <AlertTriangle className="size-5" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">
                    No Matches Exceeding {threshold}% Confidence
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-sm leading-relaxed">
                    Try lowering the sensitivity threshold to "Broad (≥ 60%)" or uploading a clearer, forward-facing frontal photograph.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
