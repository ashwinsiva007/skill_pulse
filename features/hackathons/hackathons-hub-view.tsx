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
} from "@/lib/repositories";
import { Opportunity, ProviderHealthStatus } from "@/types/opportunity";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { ApplicationStage } from "@/types/application";
import {
  evaluateAllOpportunities,
  evaluateOpportunityMatch,
} from "@/lib/opportunities/matching-engine";
import { OpportunityCard } from "@/features/opportunities/opportunity-card";
import { OpportunityDetailModal } from "@/features/opportunities/opportunity-detail-modal";
import { TrackApplicationModal } from "@/features/opportunities/track-application-modal";
import { VERIFIED_UNSTOP_HACKATHONS } from "@/lib/opportunities/hackathons-catalog";
import {
  Trophy,
  Search,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Flame,
  Users,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";

export const HackathonsHubView: React.FC = () => {
  const { user } = useAuth();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedCount, setAppliedCount] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [hackathonMode, setHackathonMode] = useState<string>("All"); // All | Remote | On-site | Hybrid
  const [hackathonEligibility, setHackathonEligibility] = useState<string>("All"); // All | 2nd-3rd-year | beginners | all-students | open-all
  const [hackathonRegion, setHackathonRegion] = useState<string>("All"); // All | South India | Tamil Nadu | North India | West India | Pan-India Remote
  const [hackathonPrizeRange, setHackathonPrizeRange] = useState<string>("All"); // All | 10L+ | 5L-10L | 1L-5L | under-1L
  const [hackathonDomain, setHackathonDomain] = useState<string>("All"); // All | AI & ML | Cloud | Cybersecurity | Web3 | Open Innovation | FinTech
  const [onlyMatchingSkills, setOnlyMatchingSkills] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "newest" | "prize">("match");

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Modals state
  const [selectedDetailOpp, setSelectedDetailOpp] = useState<Opportunity | null>(null);
  const [selectedTrackOpp, setSelectedTrackOpp] = useState<Opportunity | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Fetch opportunities including live Unstop feed
  const fetchHackathons = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      else setIsLoading(true);

      const endpoint = forceRefresh
        ? "/api/opportunities?type=Hackathon&forceRefresh=true"
        : "/api/opportunities?type=Hackathon";
      const res = await fetch(endpoint, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (res.ok) {
        const json = await res.json();
        const allOpps: Opportunity[] = json.opportunities || [];
        const hackathonsOnly = allOpps.filter(
          (o) =>
            o.type === "Hackathon" &&
            o.listingStatus !== "closed" &&
            !o.deadline?.toLowerCase().includes("ended") &&
            !o.deadline?.toLowerCase().includes("expired")
        );
        
        // Merge with catalog hackathons to guarantee full verified catalogue
        const seenIds = new Set(hackathonsOnly.map((h) => h.id));
        const merged = [...hackathonsOnly];
        for (const cat of VERIFIED_UNSTOP_HACKATHONS) {
          if (
            !seenIds.has(cat.id) &&
            cat.listingStatus !== "closed" &&
            !cat.deadline?.toLowerCase().includes("ended") &&
            !cat.deadline?.toLowerCase().includes("expired")
          ) {
            merged.push(cat);
            seenIds.add(cat.id);
          }
        }
        setOpportunities(merged);
        setLastSyncTime(new Date().toLocaleTimeString());
      } else {
        // Fallback to verified catalog
        setOpportunities(VERIFIED_UNSTOP_HACKATHONS);
      }
    } catch (err) {
      console.warn("Falling back to local catalog for hackathons:", err);
      setOpportunities(VERIFIED_UNSTOP_HACKATHONS);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const init = async () => {
      try {
        const [prof, userSkills, savedOpps, applications] = await Promise.all([
          profileRepo.getProfile(),
          skillRepo.getSkills(),
          opportunityRepo.getSavedOpportunities(),
          applicationRepo.getApplications(),
        ]);
        setProfile(prof);
        setSkills(userSkills);
        setSavedIds(new Set(savedOpps.map((o) => o.id)));
        setAppliedCount(applications.length);
      } catch (err) {
        console.error("Failed to load user state:", err);
      }
      await fetchHackathons();
    };

    init();
  }, [fetchHackathons]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    hackathonMode,
    hackathonEligibility,
    hackathonRegion,
    hackathonPrizeRange,
    hackathonDomain,
    onlyMatchingSkills,
    sortBy,
  ]);

  const handleToggleSave = async (id: string) => {
    try {
      const updated = await opportunityRepo.toggleSaveOpportunity(id);
      setOpportunities((prev) => prev.map((o) => (o.id === id ? updated : o)));

      const nextSaved = new Set(savedIds);
      if (updated.status === "saved") {
        nextSaved.add(id);
        showFeedback(`Saved "${updated.title}" to your hackathons.`);
      } else {
        nextSaved.delete(id);
        showFeedback("Removed from saved hackathons.");
      }
      setSavedIds(nextSaved);

      await activityRepo.logActivity({
        type: "opportunity",
        title: `${updated.status === "saved" ? "Bookmarked" : "Removed bookmark for"} hackathon`,
        description: `${updated.title} (${updated.organization})`,
        routeLink: "/saved-opportunities",
        tag: "Hackathons",
      });
    } catch {
      showFeedback("Could not update saved status");
    }
  };

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
        company: applicationData.company,
        role: applicationData.role,
        opportunityId: applicationData.opportunityId,
        stage: applicationData.stage,
        salaryRange: applicationData.salaryRange,
        notes: applicationData.notes.trim() || "Registered via Unstop Hackathons Hub.",
        nextStep: applicationData.nextStep,
        nextStepDate: applicationData.nextStepDate,
      });

      await activityRepo.logActivity({
        type: "application",
        title: `Registered / Tracked: ${applicationData.role}`,
        description: `Tracked in stage: ${applicationData.stage} at ${applicationData.company}`,
        routeLink: "/tracker",
        tag: "Application Tracker",
      });

      setAppliedCount((prev) => prev + 1);
      setSelectedTrackOpp(null);
      showFeedback(`Tracked ${applicationData.role} in Kanban pipeline!`);
    } catch (err) {
      console.error(err);
      showFeedback("Failed to save application to tracker");
    }
  };

  const showFeedback = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Evaluate candidate match scores
  const evaluatedHackathons = useMemo(() => {
    if (!profile) return opportunities;
    return evaluateAllOpportunities(opportunities, profile, skills);
  }, [opportunities, profile, skills]);

  // Multi-Filter Logic
  const filteredHackathons = useMemo(() => {
    return evaluatedHackathons.filter((opp) => {
      // Exclude closed or expired hackathons — only show ongoing with registration open
      if (
        opp.listingStatus === "closed" ||
        opp.deadline?.toLowerCase().includes("ended") ||
        opp.deadline?.toLowerCase().includes("expired")
      ) {
        return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = opp.title.toLowerCase().includes(q);
        const matchesOrg = opp.organization.toLowerCase().includes(q);
        const matchesSkills = (opp.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
        const matchesDomain = (opp.domain || "").toLowerCase().includes(q);
        const matchesLoc = (opp.location || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesOrg && !matchesSkills && !matchesDomain && !matchesLoc) {
          return false;
        }
      }

      // Mode filter
      if (hackathonMode !== "All") {
        if (hackathonMode === "Remote" && opp.workMode !== "Remote") return false;
        if (hackathonMode === "On-site" && opp.workMode !== "On-site") return false;
        if (hackathonMode === "Hybrid" && opp.workMode !== "Hybrid") return false;
      }

      // Eligibility filter
      if (hackathonEligibility !== "All") {
        const text = `${opp.experienceLevel} ${opp.eligibilityRequirements}`.toLowerCase();
        if (hackathonEligibility === "2nd-3rd-year" && !text.includes("2nd") && !text.includes("3rd") && !text.includes("college")) return false;
        if (hackathonEligibility === "beginners" && !text.includes("1st") && !text.includes("beginner") && !text.includes("all")) return false;
        if (hackathonEligibility === "all-students" && !text.includes("all") && !text.includes("open")) return false;
      }

      // Region filter
      if (hackathonRegion !== "All") {
        const loc = `${opp.location} ${opp.region || ""}`.toLowerCase();
        if (hackathonRegion === "Tamil Nadu" && !loc.includes("chennai") && !loc.includes("coimbatore") && !loc.includes("tamil")) return false;
        if (hackathonRegion === "South India" && !loc.includes("bengaluru") && !loc.includes("chennai") && !loc.includes("hyderabad") && !loc.includes("kerala")) return false;
        if (hackathonRegion === "Pan-India Remote" && opp.workMode !== "Remote") return false;
      }

      // Prize range filter
      if (hackathonPrizeRange !== "All") {
        const prize = opp.prizeAmountNumeric || 0;
        if (hackathonPrizeRange === "10L+" && prize < 1000000) return false;
        if (hackathonPrizeRange === "5L-10L" && (prize < 500000 || prize > 1000000)) return false;
        if (hackathonPrizeRange === "1L-5L" && (prize < 100000 || prize > 500000)) return false;
        if (hackathonPrizeRange === "under-1L" && prize >= 100000 && prize !== 0) return false;
      }

      // Domain filter
      if (hackathonDomain !== "All") {
        const dom = `${opp.domain} ${opp.title} ${(opp.requiredSkills || []).join(" ")}`.toLowerCase();
        if (hackathonDomain === "AI & ML" && !dom.includes("ai") && !dom.includes("machine learning") && !dom.includes("genai")) return false;
        if (hackathonDomain === "Web3" && !dom.includes("web3") && !dom.includes("blockchain") && !dom.includes("crypto")) return false;
        if (hackathonDomain === "Cybersecurity" && !dom.includes("cyber") && !dom.includes("security") && !dom.includes("ctf")) return false;
        if (hackathonDomain === "Cloud" && !dom.includes("cloud") && !dom.includes("aws") && !dom.includes("devops")) return false;
        if (hackathonDomain === "FinTech" && !dom.includes("fintech") && !dom.includes("finance") && !dom.includes("banking")) return false;
      }

      // Matching skills only
      if (onlyMatchingSkills && (!opp.matchedSkills || opp.matchedSkills.length === 0)) {
        return false;
      }

      return true;
    });
  }, [
    evaluatedHackathons,
    searchQuery,
    hackathonMode,
    hackathonEligibility,
    hackathonRegion,
    hackathonPrizeRange,
    hackathonDomain,
    onlyMatchingSkills,
  ]);

  // Sorting
  const sortedHackathons = useMemo(() => {
    return [...filteredHackathons].sort((a, b) => {
      if (sortBy === "match") return b.matchScore - a.matchScore;
      if (sortBy === "prize") return (b.prizeAmountNumeric || 0) - (a.prizeAmountNumeric || 0);
      return (b.id || "").localeCompare(a.id || "");
    });
  }, [filteredHackathons, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedHackathons.length / ITEMS_PER_PAGE);
  const paginatedHackathons = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedHackathons.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedHackathons, currentPage]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setHackathonMode("All");
    setHackathonEligibility("All");
    setHackathonRegion("All");
    setHackathonPrizeRange("All");
    setHackathonDomain("All");
    setOnlyMatchingSkills(false);
  };

  const isFilterActive =
    searchQuery !== "" ||
    hackathonMode !== "All" ||
    hackathonEligibility !== "All" ||
    hackathonRegion !== "All" ||
    hackathonPrizeRange !== "All" ||
    hackathonDomain !== "All" ||
    onlyMatchingSkills;

  const totalPrizePoolLakhs = useMemo(() => {
    const total = opportunities.reduce((acc, h) => acc + (h.prizeAmountNumeric || 50000), 0);
    return Math.round(total / 100000);
  }, [opportunities]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Toast */}
        {feedbackToast && (
          <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 border border-emerald-500/50 text-white text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Hero Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0d162d] via-[#101b38] to-[#0c142b] border border-cyan-500/30 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <Badge variant="cyan" size="sm" className="font-semibold uppercase tracking-wider">
                  Unstop Live Ecosystem
                </Badge>
                <Badge variant="emerald" size="sm" className="flex items-center gap-1 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Streaming Live Competitions
                </Badge>
                {lastSyncTime && (
                  <span className="text-[11px] text-slate-400">
                    Synced: {lastSyncTime}
                  </span>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
                <Trophy className="w-7 h-7 text-cyan-400 shrink-0" />
                Hackathon Hub — Student & Corporate Challenges
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Explore 50+ verified college & corporate hackathons with guaranteed direct Unstop links, cash prize pools, and fast-track pre-placement interviews (PPIs) for SDE-1 roles.
              </p>
            </div>

            {/* Quick Metrics & Sync Action */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-cyan-500/30 text-center min-w-24">
                <div className="text-lg font-bold text-cyan-400">{opportunities.length}+</div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Live Hackathons</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/30 text-center min-w-24">
                <div className="text-lg font-bold text-emerald-400">₹{totalPrizePoolLakhs}L+</div>
                <div className="text-[10px] uppercase font-bold text-slate-400">Prize Pool</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchHackathons(true)}
                isLoading={isRefreshing}
                className="text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 cursor-pointer h-12 px-4"
              >
                <RefreshCw className="w-4 h-4 mr-1.5 text-cyan-400" />
                Sync Unstop Feed
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Controls Card */}
        <Card className="p-4 sm:p-5 bg-slate-900/90 border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by hackathon name, tech stack (Python, React, AI), or organizer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Quick Sort & Skills Toggle */}
            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={() => setOnlyMatchingSkills(!onlyMatchingSkills)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer flex items-center gap-1.5 ${
                  onlyMatchingSkills
                    ? "bg-indigo-600 border-indigo-500 text-white shadow-xs"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Only Matching My Skills
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="match">Sort by: AI Match Score</option>
                <option value="prize">Sort by: Cash Prize Pool</option>
                <option value="newest">Sort by: Recent Chapter</option>
              </select>

              {isFilterActive && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer h-8"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Reset Filters
                </Button>
              )}
            </div>
          </div>

          {/* Filter Pills Grid */}
          <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Mode Filter */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Work Mode / Location
              </span>
              <div className="flex flex-wrap gap-1">
                {["All", "Remote", "On-site", "Hybrid"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setHackathonMode(m)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      hackathonMode === m
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {m === "Remote" ? "Virtual / Remote" : m}
                  </button>
                ))}
              </div>
            </div>

            {/* Domain Filter */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Technology Domain
              </span>
              <div className="flex flex-wrap gap-1">
                {["All", "AI & ML", "Cloud", "Cybersecurity", "Web3", "FinTech"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setHackathonDomain(d)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      hackathonDomain === d
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Region Filter */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Region & Tech Hub
              </span>
              <div className="flex flex-wrap gap-1">
                {["All", "South India", "Tamil Nadu", "Pan-India Remote"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setHackathonRegion(r)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      hackathonRegion === r
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Prize Range Filter */}
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
                Prize Pool
              </span>
              <div className="flex flex-wrap gap-1">
                {["All", "10L+", "5L-10L", "1L-5L"].map((p) => (
                  <button
                    key={p}
                    onClick={() => setHackathonPrizeRange(p)}
                    className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                      hackathonPrizeRange === p
                        ? "bg-cyan-500 text-slate-950 font-bold"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {p === "All" ? "Any Prize" : `₹${p}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <div>
            Showing <strong className="text-white">{sortedHackathons.length}</strong> verified student hackathons
            {isFilterActive && " (filtered)"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400">
              Direct registrations guaranteed verified with official Unstop portal.
            </span>
          </div>
        </div>

        {/* Hackathon Cards Grid */}
        {isLoading ? (
          <div className="py-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-white">Streaming live Unstop hackathons...</p>
            <p className="text-xs text-slate-400">Ingesting campus challenges and verified registration links.</p>
          </div>
        ) : sortedHackathons.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No hackathons match your active filters"
            description="Try clearing some filter pills or broadening your search keywords to view available hackathons."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {paginatedHackathons.map((opp) => {
                const matchResult = profile
                  ? evaluateOpportunityMatch(opp, profile, skills)
                  : null;

                return (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    matchResult={matchResult || undefined}
                    isSaved={savedIds.has(opp.id)}
                    onToggleSave={() => handleToggleSave(opp.id)}
                    onViewDetails={() => setSelectedDetailOpp(opp)}
                    onTrackApplication={() => setSelectedTrackOpp(opp)}
                  />
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage <= 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs"
                >
                  <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                  Previous
                </Button>

                <div className="text-xs text-slate-400">
                  Page <strong className="text-white">{currentPage}</strong> of{" "}
                  <strong className="text-white">{totalPages}</strong>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-xs"
                >
                  Next
                  <ChevronRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Detail Modal */}
        <OpportunityDetailModal
          isOpen={Boolean(selectedDetailOpp)}
          onClose={() => setSelectedDetailOpp(null)}
          opportunity={selectedDetailOpp}
          matchResult={
            selectedDetailOpp && profile
              ? evaluateOpportunityMatch(selectedDetailOpp, profile, skills)
              : null
          }
          isSaved={selectedDetailOpp ? savedIds.has(selectedDetailOpp.id) : false}
          onToggleSave={handleToggleSave}
          onOpenTrackModal={(opp) => {
            setSelectedDetailOpp(null);
            setSelectedTrackOpp(opp);
          }}
        />

        {/* Track Modal */}
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
