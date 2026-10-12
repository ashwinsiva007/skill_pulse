import { z } from "zod";

export const personalDetailsSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  headline: z.string().min(3, "Professional headline is required"),
  email: z.string().email("Invalid email format").or(z.literal("")),
  phone: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  location: z.string().optional(),
  linkedInUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  githubUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  portfolioUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  bio: z.string().min(10, "Please provide a short biography (at least 10 characters)"),
  careerLevel: z.enum([
    "Student",
    "Fresh Graduate",
    "Entry Level",
    "Junior",
    "Mid-Level",
    "Senior",
    "Lead",
    "Staff / Principal",
  ]),
});

export const educationSchema = z.object({
  id: z.string(),
  institution: z.string().min(2, "Institution name is required"),
  degree: z.string().min(2, "Degree is required"),
  specialization: z.string().min(2, "Specialization or major is required"),
  yearOrSemester: z.string().min(1, "Year or semester is required"),
  startYear: z.union([z.number(), z.string()]).refine((val) => Boolean(val), "Start year is required"),
  expectedGraduationYear: z.union([z.number(), z.string()]).refine((val) => Boolean(val), "Graduation year is required"),
  gpa: z.string().optional(),
  location: z.string().optional(),
});

export const skillFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Skill name is required"),
  category: z.enum([
    "AI & Machine Learning",
    "Frontend Engineering",
    "Backend & Systems",
    "Cloud & DevOps",
    "Architecture & Leadership",
    "Data & Analytics",
  ]),
  proficiency: z.enum(["Beginner", "Intermediate", "Advanced", "Expert"]),
  experienceDuration: z.string().optional(),
  interestToLearn: z.boolean().optional(),
  evidence: z.string().optional(),
});

export const careerPreferencesSchema = z.object({
  targetJobRoles: z.array(z.string()).min(1, "Please specify at least one target role"),
  preferredDomains: z.array(z.string()),
  preferredLocations: z.array(z.string()),
  workplacePreference: z.enum(["Remote", "Hybrid", "On-site", "Flexible"]),
  opportunityTypes: z.array(z.enum(["Internships", "Full-time Jobs", "Research", "Hackathons"])),
  technologiesOfInterest: z.array(z.string()),
  availability: z.string().min(1, "Please specify your availability"),
});

export const projectFormSchema = z.object({
  id: z.string(),
  title: z.string().min(2, "Project title is required"),
  problem: z.string().min(5, "Problem addressed is required"),
  description: z.string().min(10, "Project description is required"),
  personalContribution: z.string().min(5, "Please describe your personal contribution"),
  technologies: z.array(z.string()).min(1, "At least one technology is required"),
  status: z.enum(["In Progress", "Completed", "Prototype"]),
  startDate: z.string().optional(),
  completionDate: z.string().optional(),
  githubUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  demoUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  outcomes: z.string().optional(),
});

export const experienceFormSchema = z.object({
  id: z.string(),
  company: z.string().min(2, "Company or organization name is required"),
  role: z.string().min(2, "Role title is required"),
  type: z.enum(["Internship", "Full-time", "Part-time", "Research", "Freelance"]),
  location: z.string().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isCurrent: z.boolean(),
  responsibilities: z.string().min(5, "Responsibilities summary is required"),
});

export const certificationFormSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Certification name is required"),
  issuer: z.string().min(2, "Issuing organization is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  credentialUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});
