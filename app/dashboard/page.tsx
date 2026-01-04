"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import SOSModal from "@/components/SOSModal";
import IncidentReport from "@/components/IncidentReport";
import AlertsNotifications from "@/components/AlertsNotifications";
import CrisisMap from "@/components/CrisisMap";
import ZonalStatus from "@/components/ZonalStatus";
import { ViewType } from "@/types";
import { mockAlerts } from "@/lib/mockData";

export default function Dashboard() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const [activeView, setActiveView] = useState<ViewType>("report");
    const [showSOSModal, setShowSOSModal] = useState(false);
    const [showSOSConfirmation, setShowSOSConfirmation] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
        } else if (user?.role === "authority") {
            // Redirect authorities to their specialized dashboard
            router.push("/authority");
        }
    }, [isAuthenticated, user, router]);

    const handleSOSConfirm = () => {
        setShowSOSModal(false);
        setShowSOSConfirmation(true);

        setTimeout(() => {
            setShowSOSConfirmation(false);
            setActiveView("report");
        }, 5000);
    };

    const renderContent = () => {
        switch (activeView) {
            case "report":
                return <IncidentReport />;
            case "alerts":
                return <AlertsNotifications />;
            case "map":
                return <CrisisMap />;
            case "status":
                return <ZonalStatus />;
            default:
                return <IncidentReport />;
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <p className="text-gray-400">Checking authentication...</p>
            </div>
        );
    }

    return (
        <main className="flex h-screen">
            <Sidebar
                activeView={activeView}
                onViewChange={setActiveView}
                onSOSClick={() => setShowSOSModal(true)}
                alertCount={mockAlerts.length}
            />
            <div className="flex-1 overflow-hidden">{renderContent()}</div>
            <SOSModal
                isOpen={showSOSModal}
                onClose={() => setShowSOSModal(false)}
                onConfirm={handleSOSConfirm}
            />

            {/* SOS Confirmation Alert */}
            {showSOSConfirmation && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative glass-dark rounded-2xl p-8 max-w-lg w-full shadow-2xl border-2 border-safe-500 animate-slide-in">
                        <div className="text-center">
                            <div className="text-6xl mb-4 animate-pulse">✅</div>
                            <h2 className="text-3xl font-bold text-safe-400 mb-4">
                                SOS Alert Sent Successfully!
                            </h2>
                            <div className="glass rounded-xl p-6 mb-6 text-left">
                                <h3 className="font-bold text-lg mb-3 text-blue-400">
                                    🚨 Alert Dispatched To:
                                </h3>
                                <ul className="space-y-2 text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-crisis-400">✓</span>
                                        <span>Emergency Services (Police, Fire, Ambulance)</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-crisis-400">✓</span>
                                        <span>Nearest Hospitals and Medical Centers</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-crisis-400">✓</span>
                                        <span>Your Emergency Contacts</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-crisis-400">✓</span>
                                        <span>Local Authorities</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="glass-dark rounded-lg p-4 border-l-4 border-blue-500 mb-4">
                                <p className="text-sm text-gray-400">
                                    <span className="font-semibold text-blue-400">📍</span> Your current
                                    location has been shared with emergency responders.
                                </p>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Help is on the way. Please stay safe and report the incident for faster
                                response.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSOSConfirmation(false)}
                                    className="flex-1 py-3 px-6 rounded-lg glass hover:bg-white/20 font-medium transition-all duration-300"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSOSConfirmation(false);
                                        setActiveView("report");
                                    }}
                                    className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 font-bold transition-all duration-300"
                                >
                                    Report Incident
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
