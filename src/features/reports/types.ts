export interface CaseReportData {
  report: {
    id: string;
    version: string;
    generatedAt: string;
    generatedBy: string;
    classification: string;
    logoUrl?: string | null;
    fileHash?: string;
  };

  case: {
    id: string;
    caseNumber: string;
    title: string;
    type: string;
    status: string;
    priority: string;
    location: string;
    dateReported: string;
    timeOfIncident: string;
    description: string;
    assignedTo: string;
    assignedToEmail: string;
    createdBy: string;
    lastUpdated: string;
  };

  evidence: Array<{
    id: string;
    name: string;
    type: string;
    source: string;
    description: string;
    status: string;
    capturedAt: string;
    fileUrl: string | null;
    fileSize: string;
    sha256Hash: string;
    aiScore?: number;
    aiFindings?: string;
  }>;

  witnesses: Array<{
    id: string;
    name: string;
    contactInfo: string;
    statement: string;
    recordedAt: string;
  }>;

  suspects: Array<{
    id: string;
    displayName: string;
    alias: string;
    status: string;
    role: string;
    matchScore: number | null;
    notes: string;
    mugshotUrl: string | null;
  }>;

  recognitionResults: Array<{
    id: string;
    rank: number;
    candidateId: string;
    candidateName: string;
    similarity: number;
    status: string;
    reasoning: string;
    createdAt: string;
  }>;

  sketches: Array<{
    id: string;
    generationId: string;
    imageUrl: string | null;
    promptAttributes: string;
    status: string;
    generatedAt: string;
    witnessReference: string;
  }>;

  media: Array<{
    id: string;
    title: string;
    type: string;
    url: string;
    caption: string;
    timestamp: string;
  }>;

  notes: Array<{
    id: string;
    author: string;
    content: string;
    createdAt: string;
  }>;

  activity: Array<{
    id: string;
    actor: string;
    action: string;
    details: string;
    createdAt: string;
  }>;

  findings: {
    summary: string;
    humanVerificationStatus: string;
    investigativeStatus: string;
    outstandingActions: string;
  };
}
