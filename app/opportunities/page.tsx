"use client";

import React, { Suspense } from "react";
import { OpportunitiesView } from "@/features/opportunities/opportunities-view";

export default function OpportunitiesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 p-6 flex items-center justify-center text-slate-400 text-xs">
          Loading opportunities...
        </div>
      }
    >
      <OpportunitiesView />
    </Suspense>
  );
}
