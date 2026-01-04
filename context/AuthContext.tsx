"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "user" | "moderator" | "authority";

interface User {
    email: string;
    name: string;
    role: UserRole;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, role: UserRole, masterKey?: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string, role: UserRole, masterKey?: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
}

// Master keys for role verification (in production, these would be server-side)
const MASTER_KEYS = {
    moderator: "MOD2026KEY",
    authority: "AUTH2026KEY",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        // Mark component as mounted (client-side only)
        setIsMounted(true);

        // Check if user is logged in (from localStorage)
        if (typeof window !== "undefined") {
            const storedUser = localStorage.getItem("respond_user");
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    // Clear invalid stored data
                    localStorage.removeItem("respond_user");
                }
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (
        email: string,
        password: string,
        role: UserRole,
        masterKey?: string
    ): Promise<{ success: boolean; error?: string }> => {
        // Validate master key for elevated roles
        if (role === "moderator" && masterKey !== MASTER_KEYS.moderator) {
            return { success: false, error: "Invalid moderator master key" };
        }
        if (role === "authority" && masterKey !== MASTER_KEYS.authority) {
            return { success: false, error: "Invalid authority master key" };
        }

        // Mock authentication - in production, this would call an API
        if (email && password) {
            const userData = {
                email,
                name: email.split("@")[0],
                role,
            };
            setUser(userData);
            if (typeof window !== "undefined") {
                localStorage.setItem("respond_user", JSON.stringify(userData));
            }
            return { success: true };
        }
        return { success: false, error: "Invalid credentials" };
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        role: UserRole,
        masterKey?: string
    ): Promise<{ success: boolean; error?: string }> => {
        // Validate master key for elevated roles
        if (role === "moderator" && masterKey !== MASTER_KEYS.moderator) {
            return { success: false, error: "Invalid moderator master key" };
        }
        if (role === "authority" && masterKey !== MASTER_KEYS.authority) {
            return { success: false, error: "Invalid authority master key" };
        }

        // Mock registration
        if (name && email && password) {
            const userData = { email, name, role };
            setUser(userData);
            if (typeof window !== "undefined") {
                localStorage.setItem("respond_user", JSON.stringify(userData));
            }
            return { success: true };
        }
        return { success: false, error: "Registration failed" };
    };

    const logout = () => {
        setUser(null);
        if (typeof window !== "undefined") {
            localStorage.removeItem("respond_user");
        }
    };

    if (isLoading || !isMounted) {
        return (
            <div
                className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
                suppressHydrationWarning
            >
                <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse">🚨</div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
