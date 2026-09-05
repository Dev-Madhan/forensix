import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { resolveCaseBySlug } from "@/features/cases/resolve-case";
import { CaseDetailsHeader } from "@/components/cases/case-details-header";
import { CaseDetailsTabs } from "@/components/cases/case-details-tabs";
import { CaseStatusCard } from "@/components/cases/case-status-card";
import { CaseKeyDetailsCard } from "@/components/cases/case-key-details-card";
import { CaseIncidentMediaCard } from "@/components/cases/case-incident-media-card";
import { CaseIncidentLocationCard } from "@/components/cases/case-incident-location-card";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseData = await resolveCaseBySlug(slug);
  return {
    title: `${caseData.caseNumber} - ${caseData.title} | Forensix`,
    description: caseData.description,
  };
}

export default async function CaseDetailsSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseData = await resolveCaseBySlug(slug);

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
          <CaseDetailsHeader caseData={caseData} />
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start w-full">
            <div className="xl:col-span-8 2xl:col-span-8 space-y-6 min-w-0">
              <CaseDetailsTabs caseData={caseData} />
            </div>
            {/* Right Column: Case Status, Key Details, Incident Media & Location */}
            <div className="space-y-6 xl:col-span-4 2xl:col-span-4 min-w-0">
              <CaseStatusCard caseData={caseData} />
              <CaseKeyDetailsCard caseData={caseData} />
              <CaseIncidentMediaCard caseData={caseData} />
              <CaseIncidentLocationCard caseData={caseData} />
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
