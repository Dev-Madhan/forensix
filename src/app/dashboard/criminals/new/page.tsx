import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { CreateCriminalForm } from "@/components/criminals/CreateCriminalForm";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Add Criminal | Forensix",
};

export default async function NewCriminalPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl p-6">
      <div>
        <Link href="/dashboard/criminals" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Criminals
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Add Criminal Record</h1>
        <p className="text-muted-foreground">Create a new entry in the criminal database.</p>
      </div>

      <div className="rounded-md border p-6">
        <CreateCriminalForm />
      </div>
    </div>
  );
}
