import { z } from "zod";

const emptyStringToNull = (val: unknown) => {
  if (typeof val === "string" && !val.trim()) return null;
  return val;
};

const numberOrNull = (val: unknown) => {
  if (val === "" || val === null || val === undefined || Number.isNaN(val)) return null;
  const num = Number(val);
  return Number.isNaN(num) ? null : num;
};

export const CreateWitnessSchema = z.object({
  caseId: z.string().trim().min(1, "Case ID is required"),
  name: z.string().trim().min(2, "Witness full name must be at least 2 characters").max(100),
  alias: z.preprocess(emptyStringToNull, z.string().trim().max(60).nullable().optional()),
  dateOfBirth: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  ageAtIncident: z.preprocess(
    numberOrNull,
    z.number().int().min(1, "Age must be at least 1").max(120, "Age must be under 120").nullable().optional()
  ),
  gender: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  occupation: z.preprocess(emptyStringToNull, z.string().trim().max(100).nullable().optional()),
  employerName: z.preprocess(emptyStringToNull, z.string().trim().max(120).nullable().optional()),

  // Identification
  idType: z.enum(["AADHAAR", "PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID", "VOTER_ID", "OTHER"]).default("NATIONAL_ID"),
  idNumber: z.preprocess(emptyStringToNull, z.string().trim().max(50).nullable().optional()),
  idVerified: z.boolean().default(false),

  // Contact Info
  primaryPhone: z.string().trim().min(5, "Primary phone number is required").max(30),
  secondaryPhone: z.preprocess(emptyStringToNull, z.string().trim().max(30).nullable().optional()),
  email: z.preprocess(
    emptyStringToNull,
    z.string().trim().email("Invalid email format").nullable().optional()
  ),
  emergencyContactName: z.preprocess(emptyStringToNull, z.string().trim().max(100).nullable().optional()),
  emergencyContactPhone: z.preprocess(emptyStringToNull, z.string().trim().max(30).nullable().optional()),
  emergencyRelationship: z.preprocess(emptyStringToNull, z.string().trim().max(60).nullable().optional()),

  // Residential & Permanent
  currentAddress: z.preprocess(emptyStringToNull, z.string().trim().max(1000).nullable().optional()),
  permanentAddress: z.preprocess(emptyStringToNull, z.string().trim().max(1000).nullable().optional()),
  city: z.preprocess(emptyStringToNull, z.string().trim().max(80).nullable().optional()),
  state: z.preprocess(emptyStringToNull, z.string().trim().max(80).nullable().optional()),
  postalCode: z.preprocess(emptyStringToNull, z.string().trim().max(20).nullable().optional()),

  // Classification & Credibility
  witnessType: z.enum([
    "EYEWITNESS",
    "VICTIM_WITNESS",
    "EARWITNESS",
    "FIRST_RESPONDER",
    "INFORMANT",
    "EXPERT_WITNESS",
    "CHARACTER_WITNESS",
  ]).default("EYEWITNESS"),
  credibility: z.enum(["HIGH", "MEDIUM", "LOW", "UNVERIFIED", "COMPROMISED"]).default("UNVERIFIED"),
  availabilityStatus: z.enum([
    "ACTIVE_AVAILABLE",
    "RELOCATED",
    "UNREACHABLE",
    "UNDER_PROTECTION",
    "SUBPOENA_ISSUED",
    "DECEASED",
  ]).default("ACTIVE_AVAILABLE"),
  isProtected: z.boolean().default(false),
  protectionProtocol: z.preprocess(emptyStringToNull, z.string().trim().max(2000).nullable().optional()),

  // Observation Metrics
  incidentDistanceMeters: z.preprocess(
    numberOrNull,
    z.number().min(0, "Distance cannot be negative").max(5000).nullable().optional()
  ),
  lightingCondition: z.preprocess(emptyStringToNull, z.string().trim().max(100).nullable().optional()),
  weatherCondition: z.preprocess(emptyStringToNull, z.string().trim().max(100).nullable().optional()),
  observationDurationSec: z.preprocess(
    numberOrNull,
    z.number().int().min(0).max(86400).nullable().optional()
  ),
  timeElapsedHours: z.preprocess(
    numberOrNull,
    z.number().min(0).max(100000).nullable().optional()
  ),
  impairmentFactors: z.preprocess(emptyStringToNull, z.string().trim().max(500).nullable().optional()),
  confidenceScore: z.preprocess(
    numberOrNull,
    z.number().int().min(0).max(100).nullable().optional()
  ),

  // Testimony
  statement: z.string().trim().min(2, "Statement or recollection must be provided").max(50000),
  statementAudioUrl: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
  keyFacialFeatures: z.preprocess(emptyStringToNull, z.string().trim().max(5000).nullable().optional()),
  interviewDate: z.preprocess(emptyStringToNull, z.string().nullable().optional()),
});

export type CreateWitnessInput = z.infer<typeof CreateWitnessSchema>;

export const UpdateWitnessSchema = CreateWitnessSchema.partial().extend({
  id: z.string().min(1, "Witness ID is required"),
});

export type UpdateWitnessInput = z.infer<typeof UpdateWitnessSchema>;

export const CreateWitnessInquirySchema = z.object({
  witnessId: z.string().min(1, "Witness ID is required"),
  contactMethod: z.string().trim().min(1, "Contact method is required").max(100),
  purpose: z.string().trim().min(2, "Inquiry purpose is required").max(1000, "Purpose must be under 1000 characters"),
  notes: z.string().trim().min(2, "Inquiry notes must be at least 2 characters").max(50000, "Notes must be under 50,000 characters"),
  outcome: z.string().trim().max(5000, "Outcome must be under 5000 characters").optional().nullable().or(z.literal("")),
  nextFollowUpDate: z.string().optional().nullable().or(z.literal("")),
});

export type CreateWitnessInquiryInput = z.infer<typeof CreateWitnessInquirySchema>;
