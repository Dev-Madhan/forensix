import { Text, View } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function EvidenceRegisterSection({ data }: { data: CaseReportData }) {
  if (!data.evidence || data.evidence.length === 0) {
    return (
      <View style={reportStyles.section} wrap={false}>
        <View style={reportStyles.sectionHeaderRow}>
          <Text style={reportStyles.sectionTitle}>03. EVIDENCE REGISTER</Text>
          <Text style={reportStyles.sectionBadge}>0 ITEMS</Text>
        </View>
        <View style={reportStyles.card}>
          <Text style={reportStyles.tableCellMuted}>No evidence records cataloged for this case.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={reportStyles.section} wrap={false}>
      <View style={reportStyles.sectionHeaderRow}>
        <Text style={reportStyles.sectionTitle}>03. EVIDENCE REGISTER</Text>
        <Text style={reportStyles.sectionBadge}>{data.evidence.length} CATALOGED</Text>
      </View>

      <View style={reportStyles.table}>
        {/* Table Header */}
        <View style={reportStyles.tableHeader}>
          <Text style={[reportStyles.tableHeaderCell, { width: "18%" }]}>ID</Text>
          <Text style={[reportStyles.tableHeaderCell, { width: "42%" }]}>EVIDENCE ITEM</Text>
          <Text style={[reportStyles.tableHeaderCell, { width: "20%" }]}>TYPE</Text>
          <Text style={[reportStyles.tableHeaderCell, { width: "20%" }]}>STATUS</Text>
        </View>

        {/* Table Rows */}
        {data.evidence.map((item, idx) => {
          const isAlternate = idx % 2 === 1;
          return (
            <View
              key={item.id}
              style={[
                reportStyles.tableRow,
                isAlternate ? reportStyles.tableRowAlternate : {},
              ]}
              wrap={false}
            >
              <Text style={[reportStyles.tableCellBold, { width: "18%" }]}>
                {item.id}
              </Text>
              <View style={{ width: "42%", paddingRight: 6 }}>
                <Text style={reportStyles.tableCellBold}>{item.name}</Text>
                <Text style={reportStyles.tableCellMuted}>{item.source}</Text>
              </View>
              <Text style={[reportStyles.tableCell, { width: "20%" }]}>
                {item.type}
              </Text>
              <View style={{ width: "20%" }}>
                <Text
                  style={[
                    reportStyles.statusPill,
                    item.status.toLowerCase().includes("verified")
                      ? reportStyles.statusPillClosed
                      : reportStyles.statusPillActive,
                  ]}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
