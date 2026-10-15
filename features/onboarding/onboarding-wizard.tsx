"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { EducationEntry } from "@/types/education";
import { ProjectEntry } from "@/types/project";
import {
  ExperienceEntry,
  CertificationEntry,
  CourseEntry,
  HackathonEntry,
  AwardEntry,
  LeadershipEntry,
} from "@/types/experience";
import { CareerPreferences } from "@/types/preferences";
import { profileRepo, skillRepo, activityRepo } from "@/lib/repositories";
import { DEMO_PROFILE, DEMO_SKILLS } from "@/lib/demo/seed-data";
import { personalDetailsSchema } from "@/lib/validations/profile";
import { WizardStepper } from "./wizard-stepper";
import { StepPersonal } from "./step-personal";
import { StepEducation } from "./step-education";
import { StepSkills } from "./step-skills";
import { StepPreferences } from "./step-preferences";
import { StepProjects } from "./step-projects";
import { StepExperience } from "./step-experience";
import { StepReview } from "./step-review";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  Sparkles,
  FileCheck,
} from "lucide-react";

export const OnboardingWizard: React.FC = () => {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});

  // Unified Wizard State
  const [profileData, setProfileData] = useState<CandidateProfile>(DEMO_PROFILE);
  const [skillsList, setSkillsList] = useState<Skill[]>(DEMO_SKILLS);

  useEffect(() => {
    Promise.all([profileRepo.getProfile(), skillRepo.getSkills()]).then(
      ([prof, skls]) => {
        setProfileData(prof);
        setSkillsList(skls);
      }
    );
  }, []);

  const handlePersonalChange = (updates: Partial<CandidateProfile>) => {
    setProfileData((prev) => ({ ...prev, ...updates }));
    setStepErrors({});
  };

  const handleEducationChange = (education: EducationEntry[]) => {
    setProfileData((prev) => ({ ...prev, education }));
  };

  const handleSkillsChange = (skills: Skill[]) => {
    setSkillsList(skills);
  };

  const handlePreferencesChange = (preferences: CareerPreferences) => {
    setProfileData((prev) => ({
      ...prev,
      preferences,
      targetRole: preferences.targetJobRoles[0] || prev.targetRole,
    }));
  };

  const handleProjectsChange = (projects: ProjectEntry[]) => {
    setProfileData((prev) => ({ ...prev, projects }));
  };

  const handleExperienceUpdate = (data: {
    experience?: ExperienceEntry[];
    certifications?: CertificationEntry[];
    courses?: CourseEntry[];
    hackathons?: HackathonEntry[];
    awards?: AwardEntry[];
    leadership?: LeadershipEntry[];
  }) => {
    setProfileData((prev) => ({ ...prev, ...data }));
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      const res = personalDetailsSchema.safeParse({
        name: profileData.name || "",
        headline: profileData.headline || "",
        email: profileData.email || "",
        phone: profileData.phone || "",
        city: profileData.city || "",
        state: profileData.state || "",
        country: profileData.country || "",
        location: profileData.location || "",
        linkedInUrl: profileData.linkedInUrl || "",
        githubUrl: profileData.githubUrl || "",
        portfolioUrl: profileData.portfolioUrl || "",
        bio: profileData.bio || "",
        careerLevel: profileData.careerLevel || "Student",
      });

      if (!res.success) {
        const errorMap: Record<string, string> = {};
        res.error.issues.forEach((err) => {
          if (err.path[0]) errorMap[err.path[0] as string] = err.message;
        });
        setStepErrors(errorMap);
        return false;
      }
    }
    if (currentStep === 2) {
      const eduList = profileData.education || [];
      const hasValidEdu = eduList.some((e) => e.institution?.trim() && e.degree?.trim());
      if (!hasValidEdu) {
        setStepErrors({
          education: "Education is mandatory. Please add at least one degree and institution before proceeding.",
        });
        return false;
      }
    }
    setStepErrors({});
    return true;
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await profileRepo.updateProfile(profileData);
      setDraftNotice("Progress saved locally!");
      setTimeout(() => setDraftNotice(null), 3000);
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    if (!validateCurrentStep()) return;

    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep]);
    }

    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleJumpToStep = (stepId: number) => {
    setCurrentStep(stepId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFinalSubmit = async () => {
    setIsSaving(true);
    try {
      await profileRepo.updateProfile(profileData);
      for (const s of skillsList) {
        await skillRepo.addSkill({
          name: s.name,
          category: s.category,
          proficiency: s.proficiency,
          levelValue: s.levelValue,
          yearsOfExperience: s.yearsOfExperience,
          verified: s.verified,
          targetRoleRequirement: s.targetRoleRequirement,
          evidence: s.evidence,
        });
      }
      await activityRepo.logActivity({
        type: "system",
        title: "Completed Profile Wizard",
        description: `Profile completion updated to ${profileData.profileCompletionPercentage}%`,
        routeLink: "/profile",
        tag: "Profile Builder",
      });
      router.push("/profile?onboarding=success");
    } catch (err) {
      console.error("Failed to finalize profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-slate-900 border border-slate-800">
        <div>
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            SkillPulse AI Profile & Onboarding Wizard
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Tailored onboarding for students, fresh graduates, and career builders. All data persists to this browser.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {draftNotice && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {draftNotice}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={isSaving}
            className="text-xs"
          >
            <Save className="w-3.5 h-3.5 mr-1" />
            Save Draft
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleJumpToStep(7)}
            className="text-xs text-slate-300"
          >
            Review Step
          </Button>
        </div>
      </div>

      {/* Stepper Progress Bar */}
      <WizardStepper
        currentStep={currentStep}
        completedSteps={completedSteps}
        onSelectStep={handleJumpToStep}
      />

      {/* Step Container Card */}
      <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xs min-h-[460px]">
        {currentStep === 1 && (
          <StepPersonal
            data={profileData}
            onChange={handlePersonalChange}
            errors={stepErrors}
          />
        )}

        {currentStep === 2 && (
          <StepEducation
            entries={profileData.education || []}
            onChange={handleEducationChange}
            error={stepErrors.education}
          />
        )}

        {currentStep === 3 && (
          <StepSkills
            skills={skillsList}
            onChange={handleSkillsChange}
          />
        )}

        {currentStep === 4 && (
          <StepPreferences
            preferences={profileData.preferences}
            onChange={handlePreferencesChange}
          />
        )}

        {currentStep === 5 && (
          <StepProjects
            projects={profileData.projects || []}
            onChange={handleProjectsChange}
          />
        )}

        {currentStep === 6 && (
          <StepExperience
            experience={profileData.experience || []}
            certifications={profileData.certifications || []}
            courses={profileData.courses || []}
            hackathons={profileData.hackathons || []}
            awards={profileData.awards || []}
            leadership={profileData.leadership || []}
            onUpdate={handleExperienceUpdate}
          />
        )}

        {currentStep === 7 && (
          <StepReview
            profile={profileData}
            skills={skillsList}
            onJumpToStep={handleJumpToStep}
          />
        )}
      </div>

      {/* Bottom Navigation Buttons */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="text-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          Back
        </Button>

        <div className="flex items-center gap-2">
          {currentStep < 7 ? (
            <Button variant="primary" size="sm" onClick={handleContinue} className="text-xs">
              Continue
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={handleFinalSubmit}
              isLoading={isSaving}
              className="text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
            >
              <FileCheck className="w-3.5 h-3.5 mr-1.5" />
              Complete & Launch Profile
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
