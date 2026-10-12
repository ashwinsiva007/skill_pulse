"use client";

import { storageAdapter } from "@/lib/storage/storage-adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { DemoManager } from "@/lib/demo/demo-manager";
import { 
  DEMO_PROFILE, 
  DEMO_SKILLS, 
  DEMO_RESUMES, 
  DEMO_ROADMAP, 
  DEMO_OPPORTUNITIES, 
  DEMO_APPLICATIONS, 
  DEMO_ACTIVITIES 
} from "@/lib/demo/seed-data";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { ResumeDraft } from "@/types/resume";
import { RoadmapMilestone } from "@/types/roadmap";
import { Opportunity } from "@/types/opportunity";
import { JobApplication, ApplicationStage } from "@/types/application";
import { ActivityItem } from "@/types/activity";
import {
  IProfileRepository,
  ISkillRepository,
  IResumeRepository,
  IRoadmapRepository,
  IOpportunityRepository,
  IApplicationRepository,
  IActivityRepository,
} from "./interfaces";

function ensureInitialized() {
  if (typeof window !== "undefined") {
    DemoManager.initializeDemoDataIfEmpty();
  }
}

export class LocalProfileRepository implements IProfileRepository {
  async getProfile(): Promise<CandidateProfile> {
    ensureInitialized();
    return storageAdapter.getItem<CandidateProfile>(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
  }

  async updateProfile(updates: Partial<CandidateProfile>): Promise<CandidateProfile> {
    ensureInitialized();
    const current = await this.getProfile();
    const updated: CandidateProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    storageAdapter.setItem(STORAGE_KEYS.PROFILE, updated);
    return updated;
  }
}

export class LocalSkillRepository implements ISkillRepository {
  async getSkills(): Promise<Skill[]> {
    ensureInitialized();
    return storageAdapter.getItem<Skill[]>(STORAGE_KEYS.SKILLS, DEMO_SKILLS);
  }

  async getSkillById(id: string): Promise<Skill | null> {
    const list = await this.getSkills();
    return list.find((s) => s.id === id) || null;
  }

  async addSkill(skillInput: Omit<Skill, "id">): Promise<Skill> {
    const list = await this.getSkills();
    const newSkill: Skill = {
      ...skillInput,
      id: `skill-${Date.now()}`,
    };
    const updated = [newSkill, ...list];
    storageAdapter.setItem(STORAGE_KEYS.SKILLS, updated);
    return newSkill;
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    const list = await this.getSkills();
    let updatedSkill: Skill | null = null;
    const updatedList = list.map((s) => {
      if (s.id === id) {
        updatedSkill = { ...s, ...updates };
        return updatedSkill;
      }
      return s;
    });
    if (!updatedSkill) throw new Error(`Skill with ID ${id} not found.`);
    storageAdapter.setItem(STORAGE_KEYS.SKILLS, updatedList);
    return updatedSkill;
  }

  async deleteSkill(id: string): Promise<boolean> {
    const list = await this.getSkills();
    const filtered = list.filter((s) => s.id !== id);
    storageAdapter.setItem(STORAGE_KEYS.SKILLS, filtered);
    return true;
  }
}

export class LocalResumeRepository implements IResumeRepository {
  async getResumes(): Promise<ResumeDraft[]> {
    ensureInitialized();
    return storageAdapter.getItem<ResumeDraft[]>(STORAGE_KEYS.RESUMES, DEMO_RESUMES);
  }

  async getResumeById(id: string): Promise<ResumeDraft | null> {
    const list = await this.getResumes();
    return list.find((r) => r.id === id) || null;
  }

  async saveResume(resume: ResumeDraft): Promise<ResumeDraft> {
    const list = await this.getResumes();
    const index = list.findIndex((r) => r.id === resume.id);
    let updated: ResumeDraft[];
    if (index >= 0) {
      updated = [...list];
      updated[index] = { ...resume, lastModified: new Date().toISOString() };
    } else {
      updated = [{ ...resume, lastModified: new Date().toISOString() }, ...list];
    }
    storageAdapter.setItem(STORAGE_KEYS.RESUMES, updated);
    return resume;
  }

  async deleteResume(id: string): Promise<boolean> {
    const list = await this.getResumes();
    const filtered = list.filter((r) => r.id !== id);
    storageAdapter.setItem(STORAGE_KEYS.RESUMES, filtered);
    return true;
  }
}

export class LocalRoadmapRepository implements IRoadmapRepository {
  async getMilestones(): Promise<RoadmapMilestone[]> {
    ensureInitialized();
    return storageAdapter.getItem<RoadmapMilestone[]>(STORAGE_KEYS.ROADMAP, DEMO_ROADMAP);
  }

  async updateMilestone(id: string, updates: Partial<RoadmapMilestone>): Promise<RoadmapMilestone> {
    const list = await this.getMilestones();
    let updatedItem: RoadmapMilestone | null = null;
    const updatedList = list.map((m) => {
      if (m.id === id) {
        updatedItem = { ...m, ...updates };
        return updatedItem;
      }
      return m;
    });
    if (!updatedItem) throw new Error(`Milestone ${id} not found`);
    storageAdapter.setItem(STORAGE_KEYS.ROADMAP, updatedList);
    return updatedItem;
  }

  async toggleActionItem(milestoneId: string, actionItemId: string): Promise<RoadmapMilestone> {
    const list = await this.getMilestones();
    let resultMilestone: RoadmapMilestone | null = null;

    const updatedList = list.map((m) => {
      if (m.id !== milestoneId) return m;

      const updatedActions = m.actionItems.map((act) =>
        act.id === actionItemId ? { ...act, completed: !act.completed } : act
      );

      const completedCount = updatedActions.filter((a) => a.completed).length;
      const progressPercentage = Math.round((completedCount / updatedActions.length) * 100);
      const status: RoadmapMilestone["status"] =
        progressPercentage === 100
          ? "completed"
          : progressPercentage > 0
          ? "in_progress"
          : "upcoming";

      resultMilestone = {
        ...m,
        actionItems: updatedActions,
        progressPercentage,
        status,
      };
      return resultMilestone;
    });

    if (!resultMilestone) throw new Error(`Milestone ${milestoneId} not found`);
    storageAdapter.setItem(STORAGE_KEYS.ROADMAP, updatedList);
    return resultMilestone;
  }
}

export class LocalOpportunityRepository implements IOpportunityRepository {
  async getOpportunities(): Promise<Opportunity[]> {
    ensureInitialized();
    return storageAdapter.getItem<Opportunity[]>(STORAGE_KEYS.OPPORTUNITIES, DEMO_OPPORTUNITIES);
  }

  async getSavedOpportunities(): Promise<Opportunity[]> {
    const list = await this.getOpportunities();
    return list.filter((o) => o.status === "saved");
  }

  async toggleSaveOpportunity(id: string): Promise<Opportunity> {
    const list = await this.getOpportunities();
    let updatedOpp: Opportunity | null = null;
    const updated = list.map((o) => {
      if (o.id === id) {
        const newStatus = o.status === "saved" ? "available" : "saved";
        updatedOpp = { ...o, status: newStatus };
        return updatedOpp;
      }
      return o;
    });
    if (!updatedOpp) throw new Error(`Opportunity ${id} not found`);
    storageAdapter.setItem(STORAGE_KEYS.OPPORTUNITIES, updated);
    return updatedOpp;
  }

  async updateOpportunityStatus(id: string, status: Opportunity["status"]): Promise<Opportunity> {
    const list = await this.getOpportunities();
    let updatedOpp: Opportunity | null = null;
    const updated = list.map((o) => {
      if (o.id === id) {
        updatedOpp = { ...o, status };
        return updatedOpp;
      }
      return o;
    });
    if (!updatedOpp) throw new Error(`Opportunity ${id} not found`);
    storageAdapter.setItem(STORAGE_KEYS.OPPORTUNITIES, updated);
    return updatedOpp;
  }
}

export class LocalApplicationRepository implements IApplicationRepository {
  async getApplications(): Promise<JobApplication[]> {
    ensureInitialized();
    return storageAdapter.getItem<JobApplication[]>(STORAGE_KEYS.APPLICATIONS, DEMO_APPLICATIONS);
  }

  async addApplication(
    appInput: Omit<JobApplication, "id" | "appliedDate" | "lastUpdated">
  ): Promise<JobApplication> {
    const list = await this.getApplications();
    const now = new Date().toISOString();
    const newApp: JobApplication = {
      ...appInput,
      id: `app-${Date.now()}`,
      appliedDate: now,
      lastUpdated: now,
    };
    const updated = [newApp, ...list];
    storageAdapter.setItem(STORAGE_KEYS.APPLICATIONS, updated);
    return newApp;
  }

  async updateApplicationStage(id: string, stage: ApplicationStage): Promise<JobApplication> {
    const list = await this.getApplications();
    let updatedApp: JobApplication | null = null;
    const updated = list.map((a) => {
      if (a.id === id) {
        updatedApp = { ...a, stage, lastUpdated: new Date().toISOString() };
        return updatedApp;
      }
      return a;
    });
    if (!updatedApp) throw new Error(`Application ${id} not found`);
    storageAdapter.setItem(STORAGE_KEYS.APPLICATIONS, updated);
    return updatedApp;
  }

  async deleteApplication(id: string): Promise<boolean> {
    const list = await this.getApplications();
    const filtered = list.filter((a) => a.id !== id);
    storageAdapter.setItem(STORAGE_KEYS.APPLICATIONS, filtered);
    return true;
  }
}

export class LocalActivityRepository implements IActivityRepository {
  async getRecentActivities(limit: number = 10): Promise<ActivityItem[]> {
    ensureInitialized();
    const list = storageAdapter.getItem<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, DEMO_ACTIVITIES);
    return list.slice(0, limit);
  }

  async logActivity(
    activityInput: Omit<ActivityItem, "id" | "timestamp">
  ): Promise<ActivityItem> {
    const list = storageAdapter.getItem<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, DEMO_ACTIVITIES);
    const newActivity: ActivityItem = {
      ...activityInput,
      id: `act-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newActivity, ...list].slice(0, 30); // Keep latest 30
    storageAdapter.setItem(STORAGE_KEYS.ACTIVITIES, updated);
    return newActivity;
  }
}

// Export singleton instances
export const profileRepo = new LocalProfileRepository();
export const skillRepo = new LocalSkillRepository();
export const resumeRepo = new LocalResumeRepository();
export const roadmapRepo = new LocalRoadmapRepository();
export const opportunityRepo = new LocalOpportunityRepository();
export const applicationRepo = new LocalApplicationRepository();
export const activityRepo = new LocalActivityRepository();
