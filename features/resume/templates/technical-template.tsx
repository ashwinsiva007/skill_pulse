import React from "react";
import { ResumeContent, ResumeSectionId } from "@/types/resume";

export interface ResumeTemplateProps {
  content: ResumeContent;
}

export const TechnicalTemplate: React.FC<ResumeTemplateProps> = ({ content }) => {
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
        return null;

      case "summary":
        if (!summary) return null;
        return (
          <section key="summary" className="mb-4 page-break-inside-avoid">
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase border-b-2 border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
              <span>{"//"}</span> SUMMARY
            </h2>
            <p className="text-[9.5pt] leading-relaxed text-slate-800 text-justify">
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
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase border-b-2 border-slate-300 pb-0.5 mb-2 flex items-center gap-1.5">
              <span>{"//"}</span> TECHNICAL EXPERTISE
            </h2>
            <div className="grid grid-cols-1 gap-1 text-[9.5pt]">
              {hasTech && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5">
                  <span className="font-mono text-xs font-bold text-slate-900 w-36 shrink-0 uppercase tracking-tight">
                    Languages & Core:
                  </span>
                  <div className="flex flex-wrap gap-1 text-slate-800 font-sans">
                    {skills.technical.map((t) => (
                      <span key={t} className="bg-slate-100 font-mono text-[8.5pt] px-1.5 py-0.2 rounded border border-slate-300 text-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasTools && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 mt-1">
                  <span className="font-mono text-xs font-bold text-slate-900 w-36 shrink-0 uppercase tracking-tight">
                    Cloud & Systems:
                  </span>
                  <div className="flex flex-wrap gap-1 text-slate-800 font-sans">
                    {skills.tools.map((t) => (
                      <span key={t} className="bg-slate-100 font-mono text-[8.5pt] px-1.5 py-0.2 rounded border border-slate-300 text-slate-800">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasSoft && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 mt-1">
                  <span className="font-mono text-xs font-bold text-slate-900 w-36 shrink-0 uppercase tracking-tight">
                    Practices:
                  </span>
                  <span className="text-slate-800 font-sans text-[9pt]">{skills.soft.join(", ")}</span>
                </div>
              )}
            </div>
          </section>
        );
      }

      case "projects":
        if (projects.length === 0) return null;
        return (
          <section key="projects" className="mb-4">
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase border-b-2 border-slate-300 pb-0.5 mb-2.5 flex items-center gap-1.5">
              <span>{"//"}</span> TECHNICAL PROJECTS & ARCHITECTURE
            </h2>
            <div className="space-y-3.5">
              {projects.map((proj) => (
                <div key={proj.id} className="page-break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <div className="text-[10pt] font-bold text-slate-900 flex items-center gap-2">
                      <span className="tracking-tight">{proj.title}</span>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-[8pt] text-blue-700 bg-blue-50 px-1 py-0.2 rounded border border-blue-200 hover:underline"
                        >
                          REPO/DEMO
                        </a>
                      )}
                    </div>
                    {proj.date && (
                      <span className="font-mono text-[8.5pt] text-slate-600 font-medium shrink-0">
                        {proj.date}
                      </span>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="font-mono text-[8.5pt] text-slate-700 mt-0.5">
                      <span className="font-semibold text-slate-900">STACK:</span> {proj.technologies.join(" • ")}
                    </div>
                  )}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="list-disc ml-4 space-y-1 mt-1 text-[9pt] leading-normal text-slate-800 font-sans">
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

      case "experience":
        if (experience.length === 0) return null;
        return (
          <section key="experience" className="mb-4">
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase border-b-2 border-slate-300 pb-0.5 mb-2.5 flex items-center gap-1.5">
              <span>{"//"}</span> PROFESSIONAL EXPERIENCE
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="page-break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <div className="text-[10pt] font-bold text-slate-900">
                      {exp.role} <span className="font-semibold text-slate-700">— {exp.company}</span>
                    </div>
                    <span className="font-mono text-[8.5pt] text-slate-600 shrink-0">
                      {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                    </span>
                  </div>
                  {exp.location && (
                    <div className="text-[8.5pt] text-slate-500 font-mono">{exp.location}</div>
                  )}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc ml-4 space-y-1 mt-1 text-[9pt] leading-normal text-slate-800 font-sans">
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

      case "education":
        if (education.length === 0) return null;
        return (
          <section key="education" className="mb-4 page-break-inside-avoid">
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase border-b-2 border-slate-300 pb-0.5 mb-2 flex items-center gap-1.5">
              <span>{"//"}</span> EDUCATION
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10pt] font-bold text-slate-900">
                      {edu.institution}
                    </span>
                    <span className="font-mono text-[8.5pt] text-slate-600 shrink-0">
                      {edu.endDate ? edu.endDate : edu.startDate}
                    </span>
                  </div>
                  <div className="text-[9pt] text-slate-800">
                    {edu.degree} in {edu.fieldOfStudy}
                    {edu.gpa ? <span className="font-mono text-slate-700 ml-1.5 font-semibold">| GPA: {edu.gpa}</span> : ""}
                  </div>
                  {edu.highlights && edu.highlights.length > 0 && (
                    <p className="text-[8.5pt] text-slate-600 mt-0.5">
                      {edu.highlights.join(" • ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        );

      case "certifications":
        if (certifications.length === 0) return null;
        return (
          <section key="certifications" className="mb-3 page-break-inside-avoid">
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase border-b-2 border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
              <span>{"//"}</span> CERTIFICATIONS
            </h2>
            <div className="space-y-1 text-[9pt] text-slate-800">
              {certifications.map((c) => (
                <div key={c.id} className="flex justify-between items-baseline">
                  <span>
                    <strong className="font-semibold text-slate-900">{c.name}</strong> — {c.issuer}
                  </span>
                  <span className="font-mono text-[8.5pt] text-slate-600">{c.date}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case "achievements":
        if (achievements.length === 0) return null;
        return (
          <section key="achievements" className="mb-3 page-break-inside-avoid">
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase border-b-2 border-slate-300 pb-0.5 mb-1.5 flex items-center gap-1.5">
              <span>{"//"}</span> HACKATHONS & HONORS
            </h2>
            <div className="space-y-1 text-[9pt] text-slate-800">
              {achievements.map((ach) => (
                <div key={ach.id} className="flex justify-between items-baseline">
                  <span>
                    <strong className="font-semibold text-slate-900">{ach.title}</strong>
                    {ach.description ? ` (${ach.description})` : ""}
                  </span>
                  {ach.date && <span className="font-mono text-[8.5pt] text-slate-600">{ach.date}</span>}
                </div>
              ))}
            </div>
          </section>
        );

      case "coursework":
        if (coursework.length === 0) return null;
        return (
          <section key="coursework" className="mb-3 page-break-inside-avoid">
            <h2 className="text-xs font-mono font-bold tracking-wider text-slate-900 uppercase border-b-2 border-slate-300 pb-0.5 mb-1 flex items-center gap-1.5">
              <span>{"//"}</span> COURSEWORK
            </h2>
            <div className="text-[8.5pt] text-slate-700 font-mono">
              {coursework.map((c) => c.title).join(" // ")}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <article className="resume-print-area bg-white text-slate-900 w-full min-h-[297mm] p-8 sm:p-10 text-[9.5pt] font-sans antialiased shadow-xs border border-slate-300 print:border-none print:shadow-none print:p-0">
      {/* Header */}
      <header className="mb-4 pb-2.5 border-b-2 border-slate-900 page-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1">
          <h1 className="text-2xl sm:text-3xl font-mono font-bold tracking-tight text-slate-900 uppercase">
            {contact.fullName || "Candidate Name"}
          </h1>
          {contact.location && (
            <span className="font-mono text-[8.5pt] text-slate-600">{contact.location}</span>
          )}
        </div>

        {/* Links */}
        <div className="font-mono text-[8.5pt] text-slate-700 flex flex-wrap items-center gap-x-2 gap-y-1">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>| {contact.phone}</span>}
          {contact.githubUrl && (
            <span>
              |{" "}
              <a href={contact.githubUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                github.com/alexmorgan-demo
              </a>
            </span>
          )}
          {contact.linkedInUrl && (
            <span>
              |{" "}
              <a href={contact.linkedInUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                linkedin.com/in/alexmorgan
              </a>
            </span>
          )}
          {contact.portfolioUrl && (
            <span>
              |{" "}
              <a href={contact.portfolioUrl} target="_blank" rel="noreferrer" className="text-blue-700 hover:underline">
                portfolio
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
