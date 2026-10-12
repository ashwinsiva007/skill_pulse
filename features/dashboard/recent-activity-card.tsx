import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ActivityItem } from "@/types/activity";
import { formatRelativeTime } from "@/lib/utils";
import {
  Clock,
  Cpu,
  FileText,
  Milestone,
  Briefcase,
  Kanban,
  ArrowRight,
} from "lucide-react";

export interface RecentActivityCardProps {
  activities: ActivityItem[];
}

export const RecentActivityCard: React.FC<RecentActivityCardProps> = ({ activities }) => {
  const getIcon = (type: ActivityItem["type"]) => {
    switch (type) {
      case "skill":
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case "resume":
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
      case "roadmap":
        return <Milestone className="w-3.5 h-3.5 text-indigo-400" />;
      case "opportunity":
        return <Briefcase className="w-3.5 h-3.5 text-amber-400" />;
      case "application":
        return <Kanban className="w-3.5 h-3.5 text-violet-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Chronological log of demo candidate progress & updates
            </CardDescription>
          </div>
          <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3.5">
          {activities.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No recent activity logged.</p>
          ) : (
            activities.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-800/40 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {item.title}
                    </p>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                    {item.description}
                  </p>
                </div>

                <Link
                  href={item.routeLink}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-400 hover:text-slate-200 shrink-0"
                  title="View section"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
