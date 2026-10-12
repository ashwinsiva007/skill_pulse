"use client";

import { STORAGE_VERSION, STORAGE_PREFIX } from "@/types/storage";
import { STORAGE_KEYS } from "./keys";

type StorageChangeListener = (key: string, newValue: unknown) => void;

class BrowserStorageAdapter {
  private listeners: Set<StorageChangeListener> = new Set();
  private isBrowser: boolean;

  constructor() {
    this.isBrowser = typeof window !== "undefined" && typeof window.localStorage !== "undefined";
    if (this.isBrowser) {
      window.addEventListener("storage", this.handleExternalStorageEvent);
    }
  }

  private handleExternalStorageEvent = (event: StorageEvent) => {
    if (event.key && event.key.startsWith(STORAGE_PREFIX)) {
      let parsedValue: unknown = null;
      try {
        parsedValue = event.newValue ? JSON.parse(event.newValue) : null;
      } catch {
        parsedValue = event.newValue;
      }
      this.notifyListeners(event.key, parsedValue);
    }
  };

  private notifyListeners(key: string, value: unknown) {
    this.listeners.forEach((listener) => {
      try {
        listener(key, value);
      } catch (err) {
        console.error("Storage listener callback error:", err);
      }
    });
  }

  public subscribe(listener: StorageChangeListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public isAvailable(): boolean {
    if (!this.isBrowser) return false;
    try {
      const testKey = `${STORAGE_PREFIX}:__storage_test__`;
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser) return fallback;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === undefined) return fallback;
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[SkillPulse Storage] Failed to parse key "${key}":`, err);
      return fallback;
    }
  }

  public setItem<T>(key: string, value: T): boolean {
    if (!this.isBrowser) return false;
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      this.notifyListeners(key, value);
      return true;
    } catch (err) {
      console.error(`[SkillPulse Storage] Failed to write key "${key}":`, err);
      return false;
    }
  }

  public removeItem(key: string): boolean {
    if (!this.isBrowser) return false;
    try {
      window.localStorage.removeItem(key);
      this.notifyListeners(key, null);
      return true;
    } catch (err) {
      console.error(`[SkillPulse Storage] Failed to remove key "${key}":`, err);
      return false;
    }
  }

  public clearAllSkillPulseData(): boolean {
    if (!this.isBrowser) return false;
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.startsWith(STORAGE_PREFIX) || key.startsWith("pathpilot"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => window.localStorage.removeItem(key));
      this.notifyListeners(STORAGE_PREFIX, null);
      return true;
    } catch (err) {
      console.error("[SkillPulse Storage] Failed to clear app data:", err);
      return false;
    }
  }

  public clearAllPathPilotData(): boolean {
    return this.clearAllSkillPulseData();
  }

  public getSchemaVersion(): number | null {
    return this.getItem<number | null>(STORAGE_KEYS.VERSION, null);
  }

  public setSchemaVersion(version: number = STORAGE_VERSION): void {
    this.setItem(STORAGE_KEYS.VERSION, version);
  }
}

// Singleton storage adapter instance
export const storageAdapter = new BrowserStorageAdapter();
