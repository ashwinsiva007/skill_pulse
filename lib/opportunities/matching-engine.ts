import { Opportunity } from "@/types/opportunity";
import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import { isSkillMatch } from "@/lib/skill-analyzer/matching-engine";

export interface OpportunityMatchResult {
  opportunityId: string;
  matchScore: number; // 0 to 100
  whyThisMatches: string[];
  matchedRequiredSkills: string[];
  missingRequiredSkills: string[];
  matchedPreferredSkills: string[];
  missingPreferredSkills: string[];
  isEligible: boolean;
  scoreBreakdown: {
    roleAndDomainPoints: number;
    requiredSkillsPoints: number;
    preferredSkillsPoints: number;
    workModePoints: number;
    experienceLevelPoints: number;
  };
  disclaimer: string;
}

/**
 * Normalizes text for clean keyword comparison.
 */
function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
}

/**
 * Evaluates an opportunity against candidate profile, recorded skills, and preferences
 * using an explainable, transparent rules-based scoring rubric.
 */
export function evaluateOpportunityMatch(
  opportunity: Opportunity,
  profile: CandidateProfile | null,
  skills: Skill[] = []
): OpportunityMatchResult {
  const whyThisMatches: string[] = [];

  // Safe fallback if profile is empty or null
  if (!profile) {
    return {
      opportunityId: opportunity.id,
      matchScore: 0,
      whyThisMatches: ["Complete your profile setup to unlock personalized match reasoning."],
      matchedRequiredSkills: [],
      missingRequiredSkills: [...opportunity.requiredSkills],
      matchedPreferredSkills: [],
      missingPreferredSkills: [...opportunity.preferredSkills],
      isEligible: true,
      scoreBreakdown: {
        roleAndDomainPoints: 0,
        requiredSkillsPoints: 0,
        preferredSkillsPoints: 0,
        workModePoints: 0,
        experienceLevelPoints: 0,
      },
      disclaimer: "Informational alignment heuristic only. Does not represent a hiring probability.",
    };
  }

  // --------------------------------------------------------------------------
  // FACTOR 1: Role & Domain Alignment (Max 30 Points)
  // --------------------------------------------------------------------------
  let roleAndDomainPoints = 0;
  const targetRoleNorm = normalizeText(profile.targetRole || "");
  const oppTitleNorm = normalizeText(opportunity.title);
  const oppDomainNorm = normalizeText(opportunity.domain);

  // Check title similarity
  if (targetRoleNorm && (oppTitleNorm.includes(targetRoleNorm) || targetRoleNorm.includes(oppTitleNorm))) {
    roleAndDomainPoints = 30;
    whyThisMatches.push(`Direct target alignment: matches your goal of becoming a ${profile.targetRole}.`);
  } else if (
    (targetRoleNorm.includes("data") && oppDomainNorm.includes("data")) ||
    (targetRoleNorm.includes("ai") && oppDomainNorm.includes("ai")) ||
    (targetRoleNorm.includes("software") && oppDomainNorm.includes("software")) ||
    (targetRoleNorm.includes("frontend") && oppDomainNorm.includes("frontend")) ||
    (targetRoleNorm.includes("backend") && oppDomainNorm.includes("backend"))
  ) {
    roleAndDomainPoints = 25;
    whyThisMatches.push(`Domain alignment: corresponds to your interest in ${opportunity.domain}.`);
  } else {
    // Cross-domain baseline
    roleAndDomainPoints = 12;
  }

  // --------------------------------------------------------------------------
  // FACTOR 2: Required Skills Overlap (Max 35 Points)
  // --------------------------------------------------------------------------
  const matchedRequiredSkills: string[] = [];
  const missingRequiredSkills: string[] = [];

  // Collect all searchable skills from user skills + profile project tags
  const allUserSkills = [...skills.map((s) => s.name)];
  if (profile.projects) {
    for (const proj of profile.projects) {
      if (proj.technologies) {
        allUserSkills.push(...proj.technologies);
      }
    }
  }

  for (const reqSkill of opportunity.requiredSkills) {
    const isMatched = allUserSkills.some((userSkill) => isSkillMatch(userSkill, reqSkill));
    if (isMatched) {
      matchedRequiredSkills.push(reqSkill);
    } else {
      missingRequiredSkills.push(reqSkill);
    }
  }

  const reqTotal = opportunity.requiredSkills.length;
  let requiredSkillsPoints = 0;
  if (reqTotal === 0) {
    requiredSkillsPoints = 35;
  } else {
    const ratio = matchedRequiredSkills.length / reqTotal;
    requiredSkillsPoints = Math.round(ratio * 35);
  }

  if (matchedRequiredSkills.length > 0) {
    whyThisMatches.push(
      `Core skill overlap: ${matchedRequiredSkills.length} of ${reqTotal} required skills evidenced (${matchedRequiredSkills.slice(0, 3).join(", ")}).`
    );
  }

  // --------------------------------------------------------------------------
  // FACTOR 3: Preferred Skills Overlap (Max 15 Points)
  // --------------------------------------------------------------------------
  const matchedPreferredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];

  for (const prefSkill of opportunity.preferredSkills) {
    const isMatched = allUserSkills.some((userSkill) => isSkillMatch(userSkill, prefSkill));
    if (isMatched) {
      matchedPreferredSkills.push(prefSkill);
    } else {
      missingPreferredSkills.push(prefSkill);
    }
  }

  const prefTotal = opportunity.preferredSkills.length;
  let preferredSkillsPoints = 0;
  if (prefTotal === 0) {
    preferredSkillsPoints = 12;
  } else {
    const ratio = matchedPreferredSkills.length / prefTotal;
    preferredSkillsPoints = Math.round(ratio * 15);
  }

  if (matchedPreferredSkills.length > 0) {
    whyThisMatches.push(
      `Bonus competencies: demonstrates preferred skills (${matchedPreferredSkills.slice(0, 2).join(", ")}).`
    );
  }

  // --------------------------------------------------------------------------
  // FACTOR 4: Work Mode Preference (Max 10 Points)
  // --------------------------------------------------------------------------
  let workModePoints = 7;
  const preferredWorkMode = profile.preferences?.workplacePreference; // "Remote" | "Hybrid" | "On-site" | "Flexible"

  if (!preferredWorkMode || preferredWorkMode === "Flexible") {
    workModePoints = 10;
    whyThisMatches.push(`Flexible work mode: fits your open location preference (${opportunity.workMode}).`);
  } else if (
    preferredWorkMode.toLowerCase() === opportunity.workMode.toLowerCase() ||
    (preferredWorkMode === "Remote" && opportunity.workMode === "Remote")
  ) {
    workModePoints = 10;
    whyThisMatches.push(`Workplace match: aligns with your preferred ${opportunity.workMode} setup.`);
  } else if (opportunity.workMode === "Hybrid" && preferredWorkMode === "On-site") {
    workModePoints = 8;
  } else {
    workModePoints = 5;
  }

  // --------------------------------------------------------------------------
  // FACTOR 5: Experience Level & Eligibility (Max 10 Points)
  // --------------------------------------------------------------------------
  let experienceLevelPoints = 8;
  const candidateLevel = profile.careerLevel || "Student";
  const oppLevelNorm = normalizeText(opportunity.experienceLevel);

  if (
    oppLevelNorm.includes("all") ||
    oppLevelNorm.includes("student") ||
    oppLevelNorm.includes("intern") ||
    oppLevelNorm.includes("fresh") ||
    oppLevelNorm.includes("entry") ||
    oppLevelNorm.includes("junior")
  ) {
    experienceLevelPoints = 10;
    whyThisMatches.push(`Early-career scope: specifically tailored for ${candidateLevel} level candidates.`);
  } else if (candidateLevel === "Junior" || candidateLevel === "Mid-Level") {
    experienceLevelPoints = 9;
  } else {
    experienceLevelPoints = 6;
  }

  // Aggregate Total Score
  const totalScore = Math.min(
    Math.max(
      roleAndDomainPoints +
        requiredSkillsPoints +
        preferredSkillsPoints +
        workModePoints +
        experienceLevelPoints,
      0
    ),
    100
  );

  return {
    opportunityId: opportunity.id,
    matchScore: totalScore,
    whyThisMatches: whyThisMatches.slice(0, 4),
    matchedRequiredSkills,
    missingRequiredSkills,
    matchedPreferredSkills,
    missingPreferredSkills,
    isEligible: true,
    scoreBreakdown: {
      roleAndDomainPoints,
      requiredSkillsPoints,
      preferredSkillsPoints,
      workModePoints,
      experienceLevelPoints,
    },
    disclaimer:
      "Educational Alignment Notice: Match scores are calculated using a transparent weighted rubric comparing recorded profile data against listing parameters. A score does NOT represent a probability of selection, interview invitation, or employment offer.",
  };
}

/**
 * Evaluates multiple opportunities in batch and applies calculated match scores to the listings.
 */
export function evaluateAllOpportunities(
  opportunities: Opportunity[],
  profile: CandidateProfile | null,
  skills: Skill[] = []
): Array<Opportunity & { matchResult: OpportunityMatchResult }> {
  return opportunities.map((opp) => {
    const matchResult = evaluateOpportunityMatch(opp, profile, skills);
    return {
      ...opp,
      matchScore: matchResult.matchScore,
      matchedSkills: matchResult.matchedRequiredSkills,
      missingSkills: matchResult.missingRequiredSkills,
      matchResult,
    };
  });
}
