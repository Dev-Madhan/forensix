import { Suspense } from "react";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { DashboardContent } from "@/features/dashboard/components/dashboard-content";
import { DashboardSkeleton } from "@/features/dashboard/components/dashboard-skeleton";
import {
  getDashboardMetrics,
  getDashboardChartData,
  getRecentCases,
  getRecentSketches,
  type DashboardMetrics,
  type ActivityChartPoint,
  type RecentCaseItem,
  type RecentSketchItem,
} from "@/features/dashboard/queries";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const userName = session?.user?.name || "Investigator";

  let metrics: DashboardMetrics = {
    totalCases: 1,
    totalCasesDelta: "+0%",
    totalSuspects: 1,
    totalSuspectsDelta: "+0%",
    sketchesGenerated: 0,
    sketchesGeneratedDelta: "+0%",
    casesResolved: 0,
    casesResolvedDelta: "+0%",
    activeSightings: 1,
  };

  let recentCases: RecentCaseItem[] = [];
  let recentSketches: RecentSketchItem[] = [];
  let chartData: ActivityChartPoint[] = [];

  try {
    const [fetchedMetrics, fetchedCases, fetchedSketches, fetchedChartData] =
      await Promise.all([
        getDashboardMetrics(),
        getRecentCases(6),
        getRecentSketches(4),
        getDashboardChartData("90d"),
      ]);

    metrics = fetchedMetrics;
    recentCases = fetchedCases;
    recentSketches = fetchedSketches;
    chartData = fetchedChartData;
  } catch (error) {
    console.error("Dashboard initial data query warning:", error);
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
                recentSketches={recentSketches}
                chartData={chartData}
              />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
