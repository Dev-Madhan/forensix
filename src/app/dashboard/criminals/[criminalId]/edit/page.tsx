import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { getCriminalById } from "@/features/criminals/queries";
import { getEvidenceSignedUrl } from "@/features/evidence/queries";
import { CriminalEditForm } from "@/components/criminals/criminal-edit-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ criminalId: string }>;
}) {
  const { criminalId } = await params;
  try {
    const criminal = await getCriminalById(criminalId);
    return {
      title: `Edit ${criminal.firstName} ${criminal.lastName} (${criminal.criminalId}) | Forensix`,
      description: `Edit criminal profile, biographical details, biometric records, and classification for ${criminal.criminalId}`,
    };
  } catch {
    return {
      title: "Edit Criminal Profile | Forensix",
    };
  }
}

export default async function CriminalEditPage({
  params,
}: {
  params: Promise<{ criminalId: string }>;
}) {
  const { criminalId } = await params;

  let criminal;
  try {
    criminal = await getCriminalById(criminalId);
  } catch {
    notFound();
  }

  // Resolve private Tigris S3 storage key to signed URL if applicable
  let mugshotDisplayUrl = criminal.mugshotUrl;
  if (
    mugshotDisplayUrl &&
    !mugshotDisplayUrl.startsWith("http") &&
    !mugshotDisplayUrl.startsWith("/")
  ) {
    try {
      mugshotDisplayUrl = await getEvidenceSignedUrl(mugshotDisplayUrl);
    } catch (err) {
      console.warn("Failed to get signed URL for mugshot in edit page:", err);
    }
  }

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
    console.warn("Session retrieval fallback in criminal edit page:", err);
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
                  <BreadcrumbLink href="/dashboard/criminals">Criminals</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/dashboard/criminals/${criminal.criminalId}`}>
                    {criminal.criminalId}
                  </BreadcrumbLink>
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

          {/* Main Content Area */}
          <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-full overflow-x-hidden">
            <CriminalEditForm
              criminal={criminal}
              mugshotDisplayUrl={mugshotDisplayUrl}
            />
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
