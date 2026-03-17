"use client";

import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Trash2,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  Sparkles,
  FolderKanban,
  Award,
  Languages,
} from "lucide-react";
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

const sectionIcons: Record<string, React.ElementType> = {
  personal: User,
  summary: FileText,
  experience: Briefcase,
  education: GraduationCap,
  skills: Sparkles,
  projects: FolderKanban,
  certifications: Award,
  languages: Languages,
};

const requiredSections = new Set(["personal", "summary", "experience", "education", "skills"]);

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

  const Icon = sectionIcons[type] ?? FileText;
  const isRequired = requiredSections.has(type);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl border border-white/[0.08] bg-dark-50/60 shadow-glass transition-all duration-200",
        isDragging && "z-50 shadow-xl ring-2 ring-brand-500/30"
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300 active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06]">
          <Icon className="h-4 w-4 text-slate-400" />
        </div>

        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <span className="text-sm font-medium text-white">
            {sectionLabels[type] || type}
          </span>
          {isRequired && (
            <span className="rounded-md bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
              Required
            </span>
          )}
        </button>

        {type !== "personal" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-8 w-8 p-0 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
            aria-label={`Remove ${sectionLabels[type] || type}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}

        <button
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="ml-1 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-300"
          aria-label={isCollapsed ? "Expand" : "Collapse"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-out",
          isCollapsed ? "max-h-0 opacity-0" : "max-h-[5000px] opacity-100"
        )}
      >
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
