"use client";

import React, { useState } from "react";
import { RoadmapMilestone, MilestoneStatus } from "@/types/roadmap";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Circle,
  Clock,
  ExternalLink,
  Target,
  BookOpen,
  FileText,
  Plus,
  Save,
  Check,
  FolderGit2,
} from "lucide-react";

export interface MilestoneCardProps {
  milestone: RoadmapMilestone;
  onToggleAction: (milestoneId: string, actionId: string) => void;
  onUpdateStatus: (milestoneId: string, newStatus: MilestoneStatus) => void;
  onSaveNotes: (milestoneId: string, notes: string) => void;
  onAddActionItem?: (milestoneId: string, actionTitle: string) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({
  milestone,
  onToggleAction,
  onUpdateStatus,
  onSaveNotes,
  onAddActionItem,
}) => {
  const [notes, setNotes] = useState(milestone.userNotes || "");
  const [isNotesSaved, setIsNotesSaved] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemText, setNewItemText] = useState("");

  const isCompleted = milestone.status === "completed";
  const isInProgress = milestone.status === "in_progress";

  const handleNotesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveNotes(milestone.id, notes);
    setIsNotesSaved(true);
    setTimeout(() => setIsNotesSaved(false), 2000);
  };

  const handleAddCustomAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim() || !onAddActionItem) return;
    onAddActionItem(milestone.id, newItemText.trim());
    setNewItemText("");
    setIsAddingItem(false);
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="amber" size="sm">High Priority</Badge>;
      case "low":
        return <Badge variant="neutral" size="sm">Lower Priority</Badge>;
      default:
        return <Badge variant="indigo" size="sm">Medium Priority</Badge>;
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 border ${
        isInProgress
          ? "border-indigo-500/60 bg-slate-900/90 shadow-lg shadow-indigo-950/20"
          : isCompleted
          ? "border-emerald-800/40 bg-slate-950/80"
          : "border-slate-800/70 bg-slate-950/50"
      }`}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                isCompleted
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                  : isInProgress
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              {milestone.phaseNumber}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {milestone.phaseTitle}
                </span>
                {getPriorityBadge(milestone.priority)}
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {milestone.title}
              </h3>
            </div>
          </div>

          {/* Status Dropdown & Timeline */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={milestone.status}
              onChange={(e) => onUpdateStatus(milestone.id, e.target.value as MilestoneStatus)}
              aria-label={`Update status for ${milestone.title}`}
              className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 font-medium focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="upcoming">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <span className="text-xs text-slate-400 flex items-center gap-1 font-mono whitespace-nowrap bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              ~{milestone.estimatedWeeks}w (Est)
            </span>
          </div>
        </div>

        {/* Objective Description */}
        <p className="text-xs text-slate-300 leading-relaxed">
          {milestone.description}
        </p>

        {/* Milestone Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Milestone Action Progress</span>
            <span className="font-semibold text-slate-200">
              {milestone.progressPercentage}%
            </span>
          </div>
          <Progress
            value={milestone.progressPercentage}
            size="sm"
            indicatorClassName={
              isCompleted
                ? "bg-emerald-500"
                : "bg-gradient-to-r from-indigo-500 to-cyan-500"
            }
          />
        </div>

        {/* Completion Criteria & Suggested Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {milestone.completionCriteria && (
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                Completion Criteria:
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {milestone.completionCriteria}
              </p>
            </div>
          )}

          {milestone.suggestedProject && (
            <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5 text-[11px]">
                <FolderGit2 className="w-3.5 h-3.5 text-indigo-400" />
                Suggested Deliverable:
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                {milestone.suggestedProject}
              </p>
            </div>
          )}
        </div>

        {/* Action Items Checklist */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">
              Step-by-Step Action Tasks ({milestone.actionItems.filter((a) => a.completed).length} / {milestone.actionItems.length}):
            </span>
            {onAddActionItem && !isAddingItem && (
              <button
                type="button"
                onClick={() => setIsAddingItem(true)}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Custom Task
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {milestone.actionItems.map((act) => (
              <div
                key={act.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-950/70 hover:bg-slate-900/90 border border-slate-800/80 transition-colors text-xs"
              >
                <button
                  type="button"
                  onClick={() => onToggleAction(milestone.id, act.id)}
                  className="flex items-start gap-2.5 text-left flex-1 group"
                >
                  {act.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="w-4 h-4 text-slate-500 group-hover:text-slate-300 shrink-0 mt-0.5" />
                  )}
                  <span
                    className={
                      act.completed
                        ? "text-slate-400 line-through leading-relaxed"
                        : "text-slate-200 leading-relaxed"
                    }
                  >
                    {act.title}
                  </span>
                </button>

                {/* Known Resource Link */}
                {act.resourceUrl && (
                  <a
                    href={act.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-[11px] text-indigo-400 hover:text-indigo-300 bg-indigo-950/50 hover:bg-indigo-900/50 px-2 py-0.5 rounded border border-indigo-800/50 flex items-center gap-1 transition-colors"
                    title={`Open resource: ${act.resourceTitle || act.resourceUrl}`}
                  >
                    <BookOpen className="w-3 h-3" />
                    <span>{act.resourceTitle || "Resource"}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Add custom action input form */}
          {isAddingItem && (
            <form onSubmit={handleAddCustomAction} className="pt-1 flex items-center gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                placeholder="e.g. Complete chapter 4 of SQL practical exercises"
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <Button type="submit" variant="primary" size="sm" className="text-xs">
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemText("");
                }}
                className="text-xs"
              >
                Cancel
              </Button>
            </form>
          )}
        </div>

        {/* Skills Addressed Badges */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 mr-1">Target Competencies:</span>
          {milestone.skillsAddressed.map((s) => (
            <span
              key={s}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800 font-medium"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Personal Study Notes Section */}
        <div className="pt-2 border-t border-slate-800/60">
          <form onSubmit={handleNotesSubmit} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Personal Study Notes & Progress Log:
              </span>
              <Button
                type="submit"
                variant="ghost"
                size="sm"
                className="text-[11px] h-7 px-2 text-indigo-400 hover:text-indigo-300"
              >
                {isNotesSaved ? (
                  <>
                    <Check className="w-3 h-3 mr-1 text-emerald-400" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-3 h-3 mr-1" />
                    Save Notes
                  </>
                )}
              </Button>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record your learning notes, repository URLs, interview takeaways, or blocker notes for this phase..."
              rows={2}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </form>
        </div>
      </div>
    </Card>
  );
};
