import { CareerRoleDefinition } from "@/lib/career-catalogue/career-catalogue";
import { RoleMatchResult } from "@/lib/skill-analyzer/matching-engine";
import { RoadmapMilestone, RoadmapActionItem } from "@/types/roadmap";

/**
 * Generates an adaptive, 5-phase career roadmap based on target role and detected skill gaps.
 */
export function generatePersonalizedRoadmap(
  role: CareerRoleDefinition,
  matchResult: RoleMatchResult
): RoadmapMilestone[] {
  const missingCoreNames = matchResult.missingSkills
    .filter((s) => s.importance === "core")
    .map((s) => s.name);

  const partialCoreNames = matchResult.partiallyDevelopedSkills.map((s) => s.name);

  const targetProject =
    role.exampleProjects.length > 0
      ? role.exampleProjects[0]
      : {
          title: `${role.title} Portfolio Demonstration Project`,
          description: `Build an end-to-end practical application showcasing ${role.domain} competencies.`,
          suggestedTech: role.requiredSkills.slice(0, 3).map((s) => s.name),
          keyDeliverables: ["Functional code repository", "Interactive demo", "Technical README"],
        };

  // Phase 1: Foundations
  const foundationsSkills = Array.from(
    new Set([
      ...missingCoreNames,
      ...role.requiredSkills.filter((s) => s.importance === "core").map((s) => s.name),
      ...role.requiredSkills.map((s) => s.name),
    ])
  ).slice(0, 3);

  const phase1Actions: RoadmapActionItem[] = foundationsSkills.map((skillName, idx) => {
    const res = role.recommendedResources[idx] || role.recommendedResources[0];
    return {
      id: `p1-${idx + 1}`,
      title: `Study core syntax, principles, and mental models of ${skillName}`,
      completed: matchResult.matchScore >= 70, // auto-mark complete if candidate already has high match
      resourceUrl: res ? res.url : undefined,
      resourceTitle: res ? res.title : undefined,
    };
  });

  if (phase1Actions.length < 2) {
    phase1Actions.push({
      id: "p1-tools",
      title: `Audit environment setup, package management, and developer toolchains for ${role.title}`,
      completed: matchResult.matchScore >= 70,
    });
  }

  // Phase 2: Practice
  const practiceSkills = Array.from(
    new Set([
      ...partialCoreNames,
      ...role.requiredSkills.slice(1).map((s) => s.name),
      ...role.requiredSkills.map((s) => s.name),
    ])
  ).slice(0, 3);

  const phase2Actions: RoadmapActionItem[] = practiceSkills.map((skillName, idx) => ({
    id: `p2-${idx + 1}`,
    title: `Solve 5+ applied algorithmic or practical exercises using ${skillName}`,
    completed: false,
    resourceUrl:
      role.recommendedResources[1]?.url || "https://github.com",
    resourceTitle: "Applied Practice Repository",
  }));

  if (phase2Actions.length < 2) {
    phase2Actions.push({
      id: "p2-bench",
      title: `Build benchmark micro-tasks and test suites validating applied ${role.title} competence`,
      completed: false,
    });
  }

  // Phase 3: Project
  const phase3Actions = [
    {
      id: "p3-1",
      title: `Initialize GitHub repository with structured README and setup instructions for ${targetProject.title}`,
      completed: false,
    },
    {
      id: "p3-2",
      title: `Implement core architectural logic using ${targetProject.suggestedTech.join(", ")}`,
      completed: false,
    },
    {
      id: "p3-3",
      title: `Deploy interactive demo or document reproducible test harness with sample dataset`,
      completed: false,
    },
  ];

  // Phase 4: Portfolio & Resume
  const phase4Actions = [
    {
      id: "p4-1",
      title: `Draft a dedicated "${role.title}" resume version in PathPilot Resume Builder (/resume)`,
      completed: false,
    },
    {
      id: "p4-2",
      title: `Format project bullets using the STAR / Action-Problem-Tech-Impact framework`,
      completed: false,
    },
    {
      id: "p4-3",
      title: `Add live demo links and clean license/contribution guidelines to your GitHub profile`,
      completed: false,
    },
  ];

  // Phase 5: Opportunities & Applications
  const phase5Actions = [
    {
      id: "p5-1",
      title: `Bookmark at least 3 matching opportunities in the PathPilot Opportunities portal (/opportunities)`,
      completed: false,
    },
    {
      id: "p5-2",
      title: `Conduct a self-review on top technical interview questions for ${role.title}`,
      completed: false,
    },
    {
      id: "p5-3",
      title: `Track your first tailored application in the Application Kanban tracker (/tracker)`,
      completed: false,
    },
  ];

  const milestones: RoadmapMilestone[] = [
    {
      id: `phase-1-${role.id}`,
      phaseNumber: 1,
      phaseTitle: "Phase 1: Foundational Mastery",
      title: `Strengthen Core Foundations for ${role.title}`,
      description: `Target the fundamental building blocks and syntax required for ${role.title}. Build fluency in primary languages and essential tools.`,
      priority: missingCoreNames.length > 0 ? "high" : "medium",
      targetRole: role.title,
      skillsAddressed: foundationsSkills,
      estimatedWeeks: missingCoreNames.length > 0 ? 3 : 2,
      status: matchResult.matchScore >= 70 ? "completed" : "in_progress",
      progressPercentage: matchResult.matchScore >= 70 ? 100 : 33,
      actionItems: phase1Actions,
      completionCriteria: `Demonstrate basic competency in ${foundationsSkills.join(", ")} and complete self-guided exercises.`,
      suggestedProject: "Build isolated sandbox scripts verifying core syntax and data handling.",
      userNotes: "",
    },
    {
      id: `phase-2-${role.id}`,
      phaseNumber: 2,
      phaseTitle: "Phase 2: Deliberate Practice",
      title: `Practise Target Skills & Deepen Competencies`,
      description: `Advance partially developed skills to the expected ${role.title} proficiency level through focused, problem-oriented exercises.`,
      priority: partialCoreNames.length > 0 ? "high" : "medium",
      targetRole: role.title,
      skillsAddressed: practiceSkills,
      estimatedWeeks: 4,
      status: matchResult.matchScore >= 70 ? "in_progress" : "upcoming",
      progressPercentage: 0,
      actionItems: phase2Actions,
      completionCriteria: "Complete documented exercises demonstrating multi-table queries, API endpoints, or model pipelines.",
      suggestedProject: "Small modular CLI or utility tool focusing on edge-case data processing.",
      userNotes: "",
    },
    {
      id: `phase-3-${role.id}`,
      phaseNumber: 3,
      phaseTitle: "Phase 3: Capstone Engineering",
      title: `Complete Portfolio Capstone: ${targetProject.title}`,
      description: `Design and deliver an end-to-end demonstrable project: ${targetProject.description}`,
      priority: "high",
      targetRole: role.title,
      skillsAddressed: targetProject.suggestedTech,
      estimatedWeeks: 4,
      status: "upcoming",
      progressPercentage: 0,
      actionItems: phase3Actions,
      completionCriteria: "Public GitHub repository with clean commits, unit tests, and live demonstration or demo recording.",
      suggestedProject: targetProject.title,
      userNotes: "",
    },
    {
      id: `phase-4-${role.id}`,
      phaseNumber: 4,
      phaseTitle: "Phase 4: Presentation & Artifacts",
      title: `Refine Portfolio & Tailored Resume`,
      description: `Format project bullet points using Action-Problem-Tech-Impact and export an ATS-conscious resume draft.`,
      priority: "medium",
      targetRole: role.title,
      skillsAddressed: ["Technical Documentation & Collaboration", "Resume Optimization"],
      estimatedWeeks: 2,
      status: "upcoming",
      progressPercentage: 0,
      actionItems: phase4Actions,
      completionCriteria: "Updated PDF resume exported via PathPilot Resume Builder and published portfolio links.",
      suggestedProject: "Interactive Developer Portfolio / Clean GitHub Profile README.",
      userNotes: "",
    },
    {
      id: `phase-5-${role.id}`,
      phaseNumber: 5,
      phaseTitle: "Phase 5: Career Transition",
      title: `Prepare to Apply & Interview Readiness`,
      description: `Review role-specific interview problem domains, save matching opportunities, and begin submitting tailored applications.`,
      priority: "medium",
      targetRole: role.title,
      skillsAddressed: ["Interview Problem Solving", "Job Application Strategy"],
      estimatedWeeks: 3,
      status: "upcoming",
      progressPercentage: 0,
      actionItems: phase5Actions,
      completionCriteria: "At least 3 bookmarked opportunities and 1 submitted application tracked in Kanban pipeline.",
      suggestedProject: "Technical Interview Question Solution Repo.",
      userNotes: "",
    },
  ];

  return milestones;
}
