"use client";

import { storageAdapter } from "@/lib/storage/storage-adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";
import { INITIAL_DEMO_DATASET } from "./seed-data";
import { STORAGE_VERSION, DemoDataset } from "@/types/storage";

export class DemoManager {
  /**
   * Checks whether demo data has already been initialized in the browser.
   */
  public static isDemoInitialized(): boolean {
    const initializedAt = storageAdapter.getItem<string | null>(STORAGE_KEYS.INITIALIZED, null);
    const schemaVersion = storageAdapter.getSchemaVersion();
    return Boolean(initializedAt && schemaVersion === STORAGE_VERSION);
  }

  /**
   * Initializes the browser storage with the demo dataset ONLY if it is not already initialized.
   * Does NOT overwrite user changes on subsequent page loads.
   */
  public static initializeDemoDataIfEmpty(): boolean {
    if (this.isDemoInitialized()) {
      return false; // Already present, preserve current state
    }
    return this.forceResetToDemo();
  }

  /**
   * Explicitly resets all storage data back to the fictional candidate seed dataset.
   */
  public static forceResetToDemo(): boolean {
    try {
      const now = new Date().toISOString();
      const dataset: DemoDataset = {
        ...INITIAL_DEMO_DATASET,
        lastInitialized: now,
      };

      storageAdapter.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);
      storageAdapter.setItem(STORAGE_KEYS.INITIALIZED, now);
      storageAdapter.setItem(STORAGE_KEYS.PROFILE, dataset.profile);
      storageAdapter.setItem(STORAGE_KEYS.SKILLS, dataset.skills);
      storageAdapter.setItem(STORAGE_KEYS.RESUMES, dataset.resumes);
      storageAdapter.setItem(STORAGE_KEYS.ROADMAP, dataset.roadmap);
      storageAdapter.setItem(STORAGE_KEYS.OPPORTUNITIES, dataset.opportunities);
      storageAdapter.setItem(STORAGE_KEYS.APPLICATIONS, dataset.applications);
      storageAdapter.setItem(STORAGE_KEYS.ACTIVITIES, dataset.activities);

      return true;
    } catch (err) {
      console.error("[DemoManager] Failed to reset demo data:", err);
      return false;
    }
  }

  /**
   * Purges all application data from browser storage.
   */
  public static purgeAllData(): boolean {
    return storageAdapter.clearAllPathPilotData();
  }

  /**
   * Returns a diagnostic summary of storage status.
   */
  public static getStorageSummary(): {
    initialized: boolean;
    schemaVersion: number | null;
    initializedAt: string | null;
    skillsCount: number;
    resumesCount: number;
    roadmapPhasesCount: number;
    opportunitiesCount: number;
    applicationsCount: number;
    estimatedBytes: number;
  } {
    const isInit = this.isDemoInitialized();
    const schemaVersion = storageAdapter.getSchemaVersion();
    const initializedAt = storageAdapter.getItem<string | null>(STORAGE_KEYS.INITIALIZED, null);
    
    const skills = storageAdapter.getItem<unknown[]>(STORAGE_KEYS.SKILLS, []);
    const resumes = storageAdapter.getItem<unknown[]>(STORAGE_KEYS.RESUMES, []);
    const roadmap = storageAdapter.getItem<unknown[]>(STORAGE_KEYS.ROADMAP, []);
    const opportunities = storageAdapter.getItem<unknown[]>(STORAGE_KEYS.OPPORTUNITIES, []);
    const applications = storageAdapter.getItem<unknown[]>(STORAGE_KEYS.APPLICATIONS, []);

    let estimatedBytes = 0;
    if (typeof window !== "undefined" && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith("pathpilot")) {
          const val = window.localStorage.getItem(key) || "";
          estimatedBytes += (key.length + val.length) * 2; // UTF-16 approx
        }
      }
    }

    return {
      initialized: isInit,
      schemaVersion,
      initializedAt,
      skillsCount: skills.length,
      resumesCount: resumes.length,
      roadmapPhasesCount: roadmap.length,
      opportunitiesCount: opportunities.length,
      applicationsCount: applications.length,
      estimatedBytes,
    };
  }

  /**
   * Exports full JSON data snapshot.
   */
  public static exportSnapshot(): string {
    const dataset: DemoDataset = {
      version: storageAdapter.getSchemaVersion() || STORAGE_VERSION,
      lastInitialized: storageAdapter.getItem<string>(STORAGE_KEYS.INITIALIZED, new Date().toISOString()),
      profile: storageAdapter.getItem(STORAGE_KEYS.PROFILE, INITIAL_DEMO_DATASET.profile),
      skills: storageAdapter.getItem(STORAGE_KEYS.SKILLS, INITIAL_DEMO_DATASET.skills),
      resumes: storageAdapter.getItem(STORAGE_KEYS.RESUMES, INITIAL_DEMO_DATASET.resumes),
      roadmap: storageAdapter.getItem(STORAGE_KEYS.ROADMAP, INITIAL_DEMO_DATASET.roadmap),
      opportunities: storageAdapter.getItem(STORAGE_KEYS.OPPORTUNITIES, INITIAL_DEMO_DATASET.opportunities),
      applications: storageAdapter.getItem(STORAGE_KEYS.APPLICATIONS, INITIAL_DEMO_DATASET.applications),
      activities: storageAdapter.getItem(STORAGE_KEYS.ACTIVITIES, INITIAL_DEMO_DATASET.activities),
    };
    return JSON.stringify(dataset, null, 2);
  }

  /**
   * Safely imports a snapshot.
   */
  public static importSnapshot(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString) as Partial<DemoDataset>;
      if (!parsed || typeof parsed !== "object") {
        return { success: false, message: "Invalid JSON format." };
      }

      if (parsed.profile) storageAdapter.setItem(STORAGE_KEYS.PROFILE, parsed.profile);
      if (Array.isArray(parsed.skills)) storageAdapter.setItem(STORAGE_KEYS.SKILLS, parsed.skills);
      if (Array.isArray(parsed.resumes)) storageAdapter.setItem(STORAGE_KEYS.RESUMES, parsed.resumes);
      if (Array.isArray(parsed.roadmap)) storageAdapter.setItem(STORAGE_KEYS.ROADMAP, parsed.roadmap);
      if (Array.isArray(parsed.opportunities)) storageAdapter.setItem(STORAGE_KEYS.OPPORTUNITIES, parsed.opportunities);
      if (Array.isArray(parsed.applications)) storageAdapter.setItem(STORAGE_KEYS.APPLICATIONS, parsed.applications);
      if (Array.isArray(parsed.activities)) storageAdapter.setItem(STORAGE_KEYS.ACTIVITIES, parsed.activities);

      storageAdapter.setItem(STORAGE_KEYS.INITIALIZED, new Date().toISOString());
      storageAdapter.setItem(STORAGE_KEYS.VERSION, STORAGE_VERSION);

      return { success: true, message: "Demo snapshot imported successfully." };
    } catch (err) {
      return { success: false, message: `Import error: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
}
