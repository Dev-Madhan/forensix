"use client";

import React, { useState, useId } from "react";
import { motion } from "motion/react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AnimatedSelectOption {
  label: string;
  value: string;
}

interface AnimatedSelectProps {
  options: AnimatedSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  prefix?: string;
  className?: string;
  contentClassName?: string;
  align?: "start" | "end" | "center";
}

export function AnimatedSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  prefix,
  className,
  contentClassName,
  align = "start",
}: AnimatedSelectProps) {
  const instanceId = useId();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayText = selectedOption ? selectedOption.label : placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "flex w-full items-center justify-between gap-1.5 h-9.5 px-3 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground cursor-pointer select-none outline-none transition-colors hover:bg-muted/40 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]",
              className
            )}
          />
        }
      >
        <div className="flex items-center gap-1 min-w-0 truncate">
          {prefix && <span className="text-muted-foreground shrink-0">{prefix}</span>}
          <span className="truncate font-medium">{displayText}</span>
        </div>
        <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-1" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        sideOffset={5}
        className={cn(
          "min-w-(--anchor-width) w-auto max-w-xs p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border/80 overflow-hidden z-50",
          contentClassName
        )}
      >
        <DropdownMenuGroup
          className="space-y-0.5"
          onPointerLeave={() => setHoveredItem(null)}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <DropdownMenuItem
                key={opt.value}
                onPointerEnter={() => setHoveredItem(opt.value)}
                onClick={() => onChange(opt.value)}
                className="relative z-0 group flex items-center justify-between gap-2.5 cursor-pointer px-2.5 py-1.5 rounded-md text-xs transition-colors focus:text-accent-foreground hover:text-accent-foreground bg-transparent! outline-none"
              >
                {hoveredItem === opt.value && (
                  <motion.div
                    layoutId={`dropdown-hover-${instanceId}`}
                    className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                  />
                )}
                <span
                  className={cn(
                    "truncate",
                    isSelected ? "font-semibold text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                >
                  {opt.label}
                </span>
                {isSelected && (
                  <Check className="size-3.5 text-[#665AEF] shrink-0" />
                )}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
