import { z } from "zod";

export const CreateWitnessSchema = z.object({
  caseId: z.string().min(1, "Case ID is required"),
  name: z.string().trim().min(2, "Witness full name must be at least 2 characters").max(100),
  alias: z.string().trim().max(60).optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  ageAtIncident: z.number().int().min(1).max(120).optional().nullable(),
  gender: z.string().optional().nullable(),
  occupation: z.string().trim().max(100).optional().nullable(),
  employerName: z.string().trim().max(120).optional().nullable(),

  // Identification
  idType: z.enum(["AADHAAR", "PASSPORT", "DRIVERS_LICENSE", "NATIONAL_ID", "VOTER_ID", "OTHER"]).default("NATIONAL_ID"),
  idNumber: z.string().trim().max(50).optional().nullable(),
  idVerified: z.boolean().default(false),

  // Contact Info
  primaryPhone: z.string().trim().min(7, "Primary phone number is required").max(25),
  secondaryPhone: z.string().trim().max(25).optional().nullable(),
  email: z.string().trim().email("Invalid email format").optional().nullable().or(z.literal("")),
  emergencyContactName: z.string().trim().max(100).optional().nullable(),
  emergencyContactPhone: z.string().trim().max(25).optional().nullable(),
  emergencyRelationship: z.string().trim().max(60).optional().nullable(),

  // Residential & Permanent
  currentAddress: z.string().trim().max(300).optional().nullable(),
  permanentAddress: z.string().trim().max(300).optional().nullable(),
  city: z.string().trim().max(80).optional().nullable(),
  state: z.string().trim().max(80).optional().nullable(),
  postalCode: z.string().trim().max(20).optional().nullable(),

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
  protectionProtocol: z.string().trim().max(500).optional().nullable(),

  // Observation Metrics
  incidentDistanceMeters: z.number().min(0).max(5000).optional().nullable(),
  lightingCondition: z.string().trim().max(100).optional().nullable(),
  weatherCondition: z.string().trim().max(100).optional().nullable(),
  observationDurationSec: z.number().int().min(0).max(86400).optional().nullable(),
  timeElapsedHours: z.number().min(0).max(100000).optional().nullable(),
  impairmentFactors: z.string().trim().max(250).optional().nullable(),
  confidenceScore: z.number().int().min(0).max(100).optional().nullable(),

  // Testimony
  statement: z.string().trim().min(5, "Statement or recollection must be provided"),
  statementAudioUrl: z.string().optional().nullable().or(z.literal("")),
  keyFacialFeatures: z.string().trim().max(500).optional().nullable(),
});

export type CreateWitnessInput = z.infer<typeof CreateWitnessSchema>;

export const UpdateWitnessSchema = CreateWitnessSchema.partial().extend({
  id: z.string().min(1, "Witness ID is required"),
});

export type UpdateWitnessInput = z.infer<typeof UpdateWitnessSchema>;

export const CreateWitnessInquirySchema = z.object({
  witnessId: z.string().min(1, "Witness ID is required"),
  contactMethod: z.string().trim().min(2, "Contact method is required").max(60),
  purpose: z.string().trim().min(3, "Inquiry purpose is required").max(200),
  notes: z.string().trim().min(5, "Inquiry notes must be at least 5 characters"),
  outcome: z.string().trim().max(200).optional().nullable(),
  nextFollowUpDate: z.string().optional().nullable(),
});

export type CreateWitnessInquiryInput = z.infer<typeof CreateWitnessInquirySchema>;
