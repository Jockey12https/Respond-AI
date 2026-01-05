"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { mockMapMarkers } from "@/lib/mockData";
import "leaflet-routing-machine";

// Fix for Leaflet default icon in Next.js/Webpack
const fixLeafletIcon = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
};

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
    const [destinationCoords, setDestinationCoords] = useState<[number, number] | null>(null);

    useEffect(() => {
        if (!mapRef.current) return;

        // Apply Icon Fix
        fixLeafletIcon();

        const timer = setTimeout(() => {
            try {
                // Initialize map
                const map = L.map(mapRef.current!, {
                    center: [20.5937, 78.9629], // Center of India
                    zoom: 5,
                });

                // Use CartoDB Voyager for a cleaner, less cluttered map
                L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: 'abcd',
                    maxZoom: 20
                }).addTo(map);

                // Get user's location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const userPos: [number, number] = [
                                position.coords.latitude,
                                position.coords.longitude,
                            ];
                            setUserLocation(userPos);

                            // Only add marker if map is still valid
                            if (map && mapRef.current) {
                                L.marker(userPos, {
                                    icon: L.divIcon({
                                        html: '<div style="font-size: 30px;">📍</div>',
                                        className: "user-marker",
                                        iconSize: [30, 30],
                                        iconAnchor: [15, 30],
                                    }),
                                })
                                    .addTo(map)
                                    .bindPopup("<b>Your Location</b>");

                                map.setView(userPos, 13);
                            }
                        },
                        (error) => {
                            console.log("Location access denied:", error);
                        }
                    );
                }

                mapInstanceRef.current = map;

                // Force refresh
                setTimeout(() => {
                    if (map) {
                        map.invalidateSize();
                    }
                }, 100);
            } catch (error) {
                console.error("Map initialization error:", error);
            }
        }, 100);

        return () => {
            clearTimeout(timer);
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstanceRef.current) return;

        // Clear existing markers (except user location and route markers)
        mapInstanceRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker &&
                !(layer as any)._icon?.classList.contains("user-marker") &&
                !(layer as any)._icon?.classList.contains("route-marker")) {
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
        let emoji = "🏥";
        let color = "border-red-500";

        switch (type) {
            case "police": emoji = "👮"; color = "border-blue-500"; break;
            case "fire": emoji = "🚒"; color = "border-orange-500"; break;
            case "relief": emoji = "⛺"; color = "border-green-500"; break;
        }

        return `<div class="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-xl border-2 ${color} transform -translate-x-1/2 -translate-y-1/2 text-2xl hover:scale-110 transition-transform cursor-pointer">${emoji}</div>`;
    };

    const handleRouteSearch = async () => {
        if (!searchDestination || !mapInstanceRef.current || !userLocation) {
            if (!userLocation) alert("Waiting for your location...");
            return;
        }

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
                setDestinationCoords([destLat, destLng]);

                // Remove existing routing control
                if (routingControlRef.current) {
                    try {
                        mapInstanceRef.current.removeControl(routingControlRef.current);
                    } catch (e) {
                        // ignore if already removed
                    }
                }

                // Create routing control with Leaflet Routing Machine
                const routingControl = L.Routing.control({
                    waypoints: [
                        L.latLng(userLocation[0], userLocation[1]),
                        L.latLng(destLat, destLng),
                    ],
                    router: new (L as any).Routing.OSRMv1({
                        serviceUrl: 'https://router.project-osrm.org/route/v1',
                        profile: 'driving'
                    }),
                    routeWhileDragging: false,
                    addWaypoints: false,
                    lineOptions: {
                        styles: [{ color: "#22c55e", opacity: 0.8, weight: 6 }],
                    },
                    show: true, // Show itinerary container
                    createMarker: function (i: number, waypoint: any, n: number) {
                        // Only show destination marker (last point)
                        // Skip start marker (i=0) as we already have a user location marker
                        if (i === n - 1) {
                            return L.marker(waypoint.latLng, {
                                icon: L.divIcon({
                                    html: '<div class="text-3xl">🎯</div>',
                                    className: "route-marker",
                                    iconSize: [40, 40],
                                    iconAnchor: [20, 20],
                                }),
                            });
                        }
                        return null;
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
            alert("Error finding route. Please check connection.");
        }
    };

    const openGoogleMaps = () => {
        if (userLocation && destinationCoords) {
            const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${destinationCoords[0]},${destinationCoords[1]}`;
            window.open(url, '_blank');
        } else if (searchDestination) {
            const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchDestination)}`;
            window.open(url, '_blank');
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
                        <div className="mt-4 flex flex-col gap-3">
                            <div className="flex gap-3">
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

                            {/* Google Maps Fallback */}
                            {(destinationCoords || searchDestination) && (
                                <button
                                    onClick={openGoogleMaps}
                                    className="self-start text-sm text-gray-400 hover:text-white flex items-center gap-2 px-1"
                                >
                                    <span>↗️</span> Open in Google Maps
                                </button>
                            )}
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
            <div className="flex-1 relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
                <div ref={mapRef} className="absolute inset-0 z-0" />
            </div>

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
