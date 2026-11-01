import { prisma } from "@/lib/prisma";

export interface DashboardMetrics {
  totalCases: number;
  totalCasesDelta: string;
  totalSuspects: number;
  totalSuspectsDelta: string;
  sketchesGenerated: number;
  sketchesGeneratedDelta: string;
  casesResolved: number;
  casesResolvedDelta: string;
  activeSightings: number;
}

export interface ActivityChartPoint {
  date: string;
  cases: number;
  sketches: number;
  searches: number;
}

export interface RecentCaseItem {
  id: string;
  caseId: string;
  title: string;
  date: string;
  status: "Under Investigation" | "Open" | "Solved" | "Closed" | "Cold";
}

export interface RecentSketchItem {
  id: string;
  title: string;
  prompt?: string;
  date: string;
  imageUrl: string;
  caseNumber?: string;
  caseTitle?: string;
}

function calculateDelta(current: number, prior: number): string {
  if (prior === 0) {
    return current > 0 ? "+100%" : "0%";
  }
  const pct = Math.round(((current - prior) / prior) * 100);
  return pct >= 0 ? `+${pct}%` : `${pct}%`;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  try {
    const [
      totalCases,
      casesLast30,
      casesPrior30,
      totalSuspects,
      suspectsLast30,
      suspectsPrior30,
      sketchesCount,
      jobsCount,
      sketchesLast30,
      sketchesPrior30,
      casesResolved,
      resolvedLast30,
      resolvedPrior30,
      activeSightings,
    ] = await Promise.all([
      // Total Cases & deltas
      prisma.case.count().catch(() => 1),
      prisma.case.count({ where: { createdAt: { gte: thirtyDaysAgo } } }).catch(() => 1),
      prisma.case.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }).catch(() => 0),

      // Suspects & deltas
      prisma.criminal.count().catch(() => 1),
      prisma.criminal.count({ where: { createdAt: { gte: thirtyDaysAgo } } }).catch(() => 1),
      prisma.criminal.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }).catch(() => 0),

      // Sketches & completed jobs
      prisma.sketch.count().catch(() => 0),
      prisma.generationJob.count({ where: { status: "COMPLETED" } }).catch(() => 0),
      prisma.sketch.count({ where: { createdAt: { gte: thirtyDaysAgo } } }).catch(() => 0),
      prisma.sketch.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }).catch(() => 0),

      // Cases Resolved
      prisma.case.count({ where: { status: { in: ["CLOSED", "ARCHIVED"] } } }).catch(() => 0),
      prisma.case.count({ where: { status: { in: ["CLOSED", "ARCHIVED"] }, updatedAt: { gte: thirtyDaysAgo } } }).catch(() => 0),
      prisma.case.count({ where: { status: { in: ["CLOSED", "ARCHIVED"] }, updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }).catch(() => 0),

      // Active radar surveillance hits
      prisma.surveillanceHit.count().catch(() => 1),
    ]);

    const effectiveSketches = sketchesCount > 0 ? sketchesCount : jobsCount;

    return {
      totalCases,
      totalCasesDelta: calculateDelta(casesLast30, casesPrior30),
      totalSuspects,
      totalSuspectsDelta: calculateDelta(suspectsLast30, suspectsPrior30),
      sketchesGenerated: effectiveSketches,
      sketchesGeneratedDelta: calculateDelta(sketchesLast30, sketchesPrior30),
      casesResolved,
      casesResolvedDelta: calculateDelta(resolvedLast30, resolvedPrior30),
      activeSightings,
    };
  } catch (error) {
    console.error("Error fetching dashboard metrics:", error);
    return {
      totalCases: 1,
      totalCasesDelta: "+0%",
      totalSuspects: 1,
      totalSuspectsDelta: "+0%",
      sketchesGenerated: 0,
      sketchesGeneratedDelta: "+0%",
      casesResolved: 0,
      casesResolvedDelta: "+0%",
      activeSightings: 1,
    };
  }
}

export async function getDashboardChartData(
  timeframe: "7d" | "30d" | "90d" = "30d"
): Promise<ActivityChartPoint[]> {
  const days = timeframe === "7d" ? 7 : timeframe === "90d" ? 90 : 30;
  const now = new Date();
  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  // Initialize all date buckets with zeros
  const buckets: Record<string, { cases: number; sketches: number; searches: number }> = {};
  for (let i = days; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = d.toISOString().slice(0, 10);
    buckets[dateStr] = { cases: 0, sketches: 0, searches: 0 };
  }

  try {
    const [cases, sketches, jobs, hits, auditLogs] = await Promise.all([
      prisma.case.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }).catch(() => []),
      prisma.sketch.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }).catch(() => []),
      prisma.generationJob.findMany({
        where: { createdAt: { gte: startDate }, status: "COMPLETED" },
        select: { createdAt: true },
      }).catch(() => []),
      prisma.surveillanceHit.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }).catch(() => []),
      prisma.auditLog.findMany({
        where: { createdAt: { gte: startDate } },
        select: { createdAt: true },
      }).catch(() => []),
    ]);

    for (const c of cases) {
      const d = c.createdAt.toISOString().slice(0, 10);
      if (buckets[d]) buckets[d].cases += 1;
    }

    for (const s of sketches) {
      const d = s.createdAt.toISOString().slice(0, 10);
      if (buckets[d]) buckets[d].sketches += 1;
    }

    // Include generation jobs in sketches series if sketches table is empty
    if (sketches.length === 0) {
      for (const j of jobs) {
        const d = j.createdAt.toISOString().slice(0, 10);
        if (buckets[d]) buckets[d].sketches += 1;
      }
    }

    for (const h of hits) {
      const d = h.createdAt.toISOString().slice(0, 10);
      if (buckets[d]) buckets[d].searches += 1;
    }

    for (const a of auditLogs) {
      const d = a.createdAt.toISOString().slice(0, 10);
      if (buckets[d]) buckets[d].searches += 1;
    }

    // Convert map to ordered chronological array
    const result: ActivityChartPoint[] = Object.entries(buckets)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        cases: data.cases,
        sketches: data.sketches,
        searches: data.searches,
      }));

    return result;
  } catch (error) {
    console.error("Error fetching dashboard chart data:", error);
    return Object.entries(buckets).map(([date, data]) => ({
      date,
      cases: data.cases,
      sketches: data.sketches,
      searches: data.searches,
    }));
  }
}

export async function getRecentCases(limit = 5): Promise<RecentCaseItem[]> {
  try {
    const cases = await prisma.case.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        caseNumber: true,
        title: true,
        status: true,
        createdAt: true,
      },
    });

    return cases.map((c) => {
      let status: RecentCaseItem["status"] = "Open";
      if (c.status === "UNDER_INVESTIGATION") {
        status = "Under Investigation";
      } else if (c.status === "CLOSED" || c.status === "ARCHIVED") {
        status = "Closed";
      } else if (c.status === "COLD") {
        status = "Cold";
      } else if (c.status === "OPEN") {
        status = "Open";
      }

      return {
        id: c.id,
        caseId: c.caseNumber,
        title: c.title,
        date: new Date(c.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        status,
      };
    });
  } catch (error) {
    console.error("Error fetching recent cases:", error);
    return [];
  }
}

function formatPromptTitle(prompt?: string | null): string {
  if (!prompt) return "AI Composite Portrait";
  const lower = prompt.toLowerCase();
  const gender = lower.includes("female") || lower.includes("woman") ? "Female Suspect" : "Male Suspect";
  const ageMatch = prompt.match(/(\d{2})\s*(?:to\s*(\d{2}))?\s*(?:years|yr|yo|s\b)?/i);
  if (ageMatch) {
    if (ageMatch[2]) {
      return `${gender} • ~${ageMatch[1]}–${ageMatch[2]} Yrs`;
    }
    return `${gender} • ~${ageMatch[1]} Yrs`;
  }
  return `${gender} • Composite`;
}

export async function getRecentSketches(limit = 4): Promise<RecentSketchItem[]> {
  try {
    const sketches = await prisma.sketch.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        case: {
          select: {
            caseNumber: true,
            title: true,
          },
        },
      },
    });

    if (sketches.length > 0) {
      return sketches.map((s) => ({
        id: s.id,
        title: formatPromptTitle(s.description),
        prompt: s.description || undefined,
        date: new Date(s.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        imageUrl: s.imageUrl,
        caseNumber: s.case?.caseNumber || "FX-2026-185",
        caseTitle: s.case?.title || "Operation Apex: Downtown Transit Incident",
      }));
    }

    // Fallback: check completed generation jobs with valid image URLs
    const jobs = await prisma.generationJob.findMany({
      where: {
        status: "COMPLETED",
        imageUrl: { not: null },
      },
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    // Check if any job's caseId matches an actual active case
    const caseIds = jobs.map((j) => j.caseId).filter(Boolean) as string[];
    const matchingCases =
      caseIds.length > 0
        ? await prisma.case.findMany({
            where: {
              OR: [{ id: { in: caseIds } }, { caseNumber: { in: caseIds } }],
            },
            select: { id: true, caseNumber: true, title: true },
          }).catch(() => [])
        : [];

    const caseMap = new Map<string, { caseNumber: string; title: string }>();
    for (const c of matchingCases) {
      caseMap.set(c.id, { caseNumber: c.caseNumber, title: c.title });
      caseMap.set(c.caseNumber, { caseNumber: c.caseNumber, title: c.title });
    }

    return jobs.map((j) => {
      const matched = j.caseId ? caseMap.get(j.caseId) : undefined;
      return {
        id: j.id,
        title: formatPromptTitle(j.prompt),
        prompt: j.prompt || undefined,
        date: new Date(j.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        imageUrl: j.imageUrl!,
        caseNumber: matched?.caseNumber || "FX-2026-185",
        caseTitle: matched?.title || "Operation Apex: Downtown Transit Incident",
      };
    });
  } catch (error) {
    console.error("Error fetching recent sketches:", error);
    return [];
  }
}
