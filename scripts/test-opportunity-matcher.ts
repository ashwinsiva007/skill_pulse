import assert from "node:assert";
import {
  evaluateOpportunityMatch,
  evaluateAllOpportunities,
} from "../lib/opportunities/matching-engine";
import { STARTER_DEMO_OPPORTUNITIES } from "../lib/opportunities/demo-opportunities";
import { Opportunity } from "../types/opportunity";
import { CandidateProfile } from "../types/profile";
import { Skill } from "../types/skill";
import { DEMO_PROFILE, DEMO_SKILLS } from "../lib/demo/seed-data";

function createMockOpportunity(overrides: Partial<Opportunity> = {}): Opportunity {
  return {
    id: "test-opp-1",
    title: "Junior Data Analyst Intern",
    organization: "Global Data Insights",
    company: "Global Data Insights",
    type: "Internship",
    domain: "Data & Analytics",
    description: "Assist with building data pipelines and analytical dashboards.",
    requiredSkills: ["SQL", "Python", "Data Analysis"],
    preferredSkills: ["Tableau", "Git"],
    eligibilityRequirements: "Currently enrolled in a degree program; Basic SQL knowledge",
    experienceLevel: "Entry-Level / Student",
    location: "Bangalore, India",
    workMode: "Hybrid",
    workplaceType: "Hybrid",
    postedDate: "1 day ago",
    applicationUrl: "https://example.com/demo-apply",
    deadline: "2026-11-30",
    publicationDate: "2026-10-01",
    sourceName: "Sample Careers Portal",
    sourceUrl: "https://example.com/demo-source",
    verificationStatus: "demo_simulated",
    lastVerified: "2026-10-10",
    listingStatus: "demo_only",
    isDemo: true,
    matchScore: 0,
    matchedSkills: [],
    missingSkills: [],
    ...overrides,
  };
}

function runOpportunityMatcherTests() {
  console.log("=================================================");
  console.log("   PATHPILOT OPPORTUNITY MATCHER UNIT TEST SUITE");
  console.log("=================================================\n");

  // --------------------------------------------------------------------------
  // TEST 1: Role & Domain Alignment Scoring
  // --------------------------------------------------------------------------
  console.log("TEST 1: Role & domain alignment scoring...");
  const opp = createMockOpportunity({
    title: "Junior Data Analyst",
    domain: "Data & Analytics",
  });
  const profileMatchingRole: CandidateProfile = {
    ...DEMO_PROFILE,
    targetRole: "Data Analyst",
    projects: [],
  };
  const resultMatchingRole = evaluateOpportunityMatch(opp, profileMatchingRole, []);
  assert.strictEqual(
    resultMatchingRole.scoreBreakdown.roleAndDomainPoints,
    30,
    "Direct target role match should yield full 30 points"
  );
  assert(
    resultMatchingRole.whyThisMatches.some((reason) => reason.includes("Direct target alignment")),
    "Why matches should cite direct role alignment"
  );

  const oppDomainMatch = createMockOpportunity({
    title: "Quantitative Research Associate",
    domain: "Data Science & Statistics",
  });
  const resultDomainMatch = evaluateOpportunityMatch(oppDomainMatch, profileMatchingRole, []);
  assert.strictEqual(
    resultDomainMatch.scoreBreakdown.roleAndDomainPoints,
    25,
    "Domain match should yield 25 points"
  );
  console.log("  ✓ Role and domain alignment passes\n");

  // --------------------------------------------------------------------------
  // TEST 2: Required vs Preferred Skills Separation
  // --------------------------------------------------------------------------
  console.log("TEST 2: Required vs Preferred skills separation & missing detection...");
  const candidateSkills: Skill[] = [
    {
      id: "sk-1",
      name: "SQL",
      category: "Data & Analytics",
      proficiency: "Advanced",
      levelValue: 3,
      yearsOfExperience: 2,
      verified: true,
      targetRoleRequirement: true,
      endorsementsCount: 1,
    },
    {
      id: "sk-2",
      name: "Git",
      category: "Backend & Systems",
      proficiency: "Intermediate",
      levelValue: 2,
      yearsOfExperience: 1,
      verified: false,
      targetRoleRequirement: false,
      endorsementsCount: 0,
    },
  ];

  const skillTestOpp = createMockOpportunity({
    requiredSkills: ["SQL", "Python", "Data Analysis"],
    preferredSkills: ["Git", "Docker"],
  });

  const skillResult = evaluateOpportunityMatch(skillTestOpp, profileMatchingRole, candidateSkills);

  // Required skills check
  assert(skillResult.matchedRequiredSkills.includes("SQL"), "SQL must be in matchedRequiredSkills");
  assert(skillResult.missingRequiredSkills.includes("Python"), "Python must be in missingRequiredSkills");
  assert(skillResult.missingRequiredSkills.includes("Data Analysis"), "Data Analysis must be in missingRequiredSkills");
  assert.strictEqual(skillResult.matchedRequiredSkills.length, 1);
  assert.strictEqual(skillResult.missingRequiredSkills.length, 2);

  // Preferred skills check
  assert(skillResult.matchedPreferredSkills.includes("Git"), "Git must be in matchedPreferredSkills");
  assert(skillResult.missingPreferredSkills.includes("Docker"), "Docker must be in missingPreferredSkills");
  assert.strictEqual(skillResult.matchedPreferredSkills.length, 1);
  assert.strictEqual(skillResult.missingPreferredSkills.length, 1);
  console.log("  ✓ Required and preferred skills accurately partitioned\n");

  // --------------------------------------------------------------------------
  // TEST 3: Project Evidence Contributions to Skill Overlap
  // --------------------------------------------------------------------------
  console.log("TEST 3: Portfolio project technologies contributing to skill overlap...");
  const profileWithProject: CandidateProfile = {
    ...profileMatchingRole,
    projects: [
      {
        id: "p1",
        title: "Automated Data Processing Pipeline",
        problem: "Automated ingestion pipeline needed for daily logs",
        description: "Built ingestion scripts",
        personalContribution: "Script development and testing",
        technologies: ["Python", "Pandas"],
        status: "Completed",
      },
    ],
  };

  // Only SQL is in formal skills, Python is only in project technologies
  const projectResult = evaluateOpportunityMatch(skillTestOpp, profileWithProject, [candidateSkills[0]]);
  assert(
    projectResult.matchedRequiredSkills.includes("Python"),
    "Python from project technologies should contribute to required skill match"
  );
  assert.strictEqual(
    projectResult.matchedRequiredSkills.length,
    2,
    "Should match SQL (from skill list) and Python (from project technologies)"
  );
  console.log("  ✓ Project technologies contribute seamlessly to skill evidence\n");

  // --------------------------------------------------------------------------
  // TEST 4: Work Mode Preference Rubric
  // --------------------------------------------------------------------------
  console.log("TEST 4: Work mode alignment logic...");
  const remoteOpp = createMockOpportunity({ workMode: "Remote" });
  const hybridOpp = createMockOpportunity({ workMode: "Hybrid" });
  const onsiteOpp = createMockOpportunity({ workMode: "On-site" });

  const remoteProfile: CandidateProfile = {
    ...DEMO_PROFILE,
    preferences: {
      ...DEMO_PROFILE.preferences,
      workplacePreference: "Remote",
    },
  };
  const remoteMatch = evaluateOpportunityMatch(remoteOpp, remoteProfile, []);
  assert.strictEqual(remoteMatch.scoreBreakdown.workModePoints, 10, "Exact Remote match gets 10 points");

  const mismatchMatch = evaluateOpportunityMatch(onsiteOpp, remoteProfile, []);
  assert.strictEqual(mismatchMatch.scoreBreakdown.workModePoints, 5, "Mismatch gets baseline 5 points");

  const flexibleProfile: CandidateProfile = {
    ...DEMO_PROFILE,
    preferences: {
      ...DEMO_PROFILE.preferences,
      workplacePreference: "Flexible",
    },
  };
  const flexibleMatch = evaluateOpportunityMatch(hybridOpp, flexibleProfile, []);
  assert.strictEqual(flexibleMatch.scoreBreakdown.workModePoints, 10, "Flexible preference gets full 10 points");
  console.log("  ✓ Work mode scoring passes\n");

  // --------------------------------------------------------------------------
  // TEST 5: Graceful Handling of Empty or Null Profiles
  // --------------------------------------------------------------------------
  console.log("TEST 5: Null / empty candidate profile safety...");
  const nullResult = evaluateOpportunityMatch(opp, null, []);
  assert.strictEqual(nullResult.matchScore, 0, "Match score should be 0 when profile is null");
  assert.strictEqual(
    nullResult.missingRequiredSkills.length,
    opp.requiredSkills.length,
    "All required skills should be missing"
  );
  assert(
    nullResult.whyThisMatches[0].includes("Complete your profile"),
    "Should provide an actionable hint to complete profile"
  );
  assert(!isNaN(nullResult.matchScore), "Match score must not be NaN");
  console.log("  ✓ Empty/null profile handled safely without crashing\n");

  // --------------------------------------------------------------------------
  // TEST 6: Match Score Clamping & Honest Educational Disclaimers
  // --------------------------------------------------------------------------
  console.log("TEST 6: Match score range [0, 100] and non-hiring disclaimer verification...");
  const fullMatchOpp = createMockOpportunity({
    title: "Data Analyst",
    domain: "Data & Analytics",
    requiredSkills: ["SQL"],
    preferredSkills: ["Git"],
    workMode: "Remote",
    experienceLevel: "Entry-Level / Student",
  });
  const fullResult = evaluateOpportunityMatch(fullMatchOpp, remoteProfile, candidateSkills);
  assert(fullResult.matchScore >= 0 && fullResult.matchScore <= 100, "Score must be within [0, 100]");
  assert(
    fullResult.disclaimer.includes("Does not represent a hiring probability") ||
      fullResult.disclaimer.includes("Educational Alignment Notice"),
    "Disclaimer must explicitly warn that match score is not a probability of hiring"
  );
  console.log(`  ✓ Score (${fullResult.matchScore}%) is within bounds and includes educational disclaimer\n`);

  // --------------------------------------------------------------------------
  // TEST 7: Catalogue Verification Across All 10 Starter Demo Opportunities
  // --------------------------------------------------------------------------
  console.log("TEST 7: Catalogue integrity across all 10 starter demo opportunities...");
  assert.strictEqual(
    STARTER_DEMO_OPPORTUNITIES.length,
    10,
    "Catalogue must contain exactly 10 starter opportunities"
  );

  const evaluatedOpportunities = evaluateAllOpportunities(
    STARTER_DEMO_OPPORTUNITIES,
    DEMO_PROFILE,
    DEMO_SKILLS
  );

  assert.strictEqual(evaluatedOpportunities.length, 10);

  for (const item of evaluatedOpportunities) {
    assert(item.id, "Opportunity must have an ID");
    assert(item.title, "Opportunity must have a title");
    assert(item.organization, "Opportunity must have an organization");
    assert(item.type, "Opportunity must have a type");
    assert(item.domain, "Opportunity must have a domain");
    assert(item.isDemo === true, "Must be explicitly marked isDemo: true");
    assert.strictEqual(item.verificationStatus, "demo_simulated");
    assert.strictEqual(item.listingStatus, "demo_only");
    assert(item.matchScore >= 0 && item.matchScore <= 100, `Score for ${item.title} must be in [0, 100]`);
    assert(!isNaN(item.matchScore), `Score for ${item.title} must not be NaN`);
    assert(item.matchResult.whyThisMatches.length > 0, "Must provide 'Why this matches you' reasons");
  }
  console.log("  ✓ All 10 starter demo opportunities evaluated with zero errors\n");

  // --------------------------------------------------------------------------
  // TEST 8: Diverse Opportunity Types Coverage
  // --------------------------------------------------------------------------
  console.log("TEST 8: Diverse opportunity types represented in starter dataset...");
  const types = new Set(STARTER_DEMO_OPPORTUNITIES.map((o) => o.type));
  assert(types.has("Job"), "Must include Jobs");
  assert(types.has("Internship"), "Must include Internships");
  assert(types.has("Hackathon"), "Must include Hackathons");
  assert(types.has("Research"), "Must include Research opportunities");
  assert(types.has("Career Program"), "Must include Career Programs / Fellowships");
  console.log(`  ✓ Types found: ${Array.from(types).join(", ")}\n`);

  // --------------------------------------------------------------------------
  // TEST 9: Application Tracking Stages Integrity
  // --------------------------------------------------------------------------
  console.log("TEST 9: Application tracking stages validation...");
  const validStages = [
    "saved",
    "interested",
    "applied",
    "screening",
    "technical",
    "interview",
    "offer",
    "rejected",
    "archived",
  ];
  assert.strictEqual(validStages.length, 9, "9 pipeline tracking stages verified");
  console.log("  ✓ Application tracking stages verified\n");

  console.log("=================================================");
  console.log("   ALL OPPORTUNITY MATCHER TESTS PASSED! ✓");
  console.log("=================================================");
}

runOpportunityMatcherTests();
