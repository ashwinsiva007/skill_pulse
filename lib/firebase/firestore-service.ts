"use client";

import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit as firestoreLimit,
} from "firebase/firestore";
import { getFirebaseDb } from "./config";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { ResumeDraft } from "@/types/resume";
import { RoadmapMilestone } from "@/types/roadmap";
import { Opportunity } from "@/types/opportunity";
import { JobApplication } from "@/types/application";
import { ActivityItem } from "@/types/activity";

/**
 * Clean data for Firestore by removing undefined values (Firestore rejects undefined)
 */
function sanitizeForFirestore<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export const firestoreService = {
  // ==========================================
  // 0. ADMIN USER TELEMETRY (Master Admin)
  // ==========================================
  async getAllUsers(): Promise<{ uid: string; email: string; updatedAt?: string; profile?: CandidateProfile }[]> {
    const db = getFirebaseDb();
    if (!db) return [];

    try {
      const usersCol = collection(db, "users");
      const snap = await getDocs(usersCol);
      const list: { uid: string; email: string; updatedAt?: string; profile?: CandidateProfile }[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          uid: d.id,
          email: data.email || (data.profile as CandidateProfile)?.email || "",
          updatedAt: data.updatedAt,
          profile: data.profile as CandidateProfile,
        });
      });
      return list;
    } catch (err) {
      console.warn("[Firestore getAllUsers error]:", err);
      return [];
    }
  },

  // ==========================================
  // 1. CANDIDATE PROFILE
  // ==========================================
  async getUserProfile(uid: string): Promise<CandidateProfile | null> {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const userRef = doc(db, "users", uid);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        return (data.profile as CandidateProfile) || null;
      }
      return null;
    } catch (err) {
      console.error("[Firestore getUserProfile error]:", err);
      return null;
    }
  },

  async saveUserProfile(uid: string, profile: Partial<CandidateProfile>): Promise<CandidateProfile | null> {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const userRef = doc(db, "users", uid);
      const existingSnap = await getDoc(userRef);
      const existingProfile = existingSnap.exists()
        ? (existingSnap.data().profile as CandidateProfile)
        : null;

      const mergedProfile: CandidateProfile = {
        ...(existingProfile || {}),
        ...profile,
        id: uid,
        updatedAt: new Date().toISOString(),
      } as CandidateProfile;

      await setDoc(
        userRef,
        {
          uid,
          email: mergedProfile.email || "",
          updatedAt: new Date().toISOString(),
          profile: sanitizeForFirestore(mergedProfile),
        },
        { merge: true }
      );

      return mergedProfile;
    } catch (err) {
      console.error("[Firestore saveUserProfile error]:", err);
      throw err;
    }
  },

  // ==========================================
  // 2. RESUMES
  // ==========================================
  async getUserResumes(uid: string): Promise<ResumeDraft[] | null> {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const resumesCol = collection(db, "users", uid, "resumes");
      const snap = await getDocs(resumesCol);
      const list: ResumeDraft[] = [];
      snap.forEach((d) => {
        list.push(d.data() as ResumeDraft);
      });
      return list;
    } catch (err) {
      console.error("[Firestore getUserResumes error]:", err);
      return null;
    }
  },

  async saveUserResume(uid: string, resume: ResumeDraft): Promise<ResumeDraft> {
    const db = getFirebaseDb();
    if (!db) throw new Error("Firestore not initialized");

    const resumeRef = doc(db, "users", uid, "resumes", resume.id);
    const sanitized = sanitizeForFirestore(resume);
    await setDoc(resumeRef, sanitized, { merge: true });
    return resume;
  },

  async deleteUserResume(uid: string, resumeId: string): Promise<boolean> {
    const db = getFirebaseDb();
    if (!db) return false;

    const resumeRef = doc(db, "users", uid, "resumes", resumeId);
    await deleteDoc(resumeRef);
    return true;
  },

  // ==========================================
  // 3. SKILLS
  // ==========================================
  async getUserSkills(uid: string): Promise<Skill[] | null> {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const skillsCol = collection(db, "users", uid, "skills");
      const snap = await getDocs(skillsCol);
      const list: Skill[] = [];
      snap.forEach((d) => list.push(d.data() as Skill));
      return list;
    } catch (err) {
      console.error("[Firestore getUserSkills error]:", err);
      return null;
    }
  },

  async saveUserSkill(uid: string, skill: Skill): Promise<Skill> {
    const db = getFirebaseDb();
    if (!db) throw new Error("Firestore not initialized");

    const skillRef = doc(db, "users", uid, "skills", skill.id);
    await setDoc(skillRef, sanitizeForFirestore(skill), { merge: true });
    return skill;
  },

  async deleteUserSkill(uid: string, skillId: string): Promise<boolean> {
    const db = getFirebaseDb();
    if (!db) return false;

    const skillRef = doc(db, "users", uid, "skills", skillId);
    await deleteDoc(skillRef);
    return true;
  },

  async saveAllSkills(uid: string, skills: Skill[]): Promise<Skill[]> {
    const db = getFirebaseDb();
    if (!db) return skills;

    for (const s of skills) {
      const sRef = doc(db, "users", uid, "skills", s.id);
      await setDoc(sRef, sanitizeForFirestore(s), { merge: true });
    }
    return skills;
  },

  // ==========================================
  // 4. ROADMAP MILESTONES
  // ==========================================
  async getUserRoadmap(uid: string): Promise<RoadmapMilestone[] | null> {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const roadmapDoc = doc(db, "users", uid, "roadmap", "current");
      const snap = await getDoc(roadmapDoc);
      if (snap.exists()) {
        const data = snap.data();
        return (data.milestones as RoadmapMilestone[]) || null;
      }
      return null;
    } catch (err) {
      console.error("[Firestore getUserRoadmap error]:", err);
      return null;
    }
  },

  async saveUserRoadmap(uid: string, milestones: RoadmapMilestone[]): Promise<RoadmapMilestone[]> {
    const db = getFirebaseDb();
    if (!db) return milestones;

    const roadmapDoc = doc(db, "users", uid, "roadmap", "current");
    await setDoc(
      roadmapDoc,
      {
        updatedAt: new Date().toISOString(),
        milestones: sanitizeForFirestore(milestones),
      },
      { merge: true }
    );
    return milestones;
  },

  // ==========================================
  // 5. APPLICATIONS (KANBAN)
  // ==========================================
  async getUserApplications(uid: string): Promise<JobApplication[] | null> {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const col = collection(db, "users", uid, "applications");
      const snap = await getDocs(col);
      const list: JobApplication[] = [];
      snap.forEach((d) => list.push(d.data() as JobApplication));
      return list;
    } catch (err) {
      console.error("[Firestore getUserApplications error]:", err);
      return null;
    }
  },

  async saveUserApplication(uid: string, app: JobApplication): Promise<JobApplication> {
    const db = getFirebaseDb();
    if (!db) return app;

    const appRef = doc(db, "users", uid, "applications", app.id);
    await setDoc(appRef, sanitizeForFirestore(app), { merge: true });
    return app;
  },

  async deleteUserApplication(uid: string, appId: string): Promise<boolean> {
    const db = getFirebaseDb();
    if (!db) return false;

    const appRef = doc(db, "users", uid, "applications", appId);
    await deleteDoc(appRef);
    return true;
  },

  // ==========================================
  // 6. SAVED OPPORTUNITIES
  // ==========================================
  async getUserSavedOpportunities(uid: string): Promise<Opportunity[] | null> {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const col = collection(db, "users", uid, "saved_opportunities");
      const snap = await getDocs(col);
      const list: Opportunity[] = [];
      snap.forEach((d) => list.push(d.data() as Opportunity));
      return list;
    } catch (err) {
      console.error("[Firestore getUserSavedOpportunities error]:", err);
      return null;
    }
  },

  async saveUserOpportunity(uid: string, opp: Opportunity): Promise<Opportunity> {
    const db = getFirebaseDb();
    if (!db) return opp;

    const oppRef = doc(db, "users", uid, "saved_opportunities", opp.id);
    await setDoc(oppRef, sanitizeForFirestore(opp), { merge: true });
    return opp;
  },

  async removeUserOpportunity(uid: string, oppId: string): Promise<boolean> {
    const db = getFirebaseDb();
    if (!db) return false;

    const oppRef = doc(db, "users", uid, "saved_opportunities", oppId);
    await deleteDoc(oppRef);
    return true;
  },

  // ==========================================
  // 7. ACTIVITIES AUDIT LOG
  // ==========================================
  async getUserActivities(uid: string, count: number = 20): Promise<ActivityItem[] | null> {
    const db = getFirebaseDb();
    if (!db) return null;

    try {
      const col = collection(db, "users", uid, "activities");
      const q = query(col, orderBy("timestamp", "desc"), firestoreLimit(count));
      const snap = await getDocs(q);
      const list: ActivityItem[] = [];
      snap.forEach((d) => list.push(d.data() as ActivityItem));
      return list;
    } catch (err) {
      console.error("[Firestore getUserActivities error]:", err);
      return null;
    }
  },

  async logUserActivity(uid: string, item: ActivityItem): Promise<ActivityItem> {
    const db = getFirebaseDb();
    if (!db) return item;

    const actRef = doc(db, "users", uid, "activities", item.id);
    await setDoc(actRef, sanitizeForFirestore(item), { merge: true });
    return item;
  },

  // ==========================================
  // 8. COMPLETE ACCOUNT DELETION (PURGE)
  // ==========================================
  async deleteEntireUserAccount(uid: string): Promise<boolean> {
    const db = getFirebaseDb();
    if (!db) return false;

    try {
      const subcollections = [
        "resumes",
        "skills",
        "applications",
        "saved_opportunities",
        "activities",
      ];

      // 1. Delete all documents in known user subcollections
      for (const sub of subcollections) {
        try {
          const colRef = collection(db, "users", uid, sub);
          const snap = await getDocs(colRef);
          const deletePromises = snap.docs.map((d) => deleteDoc(d.ref));
          await Promise.all(deletePromises);
        } catch (subErr) {
          console.warn(`[Firestore deleteEntireUserAccount] Warning deleting subcollection ${sub}:`, subErr);
        }
      }

      // 2. Delete roadmap current document if exists
      try {
        const roadmapDoc = doc(db, "users", uid, "roadmap", "current");
        await deleteDoc(roadmapDoc);
      } catch (rErr) {
        console.warn("[Firestore deleteEntireUserAccount] Roadmap doc warning:", rErr);
      }

      // 3. Delete root user document in /users/{uid}
      try {
        const userRef = doc(db, "users", uid);
        await deleteDoc(userRef);
      } catch (uErr) {
        console.warn("[Firestore deleteEntireUserAccount] Root user doc warning:", uErr);
      }

      return true;
    } catch (err) {
      console.error("[Firestore deleteEntireUserAccount fatal error]:", err);
      throw err;
    }
  },
};

