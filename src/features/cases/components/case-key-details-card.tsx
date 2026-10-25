"use client";

import * as React from "react";
import {
  FileText,
  MapPin,
  Calendar,
  Tag,
  ShieldAlert,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ResolvedCaseDetail } from "@/features/cases/resolve-case";
import { resolveCaseLocation } from "@/lib/case-location-resolver";

interface CaseKeyDetailsCardProps {
  caseData: ResolvedCaseDetail;
  className?: string;
}

export function CaseKeyDetailsCard({
  caseData,
  className,
}: CaseKeyDetailsCardProps) {
  // Assigned user is resolved deterministically from caseData (identical on SSR & client)
  const assignedUserName = caseData.assignedToName || "Madhan Kumar";

  const renderPriorityValue = (priority: string) => {
    const p = (priority || "").toUpperCase();
    if (p === "CRITICAL" || p === "HIGH") {
      return <span className="font-semibold text-rose-500">High</span>;
    }
    if (p === "MEDIUM") {
      return <span className="font-semibold text-amber-500">Medium</span>;
    }
    return <span className="font-semibold text-blue-500">Low</span>;
  };

  const resolvedLoc = React.useMemo(
    () => resolveCaseLocation(caseData),
    [caseData]
  );

  const detailsList = [
    {
      id: "location",
      label: "Location",
      icon: MapPin,
      value: resolvedLoc.title
        ? `${resolvedLoc.title}, ${resolvedLoc.city}`
        : caseData.location || "Chennai, TN",
    },
    {
      id: "dateTime",
      label: "Date & Time",
      icon: Calendar,
      value: `${caseData.dateReported}, ${caseData.timeOfIncident}`,
    },
    ...(caseData.status?.toLowerCase().includes("closed") ||
    caseData.status?.toLowerCase().includes("solved") ||
    caseData.status?.toLowerCase().includes("resolved") ||
    caseData.rawStatus === "CLOSED"
      ? [
          {
            id: "closedDate",
            label: "Date Closed",
            icon: CheckCircle2,
            value: caseData.closedDate || "Oct 3, 2026",
          },
        ]
      : []),
    {
      id: "caseType",
      label: "Case Type",
      icon: Tag,
      value: caseData.caseType || "Theft",
    },
    {
      id: "priority",
      label: "Priority",
      icon: ShieldAlert,
      customValue: renderPriorityValue(caseData.priority),
    },
    {
      id: "assignedTo",
      label: "Assigned To",
      icon: User,
      value: assignedUserName,
    },
    {
      id: "lastUpdated",
      label: "Last Updated",
      icon: Clock,
      value: caseData.lastUpdated || "Oct 5, 2026, 11:32 AM",
    },
  ];

  return (
    <Card
      className={`border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs ${
        className || ""
      }`}
    >
      {/* Header with direct icon, title */}
      <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b-2 border-border/60">
        <div className="flex items-center gap-2.5">
          <FileText className="size-4.5 text-[#0070F3] shrink-0" />
          <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
            Key Details
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4 px-4 sm:px-5">
        <div className="flex flex-col divide-y divide-border/25 text-xs sm:text-sm">
          {detailsList.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-2.5 first:pt-1 last:pb-1 gap-3"
              >
                <div className="flex items-center gap-2.5 text-muted-foreground shrink-0">
                  <Icon className="size-4 text-muted-foreground/80" />
                  <span className="font-normal">{item.label}</span>
                </div>
                <div
                  className="font-medium text-foreground text-right truncate"
                  suppressHydrationWarning
                >
                  {item.customValue ? item.customValue : item.value}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
