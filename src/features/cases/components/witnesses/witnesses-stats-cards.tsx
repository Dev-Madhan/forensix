"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Users, PhoneCall, ShieldAlert, Sparkles } from "lucide-react";
import { RollingNumber } from "@/components/ui/rolling-number";
import type { WitnessItem } from "../../witnesses/types";

interface WitnessesStatsCardsProps {
  witnesses: WitnessItem[];
}

export function WitnessesStatsCards({ witnesses }: WitnessesStatsCardsProps) {
  const total = witnesses.length;
  const activeContactable = witnesses.filter(
    (w) => w.availabilityStatus === "ACTIVE_AVAILABLE" && (w.primaryPhone || w.email)
  ).length;
  const highCredibility = witnesses.filter(
    (w) => w.credibility === "HIGH" || w.credibility === "MEDIUM"
  ).length;
  const protectedCount = witnesses.filter((w) => w.isProtected).length;

  const stats = [
    {
      title: "Total Witnesses",
      value: total,
      subtext: `${witnesses.filter((w) => w.witnessType === "EYEWITNESS").length} Direct Eyewitnesses`,
      icon: Users,
      iconColor: "text-[#8579ff]",
      bgColor: "bg-[#8579ff]/10",
      borderColor: "border-[#8579ff]/20",
    },
    {
      title: "Active Contactable",
      value: activeContactable,
      subtext: "Verified phone/address for future leads",
      icon: PhoneCall,
      iconColor: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Reliable Testimony",
      value: highCredibility,
      subtext: "Corroborated / High credibility rating",
      icon: Sparkles,
      iconColor: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      title: "Protected Identity",
      value: protectedCount,
      subtext: protectedCount > 0 ? "Under security / protection protocol" : "Standard confidentiality",
      icon: ShieldAlert,
      iconColor: protectedCount > 0 ? "text-amber-400" : "text-muted-foreground",
      bgColor: protectedCount > 0 ? "bg-amber-500/10" : "bg-muted/10",
      borderColor: protectedCount > 0 ? "border-amber-500/20" : "border-border/40",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card
            key={i}
            className="border border-border/80 bg-card/40 hover:bg-card/70 hover:border-border transition-all p-3.5 sm:p-4 rounded-xl shadow-2xs flex flex-col justify-between"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[12px] sm:text-xs font-medium text-muted-foreground tracking-tight">
                {stat.title}
              </span>
              <div
                className={`p-1.5 sm:p-2 rounded-lg border ${stat.bgColor} ${stat.borderColor}`}
              >
                <Icon className={`size-3.5 sm:size-4 ${stat.iconColor}`} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground">
                <RollingNumber value={stat.value} />
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground/80 mt-0.5 truncate">
                {stat.subtext}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
