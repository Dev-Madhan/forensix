"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import {
  ActivityItem,
  ActivityCategory,
  ActivityActionType,
  ActivityFilterState,
  ActivitySummaryStats,
  TimelineMilestone,
} from "./types";
import {
  MOCK_ACTIVITY_ITEMS,
  INITIAL_TIMELINE_MILESTONES,
} from "./mock-activity";
import {
  fetchRealCaseActivityLogs,
  recordAuditLogAction,
} from "@/features/audit/actions";

export const ACTIVITY_EVENT_NAME = "forensix:case-activity";

export interface LogActivityPayload {
  caseId?: string;
  caseNumber?: string;
  action: string;
  details: string;
  category: ActivityCategory;
  actionType?: ActivityActionType;
  metadata?: Record<string, unknown>;
  user?: {
    name?: string;
    role?: string;
    avatar?: string;
    initials?: string;
    email?: string;
  };
}

/**
 * Dispatch an activity log event from anywhere in the application
 * (e.g. adding a note, uploading evidence, editing a case, adding a suspect).
 */
export function logCaseActivity(payload: LogActivityPayload) {
  if (typeof window === "undefined") return;
  const event = new CustomEvent(ACTIVITY_EVENT_NAME, { detail: payload });
  window.dispatchEvent(event);
}

interface UseCaseActivityHistoryProps {
  caseId?: string;
  caseNumber?: string;
  initialActivities?: ActivityItem[];
}

export function useCaseActivityHistory({
  caseId,
  caseNumber = "FX-2026-184",
  initialActivities,
}: UseCaseActivityHistoryProps) {
  const { data: session } = useSession();

  // Logged-in user info derived from Better Auth session
  const currentUser = useMemo(() => {
    const rawUser = session?.user;
    const name = rawUser?.name || "Madhan Kumar";
    const role = (rawUser as { role?: string })?.role || "Investigator";
    const avatar = rawUser?.image || "/images/avatar-investigator.jpg";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "MK";
    const email = rawUser?.email || "investigator@forensix.gov";

    return {
      id: rawUser?.id || "usr-current",
      name,
      role,
      avatar,
      initials,
      email,
      isCurrentUser: true,
    };
  }, [session]);

  const storageKey = `forensix_session_activity_${caseNumber || caseId || "default"}`;

  // Activities dataset state
  const [activities, setActivities] = useState<ActivityItem[]>(() => {
    const base = initialActivities || MOCK_ACTIVITY_ITEMS;
    return base;
  });

  // Timeline milestones state
  const [timelineMilestones, setTimelineMilestones] = useState<TimelineMilestone[]>(
    INITIAL_TIMELINE_MILESTONES
  );

  // Filter state
  const [filters, setFilters] = useState<ActivityFilterState>({
    activityType: "ALL",
    userFilter: "ALL",
    onlySessionUser: false,
    dateRange: "Oct 1, 2026 - Oct 5, 2026",
    sortBy: "LATEST_FIRST",
    searchQuery: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Real-time synchronization indicator state
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<Date>(new Date());

  // 1. Hydrate real database audit logs on mount (falls back seamlessly to mock data)
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isSubscribed = true;

    // A. Read in-session stored actions first
    let sessionItems: ActivityItem[] = [];
    try {
      const stored = sessionStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as ActivityItem[];
        if (Array.isArray(parsed)) sessionItems = parsed;
      }
    } catch (err) {
      console.warn("Could not load stored session activity:", err);
    }

    // B. Fetch real database logs from Postgres AuditLog
    fetchRealCaseActivityLogs(caseId, caseNumber)
      .then((realLogs) => {
        if (!isSubscribed) return;
        if (realLogs && realLogs.length > 0) {
          // Real database logs present! Merge session items ahead of real logs
          const merged = [
            ...sessionItems,
            ...realLogs.filter((r) => !sessionItems.some((s) => s.id === r.id)),
          ];
          setActivities(merged);
        } else {
          // Database logs empty or unavailable: use mock seed data + session items
          const base = initialActivities || MOCK_ACTIVITY_ITEMS;
          const merged = [
            ...sessionItems,
            ...base.filter((b) => !sessionItems.some((s) => s.id === b.id)),
          ];
          setActivities(merged);
        }
      })
      .catch(() => {
        if (!isSubscribed) return;
        const base = initialActivities || MOCK_ACTIVITY_ITEMS;
        setActivities([...sessionItems, ...base.filter((b) => !sessionItems.some((s) => s.id === b.id))]);
      });

    return () => {
      isSubscribed = false;
    };
  }, [storageKey, initialActivities, caseId, caseNumber]);

  // 2. Real-time event listener: handles live actions dispatched on this case
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNewActivity = (event: Event) => {
      const customEvent = event as CustomEvent<LogActivityPayload>;
      const payload = customEvent.detail;
      if (!payload) return;

      // Filter by case if specified
      if (
        payload.caseNumber &&
        caseNumber &&
        payload.caseNumber.toLowerCase() !== caseNumber.toLowerCase()
      ) {
        return;
      }
      if (payload.caseId && caseId && payload.caseId !== caseId) {
        return;
      }

      const now = new Date();
      const formattedDate = now.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const formattedTime = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const user = payload.user
        ? {
            name: payload.user.name || currentUser.name,
            role: payload.user.role || currentUser.role,
            avatar: payload.user.avatar || currentUser.avatar,
            initials: payload.user.initials || currentUser.initials,
            email: payload.user.email || currentUser.email,
            isCurrentUser: true,
          }
        : currentUser;

      const newId = `act-${Date.now().toString(36)}`;

      const newActivity: ActivityItem = {
        id: newId,
        timestamp: now.toISOString(),
        formattedDate,
        formattedTime,
        user,
        action: payload.action,
        actionType: payload.actionType || "CASE",
        details: payload.details,
        category: payload.category,
        metadata: payload.metadata,
      };

      setActivities((prev) => {
        const next = [newActivity, ...prev];
        try {
          // Persist session actions to sessionStorage
          const sessionItems = next.filter((a) => a.id.startsWith("act-"));
          sessionStorage.setItem(storageKey, JSON.stringify(sessionItems));
        } catch {
          // Ignore storage quota errors
        }
        return next;
      });

      // Persist to Postgres database AuditLog table asynchronously
      recordAuditLogAction({
        caseId,
        caseNumber,
        action: payload.action,
        entityType: payload.category || "Case",
        details: {
          description: payload.details,
          actionType: payload.actionType,
          user: user.name,
          ...payload.metadata,
        },
      }).catch((e) => console.warn("Background audit write skipped or offline:", e));

      // Update Latest Activity milestone in the timeline
      setTimelineMilestones((prev) => {
        const updated = prev.map((m) => {
          if (m.id === "m-4" || m.title.includes("Latest Activity")) {
            return {
              ...m,
              timestamp: now.toISOString(),
              formattedTime: `${formattedDate}, ${formattedTime}`,
              description: payload.details,
            };
          }
          return m;
        });
        return updated;
      });

      setLastLiveUpdate(now);
      toast.success(`Activity logged: ${payload.action}`, {
        description: payload.details,
      });
    };

    window.addEventListener(ACTIVITY_EVENT_NAME, handleNewActivity);
    return () => {
      window.removeEventListener(ACTIVITY_EVENT_NAME, handleNewActivity);
    };
  }, [caseId, caseNumber, currentUser, storageKey]);

  // 3. Computed Summary Stats (Total, Evidence, Suspect, Case, Analysis, Deletions)
  const summaryStats: ActivitySummaryStats = useMemo(() => {
    let evidenceCount = 0;
    let suspectCount = 0;
    let caseUpdatesCount = 0;
    let aiAnalysisCount = 0;
    let deletionsCount = 0;

    for (const act of activities) {
      if (act.actionType === "DELETE" || act.details.toLowerCase().includes("delete")) {
        deletionsCount++;
      } else if (act.category === "Evidence" || act.actionType === "EVIDENCE") {
        evidenceCount++;
      } else if (act.category === "Suspect" || act.actionType === "SUSPECT") {
        suspectCount++;
      } else if (act.category === "Case" || act.actionType === "CASE") {
        caseUpdatesCount++;
      } else if (act.category === "Analysis" || act.actionType === "ANALYSIS") {
        aiAnalysisCount++;
      }
    }

    return {
      total: activities.length,
      evidenceCount,
      suspectCount,
      caseUpdatesCount,
      aiAnalysisCount,
      deletionsCount,
    };
  }, [activities]);

  // 4. Filter and sort logic
  const filteredActivities = useMemo(() => {
    let list = [...activities];

    // Search Query filter
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          a.action.toLowerCase().includes(q) ||
          a.details.toLowerCase().includes(q) ||
          a.user.name.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q)
      );
    }

    // Activity Type / Category filter
    if (filters.activityType !== "ALL") {
      list = list.filter(
        (a) => a.category.toLowerCase() === filters.activityType.toLowerCase()
      );
    }

    // "Only My Session History" toggle or User filter
    if (filters.onlySessionUser) {
      list = list.filter(
        (a) =>
          a.user.isCurrentUser ||
          a.user.email?.toLowerCase() === currentUser.email.toLowerCase() ||
          a.user.name.toLowerCase() === currentUser.name.toLowerCase()
      );
    } else if (filters.userFilter !== "ALL") {
      if (filters.userFilter === "CURRENT_USER") {
        list = list.filter(
          (a) =>
            a.user.isCurrentUser ||
            a.user.email?.toLowerCase() === currentUser.email.toLowerCase() ||
            a.user.name.toLowerCase() === currentUser.name.toLowerCase()
        );
      } else {
        list = list.filter(
          (a) =>
            a.user.name.toLowerCase() === filters.userFilter.toLowerCase()
        );
      }
    }

    // Sort order
    if (filters.sortBy === "OLDEST_FIRST") {
      list.sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    } else {
      list.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }

    return list;
  }, [activities, filters, currentUser]);

  // 5. Pagination
  const totalPages = Math.max(1, Math.ceil(filteredActivities.length / pageSize));
  const paginatedActivities = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredActivities.slice(start, start + pageSize);
  }, [filteredActivities, currentPage, pageSize]);

  // Handler functions
  const resetFilters = useCallback(() => {
    setFilters({
      activityType: "ALL",
      userFilter: "ALL",
      onlySessionUser: false,
      dateRange: "Oct 1, 2026 - Oct 5, 2026",
      sortBy: "LATEST_FIRST",
      searchQuery: "",
    });
    setCurrentPage(1);
    toast.info("Filters reset to default view");
  }, []);

  const setActivityType = useCallback((type: string) => {
    setFilters((prev) => ({ ...prev, activityType: type }));
    setCurrentPage(1);
  }, []);

  const setUserFilter = useCallback((user: string) => {
    setFilters((prev) => ({ ...prev, userFilter: user }));
    setCurrentPage(1);
  }, []);

  const toggleOnlySessionUser = useCallback(() => {
    setFilters((prev) => ({
      ...prev,
      onlySessionUser: !prev.onlySessionUser,
    }));
    setCurrentPage(1);
  }, []);

  const setSortBy = useCallback((sort: "LATEST_FIRST" | "OLDEST_FIRST") => {
    setFilters((prev) => ({ ...prev, sortBy: sort }));
    setCurrentPage(1);
  }, []);

  const setDateRange = useCallback((range: string) => {
    setFilters((prev) => ({ ...prev, dateRange: range }));
    setCurrentPage(1);
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: query }));
    setCurrentPage(1);
  }, []);

  return {
    currentUser,
    activities: paginatedActivities,
    allFilteredCount: filteredActivities.length,
    totalCount: activities.length,
    summaryStats,
    timelineMilestones,
    filters,
    currentPage,
    totalPages,
    isLiveActive,
    lastLiveUpdate,
    setCurrentPage,
    resetFilters,
    setActivityType,
    setUserFilter,
    toggleOnlySessionUser,
    setSortBy,
    setDateRange,
    setSearchQuery,
    logActivity: logCaseActivity,
  };
}
