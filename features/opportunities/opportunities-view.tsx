"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
  Briefcase,
  Bookmark,
  Kanban,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export const OpportunitiesView: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedCount, setAppliedCount] = useState(0);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"match" | "newest" | "title">("match");

  // Modals state
  const [selectedDetailOpp, setSelectedDetailOpp] = useState<Opportunity | null>(null);
  const [selectedTrackOpp, setSelectedTrackOpp] = useState<Opportunity | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile, skills, opportunities and applications
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [oppList, prof, userSkills, appsList] = await Promise.all([
        opportunityRepo.getOpportunities(),
        profileRepo.getProfile(),
        skillRepo.getSkills(),
        applicationRepo.getApplications(),
      ]);

      setOpportunities(oppList);
      setProfile(prof);
      setSkills(userSkills);
      setAppliedCount(appsList.length);

      const saved = new Set(oppList.filter((o) => o.status === "saved").map((o) => o.id));
      setSavedIds(saved);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Evaluate matching engine dynamically for all opportunities
  const evaluatedList = useMemo(() => {
    return evaluateAllOpportunities(opportunities, profile, skills);
  }, [opportunities, profile, skills]);

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    return evaluatedList
      .filter((opp) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = opp.title.toLowerCase().includes(q);
          const matchesOrg = opp.organization.toLowerCase().includes(q);
          const matchesDomain = opp.domain.toLowerCase().includes(q);
          const matchesSkill = opp.requiredSkills.some((s) => s.toLowerCase().includes(q));
          if (!matchesTitle && !matchesOrg && !matchesDomain && !matchesSkill) return false;
        }

        // Type filter
        if (selectedType !== "All" && opp.type !== selectedType) return false;

        // Domain filter
        if (selectedDomain !== "All" && opp.domain !== selectedDomain) return false;

        // Work mode filter
        if (selectedWorkMode !== "All" && opp.workMode !== selectedWorkMode) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "match") return b.matchScore - a.matchScore;
        if (sortBy === "title") return a.title.localeCompare(b.title);
        // Default newest (by posted date text approximation)
        return a.title.localeCompare(b.title);
      });
  }, [evaluatedList, searchQuery, selectedType, selectedDomain, selectedWorkMode, sortBy]);

  // Handle Save / Unsave bookmark toggle
  const handleToggleSave = async (id: string) => {
    const updated = await opportunityRepo.toggleSaveOpportunity(id);
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (updated.status === "saved") {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });

    await activityRepo.logActivity({
      type: "opportunity",
      title: `${updated.status === "saved" ? "Bookmarked" : "Removed bookmark for"} ${updated.title}`,
      description: `${updated.organization} (${updated.matchScore}% Match)`,
      routeLink: "/saved-opportunities",
      tag: "Opportunities",
    });

    loadData();
  };

  // Handle saving an application directly into the tracker
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
      title: `Logged application: ${newApp.role}`,
      description: `Targeting ${newApp.company} (${newApp.stage})`,
      routeLink: "/tracker",
      tag: "Application Tracker",
    });

    setFeedbackToast(`Application tracked for ${newApp.company}! Track it in your Kanban pipeline.`);
    setTimeout(() => setFeedbackToast(null), 5000);
    loadData();
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedType("All");
    setSelectedDomain("All");
    setSelectedWorkMode("All");
    setSortBy("match");
  };

  const opportunityTypes = ["All", "Job", "Internship", "Hackathon", "Research", "Career Program"];
  const domains = [
    "All",
    "Data & Analytics",
    "Data Science & Analytics",
    "AI & Machine Learning",
    "Software Engineering",
    "Web & Frontend",
    "Systems & Backend",
  ];

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Opportunity Discovery & Matching
              </h1>
              <Badge variant="emerald" size="sm">
                Stage 5 Active
              </Badge>
              <Badge variant="amber" size="sm">
                Demo Catalogue
              </Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Curated early-career roles, internships, hackathons, and research fellowships evaluated against your recorded profile skills and career preferences.
            </p>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/saved-opportunities">
              <Button variant="outline" size="sm" className="text-xs">
                <Bookmark className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
                Saved Bookmarks ({savedIds.size})
              </Button>
            </Link>

            <Link href="/tracker">
              <Button variant="primary" size="sm" className="text-xs">
                <Kanban className="w-3.5 h-3.5 mr-1.5" />
                Application Pipeline ({appliedCount})
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

        {/* Explainable Disclaimer Notice */}
        <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-semibold text-slate-300">
              Explainable Opportunity Scoring Notice:
            </span>
            <p className="leading-relaxed">
              Scores reflect transparent rubric alignment with your profile skills, target role, and location preferences. All sample listings are <strong>demonstration entries</strong> for navigation testing. A match score is an informational heuristic and does <strong>not</strong> guarantee an interview or hiring offer.
            </p>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <Card className="p-4 sm:p-5 bg-slate-950/70 border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, organization, or required skill (e.g. SQL, Python, FastAPI)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Domain Dropdown */}
            <div className="min-w-[180px]">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                aria-label="Filter by technical domain"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {domains.map((d) => (
                  <option key={d} value={d}>
                    {d === "All" ? "All Domains" : d}
                  </option>
                ))}
              </select>
            </div>

            {/* Work Mode Dropdown */}
            <div className="min-w-[130px]">
              <select
                value={selectedWorkMode}
                onChange={(e) => setSelectedWorkMode(e.target.value)}
                aria-label="Filter by work mode"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="All">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-site">On-site</option>
              </select>
            </div>

            {/* Sort Dropdown */}
            <div className="min-w-[160px]">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "match" | "title")}
                aria-label="Sort opportunities"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="match">Sort: Best Match</option>
                <option value="title">Sort: Title A–Z</option>
              </select>
            </div>
          </div>

          {/* Type Filter Pills Row */}
          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80 flex-wrap">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Opportunity Type:
              </span>
              {opportunityTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-all whitespace-nowrap border ${
                    selectedType === type
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                      : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
              <span>Showing {filteredOpportunities.length} of {opportunities.length} demo listings</span>
              {(searchQuery || selectedType !== "All" || selectedDomain !== "All" || selectedWorkMode !== "All") && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 ml-2"
                >
                  <RotateCcw className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Opportunity Listings List */}
        {isLoading ? (
          <div className="p-12 text-center rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            Evaluating opportunities against your profile...
          </div>
        ) : filteredOpportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Matching Opportunities Found"
            description="Try loosening your search keywords, opportunity type, or domain filters to explore more demo listings."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <div className="space-y-4">
            {filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                matchResult={opp.matchResult}
                isSaved={savedIds.has(opp.id)}
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
              ? evaluatedList.find((o) => o.id === selectedDetailOpp.id)?.matchResult || null
              : null
          }
          isSaved={selectedDetailOpp ? savedIds.has(selectedDetailOpp.id) : false}
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
