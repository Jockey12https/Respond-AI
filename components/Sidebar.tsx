"use client";

import React from "react";
import { ViewType } from "@/types";

interface SidebarProps {
    activeView: ViewType;
    onViewChange: (view: ViewType) => void;
    onSOSClick: () => void;
    alertCount: number;
}

const Sidebar: React.FC<SidebarProps> = ({
    activeView,
    onViewChange,
    onSOSClick,
    alertCount,
}) => {
    const navItems: { id: ViewType; label: string; icon: string }[] = [
        { id: "report", label: "Report Incident", icon: "📝" },
        { id: "alerts", label: "Alerts", icon: "🔔" },
        { id: "map", label: "Crisis Map", icon: "🗺️" },
        { id: "status", label: "Zonal Status", icon: "📊" },
    ];

    return (
        <div className="w-80 h-screen glass-dark p-6 flex flex-col gap-6 border-r border-white/10">
            {/* Logo/Header */}
            <div className="text-center">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-crisis-400 to-warning-400 bg-clip-text text-transparent">
                    Crisis Response
                </h1>
                <p className="text-sm text-gray-400 mt-1">Emergency Management System</p>
            </div>

            {/* SOS Button */}
            <button
                onClick={onSOSClick}
                className="w-full py-6 px-6 bg-gradient-to-r from-crisis-600 to-crisis-700 hover:from-crisis-500 hover:to-crisis-600 rounded-xl font-bold text-xl shadow-lg shadow-crisis-900/50 transition-all duration-300 transform hover:scale-105 animate-pulse-slow border-2 border-crisis-400"
            >
                🚨 EMERGENCY SOS
            </button>

            {/* Navigation Items */}
            <nav className="flex flex-col gap-3 flex-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`relative w-full py-4 px-6 rounded-lg text-left font-medium transition-all duration-300 ${activeView === item.id
                                ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-900/50"
                                : "glass hover:bg-white/20"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                        {item.id === "alerts" && alertCount > 0 && (
                            <span className="absolute top-2 right-2 bg-crisis-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                                {alertCount}
                            </span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer */}
            <div className="text-xs text-gray-500 text-center pt-4 border-t border-white/10">
                <p>Emergency: 911</p>
                <p className="mt-1">Stay Safe • Stay Informed</p>
            </div>
        </div>
    );
};

export default Sidebar;
