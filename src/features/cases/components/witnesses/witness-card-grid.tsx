"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldAlert,
  History,
  FileText,
  MessageSquare,
  ChevronRight,
  Eye,
} from "lucide-react";
import type { WitnessItem } from "../../witnesses/types";

interface WitnessCardGridProps {
  witnesses: WitnessItem[];
  caseId: string;
  onViewDossier: (witness: WitnessItem) => void;
  onEditWitness: (witness: WitnessItem) => void;
  onLogRecontact: (witness: WitnessItem) => void;
}

export function WitnessCardGrid({
  witnesses,
  caseId,
  onViewDossier,
  onEditWitness,
  onLogRecontact,
}: WitnessCardGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {witnesses.map((w) => {
        const initials = w.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <Card
            key={w.id}
            onClick={() => onViewDossier(w)}
            className="group relative border-2 border-border/80 bg-card/40 hover:bg-card/75 hover:border-border transition-all p-4 rounded-xl shadow-xs cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent line for protected witnesses */}
            {w.isProtected && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
            )}

            <div>
              {/* Header: Avatar, Name, Code, Badges */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10 border border-border/80 bg-[#161622] shrink-0">
                    <AvatarFallback className="text-xs font-semibold text-[#8579ff]">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-heading font-semibold text-sm text-foreground truncate">
                        {w.name}
                      </span>
                      {w.alias && (
                        <span className="text-xs text-muted-foreground italic truncate">
                          &quot;{w.alias}&quot;
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[10.5px] text-[#8579ff]">
                        {w.witnessCode}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        • {w.witnessType.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                {w.isProtected ? (
                  <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10px] shrink-0 font-mono">
                    Protected
                  </Badge>
                ) : (
                  <Badge
                    className={`text-[10px] shrink-0 font-mono ${
                      w.credibility === "HIGH"
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                        : w.credibility === "MEDIUM"
                        ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                        : "bg-secondary text-muted-foreground border-border/60"
                    }`}
                  >
                    {w.credibility}
                  </Badge>
                )}
              </div>

              {/* Contact Snapshot */}
              <div className="mt-3.5 pt-3 border-t border-border/50 flex flex-col gap-1.5 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Phone className="size-3 text-emerald-400 shrink-0" />
                  <span className="font-mono text-foreground">{w.primaryPhone}</span>
                </div>
                {(w.city || w.state) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="size-3 text-muted-foreground shrink-0" />
                    <span className="truncate">
                      {[w.city, w.state].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Testimonial Quote */}
              {w.statement && (
                <div className="mt-3 p-2.5 rounded-lg bg-secondary/30 border border-border/50">
                  <p className="text-xs text-muted-foreground italic line-clamp-2 leading-relaxed">
                    &quot;{w.statement}&quot;
                  </p>
                </div>
              )}

              {/* Key Facial Landmarks noted */}
              {w.keyFacialFeatures && (
                <div className="mt-2 text-[11px] text-muted-foreground/90 flex items-start gap-1">
                  <span className="text-[#8579ff] font-medium shrink-0">Recalled:</span>
                  <span className="line-clamp-1">{w.keyFacialFeatures}</span>
                </div>
              )}
            </div>

            {/* Footer: Inquiry Stats + Actions */}
            <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <History className="size-3 text-[#8579ff]" />
                <span>
                  {w.inquiriesCount} {w.inquiriesCount === 1 ? "inquiry" : "inquiries"}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href={`/sketch?caseId=${caseId}&witnessId=${w.id}`}
                  title="Generate Composite Sketch"
                >
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[11px] font-medium border-[#8579ff]/40 bg-[#8579ff]/10 hover:bg-[#8579ff]/20 text-[#8579ff] flex items-center gap-1 rounded cursor-pointer"
                  >
                    <Sparkles className="size-3" />
                    <span>Sketch</span>
                  </Button>
                </Link>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onLogRecontact(w)}
                  title="Log Future Inquiry / Re-contact"
                  className="h-7 px-2 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded flex items-center gap-1 cursor-pointer"
                >
                  <MessageSquare className="size-3" />
                  <span>Inquire</span>
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onViewDossier(w)}
                  title="Open Witness Dossier"
                  className="size-7 p-0 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
