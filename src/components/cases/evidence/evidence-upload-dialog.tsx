"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  FileUp,
  X,
  ChevronDown,
  Check,
  AlertCircle,
  FileVideo,
  FileImage,
  FileAudio,
  FileText,
  File,
  Shield,
} from "lucide-react";
import { cn } from "cn";
import { toast } from "sonner";
import { useMediaDrop } from "react-mediadrop";
import {
  TIGRIS_UPLOAD_LIMITS,
  ALL_ALLOWED_MIME_TYPES,
  tigrisEvidenceValidator,
} from "@/lib/evidence-upload-config";
import type { EvidenceItem, EvidenceType, EvidenceSource } from "./types";

interface EvidenceUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddEvidence: (item: EvidenceItem) => void;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function inferEvidenceType(name: string, mime?: string): EvidenceType {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const type = (mime || "").toLowerCase();

  if (type.startsWith("video/") || ["mp4", "mkv", "avi", "mov", "webm", "m4v"].includes(ext)) {
    return "Video";
  }
  if (type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext)) {
    return "Image";
  }
  if (type.startsWith("audio/") || ["mp3", "wav", "m4a", "ogg", "flac"].includes(ext)) {
    return "Audio";
  }
  return "Document";
}

function getEvidenceIcon(name: string, mime?: string) {
  const ext = name.split(".").pop()?.toLowerCase() || "";
  const type = (mime || "").toLowerCase();

  if (type.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
    return <FileImage className="size-4 text-emerald-500 shrink-0" />;
  }
  if (type.startsWith("video/") || ["mp4", "mkv", "avi", "mov", "webm"].includes(ext)) {
    return <FileVideo className="size-4 text-sky-500 shrink-0" />;
  }
  if (type.startsWith("audio/") || ["mp3", "wav", "m4a", "ogg"].includes(ext)) {
    return <FileAudio className="size-4 text-purple-500 shrink-0" />;
  }
  if (type.includes("pdf") || ["pdf", "doc", "docx", "txt"].includes(ext)) {
    return <FileText className="size-4 text-amber-500 shrink-0" />;
  }
  return <File className="size-4 text-muted-foreground shrink-0" />;
}

function getThumbnailType(type: EvidenceType) {
  switch (type) {
    case "Video":
      return "cctv" as const;
    case "Document":
      return "document" as const;
    case "Audio":
      return "audio" as const;
    case "Image":
    default:
      return "suspect" as const;
  }
}

export function EvidenceUploadDialog({
  open,
  onOpenChange,
  onAddEvidence,
}: EvidenceUploadDialogProps) {
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<EvidenceType>("Video");
  const [source, setSource] = useState<EvidenceSource>("CCTV");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredFileType, setHoveredFileType] = useState<string | null>(null);
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  // Integrate react-mediadrop drag and drop with Tigris 5GB quota conditions
  const {
    acceptedFiles,
    rejectedFiles,
    getRootProps,
    getInputProps,
    isFocused,
    isDragActive,
    isDragAccept,
    isDragReject,
    open: openFileDialog,
    removeFile,
    clearFiles,
  } = useMediaDrop({
    restrictions: {
      accept: ALL_ALLOWED_MIME_TYPES,
      maxFiles: TIGRIS_UPLOAD_LIMITS.MAX_BATCH_FILES, // 3 files
      maxSize: TIGRIS_UPLOAD_LIMITS.VIDEO.maxSizeBytes, // 40 MB ceiling
      minSize: TIGRIS_UPLOAD_LIMITS.MIN_FILE_SIZE_BYTES, // 100 Bytes
    },
    validator: tigrisEvidenceValidator,
  });

  // Whenever user drops or selects new files, auto-detect metadata
  useEffect(() => {
    if (acceptedFiles.length > 0) {
      const latest = acceptedFiles[acceptedFiles.length - 1];
      setFileName(latest.name);
      setFileType(inferEvidenceType(latest.name, latest.type));
    }
  }, [acceptedFiles]);

  // Clean state when modal closes
  useEffect(() => {
    if (!open) {
      clearFiles();
      setFileName("");
      setDescription("");
      setIsSubmitting(false);
    }
  }, [open, clearFiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fileName.trim() && acceptedFiles.length === 0) {
      toast.error("Please drop an evidence file or enter a file name");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // If multiple files were dropped, register each one
      if (acceptedFiles.length > 1) {
        acceptedFiles.forEach((file, index) => {
          const detectedType = inferEvidenceType(file.name, file.type);
          const newItem: EvidenceItem = {
            id: String(Math.floor(Math.random() * 900) + 100 + index),
            name: file.name,
            description: description.trim() || `Field acquired forensic evidence file: ${file.name}`,
            type: detectedType,
            source: source,
            addedBy: {
              name: "Arjun Karthik",
              avatar: "/images/avatar-investigator.jpg",
              initials: "AK",
            },
            dateAdded: new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
            timeAdded: new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }),
            status: "Under Review",
            fileSize: formatBytes(file.size),
            hash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
            location: "/evidence/2026/fx-184/uploads/",
            thumbnailType: getThumbnailType(detectedType),
            previewImage: detectedType === "Image" ? "/images/cctv-suspect.jpg" : undefined,
            fullDescription: description.trim() || "Uploaded to secure forensic chain of custody repository.",
            aiAnalysis: {
              score: Math.floor(Math.random() * 20 + 75),
              title: "Initial AI Telemetry Analyzed",
              subtitle: "Automated forensic pipeline verified integrity hash and media markers.",
              attributes: [
                "SHA-256 Validated",
                "Exif Metadata Intact",
                "Resolution Checked",
                "Added to Index",
              ],
            },
          };
          onAddEvidence(newItem);
        });

        setIsSubmitting(false);
        onOpenChange(false);
        clearFiles();
        toast.success(`${acceptedFiles.length} forensic files registered successfully`);
        return;
      }

      // Single file or manual entry
      const singleFile = acceptedFiles[0];
      const finalName = fileName.trim() || (singleFile ? singleFile.name : "Evidence_File.mp4");
      const finalType = singleFile ? inferEvidenceType(singleFile.name, singleFile.type) : fileType;
      const finalSize = singleFile ? formatBytes(singleFile.size) : `${(Math.random() * 50 + 2).toFixed(1)} MB`;

      const newItem: EvidenceItem = {
        id: String(Math.floor(Math.random() * 90) + 10),
        name: finalName.includes(".") ? finalName : `${finalName}.mp4`,
        description: description.trim() || "Field acquired forensic evidence file",
        type: finalType,
        source: source,
        addedBy: {
          name: "Arjun Karthik",
          avatar: "/images/avatar-investigator.jpg",
          initials: "AK",
        },
        dateAdded: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        timeAdded: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        status: "Under Review",
        fileSize: finalSize,
        hash: `${Math.random().toString(36).substring(2, 6)}...${Math.random().toString(36).substring(2, 6)}`,
        location: "/evidence/2026/fx-184/uploads/",
        thumbnailType: getThumbnailType(finalType),
        previewImage: finalType === "Image" ? "/images/cctv-suspect.jpg" : undefined,
        fullDescription: description.trim() || "Uploaded to secure forensic chain of custody repository.",
        aiAnalysis: {
          score: Math.floor(Math.random() * 20 + 75),
          title: "Initial AI Telemetry Analyzed",
          subtitle: "Automated forensic pipeline verified integrity hash and media markers.",
          attributes: [
            "SHA-256 Validated",
            "Exif Metadata Intact",
            "Resolution Checked",
            "Added to Index",
          ],
        },
      };

      onAddEvidence(newItem);
      setIsSubmitting(false);
      onOpenChange(false);
      clearFiles();
      setFileName("");
      setDescription("");
      toast.success(`Evidence ${newItem.name} registered successfully`);
    }, 600);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-md border-2 border-border/80 text-foreground p-6 gap-0 shadow-2xl">
        <DialogHeader className="pb-4 space-y-1 pr-6">
          <DialogTitle className="text-base font-bold font-heading text-foreground tracking-tight">
            Upload Forensic Evidence
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Attach digital evidence into the tamper-evident chain of custody vault.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* Drag and Drop Zone with react-mediadrop */}
          <div className="space-y-2">
            <div
              {...getRootProps()}
              className={cn(
                "cursor-pointer rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all duration-200 select-none",
                isDragAccept
                  ? "border-green-500 bg-green-500/10 ring-2 ring-green-500/20 scale-[1.01]"
                  : isDragReject
                  ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/20 scale-[1.01]"
                  : isDragActive
                  ? "border-[#665AEF] bg-[#665AEF]/10 ring-2 ring-[#665AEF]/20 scale-[1.01]"
                  : isFocused
                  ? "border-[#665AEF] ring-2 ring-[#665AEF]/20 bg-muted/30"
                  : "border-border/80 bg-muted/20 hover:bg-muted/35 hover:border-[#665AEF]/50 text-foreground"
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center gap-2.5">
                <div
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center transition-transform duration-200",
                    isDragAccept
                      ? "bg-green-500/20 text-green-500 scale-110"
                      : isDragReject
                      ? "bg-red-500/20 text-red-500 scale-110"
                      : isDragActive
                      ? "bg-[#665AEF]/20 text-[#665AEF] scale-110"
                      : isFocused
                      ? "bg-[#665AEF]/20 text-[#665AEF] scale-105"
                      : "bg-[#665AEF]/10 text-[#665AEF]"
                  )}
                >
                  <FileUp className="size-4.5" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
                    {isDragAccept
                      ? "Release to attach evidence files"
                      : isDragReject
                      ? "File too large or format not supported"
                      : isDragActive
                      ? "Drop files here to attach"
                      : "Drag files here, or click to browse"}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-x-2 text-[11px] font-medium text-muted-foreground pt-0.5">
                    <span>Photos up to 5 MB</span>
                    <span className="text-muted-foreground/35">•</span>
                    <span>Videos up to 40 MB</span>
                    <span className="text-muted-foreground/35">•</span>
                    <span>Audio &amp; Docs up to 10 MB</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground/65">
                    Supports JPG, PNG, WebP, MP4, WebM, MP3, WAV, PDF (max 3 files)
                  </p>
                </div>
              </div>
            </div>

            {/* Error notifications for rejected files */}
            {rejectedFiles.length > 0 && (
              <ul className="space-y-1.5">
                {rejectedFiles.map((file) => (
                  <li
                    key={file.id}
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400"
                  >
                    <span className="font-medium">{file.name}</span> — {formatBytes(file.size)} ·{" "}
                    {file.errors.map((e) => `${e.code ? `[${e.code}] ` : ""}${e.message}`).join(", ")}
                  </li>
                ))}
              </ul>
            )}

            {/* Dropped files preview list */}
            {acceptedFiles.length > 0 && (
              <div className="space-y-1.5 pt-0.5">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                  <span className="font-medium text-foreground">
                    Attached Files ({acceptedFiles.length})
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearFiles();
                      setFileName("");
                    }}
                    className="text-[11px] text-muted-foreground hover:text-foreground cursor-pointer underline"
                  >
                    Clear all
                  </button>
                </div>
                <ul className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {acceptedFiles.map((file) => (
                    <li
                      key={file.id}
                      className="flex flex-col gap-1 rounded-lg border border-border/80 bg-background/70 px-3 py-2 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getEvidenceIcon(file.name, file.type)}
                          <div className="min-w-0">
                            <p className="font-medium text-foreground truncate max-w-[220px] sm:max-w-[280px]">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatBytes(file.size)} · {isSubmitting ? "Uploading..." : "Ready"}
                            </p>
                          </div>
                        </div>
                        {!isSubmitting && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile(file.id);
                            }}
                            className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors cursor-pointer"
                            title="Remove file"
                          >
                            <X className="size-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Upload progress indicator when submitting */}
                      {isSubmitting && (
                        <progress
                          className="h-1 w-full rounded accent-[#665AEF]"
                          value={85}
                          max={100}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* File Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90 block">
              Evidence Identifier / File Name <span className="text-[#665AEF]">*</span>
            </label>
            <Input
              required={acceptedFiles.length <= 1}
              placeholder="e.g. CCTV_Alleyway_Exit_03.mp4"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="h-9 text-xs bg-background/60 border-2 border-border/80 focus-visible:ring-1 focus-visible:ring-[#665AEF] rounded-lg px-3 placeholder:text-muted-foreground/45"
            />
            {acceptedFiles.length > 1 && (
              <p className="text-[11px] text-muted-foreground">
                Multiple files attached. Each will retain its original file name.
              </p>
            )}
          </div>

          {/* Type & Source Row */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Media Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90 block">Media Type</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="w-full h-9 px-3 rounded-lg border-2 border-border/80 bg-background/60 text-xs text-foreground flex items-center justify-between gap-2 hover:bg-muted/40 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#665AEF]"
                >
                  <span className="truncate">{fileType}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground shrink-0 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="w-(--anchor-width) min-w-[140px] text-xs bg-card/95 backdrop-blur-xl border-2 border-border p-1 shadow-xl z-[100] overflow-hidden"
                  onPointerLeave={() => setHoveredFileType(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-0.5"
                  >
                    {(["Video", "Image", "Document", "Audio"] as EvidenceType[]).map((type) => (
                      <DropdownMenuItem
                        key={type}
                        onPointerEnter={() => setHoveredFileType(type)}
                        onClick={() => setFileType(type)}
                        className="relative z-0 group flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer text-xs transition-colors hover:!bg-transparent focus:!bg-transparent text-foreground"
                      >
                        {hoveredFileType === type && (
                          <motion.div
                            layoutId="evidence-upload-file-type-hover"
                            className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                            transition={{
                              type: "spring",
                              bounce: 0.3,
                              duration: 0.4,
                            }}
                          />
                        )}
                        <span className={cn(fileType === type && "font-semibold text-foreground")}>{type}</span>
                        {fileType === type && <Check className="size-3.5 text-[#665AEF] shrink-0" />}
                      </DropdownMenuItem>
                    ))}
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Source */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground/90 block">Source</label>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="w-full h-9 px-3 rounded-lg border-2 border-border/80 bg-background/60 text-xs text-foreground flex items-center justify-between gap-2 hover:bg-muted/40 transition-colors cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#665AEF]"
                >
                  <span className="truncate">{source}</span>
                  <ChevronDown className="size-3.5 text-muted-foreground shrink-0 opacity-70" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  side="bottom"
                  sideOffset={4}
                  className="w-(--anchor-width) min-w-[140px] text-xs bg-card/95 backdrop-blur-xl border-2 border-border p-1 shadow-xl z-[100] overflow-hidden"
                  onPointerLeave={() => setHoveredSource(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: -6 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-0.5"
                  >
                    {(["CCTV", "Crime Scene", "Investigator", "Phone Record"] as EvidenceSource[]).map((src) => (
                      <DropdownMenuItem
                        key={src}
                        onPointerEnter={() => setHoveredSource(src)}
                        onClick={() => setSource(src)}
                        className="relative z-0 group flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer text-xs transition-colors hover:!bg-transparent focus:!bg-transparent text-foreground"
                      >
                        {hoveredSource === src && (
                          <motion.div
                            layoutId="evidence-upload-source-hover"
                            className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                            transition={{
                              type: "spring",
                              bounce: 0.3,
                              duration: 0.4,
                            }}
                          />
                        )}
                        <span className={cn(source === src && "font-semibold text-foreground")}>{src}</span>
                        {source === src && <Check className="size-3.5 text-[#665AEF] shrink-0" />}
                      </DropdownMenuItem>
                    ))}
                  </motion.div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Brief Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground/90 block">
              Investigative Description / Notes
            </label>
            <Textarea
              rows={2}
              placeholder="Provide context regarding recovery location, timestamp or relevancy..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[68px] text-xs bg-background/60 border-2 border-border/80 resize-none rounded-lg px-3 py-2.5 leading-relaxed focus-visible:ring-1 focus-visible:ring-[#665AEF] placeholder:text-muted-foreground/45"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-4 mt-2 border-t border-border/60 flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs font-medium rounded-lg cursor-pointer hover:bg-muted/60 border-2 border-border/80"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="h-9 px-4.5 bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold rounded-lg shadow-xs shadow-[#665AEF]/25 cursor-pointer"
            >
              {isSubmitting
                ? "Uploading..."
                : acceptedFiles.length > 1
                ? `Save ${acceptedFiles.length} Evidence Files`
                : "Save Evidence"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
