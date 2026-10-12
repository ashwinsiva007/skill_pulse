import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle2, ArrowUpRight } from "lucide-react";

export interface CareerReadinessCardProps {
  targetRole: string;
  readinessScore: number;
}

export const CareerReadinessCard: React.FC<CareerReadinessCardProps> = ({
  targetRole,
  readinessScore,
}) => {
  const competenceAreas = [
    { label: "LLM Orchestration & RAG", score: 92, status: "Proficient" },
    { label: "Full-Stack Architecture", score: 95, status: "Mastery" },
    { label: "Cloud & Containerized Serving", score: 62, status: "In Progress" },
    { label: "Technical Mentorship & Systems", score: 85, status: "Strong" },
  ];

  return (
    <Card className="h-full flex flex-col justify-between">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>Target Role Career Readiness</CardTitle>
              <Badge variant="indigo" size="sm">
                Illustrative AI Metric
              </Badge>
            </div>
            <CardDescription>
              Progression analysis for <strong className="text-slate-200">{targetRole}</strong>
            </CardDescription>
          </div>
          <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Readiness Meter */}
        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="flex items-baseline justify-between mb-2">
            <div>
              <span className="text-3xl font-extrabold text-white tracking-tight">
                {readinessScore}%
              </span>
              <span className="text-xs text-slate-400 ml-2">Estimated Role Alignment</span>
            </div>
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Interview Ready
            </span>
          </div>
          <Progress
            value={readinessScore}
            size="md"
            indicatorClassName="bg-gradient-to-r from-indigo-500 to-violet-500"
          />
          <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
            * Clearly labeled illustrative score based on 14 recorded skills, verified projects, and demo roadmap milestones.
          </p>
        </div>

        {/* Sub-competencies */}
        <div className="space-y-3 pt-1">
          <span className="text-xs font-semibold text-slate-300">Competency Breakdown</span>
          <div className="space-y-2.5">
            {competenceAreas.map((area) => (
              <div key={area.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-300">{area.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">{area.score}%</span>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded ${
                        area.score >= 80
                          ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/60"
                          : "bg-amber-950/80 text-amber-400 border border-amber-800/60"
                      }`}
                    >
                      {area.status}
                    </span>
                  </div>
                </div>
                <Progress
                  value={area.score}
                  size="sm"
                  indicatorClassName={area.score >= 80 ? "bg-emerald-500" : "bg-amber-500"}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <Link href="/skills" className="w-full">
            <Button variant="outline" size="sm" className="w-full text-xs">
              View Detailed Skill Gap Analysis
              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};
