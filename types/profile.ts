import { EducationEntry } from "./education";
import { ProjectEntry } from "./project";
import { 
  ExperienceEntry, 
  CertificationEntry, 
  CourseEntry, 
  HackathonEntry, 
  AwardEntry, 
  LeadershipEntry 
} from "./experience";
import { CareerPreferences } from "./preferences";

export type CareerLevel = 
  | "Student"
  | "Fresh Graduate"
  | "Entry Level"
  | "Junior" 
  | "Mid-Level" 
  | "Senior" 
  | "Lead" 
  | "Staff / Principal";

export interface ProfileLink {
  id: string;
  label: string;
  url: string;
  type: "github" | "linkedin" | "portfolio" | "other";
}

export interface CandidateProfile {
  id: string;
  name: string;
  headline: string;
  email: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  location: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  bio: string;
  currentRole: string;
  targetRole: string;
  careerLevel: CareerLevel;
  yearsOfExperience: number;
  avatarUrl?: string;
  profileCompletionPercentage: number;
  careerReadinessScore: number; // illustrative readiness score (0 - 100)
  targetIndustry: string;
  availability: string;
  links: ProfileLink[];
  
  // Comprehensive sections for students, fresh graduates, and career builders
  education: EducationEntry[];
  projects: ProjectEntry[];
  experience: ExperienceEntry[];
  certifications: CertificationEntry[];
  courses: CourseEntry[];
  hackathons: HackathonEntry[];
  awards: AwardEntry[];
  leadership: LeadershipEntry[];
  preferences: CareerPreferences;

  updatedAt: string;
}
