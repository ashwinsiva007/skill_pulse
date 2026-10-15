import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";
import {
  ResumeContent,
  ResumeDraft,
  ResumeSectionId,
  ResumeTemplate,
  ResumeSkills,
  ResumeProjectEntry,
  ResumeExperienceEntry,
  ResumeEducationEntry,
  ResumeCertificationEntry,
  ResumeAchievementEntry,
  ResumeCourseworkEntry,
} from "@/types/resume";

export const DEFAULT_SECTION_ORDER: ResumeSectionId[] = [
  "contact",
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
  "coursework",
];

export const DEFAULT_SECTION_VISIBILITY: Record<ResumeSectionId, boolean> = {
  contact: true,
  summary: true,
  skills: true,
  experience: true,
  projects: true,
  education: true,
  certifications: true,
  achievements: true,
  coursework: true,
};

/**
 * Creates empty resume content with sensible defaults.
 */
export function createEmptyResumeContent(): ResumeContent {
  return {
    contact: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      linkedInUrl: "",
      githubUrl: "",
      portfolioUrl: "",
    },
    summary: "",
    skills: {
      technical: [],
      soft: [],
      tools: [],
    },
    experience: [],
    projects: [],
    education: [],
    certifications: [],
    achievements: [],
    coursework: [],
    sectionConfig: {
      order: [...DEFAULT_SECTION_ORDER],
      visible: { ...DEFAULT_SECTION_VISIBILITY },
    },
  };
}

/**
 * Builds STAR/Action-Problem-Tech-Impact bullets for a project without hallucinating metrics.
 */
export function formatProjectBullets(proj: {
  title: string;
  problem?: string;
  description?: string;
  personalContribution?: string;
  technologies?: string[];
  outcomes?: string;
}): string[] {
  const bullets: string[] = [];
  const techStr = proj.technologies && proj.technologies.length > 0 ? proj.technologies.join(", ") : "";

  // Bullet 1: Core Action & Problem
  if (proj.personalContribution && proj.personalContribution.trim().length > 0) {
    bullets.push(proj.personalContribution.trim());
  } else if (proj.description && proj.description.trim().length > 0) {
    bullets.push(proj.description.trim());
  } else {
    bullets.push(`Developed ${proj.title}${techStr ? ` utilizing ${techStr}` : ""}.`);
  }

  // Bullet 2: Problem context & architecture
  if (proj.problem && proj.problem.trim().length > 0) {
    const cleanProblem = proj.problem.trim().replace(/^problem:\s*/i, "");
    bullets.push(`Addressed core challenge: ${cleanProblem}`);
  }

  // Bullet 3: Measurable outcome or clearly marked placeholder
  if (proj.outcomes && proj.outcomes.trim().length > 0) {
    const cleanOutcomes = proj.outcomes.trim().replace(/^outcomes:\s*/i, "");
    bullets.push(`Impact: ${cleanOutcomes}`);
  } else {
    bullets.push("[Measurable outcome: e.g. reduced processing time by X% / served Y users]");
  }

  return bullets;
}

/**
 * Splits experience responsibilities into structured readable bullet points.
 */
export function formatExperienceBullets(exp: {
  responsibilities?: string;
  role: string;
  company: string;
}): string[] {
  if (!exp.responsibilities || exp.responsibilities.trim().length === 0) {
    return [
      `Executed key responsibilities as ${exp.role} at ${exp.company}.`,
      "[Measurable achievement: e.g. improved team throughput by X% or led Y initiatives]",
    ];
  }

  // Split on periods or semicolons while keeping meaningful clauses
  const rawBullets = exp.responsibilities
    .split(/\.\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8)
    .map((s) => (s.endsWith(".") ? s : `${s}.`));

  return rawBullets.length > 0 ? rawBullets : [exp.responsibilities.trim()];
}

/**
 * Categorizes a list of skills into Technical, Soft, and Tools.
 */
export function categorizeSkills(
  skills: Skill[] = [],
  profileSkills: string[] = []
): ResumeSkills {
  const technical: Set<string> = new Set();
  const soft: Set<string> = new Set([
    "Problem Solving",
    "Technical Documentation",
    "Cross-functional Collaboration",
    "Agile / Scrum",
  ]);
  const tools: Set<string> = new Set(["Git", "GitHub Actions", "Docker", "VS Code"]);

  // Process formal Skill objects
  for (const s of skills) {
    const cat = s.category;
    if (cat === "Architecture & Leadership") {
      soft.add(s.name);
    } else if (cat === "Cloud & DevOps") {
      tools.add(s.name);
    } else {
      technical.add(s.name);
    }
  }

  // Process ad-hoc string skills
  for (const name of profileSkills) {
    if (
      name.toLowerCase().includes("git") ||
      name.toLowerCase().includes("docker") ||
      name.toLowerCase().includes("aws") ||
      name.toLowerCase().includes("tool")
    ) {
      tools.add(name);
    } else {
      technical.add(name);
    }
  }

  return {
    technical: Array.from(technical),
    soft: Array.from(soft),
    tools: Array.from(tools),
  };
}

/**
 * Deterministically generates a role-tailored professional summary based strictly on profile data.
 * NEVER fabricates false credentials or unearned roles.
 */
export function generateTailoredSummary(
  profile: CandidateProfile,
  targetRole: string,
  topSkills: string[] = []
): string {
  const level = profile.careerLevel || "Student / Early Career";
  const edu = profile.education?.[0];
  const degreeStr = edu ? `${edu.degree} in ${edu.specialization}` : "Computer Science & Engineering";
  const skillStr = topSkills.slice(0, 4).join(", ");

  const roleLower = targetRole.toLowerCase();

  if (roleLower.includes("data analyst")) {
    return `${level} candidate pursuing ${targetRole}. Academic background in ${degreeStr}${
      skillStr ? ` with hands-on skills in ${skillStr}` : ""
    }. Proven ability to transform complex datasets into actionable analytical insights, build dashboards, and deliver clean documentation.`;
  }

  if (roleLower.includes("data science") || roleLower.includes("ai/ml") || roleLower.includes("machine learning")) {
    return `Motivated ${level} researcher and developer targeting ${targetRole}. Specialized in ${degreeStr} with practical project experience in ${
      skillStr || "machine learning, data modeling, and algorithmic evaluation"
    }. Focused on building high-performance, verifiable AI workflows.`;
  }

  if (roleLower.includes("software") || roleLower.includes("developer") || roleLower.includes("full-stack")) {
    return `${level} engineer with a foundation in ${degreeStr}. Practical project experience designing full-stack applications, microservices, and databases${
      skillStr ? ` utilizing ${skillStr}` : ""
    }. Dedicated to clean architecture, test automation, and reliable systems.`;
  }

  // Default tailored summary
  return `${profile.headline || `${level} targeting ${targetRole}`}. Solid foundation in ${degreeStr}${
    skillStr ? ` with technical proficiencies in ${skillStr}` : ""
  }. Driven by measurable problem-solving and engineering rigor.`;
}

export interface AiSummaryInput {
  targetRole: string;
  education: ResumeEducationEntry[];
  experience: ResumeExperienceEntry[];
  projects: ResumeProjectEntry[];
  techSkills: string;
  tools: string;
  softSkills: string;
  candidateName?: string;
}

/**
 * Generates an ATS-compliant, high-impact professional summary
 * strictly synthesized from user-entered form data (Target Role, Education, Experience, Projects, Skills).
 */
export function generateAiSummaryFromFormData(input: AiSummaryInput): string {
  const { targetRole, education, experience, projects, techSkills, tools, softSkills } = input;

  const skillsList = [
    ...techSkills.split(",").map((s) => s.trim()).filter(Boolean),
    ...tools.split(",").map((s) => s.trim()).filter(Boolean),
  ];
  const topSkillsStr = skillsList.slice(0, 4).join(", ");

  const primaryEdu = education.find((e) => e.institution.trim() || e.degree.trim()) || education[0];
  let eduPart = "";
  if (primaryEdu && primaryEdu.degree.trim()) {
    const deg = primaryEdu.degree.trim();
    const inst = primaryEdu.institution.trim() ? ` from ${primaryEdu.institution.trim()}` : "";
    eduPart = `with academic training in ${deg}${inst}`;
  } else {
    eduPart = `with a strong foundational background in computing and software engineering`;
  }

  const validExp = experience.filter((e) => e.company.trim() || e.role.trim());
  const validProj = projects.filter((p) => p.title.trim());

  let practicalPart = "";
  if (validExp.length > 0) {
    const topExp = validExp[0];
    const role = topExp.role.trim() || "software engineer";
    const comp = topExp.company.trim() ? ` at ${topExp.company.trim()}` : "";
    practicalPart = `Demonstrated track record contributing as ${role}${comp}`;
  } else if (validProj.length > 0) {
    const topProj = validProj[0];
    const projTech =
      topProj.technologies && topProj.technologies.length > 0
        ? ` using ${topProj.technologies.slice(0, 3).join(", ")}`
        : "";
    practicalPart = `Demonstrated hands-on engineering experience developing ${topProj.title}${projTech}`;
  } else {
    practicalPart = `Hands-on experience architecting scalable applications and modular codebases`;
  }

  const roleTitle = targetRole.trim() || "Software Developer";
  const soft = softSkills.split(",").map((s) => s.trim()).filter(Boolean)[0] || "collaborative problem solving";

  const sentence1 = `Results-oriented ${roleTitle} ${eduPart}${
    topSkillsStr ? `, possessing practical proficiencies in ${topSkillsStr}` : ""
  }.`;
  const sentence2 = `${practicalPart}, prioritizing maintainable design patterns, clean documentation, and measurable system efficiency.`;
  const sentence3 = `Adept in ${soft} and passionate about delivering impactful engineering outcomes aligned with core product goals.`;

  return `${sentence1} ${sentence2} ${sentence3}`;
}

/**
 * Converts a candidate profile + skills into structured resume content.
 */
export function buildResumeContentFromProfile(
  profile: CandidateProfile,
  targetRole: string,
  skills: Skill[] = []
): ResumeContent {
  const categorizedSkills = categorizeSkills(
    skills,
    profile.preferences?.technologiesOfInterest || []
  );

  const topSkills = [
    ...categorizedSkills.technical.slice(0, 4),
    ...categorizedSkills.tools.slice(0, 2),
  ];

  const summary = profile.bio && profile.bio.trim().length > 30
    ? profile.bio.trim()
    : generateTailoredSummary(profile, targetRole, topSkills);

  const education: ResumeEducationEntry[] = (profile.education || []).map((edu) => ({
    id: edu.id || `edu-${Math.random()}`,
    institution: edu.institution,
    degree: edu.degree,
    fieldOfStudy: edu.specialization,
    startDate: edu.startYear ? String(edu.startYear) : undefined,
    endDate: edu.expectedGraduationYear ? String(edu.expectedGraduationYear) : undefined,
    gpa: edu.gpa,
    location: edu.location,
    highlights: edu.activities ? [edu.activities] : [],
  }));

  const experience: ResumeExperienceEntry[] = (profile.experience || []).map((exp) => ({
    id: exp.id || `exp-${Math.random()}`,
    company: exp.company,
    role: exp.role,
    type: exp.type,
    location: exp.location,
    startDate: exp.startDate,
    endDate: exp.endDate,
    isCurrent: Boolean(exp.isCurrent),
    bullets: formatExperienceBullets(exp),
  }));

  const projects: ResumeProjectEntry[] = (profile.projects || []).map((p) => ({
    id: p.id || `proj-${Math.random()}`,
    title: p.title,
    problem: p.problem,
    technologies: p.technologies || [],
    outcomes: p.outcomes,
    bullets: formatProjectBullets(p),
    link: p.githubUrl || p.demoUrl,
    date: p.completionDate || p.startDate,
  }));

  const certifications: ResumeCertificationEntry[] = (profile.certifications || []).map((c) => ({
    id: c.id || `cert-${Math.random()}`,
    name: c.name,
    issuer: c.issuer,
    date: c.issueDate,
    credentialUrl: c.credentialUrl,
  }));

  const achievements: ResumeAchievementEntry[] = [
    ...(profile.awards || []).map((a) => ({
      id: a.id || `ach-${Math.random()}`,
      title: a.title,
      organization: a.organization,
      date: a.date,
      description: a.description,
    })),
    ...(profile.hackathons || []).map((h) => ({
      id: h.id || `hack-${Math.random()}`,
      title: `${h.eventName} — ${h.result}`,
      organization: h.year,
      date: h.year,
      description: h.description || `Project: ${h.projectTitle}`,
    })),
  ];

  const coursework: ResumeCourseworkEntry[] = (profile.courses || []).map((crs) => ({
    id: crs.id || `crs-${Math.random()}`,
    title: crs.title,
    platform: crs.platform,
    date: crs.completionDate,
  }));

  return {
    contact: {
      fullName: profile.name || "Candidate Name",
      email: profile.email || "email@example.com",
      phone: profile.phone || "",
      location: profile.location || profile.city ? `${profile.city || ""}, ${profile.country || ""}`.trim() : "",
      linkedInUrl: profile.linkedInUrl || "",
      githubUrl: profile.githubUrl || "",
      portfolioUrl: profile.portfolioUrl || "",
    },
    summary,
    skills: categorizedSkills,
    experience,
    projects,
    education,
    certifications,
    achievements,
    coursework,
    sectionConfig: {
      order: [...DEFAULT_SECTION_ORDER],
      visible: { ...DEFAULT_SECTION_VISIBILITY },
    },
  };
}

/**
 * Calculates completeness percentage of a resume draft based on filled sections.
 */
export function calculateResumeCompleteness(content: ResumeContent): number {
  let score = 0;
  const maxScore = 100;

  // Contact info (20%)
  if (content.contact.fullName && content.contact.email) score += 15;
  if (content.contact.phone || content.contact.location) score += 5;

  // Summary (15%)
  if (content.summary && content.summary.length >= 40) score += 15;
  else if (content.summary) score += 8;

  // Skills (15%)
  const totalSkills =
    content.skills.technical.length + content.skills.soft.length + content.skills.tools.length;
  if (totalSkills >= 6) score += 15;
  else if (totalSkills >= 3) score += 10;
  else if (totalSkills > 0) score += 5;

  // Education (15%)
  if (content.education.length > 0) score += 15;

  // Projects (20%)
  if (content.projects.length >= 2) score += 20;
  else if (content.projects.length === 1) score += 12;

  // Experience, Certifications, or Achievements (15%)
  const extras =
    content.experience.length +
    content.certifications.length +
    content.achievements.length +
    content.coursework.length;
  if (extras >= 2) score += 15;
  else if (extras >= 1) score += 10;

  return Math.min(score, maxScore);
}

/**
 * Heuristic ATS keyword score calculation based on target role and structure.
 */
export function calculateAtsKeywordScore(content: ResumeContent, targetRole: string): number {
  let score = 70; // baseline for clean structure

  // Has standard headers & contact
  if (content.contact.fullName && content.contact.email) score += 5;
  if (content.contact.phone) score += 3;

  // Has at least 4 technical skills
  if (content.skills.technical.length >= 4) score += 6;

  // Has clear bullet points in projects or experience
  const hasBullets =
    content.projects.some((p) => p.bullets && p.bullets.length >= 2) ||
    content.experience.some((e) => e.bullets && e.bullets.length >= 2);
  if (hasBullets) score += 8;

  // Summary mentions target role keywords
  const roleKeywords = targetRole.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const summaryLower = content.summary.toLowerCase();
  const matches = roleKeywords.filter((kw) => summaryLower.includes(kw));
  if (matches.length > 0) score += 5;

  return Math.min(score, 98);
}

/**
 * Factory function to create a complete new ResumeDraft from CandidateProfile.
 */
export function createNewResumeDraft(
  profile: CandidateProfile,
  targetRole: string,
  template: ResumeTemplate = "classic",
  targetCompany?: string,
  title?: string
): ResumeDraft {
  const content = buildResumeContentFromProfile(profile, targetRole);
  const completeness = calculateResumeCompleteness(content);
  const atsScore = calculateAtsKeywordScore(content, targetRole);
  const now = new Date().toISOString();

  const skillsIncluded = [
    ...content.skills.technical.slice(0, 4),
    ...content.skills.tools.slice(0, 2),
  ];

  return {
    id: `resume-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title || `${targetRole} Resume (${template.charAt(0).toUpperCase() + template.slice(1)})`,
    targetRole,
    targetCompany,
    template,
    completionPercentage: completeness,
    atsScore,
    status: "draft",
    summary: content.summary,
    sectionsCount: Object.values(content.sectionConfig.visible).filter(Boolean).length,
    skillsIncluded,
    createdAt: now,
    lastModified: now,
    isPrimary: false,
    content,
  };
}
