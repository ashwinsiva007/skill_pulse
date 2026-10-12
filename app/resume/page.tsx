"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { resumeRepo, activityRepo } from "@/lib/repositories/local-repos";
import { ResumeDraft } from "@/types/resume";
import { formatDate } from "@/lib/utils";
import {
  Sparkles,
  Plus,
  Layers,
  Download,
} from "lucide-react";

export default function ResumePage() {
  const [resumes, setResumes] = useState<ResumeDraft[]>([]);
  const [selectedResume, setSelectedResume] = useState<ResumeDraft | null>(null);

  useEffect(() => {
    resumeRepo.getResumes().then((list) => {
      setResumes(list);
      if (list.length > 0) setSelectedResume(list[0]);
    });
  }, []);

  const handleCreateDraft = async () => {
    const newDraft: ResumeDraft = {
      id: `resume-${Date.now()}`,
      title: "New AI Solutions Architect Version",
      targetRole: "Staff AI Solutions Architect",
      completionPercentage: 70,
      atsScore: 78,
      status: "draft",
      summary: "Tailored executive summary drafted for high-scale enterprise AI deployments.",
      sectionsCount: 5,
      skillsIncluded: ["LLM Orchestration", "Python", "Cloud Architecture"],
      lastModified: new Date().toISOString(),
      isPrimary: false,
    };
    const saved = await resumeRepo.saveResume(newDraft);
    setResumes((prev) => [saved, ...prev]);
    setSelectedResume(saved);
    await activityRepo.logActivity({
      type: "resume",
      title: "Created new resume draft",
      description: saved.title,
      routeLink: "/resume",
      tag: "Resume Builder",
    });
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Resume Builder</h1>
              <Badge variant="cyan" size="sm">
                Stage 2 Preview
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Manage role-tailored resume variants and preview upcoming Stage 2 AI ATS optimization.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button variant="primary" size="sm" onClick={handleCreateDraft}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create New Draft
            </Button>
          </div>
        </div>

        {/* Stage 2 Announcement Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 via-slate-900 to-indigo-950/40 border border-cyan-800/40 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">
                Stage 2 Pipeline: AI Resume Tailoring & ATS Scoring Engine
              </p>
              <p className="text-slate-400 leading-relaxed max-w-2xl">
                In Stage 2, PathPilot will introduce automatic job description keyword extraction, real-time ATS match scoring, and multi-format PDF export. Below are your active local drafts.
              </p>
            </div>
          </div>
          <Badge variant="cyan" size="md" className="shrink-0">
            Coming in Stage 2
          </Badge>
        </div>

        {/* Resumes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Drafts */}
          <div className="lg:col-span-1 space-y-3">
            <span className="text-xs font-semibold text-slate-300">
              Saved Drafts ({resumes.length})
            </span>

            {resumes.map((item) => {
              const isSelected = selectedResume?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedResume(item)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-slate-800/90 border-indigo-500/60 shadow-md"
                      : "bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-xs font-semibold text-white leading-tight">
                      {item.title}
                    </span>
                    <Badge
                      variant={
                        item.status === "ready"
                          ? "emerald"
                          : item.status === "optimized"
                          ? "indigo"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {item.status}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3 truncate">
                    Target: {item.targetRole}
                  </p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                    <span className="text-slate-400 text-[11px]">
                      ATS Score: <strong className="text-indigo-400">{item.atsScore}%</strong>
                    </span>
                    <span className="text-slate-500 text-[10px]">
                      {formatDate(item.lastModified)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Resume Detail Card */}
          <div className="lg:col-span-2">
            {selectedResume ? (
              <Card>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle>{selectedResume.title}</CardTitle>
                        {selectedResume.isPrimary && (
                          <Badge variant="indigo" size="sm">
                            Primary
                          </Badge>
                        )}
                      </div>
                      <CardDescription>
                        Target Role: <strong className="text-slate-200">{selectedResume.targetRole}</strong>
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="text-xs">
                        <Download className="w-3.5 h-3.5 mr-1" />
                        Export Preview
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-5">
                  {/* Score meters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">ATS Keyword Optimization</span>
                        <span className="font-bold text-indigo-400">{selectedResume.atsScore}%</span>
                      </div>
                      <Progress value={selectedResume.atsScore} size="sm" />
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">Section Completeness</span>
                        <span className="font-bold text-emerald-400">
                          {selectedResume.completionPercentage}%
                        </span>
                      </div>
                      <Progress
                        value={selectedResume.completionPercentage}
                        size="sm"
                        indicatorClassName="bg-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-slate-300">Executive Summary</span>
                    <p className="text-xs text-slate-300 p-3 rounded-lg bg-slate-950/40 border border-slate-800/80 leading-relaxed">
                      {selectedResume.summary}
                    </p>
                  </div>

                  {/* Skills Included */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-300">
                      Highlighted Competencies in this version
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedResume.skillsIncluded.map((s) => (
                        <span
                          key={s}
                          className="px-2.5 py-1 text-xs rounded-md bg-indigo-950/50 text-indigo-300 border border-indigo-800/60 font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Planned Stage 2 feature preview */}
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      Planned Stage 2 Enhancements
                    </div>
                    <ul className="text-xs text-slate-400 space-y-1.5 pl-5 list-disc">
                      <li>One-click job description import with instant gap detection</li>
                      <li>AI bullet point polishing with quantifiable impact metrics</li>
                      <li>Export to tailored PDF, DOCX, and JSON Resume schemas</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                Select a resume draft to preview details.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
