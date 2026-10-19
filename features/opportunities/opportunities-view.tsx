"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
import {
  Opportunity,
  ProviderHealthStatus,
  ExternalSearchShortcut,
  SourceMode,
} from "@/types/opportunity";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { ApplicationStage } from "@/types/application";
import {
  evaluateAllOpportunities,
  evaluateOpportunityMatch,
} from "@/lib/opportunities/matching-engine";
import { OpportunityCard } from "./opportunity-card";
import { OpportunityDetailModal } from "./opportunity-detail-modal";
import { TrackApplicationModal } from "./track-application-modal";
import {
  Briefcase,
  Bookmark,
  Kanban,
  Search,
  CheckCircle2,
  RefreshCw,
  Trophy,
  GraduationCap,
  Globe,
  MapPin,
  Radio,
  FileCheck,
  ExternalLink,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Info,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Sparkles,
  Users,
  Flame,
  RotateCcw,
} from "lucide-react";
import { useAuth } from "@/lib/firebase/auth-context";
import { AdminOpportunitiesView } from "./admin-opportunities-view";

export const OpportunitiesView: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const isMasterAdmin = isAdmin || user?.email === "admin@gmail.com";

  // Strict isolation: Master Admin gets their dedicated monitoring portal
  if (isMasterAdmin) {
    return <AdminOpportunitiesView />;
  }

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [appliedCount, setAppliedCount] = useState(0);

  // Ingestion metadata & provider status
  const [providerStatuses, setProviderStatuses] = useState<ProviderHealthStatus[]>([]);
  const [externalShortcuts, setExternalShortcuts] = useState<ExternalSearchShortcut[]>([]);
  const [isProvidersDrawerOpen, setIsProvidersDrawerOpen] = useState(false);
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [lastLiveFetch, setLastLiveFetch] = useState<string | null>(null);

  // Tabs & Filter states
  const searchParams = useSearchParams();
  const [sourceModeTab, setSourceModeTab] = useState<"ALL" | "LIVE" | "CURATED" | "SHORTCUTS">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<string>("All India");
  const [onlyMatchingSkills, setOnlyMatchingSkills] = useState(false);
  const [sortBy, setSortBy] = useState<"match" | "newest" | "title">("match");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // Dedicated Unstop Hackathons Multi-Filter States (Non-mandatory, default to "All")
  const [hackathonMode, setHackathonMode] = useState<string>("All"); // All | Remote | On-site | Hybrid
  const [hackathonEligibility, setHackathonEligibility] = useState<string>("All"); // All | 2nd-3rd-year | beginners | all-students | open-all
  const [hackathonRegion, setHackathonRegion] = useState<string>("All"); // All | South India | Tamil Nadu | North India | West India | Pan-India Remote
  const [hackathonPrizeRange, setHackathonPrizeRange] = useState<string>("All"); // All | 10L+ | 5L-10L | 1L-5L | under-1L
  const [hackathonDomain, setHackathonDomain] = useState<string>("All"); // All | AI & ML | Cloud | Cybersecurity | Web3 | Open Innovation | FinTech

  // Sync initial type from URL search parameters (e.g. /opportunities?type=Hackathon)
  useEffect(() => {
    const typeParam = searchParams.get("type");
    if (typeParam) {
      if (typeParam.toLowerCase() === "hackathon") {
        setSelectedType("Hackathon");
      } else if (typeParam.toLowerCase() === "job") {
        setSelectedType("Job");
      } else if (typeParam.toLowerCase() === "internship") {
        setSelectedType("Internship");
      }
    }
  }, [searchParams]);

  const isHackathonFilterActive =
    hackathonMode !== "All" ||
    hackathonEligibility !== "All" ||
    hackathonRegion !== "All" ||
    hackathonPrizeRange !== "All" ||
    hackathonDomain !== "All";

  const handleResetHackathonFilters = () => {
    setHackathonMode("All");
    setHackathonEligibility("All");
    setHackathonRegion("All");
    setHackathonPrizeRange("All");
    setHackathonDomain("All");
    setSearchQuery("");
  };

  // Modals state
  const [selectedDetailOpp, setSelectedDetailOpp] = useState<Opportunity | null>(null);
  const [selectedTrackOpp, setSelectedTrackOpp] = useState<Opportunity | null>(null);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    sourceModeTab,
    searchQuery,
    selectedType,
    selectedWorkMode,
    selectedLocation,
    onlyMatchingSkills,
    sortBy,
    hackathonMode,
    hackathonEligibility,
    hackathonRegion,
    hackathonPrizeRange,
    hackathonDomain,
  ]);

  // Fetch opportunities from server-side ingestion endpoint
  const fetchLiveOpportunities = useCallback(async (forceRefresh = false) => {
    try {
      setIsRefreshingLive(true);
      const params = new URLSearchParams();
      if (forceRefresh) params.append("forceRefresh", "true");
      if (selectedLocation !== "All India") params.append("region", selectedLocation);
      if (selectedType !== "All") params.append("type", selectedType);

      const res = await fetch(`/api/opportunities?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.opportunities && Array.isArray(data.opportunities)) {
          // Preserve saved status
          const currentSaved = new Set(
            opportunities.filter((o) => o.status === "saved").map((o) => o.id)
          );

          const updatedOpportunities: Opportunity[] = data.opportunities.map((opp: Opportunity) => ({
            ...opp,
            status: currentSaved.has(opp.id) ? "saved" : "available",
          }));

          setOpportunities(updatedOpportunities);
          if (data.providerStatuses) setProviderStatuses(data.providerStatuses);
          if (data.externalShortcuts) setExternalShortcuts(data.externalShortcuts);
          setLastLiveFetch(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));

          if (forceRefresh) {
            setFeedbackToast(
              `Live sync completed: Ingested ${data.totalLiveCount || 0} live openings + ${data.totalCuratedCount || 0} curated records!`
            );
            setTimeout(() => setFeedbackToast(null), 3500);
          }
        }
      }
    } catch (err) {
      console.error("Live opportunities fetch error:", err);
    } finally {
      setIsRefreshingLive(false);
    }
  }, [opportunities, selectedLocation, selectedType]);

  // Load candidate profile, recorded skills, and saved opportunities
  const loadInitialData = useCallback(async () => {
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
    loadInitialData().then(() => {
      fetchLiveOpportunities(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enrich all opportunities through the transparent 6-factor matching engine
  const evaluatedList = useMemo(() => {
    return evaluateAllOpportunities(opportunities, profile, skills);
  }, [opportunities, profile, skills]);

  // Counts by source and type
  const liveCount = evaluatedList.filter((o) => o.sourceMode === "LIVE").length;
  const curatedCount = evaluatedList.filter((o) => o.sourceMode === "CURATED_CATALOG").length;
  const jobsCount = evaluatedList.filter((o) => o.type === "Job").length;
  const internshipsCount = evaluatedList.filter((o) => o.type === "Internship").length;
  const hackathonsCount = evaluatedList.filter((o) => o.type === "Hackathon").length;

  // Filter and sort opportunities
  const filteredOpportunities = useMemo(() => {
    return evaluatedList
      .filter((opp) => {
        // 1. Source Mode Filter Tab
        if (sourceModeTab === "LIVE" && opp.sourceMode !== "LIVE") return false;
        if (sourceModeTab === "CURATED" && opp.sourceMode !== "CURATED_CATALOG") return false;
        if (sourceModeTab === "SHORTCUTS") return false; // Handled in separate view

        // 2. Keyword Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = opp.title.toLowerCase().includes(q);
          const matchesOrg = opp.organization.toLowerCase().includes(q);
          const matchesDomain = opp.domain.toLowerCase().includes(q);
          const matchesLoc = opp.location.toLowerCase().includes(q);
          const matchesSkill = [
            ...(opp.requiredSkills || []),
            ...(opp.preferredSkills || []),
          ].some((s) => s.toLowerCase().includes(q));

          if (!matchesTitle && !matchesOrg && !matchesDomain && !matchesLoc && !matchesSkill) {
            return false;
          }
        }

        // 3. Type Filter
        if (selectedType !== "All" && opp.type.toLowerCase() !== selectedType.toLowerCase()) {
          return false;
        }

        // Dedicated Unstop Hackathons Filters (Active when viewing Hackathons)
        if (selectedType === "Hackathon") {
          // A. Hackathon Format / Mode Filter
          if (hackathonMode !== "All") {
            if (hackathonMode === "Remote" && opp.workMode !== "Remote") return false;
            if (hackathonMode === "On-site" && opp.workMode !== "On-site") return false;
            if (hackathonMode === "Hybrid" && opp.workMode !== "Hybrid") return false;
          }

          // B. Student Eligibility Filter
          if (hackathonEligibility !== "All") {
            const eligCombined = `${opp.experienceLevel} ${opp.eligibilityRequirements}`.toLowerCase();
            if (hackathonEligibility === "2nd-3rd-year") {
              const matches2nd3rd =
                eligCombined.includes("2nd") ||
                eligCombined.includes("3rd") ||
                eligCombined.includes("undergrad") ||
                eligCombined.includes("all college");
              if (!matches2nd3rd) return false;
            } else if (hackathonEligibility === "beginners") {
              const matchesBeg =
                eligCombined.includes("1st") ||
                eligCombined.includes("beginner") ||
                eligCombined.includes("all college");
              if (!matchesBeg) return false;
            } else if (hackathonEligibility === "all-students") {
              const matchesCollege =
                eligCombined.includes("college") ||
                eligCombined.includes("student") ||
                eligCombined.includes("university");
              if (!matchesCollege) return false;
            } else if (hackathonEligibility === "open-all") {
              const matchesOpen =
                eligCombined.includes("open") ||
                eligCombined.includes("professional") ||
                eligCombined.includes("all");
              if (!matchesOpen) return false;
            }
          }

          // C. Region / Location Filter
          if (hackathonRegion !== "All") {
            const locCombined = `${opp.location} ${opp.region || ""} ${opp.city || ""} ${opp.state || ""}`.toLowerCase();
            if (hackathonRegion === "Tamil Nadu") {
              const isTN =
                locCombined.includes("tamil nadu") ||
                locCombined.includes("chennai") ||
                locCombined.includes("coimbatore") ||
                locCombined.includes("trichy") ||
                locCombined.includes("vellore") ||
                locCombined.includes("madurai");
              if (!isTN) return false;
            } else if (hackathonRegion === "South India") {
              const isSouth =
                opp.region === "South India" ||
                locCombined.includes("tamil nadu") ||
                locCombined.includes("chennai") ||
                locCombined.includes("coimbatore") ||
                locCombined.includes("trichy") ||
                locCombined.includes("vellore") ||
                locCombined.includes("bengaluru") ||
                locCombined.includes("bangalore") ||
                locCombined.includes("karnataka") ||
                locCombined.includes("hyderabad") ||
                locCombined.includes("telangana") ||
                locCombined.includes("kerala");
              if (!isSouth) return false;
            } else if (hackathonRegion === "Pan-India Remote") {
              const isPanIndia =
                opp.region === "Pan-India Remote" ||
                opp.workMode === "Remote" ||
                locCombined.includes("remote") ||
                locCombined.includes("virtual");
              if (!isPanIndia) return false;
            } else if (hackathonRegion === "North India") {
              const isNorth =
                opp.region === "North India" ||
                locCombined.includes("delhi") ||
                locCombined.includes("noida") ||
                locCombined.includes("gurugram");
              if (!isNorth) return false;
            } else if (hackathonRegion === "West India") {
              const isWest =
                opp.region === "West India" ||
                locCombined.includes("mumbai") ||
                locCombined.includes("pune") ||
                locCombined.includes("maharashtra");
              if (!isWest) return false;
            }
          }

          // D. Cash Prize Amount Filter
          if (hackathonPrizeRange !== "All") {
            const prize = opp.prizeAmountNumeric || 0;
            if (hackathonPrizeRange === "10L+" && prize < 1000000) return false;
            if (hackathonPrizeRange === "5L-10L" && (prize < 500000 || prize >= 1000000)) return false;
            if (hackathonPrizeRange === "1L-5L" && (prize < 100000 || prize >= 500000)) return false;
            if (hackathonPrizeRange === "under-1L" && (prize <= 0 || prize >= 100000)) return false;
          }

          // E. Domain / Category Filter
          if (hackathonDomain !== "All") {
            const domainCombined = `${opp.domain} ${opp.title} ${(opp.requiredSkills || []).join(" ")}`.toLowerCase();
            if (!domainCombined.includes(hackathonDomain.toLowerCase())) {
              return false;
            }
          }
        }

        // 4. Work Mode Filter (When not Hackathons or generic)
        if (selectedType !== "Hackathon" && selectedWorkMode !== "All" && opp.workMode !== selectedWorkMode) {
          return false;
        }

        // 5. Location Filter (When not Hackathons or generic)
        if (selectedType !== "Hackathon" && selectedLocation !== "All India") {
          const locLower = opp.location.toLowerCase();
          const selLower = selectedLocation.toLowerCase();

          if (selectedLocation === "Tamil Nadu (All)") {
            const isTN =
              locLower.includes("tamil nadu") ||
              locLower.includes("chennai") ||
              locLower.includes("coimbatore") ||
              locLower.includes("madurai") ||
              locLower.includes("trichy") ||
              locLower.includes("tiruchirappalli") ||
              locLower.includes("salem") ||
              locLower.includes("hosur") ||
              locLower.includes("tiruppur") ||
              locLower.includes("erode");
            if (!isTN) return false;
          } else if (selectedLocation === "Pan-India Remote") {
            const isRemote =
              opp.workMode === "Remote" ||
              opp.region === "Pan-India Remote" ||
              locLower.includes("remote");
            if (!isRemote) return false;
          } else {
            // City-level match
            if (!locLower.includes(selLower)) return false;
          }
        }

        // 6. Only Matching Skills Filter
        if (onlyMatchingSkills && opp.matchedSkills.length === 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "match") return b.matchScore - a.matchScore;
        if (sortBy === "newest") {
          const dateA = a.publicationDate ? new Date(a.publicationDate).getTime() : 0;
          const dateB = b.publicationDate ? new Date(b.publicationDate).getTime() : 0;
          return dateB - dateA;
        }
        return a.title.localeCompare(b.title);
      });
  }, [
    evaluatedList,
    sourceModeTab,
    searchQuery,
    selectedType,
    selectedWorkMode,
    selectedLocation,
    onlyMatchingSkills,
    sortBy,
    hackathonMode,
    hackathonEligibility,
    hackathonRegion,
    hackathonPrizeRange,
    hackathonDomain,
  ]);

  // Sliced paginated view (12 opportunities per page)
  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE) || 1;
  const paginatedOpportunities = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOpportunities.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredOpportunities, currentPage]);

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
      setFeedbackToast(`Application for "${applicationData.role}" added to Kanban pipeline!`);
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

  // Selected opportunity match result for detail modal
  const selectedMatchResult = useMemo(() => {
    if (!selectedDetailOpp) return null;
    const found = evaluatedList.find((o) => o.id === selectedDetailOpp.id);
    if (found?.matchResult) return found.matchResult;
    return evaluateOpportunityMatch(selectedDetailOpp, profile, skills);
  }, [selectedDetailOpp, evaluatedList, profile, skills]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Toast Feedback */}
        {feedbackToast && (
          <div className="fixed bottom-6 right-6 z-50 p-3.5 rounded-xl bg-slate-900 border border-indigo-500/50 shadow-xl text-xs text-white flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>Live Job Discovery & Verified Ingestion</span>
              </h1>
              <Badge variant="emerald" size="sm">
                Tamil Nadu & India
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real job discovery and verified opportunity ingestion across Tamil Nadu and Pan-India. Matches your ATS resume, skills, and projects with transparent 6-factor scoring.
            </p>
          </div>

          {/* Quick Actions & Navigation */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLiveOpportunities(true)}
              isLoading={isRefreshingLive}
              className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40"
              title="Trigger real-time live ingestion from Greenhouse, Lever, and Adzuna"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshingLive ? "animate-spin" : ""}`} />
              Sync Live Sources
            </Button>

            <Link href="/saved-opportunities">
              <Button variant="outline" size="sm" className="text-xs">
                <Bookmark className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Saved ({savedIds.size})
              </Button>
            </Link>

            <Link href="/tracker">
              <Button variant="primary" size="sm" className="text-xs font-bold">
                <Kanban className="w-3.5 h-3.5 mr-1 text-teal-400" />
                Pipeline ({appliedCount})
              </Button>
            </Link>
          </div>
        </div>

        {/* Source Mode Tabs (All, Live Ingested, Curated Catalog, External Shortcuts) */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <button
              onClick={() => setSourceModeTab("ALL")}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all ${
                sourceModeTab === "ALL"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              All Available ({evaluatedList.length})
            </button>

            <button
              onClick={() => setSourceModeTab("LIVE")}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                sourceModeTab === "LIVE"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span>Live Ingested Feed ({liveCount})</span>
            </button>

            <button
              onClick={() => setSourceModeTab("CURATED")}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                sourceModeTab === "CURATED"
                  ? "bg-cyan-600 text-white shadow-xs"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <FileCheck className="w-3 h-3" />
              <span>Verified Catalog ({curatedCount})</span>
            </button>

            <button
              onClick={() => setSourceModeTab("SHORTCUTS")}
              className={`px-3.5 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                sourceModeTab === "SHORTCUTS"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              <ExternalLink className="w-3 h-3 text-amber-400" />
              <span>External Search Shortcuts</span>
            </button>
          </div>

          {/* Provider Transparency Status Toggle */}
          <button
            onClick={() => setIsProvidersDrawerOpen(!isProvidersDrawerOpen)}
            className="text-xs text-indigo-300 hover:text-indigo-200 flex items-center gap-1 py-1 px-2 rounded-md hover:bg-slate-900 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Source Status & Ingestion Health</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${isProvidersDrawerOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        {/* Collapsible Provider Transparency & Health Panel */}
        {isProvidersDrawerOpen && (
          <Card className="p-4 bg-[#090d18] border-indigo-500/30 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Modular Data Providers & Ingestion Engine Status
              </span>
              {lastLiveFetch && (
                <span className="text-[11px] text-slate-400">Last Synced: {lastLiveFetch}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Greenhouse */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Greenhouse ATS</span>
                  <Badge variant="emerald" size="sm">ACTIVE</Badge>
                </div>
                <p className="text-[11px] text-slate-400">Postman, Stripe, Cloudflare, MongoDB, Figma</p>
                <span className="text-[10px] text-emerald-400 block pt-0.5">8 employer boards tracked</span>
              </div>

              {/* Lever */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Lever ATS</span>
                  <Badge variant="emerald" size="sm">ACTIVE</Badge>
                </div>
                <p className="text-[11px] text-slate-400">Razorpay, Paytm, Atlassian, CleverTap, InMobi</p>
                <span className="text-[10px] text-emerald-400 block pt-0.5">7 employer boards tracked</span>
              </div>

              {/* Adzuna */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Adzuna India</span>
                  {providerStatuses.find((p) => p.providerId === "adzuna")?.isConfigured ? (
                    <Badge variant="emerald" size="sm">ACTIVE</Badge>
                  ) : (
                    <Badge variant="amber" size="sm">NOT CONFIGURED</Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {providerStatuses.find((p) => p.providerId === "adzuna")?.isConfigured
                    ? "Live India search queries active"
                    : "Add ADZUNA_APP_ID & KEY in .env.local"}
                </p>
                <span className="text-[10px] text-slate-500 block pt-0.5">Attribution: Jobs by Adzuna</span>
              </div>

              {/* Curated Catalog */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Verified Catalog</span>
                  <Badge variant="cyan" size="sm">ACTIVE</Badge>
                </div>
                <p className="text-[11px] text-slate-400">Swiggy, Zoho, Bosch, SIH, Unstop</p>
                <span className="text-[10px] text-cyan-400 block pt-0.5">18 verified Indian opportunities</span>
              </div>
            </div>
          </Card>
        )}

        {/* EXTERNAL SEARCH SHORTCUTS VIEW */}
        {sourceModeTab === "SHORTCUTS" ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ExternalLink className="w-4 h-4 text-amber-400" />
                Verified External Search Shortcuts (Restricted Platforms)
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                SkillPulse strictly respects platform terms and avoids unauthorized web scraping of LinkedIn, Indeed, and Naukri. Use these verified shortcuts to open direct, pre-filtered live search queries on the official platforms.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {externalShortcuts.map((sc) => (
                <Card key={sc.id} className="p-5 bg-slate-900/80 border-slate-800 hover:border-amber-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-base">{sc.platformName}</span>
                    <Badge variant="amber" size="sm">{sc.badgeLabel}</Badge>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{sc.description}</p>
                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Location: {sc.location}</span>
                    <a
                      href={sc.searchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold transition-colors"
                    >
                      <span>Search on {sc.platformName}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Dedicated Unstop Hackathons Hub Hero Banner */}
            {selectedType === "Hackathon" && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/30 shadow-lg space-y-3.5 mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                        <Trophy className="w-4 h-4 text-cyan-400" />
                      </span>
                      <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        Unstop & Campus Hackathon Gateway
                        <Badge variant="cyan" size="sm" className="font-semibold text-[10px]">
                          {hackathonsCount}+ Verified National Challenges
                        </Badge>
                      </h2>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                      Tailored for <strong>1st, 2nd, and 3rd-year college coders</strong>. Discover flagship corporate challenges (Flipkart GRiD, Amazon HackOn, Walmart) and premier South India on-campus hackathons (IIT Madras, NIT Trichy, Anna University) with <strong>1-click direct Unstop registration links</strong>.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href="https://unstop.com/hackathons"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-xs font-semibold transition-all shadow-xs"
                    >
                      <span>Explore Unstop Portal</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>

                {/* Quick Stats Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span><strong>2nd & 3rd Year</strong> Friendly</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                    <span><strong>₹2.5+ Crore</strong> Cash Prize Pools + PPIs</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span><strong>South India & Pan-India</strong> Virtual Tracks</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-950/70 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span><strong>Direct Unstop URLs</strong> (Zero Wasted Time)</span>
                  </span>
                </div>
              </div>
            )}

            {/* Filter Controls: Tamil Nadu & India Locations, Work Mode, Types, Search */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              {/* Row 1: Search & Type Quick Pills */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      selectedType === "Hackathon"
                        ? "Search hackathon name, tech stack, IIT/NIT college, or company..."
                        : "Search role, skills (e.g. React, Python), or company..."
                    }
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
                  />
                </div>

                {/* Opportunity Type Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                  {[
                    { id: "All", label: "All Types" },
                    { id: "Job", label: `Jobs (${jobsCount})` },
                    { id: "Internship", label: `Internships (${internshipsCount})` },
                    { id: "Hackathon", label: `Hackathons (${hackathonsCount})` },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedType(t.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        selectedType === t.id
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Specialized Filters depending on selected type */}
              {selectedType === "Hackathon" ? (
                <div className="space-y-3 pt-2 border-t border-slate-800/80 text-xs">
                  {/* Dedicated 4-Column Multi-Filter Bar as requested */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    {/* Filter 1: Format / Mode (Online, Offline, Hybrid) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-cyan-400" />
                        1. Format / Mode
                      </label>
                      <select
                        value={hackathonMode}
                        onChange={(e) => setHackathonMode(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-cyan-500 cursor-pointer"
                      >
                        <option value="All">🌐 All Formats</option>
                        <option value="Remote">💻 Online (Virtual Only)</option>
                        <option value="On-site">🏛️ In-Person (On-Campus)</option>
                        <option value="Hybrid">🔄 Hybrid (Online + Finals)</option>
                      </select>
                    </div>

                    {/* Filter 2: Student Eligibility */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <GraduationCap className="w-3 h-3 text-indigo-400" />
                        2. Student Eligibility
                      </label>
                      <select
                        value={hackathonEligibility}
                        onChange={(e) => setHackathonEligibility(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 cursor-pointer"
                      >
                        <option value="All">🎓 All Eligibility</option>
                        <option value="2nd-3rd-year">🚀 2nd & 3rd Year Undergrads</option>
                        <option value="beginners">🌱 1st & 2nd Year Beginners</option>
                        <option value="all-students">🏫 All College Students (UG/PG)</option>
                        <option value="open-all">💼 Open to All / Early Careers</option>
                      </select>
                    </div>

                    {/* Filter 3: Region / Campus Hub (South India & Tamil Nadu focus) */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-400" />
                        3. Region & Location
                      </label>
                      <select
                        value={hackathonRegion}
                        onChange={(e) => setHackathonRegion(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 cursor-pointer"
                      >
                        <option value="All">📍 All Regions</option>
                        <option value="South India">🌴 South India (TN, KA, TS, KL)</option>
                        <option value="Tamil Nadu">🏛️ Tamil Nadu (Chennai, CBE, Trichy)</option>
                        <option value="Pan-India Remote">🏙️ Pan-India Remote / Virtual</option>
                        <option value="North India">🏛️ North India (Delhi NCR)</option>
                        <option value="West India">🏛️ West India (Mumbai / Pune)</option>
                      </select>
                    </div>

                    {/* Filter 4: Cash Prize Pool */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                        <Trophy className="w-3 h-3 text-amber-400" />
                        4. Prize Pool
                      </label>
                      <select
                        value={hackathonPrizeRange}
                        onChange={(e) => setHackathonPrizeRange(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="All">🏆 All Prize Pools</option>
                        <option value="10L+">💎 ₹10 Lakhs+ Mega Prizes</option>
                        <option value="5L-10L">🥇 ₹5L - ₹10L High Prizes</option>
                        <option value="1L-5L">🥈 ₹1L - ₹5L Mid Prizes</option>
                        <option value="under-1L">🥉 Up to ₹1L / Swags & Grants</option>
                      </select>
                    </div>
                  </div>

                  {/* Filter 5: Domain Pills & Reset Action */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                      <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0">
                        Domain:
                      </span>
                      {[
                        { id: "All", label: "All Domains" },
                        { id: "AI & ML", label: "AI & GenAI" },
                        { id: "Software Engineering", label: "Full Stack & Cloud" },
                        { id: "Cybersecurity", label: "Cybersecurity & CTF" },
                        { id: "Web3", label: "Web3 & Blockchain" },
                        { id: "National Innovation", label: "Smart India (SIH)" },
                        { id: "FinTech", label: "FinTech & Payments" },
                      ].map((d) => (
                        <button
                          key={d.id}
                          onClick={() => setHackathonDomain(d.id)}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all cursor-pointer shrink-0 ${
                            hackathonDomain === d.id
                              ? "bg-cyan-500 text-slate-950 font-bold shadow-xs"
                              : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {isHackathonFilterActive && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleResetHackathonFilters}
                          className="h-7 text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-950/30 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Reset Hackathon Filters
                        </Button>
                      )}

                      {/* Sort Order */}
                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                        <span className="text-slate-400 text-[11px]">Sort:</span>
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as "match" | "newest" | "title")}
                          className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="match">Best Profile Match %</option>
                          <option value="newest">Newest Publication</option>
                          <option value="title">Challenge Title (A-Z)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Location Selector */}
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      <select
                        value={selectedLocation}
                        onChange={(e) => setSelectedLocation(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                      >
                        <option value="All India">🇮🇳 All India</option>
                        <optgroup label="Tamil Nadu Tech Hubs">
                          <option value="Tamil Nadu (All)">Tamil Nadu (All Cities)</option>
                          <option value="Chennai">Chennai, Tamil Nadu</option>
                          <option value="Coimbatore">Coimbatore, Tamil Nadu</option>
                          <option value="Madurai">Madurai, Tamil Nadu</option>
                          <option value="Tiruchirappalli">Tiruchirappalli (Trichy), Tamil Nadu</option>
                          <option value="Salem">Salem, Tamil Nadu</option>
                          <option value="Hosur">Hosur, Tamil Nadu</option>
                          <option value="Tiruppur">Tiruppur, Tamil Nadu</option>
                          <option value="Erode">Erode, Tamil Nadu</option>
                        </optgroup>
                        <optgroup label="Major Indian Tech Metros">
                          <option value="Bengaluru">Bengaluru, Karnataka</option>
                          <option value="Hyderabad">Hyderabad, Telangana</option>
                          <option value="Pune">Pune, Maharashtra</option>
                          <option value="Mumbai">Mumbai, Maharashtra</option>
                          <option value="Delhi">Delhi NCR (Gurugram / Noida)</option>
                        </optgroup>
                        <optgroup label="Remote">
                          <option value="Pan-India Remote">Pan-India Remote</option>
                        </optgroup>
                      </select>
                    </div>

                    {/* Work Mode */}
                    <select
                      value={selectedWorkMode}
                      onChange={(e) => setSelectedWorkMode(e.target.value)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-300 text-xs focus:outline-none"
                    >
                      <option value="All">All Work Modes</option>
                      <option value="Remote">Remote Only</option>
                      <option value="Hybrid">Hybrid</option>
                      <option value="On-site">On-site</option>
                    </select>

                    {/* Matching Skills Toggle */}
                    <button
                      onClick={() => setOnlyMatchingSkills(!onlyMatchingSkills)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                        onlyMatchingSkills
                          ? "bg-emerald-600 text-white border-emerald-500 shadow-xs"
                          : "bg-slate-950 text-emerald-400 hover:text-emerald-300 border-emerald-900/60 hover:bg-emerald-950/40"
                      }`}
                      title="Filter opportunities to only those that share verified matching skills with your profile"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{onlyMatchingSkills ? "Showing Matched Skills Only" : "Filter: Only My Matching Skills"}</span>
                    </button>
                  </div>

                  {/* Sort Order */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as "match" | "newest" | "title")}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none"
                    >
                      <option value="match">Best Profile Match %</option>
                      <option value="newest">Newest Publication</option>
                      <option value="title">Role Title (A-Z)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Opportunities List Grid */}
            {filteredOpportunities.length === 0 ? (
              <EmptyState
                icon={selectedType === "Hackathon" ? Trophy : Briefcase}
                title={
                  selectedType === "Hackathon"
                    ? "No Hackathons Match Selected Filter Criteria"
                    : "No Opportunities Match Selected Filter Criteria"
                }
                description={
                  selectedType === "Hackathon"
                    ? "Try adjusting the format, eligibility, region, or prize filters, or reset filters to view all 27+ live Unstop hackathons."
                    : "Try switching location, clearing search keywords, or clicking 'Sync Live Sources' to query Greenhouse, Lever, and Adzuna."
                }
                actionLabel={
                  selectedType === "Hackathon"
                    ? "Reset Hackathon Filters"
                    : "Reset Location & Filters"
                }
                onAction={() => {
                  if (selectedType === "Hackathon") {
                    handleResetHackathonFilters();
                  } else {
                    setSearchQuery("");
                    setSelectedType("All");
                    setSelectedWorkMode("All");
                    setSelectedLocation("All India");
                    setSourceModeTab("ALL");
                  }
                }}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {paginatedOpportunities.map((opp) => (
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

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-5 rounded-2xl bg-surface border border-border shadow-xs">
                    <p className="text-xs font-medium text-text-muted">
                      Showing{" "}
                      <span className="font-semibold text-text-primary">
                        {(currentPage - 1) * ITEMS_PER_PAGE + 1}
                      </span>{" "}
                      to{" "}
                      <span className="font-semibold text-text-primary">
                        {Math.min(currentPage * ITEMS_PER_PAGE, filteredOpportunities.length)}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-text-primary">
                        {filteredOpportunities.length}
                      </span>{" "}
                      opportunities
                    </p>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => {
                          setCurrentPage((p) => Math.max(1, p - 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="h-8 px-2.5 text-xs rounded-lg cursor-pointer"
                      >
                        <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-1 px-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter((page) => {
                            return (
                              page === 1 ||
                              page === totalPages ||
                              Math.abs(page - currentPage) <= 1
                            );
                          })
                          .reduce<(number | string)[]>((acc, page, idx, arr) => {
                            if (
                              idx > 0 &&
                              typeof arr[idx - 1] === "number" &&
                              (page as number) - (arr[idx - 1] as number) > 1
                            ) {
                              acc.push(`ellipsis-${page}`);
                            }
                            acc.push(page);
                            return acc;
                          }, [])
                          .map((item) => {
                            if (typeof item === "string") {
                              return (
                                <span
                                  key={item}
                                  className="px-1.5 text-xs text-text-muted"
                                >
                                  ...
                                </span>
                              );
                            }
                            const isCurrent = item === currentPage;
                            return (
                              <button
                                key={item}
                                onClick={() => {
                                  setCurrentPage(item);
                                  window.scrollTo({ top: 0, behavior: "smooth" });
                                }}
                                className={`w-8 h-8 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                                  isCurrent
                                    ? "bg-brand text-brand-foreground shadow-xs font-semibold"
                                    : "text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                                }`}
                              >
                                {item}
                              </button>
                            );
                          })}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => {
                          setCurrentPage((p) => Math.min(totalPages, p + 1));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="h-8 px-2.5 text-xs rounded-lg cursor-pointer"
                      >
                        Next
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* Opportunity Detail Modal */}
        <OpportunityDetailModal
          isOpen={Boolean(selectedDetailOpp)}
          onClose={() => setSelectedDetailOpp(null)}
          opportunity={selectedDetailOpp}
          matchResult={selectedMatchResult}
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
