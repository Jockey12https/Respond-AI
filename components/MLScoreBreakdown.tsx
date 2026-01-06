"use client";

import React from "react";

export interface MLScoreBreakdownProps {
    severity: number;
    trust: number;
    evidence: number;
    contextRisk: number;
    finalPriority: number;
    action: "DISPATCH" | "VALIDATE" | "HOLD";
}

const MLScoreBreakdown: React.FC<MLScoreBreakdownProps> = ({
    severity,
    trust,
    evidence,
    contextRisk,
    finalPriority,
    action,
}) => {
    const getActionColor = (action: string) => {
        switch (action) {
            case "DISPATCH":
                return "bg-red-600";
            case "VALIDATE":
                return "bg-orange-600";
            case "HOLD":
                return "bg-yellow-600";
            default:
                return "bg-gray-600";
        }
    };

    const ScoreBar = ({ label, score, tooltip }: { label: string; score: number; tooltip: string }) => (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-300 group relative">
                    {label}
                    <span className="invisible group-hover:visible absolute left-0 top-6 bg-gray-900 text-xs text-white p-2 rounded shadow-lg z-10 w-48">
                        {tooltip}
                    </span>
                </span>
                <span className="text-sm font-bold text-blue-400">{score.toFixed(3)}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${score * 100}%` }}
                />
            </div>
        </div>
    );

    return (
        <div className="glass rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">🤖 TWSM Score Breakdown</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getActionColor(action)}`}>
                    {action}
                </span>
            </div>

            <div className="space-y-1 mb-4">
                <ScoreBar
                    label="🔥 Severity"
                    score={severity}
                    tooltip="Emergency severity based on NLP analysis of description keywords"
                />
                <ScoreBar
                    label="⭐ Trust Score"
                    score={trust}
                    tooltip="Reporter credibility based on reporting history and verification ratio"
                />
                <ScoreBar
                    label="📸 Evidence Quality"
                    score={evidence}
                    tooltip="Quality of proof provided (camera, image, text)"
                />
                <ScoreBar
                    label="🌍 Context Risk"
                    score={contextRisk}
                    tooltip="Environmental factors: population density, time, weather"
                />
            </div>

            <div className="border-t border-white/10 pt-4">
                <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-300">Final Priority</span>
                    <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                        {finalPriority.toFixed(3)}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Formula: Severity × Trust × Evidence × Context Risk
                </p>
            </div>
        </div>
    );
};

export default MLScoreBreakdown;
