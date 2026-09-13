"use client";

import React from "react";
import { Inbox, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useSketch } from "./sketch-context";
import { FacialFeatureIcon } from "./facial-feature-icon";

export function SelectedFeaturesPanel() {
  const { selectedFeatures, selectedCount, removeFeature } = useSketch();
  const featureList = Object.values(selectedFeatures);

  return (
    <div className="flex-1 min-h-0 rounded-xl border-2 border-border/80 bg-[#0d0d12]/90 backdrop-blur-2xl p-4 flex flex-col shadow-2xl overflow-hidden">
      {/* Header with Title and Counter Badge */}
      <div className="flex items-center justify-between pb-3">
        <h3 className="font-heading text-sm font-semibold text-foreground tracking-tight select-none">
          Selected Features
        </h3>
        <Badge
          variant="outline"
          className="text-xs font-mono px-2 py-0.5 rounded-md border-2 border-border/70 bg-black/40 text-muted-foreground min-w-6 text-center"
        >
          {selectedCount}
        </Badge>
      </div>

      {/* Content Area */}
      {selectedCount === 0 ? (
        /* Empty State matching screenshot */
        <div className="border border-dashed border-border/60 rounded-lg p-5 flex flex-col items-center justify-center text-center select-none bg-black/20 my-1">
          <div className="size-12 rounded-lg flex items-center justify-center text-muted-foreground/50 mb-2">
            <Inbox className="size-8 stroke-[1.5]" />
          </div>
          <p className="text-xs font-semibold text-foreground/90">
            No features selected
          </p>
          <p className="text-[11px] text-muted-foreground/70 mt-1 leading-relaxed max-w-[200px]">
            Select or drag features from the dataset to build the profile.
          </p>
        </div>
      ) : (
        /* Populated State */
        <div className="flex flex-col gap-2 flex-1 min-h-0 overflow-y-auto pr-1">
          {featureList.map((feat) => (
            <div
              key={feat.id}
              className="flex items-center justify-between p-2 rounded-md border-2 border-border/70 bg-black/40 hover:bg-white/5 transition-colors group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="size-8 rounded-md bg-[#0a0a0f] border border-border/70 p-1 flex items-center justify-center shrink-0">
                  <FacialFeatureIcon
                    svgType={feat.svgType}
                    className="size-full text-foreground/90"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-foreground truncate">
                    {feat.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground capitalize">
                    {feat.subcategoryLabel || feat.category}
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeFeature(feat.subcategory)}
                className="size-6 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-sm cursor-pointer shrink-0"
                aria-label={`Remove ${feat.name}`}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
