"use client";

import React from "react";
import { ScanFace, Layers, SlidersHorizontal, Image } from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useSketch, MobileTab } from "./sketch-context";

interface TabItem {
  id: MobileTab;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { id: "dataset", label: "Dataset", icon: ScanFace },
  { id: "canvas", label: "Canvas", icon: Layers },
  { id: "controls", label: "Controls", icon: SlidersHorizontal },
  { id: "output", label: "Output", icon: Image },
];

export function MobileTabBar() {
  const {
    activeMobileTab,
    setActiveMobileTab,
    selectedCount,
    generatedImageUrl,
  } = useSketch();

  return (
    <nav className="shrink-0 border-t-2 border-border/60 bg-[#0a0a0e]/98 backdrop-blur-xl pb-[env(safe-area-inset-bottom)] select-none z-40">
      <div className="flex items-center justify-around h-14 px-1">
        {TABS.map((tab) => {
          const isActive = activeMobileTab === tab.id;
          const Icon = tab.icon;

          // Badge logic
          const showBadge =
            (tab.id === "dataset" && selectedCount > 0) ||
            (tab.id === "output" && !!generatedImageUrl);
          const badgeText =
            tab.id === "dataset" ? String(selectedCount) : "●";

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveMobileTab(tab.id)}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer transition-colors duration-200",
                isActive
                  ? "text-[#a594fd]"
                  : "text-muted-foreground/60 active:text-muted-foreground"
              )}
            >
              {/* Active indicator pill */}
              {isActive && (
                <motion.div
                  layoutId="mobile_tab_indicator"
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full bg-[#665AEF] shadow-[0_0_8px_rgba(102,90,239,0.6)]"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.6,
                  }}
                />
              )}

              <div className="relative">
                <Icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    isActive && "scale-110"
                  )}
                />

                {/* Notification badge */}
                {showBadge && (
                  <span
                    className={cn(
                      "absolute -top-1.5 -right-2.5 flex items-center justify-center rounded-full text-white font-bold shadow-md ring-2 ring-[#0a0a0e]",
                      tab.id === "dataset"
                        ? "min-w-4 h-4 px-1 text-[9px] bg-[#665AEF]"
                        : "size-2.5 bg-emerald-500"
                    )}
                  >
                    {tab.id === "dataset" ? badgeText : null}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-[#a594fd] font-semibold" : "text-muted-foreground/50"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
