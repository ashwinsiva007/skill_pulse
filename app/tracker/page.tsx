"use client";

import React from "react";
import { TrackerView } from "@/features/tracker/tracker-view";
import { useAuth } from "@/lib/firebase/auth-context";
import { AdminRestrictedNotice } from "@/components/admin/admin-restricted-notice";

export default function TrackerPage() {
  const { user, isAdmin } = useAuth();
  const isMasterAdmin = isAdmin || user?.email === "admin@gmail.com";

  if (isMasterAdmin) {
    return <AdminRestrictedNotice featureName="Application Tracker (Kanban)" />;
  }

  return <TrackerView />;
}
