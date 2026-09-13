"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@/components/ui/button";
import { AvatarDropdown } from "@/components/avatar-dropdown";
import { motion, AnimatePresence } from "motion/react";

export const navLinks = [
  {
    label: "Dashboard",
    href: "/dashboard",
  },
  {
    label: "Cases",
    href: "/dashboard/cases",
  },
  {
    label: "Criminal Database",
    href: "/dashboard/criminals",
  },
  {
    label: "Sketch Generator",
    href: "/sketch",
  },
];

// Reordered links matching the reference image layout
export const studioNavLinks = [
  {
    label: "Cases",
    href: "/dashboard/cases",
  },
  {
    label: "Criminal Database",
    href: "/dashboard/criminals",
  },
  {
    label: "Sketch Generator",
    href: "/sketch",
  },
  {
    label: "Dashboard",
    href: "/dashboard",
  },
];

interface HeaderProps {
  user?: {
    name: string;
    email: string;
    image?: string;
    role: string;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();
  const scrolled = useScroll(10);
  const isSketchPage = pathname === "/sketch" || pathname.startsWith("/sketch");

  // Hide header on authentication, dashboard, and case-details pages for a focused user experience
  if (
    pathname === "/auth" ||
    pathname === "/signup" ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/case-details")
  ) {
    return null;
  }

  // === DEDICATED FULL-WIDTH STUDIO HEADER FOR SKETCH GENERATOR ===
  if (isSketchPage) {
    return (
      <header
        suppressHydrationWarning
        className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-2xl"
      >
        <nav className="relative flex h-14 w-full items-center justify-between px-4 lg:px-6">
          {/* Left: Brand Logo */}
          <Link
            className="flex items-center gap-2.5 font-heading py-1 shrink-0 z-10 hover:opacity-90 transition-opacity"
            href="/"
          >
            <Image
              src="/images/Logo.png"
              alt="Forensix Logo"
              width={28}
              height={28}
              className="size-7 object-contain rounded-md"
              priority
            />
            <span className="font-heading text-base font-bold tracking-tight text-foreground">
              Forensix
            </span>
          </Link>

          {/* Center: Navigation Links */}
          <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 h-full">
            {studioNavLinks
              .filter((link) => link.label !== "Dashboard" || !!user)
              .map((link) => {
                const isActive =
                  link.href === "/dashboard"
                    ? pathname === "/dashboard"
                    : pathname === link.href || pathname.startsWith(link.href + "/");

                return (
                  <Button
                    key={link.label}
                    size="sm"
                    variant="ghost"
                    className={cn(
                      "relative h-14 px-3.5 text-xs lg:text-sm font-medium whitespace-nowrap rounded-none transition-colors hover:bg-transparent cursor-pointer",
                      isActive
                        ? "text-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    render={<Link href={link.href} />}
                    nativeButton={false}
                  >
                    <span className="relative z-10">{link.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="header-active-line"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#665AEF] shadow-[0_0_10px_rgba(102,90,239,0.8)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Button>
                );
              })}
          </div>

          {/* Right: User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 z-10 justify-end">
            {/* Profile Avatar with Name & Chevron */}
            <AnimatePresence mode="wait">
              {user ? (
                <AvatarDropdown user={user} showName={true} />
              ) : (
                <Button
                  size="sm"
                  className="inline-flex rounded-md text-xs lg:text-sm h-8 px-3 font-medium shrink-0 bg-[#665AEF] hover:bg-[#5749DF] text-white"
                  render={<Link href="/auth" />}
                  nativeButton={false}
                >
                  Sign in
                </Button>
              )}
            </AnimatePresence>
          </div>
        </nav>
      </header>
    );
  }

  // === DEFAULT FLOATING PILL HEADER FOR OTHER PAGES ===
  return (
    <motion.header
      suppressHydrationWarning
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.8, delay: 0.1 }}
      className={cn(
        "sticky top-0 z-50 mx-auto w-full md:w-[calc(100%-2rem)] max-w-4xl border-border border-b-2 md:border-2 md:rounded-xl md:transition-all md:duration-300 md:ease-out mt-0 md:mt-3 lg:mt-4 bg-background/80 backdrop-blur-xl",
        {
          "md:top-3 lg:top-4 md:max-w-3xl md:shadow-lg md:shadow-white/5":
            scrolled,
        }
      )}
    >
      <nav
        className={cn(
          "relative flex h-14 w-full items-center justify-between px-4 md:h-12 md:px-3 lg:px-4 md:transition-all md:ease-out",
          {
            "md:px-2.5": scrolled,
          }
        )}
      >
        {/* Left: Brand Logo */}
        <Link
          className="flex items-center gap-2 font-heading text-base md:text-lg font-bold tracking-tight text-foreground transition-opacity hover:opacity-80 py-1 shrink-0 z-10"
          href="/"
        >
          <Image
            src="/images/Logo.png"
            alt="Forensix Logo"
            width={24}
            height={24}
            className="size-6 object-contain rounded-md"
            priority
          />
          <span className="leading-none">Forensix</span>
        </Link>

        {/* Center: Navigation Links */}
        <div className="hidden md:flex items-center absolute left-1/2 -translate-x-1/2 gap-0.5 lg:gap-1">
          {navLinks
            .filter((link) => link.label !== "Dashboard" || !!user)
            .map((link) => {
              const isActive =
                link.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname === link.href || pathname.startsWith(link.href + "/");

              return (
                <Button
                  key={link.label}
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "relative text-xs lg:text-sm px-2.5 lg:px-3 h-8 font-medium whitespace-nowrap transition-colors",
                    isActive
                      ? "text-foreground font-semibold bg-[#665AEF]/10"
                      : "text-muted-foreground hover:bg-surface hover:text-foreground"
                  )}
                  render={<Link href={link.href} />}
                  nativeButton={false}
                >
                  <span className="relative z-10">{link.label}</span>
                  {isActive && (
                    <motion.span
                      layoutId="header-active-indicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#665AEF] rounded-full shadow-[0_0_10px_rgba(102,90,239,0.8)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Button>
              );
            })}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 z-10 min-w-30 justify-end">
          <AnimatePresence mode="wait">
            {user ? (
              <motion.div
                key="avatar"
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <AvatarDropdown user={user} />
              </motion.div>
            ) : (
              <motion.div
                key="login-btn"
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -5 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              >
                <Button
                  size="sm"
                  className="inline-flex rounded-md text-xs lg:text-sm h-8 px-3 font-medium shrink-0"
                  render={<Link href="/auth" />}
                  nativeButton={false}
                >
                  Get started
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </motion.header>
  );
}
