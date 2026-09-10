import { Text, View } from "@react-pdf/renderer";
import { reportStyles } from "../styles/reportStyles";
import type { CaseReportData } from "../../types";

function NoteCard({ note }: { note: CaseReportData["notes"][0] }) {
  return (
    <View style={reportStyles.cardSurface} wrap={false}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
        <Text style={{ fontSize: 8.2, fontWeight: 700, color: "#111827" }}>
          Officer: {note.author}
        </Text>
        <Text style={{ fontSize: 7, color: "#6B7280" }}>
          {note.createdAt}
        </Text>
      </View>
      <Text style={{ fontSize: 7.5, color: "#374151", lineHeight: 1.4 }}>
        {note.content}
      </Text>
    </View>
  );
}

export function InvestigationNotesSection({ data }: { data: CaseReportData }) {
  if (!data.notes || data.notes.length === 0) return null;

  const firstNote = data.notes[0];
  const remainingNotes = data.notes.slice(1);

  return (
    <View style={reportStyles.section}>
      {/* Header and First Note bound together to guarantee no orphan header */}
      <View wrap={false}>
        <View style={reportStyles.sectionHeaderRow}>
          <Text style={reportStyles.sectionTitle}>10. INVESTIGATOR CASE LOGS & NOTES</Text>
          <Text style={reportStyles.sectionBadge}>{data.notes.length} ENTRIES</Text>
        </View>

        {firstNote && <NoteCard note={firstNote} />}
      </View>

      {remainingNotes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </View>
  );
}
