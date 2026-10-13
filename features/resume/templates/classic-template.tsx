import React from "react";
import { ResumeContent, ResumeSectionId } from "@/types/resume";

export interface ResumeTemplateProps {
  content: ResumeContent;
}

export const ClassicTemplate: React.FC<ResumeTemplateProps> = ({ content }) => {
  const {
    contact,
    summary,
    skills,
    experience,
    projects,
    education,
    certifications,
    achievements,
    coursework,
    sectionConfig,
  } = content;

  const isVisible = (id: ResumeSectionId) => sectionConfig.visible[id] !== false;

  const renderSection = (id: ResumeSectionId) => {
    if (!isVisible(id)) return null;

    switch (id) {
      case "contact":
        return null; // Rendered at the top header

      case "summary":
        if (!summary) return null;
        return (
          <section key="summary" className="mb-4 page-break-inside-avoid">
            <h2 className="text-xs font-serif font-bold tracking-wider text-gray-900 uppercase border-b border-gray-400 pb-0.5 mb-1.5">
              Professional Summary
            </h2>
            <p className="text-[10pt] leading-relaxed text-gray-800 text-justify">
              {summary}
            </p>
          </section>
        );

      case "skills": {
        const hasTech = skills.technical.length > 0;
        const hasTools = skills.tools.length > 0;
        const hasSoft = skills.soft.length > 0;
        if (!hasTech && !hasTools && !hasSoft) return null;

        return (
          <section key="skills" className="mb-4 page-break-inside-avoid">
            <h2 className="text-xs font-serif font-bold tracking-wider text-gray-900 uppercase border-b border-gray-400 pb-0.5 mb-1.5">
              Technical & Core Competencies
            </h2>
            <div className="text-[10pt] text-gray-800 space-y-1">
              {hasTech && (
                <div>
                  <strong className="font-semibold text-gray-900">Technical Skills: </strong>
                  <span>{skills.technical.join(", ")}</span>
                </div>
              )}
              {hasTools && (
                <div>
                  <strong className="font-semibold text-gray-900">Developer Tools & Platforms: </strong>
                  <span>{skills.tools.join(", ")}</span>
                </div>
              )}
              {hasSoft && (
                <div>
                  <strong className="font-semibold text-gray-900">Core Practices & Competencies: </strong>
                  <span>{skills.soft.join(", ")}</span>
                </div>
              )}
            </div>
          </section>
        );
      }

      case "experience":
        if (experience.length === 0) return null;
        return (
          <section key="experience" className="mb-4">
            <h2 className="text-xs font-serif font-bold tracking-wider text-gray-900 uppercase border-b border-gray-400 pb-0.5 mb-2">
              Work Experience & Internships
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="page-break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10.5pt] font-serif font-bold text-gray-900">
                      {exp.role} <span className="font-normal font-sans text-gray-700">— {exp.company}</span>
                    </span>
                    <span className="text-[9.5pt] text-gray-600 font-medium">
                      {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                    </span>
                  </div>
                  {exp.location && (
                    <div className="text-[9pt] text-gray-500 italic mb-1">{exp.location}</div>
                  )}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc ml-4 space-y-0.5 mt-1 text-[9.5pt] leading-normal text-gray-800">
                      {exp.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "projects":
        if (projects.length === 0) return null;
        return (
          <section key="projects" className="mb-4">
            <h2 className="text-xs font-serif font-bold tracking-wider text-gray-900 uppercase border-b border-gray-400 pb-0.5 mb-2">
              Projects & Engineering Contributions
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="page-break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <div className="text-[10.5pt] font-serif font-bold text-gray-900">
                      {proj.title}
                      {proj.technologies && proj.technologies.length > 0 && (
                        <span className="font-normal font-sans text-[9pt] text-gray-600 ml-1.5">
                          | {proj.technologies.join(", ")}
                        </span>
                      )}
                    </div>
                    {proj.date && (
                      <span className="text-[9.5pt] text-gray-600 font-medium">{proj.date}</span>
                    )}
                  </div>
                  {proj.link && (
                    <div className="text-[8.5pt] text-gray-600 mb-0.5">
                      <a href={proj.link} target="_blank" rel="noreferrer" className="underline hover:text-gray-900">
                        {proj.link}
                      </a>
                    </div>
                  )}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="list-disc ml-4 space-y-0.5 mt-1 text-[9.5pt] leading-normal text-gray-800">
                      {proj.bullets.map((b, idx) => (
                        <li key={idx}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "education":
        if (education.length === 0) return null;
        return (
          <section key="education" className="mb-4 page-break-inside-avoid">
            <h2 className="text-xs font-serif font-bold tracking-wider text-gray-900 uppercase border-b border-gray-400 pb-0.5 mb-2">
              Education
            </h2>
            <div className="space-y-2.5">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10.5pt] font-serif font-bold text-gray-900">
                      {edu.institution}
                    </span>
                    <span className="text-[9.5pt] text-gray-600 font-medium">
                      {edu.endDate ? edu.endDate : edu.startDate}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline text-[9.5pt] text-gray-800">
                    <span>
                      {edu.degree} in {edu.fieldOfStudy}
                      {edu.gpa ? ` (GPA: ${edu.gpa})` : ""}
                    </span>
                    {edu.location && <span className="text-gray-500 italic text-[9pt]">{edu.location}</span>}
                  </div>
                  {edu.highlights && edu.highlights.length > 0 && (
                    <ul className="list-disc ml-4 text-[9pt] text-gray-700 mt-1">
                      {edu.highlights.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0) return null;
        return (
          <section key="certifications" className="mb-4 page-break-inside-avoid">
            <h2 className="text-xs font-serif font-bold tracking-wider text-gray-900 uppercase border-b border-gray-400 pb-0.5 mb-1.5">
              Certifications & Credentials
            </h2>
            <div className="space-y-1 text-[9.5pt] text-gray-800">
              {certifications.map((c) => (
                <div key={c.id} className="flex justify-between items-baseline">
                  <span>
                    <strong className="font-semibold text-gray-900">{c.name}</strong> — {c.issuer}
                  </span>
                  <span className="text-gray-600 text-[9pt]">{c.date}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case "achievements":
        if (achievements.length === 0) return null;
        return (
          <section key="achievements" className="mb-4 page-break-inside-avoid">
            <h2 className="text-xs font-serif font-bold tracking-wider text-gray-900 uppercase border-b border-gray-400 pb-0.5 mb-1.5">
              Honors, Awards & Hackathons
            </h2>
            <div className="space-y-1.5 text-[9.5pt] text-gray-800">
              {achievements.map((ach) => (
                <div key={ach.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="font-semibold text-gray-900">{ach.title}</span>
                    {ach.date && <span className="text-gray-600 text-[9pt]">{ach.date}</span>}
                  </div>
                  {ach.description && (
                    <p className="text-[9pt] text-gray-700 mt-0.5">{ach.description}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "coursework":
        if (coursework.length === 0) return null;
        return (
          <section key="coursework" className="mb-3 page-break-inside-avoid">
            <h2 className="text-xs font-serif font-bold tracking-wider text-gray-900 uppercase border-b border-gray-400 pb-0.5 mb-1.5">
              Relevant Coursework & Training
            </h2>
            <div className="text-[9.5pt] text-gray-800">
              {coursework.map((c) => `${c.title} (${c.platform || "Accredited"})`).join(" • ")}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <article className="resume-print-area bg-white text-gray-900 w-full min-h-[297mm] p-8 sm:p-10 text-[10pt] font-sans antialiased shadow-xs border border-gray-200 print:border-none print:shadow-none print:p-0">
      {/* Header */}
      <header className="text-center border-b-2 border-gray-800 pb-3 mb-4 page-break-inside-avoid">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold uppercase tracking-wide text-gray-900 mb-1">
          {contact.fullName || "Candidate Name"}
        </h1>
        <div className="text-[9pt] sm:text-[9.5pt] text-gray-700 flex flex-wrap justify-center items-center gap-x-2 gap-y-1">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>• {contact.phone}</span>}
          {contact.location && <span>• {contact.location}</span>}
          {contact.linkedInUrl && (
            <span>
              •{" "}
              <a href={contact.linkedInUrl} target="_blank" rel="noreferrer" className="underline">
                LinkedIn
              </a>
            </span>
          )}
          {contact.githubUrl && (
            <span>
              •{" "}
              <a href={contact.githubUrl} target="_blank" rel="noreferrer" className="underline">
                GitHub
              </a>
            </span>
          )}
          {contact.portfolioUrl && (
            <span>
              •{" "}
              <a href={contact.portfolioUrl} target="_blank" rel="noreferrer" className="underline">
                Portfolio
              </a>
            </span>
          )}
        </div>
      </header>

      {/* Ordered Sections */}
      {sectionConfig.order.map((id) => renderSection(id))}
    </article>
  );
};
