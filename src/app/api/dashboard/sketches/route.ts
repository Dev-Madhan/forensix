import { NextResponse } from "next/server";
import { getRecentSketches } from "@/features/dashboard/queries";

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
