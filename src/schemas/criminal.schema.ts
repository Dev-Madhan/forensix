import { z } from "zod";
import { CriminalStatus, CriminalRiskLevel, SuspectCaseStatus, SuspectRole } from "@prisma/client";

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
  riskLevel: z.nativeEnum(CriminalRiskLevel).default(CriminalRiskLevel.MEDIUM),
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
  riskLevel: z.nativeEnum(CriminalRiskLevel).optional(),
  lastKnownLocation: z.string().optional(),
  mugshotUrl: z.string().optional(),
  demographics: z.record(z.string(), z.any()).optional(),
});

export type UpdateCriminalInput = z.infer<typeof UpdateCriminalSchema>;

export const LinkCriminalToCaseSchema = z.object({
  caseId: z.string().min(1, "Case ID is required"),
  criminalId: z.string().min(1, "Criminal ID is required"),
  status: z.nativeEnum(SuspectCaseStatus).default(SuspectCaseStatus.PERSON_OF_INTEREST),
  role: z.nativeEnum(SuspectRole).default(SuspectRole.UNDER_INVESTIGATION),
  matchConfidence: z.number().min(0).max(100).default(0),
  notes: z.string().optional(),
});

export type LinkCriminalToCaseInput = z.infer<typeof LinkCriminalToCaseSchema>;

export const RecordSurveillanceHitSchema = z.object({
  criminalId: z.string().min(1, "Criminal ID is required"),
  sensorId: z.string().min(1, "Sensor ID is required"),
  sensorName: z.string().optional(),
  location: z.string().min(1, "Location is required"),
  latitude: z.number(),
  longitude: z.number(),
  confidenceScore: z.number().min(0).max(1),
  capturedMediaUrl: z.string().optional(),
  details: z.string().optional(),
});

export type RecordSurveillanceHitInput = z.infer<typeof RecordSurveillanceHitSchema>;

