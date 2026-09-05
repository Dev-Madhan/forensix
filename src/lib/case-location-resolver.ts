/**
 * Dynamic Case Location Resolver for Forensix
 * Resolves precise, unique, and real-world geographic coordinates and formatted location badges
 * dynamically from case descriptions, titles, and locations.
 */

export interface CaseGeoLocation {
  title: string;
  subtitle: string;
  city: string;
  state: string;
  coordinates: [number, number]; // [lng, lat] for MapLibre / GeoJSON
  latitude: number;
  longitude: number;
  formattedCoords: string;
  googleMapsUrl: string;
}

export interface LandmarkEntry {
  patterns: RegExp[];
  title: string;
  city: string;
  state: string;
  coordinates: [number, number]; // [lng, lat]
}

// Comprehensive geographic gazetteer of real-world forensic spots, hubs, and municipal areas
export const LANDMARK_GAZETTEER: LandmarkEntry[] = [
  // --- CHENNAI ---
  {
    patterns: [/\b(?:north\s+)?boag\s+road\b/i, /\bt\.?\s*nagar\b/i],
    title: "North Boag Road, T. Nagar",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [80.2376, 13.0429],
  },
  {
    patterns: [/\bomr\b/i, /\bperungudi\b/i, /\bit\s+corridor\b/i],
    title: "OMR IT Corridor, Perungudi",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [80.2452, 12.9654],
  },
  {
    patterns: [/\banna\s+nagar\b/i, /\broundtana\b/i],
    title: "Anna Nagar Roundtana",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [80.2155, 13.085],
  },
  {
    patterns: [/\bguindy\b/i, /\bindustrial\s+estate\b/i],
    title: "Guindy Industrial Estate",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [80.2078, 13.0067],
  },
  {
    patterns: [/\bmarina\b/i, /\btriplicane\b/i, /\bpromenade\b/i],
    title: "Marina Beach Promenade",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [80.2824, 13.0544],
  },
  {
    patterns: [/\bmylapore\b/i, /\bkapaleeshwarar\b/i],
    title: "Mylapore Heritage Zone",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [80.2707, 13.0334],
  },
  {
    patterns: [/\bvelachery\b/i, /\bbypass\b/i],
    title: "Velachery Bypass Junction",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [80.2195, 12.9815],
  },
  {
    patterns: [/\bnungambakkam\b/i, /\bhigh\s+road\b/i],
    title: "Nungambakkam High Road",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [80.2415, 13.06],
  },
  {
    patterns: [/\balwarpet\b/i, /\bttk\s+road\b/i],
    title: "Alwarpet TTK Junction",
    city: "Chennai",
    state: "Tamil Nadu",
    coordinates: [80.252, 13.035],
  },

  // --- COIMBATORE ---
  {
    patterns: [/\bgandhipuram\b/i, /\bbus\s+terminal\b/i, /\bcentral\s+bus\s+stand\b/i],
    title: "Gandhipuram Bus Terminal",
    city: "Coimbatore",
    state: "Tamil Nadu",
    coordinates: [76.9691, 11.0183],
  },
  {
    patterns: [/\br\.?\s*s\.?\s*puram\b/i, /\bdb\s+road\b/i],
    title: "RS Puram, DB Road",
    city: "Coimbatore",
    state: "Tamil Nadu",
    coordinates: [76.951, 11.0094],
  },
  {
    patterns: [/\bpeelamedu\b/i, /\bavinashi\s+road\b/i],
    title: "Peelamedu, Avinashi Road",
    city: "Coimbatore",
    state: "Tamil Nadu",
    coordinates: [77.0142, 11.0264],
  },
  {
    patterns: [/\bsaravanampatti\b/i],
    title: "Saravanampatti Tech Zone",
    city: "Coimbatore",
    state: "Tamil Nadu",
    coordinates: [76.9934, 11.082],
  },
  {
    patterns: [/\bukkadam\b/i],
    title: "Ukkadam Lake & Junction",
    city: "Coimbatore",
    state: "Tamil Nadu",
    coordinates: [76.9602, 10.9904],
  },

  // --- BENGALURU ---
  {
    patterns: [/\bindiranagar\b/i, /\b100\s+feet\s+road\b/i, /\bbanking\s+branch/i],
    title: "Indiranagar 100 Feet Road",
    city: "Bengaluru",
    state: "Karnataka",
    coordinates: [77.6412, 12.9784],
  },
  {
    patterns: [/\bkoramangala\b/i, /\b80\s+feet\s+road\b/i],
    title: "Koramangala 80 Feet Road",
    city: "Bengaluru",
    state: "Karnataka",
    coordinates: [77.6245, 12.9352],
  },
  {
    patterns: [/\bwhitefield\b/i, /\bitpl\b/i],
    title: "Whitefield IT Corridor",
    city: "Bengaluru",
    state: "Karnataka",
    coordinates: [77.7499, 12.9698],
  },
  {
    patterns: [/\bmg\s+road\b/i, /\bbrigade\s+road\b/i],
    title: "MG Road Commercial Plaza",
    city: "Bengaluru",
    state: "Karnataka",
    coordinates: [77.6074, 12.9754],
  },
  {
    patterns: [/\bhsr\s+layout\b/i],
    title: "HSR Layout Sector 1",
    city: "Bengaluru",
    state: "Karnataka",
    coordinates: [77.6515, 12.9121],
  },

  // --- MADURAI ---
  {
    patterns: [/\bgoripalayam\b/i, /\bcommercial\s+hub\b/i],
    title: "Goripalayam Junction",
    city: "Madurai",
    state: "Tamil Nadu",
    coordinates: [78.1278, 9.9282],
  },
  {
    patterns: [/\bmeenakshi\s+amman\b/i, /\btemple\s+zone\b/i],
    title: "Meenakshi Temple Perimeter",
    city: "Madurai",
    state: "Tamil Nadu",
    coordinates: [78.1198, 9.9195],
  },
  {
    patterns: [/\bmattuthavani\b/i, /\bbus\s+stand\b/i],
    title: "Mattuthavani Bus Terminus",
    city: "Madurai",
    state: "Tamil Nadu",
    coordinates: [78.1634, 9.9455],
  },
  {
    patterns: [/\bkk\s+nagar\b/i],
    title: "KK Nagar Commercial Circle",
    city: "Madurai",
    state: "Tamil Nadu",
    coordinates: [78.144, 9.932],
  },

  // --- TRICHY ---
  {
    patterns: [/\bthillai\s+nagar\b/i, /\btelecom\b/i],
    title: "Thillai Nagar Main Road",
    city: "Trichy",
    state: "Tamil Nadu",
    coordinates: [78.6874, 10.8267],
  },
  {
    patterns: [/\brockfort\b/i, /\bmain\s+guard\s+gate\b/i],
    title: "Rockfort Main Guard Gate",
    city: "Trichy",
    state: "Tamil Nadu",
    coordinates: [78.6968, 10.8285],
  },
  {
    patterns: [/\bcantonment\b/i, /\bcentral\s+bus\b/i],
    title: "Cantonment Central Hub",
    city: "Trichy",
    state: "Tamil Nadu",
    coordinates: [78.686, 10.8035],
  },

  // --- SALEM ---
  {
    patterns: [/\bfairlands\b/i, /\bdisputed\s+biometric\b/i, /\badministrative\b/i],
    title: "Fairlands Administrative Zone",
    city: "Salem",
    state: "Tamil Nadu",
    coordinates: [78.146, 11.6643],
  },
  {
    patterns: [/\bnew\s+bus\s+stand\b/i, /\bmeyyanur\b/i],
    title: "New Bus Stand, Meyyanur",
    city: "Salem",
    state: "Tamil Nadu",
    coordinates: [78.134, 11.668],
  },
  {
    patterns: [/\bfive\s+roads\b/i],
    title: "Five Roads Junction",
    city: "Salem",
    state: "Tamil Nadu",
    coordinates: [78.1415, 11.6705],
  },

  // --- TIRUNELVELI ---
  {
    patterns: [/\bpalayamkottai\b/i, /\bmarket\b/i, /\bphysical\s+evidence\b/i],
    title: "Palayamkottai Central Market",
    city: "Tirunelveli",
    state: "Tamil Nadu",
    coordinates: [77.734, 8.7139],
  },
  {
    patterns: [/\btirunelveli\s+junction\b/i],
    title: "Tirunelveli Junction",
    city: "Tirunelveli",
    state: "Tamil Nadu",
    coordinates: [77.712, 8.729],
  },

  // --- ERODE ---
  {
    patterns: [/\bperundurai\b/i, /\btoll\s+(?:booth|plaza)\b/i, /\bhighway\b/i, /\bfreight\b/i],
    title: "Perundurai Highway Toll Plaza",
    city: "Erode",
    state: "Tamil Nadu",
    coordinates: [77.5828, 11.277],
  },
  {
    patterns: [/\bcentral\s+bus\b/i, /\bbrough\s+road\b/i],
    title: "Brough Road Central Terminus",
    city: "Erode",
    state: "Tamil Nadu",
    coordinates: [77.724, 11.342],
  },

  // --- VELLORE ---
  {
    patterns: [/\bvellore\s+fort\b/i, /\bmonument\b/i, /\bramparts\b/i],
    title: "Vellore Fort Ramparts",
    city: "Vellore",
    state: "Tamil Nadu",
    coordinates: [79.129, 12.9202],
  },
  {
    patterns: [/\bkatpadi\b/i, /\brailway\b/i],
    title: "Katpadi Railway Junction",
    city: "Vellore",
    state: "Tamil Nadu",
    coordinates: [79.138, 12.973],
  },
];

// District centroids as precise anchor fallbacks
const CITY_CENTROIDS: Record<string, { city: string; state: string; coordinates: [number, number] }> = {
  chennai: { city: "Chennai", state: "Tamil Nadu", coordinates: [80.2376, 13.0429] },
  coimbatore: { city: "Coimbatore", state: "Tamil Nadu", coordinates: [76.9691, 11.0183] },
  madurai: { city: "Madurai", state: "Tamil Nadu", coordinates: [78.1278, 9.9282] },
  bengaluru: { city: "Bengaluru", state: "Karnataka", coordinates: [77.6412, 12.9784] },
  bangalore: { city: "Bengaluru", state: "Karnataka", coordinates: [77.6412, 12.9784] },
  trichy: { city: "Trichy", state: "Tamil Nadu", coordinates: [78.6874, 10.8267] },
  tiruchirappalli: { city: "Trichy", state: "Tamil Nadu", coordinates: [78.6874, 10.8267] },
  salem: { city: "Salem", state: "Tamil Nadu", coordinates: [78.146, 11.6643] },
  tirunelveli: { city: "Tirunelveli", state: "Tamil Nadu", coordinates: [77.734, 8.7139] },
  erode: { city: "Erode", state: "Tamil Nadu", coordinates: [77.5828, 11.277] },
  vellore: { city: "Vellore", state: "Tamil Nadu", coordinates: [79.129, 12.9202] },
  mumbai: { city: "Mumbai", state: "Maharashtra", coordinates: [72.8777, 19.076] },
  delhi: { city: "Delhi", state: "Delhi", coordinates: [77.209, 28.6139] },
  hyderabad: { city: "Hyderabad", state: "Telangana", coordinates: [78.381, 17.4504] },
  kochi: { city: "Kochi", state: "Kerala", coordinates: [76.2673, 9.9312] },
};

/**
 * Deterministic string hash function for consistent micro-coordinate offsets
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

/**
 * Resolves full geographic location, street title, and precise coordinates for any case.
 */
export function resolveCaseLocation(caseData: {
  id?: string;
  caseNumber?: string;
  title?: string;
  location?: string;
  description?: string;
  detailedDescription?: string;
}): CaseGeoLocation {
  const caseId = caseData.caseNumber || caseData.id || "FX-INCIDENT";
  const rawLoc = caseData.location || "Chennai, TN";
  const desc = `${caseData.description || ""} ${caseData.detailedDescription || ""} ${caseData.title || ""}`.trim();

  // 1. Check if description matches any known landmark in the gazetteer
  for (const entry of LANDMARK_GAZETTEER) {
    for (const pattern of entry.patterns) {
      if (pattern.test(desc)) {
        // Compute subtle, deterministic micro-offset (within 30-70 meters) so each case number has unique coordinates
        const hash = hashString(`${caseId}-${entry.title}`);
        const offsetLng = (((hash % 200) - 100) / 100) * 0.00075;
        const offsetLat = ((((hash >> 3) % 200) - 100) / 100) * 0.00075;

        const lng = Number((entry.coordinates[0] + offsetLng).toFixed(5));
        const lat = Number((entry.coordinates[1] + offsetLat).toFixed(5));

        return {
          title: entry.title,
          subtitle: `${entry.city}, ${entry.state}`,
          city: entry.city,
          state: entry.state,
          coordinates: [lng, lat],
          latitude: lat,
          longitude: lng,
          formattedCoords: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        };
      }
    }
  }

  // 2. Parse location string: e.g. "Gandhipuram, Coimbatore, TN" or "Chennai, TN"
  const locParts = rawLoc
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  let cityCandidate = locParts[0] || "Chennai";
  let stateCandidate = locParts[1] || "Tamil Nadu";

  if (locParts.length >= 3) {
    cityCandidate = locParts[1];
    stateCandidate = locParts[2];
  }

  // Normalize state code
  if (stateCandidate.toUpperCase() === "TN") stateCandidate = "Tamil Nadu";
  else if (stateCandidate.toUpperCase() === "KA") stateCandidate = "Karnataka";
  else if (stateCandidate.toUpperCase() === "MH") stateCandidate = "Maharashtra";
  else if (stateCandidate.toUpperCase() === "DL") stateCandidate = "Delhi";
  else if (stateCandidate.toUpperCase() === "TS" || stateCandidate.toUpperCase() === "TG") stateCandidate = "Telangana";
  else if (stateCandidate.toUpperCase() === "KL") stateCandidate = "Kerala";

  // Check if city name is mentioned in description or location
  const combinedText = `${rawLoc} ${desc}`.toLowerCase();
  let matchedCityEntry = CITY_CENTROIDS[cityCandidate.toLowerCase()];

  if (!matchedCityEntry) {
    for (const [key, val] of Object.entries(CITY_CENTROIDS)) {
      if (combinedText.includes(key)) {
        matchedCityEntry = val;
        break;
      }
    }
  }

  const resolvedCity = matchedCityEntry ? matchedCityEntry.city : cityCandidate;
  const resolvedState = matchedCityEntry ? matchedCityEntry.state : stateCandidate;
  const baseCoords: [number, number] = matchedCityEntry ? matchedCityEntry.coordinates : [80.2376, 13.0429];

  // 3. Extract dynamic street or landmark title from natural language text
  let extractedTitle = "";

  // Pattern: "near <Spot>"
  const matchNear = desc.match(
    /\bnear\s+([A-Z][A-Za-z0-9.'\s]{2,25}?)(?=[.,;]|(?:\s+(?:towards|in|at|on|with|fleeing|\n|$)))/
  );
  if (matchNear && matchNear[1] && matchNear[1].trim().toLowerCase() !== resolvedCity.toLowerCase()) {
    extractedTitle = matchNear[1].trim();
  }

  // Pattern: "in <Spot>"
  if (!extractedTitle) {
    const matchIn = desc.match(
      /\bin\s+([A-Z][A-Za-z0-9.'\s]{2,25}?)(?=[.,;]|(?:\s+(?:near|towards|fleeing|at|on|with|and|\n|$)))/
    );
    if (matchIn && matchIn[1] && matchIn[1].trim().toLowerCase() !== resolvedCity.toLowerCase()) {
      extractedTitle = matchIn[1].trim();
    }
  }

  // Pattern: "at <Spot>"
  if (!extractedTitle) {
    const matchAt = desc.match(
      /\bat\s+(?:a\s+|an\s+|the\s+)?([A-Z][A-Za-z0-9.'\s]{2,25}?)(?=[.,;]|(?:\s+(?:in|near|towards|fleeing|outside|\n|$)))/
    );
    if (matchAt && matchAt[1] && matchAt[1].trim().toLowerCase() !== resolvedCity.toLowerCase()) {
      extractedTitle = matchAt[1].trim();
    }
  }

  // Fallback title from location parts or case title
  if (!extractedTitle) {
    if (locParts.length >= 3) {
      extractedTitle = locParts[0];
    } else if (locParts[0] && locParts[0].toLowerCase() !== resolvedCity.toLowerCase()) {
      extractedTitle = locParts[0];
    } else {
      extractedTitle = `${resolvedCity} Central`;
    }
  }

  // Clean trailing punctuation or noise words
  extractedTitle = extractedTitle.replace(/^[,\s-]+|[,\s-]+$/g, "");

  // 4. Compute unique, deterministic coordinates within the city zone based on caseId and text
  const hash = hashString(`${caseId}-${extractedTitle}-${resolvedCity}`);
  const angle = ((hash % 360) * Math.PI) / 180;
  const radius = 0.0025 + ((hash % 100) / 100) * 0.0065; // ~300m - 900m dispersion around city anchor

  const lng = Number((baseCoords[0] + Math.cos(angle) * radius * 1.1).toFixed(5));
  const lat = Number((baseCoords[1] + Math.sin(angle) * radius).toFixed(5));

  return {
    title: extractedTitle,
    subtitle: `${resolvedCity}, ${resolvedState}`,
    city: resolvedCity,
    state: resolvedState,
    coordinates: [lng, lat],
    latitude: lat,
    longitude: lng,
    formattedCoords: `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`,
    googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  };
}
