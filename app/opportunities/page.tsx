"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { opportunityRepo, applicationRepo, activityRepo } from "@/lib/repositories/local-repos";
import { Opportunity } from "@/types/opportunity";
import {
  MapPin,
  DollarSign,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  CheckCircle2,
  Send,
} from "lucide-react";

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [appliedMessage, setAppliedMessage] = useState<string | null>(null);

  const loadOpportunities = async () => {
    const list = await opportunityRepo.getOpportunities();
    setOpportunities(list);
  };

  useEffect(() => {
    loadOpportunities();
  }, []);

  const handleToggleSave = async (id: string) => {
    const opp = await opportunityRepo.toggleSaveOpportunity(id);
    await activityRepo.logActivity({
      type: "opportunity",
      title: `${opp.status === "saved" ? "Saved" : "Unsaved"} role: ${opp.title}`,
      description: `${opp.company} (${opp.matchScore}% Match)`,
      routeLink: "/saved-opportunities",
      tag: "Opportunities",
    });
    loadOpportunities();
  };

  const handleQuickApply = async (opp: Opportunity) => {
    try {
      await applicationRepo.addApplication({
        opportunityId: opp.id,
        company: opp.company,
        role: opp.title,
        stage: "applied",
        salaryRange: opp.salaryRange,
        notes: `Applied with tailored AI Solutions Architect resume. Match score: ${opp.matchScore}%.`,
        nextStep: "Awaiting recruiter response",
      });

      await opportunityRepo.updateOpportunityStatus(opp.id, "applied");

      await activityRepo.logActivity({
        type: "application",
        title: `Applied to ${opp.title}`,
        description: `Submitted application to ${opp.company}`,
        routeLink: "/tracker",
        tag: "Application Tracker",
      });

      setAppliedMessage(`Application recorded for ${opp.company}! Track it in Application Tracker.`);
      setTimeout(() => setAppliedMessage(null), 4000);
      loadOpportunities();
    } catch (err) {
      console.error("Failed to apply:", err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Opportunities</h1>
              <Badge variant="cyan" size="sm">
                Stage 5 Preview
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Curated role matches evaluated against your verified skill profile and target transition.
            </p>
          </div>

          <Link href="/saved-opportunities">
            <Button variant="outline" size="sm">
              <Bookmark className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              View Saved ({opportunities.filter((o) => o.status === "saved").length})
            </Button>
          </Link>
        </div>

        {/* Applied Alert notification */}
        {appliedMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-200 flex items-center justify-between animate-in fade-in">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              {appliedMessage}
            </span>
            <Link href="/tracker" className="font-semibold underline hover:text-white">
              Open Tracker →
            </Link>
          </div>
        )}

        {/* Stage 5 Preview Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-800/40 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-slate-200">
                Stage 5 Core Engine: Automated Job Discovery & Application Pipeline
              </p>
              <p className="text-slate-400 leading-relaxed max-w-2xl">
                Stage 5 integrates live job feed aggregators, personalized ATS match scoring algorithms, and automated pipeline synchronization.
              </p>
            </div>
          </div>
          <Badge variant="emerald" size="md" className="shrink-0">
            Coming in Stage 5
          </Badge>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="p-5 hover:border-slate-700/80 transition-colors">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {opp.company}
                    </span>
                    <Badge
                      variant={
                        opp.matchScore >= 90
                          ? "emerald"
                          : opp.matchScore >= 80
                          ? "indigo"
                          : "neutral"
                      }
                      size="sm"
                    >
                      {opp.matchScore}% Match
                    </Badge>
                    <span className="text-[11px] text-slate-400">· Posted {opp.postedDate}</span>
                  </div>

                  <h3 className="text-base font-semibold text-white">{opp.title}</h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {opp.location} ({opp.workplaceType})
                    </span>
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                      <DollarSign className="w-3.5 h-3.5" />
                      {opp.salaryRange}
                    </span>
                    <span>Level: {opp.experienceLevel}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-1">
                    {opp.description}
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-slate-400">Matched Skills:</span>
                    {opp.matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-medium"
                      >
                        ✓ {s}
                      </span>
                    ))}
                    {opp.missingSkills.length > 0 && (
                      <>
                        <span className="text-[11px] text-slate-500 ml-2">Missing:</span>
                        {opp.missingSkills.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/50 font-medium"
                          >
                            ! {s}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex lg:flex-col items-center gap-2 shrink-0 pt-2 lg:pt-0">
                  <Button
                    variant={opp.status === "saved" ? "secondary" : "outline"}
                    size="sm"
                    onClick={() => handleToggleSave(opp.id)}
                    className="w-full text-xs"
                  >
                    {opp.status === "saved" ? (
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
                    variant={opp.status === "applied" ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleQuickApply(opp)}
                    disabled={opp.status === "applied"}
                    className="w-full text-xs"
                  >
                    {opp.status === "applied" ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                        Applied
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1" />
                        Quick Apply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
