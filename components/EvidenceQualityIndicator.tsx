"use client";

import React from "react";

export interface EvidenceQualityIndicatorProps {
    evidenceType: "camera" | "image" | "text" | "none";
    hasMetadata?: boolean;
    score: number;
}

const EvidenceQualityIndicator: React.FC<EvidenceQualityIndicatorProps> = ({
    evidenceType,
    hasMetadata = false,
    score,
}) => {
    const getEvidenceIcon = (type: string) => {
        switch (type) {
            case "camera":
                return "📹";
            case "image":
                return "📸";
            case "text":
                return "📝";
            default:
                return "❓";
        }
    };

    const getQualityColor = (score: number) => {
        if (score >= 0.8) return "text-green-400 border-green-400";
        if (score >= 0.6) return "text-yellow-400 border-yellow-400";
        if (score >= 0.4) return "text-orange-400 border-orange-400";
        return "text-red-400 border-red-400";
    };

    const getQualityLabel = (score: number) => {
        if (score >= 0.8) return "Excellent";
        if (score >= 0.6) return "Good";
        if (score >= 0.4) return "Fair";
        return "Low";
    };

    const getImprovementTip = (type: string, hasMetadata: boolean) => {
        if (type === "camera" && hasMetadata) return "Perfect! Live camera with GPS provides maximum credibility.";
        if (type === "image" && hasMetadata) return "Great! Add live camera feed for even better priority.";
        if (type === "image" && !hasMetadata) return "Tip: Enable location services to improve evidence quality.";
        if (type === "text") return "Tip: Add photos or video to significantly improve report priority.";
        return "Add evidence to improve report credibility.";
    };

    return (
        <div className="glass rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">{getEvidenceIcon(evidenceType)}</span>
                    <div>
                        <h4 className="text-sm font-bold">Evidence Quality</h4>
                        <p className="text-xs text-gray-400 capitalize">{evidenceType} {hasMetadata && "+ GPS"}</p>
                    </div>
                </div>
                <div className={`text-right`}>
                    <div className={`text-lg font-bold ${getQualityColor(score)}`}>
                        {getQualityLabel(score)}
                    </div>
                    <div className="text-xs text-gray-400">{score.toFixed(2)}/1.00</div>
                </div>
            </div>

            {/* Quality Meter */}
            <div className="mb-3">
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${score >= 0.8
                            ? "bg-gradient-to-r from-green-500 to-green-400"
                            : score >= 0.6
                                ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                                : score >= 0.4
                                    ? "bg-gradient-to-r from-orange-500 to-orange-400"
                                    : "bg-gradient-to-r from-red-500 to-red-400"
                            }`}
                        style={{ width: `${score * 100}%` }}
                    />
                </div>
            </div>

            {/* Improvement Tip */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-xs text-blue-300">
                    💡 {getImprovementTip(evidenceType, hasMetadata)}
                </p>
            </div>

            {/* Evidence Scoring Guide */}
            <div className="mt-3 pt-3 border-t border-white/10">
                <p className="text-xs text-gray-500 mb-2 font-semibold">Evidence Scoring:</p>
                <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between">
                        <span>📹 Live Camera + GPS:</span>
                        <span className="text-green-400 font-bold">1.0</span>
                    </div>
                    <div className="flex justify-between">
                        <span>📸 Image + GPS:</span>
                        <span className="text-yellow-400 font-bold">0.8</span>
                    </div>
                    <div className="flex justify-between">
                        <span>📸 Image Only:</span>
                        <span className="text-orange-400 font-bold">0.6</span>
                    </div>
                    <div className="flex justify-between">
                        <span>📝 Text Only:</span>
                        <span className="text-red-400 font-bold">0.4</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvidenceQualityIndicator;
