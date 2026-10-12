"use client";

import React, { useState } from "react";
import {
  ExperienceEntry,
  CertificationEntry,
  CourseEntry,
  HackathonEntry,
  AwardEntry,
  LeadershipEntry,
} from "@/types/experience";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Award, Briefcase, Trophy, BookmarkCheck } from "lucide-react";

export interface StepExperienceProps {
  experience: ExperienceEntry[];
  certifications: CertificationEntry[];
  courses: CourseEntry[];
  hackathons: HackathonEntry[];
  awards: AwardEntry[];
  leadership: LeadershipEntry[];
  onUpdate: (data: {
    experience?: ExperienceEntry[];
    certifications?: CertificationEntry[];
    courses?: CourseEntry[];
    hackathons?: HackathonEntry[];
    awards?: AwardEntry[];
    leadership?: LeadershipEntry[];
  }) => void;
}

export const StepExperience: React.FC<StepExperienceProps> = ({
  experience,
  certifications,
  courses: _courses,
  hackathons,
  awards,
  leadership: _leadership,
  onUpdate,
}) => {
  const [activeTab, setActiveTab] = useState<
    "work" | "certs" | "hackathons" | "awards" | "leadership"
  >("work");

  // Form states for work experience
  const [expCompany, setExpCompany] = useState("");
  const [expRole, setExpRole] = useState("");
  const [expType, setExpType] = useState<ExperienceEntry["type"]>("Internship");
  const [expStart, setExpStart] = useState("");
  const [expEnd, setExpEnd] = useState("");
  const [expResponsibilities, setExpResponsibilities] = useState("");
  const [showExpForm, setShowExpForm] = useState(false);

  // Form states for certification
  const [certName, setCertName] = useState("");
  const [certIssuer, setCertIssuer] = useState("");
  const [certDate, setCertDate] = useState("");
  const [certUrl, setCertUrl] = useState("");
  const [showCertForm, setShowCertForm] = useState(false);

  // Form states for hackathons
  const [hackName, setHackName] = useState("");
  const [hackProject, setHackProject] = useState("");
  const [hackResult, setHackResult] = useState("");
  const [showHackForm, setShowHackForm] = useState(false);

  // Form states for awards
  const [awardTitle, setAwardTitle] = useState("");
  const [awardOrg, setAwardOrg] = useState("");
  const [awardDate, setAwardDate] = useState("");
  const [showAwardForm, setShowAwardForm] = useState(false);

  // Work handlers
  const handleAddExperience = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expCompany.trim() || !expRole.trim() || !expResponsibilities.trim()) return;
    const newEntry: ExperienceEntry = {
      id: `exp-${Date.now()}`,
      company: expCompany.trim(),
      role: expRole.trim(),
      type: expType,
      startDate: expStart.trim() || "Recent",
      endDate: expEnd.trim() || undefined,
      isCurrent: !expEnd.trim(),
      responsibilities: expResponsibilities.trim(),
    };
    onUpdate({ experience: [newEntry, ...experience] });
    setExpCompany("");
    setExpRole("");
    setExpResponsibilities("");
    setShowExpForm(false);
  };

  const handleDeleteExperience = (id: string) => {
    onUpdate({ experience: experience.filter((e) => e.id !== id) });
  };

  // Certification handlers
  const handleAddCertification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certName.trim() || !certIssuer.trim()) return;
    const newEntry: CertificationEntry = {
      id: `cert-${Date.now()}`,
      name: certName.trim(),
      issuer: certIssuer.trim(),
      issueDate: certDate.trim() || new Date().toISOString().slice(0, 10),
      credentialUrl: certUrl.trim() || undefined,
    };
    onUpdate({ certifications: [newEntry, ...certCertifications()] });
    setCertName("");
    setCertIssuer("");
    setCertUrl("");
    setShowCertForm(false);
  };

  const certCertifications = () => certifications || [];

  const handleDeleteCertification = (id: string) => {
    onUpdate({ certifications: certCertifications().filter((c) => c.id !== id) });
  };

  // Hackathon handlers
  const handleAddHackathon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hackName.trim() || !hackProject.trim()) return;
    const newEntry: HackathonEntry = {
      id: `hack-${Date.now()}`,
      eventName: hackName.trim(),
      projectTitle: hackProject.trim(),
      result: hackResult.trim() || "Participant",
      year: new Date().getFullYear().toString(),
    };
    onUpdate({ hackathons: [newEntry, ...(hackathons || [])] });
    setHackName("");
    setHackProject("");
    setHackResult("");
    setShowHackForm(false);
  };

  const handleDeleteHackathon = (id: string) => {
    onUpdate({ hackathons: (hackathons || []).filter((h) => h.id !== id) });
  };

  // Award handlers
  const handleAddAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardTitle.trim()) return;
    const newEntry: AwardEntry = {
      id: `awd-${Date.now()}`,
      title: awardTitle.trim(),
      organization: awardOrg.trim() || "Academic / Industry",
      date: awardDate.trim() || new Date().getFullYear().toString(),
    };
    onUpdate({ awards: [newEntry, ...(awards || [])] });
    setAwardTitle("");
    setAwardOrg("");
    setShowAwardForm(false);
  };

  const handleDeleteAward = (id: string) => {
    onUpdate({ awards: (awards || []).filter((a) => a.id !== id) });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-white">
          Step F — Experience, Certifications & Achievements
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          All sections here are optional. Add internships, certificates, hackathons, or skip ahead if not applicable.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab("work")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "work"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Work & Internships ({experience?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("certs")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "certs"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <BookmarkCheck className="w-3.5 h-3.5" />
          Certifications ({certifications?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("hackathons")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "hackathons"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          Hackathons ({hackathons?.length || 0})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("awards")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            activeTab === "awards"
              ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/30"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Award className="w-3.5 h-3.5" />
          Awards & Honors ({awards?.length || 0})
        </button>
      </div>

      {/* Tab 1: Work & Internships */}
      {activeTab === "work" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">
              Work & Internship History
            </span>
            {!showExpForm && (
              <Button variant="outline" size="sm" onClick={() => setShowExpForm(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Work Entry
              </Button>
            )}
          </div>

          {experience?.map((exp) => (
            <Card key={exp.id} className="p-3.5 bg-slate-950/60 border-slate-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-white">{exp.role}</h4>
                  <p className="text-xs text-indigo-300 font-medium">
                    {exp.company} • <span className="text-slate-400">{exp.type}</span>
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">{exp.responsibilities}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteExperience(exp.id)}
                  className="h-7 px-2 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}

          {showExpForm && (
            <Card className="p-4 bg-slate-900 border-indigo-500/30 space-y-3">
              <form onSubmit={handleAddExperience} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Company *</label>
                    <input
                      type="text"
                      placeholder="e.g. Synthetix AI Systems"
                      value={expCompany}
                      onChange={(e) => setExpCompany(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Role Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Software Engineering Intern"
                      value={expRole}
                      onChange={(e) => setExpRole(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Experience Type</label>
                    <select
                      value={expType}
                      onChange={(e) => setExpType(e.target.value as ExperienceEntry["type"])}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Internship">Internship</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Research">Research</option>
                      <option value="Freelance">Freelance</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Start Date / Period</label>
                    <input
                      type="text"
                      placeholder="e.g. Jun 2024 or 2024"
                      value={expStart}
                      onChange={(e) => setExpStart(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">End Date / Present</label>
                    <input
                      type="text"
                      placeholder="e.g. Present or Aug 2024"
                      value={expEnd}
                      onChange={(e) => setExpEnd(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Responsibilities & Impact *</label>
                  <textarea
                    rows={2}
                    placeholder="Key deliverables, tech used, and problems solved..."
                    value={expResponsibilities}
                    onChange={(e) => setExpResponsibilities(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowExpForm(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Experience
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* Tab 2: Certifications */}
      {activeTab === "certs" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">
              Certifications & Credentials
            </span>
            {!showCertForm && (
              <Button variant="outline" size="sm" onClick={() => setShowCertForm(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Certification
              </Button>
            )}
          </div>

          {certifications?.map((c) => (
            <Card key={c.id} className="p-3 bg-slate-950/60 border-slate-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-white">{c.name}</h4>
                  <p className="text-[11px] text-slate-400">
                    {c.issuer} • Issued {c.issueDate}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteCertification(c.id)}
                  className="h-7 px-2 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}

          {showCertForm && (
            <Card className="p-4 bg-slate-900 border-indigo-500/30 space-y-3">
              <form onSubmit={handleAddCertification} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Certification Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. AWS Certified Cloud Practitioner"
                      value={certName}
                      onChange={(e) => setCertName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Issuer *</label>
                    <input
                      type="text"
                      placeholder="e.g. Amazon Web Services or Coursera"
                      value={certIssuer}
                      onChange={(e) => setCertIssuer(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Issue Date</label>
                    <input
                      type="text"
                      placeholder="e.g. May 2024"
                      value={certDate}
                      onChange={(e) => setCertDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowCertForm(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Certification
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* Tab 3: Hackathons */}
      {activeTab === "hackathons" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">
              Hackathons & Competitions
            </span>
            {!showHackForm && (
              <Button variant="outline" size="sm" onClick={() => setShowHackForm(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Hackathon
              </Button>
            )}
          </div>

          {hackathons?.map((h) => (
            <Card key={h.id} className="p-3 bg-slate-950/60 border-slate-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-white">{h.eventName}</h4>
                  <p className="text-[11px] text-indigo-300">
                    Project: {h.projectTitle} • <strong className="text-emerald-400">{h.result}</strong>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteHackathon(h.id)}
                  className="h-7 px-2 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}

          {showHackForm && (
            <Card className="p-4 bg-slate-900 border-indigo-500/30 space-y-3">
              <form onSubmit={handleAddHackathon} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Event Name *</label>
                    <input
                      type="text"
                      placeholder="e.g. Global GenAI Hackathon 2025"
                      value={hackName}
                      onChange={(e) => setHackName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Project Built *</label>
                    <input
                      type="text"
                      placeholder="e.g. DocuSense Meeting Copilot"
                      value={hackProject}
                      onChange={(e) => setHackProject(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Result / Standing</label>
                    <input
                      type="text"
                      placeholder="e.g. 1st Place Winner, Top 10"
                      value={hackResult}
                      onChange={(e) => setHackResult(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowHackForm(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Hackathon
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}

      {/* Tab 4: Awards */}
      {activeTab === "awards" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-300">
              Awards & Honors
            </span>
            {!showAwardForm && (
              <Button variant="outline" size="sm" onClick={() => setShowAwardForm(true)}>
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Award
              </Button>
            )}
          </div>

          {awards?.map((a) => (
            <Card key={a.id} className="p-3 bg-slate-950/60 border-slate-800">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-white">{a.title}</h4>
                  <p className="text-[11px] text-slate-400">
                    {a.organization} • {a.date}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteAward(a.id)}
                  className="h-7 px-2 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}

          {showAwardForm && (
            <Card className="p-4 bg-slate-900 border-indigo-500/30 space-y-3">
              <form onSubmit={handleAddAward} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Award Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Dean's Academic Honors List"
                      value={awardTitle}
                      onChange={(e) => setAwardTitle(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Organization</label>
                    <input
                      type="text"
                      placeholder="e.g. School of Engineering"
                      value={awardOrg}
                      onChange={(e) => setAwardOrg(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">Date</label>
                    <input
                      type="text"
                      placeholder="e.g. 2024"
                      value={awardDate}
                      onChange={(e) => setAwardDate(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setShowAwardForm(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Award
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
