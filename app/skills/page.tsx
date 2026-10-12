"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Modal } from "@/components/ui/modal";
import { skillRepo, activityRepo } from "@/lib/repositories/local-repos";
import { Skill, SkillCategory, ProficiencyLevel } from "@/types/skill";
import {
  Cpu,
  Plus,
  CheckCircle2,
  ShieldAlert,
  Target,
  BarChart2,
} from "lucide-react";

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState<SkillCategory>("AI & Machine Learning");
  const [newSkillProficiency, setNewSkillProficiency] = useState<ProficiencyLevel>("Advanced");
  const [isTargetRequirement, setIsTargetRequirement] = useState(true);

  const loadSkills = async () => {
    const list = await skillRepo.getSkills();
    setSkills(list);
  };

  useEffect(() => {
    loadSkills();
  }, []);

  const categories: SkillCategory[] = [
    "AI & Machine Learning",
    "Frontend Engineering",
    "Backend & Systems",
    "Cloud & DevOps",
    "Architecture & Leadership",
  ];

  const filteredSkills =
    selectedCategory === "All"
      ? skills
      : skills.filter((s) => s.category === selectedCategory);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const levelMap: Record<ProficiencyLevel, number> = {
      Beginner: 2,
      Intermediate: 3,
      Advanced: 4,
      Expert: 5,
    };

    const newSkill = await skillRepo.addSkill({
      name: newSkillName.trim(),
      category: newSkillCategory,
      proficiency: newSkillProficiency,
      levelValue: levelMap[newSkillProficiency],
      yearsOfExperience: 2,
      verified: true,
      targetRoleRequirement: isTargetRequirement,
      endorsementsCount: 1,
    });

    await activityRepo.logActivity({
      type: "skill",
      title: `Added skill: ${newSkill.name}`,
      description: `Categorized under ${newSkill.category} (${newSkill.proficiency})`,
      routeLink: "/skills",
      tag: "Skill Analyzer",
    });

    setNewSkillName("");
    setIsAddModalOpen(false);
    loadSkills();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Skill Analyzer</h1>
              <Badge variant="cyan" size="sm">
                Stage 3 Preview
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Audit recorded competencies, verify endorsements, and analyze gap requirements for Staff AI Architect.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Skill
            </Button>
          </div>
        </div>

        {/* Stage 3 Roadmap Alert */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-cyan-950/40 border border-indigo-800/40 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <BarChart2 className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">
                Stage 3 Core Feature: AI Market Gap & Diagnostic Benchmarks
              </p>
              <p className="text-slate-400 leading-relaxed max-w-2xl">
                Stage 3 will benchmark your skills against real-time industry job specifications, calculate gap vectors, and recommend precise learning modules.
              </p>
            </div>
          </div>
          <Badge variant="indigo" size="md" className="shrink-0">
            Coming in Stage 3
          </Badge>
        </div>

        {/* Skill Gap Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-slate-950/60 border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-400">Total Skills Recorded</span>
              <Cpu className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="text-2xl font-bold text-white">{skills.length}</span>
            <span className="text-[11px] text-slate-400 block mt-1">Across 5 technical domains</span>
          </Card>

          <Card className="p-4 bg-slate-950/60 border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-400">Target Role Requirements</span>
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="text-2xl font-bold text-white">
              {skills.filter((s) => s.targetRoleRequirement).length} / {skills.length}
            </span>
            <span className="text-[11px] text-emerald-400 block mt-1">82% role match coverage</span>
          </Card>

          <Card className="p-4 bg-slate-950/60 border-slate-800">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-slate-400">High-Priority Gap</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-sm font-bold text-amber-300">Kubernetes & Fine-Tuning</span>
            <span className="text-[11px] text-slate-400 block mt-1">
              Flagged in 2 saved opportunities
            </span>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === "All"
                ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            }`}
          >
            All Skills ({skills.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {cat} ({skills.filter((s) => s.category === cat).length})
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSkills.map((skill) => (
            <Card key={skill.id} className="hover:border-slate-700/80 transition-colors">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-semibold text-white leading-snug">
                      {skill.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {skill.category}
                    </span>
                  </div>

                  {skill.verified ? (
                    <span
                      title="Verified skill"
                      className="p-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span
                      title="Self-reported"
                      className="text-[10px] text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded"
                    >
                      In Training
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Proficiency:</span>
                    <span className="font-semibold text-indigo-300">{skill.proficiency}</span>
                  </div>
                  <Progress value={skill.levelValue * 20} size="sm" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
                  <span>{skill.yearsOfExperience} yrs experience</span>
                  {skill.targetRoleRequirement && (
                    <Badge variant="indigo" size="sm">
                      Target Role
                    </Badge>
                  )}
                </div>

                {skill.notes && (
                  <p className="text-[10px] text-slate-400 italic line-clamp-1 bg-slate-950/40 p-1.5 rounded border border-slate-800">
                    &ldquo;{skill.notes}&rdquo;
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Skill"
        description="Recorded skills are stored in your browser LocalStorage."
      >
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Skill Name</label>
            <input
              type="text"
              placeholder="e.g. CUDA Kernel Optimization"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Category</label>
            <select
              value={newSkillCategory}
              onChange={(e) => setNewSkillCategory(e.target.value as SkillCategory)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Proficiency Level
            </label>
            <select
              value={newSkillProficiency}
              onChange={(e) => setNewSkillProficiency(e.target.value as ProficiencyLevel)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
            >
              <option value="Beginner">Beginner (1-2 yrs)</option>
              <option value="Intermediate">Intermediate (2-3 yrs)</option>
              <option value="Advanced">Advanced (3-5 yrs)</option>
              <option value="Expert">Expert (5+ yrs)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="targetRoleCheck"
              checked={isTargetRequirement}
              onChange={(e) => setIsTargetRequirement(e.target.checked)}
              className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
            />
            <label htmlFor="targetRoleCheck" className="text-xs text-slate-300">
              Required for target role (Staff AI Solutions Architect)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Skill
            </Button>
          </div>
        </form>
      </Modal>
    </AppLayout>
  );
}
