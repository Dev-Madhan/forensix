"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });
      if (error) {
        toast.error(error.message || "Failed to send reset link");
      } else {
        toast.success("Reset link sent!");
        // Always show success message for security (prevent email enumeration)
        setIsSent(true);
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
      setIsSent(true); 
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 font-ui">
      {/* Logo & Header */}
      <div className="w-full max-w-md flex flex-col items-start mb-6 px-2">
        <div className="w-12 h-12 mb-6 flex items-center justify-center">
          {/* Custom SVG Logo */}
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-cyan-400"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-white tracking-tight font-editorial mb-2">
          Reset password
        </h1>
        <p className="text-zinc-400 text-sm">
          Enter your email address and we&apos;ll send you instructions to reset your password.
        </p>
      </div>

      {/* Main Card */}
      <Card className="w-full max-w-md bg-zinc-950 border border-zinc-800 shadow-2xl p-2 rounded-2xl">
        <CardContent className="pt-6">
          {!isSent ? (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-zinc-200">
                  Email
                </Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-zinc-900/30 border border-zinc-800/80 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 rounded-lg h-11 transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg h-11 mt-4"
              >
                Send reset link
              </Button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium text-zinc-100">Check your email</h3>
                <p className="text-sm text-zinc-400">
                  We sent a password reset link to <br />
                  <span className="font-medium text-zinc-200">{email}</span>
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="w-full max-w-md mt-8 flex flex-col items-center gap-6">
        <Link
          href="/login"
          className="flex items-center text-zinc-400 hover:text-zinc-300 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to login
        </Link>
        <div className="flex items-center gap-6 text-sm text-zinc-500">
          <Link href="/terms" className="hover:text-zinc-300">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-zinc-300">
            Privacy
          </Link>
          <Link href="/support" className="hover:text-zinc-300">
            Support
          </Link>
        </div>
      </div>
    </div>
  );
}
