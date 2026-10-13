"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { WelcomeHeader } from "./welcome-header";
import { MetricsOverview } from "./metrics-overview";
import { CareerReadinessCard } from "./career-readiness-card";
import { RoadmapProgressCard } from "./roadmap-progress-card";
import { RecommendedStepsCard } from "./recommended-steps-card";
import { RecentActivityCard } from "./recent-activity-card";
import { OpportunitySpotlightCard } from "./opportunity-spotlight-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  profileRepo,
  skillRepo,
  resumeRepo,
  roadmapRepo,
  opportunityRepo,
  applicationRepo,
  activityRepo,
} from "@/lib/repositories/local-repos";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { ResumeDraft } from "@/types/resume";
import { RoadmapMilestone } from "@/types/roadmap";
import { Opportunity } from "@/types/opportunity";
import { JobApplication } from "@/types/application";
import { ActivityItem } from "@/types/activity";
import { DEMO_PROFILE } from "@/lib/demo/seed-data";
import {
  getCareerRoleByTitle,
  CAREER_ROLES_CATALOGUE,
} from "@/lib/career-catalogue/career-catalogue";
import { calculateRoleMatch } from "@/lib/skill-analyzer/matching-engine";
import {
  Kanban,
  ArrowRight,
  Award,
} from "lucide-react";

export const DashboardView: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile>(DEMO_PROFILE);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [resumes, setResumes] = useState<ResumeDraft[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapMilestone[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      const [prof, skl, res, rdm, opp, apps, act] = await Promise.all([
        profileRepo.getProfile(),
        skillRepo.getSkills(),
        resumeRepo.getResumes(),
        roadmapRepo.getMilestones(),
        opportunityRepo.getOpportunities(),
        applicationRepo.getApplications(),
        activityRepo.getRecentActivities(),
      ]);
      setProfile(prof);
      setSkills(skl);
      setResumes(res);
      setRoadmap(rdm);
      setOpportunities(opp);
      setApplications(apps);
      setActivities(act);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Determine active target role definition from catalogue
  const targetRoleDef = useMemo(() => {
    return getCareerRoleByTitle(profile?.targetRole || "") || CAREER_ROLES_CATALOGUE[0];
  }, [profile?.targetRole]);

  // Compute explainable match dynamically
  const matchResult = useMemo(() => {
    return calculateRoleMatch(targetRoleDef, profile, skills);
  }, [targetRoleDef, profile, skills]);

  // Calculate real roadmap completion
  const totalRoadmapActions = roadmap.reduce((sum, m) => sum + m.actionItems.length, 0);
  const completedRoadmapActions = roadmap.reduce(
    (sum, m) => sum + m.actionItems.filter((a) => a.completed).length,
    0
  );
  const roadmapProgressPercentage =
    totalRoadmapActions > 0
      ? Math.round((completedRoadmapActions / totalRoadmapActions) * 100)
      : 0;

  const savedOpportunities = opportunities.filter((o) => o.status === "saved");
  const topOpportunity = opportunities[0];

  // Pipeline stage breakdown
  const appliedCount = applications.filter((a) => a.stage === "applied").length;
  const interviewCount = applications.filter((a) =>
    ["screening", "technical", "interview"].includes(a.stage)
  ).length;
  const offerCount = applications.filter((a) => a.stage === "offer").length;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Welcome Header */}
        <WelcomeHeader profile={profile} />

        {/* 6 Unified Metrics */}
        <MetricsOverview
          profile={profile}
          skillsCount={skills.length}
          resumesCount={resumes.length}
          targetRoleMatchScore={matchResult.matchScore}
          targetRoleTitle={targetRoleDef.title}
          savedOpportunitiesCount={savedOpportunities.length}
          activeApplicationsCount={applications.length}
          roadmapProgressPercentage={roadmapProgressPercentage}
        />

        {/* Main Grid: Target Role Readiness + Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CareerReadinessCard
            targetRole={targetRoleDef.title}
            matchScore={matchResult.matchScore}
            coreCoverage={matchResult.coreSkillCoveragePercentage}
            supportingCoverage={matchResult.supportingSkillCoveragePercentage}
            matchedSkills={matchResult.matchedSkills.map((s) => s.name)}
            missingSkills={matchResult.missingSkills.map((s) => s.name)}
          />

          <RoadmapProgressCard
            milestones={roadmap}
            targetRole={targetRoleDef.title}
            onRoadmapUpdated={loadData}
          />
        </div>

        {/* Application Pipeline Status Summary */}
        <Card className="bg-slate-900/90 border-slate-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-600/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
                <Kanban className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Application Pipeline Status
                </h3>
                <span className="text-[11px] text-slate-400">
                  {applications.length} active opportunities tracked in your Kanban pipeline
                </span>
              </div>
            </div>

            <Link href="/tracker">
              <Button variant="outline" size="sm" className="text-xs">
                Manage Kanban Pipeline
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Submitted</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-white">{appliedCount}</span>
                <span className="text-[10px] text-slate-500">Awaiting Review</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-indigo-400 block">Interview Loop</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-indigo-300">{interviewCount}</span>
                <span className="text-[10px] text-indigo-400">Active Screens</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block">Offers</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-emerald-400">{offerCount}</span>
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs">
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Bookmarks</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xl font-bold text-amber-300">{savedOpportunities.length}</span>
                <Link href="/saved-opportunities" className="text-[10px] text-amber-400 hover:underline">
                  View Saved
                </Link>
              </div>
            </div>
          </div>
        </Card>

        {/* Second Grid: Recommended Steps + Top Opportunity Spotlight */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecommendedStepsCard />
          </div>
          <div className="lg:col-span-1">
            <OpportunitySpotlightCard topOpportunity={topOpportunity} />
          </div>
        </div>

        {/* Recent Activity Stream */}
        <div>
          <RecentActivityCard activities={activities} />
        </div>
      </div>
    </AppLayout>
  );
};
