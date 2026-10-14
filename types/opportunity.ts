export type WorkplaceType = "Remote" | "Hybrid" | "On-site";
export type WorkMode = WorkplaceType;

export type OpportunityType =
  | "Job"
  | "Internship"
  | "Hackathon"
  | "Research"
  | "Fellowship"
  | "Career Program";

export type OpportunityStatus = "available" | "saved" | "applied" | "archived";

export type VerificationStatus =
  | "demo_simulated"
  | "community_verified"
  | "official_verified"
  | "unverified";

export type OpportunityRegion =
  | "South India"
  | "North India"
  | "West India"
  | "Pan-India Remote"
  | "All India";

export type OpportunityPortal =
  | "Naukri"
  | "LinkedIn"
  | "Indeed"
  | "Unstop"
  | "Devpost"
  | "Direct Careers";

export type ListingStatus = "open" | "demo_only" | "closed";

export interface Opportunity {
  id: string;
  title: string;
  organization: string; // Organization or organizer
  company: string; // Alias for organization for backwards compatibility
  type: OpportunityType;
  domain: string; // e.g. "Data & Analytics", "AI & Machine Learning", "Software Engineering"
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  eligibilityRequirements: string;
  experienceLevel: string; // e.g. "Entry-Level / Student", "Fresh Graduate", "Junior (0-2 years)"
  location: string;
  workMode: WorkMode;
  workplaceType: WorkplaceType; // Alias for workMode for backwards compatibility
  region?: OpportunityRegion;
  portal?: OpportunityPortal;
  
  // Optional / available fields (never invented if unknown)
  applicationUrl?: string; // Genuine application URL if available
  deadline?: string; // Application deadline when available
  publicationDate?: string; // Publication date when available
  postedDate: string; // Human-friendly display string e.g. "3 days ago"
  sourceName: string; // Source or organizer name e.g. "PathPilot Curated Demo", "Open Source Initiative"
  sourceUrl?: string; // Original source repository or platform URL
  verificationStatus: VerificationStatus;
  lastVerified?: string; // ISO timestamp when available
  listingStatus: ListingStatus;
  status?: OpportunityStatus | string;
  
  // Compensation & metadata
  salaryRange?: string; // Compensation / stipend range when available
  department?: string;
  isDemo: boolean; // Explicit flag identifying illustrative demo listings
  
  // Dynamic matching properties (calculated per user)
  matchScore: number; // 0 - 100%
  matchedSkills: string[];
  missingSkills: string[];
}
