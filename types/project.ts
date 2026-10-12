export type ProjectStatus = "In Progress" | "Completed" | "Prototype";

export interface ProjectEntry {
  id: string;
  title: string;
  problem: string; // Problem addressed
  description: string;
  personalContribution: string;
  technologies: string[];
  status: ProjectStatus;
  startDate?: string;
  completionDate?: string;
  githubUrl?: string;
  demoUrl?: string;
  outcomes?: string; // Measured impact or outcomes
}
