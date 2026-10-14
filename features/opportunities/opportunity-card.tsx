"use client";

import React, { useState } from "react";
import { Opportunity } from "@/types/opportunity";
import { OpportunityMatchResult } from "@/lib/opportunities/matching-engine";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  DollarSign,
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

  // Generate dynamic recommendation note
  const getRecommendationSummary = () => {
    if (opportunity.type === "Hackathon") {
      return `Recommended Hackathon: Build rapid portfolio evidence, collaborate with international teams, and showcase your development skills. Prizes & recognition awarded by ${opportunity.organization}.`;
    }
    if (opportunity.type === "Internship") {
      return `Recommended Internship: Direct practical mentorship with structured compensation. Ideal for early-career developers looking to gain production experience.`;
    }
    if (matchedRequired.length > 0) {
      return `Recommended Role: Direct match for your ${matchedRequired.slice(0, 3).join(", ")} skills. Review the requirements on the official portal and tailor your ATS resume before applying.`;
    }
    return `Verified active vacancy at ${opportunity.organization}. Cross-check technical requirements and apply on the official portal.`;
  };

  const applyUrl = opportunity.applicationUrl || opportunity.sourceUrl || "https://devpost.com";

  return (
    <Card className="p-5 hover:border-slate-700/80 transition-all duration-150 space-y-4 bg-slate-900/80">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            {opportunity.organization}
          </span>
          <Badge variant={getTypeVariant(opportunity.type)} size="sm">
            {opportunity.type}
          </Badge>
          <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-medium">
            {opportunity.domain}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            Verified Live
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getScoreVariant(matchScore)} size="sm">
            {matchScore}% Match
          </Badge>
          <span className="text-[11px] text-slate-400">· {opportunity.postedDate}</span>
        </div>
      </div>

      {/* Main Title */}
      <div>
        <h3
          onClick={() => onViewDetails(opportunity)}
          className="text-base font-bold text-white hover:text-indigo-300 transition-colors cursor-pointer tracking-tight"
        >
          {opportunity.title}
        </h3>

        {/* Location, Mode, Comp, Exp */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 pt-1.5">
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            {opportunity.location} ({opportunity.workMode})
          </span>

          {opportunity.salaryRange && (
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              {opportunity.salaryRange}
            </span>
          )}

          <span className="text-slate-400">
            Level: <strong className="text-slate-300 font-medium">{opportunity.experienceLevel}</strong>
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
        {opportunity.description}
      </p>

      {/* AI Recommendation & Match Note */}
      <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-1.5 text-xs">
        <div
          onClick={() => setIsWhyMatchesExpanded(!isWhyMatchesExpanded)}
          className="flex items-center justify-between cursor-pointer select-none text-[11px] font-semibold text-indigo-300"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            SkillPulse Recommendation Note:
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${isWhyMatchesExpanded ? "rotate-180" : ""}`}
          />
        </div>

        <p className="text-slate-300 leading-relaxed text-[11px]">
          {matchResult?.whyThisMatches?.[0] || getRecommendationSummary()}
        </p>

        {isWhyMatchesExpanded && matchResult && matchResult.whyThisMatches.length > 1 && (
          <ul className="pt-1.5 space-y-1 text-[11px] text-slate-400 border-t border-slate-800 animate-in fade-in">
            {matchResult.whyThisMatches.slice(1).map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-indigo-400">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Skills Overlap Breakdown */}
      <div className="space-y-1.5 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Skills:</span>
          {matchedRequired.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              {s}
            </span>
          ))}

          {missingRequired.map((s) => (
            <span
              key={s}
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800/80 text-slate-300 border border-slate-700/60 flex items-center gap-1"
              title="Opportunity required skill"
            >
              <AlertCircle className="w-3 h-3 text-slate-400" />
              {s}
            </span>
          ))}
        </div>
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
            Details
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct External Link to Apply or Register */}
          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/50 hover:text-white font-medium"
              title="Open official listing and registration in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
              {opportunity.type === "Hackathon" ? "Register on Devpost ↗" : "Apply on Official Site ↗"}
            </Button>
          </a>

          {/* Track in Application Pipeline */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => onTrackApplication(opportunity)}
            className="text-xs h-8 font-semibold"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Track in Pipeline
          </Button>
        </div>
      </div>
    </Card>
  );
};
