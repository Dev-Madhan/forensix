import { NextRequest, NextResponse } from "next/server";
import { tigris, TIGRIS_BUCKET } from "@/lib/tigris";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawKey = searchParams.get("key");

  if (!rawKey) {
    return NextResponse.redirect(new URL("/images/suspects/arun-prakash.jpg", request.url));
  }

  // Clean key: decode and remove leading slashes or bucket prefix if present
  let key = decodeURIComponent(rawKey).trim().replace(/^\/+/, "");
  if (key.startsWith(`${TIGRIS_BUCKET}/`)) {
    key = key.slice(TIGRIS_BUCKET.length + 1);
  }

  try {
    const command = new GetObjectCommand({
      Bucket: TIGRIS_BUCKET,
      Key: key,
    });

    const response = await tigris.send(command);

    if (!response.Body) {
      console.warn("Storage item has no body for key:", key);
      return NextResponse.redirect(new URL("/images/suspects/arun-prakash.jpg", request.url));
    }

    const headers = new Headers();
    if (response.ContentType) {
      headers.set("Content-Type", response.ContentType);
    } else {
      headers.set("Content-Type", "image/jpeg");
    }

    if (response.ContentLength) {
      headers.set("Content-Length", response.ContentLength.toString());
    }

    if (response.ETag) {
      headers.set("ETag", response.ETag);
    }

    // High performance caching: 1 year public immutable CDN cache + stale-while-revalidate
    headers.set(
      "Cache-Control",
      "public, max-age=31536000, s-maxage=31536000, stale-while-revalidate=86400, immutable"
    );

    // Conditional GET: check ETag for 304 Not Modified
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch && response.ETag && ifNoneMatch === response.ETag) {
      return new NextResponse(null, { status: 304, headers });
    }

    const webStream = response.Body.transformToWebStream();
    return new NextResponse(webStream, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    // Graceful fallback for missing or unauthorized keys
    if (error?.name !== "NoSuchKey" && error?.$metadata?.httpStatusCode !== 404) {
      console.error("Storage streaming error for key:", key, error);
    }
    return NextResponse.redirect(new URL("/images/suspects/arun-prakash.jpg", request.url));
  }
}

