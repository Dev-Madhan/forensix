"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Lock, Fingerprint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const isEmail = identifier.includes('@');
      
      const fetchOptions = {
        onSuccess: () => {
          window.location.href = "/";
        },
        onError: (ctx: any) => {
          toast.error(ctx.error.message || "Failed to sign in");
        },
      };

      if (isEmail) {
        await authClient.signIn.email({
          email: identifier,
          password,
          fetchOptions,
        });
      } else {
        await authClient.signIn.username({
          username: identifier,
          password,
          fetchOptions,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 font-ui">
      {/* Logo & Header */}
      <div className="w-full max-w-md flex flex-col items-start mb-6 px-2">
        <div className="w-12 h-12 mb-6 flex items-center justify-center">
          {/* Custom SVG Logo matching the screenshot */}
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
        <p className="text-zinc-400 text-lg mb-1">Welcome back to Forensix!</p>
        <h1 className="text-3xl font-semibold text-white tracking-tight font-editorial">
          Log in to continue
        </h1>
      </div>

      {/* Main Login Card */}
      <Card className="w-full max-w-md bg-zinc-950 border border-zinc-800 shadow-2xl p-2 rounded-2xl">
        <CardContent className="pt-6">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="identifier" className="text-zinc-200">
                Email or Username
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="h-4 w-4" />
                </div>
                <Input
                  id="identifier"
                  type="text"
                  placeholder="you@example.com or username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="pl-9 bg-zinc-900/30 border border-zinc-800/80 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 rounded-lg h-11 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-200">
                  Password
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="h-4 w-4" />
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-zinc-900/30 border border-zinc-800/80 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-1 focus-visible:ring-zinc-700 focus-visible:border-zinc-700 rounded-lg h-11 tracking-widest transition-all duration-200"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-lg h-11 mt-2"
            >
              Sign in
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-zinc-950 px-2 text-zinc-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              type="button"
              className="bg-zinc-950 border-2 border-zinc-800 hover:bg-zinc-900 hover:text-white h-11 rounded-lg"
              onClick={() => authClient.signIn.social({ provider: "github" })}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2C6.477 2 2 6.477 2 12C2 16.418 4.865 20.166 8.839 21.49C9.339 21.58 9.52 21.27 9.52 21.01C9.52 20.78 9.51 20.14 9.51 19.31C6.73 19.91 6.14 17.97 6.14 17.97C5.68 16.81 5.03 16.5 5.03 16.5C4.12 15.88 5.1 15.9 5.1 15.9C6.1 15.97 6.63 16.93 6.63 16.93C7.5 18.45 8.92 18.01 9.48 17.76C9.57 17.13 9.82 16.69 10.1 16.44C7.88 16.19 5.55 15.33 5.55 11.47C5.55 10.37 5.94 9.47 6.59 8.77C6.49 8.52 6.14 7.49 6.69 6.1C6.69 6.1 7.54 5.83 9.49 7.15C10.3 6.92 11.16 6.81 12.01 6.81C12.86 6.81 13.72 6.92 14.53 7.15C16.48 5.83 17.33 6.1 17.33 6.1C17.88 7.49 17.53 8.52 17.43 8.77C18.08 9.47 18.47 10.37 18.47 11.47C18.47 15.34 16.13 16.19 13.91 16.44C14.26 16.74 14.57 17.32 14.57 18.23C14.57 19.53 14.56 20.58 14.56 20.89C14.56 21.16 14.74 21.48 15.25 21.39C19.23 20.06 22.09 16.32 22.09 11.89C22.1 6.36 17.62 1.89 12.09 1.89C12.06 1.89 12.03 1.89 12 2Z"
                  fill="currentColor"
                />
              </svg>
            </Button>
            <Button
              variant="outline"
              type="button"
              className="bg-zinc-950 border-2 border-zinc-800 hover:bg-zinc-900 hover:text-white h-11 rounded-lg"
              onClick={() => authClient.signIn.social({ provider: "google" })}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.89 16.79 15.72 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23C14.97 23 17.46 22.02 19.28 20.34L15.72 17.57C14.73 18.23 13.48 18.63 12 18.63C9.13999 18.63 6.70999 16.7 5.84999 14.12H2.17999V16.96C3.98999 20.55 7.69999 23 12 23Z"
                  fill="#34A853"
                />
                <path
                  d="M5.84999 14.12C5.62999 13.46 5.49999 12.74 5.49999 12C5.49999 11.26 5.62999 10.54 5.84999 9.88V7.04H2.17999C1.42999 8.52 1 10.21 1 12C1 13.79 1.42999 15.48 2.17999 16.96L5.84999 14.12Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38C13.62 5.38 15.06 5.94 16.2 7.02L19.36 3.86C17.45 2.08 14.97 1 12 1C7.69999 1 3.98999 3.45 2.17999 7.04L5.84999 9.88C6.70999 7.3 9.13999 5.38 12 5.38Z"
                  fill="#EA4335"
                />
              </svg>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="w-full max-w-md mt-8 flex flex-col items-center gap-6">
        <p className="text-zinc-400 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-indigo-400 hover:text-indigo-300 font-medium"
          >
            Create one
          </Link>
        </p>
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
