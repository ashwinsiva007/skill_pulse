import React, { useState } from "react";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import {
  ResumeDraft,
  ResumeTemplate,
  JobDescriptionAnalysis,
} from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  buildResumeContentFromProfile,
  calculateResumeCompleteness,
  calculateAtsKeywordScore,
} from "@/lib/resume/content-generator";
import { analyzeJobDescription } from "@/lib/resume/ats-analyzer";
import {
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Search,
  Wand2,
} from "lucide-react";

export interface ResumeWizardProps {
  profile: CandidateProfile;
  skills: Skill[];
  onComplete: (draft: ResumeDraft) => void;
  onCancel: () => void;
}

const PRESET_ROLES = [
  "Data Analyst Internship",
  "Data Science Internship",
  "AI/ML Internship",
  "Entry-Level Software Developer",
  "Junior AI Solutions Engineer",
  "Full-Stack Developer",
];

export const ResumeWizard: React.FC<ResumeWizardProps> = ({
  profile,
  skills,
  onComplete,
  onCancel,
}) => {
  const [step, setStep] = useState<number>(1);

  // Step 1 State: Purpose & Target Role
  const [targetRole, setTargetRole] = useState<string>(
    profile.targetRole || "Entry-Level Software Developer"
  );
  const [targetCompany, setTargetCompany] = useState<string>("");
  const [draftTitle, setDraftTitle] = useState<string>(
    `${profile.targetRole || "Entry-Level Software Developer"} Resume`
  );

  // Step 2 State: Job Description (Optional)
  const [jobDescription, setJobDescription] = useState<string>("");
  const [jobAnalysis, setJobAnalysis] = useState<JobDescriptionAnalysis | null>(null);

  // Step 3 State: Missing Info Follow-up Answers
  const [missingPhone, setMissingPhone] = useState<string>(profile.phone || "");
  const [missingLocation, setMissingLocation] = useState<string>(
    profile.location || profile.city || ""
  );
  const [summaryCustomization, setSummaryCustomization] = useState<string>("");
  const [additionalSkillsInput, setAdditionalSkillsInput] = useState<string>("");

  // Step 4 State: Selected Template
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate>("classic");

  // Handle Preset Role Selection
  const handleSelectPreset = (role: string) => {
    setTargetRole(role);
    setDraftTitle(`${role} Resume Draft`);
  };

  // Inspect what's imported vs what's missing
  const hasPhone = Boolean(profile.phone && profile.phone.trim().length > 3);
  const hasLocation = Boolean((profile.location && profile.location.trim().length > 2) || profile.city);
  const hasProjects = (profile.projects?.length || 0) > 0;
  const hasExperience = (profile.experience?.length || 0) > 0;
  const hasEducation = (profile.education?.length || 0) > 0;
  const hasSkills = skills.length > 0 || (profile.preferences?.technologiesOfInterest?.length || 0) > 0;

  // Projects missing measurable outcomes
  const projectsNeedingMetrics = (profile.projects || []).filter(
    (p) => !p.outcomes || p.outcomes.trim().length === 0
  );

  // Trigger Job Description Analysis
  const handleAnalyzeJobDesc = () => {
    if (jobDescription.trim()) {
      const initialContent = buildResumeContentFromProfile(profile, targetRole, skills);
      const res = analyzeJobDescription(jobDescription, initialContent);
      setJobAnalysis(res);
    }
  };

  // Generate Final Draft
  const handleGenerateDraft = () => {
    const baseContent = buildResumeContentFromProfile(profile, targetRole, skills);

    // Apply any filled missing info
    if (missingPhone.trim()) {
      baseContent.contact.phone = missingPhone.trim();
    }
    if (missingLocation.trim()) {
      baseContent.contact.location = missingLocation.trim();
    }
    if (summaryCustomization.trim()) {
      baseContent.summary = summaryCustomization.trim();
    }
    if (additionalSkillsInput.trim()) {
      const extra = additionalSkillsInput.split(",").map((s) => s.trim()).filter(Boolean);
      baseContent.skills.technical = Array.from(new Set([...baseContent.skills.technical, ...extra]));
    }

    const completeness = calculateResumeCompleteness(baseContent);
    const atsScore = jobAnalysis ? jobAnalysis.matchScore : calculateAtsKeywordScore(baseContent, targetRole);
    const now = new Date().toISOString();

    const newDraft: ResumeDraft = {
      id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: draftTitle.trim() || `${targetRole} Resume`,
      targetRole: targetRole.trim(),
      targetCompany: targetCompany.trim() || undefined,
      jobDescription: jobDescription.trim() || undefined,
      template: selectedTemplate,
      completionPercentage: completeness,
      atsScore,
      status: "draft",
      summary: baseContent.summary,
      sectionsCount: Object.values(baseContent.sectionConfig.visible).filter(Boolean).length,
      skillsIncluded: [
        ...baseContent.skills.technical.slice(0, 4),
        ...baseContent.skills.tools.slice(0, 2),
      ],
      createdAt: now,
      lastModified: now,
      isPrimary: false,
      content: baseContent,
    };

    onComplete(newDraft);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Wizard Header & Stepper */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Guided Resume Generator</h2>
              <Badge variant="cyan" size="sm">
                Stage 3
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Build an ATS-conscious, role-targeted resume by reusing your profile data and answering focused follow-ups.
            </p>
          </div>

          <Button variant="ghost" size="sm" onClick={onCancel} className="text-xs self-start">
            Cancel
          </Button>
        </div>

        {/* Stepper Indicator */}
        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-800 text-xs">
          {[
            { stepNum: 1, label: "Target Role" },
            { stepNum: 2, label: "Profile Data" },
            { stepNum: 3, label: "Missing Info" },
            { stepNum: 4, label: "Review & Generate" },
          ].map((s) => (
            <div
              key={s.stepNum}
              className={`p-2 rounded-lg border text-center transition-all ${
                step === s.stepNum
                  ? "bg-indigo-600/20 border-indigo-500/60 text-indigo-300 font-semibold"
                  : step > s.stepNum
                  ? "bg-emerald-950/20 border-emerald-800/40 text-emerald-400"
                  : "bg-slate-950/40 border-slate-800 text-slate-500"
              }`}
            >
              <span className="block text-[10px] uppercase font-mono">Step {s.stepNum}</span>
              <span className="truncate block font-medium">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: Select Purpose & Target Role */}
      {step === 1 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">Step 1: Select Your Target Purpose</h3>
            <p className="text-xs text-slate-400">
              Choose your target career track so the resume structure and summaries can align with industry expectations.
            </p>
          </div>

          {/* Quick preset chips */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300">Popular Career Tracks:</span>
            <div className="flex flex-wrap gap-2">
              {PRESET_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSelectPreset(role)}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                    targetRole === role
                      ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                      : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Role Title <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => {
                  setTargetRole(e.target.value);
                  setDraftTitle(`${e.target.value} Resume Draft`);
                }}
                placeholder="e.g. Data Analyst Internship"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Company <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="e.g. Stripe, Synthetix AI, or General"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Resume Draft Name
              </label>
              <input
                type="text"
                value={draftTitle}
                onChange={(e) => setDraftTitle(e.target.value)}
                placeholder="e.g. Data Analyst Internship Resume v1"
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <Button
              variant="primary"
              size="md"
              onClick={() => setStep(2)}
              disabled={!targetRole.trim()}
            >
              Next: Load Profile Data
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Load Available Profile Information & Optional Job Description */}
      {step === 2 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Step 2: Profile Data Synchronization & Job Description
            </h3>
            <p className="text-xs text-slate-400">
              We automatically import all saved records from your profile and skills list. No repetitive retyping.
            </p>
          </div>

          {/* Sync checklist summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white block">Candidate Profile</span>
                  <span className="text-[11px] text-slate-400">{profile.name} ({profile.email})</span>
                </div>
              </div>
              <Badge variant="emerald" size="sm">Loaded</Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white block">Education</span>
                  <span className="text-[11px] text-slate-400">{profile.education?.length || 0} institution(s)</span>
                </div>
              </div>
              <Badge variant={hasEducation ? "emerald" : "amber"} size="sm">
                {hasEducation ? "Loaded" : "Empty"}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white block">Projects</span>
                  <span className="text-[11px] text-slate-400">{profile.projects?.length || 0} project(s)</span>
                </div>
              </div>
              <Badge variant={hasProjects ? "emerald" : "amber"} size="sm">
                {hasProjects ? "Loaded" : "Empty"}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white block">Experience</span>
                  <span className="text-[11px] text-slate-400">{profile.experience?.length || 0} position(s)</span>
                </div>
              </div>
              <Badge variant={hasExperience ? "emerald" : "amber"} size="sm">
                {hasExperience ? "Loaded" : "Empty"}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white block">Skills & Tools</span>
                  <span className="text-[11px] text-slate-400">{skills.length} recorded skills</span>
                </div>
              </div>
              <Badge variant={hasSkills ? "emerald" : "amber"} size="sm">
                {hasSkills ? "Loaded" : "Empty"}
              </Badge>
            </div>
          </div>

          {/* Optional Job Description Input */}
          <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold text-slate-200">
                  Optional: Paste Target Job Description for Keyword Matching
                </span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Optional</span>
            </div>

            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste responsibilities and requirements from the job posting to inspect keyword alignment..."
              className="w-full p-2.5 text-xs rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />

            <div className="flex justify-between items-center text-xs">
              <p className="text-[11px] text-slate-400">
                Notice: ATS score is a heuristic vocabulary check and does not guarantee job interviews.
              </p>
              {jobDescription.trim() && (
                <Button variant="outline" size="sm" onClick={handleAnalyzeJobDesc}>
                  Analyze Keywords
                </Button>
              )}
            </div>

            {/* Keyword analysis snapshot */}
            {jobAnalysis && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 font-semibold">Vocabulary Match Score:</span>
                  <span className="font-bold text-indigo-400">{jobAnalysis.matchScore}%</span>
                </div>
                {jobAnalysis.missingKeywords.length > 0 && (
                  <div className="text-[11px] text-amber-300">
                    Missing Keywords: {jobAnalysis.missingKeywords.slice(0, 5).join(", ")}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <Button variant="ghost" size="md" onClick={() => setStep(1)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
            <Button variant="primary" size="md" onClick={() => setStep(3)}>
              Next: Check Missing Info
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Identify Missing Info & Ask Relevant Follow-Up Questions */}
      {step === 3 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Step 3: Relevant Follow-Ups & Missing Details
            </h3>
            <p className="text-xs text-slate-400">
              We only prompt you for fields missing from your profile or that elevate this specific role variant.
            </p>
          </div>

          {/* Missing contact details */}
          {(!hasPhone || !hasLocation) && (
            <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/40 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                <AlertCircle className="w-4 h-4" />
                Missing Contact Details
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {!hasPhone && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Phone Number (Recommended for recruiters)
                    </label>
                    <input
                      type="text"
                      value={missingPhone}
                      onChange={(e) => setMissingPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                )}
                {!hasLocation && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      City, State / Country
                    </label>
                    <input
                      type="text"
                      value={missingLocation}
                      onChange={(e) => setMissingLocation(e.target.value)}
                      placeholder="e.g. San Francisco, CA"
                      className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Project impact guidance */}
          {projectsNeedingMetrics.length > 0 && (
            <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-800/40 space-y-2.5 text-xs">
              <div className="flex items-center gap-2 font-semibold text-indigo-300">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                Action & Result Framework Check
              </div>
              <p className="text-slate-300 leading-relaxed">
                {projectsNeedingMetrics.length} project(s) do not have recorded numerical metrics or outcomes. In accordance with honest reporting standards, we will insert clearly marked editable placeholders (e.g. <code>[Measurable impact: reduced latency by X%]</code>) which you can update anytime in the editor.
              </p>
            </div>
          )}

          {/* Additional Target Skills Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Additional Skills to Highlight for &quot;{targetRole}&quot;
            </label>
            <input
              type="text"
              value={additionalSkillsInput}
              onChange={(e) => setAdditionalSkillsInput(e.target.value)}
              placeholder="e.g. Data Wrangling, Pandas, SQL, Tableau, Matplotlib"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
            <span className="text-[11px] text-slate-500">
              Comma-separated. These will be added to the Technical Skills section.
            </span>
          </div>

          {/* Custom Summary Override */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              Customize Professional Summary for this Target Role
            </label>
            <textarea
              rows={3}
              value={summaryCustomization}
              onChange={(e) => setSummaryCustomization(e.target.value)}
              placeholder={`Leave blank to automatically generate a tailored summary for ${targetRole} from your degree and skills.`}
              className="w-full p-2.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <Button variant="ghost" size="md" onClick={() => setStep(2)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
            <Button variant="primary" size="md" onClick={() => setStep(4)}>
              Next: Review & Template
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: Full Content Review & Template Selection */}
      {step === 4 && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Step 4: Template Selection & Final Confirmation
            </h3>
            <p className="text-xs text-slate-400">
              Select a design layout for your resume document. You can easily switch templates anytime in the previewer.
            </p>
          </div>

          {/* Template Choices */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: "classic" as ResumeTemplate,
                title: "Classic Professional",
                desc: "Traditional serif headers, centered contact bar, clean horizontal rules. High ATS compliance for corporate & finance.",
              },
              {
                id: "modern" as ResumeTemplate,
                title: "Modern Minimal",
                desc: "Sleek sans-serif typography, left-aligned header, subtle accent badges, balanced whitespace.",
              },
              {
                id: "technical" as ResumeTemplate,
                title: "Technical / Project-Focused",
                desc: "Skills prominently featured near top, structured tech stack tags, monospace indicators for developers & analysts.",
              },
            ].map((tmpl) => (
              <div
                key={tmpl.id}
                onClick={() => setSelectedTemplate(tmpl.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all space-y-2 ${
                  selectedTemplate === tmpl.id
                    ? "bg-indigo-600/15 border-indigo-500 text-white shadow-sm"
                    : "bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-950"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{tmpl.title}</span>
                  {selectedTemplate === tmpl.id && (
                    <Badge variant="indigo" size="sm">
                      Selected
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{tmpl.desc}</p>
              </div>
            ))}
          </div>

          {/* Review Summary Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-200 block border-b border-slate-800 pb-2">
              Ready to Generate Draft:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Draft Name</span>
                <span className="font-semibold text-white">{draftTitle}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Target Role</span>
                <span className="font-semibold text-white">{targetRole}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Template</span>
                <span className="font-semibold text-indigo-400 capitalize">{selectedTemplate}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Profile Source</span>
                <span className="font-semibold text-emerald-400">{profile.name}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-slate-800">
            <Button variant="ghost" size="md" onClick={() => setStep(3)}>
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back
            </Button>
            <Button variant="primary" size="md" onClick={handleGenerateDraft}>
              <Wand2 className="w-4 h-4 mr-1.5" />
              Generate & Open in Editor
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
