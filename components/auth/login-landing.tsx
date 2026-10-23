"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Briefcase,
  FileText,
  Compass,
  MapPin,
  TrendingUp,
} from "lucide-react";

export interface LoginLandingProps {
  onContinueAsGuest: () => void;
}

export const LoginLanding: React.FC<LoginLandingProps> = ({ onContinueAsGuest }) => {
  const { signIn, signUp, error, clearError } = useAuth();
  const [tab, setTab] = useState<"signin" | "signup">("signin");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [targetRole, setTargetRole] = useState("Full-Stack Developer");
  const [rememberUser, setRememberUser] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setFormError("Please provide both email and password.");
      return;
    }

    try {
      setIsLoading(true);
      setFormError(null);
      clearError();
      await signIn(email.trim(), password);
    } catch (err: any) {
      setFormError(err.message || "Failed to sign in. Please verify your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setFormError("Please provide both email and password.");
      return;
    }
    if (!fullName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);
      setFormError(null);
      clearError();
      await signUp(email.trim(), password, fullName.trim(), targetRole, "Entry-Level / Student");
    } catch (err: any) {
      setFormError(err.message || "Failed to create account.");
    } finally {
      setIsLoading(false);
    }
  };

  const popularRoles = [
    "Full-Stack Developer",
    "Frontend Engineer",
    "Backend Engineer",
    "AI / ML Engineer",
    "Data Analyst",
    "Cloud & DevOps",
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: Value Proposition & Branding */}
        <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-700/50 text-indigo-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            SkillPulse AI Platform — 2026 Edition
          </div>

          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Accelerate Your Career with <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">AI Precision</span>
            </h1>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-md mx-auto lg:mx-0">
              Personalized career roadmap, ATS-optimized watermark resume builder, and verified India-first tech vacancies with INR compensation.
            </p>
          </div>

          {/* Key highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">India-First Vacancies</p>
                <p className="text-[11px] text-slate-400">South & North India hubs with salaries in INR</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">ATS Resume Studio</p>
                <p className="text-[11px] text-slate-400">Clean PDF export without unwanted UI chrome</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
              <Compass className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Targeted Roadmaps</p>
                <p className="text-[11px] text-slate-400">Personalized weekly milestone tracking</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-white">Persistent Device Session</p>
                <p className="text-[11px] text-slate-400">Isolated profile data saved safely</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Auth Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-md overflow-hidden">
            {/* Tab switchers */}
            <div className="grid grid-cols-2 border-b border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setFormError(null);
                }}
                className={`py-3.5 text-center transition-all ${
                  tab === "signin"
                    ? "text-white bg-slate-800/60 border-b-2 border-indigo-500 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setFormError(null);
                }}
                className={`py-3.5 text-center transition-all ${
                  tab === "signup"
                    ? "text-white bg-slate-800/60 border-b-2 border-indigo-500 font-bold"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                Create Account
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Form Errors */}
              {(formError || error) && (
                <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/70 text-xs text-rose-300">
                  {formError || error}
                </div>
              )}

              {/* SIGN IN FORM */}
              {tab === "signin" ? (
                <form onSubmit={handleSignIn} className="space-y-3.5">
                  {/* Quick Demo User Access for Judges & Reviews */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/50 to-indigo-950/50 border border-emerald-500/30 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-emerald-300">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Judge & Review Fast Demo Login</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-medium">
                        Instant Access
                      </span>
                    </div>
                    <div className="bg-slate-950/70 rounded-lg p-2 font-mono text-[11px] text-slate-300 flex items-center justify-between border border-slate-800">
                      <div>
                        <span className="text-slate-400">Email:</span> <span className="text-white font-medium">niranjan@gmail.com</span>
                      </div>
                      <div>
                        <span className="text-slate-400">Pass:</span> <span className="text-emerald-400 font-medium">qwerty786</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={async () => {
                        setEmail("niranjan@gmail.com");
                        setPassword("qwerty786");
                        setRememberUser(true);
                        setFormError(null);
                        clearError();
                        setIsLoading(true);
                        try {
                          await signIn("niranjan@gmail.com", "qwerty786");
                        } catch (err: any) {
                          setFormError(err.message || "Failed to log in as demo user");
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                      <span>One-Click Fast Login as Niranjan</span>
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Save User Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMeCheckbox"
                      checked={rememberUser}
                      onChange={(e) => setRememberUser(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="rememberMeCheckbox"
                      className="text-xs text-slate-300 cursor-pointer select-none"
                    >
                      Save user session on this device (Stay signed in)
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    className="w-full text-xs font-semibold py-2.5 mt-2 cursor-pointer"
                  >
                    Sign In to Dashboard
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>

                  {/* Shortcut Links */}
                  <div className="pt-2.5 border-t border-slate-800/80 space-y-1 text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Demo User:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail("niranjan@gmail.com");
                          setPassword("qwerty786");
                          setRememberUser(true);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-medium underline flex items-center gap-1 cursor-pointer"
                        title="Quick-fill niranjan@gmail.com / qwerty786"
                      >
                        <User className="w-3 h-3 text-emerald-400" />
                        niranjan@gmail.com / qwerty786
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Master Admin:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail("admin@gmail.com");
                          setPassword("admin@123");
                          setRememberUser(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-medium underline flex items-center gap-1 cursor-pointer"
                        title="Quick-fill admin@gmail.com / admin@123"
                      >
                        <Lock className="w-3 h-3 text-indigo-400" />
                        admin@gmail.com / admin@123
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* SIGN UP FORM */
                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Alex Morgan"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Password (min. 6 characters)
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Target Role Focus
                    </label>
                    <select
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                    >
                      {popularRoles.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Save User Checkbox */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="rememberMeSignup"
                      checked={rememberUser}
                      onChange={(e) => setRememberUser(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
                    />
                    <label
                      htmlFor="rememberMeSignup"
                      className="text-xs text-slate-300 cursor-pointer select-none"
                    >
                      Save user session on this device (Stay signed in)
                    </label>
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isLoading}
                    className="w-full text-xs font-semibold py-2.5 mt-2"
                  >
                    Create Account & Get Started
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </form>
              )}

              {/* Divider & Guest Access */}
              <div className="pt-3 border-t border-slate-800 text-center space-y-2">
                <button
                  type="button"
                  onClick={onContinueAsGuest}
                  className="w-full py-2 px-3 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-750 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Explore as Guest / Instant Preview</span>
                </button>
                <p className="text-[10px] text-slate-500">
                  Guest preview lets you test all features without entering a password.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
