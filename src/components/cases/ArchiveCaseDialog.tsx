"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { archiveCase, unarchiveCase } from "@/features/cases/actions";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Archive, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import { logCaseActivity } from "@/components/cases/activity";

interface ArchiveCaseDialogProps {
  caseId: string;
  caseNumber: string;
  isArchived?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  onStatusChange?: (newStatus: string) => void;
}

export function ArchiveCaseDialog({
  caseId,
  caseNumber,
  isArchived = false,
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  onStatusChange,
}: ArchiveCaseDialogProps) {
  const router = useRouter();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const modalOpen = isControlled ? controlledIsOpen : internalIsOpen;

  const handleClose = () => {
    if (loading) return;
    if (isControlled && controlledOnClose) {
      controlledOnClose();
    } else {
      setInternalIsOpen(false);
    }
  };

  const handleToggleArchive = async () => {
    setLoading(true);
    try {
      if (isArchived) {
        // Restore / Unarchive
        const res = await unarchiveCase(caseId);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success(`Case ${caseNumber} restored to active investigation.`);
          logCaseActivity({
            caseId,
            caseNumber,
            action: "Restored case to active investigation",
            details: `Case ${caseNumber} unarchived and resumed under active investigation.`,
            category: "Case",
            actionType: "CASE",
          });
          if (onStatusChange) {
            onStatusChange("Under Investigation");
          }
          router.refresh();
          handleClose();
        }
      } else {
        // Archive
        const res = await archiveCase(caseId);
        if (res?.error) {
          toast.error(res.error);
        } else {
          toast.success(`Case ${caseNumber} has been archived.`);
          logCaseActivity({
            caseId,
            caseNumber,
            action: "Archived investigation case",
            details: `Case ${caseNumber} archived and moved to cold storage records.`,
            category: "Case",
            actionType: "CASE",
          });
          if (onStatusChange) {
            onStatusChange("Archived");
          }
          router.refresh();
          handleClose();
        }
      }
    } catch (err) {
      console.error("Archive toggle failed:", err);
      toast.error("Failed to update case archival status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Standalone Trigger if uncontrolled */}
      {!isControlled && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setInternalIsOpen(true)}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
        >
          {isArchived ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Restore Case
            </>
          ) : (
            <>
              <Archive className="w-3.5 h-3.5 mr-1.5" />
              Archive Case
            </>
          )}
        </Button>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleClose}
        title={isArchived ? "Restore Investigation Case" : "Archive Investigation Case"}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div
            className={`flex items-start gap-3 p-3 rounded-lg border-2 text-sm ${
              isArchived
                ? "bg-blue-500/10 border-blue-500/20 text-blue-500 dark:text-blue-400"
                : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
            }`}
          >
            {isArchived ? (
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
            ) : (
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
            )}
            <div>
              <p className="font-semibold">
                {isArchived ? "Case Reactivation" : "Case Archival"}
              </p>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">
                {isArchived
                  ? "Restoring this case will mark it active, reopening it for new evidence collection, suspects tracking, and forensic reporting."
                  : "Archiving this case will mark it inactive and record an audit log event. Case data and attached evidence remain securely preserved in cold storage."}
              </p>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-foreground">
            Are you sure you want to {isArchived ? "restore" : "archive"} case{" "}
            <span className="font-mono font-semibold text-foreground">{caseNumber}</span>?
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t-2 border-border/60">
            <Button
              variant="outline"
              size="sm"
              disabled={loading}
              onClick={handleClose}
              className="cursor-pointer text-xs border-2 border-border/80"
            >
              Cancel
            </Button>
            <Button
              variant={isArchived ? "default" : "destructive"}
              size="sm"
              disabled={loading}
              onClick={handleToggleArchive}
              className={`cursor-pointer text-xs gap-1.5 ${
                isArchived ? "bg-[#665AEF] hover:bg-[#5749DF] text-white" : ""
              }`}
            >
              {loading
                ? isArchived
                  ? "Restoring..."
                  : "Archiving..."
                : isArchived
                ? "Confirm Restore"
                : "Confirm Archival"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
