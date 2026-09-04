import React from "react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/auth");
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
          role: (session.user as { role?: string }).role || "INVESTIGATOR",
          badgeId: (session.user as { badgeId?: string | null }).badgeId,
        }}
      />

      <SidebarInset className="bg-background min-h-screen flex flex-col">
        {/* Top Operational Header Bar */}
        <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border/70 px-4 bg-background/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="text-foreground/80 font-semibold">TERMINAL</span>
              <span>/</span>
              <span>FORENSIX_OS</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link href="/dashboard/cases/new">
              <Button size="sm" className="h-8 gap-1 text-xs">
                <PlusCircle className="size-3.5" />
                <span>New Case</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Dashboard Page Body */}
        <main className="flex-1 flex flex-col overflow-x-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
