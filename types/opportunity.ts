export type WorkplaceType = "Remote" | "Hybrid" | "On-site";
export type OpportunityStatus = "available" | "saved" | "applied" | "archived";

export interface Opportunity {
  id: string;
  title: string;
  company: string;
  location: string;
  workplaceType: WorkplaceType;
  salaryRange: string;
  matchScore: number; // match percentage e.g. 94%
  matchedSkills: string[];
  missingSkills: string[];
  description: string;
  status: OpportunityStatus;
  postedDate: string;
  department: string;
  experienceLevel: string;
}
