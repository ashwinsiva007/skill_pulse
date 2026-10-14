"use client";

import { getFirebaseAuth } from "@/lib/firebase/config";
import { firestoreService } from "@/lib/firebase/firestore-service";
import {
  LocalProfileRepository,
  LocalSkillRepository,
  LocalResumeRepository,
  LocalRoadmapRepository,
  LocalOpportunityRepository,
  LocalApplicationRepository,
  LocalActivityRepository,
} from "./local-repos";
import {
  IProfileRepository,
  ISkillRepository,
  IResumeRepository,
  IRoadmapRepository,
  IOpportunityRepository,
  IApplicationRepository,
  IActivityRepository,
} from "./interfaces";
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

// Local fallbacks
const localProfile = new LocalProfileRepository();
const localSkill = new LocalSkillRepository();
const localResume = new LocalResumeRepository();
const localRoadmap = new LocalRoadmapRepository();
const localOpp = new LocalOpportunityRepository();
const localApp = new LocalApplicationRepository();
const localAct = new LocalActivityRepository();

function getCurrentUid(): string | null {
  try {
    const auth = getFirebaseAuth();
    return auth?.currentUser?.uid || null;
  } catch {
    return null;
  }
}

// ==============================================================================
// 1. HYBRID PROFILE REPOSITORY (Firestore Cloud + Local Cache)
// ==============================================================================
export class HybridProfileRepository implements IProfileRepository {
  async getProfile(): Promise<CandidateProfile> {
    const uid = getCurrentUid();
    if (uid) {
      try {
        const cloudProfile = await firestoreService.getUserProfile(uid);
        if (cloudProfile) {
          // Sync to local fallback cache
          await localProfile.updateProfile(cloudProfile);
          return cloudProfile;
        }
      } catch (err) {
        console.warn("[Cloud Profile Fetch Warning, falling back to local]:", err);
      }
    }
    return localProfile.getProfile();
  }

  async updateProfile(profileUpdates: Partial<CandidateProfile>): Promise<CandidateProfile> {
    const uid = getCurrentUid();
    const updatedLocal = await localProfile.updateProfile(profileUpdates);
    if (uid) {
      try {
        await firestoreService.saveUserProfile(uid, updatedLocal);
      } catch (err) {
        console.error("[Firestore updateProfile error]:", err);
      }
    }
    return updatedLocal;
  }

  async addEducation(entry: Omit<EducationEntry, "id">): Promise<EducationEntry> {
    const res = await localProfile.addEducation(entry);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { education: full.education });
    }
    return res;
  }

  async updateEducation(id: string, updates: Partial<EducationEntry>): Promise<EducationEntry> {
    const res = await localProfile.updateEducation(id, updates);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { education: full.education });
    }
    return res;
  }

  async deleteEducation(id: string): Promise<boolean> {
    const res = await localProfile.deleteEducation(id);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { education: full.education });
    }
    return res;
  }

  async addProject(entry: Omit<ProjectEntry, "id">): Promise<ProjectEntry> {
    const res = await localProfile.addProject(entry);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { projects: full.projects });
    }
    return res;
  }

  async updateProject(id: string, updates: Partial<ProjectEntry>): Promise<ProjectEntry> {
    const res = await localProfile.updateProject(id, updates);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { projects: full.projects });
    }
    return res;
  }

  async deleteProject(id: string): Promise<boolean> {
    const res = await localProfile.deleteProject(id);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { projects: full.projects });
    }
    return res;
  }

  async addExperience(entry: Omit<ExperienceEntry, "id">): Promise<ExperienceEntry> {
    const res = await localProfile.addExperience(entry);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { experience: full.experience });
    }
    return res;
  }

  async updateExperience(id: string, updates: Partial<ExperienceEntry>): Promise<ExperienceEntry> {
    const res = await localProfile.updateExperience(id, updates);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { experience: full.experience });
    }
    return res;
  }

  async deleteExperience(id: string): Promise<boolean> {
    const res = await localProfile.deleteExperience(id);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { experience: full.experience });
    }
    return res;
  }

  async addCertification(entry: Omit<CertificationEntry, "id">): Promise<CertificationEntry> {
    const res = await localProfile.addCertification(entry);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { certifications: full.certifications });
    }
    return res;
  }

  async deleteCertification(id: string): Promise<boolean> {
    const res = await localProfile.deleteCertification(id);
    const uid = getCurrentUid();
    if (uid) {
      const full = await localProfile.getProfile();
      await firestoreService.saveUserProfile(uid, { certifications: full.certifications });
    }
    return res;
  }
}

// ==============================================================================
// 2. HYBRID SKILL REPOSITORY
// ==============================================================================
export class HybridSkillRepository implements ISkillRepository {
  async getSkills(): Promise<Skill[]> {
    const uid = getCurrentUid();
    if (uid) {
      try {
        const cloudSkills = await firestoreService.getUserSkills(uid);
        if (cloudSkills && cloudSkills.length > 0) {
          return cloudSkills;
        }
      } catch (err) {
        console.warn("[Cloud Skills Fetch Warning]:", err);
      }
    }
    return localSkill.getSkills();
  }

  async getSkillById(id: string): Promise<Skill | null> {
    const skills = await this.getSkills();
    return skills.find((s) => s.id === id) || null;
  }

  async addSkill(skillInput: Omit<Skill, "id">): Promise<Skill> {
    const saved = await localSkill.addSkill(skillInput);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.saveUserSkill(uid, saved);
      } catch (err) {
        console.error("[Firestore addSkill error]:", err);
      }
    }
    return saved;
  }

  async updateSkill(id: string, updates: Partial<Skill>): Promise<Skill> {
    const updated = await localSkill.updateSkill(id, updates);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.saveUserSkill(uid, updated);
      } catch (err) {
        console.error("[Firestore updateSkill error]:", err);
      }
    }
    return updated;
  }

  async deleteSkill(id: string): Promise<boolean> {
    const res = await localSkill.deleteSkill(id);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.deleteUserSkill(uid, id);
      } catch (err) {
        console.error("[Firestore deleteSkill error]:", err);
      }
    }
    return res;
  }
}

// ==============================================================================
// 3. HYBRID RESUME REPOSITORY
// ==============================================================================
export class HybridResumeRepository implements IResumeRepository {
  async getResumes(): Promise<ResumeDraft[]> {
    const uid = getCurrentUid();
    if (uid) {
      try {
        const cloud = await firestoreService.getUserResumes(uid);
        if (cloud && cloud.length > 0) {
          return cloud;
        }
      } catch (err) {
        console.warn("[Cloud Resumes Fetch Warning]:", err);
      }
    }
    return localResume.getResumes();
  }

  async getResumeById(id: string): Promise<ResumeDraft | null> {
    const resumes = await this.getResumes();
    return resumes.find((r) => r.id === id) || null;
  }

  async saveResume(resume: ResumeDraft): Promise<ResumeDraft> {
    const saved = await localResume.saveResume(resume);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.saveUserResume(uid, saved);
      } catch (err) {
        console.error("[Firestore saveResume error]:", err);
      }
    }
    return saved;
  }

  async deleteResume(id: string): Promise<boolean> {
    const res = await localResume.deleteResume(id);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.deleteUserResume(uid, id);
      } catch (err) {
        console.error("[Firestore deleteResume error]:", err);
      }
    }
    return res;
  }

  async duplicateResume(id: string): Promise<ResumeDraft> {
    const dup = await localResume.duplicateResume(id);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.saveUserResume(uid, dup);
      } catch (err) {
        console.error("[Firestore duplicateResume error]:", err);
      }
    }
    return dup;
  }

  async renameResume(id: string, newTitle: string): Promise<ResumeDraft> {
    const renamed = await localResume.renameResume(id, newTitle);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.saveUserResume(uid, renamed);
      } catch (err) {
        console.error("[Firestore renameResume error]:", err);
      }
    }
    return renamed;
  }

  async setPrimaryResume(id: string): Promise<ResumeDraft> {
    const primary = await localResume.setPrimaryResume(id);
    const uid = getCurrentUid();
    if (uid) {
      try {
        const all = await localResume.getResumes();
        for (const r of all) {
          await firestoreService.saveUserResume(uid, r);
        }
      } catch (err) {
        console.error("[Firestore setPrimaryResume error]:", err);
      }
    }
    return primary;
  }
}

// ==============================================================================
// 4. HYBRID ROADMAP REPOSITORY
// ==============================================================================
export class HybridRoadmapRepository implements IRoadmapRepository {
  async getMilestones(targetRole?: string): Promise<RoadmapMilestone[]> {
    const uid = getCurrentUid();
    if (uid) {
      try {
        const cloud = await firestoreService.getUserRoadmap(uid);
        if (cloud && cloud.length > 0) {
          return cloud;
        }
      } catch (err) {
        console.warn("[Cloud Roadmap Fetch Warning]:", err);
      }
    }
    return localRoadmap.getMilestones(targetRole);
  }

  async saveMilestones(milestones: RoadmapMilestone[]): Promise<RoadmapMilestone[]> {
    const saved = await localRoadmap.saveMilestones(milestones);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.saveUserRoadmap(uid, saved);
      } catch (err) {
        console.error("[Firestore saveMilestones error]:", err);
      }
    }
    return saved;
  }

  async updateMilestone(id: string, updates: Partial<RoadmapMilestone>): Promise<RoadmapMilestone> {
    const updated = await localRoadmap.updateMilestone(id, updates);
    const uid = getCurrentUid();
    if (uid) {
      const all = await localRoadmap.getMilestones();
      await firestoreService.saveUserRoadmap(uid, all);
    }
    return updated;
  }

  async toggleActionItem(milestoneId: string, actionItemId: string): Promise<RoadmapMilestone> {
    const updated = await localRoadmap.toggleActionItem(milestoneId, actionItemId);
    const uid = getCurrentUid();
    if (uid) {
      const all = await localRoadmap.getMilestones();
      await firestoreService.saveUserRoadmap(uid, all);
    }
    return updated;
  }

  async updateMilestoneNotes(milestoneId: string, notes: string): Promise<RoadmapMilestone> {
    const updated = await localRoadmap.updateMilestoneNotes(milestoneId, notes);
    const uid = getCurrentUid();
    if (uid) {
      const all = await localRoadmap.getMilestones();
      await firestoreService.saveUserRoadmap(uid, all);
    }
    return updated;
  }

  async resetToDemoRoadmap(): Promise<RoadmapMilestone[]> {
    const reset = await localRoadmap.resetToDemoRoadmap();
    const uid = getCurrentUid();
    if (uid) {
      await firestoreService.saveUserRoadmap(uid, reset);
    }
    return reset;
  }
}

// ==============================================================================
// 5. HYBRID OPPORTUNITY REPOSITORY
// ==============================================================================
export class HybridOpportunityRepository implements IOpportunityRepository {
  async getOpportunities(): Promise<Opportunity[]> {
    return localOpp.getOpportunities();
  }

  async getSavedOpportunities(): Promise<Opportunity[]> {
    const uid = getCurrentUid();
    if (uid) {
      try {
        const cloudSaved = await firestoreService.getUserSavedOpportunities(uid);
        if (cloudSaved && cloudSaved.length > 0) {
          return cloudSaved;
        }
      } catch (err) {
        console.warn("[Cloud Saved Opps Fetch Warning]:", err);
      }
    }
    return localOpp.getSavedOpportunities();
  }

  async getOpportunityById(id: string): Promise<Opportunity | null> {
    return localOpp.getOpportunityById(id);
  }

  async toggleSaveOpportunity(id: string): Promise<Opportunity> {
    const toggled = await localOpp.toggleSaveOpportunity(id);
    const uid = getCurrentUid();
    if (uid) {
      try {
        if (toggled.status === "saved") {
          await firestoreService.saveUserOpportunity(uid, toggled);
        } else {
          await firestoreService.removeUserOpportunity(uid, id);
        }
      } catch (err) {
        console.error("[Firestore toggleSaveOpportunity error]:", err);
      }
    }
    return toggled;
  }

  async updateOpportunityStatus(id: string, status: Opportunity["status"]): Promise<Opportunity> {
    const updated = await localOpp.updateOpportunityStatus(id, status);
    const uid = getCurrentUid();
    if (uid && updated.status === "saved") {
      await firestoreService.saveUserOpportunity(uid, updated);
    }
    return updated;
  }

  async resetToDemoOpportunities(): Promise<Opportunity[]> {
    return localOpp.resetToDemoOpportunities();
  }
}

// ==============================================================================
// 6. HYBRID APPLICATION REPOSITORY (Kanban)
// ==============================================================================
export class HybridApplicationRepository implements IApplicationRepository {
  async getApplications(): Promise<JobApplication[]> {
    const uid = getCurrentUid();
    if (uid) {
      try {
        const cloud = await firestoreService.getUserApplications(uid);
        if (cloud && cloud.length > 0) {
          return cloud;
        }
      } catch (err) {
        console.warn("[Cloud Applications Fetch Warning]:", err);
      }
    }
    return localApp.getApplications();
  }

  async getApplicationById(id: string): Promise<JobApplication | null> {
    const apps = await this.getApplications();
    return apps.find((a) => a.id === id) || null;
  }

  async addApplication(
    appInput: Omit<JobApplication, "id" | "appliedDate" | "lastUpdated">
  ): Promise<JobApplication> {
    const saved = await localApp.addApplication(appInput);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.saveUserApplication(uid, saved);
      } catch (err) {
        console.error("[Firestore addApplication error]:", err);
      }
    }
    return saved;
  }

  async updateApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication> {
    const updated = await localApp.updateApplication(id, updates);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.saveUserApplication(uid, updated);
      } catch (err) {
        console.error("[Firestore updateApplication error]:", err);
      }
    }
    return updated;
  }

  async updateApplicationStage(id: string, stage: ApplicationStage): Promise<JobApplication> {
    return this.updateApplication(id, { stage });
  }

  async deleteApplication(id: string): Promise<boolean> {
    const res = await localApp.deleteApplication(id);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.deleteUserApplication(uid, id);
      } catch (err) {
        console.error("[Firestore deleteApplication error]:", err);
      }
    }
    return res;
  }

  async resetToDemoApplications(): Promise<JobApplication[]> {
    return localApp.resetToDemoApplications();
  }
}

// ==============================================================================
// 7. HYBRID ACTIVITY REPOSITORY
// ==============================================================================
export class HybridActivityRepository implements IActivityRepository {
  async getRecentActivities(limit: number = 10): Promise<ActivityItem[]> {
    const uid = getCurrentUid();
    if (uid) {
      try {
        const cloud = await firestoreService.getUserActivities(uid, limit);
        if (cloud && cloud.length > 0) {
          return cloud;
        }
      } catch (err) {
        console.warn("[Cloud Activities Fetch Warning]:", err);
      }
    }
    return localAct.getRecentActivities(limit);
  }

  async logActivity(
    activityInput: Omit<ActivityItem, "id" | "timestamp">
  ): Promise<ActivityItem> {
    const saved = await localAct.logActivity(activityInput);
    const uid = getCurrentUid();
    if (uid) {
      try {
        await firestoreService.logUserActivity(uid, saved);
      } catch (err) {
        console.error("[Firestore logActivity error]:", err);
      }
    }
    return saved;
  }
}

// Export Singleton Hybrid Instances
export const profileRepo: IProfileRepository = new HybridProfileRepository();
export const skillRepo: ISkillRepository = new HybridSkillRepository();
export const resumeRepo: IResumeRepository = new HybridResumeRepository();
export const roadmapRepo: IRoadmapRepository = new HybridRoadmapRepository();
export const opportunityRepo: IOpportunityRepository = new HybridOpportunityRepository();
export const applicationRepo: IApplicationRepository = new HybridApplicationRepository();
export const activityRepo: IActivityRepository = new HybridActivityRepository();
