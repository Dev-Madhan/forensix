import { Text, View } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function InvestigationSummarySection({ data }: { data: CaseReportData }) {
  return (
    <View style={reportStyles.section} wrap={false}>
      <View style={reportStyles.sectionHeaderRow}>
        <Text style={reportStyles.sectionTitle}>02. INVESTIGATION SUMMARY</Text>
        <Text style={reportStyles.sectionBadge}>NARRATIVE RECORD</Text>
      </View>

      <View style={reportStyles.card}>
        <Text style={reportStyles.narrativeLead}>
          {data.case.description || "No narrative summary recorded for this case."}
        </Text>
      </View>
    </View>
  );
}
