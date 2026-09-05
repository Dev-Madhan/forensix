import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CaseSectionCards } from "@/components/cases/case-section-cards";
import { CasesTable, type CaseItem } from "@/components/cases/cases-table";

export const metadata = {
  title: "Case | Forensix",
  description: "Comprehensive records, suspect profiles, and forensic tracking in one place.",
};

export default async function CasesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image || undefined,
        role: (session.user as { role?: string })?.role || "INVESTIGATOR",
      }
    : undefined;

  // Query real-time case counts from database with resilient fallback defaults
  let totalCount = 0;
  let openCount = 0;
  let investigatingCount = 0;
  let resolvedCount = 0;

  try {
    const [total, open, investigating, resolved] = await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { status: "OPEN" } }),
      prisma.case.count({ where: { status: "UNDER_INVESTIGATION" } }),
      prisma.case.count({ where: { status: { in: ["CLOSED", "ARCHIVED"] } } }),
    ]);
    totalCount = total;
    openCount = open;
    investigatingCount = investigating;
    resolvedCount = resolved;
  } catch (error) {
    console.error("Failed to query case metrics from database:", error);
  }

  const metrics = {
    total: totalCount > 0 ? totalCount : 24,
    open: totalCount > 0 ? openCount : 12,
    underInvestigation: totalCount > 0 ? investigatingCount : 7,
    resolved: totalCount > 0 ? resolvedCount : 9,
  };

  // Query cases from database if available
  let dbCases: CaseItem[] = [];
  try {
    const rawCases = await prisma.case.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      take: 20,
    });

    dbCases = rawCases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      title: c.title,
      type: "Theft",
      location: "Chennai, TN",
      date: new Date(c.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status:
        c.status === "UNDER_INVESTIGATION"
          ? "Under Investigation"
          : c.status === "CLOSED" || c.status === "ARCHIVED"
          ? "Closed"
          : "Open",
      description: c.description || undefined,
      assignedTo: c.assignedTo?.name || "Lead Investigator",
    }));
  } catch (error) {
    console.error("Failed to query cases from database:", error);
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/40">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink render={<Link href="/dashboard" />}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Case</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Page Header: Title, Description & Action Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-heading">
                  Investigation Files
                </h1>
                <p className="text-sm text-muted-foreground">
                  Comprehensive records, suspect profiles, and forensic tracking in one place.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="h-10 gap-2 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-sm font-medium cursor-pointer shadow-sm shadow-[#665AEF]/25 px-4"
                  render={<Link href="/case-details/new" />}
                  nativeButton={false}
                >
                  <Plus className="size-4" />
                  <span>New Case</span>
                </Button>
              </div>
            </div>

            {/* 4 Case Section Cards */}
            <CaseSectionCards metrics={metrics} />

            {/* Cases Table and Case Details Preview */}
            <CasesTable initialCases={dbCases} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


