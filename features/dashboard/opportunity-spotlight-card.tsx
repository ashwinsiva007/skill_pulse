import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Opportunity } from "@/types/opportunity";
import { Briefcase, ArrowRight, Bookmark, MapPin, DollarSign } from "lucide-react";

export interface OpportunitySpotlightCardProps {
  topOpportunity?: Opportunity;
}

export const OpportunitySpotlightCard: React.FC<OpportunitySpotlightCardProps> = ({
  topOpportunity,
}) => {
  if (!topOpportunity) return null;

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>Top Role Alignment</CardTitle>
              <Badge variant="emerald" size="sm">
                {topOpportunity.matchScore}% Match
              </Badge>
            </div>
            <CardDescription>
              AI-evaluated match based on verified skills and architecture experience
            </CardDescription>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {topOpportunity.company}
            </span>
            <h4 className="text-base font-semibold text-white mt-0.5">
              {topOpportunity.title}
            </h4>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {topOpportunity.location}
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <DollarSign className="w-3.5 h-3.5" />
              {topOpportunity.salaryRange}
            </span>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
            {topOpportunity.description}
          </p>

          <div className="pt-1">
            <div className="text-[11px] text-slate-400 mb-1.5 font-medium">Matched Skills:</div>
            <div className="flex flex-wrap gap-1.5">
              {topOpportunity.matchedSkills.map((s) => (
                <span
                  key={s}
                  className="px-2 py-0.5 text-[10px] rounded-md bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 font-medium"
                >
                  ✓ {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 pt-1">
          <Link href="/opportunities" className="flex-1">
            <Button variant="primary" size="sm" className="w-full text-xs">
              Explore All Opportunities
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
          <Link href="/saved-opportunities">
            <Button variant="outline" size="sm" className="text-xs" title="View Saved">
              <Bookmark className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
