import { NextRequest, NextResponse } from "next/server";
import { getEvidenceSignedUrl } from "@/features/evidence/queries";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.redirect(new URL("/images/suspects/arun-prakash.jpg", request.url));
  }

  try {
    const signedUrl = await getEvidenceSignedUrl(key);
    return NextResponse.redirect(signedUrl, 307);
  } catch (error) {
    console.error("Storage redirect failed for key:", key, error);
    return NextResponse.redirect(new URL("/images/suspects/arun-prakash.jpg", request.url));
  }
}
