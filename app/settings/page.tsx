"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResetConfirmModal } from "@/components/layout/reset-confirm-modal";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/lib/firebase/auth-context";
import { getFirebaseConfig } from "@/lib/firebase/config";
import { DemoManager } from "@/lib/demo/demo-manager";
import {
  HardDrive,
  RotateCcw,
  Download,
  Upload,
  Database,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  ExternalLink,
  Lock,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function SettingsPage() {
  const { user, isFirebaseReady, signOut, isAdmin } = useAuth();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"signin" | "signup" | "firebase">("signin");
  const [summary, setSummary] = useState(DemoManager.getStorageSummary());
  const [importStatus, setImportStatus] = useState<string | null>(null);
  
  // Admin Credentials Protection
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [showAdminPinModal, setShowAdminPinModal] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [adminError, setAdminError] = useState<string | null>(null);

  const fbConfig = getFirebaseConfig();

  // Automatically unlock admin access if signed in as admin@gmail.com
  useEffect(() => {
    if (isAdmin || user?.email === "admin@gmail.com") {
      setIsAdminUnlocked(true);
    }
  }, [isAdmin, user]);

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const pin = adminPin.trim();
    if (pin === "admin@123" || pin === "admin007" || pin === "admin") {
      setIsAdminUnlocked(true);
      setShowAdminPinModal(false);
      setAdminPin("");
      setAdminError(null);
      setAuthModalTab("firebase");
      setIsAuthModalOpen(true);
    } else {
      setAdminError("Invalid Admin PIN. Credentials access is restricted to system administrators.");
    }
  };

  const refreshSummary = () => {
    setSummary(DemoManager.getStorageSummary());
  };

  useEffect(() => {
    refreshSummary();
  }, []);

  const handleExport = () => {
    const json = DemoManager.exportSnapshot();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillpulse-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = DemoManager.importSnapshot(content);
      if (res.success) {
        setImportStatus("Snapshot restored successfully!");
        refreshSummary();
        setTimeout(() => {
          if (typeof window !== "undefined") window.location.reload();
        }, 1200);
      } else {
        setImportStatus(`Import failed: ${res.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handlePurge = () => {
    if (confirm("Are you sure you want to completely purge local cache keys from this browser?")) {
      DemoManager.purgeAllData();
      refreshSummary();
      if (typeof window !== "undefined") window.location.reload();
    }
  };

  const openAuthWithTab = (tab: "signin" | "signup" | "firebase") => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Database & Settings</h1>
              <Badge variant={user ? "emerald" : "indigo"} size="sm">
                {user ? "Firestore Connected" : "Local / Cloud Hybrid"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Manage your Firebase Cloud Firestore connection, persistent device sessions, and local data backups.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!user && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => openAuthWithTab("signin")}
                className="text-xs"
              >
                <Lock className="w-3.5 h-3.5 mr-1" />
                Sign In / Profile
              </Button>
            )}
          </div>
        </div>

        {/* Cloud Database & Authentication Card */}
        <Card className="border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-[#0f172a] to-slate-900">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Firebase Cloud Firestore & Authentication
                </CardTitle>
                <CardDescription>
                  Enterprise-grade cloud database with automatic session persistence across device restarts
                </CardDescription>
              </div>
              <Badge variant={user ? "emerald" : isFirebaseReady ? "indigo" : "amber"} size="sm">
                {user ? "● User Authenticated" : isFirebaseReady ? "● Configured" : "● Local Mode"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Database Provider</span>
                <span className="font-semibold text-white flex items-center gap-1.5 text-sm">
                  <Database className="w-4 h-4 text-amber-400" />
                  Google Cloud Firestore
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Project: {fbConfig?.projectId || "Default / Local Cache"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Authentication Session</span>
                <span className="font-semibold text-white flex items-center gap-1.5 text-sm">
                  {user ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      Persistent Device Active
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-slate-400" />
                      Guest / Demo Session
                    </>
                  )}
                </span>
                <span className="text-[10px] text-slate-400 block truncate">
                  {user ? user.email : "Sign in to activate cloud sync"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-400 block text-[11px]">Data Loss Prevention</span>
                <span className="font-semibold text-emerald-400 flex items-center gap-1.5 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Zero-Data-Loss Architecture
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Atomic Firestore merge + Local replica
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
              <div className="flex flex-wrap items-center gap-2">
                {user ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signOut()}
                    className="text-xs text-rose-300 border-rose-900/50 hover:bg-rose-950/40"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1 text-rose-400" />
                    Log Out of Device
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => openAuthWithTab("signin")}
                      className="text-xs"
                    >
                      <Lock className="w-3.5 h-3.5 mr-1" />
                      Sign In
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openAuthWithTab("signup")}
                      className="text-xs border-indigo-500/40 text-indigo-300"
                    >
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                      Create Account
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (isAdminUnlocked) {
                      openAuthWithTab("firebase");
                    } else {
                      setShowAdminPinModal(true);
                    }
                  }}
                  className="text-xs text-slate-400 hover:text-slate-200 border-slate-700"
                >
                  <Lock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                  {isAdminUnlocked ? "Admin Firebase Console" : "Admin Credentials Access"}
                </Button>
              </div>

              <div className="text-[11px] text-slate-400">
                Data is isolated and securely synced. Credentials access is restricted to Administrators.
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Local Storage & Cache Health */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Local Offline Cache & Storage Metrics</CardTitle>
                <CardDescription>
                  Instant-load browser cache with snapshot backup & restore
                </CardDescription>
              </div>
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-400">
                <HardDrive className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Active Schema</span>
                <span className="font-bold text-white text-base">v{summary.schemaVersion ?? 1}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Recorded Skills</span>
                <span className="font-bold text-cyan-400 text-base">{summary.skillsCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Resume Drafts</span>
                <span className="font-bold text-emerald-400 text-base">{summary.resumesCount}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <span className="text-slate-400 block mb-1">Storage Footprint</span>
                <span className="font-bold text-indigo-400 text-base">
                  ~{(summary.estimatedBytes / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="text-xs"
              >
                <Download className="w-3.5 h-3.5 mr-1" />
                Export Local JSON Snapshot
              </Button>

              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 transition-colors">
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                <span>Restore Snapshot</span>
                <input
                  type="file"
                  accept="application/json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetModalOpen(true)}
                className="text-xs text-amber-300 hover:text-amber-200 border-amber-800/60"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset Sample Persona
              </Button>

              <Button
                variant="danger"
                size="sm"
                onClick={handlePurge}
                className="text-xs ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Purge Local Cache
              </Button>
            </div>

            {importStatus && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-indigo-300">
                {importStatus}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetComplete={refreshSummary}
      />

      {/* Admin Unlock Modal */}
      {showAdminPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Administrator Verification</h3>
                <p className="text-[11px] text-slate-400">Restricted cloud credentials maintenance</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Firebase API Keys and Project Infrastructure setup are accessible to system administrators only.
            </p>

            <form onSubmit={handleUnlockAdmin} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Enter Admin Passcode / PIN
                </label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setAdminError(null);
                  }}
                  placeholder="Enter administrator PIN..."
                  autoFocus
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
                {adminError && (
                  <p className="text-[11px] text-rose-400 mt-1 font-medium">{adminError}</p>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAdminPinModal(false);
                    setAdminPin("");
                    setAdminError(null);
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="text-xs"
                >
                  Verify & Unlock
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authModalTab}
        showAdminCredentials={isAdminUnlocked}
      />
    </AppLayout>
  );
}
