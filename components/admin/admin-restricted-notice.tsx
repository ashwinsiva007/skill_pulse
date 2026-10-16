"use client";

import React from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldAlert,
  Database,
  Briefcase,
  Settings,
  ChevronRight,
  Info,
  Users,
} from "lucide-react";

interface AdminRestrictedNoticeProps {
  featureName: string;
}

export const AdminRestrictedNotice: React.FC<AdminRestrictedNoticeProps> = ({
  featureName,
}) => {
  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-6">
        <Card className="p-8 bg-slate-900/90 border-slate-800 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-center gap-2">
              <Badge variant="amber" size="sm" className="font-bold uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Master Administrator Scope
              </Badge>
              <span className="text-xs text-slate-400">Candidate-Specific Feature</span>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {featureName} is not required for Master Administrator
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                As Master Administrator, your profile is streamlined to monitor the user database, verify live job openings in India, and maintain Firebase infrastructure. Candidate tools like resume creators, roadmaps, and personal applications are active on regular candidate profiles.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-3">
              <span className="font-bold text-slate-200 block uppercase tracking-wider text-[11px]">
                Your Master Administrator Workspaces:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <Link href="/" className="block">
                  <div className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 transition-all text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                      <Users className="w-3.5 h-3.5" />
                      <span>User DB</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Monitor candidate roles, charts, and telemetry.</p>
                  </div>
                </Link>

                <Link href="/opportunities" className="block">
                  <div className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/50 transition-all text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Job Openings QA</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Daily trial & direct apply link verification.</p>
                  </div>
                </Link>

                <Link href="/settings" className="block">
                  <div className="p-3 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 transition-all text-xs space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Settings className="w-3.5 h-3.5" />
                      <span>Settings</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Manage Firebase cloud DB and credentials.</p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <Link href="/">
                <Button variant="primary" size="sm" className="text-xs font-bold">
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Return to Admin Dashboard
                </Button>
              </Link>

              <Link href="/opportunities">
                <Button variant="outline" size="sm" className="text-xs border-cyan-500/40 text-cyan-300">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  Open Job Openings Monitor
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};
