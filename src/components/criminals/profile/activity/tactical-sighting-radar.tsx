"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Radio,
  Camera,
  MapPin,
  CheckCircle2,
  Navigation,
  Compass,
  Crosshair,
  Maximize2,
  Layers,
  Sparkles,
  Info,
  Clock,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CriminalActivityItem } from "@/features/criminals/activity-actions";
import { SENSOR_PRESETS } from "./criminal-activity-tab";

interface TacticalSightingRadarProps {
  activities: CriminalActivityItem[];
  criminalName: string;
  criminalId: string;
  onSelectEvent?: (eventId: string) => void;
}

interface RadarBlip {
  id: string;
  sensorId: string;
  sensorName: string;
  location: string;
  lat: number;
  lng: number;
  x: number; // 0 - 100% SVG coordinates
  y: number; // 0 - 100% SVG coordinates
  confidence: number;
  timestamp: string;
  relativeTime: string;
  status: string;
  isLatest: boolean;
  order: number;
}

export function TacticalSightingRadar({
  activities,
  criminalName,
  criminalId,
  onSelectEvent,
}: TacticalSightingRadarProps) {
  const [selectedBlip, setSelectedBlip] = useState<RadarBlip | null>(null);
  const [filterMode, setFilterMode] = useState<"ALL" | "RECENT">("ALL");

  // Extract real surveillance sightings from activity logs
  const blips = useMemo<RadarBlip[]>(() => {
    const rawHits = activities.filter(
      (a) =>
        a.category === "SURVEILLANCE" ||
        a.action.toLowerCase().includes("surveillance") ||
        a.action.toLowerCase().includes("sighting") ||
        a.metadata.sensorId
    );

    // Compute bounding coordinate bounds (defaulting around Chennai / Regional Grid)
    const baseLatMin = 12.95;
    const baseLatMax = 13.15;
    const baseLngMin = 80.15;
    const baseLngMax = 80.30;

    return rawHits.map((h, index) => {
      // Find matching preset or use coordinates in metadata
      const preset = SENSOR_PRESETS.find(
        (p) =>
          p.sensorId === h.metadata.sensorId ||
          p.location.toLowerCase() === (h.metadata.location || "").toLowerCase()
      );

      const lat =
        h.metadata.coordinates?.[0] ||
        preset?.latitude ||
        13.0827 + (index % 3 - 1) * 0.04;
      const lng =
        h.metadata.coordinates?.[1] ||
        preset?.longitude ||
        80.2707 + (index % 2 === 0 ? 0.02 : -0.02);

      // Normalize to 15% - 85% range within the SVG radar circle
      const normalizedX = 15 + ((lng - baseLngMin) / (baseLngMax - baseLngMin)) * 70;
      const normalizedY = 85 - ((lat - baseLatMin) / (baseLatMax - baseLatMin)) * 70;

      const clampedX = Math.max(15, Math.min(85, normalizedX));
      const clampedY = Math.max(15, Math.min(85, normalizedY));

      return {
        id: h.id,
        sensorId: h.metadata.sensorId || preset?.sensorId || `SENSOR-${index + 1}`,
        sensorName: preset?.sensorName || h.metadata.sensorId || "Optical Sensor Node",
        location: h.metadata.location || preset?.location || "Metropolitan Zone",
        lat,
        lng,
        x: clampedX,
        y: clampedY,
        confidence: h.metadata.confidenceScore
          ? Math.round(h.metadata.confidenceScore * 100)
          : 94,
        timestamp: h.formattedDate + " " + h.formattedTime,
        relativeTime: h.relativeTime,
        status: h.metadata.hitStatus || "CONFIRMED_SIGHTING",
        isLatest: index === 0,
        order: rawHits.length - index,
      };
    });
  }, [activities]);

  const displayedBlips = useMemo(() => {
    if (filterMode === "RECENT") return blips.slice(0, 3);
    return blips;
  }, [blips, filterMode]);

  return (
    <div className="rounded-xl border border-border/70 bg-card/40 backdrop-blur-md p-4 sm:p-5 shadow-xs flex flex-col gap-4 overflow-hidden relative">
      {/* Header with Title and Mode Toggles */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <Radio className="size-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-foreground tracking-tight">
                Tactical Geospatial Sighting Radar
              </h3>
              <Badge
                variant="outline"
                className="text-[10px] font-mono text-rose-400 border-rose-500/30 bg-rose-500/10 px-1.5 py-0"
              >
                {blips.length} Hit{blips.length === 1 ? "" : "s"} Plotted
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live trajectory vectors between ANPR toll plazas, optical nodes, and highway checkpoints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          <div className="flex items-center rounded-lg border border-border/70 bg-background/50 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setFilterMode("ALL")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium",
                filterMode === "ALL"
                  ? "bg-[#665AEF] text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All Detections
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("RECENT")}
              className={cn(
                "px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium",
                filterMode === "RECENT"
                  ? "bg-[#665AEF] text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Latest 3 Hits
            </button>
          </div>
        </div>
      </div>

      {/* Main Radar Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left Column: Circular Cyber Radar SVG Canvas (7 cols) */}
        <div className="lg:col-span-7 flex justify-center">
          <div className="relative size-68 sm:size-80 md:size-88 rounded-full border-2 border-border/70 bg-[#0B0F17]/95 overflow-hidden shadow-2xl flex items-center justify-center">
            {/* Concentric Range Rings */}
            <div className="absolute inset-4 rounded-full border border-cyan-500/10" />
            <div className="absolute inset-14 rounded-full border border-cyan-500/15" />
            <div className="absolute inset-26 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-38 rounded-full border border-cyan-500/25" />

            {/* Radar Crosshairs */}
            <div className="absolute inset-0 m-auto w-full h-px bg-cyan-500/20" />
            <div className="absolute inset-0 m-auto h-full w-px bg-cyan-500/20" />

            {/* Azimuth Angle Markings */}
            <span className="absolute top-1 text-[9px] font-mono text-cyan-400/60 font-semibold">000° N</span>
            <span className="absolute right-1.5 text-[9px] font-mono text-cyan-400/60 font-semibold">090° E</span>
            <span className="absolute bottom-1 text-[9px] font-mono text-cyan-400/60 font-semibold">180° S</span>
            <span className="absolute left-1.5 text-[9px] font-mono text-cyan-400/60 font-semibold">270° W</span>

            {/* Rotating Radar Sweep Beam */}
            <motion.div
              className="absolute inset-0 m-auto size-full origin-center pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            >
              <div
                className="w-1/2 h-1/2 absolute top-0 right-0 origin-bottom-left"
                style={{
                  background:
                    "conic-gradient(from 0deg at 0% 100%, rgba(34, 211, 238, 0.28) 0deg, rgba(34, 211, 238, 0) 55deg)",
                }}
              />
            </motion.div>

            {/* Trajectory SVG Vector Lines between consecutive detections */}
            <svg className="absolute inset-0 size-full pointer-events-none">
              {displayedBlips.length > 1 &&
                displayedBlips.map((blip, idx) => {
                  if (idx === displayedBlips.length - 1) return null;
                  const nextBlip = displayedBlips[idx + 1];
                  return (
                    <g key={`traj-${blip.id}-${nextBlip.id}`}>
                      <line
                        x1={`${blip.x}%`}
                        y1={`${blip.y}%`}
                        x2={`${nextBlip.x}%`}
                        y2={`${nextBlip.y}%`}
                        stroke="#665AEF"
                        strokeWidth="1.5"
                        strokeDasharray="4 3"
                        strokeOpacity="0.75"
                      />
                    </g>
                  );
                })}
            </svg>

            {/* Interactive Sighting Nodes (Blips) */}
            {displayedBlips.map((blip) => {
              const isSelected = selectedBlip?.id === blip.id;
              return (
                <div
                  key={blip.id}
                  style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
                  onClick={() => {
                    setSelectedBlip(blip);
                    if (onSelectEvent) onSelectEvent(blip.id);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                >
                  {/* Latest detection pulsing halo */}
                  {blip.isLatest && (
                    <span className="absolute -inset-2 rounded-full bg-rose-500/30 animate-ping pointer-events-none" />
                  )}

                  <div
                    className={cn(
                      "size-4 sm:size-4.5 rounded-full border-2 flex items-center justify-center transition-all duration-200 shadow-lg group-hover:scale-125",
                      blip.isLatest
                        ? "bg-rose-600 border-white text-white ring-4 ring-rose-500/30"
                        : isSelected
                        ? "bg-[#665AEF] border-cyan-400 text-white ring-4 ring-[#665AEF]/30"
                        : "bg-cyan-500 border-cyan-300 text-black group-hover:ring-2 group-hover:ring-cyan-400/40"
                    )}
                  >
                    <span className="text-[8px] font-mono font-bold">
                      {blip.order}
                    </span>
                  </div>

                  {/* Micro Label */}
                  <div className="absolute top-5 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 border border-cyan-500/40 pointer-events-none shadow-xl">
                    {blip.sensorId} ({blip.confidence}%)
                  </div>
                </div>
              );
            })}

            {/* Center Reticle Point */}
            <div className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] z-10 pointer-events-none" />
          </div>
        </div>

        {/* Right Column: Node Telemetry & Selected Sighting Inspector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3 min-w-0">
          <div className="rounded-lg border border-border/80 bg-background/50 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-border/40 pb-2">
              <span className="text-[11px] font-medium text-foreground flex items-center gap-1.5">
                <Compass className="size-3.5 text-[#665AEF]" />
                <span>Selected Sighting Vector</span>
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">
                {selectedBlip ? `NODE #${selectedBlip.order}` : "TAP ANY BLIP"}
              </span>
            </div>

            {selectedBlip ? (
              <div className="space-y-2 text-xs">
                <div>
                  <h4 className="font-semibold text-foreground text-xs leading-snug">
                    {selectedBlip.sensorName}
                  </h4>
                  <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                    <MapPin className="size-3 text-rose-400 shrink-0" />
                    <span className="truncate">{selectedBlip.location}</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[10px]">
                  <div className="p-2 rounded bg-muted/40 border border-border/50 space-y-0.5">
                    <span className="text-muted-foreground block text-[9px] uppercase">
                      Sensor Code
                    </span>
                    <span className="font-semibold text-[#a594fd]">
                      {selectedBlip.sensorId}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-muted/40 border border-border/50 space-y-0.5">
                    <span className="text-muted-foreground block text-[9px] uppercase">
                      Confidence
                    </span>
                    <span className="font-semibold text-emerald-400">
                      {selectedBlip.confidence}% Match
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/30">
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {selectedBlip.relativeTime}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-mono text-rose-400 border-rose-500/30 bg-rose-500/10 px-1 py-0"
                  >
                    {selectedBlip.status.replace(/_/g, " ")}
                  </Badge>
                </div>
              </div>
            ) : blips.length > 0 ? (
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs">
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>Latest Optical Ping: {blips[0].sensorId}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Last verified checkpoint sighting detected at <strong className="text-foreground">{blips[0].location}</strong> ({blips[0].relativeTime}) with {blips[0].confidence}% facial recognition match.
                </p>
                <div className="p-2 rounded-md bg-black/30 border border-border/40 font-mono text-[10px] text-muted-foreground">
                  COORDINATES: {blips[0].lat.toFixed(4)}° N, {blips[0].lng.toFixed(4)}° E
                </div>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic py-3 text-center">
                No active optical surveillance detections registered yet. Use "ANPR Sighting" above to log a sensor hit.
              </p>
            )}
          </div>

          {/* Telemetry Summary Metrics */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-lg border border-border/70 bg-card/40 space-y-0.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                Route Trajectory
              </span>
              <div className="font-semibold text-foreground text-xs flex items-center gap-1">
                <Navigation className="size-3 text-cyan-400" />
                <span>{blips.length > 1 ? "Corridor S-SW" : "Static Node"}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg border border-border/70 bg-card/40 space-y-0.5">
              <span className="text-[10px] font-mono text-muted-foreground uppercase">
                Active Sensors
              </span>
              <div className="font-semibold text-foreground text-xs font-mono">
                {SENSOR_PRESETS.length} Monitored
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
