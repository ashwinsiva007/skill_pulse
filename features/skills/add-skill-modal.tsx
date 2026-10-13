import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { SkillCategory, ProficiencyLevel } from "@/types/skill";

export interface AddSkillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSkill: (skillInput: {
    name: string;
    category: SkillCategory;
    proficiency: ProficiencyLevel;
    yearsOfExperience: number;
    targetRoleRequirement: boolean;
    evidence?: string;
  }) => Promise<void>;
  prefilledSkillName?: string;
}

export const AddSkillModal: React.FC<AddSkillModalProps> = ({
  isOpen,
  onClose,
  onSaveSkill,
  prefilledSkillName = "",
}) => {
  const [skillName, setSkillName] = useState(prefilledSkillName);
  const [category, setCategory] = useState<SkillCategory>("Data & Analytics");
  const [proficiency, setProficiency] = useState<ProficiencyLevel>("Intermediate");
  const [yearsOfExperience, setYearsOfExperience] = useState(1);
  const [targetRoleRequirement, setTargetRoleRequirement] = useState(true);
  const [evidence, setEvidence] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (prefilledSkillName) {
      setSkillName(prefilledSkillName);
    }
  }, [prefilledSkillName, isOpen]);

  const categories: SkillCategory[] = [
    "Data & Analytics",
    "AI & Machine Learning",
    "Frontend Engineering",
    "Backend & Systems",
    "Cloud & DevOps",
    "Architecture & Leadership",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    try {
      setIsSubmitting(true);
      await onSaveSkill({
        name: skillName.trim(),
        category,
        proficiency,
        yearsOfExperience,
        targetRoleRequirement,
        evidence: evidence.trim() || undefined,
      });
      setSkillName("");
      setEvidence("");
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Skill in Profile"
      description="Recorded competencies are saved to your browser profile and immediately factored into role match calculations."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Skill Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={skillName}
            onChange={(e) => setSkillName(e.target.value)}
            placeholder="e.g. SQL, Tableau, Pandas, FastAPI"
            required
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as SkillCategory)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Proficiency Level
            </label>
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value as ProficiencyLevel)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="Beginner">Beginner (Level 1 / Learning)</option>
              <option value="Intermediate">Intermediate (Level 2 / Practical)</option>
              <option value="Advanced">Advanced (Level 3 / Autonomous)</option>
              <option value="Expert">Expert (Level 4 / Architectural)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Years of Experience / Practice
          </label>
          <input
            type="number"
            min={0}
            max={20}
            value={yearsOfExperience}
            onChange={(e) => setYearsOfExperience(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Verifiable Evidence or Project Link <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={evidence}
            onChange={(e) => setEvidence(e.target.value)}
            placeholder="e.g. Built multi-table queries in Sales Dashboard repo or Coursera cert"
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="modalTargetRoleCheck"
            checked={targetRoleRequirement}
            onChange={(e) => setTargetRoleRequirement(e.target.checked)}
            className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0"
          />
          <label htmlFor="modalTargetRoleCheck" className="text-xs text-slate-300 cursor-pointer">
            Tag as priority target requirement for active career pursuit
          </label>
        </div>

        <div className="flex justify-end items-center gap-2 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save Skill to Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};
