"use client";

import React, { useState, useEffect } from "react";
import { AdminUserRecord, adminUserService, UserSubcollections } from "@/lib/admin/admin-user-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Database,
  User,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Calendar,
  Layers,
  CheckCircle2,
  Copy,
  FileText,
  Clock,
  Globe,
  Sparkles,
  Sliders,
  ChevronRight,
  ShieldCheck,
  FolderGit2,
} from "lucide-react";

interface AdminCandidateModalProps {
  user: AdminUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

type TabKey =
  | "overview"
  | "education"
  | "projects"
  | "experience"
  | "certifications"
  | "skills"
  | "schema";

export const AdminCandidateModal: React.FC<AdminCandidateModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [subcollections, setSubcollections] = useState<UserSubcollections>({
    resumes: [],
    skills: [],
    applications: [],
  });
  const [isLoadingSubcollections, setIsLoadingSubcollections] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  // Load candidate's live Firestore subcollections when opened
  useEffect(() => {
    if (user?.uid && isOpen) {
      setIsLoadingSubcollections(true);
      adminUserService
        .getUserSubcollections(user.uid)
        .then((data) => setSubcollections(data))
        .catch((err) => console.warn("Failed to load user subcollections:", err))
        .finally(() => setIsLoadingSubcollections(false));
    }
  }, [user?.uid, isOpen]);

  // Reset tab when user changes
  useEffect(() => {
    if (isOpen) {
      setActiveTab("overview");
    }
  }, [user?.uid, isOpen]);

  if (!isOpen || !user) return null;

  const p = user.rawProfile;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedNotification(null), 2500);
  };

  const eduCount = p.education?.length || 0;
  const projCount = p.projects?.length || 0;
  const expCount = p.experience?.length || 0;
  const certCount =
    (p.certifications?.length || 0) +
    (p.courses?.length || 0) +
    (p.hackathons?.length || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col rounded-2xl bg-[#0b1120] border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100">
        {/* Copy Notification Toast */}
        {copiedNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{copiedNotification}</span>
          </div>
        )}

        {/* Master Inspector Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg shrink-0">
              {user.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "CD"}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {user.name}
                </h2>
                <Badge
                  variant={user.syncedMode === "Cloud Firestore" ? "emerald" : "indigo"}
                  size="sm"
                >
                  <Database className="w-3 h-3 mr-1" />
                  {user.syncedMode}
                </Badge>
                <Badge variant="cyan" size="sm">
                  {user.profileCompletion}% Profile Ready
                </Badge>
                <Badge variant="indigo" size="sm">
                  Readiness: {user.readinessScore}/100
                </Badge>
              </div>

              <p className="text-xs text-indigo-300 font-medium">
                {user.headline || user.targetRole} • {user.careerLevel}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap pt-0.5">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {user.email}
                </span>
                {p.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {p.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {user.location}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  UID: {user.uid}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleCopy(user.uid, "User ID")}
              className="text-xs border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
            >
              <Copy className="w-3.5 h-3.5 mr-1" />
              Copy UID
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Database Sections Tab Navigation Bar */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-800/90 bg-slate-950/50 overflow-x-auto scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "overview"
                ? "border-indigo-500 text-white bg-indigo-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Overview & Personal DB</span>
          </button>

          <button
            onClick={() => setActiveTab("education")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "education"
                ? "border-cyan-500 text-white bg-cyan-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Education DB</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {eduCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("projects")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "projects"
                ? "border-emerald-500 text-white bg-emerald-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Projects DB</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {projCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("experience")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "experience"
                ? "border-amber-500 text-white bg-amber-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Experience DB</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {expCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("certifications")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "certifications"
                ? "border-purple-500 text-white bg-purple-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Certifications & Courses</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {certCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("skills")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "skills"
                ? "border-indigo-500 text-white bg-indigo-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Skills & Subcollections</span>
          </button>

          <button
            onClick={() => setActiveTab("schema")}
            className={`py-3 px-3.5 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "schema"
                ? "border-rose-500 text-white bg-rose-500/10"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Firestore Document Schema</span>
          </button>
        </div>

        {/* Tab Body: In-Website Database Inspector */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW & PERSONAL */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Bio / Summary */}
              {p.bio ? (
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    Candidate Bio / Summary
                  </h3>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200 leading-relaxed">
                    {p.bio}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 italic">
                  No personal bio statement entered by candidate yet.
                </div>
              )}

              {/* Complete Personal & Account Data Columns Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-cyan-400" />
                  Candidate Account & Personal Database Columns
                </h3>
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-4 font-semibold w-1/3">Column Name</th>
                        <th className="py-2.5 px-4 font-semibold w-2/3">Database Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">User ID (UID)</td>
                        <td className="py-2.5 px-4 text-cyan-300">{user.uid}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Full Name</td>
                        <td className="py-2.5 px-4 text-white font-sans font-semibold">{user.name}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Registered Email</td>
                        <td className="py-2.5 px-4 text-indigo-300">{user.email}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Contact Phone</td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">{p.phone || "Not provided"}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Headline</td>
                        <td className="py-2.5 px-4 text-slate-200 font-sans">{p.headline || "—"}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Current Role</td>
                        <td className="py-2.5 px-4 text-slate-200 font-sans">{p.currentRole || "—"}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Target Role Track</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-sans font-medium">{user.targetRole}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Career Seniority Level</td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">{user.careerLevel}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Years of Experience</td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">{p.yearsOfExperience ?? 0} Years</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Location / City / State / Country</td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">
                          {[p.city, p.state, p.country].filter(Boolean).join(", ") || user.location || "India"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Workplace Preference</td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">
                          {p.preferences?.workplacePreference || "Flexible"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Availability</td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">{p.availability || "Immediate"}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Target Industry</td>
                        <td className="py-2.5 px-4 text-slate-300 font-sans">{p.targetIndustry || "Technology"}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Profile Completion</td>
                        <td className="py-2.5 px-4 text-cyan-400 font-sans">{user.profileCompletion}%</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Career Readiness Index</td>
                        <td className="py-2.5 px-4 text-emerald-400 font-sans">{user.readinessScore} / 100</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">Sync Mode & Timestamp</td>
                        <td className="py-2.5 px-4 text-slate-400 font-sans">
                          {user.syncedMode} • {p.updatedAt || user.lastActive}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Verified Online Links */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  Connected Web Profiles & Links
                </h3>
                <div className="flex items-center gap-2.5 flex-wrap">
                  {p.linkedInUrl && (
                    <a
                      href={p.linkedInUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-indigo-300 border border-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>LinkedIn: {p.linkedInUrl}</span>
                    </a>
                  )}
                  {p.githubUrl && (
                    <a
                      href={p.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-slate-200 border border-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>GitHub: {p.githubUrl}</span>
                    </a>
                  )}
                  {p.leetcodeUrl && (
                    <a
                      href={p.leetcodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-amber-300 border border-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>LeetCode: {p.leetcodeUrl}</span>
                    </a>
                  )}
                  {p.portfolioUrl && (
                    <a
                      href={p.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs text-emerald-300 border border-slate-700 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Portfolio: {p.portfolioUrl}</span>
                    </a>
                  )}
                  {!p.linkedInUrl && !p.githubUrl && !p.leetcodeUrl && !p.portfolioUrl && (
                    <span className="text-xs text-slate-500 italic">No web links recorded.</span>
                  )}
                </div>
              </div>

              {/* Developer Intelligence & Coding Footprint (GitHub & LeetCode) */}
              {p.codingProfilesData && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    Automated Developer Intelligence & Activity
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {p.codingProfilesData.github && (
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                            <FolderGit2 className="w-3.5 h-3.5 text-slate-300" />
                            GitHub Analytics (@{p.codingProfilesData.github.username})
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 font-medium">
                            {p.codingProfilesData.github.codingFrequency}
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                            <div className="text-white font-bold">{p.codingProfilesData.github.publicRepos}</div>
                            <div className="text-[10px] text-slate-400">Public Repos</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                            <div className="text-amber-300 font-bold">{p.codingProfilesData.github.totalStars}</div>
                            <div className="text-[10px] text-slate-400">Stars Earned</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                            <div className="text-indigo-300 font-bold">{p.codingProfilesData.github.followers}</div>
                            <div className="text-[10px] text-slate-400">Followers</div>
                          </div>
                        </div>
                        {p.codingProfilesData.github.topLanguages && p.codingProfilesData.github.topLanguages.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap pt-1">
                            <span className="text-[10px] text-slate-400">Stack:</span>
                            {p.codingProfilesData.github.topLanguages.map((lang) => (
                              <span key={lang.language} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {lang.language}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {p.codingProfilesData.leetcode && (
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-white flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-amber-400" />
                            LeetCode Analytics (@{p.codingProfilesData.leetcode.username})
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
                            {p.codingProfilesData.leetcode.ranking ? `Rank #${p.codingProfilesData.leetcode.ranking.toLocaleString()}` : "Active Solver"}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-center text-xs">
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                            <div className="text-white font-bold">{p.codingProfilesData.leetcode.totalSolved}</div>
                            <div className="text-[9px] text-slate-400">Total</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                            <div className="text-emerald-400 font-bold">{p.codingProfilesData.leetcode.easySolved}</div>
                            <div className="text-[9px] text-slate-400">Easy</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                            <div className="text-amber-400 font-bold">{p.codingProfilesData.leetcode.mediumSolved}</div>
                            <div className="text-[9px] text-slate-400">Medium</div>
                          </div>
                          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                            <div className="text-rose-400 font-bold">{p.codingProfilesData.leetcode.hardSolved}</div>
                            <div className="text-[9px] text-slate-400">Hard</div>
                          </div>
                        </div>
                        {p.codingProfilesData.leetcode.acceptanceRate && (
                          <div className="text-[10px] text-slate-400 text-right">
                            Acceptance Rate: <span className="text-slate-200 font-semibold">{p.codingProfilesData.leetcode.acceptanceRate}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: EDUCATION DB */}
          {activeTab === "education" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-cyan-400" />
                    Candidate Education Database Records ({eduCount})
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Academic institutions, degrees, major specializations, and CGPA recorded in database.
                  </p>
                </div>
              </div>

              {p.education && p.education.length > 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4 font-semibold">Institution</th>
                        <th className="py-3 px-4 font-semibold">Degree</th>
                        <th className="py-3 px-4 font-semibold">Specialization</th>
                        <th className="py-3 px-4 font-semibold">Years</th>
                        <th className="py-3 px-4 font-semibold">Semester / Year</th>
                        <th className="py-3 px-4 font-semibold">GPA / Score</th>
                        <th className="py-3 px-4 font-semibold">Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {p.education.map((edu) => (
                        <tr key={edu.id} className="hover:bg-slate-900/40">
                          <td className="py-3 px-4 font-semibold text-white">
                            {edu.institution}
                          </td>
                          <td className="py-3 px-4 text-cyan-300">{edu.degree}</td>
                          <td className="py-3 px-4 text-slate-300">
                            {edu.specialization || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                            {edu.startYear} – {edu.expectedGraduationYear}
                          </td>
                          <td className="py-3 px-4 text-slate-300">
                            {edu.yearOrSemester || "—"}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                            {edu.gpa || "—"}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {edu.location || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
                  No academic education entries recorded in the candidate database.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PROJECTS DB */}
          {activeTab === "projects" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  Candidate Projects Database ({projCount})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Portfolio projects, architecture problems solved, and tech stacks employed.
                </p>
              </div>

              {p.projects && p.projects.length > 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4 font-semibold w-1/4">Project Name & Status</th>
                        <th className="py-3 px-4 font-semibold w-1/4">Tech Stack</th>
                        <th className="py-3 px-4 font-semibold w-1/3">Description & Impact</th>
                        <th className="py-3 px-4 font-semibold w-1/6 text-right">Links</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {p.projects.map((proj) => (
                        <tr key={proj.id} className="hover:bg-slate-900/40">
                          <td className="py-3.5 px-4 align-top">
                            <p className="font-semibold text-white">{proj.title}</p>
                            <div className="mt-1">
                              <Badge
                                variant={
                                  proj.status === "Completed"
                                    ? "emerald"
                                    : proj.status === "In Progress"
                                    ? "cyan"
                                    : "indigo"
                                }
                                size="sm"
                              >
                                {proj.status}
                              </Badge>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="flex flex-wrap gap-1">
                              {(proj.technologies || []).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-indigo-300 font-mono"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top text-slate-300 space-y-1">
                            <p className="leading-relaxed">{proj.description}</p>
                            {proj.problem && (
                              <p className="text-[11px] text-slate-400 italic">
                                Problem: {proj.problem}
                              </p>
                            )}
                            {proj.personalContribution && (
                              <p className="text-[11px] text-cyan-300/90">
                                Role: {proj.personalContribution}
                              </p>
                            )}
                          </td>

                          <td className="py-3.5 px-4 align-top text-right space-y-1">
                            {proj.demoUrl && (
                              <a
                                href={proj.demoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:underline block"
                              >
                                <ExternalLink className="w-3 h-3" />
                                Demo
                              </a>
                            )}
                            {proj.githubUrl && (
                              <a
                                href={proj.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:underline block"
                              >
                                <FolderGit2 className="w-3 h-3" />
                                GitHub
                              </a>
                            )}
                            {!proj.demoUrl && !proj.githubUrl && (
                              <span className="text-[11px] text-slate-500">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
                  No project entries recorded in candidate database.
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXPERIENCE DB */}
          {activeTab === "experience" && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  Candidate Experience & Work History Database ({expCount})
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Industry internships, full-time positions, and responsibilities recorded.
                </p>
              </div>

              {p.experience && p.experience.length > 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider">
                        <th className="py-3 px-4 font-semibold">Company</th>
                        <th className="py-3 px-4 font-semibold">Role & Type</th>
                        <th className="py-3 px-4 font-semibold">Duration / Dates</th>
                        <th className="py-3 px-4 font-semibold">Location</th>
                        <th className="py-3 px-4 font-semibold">Responsibilities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {p.experience.map((exp) => (
                        <tr key={exp.id} className="hover:bg-slate-900/40">
                          <td className="py-3.5 px-4 font-bold text-white align-top">
                            {exp.company}
                          </td>
                          <td className="py-3.5 px-4 align-top">
                            <p className="font-semibold text-slate-200">{exp.role}</p>
                            <Badge variant="indigo" size="sm" className="mt-1">
                              {exp.type}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px] align-top">
                            {exp.startDate} – {exp.endDate || (exp.isCurrent ? "Present" : "End")}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 align-top">
                            {exp.location || "India"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 align-top leading-relaxed max-w-md">
                            {exp.responsibilities}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 rounded-xl bg-slate-950 border border-slate-800 text-center text-slate-500 text-xs">
                  No work experience or internship entries recorded in database.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CERTIFICATIONS, COURSES & HACKATHONS */}
          {activeTab === "certifications" && (
            <div className="space-y-6">
              {/* Certifications Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-400" />
                  Verified Certifications ({p.certifications?.length || 0})
                </h3>
                {p.certifications && p.certifications.length > 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 px-4 font-semibold">Certificate Name</th>
                          <th className="py-2.5 px-4 font-semibold">Issuing Body</th>
                          <th className="py-2.5 px-4 font-semibold">Issue Date</th>
                          <th className="py-2.5 px-4 font-semibold">Credential ID</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Verification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {p.certifications.map((c) => (
                          <tr key={c.id} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-4 font-semibold text-white">{c.name}</td>
                            <td className="py-2.5 px-4 text-slate-300">{c.issuer}</td>
                            <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{c.issueDate}</td>
                            <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{c.credentialId || "—"}</td>
                            <td className="py-2.5 px-4 text-right">
                              {c.credentialUrl ? (
                                <a
                                  href={c.credentialUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-indigo-400 hover:underline inline-flex items-center gap-1"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  Verify
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    No certifications recorded.
                  </p>
                )}
              </div>

              {/* Courses Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                  Completed Courses ({p.courses?.length || 0})
                </h3>
                {p.courses && p.courses.length > 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 px-4 font-semibold">Course Title</th>
                          <th className="py-2.5 px-4 font-semibold">Platform</th>
                          <th className="py-2.5 px-4 font-semibold">Completion Date</th>
                          <th className="py-2.5 px-4 font-semibold text-right">Link</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {p.courses.map((cr) => (
                          <tr key={cr.id} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-4 font-semibold text-white">{cr.title}</td>
                            <td className="py-2.5 px-4 text-slate-300">{cr.platform}</td>
                            <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{cr.completionDate}</td>
                            <td className="py-2.5 px-4 text-right">
                              {cr.certificateUrl ? (
                                <a
                                  href={cr.certificateUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:underline"
                                >
                                  View Certificate
                                </a>
                              ) : (
                                "—"
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    No coursework entries recorded.
                  </p>
                )}
              </div>

              {/* Hackathons Table */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Hackathons & Competitions ({p.hackathons?.length || 0})
                </h3>
                {p.hackathons && p.hackathons.length > 0 ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/80 overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase text-[10px] tracking-wider">
                          <th className="py-2.5 px-4 font-semibold">Event Name</th>
                          <th className="py-2.5 px-4 font-semibold">Project Title</th>
                          <th className="py-2.5 px-4 font-semibold">Result / Standing</th>
                          <th className="py-2.5 px-4 font-semibold">Year</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {p.hackathons.map((h) => (
                          <tr key={h.id} className="hover:bg-slate-900/40">
                            <td className="py-2.5 px-4 font-semibold text-white">{h.eventName}</td>
                            <td className="py-2.5 px-4 text-indigo-300">{h.projectTitle}</td>
                            <td className="py-2.5 px-4 text-emerald-400 font-bold">{h.result}</td>
                            <td className="py-2.5 px-4 text-slate-400 font-mono text-[11px]">{h.year}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                    No hackathons recorded.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* TAB 6: SKILLS & SUBCOLLECTIONS */}
          {activeTab === "skills" && (
            <div className="space-y-6">
              {/* Technical Skills from Profile & Projects */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Primary Recorded Technical Skills ({user.skills.length})
                </h3>
                <div className="flex flex-wrap gap-1.5 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  {user.skills.length > 0 ? (
                    user.skills.map((s, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900 text-indigo-200 border border-slate-700/80"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">No specific skills indexed.</span>
                  )}
                </div>
              </div>

              {/* Technologies of Interest (Preferences) */}
              {p.preferences?.technologiesOfInterest && p.preferences.technologiesOfInterest.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Technologies of Interest (Target Track)
                  </h3>
                  <div className="flex flex-wrap gap-1.5 p-4 rounded-xl bg-slate-950 border border-slate-800">
                    {p.preferences.technologiesOfInterest.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-cyan-950/60 text-cyan-200 border border-cyan-800"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Cloud Firestore Subcollections */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  Live Firestore Subcollections (/users/{user.uid}/*)
                </h3>

                {isLoadingSubcollections ? (
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center text-xs text-slate-400 animate-pulse">
                    Querying live Firestore subcollections...
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    {/* Resumes */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block">Created Resumes</span>
                      <span className="text-lg font-bold text-white">
                        {subcollections.resumes.length}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Saved resume drafts
                      </span>
                    </div>

                    {/* Skills Matrix */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block">Tracked Skills</span>
                      <span className="text-lg font-bold text-emerald-400">
                        {subcollections.skills.length}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Categorized skill entities
                      </span>
                    </div>

                    {/* Applications */}
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block">Submitted Applications</span>
                      <span className="text-lg font-bold text-cyan-400">
                        {subcollections.applications.length}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        Tracked career applications
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 7: LIVE FIRESTORE DOCUMENT SCHEMA VIEWER */}
          {activeTab === "schema" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                    <Database className="w-4 h-4 text-rose-400" />
                    In-Website Cloud Firestore Document Viewer
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live database schema for path: <span className="font-mono text-cyan-400">/users/{user.uid}</span>
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(JSON.stringify(p, null, 2), "Firestore Document JSON")}
                  className="text-xs border-slate-700 bg-slate-900 text-slate-300 hover:text-white"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" />
                  Copy Document JSON
                </Button>
              </div>

              <div className="relative rounded-xl border border-slate-800 bg-[#060a12] p-4 font-mono text-[11px] text-slate-200 overflow-x-auto max-h-[500px]">
                <pre>{JSON.stringify(p, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Master Admin Authorized Inspection</span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-[11px]">User: {user.email}</span>
          </div>
          <Button variant="primary" size="sm" onClick={onClose} className="text-xs font-bold">
            Close Database View
          </Button>
        </div>
      </div>
    </div>
  );
};
