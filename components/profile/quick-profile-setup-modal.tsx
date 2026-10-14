"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { profileRepo, skillRepo } from "@/lib/repositories";
import { CandidateProfile } from "@/types/profile";
import { Skill, SkillCategory } from "@/types/skill";
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Plus,
  X,
  Globe,
  MapPin,
} from "lucide-react";

export interface QuickProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleted?: () => void;
  initialProfile?: CandidateProfile;
}

const POPULAR_SKILL_SUGGESTIONS = [
  { name: "JavaScript", category: "Languages & Frameworks" },
  { name: "TypeScript", category: "Languages & Frameworks" },
  { name: "Python", category: "Languages & Frameworks" },
  { name: "React", category: "Languages & Frameworks" },
  { name: "Next.js", category: "Languages & Frameworks" },
  { name: "Node.js", category: "Cloud & Backend" },
  { name: "SQL & Databases", category: "Cloud & Backend" },
  { name: "Tailwind CSS", category: "UI/UX & Frontend" },
  { name: "Git & GitHub", category: "DevOps & Tooling" },
  { name: "Docker", category: "DevOps & Tooling" },
  { name: "Machine Learning", category: "AI & Machine Learning" },
  { name: "Java", category: "Languages & Frameworks" },
];

export const QuickProfileSetupModal: React.FC<QuickProfileSetupModalProps> = ({
  isOpen,
  onClose,
  onCompleted,
  initialProfile,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Social Media & Online Presence
  const [githubUrl, setGithubUrl] = useState(initialProfile?.githubUrl || "");
  const [linkedInUrl, setLinkedInUrl] = useState(initialProfile?.linkedInUrl || "");
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile?.portfolioUrl || "");
  const [location, setLocation] = useState(initialProfile?.location || "");

  // Step 2: Education
  const [institution, setInstitution] = useState(
    initialProfile?.education?.[0]?.institution || ""
  );
  const [degree, setDegree] = useState(
    initialProfile?.education?.[0]?.degree || ""
  );
  const [gradYear, setGradYear] = useState<number>(() => {
    const raw = initialProfile?.education?.[0]?.expectedGraduationYear;
    return typeof raw === "number" ? raw : Number(raw) || 2026;
  });

  // Step 3: Top Skills
  const [selectedSkills, setSelectedSkills] = useState<
    Array<{ name: string; category: string }>
  >([]);
  const [customSkillInput, setCustomSkillInput] = useState("");

  const handleToggleSkill = (skillItem: { name: string; category: string }) => {
    if (selectedSkills.some((s) => s.name.toLowerCase() === skillItem.name.toLowerCase())) {
      setSelectedSkills(
        selectedSkills.filter((s) => s.name.toLowerCase() !== skillItem.name.toLowerCase())
      );
    } else {
      setSelectedSkills([...selectedSkills, skillItem]);
    }
  };

  const handleAddCustomSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ("key" in e && e.key !== "Enter") return;
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (!trimmed) return;
    if (!selectedSkills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      setSelectedSkills([
        ...selectedSkills,
        { name: trimmed, category: "Languages & Frameworks" },
      ]);
    }
    setCustomSkillInput("");
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Build social links array
      const links = [];
      if (githubUrl.trim()) {
        links.push({ id: `link-${Date.now()}-1`, label: "GitHub", url: githubUrl.trim(), type: "github" as const });
      }
      if (linkedInUrl.trim()) {
        links.push({ id: `link-${Date.now()}-2`, label: "LinkedIn", url: linkedInUrl.trim(), type: "linkedin" as const });
      }
      if (portfolioUrl.trim()) {
        links.push({ id: `link-${Date.now()}-3`, label: "Portfolio", url: portfolioUrl.trim(), type: "portfolio" as const });
      }

      // 2. Build education array
      const education = [];
      if (institution.trim() && degree.trim()) {
        education.push({
          id: `edu-${Date.now()}`,
          institution: institution.trim(),
          degree: degree.trim(),
          specialization: degree.trim(),
          yearOrSemester: "Degree Program",
          startYear: gradYear - 4,
          expectedGraduationYear: Number(gradYear),
          location: location.trim() || undefined,
        });
      }

      // 3. Update candidate profile in repository
      await profileRepo.updateProfile({
        githubUrl: githubUrl.trim() || undefined,
        linkedInUrl: linkedInUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        location: location.trim() || undefined,
        links,
        education,
      });

      // 4. Save selected skills
      for (const s of selectedSkills) {
        try {
          await skillRepo.addSkill({
            name: s.name,
            category: (s.category as SkillCategory) || "Languages & Frameworks",
            proficiency: "Intermediate",
            levelValue: 3,
            yearsOfExperience: 1,
            targetRoleRequirement: true,
            verified: false,
          });
        } catch (err) {
          console.warn("Skill save warning:", err);
        }
      }

      if (onCompleted) {
        onCompleted();
      }
      onClose();
    } catch (err) {
      console.error("Failed to complete quick setup:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Personalize Your Profile"
      description="Quick 3-step setup to customize your candidate profile. Only answer what is relevant to you."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Step Indicator */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold transition-all ${
                  step === num
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                    : step > num
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {step > num ? <CheckCircle2 className="w-3.5 h-3.5" /> : num}
              </div>
            ))}
          </div>

          <Badge variant="indigo" size="sm">
            Step {step} of 3:{" "}
            {step === 1 ? "Social Links" : step === 2 ? "Education" : "Core Skills"}
          </Badge>
        </div>

        {/* STEP 1: SOCIAL LINKS & ONLINE PRESENCE */}
        {step === 1 && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-300">
              Where can hiring managers and algorithms discover your work?
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                GitHub Profile URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://github.com/your-username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/your-username"
                  value={linkedInUrl}
                  onChange={(e) => setLinkedInUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Portfolio / Website (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="url"
                    placeholder="https://yourname.dev"
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Location / City
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="e.g. San Francisco, CA or Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-xs text-slate-400">
                Skip Links →
              </Button>
              <Button variant="primary" size="sm" onClick={() => setStep(2)} className="text-xs">
                Next: Education
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* STEP 2: EDUCATION */}
        {step === 2 && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-300">
              Enter your college, university, or academic background.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                College or University Name
              </label>
              <div className="relative">
                <GraduationCap className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. University of California, Berkeley"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Degree & Major
                </label>
                <input
                  type="text"
                  placeholder="e.g. B.S. in Computer Science"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Expected Graduation Year
                </label>
                <select
                  value={gradYear}
                  onChange={(e) => setGradYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {[2024, 2025, 2026, 2027, 2028, 2029].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setStep(3)} className="text-xs text-slate-400">
                  Skip Education →
                </Button>
                <Button variant="primary" size="sm" onClick={() => setStep(3)} className="text-xs">
                  Next: Core Skills
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: TECHNICAL SKILLS */}
        {step === 3 && (
          <div className="space-y-3.5 animate-in fade-in">
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs text-indigo-300">
              Click to select skills you know or are currently learning (or type your own below).
            </div>

            {/* Popular quick chips */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Suggested Competencies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_SKILL_SUGGESTIONS.map((skill) => {
                  const isSelected = selectedSkills.some(
                    (s) => s.name.toLowerCase() === skill.name.toLowerCase()
                  );
                  return (
                    <button
                      key={skill.name}
                      type="button"
                      onClick={() => handleToggleSkill(skill)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? "bg-indigo-600 text-white border border-indigo-500 shadow-sm"
                          : "bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white"
                      }`}
                    >
                      {isSelected ? "✓ " : "+ "}
                      {skill.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom skill add */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Add Custom Skill
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Flutter, PyTorch, C++, GraphQL..."
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={handleAddCustomSkill}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddCustomSkill}
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            {/* Selected skills summary */}
            {selectedSkills.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1.5">
                  Your selected skills ({selectedSkills.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSkills.map((s) => (
                    <span
                      key={s.name}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-950 text-indigo-200 border border-indigo-800/60 text-xs"
                    >
                      {s.name}
                      <button
                        type="button"
                        onClick={() => handleToggleSkill(s)}
                        className="text-indigo-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 flex items-center justify-between border-t border-slate-800">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} className="text-xs">
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Back
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleFinish}
                isLoading={loading}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                Save & Complete Profile
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
