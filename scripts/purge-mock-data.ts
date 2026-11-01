import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("=== STARTING FORENSIX MOCK DATA CLEANUP ===");

  // 1. Identify Madhan Kumar
  const madhan = await prisma.criminal.findFirst({
    where: {
      OR: [
        { criminalId: "CR-2026-104" },
        {
          AND: [
            { firstName: { equals: "Madhan", mode: "insensitive" } },
            { lastName: { equals: "Kumar", mode: "insensitive" } },
          ],
        },
      ],
    },
    include: {
      caseLinks: true,
      records: true,
      evidences: true,
      surveillanceHits: true,
    },
  });

  if (!madhan) {
    throw new Error(
      "CRITICAL: Could not find Madhan Kumar profile in the database! Aborting to prevent accidental data loss."
    );
  }

  console.log(`Found protected profile: [${madhan.id}] ${madhan.firstName} ${madhan.lastName} (${madhan.criminalId})`);
  console.log(`- Case links: ${madhan.caseLinks.length}`);
  console.log(`- Criminal records: ${madhan.records.length}`);
  console.log(`- Evidences: ${madhan.evidences.length}`);
  console.log(`- Surveillance hits: ${madhan.surveillanceHits.length}`);

  // 2. Identify all OTHER criminals to delete
  const criminalsToDelete = await prisma.criminal.findMany({
    where: {
      id: { not: madhan.id },
    },
    select: {
      id: true,
      criminalId: true,
      firstName: true,
      lastName: true,
      alias: true,
    },
  });

  console.log(`\nFound ${criminalsToDelete.length} other criminals to purge:`);
  criminalsToDelete.forEach((c) => {
    console.log(`- [${c.id}] ${c.criminalId}: ${c.firstName} ${c.lastName} (Alias: ${c.alias || "None"})`);
  });

  const deleteCriminalIds = criminalsToDelete.map((c) => c.id);

  // 3. Identify mock cases to delete (keeping FX-2026-001)
  const mockCases = await prisma.case.findMany({
    where: {
      caseNumber: { not: "FX-2026-001" },
    },
    select: {
      id: true,
      caseNumber: true,
      title: true,
    },
  });

  console.log(`\nFound ${mockCases.length} mock cases to purge:`);
  mockCases.forEach((c) => {
    console.log(`- [${c.id}] ${c.caseNumber}: "${c.title}"`);
  });

  const deleteCaseIds = mockCases.map((c) => c.id);

  // 4. Execute atomic cleanup in transaction
  console.log("\nExecuting purge transaction...");

  await prisma.$transaction(async (tx) => {
    // A. Remove CaseSuspect links for non-Madhan criminals
    if (deleteCriminalIds.length > 0) {
      const deletedSuspectLinks = await tx.caseSuspect.deleteMany({
        where: { criminalId: { in: deleteCriminalIds } },
      });
      console.log(`- Deleted ${deletedSuspectLinks.count} suspect links for non-Madhan profiles.`);

      // B. Delete CriminalRecords for non-Madhan criminals
      const deletedRecords = await tx.criminalRecord.deleteMany({
        where: { criminalId: { in: deleteCriminalIds } },
      });
      console.log(`- Deleted ${deletedRecords.count} criminal records.`);

      // C. Delete SurveillanceHits for non-Madhan criminals
      const deletedHits = await tx.surveillanceHit.deleteMany({
        where: { criminalId: { in: deleteCriminalIds } },
      });
      console.log(`- Deleted ${deletedHits.count} surveillance hits.`);

      // D. Delete RecognitionResults for non-Madhan criminals
      const deletedRecognition = await tx.recognitionResult.deleteMany({
        where: { criminalId: { in: deleteCriminalIds } },
      });
      console.log(`- Deleted ${deletedRecognition.count} recognition results.`);

      // E. Delete Evidence linked to non-Madhan criminals
      const deletedEvidence = await tx.evidence.deleteMany({
        where: { criminalId: { in: deleteCriminalIds } },
      });
      console.log(`- Deleted ${deletedEvidence.count} non-Madhan criminal evidence entries.`);

      // F. Delete the non-Madhan criminals
      const deletedCriminals = await tx.criminal.deleteMany({
        where: { id: { in: deleteCriminalIds } },
      });
      console.log(`- Deleted ${deletedCriminals.count} criminal profiles.`);
    }

    // G. Delete mock cases and their relations
    if (deleteCaseIds.length > 0) {
      // Delete any CaseSuspect on these mock cases
      await tx.caseSuspect.deleteMany({
        where: { caseId: { in: deleteCaseIds } },
      });

      // Delete Evidence on these mock cases
      await tx.evidence.deleteMany({
        where: { caseId: { in: deleteCaseIds } },
      });

      // Delete Witnesses on these mock cases
      await tx.witness.deleteMany({
        where: { caseId: { in: deleteCaseIds } },
      });

      // Delete Sketches on these mock cases
      await tx.sketch.deleteMany({
        where: { caseId: { in: deleteCaseIds } },
      });

      // Delete Reports on these mock cases
      await tx.report.deleteMany({
        where: { caseId: { in: deleteCaseIds } },
      });

      // Delete GenerationJobs on these mock cases
      await tx.generationJob.deleteMany({
        where: { caseId: { in: deleteCaseIds } },
      });

      // Delete the cases themselves
      const deletedCases = await tx.case.deleteMany({
        where: { id: { in: deleteCaseIds } },
      });
      console.log(`- Deleted ${deletedCases.count} mock cases.`);
    }

    // H. Verify FX-2026-001 has Madhan Kumar linked as primary suspect
    const primaryCase = await tx.case.findUnique({
      where: { caseNumber: "FX-2026-001" },
      include: { suspects: true },
    });

    if (primaryCase) {
      const hasMadhan = primaryCase.suspects.some((s) => s.criminalId === madhan.id);
      if (!hasMadhan) {
        await tx.caseSuspect.create({
          data: {
            caseId: primaryCase.id,
            criminalId: madhan.id,
            status: "PRIMARY_SUSPECT",
            role: "DIRECT_INVOLVEMENT",
            matchConfidence: 94.2,
            notes: "Linked suspect via optical surveillance telemetry.",
          },
        });
        console.log(`- Ensured Madhan Kumar is linked as PRIMARY_SUSPECT to case FX-2026-001.`);
      }
    }
  });

  // 5. Verify final database state
  const remainingCriminals = await prisma.criminal.findMany({
    select: {
      id: true,
      criminalId: true,
      firstName: true,
      lastName: true,
      alias: true,
    },
  });

  const remainingCases = await prisma.case.findMany({
    select: {
      id: true,
      caseNumber: true,
      title: true,
      status: true,
      _count: { select: { suspects: true } },
    },
  });

  console.log("\n=== POST-PURGE VERIFICATION ===");
  console.log(`Remaining Criminals (${remainingCriminals.length}):`);
  remainingCriminals.forEach((c) => console.log(`- [${c.id}] ${c.criminalId}: ${c.firstName} ${c.lastName}`));

  console.log(`\nRemaining Cases (${remainingCases.length}):`);
  remainingCases.forEach((c) => console.log(`- [${c.id}] ${c.caseNumber}: "${c.title}" (Suspects: ${c._count.suspects})`));

  console.log("\n=== PURGE COMPLETED SUCCESSFULLY ===");
}

main()
  .catch((e) => {
    console.error("Purge failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
