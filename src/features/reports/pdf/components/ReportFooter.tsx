import { Text, View } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function ReportFooter({ data }: { data: CaseReportData }) {
  return (
    <View fixed style={reportStyles.footer}>
      <Text style={reportStyles.footerText}>
        Forensix · Confidential Forensic Investigation Record · {data.case.caseNumber}
      </Text>

      <Text
        style={reportStyles.footerText}
        render={({ pageNumber, totalPages }) =>
          `Page ${pageNumber} of ${totalPages}`
        }
      />
    </View>
  );
}
