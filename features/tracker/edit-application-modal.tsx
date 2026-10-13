"use client";

import React, { useState, useEffect } from "react";
import { JobApplication, ApplicationStage } from "@/types/application";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

export interface EditApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication | null;
  onUpdateApplication: (id: string, updates: Partial<JobApplication>) => Promise<void>;
  onDeleteApplication: (id: string) => Promise<void>;
}

export const EditApplicationModal: React.FC<EditApplicationModalProps> = ({
  isOpen,
  onClose,
  application,
  onUpdateApplication,
  onDeleteApplication,
}) => {
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [stage, setStage] = useState<ApplicationStage>("applied");
  const [salaryRange, setSalaryRange] = useState("");
  const [notes, setNotes] = useState("");
  const [nextStep, setNextStep] = useState("");
  const [nextStepDate, setNextStepDate] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (application) {
      setCompany(application.company || "");
      setRole(application.role || "");
      setStage(application.stage || "applied");
      setSalaryRange(application.salaryRange || "");
      setNotes(application.notes || "");
      setNextStep(application.nextStep || "");
      setNextStepDate(application.nextStepDate || "");
      setContactPerson(application.contactPerson || "");
    }
  }, [application, isOpen]);

  if (!application) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onUpdateApplication(application.id, {
        company: company.trim(),
        role: role.trim(),
        stage,
        salaryRange: salaryRange.trim() || undefined,
        notes: notes.trim(),
        nextStep: nextStep.trim() || undefined,
        nextStepDate: nextStepDate.trim() || undefined,
        contactPerson: contactPerson.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the application for ${application.company}?`)) {
      try {
        setIsDeleting(true);
        await onDeleteApplication(application.id);
        onClose();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Application Entry"
      description={`Update status, interview notes, and timeline for ${application.company}.`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Company / Organization</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Role Title</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
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
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Salary Range / Offer</label>
            <input
              type="text"
              value={salaryRange}
              onChange={(e) => setSalaryRange(e.target.value)}
              placeholder="e.g. $110,000 - $130,000"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Next Action or Milestone</label>
            <input
              type="text"
              value={nextStep}
              onChange={(e) => setNextStep(e.target.value)}
              placeholder="e.g. Take-home assignment due"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Next Action Date / Time</label>
            <input
              type="text"
              value={nextStepDate}
              onChange={(e) => setNextStepDate(e.target.value)}
              placeholder="e.g. Friday at 2:00 PM EST"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Contact Person / Recruiter (Optional)</label>
          <input
            type="text"
            value={contactPerson}
            onChange={(e) => setContactPerson(e.target.value)}
            placeholder="e.g. Jane Doe (Technical Recruiter)"
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-300 mb-1">Interview Notes & Reflection</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Feedback received, technical questions asked, next preparation tasks..."
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-slate-200 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting || isSubmitting}
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 text-xs"
          >
            Delete Application
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
