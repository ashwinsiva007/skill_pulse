"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  applicationRepo,
  activityRepo,
} from "@/lib/repositories";
import { JobApplication, ApplicationStage } from "@/types/application";
import { EditApplicationModal } from "./edit-application-modal";
import {
  Plus,
  Clock,
  Award,
  MoreVertical,
  RotateCcw,
  GripVertical,
} from "lucide-react";

interface PipelineColumn {
  id: string;
  title: string;
  stages: ApplicationStage[];
  color: "neutral" | "cyan" | "indigo" | "emerald" | "amber";
}

const PIPELINE_COLUMNS: PipelineColumn[] = [
  {
    id: "col-saved",
    title: "Bookmarked & Interested",
    stages: ["saved", "interested"],
    color: "neutral",
  },
  {
    id: "col-applied",
    title: "Applied / Submitted",
    stages: ["applied"],
    color: "cyan",
  },
  {
    id: "col-interview",
    title: "Interview & Assessment",
    stages: ["screening", "technical", "interview"],
    color: "indigo",
  },
  {
    id: "col-offer",
    title: "Offer Extended",
    stages: ["offer"],
    color: "emerald",
  },
  {
    id: "col-closed",
    title: "Closed / Archived",
    stages: ["rejected", "archived"],
    color: "amber",
  },
];

export const TrackerView: React.FC = () => {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | null>(null);

  // New Application form state
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newStage, setNewStage] = useState<ApplicationStage>("applied");
  const [newSalary, setNewSalary] = useState("");
  const [newNotes, setNewNotes] = useState("");
  const [newNextStep, setNewNextStep] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [activeDropColId, setActiveDropColId] = useState<string | null>(null);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await applicationRepo.getApplications();
      setApplications(list);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleStageChange = async (id: string, stage: ApplicationStage) => {
    const updated = await applicationRepo.updateApplicationStage(id, stage);
    await activityRepo.logActivity({
      type: "application",
      title: `Moved ${updated.company} to ${stage}`,
      description: `Role: ${updated.role}`,
      routeLink: "/tracker",
      tag: "Tracker",
    });
    loadApplications();
  };

  const handleDropToColumn = async (appId: string, targetColumn: PipelineColumn) => {
    const app = applications.find((a) => a.id === appId);
    if (!app) return;
    if (targetColumn.stages.includes(app.stage)) return;
    const targetStage = targetColumn.stages[0];
    await handleStageChange(appId, targetStage);
  };

  const handleUpdateApplication = async (id: string, updates: Partial<JobApplication>) => {
    await applicationRepo.updateApplication(id, updates);
    loadApplications();
  };

  const handleDeleteApplication = async (id: string) => {
    await applicationRepo.deleteApplication(id);
    loadApplications();
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    const newApp = await applicationRepo.addApplication({
      company: newCompany.trim(),
      role: newRole.trim(),
      stage: newStage,
      salaryRange: newSalary.trim() || undefined,
      notes: newNotes.trim() || "Manually recorded application.",
      nextStep: newNextStep.trim() || undefined,
    });

    await activityRepo.logActivity({
      type: "application",
      title: `Logged new application: ${newApp.role}`,
      description: `Targeting ${newApp.company}`,
      routeLink: "/tracker",
      tag: "Application Tracker",
    });

    setNewCompany("");
    setNewRole("");
    setNewSalary("");
    setNewNotes("");
    setNewNextStep("");
    setIsAddModalOpen(false);
    loadApplications();
  };

  const handleRestoreDemo = async () => {
    if (window.confirm("Restore demo applications to baseline initial state?")) {
      await applicationRepo.resetToDemoApplications();
      loadApplications();
    }
  };

  // Metrics summary
  const totalApps = applications.length;
  const inInterview = applications.filter((a) =>
    ["screening", "technical", "interview"].includes(a.stage)
  ).length;
  const offers = applications.filter((a) => a.stage === "offer").length;
  const appliedOnly = applications.filter((a) => a.stage === "applied").length;

  return (
    <AppLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-16">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Application Pipeline Tracker
              </h1>
              <Badge variant="indigo" size="sm">
                Stage 5 Active
              </Badge>
              <Badge variant="emerald" size="sm">
                Kanban
              </Badge>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Organize your active job and internship applications across pipeline stages, update recruiter notes, and monitor next round deadlines.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestoreDemo}
              className="text-xs text-slate-400 hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Reset Demo Apps
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Application
            </Button>
          </div>
        </div>

        {/* Pipeline Summary KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-3.5 bg-slate-900/80 border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Pipeline</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-white">{totalApps}</span>
              <span className="text-[11px] text-slate-400">Tracked</span>
            </div>
          </Card>

          <Card className="p-3.5 bg-slate-900/80 border-slate-800">
            <span className="text-[10px] uppercase font-bold text-cyan-400 block">Applied (Awaiting)</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-cyan-300">{appliedOnly}</span>
              <span className="text-[11px] text-slate-400">Submitted</span>
            </div>
          </Card>

          <Card className="p-3.5 bg-slate-900/80 border-slate-800">
            <span className="text-[10px] uppercase font-bold text-indigo-400 block">In Interview Loop</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-indigo-300">{inInterview}</span>
              <span className="text-[11px] text-slate-400">Active</span>
            </div>
          </Card>

          <Card className="p-3.5 bg-slate-900/80 border-slate-800">
            <span className="text-[10px] uppercase font-bold text-emerald-400 block">Offers Received</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-emerald-400">{offers}</span>
              <Award className="w-4 h-4 text-emerald-400" />
            </div>
          </Card>
        </div>

        {/* 5-Column Kanban Board */}
        {isLoading ? (
          <div className="py-20 text-center text-slate-500 text-xs">
            Loading application pipeline...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {PIPELINE_COLUMNS.map((column) => {
            const columnApps = applications.filter((app) => column.stages.includes(app.stage));

            return (
              <div key={column.id} className="flex flex-col space-y-3">
                {/* Column Header */}
                <div className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-xs font-bold text-slate-200 tracking-tight">
                    {column.title}
                  </span>
                  <Badge variant={column.color} size="sm">
                    {columnApps.length}
                  </Badge>
                </div>

                {/* Column Card Container */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (activeDropColId !== column.id) {
                      setActiveDropColId(column.id);
                    }
                  }}
                  onDragLeave={(e) => {
                    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
                    if (activeDropColId === column.id) {
                      setActiveDropColId(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    const appId = e.dataTransfer.getData("text/plain") || draggedAppId;
                    setActiveDropColId(null);
                    setDraggedAppId(null);
                    if (appId) {
                      handleDropToColumn(appId, column);
                    }
                  }}
                  className={`space-y-3 min-h-[420px] p-2 rounded-xl transition-all ${
                    activeDropColId === column.id
                      ? "bg-indigo-950/30 border-2 border-dashed border-indigo-500 shadow-md ring-2 ring-indigo-500/20"
                      : "bg-slate-950/40 border border-slate-900/90"
                  }`}
                >
                  {columnApps.length === 0 ? (
                    <div className="h-32 flex flex-col items-center justify-center text-slate-600 text-xs text-center p-3 rounded-lg border border-dashed border-slate-800/80">
                      <span className="font-medium text-slate-400">
                        {activeDropColId === column.id ? "Drop card here" : "No entries in this stage"}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        Drag application cards here
                      </span>
                    </div>
                  ) : (
                    columnApps.map((app) => (
                      <Card
                        key={app.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", app.id);
                          e.dataTransfer.effectAllowed = "move";
                          setDraggedAppId(app.id);
                        }}
                        onDragEnd={() => {
                          setDraggedAppId(null);
                          setActiveDropColId(null);
                        }}
                        className={`p-3.5 bg-slate-900/90 border-slate-800/90 hover:border-slate-700 transition-all shadow-sm space-y-2.5 cursor-grab active:cursor-grabbing ${
                          draggedAppId === app.id ? "opacity-40 scale-[0.98] border-indigo-500" : ""
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="flex items-center gap-1.5 flex-1 pr-1 min-w-0">
                            <GripVertical className="w-3.5 h-3.5 text-slate-600 hover:text-slate-400 shrink-0 cursor-grab" />
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                                {app.company}
                              </span>
                              <h4 className="text-xs font-bold text-white leading-tight truncate">
                                {app.role}
                              </h4>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setEditingApplication(app)}
                            className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 shrink-0"
                            title="Edit application details"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Salary Range */}
                        {app.salaryRange && (
                          <span className="text-[11px] text-emerald-400 font-medium block">
                            {app.salaryRange}
                          </span>
                        )}

                        {/* Next Action Box */}
                        {app.nextStep && (
                          <div className="p-2 rounded-lg bg-indigo-950/40 border border-indigo-900/60 text-[11px] text-indigo-300 space-y-0.5">
                            <span className="font-semibold block text-[10px] uppercase text-indigo-400">
                              Next Step:
                            </span>
                            <p className="line-clamp-2 leading-tight">{app.nextStep}</p>
                            {app.nextStepDate && (
                              <span className="text-[10px] text-indigo-400 block pt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {app.nextStepDate}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Notes */}
                        {app.notes && (
                          <p className="text-[11px] text-slate-400 line-clamp-2 italic leading-tight bg-slate-950/40 p-1.5 rounded border border-slate-850">
                            &ldquo;{app.notes}&rdquo;
                          </p>
                        )}

                        {/* Stage Selector Dropdown */}
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium text-[10px] uppercase">Stage:</span>
                          <select
                            value={app.stage}
                            onChange={(e) => handleStageChange(app.id, e.target.value as ApplicationStage)}
                            aria-label={`Update stage for ${app.company}`}
                            className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                          >
                            <option value="saved">Saved</option>
                            <option value="interested">Interested</option>
                            <option value="applied">Applied</option>
                            <option value="screening">Screening</option>
                            <option value="technical">Technical</option>
                            <option value="interview">Interview</option>
                            <option value="offer">Offer</option>
                            <option value="rejected">Closed</option>
                            <option value="archived">Archived</option>
                          </select>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

        {/* Add Application Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Add Job Application"
          description="Log an opportunity you are pursuing into your local pipeline tracker."
          maxWidth="md"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Company / Organization *</label>
                <input
                  type="text"
                  placeholder="e.g. OpenAI, Stripe, Google"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Role Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Junior Data Analyst"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Initial Stage</label>
                <select
                  value={newStage}
                  onChange={(e) => setNewStage(e.target.value as ApplicationStage)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="applied">Applied (Submitted)</option>
                  <option value="interested">Interested / Preparing</option>
                  <option value="screening">Recruiter Screening</option>
                  <option value="technical">Technical Loop</option>
                  <option value="interview">Final Interview</option>
                  <option value="offer">Offer Received</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Salary Range (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. $85,000 - $105,000"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Next Action (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Follow up on LinkedIn, complete coding challenge"
                value={newNextStep}
                onChange={(e) => setNewNextStep(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Notes (Optional)</label>
              <textarea
                rows={3}
                placeholder="Recruiter contact, resume draft used, application link..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
              />
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
                Save Application
              </Button>
            </div>
          </form>
        </Modal>

        {/* Edit Application Modal */}
        <EditApplicationModal
          isOpen={!!editingApplication}
          onClose={() => setEditingApplication(null)}
          application={editingApplication}
          onUpdateApplication={handleUpdateApplication}
          onDeleteApplication={handleDeleteApplication}
        />
      </div>
    </AppLayout>
  );
};
