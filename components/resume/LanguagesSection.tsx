"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import type { LanguageProficiency, LanguagesSectionContent } from "@/types/resume";

const proficiencyLevels: LanguageProficiency[] = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Basic",
];

export function LanguagesSection({
  content,
  onChange,
}: {
  content: LanguagesSectionContent | Record<string, unknown>;
  onChange: (c: LanguagesSectionContent) => void;
}) {
  const items = (content as LanguagesSectionContent).items ?? [];

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
          id: `lang-${uuid().slice(0, 8)}`,
          language: "",
          proficiency: "Native",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ items: items.filter((_, i) => i !== index) });
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
            variant="dark"
          />
          <div className="w-full">
            {idx === 0 && (
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Proficiency
              </label>
            )}
            <select
              value={item.proficiency ?? "Native"}
              onChange={(e) => updateItem(idx, "proficiency", e.target.value)}
              className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2 text-sm text-white transition-colors focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {proficiencyLevels.map((level) => (
                <option key={level} value={level} className="bg-dark-100 text-white">
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
              className="mb-0.5 h-8 w-8 shrink-0 p-0 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        onClick={addItem}
        className="border-white/[0.12] text-slate-300 hover:bg-white/[0.06] hover:text-white"
      >
        <Plus className="mr-1.5 h-4 w-4" />
        Add Language
      </Button>
    </div>
  );
}
