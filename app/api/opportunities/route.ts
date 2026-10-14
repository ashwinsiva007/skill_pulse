import { NextResponse } from "next/server";
import { Opportunity, OpportunityType, OpportunityRegion, OpportunityPortal } from "@/types/opportunity";
import { STARTER_DEMO_OPPORTUNITIES } from "@/lib/opportunities/demo-opportunities";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type");
  const regionFilter = searchParams.get("region");
  const portalFilter = searchParams.get("portal");
  const query = searchParams.get("q")?.toLowerCase();

  let filtered: Opportunity[] = [...STARTER_DEMO_OPPORTUNITIES];

  // 1. Region Filter
  if (regionFilter && regionFilter !== "All" && regionFilter !== "All India") {
    filtered = filtered.filter((o) => {
      if (regionFilter === "South India") {
        return o.region === "South India" || o.location.toLowerCase().includes("bengaluru") || o.location.toLowerCase().includes("chennai") || o.location.toLowerCase().includes("hyderabad") || o.location.toLowerCase().includes("coimbatore");
      }
      if (regionFilter === "North India") {
        return o.region === "North India" || o.location.toLowerCase().includes("delhi") || o.location.toLowerCase().includes("gurugram") || o.location.toLowerCase().includes("noida");
      }
      if (regionFilter === "West India") {
        return o.region === "West India" || o.location.toLowerCase().includes("mumbai") || o.location.toLowerCase().includes("pune");
      }
      if (regionFilter === "Pan-India Remote") {
        return o.region === "Pan-India Remote" || o.workMode === "Remote";
      }
      return o.region === regionFilter;
    });
  }

  // 2. Portal Filter
  if (portalFilter && portalFilter !== "All") {
    filtered = filtered.filter(
      (o) => o.portal?.toLowerCase() === portalFilter.toLowerCase() || o.sourceName.toLowerCase().includes(portalFilter.toLowerCase())
    );
  }

  // 3. Type Filter
  if (typeFilter && typeFilter !== "All" && typeFilter !== "all") {
    filtered = filtered.filter(
      (o) => o.type.toLowerCase() === typeFilter.toLowerCase()
    );
  }

  // 4. Search Query Filter
  if (query) {
    filtered = filtered.filter((o) => {
      const matchTitle = o.title.toLowerCase().includes(query);
      const matchOrg = o.organization.toLowerCase().includes(query);
      const matchDesc = o.description.toLowerCase().includes(query);
      const matchLocation = o.location.toLowerCase().includes(query);
      const matchSkills = (o.requiredSkills || []).some((s) =>
        s.toLowerCase().includes(query)
      );
      return matchTitle || matchOrg || matchDesc || matchLocation || matchSkills;
    });
  }

  return NextResponse.json({
    success: true,
    count: filtered.length,
    opportunities: filtered,
    meta: {
      sources: ["Naukri Verified", "LinkedIn India Verified", "Indeed India Verified", "Unstop Official", "Devpost India"],
      country: "India",
      currency: "INR",
      lastUpdated: new Date().toISOString(),
    },
  });
}
