"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { DashboardView } from "@/features/dashboard/dashboard-view";
import { LoginLanding } from "@/components/auth/login-landing";

export default function HomePage() {
  const { user, loading } = useAuth();
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if user previously opted for guest session in this browser window
    if (typeof window !== "undefined") {
      const guestFlag = sessionStorage.getItem("skillpulse_guest_session");
      if (guestFlag === "true") {
        setIsGuest(true);
      }
    }
  }, []);

  const handleGuestAccess = () => {
    setIsGuest(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("skillpulse_guest_session", "true");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-8 h-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        <span className="text-xs font-medium tracking-wide text-slate-300">
          Loading SkillPulse AI Session...
        </span>
      </div>
    );
  }

  // If user is authenticated or chose guest access, show the full Dashboard
  if (user || isGuest) {
    return <DashboardView />;
  }

  // Otherwise, display the dedicated Login / Account Portal
  return <LoginLanding onContinueAsGuest={handleGuestAccess} />;
}
