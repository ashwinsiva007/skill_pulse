import {
  Opportunity,
  OpportunityScoreBreakdown,
  CareerGuidanceAdvice,
} from "@/types/opportunity";
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
  suggestedResumeKeywords: string[];
  projectsToEmphasize: string[];
  skillsToLearnNext: string[];
  isEligible: boolean;
  scoreBreakdown: OpportunityScoreBreakdown;
  disclaimer: string;
}

function normalizeText(text: string): string {
  return (text || "").toLowerCase().replace(/[^a-z0-9]/g, " ").trim();
}

/**
 * Evaluates an opportunity against the candidate's authentic profile, recorded skills,
 * education, and projects using the transparent 6-factor scoring rubric:
 *
 * 1. Role and Domain Relevance (25%)
 * 2. Required Skill Alignment (30%)
 * 3. Preferred Skill Alignment (15%)
 * 4. Experience & Education Fit (15%)
 * 5. Location & Work-Mode Fit (10%)
 * 6. Recency & Freshness (5%)
 *
 * Total = 100%
 */
export function evaluateOpportunityMatch(
  opportunity: Opportunity,
  profile: CandidateProfile | null,
  skills: Skill[] = []
): OpportunityMatchResult {
  const whyThisMatches: string[] = [];
  const projectsToEmphasize: string[] = [];
  const suggestedResumeKeywords: string[] = [];
  const skillsToLearnNext: string[] = [];

  const disclaimer =
    "Educational Alignment Notice: This score reflects observable alignment between your recorded profile and the published requirements. Does not represent a hiring probability or guarantee of selection.";

  // Safe fallback if profile is empty or null
  if (!profile) {
    return {
      opportunityId: opportunity.id,
      matchScore: 0,
      whyThisMatches: ["Complete your profile setup to unlock personalized match reasoning."],
      matchedRequiredSkills: [],
      missingRequiredSkills: [...(opportunity.requiredSkills || [])],
      matchedPreferredSkills: [],
      missingPreferredSkills: [...(opportunity.preferredSkills || [])],
      suggestedResumeKeywords: (opportunity.requiredSkills || []).slice(0, 4),
      projectsToEmphasize: [],
      skillsToLearnNext: (opportunity.requiredSkills || []).slice(0, 3),
      isEligible: true,
      scoreBreakdown: {
        roleRelevance: 0,
        requiredSkills: 0,
        preferredSkills: 0,
        experienceEducation: 0,
        locationWorkMode: 0,
        recency: 0,
        totalScore: 0,
        roleAndDomainPoints: 0,
        requiredSkillsPoints: 0,
        preferredSkillsPoints: 0,
        workModePoints: 0,
        experienceLevelPoints: 0,
      },
      disclaimer,
    };
  }

  // --------------------------------------------------------------------------
  // FACTOR 1: Role & Domain Relevance (Max 25 Points)
  // --------------------------------------------------------------------------
  let roleRelevance = 10; // Baseline
  const targetRoleNorm = normalizeText(profile.targetRole || profile.currentRole || "");
  const oppTitleNorm = normalizeText(opportunity.title);
  const oppDomainNorm = normalizeText(opportunity.domain);

  if (targetRoleNorm && (oppTitleNorm.includes(targetRoleNorm) || targetRoleNorm.includes(oppTitleNorm))) {
    roleRelevance = 25;
    whyThisMatches.push(`Target role alignment: directly matches your goal of becoming a ${profile.targetRole}.`);
  } else if (
    (targetRoleNorm.includes("data") && oppDomainNorm.includes("data")) ||
    (targetRoleNorm.includes("ai") && oppDomainNorm.includes("ai")) ||
    (targetRoleNorm.includes("software") && oppDomainNorm.includes("software")) ||
    (targetRoleNorm.includes("frontend") && (oppTitleNorm.includes("front") || oppTitleNorm.includes("react") || oppTitleNorm.includes("web"))) ||
    (targetRoleNorm.includes("backend") && (oppTitleNorm.includes("back") || oppTitleNorm.includes("node") || oppTitleNorm.includes("api"))) ||
    (targetRoleNorm.includes("full") && (oppTitleNorm.includes("full") || oppTitleNorm.includes("engineer")))
  ) {
    roleRelevance = 21;
    whyThisMatches.push(`Domain synergy: aligns with your career path in ${opportunity.domain}.`);
  } else {
    roleRelevance = 14;
  }

  // --------------------------------------------------------------------------
  // FACTOR 2: Required Skill Alignment (Max 30 Points)
  // --------------------------------------------------------------------------
  const matchedRequiredSkills: string[] = [];
  const missingRequiredSkills: string[] = [];

  // Gather user skill tokens from candidate's recorded skills and verified project technologies
  const userSkillTokens = new Set<string>();
  skills.forEach((s) => userSkillTokens.add(s.name));
  if (profile.projects) {
    for (const proj of profile.projects) {
      if (proj.technologies) {
        proj.technologies.forEach((t) => userSkillTokens.add(t));
      }
    }
  }

  const userSkillList = Array.from(userSkillTokens);
  const reqSkills = opportunity.requiredSkills || [];

  for (const req of reqSkills) {
    const matched = userSkillList.some((us) => isSkillMatch(us, req));
    if (matched) {
      matchedRequiredSkills.push(req);
      suggestedResumeKeywords.push(req);
    } else {
      missingRequiredSkills.push(req);
      skillsToLearnNext.push(req);
    }
  }

  let requiredSkillsPoints = 0;
  if (reqSkills.length === 0) {
    requiredSkillsPoints = 30; // Not penalized if unlisted
  } else {
    const ratio = matchedRequiredSkills.length / reqSkills.length;
    requiredSkillsPoints = Math.round(ratio * 30);
  }

  if (matchedRequiredSkills.length > 0) {
    whyThisMatches.push(
      `Core tech requirements: ${matchedRequiredSkills.length} of ${reqSkills.length} verified skills demonstrated (${matchedRequiredSkills
        .slice(0, 3)
        .join(", ")}).`
    );
  }

  // Find relevant projects that demonstrate matched skills
  if (profile.projects) {
    for (const p of profile.projects) {
      const projTech = (p.technologies || []).map((t) => t.toLowerCase());
      const hasOverlap = matchedRequiredSkills.some((s) => projTech.some((t) => t.includes(s.toLowerCase())));
      if (hasOverlap && projectsToEmphasize.length < 2) {
        projectsToEmphasize.push(`Project "${p.title}" highlights ${p.technologies?.slice(0, 3).join(", ")}.`);
      }
    }
  }

  // --------------------------------------------------------------------------
  // FACTOR 3: Preferred Skill Alignment (Max 15 Points)
  // --------------------------------------------------------------------------
  const matchedPreferredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];
  const prefSkills = opportunity.preferredSkills || [];

  for (const pref of prefSkills) {
    const matched = userSkillList.some((us) => isSkillMatch(us, pref));
    if (matched) {
      matchedPreferredSkills.push(pref);
      suggestedResumeKeywords.push(pref);
    } else {
      missingPreferredSkills.push(pref);
    }
  }

  let preferredSkillsPoints = 0;
  if (prefSkills.length === 0) {
    preferredSkillsPoints = 12;
  } else {
    const ratio = matchedPreferredSkills.length / prefSkills.length;
    preferredSkillsPoints = Math.round(ratio * 15);
  }

  if (matchedPreferredSkills.length > 0) {
    whyThisMatches.push(
      `Preferred competencies bonus: covers ${matchedPreferredSkills.slice(0, 2).join(", ")}.`
    );
  }

  // --------------------------------------------------------------------------
  // FACTOR 4: Experience & Education Fit (Max 15 Points)
  // --------------------------------------------------------------------------
  let experienceEducation = 11; // Generous baseline without penalizing missing data
  const candidateLevel = profile.careerLevel || "Student";
  const oppLevelNorm = normalizeText(opportunity.experienceLevel || "");

  const isStudentOrFresher =
    candidateLevel === "Student" ||
    candidateLevel === "Fresh Graduate" ||
    candidateLevel === "Entry Level";

  const isEntryLevelRole =
    oppLevelNorm.includes("intern") ||
    oppLevelNorm.includes("fresher") ||
    oppLevelNorm.includes("entry") ||
    oppLevelNorm.includes("junior") ||
    oppLevelNorm.includes("student") ||
    oppLevelNorm.includes("college") ||
    oppLevelNorm.includes("0 2") ||
    oppLevelNorm.includes("0 3");

  if (isStudentOrFresher && isEntryLevelRole) {
    experienceEducation = 15;
    whyThisMatches.push(`Target seniority: role accepts students, fresh graduates, and junior applicants.`);
  } else if (!isStudentOrFresher && (oppLevelNorm.includes("mid") || oppLevelNorm.includes("senior"))) {
    experienceEducation = 15;
  } else {
    experienceEducation = 10;
  }

  // Check degree match if candidate has recorded education
  if (profile.education && profile.education.length > 0) {
    const primaryDegree = profile.education[0].degree || "";
    if (primaryDegree) {
      experienceEducation = Math.min(15, experienceEducation + 1);
    }
  }

  // --------------------------------------------------------------------------
  // FACTOR 5: Location & Work-Mode Fit (Max 10 Points)
  // --------------------------------------------------------------------------
  let locationWorkMode = 6;
  const prefWorkplace = profile.preferences?.workplacePreference || "Flexible";
  const prefLocations = (profile.preferences?.preferredLocations || []).map((l) => l.toLowerCase());
  const oppLocLower = opportunity.location.toLowerCase();

  // Location match: Remote roles can be performed from anywhere; otherwise match against preferred locations / city
  const isCityMatch =
    opportunity.workMode === "Remote" ||
    prefLocations.length === 0 ||
    prefLocations.some((loc) => oppLocLower.includes(loc) || loc.includes("remote")) ||
    (Boolean(profile.city) && oppLocLower.includes((profile.city || "").toLowerCase()));

  // Workplace match
  const isWorkModeMatch =
    prefWorkplace === "Flexible" ||
    opportunity.workMode === "Remote" ||
    prefWorkplace.toLowerCase() === opportunity.workMode.toLowerCase();

  if (isWorkModeMatch && isCityMatch) {
    locationWorkMode = 10;
    whyThisMatches.push(`Location & format: ${opportunity.location} (${opportunity.workMode}) fits your workplace preferences.`);
  } else if (isWorkModeMatch || opportunity.workMode === "Remote") {
    locationWorkMode = 8;
    whyThisMatches.push(`Remote / flexible friendly: opportunity supports ${opportunity.workMode} collaboration.`);
  } else {
    locationWorkMode = 5;
  }

  // --------------------------------------------------------------------------
  // FACTOR 6: Recency & Freshness (Max 5 Points)
  // --------------------------------------------------------------------------
  let recency = 3;
  if (opportunity.freshnessLabel === "RECENTLY_POSTED") {
    recency = 5;
  } else if (opportunity.freshnessLabel === "SOURCE_CONFIRMED") {
    recency = 4;
  } else if (opportunity.freshnessLabel === "STALE") {
    recency = 1;
  }

  // Aggregate Total (Strictly 0 to 100)
  const totalScore = Math.min(
    100,
    Math.max(
      0,
      roleRelevance +
        requiredSkillsPoints +
        preferredSkillsPoints +
        experienceEducation +
        locationWorkMode +
        recency
    )
  );

  const scoreBreakdown: OpportunityScoreBreakdown = {
    roleRelevance,
    requiredSkills: requiredSkillsPoints,
    preferredSkills: preferredSkillsPoints,
    experienceEducation,
    locationWorkMode,
    recency,
    totalScore,
    roleAndDomainPoints: roleRelevance,
    requiredSkillsPoints,
    preferredSkillsPoints,
    workModePoints: locationWorkMode,
    experienceLevelPoints: experienceEducation,
  };

  return {
    opportunityId: opportunity.id,
    matchScore: totalScore,
    whyThisMatches,
    matchedRequiredSkills,
    missingRequiredSkills,
    matchedPreferredSkills,
    missingPreferredSkills,
    suggestedResumeKeywords: Array.from(new Set(suggestedResumeKeywords)),
    projectsToEmphasize,
    skillsToLearnNext: Array.from(new Set(skillsToLearnNext)).slice(0, 4),
    isEligible: true,
    scoreBreakdown,
    disclaimer,
  };
}

/**
 * Evaluates a list of opportunities and returns them enriched with match scores
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
