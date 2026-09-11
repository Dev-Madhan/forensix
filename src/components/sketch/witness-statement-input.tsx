"use client";

import * as React from "react";
import { Sparkles, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { StudioCaseOption } from "@/features/sketches/actions";

interface WitnessStatementInputProps {
  cases: StudioCaseOption[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  selectedWitnessId: string;
  onSelectWitness: (witnessId: string) => void;
  statement: string;
  onStatementChange: (statement: string) => void;
  onAttributesExtracted: (attributes: Record<string, any>) => void;
  isExtracting: boolean;
  setIsExtracting: (val: boolean) => void;
}

const PRESET_STATEMENTS = [
  {
    label: "Incident Suspect A (Downtown)",
    text: "Male suspect approximately 35 years old, sharp oval face structure, dark arched eyebrows, narrow almond brown eyes, straight pointed nose bridge, thin compressed lips, slight dark 5 o'clock stubble.",
  },
  {
    label: "Incident Suspect B (Commercial)",
    text: "Female suspect in early 20s, soft rounded face shape, high arched slender eyebrows, large round dark eyes, small button nose, full defined lips, smooth skin with prominent cheekbones.",
  },
  {
    label: "Incident Suspect C (Transit Corridor)",
    text: "Male suspect roughly 45 years old, square heavy jawline, thick bushy low-set eyebrows, deep-set dark eyes, wide bridge nose, medium width lips, dense full beard and mustache.",
  },
];

export function WitnessStatementInput({
  cases,
  selectedCaseId,
  onSelectCase,
  selectedWitnessId,
  onSelectWitness,
  statement,
  onStatementChange,
  onAttributesExtracted,
  isExtracting,
  setIsExtracting,
}: WitnessStatementInputProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [successNotice, setSuccessNotice] = React.useState<string | null>(null);

  const activeCase = cases.find((c) => c.id === selectedCaseId) || cases[0];
  const witnesses = activeCase?.witnesses || [];

  const handleExtract = async () => {
    if (!statement || statement.trim().length < 10) {
      setError("Please enter a detailed witness statement of at least 10 characters.");
      return;
    }

    setError(null);
    setSuccessNotice(null);
    setIsExtracting(true);

    try {
      const res = await fetch("/api/ai/witness", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: selectedCaseId || "case-01",
          witness_id: selectedWitnessId || "wit-01",
          description: statement,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || "Failed to process witness statement.");
      }

      const extracted = data.attributes || {};
      onAttributesExtracted(extracted);
      setSuccessNotice(`Successfully extracted facial taxonomy (${data.processing_time_ms}ms)`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error extracting facial attributes.";
      setError(msg);
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <Card className="rounded-xl border border-border/70 bg-card/70 backdrop-blur-md shadow-sm">
      <CardHeader className="p-5 border-b border-border/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-400 font-mono text-xs font-bold">
                1
              </span>
              <CardTitle className="text-base font-semibold text-foreground">
                Witness Statement & Case Intake
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Natural language narrative processed through local Qwen LLM for forensic facial tokenization.
            </CardDescription>
          </div>
          <Badge variant="outline" className="text-[11px] font-mono border-purple-500/30 text-purple-300 self-start sm:self-center">
            NLP Engine: Qwen3-8B
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Case & Witness Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Active Case File
            </label>
            <select
              value={selectedCaseId}
              onChange={(e) => onSelectCase(e.target.value)}
              className="w-full text-xs rounded-lg border border-border/70 bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber} - {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">
              Interviewed Witness
            </label>
            <select
              value={selectedWitnessId}
              onChange={(e) => onSelectWitness(e.target.value)}
              className="w-full text-xs rounded-lg border border-border/70 bg-surface px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-purple-500/50"
            >
              {witnesses.length > 0 ? (
                witnesses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))
              ) : (
                <option value="wit-primary">Primary Interviewee</option>
              )}
            </select>
          </div>
        </div>

        {/* Narrative Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-foreground">
              Witness Testimonial Narrative
            </label>
            <span className="text-[11px] text-muted-foreground font-mono">
              {statement.length} chars
            </span>
          </div>
          <Textarea
            value={statement}
            onChange={(e) => onStatementChange(e.target.value)}
            placeholder="E.g. Male in his mid-thirties with a sharp square jaw, dark heavy arched eyebrows, deep-set narrow eyes, straight bridge nose, thin pressed lips, and visible 5 o'clock stubble..."
            rows={4}
            className="w-full resize-none rounded-lg border border-border/70 bg-surface/80 p-3 text-xs leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/40"
          />
        </div>

        {/* Forensic Incident Presets */}
        <div>
          <span className="text-[11px] font-medium text-muted-foreground block mb-1.5">
            Load Verified Testimonial Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {PRESET_STATEMENTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onStatementChange(p.text)}
                className="inline-flex items-center gap-1.5 rounded-md border border-border/50 bg-surface/50 px-2.5 py-1 text-[11px] text-muted-foreground hover:text-foreground hover:bg-surface hover:border-border transition-colors cursor-pointer"
              >
                <FileText className="size-3 text-purple-400" />
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successNotice && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400">
            <CheckCircle2 className="size-4 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Trigger Extraction Button */}
        <Button
          type="button"
          onClick={handleExtract}
          disabled={isExtracting || !statement.trim()}
          className="w-full cursor-pointer bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs py-2.5 rounded-lg shadow-sm transition-all"
        >
          {isExtracting ? (
            <>
              <Loader2 className="size-3.5 animate-spin mr-2" />
              Parsing Witness Semantic Tokens...
            </>
          ) : (
            <>
              <Sparkles className="size-3.5 mr-2 text-purple-200" />
              Extract Forensic Attributes (Qwen LLM)
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
