import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Auth1 } from "@/features/auth/components/auth-form";

export const metadata: Metadata = {
  title: "Sign In | Forensix",
  description: "Access the Forensix forensic intelligence and investigation workspace.",
};

export default async function AuthPage() {
  // If already authenticated, redirect to dashboard
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (session) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center py-4 md:py-8">
      <Auth1
        brandName="Forensix"
        heading="Welcome back"
        subheading="Enter your credentials to access your workspace."
        emailPlaceholder="example@gmail.com"
        passwordPlaceholder="••••••••••••"
        submitLabel="Authenticate & Proceed"
        dividerText="or continue with SSO"
        bottomPromptText="Don't have an account?"
        bottomPromptLinkText="Sign up"
        bottomPromptHref="/signup"
      />
    </main>
  );
}
