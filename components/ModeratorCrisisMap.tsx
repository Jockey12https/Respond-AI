"use client";

import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Mock crisis data for Kerala
const MOCK_CRISIS_DATA = [
    {
        id: 1,
        location: "Thiruvananthapuram",
        lat: 8.5241,
        lng: 76.9366,
        priority: "high",
        crisisType: "Flood",
        affectedPeople: 2500,
        zone: "South Kerala Zone",
        zoneModerator: "Rajesh Kumar",
        crisisLevel: "Critical",
        status: "verified",
        description: "Severe flooding in coastal areas, immediate evacuation required",
    },
    {
        id: 2,
        location: "Kochi",
        lat: 9.9312,
        lng: 76.2673,
        priority: "critical",
        crisisType: "Landslide",
        affectedPeople: 1200,
        zone: "Central Kerala Zone",
        zoneModerator: "Priya Menon",
        crisisLevel: "Extreme",
        status: "verified",
        description: "Multiple landslides blocking major roads, rescue operations ongoing",
    },
    {
        id: 3,
        location: "Kozhikode",
        lat: 11.2588,
        lng: 75.7804,
        priority: "medium",
        crisisType: "Cyclone Warning",
        affectedPeople: 5000,
        zone: "North Kerala Zone",
        zoneModerator: "Anil Nair",
        crisisLevel: "High",
        status: "verified",
        description: "Cyclone approaching coastal regions, evacuation advisory issued",
    },
    {
        id: 4,
        location: "Alappuzha",
        lat: 9.4981,
        lng: 76.3388,
        priority: "high",
        crisisType: "Flood",
        affectedPeople: 3200,
        zone: "Central Kerala Zone",
        zoneModerator: "Priya Menon",
        crisisLevel: "Critical",
        status: "verified",
        description: "Backwater flooding affecting multiple villages",
    },
    {
        id: 5,
        location: "Wayanad",
        lat: 11.6854,
        lng: 76.1320,
        priority: "critical",
        crisisType: "Landslide",
        affectedPeople: 800,
        zone: "North Kerala Zone",
        zoneModerator: "Anil Nair",
        crisisLevel: "Extreme",
        status: "verified",
        description: "Multiple landslides in hilly regions, villages isolated",
    },
    {
        id: 6,
        location: "Kannur",
        lat: 11.8745,
        lng: 75.3704,
        priority: "medium",
        crisisType: "Heavy Rainfall",
        affectedPeople: 1500,
        zone: "North Kerala Zone",
        zoneModerator: "Anil Nair",
        crisisLevel: "Moderate",
        status: "verified",
        description: "Continuous heavy rainfall, potential flood risk",
    },
];

interface ModeratorCrisisMapProps {
    onCrisisSelect?: (crisis: typeof MOCK_CRISIS_DATA[0]) => void;
}

const ModeratorCrisisMap: React.FC<ModeratorCrisisMapProps> = ({ onCrisisSelect }) => {
    const [map, setMap] = useState<L.Map | null>(null);
    const [selectedCrisis, setSelectedCrisis] = useState<typeof MOCK_CRISIS_DATA[0] | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;

        // Initialize map centered on Kerala
        const mapInstance = L.map("moderator-crisis-map").setView([10.8505, 76.2711], 7);

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(mapInstance);

        // Define custom icons for different priority levels
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

        // Add markers for each crisis
        MOCK_CRISIS_DATA.forEach((crisis) => {
            const marker = L.marker([crisis.lat, crisis.lng], {
                icon: createCustomIcon(crisis.priority),
            }).addTo(mapInstance);

            // Add popup
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
            <p style="margin: 4px 0;"><strong>Affected:</strong> ${crisis.affectedPeople.toLocaleString()} people</p>
            <p style="margin: 4px 0;"><strong>Zone:</strong> ${crisis.zone}</p>
          </div>
        </div>
      `);

            // Add click handler
            marker.on("click", () => {
                setSelectedCrisis(crisis);
                if (onCrisisSelect) {
                    onCrisisSelect(crisis);
                }
            });
        });

        setMap(mapInstance);

        // Cleanup
        return () => {
            mapInstance.remove();
        };
    }, [onCrisisSelect]);

    return (
        <div className="h-full w-full relative">
            <div id="moderator-crisis-map" className="h-full w-full rounded-xl overflow-hidden"></div>

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
                <h3 className="text-sm font-bold mb-3">Kerala Crisis Overview</h3>
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-400">Total Crises:</span>
                        <span className="font-bold">{MOCK_CRISIS_DATA.length}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Critical:</span>
                        <span className="font-bold text-red-500">
                            {MOCK_CRISIS_DATA.filter(c => c.priority === "critical").length}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">High Priority:</span>
                        <span className="font-bold text-orange-500">
                            {MOCK_CRISIS_DATA.filter(c => c.priority === "high").length}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-400">Total Affected:</span>
                        <span className="font-bold text-warning-400">
                            {MOCK_CRISIS_DATA.reduce((sum, c) => sum + c.affectedPeople, 0).toLocaleString()}
                        </span>
                    </div>
                </div>
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

export { MOCK_CRISIS_DATA };
export default ModeratorCrisisMap;
