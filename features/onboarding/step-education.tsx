"use client";

import React, { useState } from "react";
import { EducationEntry } from "@/types/education";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Edit3, GraduationCap } from "lucide-react";

export interface StepEducationProps {
  entries: EducationEntry[];
  onChange: (entries: EducationEntry[]) => void;
}

export const StepEducation: React.FC<StepEducationProps> = ({ entries, onChange }) => {
  const [isAdding, setIsAdding] = useState(entries.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [yearOrSemester, setYearOrSemester] = useState("Final Year");
  const [startYear, setStartYear] = useState<number | string>(2022);
  const [expectedGraduationYear, setExpectedGraduationYear] = useState<number | string>(2026);
  const [gpa, setGpa] = useState("");
  const [formError, setFormError] = useState("");

  const resetForm = () => {
    setInstitution("");
    setDegree("");
    setSpecialization("");
    setYearOrSemester("Final Year");
    setStartYear(2022);
    setExpectedGraduationYear(2026);
    setGpa("");
    setFormError("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (entry: EducationEntry) => {
    setEditingId(entry.id);
    setInstitution(entry.institution);
    setDegree(entry.degree);
    setSpecialization(entry.specialization);
    setYearOrSemester(entry.yearOrSemester);
    setStartYear(entry.startYear);
    setExpectedGraduationYear(entry.expectedGraduationYear);
    setGpa(entry.gpa || "");
    setIsAdding(true);
  };

  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution.trim() || !degree.trim() || !specialization.trim()) {
      setFormError("Institution, degree, and specialization are required.");
      return;
    }

    if (editingId) {
      const updated = entries.map((item) =>
        item.id === editingId
          ? {
              ...item,
              institution: institution.trim(),
              degree: degree.trim(),
              specialization: specialization.trim(),
              yearOrSemester,
              startYear,
              expectedGraduationYear,
              gpa: gpa.trim() || undefined,
            }
          : item
      );
      onChange(updated);
    } else {
      const newEntry: EducationEntry = {
        id: `edu-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        institution: institution.trim(),
        degree: degree.trim(),
        specialization: specialization.trim(),
        yearOrSemester,
        startYear,
        expectedGraduationYear,
        gpa: gpa.trim() || undefined,
      };
      onChange([...entries, newEntry]);
    }

    resetForm();
  };

  const handleDeleteEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-white">Step B — Academic Background</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Add current or past colleges, universities, or degree programs.
          </p>
        </div>

        {!isAdding && (
          <Button variant="outline" size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" />
            Add Education
          </Button>
        )}
      </div>

      {/* Existing Entries List */}
      <div className="space-y-3">
        {entries.map((item) => (
          <Card key={item.id} className="p-4 bg-slate-950/60 border-slate-800">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{item.institution}</h4>
                  <p className="text-xs text-indigo-300 font-medium">
                    {item.degree} in {item.specialization}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1">
                    <span>{item.yearOrSemester}</span>
                    <span>•</span>
                    <span>
                      {item.startYear} – {item.expectedGraduationYear}
                    </span>
                    {item.gpa && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-medium">GPA: {item.gpa}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleStartEdit(item)}
                  className="h-7 px-2 text-slate-400 hover:text-white"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteEntry(item.id)}
                  className="h-7 px-2 text-slate-400 hover:text-rose-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Add / Edit Form */}
      {isAdding && (
        <Card className="p-4 bg-slate-900 border-indigo-500/30 space-y-4">
          <h4 className="text-xs font-semibold text-indigo-300">
            {editingId ? "Edit Education Entry" : "New Academic Record"}
          </h4>

          {formError && <p className="text-xs text-rose-400 bg-rose-950/50 p-2 rounded">{formError}</p>}

          <form onSubmit={handleSaveEntry} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Institution / University *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Stanford University or CalTech"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Degree Program *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bachelor of Science, B.Tech, Master of Science"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Specialization / Major *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, AI & Data Science"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Current Year or Semester
                </label>
                <select
                  value={yearOrSemester}
                  onChange={(e) => setYearOrSemester(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="Semester 1 / First Year">Semester 1 / First Year</option>
                  <option value="Semester 2 / First Year">Semester 2 / First Year</option>
                  <option value="Second Year">Second Year</option>
                  <option value="Third Year">Third Year</option>
                  <option value="Final Year">Final Year</option>
                  <option value="Graduated">Graduated</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Start Year
                </label>
                <input
                  type="number"
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  min="2010"
                  max="2035"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  Expected Graduation Year
                </label>
                <input
                  type="number"
                  value={expectedGraduationYear}
                  onChange={(e) => setExpectedGraduationYear(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  min="2015"
                  max="2035"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                  GPA or Percentage (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 3.85 / 4.0 or 88%"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={resetForm}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                {editingId ? "Update Entry" : "Add to Profile"}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
};
