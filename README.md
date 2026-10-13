# Skill_pulse ai — AI Career & Skill Navigator

> **Stage 4 — Explainable Skill Analyzer, Career Catalogue & Adaptive Roadmap**  
> A modular, dark-first career progression platform built with Next.js (App Router), TypeScript in strict mode, and Tailwind CSS. Tailored specifically for students, fresh graduates, and early-career candidates.

---

## ⚡ Quick Start (Zero Setup Required)

**Skill_pulse ai** is engineered for **instant, frictionless local execution**. Anyone on the development team can clone the repository, run the application immediately, and test with the pre-populated demo workspace or build custom role-tailored resumes and roadmaps from scratch.

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on Node `v24`)
- npm / yarn / pnpm

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Run unit test suite (10 test suites)
npm test

# 3. Launch the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to immediately access **Skill_pulse ai**.

---

## 🔒 Architecture Philosophy: Explainable Rules-Based Engine & Zero Cloud Lock-In

**Skill_pulse ai intentionally avoids black-box AI models, mandatory cloud accounts, and authentication hurdles.**

This build deliberately **does NOT implement**:
- ❌ Signup or login screens, passwords, or authentication middleware
- ❌ Supabase Auth or third-party OAuth
- ❌ Mandatory cloud database credentials, environment keys, or paid AI API secrets
- ❌ Black-box "AI hiring probability" or "job readiness guarantee" claims

### Why This Decision Was Made
1. **Explainability & Transparency:** Students and fresh graduates deserve to know *exactly* why their alignment score is 65% versus 85%. Every score is derived from an audited, unit-testable formula based on recorded skills and demonstrable portfolio evidence.
2. **Pedagogical Honesty:** A score does not represent a hiring probability or guarantee employment. If a skill is marked "Not Yet Recorded", it simply means it is not yet documented or evidenced in the profile—not that the candidate lacks the skill.
3. **Decoupled Repository Pattern:** All mutations and queries pass through TypeScript interfaces (`IProfileRepository`, `ISkillRepository`, `IResumeRepository`, `IRoadmapRepository`). Data persists cleanly in browser `localStorage`.
4. **Frictionless Local Evaluation:** Reviewers and recruiters can clone and test all features instantly without configuring cloud infrastructure.

---

## 🎯 Stage 4: Skill Analyzer & Career PathPilot (`/skills` & `/roadmap`)

Stage 4 introduces an explainable skill-matching engine, a configurable career catalogue of 8 starter tracks, an interactive diagnostic dashboard, and an adaptive 5-phase career roadmap.

### 1. Configurable Career & Skill Catalogue
The starter catalogue (`lib/career-catalogue/career-catalogue.ts`) is completely modularized in its own decoupled module, organized across engineering and data domains:
- **Data Analyst** (Data & Analytics) — Core: SQL, Python, Tableau; Supporting: Excel & Data Cleaning, Statistical Foundations.
- **Data Scientist** (Data Science & Analytics) — Core: Python, Machine Learning, Statistical Modeling, SQL; Supporting: Data Visualization, Big Data & Cloud.
- **Machine Learning Engineer** (AI & Machine Learning) — Core: Python, PyTorch / Deep Learning, MLOps & Model Deployment, Software Engineering; Supporting: Docker, Data Engineering.
- **Business Intelligence Analyst** (Data & Analytics) — Core: SQL, Power BI / Tableau, Data Modeling, KPI Development; Supporting: Excel, Stakeholder Communication.
- **Software Developer** (Software Engineering) — Core: Core Programming, Data Structures & Algorithms, Git & Team Collaboration, SQL & Relational Databases; Supporting: REST APIs, Automated Testing.
- **Frontend Developer** (Web & Frontend) — Core: JavaScript / TypeScript, React & Modern UI, CSS / Tailwind, Web Performance; Supporting: State Management, Testing.
- **Backend Developer** (Systems & Backend) — Core: Backend Language, REST & GraphQL APIs, Relational & NoSQL Databases, System Design; Supporting: Docker, CI/CD.
- **AI Engineer** (AI & Systems) — Core: LLM Orchestration & Prompting, Python, RAG & Vector Databases, API Engineering; Supporting: Docker, AI Evals & Observability.

Each role profile defines:
- Required core competencies (weight 3x) and supporting competencies (weight 1x)
- Expected target proficiency level (Beginner, Intermediate, Advanced, Expert)
- Real-world capstone example projects with suggested tech stacks and deliverables
- Curated learning activities and portfolio evidence tips (what recruiters look for)
- Verified learning resource URLs (documentation, free tutorials, official guides)

---

### 2. Transparent Skill-Matching Mathematical Formula

The scoring engine (`lib/skill-analyzer/matching-engine.ts`) calculates an explainable alignment percentage:

$$\text{Score} = \text{round}\left( \frac{\sum_{i=1}^N W_i \times \text{EffectiveRatio}_i}{\sum_{i=1}^N W_i \times 1.0} \times 100 \right)$$

Where:
- **Numerical Scale:** `None = 0`, `Beginner = 1`, `Intermediate = 2`, `Advanced = 3`, `Expert = 4`.
- **Competency Importance Weight ($W_i$):** Core skills = `3x`; Supporting skills = `1x`.
- **Proficiency Ratio:** $\min\left(\frac{\text{UserLevel}_i}{\text{ExpectedLevel}_i}, 1.0\right)$.
- **Portfolio Evidence Bonus:** Skills demonstrated in profile projects receive a $+0.1$ verification boost (capped at 1.0).
- **Practical Baseline:** If a skill was not explicitly recorded in the skills list but was demonstrated in a portfolio project, it receives baseline practical credit (`Level 1 / Beginner`).
- **Edge Case Protection:**
  - Zero denominator protection (roles with zero requirements safely return `0`).
  - Empty candidate skill lists safely return `0%`.
  - Duplicate user skills safely take the maximum proficiency level recorded.
  - Case-insensitive tokenization and synonym resolution (e.g., `"PostgreSQL"` matches `"SQL"`, `"Next.js"` matches `"React"`).

---

### 3. Interactive Skill Analyzer Dashboard (`/skills`)

- **Target Role Selector:** Switch between any of the 8 configured tracks or use quick-switch pills. Selection is persisted in `localStorage`.
- **Match Metrics Grid:**
  - *Overall Match Index* with progress indicator and an accessible badge (*Strong Match*, *Moderate Match*, *Development Target*).
  - *Core Skill Coverage %* and *Supporting Skill Coverage %*.
  - *Project Proof Evidence* count linking demonstrable profile projects.
  - *Scoring Audit Modal:* Full breakdown of points earned vs points possible and mathematical formula audit.
- **High-Impact Next Actions Card:** Top 3 prioritized recommendations (e.g., missing core competencies, skills needing advancement, or capstone project suggestions).
- **Skill Gap Diagnostic:**
  - Filterable tabs: *Not Yet Recorded*, *Partially Developed*, and *Matched*.
  - Expandable detail drawers providing:
    - *Role Competency Scope*
    - *Suggested Learning Activity*
    - *Portfolio Evidence Tip* (what recruiters verify in code repositories)
  - Quick `+ Record in Profile` button opening pre-filled skill modal.
- **Benchmark Comparison Chart:** Accessible table with dual-layer visual level meters comparing user proficiency against expected benchmark.
- **Project Evidence Card:** Maps portfolio projects to required competencies with links to profile management.
- **Multi-Role Alignment Comparison Modal:** Side-by-side comparison across all 8 roles sorted by highest match index, allowing immediate target role switching.

---

### 4. Personalized 5-Phase Career Roadmap (`/roadmap`)

Generates an adaptive, step-by-step career development plan based on the selected target role and detected skill gaps:

1. **Phase 1: Foundational Mastery** — Focuses on syntax, core principles, and mental models of missing core competencies.
2. **Phase 2: Deliberate Practice** — Focuses on applied algorithmic exercises and practical problem sets to advance partially developed skills to expected proficiency.
3. **Phase 3: Capstone Engineering** — Focuses on designing, building, and deploying the recommended role capstone project with clean repository structure.
4. **Phase 4: Presentation & Artifacts** — Focuses on translating project outcomes into STAR bullet points and generating a tailored resume in the PathPilot Resume Builder (`/resume`).
5. **Phase 5: Career Transition** — Focuses on technical interview problem domains, bookmarking opportunities (`/opportunities`), and tracking applications (`/tracker`).

**Roadmap Features:**
- **Interactive Checklists:** Check/uncheck action items to dynamically update milestone progress percentage and overall roadmap progress.
- **External Resource Links:** Direct clickable links to verified documentation and tutorials.
- **Custom Tasks:** Users can add personal study tasks to any phase.
- **Personal Notes & Reflection Log:** Persistent notes textarea per milestone to record study notes, repository links, or blockers.
- **Time Estimates:** Clearly marked as estimates (e.g., `~3w (Est)`).
- **Controls & Persistence:**
  - "Re-generate from Skill Gaps" button to synchronize roadmap with recent profile skill edits.
  - "Restore Demo Roadmap" button to restore initial starter state.
  - Persists in `localStorage` across page refreshes.

---

## 🧪 Unit Test Suite Coverage & Results

A dedicated unit test suite (`scripts/test-matching-engine.ts`) validates the rules-based matching engine and edge cases using Node.js assertions:

```bash
npm test
```

### Test Suite Execution Output:
```
=================================================
   PATHPILOT SKILL ANALYZER UNIT TEST SUITE
=================================================

TEST 1: Token matching & synonym resolution...
  ✓ Token matching & synonyms pass

TEST 2: Proficiency level numerical scale (0 to 4)...
  ✓ Proficiency conversions pass

TEST 3: Candidate with zero recorded skills...
  ✓ Zero skills empty state handled safely

TEST 4: Candidate with 1 or 2 skills...
  ✓ 1 skill score: 7% (partially developed) passes

TEST 5: Several skills across different proficiency levels...
  ✓ Mixed proficiencies score: 63% passes

TEST 6: Project evidence verification...
  ✓ Project evidence accurately filters relevant vs irrelevant proof

TEST 7: Catalogue integrity across all 8 configured roles...
  ✓ All 8 roles evaluated successfully without exceptions

TEST 8: Adaptive Roadmap generation from detected skill gaps...
  ✓ Roadmap generated 5 valid phases with action items

TEST 9: Edge case - Zero denominator / Empty role requirements...
  ✓ Zero denominator safely returns 0 without division by zero error

TEST 10: Duplicate skills in profile (takes highest proficiency)...
  ✓ Duplicate skills handled by selecting highest proficiency

=================================================
   ALL 10 TEST SUITES PASSED SUCCESSFULLY! ✓
=================================================
```

---

## 🧭 Application Navigation & Routes

| Route | View | Description | Stage Status |
|---|---|---|---|
| `/` or `/dashboard` | **Dashboard** | Candidate welcome, completion meters, target role readiness, roadmap preview, and activity log. | **Stage 1 & 2** |
| `/onboarding` | **Profile Wizard** | 7-step guided onboarding wizard for students and early-career candidates. | **Stage 2** |
| `/profile` | **My Profile** | Comprehensive profile management: education, skills, projects, experience, certs, and score breakdown. | **Stage 2** |
| `/resume` | **Resume Builder** | Multi-draft ATS resume generator, split-pane editor, STAR bullet helper, and A4 PDF export. | **Stage 3 (Active)** |
| `/skills` | **Skill Analyzer** | Explainable 8-role matching engine, gap diagnostics, proficiency comparisons, and multi-role comparison. | **Stage 4 (Active)** |
| `/roadmap` | **Career Roadmap** | Adaptive 5-phase career progression roadmap with interactive tasks, resources, and personal notes. | **Stage 4 (Active)** |
| `/opportunities` | **Opportunities** | Curated role listings with match scores and skill chips. | **Stage 5 Preview** |
| `/saved-opportunities`| **Saved Roles** | Pinned opportunities with empty-state handling. | **Stage 5 Preview** |
| `/tracker` | **Application Tracker** | Visual Kanban pipeline (Applied, Screening, Technical, Offer). | **Stage 5 Preview** |
| `/settings` | **Settings & Storage** | Storage diagnostics, JSON backup export/import, and demo reset modal. | **Stage 1 & 2** |

---

## 📄 License
MIT License. Built for **Skill_pulse ai — AI Career & Skill Navigator**.
