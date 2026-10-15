"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { getFirebaseAuth, isFirebaseConfigured, getFirebaseConfig } from "./config";
import { firestoreService } from "./firestore-service";
import { CandidateProfile } from "@/types/profile";
import { DEMO_PROFILE, createBlankCandidateProfile, createAdminCandidateProfile } from "@/lib/demo/seed-data";
import { storageAdapter } from "@/lib/storage/storage-adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: CandidateProfile | null;
  loading: boolean;
  isFirebaseReady: boolean;
  isAdmin: boolean;
  error: string | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, targetRole?: string, careerLevel?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetProfileToCleanSlate: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFirebaseReady, setIsFirebaseReady] = useState<boolean>(false);

  // Initialize Auth listener
  useEffect(() => {
    // 0. Check for active permanent Master Administrator session
    const masterAdminSession = storageAdapter.getItem<{ email: string; uid: string; role: string } | null>(
      "skill_pulse_master_admin_session",
      null
    );
    if (masterAdminSession && masterAdminSession.email === "admin@gmail.com") {
      const adminFbUser = {
        uid: "admin-master-account",
        email: "admin@gmail.com",
        displayName: "System Administrator",
        emailVerified: true,
      } as unknown as FirebaseUser;
      setUser(adminFbUser);

      let p = storageAdapter.getItem<CandidateProfile | null>(STORAGE_KEYS.PROFILE, null);
      if (!p || p.email !== "admin@gmail.com") {
        p = createAdminCandidateProfile();
        storageAdapter.setItem(STORAGE_KEYS.PROFILE, p);
      }
      setProfile(p);
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    const ready = isFirebaseConfigured() && Boolean(auth);
    setIsFirebaseReady(ready);

    if (!auth) {
      // In local mode without active Firebase keys, read local stored profile
      const local = storageAdapter.getItem<CandidateProfile>(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
      setProfile(local);
      setLoading(false);
      return;
    }

    // Ensure persistent login session across device restarts
    setPersistence(auth, browserLocalPersistence).catch(console.warn);

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          let userProf = await firestoreService.getUserProfile(fbUser.uid);
          if (!userProf) {
            // First time login: create clean blank profile in Firestore
            const baseProfile = createBlankCandidateProfile(
              fbUser.uid,
              fbUser.displayName || fbUser.email?.split("@")[0] || "Candidate",
              fbUser.email || ""
            );
            userProf = await firestoreService.saveUserProfile(fbUser.uid, baseProfile);
          }
          setProfile(userProf);
          // Sync local storage mirror for offline resilience
          if (userProf) {
            storageAdapter.setItem(STORAGE_KEYS.PROFILE, userProf);
          }
        } catch (err: any) {
          console.error("Error loading user profile from Firestore:", err);
        }
      } else {
        // User logged out
        const local = storageAdapter.getItem<CandidateProfile>(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
        setProfile(local);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (user) {
      const p = await firestoreService.getUserProfile(user.uid);
      if (p) {
        setProfile(p);
        storageAdapter.setItem(STORAGE_KEYS.PROFILE, p);
      }
    } else {
      const local = storageAdapter.getItem<CandidateProfile>(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
      setProfile(local);
    }
  };

  const signIn = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    // 1. Permanent Master Administrator Authentication Check
    if (trimmedEmail === "admin@gmail.com") {
      if (pass === "admin@123") {
        const adminFbUser = {
          uid: "admin-master-account",
          email: "admin@gmail.com",
          displayName: "System Administrator",
          emailVerified: true,
        } as unknown as FirebaseUser;
        setUser(adminFbUser);

        let adminProf = storageAdapter.getItem<CandidateProfile | null>(STORAGE_KEYS.PROFILE, null);
        if (!adminProf || adminProf.email !== "admin@gmail.com") {
          adminProf = createAdminCandidateProfile();
          storageAdapter.setItem(STORAGE_KEYS.PROFILE, adminProf);
        }
        setProfile(adminProf);

        storageAdapter.setItem("skill_pulse_master_admin_session", {
          email: "admin@gmail.com",
          uid: "admin-master-account",
          role: "admin",
          loginTime: new Date().toISOString(),
        });
        setLoading(false);
        return;
      } else {
        setLoading(false);
        const err = "Invalid password for administrator account. Please use 'admin@123'.";
        setError(err);
        throw new Error(err);
      }
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      throw new Error("Firebase is not configured yet. Please enter your Firebase API credentials in Settings.");
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      const res = await signInWithEmailAndPassword(auth, email.trim(), pass);
      setUser(res.user);
      const p = await firestoreService.getUserProfile(res.user.uid);
      if (p) {
        setProfile(p);
        storageAdapter.setItem(STORAGE_KEYS.PROFILE, p);
      }
    } catch (err: any) {
      let msg = err.message || "Failed to sign in";
      if (err.code === "auth/invalid-credential" || err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password. Please verify and try again.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Too many failed attempts. Please wait a few moments before trying again.";
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    name: string,
    targetRole?: string,
    careerLevel?: string
  ) => {
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();
    if (trimmedEmail === "admin@gmail.com") {
      if (pass === "admin@123") {
        return signIn("admin@gmail.com", "admin@123");
      }
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      throw new Error("Firebase is not configured yet. Please enter your Firebase API credentials in Settings.");
    }

    try {
      await setPersistence(auth, browserLocalPersistence);
      const res = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const fbUser = res.user;

      // Update Firebase Auth profile
      await fbUpdateProfile(fbUser, { displayName: name.trim() });

      // Mandatory profile record saved in Firestore — 100% clean blank slate!
      const newProfile = createBlankCandidateProfile(
        fbUser.uid,
        name.trim(),
        email.trim(),
        targetRole,
        careerLevel
      );

      await firestoreService.saveUserProfile(fbUser.uid, newProfile);
      setUser(fbUser);
      setProfile(newProfile);
      
      // Clear all cached collections so new user starts completely fresh
      storageAdapter.setItem(STORAGE_KEYS.PROFILE, newProfile);
      storageAdapter.setItem(STORAGE_KEYS.SKILLS, []);
      storageAdapter.setItem(STORAGE_KEYS.RESUMES, []);
      storageAdapter.setItem(STORAGE_KEYS.ROADMAP, []);
      storageAdapter.setItem(STORAGE_KEYS.APPLICATIONS, []);
    } catch (err: any) {
      let msg = err.message || "Failed to create account";
      if (err.code === "auth/email-already-in-use") {
        msg = "An account with this email already exists. Try signing in instead.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please provide a valid email address.";
      }
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  const resetProfileToCleanSlate = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const blank = createBlankCandidateProfile(
        user.uid,
        user.displayName || user.email?.split("@")[0] || "Candidate",
        user.email || ""
      );
      await firestoreService.saveUserProfile(user.uid, blank);
      setProfile(blank);
      storageAdapter.setItem(STORAGE_KEYS.PROFILE, blank);
      storageAdapter.setItem(STORAGE_KEYS.SKILLS, []);
      storageAdapter.setItem(STORAGE_KEYS.RESUMES, []);
      storageAdapter.setItem(STORAGE_KEYS.ROADMAP, []);
      storageAdapter.setItem(STORAGE_KEYS.APPLICATIONS, []);
    } catch (err) {
      console.error("Failed to reset profile to clean slate:", err);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setError(null);
    storageAdapter.removeItem("skill_pulse_master_admin_session");
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch (err) {
        console.warn("SignOut error:", err);
      }
    }
    setUser(null);
    setProfile(DEMO_PROFILE);
    storageAdapter.setItem(STORAGE_KEYS.PROFILE, DEMO_PROFILE);
  };

  const clearError = () => setError(null);

  const isAdmin = Boolean(user?.email === "admin@gmail.com");

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isFirebaseReady,
        isAdmin,
        error,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        resetProfileToCleanSlate,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
};
