import { redirect } from "next/navigation";

export default async function DashboardCaseDetailsRedirect({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/case-details/${resolvedParams.caseId}`);
}
