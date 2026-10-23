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
      maxWidth="max-w-3xl"
      title={
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-[#665AEF]/20 text-[#a594fd] border border-[#665AEF]/30">
            <ScanFace className="size-4.5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground tracking-tight">
              Optical Face Recognition Search
            </h3>
            <p className="text-[11px] text-muted-foreground font-normal">
              1:N Biometric facial feature matching across all enrolled suspect records
            </p>
          </div>
        </div>
      }
      description=""
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
              "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 cursor-pointer transition-all duration-200",
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
            <div className="size-12 rounded-full bg-[#665AEF]/15 border border-[#665AEF]/30 flex items-center justify-center text-[#a594fd]">
              <UploadCloud className="size-6" />
            </div>
            <div className="space-y-1 max-w-sm">
              <p className="text-sm font-semibold text-foreground">
                Drop CCTV Snapshot or Scene Photo Here
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, WEBP files up to 25MB. Extracts 512D ArcFace facial embedding vectors automatically.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground px-2.5 py-1 rounded-md bg-muted/50 border border-border/50 mt-1">
              <ScanFace className="size-3 text-[#665AEF]" />
              <span>Click to Browse Local File</span>
            </span>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 p-4 rounded-xl border border-border/80 bg-card/60">
            {/* Image Preview with Cyber Laser Scanning HUD */}
            <div className="relative size-32 sm:size-36 rounded-xl overflow-hidden border-2 border-[#665AEF]/50 shrink-0 bg-black/60 shadow-lg mx-auto sm:mx-0">
              <Image
                src={previewUrl}
                alt="Query Probe"
                fill
                className="object-cover"
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
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/70 text-cyan-400 border border-cyan-500/30">
                PROBE
              </div>
            </div>

            {/* Probe Details & Execution Controls */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-sm font-semibold text-foreground truncate max-w-xs">
                    {selectedFile?.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-mono">
                    {Math.round((selectedFile?.size || 0) / 1024)} KB · Image Probe Loaded
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className="size-7 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Remove image"
                >
                  <X className="size-4" />
                </Button>
              </div>

              {/* Threshold Selection Tabs */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-foreground">
                  Match Sensitivity Gate:
                </label>
                <div className="flex items-center gap-2">
                  {[
                    { val: 85, label: "Strict (≥ 85%)" },
                    { val: 75, label: "Medium (≥ 75%)" },
                    { val: 60, label: "Broad (≥ 60%)" },
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setThreshold(t.val)}
                      className={cn(
                        "flex-1 py-1.5 px-2 rounded-md text-[11px] font-medium border transition-colors cursor-pointer",
                        threshold === t.val
                          ? "bg-[#665AEF]/20 border-[#665AEF] text-[#a594fd] font-semibold"
                          : "bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleExecuteScan}
                  disabled={isScanning}
                  className="h-8 px-4 text-xs font-semibold bg-[#665AEF] hover:bg-[#5749DF] text-white gap-1.5 cursor-pointer shadow-md"
                >
                  {isScanning ? (
                    <>
                      <RefreshCw className="size-3.5 animate-spin" />
                      <span>Scanning Database...</span>
                    </>
                  ) : (
                    <>
                      <ScanFace className="size-3.5" />
                      <span>Execute Biometric Lookup</span>
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
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
              className="py-12 flex flex-col items-center justify-center gap-3 text-center border rounded-xl border-border/60 bg-muted/10"
            >
              <div className="relative">
                <div className="size-10 rounded-full border-2 border-[#665AEF] border-t-transparent animate-spin" />
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
              className="space-y-3 pt-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="size-4 text-cyan-400" />
                  <span className="text-xs font-semibold text-foreground">
                    Ranked Identity Matches ({filteredCandidates.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground">
                  Threshold: ≥{threshold}% Cosine Similarity
                </span>
              </div>

              {filteredCandidates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {filteredCandidates.map((c) => (
                    <Link
                      key={c.id}
                      href={`/dashboard/criminals/${c.slug}`}
                      onClick={onClose}
                      className="group p-3 rounded-xl border border-border/70 bg-card/50 hover:bg-card/90 hover:border-[#665AEF]/60 transition-all flex items-start gap-3 shadow-xs cursor-pointer"
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

                      <ArrowRight className="size-3.5 text-muted-foreground/40 group-hover:text-[#a594fd] group-hover:translate-x-0.5 transition-all shrink-0 self-center" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 flex flex-col items-center justify-center text-center gap-2 border border-dashed rounded-xl border-border/60 bg-muted/10">
                  <AlertTriangle className="size-6 text-amber-400" />
                  <p className="text-xs font-semibold text-foreground">
                    No Matches Exceeding {threshold}% Confidence
                  </p>
                  <p className="text-[11px] text-muted-foreground max-w-sm">
                    Try lowering the sensitivity threshold to "Broad (≥ 60%)" or uploading a clearer, forward-facing frontal photograph.
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Security Seal Footnote */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40 text-[10px] font-mono text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Lock className="size-3 text-emerald-400 shrink-0" />
            <span>Biometric probes are signed and audited under Law Enforcement evidentiary protocols.</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs rounded-md h-7 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}
