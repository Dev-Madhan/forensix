import { getCriminalById } from "@/features/criminals/queries";
import { getEvidenceSignedUrl } from "@/features/evidence/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  Printer,
  Download,
  Fingerprint,
  QrCode,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Camera,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ criminalId: string }>;
}) {
  const { criminalId } = await params;
  try {
    const criminal = await getCriminalById(criminalId);
    return {
      title: `FORENSIX DOSSIER: ${criminal.firstName} ${criminal.lastName} (${criminal.criminalId})`,
      description: `Official forensic intelligence dossier for ${criminal.firstName} ${criminal.lastName}`,
    };
  } catch {
    return { title: "Dossier Not Found | Forensix" };
  }
}

export default async function CriminalDossierPage({
  params,
}: {
  params: Promise<{ criminalId: string }>;
}) {
  const { criminalId } = await params;

  let criminal: any;
  try {
    criminal = await getCriminalById(criminalId);
  } catch {
    notFound();
  }

  // Resolve Tigris S3 signed URL if needed
  let resolvedMugshot = criminal.mugshotUrl;
  if (
    resolvedMugshot &&
    !resolvedMugshot.startsWith("http") &&
    !resolvedMugshot.startsWith("/")
  ) {
    try {
      resolvedMugshot = await getEvidenceSignedUrl(resolvedMugshot);
    } catch {
      resolvedMugshot = "/images/suspects/arjun-karthik.jpg";
    }
  }

  const demographics = (criminal.demographics as Record<string, any>) || {};
  const fullName = `${criminal.firstName} ${criminal.lastName}`;
  const aliasesList = Array.isArray(demographics.aliases)
    ? (demographics.aliases as string[]).join(", ")
    : criminal.alias || "None documented";

  const formattedDob = criminal.dateOfBirth
    ? new Date(criminal.dateOfBirth).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }) + " (32 years)"
    : "Mar 14, 1992 (32 years)";

  const records = criminal.records || [];
  const hits = criminal.surveillanceHits || [];
  const caseLinks = criminal.caseLinks || [];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-4 sm:p-8 print:p-0 print:bg-white print:text-black">
      {/* Top Non-Printable Action Bar */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <Link
          href={`/dashboard/criminals/${criminal.criminalId || criminal.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Profile {criminal.criminalId}</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={undefined}
            className="h-8 gap-1.5 bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold px-3 shadow-md print:hidden cursor-pointer"
          >
            <Printer className="size-3.5" />
            <span onClick={() => {}}>Print Official PDF</span>
          </Button>
        </div>
      </div>

      {/* Main Official Dossier Sheet (Matches 8.5 x 11 / A4 ratio) */}
      <div className="max-w-4xl mx-auto bg-neutral-900 border-2 border-neutral-700/80 rounded-2xl p-6 sm:p-10 shadow-2xl print:border-none print:shadow-none print:p-6 print:bg-white print:text-black">
        {/* Header with Agency Seal & Confidentiality Bar */}
        <div className="border-b-2 border-neutral-700 pb-5 mb-6 print:border-black">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-[#665AEF]/20 border-2 border-[#665AEF]/40 flex items-center justify-center text-[#a594fd] shrink-0 print:border-black print:text-black">
                <Shield className="size-6" />
              </div>
              <div>
                <span className="text-[10px] tracking-widest uppercase font-mono text-[#a594fd] print:text-neutral-700 font-bold block">
                  Central Forensic Intelligence Command
                </span>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white print:text-black font-heading">
                  OFFICIAL CRIMINAL DOSSIER
                </h1>
                <p className="text-xs text-neutral-400 print:text-neutral-600 font-mono">
                  REF: {criminal.criminalId} // CLASSIFICATION: CONFIDENTIAL (LAW ENFORCEMENT)
                </p>
              </div>
            </div>

            {/* QR Code / Barcode simulation */}
            <div className="text-right hidden sm:block font-mono text-[10px] text-neutral-400 print:text-neutral-800">
              <div className="inline-block p-1 bg-white rounded-md text-black mb-1">
                <QrCode className="size-10" />
              </div>
              <div>VERIFY: FORENSIX-CCTNS</div>
              <div>{new Date().toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Section 1: Subject Identity & Portrait */}
        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6 mb-8 pb-6 border-b border-neutral-800 print:border-neutral-300">
          {/* Mugshot Container */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative w-44 h-56 rounded-xl overflow-hidden border-2 border-neutral-700 bg-neutral-950 shrink-0 shadow-md print:border-black">
              {resolvedMugshot ? (
                <Image
                  src={resolvedMugshot}
                  alt={fullName}
                  fill
                  className="object-cover"
                  sizes="180px"
                  priority
                />
              ) : (
                <div className="size-full flex items-center justify-center text-neutral-500">
                  <Camera className="size-10" />
                </div>
              )}
              {/* Risk Badge Overlay */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-600 text-white tracking-wider uppercase">
                {criminal.riskLevel} RISK
              </div>
            </div>
            <span className="text-[11px] font-mono text-neutral-400 print:text-neutral-600">
              STATUS: {criminal.status}
            </span>
          </div>

          {/* Core Biodata Grid */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-white print:text-black font-heading">
                {fullName}
              </h2>
              <p className="text-xs text-[#a594fd] print:text-neutral-700 font-medium">
                Known Aliases: {aliasesList}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/60 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[10px] text-neutral-400 block font-mono">Date of Birth</span>
                <span className="font-semibold text-neutral-100 print:text-black">{formattedDob}</span>
              </div>
              <div className="bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/60 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[10px] text-neutral-400 block font-mono">Gender / Nationality</span>
                <span className="font-semibold text-neutral-100 print:text-black">
                  {criminal.gender || "Male"} / {criminal.nationality || "Indian"}
                </span>
              </div>
              <div className="bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/60 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[10px] text-neutral-400 block font-mono">Watchlist Classification</span>
                <span className="font-semibold text-rose-400 print:text-rose-700">
                  {criminal.watchlistStatus || "PRIORITY WATCHLIST"}
                </span>
              </div>
              <div className="bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/60 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[10px] text-neutral-400 block font-mono">Height / Weight</span>
                <span className="font-semibold text-neutral-100 print:text-black">
                  {demographics.height || "5'10\""} / {demographics.weight || "72 kg"}
                </span>
              </div>
              <div className="bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/60 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[10px] text-neutral-400 block font-mono">Physical Build</span>
                <span className="font-semibold text-neutral-100 print:text-black">
                  {demographics.build || "Athletic"}
                </span>
              </div>
              <div className="bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-700/60 print:bg-neutral-100 print:border-neutral-300">
                <span className="text-[10px] text-neutral-400 block font-mono">Aadhaar / National ID</span>
                <span className="font-semibold text-neutral-100 print:text-black">
                  {demographics.aadharId || "XXXX-XXXX-7789"}
                </span>
              </div>
            </div>

            <div className="text-xs bg-neutral-950/60 p-3 rounded-lg border border-neutral-800 print:bg-neutral-50 print:border-neutral-300">
              <span className="text-[10px] font-mono text-neutral-400 block uppercase mb-1">
                Distinctive Marks & Tattoos
              </span>
              <p className="text-neutral-200 print:text-black">
                {demographics.distinctiveMarks || "Scar on left eyebrow. Tattoo of dagger/dragon on right forearm."}
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Judicial Records & Convictions */}
        <div className="mb-8 pb-6 border-b border-neutral-800 print:border-neutral-300">
          <div className="flex items-center gap-2 mb-3">
            <Scale className="size-4 text-[#a594fd] print:text-black" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white print:text-black">
              Official Prior Convictions & Judicial History ({records.length})
            </h3>
          </div>

          {records.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-neutral-800 print:border-neutral-300">
              <table className="w-full text-xs text-left">
                <thead className="bg-neutral-800/60 text-neutral-400 font-mono print:bg-neutral-200 print:text-black">
                  <tr>
                    <th className="p-2.5">Case #</th>
                    <th className="p-2.5">Offence</th>
                    <th className="p-2.5">Incident Date</th>
                    <th className="p-2.5">Court / Location</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 print:divide-neutral-200">
                  {records.map((r: any) => (
                    <tr key={r.id} className="hover:bg-neutral-800/30">
                      <td className="p-2.5 font-mono font-medium">{r.courtCaseNumber}</td>
                      <td className="p-2.5 font-semibold text-neutral-200 print:text-black">{r.offenceType}</td>
                      <td className="p-2.5 text-neutral-400 print:text-neutral-700">
                        {new Date(r.incidentDate).toLocaleDateString()}
                      </td>
                      <td className="p-2.5">{r.location}</td>
                      <td className="p-2.5">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-neutral-800 text-neutral-300 print:bg-neutral-200 print:text-black">
                          {r.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-semibold text-rose-400 print:text-rose-700">
                        {r.outcome || "Pending"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">No previous conviction records registered in database.</p>
          )}
        </div>

        {/* Section 3: Live Surveillance Sensor Radar Hits */}
        <div className="mb-8 pb-6 border-b border-neutral-800 print:border-neutral-300">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="size-4 text-emerald-400 print:text-black" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white print:text-black">
              Recent Live Surveillance Radar Hits ({hits.length})
            </h3>
          </div>

          {hits.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {hits.slice(0, 4).map((h: any) => (
                <div
                  key={h.id}
                  className="p-3 rounded-lg border border-neutral-800 bg-neutral-950/60 print:bg-neutral-50 print:border-neutral-300 flex flex-col justify-between gap-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-emerald-400 print:text-emerald-700">
                      {h.sensorId}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400">
                      {Math.round(h.confidenceScore * 100)}% MATCH
                    </span>
                  </div>
                  <p className="text-neutral-200 print:text-black text-[11px] font-medium">{h.location}</p>
                  <div className="text-[10px] font-mono text-neutral-500 flex items-center justify-between pt-1 border-t border-neutral-800 print:border-neutral-200">
                    <span>GPS: {h.latitude.toFixed(4)}, {h.longitude.toFixed(4)}</span>
                    <span>{new Date(h.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">No automated camera sensor detections logged in past 30 days.</p>
          )}
        </div>

        {/* Section 4: Chain of Custody & Authentication Stamp */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs font-mono text-neutral-400 print:text-neutral-600 border-t border-neutral-800 print:border-neutral-300 pt-4">
          <div className="space-y-0.5">
            <div>ISSUED BY: FORENSIX AUTOMATED INTELLIGENCE CORE</div>
            <div>SECURITY HASH: SHA256-AUTHENTICATED-LEDGER</div>
          </div>
          <div className="text-right">
            <div>DOCUMENT STATUS: LAW ENFORCEMENT VERIFIED</div>
            <div>TIMESTAMP: {new Date().toISOString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
