"use client"

import * as React from "react"
import { authClient } from "@/lib/auth-client"
import { DateRangePicker } from "@/components/date-range-picker"

interface DashboardHeaderProps {
  initialUserName?: string
}

export function DashboardHeader({ initialUserName }: DashboardHeaderProps) {
  const { data: session } = authClient.useSession()
  const userName = session?.user?.name || initialUserName || "Investigator"

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-4 lg:px-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Welcome back, {userName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s an overview of your investigations and activity.
        </p>
      </div>
      <div className="flex items-center">
        <DateRangePicker />
      </div>
    </div>
  )
}
