# PathPilot (`skill_pulse`) — AI Career & Skill Navigator

> **Stage 5 — Complete Demo-Ready MVP with Opportunity Discovery & Application Tracker**  
> A modular, dark-first career platform built with Next.js (App Router), TypeScript in strict mode, and Tailwind CSS. Tailored specifically for students, fresh graduates, and early-career jobseekers.

---

## ⚡ Quick Start (Zero Setup Required)

**PathPilot** is engineered for **instant, frictionless local execution**. Anyone on the development team or reviewing recruiters can clone the repository, run the application immediately, and test with the pre-populated demo workspace or explore from scratch.

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on Node `v24`)
- npm / yarn / pnpm

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Run unit test suites (19 unit test cases across Skill Analyzer & Opportunity Matcher)
npm test

# 3. Check code formatting and TypeScript linting
npm run lint

# 4. Build optimized production bundle
npm run build

# 5. Launch development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to immediately access **PathPilot**.

---

## 🔒 Architecture Philosophy: Zero Cloud Lock-In & Educational Transparency

**PathPilot intentionally avoids mandatory cloud accounts, paid third-party APIs, and black-box AI claims.**

This build deliberately **does NOT implement**:
- ❌ Signup or login screens, passwords, or authentication middleware
- ❌ Supabase Auth or third-party OAuth lock-in
- ❌ Mandatory cloud database credentials, environment keys, or paid AI API secrets
- ❌ Black-box "AI hiring probability" or "job readiness guarantee" claims
- ❌ Indiscriminate web scraping or nonfunctional external links disguised as real

### Why This Decision Was Made
1. **Explainability & Transparency:** Candidates deserve to know *exactly* why their alignment score is 82% versus 45%. Every score is derived from an audited, unit-testable mathematical rubric comparing profile skills and portfolio evidence against transparent listing requirements.
2. **Pedagogical Honesty:** A match score measures alignment with stated listing attributes; it does **not** represent a probability of selection, interview invitation, or employment offer.
3. **Pluggable Opportunity Provider Architecture:** The discovery module is built behind the `IOpportunityProvider` interface (`lib/opportunities/opportunity-provider.ts`), decoupling listing ingestion from the UI. Future production feeds (e.g., Greenhouse API, Ashby API, Handshake, University Career Centers) can be plugged in without refactoring the UI.
4. **Decoupled Repository Pattern:** All mutations and queries pass through typed interfaces (`IProfileRepository`, `ISkillRepository`, `IResumeRepository`, `IRoadmapRepository`, `IOpportunityRepository`, `IApplicationRepository`). Data persists cleanly in browser `localStorage`.
5. **Instant Local Evaluation:** Reviewers and recruiters can evaluate all features without setting up backend infrastructure.

---

## 📂 Project Structure

```
skill_pulse/
├── app/                              # Next.js App Router Pages
│   ├── (dashboard)/page.tsx          # Root redirect / landing
│   ├── dashboard/page.tsx            # Unified Metrics & Pipeline Dashboard
│   ├── onboarding/page.tsx           # 7-Step Guided Profile Wizard
│   ├── profile/page.tsx              # Candidate Profile Management
│   ├── resume/page.tsx               # ATS Resume Builder & PDF Exporter
│   ├── skills/page.tsx               # 8-Track Explainable Skill Analyzer
│   ├── roadmap/page.tsx              # Adaptive 5-Phase Career Progression Roadmap
│   ├── opportunities/page.tsx        # Opportunity Discovery & Match Explorer
│   ├── saved-opportunities/page.tsx  # Pinned Opportunities Management
│   ├── tracker/page.tsx              # 5-Column Kanban Application Tracker
│   └── settings/page.tsx             # Local Storage Diagnostics & Global Reset
├── components/                       # Shared Reusable UI Components
│   ├── layout/                       # AppLayout, Sidebar, Navbar
│   └── ui/                           # Button, Card, Badge, Modal, Progress, EmptyState
├── features/                         # Modular Domain Feature Packages
│   ├── dashboard/                    # MetricsOverview, CareerReadinessCard, RoadmapCard
│   ├── profile/                      # Profile forms, skills/education/projects editors
│   ├── resume/                       # Guided questions, split-pane editor, PDF export
│   ├── skills/                       # Skill gap diagnostics, role comparison table
│   ├── roadmap/                      # 5-phase interactive milestones & checklists
│   ├── opportunities/                # OpportunityCard, OpportunityDetailModal, TrackModal
│   └── tracker/                      # Kanban columns, EditApplicationModal
├── lib/                              # Core Business Logic & Infrastructure
│   ├── career-catalogue/             # 8 Configured Career Role Profiles
│   ├── opportunities/                # IOpportunityProvider, DemoCatalogue, Matcher
│   ├── skill-analyzer/               # Transparent skill scoring formula & token matcher
│   ├── roadmap/                      # Personalized roadmap generator from skill gaps
│   ├── resume/                       # Resume templates, STAR bullet assistant
│   ├── repositories/                 # Local repositories (localStorage implementation)
│   ├── storage/                      # StorageAdapter interface & LocalStorage implementation
│   └── demo/                         # Seed dataset & DemoManager reset service
├── scripts/                          # Automated Unit Test Suites
│   ├── test-matching-engine.ts       # 10 Test suites for Skill Analyzer
│   └── test-opportunity-matcher.ts   # 9 Test suites for Opportunity Matcher
└── types/                            # Strict TypeScript Domain Interfaces
```

---

## 🚀 Complete Feature Overview (Stages 1–5 Integrated)

### 1. Unified Dashboard (`/dashboard` & `/`)
- **6-Metric Real-Time KPI Grid:** Displays profile completion percentage, total recorded skills, ATS resume drafts saved, target role alignment score, career roadmap progress percentage, pinned opportunities, and active applications.
- **Career Readiness Radar:** Compares candidate capabilities against target role expectations with live core skill coverage, supporting skill coverage, and portfolio evidence bonuses.
- **Adaptive Roadmap Snapshot:** Direct milestone progress tracking with quick links to active phase action items.
- **Application Pipeline Status Summary:** Summary breakdown of active applications across *Submitted*, *Interview Loop*, *Offers Received*, and *Bookmarks*.
- **Curated Spotlight & Recent Activity Stream:** Highlights top-matching opportunities and persistent user activity timestamps.

### 2. Opportunity Discovery (`/opportunities`)
- **Starter Demo Catalogue:** 10 curated listings across Jobs, Internships, Hackathons, Research Fellowships, and Career Programs.
- **Pluggable Architecture:** Implements `IOpportunityProvider` (`lib/opportunities/opportunity-provider.ts`).
- **Comprehensive Filtering & Sorting:**
  - Real-time text search by title or organization.
  - Filter pills by Opportunity Type (*Job*, *Internship*, *Hackathon*, *Research*, *Career Program*).
  - Filter dropdowns by Domain (*Data & Analytics*, *AI & Machine Learning*, *Software Engineering*, *Web & Frontend*, *Systems & Backend*).
  - Filter by Work Mode (*Remote*, *Hybrid*, *On-site*).
  - Sort by *Best Match* or *Title A–Z*.
- **Explainable Match Scoring Engine:**
  - Evaluates candidate profile, recorded skills, portfolio project tags, career level, and workplace preferences.
  - Transparent 100-point rubric: Role Alignment (30 pts), Required Skills (35 pts), Preferred Skills (15 pts), Work Mode (10 pts), Experience Level (10 pts).
  - "Why this matches you" expandable drawer highlighting exact alignment reasons.
  - Separate tagging for matched required skills vs. missing required skills vs. preferred bonus skills.
- **Opportunity Detail Modal:** Inspects full job description, eligibility rules, compensation ranges, source metadata, and transparent point audits.
- **Direct 1-Click Pipeline Action:** Track any opportunity into the Kanban application pipeline with custom notes and target milestone dates.
- **Explicit Demo Data Labeling:** All sample listings are prominently badged with `DEMO DATA` markers to ensure transparent expectations. External application links are simulated with clear demo toasts.

### 3. Saved Opportunities & Application Tracker (`/saved-opportunities` & `/tracker`)
- **Saved Opportunities View (`/saved-opportunities`):** Manage bookmarked roles with immediate action to launch application tracking.
- **5-Column Visual Kanban Tracker (`/tracker`):**
  - **Pipeline Stages:** *Bookmarked & Interested*, *Applied (Submitted)*, *Interview Loop* (Screening & Technical), *Offers Received*, and *Closed / Archived*.
  - **Manual Stage Transitions:** Drag or select dropdown to transition applications through recruiting stages.
  - **Application Notes & Next Steps:** Record interview notes, recruiter contacts, coding challenge deadlines, and salary negotiation terms.
  - **Add Custom Applications:** Log external job applications not originating from the internal catalogue.
  - **Edit & Archive:** Update details or safely archive completed pipelines.

### 4. Explainable Skill Analyzer (`/skills`)
- **8-Track Catalogue:** Data Analyst, Data Scientist, Machine Learning Engineer, BI Analyst, Software Developer, Frontend Developer, Backend Developer, and AI Engineer.
- **Explainable Mathematical Scoring:** Weighted formula accounting for core competencies (3x), supporting competencies (1x), proficiency depth, and portfolio project evidence.
- **Skill Gap Diagnostics:** Filterable by *Not Yet Recorded*, *Partially Developed*, and *Matched* with recommended learning activities and recruiter portfolio tips.
- **Multi-Role Alignment Matrix:** Compare candidate fit across all 8 career tracks simultaneously.

### 5. Adaptive 5-Phase Career Roadmap (`/roadmap`)
- **Personalized Generation:** Dynamically structured based on target role and detected missing competencies:
  - *Phase 1: Foundational Mastery*
  - *Phase 2: Deliberate Practice*
  - *Phase 3: Capstone Engineering*
  - *Phase 4: Presentation & Artifacts*
  - *Phase 5: Career Transition & Interviewing*
- **Interactive Checklists & Personal Study Notes:** Toggle checklist items to update progress and save persistent study reflections.

### 6. ATS Resume Builder (`/resume`)
- **Guided Career Target Setup:** Tailors resume drafts specifically for Data Analyst, Data Scientist, AI/ML, or Software Developer roles.
- **STAR Bullet Assistant:** Formulates high-impact resume bullet points using the Situation-Task-Action-Result framework.
- **A4 PDF Export:** Generates clean, ATS-friendly single-page resumes.

### 7. Global Demo Reset (`/settings`)
- **Predictable Initial State:** One-click reset restores the canonical starter profile, skills, resumes, roadmap, opportunities, and applications.
- **Storage Diagnostics:** Inspect localStorage byte consumption and export/import full JSON state backups.

---

## 🧪 Automated Testing & Validation

PathPilot includes comprehensive automated test suites covering matching algorithms, boundary cases, and catalogue integrity.

```bash
npm test
```

### Test Suite Results Summary:
- **Skill Analyzer Test Suite (`scripts/test-matching-engine.ts`):** 10 test suites passed.
  - ✓ Token matching & synonym resolution (e.g., PostgreSQL matches SQL, Next.js matches React)
  - ✓ Numerical proficiency conversions (0 to 4 scale)
  - ✓ Zero recorded skills empty state safety
  - ✓ Partial skill scoring & partially developed flags
  - ✓ Weighted formula calculation across mixed proficiencies
  - ✓ Project evidence bonus verification (relevant vs. irrelevant projects)
  - ✓ Catalogue integrity across all 8 configured roles
  - ✓ Adaptive 5-phase roadmap generation
  - ✓ Zero-denominator edge-case protection
  - ✓ Duplicate skill highest-proficiency selection
- **Opportunity Matcher Test Suite (`scripts/test-opportunity-matcher.ts`):** 9 test suites passed.
  - ✓ Role & domain alignment scoring (30 pts exact, 25 pts domain)
  - ✓ Required vs. preferred skills separation and missing detection
  - ✓ Portfolio project technologies contributing to skill overlap
  - ✓ Work mode preference scoring (Remote, Hybrid, On-site, Flexible)
  - ✓ Null / empty candidate profile safety
  - ✓ Match score clamping strictly within [0, 100] with educational disclaimer
  - ✓ Starter demo catalogue integrity across all 10 listings
  - ✓ Representation of diverse opportunity types (Job, Internship, Hackathon, Research, Career Program)
  - ✓ Application tracking pipeline stages validation (9 stages)

### Production Build & Linting:
- **ESLint (`npm run lint`):** 0 errors, 0 warnings.
- **Next.js Production Build (`npm run build`):** Compiled and prerendered 14 static routes cleanly.

---

## ⚠️ Demo Data Limitations & Transparency Disclaimers

1. **Simulated Opportunity Data:** All listings in the catalogue are explicitly flagged with `isDemo: true`, `verificationStatus: "demo_simulated"`, and `listingStatus: "demo_only"`. They represent illustrative scenarios to demonstrate discovery and tracking workflows.
2. **External Application Actions:** PathPilot does not claim external links are active or currently accepting applications. Clicking "Apply (External Demo)" launches an illustrative notification modal without redirecting to broken or unvetted third-party pages.
3. **Alignment Scores vs. Hiring Probability:** A match score is an educational heuristic measuring profile alignment with listing tags. It does **not** indicate candidate selection probability or guarantee employment.
4. **Local Browser Persistence:** All data is stored in the browser's `localStorage` via the decoupled `StorageAdapter`. Clearing browser cache or switching private browsing profiles will restore the default initial state unless backed up via `/settings`.

---

## 🔮 Recommended Future Stages

1. **Authentication & Multi-Tenant Cloud Storage:** Implement Supabase Auth or NextAuth with PostgreSQL backing, seamlessly swapping the `LocalStorageAdapter` with a `RemoteStorageAdapter`.
2. **Live Feed Integrations:** Connect genuine job board APIs (Greenhouse, Ashby, Lever, LinkedIn ATS feeds) through the established `IOpportunityProvider` interface.
3. **Resume PDF Parsing:** Add client-side PDF/DOCX import using Web Workers to extract existing resume content into the profile editor without external OCR APIs.
4. **Automated Status Webhooks:** Track interview invitations and email updates via authenticated webhook bridges.

---

## 📄 License
MIT License. Built for **PathPilot (`skill_pulse`) — AI Career & Skill Navigator**.
