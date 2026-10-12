import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

interface StepItem {
  id: string;
  category: "Roadmap" | "Skills" | "Resume" | "Interview";
  title: string;
  description: string;
  actionText: string;
  href: string;
  priority: "High" | "Medium";
}

const RECOMMENDED_STEPS: StepItem[] = [
  {
    id: "step-1",
    category: "Interview",
    title: "Prep for Technical Interview at Aether Dynamics",
    description: "System architecture interview scheduled for Thursday with VP of Engineering.",
    actionText: "Open Tracker",
    href: "/tracker",
    priority: "High",
  },
  {
    id: "step-2",
    category: "Skills",
    title: "Address Kubernetes Cluster Tuning Skill Gap",
    description: "Closing this single gap increases Synthetix role alignment from 94% to 99%.",
    actionText: "Analyze Gap",
    href: "/skills",
    priority: "High",
  },
  {
    id: "step-3",
    category: "Resume",
    title: "Export & Review AI Solutions Architect Resume",
    description: "Current ATS optimization score is 89%. Tailor keywords for enterprise clients.",
    actionText: "Review Draft",
    href: "/resume",
    priority: "Medium",
  },
  {
    id: "step-4",
    category: "Roadmap",
    title: "Publish Report on Quantized LLMs (Phase 2 Action)",
    description: "Final remaining milestone action item to reach 100% Phase 2 completion.",
    actionText: "Roadmap Details",
    href: "/roadmap",
    priority: "Medium",
  },
];

export const RecommendedStepsCard: React.FC = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CardTitle>Recommended Next Steps</CardTitle>
              <Badge variant="amber" size="sm">
                Action Items
              </Badge>
            </div>
            <CardDescription>
              Prioritized career moves generated for your target transition
            </CardDescription>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {RECOMMENDED_STEPS.map((step) => (
            <div
              key={step.id}
              className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                      step.priority === "High"
                        ? "bg-rose-950/70 text-rose-300 border border-rose-800/60"
                        : "bg-indigo-950/70 text-indigo-300 border border-indigo-800/60"
                    }`}
                  >
                    {step.category} · {step.priority} Priority
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-200">{step.title}</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                  {step.description}
                </p>
              </div>

              <Link href={step.href} className="shrink-0">
                <Button variant="secondary" size="sm" className="w-full sm:w-auto text-xs">
                  {step.actionText}
                  <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
