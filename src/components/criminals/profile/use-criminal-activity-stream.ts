"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  type CriminalActivityItem,
  type CriminalActivityCategory,
  type CreateCriminalActivityParams,
  fetchCriminalActivityLogs,
  recordCriminalActivityEvent,
  verifyCriminalLedgerIntegrity,
} from "@/features/criminals/activity-actions";

export interface UseCriminalActivityStreamOptions {
  criminalId: string;
  criminalName: string;
  initialActivities?: CriminalActivityItem[];
}

export function useCriminalActivityStream({
  criminalId,
  criminalName,
  initialActivities,
}: UseCriminalActivityStreamOptions) {
  const [activities, setActivities] = useState<CriminalActivityItem[]>(
    initialActivities || []
  );
  const [isLoading, setIsLoading] = useState(!initialActivities || initialActivities.length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"ALL" | CriminalActivityCategory>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<"ALL" | "critical" | "warning" | "info" | "success">("ALL");
  const [isLiveStream, setIsLiveStream] = useState(true);
  const [livePingsCount, setLivePingsCount] = useState(0);
  const [latestLivePing, setLatestLivePing] = useState<CriminalActivityItem | null>(null);

  // Cryptographic Ledger Verification State
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    totalBlocks: number;
    genesisHash: string;
    merkleRootHash: string;
    verifiedAt: string;
  } | null>(null);

  // Initial Data Load
  const loadLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const logs = await fetchCriminalActivityLogs(criminalId);
      setActivities(logs);
    } catch (err) {
      console.error("Failed to load criminal activity logs:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [criminalId]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  // Connect to live SSE stream for real-time sensor radar hits and case links
  useEffect(() => {
    if (typeof window === "undefined" || !criminalId) return;

    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/criminals/stream?criminalId=${encodeURIComponent(criminalId)}`);
      es.onmessage = (evt) => {
        try {
          const payload = JSON.parse(evt.data);
          if (
            payload.type === "SURVEILLANCE_HIT" ||
            payload.type === "CASE_LINKED" ||
            payload.type === "STATUS_CHANGED" ||
            payload.type === "LEDGER_ENTRY"
          ) {
            loadLogs(true);
            setLivePingsCount((count) => count + 1);
          }
        } catch {
          // Non-fatal parse error
        }
      };
    } catch (e) {
      console.warn("SSE connection error in activity stream:", e);
    }

    return () => {
      if (es) es.close();
    };
  }, [criminalId, loadLogs]);

  // Live Stream Engine: Simulates incoming live surveillance camera & ANPR hits when enabled
  useEffect(() => {
    if (!isLiveStream) return;

    // Simulate real-time sensor radar ping every 35 seconds
    const interval = setInterval(() => {
      const possibleSensors = [
        {
          sensor: "ANPR-CAM-11-ANNA-SALAI",
          loc: "Anna Salai - Mount Road Junction",
          coords: [13.0604, 80.2496] as [number, number],
          action: "Live ANPR Hit: License TN-09-CB-4491 Scanned",
          detail: `Automated ANPR camera detected vehicle matching subject's alias record moving northbound.`,
          severity: "critical" as const,
          score: 0.982,
        },
        {
          sensor: "CCTV-AI-03-CENTRAL-STATION",
          loc: "Chennai Central Railway Station - Gate 4",
          coords: [13.0827, 80.2707] as [number, number],
          action: "Live Biometric Match: 91.4% Facial Confidence",
          detail: `Surveillance node matched subject facial embedding against watchlist gallery.`,
          severity: "warning" as const,
          score: 0.914,
        },
        {
          sensor: "GEOFENCE-RADAR-07",
          loc: "R.K. Salai Perimeter Zone",
          coords: [13.0475, 80.2589] as [number, number],
          action: "Geofence Perimeter Ping: Bluetooth Beacon Detected",
          detail: `Mobile terminal triangulation detected registered device within restricted zone.`,
          severity: "warning" as const,
          score: 0.887,
        },
      ];

      const chosen = possibleSensors[Math.floor(Math.random() * possibleSensors.length)];
      const now = new Date();
      const newLiveEvent: CriminalActivityItem = {
        id: `live-${Date.now()}`,
        action: chosen.action,
        category: "SURVEILLANCE",
        severity: chosen.severity,
        timestamp: now.toISOString(),
        formattedDate: now.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        formattedTime: now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        }),
        relativeTime: "just now",
        officer: {
          name: chosen.sensor,
          badgeId: chosen.sensor,
          role: "Automated Live Surveillance Sensor",
          isAutomatedSensor: true,
        },
        details: chosen.detail,
        metadata: {
          location: chosen.loc,
          coordinates: chosen.coords,
          confidenceScore: chosen.score,
          sensorId: chosen.sensor,
          blockHash: "live-" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
          previousBlockHash: "0000000000000000000000000000000000000000000000000000000000000000",
        },
      };

      setActivities((prev) => [newLiveEvent, ...prev]);
      setLivePingsCount((count) => count + 1);
      setLatestLivePing(newLiveEvent);
    }, 35000);

    return () => clearInterval(interval);
  }, [isLiveStream, criminalName]);

  // Optimistic Add Activity
  const addActivity = async (params: CreateCriminalActivityParams) => {
    const res = await recordCriminalActivityEvent(params);
    if (res.success && res.item) {
      setActivities((prev) => [res.item!, ...prev]);
      return res.item;
    }
    return null;
  };

  // Cryptographic Ledger Verification
  const verifyLedger = async () => {
    setIsVerifying(true);
    try {
      // Small simulated delay for cryptographic computation aesthetic
      await new Promise((r) => setTimeout(r, 600));
      const res = await verifyCriminalLedgerIntegrity(criminalId);
      setVerificationResult(res);
      return res;
    } catch (err) {
      console.error("Verification failed:", err);
      return null;
    } finally {
      setIsVerifying(false);
    }
  };

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Category filter
      if (activeCategory !== "ALL" && act.category !== activeCategory) {
        return false;
      }
      // Severity filter
      if (severityFilter !== "ALL" && act.severity !== severityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = act.action.toLowerCase().includes(q);
        const matchesDetails = act.details.toLowerCase().includes(q);
        const matchesOfficer = act.officer.name.toLowerCase().includes(q) || act.officer.badgeId.toLowerCase().includes(q);
        const matchesLocation = act.metadata.location?.toLowerCase().includes(q);
        const matchesCase = act.metadata.caseNumber?.toLowerCase().includes(q);
        if (!matchesAction && !matchesDetails && !matchesOfficer && !matchesLocation && !matchesCase) {
          return false;
        }
      }
      return true;
    });
  }, [activities, activeCategory, severityFilter, searchQuery]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = activities.length;
    const surveillanceCount = activities.filter((a) => a.category === "SURVEILLANCE").length;
    const evidenceCount = activities.filter((a) => a.category === "EVIDENCE").length;
    const caseLinkCount = activities.filter((a) => a.category === "CASE_LINK").length;
    const profileUpdateCount = activities.filter((a) => a.category === "PROFILE_UPDATE").length;
    const legalCount = activities.filter((a) => a.category === "LEGAL_AUDIT").length;

    return {
      total,
      surveillanceCount,
      evidenceCount,
      caseLinkCount,
      profileUpdateCount,
      legalCount,
      activeSensors: 14,
      integrityPercentage: 100,
    };
  }, [activities]);

  return {
    activities,
    filteredActivities,
    isLoading,
    isRefreshing,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    severityFilter,
    setSeverityFilter,
    isLiveStream,
    setIsLiveStream,
    livePingsCount,
    latestLivePing,
    refreshLogs: () => loadLogs(true),
    addActivity,
    verifyLedger,
    isVerifying,
    verificationResult,
    stats,
  };
}
