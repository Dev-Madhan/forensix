import { Text, View } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function ReportHeader({ data }: { data: CaseReportData }) {
  return (
    <View fixed style={reportStyles.header}>
      <View style={reportStyles.brandRow}>
        <Text style={reportStyles.brand}>FORENSIX · CRIMINAL EYE INTELLIGENCE</Text>
        <Text style={reportStyles.classificationBadge}>CONFIDENTIAL RECORD</Text>
      </View>

      <Text style={reportStyles.reportTitle}>Case Investigation Report</Text>

      <Text style={reportStyles.reportSubtitle}>
        Case ID: {data.case.caseNumber} · Title: {data.case.title} · Report Version {data.report.version}
      </Text>
    </View>
  );
}
