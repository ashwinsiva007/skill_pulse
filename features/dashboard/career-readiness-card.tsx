"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, ArrowUpRight, AlertCircle } from "lucide-react";

export interface CareerReadinessCardProps {
  targetRole: string;
  matchScore: number;
  coreCoverage: number;
  supportingCoverage: number;
  matchedSkills: string[];
  missingSkills: string[];
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({
  targetRole,
  matchScore,
  coreCoverage,
  supportingCoverage,
  matchedSkills,
  missingSkills,
}) => {
  return (
    <Card className="h-full flex flex-col justify-between bg-slate-900/90 border-slate-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>Target Role Alignment</CardTitle>
              <Badge variant="indigo" size="sm">
                Skill Analyzer Evaluated
              </Badge>
            </div>
            <CardDescription>
              Progression analysis calculated for <strong className="text-slate-200">{targetRole}</strong>
            </CardDescription>
          </div>
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Readiness Meter */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {matchScore}%
              </span>
              <span className="text-xs text-slate-400 ml-2">Benchmark Alignment Index</span>
            </div>
            <Badge
              variant={matchScore >= 75 ? "emerald" : matchScore >= 50 ? "indigo" : "amber"}
              size="sm"
            >
              {matchScore >= 75 ? "Strong Match" : matchScore >= 50 ? "Moderate Match" : "Development Target"}
            </Badge>
          </div>
          <Progress
            value={matchScore}
            size="md"
            indicatorClassName={matchScore >= 75 ? "bg-emerald-500" : "bg-indigo-500"}
          />
          <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
            <span>Core Skill Coverage: <strong className="text-slate-200">{coreCoverage}%</strong></span>
            <span>Supporting Skills: <strong className="text-slate-200">{supportingCoverage}%</strong></span>
          </div>
        </div>

        {/* Competencies Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5 text-[11px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified Competencies ({matchedSkills.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {matchedSkills.slice(0, 4).map((sk) => (
                <span
                  key={sk}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                >
                  {sk}
                </span>
              ))}
              {matchedSkills.length > 4 && (
                <span className="text-[10px] text-slate-500">+{matchedSkills.length - 4} more</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1.5">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5" />
              High-Impact Gaps ({missingSkills.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {missingSkills.slice(0, 3).map((sk) => (
                <span
                  key={sk}
                  className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950/40 text-amber-300 border border-amber-800/50"
                >
                  {sk}
                </span>
              ))}
              {missingSkills.length === 0 && (
                <span className="text-[10px] text-emerald-400">All core benchmarks recorded!</span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-1">
          <Link href="/skills" className="w-full">
            <Button variant="outline" size="sm" className="w-full text-xs">
              Open Full Skill Analyzer & Gap Diagnostics
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
