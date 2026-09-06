/**
 * Tigris S3 Storage Configuration & Upload Conditions
 * 
 * Tigris provides 5 GB total storage. To ensure the bucket remains well under quota
 * across multiple forensic cases and chain of custody archives, files must be
 * minimal, compressed, and strictly validated by media category.
 */

export const TIGRIS_UPLOAD_LIMITS = {
  // Bucket Quota: 5 GB total
  BUCKET_CAPACITY_BYTES: 5 * 1024 * 1024 * 1024, // 5 GB
  MAX_BATCH_FILES: 3, // Prevent bulk upload flooding
  MIN_FILE_SIZE_BYTES: 100, // Reject corrupt or empty files

  // 1. Photos & Images: High-resolution yet compressed (JPG, PNG, WEBP)
  IMAGE: {
    maxSizeBytes: 5 * 1024 * 1024, // 5 MB
    minSizeBytes: 1024, // 1 KB
    maxSizeLabel: "5 MB",
    allowedMimes: ["image/jpeg", "image/png", "image/webp"],
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    description: "Compressed images up to 5 MB (JPG, PNG, WEBP)",
  },

  // 2. Videos: Trimmed & compressed CCTV/surveillance footage (MP4, WEBM)
  VIDEO: {
    maxSizeBytes: 40 * 1024 * 1024, // 40 MB
    minSizeBytes: 10 * 1024, // 10 KB
    maxSizeLabel: "40 MB",
    allowedMimes: ["video/mp4", "video/webm"],
    allowedExtensions: [".mp4", ".webm"],
    description: "Surveillance / CCTV clips up to 40 MB (MP4, WEBM)",
  },

  // 3. Audio: Wiretaps, dispatch recordings, witness statements (MP3, WAV, M4A, OGG)
  AUDIO: {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    minSizeBytes: 1024, // 1 KB
    maxSizeLabel: "10 MB",
    allowedMimes: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/aac"],
    allowedExtensions: [".mp3", ".wav", ".ogg", ".m4a", ".aac"],
    description: "Audio statements & dispatch up to 10 MB (MP3, WAV, M4A, OGG)",
  },

  // 4. Documents & Reports: Autopsy, forensic lab findings, metadata files (PDF, TXT, DOCX)
  DOCUMENT: {
    maxSizeBytes: 10 * 1024 * 1024, // 10 MB
    minSizeBytes: 100, // 100 Bytes
    maxSizeLabel: "10 MB",
    allowedMimes: [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/json",
      "text/csv",
    ],
    allowedExtensions: [".pdf", ".txt", ".doc", ".docx", ".json", ".csv"],
    description: "Forensic records up to 10 MB (PDF, DOCX, TXT, CSV)",
  },
} as const;

/**
 * Combined accept MIME list for dropzone
 */
export const ALL_ALLOWED_MIME_TYPES = [
  ...TIGRIS_UPLOAD_LIMITS.IMAGE.allowedMimes,
  ...TIGRIS_UPLOAD_LIMITS.VIDEO.allowedMimes,
  ...TIGRIS_UPLOAD_LIMITS.AUDIO.allowedMimes,
  ...TIGRIS_UPLOAD_LIMITS.DOCUMENT.allowedMimes,
];

/**
 * Category detection helper
 */
export function getFileCategory(
  fileOrTypeOrName: File | { type?: string; name?: string } | string
): "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "UNKNOWN" {
  let type = "";
  let ext = "";

  if (typeof fileOrTypeOrName === "string") {
    if (fileOrTypeOrName.includes("/")) {
      type = fileOrTypeOrName.toLowerCase();
    } else {
      ext = "." + (fileOrTypeOrName.split(".").pop()?.toLowerCase() || "");
    }
  } else if (fileOrTypeOrName) {
    type = (fileOrTypeOrName.type || "").toLowerCase();
    ext = "." + (fileOrTypeOrName.name?.split(".").pop()?.toLowerCase() || "");
  }

  if (
    type.startsWith("image/") ||
    (TIGRIS_UPLOAD_LIMITS.IMAGE.allowedExtensions as readonly string[]).includes(ext)
  ) {
    return "IMAGE";
  }

  if (
    type.startsWith("video/") ||
    (TIGRIS_UPLOAD_LIMITS.VIDEO.allowedExtensions as readonly string[]).includes(ext)
  ) {
    return "VIDEO";
  }

  if (
    type.startsWith("audio/") ||
    (TIGRIS_UPLOAD_LIMITS.AUDIO.allowedExtensions as readonly string[]).includes(ext)
  ) {
    return "AUDIO";
  }

  if (
    type.includes("pdf") ||
    type.includes("text") ||
    type.includes("word") ||
    type.includes("json") ||
    type.includes("csv") ||
    (TIGRIS_UPLOAD_LIMITS.DOCUMENT.allowedExtensions as readonly string[]).includes(ext)
  ) {
    return "DOCUMENT";
  }

  return "UNKNOWN";
}

/**
 * Custom validator tailored for Tigris 5 GB storage limits.
 * Inspects file type, checks category-specific size constraints,
 * and enforces filename safety.
 */
export function tigrisEvidenceValidator(file: File) {
  // 1. Filename safety check
  if (/[<>:"/\\|?*]/.test(file.name)) {
    return {
      code: "validator-error" as const,
      message: "Filename contains invalid characters (< > : \" / \\ | ? *)",
    };
  }

  // 2. Determine category
  const category = getFileCategory(file);

  if (category === "UNKNOWN") {
    return {
      code: "file-invalid-type" as const,
      message: `File format "${file.name.split(".").pop() || "unknown"}" is not supported. Use JPG, PNG, WEBP, MP4, WEBM, MP3, WAV, or PDF.`,
    };
  }

  // 3. Category-specific size boundaries (preserving 5GB Tigris bucket)
  const limits = TIGRIS_UPLOAD_LIMITS[category];

  if (file.size < limits.minSizeBytes) {
    return {
      code: "file-too-small" as const,
      message: `File is empty or too small (min ${limits.minSizeBytes} bytes required).`,
    };
  }

  if (file.size > limits.maxSizeBytes) {
    const categoryName =
      category === "IMAGE"
        ? "Photo"
        : category === "VIDEO"
        ? "Video"
        : category === "AUDIO"
        ? "Audio file"
        : "Document";

    const friendlyTip =
      category === "IMAGE"
        ? "Please choose an image under 5 MB or compress to WebP/JPG."
        : category === "VIDEO"
        ? "Please choose a video clip under 40 MB."
        : category === "AUDIO"
        ? "Please choose an audio recording under 10 MB."
        : "Please choose a document under 10 MB.";

    return {
      code: "file-too-large" as const,
      message: `${categoryName} exceeds the ${limits.maxSizeLabel} limit. ${friendlyTip}`,
    };
  }

  return null;
}
