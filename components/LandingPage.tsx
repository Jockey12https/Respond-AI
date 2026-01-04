"use client";

import React, { useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

const LandingPage: React.FC = () => {
    const router = useRouter();
    const featuresRef = useRef<HTMLDivElement>(null);
    const howItWorksRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
        ref.current?.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div className="min-h-screen">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">
                            RESPOND<span className="text-warning-400">.AI</span>
                        </h1>
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                Home
                            </button>
                            <button
                                onClick={() => scrollToSection(featuresRef)}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                Features
                            </button>
                            <button
                                onClick={() => scrollToSection(howItWorksRef)}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                How it Works
                            </button>
                            <button
                                onClick={() => router.push("/login")}
                                className="px-4 py-2 glass hover:bg-white/20 rounded-lg transition-all"
                            >
                                Login
                            </button>
                            <button
                                onClick={() => router.push("/register")}
                                className="px-6 py-2 bg-warning-500 hover:bg-warning-600 text-black font-bold rounded-lg transition-all"
                            >
                                Create Account
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="inline-block mb-6 px-4 py-2 glass rounded-full border border-warning-500/30">
                                <span className="text-warning-400 text-sm font-medium">
                                    ⚡ India's First AI-Powered Emergency Platform
                                </span>
                            </div>
                            <h1 className="text-6xl font-bold mb-6 leading-tight">
                                RESPOND<span className="text-warning-400">.AI</span>
                                <br />
                                <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Unified Emergency Intelligence
                                </span>
                            </h1>
                            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                                Harness AI & community power to save lives by coordinating emergency
                                responses in <span className="text-warning-400 font-bold">seconds</span> across
                                any Indian city.
                            </p>
                            <div className="flex gap-4 mb-12">
                                <button
                                    onClick={() => router.push("/register")}
                                    className="px-8 py-4 bg-warning-500 hover:bg-warning-600 text-black font-bold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
                                >
                                    Get Started Free
                                </button>
                                <button
                                    onClick={() => scrollToSection(howItWorksRef)}
                                    className="px-8 py-4 glass hover:bg-white/20 rounded-lg font-medium transition-all"
                                >
                                    See How it Works
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-warning-400 mb-1">24/7</div>
                                    <div className="text-sm text-gray-400">Real-Time Monitoring</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-warning-400 mb-1">&lt;60s</div>
                                    <div className="text-sm text-gray-400">Response Time</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-warning-400 mb-1">AI</div>
                                    <div className="text-sm text-gray-400">Smart Verification</div>
                                </div>
                            </div>
                        </div>

                        {/* Dashboard Preview */}
                        <div className="glass rounded-2xl p-6 border-2 border-white/20">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-crisis-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-warning-500"></div>
                                    <div className="w-3 h-3 rounded-full bg-safe-500"></div>
                                </div>
                                <span className="text-sm text-gray-400">Emergency Dashboard</span>
                            </div>
                            <div className="space-y-3">
                                <div className="glass-dark rounded-lg p-4 border-l-4 border-crisis-500">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">Active Alerts</span>
                                        <span className="text-2xl font-bold text-crisis-400">32</span>
                                    </div>
                                </div>
                                <div className="glass-dark rounded-lg p-4 border-l-4 border-safe-500">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold">Resolved</span>
                                        <span className="text-2xl font-bold text-safe-400">182</span>
                                    </div>
                                </div>
                                <div className="glass-dark rounded-lg p-4">
                                    <div className="text-sm text-crisis-400 mb-1">🔥 Fire incident - Sector 9</div>
                                    <div className="text-xs text-gray-500">Status: Responding</div>
                                </div>
                                <div className="glass-dark rounded-lg p-4">
                                    <div className="text-sm text-blue-400 mb-1">
                                        💉 Medical emergency verified
                                    </div>
                                    <div className="text-xs text-gray-500">AI Confidence: 98%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section ref={featuresRef} className="py-20 px-6 bg-black/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">
                            Empowering Cities to Respond Smarter
                        </h2>
                        <p className="text-xl text-gray-400">
                            Complete emergency response ecosystem for citizens, moderators, and authorities
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* One-Tap SOS */}
                        <div className="glass rounded-2xl p-6 hover:border-crisis-500 border-2 border-transparent transition-all group">
                            <div className="text-5xl mb-4">🆘</div>
                            <h3 className="text-2xl font-bold mb-3">One-Tap SOS</h3>
                            <p className="text-gray-400 mb-4">
                                Emergency button with auto-location, device status & timestamp capture
                            </p>
                        </div>

                        {/* Incident Reporting */}
                        <div className="glass rounded-2xl p-6 hover:border-blue-500 border-2 border-transparent transition-all">
                            <div className="text-5xl mb-4">📍</div>
                            <h3 className="text-2xl font-bold mb-3">Incident Reporting</h3>
                            <p className="text-gray-400 mb-4">
                                Report with map location picker, incident type & multimedia attachments
                            </p>
                        </div>

                        {/* Real-Time Crisis Map */}
                        <div className="glass rounded-2xl p-6 hover:border-purple-500 border-2 border-transparent transition-all">
                            <div className="text-5xl mb-4">🗺️</div>
                            <h3 className="text-2xl font-bold mb-3">Real-Time Crisis Map</h3>
                            <p className="text-gray-400 mb-4">
                                View hospitals, relief points, unsafe zones & safe evacuation routes
                            </p>
                        </div>

                        {/* Smart Alerts */}
                        <div className="glass rounded-2xl p-6 hover:border-warning-500 border-2 border-transparent transition-all">
                            <div className="text-5xl mb-4">🔔</div>
                            <h3 className="text-2xl font-bold mb-3">Smart Alerts</h3>
                            <p className="text-gray-400 mb-4">
                                Receive warnings & instructions from moderators and authorities
                            </p>
                        </div>

                        {/* AI Verification */}
                        <div className="glass rounded-2xl p-6 hover:border-safe-500 border-2 border-transparent transition-all">
                            <div className="text-5xl mb-4">🤖</div>
                            <h3 className="text-2xl font-bold mb-3">AI Verification</h3>
                            <p className="text-gray-400 mb-4">
                                GenAI analyzes reports for accuracy, urgency & credibility
                            </p>
                        </div>

                        {/* Zonal Status */}
                        <div className="glass rounded-2xl p-6 hover:border-blue-500 border-2 border-transparent transition-all">
                            <div className="text-5xl mb-4">📊</div>
                            <h3 className="text-2xl font-bold mb-3">Zonal Status</h3>
                            <p className="text-gray-400 mb-4">
                                Real-time area status: Normal, Alert, Emergency, or Restricted
                            </p>
                        </div>

                        {/* Smart Dispatch */}
                        <div className="glass rounded-2xl p-6 hover:border-warning-500 border-2 border-transparent transition-all border-warning-500/30">
                            <div className="text-5xl mb-4">🚀</div>
                            <h3 className="text-2xl font-bold mb-3 text-warning-400">Smart Dispatch</h3>
                            <p className="text-gray-400 mb-4">
                                Find & dispatch nearest best-equipped responders instantly
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section ref={howItWorksRef} className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-5xl font-bold mb-4">
                            Report, Verify, Respond: All In One Platform
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Step 1 */}
                        <div className="glass rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-crisis-600 to-crisis-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                📍
                            </div>
                            <div className="text-sm text-gray-400 mb-2">Step 1</div>
                            <h3 className="text-xl font-bold mb-3">Report Emergency</h3>
                            <p className="text-gray-400 text-sm">
                                Citizens submit incidents with location & details
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="glass rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                ✓
                            </div>
                            <div className="text-sm text-gray-400 mb-2">Step 2</div>
                            <h3 className="text-xl font-bold mb-3">Verify & Analyze</h3>
                            <p className="text-gray-400 text-sm">
                                Moderators validate & AI analyzes urgency
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="glass rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-warning-600 to-warning-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                🚨
                            </div>
                            <div className="text-sm text-gray-400 mb-2">Step 3</div>
                            <h3 className="text-xl font-bold mb-3">Dispatch & Monitor</h3>
                            <p className="text-gray-400 text-sm">
                                Authorities coordinate response teams
                            </p>
                        </div>

                        {/* Step 4 */}
                        <div className="glass rounded-2xl p-8 text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-safe-600 to-safe-700 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
                                📊
                            </div>
                            <div className="text-sm text-gray-400 mb-2">Step 4</div>
                            <h3 className="text-xl font-bold mb-3">Track & Resolve</h3>
                            <p className="text-gray-400 text-sm">Real-time updates until resolution</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-warning-900/20 to-crisis-900/20">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-5xl font-bold mb-4">Join the Mission. Hack for Tomorrow.</h2>
                    <p className="text-xl text-gray-300 mb-8">
                        Be part of India's emergency response revolution. Sign up now and help save lives.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => router.push("/register")}
                            className="px-8 py-4 bg-warning-500 hover:bg-warning-600 text-black font-bold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
                        >
                            Create Account Now
                        </button>
                        <button
                            onClick={() => router.push("/login")}
                            className="px-8 py-4 glass hover:bg-white/20 rounded-lg font-medium transition-all"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto text-center text-gray-500 text-sm">
                    <p>© 2026 Respond.AI - India's First AI-Powered Emergency Platform</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
