/**
 * OpenStreetMap Overpass API Client for Live Real-World Surveillance Canvass
 * Queries globally mapped surveillance cameras (node["man_made"="surveillance"])
 */

import {
  calculateDistanceMeters,
  calculateCompassBearing,
  type SurveillanceAsset,
} from "./forensic-canvass-engine";

interface OsmElement {
  type: "node" | "way" | "relation";
  id: number;
  lat: number;
  lon: number;
  tags?: Record<string, string>;
}

interface OsmOverpassResponse {
  version: number;
  generator: string;
  elements: OsmElement[];
}

const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

/**
 * Normalizes OpenStreetMap tags into standard forensic surveillance categories
 */
function normalizeOsmCategory(tags: Record<string, string> = {}): {
  type: SurveillanceAsset["type"];
  categoryLabel: string;
} {
  const surveillanceType = (tags["surveillance:type"] || tags["camera:type"] || "").toLowerCase();
  const operator = (tags.operator || tags.name || "").toLowerCase();

  if (
    surveillanceType.includes("alpr") ||
    surveillanceType.includes("anpr") ||
    operator.includes("traffic") ||
    operator.includes("police")
  ) {
    return { type: "TRAFFIC_ANPR", categoryLabel: "Traffic / ANPR" };
  }

  if (
    surveillanceType.includes("ptz") ||
    surveillanceType.includes("dome") ||
    surveillanceType.includes("panning")
  ) {
    return { type: "MUNICIPAL_PTZ", categoryLabel: "Municipal PTZ" };
  }

  if (
    operator.includes("bank") ||
    operator.includes("atm") ||
    tags.amenity === "atm" ||
    tags.amenity === "bank"
  ) {
    return { type: "ATM_SECURITY", categoryLabel: "ATM / Financial" };
  }

  if (
    operator.includes("store") ||
    operator.includes("mall") ||
    operator.includes("shop") ||
    tags.shop
  ) {
    return { type: "COMMERCIAL", categoryLabel: "Commercial Storefront" };
  }

  return { type: "MUNICIPAL_PTZ", categoryLabel: "Public Surveillance" };
}

/**
 * Fetch real-world surveillance cameras from OpenStreetMap within the given radius
 */
export async function fetchOsmSurveillanceCameras(
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): Promise<SurveillanceAsset[]> {
  const query = `
    [out:json][timeout:5];
    (
      node["man_made"="surveillance"](around:${radiusMeters},${centerLat},${centerLng});
      node["surveillance"="camera"](around:${radiusMeters},${centerLat},${centerLng});
      node["camera:mount"](around:${radiusMeters},${centerLat},${centerLng});
    );
    out body 25;
  `;

  // Select primary endpoint
  const endpoint = OVERPASS_ENDPOINTS[0];
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return [];
    }

    const data: OsmOverpassResponse = await res.json();
    if (!data.elements || !Array.isArray(data.elements)) {
      return [];
    }

    return data.elements
      .filter((el) => el.type === "node" && typeof el.lat === "number" && typeof el.lon === "number")
      .map((node) => {
        const distance = calculateDistanceMeters(centerLat, centerLng, node.lat, node.lon);
        const bearing = calculateCompassBearing(centerLat, centerLng, node.lat, node.lon);
        const tags = node.tags || {};
        const { type, categoryLabel } = normalizeOsmCategory(tags);

        const displayName =
          tags.name ||
          tags.operator ||
          tags.description ||
          (tags["camera:mount"] ? `OSM ${tags["camera:mount"]} Cam #${node.id.toString().slice(-4)}` : `Public Cam #${node.id.toString().slice(-4)}`);

        return {
          id: `osm-${node.id}`,
          name: displayName,
          type,
          categoryLabel,
          lat: Number(node.lat.toFixed(5)),
          lng: Number(node.lon.toFixed(5)),
          distanceMeters: distance,
          bearing,
          resolution: tags["camera:resolution"] || "1080p Full HD",
          retentionDays: tags["retention:days"] ? parseInt(tags["retention:days"], 10) : 30,
          status: "ONLINE" as const,
          statusLabel: "Live Stream",
          source: "OSM_LIVE" as const,
          sourceLabel: "OSM Live Feed",
          operator: tags.operator || tags["camera:operator"],
          mountType: tags["camera:mount"] || "Pole Mount",
        };
      })
      .filter((asset) => asset.distanceMeters <= radiusMeters)
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  } catch (err) {
    // Graceful fallback on network timeout or abort
    clearTimeout(timeoutId);
    return [];
  }
}
