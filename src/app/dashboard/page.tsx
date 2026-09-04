import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  FolderSearch,
  Users,
  ShieldAlert,
  FileCheck2,
  Plus,
  ScanFace,
  ArrowRight,
  User,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Intelligence Hub | Forensix",
  description: "Forensic operations and intelligence command center.",
};

export default async function DashboardPage() {
  // Aggregate real operational metrics
  const [
    totalCases,
    criticalCases,
    wantedCriminals,
    totalEvidence,
    recentCases,
    recentCriminals,
  ] = await Promise.all([
    prisma.case.count(),
    prisma.case.count({ where: { priority: "CRITICAL" } }),
    prisma.criminal.count({ where: { status: "WANTED" } }),
    prisma.evidence.count(),
    prisma.case.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: { assignedTo: { select: { name: true } } },
    }),
    prisma.criminal.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = [
    {
      title: "Total Investigations",
      value: totalCases,
      desc: "All recorded cases",
      icon: FolderSearch,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Critical Threats",
      value: criticalCases,
      desc: "Urgent priority investigations",
      icon: ShieldAlert,
      color: "text-red-500",
      bg: "bg-red-500/10 border-red-500/20",
    },
    {
      title: "Wanted Suspects",
      value: wantedCriminals,
      desc: "Active arrest warrants",
      icon: Users,
      color: "text-amber-500",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
    {
      title: "Evidence Vault",
      value: totalEvidence,
      desc: "Verified S3 evidence objects",
      icon: FileCheck2,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10 border-emerald-500/20",
    },
  ];

  return (
    <div className="flex flex-col gap-8 p-6 max-w-7xl w-full mx-auto">
      {/* Welcome Banner & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-heading">
            Operational Intelligence Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time telemetry, active investigations, and biometric registry.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/dashboard/cases/new">
            <Button size="sm" className="gap-1.5 shadow-xs">
              <Plus className="size-4" />
              <span>Create Case</span>
            </Button>
          </Link>
          <Link href="/dashboard/criminals/new">
            <Button size="sm" variant="outline" className="gap-1.5 shadow-xs">
              <Plus className="size-4" />
              <span>Add Suspect</span>
            </Button>
          </Link>
          <Link href="/sketch">
            <Button size="sm" variant="secondary" className="gap-1.5 shadow-xs">
              <ScanFace className="size-4" />
              <span>AI Sketch</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => (
          <Card key={item.title} className="shadow-xs border-border/80">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {item.title}
              </CardTitle>
              <div className={`p-2 rounded-lg border ${item.bg}`}>
                <item.icon className={`size-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono tracking-tight">{item.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Investigations Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Active Investigations</h2>
            <Link
              href="/dashboard/cases"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              <span>View all cases</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/30">
                <tr className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Case #</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Lead</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentCases.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition">
                    <td className="py-3 px-4 font-mono font-medium text-xs">
                      <Link href={`/dashboard/cases/${c.id}`} className="text-primary hover:underline">
                        {c.caseNumber}
                      </Link>
                    </td>
                    <td className="py-3 px-4 font-medium truncate max-w-[200px]">{c.title}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          c.priority === "CRITICAL"
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : c.priority === "HIGH"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
                        {c.status.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-xs text-muted-foreground">
                      {c.assignedTo.name}
                    </td>
                  </tr>
                ))}
                {recentCases.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-xs text-muted-foreground">
                      No active cases recorded. Create your first investigation above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recently Registered Suspects */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight">Recent Suspects</h2>
            <Link
              href="/dashboard/criminals"
              className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
            >
              <span>View registry</span>
              <ArrowRight className="size-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {recentCriminals.map((crm) => (
              <Link
                key={crm.id}
                href={`/dashboard/criminals/${crm.id}`}
                className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/40 transition shadow-xs group"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border shrink-0">
                    <User className="size-5 text-muted-foreground/70" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition">
                      {crm.firstName} {crm.lastName}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {crm.alias ? `"${crm.alias}"` : `#${crm.criminalId}`}
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                    crm.status === "WANTED"
                      ? "bg-destructive text-destructive-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {crm.status}
                </span>
              </Link>
            ))}
            {recentCriminals.length === 0 && (
              <div className="p-8 text-center rounded-xl border border-dashed text-xs text-muted-foreground">
                No suspect profiles recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
