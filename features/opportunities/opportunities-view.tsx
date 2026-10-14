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
  RefreshCw,
  Sparkles,
  Trophy,
  GraduationCap,
  Globe,
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
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("All");
  const [sortBy, setSortBy] = useState<"match" | "title">("match");

  // Modals and API refresh state
  const [selectedDetailOpp, setSelectedDetailOpp] = useState<Opportunity | null>(null);
  const [selectedTrackOpp, setSelectedTrackOpp] = useState<Opportunity | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [lastLiveFetch, setLastLiveFetch] = useState<string | null>(null);

  // Fetch real live opportunities from our server endpoint
  const fetchLiveOpportunities = async () => {
    try {
      setIsRefreshingLive(true);
      const res = await fetch("/api/opportunities");
      if (res.ok) {
        const data = await res.json();
        if (data.opportunities && Array.isArray(data.opportunities) && data.opportunities.length > 0) {
          // Merge with current opportunities preserving saved status
          const currentSaved = new Set(
            opportunities.filter((o) => o.status === "saved").map((o) => o.id)
          );

          const updatedOpportunities: Opportunity[] = data.opportunities.map((opp: Opportunity) => ({
            ...opp,
            status: currentSaved.has(opp.id) ? "saved" : "available",
          }));

          setOpportunities(updatedOpportunities);
          setLastLiveFetch(new Date().toLocaleTimeString());
          setFeedbackToast(`Fetched ${updatedOpportunities.length} live opportunities (Jobs, Hackathons, Internships)!`);
          setTimeout(() => setFeedbackToast(null), 3500);
        }
      }
    } catch (err) {
      console.error("Live opportunities fetch error:", err);
    } finally {
      setIsRefreshingLive(false);
    }
  };

  // Load profile, skills, stored opportunities
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
    loadData().then(() => {
      // Auto fetch live opportunities on first mount
      fetchLiveOpportunities();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Evaluate matching engine dynamically for all opportunities
  const evaluatedList = useMemo(() => {
    return evaluateAllOpportunities(opportunities, profile, skills);
  }, [opportunities, profile, skills]);

  // Counts by category
  const jobsCount = evaluatedList.filter((o) => o.type === "Job").length;
  const hackathonsCount = evaluatedList.filter((o) => o.type === "Hackathon").length;
  const internshipsCount = evaluatedList.filter((o) => o.type === "Internship").length;

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
          const matchesSkill = (opp.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
          if (!matchesTitle && !matchesOrg && !matchesDomain && !matchesSkill) return false;
        }

        // Type filter
        if (selectedType !== "All" && opp.type.toLowerCase() !== selectedType.toLowerCase()) {
          return false;
        }

        // Work mode filter
        if (selectedWorkMode !== "All" && opp.workMode !== selectedWorkMode) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "match") return b.matchScore - a.matchScore;
        return a.title.localeCompare(b.title);
      });
  }, [evaluatedList, searchQuery, selectedType, selectedWorkMode, sortBy]);

  // Handle Save / Bookmark
  const handleToggleSave = async (id: string) => {
    try {
      const updated = await opportunityRepo.toggleSaveOpportunity(id);
      setOpportunities((prev) => prev.map((o) => (o.id === id ? updated : o)));

      const nextSaved = new Set(savedIds);
      if (updated.status === "saved") {
        nextSaved.add(id);
        setFeedbackToast(`Saved "${updated.title}" to your bookmarks.`);
      } else {
        nextSaved.delete(id);
        setFeedbackToast(`Removed from saved opportunities.`);
      }
      setSavedIds(nextSaved);
      setTimeout(() => setFeedbackToast(null), 3000);

      await activityRepo.logActivity({
        type: "opportunity",
        title: `${updated.status === "saved" ? "Bookmarked" : "Removed bookmark for"} opportunity`,
        description: `${updated.title} (${updated.organization})`,
        routeLink: "/saved-opportunities",
        tag: "Opportunities",
      });
    } catch (err) {
      console.error("Failed to toggle save opportunity:", err);
    }
  };

  // Handle Track application in pipeline
  const handleSaveApplication = async (applicationData: {
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
    try {
      await applicationRepo.addApplication({
        opportunityId: applicationData.opportunityId,
        company: applicationData.company,
        role: applicationData.role,
        stage: applicationData.stage,
        salaryRange: applicationData.salaryRange,
        notes: applicationData.notes.trim() || `Applied via SkillPulse direct portal.`,
        nextStep: applicationData.nextStep,
        nextStepDate: applicationData.nextStepDate,
      });

      setAppliedCount((prev) => prev + 1);
      setSelectedTrackOpp(null);
      setFeedbackToast(`Application for "${applicationData.role}" added to Kanban tracker!`);
      setTimeout(() => setFeedbackToast(null), 3500);

      await activityRepo.logActivity({
        type: "application",
        title: `Logged new application: ${applicationData.role}`,
        description: `Tracked under Applied column at ${applicationData.company}.`,
        routeLink: "/tracker",
        tag: "Application Tracker",
      });
    } catch (err) {
      console.error("Failed to track application:", err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Toast Feedback */}
        {feedbackToast && (
          <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 border border-indigo-500/50 shadow-xl text-xs text-white flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Live Opportunities & Challenges
              </h1>
              <Badge variant="indigo" size="sm">
                Live Aggregator
              </Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Authentic live vacancies from Devpost, Arbeitnow, and verified global internships — tailored to your skill set with direct application links.
            </p>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLiveOpportunities}
              isLoading={isRefreshingLive}
              className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40"
              title="Scrape and fetch latest live jobs, hackathons and internships"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshingLive ? "animate-spin" : ""}`} />
              Refresh Live Feed
            </Button>

            <Link href="/saved-opportunities">
              <Button variant="outline" size="sm" className="text-xs">
                <Bookmark className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Saved ({savedIds.size})
              </Button>
            </Link>

            <Link href="/tracker">
              <Button variant="primary" size="sm" className="text-xs">
                <Kanban className="w-3.5 h-3.5 mr-1 text-teal-400" />
                Pipeline ({appliedCount})
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Aggregation Status Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">Real-Time Opportunity Engine Active</span>
            <span className="text-slate-500 text-[11px] hidden sm:inline">
              · Verified open jobs, hackathons & internships
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Live Sources: Devpost, Arbeitnow, Jobicy, Global Programs</span>
            {lastLiveFetch && <span className="text-slate-500">Last updated: {lastLiveFetch}</span>}
          </div>
        </div>

        {/* Opportunity Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedType("All")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedType === "All"
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-950"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>All Opportunities ({evaluatedList.length})</span>
          </button>

          <button
            onClick={() => setSelectedType("Job")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedType === "Job"
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-950"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
            <span>Live Jobs ({jobsCount})</span>
          </button>

          <button
            onClick={() => setSelectedType("Internship")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedType === "Internship"
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-950"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Internships & Fellowships ({internshipsCount})</span>
          </button>

          <button
            onClick={() => setSelectedType("Hackathon")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedType === "Hackathon"
                ? "bg-indigo-600 text-white shadow-xs shadow-indigo-950"
                : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Hackathons ({hackathonsCount})</span>
          </button>
        </div>

        {/* Search, Work Mode Filter & Sorting Bar */}
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role, company, skill (e.g. Python, React)..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Work Mode Filter */}
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
            >
              <option value="All">All Locations & Modes</option>
              <option value="Remote">Remote Only</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
            </select>

            {/* Sorting */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "match" | "title")}
              className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs focus:outline-none"
            >
              <option value="match">Sort by: Match Alignment %</option>
              <option value="title">Sort by: Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Opportunities List Grid */}
        {filteredOpportunities.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No Opportunities Match Your Filter"
            description="Try clearing search filters or click 'Refresh Live Feed' to pull new trending opportunities from Devpost, Arbeitnow, and Jobicy."
            actionLabel="Reset Filter Settings"
            onAction={() => {
              setSearchQuery("");
              setSelectedType("All");
              setSelectedWorkMode("All");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredOpportunities.map((opp) => (
              <OpportunityCard
                key={opp.id}
                opportunity={opp}
                isSaved={savedIds.has(opp.id)}
                onToggleSave={handleToggleSave}
                onViewDetails={setSelectedDetailOpp}
                onTrackApplication={setSelectedTrackOpp}
              />
            ))}
          </div>
        )}

        {/* Opportunity Detail Modal */}
        <OpportunityDetailModal
          isOpen={Boolean(selectedDetailOpp)}
          onClose={() => setSelectedDetailOpp(null)}
          opportunity={selectedDetailOpp}
          matchResult={null}
          isSaved={selectedDetailOpp ? savedIds.has(selectedDetailOpp.id) : false}
          onToggleSave={handleToggleSave}
          onOpenTrackModal={(opp) => {
            setSelectedDetailOpp(null);
            setSelectedTrackOpp(opp);
          }}
        />

        {/* Track Application Modal */}
        <TrackApplicationModal
          isOpen={Boolean(selectedTrackOpp)}
          onClose={() => setSelectedTrackOpp(null)}
          opportunity={selectedTrackOpp}
          onSaveApplication={handleSaveApplication}
        />
      </div>
    </AppLayout>
  );
};
