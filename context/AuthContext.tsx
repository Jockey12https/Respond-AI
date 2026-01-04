"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export type UserRole = "user" | "moderator" | "authority";

interface User {
    email: string;
    name: string;
    role: UserRole;
    uid: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string, role: UserRole, masterKey?: string) => Promise<{ success: boolean; error?: string }>;
    register: (name: string, email: string, password: string, role: UserRole, masterKey?: string) => Promise<{ success: boolean; error?: string; userId?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
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

    useEffect(() => {
        // Listen to Firebase auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get user data from Firestore
                    const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        setUser({
                            email: firebaseUser.email || "",
                            name: userData.name,
                            role: userData.role as UserRole,
                            uid: firebaseUser.uid,
                        });
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        // Set a timeout to stop loading after 1 second even if auth hasn't resolved
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 1000);

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const login = async (
        email: string,
        password: string,
        role: UserRole,
        masterKey?: string
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            // Validate master key for elevated roles
            if (role === "moderator" && masterKey !== MASTER_KEYS.moderator) {
                return { success: false, error: "Invalid moderator master key" };
            }
            if (role === "authority" && masterKey !== MASTER_KEYS.authority) {
                return { success: false, error: "Invalid authority master key" };
            }

            // Sign in with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);

            // Verify role matches what's stored in Firestore
            const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                if (userData.role !== role) {
                    await signOut(auth);
                    return { success: false, error: "Role mismatch. Please select the correct role." };
                }
            } else {
                await signOut(auth);
                return { success: false, error: "User data not found" };
            }

            return { success: true };
        } catch (error: any) {
            console.error("Login error:", error);
            let errorMessage = "Login failed";

            // Handle offline errors
            if (error.code === "unavailable" || error.message?.includes("offline")) {
                errorMessage = "Cannot connect to server. Please check your internet connection.";
            } else if (error.code === "auth/invalid-credential") {
                errorMessage = "Invalid email or password. Please check your credentials or register a new account.";
            } else if (error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
                errorMessage = "Invalid email or password";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email format";
            } else if (error.code === "auth/too-many-requests") {
                errorMessage = "Too many attempts. Please try again later";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection.";
            }
            return { success: false, error: errorMessage };
        }
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        role: UserRole,
        masterKey?: string
    ): Promise<{ success: boolean; error?: string; userId?: string }> => {
        try {
            // Validate master key for elevated roles
            if (role === "moderator" && masterKey !== MASTER_KEYS.moderator) {
                return { success: false, error: "Invalid moderator master key" };
            }
            if (role === "authority" && masterKey !== MASTER_KEYS.authority) {
                return { success: false, error: "Invalid authority master key" };
            }

            // Create user with Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            // Store additional user data in Firestore
            await setDoc(doc(db, "users", userCredential.user.uid), {
                name,
                email,
                role,
                createdAt: new Date().toISOString(),
            });

            return { success: true, userId: userCredential.user.uid };
        } catch (error: any) {
            console.error("Registration error:", error);
            let errorMessage = "Registration failed";

            // Handle offline errors
            if (error.code === "unavailable" || error.message?.includes("offline")) {
                errorMessage = "Cannot connect to server. Please check your internet connection.";
            } else if (error.code === "auth/email-already-in-use") {
                errorMessage = "Email already in use";
            } else if (error.code === "auth/invalid-email") {
                errorMessage = "Invalid email format";
            } else if (error.code === "auth/weak-password") {
                errorMessage = "Password should be at least 6 characters";
            } else if (error.code === "auth/network-request-failed") {
                errorMessage = "Network error. Please check your connection.";
            }
            return { success: false, error: errorMessage };
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    // Render immediately - don't block on loading
    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                isLoading,
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
