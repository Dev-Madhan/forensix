"use client";

import React from "react";
import { Shield, Fingerprint, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { SuspectItem } from "./types";

interface SuspectKeyInfoCardProps {
  suspect: SuspectItem;
}

export function SuspectKeyInfoCard({ suspect }: SuspectKeyInfoCardProps) {
  return (
    <div className="space-y-3.5">
      {/* 1. Key Information Card */}
      <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
        <CardHeader className="p-3.5 sm:p-4 pb-2 border-b-2 border-border/40 flex flex-row items-center gap-2 space-y-0">
          <Shield className="size-4.5 text-blue-400 shrink-0" />
          <CardTitle className="text-xs sm:text-sm font-bold font-heading text-foreground">
            Key Information
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3.5 sm:p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Date of Birth</span>
            <span className="font-medium text-foreground">
              {suspect.dob || "May 12, 1992"} ({suspect.age || 34} years)
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Gender</span>
            <span className="font-medium text-foreground">
              {suspect.gender || "Male"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Nationality</span>
            <span className="font-medium text-foreground">
              {suspect.nationality || "Indian"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Known Addresses</span>
            <span className="font-medium text-foreground text-right truncate max-w-45">
              {suspect.knownAddresses || "T. Nagar, Chennai, TN"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Phone Number</span>
            <span className="font-medium text-foreground">
              {suspect.phone || "+91 98765 43210"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Occupation</span>
            <span className="font-medium text-foreground">
              {suspect.occupation || "Unknown"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 pt-1.5">
            <span className="text-muted-foreground">Criminal Record</span>
            <button
              type="button"
              onClick={() =>
                toast.info(`Viewing criminal records for ${suspect.name}`)
              }
              className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              <span>{suspect.criminalRecord || "3 prior cases"}</span>
              <ArrowRight className="size-3" />
            </button>
          </div>
        </CardContent>
      </Card>

      {/* 2. Physical Description Card */}
      <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
        <CardHeader className="p-3.5 sm:p-4 pb-2 border-b-2 border-border/40 flex flex-row items-center gap-2 space-y-0">
          <Fingerprint className="size-4.5 text-indigo-400 shrink-0" />
          <CardTitle className="text-xs sm:text-sm font-bold font-heading text-foreground">
            Physical Description
          </CardTitle>
        </CardHeader>

        <CardContent className="p-3.5 sm:p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Height</span>
            <span className="font-medium text-foreground">
              {suspect.height || "5'10\" (178 cm)"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Build</span>
            <span className="font-medium text-foreground">
              {suspect.build || "Medium"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Complexion</span>
            <span className="font-medium text-foreground">
              {suspect.complexion || "Wheatish"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Hair Color</span>
            <span className="font-medium text-foreground">
              {suspect.hairColor || "Black"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground">Eye Color</span>
            <span className="font-medium text-foreground">
              {suspect.eyeColor || "Brown"}
            </span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground">Identifying Marks</span>
            <span className="font-medium text-foreground text-right truncate max-w-45">
              {suspect.identifyingMarks || "Scar on left eyebrow"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
