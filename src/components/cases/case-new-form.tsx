"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Shield,
  FileText,
  MapPin,
  User,
  Tag,
  History,
  X,
  Plus,
  Calendar,
  Clock,
  Mail,
  Building,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  RefreshCw,
  Navigation,
  Compass,
  Check,
  Search,
  Loader2,
  ChevronDown,
  Sparkles,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Modal } from "@/components/ui/modal";
import { Map, MapMarker, MarkerContent, MapControls, useMap } from "@/components/ui/map";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { motion } from "motion/react";
import { toast } from "sonner";
import { CaseStatus, CasePriority } from "@prisma/client";
import { createCase } from "@/features/cases/actions";
import { uploadEvidence } from "@/features/evidence/actions";
import { CaseEvidenceUploadSection } from "./case-evidence-upload-section";
import { resolveCaseLocation, LANDMARK_GAZETTEER } from "@/lib/case-location-resolver";

interface CaseNewFormProps {
  initialUser?: {
    name?: string | null;
    email?: string | null;
    avatar?: string;
    role?: string;
  };
  suggestedCaseNumber?: string;
}

const CASE_TYPES = [
  "Theft",
  "Armed Robbery",
  "Burglary",
  "Fraud",
  "Assault",
  "Missing Person",
  "Homicide",
  "Cyber Crime",
  "Narcotics",
  "Vandalism",
  "Extortion",
  "Other",
];

const STATUS_OPTIONS: { label: string; value: CaseStatus }[] = [
  { label: "Open", value: CaseStatus.OPEN },
  { label: "Under Investigation", value: CaseStatus.UNDER_INVESTIGATION },
  { label: "On Hold", value: CaseStatus.ON_HOLD },
  { label: "Closed / Solved", value: CaseStatus.CLOSED },
  { label: "Cold Case", value: CaseStatus.COLD },
  { label: "Archived", value: CaseStatus.ARCHIVED },
];

const PRIORITY_OPTIONS: { label: string; value: CasePriority }[] = [
  { label: "Low", value: CasePriority.LOW },
  { label: "Medium", value: CasePriority.MEDIUM },
  { label: "High", value: CasePriority.HIGH },
  { label: "Critical", value: CasePriority.CRITICAL },
];

function getStatusLabel(s: CaseStatus): string {
  switch (s) {
    case CaseStatus.OPEN:
      return "Open";
    case CaseStatus.UNDER_INVESTIGATION:
      return "Under Investigation";
    case CaseStatus.ON_HOLD:
      return "On Hold";
    case CaseStatus.CLOSED:
      return "Closed / Solved";
    case CaseStatus.COLD:
      return "Cold Case";
    case CaseStatus.ARCHIVED:
      return "Archived";
    default:
      return s;
  }
}

function getPriorityLabel(p: CasePriority): string {
  switch (p) {
    case CasePriority.LOW:
      return "Low";
    case CasePriority.MEDIUM:
      return "Medium";
    case CasePriority.HIGH:
      return "High";
    case CasePriority.CRITICAL:
      return "Critical";
    default:
      return p;
  }
}

const SUGGESTED_TAGS = [
  "CCTV Footage",
  "Fingerprints",
  "Ballistics",
  "DNA Evidence",
  "High Profile",
  "Cyber Logs",
  "Transit Data",
  "Witness Statement",
  "Forensics Lab",
];

const LOCATION_PRESETS = [
  { city: "Chennai, TN", landmark: "North Boag Road, T. Nagar", label: "T. Nagar (Chennai)" },
  { city: "Chennai, TN", landmark: "Anna Nagar Roundtana", label: "Anna Nagar (Chennai)" },
  { city: "Chennai, TN", landmark: "OMR IT Corridor, Perungudi", label: "OMR (Chennai)" },
  { city: "Bengaluru, KA", landmark: "Indiranagar 100 Feet Road", label: "Indiranagar (Bengaluru)" },
  { city: "Coimbatore, TN", landmark: "Gandhipuram Bus Terminal", label: "Gandhipuram (Coimbatore)" },
  { city: "Madurai, TN", landmark: "Goripalayam Junction", label: "Goripalayam (Madurai)" },
  { city: "Trichy, TN", landmark: "Thillai Nagar Main Road", label: "Thillai Nagar (Trichy)" },
  { city: "Salem, TN", landmark: "Five Roads Junction", label: "Five Roads (Salem)" },
];

function MapClickHandler({
  onClickCoords,
}: {
  onClickCoords: (coords: { lat: number; lng: number }) => void;
}) {
  const { map, isLoaded } = useMap();
  React.useEffect(() => {
    if (!map || !isLoaded) return;
    const handleClick = (e: { lngLat: { lng: number; lat: number } }) => {
      onClickCoords({ lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, isLoaded, onClickCoords]);
  return null;
}

function MapController({ flyTarget }: { flyTarget: { lat: number; lng: number } | null }) {
  const { map, isLoaded } = useMap();
  React.useEffect(() => {
    if (!map || !isLoaded || !flyTarget) return;
    map.flyTo({
      center: [flyTarget.lng, flyTarget.lat],
      zoom: 15.5,
      essential: true,
      duration: 1200,
    });
  }, [map, isLoaded, flyTarget]);
  return null;
}

function getFormattedCurrentDate(): string {
  const now = new Date();
  return now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getFormattedCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function CaseNewForm({ initialUser, suggestedCaseNumber }: CaseNewFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Case Number
  const [caseNumber, setCaseNumber] = React.useState(
    suggestedCaseNumber || `FX-2026-${Math.floor(185 + Math.random() * 40)}`
  );

  // Form states
  const [title, setTitle] = React.useState("");
  const [caseType, setCaseType] = React.useState("Theft");
  const [status, setStatus] = React.useState<CaseStatus>(CaseStatus.OPEN);
  const [priority, setPriority] = React.useState<CasePriority>(CasePriority.MEDIUM);
  const [hoveredCaseType, setHoveredCaseType] = React.useState<string | null>(null);
  const [hoveredStatus, setHoveredStatus] = React.useState<string | null>(null);
  const [hoveredPriority, setHoveredPriority] = React.useState<string | null>(null);

  // Timeline & Location
  const [dateReported, setDateReported] = React.useState(getFormattedCurrentDate());
  const [timeOfIncident, setTimeOfIncident] = React.useState(getFormattedCurrentTime());
  const [location, setLocation] = React.useState("Chennai, TN");
  const [landmark, setLandmark] = React.useState("North Boag Road, T. Nagar");
  const [latitude, setLatitude] = React.useState<string>("13.04180");
  const [longitude, setLongitude] = React.useState<string>("80.23410");

  // Descriptions
  const [description, setDescription] = React.useState("");
  const [detailedDescription, setDetailedDescription] = React.useState("");

  // Personnel & Assignment
  const [assignedToName, setAssignedToName] = React.useState(
    initialUser?.name || "Madhan Kumar"
  );
  const [assignedToEmail, setAssignedToEmail] = React.useState(
    initialUser?.email || "officer@forensix.gov"
  );
  const [department, setDepartment] = React.useState("Digital Forensics & Incident Response");

  // Tags
  const [tags, setTags] = React.useState<string[]>(["Theft", "Forensics", "Active Case"]);
  const [newTagInput, setNewTagInput] = React.useState("");

  // Staged Evidence Files
  const [stagedEvidence, setStagedEvidence] = React.useState<File[]>([]);

  const handleAddTag = (tagToAdd?: string) => {
    const clean = (tagToAdd || newTagInput).trim();
    if (!clean) return;
    if (tags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
      toast.info(`Tag "${clean}" already exists`);
      setNewTagInput("");
      return;
    }
    setTags((prev) => [...prev, clean]);
    setNewTagInput("");
    toast.success(`Tag "${clean}" added`);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  // Auto-sync coordinates from location + landmark
  const syncCoordinates = React.useCallback(
    (newLocation: string, newLandmark: string) => {
      const loc = resolveCaseLocation({
        id: "new",
        location: newLocation,
        description: newLandmark ? `${newLandmark}. ${description}` : description,
        title: title,
      });
      if (loc && loc.latitude && loc.longitude) {
        setLatitude(loc.latitude.toFixed(5));
        setLongitude(loc.longitude.toFixed(5));
      }
    },
    [description, title]
  );

  const handleLocationChange = (val: string) => {
    setLocation(val);
    syncCoordinates(val, landmark);
  };

  const handleLandmarkChange = (val: string) => {
    setLandmark(val);
    syncCoordinates(location, val);
  };

  const handleSelectPreset = (preset: (typeof LOCATION_PRESETS)[0]) => {
    setLocation(preset.city);
    setLandmark(preset.landmark);
    syncCoordinates(preset.city, preset.landmark);
    toast.success(`Location set to ${preset.label} & coordinates auto-synced!`);
  };

  // Device GPS Location Handler
  const [isDetectingGps, setIsDetectingGps] = React.useState(false);

  const handleUseCurrentLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(5);
        const lng = pos.coords.longitude.toFixed(5);
        setLatitude(lat);
        setLongitude(lng);
        setIsDetectingGps(false);
        toast.success(`Device GPS coordinates applied: ${lat}° N, ${lng}° E`);
      },
      (err) => {
        setIsDetectingGps(false);
        console.warn("GPS error:", err);
        toast.error("Unable to access GPS location. Please check browser permissions.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Interactive Map Picker Modal State
  const [isMapPickerOpen, setIsMapPickerOpen] = React.useState(false);
  const [mapPinCoords, setMapPinCoords] = React.useState<{ lat: number; lng: number }>({
    lat: parseFloat(latitude) || 13.0418,
    lng: parseFloat(longitude) || 80.2341,
  });
  const [mapFlyTarget, setMapFlyTarget] = React.useState<{ lat: number; lng: number } | null>(null);
  const [mapSearchQuery, setMapSearchQuery] = React.useState("");
  const [selectedSearchName, setSelectedSearchName] = React.useState("");
  const [mapSearchResults, setMapSearchResults] = React.useState<
    Array<{
      title: string;
      subtitle: string;
      lat: number;
      lng: number;
      source: "gazetteer" | "osm";
    }>
  >([]);
  const [isSearchingMap, setIsSearchingMap] = React.useState(false);
  const [showSearchResults, setShowSearchResults] = React.useState(false);
  const searchContainerRef = React.useRef<HTMLDivElement>(null);

  // Close search results dropdown on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search local gazetteer & OSM
  React.useEffect(() => {
    const query = mapSearchQuery.trim().toLowerCase();
    if (query.length < 2) {
      setMapSearchResults([]);
      setIsSearchingMap(false);
      return;
    }

    setIsSearchingMap(true);

    const localMatches: Array<{
      title: string;
      subtitle: string;
      lat: number;
      lng: number;
      source: "gazetteer" | "osm";
    }> = [];

    for (const entry of LANDMARK_GAZETTEER) {
      const matchPattern = entry.patterns.some((p) => p.test(query));
      const matchText =
        entry.title.toLowerCase().includes(query) ||
        entry.city.toLowerCase().includes(query) ||
        entry.state.toLowerCase().includes(query);

      if (matchPattern || matchText) {
        localMatches.push({
          title: entry.title,
          subtitle: `${entry.city}, ${entry.state}`,
          lat: entry.coordinates[1],
          lng: entry.coordinates[0],
          source: "gazetteer",
        });
      }
    }

    setMapSearchResults(localMatches);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            mapSearchQuery
          )}&limit=5`,
          {
            headers: {
              "Accept-Language": "en",
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) {
            const osmResults = data.map(
              (item: { name?: string; display_name: string; lat: string; lon: string }) => ({
                title: item.name || item.display_name.split(",")[0],
                subtitle: item.display_name,
                lat: parseFloat(item.lat),
                lng: parseFloat(item.lon),
                source: "osm" as const,
              })
            );

            setMapSearchResults((prev) => {
              const merged = [...prev];
              for (const osm of osmResults) {
                const isDuplicate = merged.some(
                  (m) =>
                    Math.abs(m.lat - osm.lat) < 0.005 && Math.abs(m.lng - osm.lng) < 0.005
                );
                if (!isDuplicate) {
                  merged.push(osm);
                }
              }
              return merged;
            });
          }
        }
      } catch (err) {
        console.warn("OSM geocode error:", err);
      } finally {
        setIsSearchingMap(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [mapSearchQuery]);

  const handleOpenMapPicker = () => {
    const currentLat = parseFloat(latitude) || 13.0418;
    const currentLng = parseFloat(longitude) || 80.2341;
    setMapPinCoords({ lat: currentLat, lng: currentLng });
    setMapFlyTarget({ lat: currentLat, lng: currentLng });
    setMapSearchQuery("");
    setSelectedSearchName("");
    setMapSearchResults([]);
    setShowSearchResults(false);
    setIsMapPickerOpen(true);
  };

  const handleSelectSearchResult = (result: {
    title: string;
    subtitle: string;
    lat: number;
    lng: number;
  }) => {
    setMapPinCoords({ lat: result.lat, lng: result.lng });
    setMapFlyTarget({ lat: result.lat, lng: result.lng });
    setMapSearchQuery(result.title);
    setSelectedSearchName(result.title);
    setShowSearchResults(false);
    toast.success(`Centered map on ${result.title}. Drag pin to fine-tune!`);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (mapSearchResults.length > 0) {
        handleSelectSearchResult(mapSearchResults[0]);
      }
    }
  };

  const handleConfirmMapPin = () => {
    const latFormatted = mapPinCoords.lat.toFixed(5);
    const lngFormatted = mapPinCoords.lng.toFixed(5);
    setLatitude(latFormatted);
    setLongitude(lngFormatted);
    if (selectedSearchName && (!landmark || landmark === "North Boag Road, T. Nagar")) {
      setLandmark(selectedSearchName);
    }
    setIsMapPickerOpen(false);
    toast.success(`Coordinates updated from Map Pin: ${latFormatted}° N, ${lngFormatted}° E`);
  };

  const handleClearForm = () => {
    setTitle("");
    setCaseType("Theft");
    setStatus(CaseStatus.OPEN);
    setPriority(CasePriority.MEDIUM);
    setDateReported(getFormattedCurrentDate());
    setTimeOfIncident(getFormattedCurrentTime());
    setLocation("Chennai, TN");
    setLandmark("North Boag Road, T. Nagar");
    setLatitude("13.04180");
    setLongitude("80.23410");
    setDescription("");
    setDetailedDescription("");
    setTags(["Theft", "Forensics", "Active Case"]);
    setStagedEvidence([]);
    toast.info("Form reset to clean draft state.");
  };

  const handleRegenerateCaseNumber = () => {
    const nextNum = `FX-2026-${Math.floor(185 + Math.random() * 80)}`;
    setCaseNumber(nextNum);
    toast.success(`New Case ID generated: ${nextNum}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please provide a descriptive case title");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createCase({
        caseNumber: caseNumber.trim(),
        title: title.trim(),
        description: description.trim(),
        detailedDescription: detailedDescription.trim(),
        status,
        priority,
        caseType,
        dateReported,
        timeOfIncident,
        location,
        landmark,
        latitude: parseFloat(latitude) || undefined,
        longitude: parseFloat(longitude) || undefined,
        assignedToName,
        assignedToEmail,
        department,
        tags,
      });

      if (res.error) {
        toast.error(res.error);
      } else {
        const createdCase = res.data;
        const createdNumber = createdCase?.caseNumber || caseNumber;
        const createdCaseId = createdCase?.id;

        // If evidence files were staged, upload them to Tigris S3 and link to this case
        if (createdCaseId && stagedEvidence.length > 0) {
          toast.loading(`Attaching ${stagedEvidence.length} forensic file(s)...`, { id: "upload-evidence" });
          let uploadedCount = 0;
          for (const file of stagedEvidence) {
            try {
              const formData = new FormData();
              formData.append("caseId", createdCaseId);
              formData.append("file", file);
              const uploadRes = await uploadEvidence(formData);
              if (uploadRes && !uploadRes.error) uploadedCount++;
            } catch (err) {
              console.warn("Evidence upload error:", err);
            }
          }
          toast.dismiss("upload-evidence");
          if (uploadedCount > 0) {
            toast.success(`Investigation ${createdNumber} created with ${uploadedCount} evidence file(s)!`);
          } else {
            toast.success(`Investigation ${createdNumber} created successfully!`);
          }
        } else {
          toast.success(`Investigation ${createdNumber} created successfully!`);
        }

        // Navigate directly to the newly created case's details page
        router.push(`/case-details/${createdNumber}`);
        router.refresh();
      }
    } catch (err) {
      console.error("Error creating case:", err);
      toast.error("Failed to create case. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 w-full max-w-7xl mx-auto pb-28 sm:pb-16 min-w-0">
      {/* Top Sticky/Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3.5 sm:pb-4 border-b-2 border-border/60">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground -mt-1 sm:-mt-1.5 mb-1.5 sm:mb-2.5">
            <Link
              href="/dashboard/cases"
              className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors group cursor-pointer text-xs sm:text-sm font-medium active:scale-95"
            >
              <ArrowLeft className="size-3.5 sm:size-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Cases</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-heading text-foreground tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1 sm:gap-3">
            <span>New Case:</span>
            <span className="text-[#665AEF] font-heading font-bold">{caseNumber}</span>
            <span className="text-emerald-400 text-xs sm:text-sm font-semibold uppercase tracking-wider">
              Draft File
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed max-w-3xl">
            Register a new criminal investigation dossier, assign lead detective, capture crime scene telemetry, and initialize forensic dossier.
          </p>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-3 sm:flex items-center gap-2 sm:gap-2.5 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClearForm}
            disabled={isSubmitting}
            className="h-10 sm:h-9 gap-1.5 rounded-lg border-2 border-border/80 bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 cursor-pointer shadow-2xs justify-center active:scale-[0.98] touch-manipulation px-2.5"
          >
            <RotateCcw className="size-3.5 text-muted-foreground shrink-0" />
            <span>Clear</span>
          </Button>

          <Link
            href="/dashboard/cases"
            className="inline-flex items-center justify-center h-10 sm:h-9 px-2.5 sm:px-3 rounded-lg border-2 border-border/80 bg-card/60 text-xs sm:text-sm font-medium hover:bg-muted/60 text-foreground cursor-pointer shadow-2xs transition-all active:scale-[0.98] touch-manipulation"
          >
            Cancel
          </Link>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-10 sm:h-9 gap-1.5 sm:gap-2 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs sm:text-sm font-medium shadow-sm shadow-[#665AEF]/25 px-3 sm:px-4 cursor-pointer justify-center active:scale-[0.98] touch-manipulation"
          >
            {isSubmitting ? (
              <>
                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span className="truncate">Creating...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5 shrink-0" />
                <span className="truncate">
                  <span className="sm:hidden">Create</span>
                  <span className="hidden sm:inline">Create Case</span>
                </span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Grid: Bento Grid Architecture */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Bento Tile 1 (12 cols / full-width): Core Case Identity & Classification */}
        <div className="xl:col-span-12 min-w-0">
          {/* Card 1: Core Case Identity & Classification */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <Shield className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Core Classification & Status
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                    Define primary identification, operational status, and priority tier
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5">
              {/* Row 1: Case Number (Auto-generated) & Case Title */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 sm:gap-4">
                <div className="sm:col-span-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="case-number" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Case Number
                    </Label>
                    <button
                      type="button"
                      onClick={handleRegenerateCaseNumber}
                      title="Regenerate new Case ID"
                      className="inline-flex items-center gap-1 text-[11px] text-[#665AEF] hover:text-[#5749DF] font-medium cursor-pointer active:scale-95 transition-transform"
                    >
                      <Sparkles className="size-2.5" /> Auto-Gen
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Input
                      id="case-number"
                      value={caseNumber}
                      onChange={(e) => setCaseNumber(e.target.value)}
                      style={{ fontFamily: 'var(--font-space-grotesk), "Space Grotesk", sans-serif' }}
                      className="h-10 font-space font-heading font-bold text-base sm:text-sm bg-muted/40 border-2 border-border/60 text-foreground tracking-wide focus-visible:border-ring"
                    />
                  </div>
                </div>

                <div className="sm:col-span-8 space-y-1.5">
                  <Label htmlFor="case-title" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Case Title <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="case-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    placeholder="Enter descriptive case title (e.g. Armed Robbery at North Boag Road)..."
                    className="h-10 text-base sm:text-sm font-medium border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>
              </div>

              {/* Row 2: Case Type, Status, Priority, Date Reported, Time — all in one 5-col row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3.5 sm:gap-4">
                {/* Case Type Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Case Type
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs active:scale-[0.99] touch-manipulation"
                        />
                      }
                    >
                      <span className="truncate">{caseType}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-[var(--anchor-width)] min-w-[180px] max-h-60 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border"
                      onPointerLeave={() => setHoveredCaseType(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {CASE_TYPES.map((type) => (
                          <DropdownMenuItem
                            key={type}
                            onPointerEnter={() => setHoveredCaseType(type)}
                            onClick={() => {
                              setCaseType(type);
                              if (!tags.includes(type)) {
                                setTags((prev) => [type, ...prev.filter((t) => !CASE_TYPES.includes(t))]);
                              }
                            }}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2.5 sm:py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs sm:text-sm font-medium touch-manipulation"
                          >
                            {hoveredCaseType === type && (
                              <motion.div
                                layoutId="case-new-type-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{
                                  type: "spring",
                                  bounce: 0.3,
                                  duration: 0.4,
                                }}
                              />
                            )}
                            <span>{type}</span>
                            {caseType === type && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Investigation Status Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Investigation Status
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs active:scale-[0.99] touch-manipulation"
                        />
                      }
                    >
                      <span className="truncate">{getStatusLabel(status)}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-[var(--anchor-width)] min-w-[180px] p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      onPointerLeave={() => setHoveredStatus(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {STATUS_OPTIONS.map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onPointerEnter={() => setHoveredStatus(opt.value)}
                            onClick={() => setStatus(opt.value)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2.5 sm:py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs sm:text-sm font-medium touch-manipulation"
                          >
                            {hoveredStatus === opt.value && (
                              <motion.div
                                layoutId="case-new-status-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{
                                  type: "spring",
                                  bounce: 0.3,
                                  duration: 0.4,
                                }}
                              />
                            )}
                            <span>{opt.label}</span>
                            {status === opt.value && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Priority Level Dropdown */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Priority Level
                  </Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      render={
                        <Button
                          type="button"
                          variant="outline"
                          className="h-10 w-full justify-between rounded-lg border-2 border-border/80 bg-background/50 px-3 text-xs sm:text-sm font-medium hover:bg-muted/60 hover:text-foreground cursor-pointer flex items-center shadow-2xs active:scale-[0.99] touch-manipulation"
                        />
                      }
                    >
                      <span className="truncate">{getPriorityLabel(priority)}</span>
                      <ChevronDown className="size-3.5 text-muted-foreground opacity-70 shrink-0 ml-2" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      side="bottom"
                      sideOffset={6}
                      className="w-[var(--anchor-width)] min-w-[180px] p-1 rounded-xl shadow-2xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
                      onPointerLeave={() => setHoveredPriority(null)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: -6 }}
                        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                        className="space-y-0.5"
                      >
                        {PRIORITY_OPTIONS.map((opt) => (
                          <DropdownMenuItem
                            key={opt.value}
                            onPointerEnter={() => setHoveredPriority(opt.value)}
                            onClick={() => setPriority(opt.value)}
                            className="relative z-0 group flex items-center justify-between cursor-pointer px-2.5 py-2.5 sm:py-2 rounded-lg transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs sm:text-sm font-medium touch-manipulation"
                          >
                            {hoveredPriority === opt.value && (
                              <motion.div
                                layoutId="case-new-priority-hover"
                                className="absolute inset-0 z-[-1] rounded-lg bg-accent/80"
                                transition={{
                                  type: "spring",
                                  bounce: 0.3,
                                  duration: 0.4,
                                }}
                              />
                            )}
                            <span>{opt.label}</span>
                            {priority === opt.value && <Check className="size-3.5 text-[#665AEF]" />}
                          </DropdownMenuItem>
                        ))}
                      </motion.div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Date Reported */}
                <div className="space-y-1.5">
                  <Label htmlFor="date-reported" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="size-3 text-muted-foreground shrink-0" />
                    <span>Date Reported</span>
                  </Label>
                  <Input
                    id="date-reported"
                    value={dateReported}
                    onChange={(e) => setDateReported(e.target.value)}
                    placeholder="e.g. Oct 5, 2026"
                    className="h-10 text-base sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Time of Incident */}
                <div className="space-y-1.5">
                  <Label htmlFor="time-incident" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="size-3 text-muted-foreground shrink-0" />
                    <span>Time of Incident</span>
                  </Label>
                  <Input
                    id="time-incident"
                    value={timeOfIncident}
                    onChange={(e) => setTimeOfIncident(e.target.value)}
                    placeholder="e.g. 10:30 AM"
                    className="h-10 text-base sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bento Tile 2 (5 cols): Personnel + Audit */}
        <div className="xl:col-span-5 min-w-0 flex flex-col xl:self-stretch">
          {/* Card 4+6: Personnel & Assignment + Audit — merged into one card */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs flex-1 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <User className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Personnel & Audit
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                    Investigator assignment & session ledger
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-5 sm:pt-6 flex-1 flex flex-col justify-between space-y-6">
              {/* Personnel fields */}
              <div className="space-y-4.5 sm:space-y-5">
                {/* Lead Investigator */}
                <div className="space-y-2">
                  <Label htmlFor="assigned-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <User className="size-3 text-muted-foreground shrink-0" />
                    <span>Lead Investigator</span>
                  </Label>
                  <Input
                    id="assigned-name"
                    value={assignedToName}
                    onChange={(e) => setAssignedToName(e.target.value)}
                    placeholder="e.g. Madhan Kumar"
                    className="h-10.5 sm:h-11 text-base sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Investigator Email */}
                <div className="space-y-2">
                  <Label htmlFor="assigned-email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="size-3 text-muted-foreground shrink-0" />
                    <span>Official Email / Contact</span>
                  </Label>
                  <Input
                    id="assigned-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={assignedToEmail}
                    onChange={(e) => setAssignedToEmail(e.target.value)}
                    placeholder="officer@forensix.gov"
                    className="h-10.5 sm:h-11 text-base sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                {/* Department / Division */}
                <div className="space-y-2">
                  <Label htmlFor="assigned-department" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Building className="size-3 text-muted-foreground shrink-0" />
                    <span>Division / Unit</span>
                  </Label>
                  <Input
                    id="assigned-department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. Digital Forensics Division"
                    className="h-10.5 sm:h-11 text-base sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>
              </div>

              {/* Audit divider */}
              <div className="border-t-2 border-border/40 pt-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <History className="size-3.5 text-muted-foreground shrink-0" />
                    <span className="text-xs font-bold font-heading text-muted-foreground uppercase tracking-wider">Audit & Security Ledger</span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 shrink-0">
                    <CheckCircle2 className="size-3 shrink-0" />
                    <span>Ledger Initialized</span>
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl border-2 border-border/60 bg-muted/20">
                    <span className="text-xs text-muted-foreground shrink-0 font-medium">Session User:</span>
                    <span className="font-sans text-foreground font-semibold text-right truncate text-xs">
                      {initialUser?.name || "Investigator"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl border-2 border-border/60 bg-muted/20">
                    <span className="text-xs text-muted-foreground shrink-0 font-medium">Registration Status:</span>
                    <span className="font-sans text-emerald-400 font-semibold text-right truncate text-xs">
                      Ready to Register
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl border-2 border-border/60 bg-muted/20">
                    <span className="text-xs text-muted-foreground shrink-0 font-medium">Security Clearance:</span>
                    <span className="font-mono text-muted-foreground font-semibold text-right truncate text-xs flex items-center gap-1">
                      <Lock className="size-3 text-[#665AEF]" />
                      <span>Level 3 / DFIR-Secured</span>
                    </span>
                  </div>
                </div>
                <div className="p-3 rounded-xl border-2 border-border/60 bg-muted/10 flex items-start gap-2.5 text-[11px] leading-relaxed text-muted-foreground/90">
                  <CheckCircle2 className="size-3.5 text-[#665AEF] shrink-0 mt-0.5" />
                  <span>Creating this case writes an immutable creation record to the Forensix AuditLog registry with cryptographic session validation.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bento Tile 3 (7 cols): Incident Timeline & Crime Scene Location */}
        <div className="xl:col-span-7 min-w-0 flex flex-col xl:self-stretch">
          {/* Card 2: Incident Timeline & Crime Scene Location */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs flex-1 flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <MapPin className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Incident Timeline & Location
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                    Temporal telemetry and geospatial crime scene positioning
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5 space-y-4 sm:space-y-5">
              {/* Row 1: Region / City & Specific Landmark / Street */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="case-location" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="size-3 text-muted-foreground shrink-0" />
                    <span>Jurisdiction / City</span>
                  </Label>
                  <Input
                    id="case-location"
                    value={location}
                    onChange={(e) => handleLocationChange(e.target.value)}
                    placeholder="e.g. Chennai, TN"
                    className="h-10 text-base sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="case-landmark" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Crime Scene Landmark / Street
                  </Label>
                  <Input
                    id="case-landmark"
                    value={landmark}
                    onChange={(e) => handleLandmarkChange(e.target.value)}
                    placeholder="e.g. North Boag Road, T. Nagar"
                    className="h-10 text-base sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                  />
                </div>
              </div>

              {/* Quick Location Presets */}
              <div className="space-y-1.5 pt-0.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Quick Location Presets
                  </span>
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">Click to auto-fill address & coordinates</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto sm:flex-wrap pb-1 sm:pb-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                  {LOCATION_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className="text-[11px] px-2.5 py-1.5 rounded-md border-2 border-border/80 bg-card/60 text-foreground hover:bg-muted/80 hover:border-neutral-600/70 cursor-pointer transition-all inline-flex items-center gap-1.5 shadow-2xs touch-manipulation active:scale-95 shrink-0 sm:shrink"
                    >
                      <MapPin className="size-3 text-[#665AEF] shrink-0" />
                      <span className="whitespace-nowrap">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: GPS Coordinates */}
              <div className="p-3 sm:p-4 rounded-xl border-2 border-border/80 bg-muted/20 space-y-3 sm:space-y-3.5">
                <div className="flex flex-col gap-2.5 pb-2.5 border-b-2 border-border/60">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <MapPin className="size-3.5 text-[#665AEF] shrink-0" />
                      <span className="text-xs sm:text-sm font-semibold text-foreground truncate">
                        Precise Crime Scene Coordinates
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-medium text-emerald-400 whitespace-nowrap shrink-0">
                      <CheckCircle2 className="size-3 sm:size-3.5 shrink-0" />
                      <span>Auto-Synced</span>
                    </span>
                  </div>

                  {/* Alternate Options Action Controls - Equal 3-Column Grid */}
                  <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        syncCoordinates(location, landmark);
                        toast.success("Coordinates re-synced from jurisdiction & landmark!");
                      }}
                      className="h-9.5 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 rounded-lg border-2 border-border/80 bg-card text-[11px] sm:text-xs font-medium hover:bg-muted/60 cursor-pointer shadow-2xs justify-center whitespace-nowrap active:scale-[0.97] touch-manipulation"
                    >
                      <RefreshCw className="size-3 sm:size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate">
                        <span className="sm:hidden">Sync</span>
                        <span className="hidden sm:inline">Sync Address</span>
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={handleUseCurrentLocation}
                      disabled={isDetectingGps}
                      className="h-9.5 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 rounded-lg border-2 border-border/80 bg-card text-[11px] sm:text-xs font-medium hover:bg-muted/60 cursor-pointer shadow-2xs justify-center whitespace-nowrap active:scale-[0.97] touch-manipulation"
                    >
                      <Navigation className="size-3 sm:size-3.5 text-[#665AEF] shrink-0" />
                      <span className="truncate">
                        <span className="sm:hidden">{isDetectingGps ? "Detecting..." : "GPS"}</span>
                        <span className="hidden sm:inline">{isDetectingGps ? "Detecting..." : "Device GPS"}</span>
                      </span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      onClick={handleOpenMapPicker}
                      className="h-9.5 sm:h-8 px-2 sm:px-3 gap-1 sm:gap-1.5 rounded-lg border-2 border-border/80 bg-card text-[11px] sm:text-xs font-medium hover:bg-muted/60 cursor-pointer shadow-2xs justify-center whitespace-nowrap active:scale-[0.97] touch-manipulation"
                    >
                      <Compass className="size-3 sm:size-3.5 text-[#665AEF] shrink-0" />
                      <span className="truncate">
                        <span className="sm:hidden">Map</span>
                        <span className="hidden sm:inline">Pick on Map</span>
                      </span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="geo-latitude" className="text-[11px] font-sans text-muted-foreground uppercase flex items-center gap-1 truncate">
                        <span className="truncate">Latitude (°N)</span>
                        <Lock className="size-2.5 text-muted-foreground shrink-0" />
                      </Label>
                      <span className="text-[10px] text-muted-foreground hidden xs:inline">Auto-locked</span>
                    </div>
                    <Input
                      id="geo-latitude"
                      value={latitude}
                      disabled
                      readOnly
                      className="h-9 font-sans font-medium text-xs sm:text-sm border-2 border-border/60 bg-muted/40 text-muted-foreground cursor-not-allowed select-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="geo-longitude" className="text-[11px] font-sans text-muted-foreground uppercase flex items-center gap-1 truncate">
                        <span className="truncate">Longitude (°E)</span>
                        <Lock className="size-2.5 text-muted-foreground shrink-0" />
                      </Label>
                      <span className="text-[10px] text-muted-foreground hidden xs:inline">Auto-locked</span>
                    </div>
                    <Input
                      id="geo-longitude"
                      value={longitude}
                      disabled
                      readOnly
                      className="h-9 font-sans font-medium text-xs sm:text-sm border-2 border-border/60 bg-muted/40 text-muted-foreground cursor-not-allowed select-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1 pt-1 text-[11px] text-muted-foreground">
                  <div className="flex items-start gap-1.5 leading-relaxed">
                    <Lock className="size-3 text-muted-foreground shrink-0 mt-0.5" />
                    <span>Manual typing disabled. Coordinates auto-update from address, Device GPS, or the interactive Map Picker.</span>
                  </div>
                  <div className="flex items-center justify-end pt-0.5">
                    <span
                      className="font-inter font-sans text-[10px] tracking-wide text-muted-foreground/80 font-medium whitespace-nowrap"
                      style={{
                        fontFamily:
                          'var(--font-inter), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                      }}
                    >
                      WGS 84 Datum
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bento Tile 4 (12 cols / full-width): Classification Tags Manager */}
        <div className="xl:col-span-12 min-w-0">
          {/* Card 5: Classification Tags Manager */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <Tag className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Classification Tags
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                    Categorization chips for filtering and cross-referencing
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                {/* Left column: Active Tags + Add Custom */}
                <div className="space-y-3.5">
                  {/* Active Tags */}
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Active Tags ({tags.length})
                    </Label>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-lg border-2 border-border/80 bg-background/40 min-h-14 sm:min-h-16">
                      {tags.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">No tags assigned</span>
                      ) : (
                        tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="h-7.5 pl-2.5 pr-1.5 border-2 border-border/80 bg-muted/40 hover:bg-muted/70 text-foreground text-xs font-medium rounded-md inline-flex items-center gap-1.5 shadow-2xs"
                          >
                            <span className="max-w-[160px] truncate">{tag}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="size-5 sm:size-4.5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/10 cursor-pointer touch-manipulation active:scale-90"
                              aria-label={`Remove tag ${tag}`}
                            >
                              <X className="size-3" />
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Add Custom Tag Input */}
                  <div className="space-y-1.5">
                    <Label htmlFor="custom-tag-input" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Add Custom Tag
                    </Label>
                    <div className="flex items-center gap-2 w-full">
                      <Input
                        id="custom-tag-input"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Enter tag name..."
                        className="h-10 flex-1 text-base sm:text-sm border-2 border-border/80 bg-background/50 focus-visible:border-ring"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddTag()}
                        className="h-10 px-3.5 gap-1 rounded-lg border-2 border-border/80 bg-card/60 text-xs font-medium hover:bg-muted/60 cursor-pointer shrink-0 active:scale-95 touch-manipulation"
                      >
                        <Plus className="size-3.5" />
                        <span>Add</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Right column: Suggested Tags */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Suggested Tags
                  </Label>
                  <div className="flex flex-wrap items-start gap-1.5 sm:gap-2 pt-1">
                    {SUGGESTED_TAGS.map((sug) => {
                      const isAdded = tags.includes(sug);
                      return (
                        <button
                          key={sug}
                          type="button"
                          onClick={() => !isAdded && handleAddTag(sug)}
                          disabled={isAdded}
                          className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md border-2 transition-all touch-manipulation active:scale-95 shrink-0 sm:shrink ${
                            isAdded
                              ? "border-border/40 bg-muted/20 text-muted-foreground/50 cursor-not-allowed"
                              : "border-border/80 bg-card/60 text-foreground hover:bg-muted/80 hover:border-neutral-600/70 cursor-pointer"
                          }`}
                        >
                          <span className="opacity-70 font-medium">+</span>
                          <span className="whitespace-nowrap">{sug}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bento Tile 5 (12 cols): Forensic Narrative & Investigative Dossier */}
        <div className="xl:col-span-12 min-w-0">
          {/* Card 3: Narrative & Forensic Description */}
          <Card className="border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between p-4 sm:p-6 pb-3 sm:pb-3.5 border-b-2 border-border/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="size-4 sm:size-4.5 text-[#665AEF] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground truncate">
                    Forensic Narrative & Investigative Log
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-none">
                    Brief synopsis for case feeds and comprehensive crime scene dossier
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 pt-4 sm:pt-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Summary Description */}
                <div className="space-y-1.5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <Label htmlFor="case-summary" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Summary Description (Short Synopsis)
                    </Label>
                    <Textarea
                      id="case-summary"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      placeholder="Concise overview of the incident for case feeds, notifications, and export summaries..."
                      className="text-base sm:text-sm border-2 border-border/80 bg-background/50 leading-relaxed focus-visible:border-ring resize-y"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Shown on case cards, search summaries, and export overviews.
                  </p>
                </div>

                {/* Detailed Forensic Description */}
                <div className="space-y-1.5 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <Label htmlFor="case-detailed" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Detailed Case Description & Forensic Narrative
                    </Label>
                    <Textarea
                      id="case-detailed"
                      value={detailedDescription}
                      onChange={(e) => setDetailedDescription(e.target.value)}
                      rows={5}
                      placeholder="Comprehensive crime scene dynamics, witness testimony cataloging, physical evidence collection details, and forensic observations..."
                      className="text-base sm:text-sm border-2 border-border/80 bg-background/50 leading-relaxed focus-visible:border-ring resize-y"
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Detailed dossier displayed under the Case Description tab and printed in formal reports.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bento Tile 6 (12 cols): Evidence Files & Forensic Media Upload */}
        <div className="xl:col-span-12 min-w-0">
          {/* Card 4: Evidence Files & Forensic Media Upload */}
          <CaseEvidenceUploadSection
            stagedFiles={stagedEvidence}
            onStagedFilesChange={setStagedEvidence}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Bottom Sticky Action Bar for Mobile / Long scrolls */}
      <div className="sticky bottom-0 sm:bottom-4 z-20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 -mx-3 sm:mx-0 p-3 sm:p-3.5 rounded-t-xl sm:rounded-xl border-t-2 sm:border-2 border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:pb-3.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertTriangle className="size-3.5 text-amber-400 shrink-0" />
          <span className="hidden sm:inline">
            Ensure all forensic parameters and crime scene coordinates are verified before initializing the case file.
          </span>
          <span className="sm:hidden text-[11px] leading-tight">
            Verify forensic parameters before initializing case file.
          </span>
        </div>

        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-2.5 w-full sm:w-auto">
          <Link
            href="/dashboard/cases"
            className="inline-flex items-center justify-center h-10.5 sm:h-9 px-3 rounded-lg border-2 border-border/80 bg-card text-xs sm:text-sm font-medium hover:bg-muted/60 text-foreground cursor-pointer transition-all active:scale-[0.98] touch-manipulation shadow-2xs"
          >
            Cancel
          </Link>

          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="h-10.5 sm:h-9 gap-1.5 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white text-xs sm:text-sm font-medium shadow-sm shadow-[#665AEF]/25 px-3.5 cursor-pointer justify-center active:scale-[0.98] touch-manipulation"
          >
            {isSubmitting ? (
              <>
                <div className="size-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Save className="size-3.5 shrink-0" />
                <span>Create Case</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Interactive Map Picker Modal */}
      <Modal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        title="Pick Crime Scene Location on Map"
        description="Search any area, landmark, or street, then drag the pin marker or click anywhere on the map to pinpoint precise forensic scene coordinates."
        maxWidth="max-w-2xl"
        contentClassName="p-3 sm:p-4.5 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <div className="space-y-2.5">
          {/* Location Search Bar with Autocomplete Dropdown */}
          <div ref={searchContainerRef} className="relative z-30">
            <div className="relative flex items-center">
              <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                value={mapSearchQuery}
                onChange={(e) => {
                  setMapSearchQuery(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => {
                  if (mapSearchResults.length > 0 || mapSearchQuery.length >= 2) {
                    setShowSearchResults(true);
                  }
                }}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search location, area, street, or landmark..."
                className="pl-9 pr-16 h-10 sm:h-9 rounded-lg border-2 border-border/80 bg-background/90 text-base sm:text-xs font-sans text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-[#665AEF] focus-visible:border-[#665AEF]"
              />
              <div className="absolute right-2.5 flex items-center gap-1.5">
                {isSearchingMap && (
                  <Loader2 className="size-3.5 animate-spin text-[#665AEF]" />
                )}
                {mapSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setMapSearchQuery("");
                      setMapSearchResults([]);
                      setShowSearchResults(false);
                    }}
                    className="p-1 rounded hover:bg-muted/80 text-muted-foreground hover:text-foreground cursor-pointer active:scale-95 touch-manipulation"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Suggestion Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-[11px] text-muted-foreground scrollbar-none mt-0.5 whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/70">
                Quick Jump:
              </span>
              {LOCATION_PRESETS.slice(0, 5).map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    const matched = LANDMARK_GAZETTEER.find((g) =>
                      g.patterns.some((p) => p.test(preset.landmark))
                    );
                    if (matched) {
                      handleSelectSearchResult({
                        title: matched.title,
                        subtitle: `${matched.city}, ${matched.state}`,
                        lat: matched.coordinates[1],
                        lng: matched.coordinates[0],
                      });
                    }
                  }}
                  className="shrink-0 px-2.5 py-1.5 sm:py-1 rounded-md border-2 border-border/80 bg-muted/30 hover:bg-muted/70 hover:border-neutral-600/70 text-foreground transition-colors cursor-pointer text-[11px] active:scale-95 touch-manipulation"
                >
                  {preset.label.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Autocomplete Results Dropdown */}
            {showSearchResults && mapSearchResults.length > 0 && (
              <div className="absolute top-[calc(100%+4px)] left-0 right-0 max-h-52 z-40 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden rounded-xl border-2 border-border/90 bg-card/95 backdrop-blur-xl shadow-2xl p-1.5 space-y-1">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b-2 border-border/60 flex items-center justify-between">
                  <span>Found Locations ({mapSearchResults.length})</span>
                  <span className="text-[9px] font-normal lowercase text-muted-foreground/80">Click to center & drop pin</span>
                </div>
                {mapSearchResults.map((result, idx) => (
                  <button
                    key={`${result.title}-${result.lat}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(result)}
                    className="w-full text-left px-2.5 py-2.5 sm:py-2 rounded-lg hover:bg-muted/80 transition-colors flex items-start gap-2.5 cursor-pointer group active:scale-[0.99] touch-manipulation"
                  >
                    <div className="p-1.5 rounded-md bg-[#665AEF]/10 text-[#665AEF] shrink-0 mt-0.5 group-hover:bg-[#665AEF] group-hover:text-white transition-colors">
                      <MapPin className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-foreground truncate group-hover:text-[#665AEF] transition-colors">
                          {result.title}
                        </span>
                        {result.source === "gazetteer" && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#665AEF]/15 text-[#a594fd] border-2 border-[#665AEF]/30">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {result.subtitle}
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground shrink-0 mt-1">
                      {result.lat.toFixed(3)}°, {result.lng.toFixed(3)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="relative h-60 sm:h-[300px] md:h-[330px] w-full rounded-xl overflow-hidden border-2 border-border/80 shadow-md">
            <Map
              center={[mapPinCoords.lng, mapPinCoords.lat]}
              zoom={14}
              theme="dark"
              className="size-full"
            >
              <MapControls position="top-right" showZoom showLocate />
              <MapController flyTarget={mapFlyTarget} />
              <MapClickHandler onClickCoords={(c) => setMapPinCoords(c)} />
              <MapMarker
                longitude={mapPinCoords.lng}
                latitude={mapPinCoords.lat}
                draggable
                onDragEnd={(coords) => {
                  if (coords) {
                    setMapPinCoords({ lat: coords.lat, lng: coords.lng });
                  }
                }}
              >
                <MarkerContent>
                  <div className="group/pin relative flex flex-col items-center cursor-grab active:cursor-grabbing select-none">
                    <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-neutral-900/90 border-2 border-neutral-700 text-[10px] font-medium text-white shadow-lg pointer-events-none whitespace-nowrap opacity-90 group-hover/pin:opacity-100 transition-opacity flex items-center gap-1">
                      <MapPin className="size-2.5 text-[#665AEF]" />
                      <span>Drag Me</span>
                    </div>
                    <div className="size-8 rounded-full bg-[#665AEF] border-2 border-white shadow-2xl flex items-center justify-center text-white ring-4 ring-[#665AEF]/30">
                      <MapPin className="size-4.5" />
                    </div>
                  </div>
                </MarkerContent>
              </MapMarker>
            </Map>
          </div>

          {/* Selected Point Status Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 p-2.5 rounded-lg border-2 border-border/80 bg-muted/20 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground flex-wrap">
              <Compass className="size-4 text-[#665AEF]" />
              <span>Selected Point:</span>
              <span className="font-sans font-bold text-foreground">
                {mapPinCoords.lat.toFixed(5)}° N, {mapPinCoords.lng.toFixed(5)}° E
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground">Click map or drag pin marker</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:flex sm:items-center sm:justify-end gap-2 pt-2 border-t-2 border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsMapPickerOpen(false)}
              className="h-10 sm:h-8.5 rounded-lg border-2 border-border/80 cursor-pointer justify-center text-xs sm:text-sm font-medium active:scale-[0.98] touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleConfirmMapPin}
              className="h-10 sm:h-8.5 gap-1.5 rounded-lg bg-[#665AEF] hover:bg-[#5749DF] text-white cursor-pointer shadow-sm shadow-[#665AEF]/25 px-3.5 justify-center text-xs sm:text-sm font-medium active:scale-[0.98] touch-manipulation"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Apply Pin</span>
            </Button>
          </div>
        </div>
      </Modal>
    </form>
  );
}
