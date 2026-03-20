"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import type { ProjectsSectionContent } from "@/types/resume";

export function ProjectsSection({
  content,
  onChange,
}: {
  content: ProjectsSectionContent | Record<string, unknown>;
  onChange: (c: ProjectsSectionContent) => void;
}) {
  const items = (content as ProjectsSectionContent).items ?? [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ items: updated });
  };

  const addItem = () => {
    onChange({
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
    onChange({ items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Project {idx + 1}
            </span>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(idx)}
                className="h-6 px-2 text-xs text-slate-500 hover:bg-red-500/10 hover:text-red-400"
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
              variant="dark"
            />
            <Input
              label="Technologies"
              value={item.technologies ?? ""}
              onChange={(e) => updateItem(idx, "technologies", e.target.value)}
              placeholder="React, Node.js, PostgreSQL"
              variant="dark"
            />
            <div className="col-span-2">
              <Textarea
                label="Description"
                value={item.description ?? ""}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="Brief description of the project and your role…"
                className="min-h-[70px]"
                variant="dark"
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Link"
                value={item.link ?? ""}
                onChange={(e) => updateItem(idx, "link", e.target.value)}
                placeholder="https://github.com/johndoe/project"
                variant="dark"
              />
            </div>
          </div>
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="border-white/[0.12] text-slate-300 hover:bg-white/[0.06] hover:text-white"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Add Project
      </Button>
    </div>
  );
}
