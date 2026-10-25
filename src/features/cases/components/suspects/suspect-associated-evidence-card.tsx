"use client";

import React from "react";
import Image from "next/image";
import { Layers, ArrowRight, Video, FileImage } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { AssociatedEvidenceRef } from "./types";

interface SuspectAssociatedEvidenceCardProps {
  evidenceList?: AssociatedEvidenceRef[];
}

const DEFAULT_ASSOCIATED_EVIDENCE: AssociatedEvidenceRef[] = [
  {
    id: "ev-01",
    name: "CCTV_01.mp4",
    type: "Video",
    thumbnail: "/images/cctv-suspect.jpg",
    date: "Oct 4, 2026",
  },
  {
    id: "ev-02",
    name: "Suspect_Image_02.jpg",
    type: "Image",
    thumbnail: "/images/suspects/arun-prakash.jpg",
    date: "Oct 4, 2026",
  },
  {
    id: "ev-03",
    name: "Vehicle_01.jpg",
    type: "Image",
    thumbnail: "/images/feature-image.png",
    date: "Oct 4, 2026",
  },
  {
    id: "ev-04",
    name: "Weapon_01.jpg",
    type: "Image",
    thumbnail: "/images/stats-image.png",
    date: "Oct 4, 2026",
  },
];

export function SuspectAssociatedEvidenceCard({
  evidenceList = DEFAULT_ASSOCIATED_EVIDENCE,
}: SuspectAssociatedEvidenceCardProps) {
  const items = evidenceList.length > 0 ? evidenceList : DEFAULT_ASSOCIATED_EVIDENCE;

  return (
    <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs overflow-hidden py-0">
      <CardHeader className="flex flex-row items-center justify-between py-2 px-3.5 sm:px-4 border-b-2 border-border/50">
        <div className="flex items-center gap-2">
          <Layers className="size-4.5 text-[#665AEF] shrink-0" />
          <CardTitle className="text-xs sm:text-sm font-bold font-heading text-foreground">
            Associated Evidence
          </CardTitle>
        </div>

        <button
          type="button"
          onClick={() => toast.info("Displaying all connected evidence files")}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#665AEF] hover:text-[#5749DF] hover:underline transition-colors cursor-pointer"
        >
          <span>View All ({items.length})</span>
          <ArrowRight className="size-3" />
        </button>
      </CardHeader>

      <CardContent className="p-3 sm:p-3.5">
        <div className="grid grid-cols-4 gap-2">
          {items.slice(0, 4).map((item) => (
            <div
              key={item.id}
              onClick={() => toast.info(`Inspecting evidence: ${item.name}`)}
              className="group flex flex-col items-center gap-1 p-1.5 rounded-lg border-2 border-border/80 bg-card/60 hover:bg-card hover:border-[#665AEF]/50 transition-all cursor-pointer shadow-2xs text-center select-none"
            >
              {/* Thumbnail */}
              <div className="relative aspect-square w-full rounded overflow-hidden flex items-center justify-center bg-black/40 border border-border/40">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : item.type === "Video" ? (
                  <Video className="size-4 text-blue-400" />
                ) : (
                  <FileImage className="size-4 text-sky-400" />
                )}
              </div>
              {/* File name truncate */}
              <span className="text-[10px] font-medium text-muted-foreground group-hover:text-foreground transition-colors truncate w-full px-0.5">
                {item.name}
              </span>
              <span className="text-[9px] text-muted-foreground/70 truncate w-full">
                {item.date}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
