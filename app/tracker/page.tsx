"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { applicationRepo, activityRepo } from "@/lib/repositories/local-repos";
import { JobApplication, ApplicationStage } from "@/types/application";
import { Plus } from "lucide-react";

const STAGES: { key: ApplicationStage; label: string; color: "neutral" | "cyan" | "indigo" | "emerald" }[] = [
  { key: "applied", label: "Applied", color: "neutral" },
  { key: "screening", label: "Recruiter Screen", color: "cyan" },
  { key: "technical", label: "Technical Loop", color: "indigo" },
  { key: "offer", label: "Offer Extended", color: "emerald" },
];

export default function TrackerPage() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newSalary, setNewSalary] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const loadApplications = async () => {
    const list = await applicationRepo.getApplications();
    setApplications(list);
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleStageChange = async (id: string, newStage: ApplicationStage) => {
    const updated = await applicationRepo.updateApplicationStage(id, newStage);
    await activityRepo.logActivity({
      type: "application",
      title: `Moved ${updated.company} to ${newStage}`,
      description: `Role: ${updated.role}`,
      routeLink: "/tracker",
      tag: "Tracker",
    });
    loadApplications();
  };

  const handleAddApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newRole.trim()) return;

    await applicationRepo.addApplication({
      company: newCompany.trim(),
      role: newRole.trim(),
      stage: "applied",
      salaryRange: newSalary.trim() || undefined,
      notes: newNotes.trim() || "Manually logged application.",
    });

    await activityRepo.logActivity({
      type: "application",
      title: `Added application for ${newRole}`,
      description: `Company: ${newCompany}`,
      routeLink: "/tracker",
      tag: "Application Tracker",
    });

    setNewCompany("");
    setNewRole("");
    setNewSalary("");
    setNewNotes("");
    setIsAddModalOpen(false);
    loadApplications();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Application Tracker</h1>
              <Badge variant="cyan" size="sm">
                Stage 5 Preview
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Manage your interview pipeline, track recruiter feedback, and record next round timelines.
            </p>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsAddModalOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Application
          </Button>
        </div>

        {/* Pipeline Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {STAGES.map((stage) => {
            const stageApps = applications.filter((a) => a.stage === stage.key);
            return (
              <div key={stage.key} className="flex flex-col space-y-3">
                <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
                  <div className="flex items-center gap-2">
                    <span>{stage.label}</span>
                    <Badge variant={stage.color} size="sm">
                      {stageApps.length}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 min-h-[300px] p-2 rounded-xl bg-slate-950/40 border border-slate-900">
                  {stageApps.length === 0 ? (
                    <div className="h-28 flex items-center justify-center text-slate-600 text-xs text-center p-2">
                      No applications in this stage
                    </div>
                  ) : (
                    stageApps.map((app) => (
                      <Card
                        key={app.id}
                        className="p-3.5 bg-slate-900/90 border-slate-800/90 hover:border-slate-700 transition-colors shadow-xs"
                      >
                        <div className="space-y-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
                              {app.company}
                            </span>
                            <h4 className="text-xs font-semibold text-white leading-tight mt-0.5">
                              {app.role}
                            </h4>
                          </div>

                          {app.salaryRange && (
                            <span className="text-[11px] text-emerald-400 font-medium block">
                              {app.salaryRange}
                            </span>
                          )}

                          {app.nextStep && (
                            <div className="p-2 rounded bg-indigo-950/40 border border-indigo-900/60 text-[11px] text-indigo-300 space-y-0.5">
                              <span className="font-semibold block text-[10px] uppercase text-indigo-400">
                                Next Action:
                              </span>
                              <p className="line-clamp-2 leading-tight">{app.nextStep}</p>
                              {app.nextStepDate && (
                                <span className="text-[10px] text-indigo-400 block pt-0.5">
                                  📅 {app.nextStepDate}
                                </span>
                              )}
                            </div>
                          )}

                          {app.notes && (
                            <p className="text-[11px] text-slate-400 line-clamp-2 italic leading-tight">
                              &ldquo;{app.notes}&rdquo;
                            </p>
                          )}

                          {/* Stage Transition Selector */}
                          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">Move:</span>
                            <select
                              value={app.stage}
                              onChange={(e) =>
                                handleStageChange(app.id, e.target.value as ApplicationStage)
                              }
                              className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[10px] text-slate-300 focus:outline-none"
                            >
                              <option value="applied">Applied</option>
                              <option value="screening">Screening</option>
                              <option value="technical">Technical</option>
                              <option value="offer">Offer</option>
                            </select>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Application Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add Job Application"
        description="Record a job application to track in this browser session."
      >
        <form onSubmit={handleAddApplication} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Company</label>
            <input
              type="text"
              placeholder="e.g. OpenAI (Demo)"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Role Title</label>
            <input
              type="text"
              placeholder="e.g. Staff AI Solutions Architect"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Salary Range (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. $190,000 - $220,000"
              value={newSalary}
              onChange={(e) => setNewSalary(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Notes</label>
            <textarea
              rows={3}
              placeholder="Referrals, recruiter names, or interview feedback..."
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
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
    </AppLayout>
  );
}
