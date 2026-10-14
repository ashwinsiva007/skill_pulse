"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Menu,
  RotateCcw,
  HardDrive,
  User,
  ChevronDown,
  Sparkles,
  FileText,
  Database,
  LogIn,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResetConfirmModal } from "./reset-confirm-modal";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/lib/firebase/auth-context";

export interface TopBarProps {
  onOpenMobileSidebar: () => void;
  candidateName?: string;
  targetRole?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  onOpenMobileSidebar,
}) => {
  const { user, profile, isFirebaseReady, signOut } = useAuth();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<"signin" | "signup" | "firebase">("signin");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const displayName = profile?.name?.trim() || user?.displayName || (user ? "Cloud User" : "My Workspace");
  const displayRole = profile?.targetRole || "Software Developer";
  const initials = displayName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "SP";

  const handleOpenAuth = (tab: "signin" | "signup" | "firebase" = "signin") => {
    setAuthDefaultTab(tab);
    setIsAuthModalOpen(true);
    setIsUserMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsUserMenuOpen(false);
    await signOut();
  };

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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              SkillPulse
            </span>
            <span className="text-slate-600">/</span>
            <span className="text-slate-400 truncate max-w-[200px] md:max-w-none">
              Target Track: <strong className="text-slate-300 font-medium">{displayRole}</strong>
            </span>
          </div>
        </div>

        {/* Right: Actions, Database Sync Indicator, User menu */}
        <div className="flex items-center gap-2.5 sm:gap-3 ml-auto">
          {/* Quick Create Resume Button */}
          <Link href="/resume" className="hidden sm:inline-flex">
            <Button variant="outline" size="sm" className="h-8 text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40">
              <FileText className="w-3.5 h-3.5 mr-1" />
              Build Resume
            </Button>
          </Link>

          {/* Database / Cloud Status Badge */}
          {user ? (
            <Link
              href="/settings"
              title="Cloud Database Synchronized with Firestore"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Firestore Synced</span>
            </Link>
          ) : (
            <Link
              href="/settings"
              title="Click to view Cloud Database Connection & Settings"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-800/80 border border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-colors"
            >
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">
                {isFirebaseReady ? "Cloud Sync Ready" : "Local Mode"}
              </span>
            </Link>
          )}

          {/* User Profile dropdown menu OR Sign In button */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                aria-label="Workspace menu"
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800/80 text-left transition-colors border border-transparent hover:border-slate-700"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                  {initials}
                </div>
                <div className="hidden md:block text-xs leading-none">
                  <p className="font-semibold text-slate-200">{displayName}</p>
                  <p className="text-[10px] text-emerald-400 mt-0.5">● Active Session</p>
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
                  <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-50 p-2 text-xs space-y-1 animate-in fade-in">
                    <div className="p-2 border-b border-slate-800">
                      <p className="font-semibold text-slate-200">{displayName}</p>
                      <p className="text-slate-400 text-[11px] truncate">
                        {user.email || profile?.email || "Cloud Profile"}
                      </p>
                      <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                        Device Session Active
                      </span>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>My Profile & Skills</span>
                    </Link>

                    <Link
                      href="/onboarding"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Profile Setup Wizard</span>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 p-2 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
                    >
                      <Database className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Settings & Storage</span>
                    </Link>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 p-2 rounded-lg text-rose-300 hover:bg-rose-950/40 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Log Out of Device</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleOpenAuth("signin")}
                className="text-xs h-8"
              >
                <LogIn className="w-3.5 h-3.5 mr-1" />
                Sign In / Profile
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Confirmation & Auth Modals */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authDefaultTab}
      />
    </>
  );
};
