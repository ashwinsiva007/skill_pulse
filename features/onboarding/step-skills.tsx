"use client";

import React, { useState } from "react";
import { Skill, SkillCategory, ProficiencyLevel } from "@/types/skill";
import { Button } from "@/components/ui/button";
import { Plus, Search, Trash2, Sparkles, AlertCircle } from "lucide-react";

export interface StepSkillsProps {
  skills: Skill[];
  onChange: (skills: Skill[]) => void;
}

const COMMON_SKILL_SUGGESTIONS = [
  { name: "Next.js", category: "Frontend Engineering" },
  { name: "React 19", category: "Frontend Engineering" },
  { name: "TypeScript", category: "Frontend Engineering" },
  { name: "Tailwind CSS", category: "Frontend Engineering" },
  { name: "Python", category: "Backend & Systems" },
  { name: "FastAPI", category: "Backend & Systems" },
  { name: "Node.js", category: "Backend & Systems" },
  { name: "PostgreSQL", category: "Backend & Systems" },
  { name: "LLM Orchestration (LangChain)", category: "AI & Machine Learning" },
  { name: "RAG & Vector Databases", category: "AI & Machine Learning" },
  { name: "PyTorch", category: "AI & Machine Learning" },
  { name: "Prompt Engineering", category: "AI & Machine Learning" },
  { name: "Docker", category: "Cloud & DevOps" },
  { name: "AWS Services", category: "Cloud & DevOps" },
  { name: "System Design", category: "Architecture & Leadership" },
  { name: "Git & GitHub CI/CD", category: "Cloud & DevOps" },
] as const;

export const StepSkills: React.FC<StepSkillsProps> = ({ skills, onChange }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [skillName, setSkillName] = useState("");
  const [category, setCategory] = useState<SkillCategory>("AI & Machine Learning");
  const [proficiency, setProficiency] = useState<ProficiencyLevel>("Intermediate");
  const [experienceDuration, setExperienceDuration] = useState("1 year");
  const [interestToLearn, setInterestToLearn] = useState(true);
  const [evidence, setEvidence] = useState("");
  const [validationError, setValidationError] = useState("");

  const categories: SkillCategory[] = [
    "AI & Machine Learning",
    "Frontend Engineering",
    "Backend & Systems",
    "Cloud & DevOps",
    "Architecture & Leadership",
    "Data & Analytics",
  ];

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = skillName.trim();
    if (!cleanName) {
      setValidationError("Skill name cannot be empty.");
      return;
    }

    // Duplicate check
    const isDuplicate = skills.some(
      (s) => s.name.toLowerCase() === cleanName.toLowerCase()
    );
    if (isDuplicate) {
      setValidationError(`Skill "${cleanName}" is already recorded.`);
      return;
    }

    const levelMap: Record<ProficiencyLevel, number> = {
      Beginner: 2,
      Intermediate: 3,
      Advanced: 4,
      Expert: 5,
    };

    const newSkill: Skill = {
      id: `skill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      category,
      proficiency,
      levelValue: levelMap[proficiency],
      yearsOfExperience: parseInt(experienceDuration, 10) || 1,
      verified: Boolean(evidence.trim()),
      targetRoleRequirement: true,
      interestToLearn,
      evidence: evidence.trim() || undefined,
    };

    onChange([newSkill, ...skills]);
    setSkillName("");
    setEvidence("");
    setValidationError("");
  };

  const handleRemoveSkill = (id: string) => {
    onChange(skills.filter((s) => s.id !== id));
  };

  const handleSelectSuggestion = (sugName: string, sugCat: SkillCategory) => {
    setSkillName(sugName);
    setCategory(sugCat);
    setValidationError("");
  };

  // Filter skills by search query for review
  const displaySkills = searchQuery.trim()
    ? skills.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : skills;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-white">Step C — Skills & Competencies</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Record your technical abilities, evidence (projects/certs), and skills you are interested in mastering.
        </p>
      </div>

      {/* Add Skill Panel */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-4">
        <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          Add Skill Entry
        </h4>

        {validationError && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/50 p-2 rounded border border-rose-900/50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleAddSkill} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Skill Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Next.js, FastAPI, RAG"
                value={skillName}
                onChange={(e) => {
                  setSkillName(e.target.value);
                  setValidationError("");
                }}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SkillCategory)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Proficiency Level
              </label>
              <select
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value as ProficiencyLevel)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="Beginner">Beginner (Foundational)</option>
                <option value="Intermediate">Intermediate (Project Experience)</option>
                <option value="Advanced">Advanced (Production / In-depth)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Experience Duration (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 6 months, 1 year"
                value={experienceDuration}
                onChange={(e) => setExperienceDuration(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Project or Credential Evidence (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. GitHub repo link, course cert"
                value={evidence}
                onChange={(e) => setEvidence(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={interestToLearn}
                  onChange={(e) => setInterestToLearn(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                Active learning focus / high growth priority
              </label>
            </div>
          </div>

          {/* Quick Suggestions Chips */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-medium">Quick suggestions (click to fill):</span>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILL_SUGGESTIONS.map((sug) => {
                const isAlreadyAdded = skills.some(
                  (s) => s.name.toLowerCase() === sug.name.toLowerCase()
                );
                return (
                  <button
                    key={sug.name}
                    type="button"
                    disabled={isAlreadyAdded}
                    onClick={() => handleSelectSuggestion(sug.name, sug.category as SkillCategory)}
                    className={`text-[10px] px-2 py-0.5 rounded-md border transition-all ${
                      isAlreadyAdded
                        ? "opacity-40 border-slate-800 text-slate-500 cursor-not-allowed"
                        : "bg-slate-950 text-slate-300 border-slate-700 hover:border-indigo-500 hover:text-white"
                    }`}
                  >
                    + {sug.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="sm" type="submit">
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Skill
            </Button>
          </div>
        </form>
      </div>

      {/* Recorded Skills Display & Search */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="text-xs font-semibold text-white">
            Recorded Skills ({skills.length})
          </h4>

          {skills.length > 5 && (
            <div className="relative w-full sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search recorded skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>

        {/* Grouped Skills by Category */}
        <div className="space-y-4">
          {categories.map((cat) => {
            const catSkills = displaySkills.filter((s) => s.category === cat);
            if (catSkills.length === 0) return null;

            return (
              <div key={cat} className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  {cat} ({catSkills.length})
                </span>

                <div className="flex flex-wrap gap-2">
                  {catSkills.map((s) => (
                    <div
                      key={s.id}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 shadow-xs group"
                    >
                      <span className="font-medium text-white">{s.name}</span>

                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          s.proficiency === "Advanced"
                            ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                            : s.proficiency === "Intermediate"
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            : "bg-slate-800 text-slate-300 border border-slate-700"
                        }`}
                      >
                        {s.proficiency}
                      </span>

                      {s.evidence && (
                        <span title={`Evidence: ${s.evidence}`} className="text-emerald-400 text-[10px]">
                          ✓
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(s.id)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 rounded transition-colors ml-1"
                        aria-label={`Remove ${s.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
