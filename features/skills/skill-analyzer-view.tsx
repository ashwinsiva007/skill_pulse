"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CAREER_ROLES_CATALOGUE,
  CareerRoleDefinition,
  getCareerRoleById,
  getCareerRoleByTitle,
} from "@/lib/career-catalogue/career-catalogue";
import {
  calculateRoleMatch,
  RoleMatchResult,
} from "@/lib/skill-analyzer/matching-engine";
import {
  profileRepo,
  skillRepo,
  activityRepo,
} from "@/lib/repositories";
import { storageAdapter } from "@/lib/storage/storage-adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { CandidateProfile } from "@/types/profile";
import { Skill, SkillCategory, ProficiencyLevel } from "@/types/skill";
import { RoleSelector } from "./role-selector";
import { SkillMatchOverviewCard } from "./skill-match-overview-card";
import { ProficiencyComparisonChart } from "./proficiency-comparison-chart";
import { SkillGapBreakdown } from "./skill-gap-breakdown";
import { ProjectEvidenceCard } from "./project-evidence-card";
import { RoleComparisonModal } from "./role-comparison-modal";
import { AddSkillModal } from "./add-skill-modal";
import {
  Layers,
  ArrowRight,
  Plus,
  RefreshCw,
  Compass,
  Lightbulb,
} from "lucide-react";

export const SkillAnalyzerView: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedRole, setSelectedRole] = useState<CareerRoleDefinition>(
    CAREER_ROLES_CATALOGUE[0]
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  const [prefilledSkillName, setPrefilledSkillName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Load profile, skills and saved role preference from storage
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [prof, userSkills] = await Promise.all([
        profileRepo.getProfile(),
        skillRepo.getSkills(),
      ]);
      setProfile(prof);
      setSkills(userSkills);

      // Restore chosen role if saved, else match against profile's target role
      const savedRoleId = storageAdapter.getItem<string | null>(STORAGE_KEYS.ANALYSIS_ROLE, null);
      if (savedRoleId) {
        const found = getCareerRoleById(savedRoleId);
        if (found) {
          setSelectedRole(found);
          return;
        }
      }

      if (prof?.targetRole) {
        const matching = getCareerRoleByTitle(prof.targetRole);
        if (matching) {
          setSelectedRole(matching);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle role change and persist selection
  const handleSelectRole = (role: CareerRoleDefinition) => {
    setSelectedRole(role);
    storageAdapter.setItem(STORAGE_KEYS.ANALYSIS_ROLE, role.id);
  };

  // Evaluate match for current selected role
  const matchResult: RoleMatchResult | null = useMemo(() => {
    if (!profile) return null;
    return calculateRoleMatch(selectedRole, profile, skills);
  }, [selectedRole, profile, skills]);

  // Evaluate match across all 8 roles for multi-role comparison
  const resultsByRole = useMemo(() => {
    if (!profile) return {};
    const map: Record<string, RoleMatchResult> = {};
    for (const r of CAREER_ROLES_CATALOGUE) {
      map[r.id] = calculateRoleMatch(r, profile, skills);
    }
    return map;
  }, [profile, skills]);

  // Save new skill to profile and re-analyze immediately
  const handleSaveSkill = async (skillInput: {
    name: string;
    category: SkillCategory;
    proficiency: ProficiencyLevel;
    yearsOfExperience: number;
    targetRoleRequirement: boolean;
    evidence?: string;
  }) => {
    const levelMap: Record<ProficiencyLevel, number> = {
      Beginner: 1,
      Intermediate: 2,
      Advanced: 3,
      Expert: 4,
    };

    const newSkill = await skillRepo.addSkill({
      name: skillInput.name,
      category: skillInput.category,
      proficiency: skillInput.proficiency,
      levelValue: levelMap[skillInput.proficiency] || 2,
      yearsOfExperience: skillInput.yearsOfExperience,
      verified: !!skillInput.evidence,
      targetRoleRequirement: skillInput.targetRoleRequirement,
      endorsementsCount: 1,
      notes: skillInput.evidence,
    });

    await activityRepo.logActivity({
      type: "skill",
      title: `Recorded competency: ${newSkill.name}`,
      description: `Added ${newSkill.name} (${newSkill.proficiency}) for ${selectedRole.title} analysis`,
      routeLink: "/skills",
      tag: "Skill Analyzer",
    });

    // Refresh state
    await loadData();
  };

  const handleOpenAddSkillForPrompt = (skillName: string) => {
    setPrefilledSkillName(skillName);
    setIsAddModalOpen(true);
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Skill Analyzer & Career Alignment
              </h1>
              <Badge variant="indigo" size="sm">
                Stage 4 Active
              </Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Transparent, rules-based competency evaluation comparing your profile skills and demonstrable project evidence against starter role benchmarks.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsComparisonModalOpen(true)}
              className="text-xs"
            >
              <Layers className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Compare 8 Roles
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPrefilledSkillName("");
                setIsAddModalOpen(true);
              }}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
              Record Skill
            </Button>

            <Link href="/roadmap">
              <Button variant="primary" size="sm" className="text-xs">
                <Compass className="w-3.5 h-3.5 mr-1.5" />
                Personalized Roadmap
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Target Role Selector */}
        <RoleSelector
          roles={CAREER_ROLES_CATALOGUE}
          selectedRole={selectedRole}
          onSelectRole={handleSelectRole}
        />

        {/* Loading State */}
        {isLoading || !matchResult ? (
          <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-400" />
            Evaluating skill competencies against {selectedRole.title} benchmarks...
          </div>
        ) : (
          <>
            {/* Overview KPI Card */}
            <SkillMatchOverviewCard matchResult={matchResult} />

            {/* Recommended Next Actions Grid */}
            {matchResult.recommendedActions.length > 0 && (
              <Card className="border-indigo-900/40 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/30">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Lightbulb className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <CardTitle className="text-sm">High-Impact Next Actions</CardTitle>
                        <CardDescription className="text-xs">
                          Prioritized recommendations to strengthen alignment for {selectedRole.title}.
                        </CardDescription>
                      </div>
                    </div>
                    <Link
                      href="/roadmap"
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      View in 5-Phase Roadmap →
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {matchResult.recommendedActions.slice(0, 3).map((action, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col justify-between space-y-2 hover:border-slate-700 transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={action.priority === "high" ? "amber" : "indigo"}
                              size="sm"
                            >
                              {action.priority.toUpperCase()} PRIORITY
                            </Badge>
                            <span className="text-[10px] font-mono text-slate-400">
                              {action.relatedSkill}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-white tracking-tight">
                            {action.title}
                          </h4>
                          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                            {action.description}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          {action.actionType === "record_skill" || action.actionType === "learn_core" ? (
                            <button
                              type="button"
                              onClick={() => handleOpenAddSkillForPrompt(action.relatedSkill)}
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                            >
                              + Record in Profile
                            </button>
                          ) : (
                            <Link
                              href="/roadmap"
                              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
                            >
                              Track in Roadmap →
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main Diagnostics 2-Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Skill Gap Breakdown */}
              <div className="lg:col-span-7 space-y-6">
                <SkillGapBreakdown
                  matchResult={matchResult}
                  onAddSkillPrompt={handleOpenAddSkillForPrompt}
                />
              </div>

              {/* Right Column: Proficiency Comparisons & Project Evidence */}
              <div className="lg:col-span-5 space-y-6">
                <ProjectEvidenceCard matchResult={matchResult} />
                <ProficiencyComparisonChart matchResult={matchResult} />
              </div>
            </div>
          </>
        )}

        {/* Modals */}
        <RoleComparisonModal
          isOpen={isComparisonModalOpen}
          onClose={() => setIsComparisonModalOpen(false)}
          allRoles={CAREER_ROLES_CATALOGUE}
          resultsByRole={resultsByRole}
          currentRoleId={selectedRole.id}
          onSelectRole={handleSelectRole}
        />

        <AddSkillModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setPrefilledSkillName("");
          }}
          onSaveSkill={handleSaveSkill}
          prefilledSkillName={prefilledSkillName}
        />
      </div>
    </AppLayout>
  );
};
