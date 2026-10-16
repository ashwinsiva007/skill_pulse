import {
  Opportunity,
  ProviderHealthStatus,
  OpportunityType,
} from "@/types/opportunity";
import {
  IJobProviderAdapter,
  ProviderFetchResult,
  ProviderQueryOptions,
  cleanHtml,
  detectWorkMode,
  detectRegion,
  extractSkillsFromText,
  formatPublicationFreshness,
  INDIA_TECH_HUBS,
  TAMIL_NADU_CITIES,
} from "./base-provider";

interface GreenhouseJob {
  id: number;
  title: string;
  absolute_url: string;
  location?: { name: string };
  updated_at?: string;
  content?: string;
  departments?: Array<{ id: number; name: string }>;
  offices?: Array<{ id: number; name: string; location: string }>;
}

interface GreenhouseBoardResponse {
  jobs: GreenhouseJob[];
}

/**
 * Verified list of tech companies on Greenhouse with India offices or hiring
 */
const GREENHOUSE_EMPLOYER_BOARDS = [
  { token: "postman", name: "Postman" },
  { token: "cloudflare", name: "Cloudflare" },
  { token: "stripe", name: "Stripe" },
  { token: "mongodb", name: "MongoDB" },
  { token: "canonical", name: "Canonical" },
  { token: "elastic", name: "Elastic" },
  { token: "github", name: "GitHub" },
  { token: "figma", name: "Figma" },
];

export class GreenhouseProviderAdapter implements IJobProviderAdapter {
  readonly providerId = "greenhouse";
  readonly providerName = "Greenhouse Employer Boards";
  readonly supportsIndia = true;

  private lastAttemptedSync?: string;
  private lastSuccessfulSync?: string;
  private lastCount = 0;
  private lastError?: string;

  async getStatus(): Promise<ProviderHealthStatus> {
    return {
      providerId: this.providerId,
      providerName: this.providerName,
      status: this.lastError ? "ERROR" : "ACTIVE",
      supportsIndia: true,
      isConfigured: true,
      lastAttemptedSync: this.lastAttemptedSync,
      lastSuccessfulSync: this.lastSuccessfulSync,
      resultsCount: this.lastCount,
      errorDetails: this.lastError,
      configuredBoardsCount: GREENHOUSE_EMPLOYER_BOARDS.length,
      attributionRequirement: "Direct listings retrieved via official Greenhouse API",
    };
  }

  async fetchOpportunities(options?: ProviderQueryOptions): Promise<ProviderFetchResult> {
    this.lastAttemptedSync = new Date().toISOString();
    const opportunities: Opportunity[] = [];
    const limit = options?.limit || 40;

    for (const board of GREENHOUSE_EMPLOYER_BOARDS) {
      if (opportunities.length >= limit) break;

      try {
        const url = `https://boards-api.greenhouse.io/v1/boards/${board.token}/jobs?content=true`;
        const res = await fetch(url, {
          signal: AbortSignal.timeout(6000),
          headers: { Accept: "application/json" },
          next: { revalidate: 3600 }, // Next.js cache 1 hour
        });

        if (!res.ok) {
          continue;
        }

        const data: GreenhouseBoardResponse = await res.json();
        if (!data.jobs || !Array.isArray(data.jobs)) continue;

        for (const job of data.jobs) {
          const locName = job.location?.name || "";
          const locLower = locName.toLowerCase();

          // Check if this position is in India, a Tamil Nadu city, or Remote
          const isIndiaMatch =
            locLower.includes("india") ||
            locLower.includes("bengaluru") ||
            locLower.includes("bangalore") ||
            locLower.includes("chennai") ||
            locLower.includes("hyderabad") ||
            locLower.includes("pune") ||
            locLower.includes("mumbai") ||
            locLower.includes("delhi") ||
            locLower.includes("gurgaon") ||
            locLower.includes("noida") ||
            TAMIL_NADU_CITIES.some((c) => locLower.includes(c.toLowerCase())) ||
            (locLower.includes("remote") && (locLower.includes("apac") || locLower.includes("asia") || !locLower.includes("us")));

          if (!isIndiaMatch) continue;

          // Keyword filter if provided
          if (options?.query) {
            const q = options.query.toLowerCase();
            const titleMatch = job.title.toLowerCase().includes(q);
            const deptMatch = (job.departments || []).some((d) => d.name.toLowerCase().includes(q));
            if (!titleMatch && !deptMatch) continue;
          }

          const rawDesc = cleanHtml(job.content || "");
          const workMode = detectWorkMode(rawDesc, locName);
          const region = detectRegion(locName);
          const { requiredSkills, preferredSkills } = extractSkillsFromText(`${job.title} ${rawDesc}`);
          const { postedDate, freshnessLabel } = formatPublicationFreshness(job.updated_at);

          // Determine opportunity type
          const titleLower = job.title.toLowerCase();
          const type: OpportunityType =
            titleLower.includes("intern") || titleLower.includes("internship") || titleLower.includes("co-op")
              ? "Internship"
              : "Job";

          const department = job.departments?.[0]?.name || "Engineering";

          const opp: Opportunity = {
            id: `gh-${board.token}-${job.id}`,
            providerId: this.providerId,
            providerJobId: String(job.id),
            sourceMode: "LIVE",
            title: job.title,
            organization: board.name,
            company: board.name,
            type,
            domain: department.includes("Design") ? "Product & Design" : department.includes("Data") ? "Data & Analytics" : "Software Engineering",
            description: rawDesc ? rawDesc.slice(0, 420) + (rawDesc.length > 420 ? "..." : "") : "Published vacancy at " + board.name,
            requiredSkills,
            preferredSkills,
            eligibilityRequirements: "Engineering, Computer Science, or quantitative background with relevant tech stack skills.",
            experienceLevel: type === "Internship" ? "College Student / Intern" : titleLower.includes("senior") || titleLower.includes("lead") ? "Senior (5+ years)" : "Entry / Early Career (0–3 years)",
            location: locName || "India (Remote / Hybrid)",
            workMode,
            workplaceType: workMode,
            region,
            portal: "Greenhouse",
            applicationUrl: job.absolute_url,
            sourceName: `${board.name} (Official Careers via Greenhouse)`,
            sourceUrl: job.absolute_url,
            publicationDate: job.updated_at,
            postedDate,
            verificationStatus: "official_verified",
            listingStatus: "open",
            freshnessLabel,
            isDemo: false,
            lastFetchedAt: new Date().toISOString(),
            firstSeen: job.updated_at || new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            providerAttribution: "Direct employer board via Greenhouse Public API",
            department,
            matchScore: 0,
            matchedSkills: [],
            missingSkills: [],
          };

          opportunities.push(opp);
          if (opportunities.length >= limit) break;
        }
      } catch (err) {
        console.warn(`[GreenhouseProvider] Board fetch failed for ${board.token}:`, err);
      }
    }

    this.lastSuccessfulSync = new Date().toISOString();
    this.lastCount = opportunities.length;
    this.lastError = undefined;

    return {
      opportunities,
      status: await this.getStatus(),
    };
  }
}
