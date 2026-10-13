import React from "react";
import { ResumeContent, ResumeSectionId } from "@/types/resume";

export interface ResumeTemplateProps {
  content: ResumeContent;
}

export const ModernTemplate: React.FC<ResumeTemplateProps> = ({ content }) => {
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
        return null; // Rendered in modern header

      case "summary":
        if (!summary) return null;
        return (
          <section key="summary" className="mb-4 page-break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-indigo-100 pb-1 mb-2">
              Summary
            </h2>
            <p className="text-[10pt] leading-relaxed text-slate-700">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-indigo-100 pb-1 mb-2">
              Skills & Expertise
            </h2>
            <div className="space-y-1.5 text-[9.5pt]">
              {hasTech && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                  <span className="font-semibold text-slate-900 w-32 shrink-0">Technical:</span>
                  <div className="flex flex-wrap gap-1 text-slate-800">
                    {skills.technical.map((t) => (
                      <span key={t} className="bg-slate-100 px-1.5 py-0.5 rounded text-[9pt] border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasTools && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                  <span className="font-semibold text-slate-900 w-32 shrink-0">Tools & Platforms:</span>
                  <div className="flex flex-wrap gap-1 text-slate-800">
                    {skills.tools.map((t) => (
                      <span key={t} className="bg-slate-100 px-1.5 py-0.5 rounded text-[9pt] border border-slate-200">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasSoft && (
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                  <span className="font-semibold text-slate-900 w-32 shrink-0">Practices:</span>
                  <span className="text-slate-700">{skills.soft.join(", ")}</span>
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-indigo-100 pb-1 mb-2.5">
              Experience
            </h2>
            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="page-break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <div className="text-[10pt] font-bold text-slate-900">
                      {exp.role} <span className="font-medium text-indigo-900">| {exp.company}</span>
                    </div>
                    <span className="text-[9pt] text-slate-500 font-medium shrink-0">
                      {exp.startDate} – {exp.isCurrent ? "Present" : exp.endDate || "Present"}
                    </span>
                  </div>
                  {exp.location && (
                    <div className="text-[8.5pt] text-slate-500 mb-1">{exp.location}</div>
                  )}
                  {exp.bullets && exp.bullets.length > 0 && (
                    <ul className="list-disc ml-4 space-y-1 mt-1 text-[9.5pt] leading-normal text-slate-700">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-indigo-100 pb-1 mb-2.5">
              Projects
            </h2>
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id} className="page-break-inside-avoid">
                  <div className="flex justify-between items-baseline">
                    <div className="text-[10pt] font-bold text-slate-900 flex items-center gap-2">
                      <span>{proj.title}</span>
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[8.5pt] text-indigo-600 font-normal hover:underline"
                        >
                          [Link]
                        </a>
                      )}
                    </div>
                    {proj.date && (
                      <span className="text-[9pt] text-slate-500 font-medium shrink-0">{proj.date}</span>
                    )}
                  </div>
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="text-[8.5pt] text-indigo-900 font-medium mb-1">
                      Stack: {proj.technologies.join(", ")}
                    </div>
                  )}
                  {proj.bullets && proj.bullets.length > 0 && (
                    <ul className="list-disc ml-4 space-y-1 mt-1 text-[9.5pt] leading-normal text-slate-700">
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
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-indigo-100 pb-1 mb-2">
              Education
            </h2>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10pt] font-bold text-slate-900">
                      {edu.institution}
                    </span>
                    <span className="text-[9pt] text-slate-500 font-medium shrink-0">
                      {edu.endDate ? edu.endDate : edu.startDate}
                    </span>
                  </div>
                  <div className="text-[9.5pt] text-slate-700">
                    {edu.degree} in {edu.fieldOfStudy}
                    {edu.gpa ? <span className="text-slate-500 ml-1.5 font-medium">| GPA: {edu.gpa}</span> : ""}
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
          <section key="certifications" className="mb-4 page-break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-indigo-100 pb-1 mb-1.5">
              Certifications
            </h2>
            <div className="space-y-1 text-[9pt] text-slate-700">
              {certifications.map((c) => (
                <div key={c.id} className="flex justify-between items-baseline">
                  <span>
                    <strong className="font-semibold text-slate-900">{c.name}</strong> — {c.issuer}
                  </span>
                  <span className="text-slate-500">{c.date}</span>
                </div>
              ))}
            </div>
          </section>
        );

      case "achievements":
        if (achievements.length === 0) return null;
        return (
          <section key="achievements" className="mb-4 page-break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-indigo-100 pb-1 mb-1.5">
              Achievements & Honors
            </h2>
            <div className="space-y-1 text-[9pt] text-slate-700">
              {achievements.map((ach) => (
                <div key={ach.id} className="flex justify-between items-baseline">
                  <span>
                    <strong className="font-semibold text-slate-900">{ach.title}</strong>
                    {ach.description ? ` — ${ach.description}` : ""}
                  </span>
                  {ach.date && <span className="text-slate-500">{ach.date}</span>}
                </div>
              ))}
            </div>
          </section>
        );

      case "coursework":
        if (coursework.length === 0) return null;
        return (
          <section key="coursework" className="mb-3 page-break-inside-avoid">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-950 border-b border-indigo-100 pb-1 mb-1">
              Coursework
            </h2>
            <div className="text-[9pt] text-slate-700">
              {coursework.map((c) => c.title).join(" • ")}
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <article className="resume-print-area bg-white text-slate-900 w-full min-h-[297mm] p-8 sm:p-10 text-[10pt] font-sans antialiased shadow-xs border border-slate-200 print:border-none print:shadow-none print:p-0">
      {/* Modern Header */}
      <header className="mb-5 page-break-inside-avoid">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1 mb-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {contact.fullName || "Candidate Name"}
          </h1>
          {contact.location && (
            <span className="text-[9pt] text-slate-500 font-medium">{contact.location}</span>
          )}
        </div>

        {/* Contact Links */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9pt] text-slate-600 pb-3 border-b-2 border-indigo-600/70">
          {contact.email && <span>{contact.email}</span>}
          {contact.phone && <span>• {contact.phone}</span>}
          {contact.linkedInUrl && (
            <span>
              •{" "}
              <a href={contact.linkedInUrl} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">
                LinkedIn
              </a>
            </span>
          )}
          {contact.githubUrl && (
            <span>
              •{" "}
              <a href={contact.githubUrl} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">
                GitHub
              </a>
            </span>
          )}
          {contact.portfolioUrl && (
            <span>
              •{" "}
              <a href={contact.portfolioUrl} target="_blank" rel="noreferrer" className="text-indigo-700 hover:underline">
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
