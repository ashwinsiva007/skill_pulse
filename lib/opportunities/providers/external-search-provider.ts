import { ExternalSearchShortcut } from "@/types/opportunity";

export interface ExternalSearchOptions {
  role?: string;
  location?: string;
  skills?: string[];
  type?: string;
}

/**
 * Builds verified external search shortcuts to restricted platforms (LinkedIn, Indeed, Naukri, Internshala)
 * where direct scraping is unauthorized, providing genuine search portals without fabricated listings.
 */
export function generateExternalSearchShortcuts(options?: ExternalSearchOptions): ExternalSearchShortcut[] {
  const role = options?.role || "Software Developer";
  const location = options?.location || "India";
  const skillsStr = (options?.skills || []).slice(0, 3).join(" ");
  const combinedKeywords = `${role} ${skillsStr}`.trim();

  // Clean strings for URL query
  const queryParam = encodeURIComponent(combinedKeywords);
  const locParam = encodeURIComponent(location);

  const shortcuts: ExternalSearchShortcut[] = [
    {
      id: "shortcut-linkedin",
      platformName: "LinkedIn Jobs",
      queryTitle: `${role} Openings on LinkedIn India`,
      location: location,
      searchUrl: `https://in.linkedin.com/jobs/search?keywords=${queryParam}&location=${locParam}`,
      badgeLabel: "Official Search Shortcut",
      description: `Direct query for ${role} on LinkedIn India. Access live openings, direct employer posts, and recruiter inboxes directly on LinkedIn.`,
    },
    {
      id: "shortcut-naukri",
      platformName: "Naukri.com",
      queryTitle: `${role} Openings on Naukri India`,
      location: location,
      searchUrl: `https://www.naukri.com/it-jobs?k=${queryParam}&l=${locParam}`,
      badgeLabel: "Official Search Shortcut",
      description: `Search active Indian enterprise tech vacancies on Naukri for ${role} with filtered salary ranges and Indian recruiter contact options.`,
    },
    {
      id: "shortcut-indeed",
      platformName: "Indeed India",
      queryTitle: `${role} Jobs on Indeed India`,
      location: location,
      searchUrl: `https://in.indeed.com/jobs?q=${queryParam}&l=${locParam}`,
      badgeLabel: "Official Search Shortcut",
      description: `Run direct search for ${role} on Indeed India across verified startups, IT services, and product companies.`,
    },
    {
      id: "shortcut-unstop",
      platformName: "Unstop",
      queryTitle: `Tech Hiring & Hackathons on Unstop`,
      location: "Pan-India / Remote",
      searchUrl: `https://unstop.com/jobs?searchTerm=${encodeURIComponent(role)}`,
      badgeLabel: "Official Search Shortcut",
      description: `Explore student hiring challenges, engineering fresher drives, and college hackathons hosted by top Indian enterprises.`,
    },
  ];

  return shortcuts;
}
