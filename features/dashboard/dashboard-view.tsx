"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  profileRepo,
  skillRepo,
  resumeRepo,
  roadmapRepo,
  opportunityRepo,
  applicationRepo,
} from "@/lib/repositories";
import { useAuth } from "@/lib/firebase/auth-context";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { ResumeDraft } from "@/types/resume";
import { Opportunity } from "@/types/opportunity";
import { JobApplication } from "@/types/application";
import { DEMO_PROFILE } from "@/lib/demo/seed-data";
import {
  getCareerRoleByTitle,
  CAREER_ROLES_CATALOGUE,
} from "@/lib/career-catalogue/career-catalogue";
import { calculateRoleMatch } from "@/lib/skill-analyzer/matching-engine";
import {
  Sparkles,
  ArrowRight,
  FileText,
  Cpu,
  Briefcase,
  User,
  Compass,
  Trophy,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Kanban,
} from "lucide-react";

export const DashboardView: React.FC = () => {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile>(authProfile || DEMO_PROFILE);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [resumes, setResumes] = useState<ResumeDraft[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authProfile) {
      setProfile(authProfile);
    }
  }, [authProfile]);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [prof, skl, res, opp, apps] = await Promise.all([
        profileRepo.getProfile(),
        skillRepo.getSkills(),
        resumeRepo.getResumes(),
        opportunityRepo.getOpportunities(),
        applicationRepo.getApplications(),
      ]);
      setProfile(prof);
      setSkills(skl);
      setResumes(res);
      setOpportunities(opp);
      setApplications(apps);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Auto pull live opportunities in background
    fetch("/api/opportunities")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.opportunities && data.opportunities.length > 0) {
          setOpportunities(data.opportunities);
        }
      })
      .catch(console.error);
  }, [loadData]);

  // Target role catalogue definition
  const targetRoleDef = useMemo(() => {
    return getCareerRoleByTitle(profile?.targetRole || "") || CAREER_ROLES_CATALOGUE[0];
  }, [profile?.targetRole]);

  // Dynamic role match
  const matchResult = useMemo(() => {
    return calculateRoleMatch(targetRoleDef, profile, skills);
  }, [targetRoleDef, profile, skills]);

  const candidateFirstName = profile?.name?.trim()
    ? profile.name.trim().split(" ")[0]
    : "There";

  const topOpportunities = opportunities.slice(0, 3);
  const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0];

  return (
    <AppLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-16">
        {/* Minimal Hero Welcome Header */}
        <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-[#0f172a] to-slate-900 border border-slate-800 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>SkillPulse AI Career Platform</span>
              </div>
              {user ? (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Firestore Cloud Synced</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Local Mode (Cloud DB Optional)</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Welcome, {candidateFirstName}. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400">
                  Build Your Tech Career With Confidence.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
                SkillPulse gives beginners and jobseekers everything needed to succeed: build recruiter-approved ATS resumes from scratch, bridge skill gaps with open-source roadmaps, and match with verified live jobs, hackathons, and internships.
              </p>
            </div>

            {/* Quick Hero Call-to-Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link href="/resume">
                <Button variant="primary" size="md" className="text-xs font-bold shadow-md shadow-indigo-950">
                  <FileText className="w-4 h-4 mr-2" />
                  Create ATS Resume from Scratch
                </Button>
              </Link>

              <Link href="/opportunities">
                <Button variant="outline" size="md" className="text-xs border-indigo-500/40 text-indigo-200 hover:bg-indigo-950/40">
                  <Briefcase className="w-4 h-4 mr-2 text-cyan-400" />
                  Explore Real Live Opportunities ({opportunities.length})
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 4-Step Beginner Journey Guide (Clear, Step-by-Step Platform Navigation) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <Compass className="w-4 h-4 text-indigo-400" />
                How SkillPulse Works — 4 Easy Steps
              </h2>
              <p className="text-xs text-slate-400">
                A simple, beginner-friendly path to prepare your profile, resume, and apply to opportunities.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1: Profile */}
            <Link href="/profile" className="block group">
              <Card className="p-5 h-full bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3 group-hover:shadow-lg">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Step 1
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Career Profile
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Enter your background, education, and target job track ({profile?.targetRole || "Software Developer"}).
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-400 font-medium">
                  <span>{profile?.profileCompletionPercentage || 0}% Complete</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Step 2: Resume */}
            <Link href="/resume" className="block group">
              <Card className="p-5 h-full bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3 group-hover:shadow-lg">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Step 2
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                      ATS Resume Builder
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Build an ATS resume from scratch with real-time scoring. Download as PDF, TXT, or Markdown.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-cyan-400 font-medium">
                  <span>{resumes.length} Drafts Ready</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Step 3: Skill Enhancer */}
            <Link href="/skills" className="block group">
              <Card className="p-5 h-full bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3 group-hover:shadow-lg">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
                      <Cpu className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Step 3
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors">
                      Skills Enhancer
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Diagnose gaps against open-source developer roadmaps (roadmap.sh) and free learning resources.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-violet-400 font-medium">
                  <span>{skills.length} Tracked Skills</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>

            {/* Step 4: Real Opportunities */}
            <Link href="/opportunities" className="block group">
              <Card className="p-5 h-full bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3 group-hover:shadow-lg">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Step 4
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      Live Opportunities
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Apply directly to live tech jobs, Devpost hackathons, and global internships matching your stack.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-emerald-400 font-medium">
                  <span>{opportunities.length} Live Openings</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Card>
            </Link>
          </div>
        </div>

        {/* Minimal 4-Metric Overview Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 font-medium block">Target Role Alignment</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-white">{matchResult.matchScore}%</span>
              <span className="text-[10px] text-indigo-400 font-medium truncate max-w-[120px]">
                {targetRoleDef.title}
              </span>
            </div>
            <Progress value={matchResult.matchScore} size="sm" className="mt-2" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 font-medium block">Primary Resume ATS Score</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-white">
                {primaryResume ? `${primaryResume.atsScore}%` : "Ready"}
              </span>
              <span className="text-[10px] text-emerald-400 font-medium">
                {resumes.length} Drafts
              </span>
            </div>
            <Progress value={primaryResume?.atsScore || 85} size="sm" className="mt-2" />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 font-medium block">Tracked Skills</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-white">{skills.length}</span>
              <Link href="/skills" className="text-[10px] text-indigo-400 hover:underline">
                View Gaps →
              </Link>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
              <span className="text-emerald-400">✓ {matchResult.matchedSkills.length} Core</span>
              <span>·</span>
              <span className="text-amber-400">{matchResult.missingSkills.length} to learn</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs">
            <span className="text-[11px] text-slate-400 font-medium block">Live Real Opportunities</span>
            <div className="flex items-baseline justify-between mt-1.5">
              <span className="text-2xl font-extrabold text-emerald-400">{opportunities.length}</span>
              <span className="text-[10px] text-slate-400">
                {applications.length} In Tracker
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Real-time feeds active</span>
            </div>
          </div>
        </div>

        {/* Focused Two-Section Row: Quick Action Launchpad + Live Opportunities Radar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 6 cols: Next Best Action Card */}
          <div className="lg:col-span-6">
            <Card className="p-6 h-full bg-slate-900/80 border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    Recommended Next Action
                  </h3>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {resumes.length === 0
                    ? `Create your first tailored ATS resume for ${targetRoleDef.title}. Our builder guides you step-by-step through contact info, bullet points, skills, and downloads.`
                    : `Your primary resume targeting ${targetRoleDef.title} is ready. Review missing skill gaps against open-source roadmaps or apply directly to verified live openings.`}
                </p>

                <div className="mt-4 p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                  <span className="font-semibold text-slate-200 block text-[11px]">
                    Quick Platform Shortcuts:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/resume"
                      className="p-2 rounded-lg bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <FileText className="w-3 h-3 text-indigo-400 shrink-0" />
                      <span>Resume Builder</span>
                    </Link>
                    <Link
                      href="/skills"
                      className="p-2 rounded-lg bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Cpu className="w-3 h-3 text-violet-400 shrink-0" />
                      <span>Skills Enhancer</span>
                    </Link>
                    <Link
                      href="/opportunities"
                      className="p-2 rounded-lg bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Briefcase className="w-3 h-3 text-emerald-400 shrink-0" />
                      <span>Live Opportunities</span>
                    </Link>
                    <Link
                      href="/tracker"
                      className="p-2 rounded-lg bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-[11px] text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                    >
                      <Kanban className="w-3 h-3 text-teal-400 shrink-0" />
                      <span>Kanban Tracker</span>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">Everything accessible via sidebar</span>
                <Link href="/resume">
                  <Button variant="primary" size="sm" className="text-xs font-semibold">
                    Open Resume Builder
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>

          {/* Right 6 cols: Live Real Opportunities Spotlight */}
          <div className="lg:col-span-6">
            <Card className="p-6 h-full bg-slate-900/80 border-slate-800 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-tight">
                        Live Opportunities Radar
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Verified open vacancies & hackathons
                      </span>
                    </div>
                  </div>

                  <Link href="/opportunities">
                    <Button variant="ghost" size="sm" className="text-xs text-indigo-400 hover:text-white">
                      View All ({opportunities.length}) →
                    </Button>
                  </Link>
                </div>

                <div className="space-y-2.5 mt-3">
                  {topOpportunities.map((opp) => (
                    <div
                      key={opp.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="overflow-hidden space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white truncate max-w-[220px]">
                            {opp.title}
                          </span>
                          <Badge
                            variant={
                              opp.type === "Hackathon"
                                ? "cyan"
                                : opp.type === "Internship"
                                ? "emerald"
                                : "indigo"
                            }
                            size="sm"
                            className="text-[9px]"
                          >
                            {opp.type}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {opp.organization} · {opp.location}
                        </p>
                      </div>

                      <a
                        href={opp.applicationUrl || opp.sourceUrl || "https://devpost.com"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-[11px] h-7 px-2 border-indigo-500/30 text-indigo-300 hover:bg-indigo-950/40"
                        >
                          Apply ↗
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                <span>Real-time feeds: Devpost, Arbeitnow, Jobicy</span>
                <Link href="/opportunities" className="text-indigo-400 hover:underline">
                  Filter by role & skills →
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
