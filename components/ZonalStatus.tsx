"use client";

import React from "react";
import { mockZoneInfo } from "@/lib/mockData";
import { ZonalStatus } from "@/types";

const ZonalStatusComponent: React.FC = () => {
    const getStatusColor = (status: ZonalStatus) => {
        switch (status) {
            case ZonalStatus.Normal:
                return {
                    bg: "bg-gradient-to-br from-safe-600 to-safe-700",
                    border: "border-safe-500",
                    text: "text-safe-400",
                    icon: "✅",
                };
            case ZonalStatus.Alert:
                return {
                    bg: "bg-gradient-to-br from-warning-600 to-warning-700",
                    border: "border-warning-500",
                    text: "text-warning-400",
                    icon: "⚠️",
                };
            case ZonalStatus.Emergency:
                return {
                    bg: "bg-gradient-to-br from-crisis-600 to-crisis-700",
                    border: "border-crisis-500",
                    text: "text-crisis-400",
                    icon: "🚨",
                };
            case ZonalStatus.Restricted:
                return {
                    bg: "bg-gradient-to-br from-red-900 to-black",
                    border: "border-red-700",
                    text: "text-red-400",
                    icon: "🔒",
                };
        }
    };

    const statusStyle = getStatusColor(mockZoneInfo.status);

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    Zonal Status
                </h2>
                <p className="text-gray-400 mb-8">Current status of your area</p>

                {/* Status Card */}
                <div
                    className={`glass rounded-2xl p-8 border-2 ${statusStyle.border} mb-6`}
                >
                    <div className="text-center mb-8">
                        <div className="text-8xl mb-4">{statusStyle.icon}</div>
                        <h3 className={`text-5xl font-bold mb-2 ${statusStyle.text}`}>
                            {mockZoneInfo.status}
                        </h3>
                        <p className="text-xl text-gray-300">{mockZoneInfo.description}</p>
                    </div>

                    {/* Status Badge */}
                    <div
                        className={`${statusStyle.bg} rounded-xl p-6 text-white shadow-lg mb-6`}
                    >
                        <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                            <span>📋</span> Safety Instructions
                        </h4>
                        <ul className="space-y-2">
                            {mockZoneInfo.instructions.map((instruction, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <span className="text-white/70 mt-1">•</span>
                                    <span>{instruction}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Last Updated */}
                    <div className="text-center text-sm text-gray-500">
                        <p>
                            Last updated:{" "}
                            {mockZoneInfo.lastUpdated.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Additional Info Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass rounded-xl p-6">
                        <div className="text-3xl mb-2">🏥</div>
                        <h4 className="font-bold mb-1">Medical Services</h4>
                        <p className="text-sm text-gray-400">3 hospitals nearby</p>
                    </div>
                    <div className="glass rounded-xl p-6">
                        <div className="text-3xl mb-2">🚔</div>
                        <h4 className="font-bold mb-1">Emergency Response</h4>
                        <p className="text-sm text-gray-400">Active patrols</p>
                    </div>
                    <div className="glass rounded-xl p-6">
                        <div className="text-3xl mb-2">🏕️</div>
                        <h4 className="font-bold mb-1">Relief Centers</h4>
                        <p className="text-sm text-gray-400">2 centers open</p>
                    </div>
                    <div className="glass rounded-xl p-6">
                        <div className="text-3xl mb-2">📡</div>
                        <h4 className="font-bold mb-1">Communication</h4>
                        <p className="text-sm text-gray-400">Network stable</p>
                    </div>
                </div>

                {/* Emergency Contacts */}
                <div className="glass-dark rounded-xl p-6 border-l-4 border-blue-500">
                    <h4 className="font-bold mb-3 flex items-center gap-2">
                        <span>📞</span> Emergency Contacts
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-gray-400">Emergency Services</p>
                            <p className="font-bold text-lg">911</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Local Authority</p>
                            <p className="font-bold text-lg">(555) 123-4567</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZonalStatusComponent;
