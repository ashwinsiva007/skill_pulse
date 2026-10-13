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
  const [showSimulatedBanner, setShowSimulatedBanner] = useState(false);

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
    if (score >= 80) return "emerald";
    if (score >= 60) return "indigo";
    return "amber";
  };

  const matchedRequired = matchResult ? matchResult.matchedRequiredSkills : opportunity.matchedSkills;
  const missingRequired = matchResult ? matchResult.missingRequiredSkills : opportunity.missingSkills;

  const handleExternalClick = () => {
    setShowSimulatedBanner(true);
    setTimeout(() => setShowSimulatedBanner(false), 5000);
  };

  return (
    <Card className="p-5 hover:border-slate-700/80 transition-all duration-150 space-y-4 bg-slate-900/70">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            {opportunity.organization}
          </span>
          <Badge variant={getTypeVariant(opportunity.type)} size="sm">
            {opportunity.type}
          </Badge>
          <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 font-medium">
            {opportunity.domain}
          </span>
          <Badge variant="amber" size="sm" className="font-mono text-[10px]">
            DEMO LISTING
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={getScoreVariant(matchScore)} size="sm">
            {matchScore}% Match
          </Badge>
          <span className="text-[11px] text-slate-500">· {opportunity.postedDate}</span>
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
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
        {opportunity.description}
      </p>

      {/* "Why This Matches You" Explainable Snippet */}
      {matchResult && matchResult.whyThisMatches.length > 0 && (
        <div className="p-3 rounded-lg bg-indigo-950/30 border border-indigo-900/40 space-y-1.5 text-xs">
          <div
            onClick={() => setIsWhyMatchesExpanded(!isWhyMatchesExpanded)}
            className="flex items-center justify-between cursor-pointer select-none text-[11px] font-semibold text-indigo-300"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Why this matches you:
            </span>
            <ChevronDown
              className={`w-3.5 h-3.5 transition-transform ${isWhyMatchesExpanded ? "rotate-180" : ""}`}
            />
          </div>

          <p className="text-slate-300 leading-relaxed text-[11px]">
            {matchResult.whyThisMatches[0]}
          </p>

          {isWhyMatchesExpanded && (
            <ul className="pt-1 space-y-1 text-[11px] text-slate-400 border-t border-indigo-900/40 animate-in fade-in">
              {matchResult.whyThisMatches.slice(1).map((point, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-indigo-400">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Skills Overlap Breakdown */}
      <div className="space-y-1.5 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Required:</span>
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
              className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-800/50 flex items-center gap-1"
              title="Not yet recorded in your profile skills"
            >
              <AlertCircle className="w-3 h-3 text-amber-400" />
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Simulated External Notification Banner */}
      {showSimulatedBanner && (
        <div className="p-2.5 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-[11px] text-indigo-200 flex items-center justify-between animate-in fade-in">
          <span>
            <strong>Simulated Listing Notice:</strong> External application portal simulated for demo. Track your application in the pipeline below!
          </span>
          <button
            type="button"
            onClick={() => onTrackApplication(opportunity)}
            className="text-white underline font-semibold ml-2 hover:text-indigo-300"
          >
            Track Application →
          </button>
        </div>
      )}

      {/* Action Toolbar */}
      <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant={isSaved ? "secondary" : "outline"}
            size="sm"
            onClick={() => onToggleSave(opportunity.id)}
            className="text-xs"
          >
            {isSaved ? (
              <>
                <BookmarkCheck className="w-3.5 h-3.5 mr-1 text-indigo-400" />
                Saved
              </>
            ) : (
              <>
                <Bookmark className="w-3.5 h-3.5 mr-1" />
                Save Role
              </>
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(opportunity)}
            className="text-xs text-slate-300 hover:text-white"
          >
            <Eye className="w-3.5 h-3.5 mr-1" />
            Full Details
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExternalClick}
            className="text-xs text-slate-400 hover:text-indigo-300"
            title="Demonstration external action"
          >
            <ExternalLink className="w-3.5 h-3.5 mr-1" />
            External Portal
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onTrackApplication(opportunity)}
            className="text-xs"
          >
            <Send className="w-3.5 h-3.5 mr-1" />
            Track in Pipeline
          </Button>
        </div>
      </div>
    </Card>
  );
};
