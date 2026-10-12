"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResetConfirmModal } from "@/components/layout/reset-confirm-modal";
import { DemoManager } from "@/lib/demo/demo-manager";
import {
  HardDrive,
  RotateCcw,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  Trash2,
} from "lucide-react";

export default function SettingsPage() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [summary, setSummary] = useState(DemoManager.getStorageSummary());
  const [importStatus, setImportStatus] = useState<string | null>(null);

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
    a.download = `pathpilot-demo-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
    if (confirm("Are you sure you want to completely purge all PathPilot keys from this browser?")) {
      DemoManager.purgeAllData();
      refreshSummary();
      if (typeof window !== "undefined") window.location.reload();
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Settings & Storage</h1>
            <Badge variant="indigo" size="sm">
              Local Browser State
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Inspect, backup, or reset your local demo dataset and review PathPilot architecture.
          </p>
        </div>

        {/* Security Warning & Architecture Banner */}
        <div className="p-4 rounded-xl bg-amber-950/25 border border-amber-800/40 text-xs space-y-2">
          <div className="flex items-center gap-2 text-amber-300 font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            Browser Local Storage Architecture Warning
          </div>
          <p className="text-amber-200/80 leading-relaxed">
            PathPilot Stage 1 intentionally uses HTML5 browser storage (localStorage) for zero-friction local development. No user accounts, passwords, or cloud database credentials are required. <strong>Browser storage is intended strictly for development and testing, not secure production storage.</strong>
          </p>
        </div>

        {/* Storage Diagnostics */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Storage Health & Metrics</CardTitle>
                <CardDescription>
                  Summary of keys saved under the <code>pathpilot_mvp_v1</code> namespace
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
                <span className="text-slate-400 block mb-1">Schema Version</span>
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
                variant="danger"
                size="sm"
                onClick={() => setIsResetModalOpen(true)}
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                Reset to Demo Seed Data
              </Button>

              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-3.5 h-3.5 mr-1" />
                Export JSON Backup
              </Button>

              <label className="cursor-pointer inline-flex items-center justify-center font-medium transition-colors border border-slate-700 text-slate-300 hover:bg-slate-800/60 text-xs px-2.5 py-1.5 rounded-lg">
                <Upload className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Import JSON Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>

              <Button
                variant="ghost"
                size="sm"
                onClick={handlePurge}
                className="text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Purge All Local Data
              </Button>
            </div>

            {importStatus && (
              <p className="text-xs text-indigo-300 bg-indigo-950/60 p-2.5 rounded-lg border border-indigo-800/60 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                {importStatus}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Five Stage Roadmap Overview */}
        <Card>
          <CardHeader>
            <CardTitle>PathPilot Platform Roadmap (Stages 1 – 5)</CardTitle>
            <CardDescription>
              Architectural phases for full autonomous career guidance platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/50 flex items-start gap-3">
                <Badge variant="indigo" size="sm" className="shrink-0 mt-0.5">
                  Stage 1 (Current)
                </Badge>
                <div>
                  <h4 className="font-semibold text-slate-200">
                    Foundation Architecture & Demo Workspace
                  </h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Zero-auth frictionless launch, typed repository abstraction, local persistence adapter, responsive dark-first dashboard, and fictional candidate dataset.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <Badge variant="neutral" size="sm" className="shrink-0 mt-0.5">
                  Stage 2
                </Badge>
                <div>
                  <h4 className="font-semibold text-slate-200">
                    AI Resume Tailoring Engine & ATS Scanner
                  </h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Automated role keyword extraction, ATS compatibility score evaluator, and formatted PDF export.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <Badge variant="neutral" size="sm" className="shrink-0 mt-0.5">
                  Stage 3
                </Badge>
                <div>
                  <h4 className="font-semibold text-slate-200">
                    Diagnostic Skill Analyzer & Market Benchmarking
                  </h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Comparative skill vector scoring, targeted learning resource recommendations, and gap visualizations.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <Badge variant="neutral" size="sm" className="shrink-0 mt-0.5">
                  Stage 4
                </Badge>
                <div>
                  <h4 className="font-semibold text-slate-200">
                    Adaptive Career Progression Planner
                  </h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Multi-week sprint planner that adjusts milestones based on interview performance and skill certifications.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-start gap-3">
                <Badge variant="neutral" size="sm" className="shrink-0 mt-0.5">
                  Stage 5
                </Badge>
                <div>
                  <h4 className="font-semibold text-slate-200">
                    Opportunity Discovery & Application Pipeline
                  </h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Integrated job aggregation, automated match scoring, and interactive interview tracking board.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 flex items-start gap-3 text-slate-400">
                <Badge variant="neutral" size="sm" className="shrink-0 mt-0.5">
                  Post-Stage 5
                </Badge>
                <div>
                  <h4 className="font-semibold text-slate-300">
                    Authentication & Cloud Persistence (Supabase / Postgres)
                  </h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Decoupled repository architecture makes swapping local repositories with cloud API repositories seamless without touching UI components.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onResetComplete={refreshSummary}
      />
    </AppLayout>
  );
}
