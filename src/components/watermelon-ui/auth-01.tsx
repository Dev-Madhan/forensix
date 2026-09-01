"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { MdLock, MdEmail, MdVisibility, MdVisibilityOff, MdArrowBack } from "react-icons/md";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { motion, type Variants } from "motion/react";
import { AnimatedButton } from "@/components/ui/animated-button";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";

export interface Auth1Props {
  /** Brand / product name */
  brandName?: string;
  /** Main heading */
  heading?: string;
  /** Sub-copy below the heading */
  subheading?: string;
  /** Email field placeholder */
  emailPlaceholder?: string;
  /** Password field placeholder */
  passwordPlaceholder?: string;
  /** Label for the primary submit button */
  submitLabel?: string;
  /** Text between social buttons and email form */
  dividerText?: string;
  /** Bottom prompt text (before the link) */
  bottomPromptText?: string;
  /** Bottom prompt link text */
  bottomPromptLinkText?: string;
  /** Bottom prompt link href */
  bottomPromptHref?: string;
}

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

export function Auth1({
  brandName = "Forensix",
  heading = "Welcome back",
  subheading = "Enter your credentials to access your workspace.",
  emailPlaceholder = "example@gmail.com",
  passwordPlaceholder = "••••••••••••",
  submitLabel = "Authenticate & Proceed",
  dividerText = "or continue with SSO",
  bottomPromptText = "Don't have an account?",
  bottomPromptLinkText = "Sign up",
  bottomPromptHref = "/signup",
}: Auth1Props) {
  const [showPassword, setShowPassword] = useState(false);
  const [oauthPending, setOauthPending] = useState<"google" | "github" | null>(null);
  const [isPending, setIsPending] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();

  // Global ToastListener handles OAuth redirect toasts

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsPending(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { data, error } = await authClient.signIn.email({
      email,
      password,
    });

    if (error) {
      toast.error(error.message || "Invalid email or password.");
      setIsPending(false);
    } else {
      const firstName = data?.user?.name?.split(" ")[0] || "";
      toast.success(`Welcome back, ${firstName}!`);
      router.refresh();
      router.push("/");
    }
  };

  const handleGoogleSignIn = async () => {
    setOauthPending("google");
    await authClient.signIn.social({
      provider: "google",
      callbackURL: "/?toast=google",
    });
  };

  const handleGithubSignIn = async () => {
    setOauthPending("github");
    await authClient.signIn.social({
      provider: "github",
      callbackURL: "/?toast=github",
    });
  };

  return (
    <div className="relative flex min-h-[calc(100vh-5rem)] w-full items-center justify-center px-4 py-8">
      {/* Back to Home Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-4 left-4 md:top-6 md:left-6 z-50"
      >
        <Link href="/">
          <AnimatedButton className="border-2 border-border bg-card/90 dark:bg-card/90 px-3.5 py-2 text-xs font-semibold text-foreground shadow-md backdrop-blur-md rounded-xl hover:border-primary/50 transition-all cursor-pointer">
            <MdArrowBack className="h-4 w-4 text-primary transition-transform group-hover:-translate-x-1 shrink-0" />
            <span className="tracking-wide">Back to home</span>
          </AnimatedButton>
        </Link>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-sm flex flex-col items-center gap-6"
      >
        {/* Brand Logo & Name */}
        {brandName && (
          <motion.div variants={itemVariants}>
            <Link
              href="/"
              className="flex items-center gap-2.5 transition-opacity hover:opacity-80 group cursor-pointer"
            >
              <Image
                src="/images/Logo.png"
                alt={`${brandName} Logo`}
                width={32}
                height={32}
                className="size-8 object-contain rounded-lg shadow-sm"
                priority
              />
              <span className="font-heading text-2xl font-bold tracking-tight text-foreground">
                {brandName}
              </span>
            </Link>
          </motion.div>
        )}

        <Card className="border-border bg-muted dark:bg-muted gap-0 rounded-4xl p-2 w-full shadow-lg">
          <div className="bg-background h-full w-full rounded-3xl px-3 py-6 shadow-[0_2px_4px_0px_rgba(0,0,0,0.12)]">
            <CardHeader className="space-y-2 pb-4 text-center">
              <motion.div variants={itemVariants}>
                <CardTitle className="text-xl font-extrabold tracking-tight sm:text-2xl font-heading">
                  {heading}
                </CardTitle>
              </motion.div>
              <motion.div variants={itemVariants}>
                <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                  {subheading}
                </CardDescription>
              </motion.div>
            </CardHeader>

            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2.5">
                  <motion.div variants={itemVariants} className="relative">
                    <MdEmail className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="Auth1-email"
                      name="email"
                      type="email"
                      placeholder={emailPlaceholder}
                      className="bg-muted border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary/50 h-9 pl-10 text-sm transition-all"
                      required
                      disabled={isPending}
                    />
                  </motion.div>

                  <motion.div variants={itemVariants} className="relative">
                    <MdLock className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="Auth1-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={passwordPlaceholder}
                      className="bg-muted border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary/50 h-9 pr-10 pl-10 text-sm transition-all"
                      required
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <MdVisibilityOff className="h-4 w-4" />
                      ) : (
                        <MdVisibility className="h-4 w-4" />
                      )}
                    </button>
                  </motion.div>
                </div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="h-11 w-full bg-[linear-gradient(135deg,#6C63FF_0%,#574BDB_100%)] hover:bg-[linear-gradient(135deg,#7B73FF_0%,#6357E8_100%)] text-white text-sm font-semibold shadow-[0_8px_30px_rgba(99,91,255,0.20)] hover:shadow-[0_10px_35px_rgba(99,91,255,0.35)] transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Authenticating...
                      </span>
                    ) : (
                      submitLabel
                    )}
                  </Button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="flex items-center gap-3">
                <Separator className="flex-1" />
                <span className="text-muted-foreground shrink-0 text-xs">
                  {dividerText}
                </span>
                <Separator className="flex-1" />
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5">
                <motion.div whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={oauthPending !== null}
                    className="bg-muted h-10 w-full gap-1.5 border-0 text-xs font-medium shadow-xs cursor-pointer hover:bg-muted/80 disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleGoogleSignIn}
                  >
                    {oauthPending === "google" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FcGoogle className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
                <motion.div whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    type="button"
                    disabled={oauthPending !== null}
                    className="bg-muted h-10 w-full gap-1.5 border-0 text-xs font-medium shadow-xs cursor-pointer hover:bg-muted/80 disabled:opacity-70 disabled:cursor-not-allowed"
                    onClick={handleGithubSignIn}
                  >
                    {oauthPending === "github" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <FaGithub className="h-4 w-4" />
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </CardContent>
          </div>

          <CardFooter className="justify-center border-0 pt-5">
            <motion.p variants={itemVariants} className="text-muted-foreground text-sm">
              {bottomPromptText}{" "}
              <Link
                href={bottomPromptHref ?? "/signup"}
                className="text-primary font-semibold underline-offset-4 transition-all hover:underline"
              >
                {bottomPromptLinkText}
              </Link>
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
