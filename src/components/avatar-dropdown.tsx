"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, Shield, LogOut, Briefcase, Users, PenTool, LayoutDashboard } from "lucide-react";
import { authClient } from "@/lib/auth-client";


import { motion, AnimatePresence } from "motion/react";

interface AvatarDropdownProps {
  user?: {
    name: string;
    email: string;
    image?: string;
    role?: string;
  };
}

export function AvatarDropdown({
  user = {
    name: "Lead Investigator",
    email: "officer@forensix.gov",
    role: "INVESTIGATOR",
  },
}: AvatarDropdownProps) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const roleLabel =
    user.role === "ADMIN"
      ? "Administrator"
      : user.role === "INVESTIGATOR"
      ? "Investigator"
      : user.role;

  async function handleLogout() {
    if (isPending) return;
    setIsPending(true);
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch {

      toast.error("Something went wrong. Please try again.");
      setIsPending(false);
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className="relative flex size-8 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring transition-transform active:scale-95"
            aria-label="User account menu"
          />
        }
      >
        <Avatar className="size-8 border border-border">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="font-heading text-xs font-semibold bg-surface text-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenuContent
            align="end"
            alignOffset={4}
            sideOffset={24}
            className="w-56 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-2 py-1.5 font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none text-foreground tracking-tight">
                {user.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground break-all font-bricolage pt-0.5">
                {user.email}
              </p>
              {roleLabel && (
                <span className="mt-1.5 inline-block text-[10px] font-heading font-bold uppercase tracking-widest text-primary/80">
                  {roleLabel}
                </span>
              )}
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="opacity-50 md:hidden" />

        <DropdownMenuGroup className="space-y-0.5 md:hidden" onPointerLeave={() => setHoveredItem(null)}>
          <DropdownMenuItem 
            onPointerEnter={() => setHoveredItem("cases")}
            render={<Link href="/cases" />} 
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent"
          >
            {hoveredItem === "cases" && (
              <motion.div layoutId="dropdown-hover" className="absolute inset-0 z-[-1] rounded-md bg-accent/80" transition={{ type: "spring", bounce: 0.3, duration: 0.4 }} />
            )}
            <Briefcase className="size-4 text-muted-foreground/70" />
            <span className="font-medium text-sm">Cases</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onPointerEnter={() => setHoveredItem("criminals")}
            render={<Link href="/criminals" />} 
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent"
          >
            {hoveredItem === "criminals" && (
              <motion.div layoutId="dropdown-hover" className="absolute inset-0 z-[-1] rounded-md bg-accent/80" transition={{ type: "spring", bounce: 0.3, duration: 0.4 }} />
            )}
            <Users className="size-4 text-muted-foreground/70" />
            <span className="font-medium text-sm">Criminal Database</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onPointerEnter={() => setHoveredItem("sketch")}
            render={<Link href="/sketch" />} 
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent"
          >
            {hoveredItem === "sketch" && (
              <motion.div layoutId="dropdown-hover" className="absolute inset-0 z-[-1] rounded-md bg-accent/80" transition={{ type: "spring", bounce: 0.3, duration: 0.4 }} />
            )}
            <PenTool className="size-4 text-muted-foreground/70" />
            <span className="font-medium text-sm">Sketch Generator</span>
          </DropdownMenuItem>
          {user.role === "ADMIN" && (
            <DropdownMenuItem 
              onPointerEnter={() => setHoveredItem("dashboard")}
              render={<Link href="/admin" />} 
              className="relative z-0 group flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent"
            >
              {hoveredItem === "dashboard" && (
                <motion.div layoutId="dropdown-hover" className="absolute inset-0 z-[-1] rounded-md bg-accent/80" transition={{ type: "spring", bounce: 0.3, duration: 0.4 }} />
              )}
              <LayoutDashboard className="size-4 text-muted-foreground/70" />
              <span className="font-medium text-sm">Dashboard</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="opacity-50" />

        <DropdownMenuGroup className="space-y-0.5" onPointerLeave={() => setHoveredItem(null)}>
          <DropdownMenuItem 
            onPointerEnter={() => setHoveredItem("profile")}
            render={<Link href="/profile" />} 
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent"
          >
            {hoveredItem === "profile" && (
              <motion.div layoutId="dropdown-hover" className="absolute inset-0 z-[-1] rounded-md bg-accent/80" transition={{ type: "spring", bounce: 0.3, duration: 0.4 }} />
            )}
            <User className="size-4 text-muted-foreground/70" />
            <span className="font-medium text-sm">Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onPointerEnter={() => setHoveredItem("settings")}
            render={<Link href="/settings" />} 
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent"
          >
            {hoveredItem === "settings" && (
              <motion.div layoutId="dropdown-hover" className="absolute inset-0 z-[-1] rounded-md bg-accent/80" transition={{ type: "spring", bounce: 0.3, duration: 0.4 }} />
            )}
            <Settings className="size-4 text-muted-foreground/70" />
            <span className="font-medium text-sm">Settings</span>
          </DropdownMenuItem>
          {user.role === "ADMIN" && (
            <DropdownMenuItem 
              onPointerEnter={() => setHoveredItem("audit")}
              render={<Link href="/admin" />} 
              className="relative z-0 group flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent"
            >
              {hoveredItem === "audit" && (
                <motion.div layoutId="dropdown-hover" className="absolute inset-0 z-[-1] rounded-md bg-accent/80" transition={{ type: "spring", bounce: 0.3, duration: 0.4 }} />
              )}
              <Shield className="size-4 text-muted-foreground/70" />
              <span className="font-medium text-sm">Audit &amp; Access</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="opacity-50" />

        <DropdownMenuGroup onPointerLeave={() => setHoveredItem(null)}>
          <DropdownMenuItem
            onPointerEnter={() => setHoveredItem("logout")}
            variant="destructive"
            disabled={isPending}
            onClick={handleLogout}
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-md text-destructive transition-colors focus:text-destructive hover:text-destructive !bg-transparent"
          >
            {hoveredItem === "logout" && (
              <motion.div layoutId="dropdown-hover" className="absolute inset-0 z-[-1] rounded-md bg-destructive/15" transition={{ type: "spring", bounce: 0.3, duration: 0.4 }} />
            )}
            <LogOut className="size-4" />
            <span className="font-medium text-sm">{isPending ? "Signing out..." : "Sign out"}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
            </motion.div>
          </DropdownMenuContent>
        )}
      </AnimatePresence>
    </DropdownMenu>
  );
}
