import { Suspense } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { DashboardContent } from "@/features/dashboard/components/dashboard-content"
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  const userName = session?.user?.name || "Investigator"

  let metrics = {
    totalCases: 0,
    totalSuspects: 0,
    sketchesGenerated: 0,
    casesResolved: 0,
  };

  let recentCases: Array<{
    id: string;
    caseId: string;
    title: string;
    date: string;
    status: "Under Investigation" | "Open" | "Solved" | "Closed";
  }> = [];

  try {
    const [totalCases, totalSuspects, sketchesGenerated, casesResolved, rawRecentCases] =
      await Promise.all([
        prisma.case.count(),
        prisma.criminal.count(),
        prisma.sketch.count(),
        prisma.case.count({ where: { status: { in: ["CLOSED", "ARCHIVED"] } } }),
        prisma.case.findMany({
          orderBy: { createdAt: "desc" },
          take: 5,
        }),
      ]);

    metrics = {
      totalCases,
      totalSuspects,
      sketchesGenerated,
      casesResolved,
    };

    recentCases = rawRecentCases.map((c) => ({
      id: c.id,
      caseId: c.caseNumber,
      title: c.title,
      date: new Date(c.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      status:
        c.status === "UNDER_INVESTIGATION"
          ? ("Under Investigation" as const)
          : c.status === "CLOSED" || c.status === "ARCHIVED"
          ? ("Closed" as const)
          : ("Open" as const),
    }));
  } catch (error) {
    console.error("Dashboard database query error:", error);
  }

  return (
    <SidebarProvider>
      <AppSidebar />
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2 transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
            <Suspense fallback={<DashboardSkeleton />}>
              <DashboardContent
                userName={userName}
                metrics={metrics}
                recentCases={recentCases}
              />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
