"use client";

import * as React from "react";
import Link from "next/link";
import { type CriminalItem } from "@/features/criminals/types";
import { getCriminalSlug } from "@/features/criminals/slug";
import { formatCriminalDob, computeCriminalAge } from "@/features/criminals/formatters";
import { SuspectAvatar } from "./suspect-avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Globe,
  MapPin,
  Shield,
  User,
  X,
  ArrowRight,
  PenLine,
  FileText,
  Fingerprint,
} from "lucide-react";
import { toast } from "sonner";
import { updateCriminalStatusAndRisk } from "@/features/criminals/actions";
import { cn } from "@/lib/utils";

interface CriminalProfileDrawerProps {
  criminal: CriminalItem | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CriminalProfileDrawer({
  criminal,
  isOpen,
  onOpenChange,
}: CriminalProfileDrawerProps) {
  if (!criminal) return null;

  const profileSlug = getCriminalSlug(criminal);

  const renderRiskTag = () => {
    switch (criminal.riskLevel) {
      case "High":
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            High Risk
          </span>
        );
      case "Medium":
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            Medium Risk
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            Low Risk
          </span>
        );
    }
  };

  const renderStatusDot = () => {
    const isGreen = criminal.status === "Active";
    const isRed = criminal.status === "Wanted";
    const isBlue = criminal.status === "In Custody";
    const isAmber = criminal.status === "Under Surveillance";

    const dotColor = isGreen
      ? "bg-emerald-400"
      : isRed
      ? "bg-rose-400"
      : isBlue
      ? "bg-blue-400"
      : isAmber
      ? "bg-amber-400"
      : "bg-muted-foreground";

    const textColor = isGreen
      ? "text-emerald-400"
      : isRed
      ? "text-rose-400"
      : isBlue
      ? "text-blue-400"
      : isAmber
      ? "text-amber-400"
      : "text-muted-foreground";

    return (
      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${textColor}`}>
        <span className={`size-1.5 rounded-full ${dotColor}`} />
        {criminal.status}
      </span>
    );
  };

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange} showSwipeHandle>
      <DrawerContent className="max-h-[88dvh] rounded-t-2xl border-t-2 border-border/80 bg-card/95 backdrop-blur-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header: Photo + Name + Close */}
        <DrawerHeader className="p-4 pb-2 border-b border-border/50 text-left">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative size-14 rounded-xl overflow-hidden border-2 border-border/80 bg-black/40 shrink-0 shadow-inner">
                <SuspectAvatar
                  mugshotUrl={criminal.mugshotUrl}
                  firstName={criminal.firstName}
                  lastName={criminal.lastName}
                  status={criminal.status as any}
                  riskLevel={criminal.riskLevel as any}
                  size="fill"
                  className="size-full rounded-none"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <DrawerTitle className="text-base font-bold text-foreground font-heading truncate">
                    {criminal.firstName} {criminal.lastName}
                  </DrawerTitle>
                  {renderRiskTag()}
                </div>
                <DrawerDescription className="font-mono text-xs text-muted-foreground tracking-wider mt-0.5 flex items-center gap-1.5 flex-wrap">
                  <span className="whitespace-nowrap shrink-0">{criminal.criminalId}</span>
                  {criminal.alias && <span className="truncate italic max-w-44">• &ldquo;{criminal.alias}&rdquo;</span>}
                </DrawerDescription>
              </div>
            </div>

            <DrawerClose
              render={
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-8 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer -mr-1 -mt-1"
                />
              }
            >
              <X className="size-4" />
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Scrollable Forensic Intelligence Details */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden text-xs">
          {/* Key Quick Facts Grid */}
          <div className="grid grid-cols-2 gap-2.5 rounded-xl border border-border/60 bg-muted/20 p-3">
            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="size-3 text-muted-foreground/70" />
                <span>Date of Birth</span>
              </span>
              <p className="font-medium text-foreground text-xs">
                {formatCriminalDob(criminal.dateOfBirth)} ({computeCriminalAge(criminal.dateOfBirth, criminal.age)} yrs)
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <User className="size-3 text-muted-foreground/70" />
                <span>Gender / Nationality</span>
              </span>
              <p className="font-medium text-foreground text-xs">
                {criminal.gender} • {criminal.nationality}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Shield className="size-3 text-muted-foreground/70" />
                <span>Status</span>
              </span>
              <div>{renderStatusDot()}</div>
            </div>

            <div className="space-y-0.5">
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <MapPin className="size-3 text-muted-foreground/70" />
                <span>Last Location</span>
              </span>
              <p className="font-medium text-foreground text-xs truncate" title={criminal.lastKnownLocation}>
                {criminal.lastKnownLocation || "Unknown"}
              </p>
            </div>
          </div>

          {/* Crime Categories */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-foreground/90 uppercase tracking-wider block">
              Crime Categories
            </span>
            <div className="flex flex-wrap gap-1.5">
              {criminal.crimeCategories.map((cat) => (
                <span
                  key={cat}
                  className="inline-flex items-center rounded-md px-2 py-0.5 text-xs font-normal bg-[#665AEF]/15 text-[#a594fd] border border-[#665AEF]/30"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>

          {/* Aliases */}
          {criminal.aliases && criminal.aliases.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-foreground/90 uppercase tracking-wider block">
                Known Aliases
              </span>
              <div className="flex flex-wrap gap-1.5">
                {criminal.aliases.map((alias) => (
                  <span
                    key={alias}
                    className="inline-flex items-center rounded-md px-2 py-0.5 text-xs bg-muted/40 text-muted-foreground border border-border/80"
                  >
                    {alias}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Physical Description Matrix */}
          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
            <span className="text-[11px] font-semibold text-foreground/90 uppercase tracking-wider block">
              Physical Features
            </span>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <div className="flex justify-between border-b border-border/30 pb-1">
                <span className="text-muted-foreground text-[11px]">Height</span>
                <span className="font-medium text-foreground">{criminal.height || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-1">
                <span className="text-muted-foreground text-[11px]">Weight</span>
                <span className="font-medium text-foreground">{criminal.weight || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-1">
                <span className="text-muted-foreground text-[11px]">Build</span>
                <span className="font-medium text-foreground">{criminal.build || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-1">
                <span className="text-muted-foreground text-[11px]">Complexion</span>
                <span className="font-medium text-foreground">{criminal.complexion || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-1">
                <span className="text-muted-foreground text-[11px]">Hair Color</span>
                <span className="font-medium text-foreground">{criminal.hairColor || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border/30 pb-1">
                <span className="text-muted-foreground text-[11px]">Eye Color</span>
                <span className="font-medium text-foreground">{criminal.eyeColor || "—"}</span>
              </div>
            </div>

            {criminal.distinctiveMarks && (
              <div className="pt-1.5 flex flex-col gap-0.5">
                <span className="text-[10px] text-muted-foreground font-medium">Distinctive Marks:</span>
                <p className="text-xs text-foreground font-medium italic">
                  {criminal.distinctiveMarks}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pinned Bottom Actions Strip in the Ergonomic Thumb Zone */}
        <DrawerFooter className="p-3 border-t border-border/60 bg-card/80 backdrop-blur-md flex flex-col gap-2 pb-[max(env(safe-area-inset-bottom,12px),12px)]">
          <Button
            className="w-full h-10 rounded-xl bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold shadow-md shadow-[#665AEF]/25 flex items-center justify-center gap-2 cursor-pointer"
            render={<Link href={`/dashboard/criminals/${profileSlug}`} />}
            nativeButton={false}
          >
            <span>View Complete Forensic Profile</span>
            <ArrowRight className="size-3.5" />
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const nextStatus = criminal.status === "Wanted" ? "ACTIVE" : "WANTED";
                toast.promise(
                  updateCriminalStatusAndRisk({
                    criminalId: criminal.id,
                    status: nextStatus,
                  }),
                  {
                    loading: "Updating watchlist status...",
                    success: `Status updated to ${nextStatus}`,
                    error: "Failed to update status",
                  }
                );
              }}
              className="h-9 rounded-lg border-2 border-border/80 text-xs font-medium cursor-pointer gap-1.5"
            >
              <Shield className="size-3.5 text-muted-foreground" />
              <span>{criminal.status === "Wanted" ? "Remove Wanted" : "Add Watchlist"}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              render={
                <Link
                  href={`/sketch?criminalId=${criminal.id}&alias=${encodeURIComponent(
                    criminal.alias || ""
                  )}`}
                />
              }
              nativeButton={false}
              className="h-9 rounded-lg border-2 border-border/80 text-xs font-medium cursor-pointer gap-1.5"
            >
              <PenLine className="size-3.5 text-muted-foreground" />
              <span>Generate Sketch</span>
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

