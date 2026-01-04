"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import SOSModal from "@/components/SOSModal";
import IncidentReport from "@/components/IncidentReport";
import AlertsNotifications from "@/components/AlertsNotifications";
import CrisisMap from "@/components/CrisisMap";
import ZonalStatus from "@/components/ZonalStatus";
import { ViewType } from "@/types";
import { mockAlerts } from "@/lib/mockData";

export default function Home() {
    const [activeView, setActiveView] = useState<ViewType>("report");
    const [showSOSModal, setShowSOSModal] = useState(false);

    const handleSOSConfirm = () => {
        setShowSOSModal(false);
        // Simulate emergency alert
        alert("🚨 SOS Alert Sent!\n\nEmergency services have been notified.\nYour emergency contacts have been alerted.\n\nPlease report the incident for faster response.");
        setActiveView("report");
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

    return (
        <main className="flex h-screen">
            <Sidebar
                activeView={activeView}
                onViewChange={setActiveView}
                onSOSClick={() => setShowSOSModal(true)}
                alertCount={mockAlerts.length}
            />
            <div className="flex-1 overflow-hidden">
                {renderContent()}
            </div>
            <SOSModal
                isOpen={showSOSModal}
                onClose={() => setShowSOSModal(false)}
                onConfirm={handleSOSConfirm}
            />
        </main>
    );
}
