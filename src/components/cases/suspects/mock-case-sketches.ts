import type { SuspectStatus, SuspectRole } from "./types";

export interface CaseSketchMatchCandidate {
  id: string;
  criminalId: string;
  name: string;
  alias: string;
  photo: string;
  matchConfidence: number;
  recommendedStatus: SuspectStatus;
  recommendedRole: SuspectRole;
  llmReasoning: string;
  priorCases: string;
  dob?: string;
  age?: number;
  gender?: string;
  height?: string;
  build?: string;
  complexion?: string;
  hairColor?: string;
  eyeColor?: string;
  identifyingMarks?: string;
  phone?: string;
  knownAddresses?: string;
}

export interface CaseSketchReference {
  id: string;
  sketchNumber: string;
  witnessStatementRef: string;
  dateGenerated: string;
  sketchImageUrl: string;
  witnessDescription: string;
  candidates: CaseSketchMatchCandidate[];
}

export const MOCK_CASE_SKETCHES: CaseSketchReference[] = [
  {
    id: "sketch-ref-01",
    sketchNumber: "SK-2026-04",
    witnessStatementRef: "Witness #01: Store Cashier Statement",
    dateGenerated: "Oct 5, 2026",
    sketchImageUrl: "/images/sketches/sketch-01.jpg",
    witnessDescription:
      "Male, early 30s, intense gaze, sharp angular jawline with trimmed stubble. Wore a dark pullover hoodie during robbery.",
    candidates: [
      {
        id: "cand-01",
        criminalId: "CRIM-TN-2024-884",
        name: "Arun Prakash",
        alias: "Alias: Arun, Rocky",
        photo: "/images/suspects/arun-prakash.jpg",
        matchConfidence: 94,
        recommendedStatus: "Primary Suspect",
        recommendedRole: "Direct Involvement",
        llmReasoning:
          "94% vector facial landmark match with composite #SK-04. Modus operandi matches 3 prior commercial robberies in T. Nagar and Anna Nagar.",
        priorCases: "3 prior cases (Commercial Robbery)",
        dob: "May 12, 1992",
        age: 34,
        gender: "Male",
        height: "5'10\" (178 cm)",
        build: "Medium",
        complexion: "Wheatish",
        hairColor: "Black",
        eyeColor: "Brown",
        identifyingMarks: "Scar on left eyebrow",
        phone: "+91 98765 43210",
        knownAddresses: "T. Nagar, Chennai, TN",
      },
      {
        id: "cand-02",
        criminalId: "CRIM-TN-2023-412",
        name: "Dinesh Kumar",
        alias: "Alias: Dinu, Blade",
        photo: "/images/suspects/arun-prakash.jpg",
        matchConfidence: 76,
        recommendedStatus: "Person of Interest",
        recommendedRole: "Possible Associate",
        llmReasoning:
          "Secondary landmark correlation on cheekbones and orbital bridge. Operates in adjacent commercial district.",
        priorCases: "1 prior case (Assault & Burglary)",
        dob: "Jan 18, 1994",
        age: 32,
        gender: "Male",
        height: "5'9\" (175 cm)",
        build: "Slim",
        complexion: "Dusky",
        hairColor: "Black",
        eyeColor: "Dark Brown",
        identifyingMarks: "Mole on right collarbone",
        phone: "+91 98450 11223",
        knownAddresses: "Kodambakkam, Chennai, TN",
      },
    ],
  },
  {
    id: "sketch-ref-02",
    sketchNumber: "SK-2026-05",
    witnessStatementRef: "Witness #02: Parking Attendant Statement",
    dateGenerated: "Oct 5, 2026",
    sketchImageUrl: "/images/sketches/sketch-02.jpg",
    witnessDescription:
      "Male, late 20s, wearing dark baseball cap, slight mustache and goatee stubble, athletic build. Stationed near getaway motorcycle on North Boag Road.",
    candidates: [
      {
        id: "cand-03",
        criminalId: "CRIM-TN-2025-109",
        name: "Karthik Selvan",
        alias: "Alias: Selva, Karthi",
        photo: "/images/suspects/karthik-selvan.jpg",
        matchConfidence: 88,
        recommendedStatus: "Person of Interest",
        recommendedRole: "Possible Associate",
        llmReasoning:
          "88% structural facial correlation with getaway composite. Getaway motorcycle registered to close family associate in Saidapet.",
        priorCases: "2 prior cases (Vehicle Theft, Accessory)",
        dob: "Aug 24, 1996",
        age: 30,
        gender: "Male",
        height: "5'8\" (173 cm)",
        build: "Athletic",
        complexion: "Dusky",
        hairColor: "Black",
        eyeColor: "Dark Brown",
        identifyingMarks: "Tattoo on right forearm",
        phone: "+91 98123 45678",
        knownAddresses: "Saidapet, Chennai, TN",
      },
      {
        id: "cand-04",
        criminalId: "CRIM-TN-2024-551",
        name: "Vikramaditya R.",
        alias: "Alias: Vicky, Pilot",
        photo: "/images/suspects/karthik-selvan.jpg",
        matchConfidence: 68,
        recommendedStatus: "Person of Interest",
        recommendedRole: "Accomplice",
        llmReasoning:
          "68% profile match with cap angle. Known getaway driver associated with motorcycle theft syndicates.",
        priorCases: "1 prior case (Reckless Driving, Fleeing Scene)",
        dob: "Mar 10, 1998",
        age: 28,
        gender: "Male",
        height: "5'7\" (170 cm)",
        build: "Medium",
        complexion: "Fair",
        hairColor: "Black",
        eyeColor: "Brown",
        identifyingMarks: "Cut mark on chin",
        phone: "+91 97890 65432",
        knownAddresses: "Guindy, Chennai, TN",
      },
    ],
  },
  {
    id: "sketch-ref-03",
    sketchNumber: "SK-2026-06",
    witnessStatementRef: "CCTV Camera #03 Night Vision Enhancement",
    dateGenerated: "Oct 6, 2026",
    sketchImageUrl: "/images/cctv-suspect.jpg",
    witnessDescription:
      "Surveillance thermal outline and facial edge reconstruction of male exiting rear fire exit at 09:14 PM.",
    candidates: [
      {
        id: "cand-05",
        criminalId: "CRIM-TN-2022-319",
        name: "Suresh Menon",
        alias: "Alias: Suri, Techie",
        photo: "/images/suspects/arun-prakash.jpg",
        matchConfidence: 82,
        recommendedStatus: "Person of Interest",
        recommendedRole: "Accomplice",
        llmReasoning:
          "82% thermal boundary match. Specializes in security system bypass and commercial alarm disruption.",
        priorCases: "4 prior cases (Safecracking, Burglary)",
        dob: "Nov 04, 1990",
        age: 36,
        gender: "Male",
        height: "5'11\" (180 cm)",
        build: "Heavy",
        complexion: "Wheatish",
        hairColor: "Black",
        eyeColor: "Black",
        identifyingMarks: "Burn mark on left wrist",
        phone: "+91 98888 77665",
        knownAddresses: "Mambalam, Chennai, TN",
      },
    ],
  },
];
