"use client";

import React, { useState, useMemo } from "react";
import {
  templates,
  templateRegistry,
  type TemplateName,
  type TemplateCategory,
  type TemplateInfo,
} from "./templates";
import { sampleSections } from "@/lib/sample-resume";
import { cn } from "@/lib/utils";
import { Check, Search } from "lucide-react";

const CATEGORIES: { key: TemplateCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "modern", label: "Modern" },
  { key: "minimal", label: "Minimal" },
  { key: "professional", label: "Professional" },
  { key: "creative", label: "Creative" },
  { key: "technical", label: "Technical" },
  { key: "academic", label: "Academic" },
];

interface TemplateGalleryProps {
  selected?: TemplateName;
  onSelect: (template: TemplateName) => void;
  columns?: 2 | 3 | 4;
}

export function TemplateGallery({
  selected,
  onSelect,
  columns = 3,
}: TemplateGalleryProps) {
  const [category, setCategory] = useState<TemplateCategory | "all">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return templateRegistry.filter((t) => {
      if (category !== "all" && t.category !== category) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [category, search]);

  const gridClass =
    columns === 2
      ? "grid-cols-1 sm:grid-cols-2"
      : columns === 4
        ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div>
      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                category === key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <p className="text-sm text-gray-500">
            No templates match your search.
          </p>
        </div>
      ) : (
        <div className={cn("grid gap-5", gridClass)}>
          {filtered.map((info) => (
            <TemplateCard
              key={info.id}
              info={info}
              isSelected={selected === info.id}
              onSelect={() => onSelect(info.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TemplateCard({
  info,
  isSelected,
  onSelect,
}: {
  info: TemplateInfo;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const TemplateComponent = templates[info.id];
  const previewScale = 0.22;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 bg-white text-left",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.03] hover:shadow-xl hover:shadow-gray-200/80",
        isSelected
          ? "border-blue-500 ring-2 ring-blue-500/20 shadow-lg shadow-blue-100"
          : "border-gray-200 shadow-sm hover:border-blue-400"
      )}
    >
      {/* Selected badge */}
      {isSelected && (
        <div className="absolute right-2.5 top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 shadow-lg">
          <Check className="h-4 w-4 text-white" />
        </div>
      )}

      {/* Mini preview */}
      <div className="relative overflow-hidden bg-gray-50" style={{ height: 260 }}>
        <div
          style={{
            width: 794,
            height: 1123,
            transform: `scale(${previewScale})`,
            transformOrigin: "top left",
            position: "absolute",
            top: 0,
            left: "50%",
            marginLeft: -(794 * previewScale) / 2,
          }}
        >
          <TemplateComponent sections={sampleSections} color={info.accent} />
        </div>

        {/* Hover overlay with button */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
          <span
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-semibold shadow-xl",
              "translate-y-2 opacity-0 transition-all duration-300",
              "group-hover:translate-y-0 group-hover:opacity-100",
              isSelected
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-900 hover:bg-blue-600 hover:text-white"
            )}
          >
            {isSelected ? (
              <>
                <Check className="h-4 w-4" />
                Selected
              </>
            ) : (
              "Use Template"
            )}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="border-t border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">{info.name}</h3>
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium capitalize text-gray-500">
            {info.category}
          </span>
        </div>
        <p className="mt-0.5 text-xs leading-tight text-gray-400">
          {info.description}
        </p>
      </div>
    </div>
  );
}
