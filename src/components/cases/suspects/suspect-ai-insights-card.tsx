"use client";

import React from "react";
import { ScanFace, Users, AlertTriangle, ArrowRight, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export function SuspectAiInsightsCard() {
  return (
    <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden">
      <CardHeader className="p-3.5 sm:p-4 pb-2 border-b-2 border-border/40 flex flex-row items-center gap-2 space-y-0">
        <Sparkles className="size-4.5 text-blue-400 shrink-0" />
        <div>
          <CardTitle className="text-xs sm:text-sm font-bold font-heading text-foreground">
            AI Insights
          </CardTitle>
          <p className="text-[11px] text-muted-foreground">
            Analysis based on available evidence and criminal records.
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 sm:p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* 1. Face Match */}
          <div className="p-3 rounded-lg border-2 border-border/80 bg-card/60 space-y-2 flex flex-col justify-between">
            <div className="flex items-start gap-2.5">
              <ScanFace className="size-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-semibold text-foreground">Face Match</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Primary suspect matches with 2 records in criminal database.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Opening database facial recognition matches")}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors pt-1 cursor-pointer"
            >
              <span>View Matches</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* 2. Possible Associate */}
          <div className="p-3 rounded-lg border-2 border-border/80 bg-card/60 space-y-2 flex flex-col justify-between">
            <div className="flex items-start gap-2.5">
              <Users className="size-5 text-cyan-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-semibold text-foreground">Possible Associate</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  2nd suspect may have communication links.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Analyzing communication and associate graph")}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors pt-1 cursor-pointer"
            >
              <span>View Details</span>
              <ArrowRight className="size-3" />
            </button>
          </div>

          {/* 3. Risk Assessment */}
          <div className="p-3 rounded-lg border-2 border-border/80 bg-card/60 space-y-2 flex flex-col justify-between">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="size-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 min-w-0">
                <h4 className="text-xs font-semibold text-foreground">Risk Assessment</h4>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Primary suspect considered high risk based on past records.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => toast.info("Opening threat risk assessment model")}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors pt-1 cursor-pointer"
            >
              <span>View Analysis</span>
              <ArrowRight className="size-3" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
