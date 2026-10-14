"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/firebase/auth-context";
import {
  getFirebaseConfig,
  saveCustomFirebaseConfig,
  clearCustomFirebaseConfig,
  FirebaseClientConfig,
} from "@/lib/firebase/config";
import {
  Mail,
  Lock,
  User,
  Sparkles,
  Database,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "signin" | "signup" | "firebase";
  showAdminCredentials?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  defaultTab = "signin",
  showAdminCredentials = false,
}) => {
  const { user, signIn, signUp, isFirebaseReady } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup" | "firebase">(defaultTab);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");

  // Sign Up Form State (Mandatory Profile fields)
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpTargetRole, setSignUpTargetRole] = useState("Full Stack Developer");
  const [signUpCareerLevel, setSignUpCareerLevel] = useState("Student");

  // Firebase Config State
  const [fbApiKey, setFbApiKey] = useState("");
  const [fbAuthDomain, setFbAuthDomain] = useState("");
  const [fbProjectId, setFbProjectId] = useState("");
  const [fbStorageBucket, setFbStorageBucket] = useState("");
  const [fbSenderId, setFbSenderId] = useState("");
  const [fbAppId, setFbAppId] = useState("");
  const [pasteSnippet, setPasteSnippet] = useState("");

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab, isOpen]);

  useEffect(() => {
    const activeConfig = getFirebaseConfig();
    if (activeConfig) {
      setFbApiKey(activeConfig.apiKey || "");
      setFbAuthDomain(activeConfig.authDomain || "");
      setFbProjectId(activeConfig.projectId || "");
      setFbStorageBucket(activeConfig.storageBucket || "");
      setFbSenderId(activeConfig.messagingSenderId || "");
      setFbAppId(activeConfig.appId || "");
    }
  }, [isOpen]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await signIn(signInEmail, signInPassword);
      setSuccessMessage("Signed in successfully! Session will persist on this device.");
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      await signUp(
        signUpEmail,
        signUpPassword,
        signUpName,
        signUpTargetRole,
        signUpCareerLevel
      );
      setSuccessMessage("Profile & Cloud Account created! All data is now safely synced to Firestore.");
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleParseSnippet = () => {
    try {
      setErrorMessage(null);
      // Extracts key-value pairs even from JS objects like: apiKey: "...", projectId: "..."
      const extract = (key: string): string => {
        const regex = new RegExp(`${key}["']?\\s*:\\s*["']([^"']+)["']`, "i");
        const match = pasteSnippet.match(regex);
        return match ? match[1] : "";
      };

      const extractedApiKey = extract("apiKey");
      const extractedAuthDomain = extract("authDomain");
      const extractedProjectId = extract("projectId");
      const extractedStorageBucket = extract("storageBucket");
      const extractedSenderId = extract("messagingSenderId");
      const extractedAppId = extract("appId");

      if (extractedApiKey && extractedProjectId) {
        setFbApiKey(extractedApiKey);
        setFbAuthDomain(extractedAuthDomain);
        setFbProjectId(extractedProjectId);
        setFbStorageBucket(extractedStorageBucket);
        setFbSenderId(extractedSenderId);
        setFbAppId(extractedAppId);
        setSuccessMessage("Extracted Firebase config successfully! Click 'Save & Connect'.");
      } else {
        setErrorMessage("Could not parse Firebase snippet. Please paste the full firebaseConfig object.");
      }
    } catch {
      setErrorMessage("Failed to parse snippet. Please enter values manually into the fields below.");
    }
  };

  const handleSaveFirebaseConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!fbApiKey.trim() || !fbProjectId.trim()) {
      setErrorMessage("API Key and Project ID are mandatory for Firebase connection.");
      return;
    }

    const newConfig: FirebaseClientConfig = {
      apiKey: fbApiKey.trim(),
      authDomain: fbAuthDomain.trim() || `${fbProjectId.trim()}.firebaseapp.com`,
      projectId: fbProjectId.trim(),
      storageBucket: fbStorageBucket.trim() || `${fbProjectId.trim()}.firebasestorage.app`,
      messagingSenderId: fbSenderId.trim(),
      appId: fbAppId.trim(),
    };

    saveCustomFirebaseConfig(newConfig);
    setSuccessMessage("Firebase credentials saved! Reloading platform connection...");
    setTimeout(() => {
      window.location.reload();
    }, 800);
  };

  const handleClearConfig = () => {
    if (confirm("Reset Firebase credentials and return to default local mode?")) {
      clearCustomFirebaseConfig();
      window.location.reload();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Firebase Cloud Database & Authentication"
      description="Manage your persistent profile, cloud database synchronisation, and device authentication."
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 text-xs">
          <button
            onClick={() => {
              setTab("signin");
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors ${
              tab === "signin"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            Sign In
          </button>

          <button
            onClick={() => {
              setTab("signup");
              setErrorMessage(null);
            }}
            className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors ${
              tab === "signup"
                ? "border-indigo-500 text-indigo-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Create Account
          </button>

          {showAdminCredentials && (
            <button
              onClick={() => {
                setTab("firebase");
                setErrorMessage(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition-colors ml-auto ${
                tab === "firebase"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Firebase Console (Admin)
              {isFirebaseReady ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          )}
        </div>

        {/* Status Alerts */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-200 flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-xs text-emerald-200 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {tab === "signin" && (
          <form onSubmit={handleSignIn} className="space-y-3.5 pt-1">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300">Persistent Device Session</span>
              </div>
              <Badge variant="emerald" size="sm">
                Stay signed in until logout
              </Badge>
            </div>

            {!isFirebaseReady && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-800/60 text-xs text-amber-200 flex items-start justify-between gap-3">
                <p>
                  Firebase credentials are not yet entered. To connect to your live Firebase Cloud Firestore, switch to the <strong>Firebase Console</strong> tab.
                </p>
                <button
                  type="button"
                  onClick={() => setTab("firebase")}
                  className="underline text-indigo-400 shrink-0 hover:text-indigo-300"
                >
                  Configure →
                </button>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  placeholder="yourname@domain.com"
                  value={signInEmail}
                  onChange={(e) => setSignInEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signInPassword}
                  onChange={(e) => setSignInPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="rememberUser"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="rememberUser" className="text-[11px] text-slate-300 cursor-pointer select-none">
                Save user session on this device (Stay signed in)
              </label>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => setTab("signup")}
                  className="text-indigo-400 hover:underline"
                >
                  Create one now
                </button>
              </span>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={loading}
                className="text-xs"
              >
                Sign In to Profile
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: SIGN UP */}
        {tab === "signup" && (
          <form onSubmit={handleSignUp} className="space-y-3 pt-1">
            <div className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-800/40 text-xs text-indigo-200">
              <p className="leading-relaxed">
                Creating an account creates your permanent Candidate Profile document in Firebase Firestore. All resumes, skills, roadmaps, and applications will remain saved and synced with zero data loss.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-300 mb-1">Full Name *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Target Track / Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Full Stack Developer"
                  value={signUpTargetRole}
                  onChange={(e) => setSignUpTargetRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Career Level *</label>
                <select
                  value={signUpCareerLevel}
                  onChange={(e) => setSignUpCareerLevel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Student">Student</option>
                  <option value="Fresh Graduate">Fresh Graduate</option>
                  <option value="Entry Level">Entry Level</option>
                  <option value="Junior">Junior</option>
                  <option value="Mid-Level">Mid-Level</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="yourname@domain.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Already registered?{" "}
                <button
                  type="button"
                  onClick={() => setTab("signin")}
                  className="text-indigo-400 hover:underline"
                >
                  Sign in
                </button>
              </span>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={loading}
                className="text-xs bg-emerald-600 hover:bg-emerald-500 border-emerald-500"
              >
                Create Cloud Profile
              </Button>
            </div>
          </form>
        )}

        {/* TAB 3: FIREBASE CONSOLE CONFIG */}
        {tab === "firebase" && (
          <div className="space-y-4 pt-1">
            {/* Connection Banner */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">Firebase Connection Status:</span>
                  {isFirebaseReady ? (
                    <Badge variant="emerald" size="sm">
                      ● Live Firestore Ready
                    </Badge>
                  ) : (
                    <Badge variant="amber" size="sm">
                      ● Local Mode Active
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Project ID: <strong className="text-slate-200">{fbProjectId || "Not configured"}</strong>
                </p>
              </div>

              {isFirebaseReady && (
                <Button variant="ghost" size="sm" onClick={handleClearConfig} className="text-xs text-rose-400">
                  Reset Keys
                </Button>
              )}
            </div>

            {/* Quick Setup Instructions */}
            <div className="p-3 rounded-xl bg-indigo-950/20 border border-indigo-900/40 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  Firebase Console 3-Step Setup
                </span>
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  Open Firebase Console
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-slate-300 text-[11px]">
                <li>Create a project in <strong>Firebase Console</strong> and enable <strong>Authentication</strong> (Email/Password provider).</li>
                <li>Enable <strong>Cloud Firestore</strong> (Database) in test or production mode.</li>
                <li>Go to <strong>Project Settings → General → Your Apps</strong> (Web App &lt;/&gt;), copy the config snippet and paste it below:</li>
              </ol>
            </div>

            {/* Paste Snippet helper */}
            <div className="space-y-2">
              <label className="block text-[11px] font-medium text-slate-300">
                Paste Firebase Web App Config Object (Auto-Parser)
              </label>
              <textarea
                rows={3}
                placeholder={'const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  projectId: "skillpulse-ai",\n  appId: "..."\n};'}
                value={pasteSnippet}
                onChange={(e) => setPasteSnippet(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleParseSnippet}
                  className="text-xs"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Auto-Fill Form
                </Button>
              </div>
            </div>

            {/* Manual Form fields */}
            <form onSubmit={handleSaveFirebaseConfig} className="space-y-3 pt-2 border-t border-slate-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">API Key (apiKey) *</label>
                  <input
                    type="text"
                    required
                    placeholder="AIzaSy..."
                    value={fbApiKey}
                    onChange={(e) => setFbApiKey(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Project ID (projectId) *</label>
                  <input
                    type="text"
                    required
                    placeholder="skillpulse-ai"
                    value={fbProjectId}
                    onChange={(e) => setFbProjectId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">Auth Domain (authDomain)</label>
                  <input
                    type="text"
                    placeholder="skillpulse-ai.firebaseapp.com"
                    value={fbAuthDomain}
                    onChange={(e) => setFbAuthDomain(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">App ID (appId)</label>
                  <input
                    type="text"
                    placeholder="1:123456789:web:abcdef"
                    value={fbAppId}
                    onChange={(e) => setFbAppId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="ghost" size="sm" type="button" onClick={onClose} className="text-xs">
                  Cancel
                </Button>
                <Button variant="primary" size="sm" type="submit" className="text-xs">
                  <Database className="w-3.5 h-3.5 mr-1" />
                  Save & Connect to Firebase
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
};
