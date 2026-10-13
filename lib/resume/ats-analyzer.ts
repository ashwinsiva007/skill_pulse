import { ResumeContent, JobDescriptionAnalysis, AtsKeywordMatch } from "@/types/resume";

// Curated technical and domain keywords commonly sought in job descriptions
const RECOGNIZED_KEYWORDS: { keyword: string; category: AtsKeywordMatch["category"] }[] = [
  // Programming languages & core
  { keyword: "Python", category: "technical" },
  { keyword: "TypeScript", category: "technical" },
  { keyword: "JavaScript", category: "technical" },
  { keyword: "SQL", category: "technical" },
  { keyword: "C++", category: "technical" },
  { keyword: "Java", category: "technical" },
  { keyword: "Go", category: "technical" },
  { keyword: "Rust", category: "technical" },
  { keyword: "R", category: "technical" },

  // AI & Data
  { keyword: "Machine Learning", category: "domain" },
  { keyword: "Deep Learning", category: "domain" },
  { keyword: "NLP", category: "domain" },
  { keyword: "Computer Vision", category: "domain" },
  { keyword: "LLM", category: "domain" },
  { keyword: "RAG", category: "domain" },
  { keyword: "LangChain", category: "tool" },
  { keyword: "LlamaIndex", category: "tool" },
  { keyword: "PyTorch", category: "tool" },
  { keyword: "TensorFlow", category: "tool" },
  { keyword: "Vector Database", category: "domain" },
  { keyword: "Pinecone", category: "tool" },
  { keyword: "Pandas", category: "tool" },
  { keyword: "NumPy", category: "tool" },
  { keyword: "Scikit-Learn", category: "tool" },
  { keyword: "Data Analysis", category: "domain" },
  { keyword: "Data Modeling", category: "domain" },
  { keyword: "Tableau", category: "tool" },
  { keyword: "Power BI", category: "tool" },

  // Web & Backend
  { keyword: "React", category: "tool" },
  { keyword: "Next.js", category: "tool" },
  { keyword: "FastAPI", category: "tool" },
  { keyword: "Node.js", category: "tool" },
  { keyword: "Express", category: "tool" },
  { keyword: "PostgreSQL", category: "tool" },
  { keyword: "MongoDB", category: "tool" },
  { keyword: "Redis", category: "tool" },
  { keyword: "GraphQL", category: "technical" },
  { keyword: "REST API", category: "domain" },
  { keyword: "Microservices", category: "domain" },
  { keyword: "Tailwind CSS", category: "tool" },

  // Cloud & DevOps
  { keyword: "AWS", category: "tool" },
  { keyword: "Docker", category: "tool" },
  { keyword: "Kubernetes", category: "tool" },
  { keyword: "CI/CD", category: "domain" },
  { keyword: "GitHub Actions", category: "tool" },
  { keyword: "Linux", category: "technical" },
  { keyword: "Git", category: "tool" },

  // Soft & Leadership
  { keyword: "Problem Solving", category: "soft" },
  { keyword: "Communication", category: "soft" },
  { keyword: "Collaboration", category: "soft" },
  { keyword: "Agile", category: "soft" },
  { keyword: "System Design", category: "domain" },
  { keyword: "Documentation", category: "soft" },
  { keyword: "Code Review", category: "soft" },
  { keyword: "Mentorship", category: "soft" },
];

/**
 * Extracts all searchable text tokens from structured resume content.
 */
function extractResumeText(content: ResumeContent): string {
  const parts: string[] = [];

  parts.push(content.contact.fullName, content.contact.email, content.summary);
  parts.push(...content.skills.technical, ...content.skills.soft, ...content.skills.tools);

  for (const exp of content.experience) {
    parts.push(exp.company, exp.role, ...exp.bullets);
  }

  for (const proj of content.projects) {
    parts.push(proj.title, proj.problem || "", ...proj.technologies, ...proj.bullets);
  }

  for (const edu of content.education) {
    parts.push(edu.institution, edu.degree, edu.fieldOfStudy, ...(edu.highlights || []));
  }

  for (const cert of content.certifications) {
    parts.push(cert.name, cert.issuer);
  }

  for (const ach of content.achievements) {
    parts.push(ach.title, ach.description || "");
  }

  return parts.filter(Boolean).join(" ").toLowerCase();
}

/**
 * Analyzes a job description against structured resume content.
 * Highlights keyword matches and identifies gaps without fabricating user claims.
 */
export function analyzeJobDescription(
  jobDescription: string,
  content: ResumeContent
): JobDescriptionAnalysis {
  if (!jobDescription || jobDescription.trim().length === 0) {
    return {
      matchScore: 0,
      matchedKeywords: [],
      missingKeywords: [],
      keywordBreakdown: [],
      suggestions: ["Paste a target job description above to inspect keyword alignment."],
      disclaimer:
        "ATS alignment scores are informational heuristics. Matching keywords does not guarantee an interview or selection.",
    };
  }

  const normalizedJobDesc = jobDescription.toLowerCase();
  const resumeText = extractResumeText(content);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];
  const keywordBreakdown: AtsKeywordMatch[] = [];

  for (const item of RECOGNIZED_KEYWORDS) {
    const kwLower = item.keyword.toLowerCase();
    // Count occurrences in job description (word boundary match)
    const regex = new RegExp(`\\b${kwLower.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "gi");
    const matches = normalizedJobDesc.match(regex);
    const frequency = matches ? matches.length : 0;

    if (frequency > 0) {
      const inResume = resumeText.includes(kwLower);
      if (inResume) {
        matchedKeywords.push(item.keyword);
      } else {
        missingKeywords.push(item.keyword);
      }

      keywordBreakdown.push({
        keyword: item.keyword,
        category: item.category,
        presentInResume: inResume,
        frequencyInJobDesc: frequency,
      });
    }
  }

  // Calculate score
  const totalKeywordsInJob = matchedKeywords.length + missingKeywords.length;
  let matchScore = 70; // baseline if no specific keywords recognized

  if (totalKeywordsInJob > 0) {
    matchScore = Math.round((matchedKeywords.length / totalKeywordsInJob) * 100);
  }

  // Generate actionable suggestions
  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 4);
    suggestions.push(
      `Job description mentions ${topMissing.join(", ")}. If you possess these competencies, consider highlighting them in your Skills or Project sections.`
    );
  }
  if (matchedKeywords.length >= 5) {
    suggestions.push(
      `Strong alignment detected on ${matchedKeywords.slice(0, 3).join(", ")} and others.`
    );
  } else {
    suggestions.push(
      "Ensure your project bullet points explicitly reference the core tools and frameworks required."
    );
  }
  suggestions.push(
    "Always truthfully represent your qualifications. Never add keywords for technologies you haven't used."
  );

  return {
    matchScore,
    matchedKeywords,
    missingKeywords,
    keywordBreakdown: keywordBreakdown.sort((a, b) => b.frequencyInJobDesc - a.frequencyInJobDesc),
    suggestions,
    disclaimer:
      "Important Notice: ATS alignment provides heuristic vocabulary suggestions. It does NOT guarantee interviews, screening passage, or employer hiring decisions.",
  };
}
