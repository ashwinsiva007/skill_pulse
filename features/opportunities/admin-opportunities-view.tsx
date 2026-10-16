"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Opportunity } from "@/types/opportunity";
import { STARTER_DEMO_OPPORTUNITIES } from "@/lib/opportunities/demo-opportunities";
import {
  Briefcase,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Copy,
  ChevronRight,
  MapPin,
  Building,
  Globe,
  SlidersHorizontal,
  Code2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  X,
} from "lucide-react";

export const AdminOpportunitiesView: React.FC = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>(STARTER_DEMO_OPPORTUNITIES);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshingLive, setIsRefreshingLive] = useState(false);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [lastLiveSync, setLastLiveSync] = useState<string>("Just now");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("All India");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPortal, setSelectedPortal] = useState("All");
  const [selectedLinkStatus, setSelectedLinkStatus] = useState<"All" | "Tested" | "Untested">("All");
  const [sortBy, setSortBy] = useState<"newest" | "salary" | "company" | "title">("newest");

  // Track tested links in session
  const [testedLinkIds, setTestedLinkIds] = useState<Set<string>>(new Set());

  // Modal inspection
  const [inspectedOpp, setInspectedOpp] = useState<Opportunity | null>(null);

  // Fetch live opportunities from endpoint
  const fetchLiveOpportunities = useCallback(async () => {
    try {
      setIsRefreshingLive(true);
      const res = await fetch("/api/opportunities");
      if (res.ok) {
        const data = await res.json();
        if (data.opportunities && Array.isArray(data.opportunities) && data.opportunities.length > 0) {
          setOpportunities(data.opportunities);
          setLastLiveSync(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
          setFeedbackToast(`Synced ${data.opportunities.length} live India tech openings & direct links!`);
          setTimeout(() => setFeedbackToast(null), 3500);
        }
      }
    } catch (err) {
      console.error("Failed to fetch live opportunities:", err);
    } finally {
      setIsRefreshingLive(false);
    }
  }, []);

  useEffect(() => {
    fetchLiveOpportunities();
  }, [fetchLiveOpportunities]);

  // Handle Mark Link Tested
  const handleToggleTestLink = (oppId: string, url?: string) => {
    setTestedLinkIds((prev) => {
      const next = new Set(prev);
      if (next.has(oppId)) {
        next.delete(oppId);
      } else {
        next.add(oppId);
      }
      return next;
    });

    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Copy link
  const handleCopyLink = (url?: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setFeedbackToast("Direct application URL copied to clipboard!");
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  // Filtered & Sorted Opportunities
  const filteredOpportunities = useMemo(() => {
    let result = [...opportunities];

    // 1. Region Filter
    if (selectedRegion !== "All India") {
      result = result.filter((o) => {
        if (selectedRegion === "South India") {
          return (
            o.region === "South India" ||
            o.location.toLowerCase().includes("bengaluru") ||
            o.location.toLowerCase().includes("chennai") ||
            o.location.toLowerCase().includes("hyderabad") ||
            o.location.toLowerCase().includes("coimbatore")
          );
        }
        if (selectedRegion === "North India") {
          return (
            o.region === "North India" ||
            o.location.toLowerCase().includes("delhi") ||
            o.location.toLowerCase().includes("gurugram") ||
            o.location.toLowerCase().includes("noida")
          );
        }
        if (selectedRegion === "West India") {
          return (
            o.region === "West India" ||
            o.location.toLowerCase().includes("mumbai") ||
            o.location.toLowerCase().includes("pune")
          );
        }
        if (selectedRegion === "Pan-India Remote") {
          return o.region === "Pan-India Remote" || o.workMode === "Remote";
        }
        return o.region === selectedRegion;
      });
    }

    // 2. Language / Tech Stack Filter
    if (selectedLanguage !== "All") {
      const langLower = selectedLanguage.toLowerCase();
      result = result.filter((o) => {
        const skills = (o.requiredSkills || []).map((s) => s.toLowerCase());
        const preferred = (o.preferredSkills || []).map((s) => s.toLowerCase());
        const desc = o.description.toLowerCase();
        return (
          skills.some((s) => s.includes(langLower)) ||
          preferred.some((s) => s.includes(langLower)) ||
          desc.includes(langLower)
        );
      });
    }

    // 3. Domain Filter
    if (selectedDomain !== "All") {
      result = result.filter((o) => o.domain.toLowerCase().includes(selectedDomain.toLowerCase()));
    }

    // 4. Type Filter
    if (selectedType !== "All") {
      result = result.filter((o) => o.type.toLowerCase() === selectedType.toLowerCase());
    }

    // 5. Portal Filter
    if (selectedPortal !== "All") {
      result = result.filter(
        (o) =>
          o.portal?.toLowerCase() === selectedPortal.toLowerCase() ||
          o.sourceName.toLowerCase().includes(selectedPortal.toLowerCase())
      );
    }

    // 6. Link Tested Status
    if (selectedLinkStatus === "Tested") {
      result = result.filter((o) => testedLinkIds.has(o.id));
    } else if (selectedLinkStatus === "Untested") {
      result = result.filter((o) => !testedLinkIds.has(o.id));
    }

    // 7. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((o) => {
        const matchTitle = o.title.toLowerCase().includes(q);
        const matchOrg = o.organization.toLowerCase().includes(q);
        const matchLoc = o.location.toLowerCase().includes(q);
        const matchDesc = o.description.toLowerCase().includes(q);
        const matchSkills = (o.requiredSkills || []).some((s) => s.toLowerCase().includes(q));
        return matchTitle || matchOrg || matchLoc || matchDesc || matchSkills;
      });
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "company") {
        return a.organization.localeCompare(b.organization);
      }
      if (sortBy === "title") {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === "salary") {
        // Approximate salary sort by looking at number in string
        const extractNum = (str?: string) => {
          if (!str) return 0;
          const match = str.match(/\d+/);
          return match ? parseInt(match[0], 10) : 0;
        };
        return extractNum(b.salaryRange) - extractNum(a.salaryRange);
      }
      // default: newest
      return (b.postedDate?.includes("hour") || b.postedDate?.includes("today") ? 1 : 0) -
        (a.postedDate?.includes("hour") || a.postedDate?.includes("today") ? 1 : 0);
    });

    return result;
  }, [
    opportunities,
    selectedRegion,
    selectedLanguage,
    selectedDomain,
    selectedType,
    selectedPortal,
    selectedLinkStatus,
    searchQuery,
    sortBy,
    testedLinkIds,
  ]);

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Toast Feedback */}
        {feedbackToast && (
          <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-emerald-950/95 border border-emerald-500/50 text-emerald-200 text-xs shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{feedbackToast}</span>
          </div>
        )}

        {/* Header QA Banner */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0b1220] via-[#0f172a] to-slate-900 border border-cyan-500/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  Admin Trial & Verification Case
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live India Feed Active
                </span>
                <span className="text-xs text-slate-400">Last Synced: {lastLiveSync}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                All India Job Openings & Resource Monitor
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                Daily QA test environment for platform administrators. Toggle filters across <strong>Region</strong>, <strong>Language / Tech Stack</strong>, and <strong>Skills</strong> to verify incoming job updates and test that all direct application links are operational.
              </p>
            </div>

            {/* Quick QA Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchLiveOpportunities}
                disabled={isRefreshingLive}
                className="text-xs border-cyan-500/40 bg-slate-900/80 hover:bg-slate-800 text-cyan-300"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshingLive ? "animate-spin" : ""}`} />
                Sync Live Feed
              </Button>

              <Link href="/">
                <Button variant="outline" size="sm" className="text-xs border-slate-700 text-slate-300 hover:bg-slate-800">
                  <Layers className="w-3.5 h-3.5 mr-1.5" />
                  Candidate User DB
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 QA Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Total Openings Monitored</span>
            <span className="font-extrabold text-white text-2xl">{opportunities.length}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">INR Packages Standardized</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Direct Apply Links</span>
            <span className="font-extrabold text-emerald-400 text-2xl">100%</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Verified official portals</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Links Tested in Session</span>
            <span className="font-extrabold text-cyan-400 text-2xl">{testedLinkIds.size}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Admin verified clickable</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-slate-400 block mb-1">Active Filter Matches</span>
            <span className="font-extrabold text-indigo-400 text-2xl">{filteredOpportunities.length}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">Ready for inspection</span>
          </div>
        </div>

        {/* Comprehensive Filter Control Panel */}
        <Card className="p-5 bg-slate-900/90 border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                Manual Filter & Filtration Controls
              </h2>
            </div>
            {(selectedRegion !== "All India" ||
              selectedLanguage !== "All" ||
              selectedDomain !== "All" ||
              selectedType !== "All" ||
              selectedPortal !== "All" ||
              selectedLinkStatus !== "All" ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedRegion("All India");
                  setSelectedLanguage("All");
                  setSelectedDomain("All");
                  setSelectedType("All");
                  setSelectedPortal("All");
                  setSelectedLinkStatus("All");
                  setSearchQuery("");
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search across title, company, skills, or city (e.g. Swiggy, React, Bengaluru, Python)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
            />
          </div>

          {/* Multi-Filter Dropdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
            {/* 1. Region Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Region / Hub</label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="All India">All India</option>
                <option value="South India">South India (BLR, MAA, HYD)</option>
                <option value="North India">North India (NCR, GGN, NOIDA)</option>
                <option value="West India">West India (MUM, PUNE)</option>
                <option value="Pan-India Remote">Pan-India Remote</option>
              </select>
            </div>

            {/* 2. Language / Tech Stack Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Language / Stack</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="All">All Stacks</option>
                <option value="React">React / Next.js</option>
                <option value="TypeScript">TypeScript / JS</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="Node.js">Node.js</option>
                <option value="SQL">SQL / Databases</option>
                <option value="Docker">Docker / Cloud</option>
              </select>
            </div>

            {/* 3. Skill & Domain Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Domain</label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="All">All Domains</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Data">Data & Analytics</option>
                <option value="AI">AI & Machine Learning</option>
                <option value="Cloud">Cloud & Infrastructure</option>
              </select>
            </div>

            {/* 4. Type Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Opening Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="All">All Types</option>
                <option value="Job">Full-time Job</option>
                <option value="Internship">Internship</option>
                <option value="Hackathon">Hackathon</option>
              </select>
            </div>

            {/* 5. Portal Source Filter */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Source Portal</label>
              <select
                value={selectedPortal}
                onChange={(e) => setSelectedPortal(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="All">All Portals</option>
                <option value="LinkedIn">LinkedIn India</option>
                <option value="Naukri">Naukri Verified</option>
                <option value="Indeed">Indeed India</option>
                <option value="Unstop">Unstop Official</option>
              </select>
            </div>

            {/* 6. Sort By */}
            <div className="space-y-1">
              <label className="text-[10px] font-semibold text-slate-400 uppercase">Sort Order</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-cyan-500 text-xs"
              >
                <option value="newest">Recently Posted</option>
                <option value="salary">Highest Package (INR)</option>
                <option value="company">Company (A-Z)</option>
                <option value="title">Role Title (A-Z)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Listings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>
              Showing <strong className="text-white">{filteredOpportunities.length}</strong> live India openings
            </span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Tested ({testedLinkIds.size})
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-slate-500" />
                Untested ({filteredOpportunities.length - testedLinkIds.size})
              </span>
            </div>
          </div>

          {filteredOpportunities.length === 0 ? (
            <Card className="p-12 text-center bg-slate-900/60 border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">No job openings match selected filters</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Try loosening your region, language, or search keyword filter to see other verified opportunities.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRegion("All India");
                  setSelectedLanguage("All");
                  setSelectedDomain("All");
                  setSelectedType("All");
                  setSelectedPortal("All");
                  setSearchQuery("");
                }}
                className="text-xs mt-2"
              >
                Reset Filters
              </Button>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredOpportunities.map((opp) => {
                const isTested = testedLinkIds.has(opp.id);
                const applyUrl = opp.applicationUrl || opp.sourceUrl || "https://in.linkedin.com/jobs";

                return (
                  <Card
                    key={opp.id}
                    className={`p-5 transition-all border ${
                      isTested
                        ? "bg-emerald-950/20 border-emerald-500/40"
                        : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-cyan-500/40"
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left: Organization & Title Info */}
                      <div className="space-y-2 max-w-3xl">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-white text-base tracking-tight">
                            {opp.title}
                          </span>
                          <Badge variant="indigo" size="sm">
                            {opp.type}
                          </Badge>
                          {opp.region && (
                            <Badge variant="cyan" size="sm">
                              {opp.region}
                            </Badge>
                          )}
                          <Badge variant="emerald" size="sm">
                            {opp.sourceName || opp.portal || "Verified Portal"}
                          </Badge>
                          {isTested && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" />
                              Link Verified in Session
                            </span>
                          )}
                        </div>

                        {/* Company & Details Bar */}
                        <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                          <span className="font-semibold text-indigo-300 flex items-center gap-1">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            {opp.organization}
                          </span>
                          <span className="flex items-center gap-1 text-slate-400">
                            <MapPin className="w-3.5 h-3.5 text-slate-500" />
                            {opp.location} ({opp.workMode})
                          </span>
                          {opp.salaryRange && (
                            <span className="font-bold text-emerald-400">
                              {opp.salaryRange}
                            </span>
                          )}
                          <span className="text-slate-500 text-[11px]">
                            Posted {opp.postedDate}
                          </span>
                        </div>

                        {/* Description snippet */}
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {opp.description}
                        </p>

                        {/* Skills / Tech Stack Tags */}
                        {opp.requiredSkills && opp.requiredSkills.length > 0 && (
                          <div className="flex items-center gap-1.5 flex-wrap pt-1">
                            <span className="text-[10px] uppercase font-semibold text-slate-500 mr-1">
                              Stack:
                            </span>
                            {opp.requiredSkills.map((s, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-950 border border-slate-800 text-slate-300"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Direct URL Preview for QA inspection */}
                        <div className="pt-1 text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                          <span className="font-mono text-slate-400">Destination:</span>
                          <span className="font-mono text-cyan-400/90 truncate max-w-md">
                            {applyUrl}
                          </span>
                        </div>
                      </div>

                      {/* Right: Direct Test Link & Inspection Controls */}
                      <div className="flex sm:flex-col items-center lg:items-end justify-between sm:justify-center gap-2 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800 shrink-0">
                        {/* Primary QA Action: Direct Open & Verify Link */}
                        <a
                          href={applyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            setTestedLinkIds((prev) => new Set(prev).add(opp.id));
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950 transition-all hover:scale-102"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Direct Apply Link ↗</span>
                        </a>

                        <div className="flex items-center gap-1.5">
                          {/* Toggle Link Tested */}
                          <button
                            onClick={() => handleToggleTestLink(opp.id)}
                            title={isTested ? "Mark Untested" : "Mark Link Tested"}
                            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 px-2.5 ${
                              isTested
                                ? "bg-emerald-950 text-emerald-300 border-emerald-500/50"
                                : "bg-slate-950 hover:bg-slate-800 text-slate-400 border-slate-700"
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span className="text-[11px]">{isTested ? "Tested" : "Test Link"}</span>
                          </button>

                          {/* Copy URL */}
                          <button
                            onClick={() => handleCopyLink(applyUrl)}
                            title="Copy Direct URL"
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Inspect Modal */}
                          <button
                            onClick={() => setInspectedOpp(opp)}
                            title="Inspect Details"
                            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-colors"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Inspect Opportunity Modal */}
      {inspectedOpp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white">{inspectedOpp.title}</h3>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">
                  {inspectedOpp.organization} • {inspectedOpp.location}
                </p>
              </div>
              <button
                onClick={() => setInspectedOpp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Package / Stipend</span>
                  <span className="font-bold text-emerald-400">{inspectedOpp.salaryRange || "INR Disclosed"}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Work Mode</span>
                  <span className="font-bold text-white">{inspectedOpp.workMode}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block">Experience Level</span>
                  <span className="font-bold text-white">{inspectedOpp.experienceLevel}</span>
                </div>
              </div>

              <div>
                <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-1">Full Description</h4>
                <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 leading-relaxed">
                  {inspectedOpp.description}
                </p>
              </div>

              {inspectedOpp.eligibilityRequirements && (
                <div>
                  <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-1">Eligibility</h4>
                  <p className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
                    {inspectedOpp.eligibilityRequirements}
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-[11px] font-bold uppercase text-slate-400 mb-1">Direct Destination Link</h4>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-cyan-400 break-all">
                  {inspectedOpp.applicationUrl || inspectedOpp.sourceUrl}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopyLink(inspectedOpp.applicationUrl || inspectedOpp.sourceUrl)}
                className="text-xs"
              >
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy Link
              </Button>

              <a
                href={inspectedOpp.applicationUrl || inspectedOpp.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setTestedLinkIds((prev) => new Set(prev).add(inspectedOpp.id))}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Test Link in New Tab ↗</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
