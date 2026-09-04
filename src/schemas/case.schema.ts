import { z } from "zod";
import { CaseStatus, CasePriority } from "@prisma/client";

export const CreateCaseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().optional(),
  status: z.nativeEnum(CaseStatus).default(CaseStatus.OPEN),
  priority: z.nativeEnum(CasePriority).default(CasePriority.MEDIUM),
  assignedToId: z.string().min(1, "Assignee is required"),
});

export type CreateCaseInput = z.infer<typeof CreateCaseSchema>;

export const UpdateCaseSchema = z.object({
  id: z.string(),
  title: z.string().min(3, "Title must be at least 3 characters").max(100).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(CaseStatus).optional(),
  priority: z.nativeEnum(CasePriority).optional(),
  assignedToId: z.string().optional(),
});

export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>;
