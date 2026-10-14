"use client";

import React, { useState } from "react";
import { RoleMatchResult, EvaluatedSkill } from "@/lib/skill-analyzer/matching-engine";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { getOpenSourceSkillReferral } from "@/lib/skill-analyzer/open-source-referrals";
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  FolderGit2,
  ExternalLink,
  Compass,
  Code2,
  Sparkles,
} from "lucide-react";

export interface SkillGapBreakdownProps {
  matchResult: RoleMatchResult;
  onAddSkillPrompt?: (skillName: string) => void;
  className?: string;
}

export const SkillGapBreakdown: React.FC<SkillGapBreakdownProps> = ({
  matchResult,
  onAddSkillPrompt,
  className = "",
}) => {
  const [activeTab, setActiveTab] = useState<"missing" | "partial" | "matched">("missing");
  const [expandedSkillName, setExpandedSkillName] = useState<string | null>(null);

  const toggleExpand = (name: string) => {
    setExpandedSkillName((prev) => (prev === name ? null : name));
  };

  const getSkillsForTab = (): EvaluatedSkill[] => {
    switch (activeTab) {
      case "missing":
        return matchResult.missingSkills;
      case "partial":
        return matchResult.partiallyDevelopedSkills;
      case "matched":
        return matchResult.matchedSkills;
    }
  };

  const activeSkillsList = getSkillsForTab();

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>Skill Gap Diagnostic & Open-Source Roadmaps</CardTitle>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                roadmap.sh Verified
              </span>
            </div>
            <CardDescription>
              Actionable competencies for {matchResult.roleTitle} with referrals to open-source developer roadmaps and free learning curricula.
            </CardDescription>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab("missing")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "missing"
                  ? "bg-amber-950/80 text-amber-300 border border-amber-800/60 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Gaps to Learn ({matchResult.missingSkills.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("partial")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "partial"
                  ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />
              <span>In Progress ({matchResult.partiallyDevelopedSkills.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("matched")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === "matched"
                  ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Mastered ({matchResult.matchedSkills.length})</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {activeSkillsList.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="font-semibold text-white">No skills in this category!</p>
            <p>
              {activeTab === "missing"
                ? "All required competencies for this role are currently recorded in your profile."
                : activeTab === "partial"
                ? "No partially developed skills found. Your skills either meet or exceed the expected target."
                : "No matching skills recorded yet. Review missing skills to start building foundations."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSkillsList.map((skill) => {
              const isExpanded = expandedSkillName === skill.name;
              const referral = getOpenSourceSkillReferral(skill.name);

              return (
                <div
                  key={skill.name}
                  className="rounded-xl border border-slate-800 bg-slate-950/70 overflow-hidden transition-all hover:border-slate-700"
                >
                  {/* Collapsed Header Row */}
                  <div
                    onClick={() => toggleExpand(skill.name)}
                    className="p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          skill.status === "matched"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60"
                            : skill.status === "partially_developed"
                            ? "bg-indigo-950/60 text-indigo-400 border border-indigo-800/60"
                            : "bg-amber-950/40 text-amber-400 border border-amber-800/50"
                        }`}
                      >
                        {skill.status === "matched" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : skill.status === "partially_developed" ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <AlertCircle className="w-4 h-4" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white tracking-tight">
                            {skill.name}
                          </span>
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded ${
                              skill.importance === "core"
                                ? "bg-indigo-950 text-indigo-300 border border-indigo-800/50"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {skill.importance}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Expected Proficiency: <strong className="text-slate-300">{skill.expectedProficiency}</strong>
                          {skill.userProficiency && (
                            <>
                              {" "}• Current Level: <strong className="text-indigo-300">{skill.userProficiency}</strong>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {onAddSkillPrompt && skill.status === "missing" && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAddSkillPrompt(skill.name);
                          }}
                          className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600 hover:text-white transition-colors font-medium"
                        >
                          + Record in Profile
                        </button>
                      )}
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform ${
                          isExpanded ? "rotate-180 text-white" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Expandable Details Drawer */}
                  {isExpanded && (
                    <div className="p-4 pt-3 border-t border-slate-800/80 bg-slate-900/60 space-y-3.5 text-xs animate-in fade-in duration-150">
                      {/* Competency Overview */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-semibold text-slate-400 block">
                          Industry Competency Scope:
                        </span>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          {referral.competencySummary}
                        </p>
                      </div>

                      {/* Verified Open-Source Learning Referrals */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/20 space-y-2.5">
                        <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-xs">
                          <Compass className="w-3.5 h-3.5 text-indigo-400" />
                          <span>Open-Source Roadmaps & Authoritative Free Referrals:</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                          {/* 1. roadmap.sh guide */}
                          <a
                            href={referral.roadmapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:bg-indigo-950/20 transition-all group flex flex-col justify-between"
                          >
                            <span className="text-[10px] uppercase font-bold text-indigo-400">
                              Developer Roadmap
                            </span>
                            <span className="text-[11px] text-slate-200 group-hover:text-white font-medium flex items-center justify-between mt-1">
                              {referral.roadmapLabel}
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 ml-1 shrink-0" />
                            </span>
                          </a>

                          {/* 2. Official Documentation */}
                          <a
                            href={referral.documentationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-950/20 transition-all group flex flex-col justify-between"
                          >
                            <span className="text-[10px] uppercase font-bold text-emerald-400">
                              Official Documentation
                            </span>
                            <span className="text-[11px] text-slate-200 group-hover:text-white font-medium flex items-center justify-between mt-1">
                              {referral.documentationLabel}
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-emerald-400 ml-1 shrink-0" />
                            </span>
                          </a>

                          {/* 3. Free Interactive Practice */}
                          <a
                            href={referral.freePracticeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-950/20 transition-all group flex flex-col justify-between"
                          >
                            <span className="text-[10px] uppercase font-bold text-cyan-400">
                              Free Interactive Practice
                            </span>
                            <span className="text-[11px] text-slate-200 group-hover:text-white font-medium flex items-center justify-between mt-1">
                              {referral.freePracticeLabel}
                              <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-cyan-400 ml-1 shrink-0" />
                            </span>
                          </a>
                        </div>
                      </div>

                      {/* Suggested Learning Activity */}
                      <div className="p-3 rounded-lg bg-indigo-950/25 border border-indigo-800/30 space-y-1">
                        <span className="font-semibold text-indigo-300 flex items-center gap-1.5 text-xs">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          Recommended Hands-on Exercise:
                        </span>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          {skill.suggestedActivity}
                        </p>
                      </div>

                      {/* Portfolio Evidence Tip */}
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <span className="font-semibold text-slate-200 flex items-center gap-1.5 text-xs">
                          <FolderGit2 className="w-3.5 h-3.5 text-emerald-400" />
                          Portfolio Evidence Tip (What Recruiters Verify):
                        </span>
                        <p className="text-slate-400 leading-relaxed text-[11px]">
                          {skill.portfolioEvidenceTip}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
