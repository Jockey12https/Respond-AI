"use client";

import React, { useState, useEffect, useRef } from "react";
import { IncidentType, Location } from "@/types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const IncidentReport: React.FC = () => {
    const [formData, setFormData] = useState({
        type: IncidentType.Other,
        description: "",
        location: { lat: 28.6139, lng: 77.2090, address: "" } as Location,
    });
    const [submitted, setSubmitted] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mapInitialized, setMapInitialized] = useState(false);
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);
    const circleRef = useRef<L.Circle | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            try {
                // Initialize map centered on Delhi, India
                const map = L.map(mapRef.current!, {
                    center: [28.6139, 77.2090],
                    zoom: 11,
                    scrollWheelZoom: true,
                });

                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "© OpenStreetMap contributors",
                    maxZoom: 19,
                }).addTo(map);

                // Add initial marker with pulse animation
                const marker = L.marker([28.6139, 77.2090], {
                    draggable: true,
                    icon: L.divIcon({
                        html: '<div style="font-size: 40px;">📍</div>',
                        className: "custom-marker",
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                    }),
                }).addTo(map);

                // Add highlight circle around marker
                const circle = L.circle([28.6139, 77.2090], {
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.2,
                    radius: 500,
                }).addTo(map);

                marker.on("dragend", async function () {
                    const position = marker.getLatLng();

                    // Update circle position
                    circle.setLatLng(position);

                    setFormData((prev) => ({
                        ...prev,
                        location: {
                            lat: position.lat,
                            lng: position.lng,
                            address: prev.location.address,
                        },
                    }));

                    // Reverse geocoding to get address
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lng}&format=json`
                        );
                        const data = await response.json();
                        if (data.display_name) {
                            setFormData((prev) => ({
                                ...prev,
                                location: {
                                    ...prev.location,
                                    address: data.display_name,
                                },
                            }));
                            setSearchQuery(data.display_name);
                        }
                    } catch (error) {
                        console.error("Geocoding error:", error);
                    }
                });

                map.on("click", async function (e) {
                    marker.setLatLng(e.latlng);
                    circle.setLatLng(e.latlng);

                    setFormData((prev) => ({
                        ...prev,
                        location: {
                            lat: e.latlng.lat,
                            lng: e.latlng.lng,
                            address: prev.location.address,
                        },
                    }));

                    // Reverse geocoding
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${e.latlng.lat}&lon=${e.latlng.lng}&format=json`
                        );
                        const data = await response.json();
                        if (data.display_name) {
                            setFormData((prev) => ({
                                ...prev,
                                location: {
                                    ...prev.location,
                                    address: data.display_name,
                                },
                            }));
                            setSearchQuery(data.display_name);
                        }
                    } catch (error) {
                        console.error("Geocoding error:", error);
                    }
                });

                mapInstanceRef.current = map;
                markerRef.current = marker;
                circleRef.current = circle;
                setMapInitialized(true);

                // Force map to refresh after initialization
                setTimeout(() => {
                    map.invalidateSize();
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

    // Search location and zoom to it
    const handleLocationSearch = async () => {
        if (!searchQuery || !mapInstanceRef.current) return;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                    searchQuery + ", India"
                )}&format=json&limit=1`
            );
            const data = await response.json();

            if (data && data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);

                mapInstanceRef.current.setView([lat, lng], 15);
                if (markerRef.current) {
                    markerRef.current.setLatLng([lat, lng]);
                }
                if (circleRef.current) {
                    circleRef.current.setLatLng([lat, lng]);
                }

                setFormData((prev) => ({
                    ...prev,
                    location: {
                        lat,
                        lng,
                        address: data[0].display_name,
                    },
                }));
                setSearchQuery(data[0].display_name);

                // Refresh map display
                setTimeout(() => {
                    mapInstanceRef.current?.invalidateSize();
                }, 100);
            }
        } catch (error) {
            console.error("Location search error:", error);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Incident reported:", formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setSearchQuery("");
            setFormData({
                type: IncidentType.Other,
                description: "",
                location: { lat: 28.6139, lng: 77.2090, address: "" },
            });
            if (mapInstanceRef.current && markerRef.current && circleRef.current) {
                mapInstanceRef.current.setView([28.6139, 77.2090], 11);
                markerRef.current.setLatLng([28.6139, 77.2090]);
                circleRef.current.setLatLng([28.6139, 77.2090]);
            }
        }, 3000);
    };

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-6xl mx-auto">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Report an Incident
                </h2>
                <p className="text-gray-400 mb-8">
                    Help us respond faster by providing detailed information
                </p>

                {submitted ? (
                    <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-safe-400 mb-2">
                            Report Submitted Successfully
                        </h3>
                        <p className="text-gray-400">
                            Emergency services have been notified and will respond shortly.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Incident Type */}
                        <div className="glass rounded-2xl p-6">
                            <label className="block text-sm font-medium mb-2">
                                Incident Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) =>
                                    setFormData({ ...formData, type: e.target.value as IncidentType })
                                }
                                className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                required
                            >
                                {Object.values(IncidentType).map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="glass rounded-2xl p-6">
                            <label className="block text-sm font-medium mb-2">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={5}
                                className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                placeholder="Provide as much detail as possible about the incident..."
                                required
                            />
                        </div>

                        {/* Location Search */}
                        <div className="glass rounded-2xl p-6">
                            <label className="block text-sm font-medium mb-3">
                                Search Incident Location *
                            </label>

                            <div className="flex gap-3 mb-4">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleLocationSearch();
                                        }
                                    }}
                                    placeholder="Type location (e.g., Connaught Place, Delhi)"
                                    className="flex-1 px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={handleLocationSearch}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 rounded-lg font-medium transition-all"
                                >
                                    Search
                                </button>
                            </div>

                            {/* Selected Location Display */}
                            {formData.location.address && (
                                <div className="glass-dark rounded-lg p-4 border-l-4 border-blue-500 mb-4">
                                    <p className="text-sm font-semibold text-blue-400 mb-1">
                                        📍 Selected Location:
                                    </p>
                                    <p className="text-sm text-gray-300">{formData.location.address}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Coordinates: {formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}
                                    </p>
                                </div>
                            )}

                            {/* Map Container with explicit styling */}
                            <div className="relative">
                                <p className="text-sm font-medium text-gray-300 mb-2">
                                    Location Map (click or drag marker to adjust)
                                </p>
                                <div
                                    ref={mapRef}
                                    style={{
                                        height: "400px",
                                        width: "100%",
                                        borderRadius: "8px",
                                        border: "2px solid rgba(59, 130, 246, 0.3)",
                                        zIndex: 0,
                                    }}
                                    className="shadow-lg bg-slate-800"
                                />
                                {!mapInitialized && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800/50 rounded-lg">
                                        <p className="text-gray-400">Loading map...</p>
                                    </div>
                                )}
                            </div>

                            <p className="text-xs text-gray-500 mt-3">
                                💡 Search above to find location, then fine-tune by clicking or dragging the marker on map
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            Submit Report
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default IncidentReport;
