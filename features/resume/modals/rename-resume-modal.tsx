import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { ResumeDraft } from "@/types/resume";

export interface RenameResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newTitle: string) => void;
  resume: ResumeDraft | null;
}

export const RenameResumeModal: React.FC<RenameResumeModalProps> = ({
  isOpen,
  onClose,
  onRename,
  resume,
}) => {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (resume) {
      setTitle(resume.title);
    }
  }, [resume, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onRename(title.trim());
      onClose();
    }
  };

  if (!resume) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rename Resume Draft"
      description="Update the display name of this resume draft variant."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="rename-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
            Draft Title
          </label>
          <input
            id="rename-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            placeholder="e.g. Data Analyst Internship Draft v2"
            autoFocus
          />
        </div>

        <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={!title.trim()}>
            Save Title
          </Button>
        </div>
      </form>
    </Modal>
  );
};
