"use client";

import { AppLayout } from "@/components/layout/app-layout";
import { OnboardingWizard } from "@/features/onboarding/onboarding-wizard";
import { useAuth } from "@/lib/firebase/auth-context";
import { AdminRestrictedNotice } from "@/components/admin/admin-restricted-notice";

export default function OnboardingPage() {
  const { user, isAdmin } = useAuth();
  const isMasterAdmin = isAdmin || user?.email === "admin@gmail.com";

  if (isMasterAdmin) {
    return <AdminRestrictedNotice featureName="Profile Setup Wizard" />;
  }

  return (
    <AppLayout>
      <OnboardingWizard />
    </AppLayout>
  );
}
