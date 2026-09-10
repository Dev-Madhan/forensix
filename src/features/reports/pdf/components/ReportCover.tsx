import { Text, View, Image } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function ReportCover({ data }: { data: CaseReportData }) {
  return (
    <View style={{ flex: 1, justifyContent: "space-between" }}>
      {/* Top Header */}
      <View style={reportStyles.coverHeader}>
        {data.report.logoUrl && (
          <Image
            src={data.report.logoUrl}
            style={{ width: 44, height: 44, marginBottom: 12 }}
          />
        )}
        <Text style={reportStyles.coverAgencyName}>FORENSIX · CRIMINAL EYE</Text>
        <Text style={reportStyles.coverDocType}>FORENSIC CASE INVESTIGATION RECORD</Text>
      </View>

      {/* Center Body */}
      <View style={reportStyles.coverBody}>
        <Text style={reportStyles.coverCaseIdBadge}>CASE FILE: {data.case.caseNumber}</Text>
        <Text style={reportStyles.coverCaseTitle}>{data.case.title}</Text>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <Text
            style={[
              reportStyles.statusPill,
              data.case.status.toLowerCase().includes("open")
                ? reportStyles.statusPillOpen
                : data.case.status.toLowerCase().includes("closed")
                ? reportStyles.statusPillClosed
                : reportStyles.statusPillActive,
              { fontSize: 8.5, paddingVertical: 3, paddingHorizontal: 8 },
            ]}
          >
            STATUS: {data.case.status.toUpperCase()}
          </Text>

          <Text
            style={[
              reportStyles.statusPill,
              { backgroundColor: "#FEF3C7", color: "#92400E", fontSize: 8.5, paddingVertical: 3, paddingHorizontal: 8 },
            ]}
          >
            PRIORITY: {data.case.priority.toUpperCase()}
          </Text>
        </View>

        <View style={reportStyles.coverDivider} />

        <View style={reportStyles.coverMetadataTable}>
          <View style={reportStyles.row}>
            <Text style={reportStyles.label}>Incident Location:</Text>
            <Text style={reportStyles.valueBold}>{data.case.location}</Text>
          </View>
          <View style={reportStyles.row}>
            <Text style={reportStyles.label}>Date Reported:</Text>
            <Text style={reportStyles.value}>{data.case.dateReported}</Text>
          </View>
          <View style={reportStyles.row}>
            <Text style={reportStyles.label}>Incident Timestamp:</Text>
            <Text style={reportStyles.value}>{data.case.timeOfIncident}</Text>
          </View>
          <View style={reportStyles.row}>
            <Text style={reportStyles.label}>Lead Investigator:</Text>
            <Text style={reportStyles.valueBold}>{data.case.assignedTo} ({data.case.assignedToEmail})</Text>
          </View>
          <View style={reportStyles.row}>
            <Text style={reportStyles.label}>Report Version:</Text>
            <Text style={reportStyles.value}>{data.report.version}</Text>
          </View>
          <View style={reportStyles.row}>
            <Text style={reportStyles.label}>Generation Timestamp:</Text>
            <Text style={reportStyles.value}>{data.report.generatedAt}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Confidentiality Block */}
      <View style={reportStyles.coverFooter}>
        <View style={reportStyles.coverNotice}>
          <Text style={{ fontSize: 7.5, fontWeight: 700, color: "#111827", marginBottom: 3 }}>
            RESTRICTED DISCLOSURE NOTICE
          </Text>
          <Text style={{ fontSize: 6.8, lineHeight: 1.35, color: "#6B7280" }}>
            This forensic report contains sensitive investigative data, biometric similarity analyses, and eyewitness statements. Unauthorized reproduction, distribution, or handling outside authorized law enforcement channels is strictly prohibited.
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontSize: 7, fontWeight: 600, color: "#4F46E5" }}>FORENSIX OS v2.4</Text>
          <Text style={{ fontSize: 6.5, color: "#9CA3AF", marginTop: 2 }}>SECURITY TIER: LEVEL 3</Text>
        </View>
      </View>
    </View>
  );
}
