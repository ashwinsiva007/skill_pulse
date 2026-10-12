import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CandidateProfile } from "@/types/profile";
import {
  UserCheck,
  Cpu,
  FileText,
  TrendingUp,
} from "lucide-react";

export interface MetricsOverviewProps {
  profile: CandidateProfile;
  skillsCount: number;
  resumesCount: number;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  profile,
  skillsCount,
  resumesCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Metric 1: Profile Completion */}
      <Card className="hover:border-slate-700/80 transition-colors">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Profile Completion</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="text-2xl font-bold text-white tracking-tight">
                {profile.profileCompletionPercentage}%
              </span>
              <Link
                href="/profile"
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
              >
                Edit Profile →
              </Link>
            </div>
            <Progress value={profile.profileCompletionPercentage} size="sm" />
          </div>
        </CardContent>
      </Card>

      {/* Metric 2: Recorded Skills */}
      <Card className="hover:border-slate-700/80 transition-colors">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Recorded Skills</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold text-white tracking-tight">
                {skillsCount}
              </span>
              <span className="text-[11px] text-cyan-400 font-medium bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60">
                10 Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>Target Role Requirements:</span>
              <Link href="/skills" className="text-cyan-400 hover:underline">
                View All →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric 3: Saved Resume Drafts */}
      <Card className="hover:border-slate-700/80 transition-colors">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Resume Drafts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-2xl font-bold text-white tracking-tight">
                {resumesCount}
              </span>
              <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                1 Tailored Ready
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span>Avg ATS Score: 85%</span>
              <Link href="/resume" className="text-emerald-400 hover:underline">
                Builder →
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metric 4: Career Readiness Score */}
      <Card className="hover:border-slate-700/80 transition-colors">
        <CardContent className="p-5 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
              Career Readiness
              <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-wider px-1 bg-indigo-950/60 rounded border border-indigo-800/50">
                AI Demo
              </span>
            </span>
            <div className="w-8 h-8 rounded-lg bg-violet-600/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline justify-between mb-2">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {profile.careerReadinessScore}%
                </span>
                <span className="text-[11px] text-slate-400">/ 100</span>
              </div>
              <span className="text-[11px] text-violet-400 font-medium">Strong Pace</span>
            </div>
            <Progress
              value={profile.careerReadinessScore}
              size="sm"
              indicatorClassName="bg-gradient-to-r from-indigo-500 to-violet-500"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
