import React, { useState } from "react";
import {
  ResumeDraft,
  ResumeContent,
  ResumeSectionId,
  ResumeProjectEntry,
  ResumeExperienceEntry,
  ResumeEducationEntry,
  ResumeCertificationEntry,
  ResumeAchievementEntry,
  ResumeCourseworkEntry,
} from "@/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BulletHelperModal } from "./modals/bullet-helper-modal";
import { JobDescriptionModal } from "./modals/job-description-modal";
import {
  User,
  FileText,
  Cpu,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Trophy,
  BookOpen,
  SlidersHorizontal,
  ChevronDown,
  Plus,
  Trash2,
  Sparkles,
  Search,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

export interface ResumeEditorProps {
  draft: ResumeDraft;
  onChange: (updatedDraft: ResumeDraft) => void;
  onSave?: () => void;
  isSaving?: boolean;
}

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  draft,
  onChange,
  onSave,
  isSaving,
}) => {
  const [activeSection, setActiveSection] = useState<ResumeSectionId>("contact");
  const [bulletHelperOpen, setBulletHelperOpen] = useState(false);
  const [bulletHelperContext, setBulletHelperContext] = useState<{
    title: string;
    targetType: "project" | "experience";
    targetId: string;
  } | null>(null);

  const [jobDescModalOpen, setJobDescModalOpen] = useState(false);

  const content = draft.content;

  const updateContent = (partialContent: Partial<ResumeContent>) => {
    const updatedContent = { ...content, ...partialContent };
    onChange({
      ...draft,
      content: updatedContent,
      lastModified: new Date().toISOString(),
    });
  };

  const updateContact = (field: keyof ResumeContent["contact"], val: string) => {
    updateContent({
      contact: { ...content.contact, [field]: val },
    });
  };

  const handleOpenBulletHelper = (
    title: string,
    targetType: "project" | "experience",
    targetId: string
  ) => {
    setBulletHelperContext({ title, targetType, targetId });
    setBulletHelperOpen(true);
  };

  const handleApplyBullet = (newBullet: string) => {
    if (!bulletHelperContext) return;
    const { targetType, targetId } = bulletHelperContext;

    if (targetType === "project") {
      const updatedProjects = content.projects.map((p) =>
        p.id === targetId ? { ...p, bullets: [...(p.bullets || []), newBullet] } : p
      );
      updateContent({ projects: updatedProjects });
    } else {
      const updatedExp = content.experience.map((e) =>
        e.id === targetId ? { ...e, bullets: [...(e.bullets || []), newBullet] } : e
      );
      updateContent({ experience: updatedExp });
    }
  };

  // Section visibility and reordering
  const toggleSectionVisibility = (secId: ResumeSectionId) => {
    const isVisible = content.sectionConfig.visible[secId] !== false;
    updateContent({
      sectionConfig: {
        ...content.sectionConfig,
        visible: {
          ...content.sectionConfig.visible,
          [secId]: !isVisible,
        },
      },
    });
  };

  const moveSectionOrder = (index: number, direction: "up" | "down") => {
    const order = [...content.sectionConfig.order];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= order.length) return;

    const temp = order[index];
    order[index] = order[targetIndex];
    order[targetIndex] = temp;

    updateContent({
      sectionConfig: {
        ...content.sectionConfig,
        order,
      },
    });
  };

  const sectionsList: { id: ResumeSectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "contact", label: "Contact Details", icon: User },
    { id: "summary", label: "Summary", icon: FileText },
    { id: "skills", label: "Skills", icon: Cpu },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "projects", label: "Projects", icon: FolderGit2 },
    { id: "education", label: "Education", icon: GraduationCap },
    { id: "certifications", label: "Certifications", icon: Award },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "coursework", label: "Coursework", icon: BookOpen },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      {/* Editor Top Bar */}
      <div className="p-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200">Resume Editor</span>
          <Badge variant="indigo" size="sm">
            {draft.targetRole}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setJobDescModalOpen(true)}
            className="text-xs"
          >
            <Search className="w-3.5 h-3.5 mr-1 text-cyan-400" />
            ATS Keyword Check
          </Button>

          {onSave && (
            <Button
              variant="primary"
              size="sm"
              onClick={onSave}
              isLoading={isSaving}
              className="text-xs"
            >
              Save Draft
            </Button>
          )}
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="px-3 pt-2 bg-slate-950/60 border-b border-slate-800 overflow-x-auto flex gap-1 scrollbar-none">
        {sectionsList.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          const isVisible = content.sectionConfig.visible[sec.id] !== false;

          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                isActive
                  ? "bg-slate-900 text-white border-indigo-500 font-semibold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border-transparent"
              } ${!isVisible ? "opacity-60 line-through" : ""}`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* CONTACT SECTION */}
        {activeSection === "contact" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Contact Information</h3>
                <p className="text-xs text-slate-400">Recruiter contact credentials displayed in the resume header.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={content.contact.fullName}
                  onChange={(e) => updateContact("fullName", e.target.value)}
                  placeholder="e.g. Ashwin Sivaram"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  value={content.contact.email}
                  onChange={(e) => updateContact("email", e.target.value)}
                  placeholder="e.g. yourname@example.com"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={content.contact.phone || ""}
                  onChange={(e) => updateContact("phone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location / City</label>
                <input
                  type="text"
                  value={content.contact.location || ""}
                  onChange={(e) => updateContact("location", e.target.value)}
                  placeholder="e.g. Coimbatore, Tamil Nadu, India"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn URL</label>
                <input
                  type="text"
                  value={content.contact.linkedInUrl || ""}
                  onChange={(e) => updateContact("linkedInUrl", e.target.value)}
                  placeholder="e.g. https://linkedin.com/in/yourprofile"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub URL</label>
                <input
                  type="text"
                  value={content.contact.githubUrl || ""}
                  onChange={(e) => updateContact("githubUrl", e.target.value)}
                  placeholder="e.g. https://github.com/yourusername"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Portfolio URL</label>
                <input
                  type="text"
                  value={content.contact.portfolioUrl || ""}
                  onChange={(e) => updateContact("portfolioUrl", e.target.value)}
                  placeholder="e.g. https://yourportfolio.dev"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* SUMMARY SECTION */}
        {activeSection === "summary" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Professional Summary</h3>
                <p className="text-xs text-slate-400">
                  Concise overview of your focus, academic strengths, and engineering domain.
                </p>
              </div>
            </div>

            <div>
              <textarea
                rows={5}
                value={content.summary}
                onChange={(e) => updateContent({ summary: e.target.value })}
                placeholder="Write your role-tailored professional summary..."
                className="w-full p-3 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tip: Keep summary to 2-4 sentences highlighting target role, key tech, and verifiable domain interests.
              </p>
            </div>
          </div>
        )}

        {/* SKILLS SECTION */}
        {activeSection === "skills" && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Categorized Skills</h3>
              <p className="text-xs text-slate-400">
                Comma-separated lists organized for maximum ATS readability.
              </p>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Technical & Programming Languages
                </label>
                <input
                  type="text"
                  value={content.skills.technical.join(", ")}
                  onChange={(e) =>
                    updateContent({
                      skills: {
                        ...content.skills,
                        technical: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g. Python, TypeScript, SQL, Next.js, FastAPI"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Developer Tools & Cloud Infrastructure
                </label>
                <input
                  type="text"
                  value={content.skills.tools.join(", ")}
                  onChange={(e) =>
                    updateContent({
                      skills: {
                        ...content.skills,
                        tools: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g. Docker, AWS, Git, GitHub Actions, Pinecone"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Soft Skills & Engineering Practices
                </label>
                <input
                  type="text"
                  value={content.skills.soft.join(", ")}
                  onChange={(e) =>
                    updateContent({
                      skills: {
                        ...content.skills,
                        soft: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      },
                    })
                  }
                  placeholder="e.g. Technical Documentation, Agile / Scrum, Problem Solving"
                  className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* EXPERIENCE SECTION */}
        {activeSection === "experience" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Work Experience & Internships</h3>
                <p className="text-xs text-slate-400">Highlight roles and responsibilities.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newExp: ResumeExperienceEntry = {
                    id: `exp-${Date.now()}`,
                    company: "",
                    role: "",
                    type: "Internship",
                    startDate: "",
                    endDate: "Present",
                    isCurrent: true,
                    bullets: [""],
                  };
                  updateContent({ experience: [newExp, ...content.experience] });
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Experience
              </Button>
            </div>

            {content.experience.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500">
                No experience entries added yet. Click &quot;Add Experience&quot; to add internships or roles.
              </div>
            ) : (
              <div className="space-y-4">
                {content.experience.map((exp, idx) => (
                  <div
                    key={exp.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-indigo-400">
                        Experience #{idx + 1}
                      </span>
                      <button
                        onClick={() => {
                          const updated = content.experience.filter((e) => e.id !== exp.id);
                          updateContent({ experience: updated });
                        }}
                        className="text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = content.experience.map((it) =>
                              it.id === exp.id ? { ...it, company: e.target.value } : it
                            );
                            updateContent({ experience: updated });
                          }}
                          placeholder="e.g. Swiggy / Zoho / Tech Solutions"
                          className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Role Title</label>
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => {
                            const updated = content.experience.map((it) =>
                              it.id === exp.id ? { ...it, role: e.target.value } : it
                            );
                            updateContent({ experience: updated });
                          }}
                          placeholder="e.g. Software Engineer Intern"
                          className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = content.experience.map((it) =>
                              it.id === exp.id ? { ...it, startDate: e.target.value } : it
                            );
                            updateContent({ experience: updated });
                          }}
                          placeholder="e.g. June 2024"
                          className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">End Date</label>
                        <input
                          type="text"
                          value={exp.endDate || ""}
                          onChange={(e) => {
                            const updated = content.experience.map((it) =>
                              it.id === exp.id ? { ...it, endDate: e.target.value } : it
                            );
                            updateContent({ experience: updated });
                          }}
                          placeholder="e.g. Present"
                          className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                        />
                      </div>
                    </div>

                    {/* Bullets List */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-slate-300">
                          Bullet Points ({exp.bullets?.length || 0})
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenBulletHelper(exp.company, "experience", exp.id)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 py-0.5 px-2"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          STAR Bullet Helper
                        </Button>
                      </div>

                      {exp.bullets?.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <textarea
                            rows={2}
                            value={b}
                            onChange={(e) => {
                              const newBullets = [...(exp.bullets || [])];
                              newBullets[bIdx] = e.target.value;
                              const updated = content.experience.map((it) =>
                                it.id === exp.id ? { ...it, bullets: newBullets } : it
                              );
                              updateContent({ experience: updated });
                            }}
                            className="flex-1 p-2 text-xs rounded bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newBullets = exp.bullets.filter((_, i) => i !== bIdx);
                              const updated = content.experience.map((it) =>
                                it.id === exp.id ? { ...it, bullets: newBullets } : it
                              );
                              updateContent({ experience: updated });
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newBullets = [
                            ...(exp.bullets || []),
                            "Executed technical responsibilities and collaborated with engineering team.",
                          ];
                          const updated = content.experience.map((it) =>
                            it.id === exp.id ? { ...it, bullets: newBullets } : it
                          );
                          updateContent({ experience: updated });
                        }}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Bullet Line
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROJECTS SECTION */}
        {activeSection === "projects" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Projects & Portfolio</h3>
                <p className="text-xs text-slate-400">
                  Highlight problem addressed, tools used, and verifiable outcomes.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newProj: ResumeProjectEntry = {
                    id: `proj-${Date.now()}`,
                    title: "",
                    technologies: [],
                    problem: "",
                    outcomes: "",
                    bullets: [""],
                  };
                  updateContent({ projects: [newProj, ...content.projects] });
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Project
              </Button>
            </div>

            {content.projects.length === 0 ? (
              <div className="p-6 text-center rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-500">
                No projects added yet. Click &quot;Add Project&quot; to highlight your coding work.
              </div>
            ) : (
              <div className="space-y-4">
                {content.projects.map((proj, idx) => (
                  <div
                    key={proj.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-indigo-400">
                        Project #{idx + 1}
                      </span>
                      <button
                        onClick={() => {
                          const updated = content.projects.filter((p) => p.id !== proj.id);
                          updateContent({ projects: updated });
                        }}
                        className="text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Project Title</label>
                        <input
                          type="text"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = content.projects.map((p) =>
                              p.id === proj.id ? { ...p, title: e.target.value } : p
                            );
                            updateContent({ projects: updated });
                          }}
                          placeholder="e.g. AI-Powered Skill Assessment Platform"
                          className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Technologies Used (Comma-separated)
                        </label>
                        <input
                          type="text"
                          value={proj.technologies.join(", ")}
                          onChange={(e) => {
                            const techs = e.target.value.split(",").map((s) => s.trim()).filter(Boolean);
                            const updated = content.projects.map((p) =>
                              p.id === proj.id ? { ...p, technologies: techs } : p
                            );
                            updateContent({ projects: updated });
                          }}
                          placeholder="e.g. React, Next.js, TypeScript, PostgreSQL, Docker"
                          className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">GitHub / Demo Link</label>
                        <input
                          type="text"
                          value={proj.link || ""}
                          onChange={(e) => {
                            const updated = content.projects.map((p) =>
                              p.id === proj.id ? { ...p, link: e.target.value } : p
                            );
                            updateContent({ projects: updated });
                          }}
                          placeholder="https://github.com/..."
                          className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">Year / Date</label>
                        <input
                          type="text"
                          value={proj.date || ""}
                          onChange={(e) => {
                            const updated = content.projects.map((p) =>
                              p.id === proj.id ? { ...p, date: e.target.value } : p
                            );
                            updateContent({ projects: updated });
                          }}
                          placeholder="e.g. 2025"
                          className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white"
                        />
                      </div>
                    </div>

                    {/* Bullets List */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-slate-300">
                          Bullet Points ({proj.bullets?.length || 0})
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenBulletHelper(proj.title, "project", proj.id)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 py-0.5 px-2"
                        >
                          <Sparkles className="w-3 h-3 mr-1" />
                          STAR Bullet Helper
                        </Button>
                      </div>

                      {proj.bullets?.map((b, bIdx) => (
                        <div key={bIdx} className="flex items-start gap-2">
                          <textarea
                            rows={2}
                            value={b}
                            onChange={(e) => {
                              const newBullets = [...(proj.bullets || [])];
                              newBullets[bIdx] = e.target.value;
                              const updated = content.projects.map((p) =>
                                p.id === proj.id ? { ...p, bullets: newBullets } : p
                              );
                              updateContent({ projects: updated });
                            }}
                            className="flex-1 p-2 text-xs rounded bg-slate-900 border border-slate-750 text-slate-200 focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newBullets = proj.bullets.filter((_, i) => i !== bIdx);
                              const updated = content.projects.map((p) =>
                                p.id === proj.id ? { ...p, bullets: newBullets } : p
                              );
                              updateContent({ projects: updated });
                            }}
                            className="text-slate-500 hover:text-rose-400 p-1"
                            title="Remove bullet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newBullets = [
                            ...(proj.bullets || []),
                            "Implemented key architecture components and documented system workflows.",
                          ];
                          const updated = content.projects.map((p) =>
                            p.id === proj.id ? { ...p, bullets: newBullets } : p
                          );
                          updateContent({ projects: updated });
                        }}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        <Plus className="w-3 h-3 mr-1" /> Add Bullet Line
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EDUCATION SECTION */}
        {activeSection === "education" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Education</h3>
                <p className="text-xs text-slate-400">Degrees, academic institutions, and graduation timelines.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newEdu: ResumeEducationEntry = {
                    id: `edu-${Date.now()}`,
                    institution: "",
                    degree: "",
                    fieldOfStudy: "",
                    startDate: "",
                    endDate: "",
                    gpa: "",
                    location: "",
                  };
                  updateContent({ education: [newEdu, ...content.education] });
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Education
              </Button>
            </div>

            <div className="space-y-4">
              {content.education.map((edu) => (
                <div key={edu.id} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-indigo-400">Academic Credential</span>
                    <button
                      onClick={() => {
                        const updated = content.education.filter((e) => e.id !== edu.id);
                        updateContent({ education: updated });
                      }}
                      className="text-slate-500 hover:text-rose-400 text-xs flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Institution</label>
                      <input
                        type="text"
                        value={edu.institution}
                        onChange={(e) => {
                          const updated = content.education.map((it) =>
                            it.id === edu.id ? { ...it, institution: e.target.value } : it
                          );
                          updateContent({ education: updated });
                        }}
                        placeholder="e.g. Anna University / IIT Madras"
                        className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = content.education.map((it) =>
                            it.id === edu.id ? { ...it, degree: e.target.value } : it
                          );
                          updateContent({ education: updated });
                        }}
                        placeholder="e.g. Bachelor of Technology (B.Tech)"
                        className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => {
                          const updated = content.education.map((it) =>
                            it.id === edu.id ? { ...it, fieldOfStudy: e.target.value } : it
                          );
                          updateContent({ education: updated });
                        }}
                        placeholder="e.g. Computer Science & Engineering"
                        className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Graduation Year / Date</label>
                      <input
                        type="text"
                        value={edu.endDate || ""}
                        onChange={(e) => {
                          const updated = content.education.map((it) =>
                            it.id === edu.id ? { ...it, endDate: e.target.value } : it
                          );
                          updateContent({ education: updated });
                        }}
                        placeholder="e.g. 2026"
                        className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">GPA (Optional)</label>
                      <input
                        type="text"
                        value={edu.gpa || ""}
                        onChange={(e) => {
                          const updated = content.education.map((it) =>
                            it.id === edu.id ? { ...it, gpa: e.target.value } : it
                          );
                          updateContent({ education: updated });
                        }}
                        placeholder="e.g. 8.5 / 10.0 CGPA"
                        className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Location</label>
                      <input
                        type="text"
                        value={edu.location || ""}
                        onChange={(e) => {
                          const updated = content.education.map((it) =>
                            it.id === edu.id ? { ...it, location: e.target.value } : it
                          );
                          updateContent({ education: updated });
                        }}
                        placeholder="e.g. Chennai, Tamil Nadu, India"
                        className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CERTIFICATIONS SECTION */}
        {activeSection === "certifications" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Certifications & Credentials</h3>
                <p className="text-xs text-slate-400">Industry certifications and verified achievements.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newCert: ResumeCertificationEntry = {
                    id: `cert-${Date.now()}`,
                    name: "",
                    issuer: "",
                    date: "",
                  };
                  updateContent({ certifications: [...content.certifications, newCert] });
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Certification
              </Button>
            </div>

            <div className="space-y-3">
              {content.certifications.map((c) => (
                <div key={c.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                    <input
                      type="text"
                      value={c.name}
                      onChange={(e) => {
                        const updated = content.certifications.map((it) =>
                          it.id === c.id ? { ...it, name: e.target.value } : it
                        );
                        updateContent({ certifications: updated });
                      }}
                      placeholder="e.g. AWS Certified Developer"
                      className="px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                    />
                    <input
                      type="text"
                      value={c.issuer}
                      onChange={(e) => {
                        const updated = content.certifications.map((it) =>
                          it.id === c.id ? { ...it, issuer: e.target.value } : it
                        );
                        updateContent({ certifications: updated });
                      }}
                      placeholder="e.g. Amazon Web Services"
                      className="px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                    />
                    <input
                      type="text"
                      value={c.date}
                      onChange={(e) => {
                        const updated = content.certifications.map((it) =>
                          it.id === c.id ? { ...it, date: e.target.value } : it
                        );
                        updateContent({ certifications: updated });
                      }}
                      placeholder="e.g. 2025"
                      className="px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white placeholder-slate-500"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const updated = content.certifications.filter((it) => it.id !== c.id);
                      updateContent({ certifications: updated });
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ACHIEVEMENTS SECTION */}
        {activeSection === "achievements" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Achievements & Hackathons</h3>
                <p className="text-xs text-slate-400">Awards, hackathon placements, and student leadership.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newAch: ResumeAchievementEntry = {
                    id: `ach-${Date.now()}`,
                    title: "",
                    organization: "",
                    date: "",
                  };
                  updateContent({ achievements: [...content.achievements, newAch] });
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Achievement
              </Button>
            </div>

            <div className="space-y-3">
              {content.achievements.map((a) => (
                <div key={a.id} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={a.title}
                      onChange={(e) => {
                        const updated = content.achievements.map((it) =>
                          it.id === a.id ? { ...it, title: e.target.value } : it
                        );
                        updateContent({ achievements: updated });
                      }}
                      placeholder="Honor or Award Title"
                      className="flex-1 mr-2 px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-700 text-white font-medium"
                    />
                    <button
                      onClick={() => {
                        const updated = content.achievements.filter((it) => it.id !== a.id);
                        updateContent({ achievements: updated });
                      }}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={a.description || ""}
                    onChange={(e) => {
                      const updated = content.achievements.map((it) =>
                        it.id === a.id ? { ...it, description: e.target.value } : it
                      );
                      updateContent({ achievements: updated });
                    }}
                    placeholder="Short description or outcome (optional)"
                    className="w-full px-2.5 py-1.5 text-xs rounded bg-slate-900 border border-slate-750 text-slate-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COURSEWORK SECTION */}
        {activeSection === "coursework" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white">Relevant Coursework</h3>
                <p className="text-xs text-slate-400">Key university or online courses.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newCrs: ResumeCourseworkEntry = {
                    id: `crs-${Date.now()}`,
                    title: "CS Course Title",
                    platform: "University Curriculum",
                  };
                  updateContent({ coursework: [...content.coursework, newCrs] });
                }}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Course
              </Button>
            </div>

            <div className="space-y-2">
              {content.coursework.map((c) => (
                <div key={c.id} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={c.title}
                    onChange={(e) => {
                      const updated = content.coursework.map((it) =>
                        it.id === c.id ? { ...it, title: e.target.value } : it
                      );
                      updateContent({ coursework: updated });
                    }}
                    className="flex-1 px-2 py-1 text-xs rounded bg-slate-900 border border-slate-700 text-white"
                  />
                  <button
                    onClick={() => {
                      const updated = content.coursework.filter((it) => it.id !== c.id);
                      updateContent({ coursework: updated });
                    }}
                    className="text-slate-500 hover:text-rose-400 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section Reordering & Visibility Manager */}
      <div className="p-3 bg-slate-950 border-t border-slate-800">
        <details className="text-xs group">
          <summary className="font-semibold text-slate-400 cursor-pointer hover:text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              Reorder or Hide Resume Sections
            </span>
            <ChevronDown className="w-3.5 h-3.5 group-open:rotate-180 transition-transform" />
          </summary>

          <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-850">
            {content.sectionConfig.order.map((secId, idx) => {
              const isVis = content.sectionConfig.visible[secId] !== false;
              const meta = sectionsList.find((s) => s.id === secId);
              const label = meta ? meta.label : secId;

              return (
                <div
                  key={secId}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800"
                >
                  <span className={`text-xs font-medium ${isVis ? "text-slate-200" : "text-slate-500 line-through"}`}>
                    {idx + 1}. {label}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveSectionOrder(idx, "up")}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === content.sectionConfig.order.length - 1}
                      onClick={() => moveSectionOrder(idx, "down")}
                      className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleSectionVisibility(secId)}
                      className="p-1 rounded text-slate-400 hover:text-white"
                      title={isVis ? "Hide section" : "Show section"}
                    >
                      {isVis ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </details>
      </div>

      {/* Bullet Helper Modal */}
      <BulletHelperModal
        isOpen={bulletHelperOpen}
        onClose={() => setBulletHelperOpen(false)}
        onApplyBullet={handleApplyBullet}
        contextTitle={bulletHelperContext?.title || "Experience"}
      />

      {/* Job Description ATS Modal */}
      <JobDescriptionModal
        isOpen={jobDescModalOpen}
        onClose={() => setJobDescModalOpen(false)}
        currentContent={draft.content}
        savedJobDescription={draft.jobDescription || ""}
        onSaveJobDescription={(text) => {
          onChange({
            ...draft,
            jobDescription: text,
            lastModified: new Date().toISOString(),
          });
        }}
      />
    </div>
  );
};
