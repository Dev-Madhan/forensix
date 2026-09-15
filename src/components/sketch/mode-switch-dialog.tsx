"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSketch } from "./sketch-context";

export function ModeSwitchDialog() {
  const { pendingModeSwitch, cancelModeSwitch } = useSketch();

  if (!pendingModeSwitch) return null;

  const targetTitle =
    pendingModeSwitch.targetMode === "PROMPT_GENERATION"
      ? "Switch to Prompt Generation Mode?"
      : "Switch to Dataset Composite Mode?";

  return (
    <Dialog open={!!pendingModeSwitch} onOpenChange={(open) => !open && cancelModeSwitch()}>
      <DialogContent className="sm:max-w-md border-2 border-border/90 bg-[#0e0e14]/95 backdrop-blur-2xl shadow-2xl">
        <DialogHeader className="gap-2">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertTriangle className="size-5" />
            </div>
            <DialogTitle className="text-base font-semibold text-foreground">
              {targetTitle}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground/90 mt-1.5 leading-relaxed">
            {pendingModeSwitch.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={cancelModeSwitch}
            className="text-xs border-border/80 hover:bg-white/5 cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              pendingModeSwitch.onConfirm();
            }}
            className="text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium shadow-md shadow-amber-600/25 border border-amber-400/40 cursor-pointer"
          >
            Switch & Discard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
