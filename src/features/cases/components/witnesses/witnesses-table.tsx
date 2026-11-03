"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  History,
  Eye,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  MessageSquare,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import type { WitnessItem } from "../../witnesses/types";

interface WitnessesTableProps {
  witnesses: WitnessItem[];
  caseId: string;
  caseNumber?: string;
  onViewDossier: (witness: WitnessItem) => void;
  onEditWitness: (witness: WitnessItem) => void;
  onDeleteWitness: (witness: WitnessItem) => void;
  onLogRecontact: (witness: WitnessItem) => void;
}

export function WitnessesTable({
  witnesses,
  caseId,
  caseNumber,
  onViewDossier,
  onEditWitness,
  onDeleteWitness,
  onLogRecontact,
}: WitnessesTableProps) {
  const handleCopyPhone = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    toast.success("Phone number copied to clipboard");
  };

  const getCredibilityBadge = (credibility: string) => {
    switch (credibility) {
      case "HIGH":
        return (
          <Badge className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[10.5px] font-mono">
            High Credibility
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge className="bg-cyan-500/15 text-cyan-400 border-cyan-500/30 text-[10.5px] font-mono">
            Medium
          </Badge>
        );
      case "LOW":
        return (
          <Badge className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[10.5px] font-mono">
            Low
          </Badge>
        );
      case "COMPROMISED":
        return (
          <Badge className="bg-rose-500/15 text-rose-400 border-rose-500/30 text-[10.5px] font-mono">
            Compromised
          </Badge>
        );
      default:
        return (
          <Badge className="bg-secondary text-muted-foreground border-border/60 text-[10.5px] font-mono">
            Unverified
          </Badge>
        );
    }
  };

  const getAvailabilityBadge = (status: string, isProtected: boolean) => {
    if (isProtected) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
          <ShieldAlert className="size-3" />
          Protected Witness
        </span>
      );
    }

    switch (status) {
      case "ACTIVE_AVAILABLE":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Contact Ready
          </span>
        );
      case "RELOCATED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
            Relocated
          </span>
        );
      case "UNREACHABLE":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
            Unreachable
          </span>
        );
      case "SUBPOENA_ISSUED":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
            Subpoena Served
          </span>
        );
      default:
        return (
          <span className="text-[11px] text-muted-foreground">Standard</span>
        );
    }
  };

  return (
    <div className="rounded-2xl border-2 border-border/80 bg-card/40 overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-secondary/40">
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground w-[260px]">
              Witness Details
            </TableHead>
            <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Role & Status
            </TableHead>
            <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Contact & Re-Reachability
            </TableHead>
            <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Observation & Credibility
            </TableHead>
            <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
              Inquiry Trail
            </TableHead>
            <TableHead className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {witnesses.map((w) => {
            const initials = w.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <TableRow
                key={w.id}
                onClick={() => onViewDossier(w)}
                className="group border-border/40 hover:bg-secondary/30 cursor-pointer transition-colors"
              >
                {/* 1. Witness Details */}
                <TableCell className="py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar className="size-9 border border-border/80 bg-[#161622] shrink-0">
                      <AvatarFallback className="text-xs font-semibold text-[#8579ff]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-heading font-semibold text-xs sm:text-sm text-foreground truncate">
                          {w.name}
                        </span>
                        {w.alias && (
                          <span className="text-[11px] text-muted-foreground italic truncate">
                            &quot;{w.alias}&quot;
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono text-[10.5px] text-[#8579ff]">
                          {w.witnessCode}
                        </span>
                        {w.ageAtIncident && (
                          <span className="text-[10.5px] text-muted-foreground">
                            • {w.ageAtIncident} yrs
                          </span>
                        )}
                        {w.gender && (
                          <span className="text-[10.5px] text-muted-foreground">
                            • {w.gender}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* 2. Role & Status */}
                <TableCell className="py-3">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-xs font-medium text-foreground">
                      {w.witnessType.replace("_", " ")}
                    </span>
                    {getAvailabilityBadge(w.availabilityStatus, w.isProtected)}
                  </div>
                </TableCell>

                {/* 3. Contact & Re-Reachability */}
                <TableCell className="py-3">
                  <div className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-1.5 text-foreground">
                      <Phone className="size-3 text-emerald-400 shrink-0" />
                      <span className="font-mono text-[11px]">{w.primaryPhone}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyPhone(w.primaryPhone, e)}
                        title="Copy phone"
                        className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                      >
                        <Copy className="size-2.5" />
                      </button>
                    </div>

                    {(w.city || w.state) && (
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px] truncate">
                        <MapPin className="size-3 text-muted-foreground shrink-0" />
                        <span className="truncate">
                          {[w.city, w.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    )}

                    {w.emergencyContactName && (
                      <div className="text-[10px] text-muted-foreground/80 truncate">
                        Next-of-kin: {w.emergencyContactName} ({w.emergencyRelationship || "Contact"})
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* 4. Observation & Credibility */}
                <TableCell className="py-3">
                  <div className="flex flex-col gap-1">
                    <div>{getCredibilityBadge(w.credibility)}</div>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      {w.incidentDistanceMeters && (
                        <span>{w.incidentDistanceMeters}m away</span>
                      )}
                      {w.confidenceScore !== null && w.confidenceScore !== undefined && (
                        <span className="text-foreground/90 font-mono">
                          {w.confidenceScore}% recall
                        </span>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* 5. Inquiry Trail */}
                <TableCell className="py-3">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                      <History className="size-3 text-[#8579ff]" />
                      {w.inquiriesCount} {w.inquiriesCount === 1 ? "inquiry" : "inquiries"}
                    </span>
                    {w.inquiries.length > 0 ? (
                      <span className="text-[10.5px] text-muted-foreground truncate max-w-[140px]">
                        Latest: {new Date(w.inquiries[0].inquiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-[10.5px] text-muted-foreground/60 italic">
                        Initial testimony only
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 6. Actions */}
                <TableCell className="py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1.5">
                    {/* Launch Sketch Studio button */}
                    <Link
                      href={`/sketch?caseId=${caseId}&witnessId=${w.id}`}
                      className="inline-flex"
                      title="Launch Forensic Sketch with this witness testimony"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-[11px] font-medium border-[#8579ff]/40 bg-[#8579ff]/10 hover:bg-[#8579ff]/20 text-[#8579ff] flex items-center gap-1 rounded"
                      >
                        <Sparkles className="size-3" />
                        <span className="hidden xl:inline">Sketch</span>
                      </Button>
                    </Link>

                    {/* Quick Re-contact / Inquiry */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onLogRecontact(w)}
                      title="Log Re-Contact / Future Inquiry"
                      className="h-7 px-2 text-[11px] text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 rounded flex items-center gap-1"
                    >
                      <MessageSquare className="size-3" />
                      <span className="hidden xl:inline">Inquire</span>
                    </Button>

                    {/* Action Dropdown Menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            className="size-7 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <MoreVertical className="size-3.5" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48 bg-[#0d0d12] border-border/80 text-xs">
                        <DropdownMenuLabel className="text-[10.5px] font-mono text-muted-foreground uppercase">
                          Witness Actions
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onViewDossier(w)}
                          className="flex items-center gap-2 cursor-pointer focus:bg-white/5"
                        >
                          <FileText className="size-3.5 text-[#8579ff]" />
                          <span>View Full Dossier</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onLogRecontact(w)}
                          className="flex items-center gap-2 cursor-pointer focus:bg-white/5"
                        >
                          <History className="size-3.5 text-emerald-400" />
                          <span>Log Re-Contact Inquiry</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onEditWitness(w)}
                          className="flex items-center gap-2 cursor-pointer focus:bg-white/5"
                        >
                          <Edit2 className="size-3.5 text-muted-foreground" />
                          <span>Edit Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border/60" />
                        <DropdownMenuItem
                          onClick={() => onDeleteWitness(w)}
                          className="flex items-center gap-2 text-rose-400 cursor-pointer focus:bg-rose-500/10"
                        >
                          <Trash2 className="size-3.5 text-rose-400" />
                          <span>Delete Witness</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
