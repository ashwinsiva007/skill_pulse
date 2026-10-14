import { NextResponse } from "next/server";
import { Opportunity, OpportunityType, WorkMode } from "@/types/opportunity";

interface ArbeitnowJob {
  slug: string;
  title: string;
  company_name: string;
  description: string;
  remote: boolean;
  url: string;
  tags: string[];
  job_types: string[];
  location: string;
  created_at: number;
}

interface JobicyJob {
  id: number;
  url: string;
  jobTitle: string;
  companyName: string;
  jobType: string[];
  jobGeo: string;
  jobLevel: string;
  jobExcerpt: string;
  pubDate: string;
  annualSalaryMin?: number;
  annualSalaryMax?: number;
  salaryCurrency?: string;
}

interface DevpostHackathon {
  id: number;
  title: string;
  url: string;
  displayed_location: string;
  open_state: string;
  time_left_to_submission: string;
  submission_period_dates: string;
  themes: Array<{ id: number; name: string }>;
  prize_amount: string;
  organization_name: string;
  thumbnail_url?: string;
}

// Fallback verified real internships and fellowships with authentic application URLs
const VERIFIED_REAL_INTERNSHIPS: Partial<Opportunity>[] = [
  {
    id: "intern-gsoc",
    title: "Google Summer of Code (GSoC) Contributor",
    organization: "Google Open Source",
    company: "Google Open Source",
    type: "Internship",
    domain: "Software Engineering & Open Source",
    description: "Paid global mentorship program pairing student and beginner developers with open-source mentor organizations. Contribute to real-world codebases in Python, C++, Go, Rust, TypeScript, or Java.",
    requiredSkills: ["Git & GitHub", "Python", "Problem Solving", "Open Source"],
    preferredSkills: ["Docker", "Linux", "Documentation", "Communication"],
    eligibilityRequirements: "Students and beginner open-source developers 18+ worldwide.",
    experienceLevel: "Student / Beginner (Stipend Provided)",
    location: "Global / Remote",
    workMode: "Remote",
    workplaceType: "Remote",
    postedDate: "Active Program",
    publicationDate: "2026-03-01",
    applicationUrl: "https://summerofcode.withgoogle.com/",
    sourceName: "Google Open Source",
    sourceUrl: "https://summerofcode.withgoogle.com/",
    verificationStatus: "official_verified",
    listingStatus: "open",
    salaryRange: "$1,500 – $6,600 Stipend based on location",
    isDemo: false,
  },
  {
    id: "intern-mlh-fellowship",
    title: "MLH Fellowship — Open Source & Software Engineering",
    organization: "Major League Hacking (MLH)",
    company: "Major League Hacking (MLH)",
    type: "Internship",
    domain: "Software Engineering",
    description: "12-week remote internship alternative where students contribute directly to major open-source projects used by millions of engineers, mentored by senior industry professionals.",
    requiredSkills: ["Git & GitHub", "JavaScript", "Python", "Data Structures"],
    preferredSkills: ["React", "TypeScript", "Node.js", "Docker"],
    eligibilityRequirements: "Students and recent grads with foundational coding skills.",
    experienceLevel: "Early Career / Student (Educational Stipend)",
    location: "Global / Remote",
    workMode: "Remote",
    workplaceType: "Remote",
    postedDate: "Open Cohorts",
    publicationDate: "2026-03-15",
    applicationUrl: "https://fellowship.mlh.io/",
    sourceName: "Major League Hacking",
    sourceUrl: "https://fellowship.mlh.io/",
    verificationStatus: "official_verified",
    listingStatus: "open",
    salaryRange: "$2,000 – $5,000 Educational Stipend",
    isDemo: false,
  },
  {
    id: "intern-lfx-mentorship",
    title: "Linux Foundation LFX Mentorship",
    organization: "The Linux Foundation",
    company: "The Linux Foundation",
    type: "Internship",
    domain: "Cloud Native & Systems",
    description: "Mentorship opportunity to work with Linux Foundation projects including Kubernetes, Prometheus, Envoy, and Cloud Native ecosystems with direct guidance from core maintainers.",
    requiredSkills: ["Git & GitHub", "Go", "Docker", "Linux"],
    preferredSkills: ["Kubernetes", "C++", "Rust", "Cloud Computing"],
    eligibilityRequirements: "Open to passionate developers eager to contribute to cloud native infrastructure.",
    experienceLevel: "Student / Early Career",
    location: "Worldwide / Remote",
    workMode: "Remote",
    workplaceType: "Remote",
    postedDate: "Term Open",
    publicationDate: "2026-04-01",
    applicationUrl: "https://lfx.linuxfoundation.org/tools/mentorship/",
    sourceName: "The Linux Foundation",
    sourceUrl: "https://lfx.linuxfoundation.org/tools/mentorship/",
    verificationStatus: "official_verified",
    listingStatus: "open",
    salaryRange: "$3,000 – $6,600 Full-term Stipend",
    isDemo: false,
  },
  {
    id: "intern-outreachy",
    title: "Outreachy Open Source Intern",
    organization: "Outreachy",
    company: "Outreachy",
    type: "Internship",
    domain: "Open Source & Tech Equity",
    description: "Paid, remote 3-month internships with open source and open science projects (Mozilla, Wikimedia, Fedora, Tor, Bioconda). Mentors guide you through real feature implementation.",
    requiredSkills: ["Git & GitHub", "Problem Solving", "Written Communication"],
    preferredSkills: ["Python", "JavaScript", "HTML/CSS", "Design"],
    eligibilityRequirements: "Individuals subject to systemic bias and underrepresented in tech.",
    experienceLevel: "Entry-Level / Intern",
    location: "Remote / Worldwide",
    workMode: "Remote",
    workplaceType: "Remote",
    postedDate: "Active Rounds",
    publicationDate: "2026-04-05",
    applicationUrl: "https://www.outreachy.org/",
    sourceName: "Outreachy",
    sourceUrl: "https://www.outreachy.org/",
    verificationStatus: "official_verified",
    listingStatus: "open",
    salaryRange: "$7,000 Total Stipend",
    isDemo: false,
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type"); // "Job", "Internship", "Hackathon", or null
  const query = searchParams.get("q")?.toLowerCase() || "";

  const opportunities: Opportunity[] = [];

  // 1. Fetch Real Hackathons from Devpost API
  try {
    const devpostRes = await fetch("https://devpost.com/api/hackathons?page=1", {
      headers: { "User-Agent": "SkillPulse-Aggregator/1.0" },
      next: { revalidate: 3600 },
    });

    if (devpostRes.ok) {
      const devpostData = await devpostRes.json();
      const hackathons: DevpostHackathon[] = devpostData.hackathons || [];

      for (const h of hackathons.slice(0, 12)) {
        const themes = (h.themes || []).map((t) => t.name);
        const deadlineText = h.submission_period_dates || h.time_left_to_submission || "Upcoming";
        const locString = typeof h.displayed_location === "string" ? h.displayed_location : "Online";
        const isOnline = locString.toLowerCase().includes("online");

        opportunities.push({
          id: `hack-${h.id}`,
          title: h.title,
          organization: h.organization_name || "Devpost Host",
          company: h.organization_name || "Devpost Host",
          type: "Hackathon",
          domain: themes.length > 0 ? themes.join(", ") : "Software & Innovation",
          description: `Live competitive hackathon hosted by ${h.organization_name || "Devpost"}. Focus themes: ${themes.join(", ") || "General Innovation"}. Open for builder teams and individual developers.`,
          requiredSkills: themes.length > 0 ? themes : ["Problem Solving", "Rapid Prototyping", "Git & GitHub"],
          preferredSkills: ["Full-Stack Development", "API Integration", "Pitching"],
          eligibilityRequirements: "Open to global developers, students, and engineers.",
          experienceLevel: "All Levels Welcome (Student & Professional)",
          location: locString,
          workMode: isOnline ? "Remote" : "On-site",
          workplaceType: isOnline ? "Remote" : "On-site",
          postedDate: h.time_left_to_submission ? `${h.time_left_to_submission} left` : "Open Now",
          deadline: deadlineText,
          applicationUrl: h.url,
          sourceName: "Devpost Official",
          sourceUrl: h.url,
          verificationStatus: "official_verified",
          listingStatus: "open",
          salaryRange: h.prize_amount ? `Prizes: ${h.prize_amount}` : "Prizes & Recognition",
          department: "Hackathons & Challenges",
          isDemo: false,
          matchScore: 0,
          matchedSkills: [],
          missingSkills: [],
        });
      }
    }
  } catch (err) {
    console.error("Failed to fetch Devpost hackathons:", err);
  }

  // 2. Fetch Real Tech Jobs from Arbeitnow API
  try {
    const arbeitnowRes = await fetch("https://www.arbeitnow.com/api/job-board-api", {
      headers: { "User-Agent": "SkillPulse-Aggregator/1.0" },
      cache: "no-store",
    });

    if (arbeitnowRes.ok) {
      const arbeitData = await arbeitnowRes.json();
      const rawJobs: ArbeitnowJob[] = arbeitData.data || [];

      // Filter for relevant software, data, devops, product, and AI jobs
      const techKeywords = [
        "developer", "software", "frontend", "backend", "full stack",
        "engineer", "data", "analyst", "python", "react", "ai", "machine learning",
        "cloud", "devops", "typescript", "javascript", "intern", "junior"
      ];

      const techJobs = rawJobs.filter((j) => {
        const titleLower = j.title.toLowerCase();
        const descLower = (j.description || "").toLowerCase();
        const tags = (j.tags || []).map((t) => t.toLowerCase());
        return (
          techKeywords.some((k) => titleLower.includes(k) || tags.some((t) => t.includes(k))) ||
          techKeywords.some((k) => descLower.includes(k))
        );
      });

      for (const j of techJobs.slice(0, 20)) {
        const isInternship =
          j.title.toLowerCase().includes("intern") ||
          (j.job_types || []).some((t) => t.toLowerCase().includes("intern"));

        const cleanDesc = j.description
          ? j.description.replace(/<[^>]*>?/gm, "").substring(0, 320) + "..."
          : `Active vacancy at ${j.company_name}.`;

        const workMode: WorkMode = j.remote
          ? "Remote"
          : (j.location || "").toLowerCase().includes("hybrid")
          ? "Hybrid"
          : "On-site";

        opportunities.push({
          id: `job-${j.slug || Math.random().toString(36).substring(2, 8)}`,
          title: j.title,
          organization: j.company_name,
          company: j.company_name,
          type: isInternship ? "Internship" : "Job",
          domain: "Software Engineering & Tech",
          description: cleanDesc,
          requiredSkills: j.tags && j.tags.length > 0 ? j.tags.slice(0, 6) : ["Problem Solving", "Software Engineering"],
          preferredSkills: ["Git & GitHub", "Agile / Scrum", "Teamwork"],
          eligibilityRequirements: "Relevant technical qualifications or equivalent project experience.",
          experienceLevel: isInternship ? "Intern / Student" : "Entry-Level to Mid-Level",
          location: j.location || (j.remote ? "Remote" : "Europe / Worldwide"),
          workMode,
          workplaceType: workMode,
          postedDate: "Recent Opening",
          applicationUrl: j.url,
          sourceName: "Arbeitnow Verified",
          sourceUrl: j.url,
          verificationStatus: "official_verified",
          listingStatus: "open",
          department: "Engineering & Technology",
          isDemo: false,
          matchScore: 0,
          matchedSkills: [],
          missingSkills: [],
        });
      }
    }
  } catch (err) {
    console.error("Failed to fetch Arbeitnow jobs:", err);
  }

  // 3. Fetch Remote Tech Jobs from Jobicy API
  try {
    const jobicyRes = await fetch("https://jobicy.com/api/v2/remote-jobs?count=15", {
      headers: { "User-Agent": "SkillPulse-Aggregator/1.0" },
      next: { revalidate: 3600 },
    });

    if (jobicyRes.ok) {
      const jobicyData = await jobicyRes.json();
      const rawJobs: JobicyJob[] = jobicyData.jobs || [];

      for (const j of rawJobs.slice(0, 10)) {
        const isInternship =
          j.jobTitle.toLowerCase().includes("intern") ||
          (j.jobType || []).some((t) => t.toLowerCase().includes("intern"));

        const cleanDesc = j.jobExcerpt
          ? j.jobExcerpt.replace(/<[^>]*>?/gm, "").substring(0, 320) + "..."
          : `Active remote position at ${j.companyName}.`;

        const salary =
          j.annualSalaryMin && j.annualSalaryMax
            ? `${j.salaryCurrency || "$"} ${j.annualSalaryMin.toLocaleString()} – ${j.annualSalaryMax.toLocaleString()} / yr`
            : undefined;

        opportunities.push({
          id: `jobicy-${j.id}`,
          title: j.jobTitle,
          organization: j.companyName,
          company: j.companyName,
          type: isInternship ? "Internship" : "Job",
          domain: "Engineering & Digital",
          description: cleanDesc,
          requiredSkills: ["Remote Collaboration", "Software Engineering", "Communication"],
          preferredSkills: ["Problem Solving", "Git & GitHub"],
          eligibilityRequirements: "Must meet remote location eligibility requirements.",
          experienceLevel: j.jobLevel || "Entry to Mid-Level",
          location: j.jobGeo || "Worldwide / Remote",
          workMode: "Remote",
          workplaceType: "Remote",
          postedDate: "Active Vacancy",
          applicationUrl: j.url,
          sourceName: "Jobicy Remote Verified",
          sourceUrl: j.url,
          verificationStatus: "official_verified",
          listingStatus: "open",
          salaryRange: salary,
          department: "Product & Engineering",
          isDemo: false,
          matchScore: 0,
          matchedSkills: [],
          missingSkills: [],
        });
      }
    }
  } catch (err) {
    console.error("Failed to fetch Jobicy jobs:", err);
  }

  // 4. Add Verified Open Internships
  for (const intern of VERIFIED_REAL_INTERNSHIPS) {
    opportunities.push({
      id: intern.id!,
      title: intern.title!,
      organization: intern.organization!,
      company: intern.company!,
      type: intern.type as OpportunityType,
      domain: intern.domain!,
      description: intern.description!,
      requiredSkills: intern.requiredSkills || [],
      preferredSkills: intern.preferredSkills || [],
      eligibilityRequirements: intern.eligibilityRequirements || "Open application",
      experienceLevel: intern.experienceLevel || "Student / Intern",
      location: intern.location || "Remote",
      workMode: intern.workMode || "Remote",
      workplaceType: intern.workplaceType || "Remote",
      postedDate: intern.postedDate || "Open Now",
      publicationDate: intern.publicationDate,
      applicationUrl: intern.applicationUrl,
      sourceName: intern.sourceName || "Official Program",
      sourceUrl: intern.sourceUrl,
      verificationStatus: intern.verificationStatus || "official_verified",
      listingStatus: intern.listingStatus || "open",
      salaryRange: intern.salaryRange,
      department: "Open Opportunities",
      isDemo: false,
      matchScore: 0,
      matchedSkills: [],
      missingSkills: [],
    });
  }

  // Apply filters
  let filtered = opportunities;

  if (typeFilter && typeFilter !== "all") {
    filtered = filtered.filter(
      (o) => o.type.toLowerCase() === typeFilter.toLowerCase()
    );
  }

  if (query) {
    filtered = filtered.filter((o) => {
      const matchTitle = o.title.toLowerCase().includes(query);
      const matchOrg = o.organization.toLowerCase().includes(query);
      const matchDesc = o.description.toLowerCase().includes(query);
      const matchSkills = (o.requiredSkills || []).some((s) =>
        s.toLowerCase().includes(query)
      );
      return matchTitle || matchOrg || matchDesc || matchSkills;
    });
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    opportunities: filtered,
    meta: {
      sources: ["Devpost Hackathons", "Arbeitnow Job Board", "Jobicy Remote", "Verified Tech Internships"],
      lastUpdated: new Date().toISOString(),
    },
  });
}
