import { AppSidebar } from "@/components/app-sidebar";
import { CaseFormSkeleton } from "@/components/cases/case-form-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function CaseNewLoading() {
  return (
    <SidebarProvider>
      <AppSidebar />
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
            <CaseFormSkeleton mode="new" />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
