export type WorkplacePreference = "Remote" | "Hybrid" | "On-site" | "Flexible";
export type OpportunityType = "Internships" | "Full-time Jobs" | "Research" | "Hackathons";

export interface CareerPreferences {
  targetJobRoles: string[];
  preferredDomains: string[]; // e.g. Enterprise AI, Fintech, Developer Tools
  preferredLocations: string[];
  workplacePreference: WorkplacePreference;
  opportunityTypes: OpportunityType[];
  technologiesOfInterest: string[];
  availability: string; // e.g. "Immediate", "Summer 2026", "2 weeks notice"
}
