import React, { useState } from "react";
import { RoleMatchResult } from "@/lib/skill-analyzer/matching-engine";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import {
  HelpCircle,
  AlertTriangle,
  Award,
  Zap,
} from "lucide-react";

export interface SkillMatchOverviewCardProps {
  matchResult: RoleMatchResult;
  className?: string;
}

export const SkillMatchOverviewCard: React.FC<SkillMatchOverviewCardProps> = ({
  matchResult,
  className = "",
}) => {
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);

  const getScoreVariant = (score: number): "emerald" | "indigo" | "amber" => {
    if (score >= 75) return "emerald";
    if (score >= 50) return "indigo";
    return "amber";
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Match Score */}
        <Card className="hover:border-slate-700 transition-colors">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">
                Overall Match Index
              </span>
              <button
                type="button"
                onClick={() => setFormulaModalOpen(true)}
                title="View transparent formula explanation"
                className="text-slate-400 hover:text-indigo-400 transition-colors"
                aria-label="How is this calculated?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {matchResult.matchScore}%
                </span>
                <Badge variant={getScoreVariant(matchResult.matchScore)} size="sm">
                  {matchResult.matchScore >= 75
                    ? "Strong Match"
                    : matchResult.matchScore >= 50
                    ? "Moderate Match"
                    : "Development Target"}
                </Badge>
              </div>
              <Progress
                value={matchResult.matchScore}
                size="sm"
                indicatorClassName={
                  matchResult.matchScore >= 75
                    ? "bg-emerald-500"
                    : matchResult.matchScore >= 50
                    ? "bg-indigo-500"
                    : "bg-amber-500"
                }
              />
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <span>Points Earned:</span>
              <span className="font-semibold text-slate-200">
                {matchResult.totalPointsEarned} / {matchResult.maxPointsPossible} pts
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 2: Core Skill Coverage */}
        <Card className="hover:border-slate-700 transition-colors">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Core Skill Coverage</span>
              <div className="w-7 h-7 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {matchResult.coreSkillCoveragePercentage}%
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {matchResult.matchedSkills.filter((s) => s.importance === "core").length} Matched
                </span>
              </div>
              <Progress
                value={matchResult.coreSkillCoveragePercentage}
                size="sm"
                indicatorClassName="bg-indigo-500"
              />
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">Weight: </span>
              <span className="text-slate-300 font-medium">3x contribution factor</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 3: Supporting Skill Coverage */}
        <Card className="hover:border-slate-700 transition-colors">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Supporting Skills</span>
              <div className="w-7 h-7 rounded-lg bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {matchResult.supportingSkillCoveragePercentage}%
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {matchResult.matchedSkills.filter((s) => s.importance === "supporting").length} Matched
                </span>
              </div>
              <Progress
                value={matchResult.supportingSkillCoveragePercentage}
                size="sm"
                indicatorClassName="bg-cyan-500"
              />
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="text-slate-400">Weight: </span>
              <span className="text-slate-300 font-medium">1x contribution factor</span>
            </div>
          </CardContent>
        </Card>

        {/* Metric 4: Relevant Projects Evidenced */}
        <Card className="hover:border-slate-700 transition-colors">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Project Proof Evidence</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Award className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-3xl font-extrabold text-white tracking-tight">
                  {matchResult.relevantProjects.length}
                </span>
                <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/60">
                  Portfolio Proof
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                {matchResult.relevantProjects.length > 0
                  ? `${matchResult.relevantProjects[0].projectTitle}`
                  : "No matching project recorded yet"}
              </p>
            </div>

            <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span>Evidence Boost: </span>
              <span className="text-emerald-400 font-medium">+10% verified bonus</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mandatory Transparent Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-slate-300">
            Explainable Methodology Notice:
          </span>
          <p className="leading-relaxed">
            This match score evaluates recorded proficiencies and portfolio evidence against starter role benchmarks. It does <strong>not</strong> represent a hiring probability or guarantee job readiness. A skill marked &quot;Not Yet Recorded&quot; means it is not yet documented in your profile; it does not prove you lack the competency.
          </p>
        </div>
      </div>

      {/* Transparent Formula Modal */}
      <Modal
        isOpen={formulaModalOpen}
        onClose={() => setFormulaModalOpen(false)}
        title="Transparent Scoring Formula & Calculation"
        description="Skill_pulse ai uses an explainable weighted mathematical rule engine, not a black-box AI model."
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 font-mono text-[11px] text-indigo-300">
            {matchResult.formulaExplanation.formula}
          </div>

          <div className="space-y-2 text-slate-300">
            <p className="font-semibold text-white">How Each Competency Contributes:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-400">
              <li>
                <strong>Numerical Scale:</strong> Beginner = 1, Intermediate = 2, Advanced = 3, Expert = 4.
              </li>
              <li>
                <strong>Importance Weighting:</strong> Core skills carry <strong>3x weight</strong>; Supporting skills carry <strong>1x weight</strong>.
              </li>
              <li>
                <strong>Proficiency Ratio:</strong> Min(User Level / Expected Level, 1.0).
              </li>
              <li>
                <strong>Demonstrable Project Bonus:</strong> Skills evidenced in your recorded portfolio projects earn a +0.1 verification boost (up to 1.0 max).
              </li>
            </ul>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-400">
            <span className="text-slate-200 font-semibold block mb-1">Current Evaluation Audit:</span>
            {matchResult.formulaExplanation.breakdown}
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800">
            <Button variant="ghost" size="sm" onClick={() => setFormulaModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
