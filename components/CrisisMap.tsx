"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { mockMapMarkers } from "@/lib/mockData";
import "leaflet-routing-machine";

declare module "leaflet" {
    namespace Routing {
        function control(options: any): any;
    }
}

const CrisisMap: React.FC = () => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const routingControlRef = useRef<any>(null);
    const [searchDestination, setSearchDestination] = useState("");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [showRouteInput, setShowRouteInput] = useState(false);
    const [showMarkers, setShowMarkers] = useState(true);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map centered on Delhi, India
        const map = L.map(mapRef.current).setView([28.6139, 77.2090], 12);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        // Try to get user's location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const userPos: [number, number] = [
                        position.coords.latitude,
                        position.coords.longitude,
                    ];
                    setUserLocation(userPos);

                    // Add user location marker
                    L.marker(userPos, {
                        icon: L.divIcon({
                            html: '<div class="text-3xl">📍</div>',
                            className: "user-location-marker",
                            iconSize: [40, 40],
                        }),
                    })
                        .addTo(map)
                        .bindPopup("<b>Your Location</b>");

                    map.setView(userPos, 13);
                },
                (error) => {
                    console.log("Geolocation error:", error);
                    // Default to Delhi if geolocation fails
                    setUserLocation([28.6139, 77.2090]);
                }
            );
        } else {
            setUserLocation([28.6139, 77.2090]);
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers (except user location)
        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker && !(layer as any)._icon?.classList.contains("user-location-marker")) {
                mapInstanceRef.current?.removeLayer(layer);
            }
        });

        // Add all emergency center markers if enabled
        if (showMarkers) {
            mockMapMarkers.forEach((marker) => {
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
        }
    }, [showMarkers]);

    const getMarkerIcon = (type: string): string => {
        // Use consistent emoji for all emergency centers
        return '<div class="text-3xl">🏥</div>';
    };

    const handleRouteSearch = async () => {
        if (!searchDestination || !mapInstanceRef.current || !userLocation) return;

        try {
            // Search for destination
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                    searchDestination + ", India"
                )}&format=json&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const destLat = parseFloat(data[0].lat);
                const destLng = parseFloat(data[0].lon);

                // Remove existing routing control
                if (routingControlRef.current) {
                    mapInstanceRef.current.removeControl(routingControlRef.current);
                }

                // Create routing control with Leaflet Routing Machine
                const routingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(userLocation[0], userLocation[1]),
                        L.latLng(destLat, destLng),
                    ],
                    routeWhileDragging: false,
                    addWaypoints: false,
                    lineOptions: {
                        styles: [{ color: "#22c55e", opacity: 0.8, weight: 6 }],
                    },
                    createMarker: function (i: number, waypoint: any) {
                        const icon = i === 0 ? "📍" : "🎯";
                        return L.marker(waypoint.latLng, {
                            icon: L.divIcon({
                                html: `<div class="text-3xl">${icon}</div>`,
                                className: "route-marker",
                                iconSize: [40, 40],
                            }),
                        });
                    },
                }).addTo(mapInstanceRef.current);

                routingControlRef.current = routingControl;

                // Zoom to show the route
                mapInstanceRef.current.fitBounds([
                    [userLocation[0], userLocation[1]],
                    [destLat, destLng],
                ]);
            } else {
                alert("Location not found. Please try a different search term.");
            }
        } catch (error) {
            console.error("Route search error:", error);
            alert("Error finding route. Please try again.");
        }
    };

    return (
        <div className="h-full overflow-hidden p-8 flex flex-col">
            <div className="mb-6">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-safe-400 bg-clip-text text-transparent">
                    Crisis Map
                </h2>
                <p className="text-gray-400 mb-4">
                    Real-time view of emergency centers and safe routes
                </p>

                {/* Route Finding */}
                <div className="glass rounded-xl p-4 mb-4">
                    <button
                        onClick={() => setShowRouteInput(!showRouteInput)}
                        className="flex items-center gap-2 font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <span className="text-xl">🗺️</span>
                        {showRouteInput ? "Hide" : "Find"} Safe Route
                    </button>

                    {showRouteInput && (
                        <div className="mt-4 flex gap-3">
                            <input
                                type="text"
                                value={searchDestination}
                                onChange={(e) => setSearchDestination(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleRouteSearch()}
                                placeholder="Enter destination (e.g., AIIMS Delhi)"
                                className="flex-1 px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                            <button
                                onClick={handleRouteSearch}
                                className="px-6 py-3 bg-gradient-to-r from-safe-600 to-safe-700 hover:from-safe-500 hover:to-safe-600 rounded-lg font-medium transition-all"
                            >
                                Find Route
                            </button>
                        </div>
                    )}
                </div>

                {/* Single Toggle for Emergency Centers */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowMarkers(!showMarkers)}
                        className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${showMarkers
                                ? "bg-blue-600 shadow-lg"
                                : "glass opacity-50 hover:opacity-100"
                            }`}
                    >
                        🏥 Emergency Centres
                    </button>
                    {showMarkers && (
                        <p className="text-sm text-gray-400">
                            Showing hospitals, police, fire stations & relief centers
                        </p>
                    )}
                </div>
            </div>

            {/* Map Container */}
            <div ref={mapRef} className="flex-1 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20" />

            {/* Legend */}
            <div className="mt-4 glass-dark rounded-lg p-4">
                <p className="text-sm text-gray-400">
                    <span className="font-semibold text-blue-400">ℹ️ Tip:</span> Search for a
                    destination to find the safest route from your location. Click markers for
                    details about emergency centers.
                </p>
            </div>
        </div>
    );
};

export default CrisisMap;
