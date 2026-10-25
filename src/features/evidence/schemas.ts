import { z } from "zod";

export const UploadEvidenceSchema = z.object({
  caseId: z.string().min(1, "Case ID is required"),
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  fileSize: z.number().positive("File size must be positive"),
  // Note: the actual file binary or buffer is handled by FormData, this is just for the metadata validation if needed
});

export type UploadEvidenceInput = z.infer<typeof UploadEvidenceSchema>;
