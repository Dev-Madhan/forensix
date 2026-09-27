import { AppSidebar } from "@/components/app-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function CriminalEditLoading() {
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
                  <BreadcrumbLink href="/dashboard/criminals">Criminals</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="font-semibold text-foreground">
                    Edit Profile
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          {/* Main Skeleton */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-full overflow-x-hidden space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-border/60">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96 max-w-full" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20 rounded-lg" />
                <Skeleton className="h-9 w-20 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6">
              <Skeleton className="xl:col-span-12 h-64 rounded-xl" />
              <Skeleton className="xl:col-span-7 h-96 rounded-xl" />
              <Skeleton className="xl:col-span-5 h-96 rounded-xl" />
              <Skeleton className="xl:col-span-7 h-96 rounded-xl" />
              <Skeleton className="xl:col-span-5 h-96 rounded-xl" />
              <Skeleton className="xl:col-span-12 h-48 rounded-xl" />
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
