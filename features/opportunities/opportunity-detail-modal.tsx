"use client";

import React from "react";
import Link from "next/link";
import { Opportunity } from "@/types/opportunity";
import { OpportunityMatchResult } from "@/lib/opportunities/matching-engine";
import { getSafeUnstopRegistrationUrl } from "@/lib/opportunities/hackathons-catalog";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { stripHtml } from "@/lib/utils";
import {
  MapPin,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Send,
  Building,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  FileText,
  Radio,
  BookOpen,
  ArrowRight,
} from "lucide-react";

export interface OpportunityDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
  matchResult: OpportunityMatchResult | null;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onOpenTrackModal: (opp: Opportunity) => void;
}

export const OpportunityDetailModal: React.FC<OpportunityDetailModalProps> = ({
  isOpen,
  onClose,
  opportunity,
  matchResult,
  isSaved,
  onToggleSave,
  onOpenTrackModal,
}) => {
  if (!opportunity) return null;

  const matchScore = matchResult ? matchResult.matchScore : opportunity.matchScore;
  const breakdown = matchResult?.scoreBreakdown;
  const applyUrl = opportunity.applicationUrl || opportunity.sourceUrl || "https://careers.google.com";

  const isLive = opportunity.sourceMode === "LIVE";
  const isCurated = opportunity.sourceMode === "CURATED_CATALOG";
  const isHackathon = opportunity.type === "Hackathon";
  const directDestinationUrl = getSafeUnstopRegistrationUrl(opportunity);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={opportunity.title}
      description={`${opportunity.organization} • ${opportunity.type}`}
      maxWidth="xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1 text-xs">
        {/* Source Provenance Banner */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-slate-300">
          <div className="flex items-start gap-2.5">
            {isLive ? (
              <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <span className="font-semibold text-white flex items-center gap-1.5 flex-wrap">
                {isHackathon ? "Verified Unstop Student Hackathon" : isLive ? "Live Ingested Feed" : isCurated ? "Verified India Catalog" : "External Search"}
                <Badge variant={isHackathon ? "cyan" : isLive ? "emerald" : "cyan"} size="sm">
                  {isHackathon ? "Unstop Official" : opportunity.portal || opportunity.sourceName || "Official Portal"}
                </Badge>
                {opportunity.freshnessLabel && (
                  <Badge variant="indigo" size="sm">
                    {opportunity.freshnessLabel.replace("_", " ")}
                  </Badge>
                )}
              </span>
              <p className="text-[11px] text-slate-400">
                {isHackathon
                  ? "Direct link verified to official Unstop hackathon page. Open for 1st, 2nd, 3rd, and 4th year college coders."
                  : opportunity.providerAttribution || `Verified vacancy aggregated from ${opportunity.sourceName}.`}
              </p>
            </div>
          </div>

          <a
            href={directDestinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button
              variant="primary"
              size="sm"
              className={`text-xs font-semibold h-8 shadow-xs ${
                isHackathon ? "bg-gradient-to-r from-cyan-600 to-indigo-600 text-white" : ""
              }`}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              {isHackathon ? "Register on Unstop (Direct) ↗" : "Direct Apply ↗"}
            </Button>
          </a>
        </div>

        {/* Primary Meta Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Organization</span>
            <span className="font-semibold text-white truncate block flex items-center gap-1 mt-0.5">
              <Building className="w-3 h-3 text-slate-400" />
              {opportunity.organization}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Work Mode</span>
            <span className="font-semibold text-slate-200 truncate block flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-slate-400" />
              {opportunity.location} ({opportunity.workMode})
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Seniority Fit</span>
            <span className="font-semibold text-slate-200 truncate block flex items-center gap-1 mt-0.5">
              <GraduationCap className="w-3 h-3 text-slate-400" />
              {opportunity.experienceLevel}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Compensation / Package</span>
            <span className="font-semibold text-emerald-400 truncate block flex items-center gap-1 mt-0.5">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              {opportunity.salaryRange || "Disclosed on Application"}
            </span>
          </div>
        </div>

        {/* Transparent 6-Factor Match Breakdown Card */}
        <div className="p-4 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              SkillPulse Match Score: {matchScore}% Alignment Index
            </span>
            <Badge variant={matchScore >= 70 ? "emerald" : matchScore >= 45 ? "indigo" : "amber"} size="sm">
              Transparent Rubric
            </Badge>
          </div>

          {/* 6-Factor Progress Bars */}
          {breakdown && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-[11px]">
              {/* Role Relevance */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Role & Domain Match</span>
                  <span className="font-mono text-indigo-300">{breakdown.roleRelevance} / 25 pts</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(breakdown.roleRelevance / 25) * 100}%` }} />
                </div>
              </div>

              {/* Required Skills */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Required Skills Alignment</span>
                  <span className="font-mono text-emerald-300">{breakdown.requiredSkills} / 30 pts</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(breakdown.requiredSkills / 30) * 100}%` }} />
                </div>
              </div>

              {/* Preferred Skills */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Preferred Tech Competencies</span>
                  <span className="font-mono text-cyan-300">{breakdown.preferredSkills} / 15 pts</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${(breakdown.preferredSkills / 15) * 100}%` }} />
                </div>
              </div>

              {/* Experience & Education */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Experience & Education Fit</span>
                  <span className="font-mono text-purple-300">{breakdown.experienceEducation} / 15 pts</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(breakdown.experienceEducation / 15) * 100}%` }} />
                </div>
              </div>

              {/* Location & Work Mode */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Location & Work-Mode Fit</span>
                  <span className="font-mono text-amber-300">{breakdown.locationWorkMode} / 10 pts</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(breakdown.locationWorkMode / 10) * 100}%` }} />
                </div>
              </div>

              {/* Recency & Verification */}
              <div className="space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Recency & Verification</span>
                  <span className="font-mono text-rose-300">{breakdown.recency} / 5 pts</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: `${(breakdown.recency / 5) * 100}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Reasoning Bullet Points */}
          {matchResult && matchResult.whyThisMatches.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Alignment Evidence:</span>
              <ul className="space-y-1 text-slate-300 text-[11px] leading-relaxed">
                {matchResult.whyThisMatches.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-400 font-bold">•</span>
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-[10px] text-slate-500 italic pt-1 border-t border-slate-800/60">
            {matchResult?.disclaimer ||
              "Informational alignment index only. Does not represent a probability of hiring or selection."}
          </p>
        </div>

        {/* Career Pathway & ATS Resume Customization Guidance */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-[#0c1427] to-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              ATS Resume Customization & Application Guidance
            </h4>
            <Link href="/resume" onClick={onClose}>
              <span className="text-[11px] font-semibold text-cyan-400 hover:underline flex items-center gap-1">
                Open Resume Builder <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>

          {/* Keywords to highlight */}
          {matchResult?.suggestedResumeKeywords && matchResult.suggestedResumeKeywords.length > 0 && (
            <div className="space-y-1 text-xs">
              <span className="text-[11px] text-slate-400 font-medium">Keywords to highlight on your ATS resume:</span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {matchResult.suggestedResumeKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-200 border border-cyan-800/60"
                  >
                    +{kw}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects to emphasize */}
          {matchResult?.projectsToEmphasize && matchResult.projectsToEmphasize.length > 0 && (
            <div className="space-y-1 text-xs pt-1 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                Featured projects from your profile to emphasize:
              </span>
              <ul className="space-y-1 text-[11px] text-slate-300">
                {matchResult.projectsToEmphasize.map((projTip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-cyan-400">•</span>
                    <span>{projTip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills to learn next */}
          {matchResult?.skillsToLearnNext && matchResult.skillsToLearnNext.length > 0 && (
            <div className="space-y-1 text-xs pt-1 border-t border-slate-800/60">
              <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-amber-400" />
                Recommended skills to add to learning roadmap:
              </span>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {matchResult.skillsToLearnNext.map((sk) => (
                  <span
                    key={sk}
                    className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-slate-300 border border-slate-800"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Opportunity Description */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
            About the Role / Opportunity
          </h4>
          <p className="text-slate-300 leading-relaxed text-xs p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            {stripHtml(opportunity.description)}
          </p>
        </div>

        {/* Technical Skills Requirements Breakdown */}
        <div className="space-y-2">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
            Technical Skill Evaluation
          </h4>
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Required Technologies
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(opportunity.requiredSkills || []).map((s) => {
                  const isMatched = matchResult?.matchedRequiredSkills.includes(s);
                  return (
                    <span
                      key={s}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 ${
                        isMatched
                          ? "bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                          : "bg-slate-800 text-slate-300 border border-slate-700"
                      }`}
                    >
                      {isMatched ? (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-slate-400" />
                      )}
                      {s}
                    </span>
                  );
                })}
              </div>
            </div>

            {opportunity.preferredSkills && opportunity.preferredSkills.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Preferred / Nice-to-Have
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {opportunity.preferredSkills.map((s) => (
                    <span
                      key={s}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 text-slate-300 border border-slate-800"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Source & Provenance Metadata */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
          <div>
            <span>Verified Source: </span>
            <strong className="text-slate-300">{opportunity.sourceName}</strong>
          </div>
          <div>
            <span>Canonical Portal: </span>
            <span className="text-cyan-400 font-mono text-[10px]">{opportunity.portal || "Direct ATS"}</span>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <Button
            variant={isSaved ? "secondary" : "outline"}
            size="sm"
            onClick={() => onToggleSave(opportunity.id)}
            className="w-full sm:w-auto text-xs"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                Bookmarked in Saved
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 mr-1" />
                Save Opportunity
              </>
            )}
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href={directDestinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="sm"
                className={`w-full sm:w-auto text-xs font-semibold ${
                  isHackathon
                    ? "bg-gradient-to-r from-cyan-950/90 to-indigo-950/90 border-cyan-400/60 text-cyan-200 hover:text-white"
                    : "border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/40 font-medium"
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                {isHackathon ? "Register on Unstop (Direct) ↗" : "Apply on Official Portal ↗"}
              </Button>
            </a>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenTrackModal(opportunity);
              }}
              className="w-full sm:w-auto text-xs font-semibold"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Track in Pipeline
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
