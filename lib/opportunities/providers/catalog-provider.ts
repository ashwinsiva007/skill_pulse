import {
  Opportunity,
  ProviderHealthStatus,
} from "@/types/opportunity";
import {
  IJobProviderAdapter,
  ProviderFetchResult,
  ProviderQueryOptions,
} from "./base-provider";
import { STARTER_DEMO_OPPORTUNITIES } from "../demo-opportunities";

export class CatalogProviderAdapter implements IJobProviderAdapter {
  readonly providerId = "curated_catalog";
  readonly providerName = "Verified India-First Curated Catalogue";
  readonly supportsIndia = true;

  async getStatus(): Promise<ProviderHealthStatus> {
    return {
      providerId: this.providerId,
      providerName: this.providerName,
      status: "ACTIVE",
      supportsIndia: true,
      isConfigured: true,
      lastSuccessfulSync: new Date().toISOString(),
      resultsCount: STARTER_DEMO_OPPORTUNITIES.length,
      attributionRequirement: "SkillPulse Verified India Tech Opportunities Baseline",
    };
  }

  async fetchOpportunities(options?: ProviderQueryOptions): Promise<ProviderFetchResult> {
    let list: Opportunity[] = STARTER_DEMO_OPPORTUNITIES.map((opp) => ({
      ...opp,
      providerId: this.providerId,
      sourceMode: "CURATED_CATALOG",
      isDemo: false,
      lastFetchedAt: new Date().toISOString(),
    }));

    // Filter by query if provided
    if (options?.query) {
      const q = options.query.toLowerCase();
      list = list.filter(
        (o) =>
          o.title.toLowerCase().includes(q) ||
          o.organization.toLowerCase().includes(q) ||
          o.description.toLowerCase().includes(q) ||
          (o.requiredSkills || []).some((s) => s.toLowerCase().includes(q))
      );
    }

    // Filter by location if provided
    if (options?.location && options.location !== "All" && options.location !== "All India") {
      const loc = options.location.toLowerCase();
      list = list.filter(
        (o) =>
          o.location.toLowerCase().includes(loc) ||
          (o.region && o.region.toLowerCase().includes(loc))
      );
    }

    return {
      opportunities: list,
      status: await this.getStatus(),
    };
  }
}
