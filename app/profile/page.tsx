"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { profileRepo, skillRepo } from "@/lib/repositories";
import { useAuth } from "@/lib/firebase/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { CandidateProfile, CareerLevel } from "@/types/profile";
import { Skill, SkillCategory, ProficiencyLevel } from "@/types/skill";
import { ProjectStatus } from "@/types/project";
import { ExperienceEntry } from "@/types/experience";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import { CompletionBreakdownModal } from "@/components/profile/completion-breakdown-modal";
import { QuickProfileSetupModal } from "@/components/profile/quick-profile-setup-modal";
import { DEMO_PROFILE } from "@/lib/demo/seed-data";
import {
  Mail,
  MapPin,
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  GraduationCap,
  Sparkles,
  FolderGit2,
  Info,
  X,
  Database,
  ShieldCheck,
  CloudUpload,
  RefreshCw,
} from "lucide-react";

function ProfileContent() {
  const searchParams = useSearchParams();
  const { user, isFirebaseReady, refreshProfile, resetProfileToCleanSlate } = useAuth();
  const [profile, setProfile] = useState<CandidateProfile>(DEMO_PROFILE);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isQuickSetupOpen, setIsQuickSetupOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal active states
  const [isEditPersonalOpen, setIsEditPersonalOpen] = useState(false);
  const [isAddEducationOpen, setIsAddEducationOpen] = useState(false);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isAddSkillOpen, setIsAddSkillOpen] = useState(false);
  const [isAddExperienceOpen, setIsAddExperienceOpen] = useState(false);

  // Form states for Personal
  const [personalForm, setPersonalForm] = useState<Partial<CandidateProfile>>({});

  // Form states for Education
  const [eduInstitution, setEduInstitution] = useState("");
  const [eduDegree, setEduDegree] = useState("");
  const [eduSpecialization, setEduSpecialization] = useState("");
  const [eduYear, setEduYear] = useState("Final Year");
  const [eduStartYear, setEduStartYear] = useState(2022);
  const [eduGradYear, setEduGradYear] = useState(2026);
  const [eduGpa, setEduGpa] = useState("");

  // Form states for Projects
  const [projTitle, setProjTitle] = useState("");
  const [projProblem, setProjProblem] = useState("");
  const [projDesc, setProjDesc] = useState("");
  const [projContribution, setProjContribution] = useState("");
  const [projTech, setProjTech] = useState<string[]>([]);
  const [projTechInput, setProjTechInput] = useState("");
  const [projStatus, setProjStatus] = useState<ProjectStatus>("Completed");
  const [projGithub, setProjGithub] = useState("");
  const [projDemo, setProjDemo] = useState("");
  const [projOutcomes, setProjOutcomes] = useState("");

  // Form states for Skills
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>("AI & Machine Learning");
  const [newSkillProficiency, setNewSkillProficiency] = useState<ProficiencyLevel>("Advanced");
  const [newSkillEvidence, setNewSkillEvidence] = useState("");

  // Form states for Experience
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expType, setExpType] = useState<ExperienceEntry["type"]>("Internship");
  const [expResp, setExpResp] = useState("");

  const loadData = async () => {
    const [prof, skls] = await Promise.all([profileRepo.getProfile(), skillRepo.getSkills()]);
    setProfile(prof);
    setPersonalForm(prof);
    setSkills(skls);
  };

  useEffect(() => {
    loadData();
    if (searchParams.get("onboarding") === "success") {
      setSuccessMessage("Onboarding completed! Your profile is updated.");
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  }, [searchParams]);

  const completionResult = calculateProfileCompletion(profile, skills);

  // Save personal details
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await profileRepo.updateProfile(personalForm);
      setProfile(updated);
      setIsEditPersonalOpen(false);
      setSuccessMessage("Personal details saved!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetBlank = async () => {
    if (confirm("Reset your profile to a completely clean slate (remove all demo education, skills, and links)?")) {
      await resetProfileToCleanSlate();
      await loadData();
      setSuccessMessage("Profile reset to clean slate! All demo data removed.");
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  // Add Education
  const handleAddEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eduInstitution.trim() || !eduDegree.trim() || !eduSpecialization.trim()) return;

    await profileRepo.addEducation({
      institution: eduInstitution.trim(),
      degree: eduDegree.trim(),
      specialization: eduSpecialization.trim(),
      yearOrSemester: eduYear,
      startYear: eduStartYear,
      expectedGraduationYear: eduGradYear,
      gpa: eduGpa.trim() || undefined,
    });

    setEduInstitution("");
    setEduDegree("");
    setEduSpecialization("");
    setEduGpa("");
    setIsAddEducationOpen(false);
    loadData();
  };

  const handleDeleteEducation = async (id: string) => {
    if (confirm("Delete this academic entry?")) {
      await profileRepo.deleteEducation(id);
      loadData();
    }
  };

  // Add Project
  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projProblem.trim() || !projDesc.trim() || !projContribution.trim()) return;

    await profileRepo.addProject({
      title: projTitle.trim(),
      problem: projProblem.trim(),
      description: projDesc.trim(),
      personalContribution: projContribution.trim(),
      technologies: projTech.length > 0 ? projTech : ["General"],
      status: projStatus,
      githubUrl: projGithub.trim() || undefined,
      demoUrl: projDemo.trim() || undefined,
      outcomes: projOutcomes.trim() || undefined,
    });

    setProjTitle("");
    setProjProblem("");
    setProjDesc("");
    setProjContribution("");
    setProjTech([]);
    setProjGithub("");
    setProjDemo("");
    setProjOutcomes("");
    setIsAddProjectOpen(false);
    loadData();
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm("Delete this project from your profile?")) {
      await profileRepo.deleteProject(id);
      loadData();
    }
  };

  // Add Skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const levelMap: Record<ProficiencyLevel, number> = {
      Beginner: 2,
      Intermediate: 3,
      Advanced: 4,
      Expert: 5,
    };

    await skillRepo.addSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency,
      levelValue: levelMap[newSkillProficiency],
      yearsOfExperience: 2,
      verified: Boolean(newSkillEvidence.trim()),
      targetRoleRequirement: true,
      evidence: newSkillEvidence.trim() || undefined,
    });

    setNewSkillName("");
    setNewSkillEvidence("");
    setIsAddSkillOpen(false);
    loadData();
  };

  const handleDeleteSkill = async (id: string) => {
    await skillRepo.deleteSkill(id);
    loadData();
  };

  // Add Experience
  const handleAddExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany.trim() || !expRole.trim() || !expResp.trim()) return;

    await profileRepo.addExperience({
      company: expCompany.trim(),
      role: expRole.trim(),
      type: expType,
      startDate: "Recent",
      isCurrent: true,
      responsibilities: expResp.trim(),
    });

    setExpCompany("");
    setExpRole("");
    setExpResp("");
    setIsAddExperienceOpen(false);
    loadData();
  };

  const handleDeleteExperience = async (id: string) => {
    if (confirm("Delete this experience entry?")) {
      await profileRepo.deleteExperience(id);
      loadData();
    }
  };

  const handleSyncToCloud = async () => {
    setIsSyncing(true);
    try {
      await profileRepo.updateProfile(profile);
      await refreshProfile();
      setSuccessMessage("Profile dataset successfully synchronized with Firebase Firestore!");
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err: any) {
      console.error(err);
      setSuccessMessage("Cloud sync notice: " + (err.message || "Failed to sync"));
    } finally {
      setIsSyncing(false);
    }
  };

  const initials = (profile.name || "Candidate")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "CP";

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Candidate Profile</h1>
              <Badge variant={user ? "emerald" : "indigo"} size="sm">
                {user ? "Firestore Cloud Database" : "Local & Cloud Ready"}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive career profile and dataset for students, graduates, and developers. Persistent across sessions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {user ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSyncToCloud}
                isLoading={isSyncing}
                className="text-xs border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/40"
              >
                <CloudUpload className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Sync to Firestore
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAuthModalOpen(true)}
                className="text-xs border-amber-500/40 text-amber-300 hover:bg-amber-950/40"
              >
                <Database className="w-3.5 h-3.5 mr-1 text-amber-400" />
                Connect Cloud DB
              </Button>
            )}

            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetBlank}
                className="text-xs text-rose-300 border-rose-900/50 hover:bg-rose-950/40"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1 text-rose-400" />
                Reset to Blank Slate
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsQuickSetupOpen(true)}
              className="text-xs bg-indigo-600 hover:bg-indigo-500"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Quick Setup (3 Steps)
            </Button>

            <Link href="/onboarding">
              <Button variant="outline" size="sm" className="text-xs">
                Full Wizard
              </Button>
            </Link>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditPersonalOpen(true)}
              className="text-xs"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1" />
              Edit Details
            </Button>
          </div>
        </div>

        {/* New Profile Quick Setup Welcome Banner */}
        {user && (!profile.education || profile.education.length === 0) && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/70 via-[#0d1527] to-indigo-950/70 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-lg shadow-indigo-950/40">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
                <h3 className="text-sm font-semibold text-white">
                  Welcome to your new profile, {profile.name}!
                </h3>
              </div>
              <p className="text-xs text-slate-300">
                Your profile is brand-new and empty. Answer 3 bite-sized questions (social links, college/education, and top skills) to personalize it.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsQuickSetupOpen(true)}
              className="text-xs shrink-0 bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Personalize Profile (3 Steps) →
            </Button>
          </div>
        )}

        {/* Cloud Database Status Card */}
        <div className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          user
            ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-200"
            : "bg-slate-900/60 border-slate-800 text-slate-300"
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              user ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
            }`}>
              {user ? <ShieldCheck className="w-4 h-4" /> : <Database className="w-4 h-4" />}
            </div>
            <div>
              <p className="font-semibold text-white">
                {user ? "Firebase Cloud Database Active" : "Local Workspace Mode (Cloud DB Optional)"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {user
                  ? `Authenticated as ${user.email} (UID: ${user.uid.slice(0, 8)}...). Device remains signed in until manual logout.`
                  : "All profile edits are saved locally. Connect your Firebase Console or sign in with Email & Password for cloud synchronization across devices."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-white transition-colors flex items-center gap-1.5"
            >
              <Database className="w-3 h-3 text-indigo-400" />
              {user ? "Cloud Settings" : "Sign In / Setup DB"}
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Profile Card Header */}
        <Card className="border-indigo-500/20 bg-gradient-to-r from-slate-900/90 via-[#10172b] to-slate-900">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start md:items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shrink-0">
                  {initials}
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                    <Badge variant="indigo">{profile.careerLevel || "Student"}</Badge>
                    <Badge variant={user ? "emerald" : "neutral"}>
                      {user ? "Cloud Synced Profile" : "Candidate Profile"}
                    </Badge>
                  </div>

                  <p className="text-xs sm:text-sm text-indigo-300 font-medium">{profile.headline}</p>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      {profile.email || user?.email || "candidate@skillpulse.internal"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {profile.location || "Global / Remote"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                      Target: <strong className="text-slate-300">{profile.targetRole}</strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Completion Card Widget */}
              <div
                onClick={() => setIsBreakdownOpen(true)}
                className="w-full md:w-56 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 text-xs space-y-2 shrink-0 cursor-pointer transition-all group"
                title="Click to view full completion criteria score breakdown"
              >
                <div className="flex justify-between items-center">
                  <span className="text-slate-300 font-medium flex items-center gap-1">
                    Profile Completeness
                    <Info className="w-3 h-3 text-slate-500 group-hover:text-indigo-400" />
                  </span>
                  <span className="font-bold text-indigo-400">
                    {completionResult.percentage}%
                  </span>
                </div>
                <Progress value={completionResult.percentage} size="sm" />
                <span className="text-[11px] text-indigo-400 group-hover:underline block text-right font-medium">
                  View Score Criteria →
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bio & Portfolio Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Professional Biography</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                {profile.bio}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-400 flex flex-wrap gap-4">
                <div>
                  Industry: <strong className="text-slate-200">{profile.targetIndustry}</strong>
                </div>
                <div>
                  Availability: <strong className="text-slate-200">{profile.availability}</strong>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Verified Portfolio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {profile.githubUrl && (
                <a
                  href={profile.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                    GitHub
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              )}

              {profile.linkedInUrl && (
                <a
                  href={profile.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    LinkedIn
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              )}

              {profile.portfolioUrl && (
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/50 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Portfolio Dev
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Section: Academic Background (Education) */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Education & Degrees</CardTitle>
                <CardDescription>Academic background and current standing</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddEducationOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Education
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.education && profile.education.length > 0 ? (
              profile.education.map((edu) => (
                <div
                  key={edu.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{edu.institution}</h4>
                      <p className="text-xs text-indigo-300">
                        {edu.degree} in {edu.specialization} ({edu.yearOrSemester})
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {edu.startYear} – {edu.expectedGraduationYear}
                        {edu.gpa && <span className="text-emerald-400 ml-2">GPA: {edu.gpa}</span>}
                      </p>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEducation(edu.id)}
                    className="h-7 px-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-2">No education entries added yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Section: Technical Skills */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recorded Skills ({skills.length})</CardTitle>
                <CardDescription>Verified technical competencies and active learning focus</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddSkillOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Skill
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <div
                  key={s.id}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <span className="font-semibold text-white">{s.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                      s.proficiency === "Advanced"
                        ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                        : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                    }`}
                  >
                    {s.proficiency}
                  </span>
                  {s.evidence && <span className="text-emerald-400 text-[10px]">✓</span>}
                  <button
                    onClick={() => handleDeleteSkill(s.id)}
                    className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section: Portfolio Projects */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Portfolio Projects ({profile.projects?.length || 0})</CardTitle>
                <CardDescription>Showcase implementations, problem statements, and outcomes</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddProjectOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Project
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.projects && profile.projects.length > 0 ? (
              profile.projects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-semibold text-white">{proj.title}</h4>
                        <Badge variant={proj.status === "Completed" ? "emerald" : "indigo"} size="sm">
                          {proj.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        <strong className="text-slate-400">Problem:</strong> {proj.problem}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        <strong className="text-slate-400">Contribution:</strong> {proj.personalContribution}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProject(proj.id)}
                      className="h-7 px-2 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {proj.technologies?.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {proj.githubUrl && (
                    <div className="pt-1">
                      <a
                        href={proj.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <FolderGit2 className="w-3 h-3" />
                        {proj.githubUrl}
                      </a>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-2">No projects recorded yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Section: Work & Internship Experience */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Work & Internships ({profile.experience?.length || 0})</CardTitle>
                <CardDescription>Professional roles, responsibilities, and research</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setIsAddExperienceOpen(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Experience
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {profile.experience && profile.experience.length > 0 ? (
              profile.experience.map((exp) => (
                <div
                  key={exp.id}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-white">{exp.role}</h4>
                    <p className="text-xs text-indigo-300">
                      {exp.company} • <span className="text-slate-400">{exp.type}</span>
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{exp.responsibilities}</p>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="h-7 px-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-500 italic py-2">No work or internship entries added yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODAL 1: Edit Personal Details */}
      <Modal
        isOpen={isEditPersonalOpen}
        onClose={() => setIsEditPersonalOpen(false)}
        title="Edit Personal & Contact Details"
      >
        <form onSubmit={handleSavePersonal} className="space-y-3.5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                value={personalForm.name || ""}
                onChange={(e) => setPersonalForm({ ...personalForm, name: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Standing</label>
              <select
                value={personalForm.careerLevel || "Student"}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, careerLevel: e.target.value as CareerLevel })
                }
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Student">Student</option>
                <option value="Fresh Graduate">Fresh Graduate</option>
                <option value="Entry Level">Entry Level</option>
                <option value="Junior">Junior</option>
                <option value="Mid-Level">Mid-Level</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Headline</label>
            <input
              type="text"
              value={personalForm.headline || ""}
              onChange={(e) => setPersonalForm({ ...personalForm, headline: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Biography</label>
            <textarea
              rows={3}
              value={personalForm.bio || ""}
              onChange={(e) => setPersonalForm({ ...personalForm, bio: e.target.value })}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditPersonalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Add Education */}
      <Modal
        isOpen={isAddEducationOpen}
        onClose={() => setIsAddEducationOpen(false)}
        title="Add Academic Record"
      >
        <form onSubmit={handleAddEducation} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Institution *</label>
            <input
              type="text"
              placeholder="e.g. California Institute of Technology"
              value={eduInstitution}
              onChange={(e) => setEduInstitution(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Degree *</label>
              <input
                type="text"
                placeholder="e.g. Bachelor of Science"
                value={eduDegree}
                onChange={(e) => setEduDegree(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Specialization *</label>
              <input
                type="text"
                placeholder="e.g. Computer Science & AI"
                value={eduSpecialization}
                onChange={(e) => setEduSpecialization(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Year / Semester</label>
              <input
                type="text"
                placeholder="e.g. Final Year / Sem 7"
                value={eduYear}
                onChange={(e) => setEduYear(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Start Year</label>
              <input
                type="number"
                value={eduStartYear}
                onChange={(e) => setEduStartYear(parseInt(e.target.value, 10) || 2022)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Graduation Year</label>
              <input
                type="number"
                value={eduGradYear}
                onChange={(e) => setEduGradYear(parseInt(e.target.value, 10) || 2026)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">GPA / Percentage (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 3.92 / 4.0 or 88%"
              value={eduGpa}
              onChange={(e) => setEduGpa(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddEducationOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Add Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Add Project */}
      <Modal
        isOpen={isAddProjectOpen}
        onClose={() => setIsAddProjectOpen(false)}
        title="Add Portfolio Project"
      >
        <form onSubmit={handleAddProject} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Project Title *</label>
            <input
              type="text"
              placeholder="e.g. Agentic Docs Knowledge Base"
              value={projTitle}
              onChange={(e) => setProjTitle(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Problem Addressed *</label>
            <input
              type="text"
              placeholder="What core problem does this solve?"
              value={projProblem}
              onChange={(e) => setProjProblem(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Personal Contribution *</label>
            <input
              type="text"
              placeholder="What specific components did you author?"
              value={projContribution}
              onChange={(e) => setProjContribution(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Status</label>
              <select
                value={projStatus}
                onChange={(e) => setProjStatus(e.target.value as ProjectStatus)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Maintained">Maintained</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Technologies (comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. Next.js, PyTorch, FastAPI"
                value={projTechInput}
                onChange={(e) => {
                  setProjTechInput(e.target.value);
                  setProjTech(e.target.value.split(",").map((t) => t.trim()).filter(Boolean));
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">GitHub / Code URL (Optional)</label>
              <input
                type="text"
                placeholder="https://github.com/..."
                value={projGithub}
                onChange={(e) => setProjGithub(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Live Demo URL (Optional)</label>
              <input
                type="text"
                placeholder="https://..."
                value={projDemo}
                onChange={(e) => setProjDemo(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Outcomes / Impact (Optional)</label>
            <input
              type="text"
              placeholder="e.g. 50+ GitHub stars, 25% latency reduction"
              value={projOutcomes}
              onChange={(e) => setProjOutcomes(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddProjectOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Add Skill */}
      <Modal
        isOpen={isAddSkillOpen}
        onClose={() => setIsAddSkillOpen(false)}
        title="Add Skill Competency"
      >
        <form onSubmit={handleAddSkill} className="space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Skill Name *</label>
            <input
              type="text"
              placeholder="e.g. PyTorch, Next.js, Docker"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Category</label>
              <select
                value={newSkillCategory}
                onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="AI & Machine Learning">AI & Machine Learning</option>
                <option value="Frontend Engineering">Frontend Engineering</option>
                <option value="Backend & Systems">Backend & Systems</option>
                <option value="Cloud & DevOps">Cloud & DevOps</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Proficiency</label>
              <select
                value={newSkillProficiency}
                onChange={(e) => setNewSkillProficiency(e.target.value as ProficiencyLevel)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddSkillOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Skill
            </Button>
          </div>
        </form>
      </Modal>

      {/* MODAL 5: Add Experience */}
      <Modal
        isOpen={isAddExperienceOpen}
        onClose={() => setIsAddExperienceOpen(false)}
        title="Add Experience / Internship"
      >
        <form onSubmit={handleAddExperience} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Company *</label>
              <input
                type="text"
                placeholder="e.g. Synthetix AI Systems"
                value={expCompany}
                onChange={(e) => setExpCompany(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Role *</label>
              <input
                type="text"
                placeholder="e.g. Software Engineering Intern"
                value={expRole}
                onChange={(e) => setExpRole(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Type</label>
              <select
                value={expType}
                onChange={(e) => setExpType(e.target.value as ExperienceEntry["type"])}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Research">Research</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium text-slate-300 mb-1">Responsibilities *</label>
            <textarea
              rows={2}
              placeholder="Key responsibilities and tools utilized..."
              value={expResp}
              onChange={(e) => setExpResp(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" type="button" onClick={() => setIsAddExperienceOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Score Criteria Breakdown Modal */}
      <CompletionBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        result={completionResult}
      />

      {/* Quick Profile Setup Modal */}
      <QuickProfileSetupModal
        isOpen={isQuickSetupOpen}
        onClose={() => setIsQuickSetupOpen(false)}
        onCompleted={loadData}
        initialProfile={profile}
      />

      {/* Cloud Authentication & Database Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={user ? "firebase" : "signin"}
      />
    </AppLayout>
  );
}

export default function ProfilePage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-slate-400 text-xs">
          Loading Profile...
        </div>
      }
    >
      <ProfileContent />
    </React.Suspense>
  );
}
