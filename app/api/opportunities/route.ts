import { NextResponse } from "next/server";
import { jobIngestionEngine } from "@/lib/opportunities/ingestion-service";
import { Opportunity } from "@/types/opportunity";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const typeFilter = searchParams.get("type");
  const regionFilter = searchParams.get("region");
  const sourceModeFilter = searchParams.get("sourceMode");
  const locationFilter = searchParams.get("location");
  const query = searchParams.get("q")?.toLowerCase();
  const forceRefresh = searchParams.get("forceRefresh") === "true";

  try {
    const ingestionResult = await jobIngestionEngine.getOpportunities(
      {
        query: query || undefined,
        location: locationFilter || undefined,
        type: typeFilter && typeFilter !== "All" ? typeFilter : undefined,
      },
      forceRefresh
    );

    let filtered: Opportunity[] = [...ingestionResult.opportunities];

    // 1. Source Mode Filter (Live vs Curated Catalog)
    if (sourceModeFilter && sourceModeFilter !== "ALL") {
      filtered = filtered.filter((o) => o.sourceMode === sourceModeFilter);
    }

    // 2. Region / Location Filter
    if (regionFilter && regionFilter !== "All" && regionFilter !== "All India") {
      filtered = filtered.filter((o) => {
        const locLower = o.location.toLowerCase();
        if (regionFilter === "Tamil Nadu") {
          return (
            locLower.includes("tamil nadu") ||
            locLower.includes("chennai") ||
            locLower.includes("coimbatore") ||
            locLower.includes("madurai") ||
            locLower.includes("trichy") ||
            locLower.includes("tiruchirappalli") ||
            locLower.includes("salem") ||
            locLower.includes("hosur") ||
            locLower.includes("tiruppur") ||
            locLower.includes("erode")
          );
        }
        if (regionFilter === "South India") {
          return (
            o.region === "South India" ||
            locLower.includes("bengaluru") ||
            locLower.includes("bangalore") ||
            locLower.includes("chennai") ||
            locLower.includes("hyderabad") ||
            locLower.includes("coimbatore")
          );
        }
        if (regionFilter === "North India") {
          return (
            o.region === "North India" ||
            locLower.includes("delhi") ||
            locLower.includes("gurugram") ||
            locLower.includes("gurgaon") ||
            locLower.includes("noida")
          );
        }
        if (regionFilter === "West India") {
          return (
            o.region === "West India" ||
            locLower.includes("mumbai") ||
            locLower.includes("pune")
          );
        }
        if (regionFilter === "Pan-India Remote") {
          return o.region === "Pan-India Remote" || o.workMode === "Remote" || locLower.includes("remote");
        }
        return o.region === regionFilter || locLower.includes(regionFilter.toLowerCase());
      });
    }

    // 3. Type Filter
    if (typeFilter && typeFilter !== "All" && typeFilter !== "all") {
      filtered = filtered.filter((o) => o.type.toLowerCase() === typeFilter.toLowerCase());
    }

    // 4. Keyword Query Filter
    if (query) {
      filtered = filtered.filter((o) => {
        const matchTitle = o.title.toLowerCase().includes(query);
        const matchOrg = o.organization.toLowerCase().includes(query);
        const matchDesc = o.description.toLowerCase().includes(query);
        const matchLocation = o.location.toLowerCase().includes(query);
        const matchSkills = [
          ...(o.requiredSkills || []),
          ...(o.preferredSkills || []),
        ].some((s) => s.toLowerCase().includes(query));

        return matchTitle || matchOrg || matchDesc || matchLocation || matchSkills;
      });
    }

    return NextResponse.json({
      success: true,
      count: filtered.length,
      opportunities: filtered,
      providerStatuses: ingestionResult.providerStatuses,
      totalLiveCount: ingestionResult.totalLiveCount,
      totalCuratedCount: ingestionResult.totalCuratedCount,
      externalShortcuts: ingestionResult.externalShortcuts,
      meta: {
        sources: [
          "Greenhouse Public API (Live)",
          "Lever Postings API (Live)",
          "Adzuna Search (Authorized)",
          "Verified India Catalog (Curated)",
        ],
        country: "India",
        currency: "INR",
        lastUpdated: ingestionResult.lastIngestionTimestamp,
        isCacheHit: ingestionResult.isCacheHit,
      },
    });
  } catch (err: any) {
    console.error("[API /api/opportunities error]:", err);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve opportunities",
        message: err?.message,
      },
      { status: 500 }
    );
  }
}
