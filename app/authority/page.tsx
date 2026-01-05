"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import { getAuthorityByUserId, getAllCrises, deleteCrisis, updateIncidentStatus, CrisisData, createAuthorityInstruction, getDistrictsForAuthority, createAuthorityAlert } from "@/lib/firestore";

// Dynamically import map components to avoid SSR issues with Leaflet
const AuthorityCrisisMap = dynamic(
    () => import("@/components/AuthorityCrisisMap"),
    { ssr: false }
);

const CrisisDetailView = dynamic(
    () => import("@/components/CrisisDetailView"),
    { ssr: false }
);

// Mock user data
const MOCK_USERS = [
    { id: "1", name: "Raj Kumar", email: "raj@example.com", role: "user", location: "Delhi", joinedDate: "2026-01-01", reportsSubmitted: 5, status: "active" },
    { id: "2", name: "Priya Singh", email: "priya@example.com", role: "user", location: "Mumbai", joinedDate: "2026-01-02", reportsSubmitted: 3, status: "active" },
    { id: "3", name: "Amit Patel", email: "amit@example.com", role: "user", location: "Bangalore", joinedDate: "2026-01-03", reportsSubmitted: 8, status: "active" },
    { id: "4", name: "Sneha Reddy", email: "sneha@example.com", role: "user", location: "Hyderabad", joinedDate: "2026-01-03", reportsSubmitted: 2, status: "active" },
    { id: "5", name: "Vikram Sharma", email: "vikram@example.com", role: "moderator", location: "Chennai", joinedDate: "2025-12-28", reportsSubmitted: 12, status: "active" },
    { id: "6", name: "Ananya Das", email: "ananya@example.com", role: "user", location: "Kolkata", joinedDate: "2026-01-04", reportsSubmitted: 1, status: "active" },
];

export default function AuthorityDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [selectedCrisis, setSelectedCrisis] = useState<CrisisData | null>(null);
    const [showUserList, setShowUserList] = useState(false);
    const [authorityName, setAuthorityName] = useState<string>("");
    const [crises, setCrises] = useState<CrisisData[]>([]);

    // Instruction System State
    const [showInstructions, setShowInstructions] = useState(false);
    const [instructionForm, setInstructionForm] = useState({
        title: "",
        message: "",
        priority: "medium" as "critical" | "high" | "medium" | "warning" | "info", // "warning" and "info" for alerts
        targetZone: "",
        type: "instruction" as "instruction" | "alert" // New field
    });
    const [isSending, setIsSending] = useState(false);
    // Protect route - only authorities can access
    React.useEffect(() => {
        if (user && user.role !== "authority") {
            router.push("/dashboard");
        }
    }, [user, router]);

    // Fetch authority profile to get authority name
    React.useEffect(() => {
        const fetchAuthorityProfile = async () => {
            if (user && user.role === "authority") {
                const profile = await getAuthorityByUserId(user.uid);
                if (profile) {
                    setAuthorityName(profile.authorityName);
                }
            }
        };
        fetchAuthorityProfile();
    }, [user]);

    // Fetch crises from Firebase and filter by authority
    React.useEffect(() => {
        const fetchCrises = async () => {
            const fetchedCrises = await getAllCrises();
            console.log("🔍 ALL CRISES:", fetchedCrises.length);

            if (authorityName) {
                const filtered = fetchedCrises.filter(crisis => crisis.authorityName === authorityName);
                console.log("🔍 MY AUTHORITY CRISES:", filtered.length);
                setCrises(filtered);
            }
        };

        if (authorityName) {
            fetchCrises();
        }
    }, [authorityName]);

    if (!user || user.role !== "authority") {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔒</div>
                    <p className="text-gray-400">Access Denied - Authority Only</p>
                </div>
            </div>
        );
    }

    if (selectedCrisis) {
        return (
            <CrisisDetailView
                crisis={selectedCrisis}
                onBack={async () => {
                    // Update incident status to verified if crisis has linked incident
                    if (selectedCrisis.incidentId) {
                        await updateIncidentStatus(selectedCrisis.incidentId, "verified");
                    }
                    // Delete crisis from Firebase when going back
                    if (selectedCrisis.id) {
                        await deleteCrisis(selectedCrisis.id);
                        // Refresh crisis list
                        const updatedCrises = await getAllCrises();
                        setCrises(updatedCrises);
                    }
                    setSelectedCrisis(null);
                }}
            />
        );
    }

    const totalUsers = MOCK_USERS.length;
    const reportedUserCount = MOCK_USERS.filter(u => u.reportsSubmitted > 0).length;

    return (
        <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            {/* Header */}
            <div className="glass border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">
                            RESPOND<span className="text-warning-400">.AI</span> - Authority Dashboard
                        </h1>
                        <p className="text-sm text-gray-400">
                            Welcome, <span className="text-red-400 font-medium">{user.name}</span> 🚔
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        {authorityName && (
                            <p className="text-red-400 font-bold text-lg">| {authorityName}</p>
                        )}
                        <button
                            onClick={() => {
                                setShowInstructions(!showInstructions);
                                setShowUserList(false);
                            }}
                            className={`px-4 py-2 rounded-lg transition-all font-semibold ${showInstructions ? "bg-white text-slate-900" : "bg-white/10 hover:bg-white/20"
                                }`}
                        >
                            📜 Send Instructions
                        </button>
                        <button
                            onClick={() => {
                                logout();
                                router.push("/");
                            }}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-hidden">
                {showInstructions ? (
                    // Instructions View
                    <div className="h-full glass rounded-2xl p-8 border-2 border-white/10 overflow-auto flex flex-col max-w-2xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h2 className="text-2xl font-bold">Send {instructionForm.type === 'instruction' ? 'Authority Instruction' : 'Public Alert'}</h2>
                                <p className="text-gray-400">
                                    {instructionForm.type === 'instruction'
                                        ? 'Issue commands to moderators in your zones'
                                        : 'Broadcast alerts to all users in the zone'}
                                </p>
                            </div>
                            <button
                                onClick={() => setShowInstructions(false)}
                                className="bg-gray-700/50 hover:bg-gray-700 p-2 rounded-full transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Target Audience Toggle */}
                            <div className="bg-slate-800/50 p-1 rounded-lg flex">
                                <button
                                    onClick={() => setInstructionForm(prev => ({ ...prev, type: 'instruction', priority: 'medium' }))}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${instructionForm.type === 'instruction' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    👮 To Moderators
                                </button>
                                <button
                                    onClick={() => setInstructionForm(prev => ({ ...prev, type: 'alert', priority: 'warning' }))}
                                    className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${instructionForm.type === 'alert' ? 'bg-orange-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                                        }`}
                                >
                                    📢 To Public Users
                                </button>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Target Zone (District)</label>
                                <select
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={instructionForm.targetZone}
                                    onChange={(e) => setInstructionForm({ ...instructionForm, targetZone: e.target.value })}
                                >
                                    <option value="">Select a District...</option>
                                    {getDistrictsForAuthority(authorityName).map(district => (
                                        <option key={district} value={district}>{district}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">
                                    {instructionForm.type === 'instruction' ? 'Priority Level' : 'Alert Severity'}
                                </label>
                                <div className="flex gap-4">
                                    {(instructionForm.type === 'instruction'
                                        ? ['medium', 'high', 'critical']
                                        : ['info', 'warning', 'critical']
                                    ).map((priority) => (
                                        <button
                                            key={priority}
                                            onClick={() => setInstructionForm({ ...instructionForm, priority: priority as any })}
                                            className={`flex-1 py-3 rounded-lg border-2 transition-all font-bold uppercase text-sm ${instructionForm.priority === priority
                                                ? priority === 'critical' ? 'bg-red-500/20 border-red-500 text-red-500'
                                                    : priority === 'high' ? 'bg-orange-500/20 border-orange-500 text-orange-500'
                                                        : 'bg-yellow-500/20 border-yellow-500 text-yellow-500'
                                                : 'border-slate-700 text-gray-500 hover:border-slate-500'
                                                }`}
                                        >
                                            {priority}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Title</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Brief title of instruction"
                                    value={instructionForm.title}
                                    onChange={(e) => setInstructionForm({ ...instructionForm, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Detailed Instructions</label>
                                <textarea
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white h-32 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                    placeholder="Enter full details..."
                                    value={instructionForm.message}
                                    onChange={(e) => setInstructionForm({ ...instructionForm, message: e.target.value })}
                                />
                            </div>

                            <button
                                onClick={async () => {
                                    if (!instructionForm.targetZone || !instructionForm.title || !instructionForm.message) {
                                        alert("Please fill all fields");
                                        return;
                                    }
                                    setIsSending(true);
                                    if (!authorityName) { alert("Authority name missing"); setIsSending(false); return; }

                                    let result;

                                    if (instructionForm.type === 'instruction') {
                                        result = await createAuthorityInstruction({
                                            authorityId: user.uid,
                                            authorityName: authorityName,
                                            zone: instructionForm.targetZone,
                                            moderatorId: "all",
                                            title: instructionForm.title,
                                            instructions: instructionForm.message,
                                            priority: instructionForm.priority as "critical" | "high" | "medium",
                                        });
                                    } else {
                                        // Send Alert
                                        result = await createAuthorityAlert({
                                            authorityId: user.uid,
                                            authorityName: authorityName,
                                            zone: instructionForm.targetZone,
                                            title: instructionForm.title,
                                            message: instructionForm.message,
                                            type: instructionForm.priority as "critical" | "warning" | "info",
                                        });
                                    }

                                    setIsSending(false);
                                    if (result.success) {
                                        alert(`✅ ${instructionForm.type === 'instruction' ? 'Instruction' : 'Alert'} Sent Successfully!`);
                                        setShowInstructions(false);
                                        setInstructionForm({
                                            title: "",
                                            message: "",
                                            priority: "medium",
                                            targetZone: "",
                                            type: "instruction"
                                        });
                                    } else {
                                        alert("Failed to send");
                                    }
                                }}
                                disabled={isSending}
                                className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg disabled:opacity-50 transition-all ${instructionForm.type === 'instruction'
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-900/20'
                                        : 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 shadow-orange-900/20'
                                    }`}
                            >
                                {isSending ? "Sending..." : instructionForm.type === 'instruction' ? "🚀 Send Instruction" : "📢 Broadcast Alert"}
                            </button>
                        </div>
                    </div>
                ) : showUserList ? (
                    // User List View
                    <div className="h-full glass rounded-2xl p-6 border-2 border-white/10 overflow-hidden flex flex-col">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold">Registered Users</h2>
                            <p className="text-sm text-gray-400">Complete list of all registered users with their details</p>
                        </div>

                        <div className="flex-1 overflow-auto">
                            <table className="w-full">
                                <thead className="sticky top-0 glass-dark">
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Name</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Email</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Role</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Location</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Joined</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Reports</th>
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {MOCK_USERS.map((user, index) => (
                                        <tr
                                            key={user.id}
                                            className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                        >
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                                                        {user.name.charAt(0)}
                                                    </div>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-400">{user.email}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === "authority"
                                                    ? "bg-red-500/20 text-red-400"
                                                    : user.role === "moderator"
                                                        ? "bg-yellow-500/20 text-yellow-400"
                                                        : "bg-blue-500/20 text-blue-400"
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-gray-400">{user.location}</td>
                                            <td className="py-3 px-4 text-gray-400">{user.joinedDate}</td>
                                            <td className="py-3 px-4">
                                                <span className="font-semibold text-green-400">{user.reportsSubmitted}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                                                    {user.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // Crisis Map View
                    <div className="h-full glass rounded-2xl p-6 border-2 border-white/10">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold">Kerala Crisis Map - Verified Locations</h2>
                                <p className="text-sm text-gray-400">Click on any crisis marker to view details and coordinate response</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold">
                                    ● LIVE
                                </span>
                                <span className="text-sm text-gray-400">
                                    {crises.length} Active Crises
                                </span>
                            </div>
                        </div>

                        <div className="h-[calc(100%-4rem)] rounded-xl overflow-hidden border-2 border-white/10">
                            <AuthorityCrisisMap
                                onCrisisSelect={setSelectedCrisis}
                                crises={crises}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
