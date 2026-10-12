export type ActivityType = 
  | "skill"
  | "resume"
  | "roadmap"
  | "opportunity"
  | "application"
  | "system";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
  routeLink: string;
  tag?: string;
}
