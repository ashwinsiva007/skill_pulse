import React from "react";
import { RoleMatchResult, EvaluatedSkill } from "@/lib/skill-analyzer/matching-engine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, ArrowUpRight, FolderGit2 } from "lucide-react";

export interface ProficiencyComparisonChartProps {
  matchResult: RoleMatchResult;
  className?: string;
}

export const ProficiencyComparisonChart: React.FC<ProficiencyComparisonChartProps> = ({
  matchResult,
  className = "",
}) => {
  const allSkills = [
    ...matchResult.matchedSkills,
    ...matchResult.partiallyDevelopedSkills,
    ...matchResult.missingSkills,
  ];

  const getStatusBadge = (skill: EvaluatedSkill) => {
    switch (skill.status) {
      case "matched":
        return (
          <Badge variant="emerald" size="sm" className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            <span>Target Met</span>
          </Badge>
        );
      case "partially_developed":
        return (
          <Badge variant="indigo" size="sm" className="flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>Partial (+{skill.expectedLevelValue - skill.userLevelValue} level needed)</span>
          </Badge>
        );
      case "missing":
        return (
          <Badge variant="amber" size="sm" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            <span>Not Yet Recorded</span>
          </Badge>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Proficiency Benchmark Comparison</CardTitle>
            <CardDescription>
              Compares your recorded proficiency against starter role expectations for {matchResult.roleTitle}.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Your Level
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" /> Expected Level
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-[11px] uppercase bg-slate-950/70 text-slate-400 border-b border-slate-800">
              <tr>
                <th scope="col" className="py-3 px-3">Competency</th>
                <th scope="col" className="py-3 px-3">Priority</th>
                <th scope="col" className="py-3 px-3">Your Level</th>
                <th scope="col" className="py-3 px-3">Expected</th>
                <th scope="col" className="py-3 px-4 min-w-[160px]">Comparison Level Meter</th>
                <th scope="col" className="py-3 px-3">Evidence</th>
                <th scope="col" className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {allSkills.map((skill) => {
                const userPct = (skill.userLevelValue / 4) * 100;
                const expectedPct = (skill.expectedLevelValue / 4) * 100;

                return (
                  <tr key={skill.name} className="hover:bg-slate-900/60 transition-colors">
                    {/* Competency Name */}
                    <td className="py-3 px-3 font-semibold text-white">
                      {skill.name}
                    </td>

                    {/* Importance Weight */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded ${
                          skill.importance === "core"
                            ? "bg-indigo-950/60 text-indigo-300 border border-indigo-800/50"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {skill.importance} (x{skill.weight})
                      </span>
                    </td>

                    {/* User Level */}
                    <td className="py-3 px-3">
                      <span className={skill.userProficiency ? "font-semibold text-slate-200" : "text-slate-500 italic"}>
                        {skill.userProficiency || "None"}
                      </span>
                    </td>

                    {/* Expected Level */}
                    <td className="py-3 px-3 font-medium text-slate-400">
                      {skill.expectedProficiency}
                    </td>

                    {/* Visual Comparison Bar (Dual Layer) */}
                    <td className="py-3 px-4">
                      <div className="relative w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                        {/* Expected Target Level Indicator */}
                        <div
                          style={{ width: `${expectedPct}%` }}
                          className="absolute top-0 bottom-0 left-0 bg-slate-700/60 border-r-2 border-slate-400"
                          title={`Expected: ${skill.expectedProficiency}`}
                        />
                        {/* User Recorded Level Fill */}
                        <div
                          style={{ width: `${userPct}%` }}
                          className={`absolute top-0 bottom-0 left-0 transition-all ${
                            skill.status === "matched"
                              ? "bg-emerald-500"
                              : skill.status === "partially_developed"
                              ? "bg-indigo-500"
                              : "bg-transparent"
                          }`}
                          title={`Your level: ${skill.userProficiency || "None"}`}
                        />
                      </div>
                    </td>

                    {/* Project Evidence */}
                    <td className="py-3 px-3">
                      {skill.evidenceProjects.length > 0 ? (
                        <span
                          title={`Demonstrated in: ${skill.evidenceProjects.map((p) => p.title).join(", ")}`}
                          className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium cursor-help"
                        >
                          <FolderGit2 className="w-3.5 h-3.5" />
                          <span>{skill.evidenceProjects.length} Proj</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-600">—</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-right">
                      {getStatusBadge(skill)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
