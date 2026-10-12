"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CandidateProfile } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { ResetConfirmModal } from "@/components/layout/reset-confirm-modal";

export interface WelcomeHeaderProps {
  profile: CandidateProfile;
}

export const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ profile }) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-[#10172b] to-indigo-950/40 border border-slate-800 p-6 sm:p-8 shadow-sm">
        {/* Subtle decorative radial light */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="indigo" size="sm">
                <Sparkles className="w-3 h-3 mr-1 text-indigo-400" />
                Stage 2 — Profile Builder & Onboarding
              </Badge>
              <Badge variant="neutral" size="sm">
                Fictional Demo Candidate
              </Badge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {profile.name}
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed">
              Skill_pulse ai is navigating your progression from{" "}
              <strong className="text-slate-200 font-semibold">{profile.currentRole}</strong> to{" "}
              <span className="text-indigo-400 font-semibold underline decoration-indigo-500/50 underline-offset-4">
                {profile.targetRole}
              </span>
              . Your demo workspace is populated and stored locally in this browser.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0">
            <Link href="/onboarding">
              <Button variant="primary" size="md">
                <Sparkles className="w-4 h-4 mr-1.5" />
                Profile Wizard
              </Button>
            </Link>

            <Link href="/profile">
              <Button variant="outline" size="md">
                Manage Profile
              </Button>
            </Link>

            <Link href="/roadmap">
              <Button variant="secondary" size="md">
                Career Roadmap
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsResetModalOpen(true)}
              title="Reset demo data to initial defaults"
              className="text-slate-400 hover:text-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              Reset Demo
            </Button>
          </div>
        </div>
      </div>

      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      />
    </>
  );
};
