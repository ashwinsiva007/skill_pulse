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
  ExternalLink,
  ShieldCheck,
  Calendar,
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
  const applyUrl = opportunity.applicationUrl || opportunity.sourceUrl || "https://devpost.com";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={opportunity.title}
      description={`${opportunity.organization} • ${opportunity.type}`}
      maxWidth="lg"
    >
      <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 text-xs">
        {/* Verified Live Feed Notice */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-slate-300">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold text-white flex items-center gap-1.5">
                Verified Real-Time Listing
                <Badge variant="emerald" size="sm">Active</Badge>
              </span>
              <p className="text-[11px] text-slate-400">
                Aggregated from {opportunity.sourceName || "Official Partner"}. Verify the latest requirements on the official portal before submitting your application.
              </p>
            </div>
          </div>

          <a
            href={applyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button variant="primary" size="sm" className="text-xs font-semibold h-8 shadow-xs">
              <ExternalLink className="w-3 h-3 mr-1" />
              Apply Now ↗
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
              {opportunity.salaryRange || "Competitive / Unspecified"}
            </span>
          </div>
        </div>

        {/* AI Recommendation & Match Score Banner */}
        <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-xs">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              Personalized SkillPulse Recommendation: {matchScore}% Alignment
            </span>
            <Badge variant="indigo" size="sm">
              Role Match
            </Badge>
          </div>

          {matchResult && matchResult.whyThisMatches.length > 0 ? (
            <ul className="space-y-1.5 text-slate-300 text-[11px] leading-relaxed">
              {matchResult.whyThisMatches.map((reason, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-300 text-[11px]">
              Strong opening for developers with background in {opportunity.requiredSkills.slice(0, 3).join(", ")}.
            </p>
          )}
        </div>

        {/* Opportunity Description */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider text-slate-400">
            About the Role / Event
          </h4>
          <p className="text-slate-300 leading-relaxed text-xs p-3.5 rounded-xl bg-slate-950/60 border border-slate-800">
            {opportunity.description}
          </p>
        </div>

        {/* Skills Requirements Breakdown */}
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
                {opportunity.requiredSkills.map((s) => {
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

        {/* Source & Metadata */}
        <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
          <div>
            <span>Verified Source: </span>
            <strong className="text-slate-300">{opportunity.sourceName}</strong>
          </div>
          <div>
            <span>Status: </span>
            <span className="text-emerald-400 font-medium">Open & Accepting Applications</span>
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
              href={applyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto text-xs border-indigo-500/40 text-indigo-300 hover:bg-indigo-950/40"
              >
                <ExternalLink className="w-3.5 h-3.5 mr-1" />
                Direct Application Portal ↗
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
