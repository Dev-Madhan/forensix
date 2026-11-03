"use client";

import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  contentClassName,
  maxWidth = "max-w-lg",
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Dialog Box */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full bg-background border-2 border-border/80 shadow-2xl rounded-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh] sm:max-h-[90vh]",
          maxWidth,
          className
        )}
      >
        {/* Header */}
        {(title || description) && (
          <div className="flex items-start justify-between gap-2.5 sm:gap-3 px-3.5 py-3 sm:px-5 sm:py-4 border-b-2 border-border/60 bg-muted/20 shrink-0">
            <div className="flex-1 min-w-0 pr-1">
              {title && (
                <div className="text-sm sm:text-base font-semibold tracking-tight text-foreground">
                  {title}
                </div>
              )}
              {description && (
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/60 transition cursor-pointer shrink-0 -mr-1 -mt-0.5 touch-manipulation"
              aria-label="Close"
            >
              <X className="size-4.5 sm:size-4" />
            </button>
          </div>
        )}

        {/* Content with hidden scrollbar */}
        <div
          className={cn(
            "p-3.5 sm:p-5 overflow-y-auto flex-1 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            contentClassName
          )}
        >
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div
            data-modal-footer
            className="shrink-0 px-3.5 py-2.5 sm:px-5 sm:py-3.5 border-t-2 border-border/80 bg-background/95 backdrop-blur-md"
          >
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
