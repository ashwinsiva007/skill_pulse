"use client";

import React from "react";
import { SkillAnalyzerView } from "@/features/skills/skill-analyzer-view";
import { useAuth } from "@/lib/firebase/auth-context";
import { AdminRestrictedNotice } from "@/components/admin/admin-restricted-notice";

export default function SkillsPage() {
  const { user, isAdmin } = useAuth();
  const isMasterAdmin = isAdmin || user?.email === "admin@gmail.com";

  if (isMasterAdmin) {
    return <AdminRestrictedNotice featureName="Skills Enhancer & Gap Analysis" />;
  }

  return <SkillAnalyzerView />;
}
