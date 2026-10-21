"use client";

import React, { Suspense } from "react";
import { HackathonsHubView } from "@/features/hackathons/hackathons-hub-view";

export default function HackathonsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center text-slate-400 text-xs">
          Loading Unstop Hackathons Hub...
        </div>
      }
    >
      <HackathonsHubView />
    </Suspense>
  );
}
