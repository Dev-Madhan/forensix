import { redirect } from "next/navigation";

export default async function CriminalProfileRedirectPage({
  params,
}: {
  params: Promise<{ criminalId: string }>;
}) {
  const { criminalId } = await params;
  redirect(`/dashboard/criminals/${criminalId}`);
}
