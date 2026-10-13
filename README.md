# Skill_pulse ai — AI Career & Skill Navigator

> **Stage 3 — Personalized Resume Builder, ATS-Conscious Generator & Templates**  
> A modular, dark-first career progression platform built with Next.js (App Router), TypeScript in strict mode, and Tailwind CSS. Tailored specifically for students, fresh graduates, and early-career candidates.

---

## ⚡ Quick Start (Zero Setup Required)

**Skill_pulse ai** is engineered for **instant, frictionless local execution**. Anyone on the development team can clone the repository, run the application immediately, and test with the pre-populated demo workspace or build custom role-tailored resumes from scratch.

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

## 🔒 Mandatory Architecture Decision: Zero-Auth & Zero-OCR MVP

**Authentication and OCR scanning are intentionally avoided.**

This build deliberately **does NOT implement**:
- ❌ Signup or login screens, passwords, or authentication middleware
- ❌ Supabase Auth or third-party OAuth
- ❌ Mandatory cloud database credentials, environment keys, or paid API secrets
- ❌ Automatic image scanning or OCR (resumes are built through manual guided entry and verified profile reuse)

### Why This Decision Was Made
1. **Frictionless Developer & Stakeholder Experience:** Anyone can clone, test, and evaluate every screen without configuring database schemas, OAuth providers, or payment gateways.
2. **Clean Domain Modeling First:** The platform architecture focuses on structured student profile models, resume field graphs, STAR bullet builders, and print-accurate templates.
3. **Decoupled Repository Pattern:** All mutations and queries pass through TypeScript interfaces (`IProfileRepository`, `IResumeRepository`, etc.). Data persists cleanly in browser `localStorage`.
4. **Deterministic & Modular Generation:** The resume workflow works out-of-the-box without requiring an AI API key.

---

## 📄 Stage 3: Personalized Resume Builder (`/resume`)

Stage 3 replaces the previous preview with a full-featured, ATS-conscious resume creation and editing suite.

### 1. Guided Resume Creation Workflow
1. **Target Purpose Selection:** Choose from popular career tracks (*Data Analyst Internship*, *Data Science Internship*, *AI/ML Internship*, *Entry-Level Software Developer*, *Junior AI Solutions Engineer*, *Full-Stack Developer*) or define a custom target role and company.
2. **Profile Data Synchronization:** Automatically imports candidate details, education, recorded skills, projects, and work experience from the profile repository.
3. **Missing Information Identification:** Identifies only missing fields (e.g., missing phone number, city, or projects lacking outcome metrics). Avoids repeatedly asking for information already recorded in the profile.
4. **STAR / Action-Problem-Tech-Impact Bullet Helper:** Guides users to describe projects and internships using:
   - *Action performed*
   - *Problem addressed*
   - *Tools or technologies used*
   - *Actual result or impact*
5. **Truthful Representation Safeguard:** Never invents qualifications, certifications, achievements, experience, or quantitative results. If a needed outcome or metric is missing, the generator leaves a clearly marked editable placeholder: `[Measurable impact: e.g. reduced latency by X% / served Y users]`.
6. **Full Content Review & Template Selection:** Review all sections and select an initial layout before draft generation.

### 2. Three Polished ATS-Conscious Templates
All templates render on a white background with dark typography, standard margins, and print-accurate A4 page dimensions:
- **Classic Professional:** Traditional serif headers, centered contact bar, clean divider rules. Designed for high ATS compliance in enterprise, corporate, and finance applications.
- **Modern Minimal:** Sleek contemporary sans typography, left-aligned header, subtle accent badges, balanced whitespace, and crisp line dividers.
- **Technical / Project-Focused:** Emphasizes technical skills and engineering projects. Prominently displays stack badges, repository links, monospace indicators, and outcome metrics.

### 3. Interactive Split-Pane Editor & Live Preview
- **Section Management:** Accordion tabs for Contact, Professional Summary, Categorized Skills (Technical, Tools, Soft), Experience, Projects, Education, Certifications, Achievements, and Coursework.
- **Section Reordering & Visibility:** Users can reorder any section using Up/Down controls and toggle visibility of optional sections on or off.
- **Inline STAR Bullet Builder:** Modal assistant with strong action verbs categorized by engineering domain (Development, Optimization, Analysis, Leadership) to help formulate impactful bullet points.
- **Real-Time Print Preview:** Scaled A4 preview with zoom controls (60% to 120%), template switcher, and fullscreen preview mode.

### 4. Optional Job Description Keyword Matcher
- Paste any job posting description into the ATS analyzer.
- Inspect vocabulary alignment (match percentage heuristic), matched keywords, and gap keywords.
- Actionable recommendations for highlighting relevant tools if the user has experience with them.
- **Prominent Disclaimer:** Clearly informs candidates that ATS alignment scores are informational heuristics and do not guarantee interviews or employment offers.

### 5. Draft Persistence & PDF Export
- Stores independent drafts in HTML5 `localStorage` with draft ID, title, target role, template, structured content, and timestamps.
- **Draft Operations:** Create, Save, Edit, Duplicate, Rename, Set as Primary, and Delete with confirmation modal.
- **A4 PDF Export:** Print-specific stylesheet (`@media print`) isolates the resume document, applies standard 12mm page margins, suppresses application navigation, and enables the browser's native Print / Save-as-PDF flow without paid third-party dependencies.

---

## 🧭 Application Navigation & Routes

| Route | View | Description | Stage Status |
|---|---|---|---|
| `/` or `/dashboard` | **Dashboard** | Candidate welcome, completion meters, target role readiness, roadmap preview, and activity log. | **Stage 1 & 2** |
| `/onboarding` | **Profile Wizard** | 7-step guided onboarding wizard for students and early-career candidates. | **Stage 2** |
| `/profile` | **My Profile** | Comprehensive profile management: education, skills, projects, experience, certs, and score breakdown. | **Stage 2** |
| `/resume` | **Resume Builder** | Multi-draft ATS resume generator, split-pane editor, STAR bullet helper, and A4 PDF export. | **Stage 3 (Active)** |
| `/skills` | **Skill Analyzer** | Categorized skills, proficiency bars, target role flags, and Add Skill modal. | **Stage 3 Preview** |
| `/roadmap` | **Career Roadmap** | Multi-phase milestone progression timeline with interactive checklists. | **Stage 4 Preview** |
| `/opportunities` | **Opportunities** | Curated role listings with match scores and skill chips. | **Stage 5 Preview** |
| `/saved-opportunities`| **Saved Roles** | Pinned opportunities with empty-state handling. | **Stage 5 Preview** |
| `/tracker` | **Application Tracker** | Visual Kanban pipeline (Applied, Screening, Technical, Offer). | **Stage 5 Preview** |
| `/settings` | **Settings & Storage** | Storage diagnostics, JSON backup export/import, and demo reset modal. | **Stage 1 & 2** |

---

## 🧪 Verification & Testing Guide

### Testing Stage 3 Resume Builder Locally:
1. **Access the Dashboard:**
   - Navigate to `/resume`. Confirm existing demo drafts (*AI Solutions Engineer*, *Full-Stack Developer*, *Machine Learning Research*) render in the draft grid with template tags, ATS alignment heuristics, and completion percentages.
2. **Create a New Draft via the Wizard:**
   - Click **Create New Resume**.
   - Step 1: Select **Data Analyst Internship** (or choose any preset / custom role).
   - Step 2: Observe verified data imported from your profile. Paste an optional job description to check keyword alignment.
   - Step 3: Enter any missing details (e.g., location or target skills).
   - Step 4: Choose between *Classic Professional*, *Modern Minimal*, or *Technical / Project-Focused* templates. Click **Generate & Open in Editor**.
3. **Test the Split-Pane Editor:**
   - Edit the summary or contact details. Observe instant live updates on the right-hand A4 preview.
   - Open a project or experience entry and click **STAR Bullet Helper**. Build a structured bullet using action verbs, tools, and impact metrics.
   - Expand **Reorder or Hide Resume Sections** at the bottom of the editor. Toggle visibility of Coursework or reorder sections.
   - Click **Save Draft** and confirm the storage confirmation badge appears.
4. **Test Draft Duplication & Deletion:**
   - Return to the Drafts dashboard.
   - Click the **Duplicate** button on a draft. Confirm an independent copy is created with `(Copy)` appended.
   - Click **Delete** on the copy and confirm deletion in the confirmation modal. Ensure the original draft remains intact.
5. **Test PDF Export:**
   - Open any draft in Preview mode and click **Export / Print PDF**.
   - Confirm the browser print preview opens showing a clean, white A4 document with black text, zero UI clutter, and proper page breaks.
6. **Verify Refresh Persistence:**
   - Refresh the page (`F5`) and confirm all newly created and edited drafts persist in local storage.

### Quality Assurance Commands

```bash
# 1. ESLint verification (Zero errors, zero warnings)
npm run lint

# 2. Production build & TypeScript check
npm run build
```

---

## 📄 License
MIT License. Built for **Skill_pulse ai — AI Career & Skill Navigator**.
