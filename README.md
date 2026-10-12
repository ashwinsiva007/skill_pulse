# Skill_pulse ai — AI Career & Skill Navigator

> **Stage 2 — Comprehensive Profile Builder, Onboarding Wizard & Candidate Profile System**  
> A modular, dark-first career progression platform built with Next.js (App Router), TypeScript in strict mode, and Tailwind CSS. Tailored specifically for students, fresh graduates, and early-career candidates.

---

## ⚡ Quick Start (Zero Setup Required)

**Skill_pulse ai** is engineered for **instant, frictionless local execution**. Anyone on the development team can clone the repository, run the application immediately, and test with the pre-populated demo workspace or run the onboarding wizard from scratch.

### Prerequisites
- Node.js `v18+` or `v20+` (Tested on Node `v24`)
- npm / yarn / pnpm

### Installation & Run

```bash
# 1. Install dependencies
npm install

# 2. Launch the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to immediately access **Skill_pulse ai**.

---

## 🔒 Mandatory Architecture Decision: Zero-Auth MVP

**Authentication is intentionally postponed until AFTER Stage 5.**

This build deliberately **does NOT implement**:
- ❌ Signup or login screens
- ❌ Passwords or password-reset flows
- ❌ Supabase Auth or third-party OAuth
- ❌ Authentication middleware blocking routes
- ❌ Mandatory cloud database credentials, environment keys, or API secrets

### Why This Decision Was Made
1. **Frictionless Developer & Stakeholder Experience:** Anyone can clone, test, and evaluate every screen without configuring database schemas, OAuth providers, or payment gateways.
2. **Clean Domain Modeling First:** The platform architecture focuses on student profile models, skill graphs, projects, experiences, and onboarding pipelines.
3. **Decoupled Repository Pattern:** All mutations and queries pass through TypeScript interfaces (`IProfileRepository`, `ISkillRepository`, etc.). Swapping from browser local storage to PostgreSQL/Supabase after Stage 5 requires zero alterations to UI components.

---

## 🚀 Stage 2 Feature Implementation

### 1. Multi-Step Onboarding Wizard (`/onboarding`)
A 7-step guided wizard with step progress tracking, draft autosaving, back/continue navigation, and comprehensive review:

- **Step A — Personal & Professional Details:** Full name, professional headline, optional email & phone, city/state/country, LinkedIn URL, GitHub/Portfolio URL, and short biography.
- **Step B — Education Background:** Multiple academic entries supporting institution name, degree level (B.S., B.Tech, M.S., etc.), specialization/major, current year or semester, start year, expected graduation year, and optional GPA/percentage.
- **Step C — Skills Inventory:** Searchable skill input with popular suggestions, proficiency selection (Beginner, Intermediate, Advanced), experience duration, learning interest toggle, project/certification evidence, duplicate prevention, and category grouping.
- **Step D — Career Preferences:** Target job roles, preferred domains/industries (AI/ML, Fintech, Edtech, etc.), preferred locations, workplace mode (Remote, Hybrid, Onsite), opportunity types (Internships, Full-Time Jobs, Research, Hackathons), technologies of interest, and availability/joining period.
- **Step E — Portfolio Projects:** Multiple project records with project title, problem addressed, description, personal contribution, technologies used (tagging), project status (In Progress, Completed, Maintained), date ranges, GitHub repository / live demo URLs, and measurable outcomes/impact.
- **Step F — Experience & Achievements:** Optional entries for internships and work experience, responsibilities, industry certifications, courses, hackathons/competitions, awards, and leadership/extracurricular activities. Optional sections can be skipped without blocking progress.
- **Step G — Review & Verification:** Comprehensive summary of all entered information, live completion score meter, actionable missing information highlights, and direct "Edit Section" links to jump back to any step before final saving.

### 2. Comprehensive Profile Management (`/profile`)
Replaces the placeholder profile with a complete student/candidate profile hub:
- **View Profile:** Header with candidate avatar, role badges, bio, contact links, and active summary metrics.
- **Transparent Profile Completion Meter:** Visual progress bar accompanied by a **"How is this calculated?"** modal displaying exact point allocations and personalized missing items.
- **Edit Personal Details:** Inline modal to edit name, headline, contact, location, and links.
- **Education Management:** Add new academic records, edit existing entries, and delete outdated entries with confirmation safeguards.
- **Skills Management:** Add new skills with proficiency, interest to learn, and evidence tags; remove existing skills.
- **Project Portfolio:** Add/edit projects with problems, contributions, tech tags, and links; remove projects.
- **Experience & Honors:** Add/edit internships, responsibilities, and certifications.
- **Career Preferences:** Update target roles, workplace mode, opportunity types, and domains.

### 3. Deterministic Profile Completion Calculation
Defined in [`lib/profile-completion.ts`](lib/profile-completion.ts), the completion score is calculated transparently using an objective 100-point scale across 6 pillars:
- **Personal Details (20 pts):** Name (5), Headline (5), Bio (5), Location (3), Links (2)
- **Education (15 pts):** At least one academic record (15)
- **Skills (20 pts):** 1–2 skills (10), 3–4 skills (15), 5+ skills (20)
- **Career Preferences (15 pts):** Target roles (5), Opportunity types (5), Domains/locations (5)
- **Projects (15 pts):** 1 project (10), 2+ projects (15)
- **Experience & Honors (15 pts):** 1 entry (10), 2+ entries (15)

Users can open the **Completion Breakdown Modal** at any time to inspect their score and see exact recommendations for reaching 100%.

---

## 💾 Data Structure & Local Persistence

### Strongly Typed Models
All domain models are located in `types/`:
- [`CandidateProfile`](types/profile.ts)
- [`EducationEntry`](types/education.ts)
- [`Skill`](types/skill.ts)
- [`CareerPreferences`](types/preferences.ts)
- [`ProjectEntry`](types/project.ts)
- [`ExperienceEntry`, `CertificationEntry`, etc.](types/experience.ts)

### Consistency & Persistence Guarantees
- Every editable record (education, project, experience, skill) has a unique UUID (`id`), preventing edits to one entry from overwriting another.
- Data is saved under the `skillpulse_mvp_v1:*` namespace in HTML5 `localStorage`.
- Storage access is guarded with Zod schemas ([`lib/validations/profile.ts`](lib/validations/profile.ts)) and safe JSON parsing fallback handlers.
- Edits persist across page refreshes and browser re-launches.
- **Seed Data Safety:** The initial demo candidate (Alex Morgan) is seeded only once on first run and is **never** re-seeded over user edits on render.
- **Reset Safeguard:** A confirmation modal allows restoring default demo data at any time via the TopBar, Demo Banner, or Settings page.

---

## 🧭 Application Navigation & Routes

| Route | View | Description | Stage Status |
|---|---|---|---|
| `/` or `/dashboard` | **Dashboard** | Candidate welcome, live completion meter, target role readiness, roadmap preview, and activity log. | **Stage 2 (Active)** |
| `/onboarding` | **Profile Wizard** | 7-step guided onboarding wizard for students and early-career candidates with review and draft autosave. | **Stage 2 (Active)** |
| `/profile` | **My Profile** | Comprehensive profile view & management: education, skills, projects, experience, certs, and score breakdown. | **Stage 2 (Active)** |
| `/resume` | **Resume Builder** | Saved resume drafts manager, ATS optimization scores, and section completion meters. | **Stage 2 Pipeline** |
| `/skills` | **Skill Analyzer** | Categorized skills, proficiency bars, target role flags, and Add Skill modal with live persistence. | **Stage 3 Preview** |
| `/roadmap` | **Career Roadmap** | Multi-phase milestone progression timeline with interactive action checklists. | **Stage 4 Preview** |
| `/opportunities` | **Opportunities** | Curated fictional role listings with match scores, matched/missing skill chips, save role, and quick apply. | **Stage 5 Preview** |
| `/saved-opportunities`| **Saved Roles** | Pinned opportunities with empty-state handling and quick apply links. | **Stage 5 Preview** |
| `/tracker` | **Application Tracker** | Visual Kanban pipeline (Applied, Screening, Technical, Offer) with notes and stage updates. | **Stage 5 Preview** |
| `/settings` | **Settings & Storage** | Storage diagnostics, JSON backup export/import, seed data reset modal, and roadmap inspection. | **Stage 2 (Active)** |

---

## 🧪 Verification & Testing Guide

You can test the complete Stage 2 workflow locally:

1. **Open the Wizard:**
   - Navigate to `/onboarding` (or click "Profile Wizard" from the sidebar or dashboard).
2. **Complete the Steps:**
   - Step A: Enter or modify personal details.
   - Step B: Add an education entry (e.g., Stanford University, B.S. Computer Science).
   - Step C: Add skills with proficiency levels and evidence tags.
   - Step D: Set career preferences (target roles, remote preference, internships/jobs).
   - Step E: Add portfolio projects with description, technologies, and GitHub links.
   - Step F: Add internships or certifications (or skip if none).
   - Step G: Inspect the summary in Review mode and check the live score calculation.
   - Click **Save & Complete Profile**.
3. **Verify Persistence Across Refresh:**
   - Refresh the page (`F5`).
   - Navigate to `/profile` — confirm all saved details, projects, education, and skills remain intact.
4. **Test Individual Record Editing:**
   - On `/profile`, click **Edit** on a specific project or education record.
   - Modify the title or year and save.
   - Confirm that only that record updated and other records remained untouched.
5. **Verify Score Calculation Breakdown:**
   - Click **"How is this calculated?"** next to the completion meter on `/profile`.
   - Verify the 6-pillar breakdown matches the entered criteria.
6. **Reset Demo Data:**
   - Click **Reset Demo** in the top bar or demo banner.
   - Confirm the initial fictional demo candidate (Alex Morgan) is restored cleanly.

### Quality Assurance Commands

```bash
# 1. TypeScript strict type-check
npx tsc --noEmit

# 2. ESLint verification
npm run lint

# 3. Production build
npm run build
```

---

## 📄 License
MIT License. Built for **Skill_pulse ai — AI Career & Skill Navigator**.
