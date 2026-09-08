"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import { Search, ChevronDown, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { SuspectStatus, SuspectRole } from "./types";

interface SuspectsFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter?: "ALL" | SuspectStatus;
  onStatusFilterChange?: (s: "ALL" | SuspectStatus) => void;
  roleFilter: "ALL" | SuspectRole;
  onRoleFilterChange: (r: "ALL" | SuspectRole) => void;
  onResetFilters: () => void;
}

export function SuspectsFilterToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  roleFilter,
  onRoleFilterChange,
  onResetFilters,
}: SuspectsFilterToolbarProps) {
  const [hoveredRole, setHoveredRole] = useState<string | null>(null);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    (statusFilter && statusFilter !== "ALL") ||
    roleFilter !== "ALL";

  return (
    <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
      {/* 1. Search Bar */}
      <div className="relative flex-1 min-w-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Search suspects by name, alias, or keyword..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-9.5 pl-8.5 pr-7 text-xs rounded-lg border-2 border-border bg-card/60 text-foreground placeholder:text-muted-foreground/70 focus-visible:ring-1 focus-visible:ring-[#665AEF]"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-0.5"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">

        {/* Role Filter Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                className="inline-flex items-center justify-between gap-1.5 h-9.5 px-2.5 rounded-lg border-2 border-border bg-card/60 text-xs font-normal text-foreground hover:bg-muted/60 cursor-pointer transition-colors shrink-0"
              />
            }
          >
            <span>{roleFilter === "ALL" ? "All Roles" : roleFilter}</span>
            <ChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            side="bottom"
            sideOffset={4}
            className="w-44 text-xs bg-card/95 backdrop-blur-xl border-2 border-border p-1 shadow-xl z-100 overflow-hidden rounded-xl"
            onPointerLeave={() => setHoveredRole(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-0.5"
            >
              {[
                { label: "All Roles", value: "ALL" as const },
                { label: "Direct Involvement", value: "Direct Involvement" as const },
                { label: "Possible Associate", value: "Possible Associate" as const },
                { label: "Accomplice", value: "Accomplice" as const },
                { label: "Informant", value: "Informant" as const },
                { label: "Witness", value: "Witness" as const },
              ].map((item) => (
                <DropdownMenuItem
                  key={item.value}
                  onPointerEnter={() => setHoveredRole(item.value)}
                  onClick={() => onRoleFilterChange(item.value)}
                  className="relative z-0 group flex items-center justify-between px-2.5 py-1.5 rounded-md cursor-pointer text-xs transition-colors hover:bg-transparent! focus:bg-transparent! text-foreground"
                >
                  {hoveredRole === item.value && (
                    <motion.div
                      layoutId="suspects-filter-role-hover"
                      className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    />
                  )}
                  <span>{item.label}</span>
                </DropdownMenuItem>
              ))}
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Reset Filters button */}
        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-9.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer rounded-lg hover:bg-muted/60"
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
