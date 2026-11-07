import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRecentSketches } from "@/features/dashboard/queries";
import { broadcastForensicEvent } from "@/lib/forensic-events";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sketches = await getRecentSketches(6);
    return NextResponse.json({
      success: true,
      sketches,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("[Dashboard Sketches API] Query error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch sketches", sketches: [] },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    // Purge all stale sketches and generation jobs
    await Promise.all([
      prisma.sketch.deleteMany().catch(() => {}),
      prisma.generationJob.deleteMany().catch(() => {}),
    ]);

    // Broadcast sync event so connected dashboard clients clear immediately
    try {
      broadcastForensicEvent({
        type: "SKETCH_GENERATED",
        data: {
          id: "__CLEARED__",
          isCleared: true,
          sketches: [],
        },
        timestamp: Date.now(),
      });
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: "Recent sketches cleared successfully",
      timestamp: Date.now(),
    });
  } catch (error: any) {
    console.error("[Dashboard Sketches API] Delete error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to clear sketches" },
      { status: 500 }
    );
  }
}
