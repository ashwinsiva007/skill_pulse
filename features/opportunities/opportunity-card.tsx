"use client";

import React, { useState } from "react";
import { Opportunity } from "@/types/opportunity";
import { OpportunityMatchResult } from "@/lib/opportunities/matching-engine";
import { getSafeUnstopRegistrationUrl } from "@/lib/opportunities/hackathons-catalog";
import { stripHtml } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Bookmark,
  BookmarkCheck,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  ChevronDown,
  Building,
  ShieldCheck,
  Clock,
  Radio,
  FileCheck,
  Trophy,
  Users,
} from "lucide-react";

export interface OpportunityCardProps {
  opportunity: Opportunity;
  matchResult?: OpportunityMatchResult;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onViewDetails: (opp: Opportunity) => void;
  onTrackApplication: (opp: Opportunity) => void;
}

export const OpportunityCard: React.FC<OpportunityCardProps> = ({
  opportunity,
  matchResult,
  isSaved,
  onToggleSave,
  onViewDetails,
  onTrackApplication,
}) => {
  const [isWhyMatchesExpanded, setIsWhyMatchesExpanded] = useState(false);

  const matchScore = matchResult ? matchResult.matchScore : opportunity.matchScore;

  const getTypeVariant = (type: string): "indigo" | "cyan" | "emerald" | "amber" | "neutral" => {
    switch (type) {
      case "Job":
        return "indigo";
      case "Internship":
        return "emerald";
      case "Hackathon":
        return "cyan";
      case "Research":
        return "amber";
      default:
        return "neutral";
    }
  };

  const getScoreVariant = (score: number): "emerald" | "indigo" | "amber" => {
    if (score >= 70) return "emerald";
    if (score >= 45) return "indigo";
    return "amber";
  };

  const matchedRequired = matchResult ? matchResult.matchedRequiredSkills : opportunity.matchedSkills;
  const missingRequired = matchResult ? matchResult.missingRequiredSkills : opportunity.missingSkills;

  // Source badge styling
  const isLive = opportunity.sourceMode === "LIVE";
  const isCurated = opportunity.sourceMode === "CURATED_CATALOG";
  const isHackathon = opportunity.type === "Hackathon";

  const directDestinationUrl = getSafeUnstopRegistrationUrl(opportunity);

  return (
    <Card className={`p-5 transition-all duration-150 space-y-4 bg-slate-900/80 hover:border-slate-700/80 ${
      isHackathon ? "border-cyan-500/30 hover:border-cyan-500/60 shadow-xs" : ""
    }`}>
      {/* Top Header Row with Provenance & Match Score */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            {opportunity.organization}
          </span>

          <Badge variant={getTypeVariant(opportunity.type)} size="sm">
            {opportunity.type}
          </Badge>

          {/* Hackathon Specific: Unstop Partner Badge */}
          {isHackathon && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 shadow-xs">
              <Trophy className="w-3 h-3 text-cyan-400" />
              Unstop Verified
            </span>
          )}

          {/* Source Provenance Badge */}
          {!isHackathon && isLive ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Live Ingested ({opportunity.portal || "ATS"})
            </span>
          ) : !isHackathon && isCurated ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <FileCheck className="w-3 h-3 text-cyan-400" />
              Verified Catalog
            </span>
          ) : null}

          {/* Freshness Badge */}
          {opportunity.freshnessLabel === "RECENTLY_POSTED" && (
            <span className="text-[10px] text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              Recently Posted
            </span>
          )}

          {opportunity.region && (
            <span className="text-[10px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-medium">
              📍 {opportunity.region}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Badge variant={getScoreVariant(matchScore)} size="sm" className="font-bold">
            {matchScore}% Profile Alignment
          </Badge>
          <span className="text-[11px] text-slate-400">· {opportunity.postedDate}</span>
        </div>
      </div>

      {/* Main Title & Key Specs */}
      <div>
        <h3
          onClick={() => onViewDetails(opportunity)}
          className="text-base font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer tracking-tight"
        >
          {opportunity.title}
        </h3>

        {/* Location, Mode, Comp, Exp, Team Size */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-400 pt-1.5">
          <span className="flex items-center gap-1 font-medium text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-indigo-400" />
            {opportunity.location} ({opportunity.workMode})
          </span>

          {opportunity.salaryRange && (
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded border font-semibold ${
              isHackathon
                ? "bg-emerald-950/70 text-emerald-300 border-emerald-600/70 shadow-xs"
                : "text-emerald-400 bg-emerald-950/40 border-emerald-800/50"
            }`}>
              {isHackathon && <Trophy className="w-3 h-3 text-amber-400 shrink-0" />}
              {opportunity.salaryRange}
            </span>
          )}

          {isHackathon && (
            <span className="flex items-center gap-1 text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/50 text-[11px] font-medium">
              <Users className="w-3 h-3 text-cyan-400" />
              {opportunity.teamSize || "2 - 4 Members"}
            </span>
          )}

          <span className="text-slate-400">
            Eligibility: <strong className="text-slate-300 font-medium">{opportunity.experienceLevel}</strong>
          </span>

          {opportunity.deadline && (
            <span className="text-amber-400/90 text-[11px] font-medium">
              Deadline: {opportunity.deadline}
            </span>
          )}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
        {stripHtml(opportunity.description)}
      </p>

      {/* Transparent Match Reason */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
        <div
          onClick={() => setIsWhyMatchesExpanded(!isWhyMatchesExpanded)}
          className="flex items-center justify-between cursor-pointer select-none text-[11px] font-semibold text-indigo-300"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Match Alignment Reasoning:
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${isWhyMatchesExpanded ? "rotate-180" : ""}`}
          />
        </div>

        <p className="text-slate-300 leading-relaxed text-[11px]">
          {matchResult?.whyThisMatches?.[0] ||
            `Candidate alignment: targets ${opportunity.domain} competencies matching ${opportunity.organization}.`}
        </p>

        {isWhyMatchesExpanded && matchResult && matchResult.whyThisMatches.length > 1 && (
          <ul className="pt-1.5 space-y-1 text-[11px] text-slate-400 border-t border-slate-800 animate-in fade-in">
            {matchResult.whyThisMatches.slice(1).map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-indigo-400 font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Matching Skills Only - Focused Skill Alignment */}
      <div className="space-y-1.5 pt-1 text-xs">
        {matchedRequired && matchedRequired.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-emerald-400 font-semibold mr-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Matching Skills ({matchedRequired.length}):
            </span>
            {matchedRequired.map((s) => (
              <span
                key={s}
                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1 shadow-xs"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {s}
              </span>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 italic">
            <span>No direct skill overlap recorded yet — review role requirements</span>
          </div>
        )}
      </div>

      {/* Action Toolbar */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Button
            variant={isSaved ? "secondary" : "outline"}
            size="sm"
            onClick={() => onToggleSave(opportunity.id)}
            className="text-xs h-8"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 mr-1" />
                Save
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(opportunity)}
            className="text-xs h-8 text-slate-300 hover:text-white"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Details & Score
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct External Link to Apply on genuine source */}
          <a
            href={directDestinationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button
              variant="outline"
              size="sm"
              className={`text-xs h-8 font-semibold shadow-xs transition-all ${
                isHackathon
                  ? "bg-gradient-to-r from-cyan-950/90 to-indigo-950/90 border-cyan-400/60 text-cyan-200 hover:text-white hover:border-cyan-300 hover:from-cyan-900 hover:to-indigo-900"
                  : "border-cyan-500/40 text-cyan-300 hover:bg-cyan-950/50 hover:text-white"
              }`}
              title={
                isHackathon
                  ? `Open verified direct Unstop hackathon registration page for ${opportunity.title}`
                  : "Open official listing and registration in a new tab"
              }
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
              {isHackathon ? "Register on Unstop (Direct) ↗" : "Apply on Official Portal ↗"}
            </Button>
          </a>

          {/* Track in Application Pipeline */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => onTrackApplication(opportunity)}
            className="text-xs h-8 font-semibold shadow-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Track in Pipeline
          </Button>
        </div>
      </div>
    </Card>
  );
};
