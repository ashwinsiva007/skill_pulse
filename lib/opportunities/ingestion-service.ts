import {
  Opportunity,
  ProviderHealthStatus,
  ExternalSearchShortcut,
} from "@/types/opportunity";
import { GreenhouseProviderAdapter } from "./providers/greenhouse-provider";
import { LeverProviderAdapter } from "./providers/lever-provider";
import { AdzunaProviderAdapter } from "./providers/adzuna-provider";
import { CatalogProviderAdapter } from "./providers/catalog-provider";
import { generateExternalSearchShortcuts, ExternalSearchOptions } from "./providers/external-search-provider";
import { IJobProviderAdapter, ProviderQueryOptions } from "./providers/base-provider";

export interface IngestionAggregatedResult {
  opportunities: Opportunity[];
  providerStatuses: ProviderHealthStatus[];
  totalLiveCount: number;
  totalCuratedCount: number;
  externalShortcuts: ExternalSearchShortcut[];
  lastIngestionTimestamp: string;
  isCacheHit: boolean;
}

class JobIngestionEngine {
  private providers: IJobProviderAdapter[];
  private catalogProvider: CatalogProviderAdapter;
  private cache: {
    result?: IngestionAggregatedResult;
    expiresAt: number;
  } = { expiresAt: 0 };

  // Cache duration: 15 minutes (in milliseconds)
  private readonly CACHE_TTL_MS = 15 * 60 * 1000;

  constructor() {
    this.catalogProvider = new CatalogProviderAdapter();
    this.providers = [
      new GreenhouseProviderAdapter(),
      new LeverProviderAdapter(),
      new AdzunaProviderAdapter(),
    ];
  }

  /**
   * Fetches opportunities across all configured providers with caching and deduplication.
   */
  async getOpportunities(
    options?: ProviderQueryOptions & ExternalSearchOptions,
    forceRefresh = false
  ): Promise<IngestionAggregatedResult> {
    const now = Date.now();

    // Check in-memory cache if not forcing refresh and no custom query applied
    if (
      !forceRefresh &&
      !options?.query &&
      !options?.location &&
      this.cache.result &&
      now < this.cache.expiresAt
    ) {
      return {
        ...this.cache.result,
        isCacheHit: true,
      };
    }

    const allOpportunities: Opportunity[] = [];
    const providerStatuses: ProviderHealthStatus[] = [];
    const seenUrls = new Set<string>();

    // 1. Fetch live providers concurrently with safe error boundaries
    const livePromises = this.providers.map(async (provider) => {
      try {
        const res = await provider.fetchOpportunities(options);
        return res;
      } catch (err: any) {
        console.warn(`[IngestionEngine] Error fetching from ${provider.providerId}:`, err);
        return {
          opportunities: [],
          status: {
            providerId: provider.providerId,
            providerName: provider.providerName,
            status: "ERROR" as const,
            supportsIndia: provider.supportsIndia,
            isConfigured: true,
            resultsCount: 0,
            errorDetails: err?.message || "Unknown provider failure",
          },
        };
      }
    });

    // 2. Fetch curated catalogue baseline
    const catalogPromise = this.catalogProvider.fetchOpportunities(options);

    const [liveResults, catalogResult] = await Promise.all([
      Promise.all(livePromises),
      catalogPromise,
    ]);

    // 3. Process Live Opportunities
    let liveCount = 0;
    for (const res of liveResults) {
      providerStatuses.push(res.status);
      for (const opp of res.opportunities) {
        const canonicalKey = (opp.applicationUrl || opp.sourceUrl || opp.id).toLowerCase().trim();
        if (!seenUrls.has(canonicalKey)) {
          seenUrls.add(canonicalKey);
          allOpportunities.push(opp);
          liveCount++;
        }
      }
    }

    // 4. Process Curated Catalogue
    providerStatuses.push(catalogResult.status);
    let curatedCount = 0;
    for (const opp of catalogResult.opportunities) {
      const canonicalKey = (opp.applicationUrl || opp.sourceUrl || opp.id).toLowerCase().trim();
      if (!seenUrls.has(canonicalKey)) {
        seenUrls.add(canonicalKey);
        allOpportunities.push(opp);
        curatedCount++;
      }
    }

    // 5. Generate External Search Shortcuts
    const externalShortcuts = generateExternalSearchShortcuts({
      role: options?.role || options?.query,
      location: options?.location,
      skills: options?.skills,
      type: options?.type,
    });

    const aggregated: IngestionAggregatedResult = {
      opportunities: allOpportunities,
      providerStatuses,
      totalLiveCount: liveCount,
      totalCuratedCount: curatedCount,
      externalShortcuts,
      lastIngestionTimestamp: new Date().toISOString(),
      isCacheHit: false,
    };

    // Cache result if this was a global, non-filtered ingestion run
    if (!options?.query && !options?.location) {
      this.cache = {
        result: aggregated,
        expiresAt: now + this.CACHE_TTL_MS,
      };
    }

    return aggregated;
  }

  /**
   * Health status of all providers without re-querying
   */
  async getProvidersHealth(): Promise<ProviderHealthStatus[]> {
    const statuses = await Promise.all([
      ...this.providers.map((p) => p.getStatus()),
      this.catalogProvider.getStatus(),
    ]);
    return statuses;
  }
}

export const jobIngestionEngine = new JobIngestionEngine();
