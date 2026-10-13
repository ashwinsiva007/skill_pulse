import React, { useState } from "react";
import { ResumeDraft } from "@/types/resume";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { DeleteResumeModal } from "./modals/delete-resume-modal";
import { RenameResumeModal } from "./modals/rename-resume-modal";
import {
  Plus,
  FileText,
  Copy,
  Edit3,
  Eye,
  Trash2,
  Star,
  Search,
  Filter,
  Calendar,
} from "lucide-react";

export interface ResumeDashboardProps {
  resumes: ResumeDraft[];
  onCreateNew: () => void;
  onEditResume: (draft: ResumeDraft) => void;
  onPreviewResume: (draft: ResumeDraft) => void;
  onDuplicateResume: (id: string) => Promise<void>;
  onRenameResume: (id: string, newTitle: string) => Promise<void>;
  onDeleteResume: (id: string) => Promise<void>;
  onSetPrimaryResume: (id: string) => Promise<void>;
}

export const ResumeDashboard: React.FC<ResumeDashboardProps> = ({
  resumes,
  onCreateNew,
  onEditResume,
  onPreviewResume,
  onDuplicateResume,
  onRenameResume,
  onDeleteResume,
  onSetPrimaryResume,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [targetDraft, setTargetDraft] = useState<ResumeDraft | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract unique roles for filtering
  const uniqueRoles = Array.from(new Set(resumes.map((r) => r.targetRole).filter(Boolean)));

  // Filtered drafts
  const filteredResumes = resumes.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.summary && r.summary.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      selectedRoleFilter === "all" || r.targetRole === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  const handleDeleteClick = (draft: ResumeDraft) => {
    setTargetDraft(draft);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (targetDraft) {
      try {
        setIsDeleting(true);
        await onDeleteResume(targetDraft.id);
        setDeleteModalOpen(false);
      } finally {
        setIsDeleting(false);
        setTargetDraft(null);
      }
    }
  };

  const handleRenameClick = (draft: ResumeDraft) => {
    setTargetDraft(draft);
    setRenameModalOpen(true);
  };

  const handleConfirmRename = async (newTitle: string) => {
    if (targetDraft) {
      await onRenameResume(targetDraft.id, newTitle);
      setRenameModalOpen(false);
      setTargetDraft(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">Resume Builder</h1>
            <Badge variant="cyan" size="sm">
              Stage 3
            </Badge>
          </div>
          <p className="text-xs text-slate-400">
            Create, edit, duplicate, and export role-tailored ATS-conscious resumes for multiple targets.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="primary" size="md" onClick={onCreateNew}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create New Resume
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search drafts by title or target role..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
          />
        </div>

        {/* Role Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            onClick={() => setSelectedRoleFilter("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedRoleFilter === "all"
                ? "bg-indigo-600 text-white"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            All Roles ({resumes.length})
          </button>
          {uniqueRoles.map((role) => (
            <button
              key={role}
              onClick={() => setSelectedRoleFilter(role)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                selectedRoleFilter === role
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Resume Drafts Grid */}
      {filteredResumes.length === 0 ? (
        <div className="p-10 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">No Resume Drafts Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedRoleFilter !== "all"
                ? "No drafts matched your search filter criteria. Try clearing filters or searching for another term."
                : "You don't have any resume drafts yet. Create your first draft to tailor and export a professional resume."}
            </p>
          </div>
          <div className="pt-2">
            <Button variant="primary" size="sm" onClick={onCreateNew}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Create First Resume
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredResumes.map((draft) => {
            const templateLabel =
              draft.template === "technical"
                ? "Technical / Projects"
                : draft.template === "modern"
                ? "Modern Minimal"
                : "Classic Professional";

            return (
              <Card
                key={draft.id}
                className="flex flex-col justify-between hover:border-slate-700 transition-all group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <CardTitle className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                      {draft.title}
                    </CardTitle>
                    {draft.isPrimary && (
                      <Badge variant="indigo" size="sm" className="shrink-0">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-slate-400">
                    Target: <strong className="text-slate-200">{draft.targetRole}</strong>
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    {/* Status & Template Meta */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800">
                      <span>Template:</span>
                      <span className="font-semibold text-slate-300">{templateLabel}</span>
                    </div>

                    {/* Progress / Completion Meters */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">Completeness</span>
                        <span className="font-bold text-emerald-400">
                          {draft.completionPercentage}%
                        </span>
                      </div>
                      <Progress
                        value={draft.completionPercentage}
                        size="sm"
                        indicatorClassName="bg-emerald-500"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-400">ATS Alignment Heuristic</span>
                        <span className="font-bold text-indigo-400">{draft.atsScore}%</span>
                      </div>
                      <Progress value={draft.atsScore} size="sm" />
                    </div>

                    {/* Summary Excerpt */}
                    {draft.summary && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 italic bg-slate-950/60 p-2 rounded border border-slate-850">
                        &ldquo;{draft.summary}&rdquo;
                      </p>
                    )}

                    {/* Last Modified */}
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                      <Calendar className="w-3 h-3" />
                      <span>Updated {formatDate(draft.lastModified)}</span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-slate-800/90 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => onEditResume(draft)}
                        className="text-xs font-medium"
                      >
                        <Edit3 className="w-3.5 h-3.5 mr-1" />
                        Edit Draft
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPreviewResume(draft)}
                        className="text-xs"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Preview & PDF
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => onDuplicateResume(draft.id)}
                          className="hover:text-white p-1 rounded text-slate-400 hover:bg-slate-800 transition-colors"
                          title="Duplicate draft"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRenameClick(draft)}
                          className="hover:text-white p-1 rounded text-slate-400 hover:bg-slate-800 transition-colors"
                          title="Rename draft"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {!draft.isPrimary && (
                          <button
                            type="button"
                            onClick={() => onSetPrimaryResume(draft.id)}
                            className="hover:text-amber-400 p-1 rounded text-slate-400 hover:bg-slate-800 transition-colors"
                            title="Set as primary resume"
                          >
                            <Star className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(draft)}
                        className="hover:text-rose-400 p-1 rounded text-slate-500 hover:bg-rose-950/30 transition-colors flex items-center gap-1"
                        title="Delete draft"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteResumeModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        resume={targetDraft}
        isDeleting={isDeleting}
      />

      {/* Rename Modal */}
      <RenameResumeModal
        isOpen={renameModalOpen}
        onClose={() => setRenameModalOpen(false)}
        onRename={handleConfirmRename}
        resume={targetDraft}
      />
    </div>
  );
};
