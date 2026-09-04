import { tigris, TIGRIS_BUCKET } from "@/lib/tigris";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Generates a temporary signed GET URL for accessing a private object in Tigris.
 * Default expiration is 1 hour (3600 seconds).
 */
export async function getEvidenceSignedUrl(
  storageKey: string,
  expiresIn = 3600
): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: TIGRIS_BUCKET,
      Key: storageKey,
    });

    return await getSignedUrl(tigris, command, { expiresIn });
  } catch (error) {
    console.error("Failed to generate signed URL for storage key:", storageKey, error);
    return "";
  }
}
