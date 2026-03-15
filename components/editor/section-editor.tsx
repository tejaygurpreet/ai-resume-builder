"use client";

import React, { useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trash2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import { useResumeStore } from "@/hooks/use-resume-store";

interface SectionEditorProps {
  sectionId: string;
  type: string;
  content: any;
}

export function SectionEditor({ sectionId, type, content }: SectionEditorProps) {
  const updateSection = useResumeStore((s) => s.updateSection);

  const update = useCallback(
    (newContent: any) => updateSection(sectionId, newContent),
    [sectionId, updateSection]
  );

  switch (type) {
    case "personal":
      return <PersonalEditor content={content} onChange={update} />;
    case "summary":
      return <SummaryEditor content={content} onChange={update} />;
    case "experience":
      return <ExperienceEditor content={content} onChange={update} />;
    case "education":
      return <EducationEditor content={content} onChange={update} />;
    case "skills":
      return <SkillsEditor content={content} onChange={update} />;
    case "projects":
      return <ProjectsEditor content={content} onChange={update} />;
    case "certifications":
      return <CertificationsEditor content={content} onChange={update} />;
    case "languages":
      return <LanguagesEditor content={content} onChange={update} />;
    default:
      return (
        <p className="text-sm text-gray-500">
          No editor available for section type &ldquo;{type}&rdquo;.
        </p>
      );
  }
}

/* ─── Personal ─────────────────────────────────────────────────── */

function PersonalEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const set = (field: string, value: string) =>
    onChange({ ...content, [field]: value });

  return (
    <div className="grid grid-cols-2 gap-3">
      <Input
        label="Full Name"
        value={content.fullName ?? ""}
        onChange={(e) => set("fullName", e.target.value)}
        placeholder="John Doe"
      />
      <Input
        label="Email"
        type="email"
        value={content.email ?? ""}
        onChange={(e) => set("email", e.target.value)}
        placeholder="john@example.com"
      />
      <Input
        label="Phone"
        type="tel"
        value={content.phone ?? ""}
        onChange={(e) => set("phone", e.target.value)}
        placeholder="(555) 123-4567"
      />
      <Input
        label="Location"
        value={content.location ?? ""}
        onChange={(e) => set("location", e.target.value)}
        placeholder="New York, NY"
      />
      <Input
        label="LinkedIn"
        value={content.linkedin ?? ""}
        onChange={(e) => set("linkedin", e.target.value)}
        placeholder="linkedin.com/in/johndoe"
      />
      <Input
        label="Website"
        value={content.website ?? ""}
        onChange={(e) => set("website", e.target.value)}
        placeholder="johndoe.dev"
      />
    </div>
  );
}

/* ─── Summary ──────────────────────────────────────────────────── */

function SummaryEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  return (
    <Textarea
      label="Professional Summary"
      value={content.text ?? ""}
      onChange={(e) => onChange({ ...content, text: e.target.value })}
      placeholder="A brief summary of your professional background, key achievements, and career goals…"
      className="min-h-[120px]"
    />
  );
}

/* ─── Experience ───────────────────────────────────────────────── */

function ExperienceEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const items: any[] = content.items ?? [];

  const updateItem = (index: number, field: string, value: any) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `exp-${uuid().slice(0, 8)}`,
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          bullets: [""],
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  const updateBullet = (itemIdx: number, bulletIdx: number, value: string) => {
    const updated = items.map((item, i) => {
      if (i !== itemIdx) return item;
      const bullets = [...(item.bullets ?? [])];
      bullets[bulletIdx] = value;
      return { ...item, bullets };
    });
    onChange({ ...content, items: updated });
  };

  const addBullet = (itemIdx: number) => {
    const updated = items.map((item, i) => {
      if (i !== itemIdx) return item;
      return { ...item, bullets: [...(item.bullets ?? []), ""] };
    });
    onChange({ ...content, items: updated });
  };

  const removeBullet = (itemIdx: number, bulletIdx: number) => {
    const updated = items.map((item, i) => {
      if (i !== itemIdx) return item;
      return {
        ...item,
        bullets: (item.bullets ?? []).filter(
          (_: string, bi: number) => bi !== bulletIdx
        ),
      };
    });
    onChange({ ...content, items: updated });
  };

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Position {idx + 1}
            </span>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(idx)}
                className="h-6 px-2 text-xs text-gray-400 hover:text-red-500"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Job Title"
              value={item.title ?? ""}
              onChange={(e) => updateItem(idx, "title", e.target.value)}
              placeholder="Software Engineer"
            />
            <Input
              label="Company"
              value={item.company ?? ""}
              onChange={(e) => updateItem(idx, "company", e.target.value)}
              placeholder="Acme Inc."
            />
            <Input
              label="Location"
              value={item.location ?? ""}
              onChange={(e) => updateItem(idx, "location", e.target.value)}
              placeholder="San Francisco, CA"
            />
            <div className="flex items-end gap-3">
              <Input
                label="Start Date"
                value={item.startDate ?? ""}
                onChange={(e) => updateItem(idx, "startDate", e.target.value)}
                placeholder="Jan 2022"
              />
              <Input
                label="End Date"
                value={item.current ? "Present" : item.endDate ?? ""}
                onChange={(e) => updateItem(idx, "endDate", e.target.value)}
                placeholder="Dec 2023"
                disabled={item.current}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={item.current ?? false}
              onChange={(e) => updateItem(idx, "current", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            I currently work here
          </label>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-700">
              Bullet Points
            </span>
            {(item.bullets ?? []).map((bullet: string, bi: number) => (
              <div key={bi} className="flex items-start gap-2">
                <span className="mt-2.5 text-gray-400">&bull;</span>
                <Textarea
                  value={bullet}
                  onChange={(e) => updateBullet(idx, bi, e.target.value)}
                  placeholder="Describe your accomplishment…"
                  className="min-h-[60px]"
                />
                {(item.bullets ?? []).length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBullet(idx, bi)}
                    className="mt-1 h-7 w-7 shrink-0 p-0 text-gray-400 hover:text-red-500"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addBullet(idx)}
              className="text-blue-600 hover:text-blue-700"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Bullet
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Position
      </Button>
    </div>
  );
}

/* ─── Education ────────────────────────────────────────────────── */

function EducationEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const items: any[] = content.items ?? [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `edu-${uuid().slice(0, 8)}`,
          degree: "",
          school: "",
          location: "",
          startDate: "",
          endDate: "",
          gpa: "",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Education {idx + 1}
            </span>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(idx)}
                className="h-6 px-2 text-xs text-gray-400 hover:text-red-500"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Degree"
              value={item.degree ?? ""}
              onChange={(e) => updateItem(idx, "degree", e.target.value)}
              placeholder="B.S. Computer Science"
            />
            <Input
              label="School"
              value={item.school ?? ""}
              onChange={(e) => updateItem(idx, "school", e.target.value)}
              placeholder="MIT"
            />
            <Input
              label="Location"
              value={item.location ?? ""}
              onChange={(e) => updateItem(idx, "location", e.target.value)}
              placeholder="Cambridge, MA"
            />
            <Input
              label="GPA"
              value={item.gpa ?? ""}
              onChange={(e) => updateItem(idx, "gpa", e.target.value)}
              placeholder="3.8/4.0"
            />
            <Input
              label="Start Date"
              value={item.startDate ?? ""}
              onChange={(e) => updateItem(idx, "startDate", e.target.value)}
              placeholder="Aug 2018"
            />
            <Input
              label="End Date"
              value={item.endDate ?? ""}
              onChange={(e) => updateItem(idx, "endDate", e.target.value)}
              placeholder="May 2022"
            />
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Education
      </Button>
    </div>
  );
}

/* ─── Skills ───────────────────────────────────────────────────── */

function SkillsEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const skills: string[] = (content.items ?? []).filter(
    (s: string) => s !== ""
  );
  const [inputValue, setInputValue] = React.useState("");

  const addSkill = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    onChange({ ...content, items: [...skills, trimmed] });
    setInputValue("");
  };

  const removeSkill = (index: number) => {
    onChange({
      ...content,
      items: skills.filter((_, i) => i !== index),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a skill and press Enter…"
        />
        <Button variant="outline" size="sm" onClick={addSkill} className="shrink-0">
          <Plus className="mr-1 h-3.5 w-3.5" />
          Add
        </Button>
      </div>

      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, idx) => (
            <Badge key={idx} className="gap-1 pr-1">
              {skill}
              <button
                onClick={() => removeSkill(idx)}
                className="ml-1 rounded-full p-0.5 hover:bg-blue-200"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Projects ─────────────────────────────────────────────────── */

function ProjectsEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const items: any[] = content.items ?? [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `proj-${uuid().slice(0, 8)}`,
          name: "",
          description: "",
          technologies: "",
          link: "",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Project {idx + 1}
            </span>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(idx)}
                className="h-6 px-2 text-xs text-gray-400 hover:text-red-500"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Project Name"
              value={item.name ?? ""}
              onChange={(e) => updateItem(idx, "name", e.target.value)}
              placeholder="My Awesome Project"
            />
            <Input
              label="Technologies"
              value={item.technologies ?? ""}
              onChange={(e) => updateItem(idx, "technologies", e.target.value)}
              placeholder="React, Node.js, PostgreSQL"
            />
            <div className="col-span-2">
              <Textarea
                label="Description"
                value={item.description ?? ""}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="Brief description of the project and your role…"
                className="min-h-[70px]"
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Link"
                value={item.link ?? ""}
                onChange={(e) => updateItem(idx, "link", e.target.value)}
                placeholder="https://github.com/johndoe/project"
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Project
      </Button>
    </div>
  );
}

/* ─── Certifications ───────────────────────────────────────────── */

function CertificationsEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const items: any[] = content.items ?? [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `cert-${uuid().slice(0, 8)}`,
          name: "",
          issuer: "",
          date: "",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative space-y-3 rounded-lg border border-gray-100 bg-gray-50/50 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500">
              Certification {idx + 1}
            </span>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(idx)}
                className="h-6 px-2 text-xs text-gray-400 hover:text-red-500"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Certification Name"
              value={item.name ?? ""}
              onChange={(e) => updateItem(idx, "name", e.target.value)}
              placeholder="AWS Solutions Architect"
            />
            <Input
              label="Issuer"
              value={item.issuer ?? ""}
              onChange={(e) => updateItem(idx, "issuer", e.target.value)}
              placeholder="Amazon Web Services"
            />
            <Input
              label="Date"
              value={item.date ?? ""}
              onChange={(e) => updateItem(idx, "date", e.target.value)}
              placeholder="Jun 2023"
            />
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Certification
      </Button>
    </div>
  );
}

/* ─── Languages ────────────────────────────────────────────────── */

const proficiencyLevels = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Basic",
] as const;

function LanguagesEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const items: any[] = content.items ?? [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `lang-${uuid().slice(0, 8)}`,
          language: "",
          proficiency: "Native",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-end gap-3">
          <Input
            label={idx === 0 ? "Language" : undefined}
            value={item.language ?? ""}
            onChange={(e) => updateItem(idx, "language", e.target.value)}
            placeholder="Spanish"
          />
          <div className="w-full">
            {idx === 0 && (
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Proficiency
              </label>
            )}
            <select
              value={item.proficiency ?? "Native"}
              onChange={(e) => updateItem(idx, "proficiency", e.target.value)}
              className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-1"
            >
              {proficiencyLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
          {items.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(idx)}
              className="mb-0.5 h-8 w-8 shrink-0 p-0 text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem}>
        <Plus className="mr-1.5 h-4 w-4" />
        Add Language
      </Button>
    </div>
  );
}
