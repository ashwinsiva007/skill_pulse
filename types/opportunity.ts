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
  | "Direct Careers"
  | "Greenhouse"
  | "Lever"
  | "Adzuna";

export type ListingStatus = "open" | "demo_only" | "closed" | "expired" | "stale" | "needs_verification";

export type SourceMode = "LIVE" | "CURATED_CATALOG" | "EXTERNAL_SEARCH";

export type FreshnessLabel =
  | "RECENTLY_POSTED"
  | "SOURCE_CONFIRMED"
  | "STALE"
  | "STATUS_UNCONFIRMED";

export type ProviderId =
  | "greenhouse"
  | "lever"
  | "adzuna"
  | "curated_catalog"
  | "external_search";

export interface Opportunity {
  id: string;
  providerId?: ProviderId | string;
  providerJobId?: string;
  sourceMode?: SourceMode;
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
  city?: string;
  state?: string;
  workMode: WorkMode;
  workplaceType: WorkplaceType; // Alias for workMode for backwards compatibility
  region?: OpportunityRegion;
  portal?: OpportunityPortal;
  
  // Optional / provenance fields
  applicationUrl?: string; // Genuine application URL if available
  deadline?: string; // Application deadline when available
  publicationDate?: string; // Publication date when available
  postedDate: string; // Human-friendly display string e.g. "3 days ago"
  sourceName: string; // Source or organizer name e.g. "Greenhouse Official", "Lever Official"
  sourceUrl?: string; // Original source repository or platform URL
  verificationStatus: VerificationStatus;
  lastVerified?: string; // ISO timestamp when available
  listingStatus: ListingStatus;
  freshnessLabel?: FreshnessLabel;
  status?: OpportunityStatus | string;
  
  // Audit and lifecycle timestamps
  firstSeen?: string;
  lastSeen?: string;
  lastSourceUpdate?: string;
  lastFetchedAt?: string;
  providerAttribution?: string;

  // Compensation & metadata
  salaryRange?: string; // Compensation / stipend range when reliably available
  department?: string;
  isDemo: boolean; // Explicit flag identifying illustrative demo listings
  
  // Dynamic matching properties (calculated per user)
  matchScore: number; // 0 - 100%
  matchedSkills: string[];
  missingSkills: string[];
}

export type ProviderStatusType =
  | "CONFIGURED"
  | "NOT_CONFIGURED"
  | "RATE_LIMITED"
  | "ERROR"
  | "ACTIVE";

export interface ProviderHealthStatus {
  providerId: ProviderId | string;
  providerName: string;
  status: ProviderStatusType;
  supportsIndia: boolean;
  isConfigured: boolean;
  lastAttemptedSync?: string;
  lastSuccessfulSync?: string;
  resultsCount: number;
  errorDetails?: string;
  rateLimitInfo?: string;
  attributionRequirement?: string;
  configuredBoardsCount?: number;
}

export interface ExternalSearchShortcut {
  id: string;
  platformName: "LinkedIn Jobs" | "Indeed India" | "Naukri.com" | "Unstop";
  queryTitle: string;
  location: string;
  searchUrl: string;
  badgeLabel: string;
  description: string;
}

export interface OpportunityScoreBreakdown {
  roleRelevance: number; // Max 25
  requiredSkills: number; // Max 30
  preferredSkills: number; // Max 15
  experienceEducation: number; // Max 15
  locationWorkMode: number; // Max 10
  recency: number; // Max 5
  totalScore: number; // 0 - 100

  // Backward compatibility aliases
  roleAndDomainPoints?: number;
  requiredSkillsPoints?: number;
  preferredSkillsPoints?: number;
  workModePoints?: number;
  experienceLevelPoints?: number;
}

export interface CareerGuidanceAdvice {
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  whyThisMatches: string[];
  suggestedResumeKeywords: string[];
  projectsToEmphasize: string[];
  skillsToLearnNext: string[];
  scoreBreakdown: OpportunityScoreBreakdown;
  disclaimer: string;
}
