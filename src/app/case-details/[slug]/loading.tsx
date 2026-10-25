import { AppSidebar } from "@/components/layout/app-sidebar";
import { CaseDetailsSkeleton } from "@/features/cases/components/case-details-skeleton";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function CaseDetailsLoading() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <CaseDetailsSkeleton />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
