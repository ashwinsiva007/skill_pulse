export interface OpenSourceReferral {
  skillName: string;
  roadmapUrl: string;
  roadmapLabel: string;
  documentationUrl: string;
  documentationLabel: string;
  freePracticeUrl: string;
  freePracticeLabel: string;
  competencySummary: string;
}

export const OPEN_SOURCE_SKILL_REFERRALS: Record<string, OpenSourceReferral> = {
  python: {
    skillName: "Python",
    roadmapUrl: "https://roadmap.sh/python",
    roadmapLabel: "roadmap.sh / Python Developer",
    documentationUrl: "https://docs.python.org/3/tutorial/",
    documentationLabel: "Official Python Documentation & Standard Library",
    freePracticeUrl: "https://www.kaggle.com/learn/python",
    freePracticeLabel: "Kaggle Learn: Hands-on Python Micro-course",
    competencySummary: "Master syntax, functions, object-oriented programming, virtual environments, and data manipulation.",
  },
  sql: {
    skillName: "SQL",
    roadmapUrl: "https://roadmap.sh/sql",
    roadmapLabel: "roadmap.sh / SQL Roadmap",
    documentationUrl: "https://www.postgresql.org/docs/current/tutorial.html",
    documentationLabel: "PostgreSQL Official Tutorial & Query Reference",
    freePracticeUrl: "https://sqlbolt.com/",
    freePracticeLabel: "SQLBolt: Interactive In-Browser SQL Exercises",
    competencySummary: "Learn multi-table joins, subqueries, aggregations, window functions, and indexing strategies.",
  },
  react: {
    skillName: "React",
    roadmapUrl: "https://roadmap.sh/react",
    roadmapLabel: "roadmap.sh / React Developer",
    documentationUrl: "https://react.dev/learn",
    documentationLabel: "Official React.dev Interactive Documentation",
    freePracticeUrl: "https://www.freecodecamp.org/learn/front-end-development-libraries/#react",
    freePracticeLabel: "FreeCodeCamp: React Certification Modules",
    competencySummary: "Understand components, hooks (useState, useEffect, useMemo), state lifting, and component lifecycles.",
  },
  typescript: {
    skillName: "TypeScript",
    roadmapUrl: "https://roadmap.sh/typescript",
    roadmapLabel: "roadmap.sh / TypeScript Roadmap",
    documentationUrl: "https://www.typescriptlang.org/docs/handbook/intro.html",
    documentationLabel: "TypeScript Handbook & Type System Guide",
    freePracticeUrl: "https://www.totaltypescript.com/tutorials",
    freePracticeLabel: "Total TypeScript Beginner Tutorials",
    competencySummary: "Master types, interfaces, generics, union types, and strict compiler configurations.",
  },
  javascript: {
    skillName: "JavaScript",
    roadmapUrl: "https://roadmap.sh/javascript",
    roadmapLabel: "roadmap.sh / JavaScript Roadmap",
    documentationUrl: "https://developer.mozilla.org/en-US/docs/Web/JavaScript",
    documentationLabel: "MDN Web Docs: JavaScript Reference",
    freePracticeUrl: "https://javascript.info/",
    freePracticeLabel: "The Modern JavaScript Tutorial",
    competencySummary: "Asynchronous JavaScript (Promises, async/await), DOM manipulation, closures, and ES6+ syntax.",
  },
  "git & github": {
    skillName: "Git & GitHub",
    roadmapUrl: "https://roadmap.sh/git-github",
    roadmapLabel: "roadmap.sh / Git & GitHub Roadmap",
    documentationUrl: "https://git-scm.com/book/en/v2",
    documentationLabel: "Pro Git Official Free Book",
    freePracticeUrl: "https://learngitbranching.js.org/",
    freePracticeLabel: "LearnGitBranching Visual Interactive Sandbox",
    competencySummary: "Branching, rebasing, pull requests, merge conflict resolution, and GitHub Actions CI/CD basics.",
  },
  docker: {
    skillName: "Docker",
    roadmapUrl: "https://roadmap.sh/docker",
    roadmapLabel: "roadmap.sh / Docker Containerization",
    documentationUrl: "https://docs.docker.com/get-started/",
    documentationLabel: "Docker Official Getting Started Guide",
    freePracticeUrl: "https://labs.play-with-docker.com/",
    freePracticeLabel: "Play with Docker: Free Cloud Sandbox",
    competencySummary: "Build container images, write Dockerfiles, manage multi-container apps with Docker Compose.",
  },
  "node.js": {
    skillName: "Node.js",
    roadmapUrl: "https://roadmap.sh/nodejs",
    roadmapLabel: "roadmap.sh / Node.js Backend",
    documentationUrl: "https://nodejs.org/en/learn",
    documentationLabel: "Node.js Official Learning Track",
    freePracticeUrl: "https://www.freecodecamp.org/learn/back-end-development-and-apis/",
    freePracticeLabel: "FreeCodeCamp: Backend & APIs Track",
    competencySummary: "Event loop, HTTP server architecture, Express/Fastify frameworks, middleware, and database connectivity.",
  },
  pandas: {
    skillName: "Pandas",
    roadmapUrl: "https://roadmap.sh/ai-data-scientist",
    roadmapLabel: "roadmap.sh / AI & Data Science",
    documentationUrl: "https://pandas.pydata.org/docs/getting_started/index.html",
    documentationLabel: "Pandas Official Getting Started & Tutorials",
    freePracticeUrl: "https://www.kaggle.com/learn/pandas",
    freePracticeLabel: "Kaggle Learn: Pandas In-Notebook Exercises",
    competencySummary: "Dataframes, indexing, merging, grouping, reshaping, and time-series analysis.",
  },
  tableau: {
    skillName: "Tableau",
    roadmapUrl: "https://roadmap.sh/bi-analyst",
    roadmapLabel: "roadmap.sh / Business Intelligence",
    documentationUrl: "https://help.tableau.com/current/guides/get-started-tutorial/en-us/get-started-tutorial-home.htm",
    documentationLabel: "Tableau Official Getting Started Tutorials",
    freePracticeUrl: "https://public.tableau.com/app/discover",
    freePracticeLabel: "Tableau Public: Community Visualizations",
    competencySummary: "Calculated fields, level-of-detail expressions, interactive KPI dashboards, and visual storytelling.",
  },
  "machine learning": {
    skillName: "Machine Learning",
    roadmapUrl: "https://roadmap.sh/ai-data-scientist",
    roadmapLabel: "roadmap.sh / Machine Learning & AI",
    documentationUrl: "https://scikit-learn.org/stable/tutorial/index.html",
    documentationLabel: "Scikit-Learn Official User Guide & Tutorials",
    freePracticeUrl: "https://www.kaggle.com/learn/intro-to-machine-learning",
    freePracticeLabel: "Kaggle Learn: Intro & Intermediate ML",
    competencySummary: "Supervised and unsupervised algorithms, cross-validation, feature engineering, and model evaluation metrics.",
  },
};

/**
 * Returns authentic open-source referral resources for any given skill.
 * If not explicitly mapped, returns standard roadmap.sh and MDN search referrals.
 */
export function getOpenSourceSkillReferral(skillName: string): OpenSourceReferral {
  const key = skillName.toLowerCase().trim();
  if (OPEN_SOURCE_SKILL_REFERRALS[key]) {
    return OPEN_SOURCE_SKILL_REFERRALS[key];
  }

  // Fallback to dynamic roadmap.sh and official documentation search
  const cleanName = encodeURIComponent(skillName);
  return {
    skillName,
    roadmapUrl: `https://roadmap.sh/search?q=${cleanName}`,
    roadmapLabel: `roadmap.sh / ${skillName}`,
    documentationUrl: `https://developer.mozilla.org/en-US/search?q=${cleanName}`,
    documentationLabel: `${skillName} Documentation Reference`,
    freePracticeUrl: `https://github.com/search?q=${cleanName}+tutorial`,
    freePracticeLabel: `GitHub Open-Source Learning Repositories`,
    competencySummary: `Core competencies and industry standard practices for ${skillName}.`,
  };
}
