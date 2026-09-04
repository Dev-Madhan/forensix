"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
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
} from "@/components/ui/sidebar";
import { NavUser } from "@/components/nav-user";
import {
  LayoutDashboard,
  Folder,
  Database,
  PenLine,
  FileText,
  Paperclip,
  BarChart3,
  Settings,
  HelpCircle,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

const navSections = [
  {
    label: "INVESTIGATION",
    items: [
      {
        title: "Cases",
        url: "/dashboard/cases",
        icon: Folder,
      },
      {
        title: "Criminal Database",
        url: "/dashboard/criminals",
        icon: Database,
      },
      {
        title: "Sketch Generator",
        url: "/sketch",
        icon: PenLine,
      },
    ],
  },
  {
    label: "RESOURCES",
    items: [
      {
        title: "Reports",
        url: "/dashboard/reports",
        icon: FileText,
      },
      {
        title: "Evidence",
        url: "/dashboard/evidence",
        icon: Paperclip,
      },
      {
        title: "Analytics",
        url: "/dashboard/analytics",
        icon: BarChart3,
      },
    ],
  },
];

const secondaryItems = [
  {
    title: "Settings",
    url: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Help & Support",
    url: "/help",
    icon: HelpCircle,
  },
];

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string;
  };
}

export function AppSidebar({ user: propUser, ...props }: AppSidebarProps) {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null);

  const user = propUser || {
    name: session?.user?.name || "Investigator",
    email: session?.user?.email || "officer@forensix.gov",
    avatar: session?.user?.image || undefined,
    role: (session?.user as { role?: string })?.role || "INVESTIGATOR",
  };

  const isDashboardActive = pathname === "/dashboard";

  return (
    <Sidebar variant="inset" {...props}>
      {/* Brand Header */}
      <SidebarHeader className="p-4 pb-3">
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <Image
            src="/images/Logo.png"
            alt="Forensix Logo"
            width={32}
            height={32}
            className="size-8 object-contain rounded-lg shrink-0 group-hover:opacity-90 transition"
            priority
          />
          <span className="font-bold text-lg tracking-tight text-foreground font-heading leading-none">
            Forensix
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent
        className="px-2"
        onPointerLeave={() => setHoveredItem(null)}
      >
        {/* Top Standalone Dashboard Item */}
        <SidebarGroup className="py-1">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={isDashboardActive}
                onPointerEnter={() => setHoveredItem("Dashboard")}
                className={cn(
                  "relative z-0 gap-3 py-2.5 text-sm font-medium transition-colors hover:!bg-transparent cursor-pointer",
                  isDashboardActive
                    ? "text-blue-400 font-semibold before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r-full before:bg-blue-500"
                    : "text-muted-foreground hover:text-foreground",
                  isDashboardActive && hoveredItem !== "Dashboard"
                    ? "bg-blue-600/15"
                    : "!bg-transparent"
                )}
                render={<Link href="/dashboard" />}
              >
                {hoveredItem === "Dashboard" && (
                  <motion.div
                    layoutId="sidebar-hover"
                    className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                  />
                )}
                <LayoutDashboard
                  className={`size-4 shrink-0 ${
                    isDashboardActive ? "text-blue-400" : "text-blue-500"
                  }`}
                />
                <span>Dashboard</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Sections: INVESTIGATION & RESOURCES */}
        {navSections.map((section) => (
          <SidebarGroup key={section.label} className="py-2">
            <SidebarGroupLabel className="text-[11px] font-semibold tracking-wider text-muted-foreground/70 uppercase px-3">
              {section.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const isActive = pathname.startsWith(item.url);
                  const isHovered = hoveredItem === item.title;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onPointerEnter={() => setHoveredItem(item.title)}
                        className={cn(
                          "relative z-0 gap-3 py-2 text-sm transition-colors hover:!bg-transparent cursor-pointer",
                          isActive
                            ? "text-blue-400 font-medium before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-[3px] before:rounded-r-full before:bg-blue-500"
                            : "text-muted-foreground hover:text-foreground",
                          isActive && !isHovered
                            ? "bg-blue-600/15"
                            : "!bg-transparent"
                        )}
                        render={<Link href={item.url} />}
                      >
                        {isHovered && (
                          <motion.div
                            layoutId="sidebar-hover"
                            className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                            transition={{
                              type: "spring",
                              bounce: 0.3,
                              duration: 0.4,
                            }}
                          />
                        )}
                        <item.icon className="size-4 shrink-0" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {/* Secondary items: Settings & Help & Support */}
        <SidebarGroup className="mt-auto py-2">
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryItems.map((item) => {
                const isActive = pathname.startsWith(item.url);
                const isHovered = hoveredItem === item.title;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onPointerEnter={() => setHoveredItem(item.title)}
                      className={cn(
                        "relative z-0 gap-3 py-2 text-sm transition-colors hover:!bg-transparent cursor-pointer",
                        isActive
                          ? "text-blue-400 font-medium"
                          : "text-muted-foreground hover:text-foreground",
                        isActive && !isHovered
                          ? "bg-blue-600/15"
                          : "!bg-transparent"
                      )}
                      render={<Link href={item.url} />}
                    >
                      {isHovered && (
                        <motion.div
                          layoutId="sidebar-hover"
                          className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                          transition={{
                            type: "spring",
                            bounce: 0.3,
                            duration: 0.4,
                          }}
                        />
                      )}
                      <item.icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User profile dropdown component */}
      <SidebarFooter className="p-2">
        <NavUser user={user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
