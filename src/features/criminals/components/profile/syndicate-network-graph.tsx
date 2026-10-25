"use client";

import React, { useState, useMemo, useRef, useEffect, useCallback, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  Network,
  Users,
  FolderKanban,
  Shield,
  ShieldAlert,
  ArrowRight,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  UserCheck,
  Move,
  GripHorizontal,
  X,
  Layers,
  Search,
  ArrowLeft,
  CheckCircle2,
  Plus,
  Trash2,
  Radio,
  Loader2,
  Activity,
  GitBranch,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SuspectAvatar } from "@/features/criminals/components/suspect-avatar";
import { LinkCoOffenderModal } from "./link-co-offender-modal";
import {
  unlinkCoOffenderAction,
  getSecondDegreeAssociatesAction,
} from "@/features/criminals/syndicate-actions";
import { toast } from "sonner";

export interface CoOffenderItem {
  id: string;
  criminalId: string;
  name: string;
  alias: string | null;
  mugshotUrl: string | null;
  status: string;
  riskLevel: string;
  sharedCases: Array<{ caseNumber: string; title: string; role: string }>;
  slug: string;
  isSecondDegree?: boolean;
  bridgeAssociateId?: string;
}

export interface SyndicateNetworkGraphProps {
  primarySubject: {
    id: string;
    criminalId: string;
    name: string;
    mugshotUrl?: string | null;
    slug: string;
  };
  coOffenders: CoOffenderItem[];
}

interface NodePosition {
  x: number; // Percentage (0-100)
  y: number; // Percentage (0-100)
}

/**
 * Format raw database CUIDs or UUIDs into clean, official police suspect identifiers.
 */
function formatSuspectId(id?: string | null, fallbackIndex?: number): string {
  if (!id) {
    return `CR-2026-${String((fallbackIndex ?? 0) + 101).padStart(3, "0")}`;
  }
  if (/^c[a-z0-9]{15,}$/i.test(id) || /^[0-9a-f]{8}-[0-9a-f]{4}/i.test(id)) {
    return `CR-${id.slice(-4).toUpperCase()}`;
  }
  return id;
}

export function SyndicateNetworkGraph({
  primarySubject,
  coOffenders,
}: SyndicateNetworkGraphProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);

  // Real-Time 2nd Degree Network Nodes State
  const [secondDegreeNodes, setSecondDegreeNodes] = useState<CoOffenderItem[]>([]);
  const [isExpandingDepth, setIsExpandingDepth] = useState(false);
  const [isUnlinking, startUnlinkTransition] = useTransition();
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Interaction State
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<CoOffenderItem | null>(null);
  const [threatFilter, setThreatFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "MEDIUM">("ALL");
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Combined active associates (1st degree + any loaded 2nd degree nodes)
  const allAssociates = useMemo(() => {
    return [...coOffenders, ...secondDegreeNodes];
  }, [coOffenders, secondDegreeNodes]);

  // Dragging State for Interactive Evidence Board (Zero Latency)
  const [nodePositions, setNodePositions] = useState<Record<string, NodePosition>>({});
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; initialPos: NodePosition }>({
    mouseX: 0,
    mouseY: 0,
    initialPos: { x: 50, y: 50 },
  });

  // Pan dragging state
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef<{ mouseX: number; mouseY: number; initialPan: { x: number; y: number } }>({
    mouseX: 0,
    mouseY: 0,
    initialPan: { x: 0, y: 0 },
  });

  // Calculate mathematically optimized 2D layout with zero collisions
  const defaultPositions = useMemo(() => {
    const positions: Record<string, NodePosition> = {
      primary: { x: 50, y: 50 },
    };

    const count = coOffenders.length;
    if (count === 1) {
      positions["primary"] = { x: 38, y: 50 };
      positions[coOffenders[0].id] = { x: 74, y: 50 };
    } else if (count === 2) {
      // Diagonal bilateral spread
      positions["primary"] = { x: 50, y: 50 };
      positions[coOffenders[0].id] = { x: 22, y: 32 };
      positions[coOffenders[1].id] = { x: 78, y: 68 };
    } else if (count === 3) {
      positions["primary"] = { x: 50, y: 50 };
      positions[coOffenders[0].id] = { x: 22, y: 32 };
      positions[coOffenders[1].id] = { x: 78, y: 32 };
      positions[coOffenders[2].id] = { x: 50, y: 78 };
    } else {
      positions["primary"] = { x: 50, y: 50 };
      coOffenders.forEach((co, idx) => {
        const angle = (idx * 2 * Math.PI) / count - Math.PI / 2;
        const radiusX = 35;
        const radiusY = 32;
        positions[co.id] = {
          x: Math.round(50 + radiusX * Math.cos(angle)),
          y: Math.round(50 + radiusY * Math.sin(angle)),
        };
      });
    }

    // Position any 2nd degree nodes around their bridge associate
    secondDegreeNodes.forEach((node, idx) => {
      const bridgePos = positions[node.bridgeAssociateId || ""] || { x: 75, y: 50 };
      const offsetAngle = (idx * Math.PI) / 3 - Math.PI / 4;
      positions[node.id] = {
        x: Math.min(90, Math.max(10, Math.round(bridgePos.x + 18 * Math.cos(offsetAngle)))),
        y: Math.min(90, Math.max(10, Math.round(bridgePos.y + 18 * Math.sin(offsetAngle)))),
      };
    });

    return positions;
  }, [coOffenders, secondDegreeNodes]);

  // Load persisted evidence board layout from localStorage or default
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const storageKey = `forensix_syndicate_board_${primarySubject.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNodePositions((prev) => ({ ...defaultPositions, ...parsed }));
        return;
      }
    } catch {
      // Fallback to default
    }
    setNodePositions(defaultPositions);
  }, [defaultPositions, primarySubject.id]);

  // ── Live Real-Time Multi-Device / SSE Sync ────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/criminals/${primarySubject.id}/syndicate/stream`);

      eventSource.onopen = () => {
        setIsLiveConnected(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (
            payload.type === "NODE_LINKED" ||
            payload.type === "NODE_UNLINKED" ||
            payload.type === "ROLE_UPDATED"
          ) {
            toast.info(`⚡ Live Syndicate Push: Associative network updated in real time.`, {
              duration: 3500,
            });
            router.refresh();
          }
        } catch {
          // Keepalive or ping
        }
      };

      eventSource.onerror = () => {
        setIsLiveConnected(false);
      };
    } catch (err) {
      console.warn("SSE connection error:", err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [primarySubject.id, router]);

  // Filtered associates based on selected threat level
  const filteredAssociates = useMemo(() => {
    if (threatFilter === "ALL") return allAssociates;
    return allAssociates.filter((c) => {
      const risk = (c.riskLevel || "").toUpperCase();
      if (threatFilter === "CRITICAL") return risk === "CRITICAL";
      if (threatFilter === "HIGH") return risk === "HIGH";
      return risk !== "CRITICAL" && risk !== "HIGH";
    });
  }, [allAssociates, threatFilter]);

  // Reset View and Layout back to optimized defaults with smooth reset animation
  const handleResetLayout = useCallback(() => {
    setIsResetting(true);
    setNodePositions(defaultPositions);
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedNode(null);
    setSecondDegreeNodes([]);
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`forensix_syndicate_board_${primarySubject.id}`);
      } catch {}
    }
    const timer = setTimeout(() => setIsResetting(false), 250);
    return () => clearTimeout(timer);
  }, [defaultPositions, primarySubject.id]);

  // Zoom helpers
  const handleZoomIn = () => setZoom((z) => Math.min(1.75, +(z + 0.15).toFixed(2)));
  const handleZoomOut = () => setZoom((z) => Math.max(0.65, +(z - 0.15).toFixed(2)));

  // Drag Node Handler (Zero Latency Immediate Activation)
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const currentPos = nodePositions[nodeId] || defaultPositions[nodeId] || { x: 50, y: 50 };
    setDraggingNodeId(nodeId);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialPos: { ...currentPos },
    };
  };

  // Canvas Pan Handler
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current && !(e.target as HTMLElement).classList.contains("canvas-bg")) {
      return;
    }
    setIsPanning(true);
    panStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      initialPan: { ...pan },
    };
  };

  // 120fps Synchronous requestAnimationFrame Mouse Move Handler
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingNodeId && canvasRef.current) {
        const clientX = e.clientX;
        const clientY = e.clientY;

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
          if (!canvasRef.current) return;
          const rect = canvasRef.current.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            const deltaXPercent = ((clientX - dragStartRef.current.mouseX) / (rect.width * zoom)) * 100;
            const deltaYPercent = ((clientY - dragStartRef.current.mouseY) / (rect.height * zoom)) * 100;

            const newX = Math.min(88, Math.max(12, +(dragStartRef.current.initialPos.x + deltaXPercent).toFixed(2)));
            const newY = Math.min(88, Math.max(12, +(dragStartRef.current.initialPos.y + deltaYPercent).toFixed(2)));

            setNodePositions((prev) => {
              const updated = {
                ...prev,
                [draggingNodeId]: { x: newX, y: newY },
              };
              // Persist custom evidence board coordinates to localStorage
              if (typeof window !== "undefined") {
                try {
                  localStorage.setItem(
                    `forensix_syndicate_board_${primarySubject.id}`,
                    JSON.stringify(updated)
                  );
                } catch {}
              }
              return updated;
            });
          }
        });
      } else if (isPanning) {
        const clientX = e.clientX;
        const clientY = e.clientY;

        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
          const deltaX = clientX - panStartRef.current.mouseX;
          const deltaY = clientY - panStartRef.current.mouseY;
          setPan({
            x: panStartRef.current.initialPan.x + deltaX,
            y: panStartRef.current.initialPan.y + deltaY,
          });
        });
      }
    };

    const handleMouseUp = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      setDraggingNodeId(null);
      setIsPanning(false);
    };

    if (draggingNodeId || isPanning) {
      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [draggingNodeId, isPanning, zoom, primarySubject.id]);

  // Handle Unlink / Sever Associate Link Action
  const handleSeverLink = (targetCriminalId: string) => {
    startUnlinkTransition(async () => {
      try {
        await unlinkCoOffenderAction({
          subjectId: primarySubject.id,
          targetCriminalId,
        });
        toast.success("Syndicate connection severed successfully.");
        setSelectedNode(null);
        router.refresh();
      } catch (err: any) {
        toast.error(err?.message || "Failed to sever syndicate link.");
      }
    });
  };

  // Handle 2nd Degree Network Expansion ("Depth 2 Cartel Traversal")
  const handleExpandSecondDegree = async (associateId: string) => {
    setIsExpandingDepth(true);
    try {
      const excludeIds = [primarySubject.id, ...allAssociates.map((a) => a.id)];
      const results = await getSecondDegreeAssociatesAction(associateId, excludeIds);

      if (results.length === 0) {
        toast.info("No further 2nd-degree cartel links found for this suspect.");
      } else {
        setSecondDegreeNodes((prev) => [...prev, ...results]);
        toast.success(`Expanded network: +${results.length} 2nd-degree cartel associates mapped!`);
      }
    } catch {
      toast.error("Failed to query 2nd-degree syndicate network.");
    } finally {
      setIsExpandingDepth(false);
    }
  };

  // Aggregate Syndicate Intelligence stats
  const stats = useMemo(() => {
    const criticalCount = allAssociates.filter((c) => (c.riskLevel || "").toUpperCase() === "CRITICAL").length;
    const highCount = allAssociates.filter((c) => (c.riskLevel || "").toUpperCase() === "HIGH").length;
    const allFIRs = new Set<string>();
    allAssociates.forEach((c) => c.sharedCases.forEach((sc) => allFIRs.add(sc.caseNumber)));

    return {
      total: allAssociates.length,
      criticalCount,
      highCount,
      firCount: allFIRs.size,
    };
  }, [allAssociates]);

  const subjectPos = nodePositions["primary"] || defaultPositions["primary"] || { x: 50, y: 50 };

  return (
    <div
      ref={containerRef}
      className={cn(
        "flex flex-col gap-3 w-full transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 bg-background p-4 sm:p-6 overflow-y-auto"
      )}
    >
      {/* ── Top Tactical Workbench Bar ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-border/50 text-xs">
        {/* Left: Real-Time Action & Threat Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Link Co-Conspirator Modal Trigger */}
          <Button
            type="button"
            size="sm"
            onClick={() => setIsLinkModalOpen(true)}
            className="h-8 gap-1.5 px-3 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold shadow-xs cursor-pointer mr-1"
          >
            <Plus className="size-3.5" />
            <span>Link Associate</span>
          </Button>

          <button
            type="button"
            onClick={() => setThreatFilter("ALL")}
            className={cn(
              "h-8 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs flex items-center gap-1.5",
              threatFilter === "ALL"
                ? "bg-[#665AEF] text-white border-[#665AEF] shadow-xs"
                : "bg-muted/40 hover:bg-muted/70 text-muted-foreground border-border/70 hover:text-foreground"
            )}
          >
            <span>All ({allAssociates.length})</span>
          </button>

          {stats.criticalCount > 0 && (
            <button
              type="button"
              onClick={() => setThreatFilter("CRITICAL")}
              className={cn(
                "h-8 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs flex items-center gap-1.5",
                threatFilter === "CRITICAL"
                  ? "bg-rose-500 text-white border-rose-500 shadow-xs"
                  : "bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20"
              )}
            >
              <span className="size-1.5 rounded-full bg-rose-500" />
              <span>Critical ({stats.criticalCount})</span>
            </button>
          )}

          {stats.highCount > 0 && (
            <button
              type="button"
              onClick={() => setThreatFilter("HIGH")}
              className={cn(
                "h-8 px-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border shadow-2xs flex items-center gap-1.5",
                threatFilter === "HIGH"
                  ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20"
              )}
            >
              <span className="size-1.5 rounded-full bg-amber-500" />
              <span>High ({stats.highCount})</span>
            </button>
          )}
        </div>

        {/* Right: Real-Time Live Sync Status & Board Manipulation Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Live Sync Indicator */}
          <div className="hidden xs:flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/40 border border-border/70 text-[10px] font-mono">
            <span
              className={cn(
                "size-1.5 rounded-full",
                isLiveConnected ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
              )}
            />
            <span className={isLiveConnected ? "text-emerald-400 font-semibold" : "text-muted-foreground"}>
              {isLiveConnected ? "LIVE STREAM ACTIVE" : "OFFLINE"}
            </span>
          </div>

          <div className="flex items-center bg-muted/40 border border-border/70 rounded-lg p-0.5 shadow-2xs">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleZoomOut}
              disabled={zoom <= 0.65}
              title="Zoom Out"
              className="size-7 rounded text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
            >
              <ZoomOut className="size-3.5" />
            </Button>
            <span className="px-2 font-mono text-[10px] text-muted-foreground select-none">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={handleZoomIn}
              disabled={zoom >= 1.75}
              title="Zoom In"
              className="size-7 rounded text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-30"
            >
              <ZoomIn className="size-3.5" />
            </Button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetLayout}
            title="Reset Board Layout to Default"
            className="h-8 gap-1.5 px-2.5 rounded-lg border-border/80 bg-background/50 hover:bg-muted text-xs text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
          >
            <RotateCcw className="size-3 text-muted-foreground" />
            <span className="hidden sm:inline">Reset</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Board"}
            className="h-8 px-2.5 rounded-lg border-border/80 bg-background/50 hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer shadow-2xs"
          >
            {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
          </Button>
        </div>
      </div>

      {/* ── Main Workspace: 8 Cols Canvas + 4 Cols Inspector ───────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
        {/* ── Left 8 cols: Interactive Canvas ─────────────────────── */}
        <div
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          className={cn(
            "lg:col-span-8 relative h-115 sm:h-130 w-full rounded-xl border-2 border-border/80 bg-card/40 backdrop-blur-xs overflow-hidden select-none shadow-xs",
            isPanning ? "cursor-grabbing" : "cursor-grab"
          )}
        >
          {/* Subtle Forensic Evidence Grid Background */}
          <div
            className="canvas-bg absolute inset-0 pointer-events-none opacity-25"
            style={{
              backgroundImage:
                "radial-gradient(var(--border) 1.2px, transparent 1.2px)",
              backgroundSize: "22px 22px",
              backgroundPosition: "0 0",
            }}
          />

          {/* Bottom Legend & Interaction Helper Bar */}
          <div className="absolute bottom-3 inset-x-3 z-30 pointer-events-none flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-md border border-border/70 text-[10px] font-mono shadow-2xs">
              <span className="flex items-center gap-1.5 text-foreground/90 font-medium">
                <span className="size-2 rounded-full bg-[#665AEF] ring-1 ring-[#665AEF]/50" />
                <span>Subject</span>
              </span>
              <span className="text-border">|</span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="size-2 rounded-full bg-rose-500" />
                <span>Critical</span>
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="size-2 rounded-full bg-amber-500" />
                <span>High</span>
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="size-2 rounded-full bg-emerald-500" />
                <span>Active</span>
              </span>
              {secondDegreeNodes.length > 0 && (
                <>
                  <span className="text-border">|</span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="size-2 rounded-full bg-cyan-400 border border-dashed border-white" />
                    <span>2nd Degree Cartel</span>
                  </span>
                </>
              )}
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-background/90 backdrop-blur-md border border-border/70 text-[10px] font-mono text-muted-foreground shadow-2xs">
              <Move className="size-2.5 text-[#a594fd]" />
              <span>Drag nodes to organize • Auto-saved</span>
            </div>
          </div>

          {/* Scalable & Pannable Graph Workspace */}
          <div
            className="absolute inset-0 size-full origin-center"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transition: isPanning ? "none" : "transform 75ms ease-out",
            }}
          >
            {/* SVG Connecting Edges (Zero Latency) */}
            <svg className="absolute inset-0 size-full pointer-events-none overflow-visible">
              {filteredAssociates.map((co) => {
                const pos = nodePositions[co.id] || defaultPositions[co.id] || { x: 75, y: 50 };
                const isHovered = hoveredNodeId === co.id;
                const isSelected = selectedNode?.id === co.id;
                const isFaded = (hoveredNodeId || selectedNode) && !isHovered && !isSelected;

                const originPos = co.isSecondDegree
                  ? nodePositions[co.bridgeAssociateId || ""] || subjectPos
                  : subjectPos;

                return (
                  <line
                    key={`edge-${co.id}`}
                    x1={`${originPos.x}%`}
                    y1={`${originPos.y}%`}
                    x2={`${pos.x}%`}
                    y2={`${pos.y}%`}
                    stroke={isSelected || isHovered ? "#665AEF" : co.isSecondDegree ? "#06b6d4" : "var(--border)"}
                    strokeWidth={isSelected || isHovered ? "2.5" : co.isSecondDegree ? "1.5" : "1.5"}
                    strokeDasharray={co.isSecondDegree ? "3 3" : isSelected || isHovered ? "none" : "5 4"}
                    strokeOpacity={isFaded ? "0.2" : isSelected || isHovered ? "1" : "0.75"}
                  />
                );
              })}
            </svg>

            {/* FIR Bridge Pill Badges (Zero Latency HTML Overlays) */}
            {filteredAssociates.map((co) => {
              const pos = nodePositions[co.id] || defaultPositions[co.id] || { x: 75, y: 50 };
              const originPos = co.isSecondDegree
                ? nodePositions[co.bridgeAssociateId || ""] || subjectPos
                : subjectPos;

              const midX = (originPos.x + pos.x) / 2;
              const midY = (originPos.y + pos.y) / 2;
              const firNumber = co.sharedCases[0]?.caseNumber || "MUTUAL FIR";
              const isHovered = hoveredNodeId === co.id;
              const isSelected = selectedNode?.id === co.id;
              const isFaded = (hoveredNodeId || selectedNode) && !isHovered && !isSelected;

              return (
                <div
                  key={`fir-bridge-${co.id}`}
                  style={{
                    left: `${midX}%`,
                    top: `${midY}%`,
                  }}
                  onClick={() => setSelectedNode(co)}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 z-25 cursor-pointer pointer-events-auto select-none",
                    isResetting ? "transition-[left,top] duration-250 ease-out" : "transition-[opacity,transform] duration-150",
                    isFaded && "opacity-25",
                    (isSelected || isHovered) ? "scale-105 z-40" : "hover:scale-105"
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border shadow-2xs backdrop-blur-md transition-colors whitespace-nowrap",
                      isSelected || isHovered
                        ? "bg-[#665AEF] text-white border-[#665AEF] shadow-xs font-bold"
                        : "bg-card text-muted-foreground border-border/80 hover:border-[#665AEF] hover:text-foreground"
                    )}
                  >
                    <span
                      className={cn(
                        "size-1 rounded-full",
                        co.isSecondDegree ? "bg-cyan-400" : "bg-[#a594fd]"
                      )}
                    />
                    <span>{firNumber}</span>
                  </span>
                </div>
              );
            })}

            {/* ── Central Primary Subject Node (Zero Latency Instant Drag) ── */}
            <div
              style={{
                left: `${subjectPos.x}%`,
                top: `${subjectPos.y}%`,
              }}
              onMouseDown={(e) => handleNodeMouseDown(e, "primary")}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 z-30 w-48 p-2 rounded-xl border-2 border-[#665AEF] bg-card/95 backdrop-blur-md shadow-md select-none",
                isResetting ? "transition-[left,top] duration-250 ease-out" : "transition-[border-color,box-shadow,opacity] duration-150",
                draggingNodeId === "primary"
                  ? "cursor-grabbing shadow-xl ring-2 ring-[#665AEF]/50 z-50 scale-102"
                  : "cursor-grab active:cursor-grabbing hover:shadow-lg"
              )}
            >
              <div className="flex items-center gap-2">
                <div className="relative shrink-0">
                  <SuspectAvatar
                    mugshotUrl={primarySubject.mugshotUrl}
                    name={primarySubject.name}
                    size="md"
                    className="size-10 rounded-lg border-2 border-[#665AEF]/80 shadow-2xs"
                  />
                  <span className="absolute -bottom-1 -right-1 flex size-3.5 items-center justify-center rounded-full bg-[#665AEF] text-white">
                    <Shield className="size-2" />
                  </span>
                </div>

                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-white bg-[#665AEF] px-1 py-0.2 rounded leading-tight">
                      Subject
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground truncate">
                      {formatSuspectId(primarySubject.criminalId)}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground truncate pt-0.5" title={primarySubject.name}>
                    {primarySubject.name}
                  </h4>
                  <span className="text-[9px] text-[#a594fd] font-mono leading-tight">
                    Primary Focus
                  </span>
                </div>
              </div>
            </div>

            {/* ── Satellite Associate Nodes (Zero Latency Instant Drag) ── */}
            {filteredAssociates.map((co, idx) => {
              const pos = nodePositions[co.id] || defaultPositions[co.id] || { x: 75, y: 50 };
              const isHovered = hoveredNodeId === co.id;
              const isSelected = selectedNode?.id === co.id;
              const isFaded = (hoveredNodeId || selectedNode) && !isHovered && !isSelected;
              const isDragging = draggingNodeId === co.id;

              const isCritical = (co.riskLevel || "").toUpperCase() === "CRITICAL";
              const isHigh = (co.riskLevel || "").toUpperCase() === "HIGH";

              return (
                <div
                  key={co.id}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                  }}
                  onMouseEnter={() => setHoveredNodeId(co.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  onMouseDown={(e) => handleNodeMouseDown(e, co.id)}
                  onClick={() => setSelectedNode(co)}
                  className={cn(
                    "absolute -translate-x-1/2 -translate-y-1/2 z-20 w-46 p-2 rounded-xl border-2 bg-card/95 backdrop-blur-md shadow-xs select-none",
                    isResetting ? "transition-[left,top] duration-250 ease-out" : "transition-[border-color,box-shadow,opacity,transform] duration-150",
                    co.isSecondDegree
                      ? "border-cyan-500/60 border-dashed hover:border-cyan-400 bg-cyan-950/20"
                      : isCritical
                      ? "border-rose-500/80 hover:border-rose-500"
                      : isHigh
                      ? "border-amber-500/80 hover:border-amber-500"
                      : "border-border/80 hover:border-[#665AEF]",
                    isDragging
                      ? "cursor-grabbing shadow-xl ring-2 ring-[#665AEF] z-50 scale-105"
                      : "cursor-grab active:cursor-grabbing",
                    isSelected && "ring-2 ring-[#665AEF] border-[#665AEF] shadow-md z-40 scale-105",
                    isHovered && !isSelected && !isDragging && "border-[#665AEF] z-40 scale-102",
                    isFaded && "opacity-35 grayscale-20 scale-95"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative shrink-0">
                      <SuspectAvatar
                        mugshotUrl={co.mugshotUrl}
                        name={co.name}
                        size="sm"
                        className="size-9 rounded-lg border border-border/80"
                      />
                      <span
                        className={cn(
                          "absolute -bottom-1 -right-1 size-2.5 rounded-full border-2 border-card",
                          co.status === "WANTED"
                            ? "bg-rose-500"
                            : co.status === "ACTIVE"
                            ? "bg-emerald-500"
                            : "bg-neutral-500"
                        )}
                      />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "text-[9px] uppercase font-bold font-mono px-1 py-0 rounded leading-tight",
                            co.isSecondDegree
                              ? "bg-cyan-500/20 text-cyan-300"
                              : isCritical
                              ? "bg-rose-500/15 text-rose-400"
                              : isHigh
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-emerald-500/15 text-emerald-400"
                          )}
                        >
                          {co.isSecondDegree ? "2nd Degree" : co.riskLevel}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground truncate">
                          {formatSuspectId(co.criminalId, idx)}
                        </span>
                      </div>

                      <h5 className="text-xs font-semibold text-foreground truncate pt-0.5" title={co.name}>
                        {co.name}
                      </h5>

                      <span className="text-[9px] text-muted-foreground font-mono leading-tight">
                        {co.sharedCases.length} Mutual FIR{co.sharedCases.length === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right 4 cols: Tactical Intelligence Inspector ─────── */}
        <div className="lg:col-span-4 flex flex-col min-w-0">
          <div className="h-115 sm:h-130 rounded-xl border-2 border-border/80 bg-card/60 backdrop-blur-xs p-3.5 sm:p-4 flex flex-col justify-between shadow-xs">
            {/* Inspector Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex size-7 items-center justify-center rounded-md bg-[#665AEF]/15 text-[#a594fd] border border-[#665AEF]/30 shrink-0">
                  {selectedNode ? <UserCheck className="size-3.5" /> : <ShieldAlert className="size-3.5" />}
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-semibold text-foreground truncate">
                    {selectedNode ? "Associate Dossier" : "Syndicate Threat Matrix"}
                  </h4>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {selectedNode ? "Direct investigation nexus" : "Mutual cross-case intelligence"}
                  </p>
                </div>
              </div>

              {selectedNode && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setSelectedNode(null)}
                  title="Close Inspector"
                  className="size-6 rounded text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>

            {/* Inspector Body (Scrollable if content overflows without visible scrollbars) */}
            <div className="py-2.5 flex-1 flex flex-col gap-3 min-w-0 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {selectedNode ? (
                /* ── State A: Suspect Selected ─────────────────────── */
                <div className="space-y-3">
                  {/* Suspect Hero Card */}
                  <div className="flex items-start gap-3 p-2.5 rounded-lg border border-border/60 bg-muted/20">
                    <SuspectAvatar
                      mugshotUrl={selectedNode.mugshotUrl}
                      name={selectedNode.name}
                      size="md"
                      className="size-12 rounded-lg border-2 border-border/80 shrink-0 shadow-2xs"
                    />

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-foreground truncate">
                          {selectedNode.name}
                        </h4>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] uppercase font-mono px-1.5 py-0 h-4 shrink-0 font-bold",
                            selectedNode.isSecondDegree
                              ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                              : selectedNode.riskLevel === "CRITICAL"
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                              : selectedNode.riskLevel === "HIGH"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          )}
                        >
                          {selectedNode.isSecondDegree ? "2nd-Degree" : selectedNode.riskLevel}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#a594fd]">
                        <span>{formatSuspectId(selectedNode.criminalId)}</span>
                        {selectedNode.alias && (
                          <span className="text-muted-foreground italic truncate">
                            "{selectedNode.alias}"
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <span className="font-mono">Status:</span>
                        <span className="font-semibold text-foreground/90">{selectedNode.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Mutual Cases Bridge */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-foreground text-[11px] flex items-center gap-1">
                      <FolderKanban className="size-3 text-[#665AEF]" />
                      <span>Mutual FIR Investigations ({selectedNode.sharedCases.length})</span>
                    </span>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {selectedNode.sharedCases.map((sc) => (
                        <div
                          key={sc.caseNumber}
                          className="p-2 rounded-lg bg-background/60 border border-border/60 flex flex-col gap-1 text-[11px]"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono font-semibold text-[#a594fd]">
                              {sc.caseNumber}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted/60 text-muted-foreground border border-border/40">
                              {sc.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-foreground/80 truncate">
                            {sc.title}
                          </p>
                          <Link
                            href={`/case-details/${sc.caseNumber}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground pt-0.5 cursor-pointer"
                          >
                            <span>Inspect Case FIR</span>
                            <ExternalLink className="size-2.5" />
                          </Link>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Real-Time Investigative Actions */}
                  <div className="space-y-1.5 pt-1">
                    {/* Action 1: Open Suspect Profile */}
                    <Button
                      render={
                        <Link href={`/dashboard/criminals/${selectedNode.slug}`} />
                      }
                      nativeButton={false}
                      className="w-full h-8 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <span>View Criminal Profile</span>
                      <ArrowRight className="size-3.5" />
                    </Button>

                    {/* Action 2: Expand 2nd Degree Cartel Links */}
                    {!selectedNode.isSecondDegree && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleExpandSecondDegree(selectedNode.id)}
                        disabled={isExpandingDepth}
                        className="w-full h-8 text-xs font-medium text-foreground/90 hover:bg-muted/60 border-border/80 gap-1.5 cursor-pointer"
                      >
                        {isExpandingDepth ? (
                          <>
                            <Loader2 className="size-3 animate-spin text-[#665AEF]" />
                            <span>Mapping 2nd-Degree Nodes...</span>
                          </>
                        ) : (
                          <>
                            <GitBranch className="size-3 text-[#a594fd]" />
                            <span>Expand Cartel Depth (2nd Degree)</span>
                          </>
                        )}
                      </Button>
                    )}

                    {/* Action 3: Sever Syndicate Link */}
                    {!selectedNode.isSecondDegree && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleSeverLink(selectedNode.id)}
                        disabled={isUnlinking}
                        className="w-full h-7 text-[11px] font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30 gap-1 cursor-pointer"
                      >
                        {isUnlinking ? (
                          <>
                            <Loader2 className="size-3 animate-spin text-rose-400" />
                            <span>Severing Link...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 className="size-3 text-rose-400" />
                            <span>Sever Syndicate Link</span>
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                /* ── State B: Network Overview ─────────────────────── */
                <div className="space-y-3 flex-1 flex flex-col min-h-0">
                  {/* Overview Metrics Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs shrink-0">
                    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/60 flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-mono">Linked Co-Accused</span>
                      <span className="text-base font-bold text-foreground">
                        {stats.total} Suspect{stats.total === 1 ? "" : "s"}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-muted/20 border border-border/60 flex flex-col gap-0.5">
                      <span className="text-[10px] text-muted-foreground font-mono">Common Cases</span>
                      <span className="text-base font-bold text-[#a594fd]">
                        {stats.firCount} FIR{stats.firCount === 1 ? "" : "s"}
                      </span>
                    </div>
                  </div>

                  {/* Quick Select Suspect Roster */}
                  <div className="space-y-1.5 pt-1 flex-1 flex flex-col min-h-0">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground shrink-0">
                      <span className="font-semibold text-foreground">Associated Suspects</span>
                      <span className="text-[10px] font-mono">Click to focus</span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-h-0 overflow-y-auto no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      {filteredAssociates.map((co, idx) => (
                        <div
                          key={co.id}
                          onClick={() => setSelectedNode(co)}
                          className={cn(
                            "group p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-between gap-2",
                            co.isSecondDegree
                              ? "border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40"
                              : "border-border/60 bg-background/50 hover:bg-muted/50 hover:border-[#665AEF]/50"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <SuspectAvatar
                              mugshotUrl={co.mugshotUrl}
                              name={co.name}
                              size="sm"
                              className="size-7.5 rounded-md border border-border/80 shrink-0"
                            />
                            <div className="min-w-0">
                              <h5 className="text-xs font-semibold text-foreground group-hover:text-[#a594fd] transition-colors truncate">
                                {co.name}
                              </h5>
                              <span className="text-[10px] font-mono text-muted-foreground">
                                {formatSuspectId(co.criminalId, idx)}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[9px] uppercase font-mono px-1 py-0 h-4 font-semibold",
                                co.isSecondDegree
                                  ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                                  : co.riskLevel === "CRITICAL"
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                  : co.riskLevel === "HIGH"
                                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              )}
                            >
                              {co.isSecondDegree ? "2nd-Deg" : co.riskLevel}
                            </Badge>
                            <ChevronRight className="size-3 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Status Bar */}
            <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    isLiveConnected ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                  )}
                />
                <span>BOARD STATE • {isLiveConnected ? "REALTIME SYNCED" : "LOCAL"}</span>
              </span>
              <span>{filteredAssociates.length} NODES MAPPED</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Link Associate Real-Time Modal ──────────────────────────── */}
      <LinkCoOffenderModal
        open={isLinkModalOpen}
        onOpenChange={setIsLinkModalOpen}
        primarySubject={primarySubject}
        onSuccess={() => {
          router.refresh();
        }}
      />
    </div>
  );
}
