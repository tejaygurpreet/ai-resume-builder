"use client";

import { create } from "zustand";
import { getAccentForTemplate } from "@/components/resume/templates";

export interface ResumeSection {
  id: string;
  type: string;
  order: number;
  content: any;
}

export interface ResumeData {
  id?: string;
  title: string;
  template: string;
  color: string;
  sections: ResumeSection[];
}

interface ResumeStore {
  resume: ResumeData;
  isDirty: boolean;
  isSaving: boolean;
  lastSavedAt: Date | null;
  setResume: (resume: ResumeData) => void;
  updateTitle: (title: string) => void;
  updateTemplate: (template: string) => void;
  updateColor: (color: string) => void;
  updateSection: (id: string, content: any) => void;
  addSection: (section: ResumeSection) => void;
  removeSection: (id: string) => void;
  reorderSections: (sections: ResumeSection[]) => void;
  setIsSaving: (saving: boolean) => void;
  markClean: () => void;
}

export function formatTimeAgo(date: Date): string {
  const sec = Math.floor((Date.now() - date.getTime()) / 1000);
  if (sec < 60) return "just now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return date.toLocaleDateString();
}

const defaultResume: ResumeData = {
  title: "Untitled Resume",
  template: "modern",
  color: "#2563eb",
  sections: [
    {
      id: "personal",
      type: "personal",
      order: 0,
      content: {
        firstName: "",
        lastName: "",
        fullName: "",
        email: "",
        phone: "",
        location: "",
        linkedin: "",
        github: "",
        portfolio: "",
        website: "",
      },
    },
    {
      id: "summary",
      type: "summary",
      order: 1,
      content: { text: "" },
    },
    {
      id: "experience",
      type: "experience",
      order: 2,
      content: {
        items: [
          {
            id: "exp-1",
            title: "",
            company: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            bullets: [""],
          },
        ],
      },
    },
    {
      id: "education",
      type: "education",
      order: 3,
      content: {
        items: [
          {
            id: "edu-1",
            degree: "",
            school: "",
            location: "",
            startDate: "",
            endDate: "",
            gpa: "",
          },
        ],
      },
    },
    {
      id: "skills",
      type: "skills",
      order: 4,
      content: { items: [""] },
    },
    {
      id: "projects",
      type: "projects",
      order: 5,
      content: { items: [] },
    },
    {
      id: "certifications",
      type: "certifications",
      order: 6,
      content: { items: [] },
    },
    {
      id: "languages",
      type: "languages",
      order: 7,
      content: { items: [] },
    },
    {
      id: "awards",
      type: "awards",
      order: 8,
      content: { items: [] },
    },
    {
      id: "volunteer",
      type: "volunteer",
      order: 9,
      content: { items: [] },
    },
    {
      id: "interests",
      type: "interests",
      order: 10,
      content: { items: [] },
    },
  ],
};

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: defaultResume,
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  setResume: (resume) =>
    set({
      resume: { ...resume, sections: resume?.sections ?? [] },
      isDirty: false,
    }),
  updateTitle: (title) =>
    set((state) => ({
      resume: { ...state.resume, title },
      isDirty: true,
    })),
  updateTemplate: (template) =>
    set((state) => ({
      resume: {
        ...state.resume,
        template,
        color: getAccentForTemplate(template),
      },
      isDirty: true,
    })),
  updateColor: (color) =>
    set((state) => ({
      resume: { ...state.resume, color },
      isDirty: true,
    })),
  updateSection: (id, content) =>
    set((state) => ({
      resume: {
        ...state.resume,
        sections: (state.resume.sections ?? []).map((s) =>
          s.id === id ? { ...s, content } : s
        ),
      },
      isDirty: true,
    })),
  addSection: (section) =>
    set((state) => ({
      resume: {
        ...state.resume,
        sections: [...(state.resume.sections ?? []), section],
      },
      isDirty: true,
    })),
  removeSection: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        sections: (state.resume.sections ?? []).filter((s) => s.id !== id),
      },
      isDirty: true,
    })),
  reorderSections: (sections) =>
    set((state) => ({
      resume: { ...state.resume, sections },
      isDirty: true,
    })),
  setIsSaving: (isSaving) => set({ isSaving }),
  markClean: () => set({ isDirty: false, lastSavedAt: new Date() }),
}));

/* === EDITOR FIXED: CLEAN EMPTY PREVIEW + SUMMARY MOVED BELOW EXPERIENCE/EDUCATION IN SIDEBAR === */
