"use client";

import * as React from "react";
import { MapPin, ArrowUpRight, Camera } from "lucide-react";
import type { MapMouseEvent, MapGeoJSONFeature, GeoJSONSource } from "maplibre-gl";
import type * as GeoJSON from "geojson";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Map,
  MapPopup,
  MapControls,
  useMap,
  type MapRef,
} from "@/components/ui/map";
import type { ResolvedCaseDetail } from "@/features/cases/resolve-case";
import { resolveCaseLocation } from "@/lib/case-location-resolver";

interface CaseIncidentLocationCardProps {
  caseData: ResolvedCaseDetail;
  className?: string;
}

interface SelectedPoint {
  id: number;
  name: string;
  category: string;
  coordinates: [number, number];
}

/**
 * Blue Markers Layer component using MapLibre GL GeoJSON circle layer
 */
function MarkersLayer({
  centerLng,
  centerLat,
  onSelectCoords,
}: {
  centerLng: number;
  centerLat: number;
  onSelectCoords?: (coords: { lat: number; lng: number } | null) => void;
}) {
  const { map, isLoaded } = useMap();
  const id = React.useId();
  const sourceId = `markers-source-${id.replace(/:/g, "")}`;
  const layerId = `markers-layer-${id.replace(/:/g, "")}`;
  const [selectedPoint, setSelectedPoint] = React.useState<SelectedPoint | null>(
    null
  );

  // Generate localized surveillance and sensor points around incident center
  const pointsData = React.useMemo(() => {
    const categories = [
      "CCTV Camera",
      "Traffic Sensor",
      "Security Camera",
      "Witness Point",
      "Store Camera",
    ];
    const features = [];

    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * 2 * Math.PI + (i % 3) * 0.25;
      const distance = 0.003 + ((i * 7) % 11) * 0.0008;
      const lng = centerLng + Math.cos(angle) * distance * 1.15;
      const lat = centerLat + Math.sin(angle) * distance;

      const cat = categories[i % categories.length];
      features.push({
        type: "Feature" as const,
        properties: {
          id: i + 1,
          name: `${cat} #${101 + i}`,
          category: cat,
        },
        geometry: {
          type: "Point" as const,
          coordinates: [lng, lat],
        },
      });
    }

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [centerLng, centerLat]);

  React.useEffect(() => {
    if (!map || !isLoaded) return;

    try {
      const existingSource = map.getSource(sourceId) as GeoJSONSource | undefined;
      if (!existingSource) {
        map.addSource(sourceId, {
          type: "geojson",
          data: pointsData,
        });
      } else {
        existingSource.setData(pointsData);
      }

      if (!map.getLayer(layerId)) {
        map.addLayer({
          id: layerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 6,
            "circle-color": "#3b82f6",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
          },
        });
      }
    } catch (err) {
      console.warn("Map layer addition:", err);
    }

    const handleClick = (
      e: MapMouseEvent & {
        features?: MapGeoJSONFeature[];
      }
    ) => {
      if (!e.features?.length) return;

      const feature = e.features[0];
      const coords = (feature.geometry as GeoJSON.Point).coordinates as [
        number,
        number
      ];

      setSelectedPoint({
        id: Number(feature.properties?.id),
        name: String(feature.properties?.name || "Sensor Point"),
        category: String(feature.properties?.category || "Surveillance"),
        coordinates: coords,
      });
      onSelectCoords?.({ lat: coords[1], lng: coords[0] });
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const handleMapClick = (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [layerId],
      });
      if (!features.length) {
        setSelectedPoint(null);
        onSelectCoords?.(null);
      }
    };

    map.on("click", layerId, handleClick);
    map.on("click", handleMapClick);
    map.on("mouseenter", layerId, handleMouseEnter);
    map.on("mouseleave", layerId, handleMouseLeave);

    return () => {
      map.off("click", layerId, handleClick);
      map.off("click", handleMapClick);
      map.off("mouseenter", layerId, handleMouseEnter);
      map.off("mouseleave", layerId, handleMouseLeave);

      try {
        if (map.getLayer(layerId)) map.removeLayer(layerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore cleanup errors
      }
    };
  }, [map, isLoaded, sourceId, layerId, pointsData, onSelectCoords]);

  return (
    <>
      {selectedPoint && (
        <MapPopup
          longitude={selectedPoint.coordinates[0]}
          latitude={selectedPoint.coordinates[1]}
          onClose={() => {
            setSelectedPoint(null);
            onSelectCoords?.(null);
          }}
          closeOnClick={true}
          focusAfterOpen={false}
          offset={10}
          className="border-2 border-border/80 bg-popover/95 backdrop-blur-md rounded-lg shadow-2xl p-2.5 min-w-[150px] max-w-[190px] z-50 text-xs"
        >
          <div className="flex flex-col gap-1.5">
            {/* Header: Mini Blue Badge */}
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-4 px-1.5 py-0 text-[9px] font-semibold border-blue-500/30 text-blue-400 bg-blue-500/10 gap-1 rounded-xs uppercase tracking-wider"
              >
                <span className="size-1 rounded-full bg-blue-500" />
                {selectedPoint.category}
              </Badge>
            </div>

            {/* Marker Name */}
            <div className="flex flex-col leading-tight">
              <h4 className="text-xs font-bold text-foreground tracking-tight truncate">
                {selectedPoint.name}
              </h4>
            </div>
          </div>
        </MapPopup>
      )}
    </>
  );
}

/**
 * Red GeoJSON Layer with hardware-accelerated smooth radar blip animation
 */
function IncidentLocationLayer({
  lng,
  lat,
  title,
  subtitle,
  onSelectCoords,
}: {
  lng: number;
  lat: number;
  title: string;
  subtitle: string;
  onSelectCoords?: (coords: { lat: number; lng: number } | null) => void;
}) {
  const { map, isLoaded } = useMap();
  const id = React.useId().replace(/:/g, "");
  const sourceId = `incident-source-${id}`;
  const pulseLayerId = `incident-pulse-${id}`;
  const glowLayerId = `incident-glow-${id}`;
  const coreLayerId = `incident-core-${id}`;

  const [showPopup, setShowPopup] = React.useState(false);

  const incidentGeoJSON = React.useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {
            title,
            subtitle,
          },
          geometry: {
            type: "Point" as const,
            coordinates: [lng, lat],
          },
        },
      ],
    }),
    [lng, lat, title, subtitle]
  );

  React.useEffect(() => {
    if (!map || !isLoaded) return;

    let animId: number | null = null;

    try {
      // 1. Add Incident GeoJSON source or update dynamically
      const existingSource = map.getSource(sourceId) as GeoJSONSource | undefined;
      if (!existingSource) {
        map.addSource(sourceId, {
          type: "geojson",
          data: incidentGeoJSON,
        });
      } else {
        existingSource.setData(incidentGeoJSON);
      }

      // 2. Add outer animated radar pulse blip layer
      if (!map.getLayer(pulseLayerId)) {
        map.addLayer({
          id: pulseLayerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 8,
            "circle-color": "#ef4444",
            "circle-opacity": 0.45,
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#f87171",
            "circle-stroke-opacity": 0.7,
            "circle-pitch-alignment": "map",
          },
        });
      }

      // 3. Add soft ambient glow layer
      if (!map.getLayer(glowLayerId)) {
        map.addLayer({
          id: glowLayerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 14,
            "circle-color": "#ef4444",
            "circle-opacity": 0.3,
            "circle-blur": 0.4,
            "circle-pitch-alignment": "map",
          },
        });
      }

      // 4. Add core vibrant red sphere circle layer
      if (!map.getLayer(coreLayerId)) {
        map.addLayer({
          id: coreLayerId,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 8,
            "circle-color": "#ef4444",
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#ffffff",
            "circle-pitch-alignment": "map",
          },
        });
      }

      // 5. Smooth 60 FPS radar blip animation loop
      const start = performance.now();
      const runAnimation = () => {
        const elapsed = performance.now() - start;
        const progress = (elapsed % 1800) / 1800; // 0 to 1

        // Eased radius expansion from 8px to 30px
        const currentRadius = 8 + progress * 22;
        // Fade opacity from 0.6 down to 0
        const currentOpacity = 0.6 * (1 - progress);
        const strokeOpacity = 0.8 * (1 - progress);

        if (map.getLayer(pulseLayerId)) {
          map.setPaintProperty(pulseLayerId, "circle-radius", currentRadius);
          map.setPaintProperty(pulseLayerId, "circle-opacity", currentOpacity);
          map.setPaintProperty(
            pulseLayerId,
            "circle-stroke-opacity",
            strokeOpacity
          );
        }

        animId = requestAnimationFrame(runAnimation);
      };

      animId = requestAnimationFrame(runAnimation);
    } catch (err) {
      console.warn("Incident layer initialization error:", err);
    }

    const handleClick = () => {
      setShowPopup(true);
      onSelectCoords?.({ lat, lng });
    };

    const handleMouseEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    const handleMapClick = (e: MapMouseEvent) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [coreLayerId],
      });
      if (!features.length) {
        setShowPopup(false);
        onSelectCoords?.(null);
      }
    };

    map.on("click", coreLayerId, handleClick);
    map.on("click", handleMapClick);
    map.on("mouseenter", coreLayerId, handleMouseEnter);
    map.on("mouseleave", coreLayerId, handleMouseLeave);

    return () => {
      if (animId) cancelAnimationFrame(animId);

      map.off("click", coreLayerId, handleClick);
      map.off("click", handleMapClick);
      map.off("mouseenter", coreLayerId, handleMouseEnter);
      map.off("mouseleave", coreLayerId, handleMouseLeave);

      try {
        if (map.getLayer(coreLayerId)) map.removeLayer(coreLayerId);
        if (map.getLayer(glowLayerId)) map.removeLayer(glowLayerId);
        if (map.getLayer(pulseLayerId)) map.removeLayer(pulseLayerId);
        if (map.getSource(sourceId)) map.removeSource(sourceId);
      } catch {
        // ignore cleanup
      }
    };
  }, [
    map,
    isLoaded,
    sourceId,
    pulseLayerId,
    glowLayerId,
    coreLayerId,
    incidentGeoJSON,
    lat,
    lng,
    onSelectCoords,
  ]);

  return (
    <>
      {showPopup && (
        <MapPopup
          longitude={lng}
          latitude={lat}
          onClose={() => {
            setShowPopup(false);
            onSelectCoords?.(null);
          }}
          closeOnClick={true}
          focusAfterOpen={false}
          offset={12}
          className="border-2 border-border/80 bg-popover/95 backdrop-blur-md rounded-lg shadow-2xl p-2.5 min-w-[150px] max-w-[190px] z-50 text-xs"
        >
          <div className="flex flex-col gap-1.5">
            {/* Header: Mini Red Badge */}
            <div className="flex items-center gap-1.5">
              <Badge
                variant="outline"
                className="h-4 px-1.5 py-0 text-[9px] font-semibold border-rose-500/30 text-rose-400 bg-rose-500/10 gap-1 rounded-xs uppercase tracking-wider"
              >
                <span className="size-1 rounded-full bg-rose-500 animate-pulse" />
                Incident Site
              </Badge>
            </div>

            {/* Location Title & Subtitle */}
            <div className="flex flex-col leading-tight">
              <h4 className="text-xs font-bold text-foreground tracking-tight truncate">
                {title}
              </h4>
              <p className="text-[10px] text-muted-foreground mt-0.5 truncate">
                {subtitle}
              </p>
            </div>
          </div>
        </MapPopup>
      )}
    </>
  );
}

/**
 * Extracts the exact incident location by analyzing the case description,
 * avoiding duplicate city names in the title and subtitle.
 */
export function CaseIncidentLocationCard({
  caseData,
  className,
}: CaseIncidentLocationCardProps) {
  const [mounted, setMounted] = React.useState(false);
  const mapRef = React.useRef<MapRef>(null);

  React.useEffect(() => {
    setMounted(true);

    const onFullscreenChange = () => {
      setTimeout(() => {
        mapRef.current?.resize();
      }, 50);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  // Dynamically resolve the precise, unique location and coordinates according to the case description
  const resolvedLoc = React.useMemo(
    () => resolveCaseLocation(caseData),
    [caseData]
  );

  const exactLocationTitle = resolvedLoc.title;
  const locationSubtitle = resolvedLoc.subtitle;
  const [lng, lat] = resolvedLoc.coordinates;

  // Track dynamically selected point coordinates (defaults to incident center)
  const [selectedCoords, setSelectedCoords] = React.useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // When case changes, reset selected coordinates and smoothly pan/fly to the new precise location
  React.useEffect(() => {
    setSelectedCoords(null);
    if (mapRef.current) {
      try {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 14,
          essential: true,
        });
      } catch {
        // Map initializing
      }
    }
  }, [lng, lat, caseData.id, caseData.caseNumber]);

  const displayLat = selectedCoords ? selectedCoords.lat : lat;
  const displayLng = selectedCoords ? selectedCoords.lng : lng;

  const googleMapsUrl = resolvedLoc.googleMapsUrl;

  return (
    <Card
      className={`border-2 border-border/80 bg-card/40 backdrop-blur-xs rounded-xl shadow-xs ${
        className || ""
      }`}
    >
      {/* Header with direct location icon and external map link */}
      <CardHeader className="flex flex-row items-center justify-between pb-3.5 border-b-2 border-border/60">
        <div className="flex items-center gap-2.5">
          <MapPin className="size-4.5 text-[#0070F3] shrink-0" />
          <CardTitle className="text-sm sm:text-base font-bold font-heading text-foreground">
            Incident Location
          </CardTitle>
        </div>
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-[#0070F3] hover:text-[#0070F3]/80 transition-colors cursor-pointer group"
        >
          <span>View on Map</span>
          <ArrowUpRight className="size-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </a>
      </CardHeader>

      <CardContent className="pt-4 pb-4 px-4 sm:px-5">
        {/* Interactive @mapcn/map Component Container with border-2 */}
        <div className="relative aspect-[16/9] w-full rounded-lg overflow-hidden border-2 border-border/80 bg-[#090D14] shadow-inner">
          {mounted ? (
            <Map
              ref={mapRef}
              theme="dark"
              attributionControl={false}
              center={[lng, lat]}
              zoom={14}
              className="w-full h-full [&_.maplibregl-ctrl-attrib]:hidden! [&_.maplibregl-ctrl-attrib-button]:hidden!"
            >
              {/* Expand / Fullscreen Control Only (Top-Right) */}
              <MapControls
                position="top-right"
                showZoom={false}
                showFullscreen={true}
                className="top-2.5 right-2.5 [&>div]:bg-background/85! [&>div]:backdrop-blur-md! [&>div]:border-2! [&>div]:border-border/80! [&_button]:text-muted-foreground! [&_button:hover]:text-foreground! [&_button:hover]:bg-accent/50! shadow-xs"
              />

              {/* Blue Forensic Markers Layer */}
              <MarkersLayer
                centerLng={lng}
                centerLat={lat}
                onSelectCoords={setSelectedCoords}
              />

              {/* Red Incident GeoJSON Layer with smooth animated radar blip */}
              <IncidentLocationLayer
                lng={lng}
                lat={lat}
                title={exactLocationTitle}
                subtitle={locationSubtitle}
                onSelectCoords={setSelectedCoords}
              />
            </Map>
          ) : (
            <div className="w-full h-full bg-[#0A0E17] flex items-center justify-center">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="size-2 rounded-full bg-[#0070F3] animate-pulse" />
                <span>Loading map data...</span>
              </div>
            </div>
          )}

          {/* Coordinates Overlay Tag (Top-Left) with dynamic coordinates */}
          <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
            <Badge
              variant="outline"
              className="h-6 rounded-md border-2 border-border/80 bg-background/85 px-2 text-[10px] font-heading font-medium tracking-wide text-muted-foreground backdrop-blur-md shadow-xs transition-colors duration-200"
            >
              {displayLat.toFixed(4)}° N, {displayLng.toFixed(4)}° E
            </Badge>
          </div>

          {/* Location Badge Overlay (Bottom-Left) with shadcn Badge */}
          <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
            <Badge
              variant="outline"
              className="h-7 items-center gap-2 rounded-md border-2 border-border/80 bg-background/85 px-2.5 text-xs font-heading font-medium backdrop-blur-md shadow-xs"
            >
              <span className="font-semibold text-foreground tracking-tight">
                {exactLocationTitle}
              </span>
              <span className="text-muted-foreground/40 text-[11px] select-none">|</span>
              <span className="text-[11px] text-muted-foreground font-normal">
                {locationSubtitle}
              </span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
