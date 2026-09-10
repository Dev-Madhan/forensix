import { Text, View, Image } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

export function ForensicSketchSection({ data }: { data: CaseReportData }) {
  if (!data.sketches || data.sketches.length === 0) return null;

  const primarySketch = data.sketches[0];

  return (
    <View style={reportStyles.section} wrap={false}>
      <View style={reportStyles.sectionHeaderRow}>
        <Text style={reportStyles.sectionTitle}>08. FORENSIC COMPOSITE SKETCH</Text>
        <Text style={reportStyles.sectionBadge}>AI-ASSISTED SYNTHESIS</Text>
      </View>

      <View style={reportStyles.card}>
        <Text style={{ fontSize: 7.8, color: "#4B5563", marginBottom: 3, textAlign: "center" }}>
          Synthesized from eyewitness facial landmark descriptions ({primarySketch.witnessReference})
        </Text>

        {primarySketch.imageUrl && (
          <View style={{ alignSelf: "center", marginVertical: 3 }}>
            <Image
              src={primarySketch.imageUrl}
              style={{
                width: 140,
                height: 165,
                objectFit: "contain",
                borderRadius: 4,
                borderWidth: 1,
                borderColor: "#E5E7EB",
              }}
            />
          </View>
        )}

        <View style={[reportStyles.gridTwoCol, { marginTop: 4, borderTopWidth: 1, borderTopColor: "#E5E7EB", paddingTop: 4 }]}>
          <View style={reportStyles.colHalf}>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Generation ID:</Text>
              <Text style={reportStyles.valueBold}>{primarySketch.generationId}</Text>
            </View>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Synthesized:</Text>
              <Text style={reportStyles.value}>{primarySketch.generatedAt}</Text>
            </View>
          </View>

          <View style={reportStyles.colHalf}>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Review Status:</Text>
              <Text style={[reportStyles.valueBold, { color: "#4F46E5" }]}>{primarySketch.status}</Text>
            </View>
            <View style={reportStyles.row}>
              <Text style={reportStyles.label}>Witness Basis:</Text>
              <Text style={reportStyles.value}>{primarySketch.witnessReference}</Text>
            </View>
          </View>
        </View>

        {primarySketch.promptAttributes && (
          <View style={{ marginTop: 3, backgroundColor: "#F9FAFB", padding: 4, borderRadius: 3 }}>
            <Text style={{ fontSize: 6.8, color: "#6B7280" }}>
              Feature Prompt: {primarySketch.promptAttributes}
            </Text>
          </View>
        )}
      </View>

      <View style={reportStyles.warning} wrap={false}>
        <Text style={reportStyles.warningTitle}>FORENSIC SKETCH NOTICE</Text>
        <Text style={reportStyles.warningText}>
          AI-generated forensic sketches are investigative aids derived from cognitive interview recollections. They are intended for directional inquiry and must not be treated as conclusive biometric evidence or sole proof of identity.
        </Text>
      </View>
    </View>
  );
}
