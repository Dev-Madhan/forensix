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
          <CaseDetailsTabs caseData={caseData} />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
