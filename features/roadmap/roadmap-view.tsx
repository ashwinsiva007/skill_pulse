"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CAREER_ROLES_CATALOGUE,
  CareerRoleDefinition,
  getCareerRoleById,
  getCareerRoleByTitle,
} from "@/lib/career-catalogue/career-catalogue";
import { calculateRoleMatch } from "@/lib/skill-analyzer/matching-engine";
import { generatePersonalizedRoadmap } from "@/lib/roadmap/roadmap-generator";
import {
  profileRepo,
  skillRepo,
  roadmapRepo,
  activityRepo,
} from "@/lib/repositories";
import { storageAdapter } from "@/lib/storage/storage-adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { RoadmapMilestone, MilestoneStatus } from "@/types/roadmap";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { MilestoneCard } from "./milestone-card";
import { RoadmapSummaryCard } from "./roadmap-summary-card";
import {
  Compass,
  ArrowLeft,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

export const RoadmapView: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedRole, setSelectedRole] = useState<CareerRoleDefinition>(
    CAREER_ROLES_CATALOGUE[0]
  );
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile, skills, stored role, and milestones
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prof, userSkills] = await Promise.all([
        profileRepo.getProfile(),
        skillRepo.getSkills(),
      ]);
      setProfile(prof);
      setSkills(userSkills);

      // Determine active role
      let activeRole = CAREER_ROLES_CATALOGUE[0];
      const savedRoleId = storageAdapter.getItem<string | null>(STORAGE_KEYS.ANALYSIS_ROLE, null);
      if (savedRoleId) {
        const found = getCareerRoleById(savedRoleId);
        if (found) activeRole = found;
      } else if (prof?.targetRole) {
        const matching = getCareerRoleByTitle(prof.targetRole);
        if (matching) activeRole = matching;
      }
      setSelectedRole(activeRole);

      // Load milestones for active role
      const storedMilestones = await roadmapRepo.getMilestones(activeRole.title);
      if (storedMilestones.length > 0 && storedMilestones[0].targetRole.toLowerCase() === activeRole.title.toLowerCase()) {
        setMilestones(storedMilestones);
      } else {
        // Generate personalized roadmap from gaps if not yet generated for this role
        const matchRes = calculateRoleMatch(activeRole, prof, userSkills);
        const generated = generatePersonalizedRoadmap(activeRole, matchRes);
        await roadmapRepo.saveMilestones(generated);
        setMilestones(generated);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle role switch
  const handleRoleChange = async (roleId: string) => {
    const role = getCareerRoleById(roleId);
    if (!role || !profile) return;

    setSelectedRole(role);
    storageAdapter.setItem(STORAGE_KEYS.ANALYSIS_ROLE, role.id);

    // Check if stored milestones match this role
    const stored = await roadmapRepo.getMilestones(role.title);
    if (stored.length > 0 && stored[0].targetRole.toLowerCase() === role.title.toLowerCase()) {
      setMilestones(stored);
    } else {
      const matchRes = calculateRoleMatch(role, profile, skills);
      const generated = generatePersonalizedRoadmap(role, matchRes);
      await roadmapRepo.saveMilestones(generated);
      setMilestones(generated);
    }
  };

  // Regenerate roadmap based on current profile and skill gaps
  const handleRegenerate = async () => {
    if (!profile) return;
    const matchRes = calculateRoleMatch(selectedRole, profile, skills);
    const regenerated = generatePersonalizedRoadmap(selectedRole, matchRes);
    await roadmapRepo.saveMilestones(regenerated);
    setMilestones(regenerated);

    await activityRepo.logActivity({
      type: "roadmap",
      title: `Re-aligned roadmap for ${selectedRole.title}`,
      description: `Generated updated 5-phase career milestone plan from current profile competencies`,
      routeLink: "/roadmap",
      tag: "Roadmap",
    });
  };

  // Restore demo roadmap
  const handleRestoreDemo = async () => {
    const demo = await roadmapRepo.resetToDemoRoadmap();
    setMilestones(demo);
    await activityRepo.logActivity({
      type: "roadmap",
      title: "Restored demo roadmap",
      description: "Reset roadmap milestones to baseline starter state",
      routeLink: "/roadmap",
      tag: "Roadmap",
    });
  };

  // Action item toggle
  const handleToggleAction = async (milestoneId: string, actionId: string) => {
    try {
      const updated = await roadmapRepo.toggleActionItem(milestoneId, actionId);
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? updated : m))
      );

      await activityRepo.logActivity({
        type: "roadmap",
        title: `Updated milestone progress`,
        description: `${updated.title} is now ${updated.progressPercentage}% complete`,
        routeLink: "/roadmap",
        tag: "Roadmap",
      });
    } catch (err) {
      console.error("Failed to toggle roadmap action:", err);
    }
  };

  // Update milestone status (upcoming, in_progress, completed)
  const handleUpdateStatus = async (milestoneId: string, newStatus: MilestoneStatus) => {
    try {
      const progressPercentage =
        newStatus === "completed" ? 100 : newStatus === "upcoming" ? 0 : 50;
      const updated = await roadmapRepo.updateMilestone(milestoneId, {
        status: newStatus,
        progressPercentage,
      });
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? updated : m))
      );
    } catch (err) {
      console.error("Failed to update milestone status:", err);
    }
  };

  // Save personal study notes
  const handleSaveNotes = async (milestoneId: string, notes: string) => {
    try {
      const updated = await roadmapRepo.updateMilestoneNotes(milestoneId, notes);
      setMilestones((prev) =>
        prev.map((m) => (m.id === milestoneId ? updated : m))
      );
    } catch (err) {
      console.error("Failed to save milestone notes:", err);
    }
  };

  // Add custom action item to milestone
  const handleAddCustomAction = async (milestoneId: string, actionTitle: string) => {
    const targetMilestone = milestones.find((m) => m.id === milestoneId);
    if (!targetMilestone) return;

    const newAction = {
      id: `custom-${Date.now()}`,
      title: actionTitle,
      completed: false,
    };

    const updatedActions = [...targetMilestone.actionItems, newAction];
    const completedCount = updatedActions.filter((a) => a.completed).length;
    const progressPercentage = Math.round((completedCount / updatedActions.length) * 100);

    const updated = await roadmapRepo.updateMilestone(milestoneId, {
      actionItems: updatedActions,
      progressPercentage,
    });

    setMilestones((prev) =>
      prev.map((m) => (m.id === milestoneId ? updated : m))
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Personalized Career Roadmap
              </h1>
              <Badge variant="indigo" size="sm">
                Stage 4 Active
              </Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Step-by-step phased trajectory generated from detected skill gaps to build demonstrable portfolio evidence.
            </p>
          </div>

          {/* Quick Actions & Role Dropdown */}
          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/skills">
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Skill Analyzer
              </Button>
            </Link>

            {/* Target Role Dropdown */}
            <div className="relative min-w-[200px]">
              <select
                value={selectedRole.id}
                onChange={(e) => handleRoleChange(e.target.value)}
                aria-label="Select target role for roadmap"
                className="w-full appearance-none px-3 py-1.5 pr-8 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {CAREER_ROLES_CATALOGUE.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            Generating personalized study roadmap for {selectedRole.title}...
          </div>
        ) : (
          <>
            {/* Summary Progress Card */}
            <RoadmapSummaryCard
              selectedRole={selectedRole}
              milestones={milestones}
              onRegenerateRoadmap={handleRegenerate}
              onRestoreDemoRoadmap={handleRestoreDemo}
            />

            {/* Step-by-Step 5-Phase Timeline */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  Target Roadmap Phases for {selectedRole.title}
                </h2>
                <span className="text-xs text-slate-400">
                  {milestones.length} Strategic Milestones
                </span>
              </div>

              <div className="space-y-4">
                {milestones.map((milestone) => (
                  <MilestoneCard
                    key={milestone.id}
                    milestone={milestone}
                    onToggleAction={handleToggleAction}
                    onUpdateStatus={handleUpdateStatus}
                    onSaveNotes={handleSaveNotes}
                    onAddActionItem={handleAddCustomAction}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
};
