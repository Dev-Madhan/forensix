"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  UserCheck,
  Loader2,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudioCriminalOption } from "@/features/sketches/actions";
import { getSafeStorageUrl } from "@/lib/storage-url";
import { getCriminalSlug } from "@/features/criminals/slug";

export interface MatchCandidate {
  criminal_id: string;
  confidence_score: number;
  metadata?: {
    name?: string;
    alias?: string;
    mugshot_url?: string;
    match_basis?: string;
    last_known_location?: string;
  };
}

interface SuspectMatchPanelProps {
  matches: MatchCandidate[];
  isSearching: boolean;
  criminalsCatalog: StudioCriminalOption[];
  onConfirmMatch: (criminalId: string, score: number) => Promise<void>;
  confirmedMatches: Record<string, boolean>;
  sketchImageUrl?: string | null;
  caseNumber?: string;
  onClose?: () => void;
}

export function SuspectMatchPanel({
  matches,
  isSearching,
  criminalsCatalog,
  onConfirmMatch,
  confirmedMatches,
  sketchImageUrl,
  caseNumber = "FX-2026-185",
  onClose,
}: SuspectMatchPanelProps) {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  const handleConfirm = async (criminalId: string, score: number) => {
    setConfirmingId(criminalId);
    try {
      await onConfirmMatch(criminalId, score);
    } finally {
      setConfirmingId(null);
    }
  };

  /* ── 1. Searching / Scanning State ── */
  if (isSearching) {
    return (
      <div className="py-8 sm:py-12 flex flex-col items-center justify-center gap-3.5 text-center px-2 w-full min-w-0">
        <div className="relative flex size-12 sm:size-14 items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-ping opacity-60" />
          <div className="flex size-12 sm:size-14 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-inner">
            <Fingerprint className="size-5 sm:size-6 animate-pulse" />
          </div>
        </div>
        <div className="space-y-1 w-full max-w-xs mx-auto">
          <p className="text-xs sm:text-sm font-semibold text-foreground tracking-tight">
            Comparing Facial Biometrics
          </p>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
            Running facial geometry similarity analysis against registered criminal records…
          </p>
        </div>
      </div>
    );
  }

  /* ── 2. No Match Found State ── */
  if (matches.length === 0) {
    return (
      <div className="py-8 sm:py-12 flex flex-col items-center justify-center gap-3 text-center px-2 w-full min-w-0">
        <div className="flex size-11 sm:size-12 items-center justify-center rounded-full border border-dashed border-border/70 bg-muted/20 text-muted-foreground/50">
          <ShieldAlert className="size-5 sm:size-6" />
        </div>
        <div className="space-y-1 w-full max-w-xs mx-auto">
          <p className="text-xs sm:text-sm font-semibold text-foreground">
            No Suspect Matches Identified
          </p>
          <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">
            The biometric comparison found no indexed criminal profiles meeting the minimum confidence threshold (≥70%).
          </p>
        </div>
        {onClose && (
          <Button variant="outline" size="sm" onClick={onClose} className="mt-2 text-xs h-8 cursor-pointer">
            Dismiss Scanner
          </Button>
        )}
      </div>
    );
  }

  // Active candidate
  const activeMatch = matches[selectedIndex] || matches[0];
  const matchedProfile =
    criminalsCatalog.find(
      (c) =>
        c.criminalId === activeMatch.criminal_id ||
        c.id === activeMatch.criminal_id ||
        c.firstName.toLowerCase() ===
          (activeMatch.metadata?.name || "").toLowerCase().split(" ")[0]
    ) || null;

  const name =
    activeMatch.metadata?.name ||
    (matchedProfile
      ? `${matchedProfile.firstName} ${matchedProfile.lastName}`
      : activeMatch.criminal_id);

  const alias = activeMatch.metadata?.alias || matchedProfile?.alias || "None Recorded";

  const rawMugshot =
    activeMatch.metadata?.mugshot_url ||
    matchedProfile?.mugshotUrl ||
    "/images/suspects/arun-prakash.jpg";

  const mugshotUrl = getSafeStorageUrl(rawMugshot) || "/images/suspects/arun-prakash.jpg";

  const location =
    activeMatch.metadata?.last_known_location || "Madurai, Tamil Nadu";

  const pct = Math.round(activeMatch.confidence_score * 100);
  const isConfirmed = Boolean(confirmedMatches[activeMatch.criminal_id]);
  const profileSlug = matchedProfile
    ? getCriminalSlug(matchedProfile)
    : activeMatch.criminal_id;

  return (
    <div className="space-y-3 sm:space-y-3.5 w-full min-w-0">
      {/* Multiple Candidate Switcher (If > 1 match) */}
      {matches.length > 1 && (
        <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg border border-border/50 overflow-x-auto min-w-0 w-full">
          {matches.map((m, i) => (
            <button
              key={m.criminal_id}
              onClick={() => setSelectedIndex(i)}
              className={`flex-1 py-1 px-2 rounded-md text-[10.5px] sm:text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedIndex === i
                  ? "bg-card text-foreground shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Candidate #{i + 1} ({Math.round(m.confidence_score * 100)}%)
            </button>
          ))}
        </div>
      )}

      {/* Side-by-Side Visual Facial Verification */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3.5 items-stretch min-w-0 w-full">
        {/* Left: Forensic Sketch */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-border/70 bg-card/60 p-1.5 sm:p-2.5 min-w-0">
          <div className="flex items-center justify-between text-xs px-1 min-w-0">
            <span className="font-semibold text-foreground text-[11px] sm:text-xs truncate">Forensic Sketch</span>
          </div>
          <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-border/70 bg-neutral-950 flex items-center justify-center shadow-inner min-w-0">
            {sketchImageUrl ? (
              <Image
                src={sketchImageUrl}
                alt="Generated Composite Sketch"
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <div className="text-[10px] sm:text-xs text-muted-foreground font-mono">Composite Sketch</div>
            )}
            <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[8.5px] sm:text-[9.5px] font-mono text-zinc-300 border border-white/10 leading-none">
              {caseNumber}
            </div>
            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[8px] sm:text-[9px] font-mono font-medium text-purple-300 border border-purple-500/25 leading-none">
              SYNTHESIS
            </div>
          </div>
        </div>

        {/* Right: Matched Mugshot */}
        <div className="flex flex-col gap-1.5 rounded-xl border border-border/70 bg-card/60 p-1.5 sm:p-2.5 min-w-0">
          <div className="flex items-center justify-between text-xs px-1 min-w-0">
            <span className="font-semibold text-foreground text-[11px] sm:text-xs truncate">Suspect Archive</span>
          </div>
          <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-border/70 bg-neutral-950 flex items-center justify-center shadow-inner min-w-0">
            <Image
              src={mugshotUrl}
              alt={name}
              fill
              unoptimized
              className="object-cover"
            />
            <div
              className={`absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded font-mono font-semibold text-[8.5px] sm:text-[9.5px] leading-none border backdrop-blur-md ${
                matchedProfile?.status === "WANTED"
                  ? "bg-rose-950/85 text-rose-300 border-rose-500/35"
                  : matchedProfile?.status === "ACTIVE"
                  ? "bg-amber-950/85 text-amber-300 border-amber-500/35"
                  : "bg-black/80 text-zinc-300 border-white/10"
              }`}
            >
              {matchedProfile?.status || "REGISTERED"}
            </div>
            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 backdrop-blur-md text-[8px] sm:text-[9px] font-mono font-medium text-white/85 border border-white/10 leading-none">
              MUGSHOT
            </div>
          </div>
        </div>
      </div>

      {/* Match Confidence Strip */}
      <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2 sm:px-3.5 sm:py-2.5 flex items-center justify-between gap-2.5 min-w-0 w-full">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground truncate">
            {pct >= 90 ? "High-Confidence Facial Match" : "Moderate Facial Match"}
          </p>
          <p className="text-[10.5px] sm:text-[11px] text-muted-foreground truncate">
            Facial geometry corroborates composite features
          </p>
        </div>
        <Badge
          variant="outline"
          className={`shrink-0 font-mono text-[10.5px] sm:text-xs px-2 sm:px-2.5 py-0.5 font-semibold ${
            pct >= 90
              ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
              : "bg-amber-500/15 text-amber-400 border-amber-500/30"
          }`}
        >
          {pct}% Match
        </Badge>
      </div>

      {/* Structured Suspect Dossier Details */}
      <div className="rounded-xl border border-border/70 bg-card/60 divide-y divide-border/40 text-[11px] sm:text-xs overflow-hidden min-w-0 w-full">
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 min-w-0">
          <span className="text-muted-foreground font-medium shrink-0">Suspect Legal Name</span>
          <span className="font-semibold text-foreground truncate text-right min-w-0">{name}</span>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 min-w-0">
          <span className="text-muted-foreground font-medium shrink-0">Record Number</span>
          <span className="font-mono font-semibold text-foreground/90 truncate text-right min-w-0">{activeMatch.criminal_id}</span>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 min-w-0">
          <span className="text-muted-foreground font-medium shrink-0">Known Alias</span>
          <span className="text-foreground truncate text-right min-w-0">{alias}</span>
        </div>
        <div className="flex items-center justify-between gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 min-w-0">
          <span className="text-muted-foreground font-medium shrink-0">Jurisdiction</span>
          <span className="text-foreground truncate text-right min-w-0">{location}</span>
        </div>
      </div>

      {/* Actions Strip */}
      <div className="pt-0.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-2.5 min-w-0 w-full">
        {/* Mobile View (<sm): Stacked with prominent primary button */}
        <div className="sm:hidden flex flex-col gap-2 w-full">
          <Button
            size="sm"
            disabled={isConfirmed || confirmingId === activeMatch.criminal_id}
            onClick={() => handleConfirm(activeMatch.criminal_id, activeMatch.confidence_score)}
            className={`w-full text-xs h-9 gap-1.5 font-medium cursor-pointer transition-all ${
              isConfirmed
                ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-xs"
                : "bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-xs shadow-[#665AEF]/25"
            }`}
          >
            {confirmingId === activeMatch.criminal_id ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Linking Suspect…</span>
              </>
            ) : isConfirmed ? (
              <>
                <CheckCircle2 className="size-3.5" />
                <span>Confirmed & Linked</span>
              </>
            ) : (
              <>
                <UserCheck className="size-3.5" />
                <span>Confirm & Link Suspect</span>
              </>
            )}
          </Button>

          <div className="grid grid-cols-2 gap-2 w-full">
            <Link href={`/dashboard/criminals/${profileSlug}`} target="_blank" className="w-full">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8.5 cursor-pointer">
                <span className="truncate">View Dossier</span>
                <ExternalLink className="size-3 text-muted-foreground shrink-0" />
              </Button>
            </Link>
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="w-full text-xs h-8.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Dismiss
              </Button>
            )}
          </div>
        </div>

        {/* Desktop View (sm+): Balanced inline row */}
        <div className="hidden sm:flex items-center justify-between gap-2.5 w-full">
          <Link href={`/dashboard/criminals/${profileSlug}`} target="_blank">
            <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8.5 cursor-pointer">
              <span>View Full Dossier</span>
              <ExternalLink className="size-3 text-muted-foreground" />
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs h-8.5 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Dismiss
              </Button>
            )}

            <Button
              size="sm"
              disabled={isConfirmed || confirmingId === activeMatch.criminal_id}
              onClick={() => handleConfirm(activeMatch.criminal_id, activeMatch.confidence_score)}
              className={`text-xs h-8.5 px-4 gap-1.5 font-medium cursor-pointer transition-all ${
                isConfirmed
                  ? "bg-emerald-600 hover:bg-emerald-600 text-white shadow-xs"
                  : "bg-[#665AEF] hover:bg-[#5749DF] text-white shadow-xs shadow-[#665AEF]/25"
              }`}
            >
              {confirmingId === activeMatch.criminal_id ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Linking…</span>
                </>
              ) : isConfirmed ? (
                <>
                  <CheckCircle2 className="size-3.5" />
                  <span>Linked</span>
                </>
              ) : (
                <>
                  <UserCheck className="size-3.5" />
                  <span>Confirm & Link</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
