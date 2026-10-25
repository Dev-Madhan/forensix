import { getCriminalById } from "@/features/criminals/queries";
import { getSafeStorageUrl } from "@/lib/storage-url";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
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
import { CriminalProfileHeader } from "@/features/criminals/components/profile/criminal-profile-header";
import { CriminalProfileTabs } from "@/features/criminals/components/profile/criminal-profile-tabs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ criminalId: string }>;
}) {
  const resolvedParams = await params;
  try {
    const criminal = await getCriminalById(resolvedParams.criminalId);
    return {
      title: `${criminal.firstName} ${criminal.lastName} | Criminal Profile | Forensix`,
      description: `Criminal profile for ${criminal.firstName} ${criminal.lastName} (${criminal.criminalId}). Status: ${criminal.status}.`,
    };
  } catch {
    return {
      title: "Criminal Not Found | Forensix",
    };
  }
}

export default async function CriminalProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ criminalId: string }>;
  searchParams?: Promise<{ tab?: string; record?: string }>;
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const initialTab =
    typeof resolvedSearchParams?.tab === "string"
      ? resolvedSearchParams.tab
      : undefined;

  let criminal;
  try {
    criminal = await getCriminalById(resolvedParams.criminalId);
  } catch {
    notFound();
  }

  // Resolve private Tigris S3 storage key or URL to safe permanent streaming endpoint
  const mugshotDisplayUrl = getSafeStorageUrl(criminal.mugshotUrl);

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
    console.warn("Session retrieval fallback:", err);
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <div className="flex flex-col min-h-screen">
          {/* Top Sticky Breadcrumbs & Navigation Header */}
          <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-border/60 bg-background/80 px-3 sm:px-6 backdrop-blur-md">
            <SidebarTrigger className="-ml-1 size-7 text-muted-foreground hover:text-foreground cursor-pointer" />
            <div className="h-4 w-px bg-border/60 mx-1" />
            <Breadcrumb className="overflow-hidden min-w-0">
              <BreadcrumbList className="flex-nowrap overflow-x-auto scrollbar-none [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden whitespace-nowrap text-xs sm:text-sm">
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
                    {criminal.firstName} {criminal.lastName}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </header>

          <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
            <CriminalProfileHeader
              criminal={criminal}
              mugshotDisplayUrl={mugshotDisplayUrl}
            />
            <CriminalProfileTabs
              criminal={criminal}
              mugshotDisplayUrl={mugshotDisplayUrl}
              initialTab={initialTab}
            />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
