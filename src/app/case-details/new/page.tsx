import { headers } from "next/headers";
import { auth } from "@/lib/auth";
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
import { CaseNewForm } from "@/components/cases/case-new-form";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Case | Forensix",
  description: "Register and initialize a new forensic investigation dossier, crime scene coordinates, and evidence catalog.",
};

export default async function CaseNewPage() {
  let user;
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (session?.user) {
      user = {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image || undefined,
        role: (session.user as { role?: string })?.role || "INVESTIGATOR",
      };
    }
  } catch (err) {
    console.warn("Session retrieval fallback in new case page:", err);
  }

  // Pre-generate next suggested case number
  let suggestedCaseNumber = "FX-2026-189";
  try {
    const count = await prisma.case.count().catch(() => 0);
    suggestedCaseNumber = `FX-2026-${String(185 + count).padStart(3, "0")}`;
  } catch (err) {
    console.warn("Case count calculation skipped:", err);
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          {/* Top Breadcrumbs & Navigation Header */}
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-3 sm:px-6 backdrop-blur-md">
            <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground cursor-pointer" />
            <div className="h-4 w-px bg-border/60 mx-1" />
            <Breadcrumb className="overflow-hidden min-w-0">
              <BreadcrumbList className="flex-nowrap overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap text-xs sm:text-sm">
                <BreadcrumbItem className="hidden sm:inline-flex">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden sm:inline-flex" />
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/cases">Cases</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-foreground">New Case</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
            <CaseNewForm initialUser={user} suggestedCaseNumber={suggestedCaseNumber} />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
