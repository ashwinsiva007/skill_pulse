"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { roadmapRepo, activityRepo } from "@/lib/repositories/local-repos";
import { RoadmapMilestone } from "@/types/roadmap";
import {
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
} from "lucide-react";

export default function RoadmapPage() {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);

  const loadMilestones = async () => {
    const list = await roadmapRepo.getMilestones();
    setMilestones(list);
  };

  useEffect(() => {
    loadMilestones();
  }, []);

  const handleToggleItem = async (milestoneId: string, actionId: string) => {
    try {
      const updated = await roadmapRepo.toggleActionItem(milestoneId, actionId);
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? updated : m))
      );
      await activityRepo.logActivity({
        type: "roadmap",
        title: `Updated roadmap milestone item`,
        description: `${updated.title} is now ${updated.progressPercentage}% complete`,
        routeLink: "/roadmap",
        tag: "Roadmap",
      });
    } catch (err) {
      console.error("Failed to toggle roadmap action item:", err);
    }
  };

  const totalActions = milestones.reduce((s, m) => s + m.actionItems.length, 0);
  const doneActions = milestones.reduce(
    (s, m) => s + m.actionItems.filter((a) => a.completed).length,
    0
  );
  const overallPercent = Math.round((doneActions / (totalActions || 1)) * 100);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Career Roadmap</h1>
              <Badge variant="cyan" size="sm">
                Stage 4 Preview
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Structured milestone progression navigating transition to Staff AI Solutions Architect.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-300">Overall Progress:</span>
            <Badge variant="emerald" size="md">
              {overallPercent}% Complete
            </Badge>
          </div>
        </div>

        {/* Stage 4 Preview Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-indigo-950/40 border border-violet-800/40 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">
                Stage 4 Core Engine: Adaptive Multi-Week AI Career Planner
              </p>
              <p className="text-slate-400 leading-relaxed max-w-2xl">
                Stage 4 connects interview performance feedback and skill tests to automatically generate adaptive weekly study sprints and architecture project challenges.
              </p>
            </div>
          </div>
          <Badge variant="indigo" size="md" className="shrink-0">
            Coming in Stage 4
          </Badge>
        </div>

        {/* Milestones Timeline */}
        <div className="space-y-6">
          {milestones.map((milestone) => {
            const isCompleted = milestone.status === "completed";
            const isInProgress = milestone.status === "in_progress";

            return (
              <Card
                key={milestone.id}
                className={`relative overflow-hidden transition-all ${
                  isInProgress
                    ? "border-indigo-500/50 shadow-md shadow-indigo-950/30"
                    : isCompleted
                    ? "border-emerald-800/40 bg-slate-900/40"
                    : "border-slate-800/60 opacity-80"
                }`}
              >
                <div className="p-5 sm:p-6 space-y-4">
                  {/* Top Bar of Card */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                          isCompleted
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : isInProgress
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {milestone.phaseNumber}
                      </span>
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          {milestone.phaseTitle}
                        </span>
                        <h3 className="text-base font-semibold text-white">
                          {milestone.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          isCompleted ? "emerald" : isInProgress ? "indigo" : "neutral"
                        }
                      >
                        {isCompleted
                          ? "Completed"
                          : isInProgress
                          ? "Active Phase"
                          : "Upcoming"}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {milestone.estimatedWeeks} Weeks Est.
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {milestone.description}
                  </p>

                  {/* Progress Meter */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Milestone Progress</span>
                      <span className="font-semibold text-slate-200">
                        {milestone.progressPercentage}%
                      </span>
                    </div>
                    <Progress
                      value={milestone.progressPercentage}
                      size="sm"
                      indicatorClassName={
                        isCompleted
                          ? "bg-emerald-500"
                          : "bg-gradient-to-r from-indigo-500 to-violet-500"
                      }
                    />
                  </div>

                  {/* Action Items List */}
                  <div className="pt-2 space-y-2">
                    <span className="text-xs font-semibold text-slate-300 block">
                      Target Action Items (Click to check/uncheck):
                    </span>
                    <div className="space-y-1.5">
                      {milestone.actionItems.map((act) => (
                        <button
                          key={act.id}
                          onClick={() => handleToggleItem(milestone.id, act.id)}
                          className="w-full flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors text-xs group"
                        >
                          {act.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 mt-0.5" />
                          )}
                          <span
                            className={
                              act.completed
                                ? "text-slate-400 line-through"
                                : "text-slate-200"
                            }
                          >
                            {act.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skills Addressed */}
                  <div className="pt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400 mr-1">Skills Addressed:</span>
                    {milestone.skillsAddressed.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60 font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
