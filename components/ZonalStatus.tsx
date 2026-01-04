"use client";

import React, { useState, useEffect } from "react";
import { ZonalStatus as ZonalStatusEnum } from "@/types";
import { detectZoneFromCoordinates, getBroadcastsByZone, Broadcast } from "@/lib/firestore";

const ZonalStatus: React.FC = () => {
    const [status, setStatus] = useState<ZonalStatusEnum>(ZonalStatusEnum.Alert);
    const [userLocation, setUserLocation] = useState<string>("Fetching location...");
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [userZone, setUserZone] = useState<string>("");
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loadingBroadcasts, setLoadingBroadcasts] = useState(false);

    // Fetch user's location
    const fetchUserLocation = async () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;

                    setCoordinates({ lat, lng });
                    setLastUpdated(new Date());

                    // Reverse geocoding to get address
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
                        );
                        const data = await response.json();
                        if (data.display_name) {
                            setUserLocation(data.display_name);
                        } else {
                            setUserLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                        }
                    } catch (error) {
                        console.error("Geocoding error:", error);
                        setUserLocation(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                    }

                    // Simulate status check based on location
                    // In production, this would call an API to get real status
                    const statuses = [
                        ZonalStatusEnum.Normal,
                        ZonalStatusEnum.Alert,
                        ZonalStatusEnum.Emergency,
                    ];
                    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
                    setStatus(randomStatus);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    setUserLocation("Location unavailable");
                    setCoordinates(null);
                }
            );
        } else {
            setUserLocation("Geolocation not supported");
            setCoordinates(null);
        }
    };

    // Fetch broadcasts for user's zone
    const fetchZoneBroadcasts = async (zone: string) => {
        if (!zone) return;
        setLoadingBroadcasts(true);
        try {
            const zoneBroadcasts = await getBroadcastsByZone(zone);
            setBroadcasts(zoneBroadcasts);
        } catch (error) {
            console.error("Error fetching zone broadcasts:", error);
        } finally {
            setLoadingBroadcasts(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchUserLocation();

        // Update every 30 seconds
        const interval = setInterval(() => {
            fetchUserLocation();
            if (userZone) {
                fetchZoneBroadcasts(userZone);
            }
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [userZone]);

    // Detect zone and fetch broadcasts when coordinates change
    useEffect(() => {
        if (coordinates) {
            const zone = detectZoneFromCoordinates(coordinates.lat, coordinates.lng);
            setUserZone(zone);
            fetchZoneBroadcasts(zone);
        }
    }, [coordinates]);

    const getStatusColor = (status: ZonalStatusEnum) => {
        switch (status) {
            case ZonalStatusEnum.Normal:
                return "text-safe-400 border-safe-500";
            case ZonalStatusEnum.Alert:
                return "text-warning-400 border-warning-500";
            case ZonalStatusEnum.Emergency:
                return "text-crisis-400 border-crisis-500";
            case ZonalStatusEnum.Restricted:
                return "text-red-400 border-red-500";
            default:
                return "text-gray-400 border-gray-500";
        }
    };

    const getStatusIcon = (status: ZonalStatusEnum) => {
        switch (status) {
            case ZonalStatusEnum.Normal:
                return "✅";
            case ZonalStatusEnum.Alert:
                return "⚠️";
            case ZonalStatusEnum.Emergency:
                return "🚨";
            case ZonalStatusEnum.Restricted:
                return "🔒";
            default:
                return "ℹ️";
        }
    };

    const getStatusDescription = (status: ZonalStatusEnum) => {
        switch (status) {
            case ZonalStatusEnum.Normal:
                return "Area is safe. No immediate threats detected.";
            case ZonalStatusEnum.Alert:
                return "Moderate risk level due to active weather conditions or nearby incidents.";
            case ZonalStatusEnum.Emergency:
                return "Active emergency situation. Follow safety protocols immediately.";
            case ZonalStatusEnum.Restricted:
                return "Area access restricted. Do not enter without authorization.";
            default:
                return "Status information unavailable.";
        }
    };

    const getInstructions = (status: ZonalStatusEnum) => {
        switch (status) {
            case ZonalStatusEnum.Normal:
                return [
                    "Stay aware of your surroundings",
                    "Keep emergency contacts updated",
                    "Monitor local news and alerts",
                ];
            case ZonalStatusEnum.Alert:
                return [
                    "Stay informed through official channels",
                    "Prepare emergency supply kit",
                    "Avoid unnecessary travel",
                    "Report any suspicious activity or incidents",
                ];
            case ZonalStatusEnum.Emergency:
                return [
                    "Follow evacuation orders immediately",
                    "Take shelter in designated safe areas",
                    "Do not use elevators during evacuation",
                    "Keep emergency services informed of your location",
                    "Assist those who need help, if safe to do so",
                ];
            case ZonalStatusEnum.Restricted:
                return [
                    "Do not attempt to enter the area",
                    "Follow instructions from authorities",
                    "Seek alternative routes",
                    "Wait for official clearance before returning",
                ];
            default:
                return [];
        }
    };

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Zonal Status
                </h2>
                <p className="text-gray-400 mb-8">
                    Real-time safety status for your current location
                </p>

                {/* Current Location Display */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <div className="flex items-start gap-3 mb-3">
                        <span className="text-3xl">📍</span>
                        <div className="flex-1">
                            <h3 className="font-bold text-xl text-blue-400 mb-1">
                                Your Current Location
                            </h3>
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {userLocation}
                            </p>
                            {coordinates && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Coordinates: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="animate-pulse">🔄</span>
                        <span>
                            Last updated: {lastUpdated.toLocaleTimeString()} • Auto-refreshing every 30 seconds
                        </span>
                    </div>
                </div>

                {/* Status Card */}
                <div className={`glass rounded-2xl p-8 mb-6 border-2 ${getStatusColor(status).split(' ')[1]}`}>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-6xl">{getStatusIcon(status)}</span>
                        <div>
                            <h3 className="text-3xl font-bold mb-1">
                                Current Status:{" "}
                                <span className={getStatusColor(status).split(' ')[0]}>
                                    {status}
                                </span>
                            </h3>
                            <p className="text-gray-400">{getStatusDescription(status)}</p>
                        </div>
                    </div>
                </div>

                {/* Safety Instructions */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>📋</span> Safety Instructions
                    </h3>
                    <ul className="space-y-3">
                        {getInstructions(status).map((instruction, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="text-blue-400 mt-1">•</span>
                                <span className="text-gray-300">{instruction}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Zonal Alerts & Broadcasts */}
                <div className="glass rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>📢</span> Zonal Alerts & Broadcasts
                    </h3>
                    {loadingBroadcasts ? (
                        <div className="text-center text-gray-400 py-4">
                            <span className="animate-pulse">Loading broadcasts...</span>
                        </div>
                    ) : broadcasts.length > 0 ? (
                        <div className="space-y-3">
                            {broadcasts.map((broadcast) => {
                                const typeColors = {
                                    alert: "bg-red-500/20 border-red-500/50 text-red-400",
                                    warning: "bg-yellow-500/20 border-yellow-500/50 text-yellow-400",
                                    info: "bg-blue-500/20 border-blue-500/50 text-blue-400",
                                };
                                const typeIcons = {
                                    alert: "🚨",
                                    warning: "⚠️",
                                    info: "ℹ️",
                                };
                                return (
                                    <div
                                        key={broadcast.id}
                                        className={`glass-dark rounded-lg p-4 border-l-4 ${typeColors[broadcast.type]}`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{typeIcons[broadcast.type]}</span>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${typeColors[broadcast.type]}`}>
                                                        {broadcast.type}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(broadcast.createdAt).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p className="text-gray-300 mb-2">{broadcast.message}</p>
                                                <p className="text-xs text-gray-500">
                                                    From: {broadcast.moderatorName} • {broadcast.zone}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-4xl mb-3">✅</div>
                            <p className="text-gray-400">
                                No active alerts or broadcasts for {userZone || "your zone"}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                You'll be notified when moderators send updates
                            </p>
                        </div>
                    )}
                </div>

                {/* Emergency Services Grid */}
                <div className="glass rounded-2xl p-6">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <span>🚨</span> Emergency Services
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="glass-dark rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">🚔</span>
                                <span className="font-semibold">Police</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-400">100</p>
                        </div>
                        <div className="glass-dark rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">🚒</span>
                                <span className="font-semibold">Fire Department</span>
                            </div>
                            <p className="text-2xl font-bold text-crisis-400">101</p>
                        </div>
                        <div className="glass-dark rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">🚑</span>
                                <span className="font-semibold">Ambulance</span>
                            </div>
                            <p className="text-2xl font-bold text-safe-400">102</p>
                        </div>
                        <div className="glass-dark rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">👮</span>
                                <span className="font-semibold">Women Helpline</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-400">1091</p>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-6 glass-dark rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-400">
                        <span className="font-semibold text-blue-400">ℹ️ Note:</span> Status
                        information is automatically updated every 30 seconds based on your current
                        location. Keep location services enabled for accurate updates.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ZonalStatus;
