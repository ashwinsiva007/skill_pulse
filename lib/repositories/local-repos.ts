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
import { EducationEntry } from "@/types/education";
import { ProjectEntry } from "@/types/project";
import { ExperienceEntry, CertificationEntry } from "@/types/experience";
import { ResumeDraft } from "@/types/resume";
import { RoadmapMilestone } from "@/types/roadmap";
import { Opportunity } from "@/types/opportunity";
import { JobApplication, ApplicationStage } from "@/types/application";
import { ActivityItem } from "@/types/activity";
import { calculateProfileCompletion } from "@/lib/profile-completion";
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
    const stored = storageAdapter.getItem<Partial<CandidateProfile>>(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
    
    // Defensive merge to guarantee all Stage 2 fields exist even if user had older Stage 1 stored session
    const fullProfile: CandidateProfile = {
      ...DEMO_PROFILE,
      ...stored,
      education: Array.isArray(stored.education) ? stored.education : DEMO_PROFILE.education,
      projects: Array.isArray(stored.projects) ? stored.projects : DEMO_PROFILE.projects,
      experience: Array.isArray(stored.experience) ? stored.experience : DEMO_PROFILE.experience,
      certifications: Array.isArray(stored.certifications) ? stored.certifications : DEMO_PROFILE.certifications,
      courses: Array.isArray(stored.courses) ? stored.courses : DEMO_PROFILE.courses,
      hackathons: Array.isArray(stored.hackathons) ? stored.hackathons : DEMO_PROFILE.hackathons,
      awards: Array.isArray(stored.awards) ? stored.awards : DEMO_PROFILE.awards,
      leadership: Array.isArray(stored.leadership) ? stored.leadership : DEMO_PROFILE.leadership,
      preferences: stored.preferences || DEMO_PROFILE.preferences,
      links: Array.isArray(stored.links) ? stored.links : DEMO_PROFILE.links,
    };

    // Calculate actual score with skills
    const skills = storageAdapter.getItem<Skill[]>(STORAGE_KEYS.SKILLS, DEMO_SKILLS);
    fullProfile.profileCompletionPercentage = calculateProfileCompletion(fullProfile, skills).percentage;

    return fullProfile;
  }

  async updateProfile(updates: Partial<CandidateProfile>): Promise<CandidateProfile> {
    ensureInitialized();
    const current = await this.getProfile();
    const skills = storageAdapter.getItem<Skill[]>(STORAGE_KEYS.SKILLS, DEMO_SKILLS);

    const merged: CandidateProfile = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate completion criteria accurately
    merged.profileCompletionPercentage = calculateProfileCompletion(merged, skills).percentage;

    storageAdapter.setItem(STORAGE_KEYS.PROFILE, merged);
    return merged;
  }

  async addEducation(entryInput: Omit<EducationEntry, "id">): Promise<EducationEntry> {
    const current = await this.getProfile();
    const newEntry: EducationEntry = {
      ...entryInput,
      id: `edu-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    const updatedList = [newEntry, ...(current.education || [])];
    await this.updateProfile({ education: updatedList });
    return newEntry;
  }

  async updateEducation(id: string, updates: Partial<EducationEntry>): Promise<EducationEntry> {
    const current = await this.getProfile();
    let updatedEntry: EducationEntry | null = null;
    const list = (current.education || []).map((e) => {
      if (e.id === id) {
        updatedEntry = { ...e, ...updates };
        return updatedEntry;
      }
      return e;
    });
    if (!updatedEntry) throw new Error(`Education entry ${id} not found.`);
    await this.updateProfile({ education: list });
    return updatedEntry;
  }

  async deleteEducation(id: string): Promise<boolean> {
    const current = await this.getProfile();
    const list = (current.education || []).filter((e) => e.id !== id);
    await this.updateProfile({ education: list });
    return true;
  }

  async addProject(entryInput: Omit<ProjectEntry, "id">): Promise<ProjectEntry> {
    const current = await this.getProfile();
    const newEntry: ProjectEntry = {
      ...entryInput,
      id: `proj-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    const updatedList = [newEntry, ...(current.projects || [])];
    await this.updateProfile({ projects: updatedList });
    return newEntry;
  }

  async updateProject(id: string, updates: Partial<ProjectEntry>): Promise<ProjectEntry> {
    const current = await this.getProfile();
    let updatedEntry: ProjectEntry | null = null;
    const list = (current.projects || []).map((p) => {
      if (p.id === id) {
        updatedEntry = { ...p, ...updates };
        return updatedEntry;
      }
      return p;
    });
    if (!updatedEntry) throw new Error(`Project entry ${id} not found.`);
    await this.updateProfile({ projects: list });
    return updatedEntry;
  }

  async deleteProject(id: string): Promise<boolean> {
    const current = await this.getProfile();
    const list = (current.projects || []).filter((p) => p.id !== id);
    await this.updateProfile({ projects: list });
    return true;
  }

  async addExperience(entryInput: Omit<ExperienceEntry, "id">): Promise<ExperienceEntry> {
    const current = await this.getProfile();
    const newEntry: ExperienceEntry = {
      ...entryInput,
      id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    const updatedList = [newEntry, ...(current.experience || [])];
    await this.updateProfile({ experience: updatedList });
    return newEntry;
  }

  async updateExperience(id: string, updates: Partial<ExperienceEntry>): Promise<ExperienceEntry> {
    const current = await this.getProfile();
    let updatedEntry: ExperienceEntry | null = null;
    const list = (current.experience || []).map((e) => {
      if (e.id === id) {
        updatedEntry = { ...e, ...updates };
        return updatedEntry;
      }
      return e;
    });
    if (!updatedEntry) throw new Error(`Experience entry ${id} not found.`);
    await this.updateProfile({ experience: list });
    return updatedEntry;
  }

  async deleteExperience(id: string): Promise<boolean> {
    const current = await this.getProfile();
    const list = (current.experience || []).filter((e) => e.id !== id);
    await this.updateProfile({ experience: list });
    return true;
  }

  async addCertification(entryInput: Omit<CertificationEntry, "id">): Promise<CertificationEntry> {
    const current = await this.getProfile();
    const newEntry: CertificationEntry = {
      ...entryInput,
      id: `cert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    };
    const updatedList = [newEntry, ...(current.certifications || [])];
    await this.updateProfile({ certifications: updatedList });
    return newEntry;
  }

  async deleteCertification(id: string): Promise<boolean> {
    const current = await this.getProfile();
    const list = (current.certifications || []).filter((c) => c.id !== id);
    await this.updateProfile({ certifications: list });
    return true;
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
      id: `skill-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    };
    const updated = [newSkill, ...list];
    storageAdapter.setItem(STORAGE_KEYS.SKILLS, updated);

    // Sync profile completion
    const currentProfile = storageAdapter.getItem<CandidateProfile>(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
    if (currentProfile) {
      currentProfile.profileCompletionPercentage = calculateProfileCompletion(currentProfile, updated).percentage;
      storageAdapter.setItem(STORAGE_KEYS.PROFILE, currentProfile);
    }

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

    // Sync profile completion
    const currentProfile = storageAdapter.getItem<CandidateProfile>(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
    if (currentProfile) {
      currentProfile.profileCompletionPercentage = calculateProfileCompletion(currentProfile, updatedList).percentage;
      storageAdapter.setItem(STORAGE_KEYS.PROFILE, currentProfile);
    }

    return updatedSkill;
  }

  async deleteSkill(id: string): Promise<boolean> {
    const list = await this.getSkills();
    const filtered = list.filter((s) => s.id !== id);
    storageAdapter.setItem(STORAGE_KEYS.SKILLS, filtered);

    // Sync profile completion
    const currentProfile = storageAdapter.getItem<CandidateProfile>(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
    if (currentProfile) {
      currentProfile.profileCompletionPercentage = calculateProfileCompletion(currentProfile, filtered).percentage;
      storageAdapter.setItem(STORAGE_KEYS.PROFILE, currentProfile);
    }

    return true;
  }
}

export class LocalResumeRepository implements IResumeRepository {
  async getResumes(): Promise<ResumeDraft[]> {
    ensureInitialized();
    const list = storageAdapter.getItem<ResumeDraft[]>(STORAGE_KEYS.RESUMES, DEMO_RESUMES);
    
    // Defensive check: ensure every draft has content and valid template
    return list.map((item, idx) => {
      if (!item.content) {
        const fallbackSeed = DEMO_RESUMES[idx] || DEMO_RESUMES[0];
        return {
          ...item,
          template: item.template || fallbackSeed.template || "classic",
          createdAt: item.createdAt || item.lastModified || new Date().toISOString(),
          content: fallbackSeed.content,
        };
      }
      return item;
    });
  }

  async getResumeById(id: string): Promise<ResumeDraft | null> {
    const list = await this.getResumes();
    return list.find((r) => r.id === id) || null;
  }

  async saveResume(resume: ResumeDraft): Promise<ResumeDraft> {
    const list = await this.getResumes();
    const index = list.findIndex((r) => r.id === resume.id);
    let updated: ResumeDraft[];
    const now = new Date().toISOString();
    const savedDraft: ResumeDraft = {
      ...resume,
      lastModified: now,
      createdAt: resume.createdAt || now,
    };

    if (index >= 0) {
      updated = [...list];
      updated[index] = savedDraft;
    } else {
      updated = [savedDraft, ...list];
    }
    storageAdapter.setItem(STORAGE_KEYS.RESUMES, updated);
    return savedDraft;
  }

  async deleteResume(id: string): Promise<boolean> {
    const list = await this.getResumes();
    const filtered = list.filter((r) => r.id !== id);
    storageAdapter.setItem(STORAGE_KEYS.RESUMES, filtered);
    return true;
  }

  async duplicateResume(id: string): Promise<ResumeDraft> {
    const list = await this.getResumes();
    const existing = list.find((r) => r.id === id);
    if (!existing) throw new Error(`Resume draft with ID ${id} not found.`);

    const now = new Date().toISOString();
    const cloned: ResumeDraft = {
      ...existing,
      id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: `${existing.title} (Copy)`,
      createdAt: now,
      lastModified: now,
      isPrimary: false,
      content: JSON.parse(JSON.stringify(existing.content)),
    };

    const updated = [cloned, ...list];
    storageAdapter.setItem(STORAGE_KEYS.RESUMES, updated);
    return cloned;
  }

  async renameResume(id: string, newTitle: string): Promise<ResumeDraft> {
    const list = await this.getResumes();
    const existing = list.find((r) => r.id === id);
    if (!existing) throw new Error(`Resume draft with ID ${id} not found.`);

    const updatedDraft: ResumeDraft = {
      ...existing,
      title: newTitle.trim(),
      lastModified: new Date().toISOString(),
    };

    const updatedList = list.map((r) => (r.id === id ? updatedDraft : r));
    storageAdapter.setItem(STORAGE_KEYS.RESUMES, updatedList);
    return updatedDraft;
  }

  async setPrimaryResume(id: string): Promise<ResumeDraft> {
    const list = await this.getResumes();
    let targetDraft: ResumeDraft | null = null;

    const updatedList = list.map((r) => {
      if (r.id === id) {
        targetDraft = { ...r, isPrimary: true, lastModified: new Date().toISOString() };
        return targetDraft;
      }
      return { ...r, isPrimary: false };
    });

    if (!targetDraft) throw new Error(`Resume draft with ID ${id} not found.`);
    storageAdapter.setItem(STORAGE_KEYS.RESUMES, updatedList);
    return targetDraft;
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
