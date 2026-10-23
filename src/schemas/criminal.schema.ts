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
  fingerprintScanUrl: z.string().optional().nullable(),
  dnaProfileCode: z.string().optional().nullable(),
  watchlistStatus: z.string().optional().nullable(),
  biometricEnrolledAt: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : undefined)),
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
  fingerprintScanUrl: z.string().optional().nullable(),
  dnaProfileCode: z.string().optional().nullable(),
  watchlistStatus: z.string().optional().nullable(),
  biometricEnrolledAt: z
    .union([z.string(), z.date()])
    .optional()
    .nullable()
    .transform((val) => (val ? new Date(val) : undefined)),
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


export const CreateCriminalRecordSchema = z.object({
  criminalId: z.string().min(1, "Criminal ID is required"),
  courtCaseNumber: z.string().min(1, "Court Case Number is required"),
  offenceType: z.string().min(1, "Offence Type is required"),
  description: z.string().min(1, "Description is required"),
  incidentDate: z
    .union([z.string(), z.date()])
    .transform((val) => (val instanceof Date ? val : new Date(val))),
  location: z.string().min(1, "Location is required"),
  courtName: z.string().optional(),
  status: z.string().default("Under Investigation"),
  outcome: z.string().optional().nullable(),
  sentenceDetails: z.string().optional().nullable(),
});

export type CreateCriminalRecordInput = z.infer<typeof CreateCriminalRecordSchema>;

