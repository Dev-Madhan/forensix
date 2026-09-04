import { z } from "zod";
import { CriminalStatus } from "@prisma/client";

export const CreateCriminalSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().min(1, "Last name is required").max(100),
  alias: z.string().optional(),
  dateOfBirth: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(CriminalStatus).default(CriminalStatus.ACTIVE),
  lastKnownLocation: z.string().optional(),
  mugshotUrl: z.string().optional(),
});

export type CreateCriminalInput = z.infer<typeof CreateCriminalSchema>;

export const UpdateCriminalSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required").max(100).optional(),
  lastName: z.string().min(1, "Last name is required").max(100).optional(),
  alias: z.string().optional(),
  dateOfBirth: z.string().optional().transform((str) => (str ? new Date(str) : undefined)),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  status: z.nativeEnum(CriminalStatus).optional(),
  lastKnownLocation: z.string().optional(),
  mugshotUrl: z.string().optional(),
});

export type UpdateCriminalInput = z.infer<typeof UpdateCriminalSchema>;
