"use client";

import React from "react";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { calculateProfileCompletion } from "@/lib/profile-completion";
import {
  CheckCircle2,
  AlertTriangle,
  Edit3,
  Sparkles,
  GraduationCap,
  Briefcase,
  Code2,
  Trophy,
} from "lucide-react";

export interface StepReviewProps {
  profile: Partial<CandidateProfile>;
  skills: Skill[];
  onJumpToStep: (stepId: number) => void;
}

export const StepReview: React.FC<StepReviewProps> = ({
  profile,
  skills,
  onJumpToStep,
}) => {
  const completion = calculateProfileCompletion(profile, skills);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white">Step G — Review & Verification</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Review your profile summary below. Click "Edit" on any section to adjust details before final save.
        </p>
      </div>

      {/* Profile Completion Score Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-cyan-950/40 border border-indigo-800/40 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-white">Calculated Profile Completion</span>
          </div>
          <span className="text-sm font-bold text-indigo-300">{completion.percentage}%</span>
        </div>
        <Progress value={completion.percentage} size="md" />

        {completion.missingCount > 0 ? (
          <div className="flex items-start gap-2 pt-1 text-xs text-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Opportunity to enhance:</strong> {completion.nextBestAction}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 pt-1 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All criteria met! Your profile is complete.</span>
          </div>
        )}
      </div>

      {/* Review Section 1: Personal Details */}
      <Card className="p-4 bg-slate-950/60 border-slate-800">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Personal & Professional
              </span>
              <Badge variant="indigo" size="sm">{profile.careerLevel || "Student"}</Badge>
            </div>
            <h4 className="text-sm font-bold text-white">{profile.name || "Candidate Name"}</h4>
            <p className="text-xs text-indigo-300">{profile.headline || "No headline provided"}</p>
            <p className="text-xs text-slate-400 max-w-2xl pt-1">{profile.bio}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onJumpToStep(1)}
            className="text-xs text-slate-400 hover:text-white"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </Card>

      {/* Review Section 2: Education */}
      <Card className="p-4 bg-slate-950/60 border-slate-800">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Education ({profile.education?.length || 0})
              </span>
            </div>

            {profile.education && profile.education.length > 0 ? (
              profile.education.map((edu) => (
                <div key={edu.id} className="text-xs text-slate-300">
                  <span className="font-semibold text-white">{edu.institution}</span>
                  <p className="text-slate-400">
                    {edu.degree} in {edu.specialization} ({edu.yearOrSemester}) • {edu.startYear} –{" "}
                    {edu.expectedGraduationYear}
                    {edu.gpa && <span className="text-emerald-400 ml-1.5">• GPA: {edu.gpa}</span>}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-amber-400/80 italic">No education entries added yet.</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onJumpToStep(2)}
            className="text-xs text-slate-400 hover:text-white"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </Card>

      {/* Review Section 3: Skills */}
      <Card className="p-4 bg-slate-950/60 border-slate-800">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Recorded Skills ({skills.length})
            </span>

            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span
                  key={s.id}
                  className="px-2 py-0.5 rounded text-[11px] bg-slate-900 border border-slate-800 text-slate-200"
                >
                  {s.name} <span className="text-slate-500 font-medium">({s.proficiency})</span>
                </span>
              ))}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onJumpToStep(3)}
            className="text-xs text-slate-400 hover:text-white"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </Card>

      {/* Review Section 4: Career Goals */}
      <Card className="p-4 bg-slate-950/60 border-slate-800">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Career Goals & Work Preferences
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p>
                <strong className="text-slate-400">Target Roles:</strong>{" "}
                {profile.preferences?.targetJobRoles?.join(", ") || profile.targetRole || "None"}
              </p>
              <p>
                <strong className="text-slate-400">Workplace:</strong>{" "}
                {profile.preferences?.workplacePreference || "Flexible"} •{" "}
                <strong className="text-slate-400">Availability:</strong>{" "}
                {profile.preferences?.availability || profile.availability || "Immediate"}
              </p>
              <p>
                <strong className="text-slate-400">Opportunities:</strong>{" "}
                {profile.preferences?.opportunityTypes?.join(", ") || "All"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onJumpToStep(4)}
            className="text-xs text-slate-400 hover:text-white"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </Card>

      {/* Review Section 5: Projects */}
      <Card className="p-4 bg-slate-950/60 border-slate-800">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Projects ({profile.projects?.length || 0})
              </span>
            </div>

            {profile.projects && profile.projects.length > 0 ? (
              <div className="space-y-1.5">
                {profile.projects.map((p) => (
                  <div key={p.id} className="text-xs text-slate-300">
                    <span className="font-semibold text-white">{p.title}</span> —{" "}
                    <span className="text-slate-400">{p.problem}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No projects listed.</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onJumpToStep(5)}
            className="text-xs text-slate-400 hover:text-white"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </Card>

      {/* Review Section 6: Experience & Achievements */}
      <Card className="p-4 bg-slate-950/60 border-slate-800">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Experience, Certs & Awards
              </span>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p>
                <strong className="text-slate-400">Work & Internships:</strong>{" "}
                {profile.experience?.length || 0} recorded
              </p>
              <p>
                <strong className="text-slate-400">Certifications:</strong>{" "}
                {profile.certifications?.length || 0} recorded
              </p>
              <p>
                <strong className="text-slate-400">Hackathons & Competitions:</strong>{" "}
                {profile.hackathons?.length || 0} recorded
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onJumpToStep(6)}
            className="text-xs text-slate-400 hover:text-white"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1" />
            Edit
          </Button>
        </div>
      </Card>
    </div>
  );
};
