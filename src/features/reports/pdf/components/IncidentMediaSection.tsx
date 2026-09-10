import { Text, View, Image } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function IncidentMediaSection({ data }: { data: CaseReportData }) {
  if (!data.media || data.media.length === 0) return null;

  return (
    <View style={reportStyles.section} wrap={false}>
      <View style={reportStyles.sectionHeaderRow}>
        <Text style={reportStyles.sectionTitle}>09. INCIDENT MEDIA & SURVEILLANCE STILLS</Text>
        <Text style={reportStyles.sectionBadge}>{data.media.length} ATTACHED</Text>
      </View>

      {data.media.map((mediaItem, idx) => (
        <View key={mediaItem.id} style={reportStyles.card} wrap={false}>
          <Text style={{ fontSize: 8.5, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
            Figure {idx + 1}. {mediaItem.title}
          </Text>

          {mediaItem.url ? (
            <View style={[reportStyles.imageContainer, { width: "100%", height: 135 }]}>
              <Image
                src={mediaItem.url}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </View>
          ) : (
            <View style={[reportStyles.cardSurface, { height: 50, justifyContent: "center", alignItems: "center" }]}>
              <Text style={reportStyles.tableCellMuted}>Media file stored in secure cold vault.</Text>
            </View>
          )}

          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }}>
            <Text style={[reportStyles.caption, { flex: 1, paddingRight: 8, marginTop: 0 }]}>
              {mediaItem.caption}
            </Text>
            <Text style={{ fontSize: 7, color: "#9CA3AF" }}>
              Captured: {mediaItem.timestamp}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}
