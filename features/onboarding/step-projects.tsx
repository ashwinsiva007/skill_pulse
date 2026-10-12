"use client";

import React, { useState } from "react";
import { ProjectEntry, ProjectStatus } from "@/types/project";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit3, FolderGit2, ExternalLink, X } from "lucide-react";

export interface StepProjectsProps {
  projects: ProjectEntry[];
  onChange: (projects: ProjectEntry[]) => void;
}

export const StepProjects: React.FC<StepProjectsProps> = ({ projects, onChange }) => {
  const [isAdding, setIsAdding] = useState(projects.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [description, setDescription] = useState("");
  const [personalContribution, setPersonalContribution] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [techInput, setTechInput] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Completed");
  const [githubUrl, setGithubUrl] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [outcomes, setOutcomes] = useState("");
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setTitle("");
    setProblem("");
    setDescription("");
    setPersonalContribution("");
    setTechnologies([]);
    setTechInput("");
    setStatus("Completed");
    setGithubUrl("");
    setDemoUrl("");
    setOutcomes("");
    setFormError("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (proj: ProjectEntry) => {
    setEditingId(proj.id);
    setTitle(proj.title);
    setProblem(proj.problem);
    setDescription(proj.description);
    setPersonalContribution(proj.personalContribution);
    setTechnologies(proj.technologies || []);
    setStatus(proj.status);
    setGithubUrl(proj.githubUrl || "");
    setDemoUrl(proj.demoUrl || "");
    setOutcomes(proj.outcomes || "");
    setIsAdding(true);
  };

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (!trimmed || technologies.includes(trimmed)) return;
    setTechnologies([...technologies, trimmed]);
    setTechInput("");
  };

  const handleRemoveTech = (t: string) => {
    setTechnologies(technologies.filter((tech) => tech !== t));
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !problem.trim() || !description.trim() || !personalContribution.trim()) {
      setFormError("Title, problem addressed, description, and personal contribution are required.");
      return;
    }
    if (technologies.length === 0) {
      setFormError("Please add at least one technology or tool used.");
      return;
    }

    if (editingId) {
      const updated = projects.map((p) =>
        p.id === editingId
          ? {
              ...p,
              title: title.trim(),
              problem: problem.trim(),
              description: description.trim(),
              personalContribution: personalContribution.trim(),
              technologies,
              status,
              githubUrl: githubUrl.trim() || undefined,
              demoUrl: demoUrl.trim() || undefined,
              outcomes: outcomes.trim() || undefined,
            }
          : p
      );
      onChange(updated);
    } else {
      const newProj: ProjectEntry = {
        id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        title: title.trim(),
        problem: problem.trim(),
        description: description.trim(),
        personalContribution: personalContribution.trim(),
        technologies,
        status,
        githubUrl: githubUrl.trim() || undefined,
        demoUrl: demoUrl.trim() || undefined,
        outcomes: outcomes.trim() || undefined,
      };
      onChange([...projects, newProj]);
    }

    resetForm();
  };

  const handleDeleteProject = (id: string) => {
    onChange(projects.filter((p) => p.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Step E — Portfolio Projects</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Showcase technical applications, problem statements, and your personal contribution.
          </p>
        </div>

        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Project
          </Button>
        )}
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {projects.map((proj) => (
          <Card key={proj.id} className="p-4 bg-slate-950/60 border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-white">{proj.title}</h4>
                  <Badge
                    variant={
                      proj.status === "Completed"
                        ? "emerald"
                        : proj.status === "In Progress"
                        ? "indigo"
                        : "neutral"
                    }
                    size="sm"
                  >
                    {proj.status}
                  </Badge>
                </div>

                <div className="text-xs text-slate-300 space-y-1">
                  <p>
                    <strong className="text-slate-400">Problem:</strong> {proj.problem}
                  </p>
                  <p>
                    <strong className="text-slate-400">Contribution:</strong>{" "}
                    {proj.personalContribution}
                  </p>
                  {proj.outcomes && (
                    <p className="text-emerald-400/90">
                      <strong>Impact:</strong> {proj.outcomes}
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.technologies.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-medium"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  {proj.githubUrl && (
                    <a
                      href={proj.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <FolderGit2 className="w-3 h-3" />
                      Repository
                    </a>
                  )}
                  {proj.demoUrl && (
                    <a
                      href={proj.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Live Demo
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartEdit(proj)}
                  className="h-7 px-2 text-slate-400 hover:text-white"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteProject(proj.id)}
                  className="h-7 px-2 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <Card className="p-4 bg-slate-900 border-indigo-500/30 space-y-4">
          <h4 className="text-xs font-semibold text-indigo-300">
            {editingId ? "Edit Project Entry" : "New Portfolio Project"}
          </h4>

          {formError && (
            <p className="text-xs text-rose-400 bg-rose-950/50 p-2 rounded">{formError}</p>
          )}

          <form onSubmit={handleSaveProject} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Agentic Docs — RAG Knowledge Base"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ProjectStatus)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Prototype">Prototype</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Problem Addressed *
              </label>
              <input
                type="text"
                placeholder="What core pain point or bottleneck did this project solve?"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Project Overview / Description *
              </label>
              <textarea
                rows={2}
                placeholder="Brief summary of architecture, workflows, and functionality..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Your Personal Contribution *
              </label>
              <input
                type="text"
                placeholder="What specific components, algorithms, or pipelines did YOU build?"
                value={personalContribution}
                onChange={(e) => setPersonalContribution(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            {/* Technologies Chips */}
            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">
                Technologies Used *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Next.js, LangChain, Pinecone (Press Enter)"
                  value={techInput}
                  onChange={(e) => setTechInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTech();
                    }
                  }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <Button variant="outline" size="sm" type="button" onClick={handleAddTech}>
                  Add Tech
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-2">
                {technologies.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-300"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTech(t)}
                      className="hover:text-rose-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Links and Impact */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  GitHub Repository URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Live Demo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://project-demo.com"
                  value={demoUrl}
                  onChange={(e) => setDemoUrl(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Outcomes, Metrics, or Impact (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 94% accuracy, 350+ GitHub stars, 1,200 active users"
                  value={outcomes}
                  onChange={(e) => setOutcomes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingId ? "Update Project" : "Add Project"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
