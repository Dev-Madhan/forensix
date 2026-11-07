import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppSidebar } from "@/components/layout/app-sidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CaseSectionCards } from "@/features/cases/components/case-section-cards";
import { CasesTable, type CaseItem } from "@/features/cases/components/cases-table";
import { getSafeStorageUrl } from "@/lib/storage-url";

export const metadata = {
  title: "Case | Forensix",
  description: "Comprehensive records, suspect profiles, and forensic tracking in one place.",
};

export default async function CasesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const user = session?.user
    ? {
        name: session.user.name,
        email: session.user.email,
        avatar: session.user.image || undefined,
        role: (session.user as { role?: string })?.role || "INVESTIGATOR",
      }
    : undefined;

  // Query real-time case counts from database with resilient fallback defaults
  let totalCount = 0;
  let openCount = 0;
  let investigatingCount = 0;
  let resolvedCount = 0;

  try {
    const [total, open, investigating, resolved] = await Promise.all([
      prisma.case.count(),
      prisma.case.count({ where: { status: "OPEN" } }),
      prisma.case.count({ where: { status: "UNDER_INVESTIGATION" } }),
      prisma.case.count({ where: { status: { in: ["CLOSED", "ARCHIVED"] } } }),
    ]);
    totalCount = total;
    openCount = open;
    investigatingCount = investigating;
    resolvedCount = resolved;
  } catch (error) {
    console.error("Failed to query case metrics from database:", error);
  }

  const metrics = {
    total: totalCount,
    open: openCount,
    underInvestigation: investigatingCount,
    resolved: resolvedCount,
  };

  // Query cases from database if available
  let dbCases: CaseItem[] = [];
  try {
    const rawCases = await prisma.case.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        assignedTo: {
          select: {
            name: true,
            email: true,
          },
        },
        evidences: {
          orderBy: { uploadedAt: "desc" },
          select: {
            id: true,
            title: true,
            fileName: true,
            fileUrl: true,
            storageKey: true,
            fileSize: true,
            mimeType: true,
            category: true,
            source: true,
            metadata: true,
            uploadedAt: true,
          },
        },
        sketches: {
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            imageUrl: true,
            description: true,
            createdAt: true,
          },
        },
      },
      take: 30,
    });

    dbCases = rawCases.map((c) => {
      // Extract clean location from description if present
      let location = "Chennai, TN";
      if (c.description) {
        const match = c.description.match(/Incident Location:\s*([^\n\r]+)/i);
        if (match && match[1]) {
          location = match[1].trim();
        }
      }

      // Map genuine case evidence & sketches into unified media list
      const media: import("@/features/cases/types").CaseMediaItem[] = [];

      for (const ev of c.evidences) {
        const ext = (ev.fileName || "").split(".").pop()?.toLowerCase() || "";
        const isImg =
          ev.category === "IMAGE" ||
          (ev.mimeType && ev.mimeType.startsWith("image/")) ||
          ["jpg", "jpeg", "png", "webp", "gif", "svg", "bmp"].includes(ext);
        const isVid =
          ev.category === "VIDEO" ||
          (ev.mimeType && ev.mimeType.startsWith("video/")) ||
          ["mp4", "mkv", "avi", "mov", "webm", "m4v"].includes(ext);
        const isAud =
          ev.category === "AUDIO" ||
          (ev.mimeType && ev.mimeType.startsWith("audio/")) ||
          ["mp3", "wav", "m4a", "ogg", "flac"].includes(ext);

        let cat: import("@/features/cases/types").CaseMediaItem["category"] = "DOCUMENT";
        if (isImg) cat = "IMAGE";
        else if (isVid) cat = "VIDEO";
        else if (isAud) cat = "AUDIO";

        const meta = (ev.metadata && typeof ev.metadata === "object" ? ev.metadata : {}) as Record<string, unknown>;

        // Safely resolve fileUrl through Tigris proxy or reliable evidence fallback
        const safeUrl =
          getSafeStorageUrl(
            ev.storageKey || ev.fileUrl,
            cat === "IMAGE" ? "/images/evidence/cctv_footage_01.jpg" : undefined
          ) || ev.fileUrl || "/images/evidence/cctv_footage_01.jpg";

        media.push({
          id: ev.id,
          title: ev.title || ev.fileName,
          category: cat,
          source: ev.source || "CRIME_SCENE",
          fileUrl: safeUrl,
          fileName: ev.fileName,
          fileSize: ev.fileSize,
          mimeType: ev.mimeType,
          uploadedAt: new Date(ev.uploadedAt).toISOString(),
          metadata: {
            cameraName:
              (meta.cameraName as string) ||
              (meta.sensorId as string) ||
              (cat === "VIDEO" ? "CAM-01 [REC]" : undefined),
            timestamp:
              (meta.timestamp as string) ||
              new Date(ev.uploadedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            location: (meta.location as string) || location,
          },
        });
      }

      for (const sk of c.sketches) {
        const safeSketchUrl =
          getSafeStorageUrl(sk.imageUrl, "/images/sketches/sketch-01.jpg") || sk.imageUrl;

        media.push({
          id: sk.id,
          title: sk.description || "AI Forensic Composite Sketch",
          category: "SKETCH",
          source: "FORENSIC_STUDIO",
          fileUrl: safeSketchUrl,
          fileName: `sketch_${sk.id.slice(0, 8)}.png`,
          fileSize: 1024 * 512,
          mimeType: "image/png",
          uploadedAt: new Date(sk.createdAt).toISOString(),
          metadata: {
            cameraName: "AI COMPOSITE",
            timestamp: new Date(sk.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        });
      }

      let mappedStatus: CaseItem["status"] = "Open";
      if (c.status === "UNDER_INVESTIGATION") mappedStatus = "Under Investigation";
      else if (c.status === "ARCHIVED") mappedStatus = "Archived";
      else if (c.status === "CLOSED") mappedStatus = "Closed";
      else if (c.status === "COLD" || c.status === "ON_HOLD") mappedStatus = "Cold";

      return {
        id: c.id,
        caseNumber: c.caseNumber,
        title: c.title,
        type: "Transit Crime",
        location,
        date: new Date(c.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        timestamp: new Date(c.createdAt).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: mappedStatus,
        description: c.description || undefined,
        assignedTo: c.assignedTo?.name || "Lead Investigator",
        media,
      };
    });
  } catch (error) {
    console.error("Failed to query cases from database:", error);
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border/40">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink render={<Link href="/dashboard" />}>
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Case</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8 w-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
            {/* Page Header: Title, Description & Action Button */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl font-heading">
                  Investigation Files
                </h1>
                <p className="text-sm text-muted-foreground">
                  Comprehensive records, suspect profiles, and forensic tracking in one place.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  className="h-10 gap-2 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-sm font-medium cursor-pointer shadow-sm shadow-[#665AEF]/25 px-4"
                  render={<Link href="/case-details/new" />}
                  nativeButton={false}
                >
                  <Plus className="size-4" />
                  <span>New Case</span>
                </Button>
              </div>
            </div>

            {/* 4 Case Section Cards */}
            <CaseSectionCards metrics={metrics} />

            {/* Cases Table and Case Details Preview */}
            <CasesTable initialCases={dbCases} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


