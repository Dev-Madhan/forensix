"use client";

import React from "react";
import {
  UploadCloud,
  FileVideo,
  FileImage,
  FileAudio,
  FileText,
  File,
  X,
  AlertCircle,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useMediaDrop } from "react-mediadrop";
import {
  TIGRIS_UPLOAD_LIMITS,
  ALL_ALLOWED_MIME_TYPES,
  tigrisEvidenceValidator,
  getFileCategory,
} from "@/lib/evidence-upload-config";
import { cn } from "@/lib/utils";

export interface ExistingEvidenceItem {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt?: string | Date;
}

interface CaseEvidenceUploadSectionProps {
  stagedFiles: File[];
  onStagedFilesChange: (files: File[]) => void;
  existingEvidence?: ExistingEvidenceItem[];
  onDeleteExisting?: (id: string) => void;
  disabled?: boolean;
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getCategoryIcon(mimeOrName: string) {
  const category = getFileCategory(mimeOrName);
  switch (category) {
    case "IMAGE":
      return <FileImage className="size-4 text-emerald-400 shrink-0" />;
    case "VIDEO":
      return <FileVideo className="size-4 text-sky-400 shrink-0" />;
    case "AUDIO":
      return <FileAudio className="size-4 text-purple-400 shrink-0" />;
    case "DOCUMENT":
      return <FileText className="size-4 text-amber-400 shrink-0" />;
    default:
      return <File className="size-4 text-muted-foreground shrink-0" />;
  }
}

function getCategoryLabel(mimeOrName: string): string {
  const category = getFileCategory(mimeOrName);
  switch (category) {
    case "IMAGE":
      return "Photo / Image";
    case "VIDEO":
      return "Surveillance Video";
    case "AUDIO":
      return "Audio Recording";
    case "DOCUMENT":
      return "Forensic Document";
    default:
      return "Evidence File";
  }
}

export function CaseEvidenceUploadSection({
  stagedFiles,
  onStagedFilesChange,
  existingEvidence = [],
  onDeleteExisting,
  disabled = false,
}: CaseEvidenceUploadSectionProps) {
  const {
    acceptedFiles,
    rejectedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
  } = useMediaDrop({
    restrictions: {
      accept: ALL_ALLOWED_MIME_TYPES,
      maxFiles: 5,
      maxSize: TIGRIS_UPLOAD_LIMITS.VIDEO.maxSizeBytes, // 40 MB ceiling
      minSize: TIGRIS_UPLOAD_LIMITS.MIN_FILE_SIZE_BYTES, // 100 Bytes
    },
    validator: tigrisEvidenceValidator,
  });

  // Sync accepted files into stagedFiles list, avoiding duplicates
  React.useEffect(() => {
    if (acceptedFiles.length > 0) {
      const newFiles: File[] = [];
      acceptedFiles.forEach((mf: any) => {
        const file = (mf?.file instanceof File ? mf.file : (mf instanceof File ? mf : null)) as File | null;
        if (file) {
          const alreadyExists = stagedFiles.some(
            (sf: File) => sf.name === file.name && sf.size === file.size
          );
          if (!alreadyExists) {
            newFiles.push(file);
          }
        }
      });
      if (newFiles.length > 0) {
        onStagedFilesChange([...stagedFiles, ...newFiles]);
      }
    }
  }, [acceptedFiles]);

  const handleRemoveStaged = (indexToRemove: number) => {
    onStagedFilesChange(stagedFiles.filter((_, idx) => idx !== indexToRemove));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const incoming = Array.from(e.target.files);
      const validFiles: File[] = [];
      incoming.forEach((file) => {
        const err = tigrisEvidenceValidator(file);
        if (!err) {
          const exists = stagedFiles.some(
            (sf) => sf.name === file.name && sf.size === file.size
          );
          if (!exists) validFiles.push(file);
        }
      });
      if (validFiles.length > 0) {
        onStagedFilesChange([...stagedFiles, ...validFiles]);
      }
      e.target.value = "";
    }
  };

  return (
    <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
        <div className="flex items-center gap-2.5 min-w-0">
          <UploadCloud className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
          <div className="min-w-0">
            <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
              Evidence Files & Forensic Media
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
              Attach scene photography, CCTV clips, wiretaps, or lab reports to this case dossier.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5">
        {/* Forensic Categories Guidance Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
              <FileImage className="size-3.5 text-emerald-400 shrink-0" />
              <span>Photos & Stills</span>
            </div>
            <p className="text-[10px] text-muted-foreground">JPG, PNG, WEBP (Max 5 MB)</p>
          </div>

          <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
              <FileVideo className="size-3.5 text-sky-400 shrink-0" />
              <span>CCTV & Videos</span>
            </div>
            <p className="text-[10px] text-muted-foreground">MP4, WEBM (Max 40 MB)</p>
          </div>

          <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
              <FileAudio className="size-3.5 text-purple-400 shrink-0" />
              <span>Audio Wiretaps</span>
            </div>
            <p className="text-[10px] text-muted-foreground">MP3, WAV, M4A (Max 10 MB)</p>
          </div>

          <div className="p-2.5 rounded-lg border border-border/60 bg-muted/20 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-foreground text-[11px]">
              <FileText className="size-3.5 text-amber-400 shrink-0" />
              <span>Lab & Reports</span>
            </div>
            <p className="text-[10px] text-muted-foreground">PDF, DOCX, TXT, CSV (Max 10 MB)</p>
          </div>
        </div>

        {/* Drag-and-Drop Media Zone */}
        <div
          {...getRootProps()}
          className={cn(
            "relative flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl border-2 border-dashed transition-all cursor-pointer select-none text-center group",
            isDragActive && !isDragReject && "border-[#665AEF] bg-[#665AEF]/10 scale-[0.99]",
            isDragReject && "border-rose-500 bg-rose-500/10",
            !isDragActive && "border-border/80 bg-muted/10 hover:bg-muted/25 hover:border-[#665AEF]/60",
            disabled && "opacity-50 pointer-events-none"
          )}
        >
          <input {...getInputProps()} onChange={handleFileInputChange} />

          <div className="size-11 sm:size-12 rounded-full bg-[#665AEF]/10 group-hover:bg-[#665AEF]/20 text-[#665AEF] flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110">
            <UploadCloud className="size-5 sm:size-6" />
          </div>

          <p className="text-xs sm:text-sm font-semibold text-foreground">
            {isDragActive
              ? isDragReject
                ? "File type or size not supported"
                : "Drop evidence files here..."
              : "Drag & drop evidence files, or click to browse"}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Automated SHA-256 integrity hash & media classification upon upload.
          </p>
        </div>

        {/* Rejection Feedback */}
        {rejectedFiles && rejectedFiles.length > 0 && (
          <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="size-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Files could not be accepted:</span>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200/90">
                {rejectedFiles.map((rf: any, idx: number) => (
                  <li key={idx}>
                    {rf.file?.name || rf.name || "File"}: {rf.errors?.[0]?.message || "Exceeds storage limit or invalid format."}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Staged New Files List */}
        {stagedFiles.length > 0 && (
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span>Files to Attach ({stagedFiles.length})</span>
              <span className="text-[11px] font-normal lowercase">
                Total: {formatBytes(stagedFiles.reduce((acc, f) => acc + f.size, 0))}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {stagedFiles.map((file, idx) => (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border-2 border-border/80 bg-card/60 gap-3 shadow-2xs group hover:border-[#665AEF]/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getCategoryIcon(file.type || file.name)}
                    <div className="min-w-0">
                      <span className="text-xs sm:text-sm font-medium text-foreground block truncate">
                        {file.name}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{formatBytes(file.size)}</span>
                        <span>•</span>
                        <span>{getCategoryLabel(file.type || file.name)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveStaged(idx)}
                    disabled={disabled}
                    className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-pointer shrink-0"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Evidence List (in Edit Mode) */}
        {existingEvidence && existingEvidence.length > 0 && (
          <div className="space-y-2 pt-2 border-t-2 border-border/40">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span>Currently Linked Case Evidence ({existingEvidence.length})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {existingEvidence.map((ev) => (
                <div
                  key={ev.id}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-lg border-2 border-border/80 bg-card/40 gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getCategoryIcon(ev.mimeType || ev.fileName)}
                    <div className="min-w-0">
                      <span className="font-medium text-foreground block truncate">
                        {ev.fileName}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span>{formatBytes(ev.fileSize)}</span>
                        <span>•</span>
                        <span>{getCategoryLabel(ev.mimeType || ev.fileName)}</span>
                        {ev.uploadedAt && (
                          <>
                            <span>•</span>
                            <span>{new Date(ev.uploadedAt).toLocaleDateString()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {onDeleteExisting && (
                    <button
                      type="button"
                      onClick={() => onDeleteExisting(ev.id)}
                      disabled={disabled}
                      className="p-1 rounded-md text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                      title="Remove evidence"
                    >
                      <X className="size-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
