"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuid } from "uuid";
import type { CertificationsSectionContent } from "@/types/resume";

export function CertificationsSection({
  content,
  onChange,
  /** Reuse the same form for the Awards section */
  awardMode,
}: {
  content: CertificationsSectionContent | Record<string, unknown>;
  onChange: (c: CertificationsSectionContent) => void;
  awardMode?: boolean;
}) {
  const items = (content as CertificationsSectionContent).items ?? [];

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
          id: `${awardMode ? "award" : "cert"}-${uuid().slice(0, 8)}`,
          name: "",
          issuer: "",
          date: "",
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
              {awardMode ? "Award" : "Certification"} {idx + 1}
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

          <div className="grid grid-cols-3 gap-3">
            <Input
              label={awardMode ? "Award / honor" : "Certification Name"}
              value={item.name ?? ""}
              onChange={(e) => updateItem(idx, "name", e.target.value)}
              placeholder={
                awardMode ? "Employee of the Year" : "AWS Solutions Architect"
              }
              variant="dark"
            />
            <Input
              label={awardMode ? "Organization" : "Issuer"}
              value={item.issuer ?? ""}
              onChange={(e) => updateItem(idx, "issuer", e.target.value)}
              placeholder={awardMode ? "Acme Corp" : "Amazon Web Services"}
              variant="dark"
            />
            <Input
              label="Date"
              value={item.date ?? ""}
              onChange={(e) => updateItem(idx, "date", e.target.value)}
              placeholder="Jun 2023"
              variant="dark"
            />
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
        {awardMode ? "Add Award" : "Add Certification"}
      </Button>
    </div>
  );
}
