export type ApplicationStage =
  | "saved"
  | "interested"
  | "applied"
  | "screening"
  | "technical"
  | "interview"
  | "offer"
  | "rejected"
  | "archived";

export interface JobApplication {
  id: string;
  opportunityId?: string;
  company: string;
  role: string;
  stage: ApplicationStage;
  appliedDate: string;
  lastUpdated: string;
  salaryRange?: string;
  notes: string;
  nextStep?: string;
  nextStepDate?: string;
  contactPerson?: string;
  opportunityType?: string;
  sourceUrl?: string;
}
