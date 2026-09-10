import { Text, View } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function ActivityTimelineSection({ data }: { data: CaseReportData }) {
  if (!data.activity || data.activity.length === 0) return null;

  return (
    <View style={reportStyles.section} wrap={false}>
      <View style={reportStyles.sectionHeaderRow}>
        <Text style={reportStyles.sectionTitle}>11. AUDIT & ACTIVITY TIMELINE</Text>
        <Text style={reportStyles.sectionBadge}>IMMUTABLE LOG</Text>
      </View>

      <View style={reportStyles.table}>
        <View style={reportStyles.tableHeader}>
          <Text style={[reportStyles.tableHeaderCell, { width: "24%" }]}>TIMESTAMP</Text>
          <Text style={[reportStyles.tableHeaderCell, { width: "22%" }]}>OPERATOR</Text>
          <Text style={[reportStyles.tableHeaderCell, { width: "24%" }]}>ACTION</Text>
          <Text style={[reportStyles.tableHeaderCell, { width: "30%" }]}>DETAILS</Text>
        </View>

        {data.activity.map((act, idx) => {
          const isAlternate = idx % 2 === 1;
          return (
            <View
              key={act.id}
              style={[
                reportStyles.tableRow,
                isAlternate ? reportStyles.tableRowAlternate : {},
              ]}
              wrap={false}
            >
              <Text style={[reportStyles.tableCellMuted, { width: "24%", fontSize: 7 }]}>
                {act.createdAt}
              </Text>
              <Text style={[reportStyles.tableCellBold, { width: "22%" }]}>
                {act.actor}
              </Text>
              <Text style={[reportStyles.tableCell, { width: "24%", fontSize: 7.2 }]}>
                {act.action}
              </Text>
              <Text style={[reportStyles.tableCell, { width: "30%", fontSize: 7.2 }]}>
                {act.details}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
