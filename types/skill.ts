export type SkillCategory = 
  | "AI & Machine Learning"
  | "Frontend Engineering"
  | "Backend & Systems"
  | "Cloud & DevOps"
  | "Architecture & Leadership"
  | "Data & Analytics";

export type ProficiencyLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  proficiency: ProficiencyLevel;
  levelValue: number; // 1 to 5 or percentage
  yearsOfExperience: number;
  verified: boolean;
  targetRoleRequirement: boolean; // Flagged as priority for target role
  endorsementsCount?: number;
  lastPracticed?: string;
  notes?: string;
}

export interface SkillGapAnalysis {
  category: SkillCategory;
  currentSkillsCount: number;
  requiredSkillsCount: number;
  gapPercentage: number;
  recommendations: string[];
}
