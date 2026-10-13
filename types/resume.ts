export type ResumeStatus = "draft" | "tailored" | "optimized" | "ready";

export type ResumeTemplate = "classic" | "modern" | "technical";

export type ResumeSectionId =
  | "contact"
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "achievements"
  | "coursework";

export interface ResumeContact {
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface ResumeEducationEntry {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate?: string;
  endDate?: string; // e.g. "2022 - 2026" or "Expected May 2026"
  gpa?: string;
  location?: string;
  highlights?: string[]; // Academic honors, clubs, relevant courses
}

export interface ResumeSkills {
  technical: string[];
  soft: string[];
  tools: string[];
}

export interface ResumeProjectEntry {
  id: string;
  title: string;
  role?: string;
  problem?: string; // Problem addressed
  technologies: string[];
  outcomes?: string; // Measured impact or outcomes
  bullets: string[]; // Action + Problem + Tech + Impact bullet points
  link?: string;
  date?: string;
}

export interface ResumeExperienceEntry {
  id: string;
  company: string;
  role: string;
  type?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  bullets: string[];
}

export interface ResumeCertificationEntry {
  id: string;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string;
}

export interface ResumeAchievementEntry {
  id: string;
  title: string;
  organization?: string;
  date?: string;
  description?: string;
}

export interface ResumeCourseworkEntry {
  id: string;
  title: string;
  platform?: string;
  date?: string;
}

export interface ResumeSectionConfig {
  order: ResumeSectionId[];
  visible: Record<ResumeSectionId, boolean>;
}

export interface ResumeContent {
  contact: ResumeContact;
  summary: string;
  skills: ResumeSkills;
  experience: ResumeExperienceEntry[];
  projects: ResumeProjectEntry[];
  education: ResumeEducationEntry[];
  certifications: ResumeCertificationEntry[];
  achievements: ResumeAchievementEntry[];
  coursework: ResumeCourseworkEntry[];
  sectionConfig: ResumeSectionConfig;
}

export interface ResumeDraft {
  id: string;
  title: string;
  targetRole: string;
  targetCompany?: string;
  jobDescription?: string;
  template: ResumeTemplate;
  completionPercentage: number;
  atsScore: number; // illustrative ATS score (0 - 100)
  status: ResumeStatus;
  summary: string;
  sectionsCount: number;
  skillsIncluded: string[];
  createdAt: string;
  lastModified: string;
  isPrimary: boolean;
  content: ResumeContent;
}

export interface AtsKeywordMatch {
  keyword: string;
  category: "technical" | "soft" | "domain" | "tool";
  presentInResume: boolean;
  frequencyInJobDesc: number;
}

export interface JobDescriptionAnalysis {
  matchScore: number; // 0 - 100
  matchedKeywords: string[];
  missingKeywords: string[];
  keywordBreakdown: AtsKeywordMatch[];
  suggestions: string[];
  disclaimer: string;
}
