import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { ResumeDraft } from "@/types/resume";

export interface DeleteResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  resume: ResumeDraft | null;
  isDeleting?: boolean;
}

export const DeleteResumeModal: React.FC<DeleteResumeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  resume,
  isDeleting,
}) => {
  if (!resume) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Resume Draft"
      description="This action will permanently delete this resume variant from your local browser storage."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-800/50 flex items-start gap-3 text-xs text-rose-300">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-rose-200">Confirm Deletion</p>
            <p>
              Are you sure you want to delete <strong className="text-white">&quot;{resume.title}&quot;</strong>?
              Other drafts and your core profile data will remain untouched.
            </p>
          </div>
        </div>

        <div className="flex justify-end items-center gap-2 pt-2 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={onConfirm} isLoading={isDeleting}>
            Delete Draft
          </Button>
        </div>
      </div>
    </Modal>
  );
};
