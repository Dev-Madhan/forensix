import { Suspense } from "react"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardContent } from "@/components/dashboard-content"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
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
              <DashboardContent userName={userName} />
            </Suspense>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
