/**
 * Tigris S3 Storage Configuration & Upload Conditions
 * 
 * Tigris provides 5 GB total storage. To ensure the bucket remains well under quota
 * across multiple forensic cases and chain of custody archives, files must be
 * validated by media category with appropriate size constraints.
 */

export const TIGRIS_UPLOAD_LIMITS = {
  // Bucket Quota: 5 GB total
  BUCKET_CAPACITY_BYTES: 5 * 1024 * 1024 * 1024, // 5 GB
  MAX_BATCH_FILES: 10, // Generous batch support
  MIN_FILE_SIZE_BYTES: 1, // Reject corrupt 0-byte files

  // 1. Photos & Images: Scene photography, mugshots, biometric scans
  IMAGE: {
    maxSizeBytes: 25 * 1024 * 1024, // 25 MB
    minSizeBytes: 1,
    maxSizeLabel: "25 MB",
    allowedMimes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/bmp",
      "image/svg+xml",
      "image/tiff",
      "image/jfif",
      "image/heic",
      "image/avif",
    ],
    allowedExtensions: [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".gif",
      ".bmp",
      ".svg",
      ".tiff",
      ".tif",
      ".jfif",
      ".heic",
      ".avif",
    ],
    description: "Compressed scene photos & biometric scans up to 25 MB",
  },

  // 2. Videos: CCTV, bodycam, surveillance footage
  VIDEO: {
    maxSizeBytes: 100 * 1024 * 1024, // 100 MB
    minSizeBytes: 1,
    maxSizeLabel: "100 MB",
    allowedMimes: [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-matroska",
      "video/x-msvideo",
      "video/x-m4v",
      "video/x-ms-wmv",
      "video/ogg",
    ],
    allowedExtensions: [".mp4", ".webm", ".mov", ".mkv", ".avi", ".m4v", ".wmv", ".flv"],
    description: "Surveillance / CCTV clips up to 100 MB (MP4, WEBM, MOV, MKV, AVI)",
  },

  // 3. Audio: Wiretaps, dispatch recordings, witness statements
  AUDIO: {
    maxSizeBytes: 25 * 1024 * 1024, // 25 MB
    minSizeBytes: 1,
    maxSizeLabel: "25 MB",
    allowedMimes: [
      "audio/mpeg",
      "audio/mp3",
      "audio/wav",
      "audio/x-wav",
      "audio/wave",
      "audio/ogg",
      "audio/mp4",
      "audio/aac",
      "audio/x-m4a",
      "audio/flac",
    ],
    allowedExtensions: [".mp3", ".wav", ".ogg", ".m4a", ".aac", ".flac", ".wma"],
    description: "Audio statements & wiretaps up to 25 MB (MP3, WAV, M4A, AAC, FLAC)",
  },

  // 4. Documents & Reports: Autopsy, forensic lab findings, ballistic & digital telemetry
  DOCUMENT: {
    maxSizeBytes: 25 * 1024 * 1024, // 25 MB
    minSizeBytes: 1,
    maxSizeLabel: "25 MB",
    allowedMimes: [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/json",
      "text/csv",
      "application/rtf",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    allowedExtensions: [
      ".pdf",
      ".txt",
      ".doc",
      ".docx",
      ".json",
      ".csv",
      ".rtf",
      ".xlsx",
      ".xls",
      ".log",
    ],
    description: "Forensic records & lab findings up to 25 MB (PDF, DOCX, TXT, CSV, JSON)",
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
 * Combined allowed file extensions
 */
export const ALL_ALLOWED_EXTENSIONS = [
  ...TIGRIS_UPLOAD_LIMITS.IMAGE.allowedExtensions,
  ...TIGRIS_UPLOAD_LIMITS.VIDEO.allowedExtensions,
  ...TIGRIS_UPLOAD_LIMITS.AUDIO.allowedExtensions,
  ...TIGRIS_UPLOAD_LIMITS.DOCUMENT.allowedExtensions,
];

/**
 * Combined accept criteria for drag/drop libraries (accepts both MIME and extension tokens)
 */
export const ALL_ALLOWED_DROP_ACCEPT = [
  ...ALL_ALLOWED_MIME_TYPES,
  ...ALL_ALLOWED_EXTENSIONS,
];

/**
 * Category detection helper: recognizes files by MIME or extension.
 * Defaults to "DOCUMENT" so no legitimate forensic file is left unclassified.
 */
export function getFileCategory(
  fileOrTypeOrName: File | { type?: string; name?: string } | string
): "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" {
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
    const rawName = (fileOrTypeOrName as any).name || "";
    if (rawName.includes(".")) {
      ext = "." + (rawName.split(".").pop()?.toLowerCase() || "");
    }
  }

  // 1. Check Images
  if (
    type.startsWith("image/") ||
    (TIGRIS_UPLOAD_LIMITS.IMAGE.allowedExtensions as readonly string[]).includes(ext) ||
    (TIGRIS_UPLOAD_LIMITS.IMAGE.allowedMimes as readonly string[]).includes(type)
  ) {
    return "IMAGE";
  }

  // 2. Check Videos
  if (
    type.startsWith("video/") ||
    (TIGRIS_UPLOAD_LIMITS.VIDEO.allowedExtensions as readonly string[]).includes(ext) ||
    (TIGRIS_UPLOAD_LIMITS.VIDEO.allowedMimes as readonly string[]).includes(type)
  ) {
    return "VIDEO";
  }

  // 3. Check Audio
  if (
    type.startsWith("audio/") ||
    (TIGRIS_UPLOAD_LIMITS.AUDIO.allowedExtensions as readonly string[]).includes(ext) ||
    (TIGRIS_UPLOAD_LIMITS.AUDIO.allowedMimes as readonly string[]).includes(type)
  ) {
    return "AUDIO";
  }

  // 4. Default to DOCUMENT for forensic documents/text/reports/binaries
  return "DOCUMENT";
}

/**
 * Custom validator tailored for Tigris 5 GB storage limits.
 * Inspects file type, checks category-specific size constraints,
 * and enforces filename safety.
 */
export function tigrisEvidenceValidator(file: File) {
  if (!file) {
    return {
      code: "validator-error" as const,
      message: "No file provided for validation.",
    };
  }

  // 1. Enforce non-empty files
  if (file.size <= 0) {
    return {
      code: "file-too-small" as const,
      message: "File is empty (0 bytes). Please upload a valid forensic evidence file.",
    };
  }

  // 2. Determine category
  const category = getFileCategory(file);
  const limits = TIGRIS_UPLOAD_LIMITS[category];

  // 3. Category-specific size boundaries (preserving 5GB Tigris bucket)
  if (file.size > limits.maxSizeBytes) {
    const categoryName =
      category === "IMAGE"
        ? "Photo"
        : category === "VIDEO"
        ? "Video"
        : category === "AUDIO"
        ? "Audio file"
        : "Document";

    return {
      code: "file-too-large" as const,
      message: `${categoryName} "${file.name}" exceeds the ${limits.maxSizeLabel} storage ceiling.`,
    };
  }

  return null;
}
