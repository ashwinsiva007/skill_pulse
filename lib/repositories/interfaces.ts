import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { EducationEntry } from "@/types/education";
import { ProjectEntry } from "@/types/project";
import { ExperienceEntry, CertificationEntry } from "@/types/experience";
import { ResumeDraft } from "@/types/resume";
import { RoadmapMilestone } from "@/types/roadmap";
import { Opportunity } from "@/types/opportunity";
import { JobApplication, ApplicationStage } from "@/types/application";
import { ActivityItem } from "@/types/activity";

export interface IProfileRepository {
  getProfile(): Promise<CandidateProfile>;
  updateProfile(profile: Partial<CandidateProfile>): Promise<CandidateProfile>;
  addEducation(entry: Omit<EducationEntry, "id">): Promise<EducationEntry>;
  updateEducation(id: string, updates: Partial<EducationEntry>): Promise<EducationEntry>;
  deleteEducation(id: string): Promise<boolean>;
  addProject(entry: Omit<ProjectEntry, "id">): Promise<ProjectEntry>;
  updateProject(id: string, updates: Partial<ProjectEntry>): Promise<ProjectEntry>;
  deleteProject(id: string): Promise<boolean>;
  addExperience(entry: Omit<ExperienceEntry, "id">): Promise<ExperienceEntry>;
  updateExperience(id: string, updates: Partial<ExperienceEntry>): Promise<ExperienceEntry>;
  deleteExperience(id: string): Promise<boolean>;
  addCertification(entry: Omit<CertificationEntry, "id">): Promise<CertificationEntry>;
  deleteCertification(id: string): Promise<boolean>;
}

export interface ISkillRepository {
  getSkills(): Promise<Skill[]>;
  getSkillById(id: string): Promise<Skill | null>;
  addSkill(skill: Omit<Skill, "id">): Promise<Skill>;
  updateSkill(id: string, updates: Partial<Skill>): Promise<Skill>;
  deleteSkill(id: string): Promise<boolean>;
}

export interface IResumeRepository {
  getResumes(): Promise<ResumeDraft[]>;
  getResumeById(id: string): Promise<ResumeDraft | null>;
  saveResume(resume: ResumeDraft): Promise<ResumeDraft>;
  deleteResume(id: string): Promise<boolean>;
  duplicateResume(id: string): Promise<ResumeDraft>;
  renameResume(id: string, newTitle: string): Promise<ResumeDraft>;
  setPrimaryResume(id: string): Promise<ResumeDraft>;
}

export interface IRoadmapRepository {
  getMilestones(): Promise<RoadmapMilestone[]>;
  updateMilestone(id: string, updates: Partial<RoadmapMilestone>): Promise<RoadmapMilestone>;
  toggleActionItem(milestoneId: string, actionItemId: string): Promise<RoadmapMilestone>;
}

export interface IOpportunityRepository {
  getOpportunities(): Promise<Opportunity[]>;
  getSavedOpportunities(): Promise<Opportunity[]>;
  toggleSaveOpportunity(id: string): Promise<Opportunity>;
  updateOpportunityStatus(id: string, status: Opportunity["status"]): Promise<Opportunity>;
}

export interface IApplicationRepository {
  getApplications(): Promise<JobApplication[]>;
  addApplication(application: Omit<JobApplication, "id" | "appliedDate" | "lastUpdated">): Promise<JobApplication>;
  updateApplicationStage(id: string, stage: ApplicationStage): Promise<JobApplication>;
  deleteApplication(id: string): Promise<boolean>;
}

export interface IActivityRepository {
  getRecentActivities(limit?: number): Promise<ActivityItem[]>;
  logActivity(activity: Omit<ActivityItem, "id" | "timestamp">): Promise<ActivityItem>;
}
