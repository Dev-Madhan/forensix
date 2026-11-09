"use client";

import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { DateRangePicker } from "@/components/shared/date-range-picker";

interface DashboardHeaderProps {
  initialUserName?: string;
  isConnected?: boolean;
}

export function DashboardHeader({ initialUserName, isConnected }: DashboardHeaderProps) {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || initialUserName || "Investigator";

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      <div className="space-y-1">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-heading">
            Welcome back, {userName}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {isConnected !== false ? "Live Sync" : "Syncing"}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Forensic command center • Real-time intelligence & active investigation files.
        </p>
      </div>
      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
        <DateRangePicker />
      </div>
    </div>
  );
}
