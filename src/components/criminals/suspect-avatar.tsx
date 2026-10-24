"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, ShieldAlert, AlertTriangle, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { getSafeStorageUrl } from "@/lib/storage-url";

interface SuspectAvatarProps {
  mugshotUrl?: string | null;
  name?: string;
  firstName?: string;
  lastName?: string;
  status?: string;
  riskLevel?: string;
  className?: string;
  priority?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "fill";
}

export function SuspectAvatar({
  mugshotUrl,
  name,
  firstName,
  lastName,
  status = "Active",
  riskLevel = "Medium",
  className,
  priority = false,
  size = "md",
}: SuspectAvatarProps) {
  const [hasError, setHasError] = useState(false);

  const displayName =
    name || `${firstName || ""} ${lastName || ""}`.trim() || "Suspect";

  const initials =
    displayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "S";

  const safeUrl = mugshotUrl ? getSafeStorageUrl(mugshotUrl) : null;

  const sizeClasses = {
    sm: "size-8 text-xs",
    md: "size-10 text-sm",
    lg: "size-16 text-lg",
    xl: "w-44 h-56 text-2xl",
    fill: "w-full h-full text-xl",
  };

  const isWanted = status?.toLowerCase() === "wanted";
  const isCritical = riskLevel?.toLowerCase() === "high" || riskLevel?.toLowerCase() === "critical";

  if (safeUrl && !hasError) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl bg-neutral-900 border border-border/80 shrink-0",
          sizeClasses[size],
          className
        )}
      >
        <Image
          src={safeUrl}
          alt={displayName}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 300px"
          className="object-cover"
          onError={() => setHasError(true)}
          unoptimized={safeUrl.startsWith("/api/") || safeUrl.includes("?")}
        />
        {/* Subtle holographic border overlay for high risk */}
        {isCritical && (
          <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-rose-500/30" />
        )}
      </div>
    );
  }

  // Fallback Monogram Avatar
  const isSmall = size === "sm" || size === "md";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center font-mono font-bold tracking-wider select-none shrink-0 overflow-hidden",
        isWanted
          ? "bg-rose-950/40 text-rose-300 border-2 border-rose-500/40"
          : isCritical
          ? "bg-amber-950/40 text-amber-300 border-2 border-amber-500/40"
          : "bg-neutral-900 text-neutral-300 border border-border/80",
        sizeClasses[size],
        className
      )}
    >
      {isSmall ? (
        <span className="text-xs uppercase">{initials}</span>
      ) : (
        <>
          <div className="flex flex-col items-center gap-1.5 p-2 text-center">
            <User className="size-5 opacity-60" />
            <span>{initials}</span>
          </div>
          <div className="absolute bottom-1 right-1 text-[9px] uppercase px-1 py-0.5 rounded bg-black/60 font-sans tracking-tight">
            {status}
          </div>
        </>
      )}
    </div>
  );
}
