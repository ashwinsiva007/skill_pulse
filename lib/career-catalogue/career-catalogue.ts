import { SkillCategory, ProficiencyLevel } from "@/types/skill";

export type SkillImportance = "core" | "supporting";

export interface CatalogueSkillRequirement {
  name: string;
  category: SkillCategory;
  importance: SkillImportance;
  expectedProficiency: ProficiencyLevel;
  weight: number; // e.g. Core = 3, Supporting = 1
  description: string;
  suggestedActivity: string;
  portfolioEvidenceTip: string;
}

export interface CatalogueExampleProject {
  title: string;
  description: string;
  suggestedTech: string[];
  keyDeliverables: string[];
}

export interface CatalogueLearningResource {
  title: string;
  url: string;
  type: "docs" | "tutorial" | "course" | "practice";
  free: boolean;
}

export interface CareerRoleDefinition {
  id: string;
  title: string;
  domain: string;
  overview: string;
  typicalSeniority: string;
  requiredSkills: CatalogueSkillRequirement[];
  exampleProjects: CatalogueExampleProject[];
  recommendedResources: CatalogueLearningResource[];
}

/**
 * Configurable Starter Career Roles Catalogue
 * These represent practical starter benchmarks for students and early-career jobseekers.
 * They are configurable and extensible without requiring UI modifications.
 */
export const CAREER_ROLES_CATALOGUE: CareerRoleDefinition[] = [
  {
    id: "data-analyst",
    title: "Data Analyst",
    domain: "Data & Analytics",
    overview:
      "Extracts, transforms, and analyzes structured data to identify operational trends, build reporting dashboards, and support executive decision-making.",
    typicalSeniority: "Entry-Level / Junior (0–2 years)",
    requiredSkills: [
      {
        name: "SQL",
        category: "Data & Analytics",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Complex joins, window functions, aggregations, CTEs, and query optimization.",
        suggestedActivity: "Complete SQL benchmark challenges on HackerRank/LeetCode and write multi-table analytical queries.",
        portfolioEvidenceTip: "A repository demonstrating analytical SQL scripts with reproducible PostgreSQL or BigQuery datasets.",
      },
      {
        name: "Python",
        category: "Data & Analytics",
        importance: "core",
        expectedProficiency: "Intermediate",
        weight: 3,
        description: "Data manipulation, automated ETL scripts, and analytical exploration.",
        suggestedActivity: "Write Jupyter notebooks performing exploratory data analysis (EDA) with clean documentation.",
        portfolioEvidenceTip: "Jupyter notebooks with statistical markdown explanations and reproducible requirements.txt.",
      },
      {
        name: "Pandas",
        category: "Data & Analytics",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Data cleaning, aggregation, reshaping, filtering, and missing data imputation.",
        suggestedActivity: "Clean messy tabular datasets from Kaggle and document data quality checks.",
        portfolioEvidenceTip: "Documented data-cleaning pipeline comparing raw vs. normalized dataframes.",
      },
      {
        name: "Tableau",
        category: "Data & Analytics",
        importance: "core",
        expectedProficiency: "Intermediate",
        weight: 3,
        description: "Interactive visual dashboards, calculated fields, and narrative charts.",
        suggestedActivity: "Build a multi-tab Tableau Public workbook tracking retail or marketing KPIs.",
        portfolioEvidenceTip: "Published Tableau Public profile link with interactive tooltips and drill-downs.",
      },
      {
        name: "Data Modeling",
        category: "Data & Analytics",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Star schema, snowflake schema, entity-relationship diagrams (ERD), and normalization.",
        suggestedActivity: "Design a relational schema for an e-commerce platform and document primary/foreign keys.",
        portfolioEvidenceTip: "ERD diagram and schema migration scripts in a public repository.",
      },
      {
        name: "Technical Documentation & Collaboration",
        category: "Architecture & Leadership",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Synthesizing analytical findings into concise executive summaries and reproducible reports.",
        suggestedActivity: "Write an analytical executive briefing explaining an anomalous trend and action items.",
        portfolioEvidenceTip: "Slide deck or PDF report translating complex metrics into actionable insights.",
      },
      {
        name: "Git",
        category: "Cloud & DevOps",
        importance: "supporting",
        expectedProficiency: "Beginner",
        weight: 1,
        description: "Version control for analytical queries, notebooks, and script repositories.",
        suggestedActivity: "Push all analytical project commits with descriptive messages to GitHub.",
        portfolioEvidenceTip: "GitHub repository with clean commit history and a structured README.",
      },
    ],
    exampleProjects: [
      {
        title: "E-Commerce Customer Retention & Churn Dashboard",
        description: "Analyze 50,000+ orders to calculate cohort retention, churn rates, and customer lifetime value (LTV).",
        suggestedTech: ["SQL", "Python", "Pandas", "Tableau"],
        keyDeliverables: ["Reproducible SQL queries", "Cohort heatmap", "Published Tableau dashboard"],
      },
      {
        title: "City Traffic & Air Quality Analytical Report",
        description: "Clean public sensor datasets, perform time-series correlation analysis, and present findings.",
        suggestedTech: ["Python", "Pandas", "Matplotlib", "Jupyter"],
        keyDeliverables: ["EDA notebook", "Data cleaning audit report", "Executive summary"],
      },
    ],
    recommendedResources: [
      {
        title: "Mode Analytics SQL Tutorial",
        url: "https://mode.com/sql-tutorial/",
        type: "tutorial",
        free: true,
      },
      {
        title: "Pandas Documentation & Tutorials",
        url: "https://pandas.pydata.org/docs/getting_started/index.html",
        type: "docs",
        free: true,
      },
      {
        title: "Kaggle Datasets & Micro-courses",
        url: "https://www.kaggle.com/learn",
        type: "practice",
        free: true,
      },
    ],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    domain: "Data & Analytics",
    overview:
      "Applies statistical rigor, predictive machine learning models, and hypothesis testing to extract insights and build algorithmic solutions from data.",
    typicalSeniority: "Entry-Level / Junior (0–2 years)",
    requiredSkills: [
      {
        name: "Python",
        category: "AI & Machine Learning",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Idiomatic Python, object-oriented design, vectorized computing, and scientific libraries.",
        suggestedActivity: "Implement statistical simulation experiments and modular ML training scripts.",
        portfolioEvidenceTip: "Modular Python package structure with unit tests and type annotations.",
      },
      {
        name: "Machine Learning (Scikit-Learn)",
        category: "AI & Machine Learning",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Supervised & unsupervised algorithms: Regression, Random Forests, Gradient Boosting, Clustering.",
        suggestedActivity: "Train and compare multiple baseline models using cross-validation and hyperparameter tuning.",
        portfolioEvidenceTip: "Model comparison notebook with ROC-AUC, confusion matrices, and SHAP feature importance.",
      },
      {
        name: "SQL",
        category: "Data & Analytics",
        importance: "core",
        expectedProficiency: "Intermediate",
        weight: 3,
        description: "Extracting training datasets, aggregation, and feature engineering at scale.",
        suggestedActivity: "Write queries to engineer time-window features (e.g., 30-day rolling transaction counts).",
        portfolioEvidenceTip: "Feature engineering SQL script accompanying a machine learning model pipeline.",
      },
      {
        name: "Statistics & Hypothesis Testing",
        category: "Data & Analytics",
        importance: "core",
        expectedProficiency: "Intermediate",
        weight: 3,
        description: "A/B testing, p-values, confidence intervals, distributions, and variance reduction.",
        suggestedActivity: "Design a simulated A/B test power calculation and evaluate experimental significance.",
        portfolioEvidenceTip: "Notebook demonstrating an end-to-end A/B test analysis with statistical power tests.",
      },
      {
        name: "PyTorch & Fine-Tuning",
        category: "AI & Machine Learning",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Deep learning fundamentals: Neural networks, backpropagation, and loss function tuning.",
        suggestedActivity: "Train a multi-layer perceptron or CNN on custom classification data.",
        portfolioEvidenceTip: "PyTorch model checkpoint with training/validation loss curves logged.",
      },
      {
        name: "Docker & Containerization",
        category: "Cloud & DevOps",
        importance: "supporting",
        expectedProficiency: "Beginner",
        weight: 1,
        description: "Packaging model inference code into reproducible container images.",
        suggestedActivity: "Containerize a Scikit-Learn prediction script with a Dockerfile.",
        portfolioEvidenceTip: "Working Dockerfile that builds and runs model inference locally.",
      },
    ],
    exampleProjects: [
      {
        title: "Predictive Loan Default Model with Explainability",
        description: "Train an XGBoost classifier on credit risk data with cross-validation and SHAP model explainability.",
        suggestedTech: ["Python", "Scikit-Learn", "XGBoost", "SHAP", "Pandas"],
        keyDeliverables: ["Model evaluation benchmark", "Feature importance breakdown", "Interactive demo"],
      },
      {
        title: "User Retention A/B Testing & Causal Inference",
        description: "Evaluate user engagement differences between feature variants using parametric and non-parametric tests.",
        suggestedTech: ["Python", "SciPy", "Statsmodels", "Seaborn"],
        keyDeliverables: ["Power analysis calculation", "Statistical significance notebook", "Recommendation memo"],
      },
    ],
    recommendedResources: [
      {
        title: "Scikit-Learn User Guide",
        url: "https://scikit-learn.org/stable/user_guide.html",
        type: "docs",
        free: true,
      },
      {
        title: "StatQuest with Josh Starmer",
        url: "https://statquest.org/",
        type: "tutorial",
        free: true,
      },
    ],
  },
  {
    id: "machine-learning-engineer",
    title: "Machine Learning Engineer",
    domain: "AI & Machine Learning",
    overview:
      "Designs, trains, evaluates, and deploys scalable machine learning models into production systems and microservice APIs.",
    typicalSeniority: "Entry-Level / Junior (0–2 years)",
    requiredSkills: [
      {
        name: "PyTorch & Fine-Tuning",
        category: "AI & Machine Learning",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Dataset loaders, custom modules, training loops, GPU acceleration, and parameter tuning.",
        suggestedActivity: "Implement a custom PyTorch model training loop with validation checkpoints and early stopping.",
        portfolioEvidenceTip: "GitHub repository with reproducible training scripts, evaluation metrics, and model weights.",
      },
      {
        name: "Python & FastAPI",
        category: "Backend & Systems",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "High-throughput asynchronous model serving, validation schemas, and REST endpoints.",
        suggestedActivity: "Wrap a model into a FastAPI service with request batching and Pydantic validation.",
        portfolioEvidenceTip: "FastAPI inference service repository with Swagger documentation and benchmark tests.",
      },
      {
        name: "Docker & Containerization",
        category: "Cloud & DevOps",
        importance: "core",
        expectedProficiency: "Intermediate",
        weight: 3,
        description: "Multi-stage Docker builds, dependency management, and lightweight inference containers.",
        suggestedActivity: "Package a model serving microservice into a container optimized for minimal image size.",
        portfolioEvidenceTip: "Dockerfile and docker-compose.yml running the service with health checks.",
      },
      {
        name: "Prompt Engineering & Guardrails",
        category: "AI & Machine Learning",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Evaluation frameworks, regression testing, hallucination detection, and safety filters.",
        suggestedActivity: "Set up test harnesses computing faithfulness and semantic similarity on model outputs.",
        portfolioEvidenceTip: "Automated test suite asserting model output schema conformance and guardrail safety.",
      },
      {
        name: "AWS (S3, Lambda, EC2)",
        category: "Cloud & DevOps",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Object storage for model artifacts, compute instances, and cloud deployment pipelines.",
        suggestedActivity: "Store model checkpoints in S3 and deploy inference on an EC2 or serverless container.",
        portfolioEvidenceTip: "Architecture diagram and deployment scripts targeting cloud infrastructure.",
      },
    ],
    exampleProjects: [
      {
        title: "Production Image Classification Microservice",
        description: "Deploy a fine-tuned ResNet model behind a FastAPI endpoint with Docker Compose and benchmark latency.",
        suggestedTech: ["PyTorch", "FastAPI", "Docker", "PyTest"],
        keyDeliverables: ["Docker container", "Latency benchmark results", "API documentation"],
      },
      {
        title: "Automated Model Regression & Evaluation Harness",
        description: "Build an automated CI test suite validating model performance against benchmark datasets before merge.",
        suggestedTech: ["Python", "PyTest", "GitHub Actions", "Docker"],
        keyDeliverables: ["CI/CD workflow YAML", "Automated evaluation reports", "Test dataset harness"],
      },
    ],
    recommendedResources: [
      {
        title: "FastAPI Documentation",
        url: "https://fastapi.tiangolo.com/",
        type: "docs",
        free: true,
      },
      {
        title: "PyTorch Tutorials",
        url: "https://pytorch.org/tutorials/",
        type: "tutorial",
        free: true,
      },
    ],
  },
  {
    id: "business-intelligence-analyst",
    title: "Business Intelligence Analyst",
    domain: "Data & Analytics",
    overview:
      "Bridges the gap between raw data warehouses and business stakeholders, building automated KPI pipelines, semantic models, and executive dashboards.",
    typicalSeniority: "Entry-Level / Junior (0–2 years)",
    requiredSkills: [
      {
        name: "SQL",
        category: "Data & Analytics",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Analytical SQL, aggregation across millions of rows, date manipulation, and views.",
        suggestedActivity: "Write queries computing week-over-week growth, rolling averages, and retention rates.",
        portfolioEvidenceTip: "SQL repository documenting business metric definitions and data validation tests.",
      },
      {
        name: "Tableau",
        category: "Data & Analytics",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Executive dashboards, parameters, LOD expressions (Level of Detail), and user filtering.",
        suggestedActivity: "Build an executive sales performance dashboard with drill-down functionality.",
        portfolioEvidenceTip: "Live Tableau Public portfolio demonstrating clean visual design and data story.",
      },
      {
        name: "Data Modeling",
        category: "Data & Analytics",
        importance: "core",
        expectedProficiency: "Intermediate",
        weight: 3,
        description: "Fact and dimension tables, data warehousing concepts, and data dictionary maintenance.",
        suggestedActivity: "Document a dimensional model mapping business entities and grain definitions.",
        portfolioEvidenceTip: "Dimensional model schema diagram and data dictionary documentation.",
      },
      {
        name: "Technical Documentation & Collaboration",
        category: "Architecture & Leadership",
        importance: "supporting",
        expectedProficiency: "Advanced",
        weight: 1,
        description: "Translating stakeholder requests into measurable KPI definitions and user guides.",
        suggestedActivity: "Author a data dictionary and KPI specification document for marketing operations.",
        portfolioEvidenceTip: "Comprehensive metric specification document in Markdown or Notion.",
      },
      {
        name: "Python",
        category: "Data & Analytics",
        importance: "supporting",
        expectedProficiency: "Beginner",
        weight: 1,
        description: "Automating scheduled data extraction and validation checks.",
        suggestedActivity: "Write an automated Python script that checks for null values in weekly CSV exports.",
        portfolioEvidenceTip: "Automated data-validation script with automated alerts.",
      },
    ],
    exampleProjects: [
      {
        title: "Executive Revenue & SaaS Metric Dashboard",
        description: "Design an interactive Tableau dashboard tracking MRR, ARR, churn, and customer acquisition cost (CAC).",
        suggestedTech: ["SQL", "Tableau", "Data Modeling"],
        keyDeliverables: ["Tableau Public link", "SQL transformation queries", "KPI data dictionary"],
      },
    ],
    recommendedResources: [
      {
        title: "Tableau Free Training Videos",
        url: "https://www.tableau.com/learn/training",
        type: "tutorial",
        free: true,
      },
      {
        title: "SQL Tutorial - Mode",
        url: "https://mode.com/sql-tutorial/",
        type: "docs",
        free: true,
      },
    ],
  },
  {
    id: "software-developer",
    title: "Software Developer",
    domain: "Software Engineering",
    overview:
      "Builds robust application software, implements business logic, writes automated unit tests, and participates in code reviews.",
    typicalSeniority: "Entry-Level / Junior (0–2 years)",
    requiredSkills: [
      {
        name: "TypeScript (Strict Mode)",
        category: "Frontend Engineering",
        importance: "core",
        expectedProficiency: "Intermediate",
        weight: 3,
        description: "Type safety, interfaces, generics, discriminated unions, and strict compiler settings.",
        suggestedActivity: "Refactor a JavaScript project to strict TypeScript without using 'any'.",
        portfolioEvidenceTip: "TypeScript repository configured with strict mode in tsconfig.json.",
      },
      {
        name: "Node.js & REST APIs",
        category: "Backend & Systems",
        importance: "core",
        expectedProficiency: "Intermediate",
        weight: 3,
        description: "CRUD endpoint development, HTTP status codes, middleware, and request validation.",
        suggestedActivity: "Build a REST API server with authentication middleware and input validation.",
        portfolioEvidenceTip: "REST API repository with OpenAPI / Swagger documentation and test coverage.",
      },
      {
        name: "PostgreSQL & Prisma / Drizzle ORM",
        category: "Backend & Systems",
        importance: "core",
        expectedProficiency: "Intermediate",
        weight: 3,
        description: "Relational database schema design, migrations, indexing, and ORM integration.",
        suggestedActivity: "Design a relational database schema with migration scripts and seed data.",
        portfolioEvidenceTip: "Repository with clean database migrations and relational foreign key constraints.",
      },
      {
        name: "Docker & Containerization",
        category: "Cloud & DevOps",
        importance: "supporting",
        expectedProficiency: "Beginner",
        weight: 1,
        description: "Containerizing services for consistent local development and staging environments.",
        suggestedActivity: "Create a docker-compose.yml running the application server and PostgreSQL database.",
        portfolioEvidenceTip: "Functional docker-compose.yml in the root of the project.",
      },
      {
        name: "Technical Documentation & Collaboration",
        category: "Architecture & Leadership",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Clear README documentation, architecture diagrams, and meaningful commit messages.",
        suggestedActivity: "Author a comprehensive README including setup instructions, architecture, and API specs.",
        portfolioEvidenceTip: "Polished project README with setup commands, architectural decisions, and screenshots.",
      },
    ],
    exampleProjects: [
      {
        title: "Full-Stack Task & Workflow Management Application",
        description: "Build an end-to-end task tracker with user authentication, PostgreSQL database, and automated tests.",
        suggestedTech: ["TypeScript", "Node.js", "PostgreSQL", "Docker", "Tailwind CSS"],
        keyDeliverables: ["REST API server", "Database migration suite", "Live demo deployed"],
      },
    ],
    recommendedResources: [
      {
        title: "TypeScript Official Handbook",
        url: "https://www.typescriptlang.org/docs/handbook/intro.html",
        type: "docs",
        free: true,
      },
      {
        title: "Node.js Documentation",
        url: "https://nodejs.org/en/docs",
        type: "docs",
        free: true,
      },
    ],
  },
  {
    id: "frontend-developer",
    title: "Frontend Developer",
    domain: "Software Engineering",
    overview:
      "Crafts accessible, performant, and responsive web user interfaces using modern React frameworks and CSS design systems.",
    typicalSeniority: "Entry-Level / Junior (0–2 years)",
    requiredSkills: [
      {
        name: "Next.js & React 19",
        category: "Frontend Engineering",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "React component architecture, state management, App Router, and hooks.",
        suggestedActivity: "Build an interactive multi-page web app with client-side state and server rendering.",
        portfolioEvidenceTip: "Responsive Next.js application deployed to Vercel with clean Lighthouse performance scores.",
      },
      {
        name: "TypeScript (Strict Mode)",
        category: "Frontend Engineering",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Strict typing for component props, events, API payloads, and state models.",
        suggestedActivity: "Build reusable UI component library typed with strict prop interfaces.",
        portfolioEvidenceTip: "Zero TypeScript errors under strict mode across all frontend components.",
      },
      {
        name: "Tailwind CSS & UI Design",
        category: "Frontend Engineering",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Responsive design, dark mode, design tokens, micro-interactions, and accessibility (WCAG).",
        suggestedActivity: "Implement a modern dark-first design system with full mobile responsiveness.",
        portfolioEvidenceTip: "Live web app demonstrating responsive layouts on mobile, tablet, and desktop viewports.",
      },
      {
        name: "Node.js & REST APIs",
        category: "Backend & Systems",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Consuming REST APIs, managing loading and error states, and optimistic UI updates.",
        suggestedActivity: "Integrate third-party REST API with robust error handling and empty states.",
        portfolioEvidenceTip: "Polished UI handling loading spinners, error banners, and empty states gracefully.",
      },
      {
        name: "Technical Documentation & Collaboration",
        category: "Architecture & Leadership",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Storybook documentation, component usage guides, and accessible UI labeling.",
        suggestedActivity: "Document UI component props and accessibility considerations.",
        portfolioEvidenceTip: "README explaining design decisions, keyboard navigation, and color contrast.",
      },
    ],
    exampleProjects: [
      {
        title: "Developer Analytics Dashboard UI",
        description: "A dark-themed analytics portal with responsive charts, filters, keyboard shortcuts, and theme switcher.",
        suggestedTech: ["Next.js", "React 19", "TypeScript", "Tailwind CSS"],
        keyDeliverables: ["Live deployed application", "Mobile responsive interface", "Component library"],
      },
    ],
    recommendedResources: [
      {
        title: "Next.js Documentation",
        url: "https://nextjs.org/docs",
        type: "docs",
        free: true,
      },
      {
        title: "Tailwind CSS Documentation",
        url: "https://tailwindcss.com/docs",
        type: "docs",
        free: true,
      },
    ],
  },
  {
    id: "backend-developer",
    title: "Backend Developer",
    domain: "Software Engineering",
    overview:
      "Architects scalable server-side systems, relational databases, caching layers, and high-performance REST/gRPC endpoints.",
    typicalSeniority: "Entry-Level / Junior (0–2 years)",
    requiredSkills: [
      {
        name: "Python & FastAPI",
        category: "Backend & Systems",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Asynchronous route handlers, dependency injection, validation schemas, and database sessions.",
        suggestedActivity: "Build a multi-resource REST API with asynchronous database access.",
        portfolioEvidenceTip: "FastAPI server with comprehensive unit tests and automated Swagger documentation.",
      },
      {
        name: "PostgreSQL & Prisma / Drizzle ORM",
        category: "Backend & Systems",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Schema design, composite indexes, query performance tuning, transactions, and foreign keys.",
        suggestedActivity: "Implement database transactions, rollback handling, and complex analytical views.",
        portfolioEvidenceTip: "Relational schema migration files with indexing on frequently queried columns.",
      },
      {
        name: "Docker & Containerization",
        category: "Cloud & DevOps",
        importance: "core",
        expectedProficiency: "Intermediate",
        weight: 3,
        description: "Containerizing backend services, volumes, network bridging, and health checks.",
        suggestedActivity: "Configure Docker Compose for API server, PostgreSQL database, and Redis cache.",
        portfolioEvidenceTip: "Single-command docker-compose up running all backend dependencies locally.",
      },
      {
        name: "System Design & REST Architectures",
        category: "Architecture & Leadership",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Idempotency, rate limiting, pagination, caching strategies, and stateless architecture.",
        suggestedActivity: "Document system architecture diagrams showing load balancing, caching, and persistence.",
        portfolioEvidenceTip: "Architecture documentation with request lifecycle diagrams in Markdown.",
      },
      {
        name: "AWS (S3, Lambda, EC2)",
        category: "Cloud & DevOps",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Deploying containerized backend workloads on cloud infrastructure.",
        suggestedActivity: "Deploy a backend service to cloud compute with environment variables and secure secrets.",
        portfolioEvidenceTip: "Infrastructure configuration files and deployment instructions.",
      },
    ],
    exampleProjects: [
      {
        title: "High-Throughput E-Commerce Order Processing API",
        description: "Asynchronous backend processing shopping carts, inventory checks, database transactions, and receipts.",
        suggestedTech: ["FastAPI", "Python", "PostgreSQL", "Docker", "PyTest"],
        keyDeliverables: ["Asynchronous API endpoints", "Database transaction tests", "Postman / OpenAPI specs"],
      },
    ],
    recommendedResources: [
      {
        title: "PostgreSQL Documentation",
        url: "https://www.postgresql.org/docs/",
        type: "docs",
        free: true,
      },
      {
        title: "FastAPI Tutorial - User Guide",
        url: "https://fastapi.tiangolo.com/tutorial/",
        type: "docs",
        free: true,
      },
    ],
  },
  {
    id: "ai-engineer",
    title: "AI Engineer",
    domain: "AI & Machine Learning",
    overview:
      "Integrates frontier foundation models, vector databases, and multi-agent frameworks to build intelligent software solutions and copilot interfaces.",
    typicalSeniority: "Entry-Level / Junior (0–2 years)",
    requiredSkills: [
      {
        name: "LLM Orchestration (LangChain / LlamaIndex)",
        category: "AI & Machine Learning",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Multi-agent workflows, tool callbacks, prompt chaining, and structured output parsing.",
        suggestedActivity: "Build an agent that executes multi-step web queries and returns validated JSON responses.",
        portfolioEvidenceTip: "Repository demonstrating agent tool calling, structured schemas, and error recovery.",
      },
      {
        name: "RAG & Vector Databases (Pinecone / Qdrant)",
        category: "AI & Machine Learning",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Hybrid vector search, contextual chunking, embeddings, and semantic cache layers.",
        suggestedActivity: "Build a document retrieval pipeline with hybrid dense + sparse BM25 reranking.",
        portfolioEvidenceTip: "Working RAG application with evaluation benchmarks testing retrieval accuracy.",
      },
      {
        name: "Python & FastAPI",
        category: "Backend & Systems",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Streaming server-sent events (SSE), asynchronous completions, and token rate limiting.",
        suggestedActivity: "Build a FastAPI microservice streaming LLM tokens to a web client with error handling.",
        portfolioEvidenceTip: "FastAPI server code with streaming endpoints and token usage instrumentation.",
      },
      {
        name: "Prompt Engineering & Guardrails",
        category: "AI & Machine Learning",
        importance: "core",
        expectedProficiency: "Advanced",
        weight: 3,
        description: "Guardrails, PII masking, few-shot prompting, and hallucination evaluation frameworks.",
        suggestedActivity: "Implement automated evaluation tests measuring faithfulness and context recall.",
        portfolioEvidenceTip: "Evaluation test suite demonstrating quantitative benchmark scores across test prompts.",
      },
      {
        name: "Next.js & React 19",
        category: "Frontend Engineering",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Interactive chat UIs, streaming hooks, markdown rendering, and citation cards.",
        suggestedActivity: "Build a responsive copilot web client with real-time streaming and citation callbacks.",
        portfolioEvidenceTip: "Live web application demonstrating streaming AI responses with clickable source links.",
      },
      {
        name: "Docker & Containerization",
        category: "Cloud & DevOps",
        importance: "supporting",
        expectedProficiency: "Intermediate",
        weight: 1,
        description: "Packaging AI services and local vector databases into containerized environments.",
        suggestedActivity: "Containerize the FastAPI AI agent service and local vector store with Docker Compose.",
        portfolioEvidenceTip: "Docker Compose setup allowing complete application execution locally with one command.",
      },
    ],
    exampleProjects: [
      {
        title: "Agentic Docs — RAG Knowledge Base with Source Citations",
        description: "An intelligent technical documentation navigator with hybrid vector retrieval, contextual chunking, and streaming UI.",
        suggestedTech: ["Next.js", "TypeScript", "LangChain", "Pinecone", "FastAPI"],
        keyDeliverables: ["Live interactive demo", "Retrieval accuracy benchmark", "Open-source GitHub repo"],
      },
    ],
    recommendedResources: [
      {
        title: "LangChain Documentation",
        url: "https://python.langchain.com/docs/get_started/introduction",
        type: "docs",
        free: true,
      },
      {
        title: "Pinecone Learning Center",
        url: "https://www.pinecone.io/learn/",
        type: "tutorial",
        free: true,
      },
    ],
  },
];

/**
 * Helper to fetch a role definition by ID or title.
 */
export function getCareerRoleById(roleId: string): CareerRoleDefinition | undefined {
  return CAREER_ROLES_CATALOGUE.find((r) => r.id === roleId);
}

export function getCareerRoleByTitle(roleTitle: string): CareerRoleDefinition | undefined {
  const normalized = roleTitle.trim().toLowerCase();
  return (
    CAREER_ROLES_CATALOGUE.find(
      (r) =>
        r.title.toLowerCase() === normalized ||
        r.title.toLowerCase().includes(normalized) ||
        normalized.includes(r.title.toLowerCase())
    ) || CAREER_ROLES_CATALOGUE[0]
  );
}
