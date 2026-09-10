import { Text, View, Image } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

function SuspectCard({ suspect }: { suspect: CaseReportData["suspects"][0] }) {
  return (
    <View style={reportStyles.cardSurface} wrap={false}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {suspect.mugshotUrl && (
          <View style={[reportStyles.imageContainer, { width: 50, height: 60 }]}>
            <Image
              src={suspect.mugshotUrl}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </View>
        )}

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
            <View>
              <Text style={{ fontSize: 9, fontWeight: 700, color: "#111827" }}>
                {suspect.displayName}
              </Text>
              <Text style={{ fontSize: 7, color: "#6B7280", marginTop: 1 }}>
                {suspect.alias} · ID: {suspect.id}
              </Text>
            </View>

            <Text
              style={[
                reportStyles.statusPill,
                suspect.status.toLowerCase().includes("primary")
                  ? { backgroundColor: "#FEE2E2", color: "#B91C1C" }
                  : reportStyles.statusPillActive,
              ]}
            >
              {suspect.status}
            </Text>
          </View>

          <View style={{ flexDirection: "row", gap: 14, marginTop: 4 }}>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <Text style={{ fontSize: 7.2, color: "#6B7280", fontWeight: 600 }}>Role:</Text>
              <Text style={{ fontSize: 7.2, color: "#111827" }}>{suspect.role}</Text>
            </View>
            {suspect.matchScore && (
              <View style={{ flexDirection: "row", gap: 4 }}>
                <Text style={{ fontSize: 7.2, color: "#6B7280", fontWeight: 600 }}>Confidence:</Text>
                <Text style={{ fontSize: 7.2, color: "#15803D", fontWeight: 700 }}>{suspect.matchScore}%</Text>
              </View>
            )}
          </View>

          {suspect.notes && (
            <Text style={{ fontSize: 7.2, color: "#4B5563", marginTop: 3, lineHeight: 1.3 }}>
              {suspect.notes}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

export function SuspectsSection({ data }: { data: CaseReportData }) {
  if (!data.suspects || data.suspects.length === 0) return null;

  const firstSuspect = data.suspects[0];
  const remainingSuspects = data.suspects.slice(1);

  return (
    <View style={reportStyles.section}>
      {/* Header and First Suspect bound together to guarantee no orphan header */}
      <View wrap={false}>
        <View style={reportStyles.sectionHeaderRow}>
          <Text style={reportStyles.sectionTitle}>06. PERSONS OF INTEREST / SUSPECT REGISTER</Text>
          <Text style={reportStyles.sectionBadge}>{data.suspects.length} IDENTIFIED</Text>
        </View>

        {firstSuspect && <SuspectCard suspect={firstSuspect} />}
      </View>

      {remainingSuspects.map((suspect) => (
        <SuspectCard key={suspect.id} suspect={suspect} />
      ))}

      <View style={reportStyles.noticeBox} wrap={false}>
        <Text style={reportStyles.noticeText}>
          Investigative Note: Listing in this register indicates investigative relevance or computational biometric correlation. It does not establish guilt or legal determination.
        </Text>
      </View>
    </View>
  );
}
