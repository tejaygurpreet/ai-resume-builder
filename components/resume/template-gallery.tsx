"use client";

import React, { useState, useMemo } from "react";
import {
  templates,
  templateRegistry,
  type TemplateName,
  type TemplateInfo,
} from "./templates";
import { TEMPLATE_CATEGORIES } from "@/lib/template-config";
import type { TemplateCategory } from "@/lib/template-config";
import { sampleSections } from "@/lib/sample-resume";
import { cn } from "@/lib/utils";
import { Check, Search } from "lucide-react";
import { TemplatePreviewModal } from "@/components/landing/template-preview-modal";

interface TemplateGalleryProps {
  selected?: TemplateName;
  onSelect: (template: TemplateName) => void;
  columns?: 2 | 3 | 4;
}

export function TemplateGallery({ selected, onSelect, columns = 3 }: TemplateGalleryProps) {
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return templateRegistry.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [category, search]);

  const gridClass = columns === 2 ? "grid-cols-1 sm:grid-cols-2" : columns === 4 ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div>
      <div className="mb-8 space-y-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.05] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 hover:border-white/[0.15]"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {TEMPLATE_CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200",
                category === key
                  ? "bg-brand-500 text-white shadow-glow"
                  : "border border-white/[0.06] bg-white/[0.04] text-slate-400 hover:bg-white/[0.08] hover:text-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-center">
          <p className="text-sm text-slate-500">No templates match your search.</p>
        </div>
      ) : (
        <div className={cn("grid gap-5", gridClass)}>
          {filtered.map((info) => (
            <TemplateCard
              key={info.id}
              info={info}
              isSelected={selected === info.id}
              onSelect={() => onSelect(info.id as TemplateName)}
              onPreview={() => setPreviewId(info.id)}
            />
          ))}
        </div>
      )}

      <TemplatePreviewModal
        templateId={previewId}
        onClose={() => setPreviewId(null)}
        onUseTemplate={(id) => {
          onSelect(id as TemplateName);
          setPreviewId(null);
        }}
      />
    </div>
  );
}

function TemplateCard({ info, isSelected, onSelect, onPreview }: { info: TemplateInfo; isSelected: boolean; onSelect: () => void; onPreview: () => void }) {
  const TemplateComponent = templates[info.id];
  const previewScale = 0.22;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onPreview}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPreview(); } }}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl text-left",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-3 hover:scale-[1.02] hover:shadow-glass-lg",
        isSelected
          ? "border border-brand-500/60 ring-2 ring-brand-500/20 shadow-glow bg-white/[0.04]"
          : "border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
      )}
    >
      {isSelected && (
        <div className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-xl bg-brand-500 shadow-glow">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      <div className="relative overflow-hidden bg-dark-100" style={{ height: 260 }}>
        <div
          style={{
            width: 794, height: 1123,
            transform: `scale(${previewScale})`,
            transformOrigin: "top left",
            position: "absolute", top: 0, left: "50%",
            marginLeft: -(794 * previewScale) / 2,
          }}
        >
          <TemplateComponent sections={sampleSections} color={info.accent} />
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50 group-hover:backdrop-blur-[1px]">
          <span className={cn(
            "flex items-center gap-1.5 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-lg",
            "translate-y-3 opacity-0 transition-all duration-300",
            "group-hover:translate-y-0 group-hover:opacity-100",
            isSelected ? "bg-brand-500 text-white" : "bg-white text-dark"
          )}>
            {isSelected ? (<><Check className="h-4 w-4" /> Selected</>) : "Use Template"}
          </span>
        </div>
      </div>

      <div className="border-t border-white/[0.06] px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{info.name}</h3>
          <span className="rounded-full bg-white/[0.05] px-2.5 py-0.5 text-[10px] font-medium capitalize text-slate-500">{info.category}</span>
        </div>
        <p className="mt-0.5 text-xs leading-tight text-slate-500">{info.description}</p>
      </div>
    </div>
  );
}
