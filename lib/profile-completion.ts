import { CandidateProfile } from "@/types/profile";
import { Skill } from "@/types/skill";

export interface CriterionItem {
  id: string;
  category: string;
  name: string;
  points: number;
  maxPoints: number;
  isMet: boolean;
  tip: string;
}

export interface ProfileCompletionResult {
  percentage: number;
  totalPoints: number;
  maxPoints: number;
  items: CriterionItem[];
  missingCount: number;
  nextBestAction: string;
}

export function calculateProfileCompletion(
  profile: Partial<CandidateProfile>,
  skills: Skill[] = []
): ProfileCompletionResult {
  const items: CriterionItem[] = [];

  // 1. Personal & Contact (20 points total)
  const hasName = Boolean(profile.name && profile.name.trim().length > 1);
  items.push({
    id: "personal-name",
    category: "Personal Details",
    name: "Full Name",
    points: hasName ? 5 : 0,
    maxPoints: 5,
    isMet: hasName,
    tip: "Add your full name in personal details.",
  });

  const hasHeadline = Boolean(profile.headline && profile.headline.trim().length > 3);
  items.push({
    id: "personal-headline",
    category: "Personal Details",
    name: "Professional Headline",
    points: hasHeadline ? 5 : 0,
    maxPoints: 5,
    isMet: hasHeadline,
    tip: "Highlight your current focus (e.g., 'CS Senior & Full-Stack AI Developer').",
  });

  const hasBio = Boolean(profile.bio && profile.bio.trim().length >= 20);
  items.push({
    id: "personal-bio",
    category: "Personal Details",
    name: "Professional Biography (20+ chars)",
    points: hasBio ? 5 : 0,
    maxPoints: 5,
    isMet: hasBio,
    tip: "Write a brief summary of your background, interests, and aspirations.",
  });

  const hasLocation = Boolean(
    (profile.location && profile.location.trim().length > 2) ||
    (profile.city && profile.city.trim().length > 1)
  );
  items.push({
    id: "personal-location",
    category: "Personal Details",
    name: "Location / City",
    points: hasLocation ? 3 : 0,
    maxPoints: 3,
    isMet: hasLocation,
    tip: "Specify your city, state, or preferred home location.",
  });

  const hasLinkedIn = Boolean(profile.linkedInUrl && profile.linkedInUrl.trim().length > 3);
  items.push({
    id: "personal-linkedin",
    category: "Personal Details",
    name: "LinkedIn Profile (Mandatory)",
    points: hasLinkedIn ? 2 : 0,
    maxPoints: 2,
    isMet: hasLinkedIn,
    tip: "Add your LinkedIn profile URL (mandatory for complete candidate profile).",
  });

  const hasCodingProfiles = Boolean(profile.githubUrl || profile.leetcodeUrl);
  items.push({
    id: "personal-coding-profiles",
    category: "Personal Details",
    name: "GitHub / LeetCode (Recommended)",
    points: hasCodingProfiles ? 2 : 0,
    maxPoints: 2,
    isMet: hasCodingProfiles,
    tip: "Add your GitHub and LeetCode profiles to analyze your coding activity and problem solving.",
  });

  // 2. Education (15 points total)
  const eduCount = profile.education?.length || 0;
  const hasEducation = eduCount > 0;
  items.push({
    id: "education",
    category: "Education",
    name: "Academic Background",
    points: hasEducation ? 15 : 0,
    maxPoints: 15,
    isMet: hasEducation,
    tip: "Add your degree, university, semester, or major.",
  });

  // 3. Skills (20 points total)
  const skillsCount = skills.length;
  let skillsPoints = 0;
  if (skillsCount >= 5) {
    skillsPoints = 20;
  } else if (skillsCount >= 3) {
    skillsPoints = 15;
  } else if (skillsCount >= 1) {
    skillsPoints = 10;
  }
  items.push({
    id: "skills",
    category: "Skills",
    name: "Recorded Technical Skills (min 5 for full score)",
    points: skillsPoints,
    maxPoints: 20,
    isMet: skillsCount >= 3,
    tip: "Record at least 3 to 5 core technical or soft skills with proficiency.",
  });

  // 4. Career Preferences (15 points total)
  const prefs = profile.preferences;
  const hasTargetRoles = Boolean(
    (prefs?.targetJobRoles && prefs.targetJobRoles.length > 0) ||
    Boolean(profile.targetRole && profile.targetRole.trim().length > 2)
  );
  items.push({
    id: "preferences-roles",
    category: "Career Preferences",
    name: "Target Job Roles",
    points: hasTargetRoles ? 5 : 0,
    maxPoints: 5,
    isMet: hasTargetRoles,
    tip: "Select 1 or more target roles you are pursuing.",
  });

  const hasOpportunityTypes = Boolean(
    prefs?.opportunityTypes && prefs.opportunityTypes.length > 0
  );
  items.push({
    id: "preferences-types",
    category: "Career Preferences",
    name: "Opportunity Types & Availability",
    points: hasOpportunityTypes ? 5 : 0,
    maxPoints: 5,
    isMet: hasOpportunityTypes,
    tip: "Select whether you seek full-time jobs, internships, or hackathons.",
  });

  const hasDomainsOrLocations = Boolean(
    (prefs?.preferredDomains && prefs.preferredDomains.length > 0) ||
    (prefs?.preferredLocations && prefs.preferredLocations.length > 0) ||
    prefs?.workplacePreference
  );
  items.push({
    id: "preferences-domains",
    category: "Career Preferences",
    name: "Workplace & Industry Domains",
    points: hasDomainsOrLocations ? 5 : 0,
    maxPoints: 5,
    isMet: hasDomainsOrLocations,
    tip: "Indicate remote/hybrid preferences and domains of interest.",
  });

  // 5. Projects (15 points total)
  const projectsCount = profile.projects?.length || 0;
  let projectPoints = 0;
  if (projectsCount >= 2) {
    projectPoints = 15;
  } else if (projectsCount === 1) {
    projectPoints = 10;
  }
  items.push({
    id: "projects",
    category: "Projects",
    name: "Portfolio Projects (min 1-2)",
    points: projectPoints,
    maxPoints: 15,
    isMet: projectsCount >= 1,
    tip: "Highlight at least 1 project showing problem solved, tech stack, and GitHub link.",
  });

  // 6. Experience & Achievements (15 points total)
  const expCount = (profile.experience?.length || 0) +
    (profile.certifications?.length || 0) +
    (profile.courses?.length || 0) +
    (profile.hackathons?.length || 0) +
    (profile.awards?.length || 0) +
    (profile.leadership?.length || 0);

  let expPoints = 0;
  if (expCount >= 2) {
    expPoints = 15;
  } else if (expCount >= 1) {
    expPoints = 10;
  }
  items.push({
    id: "experience-achievements",
    category: "Experience & Achievements",
    name: "Internship, Certifications, or Hackathons",
    points: expPoints,
    maxPoints: 15,
    isMet: expCount >= 1,
    tip: "Add any work, internships, online certifications, courses, or hackathons.",
  });

  const totalPoints = items.reduce((sum, item) => sum + item.points, 0);
  const maxPoints = items.reduce((sum, item) => sum + item.maxPoints, 0);
  const percentage = Math.min(Math.round((totalPoints / maxPoints) * 100), 100);
  const missingItems = items.filter((i) => !i.isMet);

  let nextBestAction = "Profile is comprehensive and optimized for AI navigation!";
  if (missingItems.length > 0) {
    nextBestAction = missingItems[0].tip;
  }

  return {
    percentage,
    totalPoints,
    maxPoints,
    items,
    missingCount: missingItems.length,
    nextBestAction,
  };
}
