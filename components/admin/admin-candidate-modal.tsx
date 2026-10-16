"use client";

import React from "react";
import { AdminUserRecord } from "@/lib/admin/admin-user-service";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  GraduationCap,
  Briefcase,
  Code2,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
} from "lucide-react";

interface AdminCandidateModalProps {
  user: AdminUserRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AdminCandidateModal: React.FC<AdminCandidateModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !user) return null;

  const p = user.rawProfile;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden text-slate-100">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 bg-slate-950/70 flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
              {user.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "CD"}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white tracking-tight">{user.name}</h2>
                <Badge variant={user.syncedMode === "Cloud Firestore" ? "emerald" : "indigo"} size="sm">
                  {user.syncedMode}
                </Badge>
                <Badge variant="cyan" size="sm">
                  {user.profileCompletion}% Profile Ready
                </Badge>
              </div>
              <p className="text-xs text-indigo-300 font-medium mt-0.5">{user.headline || user.targetRole}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  {user.email}
                </span>
                {p.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    {p.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  {user.location}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Bio */}
          {p.bio && (
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Summary</h3>
              <p className="text-xs text-slate-300 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 leading-relaxed">
                {p.bio}
              </p>
            </div>
          )}

          {/* Target Track & Preferences */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Target Career Role</span>
              <span className="font-bold text-white text-sm">{user.targetRole}</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">Experience: {user.careerLevel}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-slate-400 block mb-1">Career Readiness Score</span>
              <span className="font-bold text-emerald-400 text-sm">{user.readinessScore}/100</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Workplace: {p.preferences?.workplacePreference || "Flexible"}
              </span>
            </div>
          </div>

          {/* Social Profiles */}
          {(p.linkedInUrl || p.githubUrl || p.portfolioUrl) && (
            <div className="flex items-center gap-3 flex-wrap">
              {p.linkedInUrl && (
                <a
                  href={p.linkedInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>LinkedIn Profile</span>
                </a>
              )}
              {p.githubUrl && (
                <a
                  href={p.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>GitHub Repositories</span>
                </a>
              )}
            </div>
          )}

          {/* Skills Breakdown */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-400" />
              Recorded Technical Skills ({user.skills.length})
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {user.skills.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-indigo-200 border border-slate-700/80"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Education Records */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              Verified Education
            </h3>
            {p.education && p.education.length > 0 ? (
              <div className="space-y-2">
                {p.education.map((edu) => (
                  <div key={edu.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{edu.institution}</span>
                      {edu.gpa && (
                        <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[11px] font-semibold">
                          GPA: {edu.gpa}
                        </span>
                      )}
                    </div>
                    <p className="text-slate-300">{edu.degree}</p>
                    <p className="text-[11px] text-slate-500">
                      {edu.startYear} - {edu.expectedGraduationYear} • {edu.yearOrSemester}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No formal education record added yet.</p>
            )}
          </div>

          {/* Projects & Portfolio */}
          {p.projects && p.projects.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                Featured Candidate Projects ({p.projects.length})
              </h3>
              <div className="space-y-2">
                {p.projects.map((proj) => (
                  <div key={proj.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1.5">
                    <span className="font-bold text-white text-sm">{proj.title}</span>
                    <p className="text-slate-300 text-xs">{proj.description}</p>
                    {proj.technologies && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Experience */}
          {p.experience && p.experience.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-400" />
                Work History & Internships
              </h3>
              <div className="space-y-2">
                {p.experience.map((exp) => (
                  <div key={exp.id} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{exp.role}</span>
                      <span className="text-[11px] text-slate-400">{exp.startDate} - {exp.endDate || "Present"}</span>
                    </div>
                    <p className="text-indigo-300 text-[11px] font-medium">{exp.company} • {exp.type}</p>
                    <p className="text-slate-300 text-xs pt-1">{exp.responsibilities}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between text-xs">
          <span className="text-slate-400">UID: {user.uid}</span>
          <Button variant="primary" size="sm" onClick={onClose} className="text-xs">
            Close Candidate Inspection
          </Button>
        </div>
      </div>
    </div>
  );
};
