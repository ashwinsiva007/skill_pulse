"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import {
  opportunityRepo,
  applicationRepo,
  activityRepo,
  profileRepo,
  skillRepo,
} from "@/lib/repositories/local-repos";
import { Opportunity } from "@/types/opportunity";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { ApplicationStage } from "@/types/application";
import {
  evaluateAllOpportunities,
} from "@/lib/opportunities/matching-engine";
import { OpportunityCard } from "./opportunity-card";
import { OpportunityDetailModal } from "./opportunity-detail-modal";
import { TrackApplicationModal } from "./track-application-modal";
import {
  Bookmark,
  ArrowLeft,
  Kanban,
  CheckCircle2,
} from "lucide-react";

export const SavedOpportunitiesView: React.FC = () => {
  const router = useRouter();
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedDetailOpp, setSelectedDetailOpp] = useState<Opportunity | null>(null);
  const [selectedTrackOpp, setSelectedTrackOpp] = useState<Opportunity | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [savedList, prof, userSkills] = await Promise.all([
        opportunityRepo.getSavedOpportunities(),
        profileRepo.getProfile(),
        skillRepo.getSkills(),
      ]);
      setSavedOpportunities(savedList);
      setProfile(prof);
      setSkills(userSkills);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const evaluatedSavedList = evaluateAllOpportunities(savedOpportunities, profile, skills);

  const handleToggleSave = async (id: string) => {
    await opportunityRepo.toggleSaveOpportunity(id);
    await activityRepo.logActivity({
      type: "opportunity",
      title: "Removed opportunity bookmark",
      description: "Updated saved opportunities list",
      routeLink: "/saved-opportunities",
      tag: "Opportunities",
    });
    loadData();
  };

  const handleSaveApplication = async (appData: {
    opportunityId?: string;
    company: string;
    role: string;
    stage: ApplicationStage;
    salaryRange?: string;
    notes: string;
    nextStep?: string;
    nextStepDate?: string;
    appliedDate?: string;
  }) => {
    const newApp = await applicationRepo.addApplication({
      opportunityId: appData.opportunityId,
      company: appData.company,
      role: appData.role,
      stage: appData.stage,
      salaryRange: appData.salaryRange,
      notes: appData.notes,
      nextStep: appData.nextStep,
      nextStepDate: appData.nextStepDate,
    });

    if (appData.opportunityId) {
      await opportunityRepo.updateOpportunityStatus(appData.opportunityId, "applied");
    }

    await activityRepo.logActivity({
      type: "application",
      title: `Logged application from bookmarks: ${newApp.role}`,
      description: `Targeting ${newApp.company} (${newApp.stage})`,
      routeLink: "/tracker",
      tag: "Application Tracker",
    });

    setFeedbackToast(`Application tracked for ${newApp.company}! Track it in your Kanban pipeline.`);
    setTimeout(() => setFeedbackToast(null), 5000);
    loadData();
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Saved Opportunities
              </h1>
              <Badge variant="indigo" size="sm">
                {savedOpportunities.length} Bookmarks
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Roles and programs pinned for review, resume tailoring, and application submission.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/opportunities">
              <Button variant="outline" size="sm" className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                All Opportunities
              </Button>
            </Link>

            <Link href="/tracker">
              <Button variant="primary" size="sm" className="text-xs">
                <Kanban className="w-3.5 h-3.5 mr-1" />
                Application Pipeline
              </Button>
            </Link>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackToast && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {feedbackToast}
            </span>
            <Link href="/tracker" className="font-semibold underline hover:text-white shrink-0 ml-3">
              Open Kanban Tracker →
            </Link>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            Loading bookmarked opportunities...
          </div>
        ) : evaluatedSavedList.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No Saved Opportunities Yet"
            description="Explore the opportunity catalogue and click 'Save Role' to bookmark positions here for easy review and application tracking."
            actionLabel="Browse Available Opportunities"
            onAction={() => router.push("/opportunities")}
          />
        ) : (
          <div className="space-y-4">
            {evaluatedSavedList.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                matchResult={opp.matchResult}
                isSaved={true}
                onToggleSave={handleToggleSave}
                onViewDetails={setSelectedDetailOpp}
                onTrackApplication={setSelectedTrackOpp}
              />
            ))}
          </div>
        )}

        {/* Modals */}
        <OpportunityDetailModal
          isOpen={!!selectedDetailOpp}
          onClose={() => setSelectedDetailOpp(null)}
          opportunity={selectedDetailOpp}
          matchResult={
            selectedDetailOpp
              ? evaluatedSavedList.find((o) => o.id === selectedDetailOpp.id)?.matchResult || null
              : null
          }
          isSaved={true}
          onToggleSave={handleToggleSave}
          onOpenTrackModal={(opp) => {
            setSelectedDetailOpp(null);
            setSelectedTrackOpp(opp);
          }}
        />

        <TrackApplicationModal
          isOpen={!!selectedTrackOpp}
          onClose={() => setSelectedTrackOpp(null)}
          opportunity={selectedTrackOpp}
          onSaveApplication={handleSaveApplication}
        />
      </div>
    </AppLayout>
  );
};
