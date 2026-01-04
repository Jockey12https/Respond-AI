"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import LandingPage from "@/components/LandingPage";
import { useEffect } from "react";

export default function Home() {
    const { isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    if (isAuthenticated) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                <p className="text-gray-400">Redirecting to dashboard...</p>
            </div>
        );
    }

    return <LandingPage />;
}
