"use client";

import React from "react";
import { SavedOpportunitiesView } from "@/features/opportunities/saved-opportunities-view";
import { useAuth } from "@/lib/firebase/auth-context";
import { AdminRestrictedNotice } from "@/components/admin/admin-restricted-notice";

export default function SavedOpportunitiesPage() {
  const { user, isAdmin } = useAuth();
  const isMasterAdmin = isAdmin || user?.email === "admin@gmail.com";

  if (isMasterAdmin) {
    return <AdminRestrictedNotice featureName="Candidate Saved Opportunities" />;
  }

  return <SavedOpportunitiesView />;
}
