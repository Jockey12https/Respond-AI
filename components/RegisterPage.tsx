"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, UserRole } from "@/context/AuthContext";
import { getAllAuthorities, createAuthorityProfile, createModeratorProfile, AuthorityProfile, getAuthorityNames, getDistrictsForAuthority } from "@/lib/firestore";

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
        authorityName: "", // For authority registration
        selectedAuthority: "", // For moderator registration
        zoneName: "", // For moderator zone
        agreeToTerms: false,
    });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [authorities, setAuthorities] = useState<AuthorityProfile[]>([]);

    // Fetch authorities for moderator selection
    useEffect(() => {
        const fetchAuthorities = async () => {
            const authList = await getAllAuthorities();
            setAuthorities(authList);
        };
        fetchAuthorities();
    }, []);

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

        if (formData.role === "authority" && !formData.authorityName.trim()) {
            setError("Authority name is required");
            return;
        }

        if (formData.role === "moderator" && !formData.selectedAuthority) {
            setError("Please select an authority");
            return;
        }

        if (formData.role === "moderator" && !formData.zoneName.trim()) {
            setError("Zone name is required for moderators");
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
                // If authority, save authority profile
                if (formData.role === "authority" && result.userId) {
                    await createAuthorityProfile({
                        userId: result.userId,
                        authorityName: formData.authorityName,
                        email: formData.email,
                        name: formData.name
                    });
                }

                // If moderator, save moderator profile
                if (formData.role === "moderator" && result.userId) {
                    // Find authority name from selected authority ID
                    const selectedAuth = authorities.find(a => a.id === formData.selectedAuthority);

                    // Validation: Ensure authority has authorityName
                    if (!selectedAuth?.authorityName) {
                        setError("Selected authority is missing regional name. Please contact administrator.");
                        setIsLoading(false);
                        return;
                    }

                    // Validation: Ensure zone is selected
                    if (!formData.zoneName) {
                        setError("Please select a district/zone.");
                        setIsLoading(false);
                        return;
                    }

                    await createModeratorProfile({
                        userId: result.userId,
                        moderatorName: formData.name,
                        email: formData.email,
                        name: formData.name,
                        zone: formData.zoneName,
                        authorityId: formData.selectedAuthority,
                        authorityName: selectedAuth.authorityName // Guaranteed to exist now
                    });
                }

                // Redirect based on role
                if (formData.role === "moderator") {
                    router.push("/moderator");
                } else if (formData.role === "authority") {
                    router.push("/authority");
                } else {
                    router.push("/dashboard");
                }
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
                            </div>
                        )}

                        {/* Authority Name (for authority role) */}
                        {formData.role === "authority" && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                                <label className="block text-sm font-medium mb-2">
                                    🏢 Authority Name/Organization
                                </label>
                                <select
                                    value={formData.authorityName}
                                    onChange={(e) => setFormData({ ...formData, authorityName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
                                    required
                                >
                                    <option value="">Select Kerala Region...</option>
                                    <option value="North Kerala">North Kerala</option>
                                    <option value="South Kerala">South Kerala</option>
                                    <option value="East Kerala">East Kerala</option>
                                    <option value="West Kerala">West Kerala</option>
                                </select>
                                <p className="text-xs text-gray-400 mt-2">This name will be visible to moderators</p>
                            </div>
                        )}

                        {/* Authority Selection (for moderator role) */}
                        {formData.role === "moderator" && (
                            <>
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                                    <label className="block text-sm font-medium mb-2">
                                        👮 Select Your Authority
                                    </label>
                                    <select
                                        value={formData.selectedAuthority}
                                        onChange={(e) => setFormData({ ...formData, selectedAuthority: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        required
                                    >
                                        <option value="">Select an authority...</option>
                                        {authorities.map((auth) => (
                                            <option key={auth.id} value={auth.id}>
                                                {auth.authorityName}
                                            </option>
                                        ))}
                                    </select>
                                    {authorities.length === 0 && (
                                        <p className="text-xs text-yellow-400 mt-2">⚠️ No authorities registered yet. Contact your administrator.</p>
                                    )}
                                </div>

                                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                                    <label className="block text-sm font-medium mb-2">
                                        📍 Zone Name
                                    </label>
                                    <select
                                        value={formData.zoneName}
                                        onChange={(e) => setFormData({ ...formData, zoneName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-lg glass-dark border border-white/20 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                                        required
                                        disabled={!formData.selectedAuthority}
                                    >
                                        <option value="">Select district...</option>
                                        {formData.selectedAuthority && authorities.find(a => a.id === formData.selectedAuthority) &&
                                            getDistrictsForAuthority(
                                                authorities.find(a => a.id === formData.selectedAuthority)?.authorityName || ""
                                            ).map((district) => (
                                                <option key={district} value={district}>
                                                    {district}
                                                </option>
                                            ))
                                        }
                                    </select>
                                    <p className="text-xs text-gray-400 mt-2">Enter the zone you will be moderating</p>
                                </div>
                            </>
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
