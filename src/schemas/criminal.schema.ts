import { z } from "zod";
import { CriminalStatus } from "@prisma/client";

export const CreateCriminalSchema = z.object({
  criminalId: z.string().optional(),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  alias: z.string().optional(),
  dateOfBirth: z
    .union([z.string(), z.date()])
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(CriminalStatus).default(CriminalStatus.ACTIVE),
  lastKnownLocation: z.string().optional(),
  mugshotUrl: z.string().optional(),
  demographics: z.record(z.string(), z.any()).optional(),
});

export type CreateCriminalInput = z.infer<typeof CreateCriminalSchema>;

export const UpdateCriminalSchema = z.object({
  id: z.string(),
  criminalId: z.string().optional(),
  firstName: z.string().min(1, "First name is required").max(100).optional(),
  lastName: z.string().min(1, "Last name is required").max(100).optional(),
  alias: z.string().optional(),
  dateOfBirth: z
    .union([z.string(), z.date()])
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(CriminalStatus).optional(),
  lastKnownLocation: z.string().optional(),
  mugshotUrl: z.string().optional(),
  demographics: z.record(z.string(), z.any()).optional(),
});

export type UpdateCriminalInput = z.infer<typeof UpdateCriminalSchema>;
