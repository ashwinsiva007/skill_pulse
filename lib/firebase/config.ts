"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, browserLocalPersistence, setPersistence } from "firebase/auth";
import { getFirestore, Firestore, enableIndexedDbPersistence } from "firebase/firestore";

export interface FirebaseClientConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId: string;
}

const STORAGE_CUSTOM_CONFIG_KEY = "skillpulse_firebase_runtime_config";

/**
 * Returns runtime custom config saved in browser (if user pasted from Firebase Console)
 * or falls back to environment variables.
 */
export function getFirebaseConfig(): FirebaseClientConfig | null {
  // 1. Check browser runtime override (allows instant setup in UI without rebuilding)
  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(STORAGE_CUSTOM_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.apiKey && parsed.projectId) {
          return parsed as FirebaseClientConfig;
        }
      }
    } catch {
      // fallback
    }
  }

  // 2. Check process.env Next.js public variables, falling back to linked project skillpulse007
  const envConfig: FirebaseClientConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAAYrMoMXnKOKoeFSHh9oVa1FCievU3vfQ",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "skillpulse007.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "skillpulse007",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "skillpulse007.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "347344087701",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:347344087701:web:6d5e5a17e4b39931a1099c",
  };

  if (envConfig.apiKey && envConfig.projectId) {
    return envConfig;
  }

  return null;
}

/**
 * Save custom Firebase credentials from app UI
 */
export function saveCustomFirebaseConfig(config: FirebaseClientConfig): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_CUSTOM_CONFIG_KEY, JSON.stringify(config));
  }
}

/**
 * Clear custom Firebase credentials
 */
export function clearCustomFirebaseConfig(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_CUSTOM_CONFIG_KEY);
  }
}

let appInstance: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;

export function getFirebaseApp(): FirebaseApp | null {
  const config = getFirebaseConfig();
  if (!config) return null;

  try {
    if (getApps().length > 0) {
      appInstance = getApp();
    } else {
      appInstance = initializeApp(config);
    }
    return appInstance;
  } catch (err) {
    console.error("[Firebase Init Error]:", err);
    return null;
  }
}

export function getFirebaseAuth(): Auth | null {
  if (authInstance) return authInstance;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    authInstance = getAuth(app);
    // Guarantee long-lived session persistence: stays signed in until manual logout
    setPersistence(authInstance, browserLocalPersistence).catch((err) => {
      console.warn("[Firebase Auth Persistence Warning]:", err);
    });
    return authInstance;
  } catch (err) {
    console.error("[Firebase Auth Error]:", err);
    return null;
  }
}

export function getFirebaseDb(): Firestore | null {
  if (firestoreInstance) return firestoreInstance;
  const app = getFirebaseApp();
  if (!app) return null;

  try {
    firestoreInstance = getFirestore(app);
    return firestoreInstance;
  } catch (err) {
    console.error("[Firestore Init Error]:", err);
    return null;
  }
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}
