"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { profileRepo, activityRepo } from "@/lib/repositories/local-repos";
import { CandidateProfile } from "@/types/profile";
import { DEMO_PROFILE } from "@/lib/demo/seed-data";
import {
  Mail,
  MapPin,
  Briefcase,
  Save,
  CheckCircle2,
  ExternalLink,
  Shield,
} from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<CandidateProfile>(DEMO_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({});

  useEffect(() => {
    profileRepo.getProfile().then((data) => {
      setProfile(data);
      setFormData(data);
    });
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "yearsOfExperience" ? Number(value) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await profileRepo.updateProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      setIsSavedNotice(true);
      await activityRepo.logActivity({
        type: "system",
        title: "Updated Candidate Profile",
        description: `Target role set to ${updated.targetRole}`,
        routeLink: "/profile",
        tag: "Profile",
      });
      setTimeout(() => setIsSavedNotice(false), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">My Profile</h1>
              <Badge variant="indigo" size="sm">
                Stage 1 Profile
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Manage your candidate identity, career target, and professional bio. Saved to browser storage.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isSavedNotice && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                Saved to Local Storage!
              </span>
            )}
            <Button
              variant={isEditing ? "outline" : "primary"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>

        {/* Profile Card Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white text-2xl font-extrabold shadow-lg shrink-0">
                AM
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h2 className="text-xl font-bold text-white">{profile.name}</h2>
                  <Badge variant="indigo">{profile.careerLevel} Level</Badge>
                  <Badge variant="neutral">Demo Persona</Badge>
                </div>

                <p className="text-sm text-slate-300 font-medium">{profile.headline}</p>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {profile.location}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {profile.yearsOfExperience} Years Exp
                  </span>
                </div>
              </div>

              {/* Completion Widget */}
              <div className="w-full md:w-48 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs space-y-1.5 shrink-0">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Profile Completeness</span>
                  <span className="font-bold text-indigo-400">
                    {profile.profileCompletionPercentage}%
                  </span>
                </div>
                <Progress value={profile.profileCompletionPercentage} size="sm" />
                <span className="text-[10px] text-slate-400 block text-right">
                  Ready for AI matchmaking
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form or View Details */}
        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile Details</CardTitle>
              <CardDescription>
                Updates will be instantly stored in your browser LocalStorage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email Address (Fictional Demo)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Current Role
                    </label>
                    <input
                      type="text"
                      name="currentRole"
                      value={formData.currentRole || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Target Role
                    </label>
                    <input
                      type="text"
                      name="targetRole"
                      value={formData.targetRole || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Years of Experience
                    </label>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      value={formData.yearsOfExperience || 0}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
                      min="0"
                      max="40"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ""}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Professional Headline
                  </label>
                  <input
                    type="text"
                    name="headline"
                    value={formData.headline || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Candidate Biography
                  </label>
                  <textarea
                    rows={4}
                    name="bio"
                    value={formData.bio || ""}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:border-indigo-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" type="button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    <Save className="w-3.5 h-3.5 mr-1" />
                    Save Profile Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Biography</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {profile.bio}
                </p>
                <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
                  <div className="flex justify-between">
                    <span>Target Industry:</span>
                    <strong className="text-slate-200">{profile.targetIndustry}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Availability:</span>
                    <strong className="text-slate-200">{profile.availability}</strong>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio & Social Proof</CardTitle>
                <CardDescription>Verified external references and project links</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {profile.links.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs group"
                    >
                      <span className="font-semibold text-slate-200">{link.label}</span>
                      <span className="text-indigo-400 flex items-center gap-1 group-hover:underline">
                        {link.url}
                        <ExternalLink className="w-3 h-3 ml-0.5" />
                      </span>
                    </a>
                  ))}
                </div>

                <div className="mt-5 p-3 rounded-lg bg-indigo-950/30 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-start gap-2">
                  <Shield className="w-4 h-4 shrink-0 text-indigo-400 mt-0.5" />
                  <span>
                    Stage 1 Notice: Profiles are maintained in client-side storage. No external cloud credentials or auth middleware are deployed.
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
