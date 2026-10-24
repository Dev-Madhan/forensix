import { S3Client } from "@aws-sdk/client-s3";

const endpoint = (
  process.env.TIGRIS_ENDPOINT ||
  process.env.AWS_ENDPOINT_URL_S3 ||
  process.env.AWS_ENDPOINT_URL ||
  "https://fly.storage.tigris.dev"
).trim().replace(/\/+$/, "");

const accessKeyId = (
  process.env.TIGRIS_ACCESS_KEY_ID ||
  process.env.AWS_ACCESS_KEY_ID
)?.trim();

const secretAccessKey = (
  process.env.TIGRIS_SECRET_ACCESS_KEY ||
  process.env.AWS_SECRET_ACCESS_KEY
)?.trim();

export const TIGRIS_BUCKET = (
  process.env.TIGRIS_BUCKET_NAME ||
  process.env.BUCKET_NAME ||
  process.env.AWS_S3_BUCKET ||
  "forensix-evidence"
).trim();

export const tigris = new S3Client({
  region: process.env.AWS_REGION || "auto",
  endpoint,
  forcePathStyle: true,
  credentials:
    accessKeyId && secretAccessKey
      ? {
          accessKeyId,
          secretAccessKey,
        }
      : undefined,
});

