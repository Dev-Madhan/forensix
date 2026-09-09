"use client";

import React from "react";
import { Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TimelineMilestone } from "./types";

interface ActivityTimelineCardProps {
  milestones: TimelineMilestone[];
  className?: string;
}

export function ActivityTimelineCard({ milestones, className }: ActivityTimelineCardProps) {
  const getDotColor = (color: TimelineMilestone["dotColor"]) => {
    switch (color) {
      case "red":
        return "bg-rose-500 ring-4 ring-rose-500/20";
      case "emerald":
        return "bg-teal-400 ring-4 ring-teal-400/20";
      case "amber":
        return "bg-amber-400 ring-4 ring-amber-400/20";
      case "purple":
        return "bg-purple-400 ring-4 ring-purple-400/20";
      case "blue":
      default:
        return "bg-blue-500 ring-4 ring-blue-500/20";
    }
  };

  return (
    <Card className={cn("border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden", className)}>
      <CardHeader className="pb-3.5 border-b-2 border-border/60">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-blue-400 shrink-0" />
          <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
            Activity Timeline
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-5 pb-6">
        <div className="relative pl-1">
          {milestones.map((milestone, index) => {
            const isLast = index === milestones.length - 1;

            return (
              <div
                key={milestone.id}
                className={cn("relative flex items-start gap-3.5", !isLast && "pb-6")}
              >
                {/* Connecting vertical line segment — strictly stops at the last dot */}
                {!isLast && (
                  <div
                    className="absolute left-[5.5px] top-3.5 bottom-0 w-0.5 bg-border/80"
                    aria-hidden="true"
                  />
                )}

                {/* Milestone colored dot */}
                <div
                  className={cn(
                    "relative z-10 size-3 rounded-full border-2 border-card mt-1 shrink-0 transition-transform hover:scale-125",
                    getDotColor(milestone.dotColor)
                  )}
                />

                {/* Milestone Details: Title & Formatted Timestamp */}
                <div className="space-y-0.5 min-w-0">
                  <p className="font-semibold text-foreground text-xs sm:text-sm leading-tight">
                    {milestone.title}
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground font-mono">
                    {milestone.formattedTime}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
