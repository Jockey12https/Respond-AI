"use client";

import React, { useState } from "react";

interface CrisisData {
    id: number;
    location: string;
    lat: number;
    lng: number;
    priority: string;
    crisisType: string;
    affectedPeople: number;
    zone: string;
    zoneModerator: string;
    crisisLevel: string;
    status: string;
    description: string;
}

interface CrisisDetailViewProps {
    crisis: CrisisData;
    onBack: () => void;
}

// Mock zonal users data
const getZonalUsers = (zone: string) => {
    const usersByZone: Record<string, Array<{ name: string; phone: string; email: string }>> = {
        "South Kerala Zone": [
            { name: "Suresh Babu", phone: "+91 98765 43210", email: "suresh@example.com" },
            { name: "Lakshmi Nair", phone: "+91 98765 43211", email: "lakshmi@example.com" },
            { name: "Anand Kumar", phone: "+91 98765 43212", email: "anand@example.com" },
        ],
        "Central Kerala Zone": [
            { name: "Vinod Thomas", phone: "+91 98765 43213", email: "vinod@example.com" },
            { name: "Meera Joseph", phone: "+91 98765 43214", email: "meera@example.com" },
            { name: "Rahul Varma", phone: "+91 98765 43215", email: "rahul@example.com" },
        ],
        "North Kerala Zone": [
            { name: "Ashok Krishnan", phone: "+91 98765 43216", email: "ashok@example.com" },
            { name: "Divya Menon", phone: "+91 98765 43217", email: "divya@example.com" },
            { name: "Kiran Pillai", phone: "+91 98765 43218", email: "kiran@example.com" },
        ],
    };
    return usersByZone[zone] || [];
};

const CrisisDetailView: React.FC<CrisisDetailViewProps> = ({ crisis, onBack }) => {
    const [activeTab, setActiveTab] = useState<"instructions" | "warnings">("instructions");
    const [showInstructionPopup, setShowInstructionPopup] = useState(false);
    const [showWarningPopup, setShowWarningPopup] = useState(false);
    const [instructionText, setInstructionText] = useState("");

    const zonalUsers = getZonalUsers(crisis.zone);

    const handleSendInstructions = () => {
        if (!instructionText.trim()) {
            alert("Please enter instructions before sending");
            return;
        }
        setShowInstructionPopup(true);
    };

    const confirmInstructions = () => {
        // Mock sending instructions
        console.log("Sending instructions:", instructionText, "to zone:", crisis.zone);
        setShowInstructionPopup(false);
        setInstructionText("");
        alert(`✅ Emergency instructions sent successfully to ${crisis.zoneModerator} at ${crisis.zone}`);
    };

    const handleSendWarnings = () => {
        setShowWarningPopup(true);
    };

    const confirmWarnings = () => {
        // Mock sending warnings
        console.log("Sending warnings to all users in zone:", crisis.zone);
        setShowWarningPopup(false);
        alert(`🚨 Warning alerts sent to ${zonalUsers.length} users in ${crisis.zone}`);
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "critical":
                return "text-red-500 bg-red-500/20";
            case "high":
                return "text-orange-500 bg-orange-500/20";
            default:
                return "text-yellow-500 bg-yellow-500/20";
        }
    };

    return (
        <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="glass border-b border-white/10 p-6">
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to Map
                    </button>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getPriorityColor(crisis.priority)}`}>
                        {crisis.priority} Priority
                    </span>
                </div>

                <h1 className="text-3xl font-bold mb-2">{crisis.location} Crisis</h1>
                <p className="text-gray-400">{crisis.description}</p>

                <div className="grid grid-cols-4 gap-4 mt-4">
                    <div className="glass rounded-lg p-3">
                        <p className="text-xs text-gray-400">Crisis Type</p>
                        <p className="text-lg font-bold">{crisis.crisisType}</p>
                    </div>
                    <div className="glass rounded-lg p-3">
                        <p className="text-xs text-gray-400">Affected People</p>
                        <p className="text-lg font-bold text-warning-400">{crisis.affectedPeople.toLocaleString()}</p>
                    </div>
                    <div className="glass rounded-lg p-3">
                        <p className="text-xs text-gray-400">Crisis Level</p>
                        <p className="text-lg font-bold text-red-400">{crisis.crisisLevel}</p>
                    </div>
                    <div className="glass rounded-lg p-3">
                        <p className="text-xs text-gray-400">Status</p>
                        <p className="text-lg font-bold text-green-400 capitalize">{crisis.status}</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar - Navigation */}
                <div className="w-80 glass border-r border-white/10 p-6 space-y-3">
                    <button
                        onClick={() => setActiveTab("instructions")}
                        className={`w-full p-4 rounded-lg text-left transition-all ${activeTab === "instructions"
                                ? "bg-blue-600 text-white shadow-lg"
                                : "glass hover:bg-white/5"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📋</span>
                            <div>
                                <h3 className="font-bold">Emergency Instructions</h3>
                                <p className="text-xs opacity-75">Send directives to zone moderators</p>
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("warnings")}
                        className={`w-full p-4 rounded-lg text-left transition-all ${activeTab === "warnings"
                                ? "bg-orange-600 text-white shadow-lg"
                                : "glass hover:bg-white/5"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <h3 className="font-bold">Warnings to Zonal Users</h3>
                                <p className="text-xs opacity-75">Alert all registered users in zone</p>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Right Content Area */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {activeTab === "instructions" && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Emergency Instructions to Zone Moderator</h2>

                            {/* Zone Details Card */}
                            <div className="glass rounded-xl p-6 border-2 border-blue-500/30">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span>🏢</span> Zone Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-400">Zone Name</p>
                                        <p className="text-lg font-bold text-blue-400">{crisis.zone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Zone Moderator</p>
                                        <p className="text-lg font-bold">{crisis.zoneModerator}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Crisis Level</p>
                                        <p className="text-lg font-bold text-red-400">{crisis.crisisLevel}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Location</p>
                                        <p className="text-lg font-bold">{crisis.location}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions Form */}
                            <div className="glass rounded-xl p-6">
                                <h3 className="text-lg font-bold mb-4">Compose Emergency Instructions</h3>
                                <textarea
                                    value={instructionText}
                                    onChange={(e) => setInstructionText(e.target.value)}
                                    className="w-full h-48 px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                    placeholder={`Enter detailed emergency instructions for ${crisis.zoneModerator}...\n\nExample:\n- Deploy rescue teams to affected areas\n- Set up temporary shelters\n- Coordinate with local authorities\n- Provide medical assistance`}
                                />
                                <button
                                    onClick={handleSendInstructions}
                                    className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                                >
                                    📤 Send Instructions to Zone Moderator
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === "warnings" && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold">Alert All Zonal Users</h2>

                            {/* Zone Details Card */}
                            <div className="glass rounded-xl p-6 border-2 border-orange-500/30">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span>🏢</span> Zone Information
                                </h3>
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <p className="text-sm text-gray-400">Zone Name</p>
                                        <p className="text-lg font-bold text-orange-400">{crisis.zone}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400">Zone Moderator</p>
                                        <p className="text-lg font-bold">{crisis.zoneModerator}</p>
                                    </div>
                                </div>

                                <div className="border-t border-white/10 pt-4">
                                    <p className="text-sm text-gray-400 mb-3">Registered Users in Zone ({zonalUsers.length})</p>
                                    <div className="space-y-2 max-h-64 overflow-y-auto">
                                        {zonalUsers.map((user, idx) => (
                                            <div key={idx} className="glass-dark rounded-lg p-3 flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium">{user.name}</p>
                                                    <p className="text-xs text-gray-400">{user.email}</p>
                                                </div>
                                                <p className="text-sm text-gray-400">{user.phone}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Warning Preview */}
                            <div className="glass rounded-xl p-6 border-2 border-orange-500/30">
                                <h3 className="text-lg font-bold mb-4">⚠️ Warning Message Preview</h3>
                                <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4">
                                    <p className="font-bold text-orange-400 mb-2">🚨 EMERGENCY ALERT</p>
                                    <p className="mb-2"><strong>Crisis Type:</strong> {crisis.crisisType}</p>
                                    <p className="mb-2"><strong>Location:</strong> {crisis.location}</p>
                                    <p className="mb-2"><strong>Priority:</strong> <span className="uppercase">{crisis.priority}</span></p>
                                    <p className="mb-2"><strong>Details:</strong> {crisis.description}</p>
                                    <p className="text-sm text-gray-400 mt-3">
                                        Please follow emergency protocols and stay safe. Contact your zone moderator for assistance.
                                    </p>
                                </div>
                            </div>

                            {/* Send Button */}
                            <button
                                onClick={handleSendWarnings}
                                className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-lg font-bold text-xl transition-all transform hover:scale-105 shadow-lg"
                            >
                                🚨 Send Alert to All {zonalUsers.length} Users
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Instruction Confirmation Popup */}
            {showInstructionPopup && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-6">
                    <div className="glass rounded-2xl p-8 max-w-md w-full border-2 border-blue-500/50">
                        <h2 className="text-2xl font-bold mb-4">📋 Confirm Instructions</h2>
                        <p className="text-gray-300 mb-6">
                            Send emergency instructions to <strong className="text-blue-400">{crisis.zoneModerator}</strong> at <strong className="text-blue-400">{crisis.zone}</strong>?
                        </p>
                        <div className="bg-blue-500/10 rounded-lg p-4 mb-6 max-h-48 overflow-y-auto">
                            <p className="text-sm whitespace-pre-wrap">{instructionText}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowInstructionPopup(false)}
                                className="flex-1 py-3 glass hover:bg-white/10 rounded-lg font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmInstructions}
                                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-all"
                            >
                                ✅ Confirm & Send
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Warning Confirmation Popup */}
            {showWarningPopup && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] p-6">
                    <div className="glass rounded-2xl p-8 max-w-md w-full border-2 border-orange-500/50">
                        <h2 className="text-2xl font-bold mb-4">⚠️ Confirm Mass Alert</h2>
                        <p className="text-gray-300 mb-4">
                            This will send emergency warnings to <strong className="text-orange-400">{zonalUsers.length} registered users</strong> in <strong className="text-orange-400">{crisis.zone}</strong>.
                        </p>
                        <div className="bg-orange-500/10 border border-orange-500 rounded-lg p-4 mb-6">
                            <p className="text-sm font-bold text-orange-400 mb-2">Recipients will receive:</p>
                            <ul className="text-sm space-y-1 text-gray-300">
                                <li>• SMS notifications</li>
                                <li>• Email alerts</li>
                                <li>• App push notifications</li>
                                <li>• Emergency instructions</li>
                            </ul>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowWarningPopup(false)}
                                className="flex-1 py-3 glass hover:bg-white/10 rounded-lg font-medium transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmWarnings}
                                className="flex-1 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-lg font-bold transition-all"
                            >
                                🚨 Send Alerts
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CrisisDetailView;
