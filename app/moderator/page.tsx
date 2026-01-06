"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import TrustScoreBadge from "@/components/TrustScoreBadge";
import {
    getAllIncidents,
    getIncidentsByZone,
    getSeverityScore,
    getAuthorityInstructions,
    getBroadcastHistory,
    createBroadcast,
    getModeratorByUserId,
    getAuthorityByUserId,
    forwardIncidentToCrisis,
    IncidentReport,
    SeverityScore,
    AuthorityInstruction,
    Broadcast
} from "@/lib/firestore";

type TabType = "reports" | "instructions" | "broadcast";

// Mock authority instructions for demo
const MOCK_INSTRUCTIONS: AuthorityInstruction[] = [
    {
        id: "1",
        authorityId: "auth123",
        authorityName: "Dr. Sharma (Authority)",
        zone: "South Kerala Zone",
        moderatorId: "mod123",
        title: "Flood Warning Protocol Update",
        instructions: "Due to heavy rainfall forecast, please:\n1. Alert all users in low-lying areas\n2. Identify evacuation centers\n3. Coordinate with local hospitals\n4. Report water level updates every 2 hours",
        priority: "critical",
        status: "pending",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "2",
        authorityId: "auth123",
        authorityName: "Dr. Sharma (Authority)",
        zone: "South Kerala Zone",
        moderatorId: "mod123",
        title: "Medical Supply Update",
        instructions: "New batch of emergency medical supplies has arrived at District Hospital. Please update the resource availability in the system.",
        priority: "medium",
        status: "acknowledged",
        createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        acknowledgedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    }
];

export default function ModeratorDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>("reports");
    const [incidents, setIncidents] = useState<IncidentReport[]>([]);
    const [severityScores, setSeverityScores] = useState<Map<string, SeverityScore>>(new Map());
    const [instructions, setInstructions] = useState<AuthorityInstruction[]>(MOCK_INSTRUCTIONS);
    const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Broadcast form state
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [broadcastType, setBroadcastType] = useState<"alert" | "warning" | "info">("warning");
    const [isSendingBroadcast, setIsSendingBroadcast] = useState(false);

    // Track forwarded and alerted reports
    const [forwardedReports, setForwardedReports] = useState<Set<string>>(new Set());
    const [alertedReports, setAlertedReports] = useState<Set<string>>(new Set());

    // Broadcast success popup
    const [showBroadcastSuccess, setShowBroadcastSuccess] = useState(false);

    // Track locally acknowledged instructions
    const [acknowledgedInstructions, setAcknowledgedInstructions] = useState<Set<string>>(new Set());

    // Moderator profile data
    const [moderatorZone, setModeratorZone] = useState<string>("");
    const [authorityName, setAuthorityName] = useState<string>("");

    // Protect route
    useEffect(() => {
        if (user && user.role !== "moderator") {
            router.push("/dashboard");
        }
    }, [user, router]);

    // Fetch moderator profile and authority info
    useEffect(() => {
        const fetchModeratorProfile = async () => {
            if (user && user.role === "moderator") {
                const profile = await getModeratorByUserId(user.uid);
                if (profile) {
                    setModeratorZone(profile.zone);
                    // Fetch authority name using authorityId
                    const authority = await getAuthorityByUserId(profile.authorityId);
                    if (authority) {
                        setAuthorityName(authority.authorityName);
                    }
                }
            }
        };
        fetchModeratorProfile();
    }, [user]);

    // Load data function
    const loadData = async () => {
        setIsLoading(true);
        try {
            // Fetch incidents by zone if moderator zone is available
            const incidentsList = moderatorZone
                ? await getIncidentsByZone(moderatorZone)
                : await getAllIncidents(); // Fallback to all incidents if zone not yet loaded

            setIncidents(incidentsList);

            // Fetch severity scores for each incident
            const scores = new Map<string, SeverityScore>();
            for (const incident of incidentsList) {
                if (incident.id) {
                    const score = await getSeverityScore(incident.id);
                    if (score) {
                        scores.set(incident.id, score);
                    }
                }
            }
            setSeverityScores(scores);

            // Fetch broadcast history
            if (user?.uid) {
                const broadcastData = await getBroadcastHistory(user.uid);
                setBroadcasts(broadcastData);
            }
        } catch (error) {
            console.error("Error loading moderator data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch data when user or moderatorZone changes
    useEffect(() => {
        if (user && user.role === "moderator") {
            loadData();
        }
    }, [user, moderatorZone]);

    const handleSendBroadcast = async () => {
        if (!broadcastMessage.trim() || !user) return;

        setIsSendingBroadcast(true);
        try {
            const result = await createBroadcast({
                moderatorId: user.uid,
                moderatorName: user.name,
                zone: "South Kerala Zone", // TODO: Get from user profile
                message: broadcastMessage,
                type: broadcastType,
                recipientCount: 47 // Mock count
            });

            if (result.success) {
                setShowBroadcastSuccess(true);
                setBroadcastMessage("");
                loadData(); // Reload to show new broadcast in history
                // Auto-hide popup after 3 seconds
                setTimeout(() => setShowBroadcastSuccess(false), 3000);
            }
        } catch (error) {
            alert("Failed to send broadcast");
        } finally {
            setIsSendingBroadcast(false);
        }
    };

    const getSeverityColor = (level?: string) => {
        switch (level) {
            case "critical": return "bg-red-600 text-white";
            case "high": return "bg-orange-600 text-white";
            case "medium": return "bg-yellow-600 text-black";
            case "low": return "bg-green-600 text-white";
            default: return "bg-gray-600 text-white";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "critical": return "border-red-500 bg-red-500/10";
            case "high": return "border-orange-500 bg-orange-500/10";
            case "medium": return "border-yellow-500 bg-yellow-500/10";
            default: return "border-gray-500 bg-gray-500/10";
        }
    };

    if (!user || user.role !== "moderator") {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-gray-400">Access Denied - Moderator Only</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen w-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Sidebar */}
            <div className="w-64 glass border-r border-white/10 p-6">
                <div className="mb-8">
                    <h1 className="text-xl font-bold mb-1">
                        RESPOND<span className="text-blue-400">.AI</span>
                    </h1>
                    <p className="text-sm text-gray-400">Moderator Panel</p>
                    <p className="text-xs text-blue-400 mt-2">👤 {user.name}</p>
                    {authorityName && (
                        <p className="text-xs text-green-400 mt-1">🏢 {authorityName}</p>
                    )}
                    {moderatorZone && (
                        <p className="text-xs text-purple-400">📍 {moderatorZone}</p>
                    )}
                </div>

                <nav className="space-y-2">
                    <button
                        onClick={() => setActiveTab("reports")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === "reports"
                            ? "bg-blue-600 text-white"
                            : "glass hover:bg-white/10"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">📋</span>
                            <span className="font-medium">Report Validation</span>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("instructions")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === "instructions"
                            ? "bg-blue-600 text-white"
                            : "glass hover:bg-white/10"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">📜</span>
                            <div className="flex-1">
                                <span className="font-medium">Authority Instructions</span>
                                {instructions.filter(i => i.status === "pending").length > 0 && (
                                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                                        {instructions.filter(i => i.status === "pending").length}
                                    </span>
                                )}
                            </div>
                        </div>
                    </button>

                    <button
                        onClick={() => setActiveTab("broadcast")}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeTab === "broadcast"
                            ? "bg-blue-600 text-white"
                            : "glass hover:bg-white/10"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <span className="text-lg">📢</span>
                            <span className="font-medium">Community Broadcast</span>
                        </div>
                    </button>
                </nav>

                <div className="mt-auto pt-8">
                    <button
                        onClick={() => {
                            logout();
                            router.push("/");
                        }}
                        className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all text-sm"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto p-8">
                {/* Report Validation Tab */}
                {activeTab === "reports" && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold mb-2">Report Validation</h2>
                            <p className="text-gray-400">Review and validate incident reports based on AI severity analysis</p>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">⏳</div>
                                <p className="text-gray-400">Loading incidents...</p>
                            </div>
                        ) : incidents.length === 0 ? (
                            <div className="text-center py-12 glass rounded-xl">
                                <div className="text-4xl mb-4">📭</div>
                                <p className="text-gray-400">No incidents to review</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {incidents.map((incident) => {
                                    const severity = incident.id ? severityScores.get(incident.id) : null;
                                    return (
                                        <div key={incident.id} className="glass rounded-xl p-6 border-2 border-white/10">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <h3 className="text-xl font-bold">{incident.incidentType}</h3>
                                                        {severity && (
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${getSeverityColor(severity.riskLevel)}`}>
                                                                {severity.riskLevel?.toUpperCase()} - Score: {severity.severityScore}
                                                            </span>
                                                        )}
                                                        <span className={`px-2 py-1 rounded text-xs ${incident.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                                                            incident.status === "verified" ? "bg-green-500/20 text-green-400" :
                                                                "bg-gray-500/20 text-gray-400"
                                                            }`}>
                                                            {incident.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-400 text-sm mb-2">📍 {incident.location}</p>
                                                    <p className="text-gray-300 mb-3">{incident.description}</p>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                                                        <span>👤 {incident.userName}</span>
                                                        <span>📧 {incident.userEmail}</span>
                                                        {incident.contactNumber && <span>📞 {incident.contactNumber}</span>}
                                                        <span>🕐 {new Date(incident.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    {/* Reporter Trust Score */}
                                                    <div className="mt-2">
                                                        <TrustScoreBadge
                                                            trustScore={0.5}
                                                            totalReports={0}
                                                            verifiedReports={0}
                                                            verificationRatio={0}
                                                            trend="stable"
                                                            showDetails={false}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {incident.status === "pending" && (
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={async () => {
                                                                if (incident.id && user) {
                                                                    const result = await forwardIncidentToCrisis(
                                                                        incident,
                                                                        user.name
                                                                    );
                                                                    if (result.success) {
                                                                        setForwardedReports(prev => new Set(prev).add(incident.id!));
                                                                    } else {
                                                                        alert("Failed to forward incident to authorities");
                                                                    }
                                                                }
                                                            }}
                                                            disabled={incident.id ? forwardedReports.has(incident.id) : false}
                                                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
                                                        >
                                                            {incident.id && forwardedReports.has(incident.id) ? "✓ Forwarded" : "📤 Forward to Authorities"}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (incident.id) {
                                                                    setAlertedReports(prev => new Set(prev).add(incident.id!));
                                                                }
                                                            }}
                                                            disabled={incident.id ? alertedReports.has(incident.id) : false}
                                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-all"
                                                        >
                                                            {incident.id && alertedReports.has(incident.id) ? "✓ Team Alerted" : "🚨 Alert Response Team"}
                                                        </button>
                                                    </div>
                                                    {incident.id && forwardedReports.has(incident.id) && (
                                                        <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-400 text-sm">
                                                            ✓ Report forwarded to Authorities
                                                        </div>
                                                    )}
                                                    {incident.id && alertedReports.has(incident.id) && (
                                                        <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-400 text-sm">
                                                            ✓ Response team alerted
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Authority Instructions Tab */}
                {activeTab === "instructions" && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold mb-2">Authority Instructions</h2>
                            <p className="text-gray-400">Instructions and directives from authorities</p>
                        </div>

                        <div className="space-y-4">
                            {instructions.map((instruction) => (
                                <div key={instruction.id} className={`glass rounded-xl p-6 border-2 ${getPriorityColor(instruction.priority)}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold">{instruction.title}</h3>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${instruction.priority === "critical" ? "bg-red-600" :
                                                    instruction.priority === "high" ? "bg-orange-600" :
                                                        "bg-yellow-600 text-black"
                                                    }`}>
                                                    {instruction.priority.toUpperCase()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-3">From: {instruction.authorityName}</p>
                                            <p className="text-gray-300 whitespace-pre-wrap mb-3">{instruction.instructions}</p>
                                            <div className="flex items-center gap-4 text-xs text-gray-400">
                                                <span>📍 {instruction.zone}</span>
                                                <span>🕐 {new Date(instruction.createdAt).toLocaleString()}</span>
                                                {instruction.acknowledgedAt && (
                                                    <span className="text-green-400">✓ Acknowledged {new Date(instruction.acknowledgedAt).toLocaleString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {instruction.status === "pending" && instruction.id && !acknowledgedInstructions.has(instruction.id) && (
                                        <button
                                            onClick={() => {
                                                if (instruction.id) {
                                                    setAcknowledgedInstructions(prev => new Set(prev).add(instruction.id!));
                                                }
                                            }}
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all"
                                        >
                                            ✓ Acknowledge Instruction
                                        </button>
                                    )}
                                    {instruction.id && acknowledgedInstructions.has(instruction.id) && (
                                        <div className="bg-green-500/20 border border-green-500 rounded-lg p-3 text-green-400 text-sm flex items-center gap-2">
                                            <span className="text-lg">✓</span>
                                            <span>Instruction acknowledged</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Community Broadcast Tab */}
                {activeTab === "broadcast" && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-3xl font-bold mb-2">Community Broadcast</h2>
                            <p className="text-gray-400">Send alerts and warnings to users in your zone</p>
                        </div>

                        {/* Send Broadcast Form */}
                        <div className="glass rounded-xl p-6 mb-6 border-2 border-blue-500/30">
                            <h3 className="text-xl font-bold mb-4">📢 Send New Broadcast</h3>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Broadcast Type</label>
                                <select
                                    value={broadcastType}
                                    onChange={(e) => setBroadcastType(e.target.value as any)}
                                    className="w-full glass rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="alert">🚨 Alert (Urgent)</option>
                                    <option value="warning">⚠️ Warning (Important)</option>
                                    <option value="info">ℹ️ Information</option>
                                </select>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium mb-2">Message</label>
                                <textarea
                                    value={broadcastMessage}
                                    onChange={(e) => setBroadcastMessage(e.target.value)}
                                    className="w-full h-32 glass rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                    placeholder="Enter your message to all users in South Kerala Zone..."
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">Will be sent to 47 users in South Kerala Zone</p>
                                <button
                                    onClick={handleSendBroadcast}
                                    disabled={!broadcastMessage.trim() || isSendingBroadcast}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-bold transition-all"
                                >
                                    {isSendingBroadcast ? "Sending..." : "Send Broadcast"}
                                </button>
                            </div>
                        </div>

                        {/* Broadcast History */}
                        <div>
                            <h3 className="text-xl font-bold mb-4">📜 Broadcast History</h3>
                            {broadcasts.length === 0 ? (
                                <div className="text-center py-8 glass rounded-xl">
                                    <p className="text-gray-400">No broadcasts sent yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {broadcasts.map((broadcast) => (
                                        <div key={broadcast.id} className="glass-dark rounded-lg p-4">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-lg">
                                                            {broadcast.type === "alert" ? "🚨" : broadcast.type === "warning" ? "⚠️" : "ℹ️"}
                                                        </span>
                                                        <span className="font-semibold">{broadcast.type.toUpperCase()}</span>
                                                    </div>
                                                    <p className="text-gray-300 mb-2">{broadcast.message}</p>
                                                    <div className="flex items-center gap-4 text-xs text-gray-400">
                                                        <span>👥 {broadcast.recipientCount} recipients</span>
                                                        <span>🕐 {new Date(broadcast.createdAt).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Broadcast Success Popup */}
            {showBroadcastSuccess && (
                <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
                    <div className="bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl border-2 border-green-400 flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div>
                            <p className="font-bold text-lg">Message broadcasted!</p>
                            <p className="text-sm text-green-100">Successfully sent to all users in your zone</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
