"use client";

import React, { useState } from "react";
import { CareerPreferences, WorkplacePreference, OpportunityType } from "@/types/preferences";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

export interface StepPreferencesProps {
  preferences: CareerPreferences;
  onChange: (preferences: CareerPreferences) => void;
}

const COMMON_ROLE_SUGGESTIONS = [
  "Junior AI Solutions Engineer",
  "Full-Stack AI Developer",
  "Associate ML Engineer",
  "Software Engineer (Frontend)",
  "Software Engineer (Backend)",
  "Cloud Platform Engineer",
  "Data Engineer",
];

const COMMON_DOMAIN_SUGGESTIONS = [
  "Enterprise AI & LLMs",
  "Developer Platforms & Tools",
  "Fintech",
  "Healthtech",
  "Autonomous Systems",
  "Cloud Infrastructure",
  "Edtech",
];

export const StepPreferences: React.FC<StepPreferencesProps> = ({
  preferences,
  onChange,
}) => {
  const [roleInput, setRoleInput] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [locationInput, setLocationInput] = useState("");
  const [techInput, setTechInput] = useState("");

  const handleAddRole = (role: string) => {
    const trimmed = role.trim();
    if (!trimmed || preferences.targetJobRoles.includes(trimmed)) return;
    onChange({
      ...preferences,
      targetJobRoles: [...preferences.targetJobRoles, trimmed],
    });
    setRoleInput("");
  };

  const handleRemoveRole = (role: string) => {
    onChange({
      ...preferences,
      targetJobRoles: preferences.targetJobRoles.filter((r) => r !== role),
    });
  };

  const handleAddDomain = (dom: string) => {
    const trimmed = dom.trim();
    if (!trimmed || preferences.preferredDomains.includes(trimmed)) return;
    onChange({
      ...preferences,
      preferredDomains: [...preferences.preferredDomains, trimmed],
    });
    setDomainInput("");
  };

  const handleRemoveDomain = (dom: string) => {
    onChange({
      ...preferences,
      preferredDomains: preferences.preferredDomains.filter((d) => d !== dom),
    });
  };

  const handleAddLocation = () => {
    const trimmed = locationInput.trim();
    if (!trimmed || preferences.preferredLocations.includes(trimmed)) return;
    onChange({
      ...preferences,
      preferredLocations: [...preferences.preferredLocations, trimmed],
    });
    setLocationInput("");
  };

  const handleRemoveLocation = (loc: string) => {
    onChange({
      ...preferences,
      preferredLocations: preferences.preferredLocations.filter((l) => l !== loc),
    });
  };

  const handleAddTech = () => {
    const trimmed = techInput.trim();
    if (!trimmed || preferences.technologiesOfInterest.includes(trimmed)) return;
    onChange({
      ...preferences,
      technologiesOfInterest: [...preferences.technologiesOfInterest, trimmed],
    });
    setTechInput("");
  };

  const handleRemoveTech = (tech: string) => {
    onChange({
      ...preferences,
      technologiesOfInterest: preferences.technologiesOfInterest.filter((t) => t !== tech),
    });
  };

  const toggleOpportunityType = (type: OpportunityType) => {
    const current = preferences.opportunityTypes || [];
    const updated = current.includes(type)
      ? current.filter((t) => t !== type)
      : [...current, type];
    onChange({
      ...preferences,
      opportunityTypes: updated,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-semibold text-white">Step D — Career Goals & Preferences</h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Define target roles, working arrangements, and industries you are targeting.
        </p>
      </div>

      {/* Target Job Roles */}
      <div className="space-y-2.5">
        <label className="block text-xs font-medium text-slate-300">
          Target Job Roles * <span className="text-slate-500">(Add 1 or more)</span>
        </label>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Junior AI Solutions Engineer"
            value={roleInput}
            onChange={(e) => setRoleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddRole(roleInput);
              }
            }}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <Button variant="outline" size="sm" type="button" onClick={() => handleAddRole(roleInput)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Role
          </Button>
        </div>

        {/* Selected Roles Chips */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {preferences.targetJobRoles.map((r) => (
            <span
              key={r}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-indigo-950 border border-indigo-800 text-xs text-indigo-300 font-medium"
            >
              {r}
              <button
                type="button"
                onClick={() => handleRemoveRole(r)}
                className="hover:text-rose-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Quick Role Suggestions */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400">Suggestions:</span>
          {COMMON_ROLE_SUGGESTIONS.map((sug) => {
            const isAdded = preferences.targetJobRoles.includes(sug);
            if (isAdded) return null;
            return (
              <button
                key={sug}
                type="button"
                onClick={() => handleAddRole(sug)}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors"
              >
                + {sug}
              </button>
            );
          })}
        </div>
      </div>

      {/* Workplace Preference & Opportunity Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Workplace Preference */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <label className="block text-xs font-semibold text-slate-200">
            Workplace Preference
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["Remote", "Hybrid", "On-site", "Flexible"] as WorkplacePreference[]).map((pref) => (
              <button
                key={pref}
                type="button"
                onClick={() => onChange({ ...preferences, workplacePreference: pref })}
                className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                  preferences.workplacePreference === pref
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-sm"
                    : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>

        {/* Opportunity Types Multi-select */}
        <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
          <label className="block text-xs font-semibold text-slate-200">
            Open to Opportunities
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["Internships", "Full-time Jobs", "Research", "Hackathons"] as OpportunityType[]).map(
              (type) => {
                const isSelected = preferences.opportunityTypes?.includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleOpportunityType(type)}
                    className={`py-2 px-3 rounded-lg text-xs font-medium border text-center transition-all ${
                      isSelected
                        ? "bg-emerald-600/20 text-emerald-300 border-emerald-500/60 font-semibold"
                        : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {isSelected ? "✓ " : "+ "}
                    {type}
                  </button>
                );
              }
            )}
          </div>
        </div>
      </div>

      {/* Preferred Domains */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Preferred Industries / Domains
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Enterprise AI, Developer Tools, Fintech"
            value={domainInput}
            onChange={(e) => setDomainInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddDomain(domainInput);
              }
            }}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <Button variant="outline" size="sm" type="button" onClick={() => handleAddDomain(domainInput)}>
            Add
          </Button>
        </div>

        {/* Domain Suggestions */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {COMMON_DOMAIN_SUGGESTIONS.map((dom) => {
            const isAdded = preferences.preferredDomains?.includes(dom);
            return (
              <button
                key={dom}
                type="button"
                onClick={() => handleAddDomain(dom)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  isAdded
                    ? "bg-indigo-600/20 text-indigo-300 border-indigo-500/40"
                    : "bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700"
                }`}
              >
                + {dom}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {preferences.preferredDomains?.map((d) => (
            <span
              key={d}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-300"
            >
              {d}
              <button
                type="button"
                onClick={() => handleRemoveDomain(d)}
                className="hover:text-rose-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Technologies of Interest */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-slate-300">
          Technologies of Interest / Learning Targets
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. PyTorch, Rust, Kubernetes, LangGraph"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddTech();
              }
            }}
            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <Button variant="outline" size="sm" type="button" onClick={handleAddTech}>
            Add
          </Button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {preferences.technologiesOfInterest?.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-cyan-300"
            >
              {t}
              <button
                type="button"
                onClick={() => handleRemoveTech(t)}
                className="hover:text-rose-400 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Locations & Availability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Preferred Locations */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Preferred Locations
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. San Francisco, CA / Bangalore / Remote"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddLocation();
                }
              }}
              className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <Button variant="outline" size="sm" type="button" onClick={handleAddLocation}>
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {preferences.preferredLocations?.map((loc) => (
              <span
                key={loc}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-xs text-slate-300"
              >
                {loc}
                <button
                  type="button"
                  onClick={() => handleRemoveLocation(loc)}
                  className="hover:text-rose-400 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Expected Availability */}
        <div className="space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Expected Joining Period / Availability *
          </label>
          <input
            type="text"
            placeholder="e.g. Summer 2026 graduation / Immediate for internships"
            value={preferences.availability || ""}
            onChange={(e) => onChange({ ...preferences, availability: e.target.value })}
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            required
          />
        </div>
      </div>
    </div>
  );
};
