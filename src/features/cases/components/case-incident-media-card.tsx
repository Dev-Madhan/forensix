"use client";

import * as React from "react";
import Image from "next/image";
import { Film, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ResolvedCaseDetail } from "@/features/cases/resolve-case";
import { resolveCaseLocation } from "@/lib/case-location-resolver";

interface CaseIncidentMediaCardProps {
  caseData: ResolvedCaseDetail;
  className?: string;
}

interface MediaItem {
  id: string;
  cam: string;
  timestamp: string;
  src: string;
  caption: string;
}

export function CaseIncidentMediaCard({
  caseData,
  className,
}: CaseIncidentMediaCardProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [mediaFallbackSrc, setMediaFallbackSrc] = React.useState<string | null>(null);

  React.useEffect(() => {
    setMediaFallbackSrc(null);
  }, [currentIndex]);

  const resolvedLoc = React.useMemo(
    () => resolveCaseLocation(caseData),
    [caseData]
  );

  // Dynamic incident media: prioritizes real case evidence and AI composite sketches
  const mediaItems: MediaItem[] = React.useMemo(() => {
    const items: MediaItem[] = [];

    // 1. Real evidence items uploaded to this case
    if (caseData.evidences && caseData.evidences.length > 0) {
      caseData.evidences.forEach((ev, idx) => {
        if (ev.previewImage) {
          items.push({
            id: ev.id,
            cam: ev.camId || (ev.type === "Video" ? `CCTV [CAM-${idx + 1}]` : `EVIDENCE #${idx + 1}`),
            timestamp: ev.timestamp || `${caseData.dateReported || "2026-11-01"} 21:14:00`,
            src: ev.previewImage,
            caption: ev.name || "Forensic case evidence artifact",
          });
        }
      });
    }

    // 2. Real sketches linked to this case
    if (caseData.sketches && caseData.sketches.length > 0) {
      caseData.sketches.forEach((sk, idx) => {
        items.push({
          id: sk.id,
          cam: `AI SKETCH #${idx + 1}`,
          timestamp: sk.createdAt
            ? new Date(sk.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "Active Synthesis",
          src: sk.imageUrl,
          caption: sk.description || "Synthesized AI Forensic Composite Sketch",
        });
      });
    }

    return items;
  }, [caseData]);

  const total = mediaItems.length;
  const currentMedia = total > 0 ? mediaItems[currentIndex] || mediaItems[0] : null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? total - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === total - 1 ? 0 : prev + 1));
  };

  const handleViewAllMedia = () => {
    // Switch to evidence tab if present
    const evidenceTabTrigger = document.querySelector(
      '[data-slot="tabs-trigger"][value="evidence"]'
    ) as HTMLElement | null;
    if (evidenceTabTrigger) {
      evidenceTabTrigger.click();
      evidenceTabTrigger.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Card
      className={`border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs ${className || ""
        }`}
    >
      {/* Card Header with direct icon */}
      <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b-2 border-border/60">
        <div className="flex items-center gap-2.5">
          <Film className="size-4.5 text-[#0070F3] shrink-0" />
          <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
            Incident Media
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-4 pb-4 px-4 sm:px-5">
        {/* Media Frame Viewer */}
        {currentMedia ? (
          <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border-2 border-border/80 bg-black/90 group shadow-inner">
            <Image
              key={currentMedia.id}
              src={mediaFallbackSrc || currentMedia.src}
              alt={currentMedia.caption}
              fill
              unoptimized
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 1280px) 100vw, 400px"
              priority
              onError={() => {
                setMediaFallbackSrc("/images/evidence/cctv_footage_01.jpg");
              }}
            />

            {/* Top-Right Forensic Timestamp & Camera ID */}
            <div className="absolute top-2.5 right-2.5 flex flex-col items-end text-right bg-black/70 backdrop-blur-xs px-2.5 py-1 rounded-md border-2 border-white/15 shadow-sm font-heading">
              <span className="text-[11px] font-heading font-bold tracking-wider text-white leading-tight">
                {currentMedia.cam}
              </span>
              <span className="text-[10px] font-heading font-medium text-zinc-300 leading-tight mt-0.5">
                {currentMedia.timestamp}
              </span>
            </div>

            {/* Navigation buttons */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous image"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-xs border-2 border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next image"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 size-7 rounded-full bg-black/60 hover:bg-black/85 text-white/90 hover:text-white backdrop-blur-xs border-2 border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-md"
                >
                  <ChevronRight className="size-4" />
                </button>
              </>
            )}

            {/* Bottom-Right Counter Badge (2/4) with Inter font */}
            <div
              className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs border-2 border-white/15 text-[11px] font-inter font-medium text-white shadow-sm tabular-nums"
              style={{
                fontFamily:
                  'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {currentIndex + 1}/{total}
            </div>
          </div>
        ) : (
          <div className="relative aspect-[16/10] w-full rounded-lg overflow-hidden border-2 border-dashed border-border/80 bg-muted/20 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <Film className="size-8 text-muted-foreground/40" />
            <div className="space-y-1">
              <p className="text-xs font-semibold text-foreground">No Incident Media Attached</p>
              <p className="text-[11px] text-muted-foreground max-w-[260px]">
                Surveillance footage, scene photos, and AI sketches attached to this case will display here.
              </p>
            </div>
          </div>
        )}

        {/* Caption & View All Media Link */}
        <div className="mt-3 flex items-center justify-between gap-3 text-xs">
          <span className="text-muted-foreground font-medium truncate">
            {currentMedia?.caption || "Forensic Case Evidence"}
          </span>
          <button
            type="button"
            onClick={handleViewAllMedia}
            className="inline-flex items-center gap-1 font-medium text-[#0070F3] hover:text-[#0070F3]/80 transition-colors shrink-0 cursor-pointer group"
          >
            <span>View All Media</span>
            <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
