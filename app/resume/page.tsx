"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { ResumeDashboard } from "@/features/resume/resume-dashboard";
import { ResumeWizard } from "@/features/resume/resume-wizard";
import { ResumeEditor } from "@/features/resume/resume-editor";
import { ResumePreview } from "@/features/resume/resume-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  profileRepo,
  skillRepo,
  resumeRepo,
  activityRepo,
} from "@/lib/repositories/local-repos";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { ResumeDraft, ResumeTemplate } from "@/types/resume";
import { DEMO_PROFILE } from "@/lib/demo/seed-data";
import {
  ArrowLeft,
  Eye,
  Edit3,
  Check,
  Save,
  Printer,
} from "lucide-react";

type PageViewMode = "dashboard" | "wizard" | "editor" | "preview";

function ResumePageContent() {
  const searchParams = useSearchParams();

  const [resumes, setResumes] = useState<ResumeDraft[]>([]);
  const [profile, setProfile] = useState<CandidateProfile>(DEMO_PROFILE);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [activeDraft, setActiveDraft] = useState<ResumeDraft | null>(null);
  const [viewMode, setViewMode] = useState<PageViewMode>("dashboard");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [allResumes, currentProfile, allSkills] = await Promise.all([
        resumeRepo.getResumes(),
        profileRepo.getProfile(),
        skillRepo.getSkills(),
      ]);

      setResumes(allResumes);
      setProfile(currentProfile);
      setSkills(allSkills);

      // Check if draftId was provided in search parameters
      const draftIdParam = searchParams.get("draftId");
      const modeParam = searchParams.get("mode") as PageViewMode | null;

      if (draftIdParam) {
        const found = allResumes.find((r) => r.id === draftIdParam);
        if (found) {
          setActiveDraft(found);
          setViewMode(modeParam === "preview" ? "preview" : "editor");
          return;
        }
      }

      if (modeParam === "wizard") {
        setViewMode("wizard");
      }
    } catch (err) {
      console.error("Failed to load resume builder data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save changes to active draft
  const handleSaveActiveDraft = async (updatedDraft?: ResumeDraft) => {
    const draftToSave = updatedDraft || activeDraft;
    if (!draftToSave) return;

    try {
      setIsSaving(true);
      const saved = await resumeRepo.saveResume(draftToSave);
      setActiveDraft(saved);
      setResumes((prev) => prev.map((r) => (r.id === saved.id ? saved : r)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);

      await activityRepo.logActivity({
        type: "resume",
        title: `Updated resume draft: ${saved.title}`,
        description: `Targeting ${saved.targetRole} (${saved.template} template).`,
        routeLink: `/resume?draftId=${saved.id}`,
        tag: "Resume Builder",
      });
    } catch (err) {
      console.error("Failed to save draft:", err);
    } finally {
      setIsSaving(false);
    }
  };

  // Create new draft from wizard
  const handleWizardComplete = async (newDraft: ResumeDraft) => {
    const saved = await resumeRepo.saveResume(newDraft);
    setResumes((prev) => [saved, ...prev]);
    setActiveDraft(saved);
    setViewMode("editor");

    await activityRepo.logActivity({
      type: "resume",
      title: `Created new tailored resume: ${saved.title}`,
      description: `Targeting ${saved.targetRole}.`,
      routeLink: `/resume?draftId=${saved.id}`,
      tag: "Resume Builder",
    });
  };

  // Duplicate draft
  const handleDuplicateResume = async (id: string) => {
    const cloned = await resumeRepo.duplicateResume(id);
    setResumes((prev) => [cloned, ...prev]);
    await activityRepo.logActivity({
      type: "resume",
      title: `Duplicated resume draft: ${cloned.title}`,
      description: `Copy created for ${cloned.targetRole}.`,
      routeLink: `/resume?draftId=${cloned.id}`,
      tag: "Resume Builder",
    });
  };

  // Rename draft
  const handleRenameResume = async (id: string, newTitle: string) => {
    const updated = await resumeRepo.renameResume(id, newTitle);
    setResumes((prev) => prev.map((r) => (r.id === id ? updated : r)));
    if (activeDraft?.id === id) {
      setActiveDraft(updated);
    }
  };

  // Delete draft
  const handleDeleteResume = async (id: string) => {
    await resumeRepo.deleteResume(id);
    setResumes((prev) => prev.filter((r) => r.id !== id));
    if (activeDraft?.id === id) {
      setActiveDraft(null);
      setViewMode("dashboard");
    }
    await activityRepo.logActivity({
      type: "resume",
      title: "Deleted resume draft",
      description: "Draft removed from local storage.",
      routeLink: "/resume",
      tag: "Resume Builder",
    });
  };

  // Set primary draft
  const handleSetPrimary = async (id: string) => {
    const updated = await resumeRepo.setPrimaryResume(id);
    setResumes((prev) =>
      prev.map((r) => ({
        ...r,
        isPrimary: r.id === id,
      }))
    );
    if (activeDraft?.id === id) {
      setActiveDraft(updated);
    }
  };

  // Navigation helpers
  const openEditor = (draft: ResumeDraft) => {
    setActiveDraft(draft);
    setViewMode("editor");
  };

  const openPreview = (draft: ResumeDraft) => {
    setActiveDraft(draft);
    setViewMode("preview");
  };

  const returnToDashboard = () => {
    setViewMode("dashboard");
    setActiveDraft(null);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="h-64 flex items-center justify-center text-xs text-slate-400">
          Loading resume drafts and profile models...
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* 1. DASHBOARD VIEW */}
      {viewMode === "dashboard" && (
        <ResumeDashboard
          resumes={resumes}
          onCreateNew={() => setViewMode("wizard")}
          onEditResume={openEditor}
          onPreviewResume={openPreview}
          onDuplicateResume={handleDuplicateResume}
          onRenameResume={handleRenameResume}
          onDeleteResume={handleDeleteResume}
          onSetPrimaryResume={handleSetPrimary}
        />
      )}

      {/* 2. WIZARD VIEW */}
      {viewMode === "wizard" && (
        <div className="space-y-4">
          <ResumeWizard
            profile={profile}
            skills={skills}
            onComplete={handleWizardComplete}
            onCancel={returnToDashboard}
          />
        </div>
      )}

      {/* 3. EDITOR VIEW (Split Pane: Left Editor, Right Live Preview) */}
      {viewMode === "editor" && activeDraft && (
        <div className="space-y-4">
          {/* Top Navigation Sub-Header */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={returnToDashboard}
                className="text-xs text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                Drafts
              </Button>
              <div className="h-4 w-px bg-slate-800" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white tracking-tight">
                    {activeDraft.title}
                  </span>
                  {activeDraft.isPrimary && (
                    <Badge variant="indigo" size="sm">
                      Primary
                    </Badge>
                  )}
                </div>
                <span className="text-[11px] text-slate-400">
                  Target: <strong className="text-slate-300">{activeDraft.targetRole}</strong>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {saveSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-in fade-in">
                  <Check className="w-3.5 h-3.5" /> Saved to storage
                </span>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode("preview")}
                className="text-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                Full Preview
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => handleSaveActiveDraft()}
                isLoading={isSaving}
                className="text-xs"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                Save Draft
              </Button>
            </div>
          </div>

          {/* Editor & Preview Split Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[calc(100vh-14rem)]">
            {/* Left 6-7 cols: Interactive Editor */}
            <div className="xl:col-span-6 2xl:col-span-6 flex flex-col">
              <ResumeEditor
                draft={activeDraft}
                onChange={(updated) => {
                  setActiveDraft(updated);
                  // Update resumes array in memory
                  setResumes((prev) =>
                    prev.map((r) => (r.id === updated.id ? updated : r))
                  );
                }}
                onSave={() => handleSaveActiveDraft()}
                isSaving={isSaving}
              />
            </div>

            {/* Right 5-6 cols: Live Print-Accurate Preview */}
            <div className="xl:col-span-6 2xl:col-span-6 flex flex-col">
              <ResumePreview
                draft={activeDraft}
                onTemplateChange={(tmpl: ResumeTemplate) => {
                  const updated = {
                    ...activeDraft,
                    template: tmpl,
                    lastModified: new Date().toISOString(),
                  };
                  setActiveDraft(updated);
                  setResumes((prev) =>
                    prev.map((r) => (r.id === updated.id ? updated : r))
                  );
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. DEDICATED PREVIEW VIEW */}
      {viewMode === "preview" && activeDraft && (
        <div className="space-y-4">
          {/* Top Sub-Header */}
          <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("editor")}
                className="text-xs text-slate-400 hover:text-white"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1" />
                Back to Editor
              </Button>
              <div className="h-4 w-px bg-slate-800" />
              <Button
                variant="ghost"
                size="sm"
                onClick={returnToDashboard}
                className="text-xs text-slate-400 hover:text-white"
              >
                All Drafts
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  if (typeof window !== "undefined") {
                    window.print();
                  }
                }}
                className="text-xs shadow-sm font-medium"
              >
                <Printer className="w-3.5 h-3.5 mr-1" />
                Print / Save PDF
              </Button>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            <ResumePreview
              draft={activeDraft}
              onTemplateChange={(tmpl: ResumeTemplate) => {
                const updated = {
                  ...activeDraft,
                  template: tmpl,
                  lastModified: new Date().toISOString(),
                };
                setActiveDraft(updated);
                setResumes((prev) =>
                  prev.map((r) => (r.id === updated.id ? updated : r))
                );
              }}
            />
          </div>
        </div>
      )}
    </AppLayout>
  );
}

export default function ResumePage() {
  return (
    <Suspense
      fallback={
        <AppLayout>
          <div className="h-64 flex items-center justify-center text-xs text-slate-400">
            Loading Resume Builder...
          </div>
        </AppLayout>
      }
    >
      <ResumePageContent />
    </Suspense>
  );
}
