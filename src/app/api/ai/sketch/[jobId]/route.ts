import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    
    if (!jobId) {
      return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
    }

    const job = await prisma.generationJob.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json({
      id: job.id,
      status: job.status,
      imageUrl: job.imageUrl,
      error: job.error,
      caseId: job.caseId,
    });
  } catch (error) {
    console.error("[Job Status Route] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
