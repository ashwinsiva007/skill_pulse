import { Opportunity } from "@/types/opportunity";

/**
 * Opportunity Provider Interface
 * Allows pluggable listing feeds (e.g. demo catalogue, local cache, community feed, or future verified API)
 * without modifying UI components or scoring logic.
 */
export interface IOpportunityProvider {
  /**
   * Descriptive identifier of this provider
   */
  readonly name: string;

  /**
   * Fetches all opportunities available from this provider.
   */
  getOpportunities(): Promise<Opportunity[]>;

  /**
   * Fetches a specific opportunity by ID.
   */
  getOpportunityById(id: string): Promise<Opportunity | null>;
}
