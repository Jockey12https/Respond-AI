"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
import CrisisDetailView from "@/components/CrisisDetailView";
import { MOCK_CRISIS_DATA } from "@/components/ModeratorCrisisMap";

// Dynamically import map component to avoid SSR issues
const ModeratorCrisisMap = dynamic(
    () => import("@/components/ModeratorCrisisMap"),
    { ssr: false }
);

export default function AuthorityDashboard() {
    const router = useRouter();
    const { user, logout } = useAuth();
    const [selectedCrisis, setSelectedCrisis] = useState<typeof MOCK_CRISIS_DATA[0] | null>(null);

    // Protect route - only authorities can access
    React.useEffect(() => {
        if (user && user.role !== "authority") {
            router.push("/dashboard");
        }
    }, [user, router]);

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
                onBack={() => setSelectedCrisis(null)}
            />
        );
    }

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
                        <div className="glass rounded-lg px-4 py-2">
                            <p className="text-xs text-gray-400">Role</p>
                            <p className="font-bold text-red-400">Authority</p>
                        </div>
                        <button
                            onClick={() => router.push("/dashboard")}
                            className="glass hover:bg-white/10 px-4 py-2 rounded-lg transition-all"
                        >
                            Standard View
                        </button>
                        <button
                            onClick={logout}
                            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-all"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6">
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
                                {MOCK_CRISIS_DATA.length} Active Crises
                            </span>
                        </div>
                    </div>

                    <div className="h-[calc(100%-4rem)] rounded-xl overflow-hidden border-2 border-white/10">
                        <ModeratorCrisisMap onCrisisSelect={setSelectedCrisis} />
                    </div>
                </div>
            </div>
        </div>
    );
}
