"use client";

import React from "react";
import { RoadmapView } from "@/features/roadmap/roadmap-view";
import { useAuth } from "@/lib/firebase/auth-context";
import { AdminRestrictedNotice } from "@/components/admin/admin-restricted-notice";

export default function RoadmapPage() {
  const { user, isAdmin } = useAuth();
  const isMasterAdmin = isAdmin || user?.email === "admin@gmail.com";

  if (isMasterAdmin) {
    return <AdminRestrictedNotice featureName="Career Roadmap" />;
  }

  return <RoadmapView />;
}
