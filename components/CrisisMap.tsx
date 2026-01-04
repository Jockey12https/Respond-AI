"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { mockMapMarkers } from "@/lib/mockData";
import { MarkerType } from "@/types";

const CrisisMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const [activeFilters, setActiveFilters] = useState<Set<MarkerType>>(
        new Set(Object.values(MarkerType))
    );

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current).setView([40.7128, -74.006], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers
        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapInstanceRef.current?.removeLayer(layer);
            }
        });

        // Add filtered markers
        mockMapMarkers
            .filter((marker) => activeFilters.has(marker.type))
            .forEach((marker) => {
                const icon = getMarkerIcon(marker.type);
                const leafletMarker = L.marker([marker.location.lat, marker.location.lng], {
                    icon: L.divIcon({
                        html: icon,
                        className: "custom-marker",
                        iconSize: [40, 40],
                    }),
                });

                leafletMarker
                    .bindPopup(
                        `<div class="p-2">
              <h3 class="font-bold text-lg mb-1">${marker.name}</h3>
              <p class="text-sm text-gray-600 mb-1">${marker.description || ""}</p>
              ${marker.status ? `<p class="text-xs text-green-600 font-semibold">${marker.status}</p>` : ""}
            </div>`
                    )
                    .addTo(mapInstanceRef.current!);
            });
    }, [activeFilters]);

    const getMarkerIcon = (type: MarkerType): string => {
        const icons = {
            [MarkerType.Hospital]: "🏥",
            [MarkerType.Emergency]: "🚔",
            [MarkerType.Relief]: "🏕️",
            [MarkerType.Unsafe]: "⚠️",
            [MarkerType.SafeRoute]: "✅",
        };
        return `<div class="text-3xl">${icons[type]}</div>`;
    };

    const toggleFilter = (type: MarkerType) => {
        setActiveFilters((prev) => {
            const newFilters = new Set(prev);
            if (newFilters.has(type)) {
                newFilters.delete(type);
            } else {
                newFilters.add(type);
            }
            return newFilters;
        });
    };

    const filterButtons: { type: MarkerType; label: string; color: string }[] = [
        { type: MarkerType.Hospital, label: "🏥 Hospitals", color: "bg-blue-600" },
        { type: MarkerType.Emergency, label: "🚔 Emergency", color: "bg-crisis-600" },
        { type: MarkerType.Relief, label: "🏕️ Relief Centers", color: "bg-safe-600" },
        { type: MarkerType.Unsafe, label: "⚠️ Unsafe Zones", color: "bg-warning-600" },
    ];

    return (
        <div className="h-full overflow-hidden p-8 flex flex-col">
            <div className="mb-6">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-safe-400 bg-clip-text text-transparent">
                    Crisis Map
                </h2>
                <p className="text-gray-400 mb-4">
                    Real-time view of emergency services and critical locations
                </p>

                {/* Filter Buttons */}
                <div className="flex flex-wrap gap-3">
                    {filterButtons.map((btn) => (
                        <button
                            key={btn.type}
                            onClick={() => toggleFilter(btn.type)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${activeFilters.has(btn.type)
                                    ? `${btn.color} shadow-lg`
                                    : "glass opacity-50 hover:opacity-100"
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Map Container */}
            <div ref={mapRef} className="flex-1 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20" />

            {/* Legend */}
            <div className="mt-4 glass-dark rounded-lg p-4">
                <p className="text-sm text-gray-400">
                    <span className="font-semibold text-blue-400">ℹ️ Tip:</span> Click on markers
                    for more information. Use layer controls above to filter locations.
                </p>
            </div>
        </div>
    );
};

export default CrisisMap;
