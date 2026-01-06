"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Sidebar from "@/components/Sidebar";
import SOSModal from "@/components/SOSModal";
import AlertsNotifications from "@/components/AlertsNotifications";
import ZonalStatus from "@/components/ZonalStatus";
import EmergencyAssistant from "@/components/EmergencyAssistant";
import TrustScoreBadge from "@/components/TrustScoreBadge";
import { ViewType, IncidentType } from "@/types";
import { mockAlerts } from "@/lib/mockData";
import { twsmAPI, TrustScore } from "@/lib/api";

// Dynamically import components that use Leaflet to avoid SSR issues
const IncidentReport = dynamic(() => import("@/components/IncidentReport"), {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center"><p className="text-gray-400">Loading map...</p></div>
});

const CrisisMap = dynamic(() => import("@/components/CrisisMap"), {
    ssr: false,
    loading: () => <div className="h-full flex items-center justify-center"><p className="text-gray-400">Loading map...</p></div>
});

export default function Dashboard() {
    const { isAuthenticated, user } = useAuth();
    const router = useRouter();
    const [activeView, setActiveView] = useState<ViewType>("report");
    const [showSOSModal, setShowSOSModal] = useState(false);
    const [showSOSConfirmation, setShowSOSConfirmation] = useState(false);
    const [showEmergencyAssistant, setShowEmergencyAssistant] = useState(false);
    const [selectedIncidentType, setSelectedIncidentType] = useState<IncidentType>(IncidentType.Other);
    const [trustScore, setTrustScore] = useState<TrustScore | null>(null);

    useEffect(() => {
        if (!isAuthenticated) {
            router.push("/");
        } else if (user?.role === "authority") {
            // Redirect authorities to their specialized dashboard
            router.push("/authority");
        }
    }, [isAuthenticated, user, router]);

    // Fetch user trust score
    useEffect(() => {
        const fetchTrustScore = async () => {
            if (user?.uid) {
                try {
                    const score = await twsmAPI.getUserTrustScore(user.uid);
                    setTrustScore(score);
                } catch (error) {
                    console.error("Error fetching trust score:", error);
                    // Set default trust score for new users
                    setTrustScore({
                        user_id: user.uid,
                        trust_score: 0.5,
                        total_reports: 0,
                        verified_reports: 0,
                        false_reports: 0,
                        verification_ratio: 0,
                        trust_trend: "stable"
                    });
                }
            }
        };
        fetchTrustScore();
    }, [user]);

    const handleSOSConfirm = () => {
        setShowSOSModal(false);
        setShowSOSConfirmation(true);

        setTimeout(() => {
            setShowSOSConfirmation(false);
            setShowEmergencyAssistant(true);
        }, 3000);
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
            <div className="flex-1 overflow-hidden flex flex-col">
                {/* Trust Score Banner */}
                {trustScore && (
                    <div className="p-3 glass-dark border-b border-white/10 flex-shrink-0">
                        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="text-xl">👤</div>
                                <div>
                                    <h3 className="text-xs font-semibold text-gray-300">Your Credibility Score</h3>
                                    <p className="text-xs text-gray-500">Affects report priority</p>
                                </div>
                            </div>
                            <TrustScoreBadge
                                trustScore={trustScore.trust_score}
                                totalReports={trustScore.total_reports}
                                verifiedReports={trustScore.verified_reports}
                                verificationRatio={trustScore.verification_ratio}
                                trend={trustScore.trust_trend}
                                showDetails={false}
                            />
                        </div>
                    </div>
                )}
                <div className="flex-1 overflow-y-auto">{renderContent()}</div>
            </div>
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

                            {/* Incident Type Selection */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    What type of emergency?
                                </label>
                                <select
                                    value={selectedIncidentType}
                                    onChange={(e) => setSelectedIncidentType(e.target.value as IncidentType)}
                                    className="w-full glass rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {Object.values(IncidentType).map((type) => (
                                        <option key={type} value={type} className="bg-gray-800">
                                            {type}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <p className="text-gray-400 mb-4 text-sm">
                                🤖 Our AI assistant will provide immediate safety guidance while help is on the way.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Emergency AI Assistant */}
            <EmergencyAssistant
                isOpen={showEmergencyAssistant}
                onClose={() => {
                    setShowEmergencyAssistant(false);
                    setActiveView("report");
                }}
                incidentType={selectedIncidentType}
            />
        </main>
    );
}