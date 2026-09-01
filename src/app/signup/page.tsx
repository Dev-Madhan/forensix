import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { SignUpCard } from "@/components/watermelon-ui/signup-01";

export const metadata: Metadata = {
  title: "Create Account | Forensix",
  description: "Register for an authorized Forensix investigator account.",
};

export default async function SignUpPage() {
  // If already authenticated, redirect to dashboard
  const reqHeaders = await headers();
  const session = await auth.api.getSession({ headers: reqHeaders });
  if (session) {
    redirect("/");
  }

  return (
    <main className="flex flex-1 items-center justify-center py-4 md:py-8">
      <SignUpCard
        brandName="Forensix"
        heading="Create account"
        subheading="Register your credentials to access the Forensix investigation suite."
        namePlaceholder="Full Name"
        emailPlaceholder="example@gmail.com"
        badgeIdPlaceholder="Badge ID (i.e BADGE-12345)"
        passwordPlaceholder="Password (min 8 characters)"
        confirmPasswordPlaceholder="Confirm password"
        submitLabel="Register & Get Started"
        dividerText="or sign up with SSO"
        bottomPromptText="Already have an account?"
        bottomPromptLinkText="Sign in"
        bottomPromptHref="/auth"
      />
    </main>
  );
}
