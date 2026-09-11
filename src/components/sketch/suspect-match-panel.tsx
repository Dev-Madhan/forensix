"use client";

import * as React from "react";
import Image from "next/image";
import {
  ShieldAlert,
  CheckCircle2,
  ExternalLink,
  UserCheck,
  AlertTriangle,
  Loader2,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StudioCriminalOption } from "@/features/sketches/actions";

export interface MatchCandidate {
  criminal_id: string;
  confidence_score: number;
  metadata?: {
    name?: string;
    alias?: string;
    mugshot_url?: string;
    match_basis?: string;
  };
}

interface SuspectMatchPanelProps {
  matches: MatchCandidate[];
  isSearching: boolean;
  criminalsCatalog: StudioCriminalOption[];
  onConfirmMatch: (criminalId: string, score: number) => Promise<void>;
  confirmedMatches: Record<string, boolean>;
}

export function SuspectMatchPanel({
  matches,
  isSearching,
  criminalsCatalog,
  onConfirmMatch,
  confirmedMatches,
}: SuspectMatchPanelProps) {
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  const handleConfirm = async (criminalId: string, score: number) => {
    setConfirmingId(criminalId);
    try {
      await onConfirmMatch(criminalId, score);
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="p-5 border-b border-border/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex size-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-400 font-mono text-xs font-bold">
              4
            </span>
            <CardTitle className="text-base font-semibold text-foreground">
              Biometric Suspect Identification Matches
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-border text-muted-foreground">
            MobileNetV3 512D Embeddings
          </Badge>
        </div>
        <CardDescription className="text-xs text-muted-foreground mt-1">
          Real-time cosine similarity search across indexed suspect mugshot archives.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-5">
        {isSearching ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3 text-center">
            <Loader2 className="size-8 text-purple-400 animate-spin" />
            <div>
              <p className="text-xs font-semibold text-foreground">Scanning Biometric Database</p>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                Comparing deep feature vector projections against registered mugshots...
              </p>
            </div>
          </div>
        ) : matches.length > 0 ? (
          <div className="space-y-3">
            {matches.map((match) => {
              const matchedProfile =
                criminalsCatalog.find(
                  (c) =>
                    c.criminalId === match.criminal_id ||
                    c.id === match.criminal_id ||
                    c.firstName.toLowerCase() === (match.metadata?.name || "").toLowerCase().split(" ")[0]
                ) || null;

              const name = match.metadata?.name || (matchedProfile ? `${matchedProfile.firstName} ${matchedProfile.lastName}` : match.criminal_id);
              const alias = match.metadata?.alias || matchedProfile?.alias || "No known alias";
              const mugshotUrl = match.metadata?.mugshot_url || matchedProfile?.mugshotUrl || "/images/suspects/arun-prakash.jpg";
              const pct = Math.round(match.confidence_score * 100);
              const isConfirmed = Boolean(confirmedMatches[match.criminal_id]);

              return (
                <div
                  key={match.criminal_id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-border/70 bg-surface/40 hover:bg-surface/70 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Mugshot Image */}
                    <div className="relative size-14 rounded-lg overflow-hidden border border-border/80 bg-zinc-900 shrink-0">
                      <Image
                        src={mugshotUrl}
                        alt={name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {/* Suspect Details */}
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-foreground">{name}</h4>
                        {matchedProfile && (
                          <span className="text-[10px] text-purple-400 font-mono">
                            ({matchedProfile.status})
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        Alias: <span className="text-foreground/90 font-medium">{alias}</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        ID: {match.criminal_id}
                      </p>
                    </div>
                  </div>

                  {/* Similarity Badge & Confirmation Action */}
                  <div className="flex items-center gap-3 self-end sm:self-center">
                    {/* Score Badge */}
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 ${
                          pct >= 85
                            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                            : pct >= 70
                            ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
                            : "border-zinc-700 bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {pct}% Match
                      </Badge>
                    </div>

                    {/* Action Button */}
                    <Button
                      type="button"
                      size="sm"
                      variant={isConfirmed ? "secondary" : "outline"}
                      disabled={isConfirmed || confirmingId === match.criminal_id}
                      onClick={() => handleConfirm(match.criminal_id, match.confidence_score)}
                      className={`text-xs cursor-pointer ${
                        isConfirmed
                          ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                          : "border-purple-500/40 hover:bg-purple-500/10 text-purple-300"
                      }`}
                    >
                      {confirmingId === match.criminal_id ? (
                        <>
                          <Loader2 className="size-3 mr-1.5 animate-spin" />
                          Confirming...
                        </>
                      ) : isConfirmed ? (
                        <>
                          <CheckCircle2 className="size-3 mr-1.5 text-emerald-400" />
                          Confirmed
                        </>
                      ) : (
                        <>
                          <UserCheck className="size-3 mr-1.5" />
                          Confirm Candidate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            <div className="size-12 rounded-full border border-dashed border-border/60 bg-surface/40 flex items-center justify-center mx-auto mb-2">
              <ShieldAlert className="size-6 text-muted-foreground/40" />
            </div>
            <p className="text-xs font-medium text-foreground">No Candidate Scans Executed</p>
            <p className="text-[11px] text-muted-foreground mt-0.5 max-w-[280px] mx-auto">
              Generate or load a forensic sketch above, then click "Match Face" to query registered suspects.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
