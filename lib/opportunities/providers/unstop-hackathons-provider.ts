import {
  Opportunity,
  ProviderHealthStatus,
  OpportunityType,
  WorkMode,
  OpportunityRegion,
} from "@/types/opportunity";
import {
  IJobProviderAdapter,
  ProviderFetchResult,
  ProviderQueryOptions,
  cleanHtml,
  detectRegion,
} from "./base-provider";

export class UnstopHackathonsProviderAdapter implements IJobProviderAdapter {
  readonly providerId = "unstop-hackathons";
  readonly providerName = "Unstop Student Hackathons Feed";
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
      attributionRequirement: "Direct student competitions from Unstop Official Public API",
    };
  }

  async fetchOpportunities(options?: ProviderQueryOptions): Promise<ProviderFetchResult> {
    this.lastAttemptedSync = new Date().toISOString();
    const opportunities: Opportunity[] = [];
    const limit = options?.limit || 50;

    try {
      const url = `https://unstop.com/api/public/opportunity/search-result?opportunity=hackathons&per_page=${limit}`;
      const res = await fetch(url, {
        headers: {
          Accept: "application/json",
          "User-Agent": "SkillPulse-Platform/2.0",
        },
        signal: AbortSignal.timeout(8000),
      });

      if (!res.ok) {
        throw new Error(`Unstop API returned status ${res.status}`);
      }

      const json = await res.json();
      const rawList = json?.data?.data;

      if (Array.isArray(rawList)) {
        for (const item of rawList) {
          if (!item.title) continue;

          // Check registration status: Avoid closed/expired hackathons! ONLY show ongoing & registration open!
          const regStatus = String(item.regnRequirements?.reg_status || "").toUpperCase();
          const remainDays = String(item.regnRequirements?.remain_days || "").toLowerCase();
          const itemStatus = String(item.status || "").toUpperCase();
          const isClosed =
            regStatus === "FINISHED" ||
            regStatus === "EXPIRED" ||
            regStatus === "CLOSED" ||
            remainDays.includes("ended") ||
            remainDays.includes("expired") ||
            itemStatus === "EXPIRED" ||
            (item.end_date && new Date(item.end_date).getTime() < Date.now());

          if (isClosed) {
            continue; // Skip all closed/expired hackathons
          }

          // Parse direct authentic URL
          const seoUrl = item.seo_url?.startsWith("http")
            ? item.seo_url
            : item.seo_url
            ? `https://unstop.com/${item.seo_url.replace(/^\/+/, "")}`
            : item.short_url || item.public_url || `https://unstop.com/hackathons/${item.id}`;

          // Extract location & work mode
          const city = item.address_with_country_logo?.city || "";
          const state = item.address_with_country_logo?.state || "";
          const isOnline =
            item.regnRequirements?.work_location_type === "online" ||
            !city ||
            city.toLowerCase().includes("virtual") ||
            city.toLowerCase().includes("online");

          const workMode: WorkMode = isOnline ? "Remote" : "On-site";
          const location = isOnline
            ? "Pan-India / Virtual (Online)"
            : city && state
            ? `${city}, ${state}`
            : city || "India";

          const region: OpportunityRegion = isOnline
            ? "Pan-India Remote"
            : detectRegion(location);

          // Extract prizes
          const topPrize = item.prizes?.[0]?.cash || 0;
          const salaryRange = topPrize > 0
            ? `₹${topPrize.toLocaleString("en-IN")} Cash Prize Pool`
            : "Cash Awards & Unstop Certificates";

          // Extract required skills
          const skillsList = Array.isArray(item.required_skills)
            ? item.required_skills.map((s: any) => s.skill || s.skill_name).filter(Boolean)
            : [];
          const requiredSkills = skillsList.length > 0
            ? skillsList.slice(0, 5)
            : ["Problem Solving", "Software Engineering", "Algorithms", "Rapid Prototyping"];

          // Eligibility
          const eligibilityTags = Array.isArray(item.filters)
            ? item.filters.filter((f: any) => f.type === "eligible").map((f: any) => f.name)
            : [];
          const eligibilityRequirements = eligibilityTags.length > 0
            ? eligibilityTags.join(", ")
            : "Open to Engineering & College Students (Batches 2025, 2026, 2027 & 2028)";

          const minTeam = item.regnRequirements?.min_team_size || 1;
          const maxTeam = item.regnRequirements?.max_team_size || 4;

          const organization =
            item.organisation?.name ||
            item.banner_desktop_name ||
            item.title.split("-")[1]?.trim() ||
            "Unstop Collegiate Innovation";

          const cleanDesc = cleanHtml(
            item.details ||
            item.jobDetail?.summary ||
            `Participate in ${item.title} hosted by ${organization} on Unstop. Build functional prototypes, solve challenging problem statements, and compete for verified prizes and career pre-placement interviews.`
          );

          // Format deadline
          let deadline = "Active Registration";
          if (item.end_date) {
            try {
              deadline = new Date(item.end_date).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
            } catch {
              deadline = "Active Registration";
            }
          }

          const opp: Opportunity = {
            id: `unstop-live-${item.id}`,
            providerId: this.providerId,
            providerJobId: String(item.id),
            sourceMode: "LIVE",
            title: item.title,
            organization,
            company: organization,
            type: "Hackathon",
            domain: "Software Engineering & Emerging Tech",
            description: cleanDesc,
            requiredSkills,
            preferredSkills: ["Git", "System Design", "UI/UX", "API Integration"],
            eligibilityRequirements,
            experienceLevel: "All College Coders (1st to 4th Year)",
            location,
            city: city || undefined,
            state: state || undefined,
            workMode,
            workplaceType: workMode,
            region,
            portal: "Unstop",
            applicationUrl: seoUrl,
            sourceName: "Unstop Official Hackathons API",
            sourceUrl: seoUrl,
            unstopDirectUrl: seoUrl,
            verificationStatus: "official_verified",
            listingStatus: "open",
            salaryRange,
            prizeAmountNumeric: topPrize || 50000,
            teamSize: `${minTeam} - ${maxTeam} Members`,
            department: "Student Competitions & Hackathons",
            publicationDate: item.approved_date || item.created_at,
            postedDate: "Live Verified",
            deadline,
            isDemo: false,
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

      return {
        opportunities,
        status: await this.getStatus(),
      };
    } catch (err: any) {
      this.lastError = err.message || "Failed to fetch Unstop hackathons";
      console.warn("Unstop provider fetch error:", err);

      return {
        opportunities: [],
        status: await this.getStatus(),
      };
    }
  }
}
