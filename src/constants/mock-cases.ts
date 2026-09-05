export interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
  type: string;
  location: string;
  date: string;
  timestamp?: string;
  status: "Under Investigation" | "Open" | "Solved" | "Closed";
  closedDate?: string;
  description?: string;
  assignedTo?: string;
}

export const INITIAL_CASES: CaseItem[] = [
  {
    id: "1",
    caseNumber: "FX-2026-184",
    title: "Downtown Robbery",
    type: "Theft",
    location: "Chennai, TN",
    date: "Oct 4, 2026",
    timestamp: "09:14 PM",
    status: "Under Investigation",
    description:
      "Armed robbery at a commercial establishment in T. Nagar. Suspect seen on CCTV fleeing towards North Boag Road.",
    assignedTo: "Madhan Kumar",
  },
  {
    id: "2",
    caseNumber: "FX-2026-183",
    title: "Missing Person",
    type: "Missing Person",
    location: "Coimbatore, TN",
    date: "Oct 3, 2026",
    timestamp: "04:30 PM",
    status: "Open",
    description:
      "Individual last seen near Gandhipuram bus terminal. Investigation into transit footage ongoing.",
    assignedTo: "Officer Raman",
  },
  {
    id: "3",
    caseNumber: "FX-2026-182",
    title: "Fraud Identification",
    type: "Fraud",
    location: "Bengaluru, KA",
    date: "Oct 2, 2026",
    timestamp: "11:20 AM",
    status: "Open",
    description:
      "Multi-tier identity impersonation at banking branches on Indiranagar 100 Feet Road. Digital audit logs under forensic analysis.",
    assignedTo: "Special Agent Priya",
  },
  {
    id: "4",
    caseNumber: "FX-2026-181",
    title: "Assault Investigation",
    type: "Assault",
    location: "Madurai, TN",
    date: "Oct 1, 2026",
    timestamp: "08:45 PM",
    status: "Solved",
    closedDate: "Oct 3, 2026",
    description:
      "Assault incident outside commercial hub near Goripalayam Junction. Suspect apprehended with matching physical sketch.",
    assignedTo: "Inspector Selvam",
  },
  {
    id: "5",
    caseNumber: "FX-2026-180",
    title: "Unknown Suspect",
    type: "Unknown",
    location: "Trichy, TN",
    date: "Sep 30, 2026",
    timestamp: "02:15 AM",
    status: "Under Investigation",
    description:
      "Unidentified person captured on private surveillance tampering with telecom infrastructure in Thillai Nagar.",
    assignedTo: "Investigator K.",
  },
  {
    id: "6",
    caseNumber: "FX-2026-179",
    title: "Identity Verification",
    type: "Identity",
    location: "Salem, TN",
    date: "Sep 28, 2026",
    timestamp: "06:10 PM",
    status: "Closed",
    description:
      "Verification of disputed biometric records at Fairlands municipal administrative branch. Discrepancies cleared and verified.",
    assignedTo: "Officer Meera",
  },
  {
    id: "7",
    caseNumber: "FX-2026-178",
    title: "Cyber Crime",
    type: "Cyber",
    location: "Chennai, TN",
    date: "Sep 27, 2026",
    timestamp: "10:05 PM",
    status: "Open",
    description:
      "Ransomware assault on municipal healthcare server located at OMR IT Corridor in Perungudi. IP tracing in progress.",
    assignedTo: "Cyber Forensics Unit",
  },
  {
    id: "8",
    caseNumber: "FX-2026-177",
    title: "Homicide Case",
    type: "Homicide",
    location: "Tirunelveli, TN",
    date: "Sep 25, 2026",
    timestamp: "01:40 AM",
    status: "Under Investigation",
    description:
      "Crime scene analysis with multiple physical evidence items recovered near Palayamkottai Market. Lab sequencing underway.",
    assignedTo: "Senior Det. Murugan",
  },
  {
    id: "9",
    caseNumber: "FX-2026-176",
    title: "Stolen Vehicle",
    type: "Theft",
    location: "Erode, TN",
    date: "Sep 24, 2026",
    timestamp: "07:50 PM",
    status: "Solved",
    closedDate: "Sep 26, 2026",
    description:
      "Commercial freight vehicle recovered at Perundurai highway toll plaza using automated license plate recognition.",
    assignedTo: "Highway Patrol",
  },
  {
    id: "10",
    caseNumber: "FX-2026-175",
    title: "Vandalism",
    type: "Property Crime",
    location: "Vellore, TN",
    date: "Sep 22, 2026",
    timestamp: "03:30 AM",
    status: "Closed",
    closedDate: "Sep 24, 2026",
    description:
      "Defacement of public historical monument near Vellore Fort ramparts. Perpetrator identified and penal fine imposed.",
    assignedTo: "District Station",
  },
];
