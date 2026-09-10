import { Document, Page, View } from "@react-pdf/renderer";
import "./styles/reportFonts";
import { reportStyles } from "./styles/reportStyles";

import { ReportCover } from "./components/ReportCover";
import { ReportHeader } from "./components/ReportHeader";
import { ReportFooter } from "./components/ReportFooter";
import { CaseInformationSection } from "./components/CaseInformationSection";
import { InvestigationSummarySection } from "./components/InvestigationSummarySection";
import { EvidenceRegisterSection } from "./components/EvidenceRegisterSection";
import { EvidenceDetailsSection } from "./components/EvidenceDetailsSection";
import { WitnessSection } from "./components/WitnessSection";
import { SuspectsSection } from "./components/SuspectsSection";
import { RecognitionResultsSection } from "./components/RecognitionResultsSection";
import { ForensicSketchSection } from "./components/ForensicSketchSection";
import { IncidentMediaSection } from "./components/IncidentMediaSection";
import { InvestigationNotesSection } from "./components/InvestigationNotesSection";
import { ActivityTimelineSection } from "./components/ActivityTimelineSection";
import { FindingsSection } from "./components/FindingsSection";
import { ReportMetadataSection } from "./components/ReportMetadataSection";

import type { CaseReportData } from "../types";

export function CaseReportDocument({ data }: { data: CaseReportData }) {
  return (
    <Document
      title={`Case Investigation Report — ${data.case.caseNumber}`}
      author="Forensix Intelligence"
      subject={`Forensic Investigation Report for ${data.case.caseNumber}: ${data.case.title}`}
      creator="Forensix · Criminal Eye"
      keywords="forensic, investigation, case report, biometric, criminal eye"
    >
      {/* 1. Cover Page */}
      <Page size="A4" style={reportStyles.coverPage}>
        <ReportCover data={data} />
      </Page>

      {/* 2. Content Pages with Fixed Header and Repeating Footer */}
      <Page size="A4" style={reportStyles.page} wrap>
        <ReportHeader data={data} />

        {/* Chapter 1: Case Overview & Evidence Register */}
        <CaseInformationSection data={data} />
        <InvestigationSummarySection data={data} />
        <EvidenceRegisterSection data={data} />

        {/* Chapter 2: Technical Custody & Eyewitness Statements */}
        <View break>
          <EvidenceDetailsSection data={data} />
          {data.witnesses.length > 0 && <WitnessSection data={data} />}
        </View>

        {/* Chapter 3: Biometric Intelligence & Suspect Profiles */}
        {(data.suspects.length > 0 || data.recognitionResults.length > 0) && (
          <View break>
            {data.suspects.length > 0 && <SuspectsSection data={data} />}
            {data.recognitionResults.length > 0 && (
              <RecognitionResultsSection data={data} />
            )}
          </View>
        )}

        {/* Chapter 4: Visual Forensics & Surveillance Media */}
        {(data.sketches.length > 0 || data.media.length > 0) && (
          <View break>
            {data.sketches.length > 0 && <ForensicSketchSection data={data} />}
            {data.media.length > 0 && <IncidentMediaSection data={data} />}
          </View>
        )}

        {/* Chapter 5: Case Audit, Findings & Statutory Legal Record */}
        <View break>
          {data.notes.length > 0 && <InvestigationNotesSection data={data} />}
          {data.activity.length > 0 && <ActivityTimelineSection data={data} />}
          <FindingsSection data={data} />
          <ReportMetadataSection data={data} />
        </View>

        <ReportFooter data={data} />
      </Page>
    </Document>
  );
}
