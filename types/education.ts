export interface EducationEntry {
  id: string;
  institution: string;
  degree: string;
  specialization: string;
  yearOrSemester: string; // e.g. "Final Year", "Semester 7", "Graduate"
  startYear: number | string;
  expectedGraduationYear: number | string;
  gpa?: string; // Optional GPA or percentage e.g. "3.85 / 4.0" or "88%"
  activities?: string;
  location?: string;
}
