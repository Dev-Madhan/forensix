import { Text, View } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function FindingsSection({ data }: { data: CaseReportData }) {
  return (
    <View style={reportStyles.section} wrap={false}>
      <View style={reportStyles.sectionHeaderRow}>
        <Text style={reportStyles.sectionTitle}>12. INVESTIGATION FINDINGS & NEXT ACTIONS</Text>
        <Text style={reportStyles.sectionBadge}>STATUS ASSESSMENT</Text>
      </View>

      <View style={reportStyles.card}>
        <Text style={reportStyles.narrativeLead}>
          {data.findings.summary}
        </Text>

        <View style={{ marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
          <View style={reportStyles.gridTwoCol}>
            <View style={reportStyles.colHalf}>
              <View style={reportStyles.row}>
                <Text style={reportStyles.label}>Case Status:</Text>
                <Text style={reportStyles.valueBold}>{data.findings.investigativeStatus}</Text>
              </View>
            </View>

            <View style={reportStyles.colHalf}>
              <View style={reportStyles.row}>
                <Text style={reportStyles.label}>Verification:</Text>
                <Text style={[reportStyles.valueBold, { color: "#B45309" }]}>
                  {data.findings.humanVerificationStatus}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {data.findings.outstandingActions && (
          <View style={{ marginTop: 8, backgroundColor: "#F8FAFC", padding: 8, borderRadius: 4 }}>
            <Text style={{ fontSize: 8, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
              RECOMMENDED OUTSTANDING ACTIONS
            </Text>
            <Text style={{ fontSize: 7.8, color: "#4B5563", lineHeight: 1.45 }}>
              {data.findings.outstandingActions}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
