import { STORAGE_PREFIX } from "@/types/storage";

export const STORAGE_KEYS = {
  VERSION: `${STORAGE_PREFIX}:schema_version`,
  INITIALIZED: `${STORAGE_PREFIX}:initialized_at`,
  PROFILE: `${STORAGE_PREFIX}:candidate_profile`,
  SKILLS: `${STORAGE_PREFIX}:skills_list`,
  RESUMES: `${STORAGE_PREFIX}:resume_drafts`,
  ROADMAP: `${STORAGE_PREFIX}:career_roadmap`,
  OPPORTUNITIES: `${STORAGE_PREFIX}:opportunities`,
  APPLICATIONS: `${STORAGE_PREFIX}:applications`,
  ACTIVITIES: `${STORAGE_PREFIX}:recent_activities`,
  SETTINGS: `${STORAGE_PREFIX}:app_settings`,
} as const;

export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS];
