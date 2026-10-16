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
} from "./base-provider";

interface AdzunaJobResult {
  id: string;
  title: string;
  company?: { display_name?: string };
  location?: { display_name?: string; area?: string[] };
  description?: string;
  created?: string;
  redirect_url?: string;
  salary_min?: number;
  salary_max?: number;
  category?: { label?: string; tag?: string };
}

interface AdzunaSearchResponse {
  results: AdzunaJobResult[];
  count?: number;
}

export class AdzunaProviderAdapter implements IJobProviderAdapter {
  readonly providerId = "adzuna";
  readonly providerName = "Adzuna India Job Search API";
  readonly supportsIndia = true;

  private appId?: string;
  private appKey?: string;
  private lastAttemptedSync?: string;
  private lastSuccessfulSync?: string;
  private lastCount = 0;
  private lastError?: string;

  constructor() {
    this.appId = process.env.ADZUNA_APP_ID;
    this.appKey = process.env.ADZUNA_APP_KEY;
  }

  get isConfigured(): boolean {
    return Boolean(this.appId && this.appKey && this.appId.trim() && this.appKey.trim());
  }

  async getStatus(): Promise<ProviderHealthStatus> {
    if (!this.isConfigured) {
      return {
        providerId: this.providerId,
        providerName: this.providerName,
        status: "NOT_CONFIGURED",
        supportsIndia: true,
        isConfigured: false,
        resultsCount: 0,
        errorDetails: "Server credentials missing: Add ADZUNA_APP_ID and ADZUNA_APP_KEY to .env.local to enable real-time Adzuna live queries.",
        attributionRequirement: "Jobs by Adzuna (attribution required upon activation)",
      };
    }

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
      attributionRequirement: "Jobs by Adzuna",
    };
  }

  async fetchOpportunities(options?: ProviderQueryOptions): Promise<ProviderFetchResult> {
    this.lastAttemptedSync = new Date().toISOString();

    // Explicit check: If credentials missing, return 0 fabricated records and report NOT_CONFIGURED status
    if (!this.isConfigured) {
      return {
        opportunities: [],
        status: await this.getStatus(),
      };
    }

    const opportunities: Opportunity[] = [];
    const page = 1;
    const query = options?.query || "software engineer";
    const location = options?.location || "India";

    try {
      const endpoint = `https://api.adzuna.com/v1/api/jobs/in/search/${page}?app_id=${encodeURIComponent(
        this.appId!
      )}&app_key=${encodeURIComponent(
        this.appKey!
      )}&results_per_page=20&what=${encodeURIComponent(query)}&where=${encodeURIComponent(location)}`;

      const res = await fetch(endpoint, {
        signal: AbortSignal.timeout(7000),
        headers: { Accept: "application/json" },
        next: { revalidate: 1800 },
      });

      if (!res.ok) {
        if (res.status === 429) {
          this.lastError = "Adzuna API rate limit reached. Backing off temporarily.";
          return {
            opportunities: [],
            status: {
              ...(await this.getStatus()),
              status: "RATE_LIMITED",
              errorDetails: this.lastError,
            },
          };
        }
        throw new Error(`Adzuna API responded with HTTP status ${res.status}`);
      }

      const data: AdzunaSearchResponse = await res.json();
      if (data.results && Array.isArray(data.results)) {
        for (const item of data.results) {
          const rawDesc = cleanHtml(item.description || "");
          const locName = item.location?.display_name || "India";
          const workMode = detectWorkMode(rawDesc, locName);
          const region = detectRegion(locName);
          const { requiredSkills, preferredSkills } = extractSkillsFromText(`${item.title} ${rawDesc}`);
          const { postedDate, freshnessLabel } = formatPublicationFreshness(item.created);

          // Format compensation if provided
          let salaryRange: string | undefined;
          if (item.salary_min && item.salary_max) {
            salaryRange = `₹${(item.salary_min / 100000).toFixed(1)} - ${(item.salary_max / 100000).toFixed(1)} LPA`;
          } else if (item.salary_min) {
            salaryRange = `From ₹${(item.salary_min / 100000).toFixed(1)} LPA`;
          }

          const titleLower = item.title.toLowerCase();
          const type: OpportunityType =
            titleLower.includes("intern") || titleLower.includes("internship") ? "Internship" : "Job";

          const orgName = item.company?.display_name || "Verified Enterprise";

          const opp: Opportunity = {
            id: `adzuna-${item.id}`,
            providerId: this.providerId,
            providerJobId: item.id,
            sourceMode: "LIVE",
            title: item.title,
            organization: orgName,
            company: orgName,
            type,
            domain: item.category?.label || "Software Engineering",
            description: rawDesc ? rawDesc.slice(0, 420) + (rawDesc.length > 420 ? "..." : "") : "Vacancy indexed via Adzuna",
            requiredSkills,
            preferredSkills,
            eligibilityRequirements: "Relevant degree or demonstrated competency in specified technical stack.",
            experienceLevel: type === "Internship" ? "College Student / Intern" : "Entry / Mid Level",
            location: locName,
            workMode,
            workplaceType: workMode,
            region,
            portal: "Adzuna",
            applicationUrl: item.redirect_url || "https://www.adzuna.in",
            sourceName: "Adzuna India Job Search",
            sourceUrl: item.redirect_url,
            publicationDate: item.created,
            postedDate,
            salaryRange,
            verificationStatus: "official_verified",
            listingStatus: "open",
            freshnessLabel,
            isDemo: false,
            lastFetchedAt: new Date().toISOString(),
            firstSeen: item.created || new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            providerAttribution: "Jobs by Adzuna (api.adzuna.com)",
            department: item.category?.label || "Technology",
            matchScore: 0,
            matchedSkills: [],
            missingSkills: [],
          };

          opportunities.push(opp);
        }
      }

      this.lastSuccessfulSync = new Date().toISOString();
      this.lastCount = opportunities.length;
      this.lastError = undefined;
    } catch (err: any) {
      this.lastError = err?.message || "Failed to query Adzuna endpoint";
      console.warn("[AdzunaProvider] Fetch error:", err);
    }

    return {
      opportunities,
      status: await this.getStatus(),
    };
  }
}
