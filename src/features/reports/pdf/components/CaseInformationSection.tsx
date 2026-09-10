import { Text, View } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function CaseInformationSection({ data }: { data: CaseReportData }) {
  return (
    <View style={reportStyles.section} wrap={false}>
      <View style={reportStyles.sectionHeaderRow}>
        <Text style={reportStyles.sectionTitle}>01. CASE INFORMATION</Text>
        <Text style={reportStyles.sectionBadge}>GENERAL RECORD</Text>
      </View>

      <View style={reportStyles.card}>
        <View style={reportStyles.gridTwoCol}>
          {/* Column 1 */}
          <View style={reportStyles.colHalf}>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Case ID:</Text>
              <Text style={reportStyles.valueBold}>{data.case.caseNumber}</Text>
            </View>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Case Title:</Text>
              <Text style={reportStyles.value}>{data.case.title}</Text>
            </View>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Case Type:</Text>
              <Text style={reportStyles.value}>{data.case.type}</Text>
            </View>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Status:</Text>
              <Text
                style={[
                  reportStyles.statusPill,
                  data.case.status.toLowerCase().includes("open")
                    ? reportStyles.statusPillOpen
                    : data.case.status.toLowerCase().includes("closed")
                    ? reportStyles.statusPillClosed
                    : reportStyles.statusPillActive,
                ]}
              >
                {data.case.status}
              </Text>
            </View>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Priority:</Text>
              <Text style={reportStyles.valueBold}>{data.case.priority}</Text>
            </View>
          </View>

          {/* Column 2 */}
          <View style={reportStyles.colHalf}>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Incident Location:</Text>
              <Text style={reportStyles.value}>{data.case.location}</Text>
            </View>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Date Reported:</Text>
              <Text style={reportStyles.value}>{data.case.dateReported}</Text>
            </View>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Time of Incident:</Text>
              <Text style={reportStyles.value}>{data.case.timeOfIncident}</Text>
            </View>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Lead Officer:</Text>
              <Text style={reportStyles.valueBold}>{data.case.assignedTo}</Text>
            </View>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Last Updated:</Text>
              <Text style={reportStyles.value}>{data.case.lastUpdated}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
