export interface CriminalDossierData {
  dossierNumber: string;
  generatedAt: string;
  generatedBy: {
    name: string;
    badgeId?: string;
    role: string;
  };
  classification: "LAW ENFORCEMENT SENSITIVE" | "CONFIDENTIAL" | "COURT EXHIBIT";
  subject: {
    id: string;
    criminalId: string;
    fullName: string;
    firstName: string;
    lastName: string;
    aliases: string[];
    mugshotUrl: string | null;
    status: string;
    riskLevel: string;
    watchlistStatus: string;
    dateOfBirth: string | null;
    age: number | string;
    gender: string;
    nationality: string;
    lastKnownLocation: string;
    address: string;
    demographics: {
      height?: string;
      weight?: string;
      bloodGroup?: string;
      eyeColor?: string;
      hairColor?: string;
      identifyingMarks?: string;
      occupation?: string;
    };
    biometrics: {
      faceEmbeddingEnrolled: boolean;
      faceEmbeddingId?: string | null;
      dnaProfileCode: string;
      fingerprintUrl: string | null;
    };
  };
  cases: Array<{
    caseNumber: string;
    title: string;
    status: string;
    role: string;
    matchConfidence: number;
    notes?: string | null;
    addedAt: string;
  }>;
  records: Array<{
    caseId: string;
    offenceType: string;
    description: string;
    date: string;
    location: string;
    courtName: string;
    status: string;
    outcome: string | null;
    sentenceDetails: string | null;
  }>;
  evidences: Array<{
    title: string;
    category: string;
    fileName: string;
    fileSize: string;
    sha256Hash: string;
    uploadedAt: string;
  }>;
  surveillanceHits: Array<{
    sensorId: string;
    sensorName: string;
    location: string;
    confidence: number;
    timestamp: string;
    status: string;
  }>;
  custodyCertification: {
    merkleRootHash: string;
    totalSignedBlocks: number;
    statutoryAct: string;
    certifiedAt: string;
  };
}
