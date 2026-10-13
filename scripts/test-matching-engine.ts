import assert from "node:assert";
import {
  calculateRoleMatch,
  evaluateSkill,
  isSkillMatch,
  proficiencyToLevel,
  levelToProficiency,
} from "../lib/skill-analyzer/matching-engine";
import {
  CAREER_ROLES_CATALOGUE,
  getCareerRoleById,
  CareerRoleDefinition,
} from "../lib/career-catalogue/career-catalogue";
import { generatePersonalizedRoadmap } from "../lib/roadmap/roadmap-generator";
import { CandidateProfile } from "../types/profile";
import { Skill } from "../types/skill";
import { DEMO_PROFILE, DEMO_SKILLS } from "../lib/demo/seed-data";

function createMockProfile(overrides: Partial<CandidateProfile> = {}): CandidateProfile {
  return {
    ...DEMO_PROFILE,
    id: "test-user-1",
    name: "Alex Rivera",
    email: "alex@example.com",
    targetRole: "Data Analyst",
    projects: [],
    profileCompletionPercentage: 80,
    ...overrides,
  };
}

function runTests() {
  console.log("=================================================");
  console.log("   PATHPILOT SKILL ANALYZER UNIT TEST SUITE");
  console.log("=================================================\n");

  const dataAnalystRole = getCareerRoleById("data-analyst")!;
  assert(dataAnalystRole, "Data Analyst role must exist in catalogue");

  // --------------------------------------------------------------------------
  // TEST 1: Token Matching & Synonym Normalization
  // --------------------------------------------------------------------------
  console.log("TEST 1: Token matching & synonym resolution...");
  assert.strictEqual(isSkillMatch("SQL", "SQL"), true, "Direct exact match should pass");
  assert.strictEqual(isSkillMatch("PostgreSQL", "SQL"), true, "PostgreSQL should match SQL");
  assert.strictEqual(isSkillMatch("React.js", "React"), true, "React.js should match React");
  assert.strictEqual(isSkillMatch("Next.js", "React"), true, "Next.js should match React");
  assert.strictEqual(isSkillMatch("Python", "Pandas"), true, "Python relates to Pandas");
  assert.strictEqual(isSkillMatch("Graphic Design", "PyTorch"), false, "Unrelated tokens should not match");
  console.log("  ✓ Token matching & synonyms pass\n");

  // --------------------------------------------------------------------------
  // TEST 2: Proficiency Level Conversions
  // --------------------------------------------------------------------------
  console.log("TEST 2: Proficiency level numerical scale (0 to 4)...");
  assert.strictEqual(proficiencyToLevel(undefined), 0);
  assert.strictEqual(proficiencyToLevel("Beginner"), 1);
  assert.strictEqual(proficiencyToLevel("Intermediate"), 2);
  assert.strictEqual(proficiencyToLevel("Advanced"), 3);
  assert.strictEqual(proficiencyToLevel("Expert"), 4);

  assert.strictEqual(levelToProficiency(0), null);
  assert.strictEqual(levelToProficiency(1), "Beginner");
  assert.strictEqual(levelToProficiency(2), "Intermediate");
  assert.strictEqual(levelToProficiency(3), "Advanced");
  assert.strictEqual(levelToProficiency(4), "Expert");
  console.log("  ✓ Proficiency conversions pass\n");

  // --------------------------------------------------------------------------
  // TEST 3: User with No Recorded Skills (Empty State)
  // --------------------------------------------------------------------------
  console.log("TEST 3: Candidate with zero recorded skills...");
  const emptyProfile = createMockProfile({ projects: [] });
  const emptySkills: Skill[] = [];

  const emptyResult = calculateRoleMatch(dataAnalystRole, emptyProfile, emptySkills);
  assert.strictEqual(emptyResult.matchScore, 0, "Score should safely be 0");
  assert.strictEqual(emptyResult.coreSkillCoveragePercentage, 0, "Core coverage should be 0%");
  assert.strictEqual(emptyResult.supportingSkillCoveragePercentage, 0, "Supporting coverage should be 0%");
  assert.strictEqual(emptyResult.matchedSkills.length, 0, "Matched skills should be empty");
  assert.strictEqual(
    emptyResult.missingSkills.length,
    dataAnalystRole.requiredSkills.length,
    "All role requirements should be marked missing"
  );
  assert(emptyResult.totalPointsEarned === 0, "Points earned should be 0");
  assert(!isNaN(emptyResult.matchScore), "Match score must not be NaN");
  console.log("  ✓ Zero skills empty state handled safely\n");

  // --------------------------------------------------------------------------
  // TEST 4: User with One or Two Skills
  // --------------------------------------------------------------------------
  console.log("TEST 4: Candidate with 1 or 2 skills...");
  const fewSkillsProfile = createMockProfile();
  const fewSkills: Skill[] = [
    {
      id: "s1",
      name: "SQL",
      category: "Data & Analytics",
      proficiency: "Beginner", // Level 1 out of Expected Advanced (Level 3)
      levelValue: 1,
      yearsOfExperience: 1,
      verified: true,
      targetRoleRequirement: true,
      endorsementsCount: 0,
    },
  ];

  const fewResult = calculateRoleMatch(dataAnalystRole, fewSkillsProfile, fewSkills);
  assert(fewResult.matchScore > 0, "Match score should be > 0 with SQL");
  assert(fewResult.matchScore < 40, "Match score should be partial for just 1 beginner skill");
  assert.strictEqual(fewResult.partiallyDevelopedSkills.length, 1, "SQL should be partially developed");
  assert.strictEqual(fewResult.partiallyDevelopedSkills[0].name, "SQL");
  console.log(`  ✓ 1 skill score: ${fewResult.matchScore}% (partially developed) passes\n`);

  // --------------------------------------------------------------------------
  // TEST 5: Several Skills at Different Proficiency Levels & Weighted Formula
  // --------------------------------------------------------------------------
  console.log("TEST 5: Several skills across different proficiency levels...");
  const mixedSkills: Skill[] = [
    {
      id: "s1",
      name: "SQL",
      category: "Data & Analytics",
      proficiency: "Advanced", // Expected: Advanced (3/3 = 100% of Core 3x weight)
      levelValue: 3,
      yearsOfExperience: 3,
      verified: true,
      targetRoleRequirement: true,
      endorsementsCount: 2,
    },
    {
      id: "s2",
      name: "Python",
      category: "Data & Analytics",
      proficiency: "Intermediate", // Expected: Intermediate (2/2 = 100% of Core 3x weight)
      levelValue: 2,
      yearsOfExperience: 2,
      verified: true,
      targetRoleRequirement: true,
      endorsementsCount: 1,
    },
    {
      id: "s3",
      name: "Tableau",
      category: "Data & Analytics",
      proficiency: "Beginner", // Expected: Intermediate (1/2 = 50% of Core 3x weight)
      levelValue: 1,
      yearsOfExperience: 1,
      verified: false,
      targetRoleRequirement: true,
      endorsementsCount: 0,
    },
  ];

  const mixedResult = calculateRoleMatch(dataAnalystRole, fewSkillsProfile, mixedSkills);
  assert(mixedResult.matchScore >= 40, "Score should be significantly higher with 3 core skills");
  assert(mixedResult.matchedSkills.some((s) => s.name === "SQL"), "SQL should be matched");
  assert(mixedResult.matchedSkills.some((s) => s.name === "Python"), "Python should be matched");
  assert(
    mixedResult.partiallyDevelopedSkills.some((s) => s.name === "Tableau"),
    "Tableau should be partially developed"
  );
  console.log(`  ✓ Mixed proficiencies score: ${mixedResult.matchScore}% passes\n`);

  // --------------------------------------------------------------------------
  // TEST 6: Relevant vs Irrelevant Portfolio Projects
  // --------------------------------------------------------------------------
  console.log("TEST 6: Project evidence verification...");
  const profileWithRelevantProject = createMockProfile({
    projects: [
      {
        id: "proj-1",
        title: "E-Commerce Customer Retention & SQL Dashboard",
        problem: "Executive leadership needed cohort retention data",
        description: "Built automated data ingestion pipeline using PostgreSQL and Tableau dashboards.",
        technologies: ["SQL", "PostgreSQL", "Tableau", "Python"],
        outcomes: "Decreased reporting latency by 45%",
        personalContribution: "Data architecture and dashboard design",
        status: "Completed",
      },
    ],
  });

  const relevantResult = calculateRoleMatch(dataAnalystRole, profileWithRelevantProject, mixedSkills);
  assert(relevantResult.relevantProjects.length >= 1, "Should detect at least 1 relevant project");
  assert.strictEqual(
    relevantResult.relevantProjects[0].projectTitle,
    "E-Commerce Customer Retention & SQL Dashboard"
  );
  assert(
    relevantResult.totalPointsEarned >= mixedResult.totalPointsEarned,
    "Project evidence bonus should increase or maintain points"
  );

  // Irrelevant project test
  const profileWithIrrelevantProject = createMockProfile({
    projects: [
      {
        id: "proj-2",
        title: "Fine Art Oil Painting Exhibition",
        problem: "Canvas framing",
        description: "Watercolor gallery setup",
        technologies: ["Charcoal", "Oil Paint"],
        outcomes: "Sold 3 pieces",
        personalContribution: "Framing and display",
        status: "Completed",
      },
    ],
  });

  const irrelevantResult = calculateRoleMatch(dataAnalystRole, profileWithIrrelevantProject, emptySkills);
  assert.strictEqual(
    irrelevantResult.relevantProjects.length,
    0,
    "Irrelevant project must not count as technical evidence"
  );
  console.log("  ✓ Project evidence accurately filters relevant vs irrelevant proof\n");

  // --------------------------------------------------------------------------
  // TEST 7: Catalogue Verification Across All 8 Starter Roles
  // --------------------------------------------------------------------------
  console.log("TEST 7: Catalogue integrity across all 8 configured roles...");
  assert.strictEqual(CAREER_ROLES_CATALOGUE.length, 8, "Must contain exactly 8 starter roles");

  for (const role of CAREER_ROLES_CATALOGUE) {
    assert(role.id, "Role must have an id");
    assert(role.title, "Role must have a title");
    assert(role.domain, "Role must have a domain");
    assert(role.requiredSkills.length >= 4, `${role.title} must have at least 4 skill requirements`);
    assert(role.exampleProjects.length >= 1, `${role.title} must have at least 1 example project`);
    assert(role.recommendedResources.length >= 1, `${role.title} must have at least 1 resource`);

    const result = calculateRoleMatch(role, DEMO_PROFILE, DEMO_SKILLS);
    assert(!isNaN(result.matchScore), `Score for ${role.title} should not be NaN`);
    assert(result.matchScore >= 0 && result.matchScore <= 100, `Score for ${role.title} in [0, 100]`);
    assert(result.formulaExplanation.formula.length > 0, "Formula explanation must be populated");
  }
  console.log("  ✓ All 8 roles evaluated successfully without exceptions\n");

  // --------------------------------------------------------------------------
  // TEST 8: Roadmap Generation from Skill Gaps
  // --------------------------------------------------------------------------
  console.log("TEST 8: Adaptive Roadmap generation from detected skill gaps...");
  const daResult = calculateRoleMatch(dataAnalystRole, DEMO_PROFILE, DEMO_SKILLS);
  const roadmap = generatePersonalizedRoadmap(dataAnalystRole, daResult);

  assert.strictEqual(roadmap.length, 5, "Roadmap must generate 5 structured phases");
  assert.strictEqual(roadmap[0].phaseNumber, 1, "Phase 1 must be foundational");
  assert.strictEqual(roadmap[2].phaseNumber, 3, "Phase 3 must be Capstone");
  assert.strictEqual(roadmap[4].phaseNumber, 5, "Phase 5 must be Career Transition");

  for (const phase of roadmap) {
    assert(phase.title.length > 0, "Phase must have a title");
    assert(phase.description.length > 0, "Phase must have a description");
    assert(phase.estimatedWeeks > 0, "Estimated weeks must be > 0");
    assert(phase.actionItems.length >= 2, "Phase must have at least 2 actionable tasks");
    assert(phase.completionCriteria, "Phase must specify completion criteria");
  }
  console.log("  ✓ Roadmap generated 5 valid phases with action items\n");

  // --------------------------------------------------------------------------
  // TEST 9: Edge Case - Zero Denominator Safety
  // --------------------------------------------------------------------------
  console.log("TEST 9: Edge case - Zero denominator / Empty role requirements...");
  const emptyRole: CareerRoleDefinition = {
    id: "empty-role",
    title: "Empty Role Benchmark",
    domain: "Experimental",
    overview: "Role with 0 requirements",
    typicalSeniority: "Junior",
    requiredSkills: [],
    exampleProjects: [],
    recommendedResources: [],
  };

  const zeroDenomResult = calculateRoleMatch(emptyRole, emptyProfile, emptySkills);
  assert.strictEqual(zeroDenomResult.matchScore, 0, "Empty requirements should return 0 safely");
  assert.strictEqual(zeroDenomResult.maxPointsPossible, 0);
  console.log("  ✓ Zero denominator safely returns 0 without division by zero error\n");

  // --------------------------------------------------------------------------
  // TEST 10: Edge Case - Duplicate Skills in Profile
  // --------------------------------------------------------------------------
  console.log("TEST 10: Duplicate skills in profile (takes highest proficiency)...");
  const duplicateSkills: Skill[] = [
    {
      id: "dup-1",
      name: "SQL",
      category: "Data & Analytics",
      proficiency: "Beginner",
      levelValue: 1,
      yearsOfExperience: 1,
      verified: false,
      targetRoleRequirement: false,
      endorsementsCount: 0,
    },
    {
      id: "dup-2",
      name: "SQL",
      category: "Data & Analytics",
      proficiency: "Expert", // Higher proficiency duplicate
      levelValue: 4,
      yearsOfExperience: 5,
      verified: true,
      targetRoleRequirement: true,
      endorsementsCount: 3,
    },
  ];

  const evalSkill = evaluateSkill(
    dataAnalystRole.requiredSkills.find((s) => s.name === "SQL")!,
    duplicateSkills,
    emptyProfile
  );
  assert.strictEqual(evalSkill.userProficiency, "Expert", "Should select highest proficiency (Expert)");
  assert.strictEqual(evalSkill.status, "matched", "Expected level (Advanced 3) should be matched by Expert 4");
  console.log("  ✓ Duplicate skills handled by selecting highest proficiency\n");

  console.log("=================================================");
  console.log("   ALL 10 TEST SUITES PASSED SUCCESSFULLY! ✓");
  console.log("=================================================");
}

runTests();
