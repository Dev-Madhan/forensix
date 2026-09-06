"use client";

import React, { useState } from "react";
import { uploadEvidence } from "@/features/evidence/actions";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, FileUp, X, AlertCircle } from "lucide-react";
import { useMediaDrop } from "react-mediadrop";
import { cn } from "cn";
import { formatFileSize, getFileIcon } from "@/components/ui/media-drop-zone";
import {
  TIGRIS_UPLOAD_LIMITS,
  ALL_ALLOWED_MIME_TYPES,
  tigrisEvidenceValidator,
} from "@/lib/evidence-upload-config";

export function UploadEvidenceForm({ caseId }: { caseId: string }) {
  const [loading, setLoading] = useState(false);

  const {
    acceptedFiles,
    rejectedFiles,
    getRootProps,
    getInputProps,
    isDragActive,
    removeFile,
    clearFiles,
  } = useMediaDrop({
    restrictions: {
      maxFiles: 1,
      maxSize: TIGRIS_UPLOAD_LIMITS.VIDEO.maxSizeBytes, // 40MB ceiling
      minSize: TIGRIS_UPLOAD_LIMITS.MIN_FILE_SIZE_BYTES,
      accept: ALL_ALLOWED_MIME_TYPES,
    },
    validator: tigrisEvidenceValidator,
  });

  const selectedFile = acceptedFiles[0]?.file;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error("Please select or drop a file to upload");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("caseId", caseId);
    formData.append("file", selectedFile);

    const res = await uploadEvidence(formData);

    if (res?.error) {
      toast.error(res.error);
    } else {
      toast.success("Evidence uploaded successfully");
      clearFiles();
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 rounded-xl border border-border/80 p-4 bg-muted/20">
      <div className="space-y-2">
        <Label className="font-semibold text-foreground text-sm">Upload Evidence File</Label>

        <div
          {...getRootProps()}
          className={cn(
            "cursor-pointer rounded-xl border-2 border-dashed px-5 py-6 text-center transition-all duration-200 select-none",
            "border-border/80 bg-background/50 hover:bg-muted/40 hover:border-[#665AEF]/50 text-foreground",
            isDragActive && "border-[#665AEF] bg-[#665AEF]/10 ring-2 ring-[#665AEF]/20 scale-[1.01]"
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2">
            <div
              className={cn(
                "size-10 rounded-full flex items-center justify-center transition-transform duration-200",
                isDragActive ? "bg-[#665AEF]/20 text-[#665AEF] scale-110" : "bg-[#665AEF]/10 text-[#665AEF]"
              )}
            >
              <FileUp className="size-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-foreground">
                {isDragActive ? "Drop file to attach" : "Drag file here, or click to browse"}
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Photos up to 5 MB · Videos up to 40 MB · Audio & Docs up to 10 MB
              </p>
            </div>
          </div>
        </div>

        {/* Rejected Files */}
        {rejectedFiles.length > 0 && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-2.5 text-xs text-red-600 dark:text-red-400 space-y-1">
            <div className="flex items-center gap-1.5 font-medium">
              <AlertCircle className="size-3.5 shrink-0" />
              <span>File cannot be uploaded:</span>
            </div>
            <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px]">
              {rejectedFiles.map((file) => (
                <li key={file.id} className="truncate">
                  {file.name}: {file.errors.map((e) => e.message).join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Accepted File Preview */}
        {acceptedFiles.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <ul className="space-y-1.5">
              {acceptedFiles.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between gap-2.5 rounded-lg border border-border/80 bg-background/80 px-3 py-2 text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(file.name, file.type)}
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[280px]">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
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
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Button
        type="submit"
        disabled={loading || acceptedFiles.length === 0}
        size="sm"
        className="w-fit bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-xs shadow-[#665AEF]/25 cursor-pointer"
      >
        <Upload className="w-4 h-4 mr-2" />
        {loading ? "Uploading..." : "Upload File"}
      </Button>
    </form>
  );
}
