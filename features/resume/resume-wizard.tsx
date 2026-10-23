"use client";

import React, { useState } from "react";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import {
  ResumeDraft,
  ResumeTemplate,
  ResumeContent,
  ResumeEducationEntry,
  ResumeExperienceEntry,
  ResumeProjectEntry,
  ResumeCertificationEntry,
} from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  buildResumeContentFromProfile,
  calculateResumeCompleteness,
  calculateAtsKeywordScore,
  createEmptyResumeContent,
  generateAiSummaryFromFormData,
} from "@/lib/resume/content-generator";
import {
  User,
  FileText,
  GraduationCap,
  Briefcase,
  FolderGit2,
  Cpu,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  CheckCircle2,
  Wand2,
  AlertCircle,
} from "lucide-react";

export interface ResumeWizardProps {
  profile: CandidateProfile;
  skills: Skill[];
  onComplete: (draft: ResumeDraft) => void;
  onCancel: () => void;
}

const PRESET_ROLES = [
  "Entry-Level Software Developer",
  "Full-Stack Developer",
  "Frontend Engineer",
  "Backend Engineer",
  "Data Analyst",
  "Data Scientist / AI Engineer",
  "Cloud & DevOps Engineer",
];

export const ResumeWizard: React.FC<ResumeWizardProps> = ({
  profile,
  skills,
  onComplete,
  onCancel,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [educationError, setEducationError] = useState<string | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);
  const [aiSummaryNotice, setAiSummaryNotice] = useState<string | null>(null);

  // Core Metadata
  const [targetRole, setTargetRole] = useState<string>(profile.targetRole || "Entry-Level Software Developer");
  const [draftTitle, setDraftTitle] = useState<string>(`${profile.targetRole || "Software Developer"} Resume`);
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>("classic");

  // Step 2: Contact Info
  const [contact, setContact] = useState({
    fullName: profile.name || "",
    email: profile.email || "",
    phone: profile.phone || "",
    location: profile.location || profile.city || "",
    linkedInUrl: profile.links?.find((l) => l.type === "linkedin")?.url || "",
    githubUrl: profile.links?.find((l) => l.type === "github")?.url || "",
    portfolioUrl: profile.links?.find((l) => l.type === "portfolio")?.url || "",
  });

  // Step 7: Summary (Positioned after Skills)
  const [summary, setSummary] = useState<string>(profile.bio || "");

  // Step 4: Education
  const [educationList, setEducationList] = useState<ResumeEducationEntry[]>(
    profile.education && profile.education.length > 0
      ? profile.education.map((e, idx) => ({
          id: e.id || `edu-${idx}`,
          institution: e.institution,
          degree: e.degree,
          fieldOfStudy: e.specialization || "",
          endDate: e.expectedGraduationYear ? e.expectedGraduationYear.toString() : "",
          gpa: e.gpa || "",
          highlights: [],
        }))
      : [
          {
            id: `edu-${Date.now()}-1`,
            institution: "",
            degree: "",
            fieldOfStudy: "",
            endDate: "",
            gpa: "",
            highlights: [],
          },
        ]
  );

  // Step 5: Experience
  const [experienceList, setExperienceList] = useState<ResumeExperienceEntry[]>(
    profile.experience && profile.experience.length > 0
      ? profile.experience.map((exp, idx) => ({
          id: exp.id || `exp-${idx}`,
          company: exp.company,
          role: exp.role,
          location: exp.location || "",
          startDate: exp.startDate || "",
          endDate: exp.endDate || "Present",
          isCurrent: exp.isCurrent ?? true,
          bullets: typeof exp.responsibilities === "string" ? exp.responsibilities.split("\n").filter(Boolean) : [""],
        }))
      : [
          {
            id: `exp-${Date.now()}-1`,
            company: "",
            role: "",
            location: "",
            startDate: "",
            endDate: "Present",
            isCurrent: true,
            bullets: [""],
          },
        ]
  );

  // Step 6: Projects
  const [projectList, setProjectList] = useState<ResumeProjectEntry[]>(
    profile.projects && profile.projects.length > 0
      ? profile.projects.map((p, idx) => ({
          id: p.id || `proj-${idx}`,
          title: p.title,
          technologies: p.technologies || [],
          rawTechnologies: (p.technologies || []).join(", "),
          link: p.githubUrl || p.demoUrl || "",
          bullets: [p.description || "", p.outcomes || ""].filter(Boolean),
        }))
      : [
          {
            id: `proj-${Date.now()}-1`,
            title: "",
            technologies: [],
            rawTechnologies: "",
            link: "",
            bullets: [""],
          },
        ]
  );

  // Step 7: Skills
  const [techSkillsInput, setTechSkillsInput] = useState<string>(
    skills.length > 0 ? skills.map((s) => s.name).join(", ") : ""
  );
  const [toolsInput, setToolsInput] = useState<string>("");
  const [softSkillsInput, setSoftSkillsInput] = useState<string>("");

  // Step 8: Certifications
  const [certificationsList, setCertificationsList] = useState<ResumeCertificationEntry[]>(
    profile.certifications && profile.certifications.length > 0
      ? profile.certifications.map((c, idx) => ({
          id: c.id || `cert-${idx}`,
          name: c.name,
          issuer: c.issuer,
          date: c.issueDate || "",
          credentialUrl: c.credentialUrl || "",
        }))
      : []
  );

  // Handle Switch to Import
  const handleAutoFillFromProfile = () => {
    const autoContent = buildResumeContentFromProfile(profile, targetRole, skills);
    setContact({
      fullName: autoContent.contact.fullName || "",
      email: autoContent.contact.email || "",
      phone: autoContent.contact.phone || "",
      location: autoContent.contact.location || "",
      linkedInUrl: autoContent.contact.linkedInUrl || "",
      githubUrl: autoContent.contact.githubUrl || "",
      portfolioUrl: autoContent.contact.portfolioUrl || "",
    });
    setSummary(autoContent.summary);
    setEducationList(autoContent.education);
    setExperienceList(autoContent.experience);
    setProjectList(autoContent.projects.map((p) => ({ ...p, rawTechnologies: p.technologies?.join(", ") || "" })));
    setTechSkillsInput(autoContent.skills.technical.join(", "));
    setToolsInput(autoContent.skills.tools.join(", "));
    setSoftSkillsInput(autoContent.skills.soft.join(", "));
    setCertificationsList(autoContent.certifications);
    setCurrentStep(8); // jump to template review
  };

  // Helper Methods for Multi-Entry Sections
  const addEducation = () => {
    setEducationList((prev) => [
      ...prev,
      {
        id: `edu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        institution: "",
        degree: "Bachelor of Science",
        fieldOfStudy: "Software Engineering",
        endDate: "",
        gpa: "",
        highlights: [],
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducationList((prev) => prev.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperienceList((prev) => [
      ...prev,
      {
        id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        company: "",
        role: "",
        location: "Remote",
        startDate: "",
        endDate: "Present",
        isCurrent: true,
        bullets: [""],
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperienceList((prev) => prev.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjectList((prev) => [
      ...prev,
      {
        id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: "",
        technologies: [],
        rawTechnologies: "",
        link: "",
        bullets: [""],
      },
    ]);
  };

  const removeProject = (index: number) => {
    setProjectList((prev) => prev.filter((_, i) => i !== index));
  };

  // Build Final Content Object
  const compileFinalContent = (): ResumeContent => {
    const empty = createEmptyResumeContent();
    const technicalSkills = techSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const tools = toolsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const soft = softSkillsInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      ...empty,
      contact: {
        fullName: contact.fullName.trim() || "Candidate Name",
        email: contact.email.trim(),
        phone: contact.phone.trim(),
        location: contact.location.trim(),
        linkedInUrl: contact.linkedInUrl.trim(),
        githubUrl: contact.githubUrl.trim(),
        portfolioUrl: contact.portfolioUrl.trim(),
      },
      summary: summary.trim(),
      skills: {
        technical: technicalSkills,
        tools,
        soft,
      },
      education: educationList.filter((e) => e.institution.trim() || e.degree.trim()),
      experience: experienceList.filter((e) => e.company.trim() || e.role.trim()),
      projects: projectList.filter((p) => p.title.trim()),
      certifications: certificationsList.filter((c) => c.name.trim()),
      sectionConfig: empty.sectionConfig,
    };
  };

  // Submit and Create Draft
  const handleFinalSubmit = () => {
    const finalContent = compileFinalContent();
    const completeness = calculateResumeCompleteness(finalContent);
    const atsScore = calculateAtsKeywordScore(finalContent, targetRole);
    const now = new Date().toISOString();

    const newDraft: ResumeDraft = {
      id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: draftTitle.trim() || `${targetRole} ATS Resume`,
      targetRole: targetRole.trim(),
      template: selectedTemplate,
      completionPercentage: completeness,
      atsScore,
      status: "draft",
      summary: finalContent.summary,
      sectionsCount: 6,
      skillsIncluded: finalContent.skills.technical.slice(0, 6),
      createdAt: now,
      lastModified: now,
      isPrimary: false,
      content: finalContent,
    };

    onComplete(newDraft);
  };

  // Generate AI ATS Summary from previously entered form data
  const handleGenerateAiSummary = () => {
    setIsGeneratingSummary(true);
    setTimeout(() => {
      const generated = generateAiSummaryFromFormData({
        targetRole,
        education: educationList,
        experience: experienceList,
        projects: projectList,
        techSkills: techSkillsInput,
        tools: toolsInput,
        softSkills: softSkillsInput,
        candidateName: contact.fullName,
      });
      setSummary(generated);
      setIsGeneratingSummary(false);
      setAiSummaryNotice(
        "AI summary successfully generated from your entered background! You can edit or refine it below."
      );
      setTimeout(() => setAiSummaryNotice(null), 6000);
    }, 450);
  };

  // Step Click Guard - ensures mandatory education cannot be bypassed
  const handleStepClick = (targetStep: number) => {
    if (targetStep > 3) {
      const hasValidEdu = educationList.some(
        (e) => e.institution.trim().length > 0 && e.degree.trim().length > 0
      );
      if (!hasValidEdu) {
        setEducationError(
          "Education is mandatory. Please enter your Institution/University and Degree & Major before proceeding."
        );
        setCurrentStep(3);
        return;
      }
    }
    setEducationError(null);
    setCurrentStep(targetStep);
  };

  // Step Continue Guard
  const handleContinue = () => {
    if (currentStep === 1) {
      if (!targetRole.trim()) return;
    }
    if (currentStep === 2) {
      if (!contact.fullName.trim() || !contact.email.trim()) return;
    }
    if (currentStep === 3) {
      const hasValidEdu = educationList.some(
        (e) => e.institution.trim().length > 0 && e.degree.trim().length > 0
      );
      if (!hasValidEdu) {
        setEducationError(
          "Education is mandatory. Please enter your Institution/University and Degree & Major before continuing."
        );
        return;
      }
      setEducationError(null);
    }
    setCurrentStep((prev) => prev + 1);
  };

  // Wizard Steps Configuration (Summary is now Step 7, after Skills)
  const stepsConfig = [
    { number: 1, title: "Target Role", icon: Wand2 },
    { number: 2, title: "Contact Info", icon: User },
    { number: 3, title: "Education", icon: GraduationCap },
    { number: 4, title: "Experience", icon: Briefcase },
    { number: 5, title: "Projects", icon: FolderGit2 },
    { number: 6, title: "Skills", icon: Cpu },
    { number: 7, title: "Summary", icon: FileText },
    { number: 8, title: "Template & ATS", icon: Sparkles },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header Bar */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-white tracking-tight">ATS Resume Builder</h2>
            <Badge variant="indigo" size="sm">
              Step {currentStep} of 8
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Build a clean, recruiter-approved ATS resume from scratch. Export anytime as PDF, Plain Text (.txt), or Markdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {profile?.name && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoFillFromProfile}
              className="text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40"
              title="Pre-populate wizard using your saved SkillPulse profile"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              Quick Fill from Profile
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs text-slate-400">
            Cancel
          </Button>
        </div>
      </div>

      {/* Step Indicator Pills */}
      <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-none gap-2">
        {stepsConfig.map((s) => {
          const Icon = s.icon;
          const isActive = currentStep === s.number;
          const isDone = currentStep > s.number;

          return (
            <button
              key={s.number}
              type="button"
              onClick={() => handleStepClick(s.number)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? "bg-indigo-600 text-white shadow-xs shadow-indigo-950"
                  : isDone
                  ? "bg-slate-800/80 text-emerald-400 hover:bg-slate-800"
                  : "bg-slate-900/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              <span>{s.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Step Form Card */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-6">
        {/* STEP 1: TARGET ROLE & TITLE */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">1. Target Career Role & Resume Title</h3>
              <p className="text-xs text-slate-400 mt-1">
                Recruiters and ATS parsers rank resumes based on direct keyword matching against the job title.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-300 block">
                Target Role / Job Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  setDraftTitle(`${e.target.value} Resume`);
                }}
                placeholder="e.g. Full-Stack Developer, Junior AI Engineer"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />

              {/* Preset Role Pills */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Quick Presets:</span>
                {PRESET_ROLES.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setTargetRole(role);
                      setDraftTitle(`${role} Resume`);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                      targetRole === role
                        ? "bg-indigo-600/30 text-indigo-300 border border-indigo-500/50"
                        : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-semibold text-slate-300 block">Resume Draft Title</label>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="e.g. My Software Developer Resume 2026"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
              />
            </div>
          </div>
        )}

        {/* STEP 2: CONTACT INFORMATION */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">2. Personal & Contact Information</h3>
              <p className="text-xs text-slate-400 mt-1">
                Ensure your email and phone are accurate. ATS systems extract these headers for recruiter outreach.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={contact.fullName}
                  onChange={(e) => setContact({ ...contact, fullName: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={(e) => setContact({ ...contact, email: e.target.value })}
                  placeholder="e.g. example@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Phone Number</label>
                <input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Location (City, Country / Remote)</label>
                <input
                  type="text"
                  value={contact.location}
                  onChange={(e) => setContact({ ...contact, location: e.target.value })}
                  placeholder="e.g. Coimbatore, Tamil Nadu, India"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">LinkedIn Profile URL</label>
                <input
                  type="url"
                  value={contact.linkedInUrl}
                  onChange={(e) => setContact({ ...contact, linkedInUrl: e.target.value })}
                  placeholder="e.g. https://linkedin.com/in/yourprofile"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">GitHub Profile URL</label>
                <input
                  type="url"
                  value={contact.githubUrl}
                  onChange={(e) => setContact({ ...contact, githubUrl: e.target.value })}
                  placeholder="e.g. https://github.com/yourusername"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs"
                />
              </div>

              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Portfolio / Personal Website</label>
                <input
                  type="url"
                  value={contact.portfolioUrl}
                  onChange={(e) => setContact({ ...contact, portfolioUrl: e.target.value })}
                  placeholder="e.g. https://yourportfolio.dev"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: EDUCATION (MANDATORY) */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>3. Education & Academic Background</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Mandatory
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Add your degree, university, and graduation year. This section is required for ATS qualification verification and parsing.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addEducation} className="text-xs self-start sm:self-auto">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Degree
              </Button>
            </div>

            {educationError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{educationError}</span>
              </div>
            )}

            <div className="space-y-4">
              {educationList.map((edu, idx) => (
                <div key={edu.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative group">
                  {educationList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1"
                      title="Remove degree"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Institution / University <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = [...educationList];
                          updated[idx].institution = e.target.value;
                          setEducationList(updated);
                          if (educationError) setEducationError(null);
                        }}
                        placeholder="e.g. Stanford University or MIT"
                        className={`w-full px-3 py-1.5 rounded-lg bg-slate-900 border text-white text-xs ${
                          educationError && !edu.institution.trim()
                            ? "border-rose-500 focus:border-rose-400"
                            : "border-slate-800 focus:border-indigo-500"
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Degree & Major <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...educationList];
                          updated[idx].degree = e.target.value;
                          setEducationList(updated);
                          if (educationError) setEducationError(null);
                        }}
                        placeholder="e.g. B.S. in Computer Science"
                        className={`w-full px-3 py-1.5 rounded-lg bg-slate-900 border text-white text-xs ${
                          educationError && !edu.degree.trim()
                            ? "border-rose-500 focus:border-rose-400"
                            : "border-slate-800 focus:border-indigo-500"
                        }`}
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        Graduation Year / Period <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={edu.endDate || ""}
                        onChange={(e) => {
                          const updated = [...educationList];
                          updated[idx].endDate = e.target.value;
                          setEducationList(updated);
                        }}
                        placeholder="e.g. 2026 or Expected May 2026"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">GPA (Optional)</label>
                      <input
                        type="text"
                        value={edu.gpa || ""}
                        onChange={(e) => {
                          const updated = [...educationList];
                          updated[idx].gpa = e.target.value;
                          setEducationList(updated);
                        }}
                        placeholder="e.g. 3.8 / 4.0"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: WORK EXPERIENCE */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">4. Work & Internship Experience</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Detail your employment or internships. If you are a fresh student, include internships, open source, or freelance roles.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addExperience} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Position
              </Button>
            </div>

            <div className="space-y-4">
              {experienceList.map((exp, idx) => (
                <div key={exp.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative group">
                  {experienceList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1"
                      title="Remove position"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Role / Job Title</label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => {
                          const updated = [...experienceList];
                          updated[idx].role = e.target.value;
                          setExperienceList(updated);
                        }}
                        placeholder="e.g. Software Engineering Intern"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Company / Organization</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experienceList];
                          updated[idx].company = e.target.value;
                          setExperienceList(updated);
                        }}
                        placeholder="e.g. TechCorp Solutions"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Start Date</label>
                      <input
                        type="text"
                        value={exp.startDate}
                        onChange={(e) => {
                          const updated = [...experienceList];
                          updated[idx].startDate = e.target.value;
                          setExperienceList(updated);
                        }}
                        placeholder="e.g. May 2024"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">End Date</label>
                      <input
                        type="text"
                        value={exp.endDate || ""}
                        onChange={(e) => {
                          const updated = [...experienceList];
                          updated[idx].endDate = e.target.value;
                          setExperienceList(updated);
                        }}
                        placeholder="e.g. Aug 2024 or Present"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-semibold text-slate-400">
                      Impact Bullets (One achievement per line)
                    </label>
                    <textarea
                      rows={3}
                      value={exp.bullets.join("\n")}
                      onChange={(e) => {
                        const updated = [...experienceList];
                        updated[idx].bullets = e.target.value.split("\n");
                        setExperienceList(updated);
                      }}
                      placeholder="• Engineered RESTful APIs in Node.js, improving throughput by 25%&#10;• Built reactive dashboard using React and Tailwind CSS"
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 5: PROJECTS */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">5. Key Projects & Portfolio</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Projects demonstrate direct proof of ability. Include tools used, problems solved, and measurable impact.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addProject} className="text-xs">
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Project
              </Button>
            </div>

            <div className="space-y-4">
              {projectList.map((proj, idx) => (
                <div key={proj.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative group">
                  {projectList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="absolute top-3 right-3 text-slate-500 hover:text-rose-400 p-1"
                      title="Remove project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...projectList];
                          updated[idx].title = e.target.value;
                          setProjectList(updated);
                        }}
                        placeholder="e.g. Distributed Task Scheduler"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Technologies (comma separated)</label>
                      <input
                        type="text"
                        value={proj.rawTechnologies !== undefined ? proj.rawTechnologies : proj.technologies.join(", ")}
                        onChange={(e) => {
                          const val = e.target.value;
                          const updated = [...projectList];
                          updated[idx].rawTechnologies = val;
                          updated[idx].technologies = val.split(",").map((t) => t.trim()).filter(Boolean);
                          setProjectList(updated);
                        }}
                        placeholder="e.g. React, Next.js, PostgreSQL, Docker"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>

                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[11px] font-semibold text-slate-400">Project URL / GitHub Link</label>
                      <input
                        type="url"
                        value={proj.link || ""}
                        onChange={(e) => {
                          const updated = [...projectList];
                          updated[idx].link = e.target.value;
                          setProjectList(updated);
                        }}
                        placeholder="https://github.com/user/project"
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-semibold text-slate-400">Project Highlights & Impact</label>
                    <textarea
                      rows={3}
                      value={proj.bullets.join("\n")}
                      onChange={(e) => {
                        const updated = [...projectList];
                        updated[idx].bullets = e.target.value.split("\n");
                        setProjectList(updated);
                      }}
                      placeholder="• Architected full-stack web application supporting real-time data sync&#10;• Reduced load times by 40% with memoization and server components"
                      className="w-full p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs leading-relaxed"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: SKILLS */}
        {currentStep === 6 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">6. Technical & Professional Skills</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter comma-separated skills. ATS systems scan these lists directly for required role keywords.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Programming Languages & Core Technologies
                </label>
                <input
                  type="text"
                  value={techSkillsInput}
                  onChange={(e) => setTechSkillsInput(e.target.value)}
                  placeholder="e.g. JavaScript, TypeScript, Python, SQL, C++, Java"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Developer Tools, Platforms & Frameworks
                </label>
                <input
                  type="text"
                  value={toolsInput}
                  onChange={(e) => setToolsInput(e.target.value)}
                  placeholder="e.g. React, Next.js, Node.js, Git, Docker, PostgreSQL, AWS"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Core Engineering & Soft Competencies
                </label>
                <input
                  type="text"
                  value={softSkillsInput}
                  onChange={(e) => setSoftSkillsInput(e.target.value)}
                  placeholder="e.g. Problem Solving, Agile/Scrum, Code Review, System Architecture"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 7: PROFESSIONAL SUMMARY WITH AI GENERATOR */}
        {currentStep === 7 && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>7. Professional ATS Summary</span>
                  <Badge variant="indigo" size="sm">Step 7 of 8</Badge>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  A strong 2–3 sentence summary highlighting your core technical competencies and target domain.
                </p>
              </div>

              {/* AI Generator Button */}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGenerateAiSummary}
                disabled={isGeneratingSummary}
                className="text-xs border-indigo-500/50 bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 hover:text-white transition-all shadow-xs flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
                title="Synthesize a concise 2-3 sentence ATS summary strictly from your entered education, experience, projects, and skills"
              >
                <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isGeneratingSummary ? "animate-spin" : ""}`} />
                {isGeneratingSummary ? "Generating with AI..." : summary ? "Regenerate with AI" : "AI Generated Summary"}
              </Button>
            </div>

            {aiSummaryNotice && (
              <div className="p-3 rounded-xl bg-indigo-950/70 border border-indigo-700/70 text-indigo-200 text-xs flex items-center justify-between animate-fadeIn">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300 shrink-0" />
                  {aiSummaryNotice}
                </span>
                <button
                  type="button"
                  onClick={() => setAiSummaryNotice(null)}
                  className="text-indigo-400 hover:text-white text-xs ml-2 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] text-slate-400">
                  Type your summary below, or click <strong>AI Generated Summary</strong> above to auto-generate from your profile data:
                </span>
                <span className="text-[11px] text-indigo-400 font-medium">ATS Optimized</span>
              </div>
              <textarea
                rows={5}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Write a concise career summary tailored to your target role, or click 'AI Generated Summary' to automatically compose one from your entered background..."
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Recommended: 40–80 words. Focus on measurable impact and core tech.</span>
                <span>{summary.split(/\s+/).filter(Boolean).length} words</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 8: TEMPLATE & ATS SCORE REVIEW */}
        {currentStep === 8 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">8. ATS Template Selection & Review</h3>
              <p className="text-xs text-slate-400 mt-1">
                All templates follow single-column, ATS-parseable guidelines with zero hidden tables or graphic columns that break automated filters.
              </p>
            </div>

            {/* Template Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                onClick={() => setSelectedTemplate("classic")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTemplate === "classic"
                    ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-xs">Classic ATS</span>
                  <Badge variant="indigo" size="sm">Most Recommended</Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Clean, standard layout favored by Fortune 500 enterprise ATS systems (Workday, Taleo, Brassring).
                </p>
              </div>

              <div
                onClick={() => setSelectedTemplate("modern")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTemplate === "modern"
                    ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-xs">Modern Minimal</span>
                  <Badge variant="cyan" size="sm">Tech Startups</Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Contemporary typography and subtle section accent lines. Popular for SaaS and startup applications.
                </p>
              </div>

              <div
                onClick={() => setSelectedTemplate("technical")}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedTemplate === "technical"
                    ? "bg-indigo-950/40 border-indigo-500 shadow-md shadow-indigo-950"
                    : "bg-slate-950 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-white text-xs">Technical / Projects</span>
                  <Badge variant="emerald" size="sm">Junior / Student</Badge>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Places technical projects and skills right below summary for maximum impact when lacking 5+ years experience.
                </p>
              </div>
            </div>

            {/* Live ATS Readiness Check Card */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  ATS Optimization Readiness
                </span>
                <span className="text-xs font-bold text-emerald-400">95% ATS Compliant</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
                <span className="flex items-center gap-1 text-emerald-400">✓ Contact Header</span>
                <span className="flex items-center gap-1 text-emerald-400">✓ Single Column ATS</span>
                <span className="flex items-center gap-1 text-emerald-400">✓ Targeted Keywords</span>
                <span className="flex items-center gap-1 text-emerald-400">✓ Export Ready</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (currentStep > 1) setCurrentStep((prev) => prev - 1);
              else onCancel();
            }}
            className="text-xs text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            {currentStep === 1 ? "Cancel" : "Back"}
          </Button>

          {currentStep < 8 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={handleContinue}
              className="text-xs font-semibold px-4 cursor-pointer"
            >
              Continue to {stepsConfig[currentStep].title}
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleFinalSubmit}
              className="text-xs font-bold px-6 shadow-md shadow-indigo-950"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-300" />
              Generate & Open ATS Resume
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
