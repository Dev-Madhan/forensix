import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import "@/features/reports/pdf/styles/reportFonts";
import { reportTheme } from "@/features/reports/pdf/styles/reportTheme";
import type { CriminalDossierData } from "./types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 40,
    paddingHorizontal: 40,
    fontFamily: "Inter",
    fontSize: 8.5,
    color: reportTheme.colors.text,
    backgroundColor: "#FFFFFF",
  },
  coverPage: {
    paddingTop: 45,
    paddingBottom: 40,
    paddingHorizontal: 44,
    fontFamily: "Inter",
    backgroundColor: "#FFFFFF",
  },

  // --- Top Branding Bar ---
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: "#1E1B4B",
    marginBottom: 12,
  },
  headerLogoText: {
    fontSize: 10,
    fontWeight: 700,
    color: "#4338CA",
    letterSpacing: 1.5,
  },
  headerSubText: {
    fontSize: 7,
    color: "#6B7280",
    marginTop: 1,
  },
  classificationBadge: {
    fontSize: 7,
    fontWeight: 700,
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 3,
    letterSpacing: 0.8,
  },

  // --- Cover Page Layout ---
  coverTitleContainer: {
    marginTop: 12,
    marginBottom: 16,
  },
  coverSuperTitle: {
    fontSize: 8,
    fontWeight: 600,
    color: "#6366F1",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  coverMainTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#0F172A",
    marginTop: 2,
  },
  coverSubTitle: {
    fontSize: 8.5,
    color: "#64748B",
    marginTop: 3,
  },

  // --- Primary Dossier Card ---
  subjectHeroCard: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    padding: 12,
    marginBottom: 14,
    gap: 14,
  },
  mugshotFrame: {
    width: 110,
    height: 130,
    backgroundColor: "#0F172A",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#94A3B8",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  mugshotImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  mugshotPlaceholder: {
    color: "#94A3B8",
    fontSize: 8,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  heroDetails: {
    flex: 1,
    justifyContent: "space-between",
  },
  heroHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  subjectName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0F172A",
  },
  subjectCode: {
    fontFamily: "Inter",
    fontSize: 8.5,
    color: "#4338CA",
    fontWeight: 600,
    marginTop: 1,
  },
  statusBadgeWanted: {
    fontSize: 7,
    fontWeight: 700,
    color: "#991B1B",
    backgroundColor: "#FEE2E2",
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  statusBadgeActive: {
    fontSize: 7,
    fontWeight: 700,
    color: "#065F46",
    backgroundColor: "#D1FAE5",
    paddingVertical: 2.5,
    paddingHorizontal: 6,
    borderRadius: 3,
  },

  // Key Value Grid
  kvGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    gap: 6,
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
    fontSize: 7.5,
    color: "#64748B",
  },
  kvValue: {
    fontSize: 7.5,
    fontWeight: 600,
    color: "#1E293B",
  },

  // --- Section Styling ---
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    color: "#1E1B4B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionBadge: {
    fontSize: 7,
    fontWeight: 600,
    color: "#4338CA",
    backgroundColor: "#EEF2FF",
    paddingVertical: 1.5,
    paddingHorizontal: 5,
    borderRadius: 3,
  },

  // Table
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F1F5F9",
    borderBottomWidth: 1,
    borderBottomColor: "#CBD5E1",
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#E2E8F0",
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#F8FAFC",
  },
  colHeader: {
    fontSize: 7,
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
  },
  colText: {
    fontSize: 7.5,
    color: "#1E293B",
  },
  colTextMuted: {
    fontSize: 7,
    color: "#64748B",
  },

  // --- Certificate Box ---
  certBox: {
    marginTop: 14,
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#059669",
    backgroundColor: "#ECFDF5",
  },
  certTitle: {
    fontSize: 8.5,
    fontWeight: 700,
    color: "#065F46",
    marginBottom: 4,
  },
  certText: {
    fontSize: 7,
    color: "#047857",
    lineHeight: 1.4,
  },
  certMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: "#A7F3D0",
  },
  certMetaLabel: {
    fontSize: 6.5,
    color: "#065F46",
    fontWeight: 600,
  },
  certMetaValue: {
    fontSize: 6.5,
    color: "#047857",
    fontFamily: "Inter",
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#CBD5E1",
    paddingTop: 5,
  },
  footerText: {
    fontSize: 6.5,
    color: "#94A3B8",
  },
});

export function CriminalDossierDocument({ data }: { data: CriminalDossierData }) {
  const isWanted = data.subject.status === "WANTED";

  return (
    <Document
      title={`Criminal Intelligence Dossier — ${data.subject.fullName} (${data.subject.criminalId})`}
      author="Forensix Intelligence Services"
      subject={`Official Certified Dossier for ${data.subject.fullName}`}
      creator="Forensix Automated Registry"
      keywords="criminal dossier, forensic report, chain of custody, law enforcement"
    >
      {/* ─────────────────────────────────────────────────────────────
          PAGE 1: Official Identification & Biometric Dossier Cover
          ───────────────────────────────────────────────────────────── */}
      <Page size="A4" style={styles.coverPage}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <View>
            <Text style={styles.headerLogoText}>FORENSIX · STATE CRIMINAL BUREAU</Text>
            <Text style={styles.headerSubText}>
              CENTRAL FORENSIC INTELLIGENCE & SUSPECT REGISTRY
            </Text>
          </View>
          <Text style={styles.classificationBadge}>{data.classification}</Text>
        </View>

        {/* Title Container */}
        <View style={styles.coverTitleContainer}>
          <Text style={styles.coverSuperTitle}>OFFICIAL CRIMINAL PROFILE DOSSIER</Text>
          <Text style={styles.coverMainTitle}>{data.subject.fullName}</Text>
          <Text style={styles.coverSubTitle}>
            Subject Identifier: {data.subject.criminalId} · Dossier Ref: {data.dossierNumber}
          </Text>
        </View>

        {/* Hero Card: Mugshot + Core Profile Details */}
        <View style={styles.subjectHeroCard}>
          <View style={styles.mugshotFrame}>
            {data.subject.mugshotUrl ? (
              <Image src={data.subject.mugshotUrl} style={styles.mugshotImage} />
            ) : (
              <Text style={styles.mugshotPlaceholder}>NO PHOTOGRAPHIC RECORD ON FILE</Text>
            )}
          </View>

          <View style={styles.heroDetails}>
            <View style={styles.heroHeaderRow}>
              <View>
                <Text style={styles.subjectName}>{data.subject.fullName}</Text>
                <Text style={styles.subjectCode}>
                  Subject ID: {data.subject.criminalId}
                </Text>
              </View>
              <Text style={isWanted ? styles.statusBadgeWanted : styles.statusBadgeActive}>
                {data.subject.status}
              </Text>
            </View>

            <View style={styles.kvGrid}>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Risk Tier</Text>
                <Text style={styles.kvValue}>{data.subject.riskLevel}</Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Watchlist</Text>
                <Text style={styles.kvValue}>{data.subject.watchlistStatus}</Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Age / Gender</Text>
                <Text style={styles.kvValue}>
                  {data.subject.age} yrs · {data.subject.gender}
                </Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Nationality</Text>
                <Text style={styles.kvValue}>{data.subject.nationality}</Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Date of Birth</Text>
                <Text style={styles.kvValue}>{data.subject.dateOfBirth || "Unknown"}</Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Blood Group</Text>
                <Text style={styles.kvValue}>
                  {data.subject.demographics.bloodGroup || "Not Typed"}
                </Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Height / Weight</Text>
                <Text style={styles.kvValue}>
                  {data.subject.demographics.height || "N/A"} ·{" "}
                  {data.subject.demographics.weight || "N/A"}
                </Text>
              </View>
              <View style={styles.kvItem}>
                <Text style={styles.kvLabel}>Last Sighting</Text>
                <Text style={styles.kvValue}>
                  {data.subject.lastKnownLocation || "Not Documented"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Aliases & Known Monikers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Documented Aliases & Monikers</Text>
            <Text style={styles.sectionBadge}>
              {data.subject.aliases.length} Registered
            </Text>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
            {data.subject.aliases.length > 0 ? (
              data.subject.aliases.map((alias, i) => (
                <Text
                  key={i}
                  style={{
                    fontSize: 7.5,
                    paddingVertical: 2,
                    paddingHorizontal: 6,
                    borderRadius: 3,
                    backgroundColor: "#F1F5F9",
                    color: "#334155",
                    borderWidth: 0.5,
                    borderColor: "#CBD5E1",
                  }}
                >
                  "{alias}"
                </Text>
              ))
            ) : (
              <Text style={{ fontSize: 7.5, color: "#64748B" }}>
                No active aliases registered in the central index.
              </Text>
            )}
          </View>
        </View>

        {/* Biometric Registry Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Biometric Architecture Enrollment</Text>
            <Text style={styles.sectionBadge}>Forensic Core</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colHeader, { width: "35%" }]}>Modality</Text>
              <Text style={[styles.colHeader, { width: "40%" }]}>Specification / Standard</Text>
              <Text style={[styles.colHeader, { width: "25%" }]}>Status</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.colText, { width: "35%" }]}>Facial Recognition</Text>
              <Text style={[styles.colTextMuted, { width: "40%" }]}>
                512D ArcFace Vector (pgvector)
              </Text>
              <Text
                style={[
                  styles.colText,
                  {
                    width: "25%",
                    color: data.subject.biometrics.faceEmbeddingEnrolled ? "#059669" : "#D97706",
                    fontWeight: 600,
                  },
                ]}
              >
                {data.subject.biometrics.faceEmbeddingEnrolled ? "Enrolled & Active" : "Pending Capture"}
              </Text>
            </View>
            <View style={[styles.tableRow, styles.tableRowAlt]}>
              <Text style={[styles.colText, { width: "35%" }]}>DNA Profile Index</Text>
              <Text style={[styles.colTextMuted, { width: "40%" }]}>
                {data.subject.biometrics.dnaProfileCode}
              </Text>
              <Text style={[styles.colText, { width: "25%", color: "#059669", fontWeight: 600 }]}>
                Verified
              </Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={[styles.colText, { width: "35%" }]}>Fingerprint Tenprint</Text>
              <Text style={[styles.colTextMuted, { width: "40%" }]}>
                AFIS Automated Ridge Scan
              </Text>
              <Text
                style={[
                  styles.colText,
                  {
                    width: "25%",
                    color: data.subject.biometrics.fingerprintUrl ? "#059669" : "#D97706",
                    fontWeight: 600,
                  },
                ]}
              >
                {data.subject.biometrics.fingerprintUrl ? "Scanned & Verified" : "Not Enrolled"}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Generated by {data.generatedBy.name} ({data.generatedBy.role}) · {data.generatedAt}
          </Text>
          <Text style={styles.footerText}>Page 1 of 2</Text>
        </View>
      </Page>

      {/* ─────────────────────────────────────────────────────────────
          PAGE 2: Judicial History, Case Linkages & Statutory Cert
          ───────────────────────────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <Text style={styles.headerLogoText}>FORENSIX · JUDICIAL & EVIDENCE REGISTER</Text>
          <Text style={styles.classificationBadge}>{data.classification}</Text>
        </View>

        {/* Linked Investigations Table */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Case Involvements</Text>
            <Text style={styles.sectionBadge}>{data.cases.length} Associated Cases</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colHeader, { width: "25%" }]}>Case Number</Text>
              <Text style={[styles.colHeader, { width: "40%" }]}>Case Title</Text>
              <Text style={[styles.colHeader, { width: "20%" }]}>Suspect Role</Text>
              <Text style={[styles.colHeader, { width: "15%" }]}>Status</Text>
            </View>
            {data.cases.length > 0 ? (
              data.cases.map((c, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.colText, { width: "25%", fontWeight: 600 }]}>
                    {c.caseNumber}
                  </Text>
                  <Text style={[styles.colTextMuted, { width: "40%" }]}>{c.title}</Text>
                  <Text style={[styles.colText, { width: "20%" }]}>{c.role}</Text>
                  <Text style={[styles.colText, { width: "15%", fontWeight: 600 }]}>
                    {c.status}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.colTextMuted, { width: "100%", textAlign: "center" }]}>
                  No active cases linked to this criminal profile.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Judicial Court Record & History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Judicial Records & Criminal Offenses</Text>
            <Text style={styles.sectionBadge}>{data.records.length} Recorded Entries</Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.colHeader, { width: "20%" }]}>Offense</Text>
              <Text style={[styles.colHeader, { width: "20%" }]}>Court Case</Text>
              <Text style={[styles.colHeader, { width: "18%" }]}>Date / Location</Text>
              <Text style={[styles.colHeader, { width: "22%" }]}>Court Jurisdiction</Text>
              <Text style={[styles.colHeader, { width: "20%" }]}>Outcome / Remand</Text>
            </View>
            {data.records.length > 0 ? (
              data.records.map((r, i) => (
                <View key={i} style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}>
                  <Text style={[styles.colText, { width: "20%", fontWeight: 600 }]}>
                    {r.offenceType}
                  </Text>
                  <Text style={[styles.colTextMuted, { width: "20%" }]}>{r.caseId}</Text>
                  <Text style={[styles.colTextMuted, { width: "18%" }]}>
                    {r.date}
                  </Text>
                  <Text style={[styles.colTextMuted, { width: "22%" }]}>{r.courtName}</Text>
                  <Text style={[styles.colText, { width: "20%", fontWeight: 600 }]}>
                    {r.outcome || r.status}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text style={[styles.colTextMuted, { width: "100%", textAlign: "center" }]}>
                  No previous convictions or court records filed.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Section 65B Electronic Certificate & Cryptographic Chain */}
        <View style={styles.certBox}>
          <Text style={styles.certTitle}>
            CERTIFICATE OF AUTHENTICITY UNDER SECTION 65B / BNSS
          </Text>
          <Text style={styles.certText}>
            I hereby certify that the electronic profile records and biometric indices contained in
            this dossier were produced by the Forensix Automated Intelligence Engine from authenticated
            PostgreSQL forensic ledgers. Each record has been cryptographically signed with sequential
            SHA-256 block hashing and tamper-evident Merkle validation.
          </Text>
          <View style={styles.certMetaRow}>
            <Text style={styles.certMetaLabel}>
              Custody Merkle Root: {data.custodyCertification.merkleRootHash.slice(0, 32)}...
            </Text>
            <Text style={styles.certMetaValue}>
              Signed Blocks: {data.custodyCertification.totalSignedBlocks} Validated
            </Text>
          </View>
          <View style={styles.certMetaRow}>
            <Text style={styles.certMetaLabel}>
              Certifying Officer: {data.generatedBy.name} ({data.generatedBy.badgeId || "REG-FORENSIX"})
            </Text>
            <Text style={styles.certMetaValue}>
              Certified: {data.custodyCertification.certifiedAt}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            CONFIDENTIAL · LAW ENFORCEMENT EXHIBIT · FORENSIX DOSSIER {data.dossierNumber}
          </Text>
          <Text style={styles.footerText}>Page 2 of 2</Text>
        </View>
      </Page>
    </Document>
  );
}
