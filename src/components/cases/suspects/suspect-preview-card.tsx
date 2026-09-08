"use client";

import React from "react";
import {
  Target,
  MoreHorizontal,
  Copy,
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { SuspectItem, SuspectStatus } from "./types";

interface SuspectPreviewCardProps {
  suspect: SuspectItem;
  onUpdateStatus?: (id: string, status: SuspectStatus) => void;
  onDeleteSuspect?: (id: string) => void;
}

export function SuspectPreviewCard({
  suspect,
  onUpdateStatus,
  onDeleteSuspect,
}: SuspectPreviewCardProps) {
  const isPrimary = suspect.status === "Primary Suspect";

  return (
    <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <CardHeader className="p-3.5 sm:p-4 pb-2 border-b-2 border-border/40 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <Target
            className={cn(
              "size-4.5 shrink-0",
              isPrimary ? "text-rose-400" : "text-amber-400"
            )}
          />
          <CardTitle className="text-xs sm:text-sm font-bold font-heading text-foreground">
            {suspect.status}
          </CardTitle>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label={`Actions for ${suspect.name}`}
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/70 hover:text-foreground transition-colors cursor-pointer"
              />
            }
          >
            <MoreHorizontal className="size-4" />
            <span className="sr-only">More options</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={6}
            className="w-48 min-w-48 p-1.5 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border text-xs z-50 overflow-hidden"
          >
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(suspect.id);
                toast.success(`Copied Suspect ID: ${suspect.id}`);
              }}
              className="cursor-pointer"
            >
              <Copy className="size-3.5 mr-2 text-muted-foreground" />
              <span>Copy Suspect ID</span>
            </DropdownMenuItem>
            {onUpdateStatus && (
              <>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-[10px] font-semibold text-muted-foreground uppercase px-2 py-1 tracking-wider">
                    Change Status
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    className="text-rose-400 focus:text-rose-400 cursor-pointer"
                    onClick={() => onUpdateStatus(suspect.id, "Primary Suspect")}
                  >
                    <ShieldAlert className="size-3.5 mr-2 text-rose-400" />
                    <span>Primary Suspect</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-amber-400 focus:text-amber-400 cursor-pointer"
                    onClick={() =>
                      onUpdateStatus(suspect.id, "Person of Interest")
                    }
                  >
                    <UserCheck className="size-3.5 mr-2 text-amber-400" />
                    <span>Person of Interest</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-emerald-400 focus:text-emerald-400 cursor-pointer"
                    onClick={() => onUpdateStatus(suspect.id, "Cleared")}
                  >
                    <CheckCircle2 className="size-3.5 mr-2 text-emerald-400" />
                    <span>Cleared</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
            {onDeleteSuspect && (
              <>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  className="text-rose-400 focus:text-rose-400 cursor-pointer"
                  onClick={() => onDeleteSuspect(suspect.id)}
                >
                  <Trash2 className="size-3.5 mr-2 text-rose-400" />
                  <span>Remove from Case</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-3.5 sm:p-4 space-y-4">
        <div className="flex items-center gap-4">
          {/* Photo */}
          <div className="size-20 rounded-lg overflow-hidden border-2 border-border bg-muted/40 shrink-0 relative shadow-xs">
            <img
              src={suspect.photo}
              alt={suspect.name}
              className="size-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-1 min-w-0 flex-1">
            <h3 className="text-base font-bold font-heading text-foreground truncate">
              {suspect.name}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {suspect.alias}
            </p>
            <div className="pt-0.5">
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border-2 whitespace-nowrap shadow-2xs",
                  isPrimary
                    ? "border-rose-500/40 bg-rose-500/15 text-rose-400"
                    : "border-amber-500/40 bg-amber-500/15 text-amber-400"
                )}
              >
                {suspect.status}
              </span>
            </div>
          </div>
        </div>

        {/* Match Confidence */}
        <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
          <span className="text-muted-foreground font-medium">
            Match Confidence
          </span>
          <span
            className={cn(
              "text-sm font-bold tabular-nums",
              suspect.matchConfidence >= 85
                ? "text-rose-400"
                : suspect.matchConfidence >= 60
                ? "text-amber-400"
                : "text-emerald-400"
            )}
          >
            {suspect.matchConfidence}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
