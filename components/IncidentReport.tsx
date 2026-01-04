"use client";

import React, { useState } from "react";
import { IncidentType, Location } from "@/types";

const IncidentReport: React.FC = () => {
    const [formData, setFormData] = useState({
        type: IncidentType.Other,
        description: "",
        location: { lat: 40.7128, lng: -74.006 } as Location,
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Incident reported:", formData);
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            setFormData({
                type: IncidentType.Other,
                description: "",
                location: { lat: 40.7128, lng: -74.006 },
            });
        }, 3000);
    };

    return (
        <div className="h-full overflow-y-auto p-8">
            <div className="max-w-3xl mx-auto">
                <h2 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Report an Incident
                </h2>
                <p className="text-gray-400 mb-8">
                    Help us respond faster by providing detailed information
                </p>

                {submitted ? (
                    <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-2xl font-bold text-safe-400 mb-2">
                            Report Submitted Successfully
                        </h3>
                        <p className="text-gray-400">
                            Emergency services have been notified and will respond shortly.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-6">
                        {/* Incident Type */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Incident Type *
                            </label>
                            <select
                                value={formData.type}
                                onChange={(e) =>
                                    setFormData({ ...formData, type: e.target.value as IncidentType })
                                }
                                className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                required
                            >
                                {Object.values(IncidentType).map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Location *
                            </label>
                            <div className="glass-dark rounded-lg p-4 border border-white/20">
                                <div className="flex items-center gap-2 mb-3">
                                    <span className="text-xl">📍</span>
                                    <span className="text-sm text-gray-400">
                                        Click on map or enter coordinates
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-gray-500">Latitude</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={formData.location.lat}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    location: {
                                                        ...formData.location,
                                                        lat: parseFloat(e.target.value),
                                                    },
                                                })
                                            }
                                            className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none text-sm"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Longitude</label>
                                        <input
                                            type="number"
                                            step="0.0001"
                                            value={formData.location.lng}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    location: {
                                                        ...formData.location,
                                                        lng: parseFloat(e.target.value),
                                                    },
                                                })
                                            }
                                            className="w-full px-3 py-2 rounded bg-black/30 border border-white/10 focus:border-blue-500 focus:outline-none text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Description *
                            </label>
                            <textarea
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({ ...formData, description: e.target.value })
                                }
                                rows={5}
                                className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all resize-none"
                                placeholder="Provide as much detail as possible about the incident..."
                                required
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg font-bold text-lg shadow-lg transition-all duration-300 transform hover:scale-105"
                        >
                            Submit Report
                        </button>
                    </form>
                )}

                {/* Info Box */}
                <div className="mt-6 glass-dark rounded-lg p-4 border-l-4 border-blue-500">
                    <p className="text-sm text-gray-400">
                        <span className="font-semibold text-blue-400">💡 Tip:</span> Include
                        specific details like building names, cross streets, or landmarks to
                        help emergency responders locate the incident quickly.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default IncidentReport;
