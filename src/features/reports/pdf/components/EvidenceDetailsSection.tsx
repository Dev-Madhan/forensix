import { Text, View } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

function EvidenceCard({ item }: { item: CaseReportData["evidence"][0] }) {
  return (
    <View style={reportStyles.cardSurface} wrap={false}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 8.2, fontWeight: 700, color: "#111827" }}>
          {item.id} — {item.name}
        </Text>
        <Text style={[reportStyles.statusPill, reportStyles.statusPillClosed]}>
          {item.status}
        </Text>
      </View>

      <View style={reportStyles.gridTwoCol}>
        <View style={reportStyles.colHalf}>
          <View style={reportStyles.row}>
            <Text style={reportStyles.label}>File Size:</Text>
            <Text style={reportStyles.value}>{item.fileSize}</Text>
          </View>
          <View style={reportStyles.row}>
            <Text style={reportStyles.label}>Date Added:</Text>
            <Text style={reportStyles.value}>{item.capturedAt}</Text>
          </View>
          <View style={reportStyles.row}>
            <Text style={reportStyles.label}>Evidence Type:</Text>
            <Text style={reportStyles.value}>{item.type}</Text>
          </View>
        </View>

        <View style={reportStyles.colHalf}>
          <View style={reportStyles.row}>
            <Text style={reportStyles.label}>SHA-256 Hash:</Text>
            <Text style={[reportStyles.value, { fontSize: 6.8, fontFamily: "Inter" }]}>
              {item.sha256Hash}
            </Text>
          </View>
          {item.aiScore && (
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>AI Analysis:</Text>
              <Text style={[reportStyles.valueBold, { color: "#15803D" }]}>
                {item.aiScore}% Match Confidence
              </Text>
            </View>
          )}
        </View>
      </View>

      {item.description && (
        <View style={{ marginTop: 3, paddingTop: 3, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
          <Text style={{ fontSize: 7.2, color: "#4B5563", lineHeight: 1.3 }}>
            {item.description}
          </Text>
        </View>
      )}
    </View>
  );
}

export function EvidenceDetailsSection({ data }: { data: CaseReportData }) {
  if (!data.evidence || data.evidence.length === 0) return null;

  const primaryEvidence = data.evidence.slice(0, 3);
  const firstItem = primaryEvidence[0];
  const remainingItems = primaryEvidence.slice(1);

  return (
    <View style={reportStyles.section}>
      {/* Header and First Item bound together to guarantee no orphan header */}
      <View wrap={false}>
        <View style={reportStyles.sectionHeaderRow}>
          <Text style={reportStyles.sectionTitle}>04. EVIDENCE TECHNICAL DETAILS</Text>
          <Text style={reportStyles.sectionBadge}>CHAIN OF CUSTODY</Text>
        </View>

        {firstItem && <EvidenceCard item={firstItem} />}
      </View>

      {/* Remaining cards each wrap independently without breaking internally */}
      {remainingItems.map((item) => (
        <EvidenceCard key={`detail-${item.id}`} item={item} />
      ))}
    </View>
  );
}
