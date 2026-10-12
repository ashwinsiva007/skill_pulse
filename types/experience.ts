export type ExperienceType = 
  | "Internship" 
  | "Full-time" 
  | "Part-time" 
  | "Research" 
  | "Freelance";

export interface ExperienceEntry {
  id: string;
  company: string;
  role: string;
  type: ExperienceType;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  responsibilities: string;
}

export interface CertificationEntry {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export interface CourseEntry {
  id: string;
  title: string;
  platform: string; // e.g. Coursera, Udemy, edX
  completionDate: string;
  certificateUrl?: string;
}

export interface HackathonEntry {
  id: string;
  eventName: string;
  projectTitle: string;
  result: string; // e.g. "1st Place Winner", "Top 5 Finalist", "Participant"
  year: string;
  description?: string;
}

export interface AwardEntry {
  id: string;
  title: string;
  organization: string;
  date: string;
  description?: string;
}

export interface LeadershipEntry {
  id: string;
  role: string;
  organization: string;
  duration: string;
  description?: string;
}
