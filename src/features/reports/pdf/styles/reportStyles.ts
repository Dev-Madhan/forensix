import { StyleSheet } from "@react-pdf/renderer";
import { reportTheme } from "./reportTheme";

export const reportStyles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: "Inter",
    fontSize: 8.5,
    color: reportTheme.colors.text,
    backgroundColor: reportTheme.colors.background,
  },

  // --- Header ---
  header: {
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: reportTheme.colors.borderStrong,
  },

  brandRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  brand: {
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 1.4,
    color: reportTheme.colors.accent,
  },

  classificationBadge: {
    fontSize: 6.5,
    fontWeight: 700,
    letterSpacing: 0.8,
    color: "#B91C1C",
    backgroundColor: "#FEE2E2",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
  },

  reportTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: 700,
    color: reportTheme.colors.text,
  },

  reportSubtitle: {
    marginTop: 2,
    fontSize: 8,
    color: reportTheme.colors.textMuted,
  },

  // --- Sections ---
  section: {
    marginTop: 8,
  },

  sectionFirst: {
    marginTop: 4,
  },

  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },

  sectionTitle: {
    fontSize: 9.5,
    fontWeight: 700,
    letterSpacing: 0.3,
    color: reportTheme.colors.text,
  },

  sectionBadge: {
    fontSize: 6.5,
    fontWeight: 600,
    color: reportTheme.colors.accent,
    backgroundColor: reportTheme.colors.accentSoft,
    paddingVertical: 1.5,
    paddingHorizontal: 4,
    borderRadius: 3,
  },

  // --- Cards & Grid ---
  card: {
    padding: 8,
    borderWidth: 1,
    borderColor: reportTheme.colors.border,
    borderRadius: 4,
    backgroundColor: reportTheme.colors.background,
  },

  cardSurface: {
    padding: 7,
    borderWidth: 1,
    borderColor: reportTheme.colors.border,
    borderRadius: 4,
    backgroundColor: reportTheme.colors.surface,
    marginBottom: 5,
  },

  gridTwoCol: {
    flexDirection: "row",
    gap: 12,
  },

  colHalf: {
    width: "50%",
  },

  row: {
    flexDirection: "row",
    marginBottom: 4,
    alignItems: "flex-start",
  },

  label: {
    width: "35%",
    fontSize: 8,
    fontWeight: 600,
    color: reportTheme.colors.textMuted,
  },

  value: {
    width: "65%",
    fontSize: 8.5,
    fontWeight: 500,
    color: reportTheme.colors.text,
  },

  valueBold: {
    width: "65%",
    fontSize: 8.5,
    fontWeight: 700,
    color: reportTheme.colors.text,
  },

  narrative: {
    fontFamily: "Source Serif 4",
    fontSize: 9,
    lineHeight: 1.5,
    color: "#374151",
  },

  narrativeLead: {
    fontFamily: "Source Serif 4",
    fontSize: 9.5,
    lineHeight: 1.55,
    color: reportTheme.colors.text,
  },

  // --- Tables ---
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: reportTheme.colors.border,
    borderRadius: 4,
    overflow: "hidden",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderBottomWidth: 1,
    borderBottomColor: reportTheme.colors.borderStrong,
    paddingVertical: 5,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  tableHeaderCell: {
    fontSize: 7.5,
    fontWeight: 700,
    color: reportTheme.colors.textSecondary,
    letterSpacing: 0.3,
  },

  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: reportTheme.colors.border,
    paddingVertical: 4.5,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  tableRowAlternate: {
    backgroundColor: "#F9FAFB",
  },

  tableCell: {
    fontSize: 8,
    color: "#374151",
  },

  tableCellBold: {
    fontSize: 8,
    fontWeight: 600,
    color: reportTheme.colors.text,
  },

  tableCellMuted: {
    fontSize: 7.5,
    color: reportTheme.colors.textMuted,
  },

  // --- Status Pills ---
  statusPill: {
    fontSize: 7,
    fontWeight: 600,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    alignSelf: "flex-start",
  },

  statusPillOpen: {
    backgroundColor: "#EFF6FF",
    color: "#1D4ED8",
  },

  statusPillActive: {
    backgroundColor: "#F5F3FF",
    color: "#6D28D9",
  },

  statusPillClosed: {
    backgroundColor: "#ECFDF5",
    color: "#047857",
  },

  // --- Images and Media ---
  imageContainer: {
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: reportTheme.colors.border,
    backgroundColor: "#F9FAFB",
  },

  caption: {
    marginTop: 5,
    fontSize: 7.5,
    lineHeight: 1.35,
    color: reportTheme.colors.textMuted,
  },

  // --- Callouts & Alerts ---
  noticeBox: {
    padding: 7,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#F9FAFB",
    borderRadius: 4,
    marginTop: 6,
  },

  noticeText: {
    fontSize: 7.2,
    lineHeight: 1.4,
    color: "#4B5563",
  },

  warning: {
    padding: 7,
    borderWidth: 1,
    borderColor: "#FCD34D",
    backgroundColor: "#FFFBEB",
    borderRadius: 4,
    marginTop: 6,
  },

  warningTitle: {
    fontSize: 7.5,
    fontWeight: 700,
    color: "#92400E",
    marginBottom: 2,
  },

  warningText: {
    fontSize: 7.2,
    lineHeight: 1.4,
    color: "#92400E",
  },

  // --- Footer ---
  footer: {
    position: "absolute",
    bottom: 18,
    left: 40,
    right: 40,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: reportTheme.colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerText: {
    fontSize: 7,
    color: "#9CA3AF",
  },

  // --- Cover Page Specific ---
  coverPage: {
    paddingTop: 72,
    paddingBottom: 64,
    paddingHorizontal: 54,
    fontFamily: "Inter",
    fontSize: 9,
    color: reportTheme.colors.text,
    backgroundColor: reportTheme.colors.background,
    justifyContent: "space-between",
  },

  coverHeader: {
    marginBottom: 40,
  },

  coverAgencyLogo: {
    width: 64,
    height: 64,
    marginBottom: 16,
  },

  coverAgencyName: {
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 2,
    color: reportTheme.colors.accent,
    marginBottom: 6,
  },

  coverDocType: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1.2,
    color: reportTheme.colors.textMuted,
  },

  coverBody: {
    marginVertical: "auto",
  },

  coverCaseIdBadge: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1,
    color: reportTheme.colors.accent,
    backgroundColor: reportTheme.colors.accentSoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: "flex-start",
    marginBottom: 14,
  },

  coverCaseTitle: {
    fontSize: 26,
    fontWeight: 700,
    color: reportTheme.colors.text,
    lineHeight: 1.2,
    marginBottom: 12,
  },

  coverDivider: {
    width: "100%",
    height: 2,
    backgroundColor: reportTheme.colors.accent,
    marginVertical: 18,
  },

  coverMetadataTable: {
    marginTop: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: reportTheme.colors.border,
  },

  coverFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: reportTheme.colors.borderStrong,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },

  coverNotice: {
    width: "70%",
    fontSize: 7,
    lineHeight: 1.4,
    color: reportTheme.colors.textMuted,
  },
});
