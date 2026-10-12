export type MilestoneStatus = "completed" | "in_progress" | "upcoming";

export interface RoadmapMilestone {
  id: string;
  phaseNumber: number;
  phaseTitle: string;
  title: string;
  description: string;
  targetRole: string;
  skillsAddressed: string[];
  estimatedWeeks: number;
  status: MilestoneStatus;
  progressPercentage: number;
  actionItems: {
    id: string;
    title: string;
    completed: boolean;
  }[];
}

export interface CareerRoadmapSummary {
  targetRole: string;
  totalPhases: number;
  completedPhases: number;
  inProgressPhases: number;
  overallProgressPercentage: number;
  estimatedCompletionWeeks: number;
}
