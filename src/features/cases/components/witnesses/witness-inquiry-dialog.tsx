"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AnimatedSelect,
  type AnimatedSelectOption,
} from "./animated-select";
import { PhoneCall, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { logWitnessInquiry } from "../../witnesses/actions";
import type { WitnessItem, WitnessInquiryItem } from "../../witnesses/types";

interface WitnessInquiryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  witness: WitnessItem | null;
  onInquiryLogged: (witnessId: string, inquiry: WitnessInquiryItem) => void;
}

const CONTACT_CHANNEL_OPTIONS: AnimatedSelectOption[] = [
  { label: "Phone Call", value: "Phone Call" },
  { label: "In-Person Field Visit", value: "In-Person Field Visit" },
  { label: "Station Interview", value: "Summons / Police Station" },
  { label: "Video Conference", value: "Video Conference" },
  { label: "Official Email", value: "Official Email" },
];

export function WitnessInquiryDialog({
  isOpen,
  onOpenChange,
  witness,
  onInquiryLogged,
}: WitnessInquiryDialogProps) {
  const [contactMethod, setContactMethod] = useState("Phone Call");
  const [purpose, setPurpose] = useState("");
  const [notes, setNotes] = useState("");
  const [outcome, setOutcome] = useState("");
  const [nextFollowUpDate, setNextFollowUpDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!witness) return;

    if (!purpose.trim()) {
      toast.error("Please provide the purpose of this inquiry (e.g. Sudden Clue / CCTV Match)");
      return;
    }

    if (!notes.trim()) {
      toast.error("Please provide detailed inquiry notes and statements exchanged");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await logWitnessInquiry({
        witnessId: witness.id,
        contactMethod,
        purpose: purpose.trim(),
        notes: notes.trim(),
        outcome: outcome.trim() || null,
        nextFollowUpDate: nextFollowUpDate || null,
      });

      if (res.success && res.data) {
        toast.success("Witness inquiry logged successfully");
        onInquiryLogged(witness.id, res.data);
        onOpenChange(false);
        setPurpose("");
        setNotes("");
        setOutcome("");
        setNextFollowUpDate("");
      } else {
        toast.error(res.error || "Failed to record inquiry log");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred while saving inquiry");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!witness) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-xl max-h-[92dvh] overflow-hidden flex flex-col rounded-2xl border-2 border-border/80 bg-[#0c0c12]/98 backdrop-blur-2xl p-0 shadow-2xl min-w-0 gap-0 text-foreground no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
          {/* Header */}
          <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b-2 border-border/70 bg-card/40 backdrop-blur-md">
            <DialogHeader className="space-y-0 text-left">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-heading font-bold text-foreground tracking-tight">
                  Record Witness Re-Contact & Inquiry
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  Log new contacts, statement reaffirmations, or cold-case re-examinations with{" "}
                  <span className="font-semibold text-foreground">{witness.name}</span> (
                  <span className="font-mono text-emerald-400">{witness.primaryPhone}</span>).
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground/90">Contact Channel</Label>
                <AnimatedSelect
                  options={CONTACT_CHANNEL_OPTIONS}
                  value={contactMethod}
                  onChange={setContactMethod}
                  className="h-9.5 bg-background/50"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground">
                  Scheduled Next Follow-Up (Optional)
                </Label>
                <Input
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="h-9.5 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/90">
                Inquiry Trigger / Purpose <span className="text-destructive">*</span>
              </Label>
              <Input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Sudden Clue: New surveillance CCTV match in Sector 9"
                required
                className="h-9.5 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/90">
                Inquiry Notes & Witness Recollection <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Inquired regarding suspect jacket and walk pattern. Witness verified the suspect had a slight limp in right leg and wore a dark windbreaker..."
                required
                className="rounded-lg border-2 border-border/80 bg-background/50 p-3 text-xs text-foreground placeholder:text-muted-foreground/50 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] resize-y leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">
                Outcome / Action Taken
              </Label>
              <Input
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="e.g. Lead verified; witness agreed to review photo lineup tomorrow"
                className="h-9.5 rounded-lg border-2 border-border/80 bg-background/50 text-xs text-foreground focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-t-2 border-border/80 bg-card/40 backdrop-blur-md flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9.5 px-4 text-xs font-semibold rounded-xl border-2 border-border/80 bg-card/60 hover:bg-muted/60 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9.5 px-5 text-xs font-semibold rounded-xl bg-[#665AEF] hover:bg-[#5748e6] text-white shadow-md flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Logging...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  <span>Log Inquiry Record</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
