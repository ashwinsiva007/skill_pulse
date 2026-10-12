import { AppLayout } from "@/components/layout/app-layout";
import { OnboardingWizard } from "@/features/onboarding/onboarding-wizard";

export default function OnboardingPage() {
  return (
    <AppLayout>
      <OnboardingWizard />
    </AppLayout>
  );
}
