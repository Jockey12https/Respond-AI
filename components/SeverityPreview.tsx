"use client";

import React, { useState, useEffect } from "react";
import { twsmAPI, SeverityPreview } from "@/lib/api";

export interface SeverityPreviewProps {
    description: string;
    onSeverityCalculated?: (preview: SeverityPreview) => void;
}

const SeverityPreviewComponent: React.FC<SeverityPreviewProps> = ({
    description,
    onSeverityCalculated,
}) => {
    const [preview, setPreview] = useState<SeverityPreview | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const calculateSeverity = async () => {
            if (!description || description.trim().length < 10) {
                setPreview(null);
                return;
            }

            setLoading(true);
            setError(null);

            try {
                // Debounce: wait 500ms before calculating
                const timeoutId = setTimeout(async () => {
                    try {
                        const result = await twsmAPI.calculateSeverityPreview(description);
                        setPreview(result);
                        onSeverityCalculated?.(result);
                    } catch (err) {
                        console.error("Severity calculation error:", err);
                        setError("Unable to calculate severity");
                    } finally {
                        setLoading(false);
                    }
                }, 500);

                return () => clearTimeout(timeoutId);
            } catch (err) {
                setError("Error calculating severity");
                setLoading(false);
            }
        };

        calculateSeverity();
    }, [description, onSeverityCalculated]);

    if (!description || description.trim().length < 10) {
        return (
            <div className="glass rounded-lg p-4 border border-white/10 text-center">
                <p className="text-sm text-gray-400">
                    Start typing to see AI severity analysis...
                </p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="glass rounded-lg p-4 border border-white/10 text-center">
                <div className="animate-pulse">
                    <p className="text-sm text-gray-400">🤖 Analyzing severity...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass rounded-lg p-4 border border-red-500/30 bg-red-500/10">
                <p className="text-sm text-red-400">⚠️ {error}</p>
            </div>
        );
    }

    if (!preview) return null;

    const getCrisisLevelColor = (level: string) => {
        switch (level) {
            case "critical":
                return "bg-red-600 text-white border-red-400";
            case "high":
                return "bg-orange-600 text-white border-orange-400";
            case "medium":
                return "bg-yellow-600 text-black border-yellow-400";
            default:
                return "bg-green-600 text-white border-green-400";
        }
    };

    const getEmergencyIcon = (type: string) => {
        const icons: Record<string, string> = {
            FIRE: "🔥",
            MEDICAL: "🏥",
            NATURAL_DISASTER: "🌊",
            CRIME: "🚨",
            INFRASTRUCTURE: "🏗️",
            OTHER: "⚠️",
        };
        return icons[type] || "⚠️";
    };

    return (
        <div className="glass rounded-lg p-4 border-2 border-blue-500/30 bg-blue-500/5 animate-fade-in">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold text-blue-400">🤖 AI Severity Analysis</h4>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getCrisisLevelColor(preview.crisis_level)}`}>
                    {preview.crisis_level.toUpperCase()}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="glass-dark rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Severity Score</p>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                        {preview.severity_score.toFixed(3)}
                    </p>
                </div>
                <div className="glass-dark rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">Emergency Type</p>
                    <p className="text-lg font-bold">
                        {getEmergencyIcon(preview.emergency_type)} {preview.emergency_type.replace(/_/g, " ")}
                    </p>
                </div>
            </div>

            {/* Severity Bar */}
            <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Low</span>
                    <span>Critical</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${preview.severity_score >= 0.7
                            ? "bg-gradient-to-r from-red-600 to-red-500"
                            : preview.severity_score >= 0.5
                                ? "bg-gradient-to-r from-orange-600 to-orange-500"
                                : "bg-gradient-to-r from-yellow-600 to-yellow-500"
                            }`}
                        style={{ width: `${preview.severity_score * 100}%` }}
                    />
                </div>
            </div>

            {/* Keywords Found */}
            {preview.keywords_found && preview.keywords_found.length > 0 && (
                <div className="bg-gray-800/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-2">🔍 Critical Keywords Detected:</p>
                    <div className="flex flex-wrap gap-2">
                        {preview.keywords_found.map((keyword, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-red-500/20 border border-red-500/30 rounded text-xs text-red-300 font-medium"
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Confidence Indicator */}
            <div className="mt-3 pt-3 border-t border-white/10">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">AI Confidence:</span>
                    <span className="font-bold text-blue-400">{((preview.confidence || 0.85) * 100).toFixed(0)}%</span>
                </div>
            </div>
        </div>
    );
};

export default SeverityPreviewComponent;
