import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { ResumeDraft } from "@/types/resume";
import { RoadmapMilestone } from "@/types/roadmap";
import { Opportunity } from "@/types/opportunity";
import { JobApplication, ApplicationStage } from "@/types/application";
import { ActivityItem } from "@/types/activity";

export interface IProfileRepository {
  getProfile(): Promise<CandidateProfile>;
  updateProfile(profile: Partial<CandidateProfile>): Promise<CandidateProfile>;
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
