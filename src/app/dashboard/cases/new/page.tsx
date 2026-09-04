import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CreateCaseForm } from "@/components/cases/CreateCaseForm";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "New Case | Forensix",
};

export default async function NewCasePage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl p-6">
      <div>
        <Link href="/dashboard/cases" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Cases
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Create Case</h1>
        <p className="text-muted-foreground">Open a new investigation.</p>
      </div>

      <div className="rounded-md border p-6">
        <CreateCaseForm currentUserId={session.user.id} />
      </div>
    </div>
  );
}
