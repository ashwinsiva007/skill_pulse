export type ResumeStatus = "draft" | "tailored" | "optimized" | "ready";

export interface ResumeDraft {
  id: string;
  title: string;
  targetRole: string;
  targetCompany?: string;
  completionPercentage: number;
  atsScore: number; // illustrative ATS score (0 - 100)
  status: ResumeStatus;
  summary: string;
  sectionsCount: number;
  skillsIncluded: string[];
  lastModified: string;
  isPrimary: boolean;
}
