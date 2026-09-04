"use client";

import React, { useState } from "react";
import { archiveCase } from "@/features/cases/actions";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Archive, AlertCircle } from "lucide-react";

interface ArchiveCaseDialogProps {
  caseId: string;
  caseNumber: string;
  isArchived?: boolean;
}

export function ArchiveCaseDialog({
  caseId,
  caseNumber,
  isArchived = false,
}: ArchiveCaseDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleArchive = async () => {
    setLoading(true);
    const res = await archiveCase(caseId);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Case ${caseNumber} has been archived`);
      setIsOpen(false);
    }
    setLoading(false);
  };

  if (isArchived) {
    return (
      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-md bg-muted text-muted-foreground border border-border">
        Archived Case
      </span>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <Archive className="w-3.5 h-3.5 mr-1.5" />
        Archive Case
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => !loading && setIsOpen(false)}
        title="Archive Investigation Case"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Case Archival</p>
              <p className="text-xs opacity-90 mt-0.5">
                Archiving this case will mark it inactive and record an audit log event. Case data and attached evidence remain securely preserved.
              </p>
            </div>
          </div>

          <p className="text-sm text-foreground">
            Are you sure you want to archive case <span className="font-mono font-semibold">{caseNumber}</span>?
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={loading}
              onClick={handleArchive}
            >
              {loading ? "Archiving..." : "Confirm Archival"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
