import { CandidateProfile } from "@/types/profile";
import { Skill, ProficiencyLevel } from "@/types/skill";
import {
  CareerRoleDefinition,
  CatalogueSkillRequirement,
} from "@/lib/career-catalogue/career-catalogue";

export type SkillMatchStatus = "matched" | "partially_developed" | "missing";

export interface EvaluatedSkill {
  name: string;
  category: string;
  importance: "core" | "supporting";
  weight: number;
  expectedProficiency: ProficiencyLevel;
  expectedLevelValue: number;
  userProficiency: ProficiencyLevel | null;
  userLevelValue: number;
  status: SkillMatchStatus;
  proficiencyRatio: number;
  weightedPoints: number;
  maxWeightedPoints: number;
  evidenceProjects: Array<{ id: string; title: string }>;
  suggestedActivity: string;
  portfolioEvidenceTip: string;
}

export interface RecommendedAction {
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
  relatedSkill: string;
  actionType: "learn_core" | "deepen_skill" | "build_project" | "record_skill";
}

export interface RoleMatchResult {
  roleId: string;
  roleTitle: string;
  domain: string;
  matchScore: number; // 0 - 100
  coreSkillCoveragePercentage: number;
  supportingSkillCoveragePercentage: number;
  totalPointsEarned: number;
  maxPointsPossible: number;
  matchedSkills: EvaluatedSkill[];
  partiallyDevelopedSkills: EvaluatedSkill[];
  missingSkills: EvaluatedSkill[];
  strongestSkills: EvaluatedSkill[];
  relevantProjects: Array<{
    projectId: string;
    projectTitle: string;
    demonstratedSkills: string[];
  }>;
  recommendedActions: RecommendedAction[];
  formulaExplanation: {
    formula: string;
    breakdown: string;
    disclaimer: string;
  };
}

/**
 * Converts proficiency level string to numerical scale (0 to 4).
 */
export function proficiencyToLevel(prof?: ProficiencyLevel | null): number {
  if (!prof) return 0;
  switch (prof) {
    case "Beginner":
      return 1;
    case "Intermediate":
      return 2;
    case "Advanced":
      return 3;
    case "Expert":
      return 4;
    default:
      return 0;
  }
}

/**
 * Converts numerical scale (0 to 4) back to closest proficiency label.
 */
export function levelToProficiency(level: number): ProficiencyLevel | null {
  if (level <= 0) return null;
  if (level === 1) return "Beginner";
  if (level === 2) return "Intermediate";
  if (level === 3) return "Advanced";
  return "Expert";
}

/**
 * Cleans string for fuzzy token matching.
 */
function cleanToken(str: string): string {
  return str
    .toLowerCase()
    .replace(/[()&/,_.-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if a user's recorded skill matches a catalogue requirement.
 * Handles common abbreviations, compound names, and subsets (e.g. "React.js" -> "React", "Postgres" -> "PostgreSQL").
 */
export function isSkillMatch(candidateSkillName: string, requiredSkillName: string): boolean {
  const cand = cleanToken(candidateSkillName);
  const req = cleanToken(requiredSkillName);

  if (cand === req) return true;
  if (cand.includes(req) || req.includes(cand)) return true;

  // Specific common synonyms & aliases
  const synonyms: Record<string, string[]> = {
    sql: ["postgres", "postgresql", "mysql", "sqlite", "relational", "database"],
    python: ["fastapi", "django", "flask", "pandas", "numpy", "scipy"],
    tableau: ["tableau public", "power bi", "bi dashboard"],
    pandas: ["python", "dataframes"],
    "machine learning": ["scikit learn", "ml", "statistical learning"],
    pytorch: ["deep learning", "torch", "neural networks"],
    react: ["next js", "next.js", "react 19", "react.js"],
    "next js": ["react", "next.js"],
    typescript: ["ts", "strict typescript"],
    docker: ["containers", "containerization", "docker compose"],
    aws: ["cloud", "ec2", "s3", "lambda"],
    "llm orchestration": ["langchain", "llamaindex", "agents"],
    "rag vector databases": ["rag", "vector db", "pinecone", "qdrant", "chroma"],
    "prompt engineering": ["guardrails", "evals", "ragas"],
  };

  for (const [key, aliases] of Object.entries(synonyms)) {
    const keyMatchCand = cand.includes(key);
    const keyMatchReq = req.includes(key);

    if (keyMatchCand && aliases.some((a) => req.includes(a))) return true;
    if (keyMatchReq && aliases.some((a) => cand.includes(a))) return true;
  }

  return false;
}

/**
 * Finds projects in the user profile that demonstrate a given skill.
 */
export function findProjectEvidenceForSkill(
  skillName: string,
  profile: CandidateProfile
): Array<{ id: string; title: string }> {
  if (!profile.projects || profile.projects.length === 0) return [];

  const matched: Array<{ id: string; title: string }> = [];

  for (const proj of profile.projects) {
    const searchableText = [
      proj.title,
      proj.description,
      proj.personalContribution,
      proj.problem,
      ...(proj.technologies || []),
      proj.outcomes,
    ]
      .filter(Boolean)
      .join(" ");

    if (isSkillMatch(searchableText, skillName)) {
      matched.push({ id: proj.id, title: proj.title });
    }
  }

  return matched;
}

/**
 * Evaluates a single skill requirement against user's skills and projects.
 */
export function evaluateSkill(
  requirement: CatalogueSkillRequirement,
  userSkills: Skill[],
  profile: CandidateProfile
): EvaluatedSkill {
  const reqExpectedLevel = proficiencyToLevel(requirement.expectedProficiency);
  const weight = requirement.weight || (requirement.importance === "core" ? 3 : 1);
  const maxWeightedPoints = weight * 1.0;

  // Search for matching user skill (taking the highest proficiency if duplicates exist)
  let bestUserLevel = 0;
  let bestUserProf: ProficiencyLevel | null = null;

  for (const s of userSkills) {
    if (isSkillMatch(s.name, requirement.name)) {
      const lvl = proficiencyToLevel(s.proficiency);
      if (lvl > bestUserLevel) {
        bestUserLevel = lvl;
        bestUserProf = s.proficiency;
      }
    }
  }

  // Check project evidence
  const evidenceProjects = findProjectEvidenceForSkill(requirement.name, profile);
  const hasProjectEvidence = evidenceProjects.length > 0;

  // If skill was not recorded in skill list, but was demonstrated in a project, give baseline practical credit
  if (bestUserLevel === 0 && hasProjectEvidence) {
    bestUserLevel = 1;
    bestUserProf = "Beginner";
  }

  // Compute proficiency ratio: min(userLevel / expectedLevel, 1.0)
  let proficiencyRatio = 0;
  if (reqExpectedLevel > 0) {
    proficiencyRatio = Math.min(bestUserLevel / reqExpectedLevel, 1.0);
  }

  // Small evidence bonus for having demonstrable portfolio project (+0.1, capped at 1.0)
  if (hasProjectEvidence && proficiencyRatio > 0 && proficiencyRatio < 1.0) {
    proficiencyRatio = Math.min(proficiencyRatio + 0.1, 1.0);
  }

  const weightedPoints = Number((weight * proficiencyRatio).toFixed(2));

  // Determine status
  let status: SkillMatchStatus = "missing";
  if (bestUserLevel >= reqExpectedLevel || proficiencyRatio >= 0.99) {
    status = "matched";
  } else if (bestUserLevel > 0) {
    status = "partially_developed";
  }

  return {
    name: requirement.name,
    category: requirement.category,
    importance: requirement.importance,
    weight,
    expectedProficiency: requirement.expectedProficiency,
    expectedLevelValue: reqExpectedLevel,
    userProficiency: bestUserProf,
    userLevelValue: bestUserLevel,
    status,
    proficiencyRatio,
    weightedPoints,
    maxWeightedPoints,
    evidenceProjects,
    suggestedActivity: requirement.suggestedActivity,
    portfolioEvidenceTip: requirement.portfolioEvidenceTip,
  };
}

/**
 * Executes transparent, rules-based skill match analysis for a target role.
 */
export function calculateRoleMatch(
  role: CareerRoleDefinition,
  profile: CandidateProfile,
  skills: Skill[]
): RoleMatchResult {
  const evaluatedSkills: EvaluatedSkill[] = role.requiredSkills.map((req) =>
    evaluateSkill(req, skills, profile)
  );

  const matchedSkills = evaluatedSkills.filter((s) => s.status === "matched");
  const partiallyDevelopedSkills = evaluatedSkills.filter((s) => s.status === "partially_developed");
  const missingSkills = evaluatedSkills.filter((s) => s.status === "missing");

  // Strongest skills: sorted by highest user level value descending
  const strongestSkills = [...evaluatedSkills]
    .filter((s) => s.userLevelValue > 0)
    .sort((a, b) => b.userLevelValue - a.userLevelValue || b.proficiencyRatio - a.proficiencyRatio);

  // Core & Supporting totals
  const coreSkills = evaluatedSkills.filter((s) => s.importance === "core");
  const supportingSkills = evaluatedSkills.filter((s) => s.importance === "supporting");

  const coreCountRecorded = coreSkills.filter((s) => s.userLevelValue > 0).length;
  const supportingCountRecorded = supportingSkills.filter((s) => s.userLevelValue > 0).length;

  const coreCoverage =
    coreSkills.length > 0 ? Math.round((coreCountRecorded / coreSkills.length) * 100) : 0;
  const supportingCoverage =
    supportingSkills.length > 0
      ? Math.round((supportingCountRecorded / supportingSkills.length) * 100)
      : 0;

  // Weighted score calculation
  const totalPointsEarned = evaluatedSkills.reduce((sum, s) => sum + s.weightedPoints, 0);
  const maxPointsPossible = evaluatedSkills.reduce((sum, s) => sum + s.maxWeightedPoints, 0);

  let matchScore = 0;
  if (maxPointsPossible > 0) {
    matchScore = Math.min(Math.round((totalPointsEarned / maxPointsPossible) * 100), 100);
  }

  // Aggregate project evidence
  const projectMap: Map<string, { id: string; title: string; skills: Set<string> }> = new Map();
  for (const s of evaluatedSkills) {
    for (const proj of s.evidenceProjects) {
      if (!projectMap.has(proj.id)) {
        projectMap.set(proj.id, { id: proj.id, title: proj.title, skills: new Set() });
      }
      projectMap.get(proj.id)!.skills.add(s.name);
    }
  }

  const relevantProjects = Array.from(projectMap.values()).map((p) => ({
    projectId: p.id,
    projectTitle: p.title,
    demonstratedSkills: Array.from(p.skills),
  }));

  // Generate prioritized recommendations
  const recommendedActions: RecommendedAction[] = [];

  // High Priority: Missing core skills
  const missingCore = missingSkills.filter((s) => s.importance === "core");
  for (const s of missingCore.slice(0, 3)) {
    recommendedActions.push({
      priority: "high",
      title: `Record or study ${s.name}`,
      description: `${s.name} is a core foundation for ${role.title} (expected at ${s.expectedProficiency} level). ${s.suggestedActivity}`,
      relatedSkill: s.name,
      actionType: "learn_core",
    });
  }

  // Medium Priority: Partially developed core skills
  const partialCore = partiallyDevelopedSkills.filter((s) => s.importance === "core");
  for (const s of partialCore.slice(0, 2)) {
    recommendedActions.push({
      priority: "medium",
      title: `Advance ${s.name} to ${s.expectedProficiency}`,
      description: `You have recorded ${s.userProficiency || "Beginner"}, but ${role.title} expects ${s.expectedProficiency}. ${s.portfolioEvidenceTip}`,
      relatedSkill: s.name,
      actionType: "deepen_skill",
    });
  }

  // Supporting gaps or project recommendation
  if (relevantProjects.length === 0 && role.exampleProjects.length > 0) {
    const exProj = role.exampleProjects[0];
    recommendedActions.push({
      priority: "medium",
      title: `Build portfolio project: ${exProj.title}`,
      description: `${exProj.description} Demonstrating skills in a verifiable repo provides portfolio proof.`,
      relatedSkill: exProj.suggestedTech[0] || "Portfolio",
      actionType: "build_project",
    });
  }

  // Explain formula transparently
  const formulaExplanation = {
    formula: "Score = round( ( Σ [Weight_i × ProficiencyRatio_i] / Σ [Weight_i × 1.0] ) × 100 )",
    breakdown: `Earned ${totalPointsEarned.toFixed(1)} out of ${maxPointsPossible.toFixed(1)} weighted points across ${
      evaluatedSkills.length
    } benchmark competencies (${coreSkills.length} Core [weight 3x], ${supportingSkills.length} Supporting [weight 1x]).`,
    disclaimer:
      "Educational Benchmark Notice: This score is a heuristic alignment index against starter role benchmarks. It does NOT represent a hiring probability or guarantee job readiness. A skill marked 'Missing' means it has not yet been recorded or evidenced in your profile, not that you lack that skill.",
  };

  return {
    roleId: role.id,
    roleTitle: role.title,
    domain: role.domain,
    matchScore,
    coreSkillCoveragePercentage: coreCoverage,
    supportingSkillCoveragePercentage: supportingCoverage,
    totalPointsEarned: Number(totalPointsEarned.toFixed(1)),
    maxPointsPossible: Number(maxPointsPossible.toFixed(1)),
    matchedSkills,
    partiallyDevelopedSkills,
    missingSkills,
    strongestSkills,
    relevantProjects,
    recommendedActions,
    formulaExplanation,
  };
}
