import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import "@/features/reports/pdf/styles/reportFonts";
import { reportTheme } from "@/features/reports/pdf/styles/reportTheme";
import type { CriminalRapSheetData } from "./types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 36,
    paddingHorizontal: 36,
    fontFamily: "Inter",
    fontSize: 8,
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },

  // --- Official Header Bar ---
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#1E1B4B",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "column",
  },
  headerLogoText: {
    fontSize: 11,
    fontWeight: 700,
    color: "#312E81",
    letterSpacing: 1.2,
  },
  headerSubText: {
    fontSize: 7,
    color: "#64748B",
    marginTop: 1,
    letterSpacing: 0.5,
  },
  classificationBadge: {
    fontSize: 7,
    fontWeight: 700,
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 3,
    letterSpacing: 0.8,
  },

  // --- Title & Document Identifier ---
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  titleLeft: {
    flex: 1,
  },
  superTitle: {
    fontSize: 7.5,
    fontWeight: 600,
    color: "#4F46E5",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  mainTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: "#0F172A",
    marginTop: 2,
  },
  metaRight: {
    alignItems: "flex-end",
  },
  metaText: {
    fontSize: 7,
    color: "#64748B",
  },
  metaValue: {
    fontSize: 7.5,
    fontWeight: 600,
    color: "#1E293B",
  },

  // --- Subject Hero Summary Card ---
  heroCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 5,
    backgroundColor: "#F8FAFC",
    padding: 10,
    marginBottom: 10,
  },
  mugshotFrame: {
    width: 85,
    height: 105,
    backgroundColor: "#0F172A",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#94A3B8",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mugshotImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  mugshotPlaceholder: {
    color: "#94A3B8",
    fontSize: 7,
    textAlign: "center",
    paddingHorizontal: 6,
  },
  heroDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  heroNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
  },
  subjectName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0F172A",
  },
  subjectId: {
    fontSize: 8,
    fontWeight: 600,
    color: "#4338CA",
    marginTop: 1,
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusBadge: {
    fontSize: 6.5,
    fontWeight: 700,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    marginLeft: 4,
  },
  statusWanted: {
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
    borderWidth: 0.5,
    borderColor: "#FCA5A5",
  },
  statusActive: {
    color: "#065F46",
    backgroundColor: "#D1FAE5",
    borderWidth: 0.5,
    borderColor: "#6EE7B7",
  },
  riskBadge: {
    fontSize: 6.5,
    fontWeight: 700,
    color: "#92400E",
    backgroundColor: "#FEF3C7",
    borderWidth: 0.5,
    borderColor: "#FCD34D",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
  },

  // Key-Value Grid inside Hero
  kvGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  kvItem: {
    width: "48%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
  },
  kvLabel: {
    fontSize: 7,
    color: "#64748B",
  },
  kvVal: {
    fontSize: 7,
    fontWeight: 600,
    color: "#1E293B",
  },

  // --- Statistics Metric Matrix ---
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  metricCard: {
    width: "23.5%",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    padding: 6,
    alignItems: "center",
  },
  metricValue: {
    fontSize: 13,
    fontWeight: 700,
    color: "#1E1B4B",
  },
  metricLabel: {
    fontSize: 6.5,
    color: "#64748B",
    marginTop: 1,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  // --- Section Heading ---
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    marginBottom: 6,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: "#1E1B4B",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  sectionCount: {
    fontSize: 6.5,
    fontWeight: 600,
    color: "#4338CA",
    backgroundColor: "#EEF2FF",
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 3,
  },

  // --- Offense Ledger Table ---
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#1E1B4B",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  headerCell: {
    fontSize: 6.5,
    fontWeight: 700,
    color: "#FFFFFF",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: "column",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRowAlt: {
    backgroundColor: "#F8FAFC",
  },
  rowTopLine: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowBottomLine: {
    marginTop: 3,
    paddingTop: 3,
    borderTopWidth: 0.5,
    borderTopColor: "#EDF2F7",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cellText: {
    fontSize: 7,
    color: "#0F172A",
  },
  cellTextBold: {
    fontSize: 7,
    fontWeight: 600,
    color: "#0F172A",
  },
  cellTextMuted: {
    fontSize: 6.5,
    color: "#64748B",
  },
  offenceBadge: {
    fontSize: 6.5,
    fontWeight: 600,
    color: "#831843",
    backgroundColor: "#FCE7F3",
    borderWidth: 0.5,
    borderColor: "#FBCFE8",
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  statusCellBadge: {
    fontSize: 6.5,
    fontWeight: 600,
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 2,
    textAlign: "center",
  },
  sentenceBox: {
    fontSize: 6.5,
    color: "#1E293B",
    backgroundColor: "#F1F5F9",
    borderWidth: 0.5,
    borderColor: "#CBD5E1",
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  descText: {
    fontSize: 6.5,
    color: "#334155",
    flex: 1,
    marginRight: 6,
  },

  // --- Section 65B Statutory Certification ---
  certBox: {
    borderWidth: 1,
    borderColor: "#4338CA",
    borderRadius: 4,
    backgroundColor: "#F5F3FF",
    padding: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  certTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    color: "#312E81",
    marginBottom: 2,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  certText: {
    fontSize: 6.5,
    color: "#3730A3",
    lineHeight: 1.25,
    marginBottom: 5,
  },
  certRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#DDD6FE",
    paddingTop: 3,
    marginTop: 2,
  },
  certMetaLabel: {
    fontSize: 6,
    color: "#4C1D95",
    fontWeight: 600,
  },
  certMetaVal: {
    fontSize: 6,
    color: "#5B21B6",
  },

  // --- Running Footer ---
  footer: {
    position: "absolute",
    bottom: 16,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 4,
  },
  footerText: {
    fontSize: 6,
    color: "#94A3B8",
  },
});

export function CriminalRapSheetDocument({ data }: { data: CriminalRapSheetData }) {
  const isWanted = data.subject.status === "WANTED";

  return (
    <Document
      title={`Official Judicial Rap Sheet — ${data.subject.fullName} (${data.subject.criminalId})`}
      author="Forensix Intelligence Services"
      subject={`Official Judicial Offense Rap Sheet for ${data.subject.fullName}`}
      creator="Forensix Automated Registry"
      keywords="rap sheet, criminal history, judicial record, forensix, law enforcement"
    >
      <Page size="A4" style={styles.page}>
        {/* 1. Official Bureau Top Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerLogoText}>FORENSIX · STATE CRIME RECORDS BUREAU</Text>
            <Text style={styles.headerSubText}>
              JUDICIAL OFFENSE REGISTER & CRIMINAL HISTORY REPOSITORY
            </Text>
          </View>
          <Text style={styles.classificationBadge}>{data.classification}</Text>
        </View>

        {/* 2. Title & Identifiers */}
        <View style={styles.titleContainer}>
          <View style={styles.titleLeft}>
            <Text style={styles.superTitle}>OFFICIAL JUDICIAL RAP SHEET</Text>
            <Text style={styles.mainTitle}>{data.subject.fullName}</Text>
          </View>
          <View style={styles.metaRight}>
            <Text style={styles.metaText}>
              Rap Sheet Ref: <Text style={styles.metaValue}>{data.rapSheetNumber}</Text>
            </Text>
            <Text style={styles.metaText}>
              Generated: <Text style={styles.metaValue}>{data.generatedAt}</Text>
            </Text>
          </View>
        </View>

        {/* 3. Subject Demographics & Mugshot Card */}
        <View style={styles.heroCard}>
          <View style={styles.mugshotFrame}>
            {data.subject.mugshotUrl ? (
              <Image src={data.subject.mugshotUrl} style={styles.mugshotImage} />
            ) : (
              <Text style={styles.mugshotPlaceholder}>NO PHOTOGRAPHIC RECORD ON FILE</Text>
            )}
          </View>

          <View style={styles.heroDetails}>
            <View style={styles.heroNameRow}>
              <View>
                <Text style={styles.subjectName}>{data.subject.fullName}</Text>
                <Text style={styles.subjectId}>Criminal ID: {data.subject.criminalId}</Text>
              </View>
              <View style={styles.badgeContainer}>
                <Text style={styles.riskBadge}>{data.subject.riskLevel} RISK</Text>
                <Text
                  style={[
                    styles.statusBadge,
                    isWanted ? styles.statusWanted : styles.statusActive,
                  ]}
                >
                  {data.subject.status}
                </Text>
              </View>
            </View>

            <View style={styles.kvGrid}>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Date of Birth / Age</Text>
                <Text style={styles.kvVal}>
                  {data.subject.dateOfBirth || "N/A"}{" "}
                  {data.subject.age !== "N/A" ? `(${data.subject.age} yrs)` : ""}
                </Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Gender / Nationality</Text>
                <Text style={styles.kvVal}>
                  {data.subject.gender} · {data.subject.nationality}
                </Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Known Aliases</Text>
                <Text style={styles.kvVal}>
                  {data.subject.aliases.length > 0
                    ? data.subject.aliases.slice(0, 2).join(", ")
                    : "None Recorded"}
                </Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Jurisdiction / Location</Text>
                <Text style={styles.kvVal}>{data.subject.lastKnownLocation}</Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Biometric Status</Text>
                <Text style={styles.kvVal}>
                  {data.subject.biometrics?.fingerprintStatus || "AFIS Enrolled"}
                </Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Distinctive Marks</Text>
                <Text style={styles.kvVal}>
                  {data.subject.demographics?.identifyingMarks || "None Documented"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4. Statistics Metric Row */}
        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{data.statistics.totalOffenses}</Text>
            <Text style={styles.metricLabel}>Total Charges</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: "#B45309" }]}>
              {data.statistics.activeTrials}
            </Text>
            <Text style={styles.metricLabel}>Active Trials</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: "#B91C1C" }]}>
              {data.statistics.convictions}
            </Text>
            <Text style={styles.metricLabel}>Convictions</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: "#047857" }]}>
              {data.statistics.closedCases}
            </Text>
            <Text style={styles.metricLabel}>Closed / Solved</Text>
          </View>
        </View>

        {/* 5. Chronological Judicial Offense Ledger */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            CHRONOLOGICAL JUDICIAL OFFENSE LEDGER & COURT DISPOSITIONS
          </Text>
          <Text style={styles.sectionCount}>{data.records.length} Recorded Entries</Text>
        </View>

        <View style={styles.table}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerCell, { width: "6%" }]}>#</Text>
            <Text style={[styles.headerCell, { width: "20%" }]}>Case / FIR No.</Text>
            <Text style={[styles.headerCell, { width: "20%" }]}>Offense Type</Text>
            <Text style={[styles.headerCell, { width: "18%" }]}>Incident Date</Text>
            <Text style={[styles.headerCell, { width: "20%" }]}>Presiding Court</Text>
            <Text style={[styles.headerCell, { width: "16%" }]}>Status / Outcome</Text>
          </View>

          {/* Table Body */}
          {data.records.length > 0 ? (
            data.records.map((r, i) => {
              const isConvicted =
                r.outcome?.toLowerCase().includes("convict") ||
                r.status?.toLowerCase().includes("convict");
              const isClosed =
                r.status?.toLowerCase().includes("closed") ||
                r.status?.toLowerCase().includes("solved");

              const outcomeBadgeStyle = isConvicted
                ? { color: "#991B1B", backgroundColor: "#FEE2E2" }
                : isClosed
                ? { color: "#065F46", backgroundColor: "#D1FAE5" }
                : { color: "#92400E", backgroundColor: "#FEF3C7" };

              return (
                <View
                  key={i}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                  wrap={false}
                >
                  <View style={styles.rowTopLine}>
                    <Text style={[styles.cellTextMuted, { width: "6%", fontWeight: 600 }]}>
                      {String(i + 1).padStart(2, "0")}
                    </Text>
                    <Text style={[styles.cellTextBold, { width: "20%", color: "#312E81" }]}>
                      {r.caseId}
                    </Text>
                    <View style={{ width: "20%", paddingRight: 4 }}>
                      <Text style={styles.offenceBadge}>{r.offenceType}</Text>
                    </View>
                    <Text style={[styles.cellTextMuted, { width: "18%" }]}>{r.date}</Text>
                    <Text style={[styles.cellTextMuted, { width: "20%" }]}>
                      {r.courtName || "Sessions Court"}
                    </Text>
                    <View style={{ width: "16%" }}>
                      <Text style={[styles.statusCellBadge, outcomeBadgeStyle]}>
                        {r.outcome || r.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.rowBottomLine}>
                    <Text style={styles.descText}>
                      Particulars: {r.description || "Official court record entered on remand."}
                    </Text>
                    {r.sentenceDetails && (
                      <Text style={styles.sentenceBox}>Order: {r.sentenceDetails}</Text>
                    )}
                  </View>
                </View>
              );
            })
          ) : (
            <View style={[styles.tableRow, { paddingVertical: 12, alignItems: "center" }]}>
              <Text style={[styles.cellTextMuted, { textAlign: "center" }]}>
                No formal convictions or active judicial proceedings on record.
              </Text>
            </View>
          )}
        </View>

        {/* 6. Section 65B Electronic Certificate & Cryptographic Chain */}
        <View style={styles.certBox} wrap={false}>
          <Text style={styles.certTitle}>
            CERTIFICATE OF AUTHENTICITY UNDER SECTION 65B / BHARATIYA SAKSHYA ADHINIYAM (BSA)
          </Text>
          <Text style={styles.certText}>
            This electronic Rap Sheet was generated from authenticated state criminal ledger nodes
            maintained by Forensix Intelligence Services. Each chronological charge, disposition, and
            sentence has been validated against active judicial dockets with sequential SHA-256 block
            hashing and tamper-evident Merkle verification.
          </Text>
          <View style={styles.certRow}>
            <Text style={styles.certMetaLabel}>
              Custody Merkle Root: {data.custodyCertification.merkleRootHash.slice(0, 36)}...
            </Text>
            <Text style={styles.certMetaVal}>
              Validated Blocks: {data.custodyCertification.totalSignedBlocks}
            </Text>
          </View>
          <View style={styles.certRow}>
            <Text style={styles.certMetaLabel}>
              Certifying Authority: {data.generatedBy.name} ({data.generatedBy.badgeId || "REG-FORENSIX"})
            </Text>
            <Text style={styles.certMetaVal}>
              Certified Timestamp: {data.custodyCertification.certifiedAt}
            </Text>
          </View>
        </View>

        {/* 7. Running Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            CONFIDENTIAL · LAW ENFORCEMENT & COURT EXHIBIT · RAP SHEET {data.rapSheetNumber}
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
