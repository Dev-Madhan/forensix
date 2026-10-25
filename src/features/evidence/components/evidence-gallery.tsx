"use client";

import React, { useState } from "react";
import { deleteEvidence } from "@/features/evidence/actions";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Trash2,
  Eye,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

export interface EvidenceWithUrl {
  id: string;
  caseId: string;
  fileName: string;
  storageKey: string;
  mimeType: string;
  fileSize: number;
  sha256Hash: string;
  uploadedBy: string;
  uploadedAt: Date | string;
  downloadUrl: string;
}

interface EvidenceGalleryProps {
  caseId: string;
  evidences: EvidenceWithUrl[];
}

function formatBytes(bytes: number, decimals = 1) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function EvidenceGallery({ caseId, evidences }: EvidenceGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<EvidenceWithUrl | null>(null);
  const [evidenceToDelete, setEvidenceToDelete] = useState<EvidenceWithUrl | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copiedHashId, setCopiedHashId] = useState<string | null>(null);

  const handleCopyHash = (id: string, hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHashId(id);
    toast.success("SHA-256 Hash copied to clipboard");
    setTimeout(() => setCopiedHashId(null), 2000);
  };

  const handleDelete = async () => {
    if (!evidenceToDelete) return;

    setIsDeleting(true);
    const res = await deleteEvidence(evidenceToDelete.id, caseId);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Deleted ${evidenceToDelete.fileName}`);
      setEvidenceToDelete(null);
    }
    setIsDeleting(false);
  };

  if (evidences.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg bg-muted/20">
        <p className="text-muted-foreground text-sm font-medium">No forensic evidence attached yet.</p>
        <p className="text-xs text-muted-foreground/70 mt-1">Upload images or documents above to begin building the evidence log.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {evidences.map((evidence) => {
          const isImage = evidence.mimeType.startsWith("image/");

          return (
            <div
              key={evidence.id}
              className="group border border-border/80 rounded-xl overflow-hidden bg-card flex flex-col justify-between shadow-xs hover:border-border transition hover:shadow-md"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-16/10 bg-muted/40 overflow-hidden flex items-center justify-center">
                {isImage && evidence.downloadUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={evidence.downloadUrl}
                    alt={evidence.fileName}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 text-muted-foreground">
                    <FileText className="w-10 h-10 mb-2 stroke-[1.5]" />
                    <span className="text-[11px] font-mono uppercase tracking-wider">{evidence.mimeType}</span>
                  </div>
                )}

                {/* Hover overlay with action icons */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                  {isImage && evidence.downloadUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedImage(evidence)}
                      className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition"
                      title="View Image"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                  {evidence.downloadUrl && (
                    <a
                      href={evidence.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={evidence.fileName}
                      className="p-2 rounded-full bg-white/20 text-white hover:bg-white/40 transition"
                      title="Download Evidence"
                    >
                      <Download className="w-4 h-4" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setEvidenceToDelete(evidence)}
                    className="p-2 rounded-full bg-red-500/30 text-red-300 hover:bg-red-500/60 transition"
                    title="Delete Evidence"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Meta details */}
              <div className="p-3.5 flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground truncate" title={evidence.fileName}>
                    {evidence.fileName}
                  </span>
                  <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                    {formatBytes(evidence.fileSize)}
                  </span>
                </div>

                {/* SHA-256 Hash pill */}
                <div className="flex items-center justify-between text-[10px] bg-muted/40 rounded px-2 py-1 border border-border/40 font-mono text-muted-foreground">
                  <div className="flex items-center gap-1 truncate" title={evidence.sha256Hash}>
                    <ShieldCheck className="w-3 h-3 text-primary shrink-0" />
                    <span className="truncate">{evidence.sha256Hash.slice(0, 16)}...</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyHash(evidence.id, evidence.sha256Hash)}
                    className="hover:text-foreground transition ml-1 shrink-0"
                    title="Copy Full SHA-256"
                  >
                    {copiedHashId === evidence.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Image Lightbox Modal */}
      {selectedImage && (
        <Modal
          isOpen={!!selectedImage}
          onClose={() => setSelectedImage(null)}
          title={selectedImage.fileName}
          description={`Uploaded on ${new Date(selectedImage.uploadedAt).toLocaleString()} • ${formatBytes(selectedImage.fileSize)}`}
          maxWidth="max-w-4xl"
        >
          <div className="flex flex-col gap-4">
            <div className="relative max-h-[65vh] overflow-hidden rounded-lg bg-black/40 border border-border/40 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage.downloadUrl}
                alt={selectedImage.fileName}
                className="w-auto h-auto max-h-[60vh] max-w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-4 p-3 bg-muted/30 rounded-lg border border-border/50 text-xs">
              <div className="flex items-center gap-2 font-mono text-muted-foreground truncate">
                <span className="font-semibold text-foreground">SHA-256:</span>
                <span className="truncate">{selectedImage.sha256Hash}</span>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyHash("modal", selectedImage.sha256Hash)}
                >
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy Hash
                </Button>
                <a
                  href={selectedImage.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={selectedImage.fileName}
                >
                  <Button size="sm">
                    <Download className="w-3.5 h-3.5 mr-1" /> Download
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {evidenceToDelete && (
        <Modal
          isOpen={!!evidenceToDelete}
          onClose={() => !isDeleting && setEvidenceToDelete(null)}
          title="Delete Forensic Evidence"
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Permanent deletion</p>
                <p className="text-xs text-destructive/80 mt-0.5">
                  This action cannot be undone. The file will be permanently purged from Tigris Object Storage, and an audit trail entry will be recorded.
                </p>
              </div>
            </div>

            <p className="text-sm text-foreground">
              Are you sure you want to delete <span className="font-semibold text-foreground font-mono">{evidenceToDelete.fileName}</span>?
            </p>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                variant="outline"
                size="sm"
                disabled={isDeleting}
                onClick={() => setEvidenceToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}
