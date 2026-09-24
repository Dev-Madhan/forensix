"use client";

import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { useSketch } from "./sketch-context";
import { MobileDatasetView } from "./mobile-dataset-view";
import { MobileCanvasView } from "./mobile-canvas-view";
import { MobileControlsView } from "./mobile-controls-view";
import { CompositeOutputPreview } from "./composite-output-preview";

export function MobileTabContent() {
  const { activeMobileTab } = useSketch();

  return (
    <div className="flex-1 min-h-0 overflow-hidden relative">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeMobileTab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden overscroll-none"
        >
          {activeMobileTab === "dataset" && <MobileDatasetView />}
          {activeMobileTab === "canvas" && <MobileCanvasView />}
          {activeMobileTab === "controls" && <MobileControlsView />}
          {activeMobileTab === "output" && (
            <div className="flex-1 flex flex-col p-2 min-h-0">
              <CompositeOutputPreview />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
