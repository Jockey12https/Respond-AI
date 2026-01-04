"use client";

import React from "react";

interface SOSModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const SOSModal: React.FC<SOSModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative glass-dark rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 border-crisis-500 animate-slide-in">
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🚨</div>
                    <h2 className="text-3xl font-bold text-crisis-400 mb-4">
                        Emergency SOS
                    </h2>
                    <p className="text-gray-300 mb-6">
                        This will immediately alert emergency services and your emergency
                        contacts. Are you sure you want to proceed?
                    </p>

                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 px-6 rounded-lg glass hover:bg-white/20 font-medium transition-all duration-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="flex-1 py-3 px-6 rounded-lg bg-gradient-to-r from-crisis-600 to-crisis-700 hover:from-crisis-500 hover:to-crisis-600 font-bold transition-all duration-300 shadow-lg"
                        >
                            Confirm SOS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SOSModal;
