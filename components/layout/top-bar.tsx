"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  RotateCcw,
  HardDrive,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResetConfirmModal } from "./reset-confirm-modal";

export interface TopBarProps {
  onOpenMobileSidebar: () => void;
  candidateName?: string;
  targetRole?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileSidebar,
  candidateName = "Alex Morgan",
  targetRole = "Staff AI Solutions Architect",
}) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-[#0b101c]/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & breadcrumb/view context */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileSidebar}
            aria-label="Open mobile navigation"
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="hidden sm:flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Demo Workspace
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 truncate max-w-[200px] md:max-w-none">
              Target Role: <strong className="text-slate-300 font-medium">{targetRole}</strong>
            </span>
          </div>
        </div>

        {/* Right: Actions, Demo Mode Indicator, Reset Demo Data, Avatar */}
        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
          {/* Storage notice badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <HardDrive className="w-3.5 h-3.5 text-indigo-400" />
            <span>Local Storage Active</span>
          </div>

          {/* Reset Demo Data button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="h-8 text-xs text-slate-300 border-slate-700 hover:bg-slate-800"
            title="Reset browser storage to default fictional demo candidate"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            <span className="hidden sm:inline">Reset Demo</span>
          </Button>

          {/* User Profile dropdown menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              aria-label="Demo workspace menu"
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors border border-transparent hover:border-slate-700"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                AM
              </div>
              <div className="hidden md:block text-xs leading-none">
                <p className="font-semibold text-slate-200">{candidateName}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Demo User</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {/* Menu Popover */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-50 p-2 text-xs space-y-1">
                  <div className="p-2 border-b border-slate-800">
                    <p className="font-semibold text-slate-200">{candidateName}</p>
                    <p className="text-slate-400 text-[11px] truncate">
                      alex.morgan@demo-candidate.internal
                    </p>
                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800">
                      Browser Demo Mode (No Cloud Account)
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>View Demo Profile</span>
                  </Link>

                  <Link
                    href="/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                  >
                    <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Browser Storage Settings</span>
                  </Link>

                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      setIsResetModalOpen(true);
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-amber-300 hover:bg-slate-800 transition-colors text-left"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                    <span>Restore Seed Data</span>
                  </button>

                  <div className="pt-1.5 mt-1 border-t border-slate-800/80 px-2 py-1 text-[11px] text-slate-400">
                    Stage 1 Foundation: Auth intentionally deferred to after Stage 5.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </>
  );
};
