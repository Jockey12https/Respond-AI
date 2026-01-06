"use client";

import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { twsmAPI, CrisisData as TWSMCrisisData } from "@/lib/api";
import { CrisisData as FirebaseCrisisData } from "@/lib/firestore";

// Unified CrisisData type that works with both sources
type CrisisData = TWSMCrisisData | FirebaseCrisisData;

interface AuthorityCrisisMapProps {
    onCrisisSelect?: (crisis: CrisisData) => void;
    onDataLoad?: (count: number) => void;
    zoneFilter?: string; // Optional zone name to filter crises
    crises?: CrisisData[]; // Real crisis data from Firebase (if provided, uses this instead of TWSM)
}

const AuthorityCrisisMap: React.FC<AuthorityCrisisMapProps> = ({
    onCrisisSelect,
    onDataLoad,
    zoneFilter,
    crises
}) => {
    const [map, setMap] = useState<L.Map | null>(null);
    const [selectedCrisis, setSelectedCrisis] = useState<CrisisData | null>(null);
    const [twsmCrisisData, setTwsmCrisisData] = useState<CrisisData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch crisis data from TWSM backend (only if crises prop is not provided)
    useEffect(() => {
        if (crises) {
            // If Firebase crises are provided, skip TWSM fetch
            setLoading(false);
            return;
        }

        const fetchCrisisData = async () => {
            try {
                setLoading(true);
                setError(null);

                // First, check if we have data
                const reports = await twsmAPI.getReports({ limit: 50 });

                // If no reports, seed mock data
                if (reports.length === 0) {
                    console.log("No reports found, seeding mock data...");
                    await twsmAPI.seedMockReports();
                    // Fetch again after seeding
                    const newReports = await twsmAPI.getReports({ limit: 50 });
                    const twsmCrises = newReports.map(r => twsmAPI.convertToCrisisData(r));
                    setTwsmCrisisData(twsmCrises);
                    onDataLoad?.(twsmCrises.length);
                } else {
                    const twsmCrises = reports.map(r => twsmAPI.convertToCrisisData(r));
                    setTwsmCrisisData(twsmCrises);
                    onDataLoad?.(twsmCrises.length);
                }

                setLoading(false);
            } catch (err) {
                console.error("Error fetching crisis data:", err);
                setError("Failed to load crisis data from backend");
                setLoading(false);
            }
        };

        fetchCrisisData();
    }, [crises, onDataLoad]);

    // Use Firebase crises if provided, otherwise use TWSM data
    const crisisData = crises || twsmCrisisData;

    // Filter crises based on zone if zoneFilter is provided
    const filteredCrises = zoneFilter
        ? crisisData.filter(crisis => crisis.zone?.toLowerCase().includes(zoneFilter.toLowerCase()))
        : crisisData;

    // Initialize map once
    useEffect(() => {
        if (typeof window === "undefined") return;

        // Initialize map centered on Kerala
        const mapInstance = L.map("moderator-crisis-map").setView([10.8505, 76.2711], 7);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(mapInstance);

        setMap(mapInstance);

        // Cleanup
        return () => {
            mapInstance.remove();
        };
    }, []);

    // Update markers when filtered crises change
    useEffect(() => {
        if (!map) return;

        // Clear existing markers
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        const createCustomIcon = (priority: string) => {
            const colors = {
                critical: "#dc2626", // red
                high: "#f97316", // orange
                medium: "#eab308", // yellow
            };

            return L.divIcon({
                className: "custom-crisis-marker",
                html: `
          <div style="
            background: ${colors[priority as keyof typeof colors] || colors.medium};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            animation: pulse 2s infinite;
          ">
            🚨
          </div>
        `,
                iconSize: [30, 30],
                iconAnchor: [15, 15],
            });
        };

        // Add markers for filtered crises
        filteredCrises.forEach((crisis) => {
            const marker = L.marker([crisis.lat, crisis.lng], {
                icon: createCustomIcon(crisis.priority),
            }).addTo(map);

            // Check if crisis has TWSM scores (from backend) or not (from Firebase)
            const hasTWSMScores = 'finalPriority' in crisis && 'action' in crisis;

            marker.bindPopup(`
        <div style="font-family: system-ui; min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #1e293b; font-size: 16px; font-weight: bold;">
            ${crisis.location}
          </h3>
          <div style="color: #475569; font-size: 14px; line-height: 1.6;">
            <p style="margin: 4px 0;"><strong>Type:</strong> ${crisis.crisisType}</p>
            <p style="margin: 4px 0;"><strong>Priority:</strong> 
              <span style="color: ${crisis.priority === 'critical' ? '#dc2626' : crisis.priority === 'high' ? '#f97316' : '#eab308'}; text-transform: uppercase; font-weight: bold;">
                ${crisis.priority}
              </span>
            </p>
            ${hasTWSMScores ? `
            <p style="margin: 4px 0;"><strong>TWSM Score:</strong> ${(crisis as any).finalPriority.toFixed(3)}</p>
            <p style="margin: 4px 0;"><strong>Action:</strong> ${(crisis as any).action}</p>
            ` : ''}
            <p style="margin: 4px 0;"><strong>Affected:</strong> ${crisis.affectedPeople?.toLocaleString() || 'Unknown'} people</p>
            <p style="margin: 4px 0;"><strong>Zone:</strong> ${crisis.zone}</p>
          </div>
        </div>
      `);

            marker.on("click", () => {
                setSelectedCrisis(crisis);
                if (onCrisisSelect) {
                    onCrisisSelect(crisis);
                }
            });
        });
    }, [map, filteredCrises, onCrisisSelect]);

    return (
        <div className="h-full w-full relative">
            <div id="moderator-crisis-map" className="h-full w-full rounded-xl overflow-hidden"></div>

            {/* Empty State */}
            {filteredCrises.length === 0 && !loading && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-[1000]">
                    <div className="glass rounded-xl p-8">
                        <div className="text-6xl mb-4">📍</div>
                        <h3 className="text-xl font-bold mb-2">No Crises Reported</h3>
                        <p className="text-gray-400 text-sm">
                            {zoneFilter
                                ? `No crises found in ${zoneFilter}`
                                : "No crisis incidents have been reported yet"}
                        </p>
                    </div>
                </div>
            )}

            {/* Legend */}
            <div className="absolute top-4 right-4 glass rounded-lg p-4 z-[1000]">
                <h3 className="text-sm font-bold mb-3">Crisis Priority</h3>
                <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-600"></div>
                        <span>Critical</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                        <span>High</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
                        <span>Medium</span>
                    </div>
                </div>
            </div>

            {/* Stats Card */}
            <div className="absolute bottom-4 left-4 glass rounded-lg p-4 z-[1000] min-w-[250px]">
                <h3 className="text-sm font-bold mb-3">
                    {zoneFilter ? `${zoneFilter} Overview` : 'Crisis Overview'}
                </h3>
                {loading ? (
                    <div className="text-xs text-gray-400">Loading crisis data...</div>
                ) : error ? (
                    <div className="text-xs text-red-400">{error}</div>
                ) : (
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Total Crises:</span>
                            <span className="font-bold">{filteredCrises.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Critical:</span>
                            <span className="font-bold text-red-500">
                                {filteredCrises.filter((c) => c.priority === "critical").length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">High Priority:</span>
                            <span className="font-bold text-orange-500">
                                {filteredCrises.filter((c) => c.priority === "high").length}
                            </span>
                        </div>
                        {!crises && twsmCrisisData.length > 0 && (
                            <div className="flex justify-between border-t border-white/10 pt-2 mt-2">
                                <span className="text-gray-400">Avg TWSM Score:</span>
                                <span className="font-bold text-blue-400">
                                    {twsmCrisisData.length > 0
                                        ? (twsmCrisisData.reduce((sum, c) => sum + ((c as any).finalPriority || 0), 0) / twsmCrisisData.length).toFixed(3)
                                        : '0.000'}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <style jsx global>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.1);
            opacity: 0.8;
          }
        }
      `}</style>
        </div>
    );
};

export default AuthorityCrisisMap;
