"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RoadmapMilestone } from "@/types/roadmap";
import { roadmapRepo, activityRepo } from "@/lib/repositories/local-repos";
import { Milestone, CheckCircle2, Circle, ArrowRight } from "lucide-react";

export interface RoadmapProgressCardProps {
  milestones: RoadmapMilestone[];
  targetRole: string;
  onRoadmapUpdated?: () => void;
}

export const RoadmapProgressCard: React.FC<RoadmapProgressCardProps> = ({
  milestones,
  targetRole,
  onRoadmapUpdated,
}) => {
  const [localMilestones, setLocalMilestones] = useState<RoadmapMilestone[]>(milestones);

  useEffect(() => {
    setLocalMilestones(milestones);
  }, [milestones]);

  const activeMilestone =
    localMilestones.find((m) => m.status === "in_progress") || localMilestones[0];

  const totalActionItems = localMilestones.reduce(
    (sum, m) => sum + m.actionItems.length,
    0
  );
  const completedActionItems = localMilestones.reduce(
    (sum, m) => sum + m.actionItems.filter((a) => a.completed).length,
    0
  );
  const totalPercentage =
    totalActionItems > 0
      ? Math.round((completedActionItems / totalActionItems) * 100)
      : 0;

  const handleToggleItem = async (milestoneId: string, actionId: string) => {
    try {
      const updated = await roadmapRepo.toggleActionItem(milestoneId, actionId);
      setLocalMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? updated : m))
      );
      await activityRepo.logActivity({
        type: "roadmap",
        title: `Updated roadmap task in ${updated.title}`,
        description: `Progress now at ${updated.progressPercentage}%`,
        routeLink: "/roadmap",
        tag: "Roadmap",
      });
      if (onRoadmapUpdated) onRoadmapUpdated();
    } catch (err) {
      console.error("Failed to toggle roadmap action item:", err);
    }
  };

  return (
    <Card className="h-full flex flex-col justify-between bg-slate-900/90 border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>Career Roadmap Progress</CardTitle>
              <Badge variant="indigo" size="sm">
                Stage 4 Active
              </Badge>
            </div>
            <CardDescription>
              Adaptive 5-phase career milestones for <strong className="text-slate-200">{targetRole}</strong>
            </CardDescription>
          </div>
          <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
            <Milestone className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Roadmap completion bar */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Overall Milestone Completion</span>
            <span className="font-bold text-violet-400">{totalPercentage}%</span>
          </div>
          <Progress
            value={totalPercentage}
            size="sm"
            indicatorClassName="bg-gradient-to-r from-indigo-500 to-violet-500"
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>
              {completedActionItems} of {totalActionItems} action goals met
            </span>
            <span>
              {activeMilestone ? `Phase ${activeMilestone.phaseNumber} Active` : "Phase 1 Active"}
            </span>
          </div>
        </div>

        {/* Current Active Phase */}
        {activeMilestone && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-750 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">
                  {activeMilestone.phaseTitle}
                </span>
                <h4 className="text-sm font-semibold text-white mt-0.5">
                  {activeMilestone.title}
                </h4>
              </div>
              <Badge variant="indigo" size="sm">
                {activeMilestone.progressPercentage}%
              </Badge>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
              {activeMilestone.description}
            </p>

            {/* Interactive action items checklist */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-300">
                Current Phase Action Tasks:
              </span>
              <div className="space-y-1">
                {activeMilestone.actionItems.slice(0, 3).map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleToggleItem(activeMilestone.id, action.id)}
                    className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-800/80 text-left transition-colors text-xs group"
                  >
                    {action.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`leading-tight transition-all line-clamp-1 ${
                        action.completed
                          ? "text-slate-400 line-through"
                          : "text-slate-200"
                      }`}
                    >
                      {action.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="pt-1">
          <Link href="/roadmap" className="w-full">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Open Full Interactive Roadmap
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
