"use client";

import React from "react";

export interface TrustScoreBadgeProps {
    trustScore: number;
    totalReports?: number;
    verifiedReports?: number;
    verificationRatio?: number;
    trend?: "improving" | "stable" | "declining";
    showDetails?: boolean;
}

const TrustScoreBadge: React.FC<TrustScoreBadgeProps> = ({
    trustScore,
    totalReports = 0,
    verifiedReports = 0,
    verificationRatio = 0,
    trend = "stable",
    showDetails = false,
}) => {
    const getTrustColor = (score: number) => {
        if (score >= 0.7) return "bg-green-600 text-white border-green-400";
        if (score >= 0.4) return "bg-yellow-600 text-black border-yellow-400";
        return "bg-red-600 text-white border-red-400";
    };

    const getTrustLabel = (score: number) => {
        if (score >= 0.7) return "Trusted";
        if (score >= 0.4) return "Moderate";
        return "New Reporter";
    };

    const getTrendIcon = (trend: string) => {
        switch (trend) {
            case "improving":
                return "📈";
            case "declining":
                return "📉";
            default:
                return "➡️";
        }
    };

    return (
        <div className="inline-block group relative">
            <div className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getTrustColor(trustScore)} transition-all cursor-help`}>
                ⭐ {getTrustLabel(trustScore)} ({trustScore.toFixed(2)})
            </div>

            {/* Tooltip */}
            <div className="invisible group-hover:visible absolute left-0 top-8 bg-gray-900 border border-white/20 rounded-lg shadow-2xl z-50 p-4 w-64">
                <h4 className="text-sm font-bold mb-2 text-white">Trust Score Details</h4>
                <div className="space-y-2 text-xs text-gray-300">
                    <div className="flex justify-between">
                        <span>Trust Score:</span>
                        <span className="font-bold text-blue-400">{trustScore.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Total Reports:</span>
                        <span className="font-bold">{totalReports}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Verified Reports:</span>
                        <span className="font-bold text-green-400">{verifiedReports}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Verification Ratio:</span>
                        <span className="font-bold">{(verificationRatio * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span>Trend:</span>
                        <span className="font-bold">
                            {getTrendIcon(trend)} {trend}
                        </span>
                    </div>
                </div>
                <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                        Trust score affects how your reports are prioritized. Higher trust = faster response.
                    </p>
                </div>
            </div>

            {showDetails && (
                <div className="mt-2 text-xs text-gray-400">
                    {totalReports} reports • {(verificationRatio * 100).toFixed(0)}% verified
                </div>
            )}
        </div>
    );
};

export default TrustScoreBadge;
