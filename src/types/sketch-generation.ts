/**
 * Forensic Sketch Generation Mode State Machine Types.
 */

export type GenerationMode = "IDLE" | "PROMPT_GENERATION" | "DATASET_COMPOSITE";

export interface PendingModeSwitch {
  targetMode: GenerationMode;
  description: string;
  onConfirm: () => void;
}
