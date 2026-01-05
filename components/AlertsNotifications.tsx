"use client";

import React, { useState, useEffect } from "react";
import { mockIncidents } from "@/lib/mockData";
import { Severity } from "@/types";
import { getAlertsByZone, AuthorityAlert, getBroadcastsByZone, Broadcast } from "@/lib/firestore";

const KERALA_DISTRICTS = [
    "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha",
    "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad",
    "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasargod"
];

const AlertsNotifications: React.FC = () => {
    const [userZone, setUserZone] = useState<string>("");
    const [alerts, setAlerts] = useState<AuthorityAlert[]>([]);
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load saved zone
        const saved = localStorage.getItem("user_district");
        if (saved) setUserZone(saved);
    }, []);

    useEffect(() => {
        const fetchAlerts = async () => {
            if (!userZone) return;
            setLoading(true);
            const data = await getAlertsByZone(userZone);
            setAlerts(data);
            const broadcastData = await getBroadcastsByZone(userZone);
            setBroadcasts(broadcastData);
            setLoading(false);
        };
        fetchAlerts();
    }, [userZone]);

    const handleZoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const zone = e.target.value;
        setUserZone(zone);
        localStorage.setItem("user_district", zone);
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case "critical": return "border-crisis-500 bg-crisis-500/10";
            case "warning": return "border-warning-500 bg-warning-500/10";
            case "info": return "border-blue-500 bg-blue-500/10";
            default: return "border-blue-500 bg-blue-500/10";
        }
    };

    const getSeverityBadge = (severity: string) => {
        switch (severity) {
            case "critical": return "bg-crisis-600 text-white";
            case "warning": return "bg-warning-600 text-white";
            case "info": return "bg-blue-600 text-white";
            default: return "bg-blue-600 text-white";
        }
    };

    const formatTimestamp = (dateStr: string | Date) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60);
        if (diff < 1) return "Just now";
        if (diff < 60) return `${diff}m ago`;
        const hours = Math.floor(diff / 60);
        if (hours < 24) return `${hours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-warning-400 to-crisis-400 bg-clip-text text-transparent">
                    Alerts & Notifications
                </h2>
                <p className="text-gray-400 mb-8">
                    Stay updated with real-time alerts and nearby incidents
                </p>

                {/* Zone Selector */}
                <div className="mb-8 p-6 glass rounded-xl border border-white/10">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Select Your District</label>
                    <select
                        value={userZone}
                        onChange={handleZoneChange}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="">-- Choose District --</option>
                        {KERALA_DISTRICTS.map(d => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>

                {/* Authority Alerts */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span>🔔</span> Official Alerts {userZone && `for ${userZone}`}
                    </h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading alerts...</div>
                    ) : alerts.length === 0 ? (
                        <div className="text-center py-8 glass rounded-xl text-gray-400">
                            No active alerts for this zone. Stay safe!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {alerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`glass rounded-xl p-6 border-l-4 ${getSeverityColor(alert.type)} transition-all hover:scale-[1.02]`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-xl font-bold">{alert.title}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityBadge(alert.type)}`}>
                                                    {alert.type}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 mb-2">{alert.message}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>🚨 Authority: {alert.authorityName}</span>
                                                <span>🕒 {formatTimestamp(alert.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Community Broadcasts */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span>📢</span> Community Broadcasts
                    </h3>

                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Loading broadcasts...</div>
                    ) : broadcasts.length === 0 ? (
                        <div className="text-center py-8 glass rounded-xl text-gray-400">
                            No active community broadcasts.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {broadcasts.map((broadcast) => (
                                <div
                                    key={broadcast.id}
                                    className={`glass rounded-xl p-6 border-l-4 ${broadcast.type === "alert" ? "border-red-500 bg-red-500/5" :
                                            broadcast.type === "warning" ? "border-orange-500 bg-orange-500/5" :
                                                "border-blue-500 bg-blue-500/5"
                                        }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-xl font-bold">Community {broadcast.type.charAt(0).toUpperCase() + broadcast.type.slice(1)}</h4>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${broadcast.type === "alert" ? "bg-red-600 text-white" :
                                                        broadcast.type === "warning" ? "bg-orange-600 text-white" :
                                                            "bg-blue-600 text-white"
                                                    }`}>
                                                    {broadcast.type}
                                                </span>
                                            </div>
                                            <p className="text-gray-300 mb-2">{broadcast.message}</p>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>👤 Moderator: {broadcast.moderatorName}</span>
                                                <span>🕒 {formatTimestamp(broadcast.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Nearby Incidents (Keeping Mock for now related to user location context) */}
                <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span>📍</span> Recent Public Reports
                    </h3>
                    <div className="space-y-4">
                        {mockIncidents.slice(0, 3).map((incident) => (
                            <div
                                key={incident.id}
                                className="glass rounded-xl p-6 border-l-4 border-slate-600 transition-all hover:scale-[1.02]"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-bold">{incident.type}</h4>
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-600 text-white">
                                                {incident.severity}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 mb-2">{incident.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>📍 {incident.location.address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="mt-8 glass-dark rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-400">
                        <span className="font-semibold text-blue-400">ℹ️ Info:</span>{" "}
                        Notifications are updated in real-time. Enable push notifications in
                        settings to receive instant alerts.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AlertsNotifications;
