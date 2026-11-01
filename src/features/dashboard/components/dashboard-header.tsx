"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { DateRangePicker } from "@/components/shared/date-range-picker";

interface DashboardHeaderProps {
  initialUserName?: string;
  isConnected?: boolean;
}

export function DashboardHeader({ initialUserName, isConnected = true }: DashboardHeaderProps) {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || initialUserName || "Investigator";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {userName}
          </h1>
          <div
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
              isConnected
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-amber-500/30 bg-amber-500/10 text-amber-400"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
              }`}
            />
            <span>{isConnected ? "Live Telemetry Active" : "Connecting..."}</span>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Forensic command center • Real-time database telemetry & investigation ledger.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div
          className={`sm:hidden inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-medium transition-colors ${
            isConnected
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-amber-500/30 bg-amber-500/10 text-amber-400"
          }`}
        >
          <span
            className={`size-1.5 rounded-full ${
              isConnected ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
            }`}
          />
          <span>{isConnected ? "Live" : "Offline"}</span>
        </div>
        <DateRangePicker />
      </div>
    </div>
  );
}
