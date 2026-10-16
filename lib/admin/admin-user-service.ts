import { CandidateProfile } from "@/types/profile";
import { firestoreService } from "@/lib/firebase/firestore-service";
import { storageAdapter } from "@/lib/storage/storage-adapter";
import { STORAGE_KEYS } from "@/lib/storage/keys";

export interface AdminUserRecord {
  uid: string;
  name: string;
  email: string;
  headline?: string;
  targetRole: string;
  careerLevel: string;
  location: string;
  city: string;
  state?: string;
  skills: string[];
  skillsCount: number;
  resumesCount: number;
  profileCompletion: number;
  readinessScore: number;
  educationInstitution: string;
  degree: string;
  lastActive: string;
  syncedMode: "Cloud Firestore" | "Local Device" | "Demo Candidate";
  rawProfile: CandidateProfile;
}

function createSeedCandidate(data: Partial<CandidateProfile> & { id: string; name: string; email: string; targetRole: string }): CandidateProfile {
  return {
    headline: `${data.targetRole} Specialist`,
    currentRole: "Candidate",
    careerLevel: "Junior" as any,
    yearsOfExperience: 1,
    location: "India",
    bio: "",
    avatarUrl: "",
    profileCompletionPercentage: 80,
    careerReadinessScore: 80,
    targetIndustry: "Technology",
    availability: "Immediate",
    links: [],
    education: [],
    projects: [],
    experience: [],
    certifications: [],
    courses: [],
    hackathons: [],
    awards: [],
    leadership: [],
    updatedAt: new Date().toISOString(),
    ...data,
  } as CandidateProfile;
}

/**
 * Curated candidate database records representing real users & demographic profiles
 * across India's top tech hubs and diverse engineering disciplines.
 */
export const SEED_ADMIN_USERS: AdminUserRecord[] = [
  {
    uid: "usr-ind-001",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    headline: "Full Stack Developer | React, Next.js & Node.js",
    targetRole: "Full Stack Developer",
    careerLevel: "Junior (0-2 years)",
    location: "Bengaluru, Karnataka, India",
    city: "Bengaluru",
    state: "Karnataka",
    skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Git"],
    skillsCount: 7,
    resumesCount: 2,
    profileCompletion: 92,
    readinessScore: 88,
    educationInstitution: "PES University, Bengaluru",
    degree: "B.Tech in Computer Science",
    lastActive: "10 minutes ago",
    syncedMode: "Cloud Firestore",
    rawProfile: createSeedCandidate({
      id: "usr-ind-001",
      name: "Rahul Sharma",
      email: "rahul.sharma@example.com",
      headline: "Full Stack Developer | React, Next.js & Node.js",
      currentRole: "Junior Developer",
      targetRole: "Full Stack Developer",
      careerLevel: "Junior (0-2 years)" as any,
      yearsOfExperience: 1,
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
      location: "Bengaluru, Karnataka, India",
      phone: "+91 98450 11223",
      linkedInUrl: "https://linkedin.com/in/rahulsharma-dev",
      githubUrl: "https://github.com/rahulsharma-dev",
      bio: "Passionate full-stack developer with 1+ years building responsive web apps with React 19 and scalable Node.js microservices.",
      profileCompletionPercentage: 92,
      careerReadinessScore: 88,
      education: [
        {
          id: "edu-001",
          institution: "PES University, Bengaluru",
          degree: "B.Tech in Computer Science & Engineering",
          specialization: "Computer Science",
          startYear: 2020,
          expectedGraduationYear: 2024,
          yearOrSemester: "Graduate",
          gpa: "8.6 / 10.0",
        },
      ],
      projects: [
        {
          id: "proj-001",
          title: "OmniCart E-Commerce Microservices",
          problem: "High latency during flash sales.",
          description: "Built order processing pipeline with Redis caching and PostgreSQL.",
          personalContribution: "Implemented checkout API and stripe webhook handlers.",
          technologies: ["Node.js", "Express", "Redis", "PostgreSQL"],
          status: "Completed",
        },
      ],
      experience: [
        {
          id: "exp-001",
          company: "Infosys Labs",
          role: "Software Engineering Intern",
          type: "Internship",
          location: "Bengaluru",
          startDate: "2023-06",
          endDate: "2024-01",
          isCurrent: false,
          responsibilities: "Developed internal dashboard tools using React and Tailwind CSS.",
        },
      ],
      certifications: [{ id: "c1", name: "AWS Certified Developer - Associate", issuer: "AWS", issueDate: "2024" }],
      preferences: {
        targetJobRoles: ["Full Stack Developer", "Backend Engineer"],
        preferredDomains: ["E-Commerce", "FinTech"],
        preferredLocations: ["Bengaluru", "Remote"],
        workplacePreference: "Hybrid",
        opportunityTypes: ["Full-time Jobs"],
        technologiesOfInterest: ["Next.js", "Docker", "GraphQL"],
        availability: "Immediate",
      },
      updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    }),
  },
  {
    uid: "usr-ind-002",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    headline: "Frontend Engineer | UI/UX & React Specialist",
    targetRole: "Frontend Developer",
    careerLevel: "Junior (0-2 years)",
    location: "Chennai, Tamil Nadu, India",
    city: "Chennai",
    state: "Tamil Nadu",
    skills: ["React", "TypeScript", "Tailwind CSS", "Redux Toolkit", "Figma", "HTML5/CSS3"],
    skillsCount: 6,
    resumesCount: 1,
    profileCompletion: 85,
    readinessScore: 82,
    educationInstitution: "Anna University (CEG), Chennai",
    degree: "B.E. in Information Technology",
    lastActive: "1 hour ago",
    syncedMode: "Cloud Firestore",
    rawProfile: createSeedCandidate({
      id: "usr-ind-002",
      name: "Priya Patel",
      email: "priya.patel@example.com",
      headline: "Frontend Engineer | UI/UX & React Specialist",
      currentRole: "Frontend Developer Aspirant",
      targetRole: "Frontend Developer",
      careerLevel: "Junior (0-2 years)" as any,
      yearsOfExperience: 1,
      city: "Chennai",
      state: "Tamil Nadu",
      country: "India",
      location: "Chennai, Tamil Nadu, India",
      phone: "+91 97900 44556",
      linkedInUrl: "https://linkedin.com/in/priyapatel-ui",
      githubUrl: "https://github.com/priyapatel-ui",
      bio: "Frontend engineer focused on accessible, ultra-fast web experiences with modern CSS and React 19.",
      profileCompletionPercentage: 85,
      careerReadinessScore: 82,
      education: [
        {
          id: "edu-002",
          institution: "College of Engineering, Guindy (CEG), Anna University",
          degree: "B.E. in Information Technology",
          specialization: "Information Technology",
          startYear: 2020,
          expectedGraduationYear: 2024,
          yearOrSemester: "Graduate",
          gpa: "8.9 / 10.0",
        },
      ],
      projects: [
        {
          id: "proj-002",
          title: "SaaS Analytics Dashboard",
          problem: "Complex financial data hard to comprehend for SMB owners.",
          description: "Interactive visualization portal with Chart.js and Tailwind CSS.",
          personalContribution: "Designed all UI components and API integration.",
          technologies: ["React", "Chart.js", "Tailwind CSS"],
          status: "Completed",
        },
      ],
      experience: [],
      certifications: [{ id: "c2", name: "Meta Frontend Developer Professional Certificate", issuer: "Coursera / Meta", issueDate: "2024" }],
      preferences: {
        targetJobRoles: ["Frontend Developer", "UI/UX Engineer"],
        preferredDomains: ["SaaS", "EdTech"],
        preferredLocations: ["Chennai", "Bengaluru", "Remote"],
        workplacePreference: "Flexible",
        opportunityTypes: ["Full-time Jobs", "Internships"],
        technologiesOfInterest: ["React", "TypeScript", "Next.js"],
        availability: "Within 15 days",
      },
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    }),
  },
  {
    uid: "usr-ind-003",
    name: "Amit Kumar Verma",
    email: "amit.verma@example.com",
    headline: "Data Analyst & Business Intelligence Lead",
    targetRole: "Data Analyst",
    careerLevel: "Entry-Level / Student",
    location: "Hyderabad, Telangana, India",
    city: "Hyderabad",
    state: "Telangana",
    skills: ["Python", "SQL", "Power BI", "Tableau", "Pandas", "NumPy", "Excel Analytics"],
    skillsCount: 7,
    resumesCount: 1,
    profileCompletion: 80,
    readinessScore: 78,
    educationInstitution: "IIT Hyderabad",
    degree: "B.Tech in Data Science",
    lastActive: "3 hours ago",
    syncedMode: "Cloud Firestore",
    rawProfile: createSeedCandidate({
      id: "usr-ind-003",
      name: "Amit Kumar Verma",
      email: "amit.verma@example.com",
      headline: "Data Analyst & Business Intelligence Lead",
      currentRole: "Student",
      targetRole: "Data Analyst",
      careerLevel: "Entry-Level / Student" as any,
      yearsOfExperience: 0,
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      location: "Hyderabad, Telangana, India",
      phone: "+91 91234 56789",
      linkedInUrl: "https://linkedin.com/in/amitkumar-data",
      githubUrl: "https://github.com/amitkumar-data",
      bio: "Aspiring Data Analyst skilled in Python, SQL query optimization, and executive Power BI dashboards.",
      profileCompletionPercentage: 80,
      careerReadinessScore: 78,
      education: [
        {
          id: "edu-003",
          institution: "Indian Institute of Technology (IIT), Hyderabad",
          degree: "B.Tech in Computational Data Science",
          specialization: "Data Science & AI",
          startYear: 2021,
          expectedGraduationYear: 2025,
          yearOrSemester: "Final Year",
          gpa: "8.4 / 10.0",
        },
      ],
      projects: [
        {
          id: "proj-003",
          title: "Indian E-Commerce Customer Churn Predictor",
          problem: "High drop-off of first-time tier-2 city shoppers.",
          description: "Cleaned and modeled 500k transaction records using Python & Scikit-learn.",
          personalContribution: "Feature engineering and dashboard generation.",
          technologies: ["Python", "Pandas", "Scikit-Learn", "Power BI"],
          status: "Completed",
        },
      ],
      experience: [],
      certifications: [{ id: "c3", name: "Google Data Analytics Professional Certificate", issuer: "Google", issueDate: "2024" }],
      preferences: {
        targetJobRoles: ["Data Analyst", "Business Analyst"],
        preferredDomains: ["FinTech", "Supply Chain"],
        preferredLocations: ["Hyderabad", "Bengaluru"],
        workplacePreference: "Hybrid",
        opportunityTypes: ["Internships", "Full-time Jobs"],
        technologiesOfInterest: ["Python", "SQL", "Snowflake"],
        availability: "Summer 2025",
      },
      updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    }),
  },
  {
    uid: "usr-ind-004",
    name: "Sneha Rao",
    email: "sneha.rao@example.com",
    headline: "AI / Machine Learning Engineer | PyTorch & RAG",
    targetRole: "AI Engineer",
    careerLevel: "Junior (0-2 years)",
    location: "Pune, Maharashtra, India",
    city: "Pune",
    state: "Maharashtra",
    skills: ["Python", "PyTorch", "Hugging Face", "LangChain", "Vector DBs", "FastAPI", "Docker"],
    skillsCount: 7,
    resumesCount: 2,
    profileCompletion: 95,
    readinessScore: 92,
    educationInstitution: "COEP Technological University, Pune",
    degree: "B.Tech in Artificial Intelligence",
    lastActive: "Yesterday",
    syncedMode: "Cloud Firestore",
    rawProfile: createSeedCandidate({
      id: "usr-ind-004",
      name: "Sneha Rao",
      email: "sneha.rao@example.com",
      headline: "AI / Machine Learning Engineer | PyTorch & RAG",
      currentRole: "AI Engineer",
      targetRole: "AI Engineer",
      careerLevel: "Junior (0-2 years)" as any,
      yearsOfExperience: 1,
      city: "Pune",
      state: "Maharashtra",
      country: "India",
      location: "Pune, Maharashtra, India",
      phone: "+91 98220 77889",
      linkedInUrl: "https://linkedin.com/in/sneharao-ai",
      githubUrl: "https://github.com/sneharao-ai",
      bio: "Engineered scalable RAG pipelines, LLM fine-tuning scripts, and automated inference microservices with FastAPI.",
      profileCompletionPercentage: 95,
      careerReadinessScore: 92,
      education: [
        {
          id: "edu-004",
          institution: "College of Engineering Pune (COEP)",
          degree: "B.Tech in Computer Science (AI & ML Specialization)",
          specialization: "Artificial Intelligence",
          startYear: 2020,
          expectedGraduationYear: 2024,
          yearOrSemester: "Graduate",
          gpa: "9.1 / 10.0",
        },
      ],
      projects: [
        {
          id: "proj-004",
          title: "LegalGPT - Indian Supreme Court Case Retriever",
          problem: "Searching across 50,000+ judgments is tedious and slow.",
          description: "Hybrid vector search system using Qdrant and LangChain.",
          personalContribution: "Chunking strategy and reranker pipeline.",
          technologies: ["Python", "LangChain", "Qdrant", "FastAPI"],
          status: "Completed",
        },
      ],
      experience: [
        {
          id: "exp-004",
          company: "TCS Research",
          role: "AI Research Intern",
          type: "Internship",
          location: "Pune",
          startDate: "2023-07",
          endDate: "2024-02",
          isCurrent: false,
          responsibilities: "Fine-tuned open-source LLMs on specialized legal and medical corpora.",
        },
      ],
      certifications: [{ id: "c4", name: "Deep Learning Specialization", issuer: "DeepLearning.AI", issueDate: "2023" }],
      preferences: {
        targetJobRoles: ["AI Engineer", "Machine Learning Engineer"],
        preferredDomains: ["DeepTech", "Enterprise AI"],
        preferredLocations: ["Pune", "Bengaluru", "Remote"],
        workplacePreference: "Hybrid",
        opportunityTypes: ["Full-time Jobs"],
        technologiesOfInterest: ["PyTorch", "vLLM", "Kubernetes"],
        availability: "Immediate",
      },
      updatedAt: new Date(Date.now() - 3600000 * 30).toISOString(),
    }),
  },
  {
    uid: "usr-ind-005",
    name: "Vikram Verma",
    email: "vikram.verma@example.com",
    headline: "Cloud & DevOps Engineer | Kubernetes, AWS & Terraform",
    targetRole: "DevOps Engineer",
    careerLevel: "Mid-Level (2-5 years)",
    location: "Gurugram, Haryana / Delhi NCR, India",
    city: "Gurugram",
    state: "Delhi NCR",
    skills: ["Kubernetes", "AWS", "Terraform", "Docker", "CI/CD (GitHub Actions)", "Linux", "Prometheus"],
    skillsCount: 7,
    resumesCount: 1,
    profileCompletion: 88,
    readinessScore: 85,
    educationInstitution: "Delhi Technological University (DTU)",
    degree: "B.Tech in Information Technology",
    lastActive: "2 days ago",
    syncedMode: "Cloud Firestore",
    rawProfile: createSeedCandidate({
      id: "usr-ind-005",
      name: "Vikram Verma",
      email: "vikram.verma@example.com",
      headline: "Cloud & DevOps Engineer | Kubernetes, AWS & Terraform",
      currentRole: "DevOps Specialist",
      targetRole: "DevOps Engineer",
      careerLevel: "Mid-Level (2-5 years)" as any,
      yearsOfExperience: 2.5,
      city: "Gurugram",
      state: "Delhi NCR",
      country: "India",
      location: "Gurugram, Haryana / Delhi NCR, India",
      phone: "+91 99110 33445",
      linkedInUrl: "https://linkedin.com/in/vikramverma-cloud",
      githubUrl: "https://github.com/vikramverma-cloud",
      bio: "DevOps engineer with experience automating multi-region AWS environments, Helm charts, and zero-downtime deployments.",
      profileCompletionPercentage: 88,
      careerReadinessScore: 85,
      education: [
        {
          id: "edu-005",
          institution: "Delhi Technological University (DTU)",
          degree: "B.Tech in Information Technology",
          specialization: "Cloud Infrastructure",
          startYear: 2018,
          expectedGraduationYear: 2022,
          yearOrSemester: "Graduate",
          gpa: "8.2 / 10.0",
        },
      ],
      projects: [
        {
          id: "proj-005",
          title: "Multi-Cluster GitOps Kubernetes Pipeline",
          problem: "Manual deployments caused downtime.",
          description: "ArgoCD and Terraform automated deployment pipeline.",
          personalContribution: "Architected infrastructure as code.",
          technologies: ["Terraform", "Kubernetes", "ArgoCD", "AWS EKS"],
          status: "Completed",
        },
      ],
      experience: [
        {
          id: "exp-005",
          company: "Zomato",
          role: "Associate DevOps Engineer",
          type: "Full-time",
          location: "Gurugram",
          startDate: "2022-08",
          endDate: "2024-10",
          isCurrent: false,
          responsibilities: "Managed EKS clusters and automated microservice telemetry with Prometheus.",
        },
      ],
      certifications: [
        { id: "c5", name: "Certified Kubernetes Administrator (CKA)", issuer: "Cloud Native Computing Foundation", issueDate: "2024" },
        { id: "c6", name: "AWS Solutions Architect - Associate", issuer: "AWS", issueDate: "2023" },
      ],
      preferences: {
        targetJobRoles: ["DevOps Engineer", "Cloud Engineer"],
        preferredDomains: ["Internet Platforms", "SaaS"],
        preferredLocations: ["Gurugram", "Noida", "Remote"],
        workplacePreference: "Remote",
        opportunityTypes: ["Full-time Jobs"],
        technologiesOfInterest: ["Kubernetes", "Terraform", "Go"],
        availability: "30 days notice",
      },
      updatedAt: new Date(Date.now() - 3600000 * 50).toISOString(),
    }),
  },
  {
    uid: "usr-ind-006",
    name: "Karthik Sundaram",
    email: "karthik.s@example.com",
    headline: "Mobile Application Developer | Flutter & React Native",
    targetRole: "Mobile Developer",
    careerLevel: "Junior (0-2 years)",
    location: "Coimbatore, Tamil Nadu, India",
    city: "Coimbatore",
    state: "Tamil Nadu",
    skills: ["Flutter", "Dart", "React Native", "Firebase", "REST APIs", "SQLite", "Mobile UI"],
    skillsCount: 7,
    resumesCount: 1,
    profileCompletion: 82,
    readinessScore: 80,
    educationInstitution: "PSG College of Technology, Coimbatore",
    degree: "B.Tech in Information Technology",
    lastActive: "3 days ago",
    syncedMode: "Cloud Firestore",
    rawProfile: createSeedCandidate({
      id: "usr-ind-006",
      name: "Karthik Sundaram",
      email: "karthik.s@example.com",
      headline: "Mobile Application Developer | Flutter & React Native",
      currentRole: "Mobile Developer",
      targetRole: "Mobile Developer",
      careerLevel: "Junior (0-2 years)" as any,
      yearsOfExperience: 1,
      city: "Coimbatore",
      state: "Tamil Nadu",
      country: "India",
      location: "Coimbatore, Tamil Nadu, India",
      phone: "+91 94430 88990",
      linkedInUrl: "https://linkedin.com/in/karthiksundaram-mobile",
      githubUrl: "https://github.com/karthiksundaram-mobile",
      bio: "Crafting beautiful iOS and Android apps with 60 FPS animations using Flutter and React Native.",
      profileCompletionPercentage: 82,
      careerReadinessScore: 80,
      education: [
        {
          id: "edu-006",
          institution: "PSG College of Technology, Coimbatore",
          degree: "B.Tech in Information Technology",
          specialization: "Mobile & Web Systems",
          startYear: 2020,
          expectedGraduationYear: 2024,
          yearOrSemester: "Graduate",
          gpa: "8.7 / 10.0",
        },
      ],
      projects: [
        {
          id: "proj-006",
          title: "AgriConnect Mobile App",
          problem: "Local Tamil Nadu farmers needed direct buyer connections.",
          description: "Bilingual marketplace app with offline synchronization.",
          personalContribution: "Lead mobile architect and state management.",
          technologies: ["Flutter", "Dart", "Firebase", "Hive"],
          status: "Completed",
        },
      ],
      experience: [],
      certifications: [{ id: "c7", name: "Google Flutter & Dart Masterclass", issuer: "Udemy", issueDate: "2024" }],
      preferences: {
        targetJobRoles: ["Mobile Developer", "Flutter Developer"],
        preferredDomains: ["AgriTech", "Consumer Apps"],
        preferredLocations: ["Coimbatore", "Chennai", "Bengaluru"],
        workplacePreference: "On-site",
        opportunityTypes: ["Full-time Jobs"],
        technologiesOfInterest: ["Flutter", "Kotlin", "Swift"],
        availability: "Immediate",
      },
      updatedAt: new Date(Date.now() - 3600000 * 70).toISOString(),
    }),
  },
  {
    uid: "usr-ind-007",
    name: "Ananya Sen",
    email: "ananya.sen@example.com",
    headline: "Backend Engineer | Java, Spring Boot & Microservices",
    targetRole: "Backend Engineer",
    careerLevel: "Junior (0-2 years)",
    location: "Mumbai, Maharashtra, India",
    city: "Mumbai",
    state: "Maharashtra",
    skills: ["Java", "Spring Boot", "Microservices", "PostgreSQL", "Kafka", "Docker", "JUnit"],
    skillsCount: 7,
    resumesCount: 1,
    profileCompletion: 87,
    readinessScore: 84,
    educationInstitution: "VJTI, Mumbai",
    degree: "B.Tech in Computer Engineering",
    lastActive: "Today",
    syncedMode: "Cloud Firestore",
    rawProfile: createSeedCandidate({
      id: "usr-ind-007",
      name: "Ananya Sen",
      email: "ananya.sen@example.com",
      headline: "Backend Engineer | Java, Spring Boot & Microservices",
      currentRole: "Backend Engineer",
      targetRole: "Backend Engineer",
      careerLevel: "Junior (0-2 years)" as any,
      yearsOfExperience: 1.5,
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      location: "Mumbai, Maharashtra, India",
      phone: "+91 98200 66778",
      linkedInUrl: "https://linkedin.com/in/ananyasen-backend",
      githubUrl: "https://github.com/ananyasen-backend",
      bio: "High-concurrency backend developer with strong grounding in Java 21, Spring Cloud, Kafka streaming, and distributed transactions.",
      profileCompletionPercentage: 87,
      careerReadinessScore: 84,
      education: [
        {
          id: "edu-007",
          institution: "Veermata Jijabai Technological Institute (VJTI), Mumbai",
          degree: "B.Tech in Computer Engineering",
          specialization: "Computer Engineering",
          startYear: 2019,
          expectedGraduationYear: 2023,
          yearOrSemester: "Graduate",
          gpa: "8.8 / 10.0",
        },
      ],
      projects: [
        {
          id: "proj-007",
          title: "Payment Gateway Reconciliation Service",
          problem: "Discrepancy in multi-bank transaction settlement.",
          description: "Event-driven reconciliation processing 200 TPS.",
          personalContribution: "Implemented Kafka consumer and idempotent db writes.",
          technologies: ["Java", "Spring Boot", "Apache Kafka", "PostgreSQL"],
          status: "Completed",
        },
      ],
      experience: [
        {
          id: "exp-007",
          company: "Razorpay",
          role: "Associate Software Engineer",
          type: "Full-time",
          location: "Mumbai",
          startDate: "2023-08",
          endDate: "Present",
          isCurrent: true,
          responsibilities: "Maintaining payment settlement microservices and latency optimization.",
        },
      ],
      certifications: [{ id: "c8", name: "Oracle Certified Professional: Java SE 17", issuer: "Oracle", issueDate: "2023" }],
      preferences: {
        targetJobRoles: ["Backend Engineer", "Software Engineer"],
        preferredDomains: ["FinTech", "Banking Systems"],
        preferredLocations: ["Mumbai", "Bengaluru"],
        workplacePreference: "Hybrid",
        opportunityTypes: ["Full-time Jobs"],
        technologiesOfInterest: ["Java", "Go", "Kafka"],
        availability: "45 days notice",
      },
      updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    }),
  },
];

export const adminUserService = {
  /**
   * Fetch all registered candidate user records
   * Combines Firestore cloud documents with local demo candidates
   */
  async getAllUsers(): Promise<AdminUserRecord[]> {
    const list: AdminUserRecord[] = [...SEED_ADMIN_USERS];

    try {
      // 1. Try pulling live cloud users from Firestore
      const cloudUsers = await firestoreService.getAllUsers();
      if (cloudUsers && cloudUsers.length > 0) {
        cloudUsers.forEach((cu) => {
          // Exclude master admin from candidate user list
          if (cu.email === "admin@gmail.com" || cu.uid === "admin-master-account") return;

          const p = cu.profile;
          if (p) {
            // Check if already in list, if so overwrite with fresh cloud data
            const existingIdx = list.findIndex((u) => u.email === cu.email || u.uid === cu.uid);
            const userRec: AdminUserRecord = {
              uid: cu.uid,
              name: p.name || cu.email?.split("@")[0] || "Candidate",
              email: cu.email || p.email || "",
              headline: p.headline,
              targetRole: p.targetRole || "Software Developer",
              careerLevel: (p.careerLevel as string) || "Student",
              location: p.location || [p.city, p.state, p.country].filter(Boolean).join(", ") || "India",
              city: p.city || "India",
              state: p.state,
              skills: p.preferences?.technologiesOfInterest || ["TypeScript", "React"],
              skillsCount: (p.preferences?.technologiesOfInterest || []).length || 3,
              resumesCount: 1,
              profileCompletion: p.profileCompletionPercentage || 60,
              readinessScore: p.careerReadinessScore || 65,
              educationInstitution: p.education?.[0]?.institution || "University",
              degree: p.education?.[0]?.degree || "Bachelor's Degree",
              lastActive: cu.updatedAt ? new Date(cu.updatedAt).toLocaleDateString() : "Recently",
              syncedMode: "Cloud Firestore",
              rawProfile: p,
            };

            if (existingIdx >= 0) {
              list[existingIdx] = userRec;
            } else {
              list.unshift(userRec);
            }
          }
        });
      }
    } catch (err) {
      console.warn("Could not fetch remote Firestore users:", err);
    }

    // 2. Also check if active local user profile exists and is not admin
    try {
      const local = storageAdapter.getItem<CandidateProfile | null>(STORAGE_KEYS.PROFILE, null);
      if (local && local.email && local.email !== "admin@gmail.com") {
        const existingIdx = list.findIndex((u) => u.email === local.email);
        const userRec: AdminUserRecord = {
          uid: local.id || "local-active-candidate",
          name: local.name || "Local Candidate",
          email: local.email,
          headline: local.headline,
          targetRole: local.targetRole || "Software Developer",
          careerLevel: (local.careerLevel as string) || "Student",
          location: [local.city, local.state, local.country].filter(Boolean).join(", ") || "Local Device",
          city: local.city || "Local",
          skills: local.preferences?.technologiesOfInterest || ["React", "TypeScript"],
          skillsCount: (local.preferences?.technologiesOfInterest || []).length || 4,
          resumesCount: 1,
          profileCompletion: local.profileCompletionPercentage || 70,
          readinessScore: local.careerReadinessScore || 70,
          educationInstitution: local.education?.[0]?.institution || "Institute",
          degree: local.education?.[0]?.degree || "Degree",
          lastActive: "Active Session",
          syncedMode: "Local Device",
          rawProfile: local,
        };
        if (existingIdx >= 0) {
          list[existingIdx] = userRec;
        } else {
          list.unshift(userRec);
        }
      }
    } catch (err) {
      console.warn("Could not check local candidate:", err);
    }

    return list;
  },
};
