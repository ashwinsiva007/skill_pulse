export type ApplicationStage = 
  | "saved"
  | "applied"
  | "screening"
  | "technical"
  | "final"
  | "offer"
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
}
