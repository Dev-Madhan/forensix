import { z } from "zod";
import { CaseStatus, CasePriority } from "@prisma/client";

export const CreateCaseSchema = z.object({
  caseNumber: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(120),
  description: z.string().optional(),
  detailedDescription: z.string().optional(),
  status: z.nativeEnum(CaseStatus).default(CaseStatus.OPEN),
  priority: z.nativeEnum(CasePriority).default(CasePriority.MEDIUM),
  assignedToId: z.string().optional(),
  assignedToName: z.string().optional(),
  assignedToEmail: z.string().optional(),
  department: z.string().optional(),
  caseType: z.string().optional(),
  dateReported: z.string().optional(),
  timeOfIncident: z.string().optional(),
  location: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export type CreateCaseInput = z.infer<typeof CreateCaseSchema>;

export const UpdateCaseSchema = z.object({
  id: z.string(),
  caseNumber: z.string().optional(),
  title: z.string().min(3, "Title must be at least 3 characters").max(120).optional(),
  description: z.string().optional(),
  detailedDescription: z.string().optional(),
  status: z.nativeEnum(CaseStatus).optional(),
  priority: z.nativeEnum(CasePriority).optional(),
  assignedToId: z.string().optional(),
  assignedToName: z.string().optional(),
  assignedToEmail: z.string().optional(),
  caseType: z.string().optional(),
  dateReported: z.string().optional(),
  timeOfIncident: z.string().optional(),
  location: z.string().optional(),
  landmark: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export type UpdateCaseInput = z.infer<typeof UpdateCaseSchema>;

