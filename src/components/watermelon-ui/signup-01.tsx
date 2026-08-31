"use client";

import { useState } from "react";
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
import {
  MdLock,
  MdEmail,
  MdPerson,
  MdVisibility,
  MdVisibilityOff,
  MdBadge,
  MdInfoOutline,
  MdArrowBack,
} from "react-icons/md";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { AnimatedButton } from "@/components/ui/animated-button";

export interface SocialProvider {
  /** Display name of the provider */
  name: string;
  /** React node for the provider icon */
  icon: React.ReactNode;
  /** Callback fired when this provider is clicked */
  onClick?: () => void;
}

export interface SignUpProps {
  /** Brand / product name */
  brandName?: string;
  /** Main heading */
  heading?: string;
  /** Sub-copy below the heading */
  subheading?: string;
  /** Name field placeholder */
  namePlaceholder?: string;
  /** Email field placeholder */
  emailPlaceholder?: string;
  /** Badge ID field placeholder */
  badgeIdPlaceholder?: string;
  /** Password field placeholder */
  passwordPlaceholder?: string;
  /** Confirm Password field placeholder */
  confirmPasswordPlaceholder?: string;
  /** Label for the primary submit button */
  submitLabel?: string;
  /** Social / OAuth providers */
  socialProviders?: SocialProvider[];
  /** Text between social buttons and credentials form */
  dividerText?: string;
  /** Bottom prompt text */
  bottomPromptText?: string;
  /** Bottom prompt link text */
  bottomPromptLinkText?: string;
  /** Bottom prompt link href */
  bottomPromptHref?: string;
  /** Callback when bottom prompt link is clicked */
  onBottomPromptClick?: () => void;
  /** Callback when form is submitted */
  onSubmit?: (data: {
    name: string;
    email: string;
    badgeId?: string;
    password: string;
  }) => void;
}

const DEFAULT_SOCIAL_PROVIDERS: SocialProvider[] = [
  {
    name: "Google",
    icon: <FcGoogle className="h-4 w-4" />,
  },
  {
    name: "GitHub",
    icon: <FaGithub className="h-4 w-4" />,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
      staggerChildren: 0.05,
      delayChildren: 0.08,
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

export function SignUpCard({
  brandName = "Forensix",
  heading = "Create account",
  subheading = "Register to join the forensic investigation network.",
  namePlaceholder = "Officer Full Name",
  emailPlaceholder = "officer@forensix.gov",
  badgeIdPlaceholder = "Badge ID (e.g., BADGE-12345)",
  passwordPlaceholder = "Create password",
  confirmPasswordPlaceholder = "Confirm password",
  submitLabel = "Register & Get Started",
  socialProviders = DEFAULT_SOCIAL_PROVIDERS,
  dividerText = "or sign up with SSO",
  bottomPromptText = "Already have an account?",
  bottomPromptLinkText = "Sign in",
  bottomPromptHref = "/auth",
  onBottomPromptClick,
  onSubmit,
}: SignUpProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [badgeId, setBadgeId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showBadgeHelp, setShowBadgeHelp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError(null);
    onSubmit?.({ name, email, badgeId, password });
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
        className="w-full max-w-md flex flex-col items-center gap-6"
      >
        {/* Brand Logo & Name outside and above the card */}
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
              <form onSubmit={handleSubmit} className="space-y-3.5">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs font-medium text-destructive text-center"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Name */}
                <motion.div variants={itemVariants} className="relative">
                  <MdPerson className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder={namePlaceholder}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-muted border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary/50 h-9 pl-10 text-sm transition-all"
                    required
                  />
                </motion.div>

                {/* Email */}
                <motion.div variants={itemVariants} className="relative">
                  <MdEmail className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder={emailPlaceholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-muted border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary/50 h-9 pl-10 text-sm transition-all"
                    required
                  />
                </motion.div>

                {/* Badge ID (Optional) */}
                <motion.div variants={itemVariants} className="space-y-1.5">
                  <div className="relative">
                    <MdBadge className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                    <Input
                      id="signup-badge"
                      type="text"
                      placeholder={badgeIdPlaceholder}
                      value={badgeId}
                      onChange={(e) => setBadgeId(e.target.value)}
                      className="bg-muted border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary/50 h-9 pr-9 pl-10 text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowBadgeHelp((v) => !v)}
                      className="text-muted-foreground hover:text-primary absolute top-1/2 right-3 -translate-y-1/2 transition-colors cursor-pointer"
                      title="Badge ID Info & Format Guide"
                      aria-label="Toggle Badge ID explanation"
                    >
                      <MdInfoOutline className="h-4 w-4" />
                    </button>
                  </div>

                  <AnimatePresence>
                    {showBadgeHelp && (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="bg-muted/90 border-border/80 text-muted-foreground rounded-xl border p-3.5 text-xs space-y-2 shadow-sm my-1">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
                              <MdInfoOutline className="h-3.5 w-3.5 text-primary shrink-0" />
                              Badge ID Guide
                            </span>
                            <span className="text-[10px] font-mono text-muted-foreground/80 bg-background px-1.5 py-0.5 rounded border border-border">
                              Optional
                            </span>
                          </div>
                          <div className="space-y-1.5 text-[11px] leading-relaxed">
                            <p>
                              <strong className="text-foreground font-medium">Purpose:</strong> Links your digital account to official law enforcement credentials for audit logging, chain of custody reports, and security verification.
                            </p>
                            <p>
                              <strong className="text-foreground font-medium">How to Feed:</strong> Enter manually here during registration, or automatically populate via Enterprise Single Sign-On (SSO / SAML).
                            </p>
                            <p>
                              <strong className="text-foreground font-medium">Accepted Formats:</strong> Any standard department alphanumeric ID. Examples:
                            </p>
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              <code className="bg-background px-1.5 py-0.5 rounded border border-border text-[10px] font-mono text-foreground font-medium">BADGE-12345</code>
                              <code className="bg-background px-1.5 py-0.5 rounded border border-border text-[10px] font-mono text-foreground font-medium">NYPD-44102</code>
                              <code className="bg-background px-1.5 py-0.5 rounded border border-border text-[10px] font-mono text-foreground font-medium">DET-8921</code>
                              <code className="bg-background px-1.5 py-0.5 rounded border border-border text-[10px] font-mono text-foreground font-medium">OFF-9012</code>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Password */}
                <motion.div variants={itemVariants} className="relative">
                  <MdLock className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="signup-password"
                    type={showPassword ? "text" : "password"}
                    placeholder={passwordPlaceholder}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="bg-muted border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary/50 h-9 pr-10 pl-10 text-sm transition-all"
                    required
                    minLength={6}
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

                {/* Confirm Password */}
                <motion.div variants={itemVariants} className="relative">
                  <MdLock className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                  <Input
                    id="signup-confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={confirmPasswordPlaceholder}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (error) setError(null);
                    }}
                    className="bg-muted border-2 border-border focus-visible:ring-primary/20 focus-visible:border-primary/50 h-9 pr-10 pl-10 text-sm transition-all"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 transition-colors cursor-pointer"
                    aria-label="Toggle confirm password visibility"
                  >
                    {showConfirmPassword ? (
                      <MdVisibilityOff className="h-4 w-4" />
                    ) : (
                      <MdVisibility className="h-4 w-4" />
                    )}
                  </button>
                </motion.div>

                <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.985 }}>
                  <Button
                    type="submit"
                    className="h-11 w-full bg-[linear-gradient(135deg,#6C63FF_0%,#574BDB_100%)] hover:bg-[linear-gradient(135deg,#7B73FF_0%,#6357E8_100%)] text-white text-sm font-semibold shadow-[0_8px_30px_rgba(99,91,255,0.20)] hover:shadow-[0_10px_35px_rgba(99,91,255,0.35)] transition-all duration-200 cursor-pointer mt-1"
                  >
                    {submitLabel}
                  </Button>
                </motion.div>
              </form>

              <motion.div variants={itemVariants} className="flex items-center gap-3 pt-1">
                <Separator className="flex-1" />
                <span className="text-muted-foreground shrink-0 text-xs">
                  {dividerText}
                </span>
                <Separator className="flex-1" />
              </motion.div>

              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-2.5">
                {socialProviders.map((provider) => (
                  <motion.div key={provider.name} whileHover={{ y: -1, scale: 1.01 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      type="button"
                      className="bg-muted h-10 w-full gap-1.5 border-0 text-xs font-medium shadow-xs cursor-pointer hover:bg-muted/80"
                      onClick={provider.onClick}
                    >
                      {provider.icon}
                    </Button>
                  </motion.div>
                ))}
              </motion.div>
            </CardContent>
          </div>

          <CardFooter className="justify-center border-0 pt-5">
            <motion.p variants={itemVariants} className="text-muted-foreground text-sm">
              {bottomPromptText}{" "}
              {bottomPromptHref ? (
                <Link
                  href={bottomPromptHref}
                  onClick={onBottomPromptClick}
                  className="text-primary font-semibold underline-offset-4 transition-all hover:underline"
                >
                  {bottomPromptLinkText}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={onBottomPromptClick}
                  className="text-primary font-semibold underline-offset-4 transition-all hover:underline cursor-pointer"
                >
                  {bottomPromptLinkText}
                </button>
              )}
            </motion.p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
