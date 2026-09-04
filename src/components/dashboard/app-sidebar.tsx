"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderSearch,
  Users,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  LogOut,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface AppSidebarProps {
  user?: {
    name: string;
    email: string;
    image?: string | null;
    role: string;
    badgeId?: string | null;
  } | null;
}

export function AppSidebar({ user }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      toast.success("Signed out successfully");
      router.push("/auth");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  const navItems = [
    {
      title: "Overview",
      url: "/dashboard",
      icon: LayoutDashboard,
      active: pathname === "/dashboard",
    },
    {
      title: "Investigations",
      url: "/dashboard/cases",
      icon: FolderSearch,
      active: pathname.startsWith("/dashboard/cases"),
    },
    {
      title: "Criminal Database",
      url: "/dashboard/criminals",
      icon: Users,
      active: pathname.startsWith("/dashboard/criminals"),
    },
    {
      title: "AI Composite Sketch",
      url: "/sketch",
      icon: ScanFace,
      active: pathname === "/sketch",
    },
  ];

  if (user?.role === "ADMIN") {
    navItems.push({
      title: "System Telemetry & Audit",
      url: "/admin",
      icon: ShieldAlert,
      active: pathname === "/admin",
    });
  }

  const roleColor =
    user?.role === "ADMIN"
      ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
      : user?.role === "OFFICER"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
      : "bg-blue-500/10 text-blue-400 border-blue-500/30";

  return (
    <Sidebar collapsible="icon" className="border-r border-border/80 bg-card">
      {/* Brand Header */}
      <SidebarHeader className="border-b border-border/60 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/dashboard" />}
              className="hover:bg-transparent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md shadow-primary/20">
                <ShieldCheck className="size-5" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-heading font-bold text-foreground tracking-tight">
                  Forensix
                </span>
                <span className="truncate text-[10px] text-muted-foreground uppercase font-mono tracking-wider flex items-center gap-1">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Criminal Eye
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Main Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Operational Modules
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<Link href={item.url} />}
                    isActive={item.active}
                    tooltip={item.title}
                  >
                    <item.icon className="size-4 shrink-0" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* User & Role Footer */}
      <SidebarFooter className="p-3 border-t border-border/60">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="size-8 rounded-lg border border-border">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : null}
                <AvatarFallback className="rounded-lg bg-muted text-foreground text-xs font-semibold">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : "FX"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-xs leading-tight truncate">
                <span className="truncate font-semibold text-foreground">{user?.name || "Investigator"}</span>
                <span className="truncate text-[10px] text-muted-foreground font-mono">
                  {user?.badgeId ? `Badge #${user.badgeId}` : user?.email}
                </span>
              </div>
            </div>
            <ModeToggle />
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
            <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${roleColor}`}>
              {user?.role || "INVESTIGATOR"}
            </span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition p-1 rounded hover:bg-muted"
              title="Sign Out"
            >
              <LogOut className="size-3.5" />
            </button>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
