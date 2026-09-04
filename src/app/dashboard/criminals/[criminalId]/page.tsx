import { getCriminalById } from "@/features/criminals/queries";
import { getEvidenceSignedUrl } from "@/features/evidence/queries";
import { ArrowLeft, Clock, User, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EditCriminalDialog } from "@/components/criminals/EditCriminalDialog";

export async function generateMetadata({ params }: { params: Promise<{ criminalId: string }> }) {
  const resolvedParams = await params;
  try {
    const criminal = await getCriminalById(resolvedParams.criminalId);
    return {
      title: `${criminal.firstName} ${criminal.lastName} | Forensix`,
    };
  } catch {
    return {
      title: "Criminal Not Found | Forensix",
    };
  }
}

export default async function CriminalProfilePage({ params }: { params: Promise<{ criminalId: string }> }) {
  const resolvedParams = await params;

  let criminal;
  try {
    criminal = await getCriminalById(resolvedParams.criminalId);
  } catch {
    notFound();
  }

  // Resolve private Tigris S3 storage key to a signed URL if applicable
  let mugshotDisplayUrl = criminal.mugshotUrl;
  if (mugshotDisplayUrl && !mugshotDisplayUrl.startsWith("http")) {
    mugshotDisplayUrl = await getEvidenceSignedUrl(mugshotDisplayUrl);
  }

  return (
    <div className="flex flex-col gap-6 w-full p-6">
      <div>
        <Link
          href="/dashboard/criminals"
          className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Criminals
        </Link>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
          <div className="flex gap-5 items-center">
            <div className="w-24 h-24 bg-muted rounded-xl flex items-center justify-center overflow-hidden border-2 border-border shadow-xs shrink-0">
              {mugshotDisplayUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={mugshotDisplayUrl}
                  alt={`${criminal.firstName} ${criminal.lastName}`}
                  className="object-cover w-full h-full"
                />
              ) : (
                <User className="w-10 h-10 text-muted-foreground/60" />
              )}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-1.5">
                <h1 className="text-3xl font-bold tracking-tight">
                  {criminal.firstName} {criminal.lastName}
                </h1>
                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase ${
                    criminal.status === "WANTED"
                      ? "bg-destructive text-destructive-foreground"
                      : criminal.status === "ARCHIVED"
                      ? "bg-muted text-muted-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {criminal.status}
                </span>
              </div>
              <h2 className="text-sm text-muted-foreground font-mono">Record #{criminal.criminalId}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <EditCriminalDialog criminal={criminal} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Details Card */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-primary" />
              Subject Dossier
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-6 text-sm">
              <div>
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Known Aliases
                </h4>
                <p className="text-foreground">{criminal.alias || "None recorded"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Date of Birth
                </h4>
                <p className="text-foreground">
                  {criminal.dateOfBirth ? new Date(criminal.dateOfBirth).toLocaleDateString() : "Unknown"}
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Gender
                </h4>
                <p className="text-foreground">{criminal.gender || "Unknown"}</p>
              </div>
              <div>
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Nationality
                </h4>
                <p className="text-foreground">{criminal.nationality || "Unknown"}</p>
              </div>
              <div className="sm:col-span-2">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Registered Address
                </h4>
                <p className="text-foreground">{criminal.address || "Unknown"}</p>
              </div>
              <div className="sm:col-span-2">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Last Known Location
                </h4>
                <p className="text-foreground">{criminal.lastKnownLocation || "Unknown"}</p>
              </div>
              <div className="sm:col-span-2">
                <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Physical Description & Identifying Marks
                </h4>
                <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed">
                  {criminal.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Linked Investigations */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
            <h3 className="text-base font-semibold mb-4">Linked Investigations</h3>
            <div className="text-center p-6 border border-dashed rounded-lg bg-muted/20">
              <p className="text-muted-foreground text-xs font-medium">No linked cases currently matching.</p>
            </div>
          </div>

          {/* Meta Info Card */}
          <div className="rounded-xl border border-border/80 bg-card p-6 shadow-xs">
            <h3 className="text-base font-semibold mb-4">Record Intelligence</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Date Created
                </h4>
                <p className="mt-0.5 text-foreground">{new Date(criminal.createdAt).toLocaleString()}</p>
              </div>
              <div className="pt-2 border-t border-border/40">
                <h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Last Updated
                </h4>
                <p className="mt-0.5 text-foreground">{new Date(criminal.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
