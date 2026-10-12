"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { DemoManager } from "@/lib/demo/demo-manager";

export interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetComplete?: () => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onResetComplete,
}) => {
  const [isResetting, setIsResetting] = useState(false);

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      DemoManager.forceResetToDemo();
      if (onResetComplete) {
        onResetComplete();
      }
      onClose();
      // Reload page to reflect fresh demo data state consistently
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to reset demo data:", err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Demo Dataset"
      maxWidth="md"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-amber-200">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-semibold text-amber-300">Data will be reset to default seed values</p>
            <p className="text-amber-300/80 leading-relaxed">
              This action will discard any manual modifications made in this browser session and restore the initial fictional candidate profile (Alex Morgan), skills list, roadmap milestones, and demo records.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 space-y-1.5 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
          <p className="font-medium text-slate-300">Browser Local Storage Notice:</p>
          <p>
            Your PathPilot data is isolated to this specific browser instance via HTML5 LocalStorage. No server databases or cloud credentials are in use during Stage 1.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isResetting}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleConfirmReset}
            isLoading={isResetting}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Confirm Reset
          </Button>
        </div>
      </div>
    </Modal>
  );
};
