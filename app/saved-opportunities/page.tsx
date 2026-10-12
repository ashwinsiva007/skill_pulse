"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { opportunityRepo, applicationRepo, activityRepo } from "@/lib/repositories/local-repos";
import { Opportunity } from "@/types/opportunity";
import { Bookmark, MapPin, DollarSign, Send, Trash2, ArrowLeft } from "lucide-react";

export default function SavedOpportunitiesPage() {
  const router = useRouter();
  const [savedList, setSavedList] = useState<Opportunity[]>([]);

  const loadSaved = async () => {
    const list = await opportunityRepo.getSavedOpportunities();
    setSavedList(list);
  };

  useEffect(() => {
    loadSaved();
  }, []);

  const handleRemove = async (id: string) => {
    await opportunityRepo.toggleSaveOpportunity(id);
    loadSaved();
  };

  const handleApply = async (opp: Opportunity) => {
    await applicationRepo.addApplication({
      opportunityId: opp.id,
      company: opp.company,
      role: opp.title,
      stage: "applied",
      salaryRange: opp.salaryRange,
      notes: "Applied from saved opportunities bookmarks.",
    });
    await opportunityRepo.updateOpportunityStatus(opp.id, "applied");
    await activityRepo.logActivity({
      type: "application",
      title: `Applied to ${opp.title}`,
      description: `Submitted from Saved Opportunities`,
      routeLink: "/tracker",
      tag: "Application Tracker",
    });
    loadSaved();
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Saved Opportunities</h1>
              <Badge variant="indigo" size="sm">
                Bookmarks
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Roles you have pinned to evaluate and apply with customized resume drafts.
            </p>
          </div>

          <Link href="/opportunities">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-3.5 h-3.5 mr-1" />
              All Opportunities
            </Button>
          </Link>
        </div>

        {savedList.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="No Saved Opportunities Yet"
            description="Browse curated matching roles and click 'Save Role' to bookmark opportunities here."
            actionLabel="Browse Available Opportunities"
            onAction={() => router.push("/opportunities")}
          />
        ) : (
          <div className="space-y-4">
            {savedList.map((opp) => (
              <Card key={opp.id} className="p-5">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                        {opp.company}
                      </span>
                      <Badge variant="emerald" size="sm">
                        {opp.matchScore}% Match
                      </Badge>
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
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                      {opp.description}
                    </p>
                  </div>

                  <div className="flex lg:flex-col items-center gap-2 shrink-0">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApply(opp)}
                      className="w-full text-xs"
                    >
                      <Send className="w-3.5 h-3.5 mr-1" />
                      Apply Now
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(opp.id)}
                      className="w-full text-xs text-slate-400 hover:text-rose-300"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
