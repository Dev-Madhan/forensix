export interface CriminalItem {
  id: string;
  criminalId: string;
  firstName: string;
  lastName: string;
  alias: string | null;
  dateOfBirth: string;
  age: number;
  gender: string;
  nationality: string;
  status: "Active" | "Inactive" | "Wanted" | "In Custody" | "Under Surveillance";
  riskLevel: "High" | "Medium" | "Low";
  crimeCategories: string[];
  linkedCases: number;
  lastKnownLocation: string;
  mugshotUrl: string | null;
  height: string;
  weight: string;
  build: string;
  hairColor: string;
  eyeColor: string;
  complexion: string;
  distinctiveMarks: string;
  aliases: string[];
}
