import { getCaseById } from "@/features/cases/queries";
import { getEvidenceSignedUrl } from "@/features/evidence/queries";
import { getCaseAuditTimeline } from "@/features/audit/queries";
import { ArrowLeft, Clock, FileText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { UploadEvidenceForm } from "@/components/evidence/UploadEvidenceForm";
import { EvidenceGallery } from "@/components/evidence/EvidenceGallery";
import { EditCaseDialog } from "@/components/cases/EditCaseDialog";
import { ArchiveCaseDialog } from "@/components/cases/ArchiveCaseDialog";
import { CaseTimeline } from "@/components/cases/CaseTimeline";

export async function generateMetadata({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = await params;
  try {
    const caseData = await getCaseById(resolvedParams.caseId);
    return {
      title: `${caseData.caseNumber} - ${caseData.title} | Forensix`,
    };
  } catch {
    return {
      title: "Case Not Found | Forensix",
    };
  }
}

export default async function CaseDetailsPage({ params }: { params: Promise<{ caseId: string }> }) {
  const resolvedParams = await params;

  let caseData;
  let auditLogs;
  try {
    const [fetchedCase, fetchedLogs] = await Promise.all([
      getCaseById(resolvedParams.caseId),
      getCaseAuditTimeline(resolvedParams.caseId),
    ]);
    caseData = fetchedCase;
    auditLogs = fetchedLogs;
  } catch {
    notFound();
  }

  // Generate temporary presigned URLs for all attached evidence
  const evidencesWithUrls = await Promise.all(
    caseData.evidences.map(async (evidence) => ({
      ...evidence,
      downloadUrl: await getEvidenceSignedUrl(evidence.storageKey),
    }))
  );

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div>
        <Link
          href="/dashboard/cases"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cases
        </Link>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <h1 className="text-3xl font-bold tracking-tight font-mono">{caseData.caseNumber}</h1>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                  caseData.status === "ARCHIVED"
                    ? "bg-muted text-muted-foreground"
                    : caseData.status === "CLOSED"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {caseData.status.replace(/_/g, " ")}
              </span>
              <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase bg-secondary text-secondary-foreground">
                {caseData.priority} Priority
              </span>
            </div>
            <h2 className="text-xl text-muted-foreground">{caseData.title}</h2>
          </div>

          {/* Action Buttons: Edit and Archive Dialogs */}
          <div className="flex items-center gap-2 shrink-0">
            <EditCaseDialog caseData={caseData} />
            <ArchiveCaseDialog
              caseId={caseData.id}
              caseNumber={caseData.caseNumber}
              isArchived={caseData.status === "ARCHIVED"}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              Investigation Brief
            </h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Description & Operational Notes
                </h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                  {caseData.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          {/* Evidence Management Section */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                Forensic Evidence ({evidencesWithUrls.length})
              </h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              All files are encrypted in private Tigris Object Storage with verifiable SHA-256 integrity hashes.
            </p>

            <UploadEvidenceForm caseId={caseData.id} />

            <div className="mt-6">
              <EvidenceGallery caseId={caseData.id} evidences={evidencesWithUrls} />
            </div>
          </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
          {/* Metadata Card */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
            <h3 className="text-lg font-semibold mb-4">Case Metadata</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider">
                  Lead Investigator
                </h4>
                <p className="font-medium text-foreground mt-0.5">{caseData.assignedTo.name}</p>
                <p className="text-xs text-muted-foreground">{caseData.assignedTo.email}</p>
              </div>
              <div className="pt-2 border-t border-border/40">
                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Date Created
                </h4>
                <p className="mt-0.5 text-foreground">{new Date(caseData.createdAt).toLocaleString()}</p>
              </div>
              <div className="pt-2 border-t border-border/40">
                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Last Activity
                </h4>
                <p className="mt-0.5 text-foreground">{new Date(caseData.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Chain of Custody Audit Timeline */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Chain of Custody
            </h3>
            <CaseTimeline logs={auditLogs} />
          </div>
        </div>
      </div>
    </div>
  );
}
