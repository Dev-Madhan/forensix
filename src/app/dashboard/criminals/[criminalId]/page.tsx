import { getCriminalById } from "@/features/criminals/queries";
import { getEvidenceSignedUrl } from "@/features/evidence/queries";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { CriminalProfileHeader } from "@/components/criminals/profile/criminal-profile-header";
import { CriminalProfileTabs } from "@/components/criminals/profile/criminal-profile-tabs";

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
}: {
  params: Promise<{ criminalId: string }>;
}) {
  const resolvedParams = await params;

  let criminal;
  try {
    criminal = await getCriminalById(resolvedParams.criminalId);
  } catch {
    notFound();
  }

  // Resolve private Tigris S3 storage key to a signed URL only if it's an S3 key and not a local / path or http URL
  let mugshotDisplayUrl = criminal.mugshotUrl;
  if (
    mugshotDisplayUrl &&
    !mugshotDisplayUrl.startsWith("http") &&
    !mugshotDisplayUrl.startsWith("/")
  ) {
    try {
      mugshotDisplayUrl = await getEvidenceSignedUrl(mugshotDisplayUrl);
    } catch (err) {
      console.warn("Failed to get signed URL for mugshot:", err);
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
    console.warn("Session retrieval fallback:", err);
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <main className="flex flex-1 flex-col gap-6 p-4 sm:p-6 lg:p-8">
          <CriminalProfileHeader
            criminal={criminal}
            mugshotDisplayUrl={mugshotDisplayUrl}
          />
          <CriminalProfileTabs
            criminal={criminal}
            mugshotDisplayUrl={mugshotDisplayUrl}
          />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
