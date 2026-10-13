import React from "react";
import { RoleMatchResult } from "@/lib/skill-analyzer/matching-engine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FolderGit2, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export interface ProjectEvidenceCardProps {
  matchResult: RoleMatchResult;
  className?: string;
}

export const ProjectEvidenceCard: React.FC<ProjectEvidenceCardProps> = ({
  matchResult,
  className = "",
}) => {
  const { relevantProjects } = matchResult;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Relevant Project Evidence</CardTitle>
            <CardDescription>
              Recorded projects from your profile that provide verifiable proof of required skills.
            </CardDescription>
          </div>
          <Link
            href="/profile"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
          >
            Manage Projects in Profile →
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {relevantProjects.length === 0 ? (
          <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center space-y-2">
            <FolderGit2 className="w-8 h-8 text-slate-500 mx-auto" />
            <p className="text-xs text-slate-300 font-semibold">
              No matching project evidence detected for {matchResult.roleTitle}.
            </p>
            <p className="text-[11px] text-slate-400 max-w-md mx-auto leading-relaxed">
              Adding a portfolio project demonstrating {matchResult.missingSkills.slice(0, 2).map((s) => s.name).join(" or ")} provides verifiable recruiter proof and boosts your match score.
            </p>
            <div className="pt-1">
              <Link
                href="/profile"
                className="inline-flex items-center text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white transition-colors"
              >
                + Add Project to Profile
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {relevantProjects.map((proj) => (
              <div
                key={proj.projectId}
                className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5 hover:border-slate-750 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-950/60 border border-emerald-800/60 flex items-center justify-center text-emerald-400 shrink-0">
                      <FolderGit2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">
                        {proj.projectTitle}
                      </h4>
                      <span className="text-[10px] text-emerald-400 font-medium">
                        Verifiable Portfolio Evidence
                      </span>
                    </div>
                  </div>
                  <Badge variant="emerald" size="sm">
                    {proj.demonstratedSkills.length} Skills Evidenced
                  </Badge>
                </div>

                <div className="pt-1">
                  <span className="text-[11px] font-semibold text-slate-400 block mb-1">
                    Demonstrated Competencies for {matchResult.roleTitle}:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {proj.demonstratedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 text-xs rounded bg-slate-900 border border-slate-750 text-indigo-300 font-medium flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
