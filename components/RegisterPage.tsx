"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";

const RegisterPage: React.FC = () => {
    const router = useRouter();
    const { register } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "user" as UserRole,
        masterKey: "",
        agreeToTerms: false,
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (!formData.agreeToTerms) {
            setError("Please accept the terms and conditions");
            return;
        }

        if ((formData.role === "moderator" || formData.role === "authority") && !formData.masterKey) {
            setError("Master key is required for moderator and authority roles");
            return;
        }

        setIsLoading(true);

        try {
            const result = await register(
                formData.name,
                formData.email,
                formData.password,
                formData.role,
                formData.masterKey || undefined
            );
            if (result.success) {
                router.push("/dashboard");
            } else {
                setError(result.error || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold mb-2">
                        RESPOND<span className="text-warning-400">.AI</span>
                    </h1>
                    <p className="text-gray-400">Create your account</p>
                </div>

                {/* Register Form */}
                <div className="glass rounded-2xl p-8 border-2 border-white/20">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-crisis-500/20 border border-crisis-500 rounded-lg p-4 text-crisis-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Account Type</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole, masterKey: "" })}
                                className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            >
                                <option value="user">👤 User - Report incidents and view alerts</option>
                                <option value="moderator">🛡️ Moderator - Verify and manage reports</option>
                                <option value="authority">🚔 Authority - Full response coordination</option>
                            </select>
                        </div>

                        {/* Master Key (conditional) */}
                        {(formData.role === "moderator" || formData.role === "authority") && (
                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                <label className="block text-sm font-medium mb-2">
                                    🔑 Master Key {formData.role === "moderator" ? "(Moderator)" : "(Authority)"}
                                </label>
                                <input
                                    type="password"
                                    value={formData.masterKey}
                                    onChange={(e) => setFormData({ ...formData, masterKey: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    placeholder="Enter master key for verification"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-2">
                                    💡 Demo keys: <span className="text-blue-400 font-mono">MOD2026KEY</span> (moderator) or <span className="text-blue-400 font-mono">AUTH2026KEY</span> (authority)
                                </p>
                            </div>
                        )}

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <input
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                placeholder="Create a password (min. 6 characters)"
                                required
                            />
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium mb-2">Confirm Password</label>
                            <input
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) =>
                                    setFormData({ ...formData, confirmPassword: e.target.value })
                                }
                                className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                placeholder="Re-enter your password"
                                required
                            />
                        </div>

                        {/* Terms */}
                        <div>
                            <label className="flex items-start gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.agreeToTerms}
                                    onChange={(e) =>
                                        setFormData({ ...formData, agreeToTerms: e.target.checked })
                                    }
                                    className="w-4 h-4 mt-1 rounded border-gray-600 text-blue-600 focus:ring-blue-500"
                                    required
                                />
                                <span className="text-sm text-gray-400">
                                    I agree to the{" "}
                                    <a href="#" className="text-blue-400 hover:text-blue-300">
                                        Terms and Conditions
                                    </a>{" "}
                                    and{" "}
                                    <a href="#" className="text-blue-400 hover:text-blue-300">
                                        Privacy Policy
                                    </a>
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-warning-500 hover:bg-warning-600 disabled:opacity-50 disabled:cursor-not-allowed text-black rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
                        >
                            {isLoading ? "Creating Account..." : "Create Account"}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center gap-4">
                        <div className="flex-1 h-px bg-white/20"></div>
                        <span className="text-sm text-gray-500">or</span>
                        <div className="flex-1 h-px bg-white/20"></div>
                    </div>

                    {/* Login Link */}
                    <div className="text-center">
                        <p className="text-gray-400">
                            Already have an account?{" "}
                            <button
                                onClick={() => router.push("/login")}
                                className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                            >
                                Sign In
                            </button>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push("/")}
                        className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
