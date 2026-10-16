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
  TAMIL_NADU_CITIES,
} from "./base-provider";

interface LeverPosting {
  id: string;
  text: string;
  hostedUrl: string;
  applyUrl: string;
  createdAt?: number;
  categories?: {
    commitment?: string;
    department?: string;
    location?: string;
    team?: string;
  };
  descriptionPlain?: string;
  additionalPlain?: string;
}

const LEVER_EMPLOYER_BOARDS = [
  { company: "razorpay", name: "Razorpay" },
  { company: "paytm", name: "Paytm" },
  { company: "clevertap", name: "CleverTap" },
  { company: "browserstack", name: "BrowserStack" },
  { company: "atlassian", name: "Atlassian" },
  { company: "atlan", name: "Atlan" },
  { company: "inmobi", name: "InMobi" },
];

export class LeverProviderAdapter implements IJobProviderAdapter {
  readonly providerId = "lever";
  readonly providerName = "Lever Employer Boards";
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
      configuredBoardsCount: LEVER_EMPLOYER_BOARDS.length,
      attributionRequirement: "Direct listings retrieved via official Lever Postings API",
    };
  }

  async fetchOpportunities(options?: ProviderQueryOptions): Promise<ProviderFetchResult> {
    this.lastAttemptedSync = new Date().toISOString();
    const opportunities: Opportunity[] = [];
    const limit = options?.limit || 40;

    for (const board of LEVER_EMPLOYER_BOARDS) {
      if (opportunities.length >= limit) break;

      try {
        const url = `https://api.lever.co/v0/postings/${board.company}?mode=json`;
        const res = await fetch(url, {
          signal: AbortSignal.timeout(6000),
          headers: { Accept: "application/json" },
          next: { revalidate: 3600 },
        });

        if (!res.ok) {
          continue;
        }

        const postings: LeverPosting[] = await res.json();
        if (!Array.isArray(postings)) continue;

        for (const post of postings) {
          const locName = post.categories?.location || "";
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
            const titleMatch = post.text.toLowerCase().includes(q);
            const teamMatch = post.categories?.team?.toLowerCase().includes(q);
            if (!titleMatch && !teamMatch) continue;
          }

          const rawDesc = post.descriptionPlain || "";
          const additional = post.additionalPlain || "";
          const combinedText = `${post.text} ${rawDesc} ${additional}`;
          const workMode = detectWorkMode(combinedText, locName);
          const region = detectRegion(locName);
          const { requiredSkills, preferredSkills } = extractSkillsFromText(combinedText);

          const isoDate = post.createdAt ? new Date(post.createdAt).toISOString() : undefined;
          const { postedDate, freshnessLabel } = formatPublicationFreshness(isoDate);

          const titleLower = post.text.toLowerCase();
          const type: OpportunityType =
            titleLower.includes("intern") || titleLower.includes("internship") || post.categories?.commitment?.toLowerCase().includes("intern")
              ? "Internship"
              : "Job";

          const department = post.categories?.department || post.categories?.team || "Engineering";

          const opp: Opportunity = {
            id: `lever-${board.company}-${post.id}`,
            providerId: this.providerId,
            providerJobId: post.id,
            sourceMode: "LIVE",
            title: post.text,
            organization: board.name,
            company: board.name,
            type,
            domain: department.includes("Design") ? "Product & Design" : department.includes("Data") ? "Data & Analytics" : "Software Engineering",
            description: rawDesc ? rawDesc.slice(0, 420) + (rawDesc.length > 420 ? "..." : "") : "Active position at " + board.name,
            requiredSkills,
            preferredSkills,
            eligibilityRequirements: "Engineering degree or equivalent demonstrable coding and problem-solving skills.",
            experienceLevel: type === "Internship" ? "College Student / Intern" : titleLower.includes("senior") || titleLower.includes("lead") ? "Senior (5+ years)" : "Freshers & Early Career (0–3 years)",
            location: locName || "India (Hybrid / Remote)",
            workMode,
            workplaceType: workMode,
            region,
            portal: "Lever",
            applicationUrl: post.hostedUrl || post.applyUrl,
            sourceName: `${board.name} (Official Careers via Lever)`,
            sourceUrl: post.hostedUrl,
            publicationDate: isoDate,
            postedDate,
            verificationStatus: "official_verified",
            listingStatus: "open",
            freshnessLabel,
            isDemo: false,
            lastFetchedAt: new Date().toISOString(),
            firstSeen: isoDate || new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            providerAttribution: "Direct employer board via Lever Postings API",
            department,
            matchScore: 0,
            matchedSkills: [],
            missingSkills: [],
          };

          opportunities.push(opp);
          if (opportunities.length >= limit) break;
        }
      } catch (err) {
        console.warn(`[LeverProvider] Board fetch failed for ${board.company}:`, err);
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
