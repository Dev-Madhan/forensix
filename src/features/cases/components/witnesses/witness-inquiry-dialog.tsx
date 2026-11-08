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
import { PhoneCall, Loader2, CheckCircle2, Calendar as CalendarIcon, X } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
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
        const errorMsg =
          res.error ||
          (res.details?.fieldErrors
            ? Object.entries(res.details.fieldErrors)
                .map(([field, msgs]: [string, any]) => `${field}: ${msgs.join(", ")}`)
                .join(" | ")
            : "Failed to record inquiry log");
        toast.error(errorMsg);
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
        className="w-[calc(100vw-1.5rem)] max-w-[calc(100vw-1.5rem)] sm:w-full sm:max-w-xl max-h-[92dvh] overflow-hidden flex flex-col rounded-xl border border-neutral-800 bg-[#0a0a0a] text-neutral-100 p-0 shadow-2xl min-w-0 gap-0 no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-0">
          {/* Header (Page theme dark/black) */}
          <div className="shrink-0 px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4 border-b border-neutral-800 bg-[#0d0d0d]">
            <DialogHeader className="space-y-0 text-left">
              <div className="min-w-0">
                <DialogTitle className="text-base sm:text-lg font-heading font-bold text-white tracking-tight">
                  Record Witness Re-Contact & Inquiry
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                  Log new contacts, statement reaffirmations, or cold-case re-examinations with{" "}
                  <span className="font-semibold text-neutral-100">{witness.name}</span> (
                  <span className="font-mono text-emerald-400">{witness.primaryPhone}</span>).
                </DialogDescription>
              </div>
            </DialogHeader>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 text-xs bg-[#0a0a0a] no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-300">Contact Channel</Label>
                <AnimatedSelect
                  options={CONTACT_CHANNEL_OPTIONS}
                  value={contactMethod}
                  onChange={setContactMethod}
                  className="h-9.5 bg-black/60 border-2 border-neutral-800 rounded-md text-neutral-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-neutral-400">
                  Scheduled Next Follow-Up (Optional)
                </Label>
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                  <PopoverTrigger
                    render={
                      <button
                        type="button"
                        className="h-9.5 w-full flex items-center justify-between rounded-md border-2 border-neutral-800 bg-black/60 px-3 text-xs text-neutral-100 hover:border-neutral-700 transition-colors cursor-pointer select-none"
                      />
                    }
                  >
                    <span className="flex items-center gap-2 truncate">
                      <CalendarIcon className="size-3.5 text-neutral-400 shrink-0" />
                      <span className={nextFollowUpDate ? "text-neutral-100 font-medium" : "text-neutral-500"}>
                        {nextFollowUpDate && isValid(parseISO(nextFollowUpDate))
                          ? format(parseISO(nextFollowUpDate), "MMM d, yyyy")
                          : "Select follow-up date..."}
                      </span>
                    </span>
                    {nextFollowUpDate ? (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setNextFollowUpDate("");
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.stopPropagation();
                            setNextFollowUpDate("");
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-white rounded cursor-pointer"
                        title="Clear date"
                      >
                        <X className="size-3" />
                      </span>
                    ) : null}
                  </PopoverTrigger>
                  <PopoverContent
                    align="end"
                    sideOffset={6}
                    className="w-auto p-2 rounded-xl shadow-2xl bg-[#0d0d0d] border border-neutral-800 text-neutral-100"
                  >
                    <CalendarPicker
                      mode="single"
                      selected={nextFollowUpDate && isValid(parseISO(nextFollowUpDate)) ? parseISO(nextFollowUpDate) : undefined}
                      defaultMonth={nextFollowUpDate && isValid(parseISO(nextFollowUpDate)) ? parseISO(nextFollowUpDate) : new Date()}
                      onSelect={(date) => {
                        if (date) {
                          setNextFollowUpDate(format(date, "yyyy-MM-dd"));
                          setIsCalendarOpen(false);
                        }
                      }}
                    />
                    <div className="flex items-center justify-between pt-2 border-t border-neutral-800 mt-1 px-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-neutral-400 hover:text-white"
                        onClick={() => {
                          setNextFollowUpDate("");
                          setIsCalendarOpen(false);
                        }}
                      >
                        Clear
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-[#a89dff] hover:text-white"
                        onClick={() => {
                          setNextFollowUpDate(format(new Date(), "yyyy-MM-dd"));
                          setIsCalendarOpen(false);
                        }}
                      >
                        Today
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-300">
                Inquiry Trigger / Purpose <span className="text-destructive">*</span>
              </Label>
              <Input
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="e.g. Sudden Clue: New surveillance CCTV match in Sector 9"
                required
                className="h-9.5 rounded-md border-2 border-neutral-800 bg-black/60 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF]"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-300">
                Inquiry Notes & Witness Recollection <span className="text-destructive">*</span>
              </Label>
              <Textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Inquired regarding suspect jacket and walk pattern. Witness verified the suspect had a slight limp in right leg and wore a dark windbreaker..."
                required
                className="rounded-md border-2 border-neutral-800 bg-black/60 p-3 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] resize-y leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-neutral-400">
                Outcome / Action Taken
              </Label>
              <Textarea
                rows={2}
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                placeholder="e.g. Lead verified; witness agreed to review photo lineup tomorrow"
                className="rounded-md border-2 border-neutral-800 bg-black/60 p-2.5 text-xs text-neutral-100 placeholder:text-neutral-500 focus-visible:border-[#665AEF] focus-visible:ring-1 focus-visible:ring-[#665AEF] resize-y leading-relaxed"
              />
            </div>
          </div>

          {/* Footer (Page theme dark/black & reduced radius) */}
          <div className="shrink-0 px-5 sm:px-6 py-3.5 sm:py-4 border-t border-neutral-800 bg-[#0d0d0d] flex items-center justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 px-4 text-xs font-medium rounded-lg border border-neutral-800 bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white cursor-pointer transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 px-5 text-xs font-semibold rounded-lg bg-[#665AEF] hover:bg-[#5748e6] text-white shadow-sm flex items-center gap-2 cursor-pointer transition-colors"
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
