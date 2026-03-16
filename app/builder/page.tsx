"use client";

import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Sparkles,
  Palette,
  LayoutTemplate,
  Check,
  Loader2,
  CloudOff,
  Cloud,
  List,
  FileText,
  Target,
  FileSignature,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResumePreview from "@/components/resume/resume-preview";
import { templates, templateRegistry, type TemplateName } from "@/components/resume/templates";
import { TemplateGallery } from "@/components/resume/template-gallery";
import { Modal } from "@/components/ui/modal";
import { useResumeStore, type ResumeSection } from "@/hooks/use-resume-store";
import { useAutosave } from "@/hooks/use-autosave";
import { SortableSection } from "@/components/editor/sortable-section";
import { SectionEditor } from "@/components/editor/section-editor";
import {
  BulletGeneratorModal,
  ScoreModal,
  CoverLetterModal,
  KeywordMatchModal,
} from "@/components/editor/ai-tools-modal";
import {
  exportToPdf,
  exportToTxt,
  exportToJson,
  exportToDocx,
  type ExportFormat,
} from "@/components/editor/pdf-export";
import { ExportModal } from "@/components/editor/export-modal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const PRESET_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#16a34a",
  "#0891b2",
  "#475569",
];

const TEMPLATE_LABEL_MAP: Record<string, string> = {};
templateRegistry.forEach((t) => { TEMPLATE_LABEL_MAP[t.id] = t.name; });

export default function BuilderPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-gray-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-500">Loading builder…</p>
          </div>
        </div>
      }
    >
      <BuilderPage />
    </Suspense>
  );
}

function BuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("id");
  const templateParam = searchParams.get("template");
  const { data: session, status } = useSession();

  const {
    resume,
    isDirty,
    isSaving,
    setResume,
    updateTitle,
    updateTemplate,
    updateColor,
    removeSection,
    reorderSections,
  } = useResumeStore();

  useAutosave();

  const sections = resume?.sections ?? [];

  const previewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Auth guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Load or create resume
  useEffect(() => {
    if (status !== "authenticated") return;

    const init = async () => {
      setLoading(true);
      try {
        // Fetch plan info in parallel
        fetch("/api/resumes")
          .then((r) => r.json())
          .then((d) => {
            if (d.subscription?.plan === "pro") setUserPlan("pro");
          })
          .catch(() => {});

        if (resumeId) {
          const res = await fetch(`/api/resumes/${resumeId}`);
          if (!res.ok) throw new Error("Failed to load resume");
          const data = await res.json();
          const loaded = data.resume ?? data;
          setResume({ ...loaded, sections: loaded.sections ?? [] });
          if (templateParam && templateParam in templates) {
            updateTemplate(templateParam as TemplateName);
          }
        } else {
          const body: Record<string, string> = { title: "Untitled Resume" };
          if (templateParam && templateParam in templates) {
            body.template = templateParam;
          }
          const res = await fetch("/api/resumes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error("Failed to create resume");
          const data = await res.json();
          const created = data.resume ?? data;
          setResume({ ...created, sections: created.sections ?? [] });
          if (templateParam && templateParam in templates) {
            updateTemplate(templateParam as TemplateName);
          }
          router.replace(`/builder?id=${created.id}`);
        }
      } catch {
        toast.error("Failed to load resume");
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [resumeId, status, setResume, router]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-dropdown]")) {
        setColorOpen(false);
        setAiToolsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const currentSections = [...(resume?.sections ?? [])];
      const oldIndex = currentSections.findIndex((s) => s.id === active.id);
      const newIndex = currentSections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(currentSections, oldIndex, newIndex).map(
        (s, i) => ({ ...s, order: i })
      );
      reorderSections(reordered);
    },
    [resume?.sections, reorderSections]
  );

  const handleExport = useCallback(
    (format: ExportFormat, filename: string) => {
      const name = filename || resume.title;
      switch (format) {
        case "pdf":
          exportToPdf(previewRef.current, name);
          break;
        case "txt":
          exportToTxt(sections, name);
          break;
        case "json":
          exportToJson(sections, name, resume.template, resume.color);
          break;
        case "docx":
          exportToDocx(sections, name);
          break;
      }
    },
    [resume.title, resume.template, resume.color, sections]
  );

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-gray-500">Loading builder…</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-50">
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <header className="z-30 flex shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 py-2.5 shadow-sm">
        <Link
          href="/dashboard"
          className="mr-1 rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        {/* Title */}
        <input
          type="text"
          value={resume.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="min-w-0 max-w-[200px] rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-gray-900 transition-colors hover:border-gray-200 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
          aria-label="Resume title"
        />

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Template selector */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setTemplateGalleryOpen(true);
            setColorOpen(false);
            setAiToolsOpen(false);
          }}
          className="gap-1.5 text-gray-600"
        >
          <LayoutTemplate className="h-4 w-4" />
          <span className="hidden sm:inline">
            {TEMPLATE_LABEL_MAP[resume.template] ?? "Template"}
          </span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        {/* Color picker */}
        <div className="relative" data-dropdown>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setColorOpen((o) => !o);
              setAiToolsOpen(false);
            }}
            className="gap-1.5 text-gray-600"
          >
            <Palette className="h-4 w-4" />
            <span
              className="h-4 w-4 rounded-full border border-gray-200"
              style={{ backgroundColor: resume.color }}
            />
            <ChevronDown className="h-3 w-3" />
          </Button>

          {colorOpen && (
            <div className="absolute left-0 top-full z-40 mt-1 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
              <p className="mb-2 text-xs font-medium text-gray-500">
                Accent Color
              </p>
              <div className="mb-3 grid grid-cols-8 gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateColor(color)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition-transform hover:scale-110",
                      resume.color === color
                        ? "border-gray-900 ring-2 ring-gray-900/20"
                        : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Custom:</label>
                <input
                  type="color"
                  value={resume.color}
                  onChange={(e) => updateColor(e.target.value)}
                  className="h-7 w-10 cursor-pointer rounded border border-gray-200"
                />
                <span className="text-xs text-gray-400">{resume.color}</span>
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-gray-200" />

        {/* Save indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
              <span className="text-blue-600">Saving…</span>
            </>
          ) : isDirty ? (
            <>
              <CloudOff className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-amber-600">Unsaved changes</span>
            </>
          ) : (
            <>
              <Cloud className="h-3.5 w-3.5 text-green-500" />
              <span className="text-green-600">Saved</span>
            </>
          )}
        </div>

        <div className="flex-1" />

        {/* AI Tools dropdown */}
        <div className="relative" data-dropdown>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setAiToolsOpen((o) => !o);
              setColorOpen(false);
            }}
            className="gap-1.5 text-purple-600 hover:bg-purple-50 hover:text-purple-700"
          >
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI Tools</span>
            <ChevronDown className="h-3 w-3" />
          </Button>

          {aiToolsOpen && (
            <div className="absolute right-0 top-full z-40 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  setActiveModal("bullets");
                  setAiToolsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <List className="h-4 w-4 text-purple-500" />
                Generate Bullets
              </button>
              <button
                onClick={() => {
                  setActiveModal("score");
                  setAiToolsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Target className="h-4 w-4 text-purple-500" />
                Score Resume
              </button>
              <button
                onClick={() => {
                  setActiveModal("coverLetter");
                  setAiToolsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <FileSignature className="h-4 w-4 text-purple-500" />
                Generate Cover Letter
              </button>
              <button
                onClick={() => {
                  setActiveModal("keywords");
                  setAiToolsOpen(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <Search className="h-4 w-4 text-purple-500" />
                Keyword Match
              </button>
            </div>
          )}
        </div>

        {/* Export */}
        <Button size="sm" onClick={() => setExportOpen(true)} className="gap-1.5">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </header>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor Panel */}
        <div className="flex w-[55%] flex-col overflow-y-auto border-r border-gray-200 bg-gray-50">
          <div className="flex-1 space-y-3 p-4">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sections.map((s) => s.id)}
                strategy={verticalListSortingStrategy}
              >
                {[...sections]
                  .sort((a, b) => a.order - b.order)
                  .map((section) => (
                    <SortableSection
                      key={section.id}
                      id={section.id}
                      type={section.type}
                      onRemove={() => removeSection(section.id)}
                    >
                      <SectionEditor
                        sectionId={section.id}
                        type={section.type}
                        content={section.content}
                        resumeId={resume.id}
                        isPro={userPlan === "pro"}
                      />
                    </SortableSection>
                  ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>

        {/* Right: Live Preview */}
        <div className="flex w-[45%] flex-col items-center overflow-y-auto bg-gray-100 p-6">
          <div className="sticky top-0">
            <ResumePreview
              ref={previewRef}
              template={resume.template as TemplateName}
              sections={sections}
              color={resume.color}
              scale={0.6}
            />
          </div>
        </div>
      </div>

      {/* ── Template Gallery Modal ──────────────────────────────── */}
      <Modal
        isOpen={templateGalleryOpen}
        onClose={() => setTemplateGalleryOpen(false)}
        title="Choose a Template"
        size="xl"
      >
        <div className="max-h-[70vh] overflow-y-auto -mx-2 px-2">
          <TemplateGallery
            selected={resume.template as TemplateName}
            onSelect={(t) => {
              updateTemplate(t);
              setTemplateGalleryOpen(false);
            }}
            columns={3}
          />
        </div>
      </Modal>

      {/* ── Export Modal ─────────────────────────────────────────── */}
      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        isPro={userPlan === "pro"}
        onExport={handleExport}
        resumeTitle={resume.title}
        templateName={TEMPLATE_LABEL_MAP[resume.template] ?? resume.template}
      />

      {/* ── AI Tool Modals ──────────────────────────────────────── */}
      <BulletGeneratorModal
        isOpen={activeModal === "bullets"}
        onClose={() => setActiveModal(null)}
      />
      <ScoreModal
        isOpen={activeModal === "score"}
        onClose={() => setActiveModal(null)}
      />
      <CoverLetterModal
        isOpen={activeModal === "coverLetter"}
        onClose={() => setActiveModal(null)}
      />
      <KeywordMatchModal
        isOpen={activeModal === "keywords"}
        onClose={() => setActiveModal(null)}
      />
    </div>
  );
}
