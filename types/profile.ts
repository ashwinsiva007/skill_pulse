export type CareerLevel = "Junior" | "Mid-Level" | "Senior" | "Lead" | "Staff / Principal";

export interface ProfileLink {
  id: string;
  label: string;
  url: string;
  type: "github" | "linkedin" | "portfolio" | "other";
}

export interface CandidateProfile {
  id: string;
  name: string;
  email: string;
  headline: string;
  currentRole: string;
  targetRole: string;
  careerLevel: CareerLevel;
  yearsOfExperience: number;
  location: string;
  bio: string;
  avatarUrl?: string;
  profileCompletionPercentage: number;
  careerReadinessScore: number; // illustrative readiness score (0 - 100)
  targetIndustry: string;
  availability: string;
  links: ProfileLink[];
  updatedAt: string;
}
