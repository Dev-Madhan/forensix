import React from "react";
import { CaseAuditLogItem } from "@/features/audit/queries";
import {
  FolderPlus,
  FileUp,
  FileX,
  Edit3,
  Archive,
  Clock,
  ShieldAlert,
} from "lucide-react";

interface CaseTimelineProps {
  logs: CaseAuditLogItem[];
}

function getActionMeta(action: string) {
  switch (action) {
    case "CASE_CREATED":
      return {
        label: "Case Initiated",
        icon: FolderPlus,
        color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
      };
    case "CASE_UPDATED":
      return {
        label: "Case Details Updated",
        icon: Edit3,
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
      };
    case "CASE_ARCHIVED":
      return {
        label: "Case Archived",
        icon: Archive,
        color: "text-red-400 bg-red-500/10 border-red-500/20",
      };
    case "EVIDENCE_UPLOADED":
      return {
        label: "Forensic Evidence Uploaded",
        icon: FileUp,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
      };
    case "EVIDENCE_DELETED":
      return {
        label: "Evidence Purged",
        icon: FileX,
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
      };
    default:
      return {
        label: action.replace(/_/g, " "),
        icon: ShieldAlert,
        color: "text-muted-foreground bg-muted border-border",
      };
  }
}

export function CaseTimeline({ logs }: CaseTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center p-6 border border-dashed rounded-lg bg-muted/20">
        <Clock className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
        <p className="text-sm text-muted-foreground font-medium">No audit events recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
      {logs.map((log) => {
        const meta = getActionMeta(log.action);
        const Icon = meta.icon;

        return (
          <div key={log.id} className="relative flex flex-col gap-1 text-sm">
            {/* Step Node */}
            <div
              className={`absolute -left-6 top-0.5 w-5 h-5 rounded-full border flex items-center justify-center ${meta.color}`}
            >
              <Icon className="w-2.5 h-2.5" />
            </div>

            <div className="flex items-baseline justify-between gap-2">
              <span className="font-semibold text-foreground text-xs">{meta.label}</span>
              <span className="text-[11px] text-muted-foreground font-mono">
                {new Date(log.createdAt).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              By <span className="text-foreground font-medium">{log.user?.name || "System"}</span>
              {log.user?.badgeId && (
                <span className="ml-1 font-mono text-[10px] text-muted-foreground/80">
                  (Badge #{log.user.badgeId})
                </span>
              )}
            </p>

            {/* Extra details like file name or hash */}
            {log.details && (
              <div className="text-[11px] font-mono text-muted-foreground bg-muted/30 rounded p-2 border border-border/40 mt-1">
                {log.details.fileName && (
                  <div>
                    <span className="text-foreground/80 font-semibold">File:</span> {log.details.fileName}
                  </div>
                )}
                {log.details.sha256Hash && (
                  <div className="truncate" title={log.details.sha256Hash}>
                    <span className="text-foreground/80 font-semibold">SHA-256:</span> {log.details.sha256Hash.slice(0, 20)}...
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
