"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { type CriminalItem } from "@/features/criminals/types";
import { SuspectAvatar } from "./suspect-avatar";
import { getCriminalSlug } from "@/features/criminals/slug";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  User,
  PenLine,
  Shield,
  MapPin,
  Calendar,
  ArrowRight,
  Fingerprint,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { toggleCriminalWatchlist } from "@/features/criminals/actions";

interface CriminalMobileCardProps {
  criminal: CriminalItem;
  isSelected: boolean;
  isActive: boolean;
  onSelect: () => void;
  onOpenPreview: (id: string) => void;
  onWatchlistChanged?: () => void;
}

export function CriminalMobileCard({
  criminal,
  isSelected,
  isActive,
  onSelect,
  onOpenPreview,
  onWatchlistChanged,
}: CriminalMobileCardProps) {
  const [isTogglingWatchlist, setIsTogglingWatchlist] = React.useState(false);
  const profileSlug = getCriminalSlug(criminal);

  const handleToggleWatchlist = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTogglingWatchlist(true);
    const nextWatchlist = criminal.status !== "Wanted";
    try {
      const res = await toggleCriminalWatchlist(criminal.id, nextWatchlist);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          nextWatchlist
            ? `${criminal.firstName} ${criminal.lastName} placed on Priority Watchlist`
            : `Removed from Priority Watchlist`
        );
        onWatchlistChanged?.();
      }
    } catch {
      toast.error("Failed to update watchlist status");
    } finally {
      setIsTogglingWatchlist(false);
    }
  };

  // Status aura ring for mugshot avatar themed with project purple shades
  const getAvatarRingClass = () => {
    if (criminal.status === "Wanted") {
      return "ring-2 ring-[#665AEF] shadow-[0_0_14px_rgba(102,90,239,0.55)]";
    }
    if (criminal.status === "Under Surveillance") {
      return "ring-2 ring-[#a594fd]/80 shadow-[0_0_10px_rgba(165,148,253,0.4)]";
    }
    if (criminal.status === "In Custody") {
      return "ring-2 ring-[#5749DF]/70 shadow-[0_0_8px_rgba(87,73,223,0.3)]";
    }
    if (criminal.riskLevel === "High") {
      return "ring-2 ring-[#665AEF]/90 shadow-[0_0_12px_rgba(102,90,239,0.45)]";
    }
    return "ring-1.5 ring-[#665AEF]/40 shadow-[0_0_6px_rgba(102,90,239,0.2)]";
  };

  const renderStatusBadge = () => {
    switch (criminal.status) {
      case "Active":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-400 whitespace-nowrap shrink-0">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        );
      case "Wanted":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-rose-500/40 bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-medium text-rose-400 whitespace-nowrap shrink-0">
            <span className="size-1.5 rounded-full bg-rose-400 animate-pulse" />
            Wanted
          </span>
        );
      case "In Custody":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-blue-500/40 bg-blue-500/15 px-1.5 py-0.5 text-[10px] font-medium text-blue-400 whitespace-nowrap shrink-0">
            In Custody
          </span>
        );
      case "Under Surveillance":
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400 whitespace-nowrap shrink-0">
            Surveillance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md border border-border/70 bg-muted/40 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground whitespace-nowrap shrink-0">
            {criminal.status}
          </span>
        );
    }
  };

  const renderRiskBadge = () => {
    switch (criminal.riskLevel) {
      case "High":
        return (
          <span className="inline-flex items-center rounded-md border border-rose-500/40 bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-rose-400 whitespace-nowrap shrink-0">
            High Risk
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center rounded-md border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400 whitespace-nowrap shrink-0">
            Medium
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400 whitespace-nowrap shrink-0">
            Low
          </span>
        );
    }
  };

  return (
    <div
      onClick={() => onOpenPreview(criminal.id)}
      className={cn(
        "relative rounded-xl border-2 p-3.5 transition-all duration-200 cursor-pointer select-none space-y-3",
        isSelected
          ? "border-[#665AEF] bg-[#665AEF]/12 shadow-sm shadow-[#665AEF]/15"
          : isActive
          ? "border-border bg-card/85 shadow-sm"
          : "border-border/70 bg-card/50 hover:border-border hover:bg-card/75"
      )}
    >
      {/* 1. Header: Avatar + Identity + Risk Pill + 3-Dots */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
          {/* Avatar with dynamic aura */}
          <div className={cn("rounded-full shrink-0 transition-transform", getAvatarRingClass())}>
            <SuspectAvatar
              mugshotUrl={criminal.mugshotUrl}
              firstName={criminal.firstName}
              lastName={criminal.lastName}
              status={criminal.status as any}
              riskLevel={criminal.riskLevel as any}
              size="md"
              className="size-11 sm:size-12 rounded-full"
            />
          </div>

          {/* Name & ID */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <Link
                href={`/dashboard/criminals/${profileSlug}`}
                onClick={(e) => e.stopPropagation()}
                className="font-bold text-sm sm:text-base text-foreground hover:text-[#a594fd] transition-colors truncate"
              >
                {criminal.firstName} {criminal.lastName}
              </Link>
            </div>

            <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
              <span className="font-mono text-[10px] font-semibold tracking-wider text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/60 whitespace-nowrap shrink-0">
                {criminal.criminalId}
              </span>
              {criminal.alias && (
                <span className="text-[11px] text-muted-foreground truncate italic min-w-0">
                  &ldquo;{criminal.alias}&rdquo;
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Top-Right Badges & Menu */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          {renderRiskBadge()}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={(e) => e.stopPropagation()}
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 cursor-pointer"
                  aria-label="Suspect actions"
                />
              }
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="w-48 p-1.5 rounded-xl border-2 border-border bg-card/95 backdrop-blur-xl shadow-xl z-50"
            >
              <DropdownMenuItem
                render={<Link href={`/dashboard/criminals/${profileSlug}`} />}
                className="flex items-center gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted cursor-pointer font-medium"
              >
                <User className="size-3.5 text-muted-foreground" />
                <span>View Full Dossier</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                render={<Link href={`/dashboard/criminals/${profileSlug}/edit`} />}
                className="flex items-center gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted cursor-pointer font-medium"
              >
                <PenLine className="size-3.5 text-muted-foreground" />
                <span>Edit Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleToggleWatchlist}
                disabled={isTogglingWatchlist}
                className="flex items-center gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-amber-500/10 text-amber-300 cursor-pointer font-medium"
              >
                <Shield className="size-3.5 text-amber-400" />
                <span>{criminal.status === "Wanted" ? "Remove Wanted" : "Add to Watchlist"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect();
                }}
                className="flex items-center gap-2 text-xs py-2 px-2.5 rounded-md hover:bg-muted cursor-pointer font-medium text-muted-foreground"
              >
                <FileText className="size-3.5" />
                <span>{isSelected ? "Deselect Record" : "Select Record"}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 2. Middle Intelligence Matrix */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/40 text-xs">
        {/* Crime Categories */}
        <div className="flex items-center gap-1.5 overflow-hidden">
          <span className="text-[10px] text-muted-foreground shrink-0">Crime:</span>
          <span className="inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium bg-[#665AEF]/15 text-[#a594fd] border border-[#665AEF]/30 truncate">
            {criminal.crimeCategories[0] || "General"}
          </span>
          {criminal.crimeCategories.length > 1 && (
            <span className="inline-flex items-center rounded-md px-1 py-0.5 text-[9px] font-semibold bg-muted/60 text-muted-foreground border border-border/60 shrink-0">
              +{criminal.crimeCategories.length - 1}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center justify-end gap-1.5">
          <span className="text-[10px] text-muted-foreground">Status:</span>
          {renderStatusBadge()}
        </div>

        {/* Age / DOB */}
        <div className="flex items-center gap-1.5 text-muted-foreground truncate">
          <Calendar className="size-3 text-muted-foreground/70 shrink-0" />
          <span className="text-[11px] text-foreground/80 truncate">
            {criminal.age ? `${criminal.age} yrs` : "Age N/A"}
            {criminal.gender ? ` • ${criminal.gender}` : ""}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center justify-end gap-1.5 text-muted-foreground truncate">
          <MapPin className="size-3 text-muted-foreground/70 shrink-0" />
          <span
            className="text-[11px] text-foreground/80 truncate max-w-36 text-right"
            title={criminal.lastKnownLocation}
          >
            {criminal.lastKnownLocation || "Unknown"}
          </span>
        </div>
      </div>

      {/* 3. Bottom Quick Actions: Checkbox + Watchlist + View Dossier */}
      <div
        className="flex items-center justify-between gap-2 pt-2 border-t border-border/40"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Selection Checkbox with 44px tap target */}
        <label
          className="flex items-center gap-2 cursor-pointer py-1 px-1 -ml-1 text-xs text-muted-foreground hover:text-foreground touch-manipulation"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            aria-label={`Select ${criminal.criminalId}`}
            className="size-4.5 rounded data-[state=checked]:bg-[#665AEF] data-[state=checked]:border-[#665AEF]"
          />
          <span className="text-[11px] font-medium">Select</span>
        </label>

        {/* Right side buttons */}
        <div className="flex items-center gap-1.5">
          {/* Watchlist Quick Button */}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={handleToggleWatchlist}
            disabled={isTogglingWatchlist}
            className={cn(
              "h-7 px-2.5 rounded-lg border text-[11px] font-medium cursor-pointer gap-1 transition-colors",
              criminal.status === "Wanted"
                ? "border-rose-500/50 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25"
                : "border-border/80 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Shield className="size-3" />
            <span>{criminal.status === "Wanted" ? "Wanted" : "Watch"}</span>
          </Button>

          {/* Quick Preview Sheet Button */}
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onOpenPreview(criminal.id)}
            className="h-7 px-2.5 rounded-lg bg-[#665AEF]/10 hover:bg-[#665AEF]/20 text-[#a594fd] hover:text-white text-[11px] font-semibold cursor-pointer gap-1 transition-colors"
          >
            <span>Dossier</span>
            <ArrowRight className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

