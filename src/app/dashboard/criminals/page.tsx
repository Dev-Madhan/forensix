import { Suspense } from "react";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
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
import { getCriminalsForTable, getCriminalIntelligenceMetrics } from "@/features/criminals/queries";
import { CriminalSectionCards } from "@/features/criminals/components/criminal-section-cards";
import { CriminalsTable } from "@/features/criminals/components/criminals-table";

export const metadata = {
  title: "Criminal Database | Forensix",
  description: "Search, view, and manage criminal records with AI-powered intelligence.",
};

export default async function CriminalsPage() {
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

  // Query database items and live metrics in parallel
  const [criminals, metrics] = await Promise.all([
    getCriminalsForTable(),
    getCriminalIntelligenceMetrics(),
  ]);

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
                  <BreadcrumbPage>Criminal Database</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-4 sm:gap-6 p-3.5 sm:p-6 lg:p-8 w-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Page Header: Title, Description & Action Button */}
            <div className="flex flex-row items-center justify-between gap-3">
              <div className="space-y-0.5 sm:space-y-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-heading truncate">
                  Criminal Database
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1 sm:line-clamp-none">
                  Search, view, and manage criminal records with AI-powered intelligence.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  className="h-9 sm:h-10 gap-1.5 sm:gap-2 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs sm:text-sm font-medium cursor-pointer shadow-sm shadow-[#665AEF]/25 px-3 sm:px-4"
                  render={<Link href="/dashboard/criminals/new" />}
                  nativeButton={false}
                >
                  <Plus className="size-4" />
                  <span className="hidden xs:inline">Add Record</span>
                  <span className="xs:hidden">Add</span>
                </Button>
              </div>
            </div>

            {/* Criminals Table with Integrated Interactive Section Cards and Slide-out Preview */}
            <Suspense
              fallback={
                <div className="h-96 w-full rounded-2xl border-2 border-border/60 bg-card/40 animate-pulse flex items-center justify-center">
                  <span className="text-xs font-mono text-muted-foreground">Loading forensic catalog...</span>
                </div>
              }
            >
              <CriminalsTable initialCriminals={criminals} metrics={metrics} />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
