"use client";

import React from "react";
import { CandidateProfile } from "@/types/profile";

export interface StepPersonalProps {
  data: Partial<CandidateProfile>;
  onChange: (updates: Partial<CandidateProfile>) => void;
  errors?: Record<string, string>;
}

export const StepPersonal: React.FC<StepPersonalProps> = ({
  data,
  onChange,
  errors = {},
}) => {
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-semibold text-white">Step A — Personal & Professional Details</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Provide your candidate identity, headline, and public portfolio links. Information persists to your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Full Name <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            name="name"
            placeholder="e.g. Alex Morgan"
            value={data.name || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg bg-slate-950 border text-xs text-white focus:outline-none transition-colors ${
              errors.name ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
            }`}
          />
          {errors.name && <p className="text-[11px] text-rose-400 mt-1">{errors.name}</p>}
        </div>

        {/* Career Level */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Current Standing / Level <span className="text-rose-400">*</span>
          </label>
          <select
            name="careerLevel"
            value={data.careerLevel || "Student"}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="Student">Student (Undergraduate / Graduate)</option>
            <option value="Fresh Graduate">Fresh Graduate / Class of 2025-2026</option>
            <option value="Entry Level">Entry Level (0 - 1 years)</option>
            <option value="Junior">Junior Engineer (1 - 2 years)</option>
            <option value="Mid-Level">Mid-Level (3 - 5 years)</option>
            <option value="Lead">Lead / Senior (5+ years)</option>
          </select>
        </div>

        {/* Professional Headline */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Professional Headline <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            name="headline"
            placeholder="e.g. Final-Year CS & AI Student → Aspiring Junior AI Solutions Engineer"
            value={data.headline || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg bg-slate-950 border text-xs text-white focus:outline-none transition-colors ${
              errors.headline ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
            }`}
          />
          {errors.headline && <p className="text-[11px] text-rose-400 mt-1">{errors.headline}</p>}
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Email Address <span className="text-slate-500">(Optional for demo)</span>
          </label>
          <input
            type="email"
            name="email"
            placeholder="alex.morgan@example.com"
            value={data.email || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Phone Number <span className="text-slate-500">(Optional)</span>
          </label>
          <input
            type="tel"
            name="phone"
            placeholder="+1 (555) 019-2834"
            value={data.phone || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* City, State, Country */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">City & State</label>
          <input
            type="text"
            name="city"
            placeholder="e.g. San Francisco, CA"
            value={data.city || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">Country</label>
          <input
            type="text"
            name="country"
            placeholder="e.g. United States or India"
            value={data.country || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Recommendation Notice */}
        <div className="md:col-span-2 p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/40 border border-indigo-500/30 text-xs space-y-1">
          <div className="flex items-center gap-2 text-indigo-300 font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-indigo-400 animate-pulse" />
            Profile Completion & Developer Footprint Insights
          </div>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            <strong className="text-rose-300">LinkedIn Profile URL is mandatory</strong> to verify candidate identity. Entering your <strong className="text-indigo-300">GitHub account</strong> and <strong className="text-amber-300">LeetCode profile</strong> is <span className="underline decoration-indigo-400/60 font-medium">recommended to complete your profile</span> and enables automated extraction of your coding frequency, repositories, and problem-solving metrics.
          </p>
        </div>

        {/* LinkedIn - MANDATORY */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
            <span>
              LinkedIn Profile URL <span className="text-rose-400 font-bold">* (Mandatory)</span>
            </span>
            <span className="text-[10px] text-slate-500">Compulsory for verified candidate status</span>
          </label>
          <input
            type="text"
            name="linkedInUrl"
            placeholder="e.g. linkedin.com/in/yourname or https://www.linkedin.com/in/yourname"
            value={data.linkedInUrl || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg bg-slate-950 border text-xs text-white focus:outline-none transition-colors ${
              errors.linkedInUrl ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
            }`}
          />
          {errors.linkedInUrl && <p className="text-[11px] text-rose-400 mt-1">{errors.linkedInUrl}</p>}
        </div>

        {/* GitHub Account URL - RECOMMENDED */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
            <span>GitHub Account URL</span>
            <span className="text-[10px] text-indigo-400 font-medium">Recommended • Coding Frequency</span>
          </label>
          <input
            type="text"
            name="githubUrl"
            placeholder="e.g. github.com/username or https://github.com/..."
            value={data.githubUrl || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg bg-slate-950 border text-xs text-white focus:outline-none transition-colors ${
              errors.githubUrl ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
            }`}
          />
          {errors.githubUrl ? (
            <p className="text-[11px] text-rose-400 mt-1">{errors.githubUrl}</p>
          ) : (
            <p className="text-[10px] text-slate-500 mt-0.5">Recommended to analyze frequency of coding work & repositories.</p>
          )}
        </div>

        {/* LeetCode Profile URL - RECOMMENDED */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
            <span>LeetCode Profile URL</span>
            <span className="text-[10px] text-amber-400 font-medium">Recommended • DSA Stats</span>
          </label>
          <input
            type="text"
            name="leetcodeUrl"
            placeholder="e.g. leetcode.com/u/username or https://leetcode.com/..."
            value={data.leetcodeUrl || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg bg-slate-950 border text-xs text-white focus:outline-none transition-colors ${
              errors.leetcodeUrl ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
            }`}
          />
          {errors.leetcodeUrl ? (
            <p className="text-[11px] text-rose-400 mt-1">{errors.leetcodeUrl}</p>
          ) : (
            <p className="text-[10px] text-slate-500 mt-0.5">Recommended to analyze problem solving & algorithmic proficiency.</p>
          )}
        </div>

        {/* Short Biography */}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Short Professional Biography <span className="text-rose-400">*</span>
          </label>
          <textarea
            rows={3}
            name="bio"
            placeholder="Summarize your background, passions, and what challenges you enjoy solving..."
            value={data.bio || ""}
            onChange={handleChange}
            className={`w-full px-3 py-2 rounded-lg bg-slate-950 border text-xs text-white focus:outline-none transition-colors ${
              errors.bio ? "border-rose-500 focus:border-rose-500" : "border-slate-800 focus:border-indigo-500"
            }`}
          />
          {errors.bio && <p className="text-[11px] text-rose-400 mt-1">{errors.bio}</p>}
        </div>
      </div>
    </div>
  );
};
