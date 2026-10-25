"use client";

import React from "react";
import { Undo2, Redo2, Trash2, RotateCcw, Folder, ChevronDown, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useSketch } from "./sketch-context";

export function CompositeSketchHeader() {
  const {
    selectedCount,
    canUndo,
    canRedo,
    undo,
    redo,
    clearAllFeatures,
    resetCanvas,
    generationStatus,
    availableCases,
    selectedCaseId,
    setSelectedCaseId,
    selectedCase,
    selectedWitnessId,
    setSelectedWitnessId,
    setPromptText,
  } = useSketch();

  const [aiStatus, setAiStatus] = React.useState<"checking" | "online" | "offline">("checking");

  React.useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await fetch("/api/ai/health", { cache: "no-store" });
        if (isMounted) {
          setAiStatus(res.ok ? "online" : "offline");
        }
      } catch {
        if (isMounted) setAiStatus("offline");
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const getStatusDisplay = () => {
    switch (generationStatus) {
      case "generating":
        return (
          <span className="text-[11px] font-mono font-medium text-amber-400">
            Generating...
          </span>
        );
      case "generated":
        return (
          <span className="text-[11px] font-mono font-medium text-emerald-400">
            Generated
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-mono font-medium text-muted-foreground/60">
            Not generated
          </span>
        );
    }
  };

  const handleSelectCase = (cId: string) => {
    setSelectedCaseId(cId);
    const target = availableCases.find((c) => c.id === cId);
    if (target?.witnesses && target.witnesses.length > 0) {
      setSelectedWitnessId(target.witnesses[0].id);
      if (target.witnesses[0].statement) {
        setPromptText(target.witnesses[0].statement || "");
      }
    } else {
      setSelectedWitnessId(null);
    }
  };

  const handleSelectWitness = (wId: string, statement?: string | null) => {
    setSelectedWitnessId(wId);
    if (statement) {
      setPromptText(statement);
    }
  };

  const activeWitness = selectedCase?.witnesses?.find((w) => w.id === selectedWitnessId);

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2.5 md:px-5 md:py-3 border-b-2 border-border/60 shrink-0 bg-[#0c0c11]/80 backdrop-blur-md">
      {/* Left: Title + Status Pill + GPU Worker Badge + Case Selector */}
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
        <h2 className="font-heading text-base font-bold text-foreground tracking-tight select-none">
          Composite Sketch
        </h2>
        {getStatusDisplay()}
        <div
          title={
            aiStatus === "online"
              ? "Local AI GPU Service Connected"
              : aiStatus === "offline"
              ? "GPU Offline — Procedural Fallback"
              : "Checking AI Service..."
          }
          className="cursor-default select-none flex items-center"
        >
          <span
            className={`size-2.5 rounded-full border-2 border-[#0c0c11] transition-colors duration-500 ${
              aiStatus === "online"
                ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]"
                : aiStatus === "offline"
                ? "bg-amber-400/70"
                : "bg-muted-foreground/40 animate-pulse"
            }`}
          />
        </div>

        {/* Vertical separator */}
        <div className="hidden sm:block h-4 w-px bg-border/60" />

        {/* Active Case Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs font-mono font-medium border border-border/70 bg-black/40 hover:bg-white/5 rounded flex items-center gap-1.5 text-foreground max-w-55 sm:max-w-65 truncate cursor-pointer transition-colors"
              >
                <Folder className="size-3 text-[#8579ff] shrink-0" />
                <span className="truncate">
                  {selectedCase ? `${selectedCase.caseNumber}` : "Select Case..."}
                </span>
                <ChevronDown className="size-3 text-muted-foreground shrink-0" />
              </Button>
            }
          />
          <DropdownMenuContent align="start" className="w-72 bg-[#0d0d12] border-border/80 text-xs">
            <DropdownMenuLabel className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
              Active Investigation Case
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/60" />
            <div className="max-h-60 overflow-y-auto">
              {availableCases.map((c) => {
                const isSelected = c.id === selectedCaseId || c.caseNumber === selectedCase?.caseNumber;
                return (
                  <DropdownMenuItem
                    key={c.id}
                    onClick={() => handleSelectCase(c.id)}
                    className="flex items-center justify-between py-2 cursor-pointer focus:bg-white/5"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-mono font-semibold text-foreground text-xs truncate">
                        {c.caseNumber}
                      </span>
                      <span className="text-[11px] text-muted-foreground truncate">{c.title}</span>
                    </div>
                    {isSelected && <Check className="size-3.5 text-[#8579ff] shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Witness Selector (if witnesses available) */}
        {selectedCase && selectedCase.witnesses && selectedCase.witnesses.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden lg:flex h-7 px-2 text-xs font-medium border border-border/70 bg-black/40 hover:bg-white/5 rounded items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  <User className="size-3 text-emerald-400 shrink-0" />
                  <span className="truncate max-w-28">
                    {activeWitness ? activeWitness.name : "Select Witness"}
                  </span>
                  <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                </Button>
              }
            />
            <DropdownMenuContent align="start" className="w-64 bg-[#0d0d12] border-border/80 text-xs">
              <DropdownMenuLabel className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Case Witnesses
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border/60" />
              {selectedCase.witnesses.map((w) => {
                const isSelected = w.id === selectedWitnessId;
                return (
                  <DropdownMenuItem
                    key={w.id}
                    onClick={() => handleSelectWitness(w.id, w.statement)}
                    className="flex items-center justify-between py-2 cursor-pointer focus:bg-white/5"
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-medium text-foreground text-xs">{w.name}</span>
                      {w.statement && (
                        <span className="text-[10.5px] text-muted-foreground truncate italic">
                          &quot;{w.statement.slice(0, 45)}...&quot;
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="size-3.5 text-emerald-400 shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Right: Action Buttons (Undo, Redo, Clear, Reset) */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={undo}
          disabled={!canUndo}
          className="h-8 px-2.5 text-xs font-medium border-2 border-border/70 bg-black/30 hover:bg-white/5 rounded-md flex items-center gap-1.5 text-foreground disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
        >
          <Undo2 className="size-3.5" />
          <span className="hidden sm:inline">Undo</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={redo}
          disabled={!canRedo}
          className="h-8 px-2.5 text-xs font-medium border-2 border-border/70 bg-black/30 hover:bg-white/5 rounded-md flex items-center gap-1.5 text-foreground disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
        >
          <Redo2 className="size-3.5" />
          <span className="hidden sm:inline">Redo</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearAllFeatures}
          disabled={selectedCount === 0}
          className="h-8 px-2.5 text-xs font-medium border-2 border-border/70 bg-black/30 hover:bg-white/5 rounded-md flex items-center gap-1.5 text-foreground disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer transition-all shadow-sm"
        >
          <Trash2 className="size-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={resetCanvas}
          className="h-8 px-2.5 text-xs font-medium border-2 border-border/70 bg-black/30 hover:bg-white/5 rounded-md flex items-center gap-1.5 text-foreground cursor-pointer transition-all shadow-sm"
        >
          <RotateCcw className="size-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </Button>
      </div>
    </div>
  );
}
