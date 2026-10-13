export type MilestoneStatus = "not_started" | "in_progress" | "completed" | "upcoming";

export type MilestonePriority = "high" | "medium" | "low";

export interface RoadmapActionItem {
  id: string;
  title: string;
  completed: boolean;
  resourceUrl?: string;
  resourceTitle?: string;
}

export interface RoadmapMilestone {
  id: string;
  phaseNumber: number;
  phaseTitle: string;
  title: string;
  description: string;
  priority?: MilestonePriority;
  targetRole: string;
  skillsAddressed: string[];
  estimatedWeeks: number;
  status: MilestoneStatus;
  progressPercentage: number;
  actionItems: RoadmapActionItem[];
  completionCriteria?: string;
  suggestedProject?: string;
  userNotes?: string;
}

export interface CareerRoadmapSummary {
  targetRole: string;
  totalPhases: number;
  completedPhases: number;
  inProgressPhases: number;
  overallProgressPercentage: number;
  estimatedCompletionWeeks: number;
}
