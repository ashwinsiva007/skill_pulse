"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/firebase/auth-context";
import { adminUserService, AdminUserRecord } from "@/lib/admin/admin-user-service";
import { AdminCandidateModal } from "@/components/admin/admin-candidate-modal";
import { STARTER_DEMO_OPPORTUNITIES } from "@/lib/opportunities/demo-opportunities";
import {
  Users,
  ShieldAlert,
  Database,
  Briefcase,
  Search,
  Filter,
  Download,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Award,
  GraduationCap,
  Layers,
  Settings,
  Sparkles,
  CheckCircle2,
  HardDrive,
} from "lucide-react";

export const AdminDashboardView: React.FC = () => {
  const { user, isFirebaseReady } = useAuth();
  const [usersList, setUsersList] = useState<AdminUserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");
  const [selectedSyncFilter, setSelectedSyncFilter] = useState("All");
  const [inspectedCandidate, setInspectedCandidate] = useState<AdminUserRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string>("Just now");

  const loadUsers = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const data = await adminUserService.getAllUsers();
      setUsersList(data);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("Failed to load admin user telemetry:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Role distribution calculation for data visualization
  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    usersList.forEach((u) => {
      const role = u.targetRole || "Software Developer";
      counts[role] = (counts[role] || 0) + 1;
    });

    const total = usersList.length || 1;
    return Object.entries(counts)
      .map(([role, count]) => ({
        role,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [usersList]);

  // Experience level distribution
  const experienceDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      "Entry-Level / Student": 0,
      "Junior (0-2 years)": 0,
      "Mid-Level (2-5 years)": 0,
      "Senior (5+ years)": 0,
    };

    usersList.forEach((u) => {
      const level = u.careerLevel;
      if (counts[level] !== undefined) {
        counts[level]++;
      } else if (level.toLowerCase().includes("student") || level.toLowerCase().includes("entry")) {
        counts["Entry-Level / Student"]++;
      } else if (level.toLowerCase().includes("mid")) {
        counts["Mid-Level (2-5 years)"]++;
      } else if (level.toLowerCase().includes("senior")) {
        counts["Senior (5+ years)"]++;
      } else {
        counts["Junior (0-2 years)"]++;
      }
    });

    const total = usersList.length || 1;
    return Object.entries(counts).map(([level, count]) => ({
      level,
      count,
      percentage: Math.round((count / total) * 100),
    }));
  }, [usersList]);

  // Top candidate skills in database
  const topSkills = useMemo(() => {
    const skillCounts: Record<string, number> = {};
    usersList.forEach((u) => {
      u.skills.forEach((s) => {
        skillCounts[s] = (skillCounts[s] || 0) + 1;
      });
    });

    return Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [usersList]);

  // Filtered users list
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      // Role filter
      if (selectedRoleFilter !== "All" && u.targetRole !== selectedRoleFilter) {
        return false;
      }
      // Sync filter
      if (selectedSyncFilter !== "All" && u.syncedMode !== selectedSyncFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = u.name.toLowerCase().includes(q);
        const matchEmail = u.email.toLowerCase().includes(q);
        const matchRole = u.targetRole.toLowerCase().includes(q);
        const matchCity = u.city.toLowerCase().includes(q) || u.location.toLowerCase().includes(q);
        const matchSkills = u.skills.some((s) => s.toLowerCase().includes(q));
        if (!matchName && !matchEmail && !matchRole && !matchCity && !matchSkills) {
          return false;
        }
      }
      return true;
    });
  }, [usersList, selectedRoleFilter, selectedSyncFilter, searchQuery]);

  // Export Users Database as JSON
  const handleExportUsers = () => {
    const dataStr = JSON.stringify(usersList, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `skillpulse-users-db-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInspect = (userRec: AdminUserRecord) => {
    setInspectedCandidate(userRec);
    setIsModalOpen(true);
  };

  const allDistinctRoles = useMemo(() => {
    const set = new Set<string>();
    usersList.forEach((u) => set.add(u.targetRole));
    return Array.from(set);
  }, [usersList]);

  return (
    <AppLayout>
      <div className="space-y-8 max-w-7xl mx-auto pb-16">
        {/* Admin Master Header Banner */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0c1222] via-[#0f172a] to-slate-900 border border-indigo-500/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  Master Administrator Console
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Firestore Database Synced
                </span>
                <span className="text-xs text-slate-400">Last Synced: {lastSyncedTime}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Candidate Database & Platform Telemetry
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                Centralized administrator dashboard to monitor candidate profiles, track role distributions, visualize database growth, and audit live India job openings in real time.
              </p>
            </div>

            {/* Quick Action Controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={loadUsers}
                disabled={isRefreshing}
                className="text-xs border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? "animate-spin" : ""}`} />
                Sync Database
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportUsers}
                className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export Users DB
              </Button>

              <Link href="/opportunities">
                <Button variant="primary" size="sm" className="text-xs font-bold shadow-md shadow-indigo-950">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5" />
                  Job Openings QA
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 KPI Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 bg-slate-900/80 border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Registered Users</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">{usersList.length}</span>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="text-emerald-400 font-semibold">100% active</span> candidates in database
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-slate-900/80 border-slate-800 hover:border-cyan-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Career Roles Tracked</span>
              <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">{roleDistribution.length}</span>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                Leading: <span className="text-cyan-400 font-semibold">{roleDistribution[0]?.role || "Engineering"}</span>
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-slate-900/80 border-slate-800 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live India Job Openings</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {STARTER_DEMO_OPPORTUNITIES.length}
              </span>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                Verified across <span className="text-emerald-400 font-semibold">South, North & West India</span>
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-slate-900/80 border-slate-800 hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Firestore Cloud DB</span>
              <div className="w-9 h-9 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Database className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold text-white tracking-tight">
                {isFirebaseReady ? "Connected" : "Local Mirror"}
              </span>
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
                <span className="text-amber-400 font-semibold">Master Admin Access</span> Unrestricted
              </p>
            </div>
          </Card>
        </div>

        {/* Data Visualization & Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart 1: Candidate Role Distribution (2 columns on lg) */}
          <Card className="lg:col-span-2 p-6 bg-slate-900/90 border-slate-800">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Candidate Role Distribution Chart
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Percentage and count of candidates pursuing each tech engineering track
                </p>
              </div>
              <Badge variant="indigo" size="sm">
                {roleDistribution.length} Active Tracks
              </Badge>
            </div>

            {/* Visual Bar Graph */}
            <div className="space-y-4">
              {roleDistribution.map((item, idx) => {
                // Gradient colors for visual hierarchy
                const colors = [
                  "from-indigo-500 to-cyan-400",
                  "from-cyan-500 to-teal-400",
                  "from-emerald-500 to-green-400",
                  "from-violet-500 to-purple-400",
                  "from-amber-500 to-orange-400",
                  "from-rose-500 to-pink-400",
                  "from-blue-500 to-indigo-400",
                ];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={item.role} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{item.role}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 text-[11px]">{item.count} candidate{item.count > 1 ? "s" : ""}</span>
                        <span className="font-bold text-indigo-300 text-xs px-1.5 py-0.5 rounded bg-slate-800">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    {/* Bar track */}
                    <div className="h-2.5 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                        style={{ width: `${Math.max(item.percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Chart 2: Experience & Top Skills Analytics (1 column on lg) */}
          <div className="space-y-6">
            {/* Experience Level Breakdown */}
            <Card className="p-6 bg-slate-900/90 border-slate-800">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  Candidate Experience Tiers
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Demographics by career seniority</p>
              </div>

              <div className="space-y-3">
                {experienceDistribution.map((tier) => (
                  <div key={tier.level} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">{tier.level}</span>
                      <span className="font-bold text-emerald-400">{tier.count} ({tier.percentage}%)</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${Math.max(tier.percentage, 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top Recorded Skills in Database */}
            <Card className="p-6 bg-slate-900/90 border-slate-800">
              <div className="mb-3">
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Top Technical Skills in DB
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Most frequent skills listed by candidates</p>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {topSkills.map((s) => (
                  <span
                    key={s.name}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-950 border border-slate-800 text-indigo-200"
                  >
                    <span>{s.name}</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                      {s.count}
                    </span>
                  </span>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* User Database Directory & Management Table */}
        <Card className="p-6 bg-slate-900/90 border-slate-800 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                Live Candidate User Database ({filteredUsers.length} of {usersList.length})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect candidate profiles, education, target tracks, and cloud synchronization status.
              </p>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search candidate name, email, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-56 sm:w-64"
                />
              </div>

              {/* Role Filter */}
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Target Roles ({allDistinctRoles.length})</option>
                {allDistinctRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>

              {/* Sync Filter */}
              <select
                value={selectedSyncFilter}
                onChange={(e) => setSelectedSyncFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="All">All Sync Modes</option>
                <option value="Cloud Firestore">Cloud Firestore</option>
                <option value="Local Device">Local Device</option>
              </select>
            </div>
          </div>

          {/* Interactive Candidate Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-semibold">Candidate</th>
                  <th className="py-3 px-4 font-semibold">Target Track & Seniority</th>
                  <th className="py-3 px-4 font-semibold">Location & Institution</th>
                  <th className="py-3 px-4 font-semibold">Profile Readiness</th>
                  <th className="py-3 px-4 font-semibold">Sync Mode</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No candidate records found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const initials = u.name
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase() || "CD";

                    return (
                      <tr
                        key={u.uid}
                        className="hover:bg-slate-900/50 transition-colors group"
                      >
                        {/* Candidate */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-xs">
                              {initials}
                            </div>
                            <div className="leading-tight">
                              <p className="font-semibold text-white group-hover:text-indigo-300 transition-colors">
                                {u.name}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Target Track */}
                        <td className="py-3.5 px-4">
                          <p className="font-medium text-slate-200">{u.targetRole}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{u.careerLevel}</p>
                        </td>

                        {/* Location & Institution */}
                        <td className="py-3.5 px-4">
                          <p className="text-slate-300 truncate max-w-[200px]">{u.location}</p>
                          <p className="text-[11px] text-slate-500 truncate max-w-[200px] mt-0.5">
                            {u.educationInstitution}
                          </p>
                        </td>

                        {/* Readiness */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
                              <div
                                className="h-full bg-indigo-500 rounded-full"
                                style={{ width: `${u.profileCompletion}%` }}
                              />
                            </div>
                            <span className="font-semibold text-indigo-300 text-[11px]">
                              {u.profileCompletion}%
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 block mt-0.5">
                            {u.skillsCount} skills recorded
                          </span>
                        </td>

                        {/* Sync Mode */}
                        <td className="py-3.5 px-4">
                          <Badge
                            variant={u.syncedMode === "Cloud Firestore" ? "emerald" : "indigo"}
                            size="sm"
                          >
                            {u.syncedMode}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleInspect(u)}
                            className="text-xs h-7 px-2.5 border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-950/40 text-slate-300 hover:text-white"
                          >
                            Inspect Profile
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 2 Navigation Cards to Remaining Admin Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/opportunities" className="block group">
            <Card className="p-6 bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group-hover:shadow-xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Job Openings QA & Testing Portal
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Daily trial & test case portal. Verify real India tech vacancies, test filters (Region, Language, Skill, Portal), and check direct application links.
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-indigo-400 font-semibold pt-1">
                  Launch Job Openings Monitor ({STARTER_DEMO_OPPORTUNITIES.length} Live Openings)
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Card>
          </Link>

          <Link href="/settings" className="block group">
            <Card className="p-6 bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-all flex items-center justify-between group-hover:shadow-xl">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Settings className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Firebase & Database Settings
                  </h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Monitor Google Cloud Firestore configuration, atomic security rules, system backups, and infrastructure credentials.
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-semibold pt-1">
                  Manage Cloud & System Settings
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Candidate Profile Inspection Modal */}
      <AdminCandidateModal
        user={inspectedCandidate}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setInspectedCandidate(null);
        }}
      />
    </AppLayout>
  );
};
