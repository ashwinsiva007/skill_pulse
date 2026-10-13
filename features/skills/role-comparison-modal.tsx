import React from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CareerRoleDefinition,
} from "@/lib/career-catalogue/career-catalogue";
import { RoleMatchResult } from "@/lib/skill-analyzer/matching-engine";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export interface RoleComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  allRoles: CareerRoleDefinition[];
  resultsByRole: Record<string, RoleMatchResult>;
  currentRoleId: string;
  onSelectRole: (role: CareerRoleDefinition) => void;
}

export const RoleComparisonModal: React.FC<RoleComparisonModalProps> = ({
  isOpen,
  onClose,
  allRoles,
  resultsByRole,
  currentRoleId,
  onSelectRole,
}) => {
  // Sort roles by highest match score descending
  const sortedRoles = [...allRoles].sort((a, b) => {
    const scoreA = resultsByRole[a.id]?.matchScore || 0;
    const scoreB = resultsByRole[b.id]?.matchScore || 0;
    return scoreB - scoreA;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Multi-Role Career Alignment Comparison"
      description="Compare how your recorded skills and project evidence align across multiple technical tracks."
      maxWidth="xl"
    >
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div className="text-xs text-slate-400 leading-relaxed">
          Scores are computed objectively using the transparent weighted formula based on your current profile records.
        </div>

        <div className="space-y-3">
          {sortedRoles.map((role) => {
            const res = resultsByRole[role.id];
            const isCurrent = role.id === currentRoleId;
            if (!res) return null;

            return (
              <div
                key={role.id}
                className={`p-4 rounded-xl border transition-all ${
                  isCurrent
                    ? "bg-slate-900 border-indigo-500/80 shadow-md"
                    : "bg-slate-950/70 border-slate-800 hover:border-slate-750"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      {role.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-medium">
                      {role.domain}
                    </span>
                    {isCurrent && (
                      <Badge variant="indigo" size="sm">
                        Active Target
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-base font-extrabold text-white">
                        {res.matchScore}%
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-0.5">Match Index</span>
                    </div>

                    {!isCurrent ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          onSelectRole(role);
                          onClose();
                        }}
                        className="text-xs"
                      >
                        Switch Role
                        <ArrowRight className="w-3 h-3 ml-1" />
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Selected
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <Progress
                  value={res.matchScore}
                  size="sm"
                  indicatorClassName={
                    res.matchScore >= 75
                      ? "bg-emerald-500"
                      : res.matchScore >= 50
                      ? "bg-indigo-500"
                      : "bg-amber-500"
                  }
                />

                {/* Stats Breakdown */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Core Coverage</span>
                    <span className="font-semibold text-slate-200">
                      {res.coreSkillCoveragePercentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Supporting</span>
                    <span className="font-semibold text-slate-200">
                      {res.supportingSkillCoveragePercentage}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Matched Skills</span>
                    <span className="font-semibold text-emerald-400">
                      {res.matchedSkills.length} of {role.requiredSkills.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] uppercase">Top Skill Gap</span>
                    <span className="font-semibold text-amber-300 truncate block">
                      {res.missingSkills[0]?.name || "None (Fully Matched)"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close Comparison
          </Button>
        </div>
      </div>
    </Modal>
  );
};
