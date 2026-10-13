"use client";

import React, { useState, useEffect } from "react";
import { Opportunity } from "@/types/opportunity";
import { ApplicationStage } from "@/types/application";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export interface TrackApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  onSaveApplication: (applicationData: {
    opportunityId?: string;
    company: string;
    role: string;
    stage: ApplicationStage;
    salaryRange?: string;
    notes: string;
    nextStep?: string;
    nextStepDate?: string;
    appliedDate?: string;
  }) => Promise<void>;
}

export const TrackApplicationModal: React.FC<TrackApplicationModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  onSaveApplication,
}) => {
  const [stage, setStage] = useState<ApplicationStage>("applied");
  const [appliedDate, setAppliedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [nextStepDate, setNextStepDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (opportunity) {
      setNotes(`Targeting ${opportunity.title} at ${opportunity.organization}. Match score: ${opportunity.matchScore}%.`);
      setNextStep("Review technical requirements and prepare portfolio demo");
      setStage("applied");
      setAppliedDate(new Date().toISOString().split("T")[0]);
    }
  }, [opportunity, isOpen]);

  if (!opportunity) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onSaveApplication({
        opportunityId: opportunity.id,
        company: opportunity.organization,
        role: opportunity.title,
        stage,
        salaryRange: opportunity.salaryRange,
        notes: notes.trim(),
        nextStep: nextStep.trim() || undefined,
        nextStepDate: nextStepDate.trim() || undefined,
        appliedDate: appliedDate || new Date().toISOString(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Track in Application Pipeline"
      description={`Record this application for ${opportunity.organization} in your Kanban tracker.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-slate-300 mb-1">Target Position</label>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-white font-medium">
            {opportunity.title} — {opportunity.organization}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Pipeline Stage</label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value as ApplicationStage)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="saved">Saved / Bookmarked</option>
              <option value="interested">Interested</option>
              <option value="applied">Applied (Submitted)</option>
              <option value="screening">Recruiter Screening</option>
              <option value="technical">Technical Loop</option>
              <option value="interview">Final Interview</option>
              <option value="offer">Offer Received</option>
              <option value="rejected">Closed / Rejected</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Application Date</label>
            <input
              type="date"
              value={appliedDate}
              onChange={(e) => setAppliedDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Next Action or Milestone (Optional)</label>
            <input
              type="text"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="e.g. Coding test, Recruiter sync"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Target Date (Optional)</label>
            <input
              type="date"
              value={nextStepDate}
              onChange={(e) => setNextStepDate(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Personal Notes & Context</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Interview notes, resume draft used, recruiter contacts, or feedback..."
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Add to Tracker
          </Button>
        </div>
      </form>
    </Modal>
  );
};
