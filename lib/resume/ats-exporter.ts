import { ResumeDraft } from "@/types/resume";

/**
 * Converts a ResumeDraft into clean, ATS-standard plain text.
 * Free of tables, columns, or special glyphs that confuse ATS parsers.
 */
export function exportResumeToPlainText(draft: ResumeDraft): string {
  const content = draft.content;
  const contact = content.contact;
  const lines: string[] = [];

  // Header / Contact Information
  if (contact.fullName) lines.push(contact.fullName.toUpperCase());
  if (draft.targetRole) lines.push(draft.targetRole);

  const contactItems: string[] = [];
  if (contact.email) contactItems.push(contact.email);
  if (contact.phone) contactItems.push(contact.phone);
  if (contact.location) contactItems.push(contact.location);
  if (contact.linkedInUrl) contactItems.push(contact.linkedInUrl);
  if (contact.githubUrl) contactItems.push(contact.githubUrl);
  if (contact.portfolioUrl) contactItems.push(contact.portfolioUrl);

  if (contactItems.length > 0) {
    lines.push(contactItems.join(" | "));
  }
  lines.push("");

  // Professional Summary
  if (content.summary && content.summary.trim()) {
    lines.push("============================================================");
    lines.push("PROFESSIONAL SUMMARY");
    lines.push("============================================================");
    lines.push(content.summary.trim());
    lines.push("");
  }

  // Skills
  const hasTech = content.skills?.technical && content.skills.technical.length > 0;
  const hasTools = content.skills?.tools && content.skills.tools.length > 0;
  const hasSoft = content.skills?.soft && content.skills.soft.length > 0;

  if (hasTech || hasTools || hasSoft) {
    lines.push("============================================================");
    lines.push("TECHNICAL & PROFESSIONAL SKILLS");
    lines.push("============================================================");
    if (hasTech) {
      lines.push(`* Core & Technical Skills: ${content.skills.technical.join(", ")}`);
    }
    if (hasTools) {
      lines.push(`* Developer Tools & Platforms: ${content.skills.tools.join(", ")}`);
    }
    if (hasSoft) {
      lines.push(`* Professional Competencies: ${content.skills.soft.join(", ")}`);
    }
    lines.push("");
  }

  // Experience
  if (content.experience && content.experience.length > 0) {
    lines.push("============================================================");
    lines.push("PROFESSIONAL EXPERIENCE");
    lines.push("============================================================");
    for (const exp of content.experience) {
      const dates = [exp.startDate, exp.endDate || (exp.isCurrent ? "Present" : "")].filter(Boolean).join(" - ");
      const loc = exp.location ? ` | ${exp.location}` : "";
      lines.push(`${exp.role} | ${exp.company}${loc}`);
      if (dates) lines.push(dates);
      if (exp.bullets && exp.bullets.length > 0) {
        for (const b of exp.bullets) {
          lines.push(`  * ${b}`);
        }
      }
      lines.push("");
    }
  }

  // Projects
  if (content.projects && content.projects.length > 0) {
    lines.push("============================================================");
    lines.push("KEY PROJECTS & TECHNICAL PORTFOLIO");
    lines.push("============================================================");
    for (const proj of content.projects) {
      const tech = proj.technologies && proj.technologies.length > 0 ? ` [${proj.technologies.join(", ")}]` : "";
      const url = proj.link ? ` (${proj.link})` : "";
      lines.push(`${proj.title}${tech}${url}`);
      if (proj.bullets && proj.bullets.length > 0) {
        for (const b of proj.bullets) {
          lines.push(`  * ${b}`);
        }
      }
      lines.push("");
    }
  }

  // Education
  if (content.education && content.education.length > 0) {
    lines.push("============================================================");
    lines.push("EDUCATION");
    lines.push("============================================================");
    for (const edu of content.education) {
      const grad = edu.endDate || "";
      const gpa = edu.gpa ? ` | GPA: ${edu.gpa}` : "";
      lines.push(`${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} | ${edu.institution}`);
      if (grad || gpa) lines.push(`Graduation / Period: ${grad}${gpa}`);
      if (edu.highlights && edu.highlights.length > 0) {
        lines.push(`  * Academic Highlights: ${edu.highlights.join(", ")}`);
      }
      lines.push("");
    }
  }

  // Certifications
  if (content.certifications && content.certifications.length > 0) {
    lines.push("============================================================");
    lines.push("CERTIFICATIONS & CREDENTIALS");
    lines.push("============================================================");
    for (const cert of content.certifications) {
      const issuer = cert.issuer ? ` - ${cert.issuer}` : "";
      const date = cert.date ? ` (${cert.date})` : "";
      lines.push(`* ${cert.name}${issuer}${date}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Converts a ResumeDraft into clean Markdown format.
 */
export function exportResumeToMarkdown(draft: ResumeDraft): string {
  const content = draft.content;
  const contact = content.contact;
  const lines: string[] = [];

  if (contact.fullName) lines.push(`# ${contact.fullName}`);
  if (draft.targetRole) lines.push(`### ${draft.targetRole}`);

  const contactItems: string[] = [];
  if (contact.email) contactItems.push(`[${contact.email}](mailto:${contact.email})`);
  if (contact.phone) contactItems.push(contact.phone);
  if (contact.location) contactItems.push(contact.location);
  if (contact.linkedInUrl) contactItems.push(`[LinkedIn](${contact.linkedInUrl})`);
  if (contact.githubUrl) contactItems.push(`[GitHub](${contact.githubUrl})`);
  if (contact.portfolioUrl) contactItems.push(`[Portfolio](${contact.portfolioUrl})`);

  if (contactItems.length > 0) {
    lines.push(contactItems.join(" | "));
  }
  lines.push("");

  if (content.summary && content.summary.trim()) {
    lines.push("## Professional Summary");
    lines.push(content.summary.trim());
    lines.push("");
  }

  const hasTech = content.skills?.technical && content.skills.technical.length > 0;
  const hasTools = content.skills?.tools && content.skills.tools.length > 0;
  const hasSoft = content.skills?.soft && content.skills.soft.length > 0;

  if (hasTech || hasTools || hasSoft) {
    lines.push("## Technical Skills");
    if (hasTech) lines.push(`- **Core Technologies:** ${content.skills.technical.join(", ")}`);
    if (hasTools) lines.push(`- **Tools & Platforms:** ${content.skills.tools.join(", ")}`);
    if (hasSoft) lines.push(`- **Key Competencies:** ${content.skills.soft.join(", ")}`);
    lines.push("");
  }

  if (content.experience && content.experience.length > 0) {
    lines.push("## Work Experience");
    for (const exp of content.experience) {
      const dates = [exp.startDate, exp.endDate || (exp.isCurrent ? "Present" : "")].filter(Boolean).join(" - ");
      lines.push(`### ${exp.role} — **${exp.company}**`);
      lines.push(`*${dates}${exp.location ? ` | ${exp.location}` : ""}*`);
      if (exp.bullets && exp.bullets.length > 0) {
        for (const b of exp.bullets) {
          lines.push(`- ${b}`);
        }
      }
      lines.push("");
    }
  }

  if (content.projects && content.projects.length > 0) {
    lines.push("## Projects");
    for (const proj of content.projects) {
      const tech = proj.technologies && proj.technologies.length > 0 ? ` *(${proj.technologies.join(", ")})*` : "";
      lines.push(`### ${proj.title}${tech}`);
      if (proj.bullets && proj.bullets.length > 0) {
        for (const b of proj.bullets) {
          lines.push(`- ${b}`);
        }
      }
      lines.push("");
    }
  }

  if (content.education && content.education.length > 0) {
    lines.push("## Education");
    for (const edu of content.education) {
      lines.push(`### ${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""}`);
      lines.push(`**${edu.institution}** | *Graduation: ${edu.endDate || "Completed"}*`);
      if (edu.highlights && edu.highlights.length > 0) {
        lines.push(`- **Highlights:** ${edu.highlights.join(", ")}`);
      }
      lines.push("");
    }
  }

  if (content.certifications && content.certifications.length > 0) {
    lines.push("## Certifications");
    for (const cert of content.certifications) {
      lines.push(`- **${cert.name}** — ${cert.issuer || "Verified"} ${cert.date ? `(${cert.date})` : ""}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Triggers a client-side file download.
 */
export function downloadFile(filename: string, content: string, mimeType: string = "text/plain") {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
