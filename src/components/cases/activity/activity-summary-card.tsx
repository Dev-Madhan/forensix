"use client";

import React from "react";
import Link from "next/link";
import {
  BarChart3,
  ArrowRight,
  Target,
  FileText,
  User,
  Edit3,
  Brain,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ActivitySummaryStats } from "./types";

interface ActivitySummaryCardProps {
  stats: ActivitySummaryStats;
  caseNumber?: string;
}

export function ActivitySummaryCard({ stats, caseNumber }: ActivitySummaryCardProps) {
  const summaryItems = [
    {
      id: "total",
      label: "Total Activities",
      count: stats.total,
      icon: Target,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/15 border-blue-500/30",
    },
    {
      id: "evidence",
      label: "Evidence Actions",
      count: stats.evidenceCount,
      icon: FileText,
      iconColor: "text-blue-400",
      iconBg: "bg-blue-500/15 border-blue-500/30",
    },
    {
      id: "suspect",
      label: "Suspect Actions",
      count: stats.suspectCount,
      icon: User,
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/15 border-rose-500/30",
    },
    {
      id: "case",
      label: "Case Updates",
      count: stats.caseUpdatesCount,
      icon: Edit3,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/15 border-purple-500/30",
    },
    {
      id: "analysis",
      label: "AI Analysis",
      count: stats.aiAnalysisCount,
      icon: Brain,
      iconColor: "text-teal-400",
      iconBg: "bg-teal-500/15 border-teal-500/30",
    },
    {
      id: "deletions",
      label: "Deletions",
      count: stats.deletionsCount,
      icon: Trash2,
      iconColor: "text-rose-400",
      iconBg: "bg-rose-500/15 border-rose-500/30",
    },
  ];

  return (
    <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b-2 border-border/60">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-blue-400 shrink-0" />
          <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
            Activity Summary
          </CardTitle>
        </div>
        <Link
          href="/dashboard/reports"
          className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center gap-1"
        >
          <span>View Reports</span>
          <ArrowRight className="size-3" />
        </Link>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-2.5">
          {summaryItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-3 rounded-lg border-2 border-border/70 bg-card/60 flex items-center justify-between gap-2.5 transition-all hover:border-border hover:bg-card/90"
              >
                <div className="size-8 rounded-lg border flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: item.iconBg.includes("blue")
                      ? "rgba(59, 130, 246, 0.12)"
                      : item.iconBg.includes("rose")
                      ? "rgba(244, 63, 94, 0.12)"
                      : item.iconBg.includes("purple")
                      ? "rgba(168, 85, 247, 0.12)"
                      : "rgba(20, 184, 166, 0.12)",
                    borderColor: item.iconBg.includes("blue")
                      ? "rgba(59, 130, 246, 0.3)"
                      : item.iconBg.includes("rose")
                      ? "rgba(244, 63, 94, 0.3)"
                      : item.iconBg.includes("purple")
                      ? "rgba(168, 85, 247, 0.3)"
                      : "rgba(20, 184, 166, 0.3)",
                  }}
                >
                  <Icon className={cn("size-4", item.iconColor)} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-lg sm:text-xl font-bold font-heading text-foreground tabular-nums block leading-tight">
                    {item.count}
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate block">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
