"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { RoadmapMilestone } from "@/types/roadmap";
import { CareerRoleDefinition } from "@/lib/career-catalogue/career-catalogue";
import {
  Compass,
  CheckCircle2,
  Clock,
  RotateCcw,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";

export interface RoadmapSummaryCardProps {
  selectedRole: CareerRoleDefinition;
  milestones: RoadmapMilestone[];
  onRegenerateRoadmap: () => void;
  onRestoreDemoRoadmap: () => void;
  className?: string;
}

export const RoadmapSummaryCard: React.FC<RoadmapSummaryCardProps> = ({
  selectedRole,
  milestones,
  onRegenerateRoadmap,
  onRestoreDemoRoadmap,
  className = "",
}) => {
  const totalPhases = milestones.length;
  const completedPhases = milestones.filter((m) => m.status === "completed").length;
  const inProgressPhases = milestones.filter((m) => m.status === "in_progress").length;

  const totalActions = milestones.reduce((sum, m) => sum + m.actionItems.length, 0);
  const completedActions = milestones.reduce(
    (sum, m) => sum + m.actionItems.filter((a) => a.completed).length,
    0
  );

  const overallProgressPercentage =
    totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;

  const totalEstimatedWeeks = milestones.reduce((sum, m) => sum + (m.estimatedWeeks || 0), 0);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Roadmap Completion */}
        <Card className="hover:border-slate-700 transition-colors">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Roadmap Progress</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Compass className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {overallProgressPercentage}%
                </span>
                <Badge
                  variant={
                    overallProgressPercentage >= 75
                      ? "emerald"
                      : overallProgressPercentage >= 25
                      ? "indigo"
                      : "neutral"
                  }
                  size="sm"
                >
                  {overallProgressPercentage === 100
                    ? "Completed"
                    : overallProgressPercentage > 0
                    ? "In Progress"
                    : "Not Started"}
                </Badge>
              </div>
              <Progress
                value={overallProgressPercentage}
                size="sm"
                indicatorClassName="bg-gradient-to-r from-indigo-500 to-cyan-400"
              />
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>Action Items:</span>
              <span className="font-semibold text-slate-200">
                {completedActions} of {totalActions} tasks completed
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Milestones Breakdown */}
        <Card className="hover:border-slate-700 transition-colors">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Milestone Phases</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {completedPhases} / {totalPhases}
                </span>
                <span className="text-xs text-indigo-300 font-medium">
                  {inProgressPhases} Active
                </span>
              </div>
              <Progress
                value={(completedPhases / (totalPhases || 1)) * 100}
                size="sm"
                indicatorClassName="bg-emerald-500"
              />
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>Target Career Track:</span>
              <span className="font-semibold text-slate-200 truncate max-w-[140px]">
                {selectedRole.title}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Estimated Time Horizon */}
        <Card className="hover:border-slate-700 transition-colors">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Estimated Duration</span>
              <div className="w-7 h-7 rounded-lg bg-amber-600/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  ~{totalEstimatedWeeks} wks
                </span>
                <Badge variant="amber" size="sm">
                  Estimate
                </Badge>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                Paced at 8–12 hours/week self-study
              </p>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>Phase Count:</span>
              <span className="font-semibold text-slate-200">5 Structured Phases</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Actions & Synchronization */}
        <Card className="hover:border-slate-700 transition-colors">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1">
                Roadmap Sync & Controls
              </span>
              <p className="text-[11px] text-slate-400 leading-snug">
                Re-align milestones whenever your profile skills change.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={onRegenerateRoadmap}
                className="w-full text-xs justify-center"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                Re-generate from Skill Gaps
              </Button>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={onRestoreDemoRoadmap}
                  className="text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Restore Demo
                </button>
                <Link
                  href="/skills"
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Skill Analyzer →
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mandatory Transparent Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-300">
            Explainable Career Progression Notice:
          </span>
          <p className="leading-relaxed">
            This roadmap is an educational study plan configured to target specific competency gaps for <strong>{selectedRole.title}</strong>. Completing milestones reflects dedication and practical learning, but does <strong>not</strong> guarantee employment, job interviews, or hiring outcomes.
          </p>
        </div>
      </div>
    </div>
  );
};
