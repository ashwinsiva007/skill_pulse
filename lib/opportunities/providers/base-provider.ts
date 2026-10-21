import {
  Opportunity,
  ProviderHealthStatus,
  WorkMode,
  OpportunityRegion,
  FreshnessLabel,
} from "@/types/opportunity";

export interface ProviderQueryOptions {
  query?: string;
  location?: string;
  limit?: number;
  includeRemote?: boolean;
}

export interface ProviderFetchResult {
  opportunities: Opportunity[];
  status: ProviderHealthStatus;
}

export interface IJobProviderAdapter {
  readonly providerId: string;
  readonly providerName: string;
  readonly supportsIndia: boolean;
  getStatus(): Promise<ProviderHealthStatus>;
  fetchOpportunities(options?: ProviderQueryOptions): Promise<ProviderFetchResult>;
}

/**
 * Common list of Tamil Nadu tech hubs and industrial cities
 */
export const TAMIL_NADU_CITIES = [
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Trichy",
  "Salem",
  "Hosur",
  "Tiruppur",
  "Erode",
  "Vellore",
  "Thoothukudi",
  "Nagercoil",
  "Tirunelveli",
  "Kanchipuram",
];

/**
 * Common Indian tech hubs
 */
export const INDIA_TECH_HUBS = [
  ...TAMIL_NADU_CITIES,
  "Bengaluru",
  "Bangalore",
  "Hyderabad",
  "Pune",
  "Mumbai",
  "Gurugram",
  "Gurgaon",
  "Noida",
  "Delhi",
  "New Delhi",
  "Kolkata",
  "Kochi",
  "Trivandrum",
  "Thiruvananthapuram",
  "Ahmedabad",
  "Jaipur",
  "Chandigarh",
];

/**
 * Strips HTML tags and entities cleanly
 */
export function cleanHtml(rawHtml: string): string {
  if (!rawHtml) return "";
  let text = rawHtml;
  // Step 1: Decode entities that might be hiding HTML tags (e.g., &lt;h2&gt;)
  text = text
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&amp;/gi, "&");

  // Step 2: Strip style and script elements
  text = text
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");

  // Step 3: Strip all HTML tags
  text = text.replace(/<[^>]+>/g, " ");

  // Step 4: Decode any remaining common HTML entities
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&#x27;/gi, "'")
    .replace(/&rsquo;/gi, "'")
    .replace(/&lsquo;/gi, "'")
    .replace(/&ldquo;/gi, '"')
    .replace(/&rdquo;/gi, '"')
    .replace(/&ndash;/gi, "-")
    .replace(/&mdash;/gi, "-")
    .replace(/&hellip;/gi, "...")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)));

  return text.replace(/\s+/g, " ").trim();
}

/**
 * Detects workplace mode from text and location strings
 */
export function detectWorkMode(text: string, locationStr: string): WorkMode {
  const combined = `${text} ${locationStr}`.toLowerCase();
  if (combined.includes("remote") || combined.includes("work from home") || combined.includes("wfh") || combined.includes("anywhere")) {
    return "Remote";
  }
  if (combined.includes("hybrid") || combined.includes("flexible")) {
    return "Hybrid";
  }
  return "On-site";
}

/**
 * Detects if a location is in Tamil Nadu, or another region of India
 */
export function detectRegion(locationStr: string): OpportunityRegion {
  const locLower = locationStr.toLowerCase();

  // Check Tamil Nadu / South India
  const isTN = TAMIL_NADU_CITIES.some((c) => locLower.includes(c.toLowerCase()));
  if (
    isTN ||
    locLower.includes("tamil nadu") ||
    locLower.includes("bengaluru") ||
    locLower.includes("bangalore") ||
    locLower.includes("hyderabad") ||
    locLower.includes("karnataka") ||
    locLower.includes("kerala") ||
    locLower.includes("telangana") ||
    locLower.includes("andhra")
  ) {
    return "South India";
  }

  // North India
  if (
    locLower.includes("delhi") ||
    locLower.includes("gurgaon") ||
    locLower.includes("gurugram") ||
    locLower.includes("noida") ||
    locLower.includes("haryana") ||
    locLower.includes("uttar pradesh") ||
    locLower.includes("punjab")
  ) {
    return "North India";
  }

  // West India
  if (
    locLower.includes("mumbai") ||
    locLower.includes("pune") ||
    locLower.includes("maharashtra") ||
    locLower.includes("gujarat") ||
    locLower.includes("ahmedabad")
  ) {
    return "West India";
  }

  if (locLower.includes("remote")) {
    return "Pan-India Remote";
  }

  return "All India";
}

/**
 * Extracts matched skills from job description text
 */
const COMMON_TECH_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "JavaScript",
  "Node.js",
  "Python",
  "Java",
  "C++",
  "Go",
  "Golang",
  "Rust",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "GCP",
  "Git",
  "GitHub",
  "GraphQL",
  "REST APIs",
  "Tailwind CSS",
  "HTML5",
  "CSS3",
  "Linux",
  "FastAPI",
  "Django",
  "Spring Boot",
  "Machine Learning",
  "Data Structures",
  "Algorithms",
  "Problem Solving",
  "Figma",
  "CI/CD",
];

export function extractSkillsFromText(text: string): { requiredSkills: string[]; preferredSkills: string[] } {
  const textLower = ` ${text.toLowerCase()} `;
  const found: string[] = [];

  for (const skill of COMMON_TECH_SKILLS) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(textLower)) {
      found.push(skill);
    }
  }

  if (found.length === 0) {
    return {
      requiredSkills: ["Problem Solving", "Computer Science Fundamentals"],
      preferredSkills: ["Git", "REST APIs"],
    };
  }

  const splitIdx = Math.min(Math.ceil(found.length * 0.65), 5);
  return {
    requiredSkills: found.slice(0, splitIdx),
    preferredSkills: found.slice(splitIdx, splitIdx + 4),
  };
}

/**
 * Generates human friendly relative date and freshness label
 */
export function formatPublicationFreshness(publishedAt?: string): { postedDate: string; freshnessLabel: FreshnessLabel } {
  if (!publishedAt) {
    return { postedDate: "Recently verified", freshnessLabel: "SOURCE_CONFIRMED" };
  }

  const pubDate = new Date(publishedAt);
  if (isNaN(pubDate.getTime())) {
    return { postedDate: "Recent listing", freshnessLabel: "SOURCE_CONFIRMED" };
  }

  const now = new Date();
  const diffDays = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 2) {
    return { postedDate: diffDays === 0 ? "Today" : `${diffDays} day${diffDays > 1 ? "s" : ""} ago`, freshnessLabel: "RECENTLY_POSTED" };
  } else if (diffDays <= 14) {
    return { postedDate: `${diffDays} days ago`, freshnessLabel: "SOURCE_CONFIRMED" };
  } else if (diffDays <= 45) {
    return { postedDate: `${Math.floor(diffDays / 7)} weeks ago`, freshnessLabel: "SOURCE_CONFIRMED" };
  } else {
    return { postedDate: `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`, freshnessLabel: "STALE" };
  }
}
