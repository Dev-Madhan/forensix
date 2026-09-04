import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/env";

export const tigris = new S3Client({
  region: "auto",
  endpoint: env.TIGRIS_ENDPOINT,
  credentials: {
    accessKeyId: env.TIGRIS_ACCESS_KEY_ID!,
    secretAccessKey: env.TIGRIS_SECRET_ACCESS_KEY!,
  },
});

export const TIGRIS_BUCKET = env.TIGRIS_BUCKET_NAME!;
