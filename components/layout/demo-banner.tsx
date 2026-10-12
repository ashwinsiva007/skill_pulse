"use client";

import React, { useState } from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResetConfirmModal } from "./reset-confirm-modal";

export const DemoBanner: React.FC = () => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  return (
    <>
      <div className="w-full bg-slate-900/90 border-b border-indigo-500/20 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-3 text-slate-300">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            DEMO MODE
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Data is stored in this browser.
          </span>
          <span className="text-slate-400 text-[11px] hidden md:inline">
            (No account or cloud keys required — Stage 2 Profile Builder)
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="h-7 text-xs text-slate-400 hover:text-slate-200"
            title="Reset storage to default fictional candidate dataset"
          >
            <RotateCcw className="w-3 h-3 mr-1 text-slate-400" />
            Reset Demo Data
          </Button>
        </div>
      </div>

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </>
  );
};
