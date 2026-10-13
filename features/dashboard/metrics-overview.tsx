"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CandidateProfile } from "@/types/profile";
import {
  UserCheck,
  Cpu,
  FileText,
  Target,
  Compass,
  Bookmark,
  Kanban,
} from "lucide-react";

export interface MetricsOverviewProps {
  profile: CandidateProfile;
  skillsCount: number;
  resumesCount: number;
  targetRoleMatchScore: number;
  targetRoleTitle: string;
  savedOpportunitiesCount: number;
  activeApplicationsCount: number;
  roadmapProgressPercentage: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  profile,
  skillsCount,
  resumesCount,
  targetRoleMatchScore,
  targetRoleTitle,
  savedOpportunitiesCount,
  activeApplicationsCount,
  roadmapProgressPercentage,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
      {/* Metric 1: Profile Completion */}
      <Card className="hover:border-slate-700 transition-colors bg-slate-900/80">
        <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Profile</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {profile.profileCompletionPercentage}%
              </span>
              <Link
                href="/profile"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Profile →
              </Link>
            </div>
            <Progress value={profile.profileCompletionPercentage} size="sm" />
          </div>
        </CardContent>
      </Card>

      {/* Metric: Resume Drafts */}
      <Card className="hover:border-slate-700 transition-colors bg-slate-900/80">
        <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Resume Drafts</span>
            <div className="w-7 h-7 rounded-lg bg-pink-600/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {resumesCount}
              </span>
              <Link href="/resume" className="text-[10px] text-pink-400 hover:underline">
                Builder →
              </Link>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Tailored drafts saved
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metric 2: Recorded Skills */}
      <Card className="hover:border-slate-700 transition-colors bg-slate-900/80">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Recorded Skills</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {skillsCount}
              </span>
              <Link href="/skills" className="text-[10px] text-cyan-400 hover:underline">
                Analyzer →
              </Link>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Across technical domains
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metric 3: Target Role Match */}
      <Card className="hover:border-slate-700 transition-colors bg-slate-900/80">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Target Role Match</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {targetRoleMatchScore}%
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 truncate max-w-[80px]">
                {targetRoleTitle}
              </span>
            </div>
            <Progress
              value={targetRoleMatchScore}
              size="sm"
              indicatorClassName={targetRoleMatchScore >= 75 ? "bg-emerald-500" : "bg-indigo-500"}
            />
          </div>
        </CardContent>
      </Card>

      {/* Metric 4: Career Roadmap */}
      <Card className="hover:border-slate-700 transition-colors bg-slate-900/80">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Roadmap Progress</span>
            <div className="w-7 h-7 rounded-lg bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Compass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {roadmapProgressPercentage}%
              </span>
              <Link href="/roadmap" className="text-[10px] text-violet-400 hover:underline">
                Roadmap →
              </Link>
            </div>
            <Progress
              value={roadmapProgressPercentage}
              size="sm"
              indicatorClassName="bg-gradient-to-r from-indigo-500 to-violet-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Metric 5: Saved Opportunities */}
      <Card className="hover:border-slate-700 transition-colors bg-slate-900/80">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Saved Roles</span>
            <div className="w-7 h-7 rounded-lg bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bookmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {savedOpportunitiesCount}
              </span>
              <Link href="/saved-opportunities" className="text-[10px] text-amber-400 hover:underline">
                Bookmarks →
              </Link>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Pinned for tailoring
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Metric 6: Application Pipeline */}
      <Card className="hover:border-slate-700 transition-colors bg-slate-900/80">
        <CardContent className="p-4 flex flex-col justify-between h-full space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400">Active Pipeline</span>
            <div className="w-7 h-7 rounded-lg bg-teal-600/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Kanban className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {activeApplicationsCount}
              </span>
              <Link href="/tracker" className="text-[10px] text-teal-400 hover:underline">
                Tracker →
              </Link>
            </div>
            <span className="text-[10px] text-slate-400 block truncate">
              Applications tracked
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
