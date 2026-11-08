"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "primary" | "warning";
  icon?: React.ReactNode;
  isLoading?: boolean;
  maxWidth?: string;
  zIndex?: string;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description = "This action cannot be undone!",
  children,
  confirmText = "Delete",
  cancelText = "Cancel",
  variant = "destructive",
  icon,
  isLoading = false,
  maxWidth = "max-w-md",
  zIndex = "z-[70]",
}: ConfirmDialogProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!mounted || !isOpen) return null;

  const defaultIcon =
    icon !== undefined ? (
      icon
    ) : variant === "destructive" ? (
      <Trash2 className="size-4" />
    ) : null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 flex items-center justify-center p-3 sm:p-6",
        zIndex
      )}
    >
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => {
          if (!isLoading) onClose();
        }}
      />

      {/* Confirmation Dialog Card */}
      <div
        role="alertdialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full bg-zinc-950 border-2 border-border/80 shadow-2xl rounded-2xl p-5 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200 text-foreground",
          maxWidth
        )}
      >
        {/* Title */}
        <h3 className="text-base sm:text-lg font-bold font-heading text-foreground tracking-tight leading-snug">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <div className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
            {description}
          </div>
        )}

        {/* Custom Body / Children Content */}
        {children && <div className="mt-3.5">{children}</div>}

        {/* Action Buttons Row */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2.5 sm:gap-3 mt-5 sm:mt-6 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={onClose}
            className="h-10 sm:h-9 px-4 text-xs font-semibold rounded-lg border-2 border-border/80 bg-zinc-900/60 hover:bg-zinc-800 text-foreground cursor-pointer transition-colors justify-center w-full sm:w-auto"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            size="sm"
            disabled={isLoading}
            onClick={onConfirm}
            className={cn(
              "h-10 sm:h-9 px-4 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 border-2 cursor-pointer transition-all shadow-xs w-full sm:w-auto",
              variant === "destructive"
                ? "bg-destructive hover:bg-destructive/90 text-white border-destructive shadow-destructive/20"
                : variant === "warning"
                ? "bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-amber-950/40"
                : "bg-[#665AEF] hover:bg-[#5749DF] text-white border-[#665AEF] shadow-[#665AEF]/30"
            )}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                {defaultIcon}
                <span>{confirmText}</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
