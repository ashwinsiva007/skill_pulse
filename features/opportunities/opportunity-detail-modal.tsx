"use client";

import React from "react";
import { Opportunity } from "@/types/opportunity";
import { OpportunityMatchResult } from "@/lib/opportunities/matching-engine";
import { Modal } from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ShieldAlert,
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={opportunity.title}
      description={`${opportunity.organization} • ${opportunity.type}`}
      maxWidth="lg"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 text-xs">
        {/* Demo Listing Notice */}
        <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/50 flex items-start gap-2.5 text-amber-300">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
          <div className="space-y-0.5 leading-relaxed">
            <span className="font-semibold text-white">Demonstration Listing Notice:</span>
            <p className="text-[11px] text-amber-200/90">
              This entry is an illustrative sample listing for early-career career navigation and testing. It does not represent a live, verified job posting.
            </p>
          </div>
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
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Experience Level</span>
            <span className="font-semibold text-slate-200 truncate block flex items-center gap-1 mt-0.5">
              <GraduationCap className="w-3 h-3 text-slate-400" />
              {opportunity.experienceLevel}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block">Compensation / Award</span>
            <span className="font-semibold text-emerald-400 truncate block flex items-center gap-1 mt-0.5">
              <DollarSign className="w-3 h-3 text-emerald-400" />
              {opportunity.salaryRange || "Unspecified / Volunteer"}
            </span>
          </div>
        </div>

        {/* Match Breakdown & Why This Matches */}
        {matchResult && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 border border-indigo-900/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">
                    Why This Matches Your Profile ({matchScore}% Match Index)
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Transparent rule-based profile alignment analysis
                  </span>
                </div>
              </div>
              <Badge
                variant={matchScore >= 80 ? "emerald" : matchScore >= 60 ? "indigo" : "neutral"}
                size="sm"
              >
                {matchScore >= 80 ? "High Alignment" : matchScore >= 60 ? "Moderate Match" : "Growth Target"}
              </Badge>
            </div>

            <ul className="space-y-1.5 pl-1 text-[11px] text-slate-300">
              {matchResult.whyThisMatches.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Description */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">Opportunity Overview</h4>
          <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            {opportunity.description}
          </p>
        </div>

        {/* Eligibility Requirements */}
        {opportunity.eligibilityRequirements && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Eligibility & Prerequisites</h4>
            <p className="text-slate-400 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-[11px]">
              {opportunity.eligibilityRequirements}
            </p>
          </div>
        )}

        {/* Skills Evaluation (Required vs Preferred) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Required Skills */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Required Skills ({opportunity.requiredSkills.length})</span>
              <span className="text-[10px] text-indigo-400 uppercase font-semibold">Core Criteria</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {opportunity.requiredSkills.map((sk) => {
                const isMatched = matchResult?.matchedRequiredSkills.includes(sk);
                return (
                  <span
                    key={sk}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1 ${
                      isMatched
                        ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                        : "bg-amber-950/40 text-amber-300 border-amber-800/50"
                    }`}
                  >
                    {isMatched ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <AlertCircle className="w-3 h-3 text-amber-400" />}
                    {sk}
                  </span>
                );
              })}
            </div>
            <p className="text-[10px] text-slate-500 pt-1">
              Highlighted in amber indicates skills not yet recorded in your profile.
            </p>
          </div>

          {/* Preferred Skills */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200">Preferred / Bonus Skills</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Optional Boost</span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {opportunity.preferredSkills.length === 0 ? (
                <span className="text-[11px] text-slate-500 italic">None specified</span>
              ) : (
                opportunity.preferredSkills.map((sk) => {
                  const isMatched = matchResult?.matchedPreferredSkills.includes(sk);
                  return (
                    <span
                      key={sk}
                      className={`px-2 py-0.5 rounded text-[11px] font-medium border flex items-center gap-1 ${
                        isMatched
                          ? "bg-indigo-950/60 text-indigo-300 border-indigo-800/60"
                          : "bg-slate-900 text-slate-400 border-slate-800"
                      }`}
                    >
                      {sk}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Source and Verification Metadata */}
        <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div>
            <span>Source: </span>
            <strong className="text-slate-300">{opportunity.sourceName}</strong>
          </div>
          <div>
            <span>Verification: </span>
            <span className="text-amber-300 font-medium">Demonstration Simulated</span>
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
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                onClose();
                onOpenTrackModal(opportunity);
              }}
              className="w-full sm:w-auto text-xs"
            >
              <Send className="w-3.5 h-3.5 mr-1" />
              Track in Application Pipeline
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
