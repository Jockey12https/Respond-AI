"use client";

import React from "react";
import { mockAlerts, mockIncidents } from "@/lib/mockData";
import { Severity } from "@/types";

const AlertsNotifications: React.FC = () => {
    const getSeverityColor = (severity: Severity) => {
        switch (severity) {
            case Severity.Critical:
                return "border-crisis-500 bg-crisis-500/10";
            case Severity.High:
                return "border-warning-500 bg-warning-500/10";
            case Severity.Medium:
                return "border-yellow-500 bg-yellow-500/10";
            default:
                return "border-blue-500 bg-blue-500/10";
        }
    };

    const getSeverityBadge = (severity: Severity) => {
        const colors = {
            [Severity.Critical]: "bg-crisis-600 text-white",
            [Severity.High]: "bg-warning-600 text-white",
            [Severity.Medium]: "bg-yellow-600 text-white",
            [Severity.Low]: "bg-blue-600 text-white",
        };
        return colors[severity];
    };

    const formatTimestamp = (date: Date) => {
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

                {/* Authority Alerts */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span>🔔</span> Official Alerts
                    </h3>
                    <div className="space-y-4">
                        {mockAlerts.map((alert) => (
                            <div
                                key={alert.id}
                                className={`glass rounded-xl p-6 border-l-4 ${getSeverityColor(
                                    alert.severity
                                )} transition-all hover:scale-[1.02] cursor-pointer`}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-xl font-bold">{alert.title}</h4>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityBadge(
                                                    alert.severity
                                                )}`}
                                            >
                                                {alert.severity}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 mb-2">{alert.message}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>📡 {alert.source}</span>
                                            <span>🕒 {formatTimestamp(alert.timestamp)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Nearby Incidents */}
                <div>
                    <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <span>📍</span> Nearby Incidents
                    </h3>
                    <div className="space-y-4">
                        {mockIncidents.map((incident) => (
                            <div
                                key={incident.id}
                                className={`glass rounded-xl p-6 border-l-4 ${getSeverityColor(
                                    incident.severity
                                )} transition-all hover:scale-[1.02] cursor-pointer`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-bold">{incident.type}</h4>
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityBadge(
                                                    incident.severity
                                                )}`}
                                            >
                                                {incident.severity}
                                            </span>
                                        </div>
                                        <p className="text-gray-300 mb-2">{incident.description}</p>
                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                            <span>📍 {incident.location.address}</span>
                                            <span>🕒 {formatTimestamp(incident.timestamp)}</span>
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
