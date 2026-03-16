"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sectionLabels: Record<string, string> = {
  personal: "Personal Information",
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
};

interface SortableSectionProps {
  id: string;
  type: string;
  onRemove: () => void;
  children: React.ReactNode;
}

export function SortableSection({
  id,
  type,
  onRemove,
  children,
}: SortableSectionProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border border-slate-200/60 bg-white shadow-soft transition-shadow",
        isDragging && "z-50 shadow-lg ring-2 ring-brand-500/20"
      )}
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-slate-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-400" />
          )}
          <span className="text-sm font-medium text-slate-800">
            {sectionLabels[type] || type}
          </span>
        </button>

        {type !== "personal" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
            aria-label={`Remove ${sectionLabels[type] || type}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          isCollapsed ? "max-h-0" : "max-h-[5000px]"
        )}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
