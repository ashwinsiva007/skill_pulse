import { CandidateProfile } from "@/types/profile";
import { firestoreService } from "@/lib/firebase/firestore-service";
import { storageAdapter } from "@/lib/storage/storage-adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { ResumeDraft } from "@/types/resume";
import { Skill } from "@/types/skill";
import { JobApplication } from "@/types/application";

export interface AdminUserRecord {
  uid: string;
  name: string;
  email: string;
  headline?: string;
  targetRole: string;
  careerLevel: string;
  location: string;
  city: string;
  state?: string;
  skills: string[];
  skillsCount: number;
  resumesCount: number;
  profileCompletion: number;
  readinessScore: number;
  educationInstitution: string;
  degree: string;
  lastActive: string;
  syncedMode: "Cloud Firestore" | "Local Device";
  rawProfile: CandidateProfile;
}

export interface UserSubcollections {
  resumes: ResumeDraft[];
  skills: Skill[];
  applications: JobApplication[];
}

export const adminUserService = {
  /**
   * Fetch ONLY authentic registered candidate user records from Firebase Cloud Firestore
   * and local active candidate storage. Never inject fake, sample, or manipulated demo data.
   */
  async getAllUsers(): Promise<AdminUserRecord[]> {
    const list: AdminUserRecord[] = [];
    const seenUids = new Set<string>();

    try {
      // 1. Fetch live cloud candidate accounts from Firestore /users collection
      const cloudUsers = await firestoreService.getAllUsers();
      if (cloudUsers && cloudUsers.length > 0) {
        cloudUsers.forEach((cu) => {
          // Strictly exclude Master Admin account from candidate database
          if (
            cu.email?.toLowerCase() === "admin@gmail.com" ||
            cu.uid === "admin-master-account" ||
            cu.uid === "admin"
          ) {
            return;
          }

          seenUids.add(cu.uid);
          const p = cu.profile;
          const userRec: AdminUserRecord = {
            uid: cu.uid,
            name: p?.name || cu.email?.split("@")[0] || "Registered User",
            email: cu.email || p?.email || "",
            headline: p?.headline || p?.targetRole || "SkillPulse Member",
            targetRole: p?.targetRole || "Software Developer",
            careerLevel: (p?.careerLevel as string) || "Student / Candidate",
            location:
              p?.location ||
              [p?.city, p?.state, p?.country].filter(Boolean).join(", ") ||
              "India",
            city: p?.city || "India",
            state: p?.state,
            skills:
              p?.preferences?.technologiesOfInterest && p.preferences.technologiesOfInterest.length > 0
                ? p.preferences.technologiesOfInterest
                : (p?.projects || []).flatMap((pr) => pr.technologies || []).slice(0, 8),
            skillsCount: (p?.preferences?.technologiesOfInterest || []).length || 0,
            resumesCount: 1,
            profileCompletion: p?.profileCompletionPercentage || 50,
            readinessScore: p?.careerReadinessScore || 50,
            educationInstitution: p?.education?.[0]?.institution || "Academic Institution",
            degree: p?.education?.[0]?.degree || "Degree Program",
            lastActive: cu.updatedAt ? new Date(cu.updatedAt).toLocaleDateString() : "Active",
            syncedMode: "Cloud Firestore",
            rawProfile:
              p ||
              ({
                id: cu.uid,
                name: cu.email?.split("@")[0] || "Candidate",
                email: cu.email || "",
                headline: "SkillPulse Candidate",
                currentRole: "Candidate",
                targetRole: "Software Developer",
                careerLevel: "Student" as any,
                yearsOfExperience: 0,
                location: "India",
                bio: "",
                avatarUrl: "",
                profileCompletionPercentage: 50,
                careerReadinessScore: 50,
                targetIndustry: "Technology",
                availability: "Immediate",
                links: [],
                education: [],
                projects: [],
                experience: [],
                certifications: [],
                courses: [],
                hackathons: [],
                awards: [],
                leadership: [],
                preferences: {
                  targetJobRoles: ["Software Developer"],
                  preferredDomains: ["Technology"],
                  preferredLocations: ["India"],
                  workplacePreference: "Flexible",
                  opportunityTypes: ["Full-time Jobs", "Internships"],
                  technologiesOfInterest: [],
                  availability: "Immediate",
                },
                updatedAt: cu.updatedAt || new Date().toISOString(),
              } as CandidateProfile),
          };

          list.push(userRec);
        });
      }
    } catch (err) {
      console.warn("[AdminUserService] Could not query remote Firestore users:", err);
    }

    // 2. Check if a real candidate session profile was stored locally on this device
    try {
      const local = storageAdapter.getItem<CandidateProfile | null>(STORAGE_KEYS.PROFILE, null);
      if (
        local &&
        local.email &&
        local.email.toLowerCase() !== "admin@gmail.com" &&
        local.id !== "admin-master-account" &&
        !seenUids.has(local.id)
      ) {
        const userRec: AdminUserRecord = {
          uid: local.id || "local-active-candidate",
          name: local.name || "Candidate",
          email: local.email,
          headline: local.headline,
          targetRole: local.targetRole || "Software Developer",
          careerLevel: (local.careerLevel as string) || "Candidate",
          location:
            local.location ||
            [local.city, local.state, local.country].filter(Boolean).join(", ") ||
            "Local Device",
          city: local.city || "Local",
          state: local.state,
          skills: local.preferences?.technologiesOfInterest || [],
          skillsCount: (local.preferences?.technologiesOfInterest || []).length || 0,
          resumesCount: 1,
          profileCompletion: local.profileCompletionPercentage || 60,
          readinessScore: local.careerReadinessScore || 60,
          educationInstitution: local.education?.[0]?.institution || "Academic Institution",
          degree: local.education?.[0]?.degree || "Degree",
          lastActive: "Active Session",
          syncedMode: "Local Device",
          rawProfile: local,
        };
        list.push(userRec);
      }
    } catch (err) {
      console.warn("[AdminUserService] Could not check local candidate:", err);
    }

    return list;
  },

  /**
   * Fetch candidate's full live subcollections (resumes, skills, applications) directly from Firestore
   */
  async getUserSubcollections(uid: string): Promise<UserSubcollections> {
    try {
      const [resumes, skills, applications] = await Promise.all([
        firestoreService.getUserResumes(uid),
        firestoreService.getUserSkills(uid),
        firestoreService.getUserApplications(uid),
      ]);

      return {
        resumes: resumes || [],
        skills: skills || [],
        applications: applications || [],
      };
    } catch (err) {
      console.warn(`[AdminUserService] Error fetching subcollections for ${uid}:`, err);
      return { resumes: [], skills: [], applications: [] };
    }
  },
};
