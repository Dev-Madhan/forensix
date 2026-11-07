import { tigris, TIGRIS_BUCKET } from "@/lib/tigris";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";

export interface TigrisUploadOptions {
  file: File;
  prefix: "criminals" | "cases" | "fingerprints" | "sketches" | "surveillance" | "evidence";
  entityId: string;
  subfolder?: string;
  customFileName?: string;
  fallbackMimeType?: string;
}

export interface TigrisUploadResult {
  storageKey: string;
  fileUrl: string;
  sha256Hash: string;
  fileSize: number;
  mimeType: string;
  fileName: string;
}

/**
 * Robust MIME type inference with extension fallback.
 * Prevents Tigris S3 from rejecting uploads with blank Content-Type.
 */
export function inferMimeType(fileName: string, mime?: string): string {
  if (mime && mime.trim().length > 0 && mime.includes("/")) {
    return mime.trim();
  }
  const ext = (fileName || "").split(".").pop()?.toLowerCase() || "";
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    bmp: "image/bmp",
    svg: "image/svg+xml",
    heic: "image/heic",
    avif: "image/avif",
    mp4: "video/mp4",
    webm: "video/webm",
    mov: "video/quicktime",
    mkv: "video/x-matroska",
    avi: "video/x-msvideo",
    m4v: "video/x-m4v",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    ogg: "audio/ogg",
    m4a: "audio/mp4",
    aac: "audio/aac",
    flac: "audio/flac",
    pdf: "application/pdf",
    txt: "text/plain",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    json: "application/json",
    csv: "text/csv",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    xls: "application/vnd.ms-excel",
    rtf: "application/rtf",
    log: "text/plain",
  };
  return map[ext] || "application/octet-stream";
}

/**
 * Universal binary streaming pipeline to Tigris S3:
 * 1. Computes cryptographic SHA-256 for chain of custody.
 * 2. Sanitizes filenames against path traversal.
 * 3. Enforces deterministic MIME type headers.
 * 4. Generates consistent storage paths and URL formats.
 */
export async function streamFileToTigris({
  file,
  prefix,
  entityId,
  subfolder,
  customFileName,
  fallbackMimeType,
}: TigrisUploadOptions): Promise<TigrisUploadResult> {
  if (!file || typeof file.arrayBuffer !== "function" || file.size <= 0) {
    throw new Error("Invalid or empty file provided for Tigris upload.");
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 1. Calculate SHA-256 integrity hash
  const hashSum = crypto.createHash("sha256");
  hashSum.update(buffer);
  const sha256Hash = hashSum.digest("hex");

  // 2. Sanitize file name
  const rawName = customFileName || file.name || "asset.bin";
  const safeFileName = rawName.replace(/[^a-zA-Z0-9.-]/g, "_");

  // 3. Resolve clean storage key with sanitized entity identifier
  const safeEntityId = entityId.replace(/[^a-zA-Z0-9.-]/g, "_");
  const assetId = crypto.randomUUID();
  const folderPart = subfolder ? `${subfolder.replace(/^\/+|\/+$/g, "")}/` : "";
  const storageKey = `${prefix}/${safeEntityId}/${folderPart}${assetId}/${safeFileName}`;

  // 4. Determine MIME type with extension fallback
  const mimeType = inferMimeType(safeFileName, file.type || fallbackMimeType);

  // 5. Stream binary payload to Tigris Object Storage
  await tigris.send(
    new PutObjectCommand({
      Bucket: TIGRIS_BUCKET,
      Key: storageKey,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  const fileUrl = `https://fly.storage.tigris.dev/${TIGRIS_BUCKET}/${storageKey}`;

  return {
    storageKey,
    fileUrl,
    sha256Hash,
    fileSize: file.size,
    mimeType,
    fileName: safeFileName,
  };
}
