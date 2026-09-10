import { Text, View } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

function WitnessCard({ witness }: { witness: CaseReportData["witnesses"][0] }) {
  return (
    <View style={reportStyles.cardSurface} wrap={false}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <View>
          <Text style={{ fontSize: 8.5, fontWeight: 700, color: "#111827" }}>
            {witness.id} — {witness.name}
          </Text>
          <Text style={{ fontSize: 7, color: "#6B7280", marginTop: 1 }}>
            Contact: {witness.contactInfo}
          </Text>
        </View>
        <Text style={{ fontSize: 7, color: "#6B7280" }}>
          {witness.recordedAt}
        </Text>
      </View>

      <View style={{ marginTop: 3, paddingTop: 4, borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
        <Text style={reportStyles.narrative}>
          &ldquo;{witness.statement}&rdquo;
        </Text>
      </View>
    </View>
  );
}

export function WitnessSection({ data }: { data: CaseReportData }) {
  if (!data.witnesses || data.witnesses.length === 0) return null;

  const firstWitness = data.witnesses[0];
  const remainingWitnesses = data.witnesses.slice(1);

  return (
    <View style={reportStyles.section}>
      {/* Header and First Witness Statement bound together to guarantee no orphan header */}
      <View wrap={false}>
        <View style={reportStyles.sectionHeaderRow}>
          <Text style={reportStyles.sectionTitle}>05. WITNESS STATEMENTS</Text>
          <Text style={reportStyles.sectionBadge}>{data.witnesses.length} RECORDED</Text>
        </View>

        {firstWitness && <WitnessCard witness={firstWitness} />}
      </View>

      {remainingWitnesses.map((witness) => (
        <WitnessCard key={witness.id} witness={witness} />
      ))}
    </View>
  );
}
