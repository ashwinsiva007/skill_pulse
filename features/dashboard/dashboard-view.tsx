"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { WelcomeHeader } from "./welcome-header";
import { MetricsOverview } from "./metrics-overview";
import { CareerReadinessCard } from "./career-readiness-card";
import { RoadmapProgressCard } from "./roadmap-progress-card";
import { RecommendedStepsCard } from "./recommended-steps-card";
import { RecentActivityCard } from "./recent-activity-card";
import { OpportunitySpotlightCard } from "./opportunity-spotlight-card";
import {
  profileRepo,
  skillRepo,
  resumeRepo,
  roadmapRepo,
  opportunityRepo,
  activityRepo,
} from "@/lib/repositories/local-repos";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { ResumeDraft } from "@/types/resume";
import { RoadmapMilestone } from "@/types/roadmap";
import { Opportunity } from "@/types/opportunity";
import { ActivityItem } from "@/types/activity";
import { DEMO_PROFILE } from "@/lib/demo/seed-data";

export const DashboardView: React.FC = () => {
  const [profile, setProfile] = useState<CandidateProfile>(DEMO_PROFILE);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [resumes, setResumes] = useState<ResumeDraft[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapMilestone[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const loadData = async () => {
    try {
      const [prof, skl, res, rdm, opp, act] = await Promise.all([
        profileRepo.getProfile(),
        skillRepo.getSkills(),
        resumeRepo.getResumes(),
        roadmapRepo.getMilestones(),
        opportunityRepo.getOpportunities(),
        activityRepo.getRecentActivities(),
      ]);
      setProfile(prof);
      setSkills(skl);
      setResumes(res);
      setRoadmap(rdm);
      setOpportunities(opp);
      setActivities(act);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const topOpportunity = opportunities[0];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <WelcomeHeader profile={profile} />

        {/* Metrics Grid */}
        <MetricsOverview
          profile={profile}
          skillsCount={skills.length}
          resumesCount={resumes.length}
        />

        {/* Main Grid: Readiness + Roadmap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CareerReadinessCard
            targetRole={profile.targetRole}
            readinessScore={profile.careerReadinessScore}
          />
          <RoadmapProgressCard
            milestones={roadmap}
            onRoadmapUpdated={loadData}
          />
        </div>

        {/* Second Grid: Recommended Steps + Top Opportunity */}
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
