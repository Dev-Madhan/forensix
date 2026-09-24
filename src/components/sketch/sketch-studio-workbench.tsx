"use client";

import React from "react";
import { SketchProvider } from "./sketch-context";
import { FacialDatasetSidebar } from "./facial-dataset-sidebar";
import { CompositeSketchWorkspace } from "./composite-sketch-workspace";
import { SelectedFeaturesPanel } from "./selected-features-panel";
import { GenerationControlsPanel } from "./generation-controls-panel";
import { MobileTabBar } from "./mobile-tab-bar";
import { MobileTabContent } from "./mobile-tab-content";

export function SketchStudioWorkbench() {
  return (
    <SketchProvider>
      {/* Desktop: Original 3-column layout (unchanged) */}
      <div className="hidden md:flex flex-1 gap-3 p-3 h-[calc(100vh-3.5rem)] overflow-hidden bg-[#070709] text-foreground">
        {/* Left Column: Facial Dataset Sidebar */}
        <FacialDatasetSidebar />

        {/* Center Column: Composite Sketch Workspace */}
        <CompositeSketchWorkspace />

        {/* Right Column: Selected Features & Generation Controls */}
        <div className="w-[280px] sm:w-[300px] lg:w-[310px] shrink-0 h-full flex flex-col gap-3 overflow-hidden">
          <SelectedFeaturesPanel />
          <GenerationControlsPanel />
        </div>
      </div>

      {/* Mobile: Tabbed single-column layout */}
      <div className="flex md:hidden flex-col h-[calc(100dvh-3.5rem)] bg-[#070709] text-foreground overflow-hidden">
        <MobileTabContent />
        <MobileTabBar />
      </div>
    </SketchProvider>
  );
}
