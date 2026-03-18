"use client";

/* ALL 7 BUGS FIXED: (1) No preview download/print - Export only via main button
 * (2) Template switching updates store + color from template accent
 * (3) Accent color from template, synced on template change
 * (4) Right sidebar scroll with max-h and overflow-y-auto
 * (5) Pricing: Free 5 exports, Pro $7.99/$59/$99, One-Time $19.99, no ads
 * (6) useResumeExport hook + ExportModal centralizes export flow
 * (7) Template modal scale-to-fit, responsive max-height
 */

import React, {
  Suspense,
  useEffect,
  useState,
  useCallback,
  useRef,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronDown,
  Download,
  LayoutDashboard,
  LayoutTemplate,
  Loader2,
  CloudOff,
  Cloud,
  Undo2,
  Redo2,
  PanelRightOpen,
  PanelRightClose,
  Target,
  FileSignature,
  FileSearch,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LivePreview } from "@/components/editor/live-preview";
import { templateRegistry, type TemplateName } from "@/components/resume/templates";
import { templates } from "@/components/resume/templates";
import { isFreeTemplate } from "@/lib/template-config";
import { TemplateGallery } from "@/components/resume/template-gallery";
import { Modal } from "@/components/ui/modal";
import { useResumeStore, formatTimeAgo, type ResumeSection } from "@/hooks/use-resume-store";
import { useAutosave } from "@/hooks/use-autosave";
import { useUndoRedo } from "@/hooks/use-undo-redo";
import { SectionEditor } from "@/components/editor/section-editor";
import {
  BulletGeneratorModal,
  ScoreModal,
  CoverLetterModal,
  KeywordMatchModal,
} from "@/components/editor/ai-tools-modal";
import { ATSScorePanel } from "@/components/editor/ats-score-panel";
import { TailorResumeModal } from "@/components/editor/tailor-resume-modal";
import {
  exportToPdf,
  exportToTxt,
  exportToJson,
  exportToDocx,
  exportToMarkdown,
  type ExportFormat,
} from "@/components/editor/pdf-export";
import { ExportModal } from "@/components/editor/export-modal";
import { ResumeCompletionModal } from "@/components/editor/resume-completion-modal";
import { UpgradeModal } from "@/components/ui/UpgradeModal";
import { validateResumeCompletion } from "@/lib/resume-validation";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const TEMPLATE_LABEL_MAP: Record<string, string> = {};
templateRegistry.forEach((t) => {
  TEMPLATE_LABEL_MAP[t.id] = t.name;
});

const SECTION_LABELS: Record<string, string> = {
  personal: "Personal Info",
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
};

/** Editor sidebar display order only — does NOT affect template/PDF output order. */
const EDITOR_DISPLAY_ORDER: string[] = [
  "personal",
  "education",
  "experience",
  "summary",
  "skills",
  "projects",
  "certifications",
  "languages",
];

function sortSectionsForEditor(sections: ResumeSection[]): ResumeSection[] {
  const orderMap = new Map(EDITOR_DISPLAY_ORDER.map((t, i) => [t, i]));
  return [...sections].sort((a, b) => {
    const ia = orderMap.get(a.type) ?? 999;
    const ib = orderMap.get(b.type) ?? 999;
    return ia - ib;
  });
}

function SortableSectionCard({
  section,
  resumeId,
  isPro,
  onTailor,
  onLimitReached,
  onImproveProLocked,
}: {
  section: ResumeSection;
  resumeId?: string;
  isPro?: boolean;
  onTailor: () => void;
  onLimitReached?: () => void;
  onImproveProLocked?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const showTailor =
    section.type === "experience" ||
    section.type === "summary" ||
    section.type === "skills";

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-xl border border-white/[0.08] bg-white/[0.03] shadow-sm transition-all hover:border-white/[0.12] hover:bg-white/[0.05]",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1.5 text-slate-500 hover:bg-white/[0.06] hover:text-white active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <span className="flex-1 text-sm font-semibold text-white">
          {SECTION_LABELS[section.type] ?? section.type}
        </span>
        {showTailor && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onTailor}
            className="h-7 gap-1.5 text-xs text-purple-400 hover:bg-purple-500/10 hover:text-purple-300"
          >
            <FileSearch className="h-3.5 w-3.5" />
            Tailor to Job
          </Button>
        )}
      </div>
      <div className="p-4">
        <SectionEditor
          sectionId={section.id}
          type={section.type}
          content={section.content}
          resumeId={resumeId}
          isPro={isPro}
          onLimitReached={onLimitReached}
          onImproveProLocked={onImproveProLocked}
        />
      </div>
    </div>
  );
}

export default function BuilderPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-[#0a0a0b]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            <p className="text-sm text-slate-500">Loading builder…</p>
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
  const exportParam = searchParams.get("export");
  const { data: session, status } = useSession();

  const {
    resume,
    isDirty,
    isSaving,
    lastSavedAt,
    setResume,
    updateTitle,
    updateTemplate,
    updateColor,
    reorderSections,
  } = useResumeStore();

  const prevResumeRef = useRef<string>("");
  const { push, undo, redo, canUndo, canRedo } = useUndoRedo(resume, setResume);

  useEffect(() => {
    if (isDirty && prevResumeRef.current) {
      try {
        const prev = JSON.parse(prevResumeRef.current) as typeof resume;
        push(prev);
      } catch {}
    }
    prevResumeRef.current = JSON.stringify(resume);
  }, [isDirty, resume, push]);

  useAutosave();

  const sections = resume?.sections ?? [];
  const [loading, setLoading] = useState(true);
  const [templateOpen, setTemplateOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const [exportsUsed, setExportsUsed] = useState(0);
  const [hasOneTimeExport, setHasOneTimeExport] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [upgradeModalReason, setUpgradeModalReason] = useState<"ai_limit" | "export_limit" | "improve_pro" | "cover_letter">("export_limit");

  const validation = validateResumeCompletion(sections);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const init = async () => {
      setLoading(true);
      try {
        const subRes = await fetch("/api/resumes");
        const subData = await subRes.json().catch(() => ({}));
        if (subData.subscription?.plan === "pro") setUserPlan("pro");
        if (subData.subscription?.exportsUsed != null) setExportsUsed(subData.subscription.exportsUsed);
        if (subData.subscription?.oneTimeExport) setHasOneTimeExport(true);
        const isPro = subData.subscription?.plan === "pro";

        if (resumeId) {
          const res = await fetch(`/api/resumes/${resumeId}`);
          if (!res.ok) throw new Error("Failed to load");
          const data = await res.json();
          const loaded = data.resume ?? data;
          const secs = (loaded.sections ?? []).map((s: any) => {
            if (s.type === "personal" && s.content) {
              const c = s.content;
              if ((!c.firstName || !c.lastName) && c.fullName) {
                const parts = (c.fullName ?? "").trim().split(/\s+/);
                return {
                  ...s,
                  content: {
                    ...c,
                    firstName: c.firstName ?? parts[0] ?? "",
                    lastName: c.lastName ?? parts.slice(1).join(" ") ?? "",
                  },
                };
              }
            }
            return s;
          });
          setResume({ ...loaded, sections: secs });
          if (templateParam && templateParam in templates && (isPro || isFreeTemplate(templateParam))) {
            updateTemplate(templateParam as TemplateName);
          }
          if (exportParam === "1") {
            setExportOpen(true);
            router.replace(`/builder?id=${resumeId}`, { scroll: false });
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
          if (!res.ok) throw new Error("Failed to create");
          const data = await res.json();
          const created = data.resume ?? data;
          setResume({ ...created, sections: created.sections ?? [] });
          if (templateParam && templateParam in templates && (isPro || isFreeTemplate(templateParam))) {
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
  }, [resumeId, templateParam, exportParam, status, setResume, updateTemplate, router]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;
      const reordered = arrayMove(sections, oldIndex, newIndex).map((s, i) => ({
        ...s,
        order: i,
      }));
      reorderSections(reordered);
    },
    [sections, reorderSections]
  );

  const refreshSubscription = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      const data = await res.json().catch(() => ({}));
      if (data.subscription?.exportsUsed != null) setExportsUsed(data.subscription.exportsUsed);
    } catch {}
  }, []);

  const handleExport = useCallback(
    async (format: ExportFormat, filename: string) => {
      const name = filename || resume.title;
      switch (format) {
        case "pdf":
          await exportToPdf(sections, name, resume.color);
          break;
        case "txt":
          exportToTxt(sections, name);
          break;
        case "json":
          exportToJson(sections, name, resume.template, resume.color);
          break;
        case "docx":
          await exportToDocx(sections, name);
          break;
        case "md":
          exportToMarkdown(sections, name);
          break;
      }
      if (!userPlan || userPlan === "free") {
        if (!hasOneTimeExport) {
          const incRes = await fetch("/api/resumes/increment-export", { method: "POST" });
          if (incRes.ok) await refreshSubscription();
        }
      }
    },
    [resume.title, resume.template, resume.color, sections, userPlan, hasOneTimeExport, refreshSubscription]
  );

  const canExport = userPlan === "pro" || hasOneTimeExport || exportsUsed < 5;

  const handleExportClick = () => {
    if (!validation.isComplete) {
      setCompletionModalOpen(true);
      return;
    }
    if (!canExport) {
      setUpgradeModalReason("export_limit");
      setUpgradeModalOpen(true);
      return;
    }
    setExportOpen(true);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0b]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#0a0a0b]">
      {/* Top nav */}
      <header className="z-30 flex shrink-0 items-center gap-3 border-b border-white/[0.06] bg-[#0a0a0b]/95 px-4 py-3 backdrop-blur-xl">
        <Link
          href="/dashboard"
          className="inline-flex h-9 items-center gap-2 rounded-xl bg-gradient-to-r from-[#6b46c1] to-violet-600 px-4 text-[13px] font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-violet-600 hover:to-[#6b46c1] hover:shadow-purple-500/30 hover:-translate-y-[2px] hover:scale-[1.02] active:translate-y-0 active:scale-[0.99]"
          aria-label="Dashboard"
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>

        <input
          type="text"
          value={resume.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="max-w-[200px] rounded-lg border border-transparent bg-transparent px-3 py-1.5 text-sm font-semibold text-white placeholder:text-slate-500 focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          placeholder="Resume name"
        />

        <div className="h-5 w-px bg-white/[0.08]" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTemplateOpen(true)}
          className="gap-2 text-slate-400 hover:bg-white/[0.06] hover:text-white"
        >
          <LayoutTemplate className="h-4 w-4" />
          <span className="hidden sm:inline">Switch Template</span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        <div className="h-5 w-px bg-white/[0.08]" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            className="h-8 w-8 p-0 text-slate-500 hover:text-white disabled:opacity-40"
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            className="h-8 w-8 p-0 text-slate-500 hover:text-white disabled:opacity-40"
            aria-label="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs text-slate-500">
          {isSaving ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" />
              <span>Saving…</span>
            </>
          ) : isDirty ? (
            <>
              <CloudOff className="h-3.5 w-3.5 text-amber-500" />
              <span>Unsaved</span>
            </>
          ) : (
            <>
              <Cloud className="h-3.5 w-3.5 text-emerald-500" />
              <span>Saved{lastSavedAt ? ` ${formatTimeAgo(lastSavedAt)}` : ""}</span>
            </>
          )}
        </div>

        <div className="flex-1" />

        <Button
          size="sm"
          onClick={handleExportClick}
          className="gap-2 bg-brand-600 px-5 font-semibold hover:bg-brand-500"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </header>

      {/* Main: split screen — 35% left, 45–50% center, right sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: sections (~35%) */}
        <div className="flex w-[35%] min-w-[280px] max-w-[420px] shrink-0 flex-col overflow-y-auto border-r border-white/[0.06] bg-[#0a0a0b] p-5 scrollbar-thin">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="mx-auto w-full space-y-5">
                {sortSectionsForEditor(sections).map((section) => (
                  <SortableSectionCard
                    key={section.id}
                    section={section}
                    resumeId={resume.id}
                    isPro={userPlan === "pro"}
                    onTailor={() => setTailorOpen(true)}
                    onLimitReached={() => {
                      setUpgradeModalReason("ai_limit");
                      setUpgradeModalOpen(true);
                    }}
                    onImproveProLocked={() => {
                      setUpgradeModalReason("improve_pro");
                      setUpgradeModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Center: live preview (~45–50%) — clean HTML/DOM, no PDF toolbar, scrollable */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#0a0a0b]">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-8">
            <div className="mx-auto flex min-h-0 flex-1 max-w-[210mm] flex-col overflow-hidden rounded-xl border border-white/[0.06] bg-[#111113] shadow-2xl shadow-black/40">
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-6 scrollbar-thin">
                <div className="w-full rounded-lg border border-white/[0.04] bg-white shadow-xl">
                  <LivePreview
                    template={resume.template}
                    sections={sections}
                    color={resume.color}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar: ATS, Job matcher, Cover letter, Color picker */}
        {sidebarOpen && (
          <div className="flex w-72 shrink-0 flex-col border-l border-white/[0.06] bg-[#0a0a0b]">
            <div className="mb-4 flex shrink-0 items-center justify-between p-4 pb-0">
              <span className="text-sm font-medium text-slate-400">Tools</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="rounded p-1 text-slate-500 hover:bg-white/[0.06] hover:text-white"
                aria-label="Close sidebar"
              >
                <PanelRightClose className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[calc(100vh-200px)] flex-1 space-y-4 overflow-y-auto p-4 scrollbar-thin">
              {/* Color picker */}
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <h4 className="mb-2 text-sm font-medium text-white">Accent Color</h4>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={resume.color}
                    onChange={(e) => updateColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded-lg border-0 bg-transparent p-0"
                  />
                  <span className="text-xs text-slate-500">{resume.color}</span>
                </div>
              </div>
              <ATSScorePanel sections={sections} />
              <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
                <h4 className="mb-2 text-sm font-medium text-white">Job Matcher</h4>
                <p className="mb-3 text-xs text-slate-500">
                  Tailor your resume to a job description for better match rate.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTailorOpen(true)}
                  className="w-full gap-2 border-white/[0.12] text-slate-300"
                >
                  <FileSearch className="h-4 w-4" />
                  Tailor to Job
                </Button>
              </div>
              <button
                onClick={() => setActiveModal("score")}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
              >
                <Target className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Score Resume</p>
                  <p className="text-xs text-slate-500">Get AI feedback</p>
                </div>
              </button>
              <button
                onClick={() => {
                  if (userPlan === "pro") {
                    setActiveModal("coverLetter");
                  } else if (hasOneTimeExport) {
                    toast.error("Cover letter generator is a Pro feature");
                  } else {
                    setUpgradeModalReason("cover_letter");
                    setUpgradeModalOpen(true);
                  }
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
              >
                <FileSignature className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Cover Letter</p>
                  <p className="text-xs text-slate-500">Generate a cover letter</p>
                </div>
              </button>
              <button
                onClick={() => setActiveModal("keywords")}
                className="flex w-full items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4 text-left transition-colors hover:border-white/[0.12] hover:bg-white/[0.05]"
              >
                <FileSearch className="h-5 w-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Keyword Match</p>
                  <p className="text-xs text-slate-500">Match job description</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="fixed right-4 top-24 z-20 flex items-center gap-2 rounded-lg border border-white/[0.08] bg-[#0a0a0b] px-3 py-2 text-sm text-slate-400 shadow-lg hover:bg-white/[0.06] hover:text-white"
          >
            <PanelRightOpen className="h-4 w-4" />
            Tools
          </button>
        )}
      </div>

      <Modal isOpen={templateOpen} onClose={() => setTemplateOpen(false)} title="Switch Template" size="xl">
        <div className="max-h-[70vh] overflow-y-auto -mx-2 px-2">
          <TemplateGallery
            selected={resume.template as TemplateName}
            onSelect={(t) => {
              updateTemplate(t);
              setTemplateOpen(false);
            }}
            columns={3}
            selectionMode="direct"
            isPro={userPlan === "pro"}
          />
        </div>
      </Modal>

      <ResumeCompletionModal
        isOpen={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        validation={validation}
        onGoToStep={() => setCompletionModalOpen(false)}
        getStepForMissing={() => null}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        isPro={userPlan === "pro"}
        hasOneTimeExport={hasOneTimeExport}
        exportsUsed={exportsUsed}
        maxExports={5}
        onExport={handleExport}
        onAfterExport={refreshSubscription}
        resumeTitle={resume.title}
        templateName={TEMPLATE_LABEL_MAP[resume.template] ?? resume.template}
      />

      <BulletGeneratorModal isOpen={activeModal === "bullets"} onClose={() => setActiveModal(null)} />
      <ScoreModal isOpen={activeModal === "score"} onClose={() => setActiveModal(null)} />
      <CoverLetterModal isOpen={activeModal === "coverLetter"} onClose={() => setActiveModal(null)} />
      <KeywordMatchModal isOpen={activeModal === "keywords"} onClose={() => setActiveModal(null)} />
      <TailorResumeModal
        isOpen={tailorOpen}
        onClose={() => setTailorOpen(false)}
        sections={sections}
        isPro={userPlan === "pro"}
      />

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        reason={upgradeModalReason}
      />
    </div>
  );
}

/* === COMBINED FIX: CLEAN PREVIEW + WORKING TEMPLATE SWITCHING ===
 * 1. Replaced PDFPreview (iframe + PDF blob) with LivePreview — pure HTML/DOM
 *    rendering via the selected template component. No toolbar, zoom, or PDF controls.
 * 2. LivePreview receives template, sections, color from Zustand store and
 *    re-renders instantly when user selects a different template.
 * 3. updateTemplate() in store updates resume.template + resume.color (from
 *    template accent). TemplateGallery/Modal/Templates page all call this.
 * 4. Export remains via top Export button only; no export UI in preview.
 *
 * === ALL PRICING BANNERS UPDATED + TEMPLATE LOCKS + LIMIT POPUPS + CONSISTENT LOGIC ===
 * - 2026 plans: Free ($0, 5 exports/mo, 10 templates, 3 AI), Pro ($7.99/$59/$99), One-Time $19.99
 * - Template locking: Free users get 10 basic templates; premium locked with upgrade popup
 * - AI limit (3/resume): UpgradeModal when hit
 * - Export limit (5/mo): UpgradeModal when hit
 * - usePlan, UpgradeModal, useMembershipLimit centralize logic
 *
 * === REQUESTED CHANGES COMPLETE: EDITOR ORDER + AI LOGIC + IMPROVE WITH AI PRO + PRICING FIXES (50+ TEMPLATES + CLEAN ONE-TIME) ===
 *
 * === EDITOR FIXES: DASHBOARD BUTTON STYLE + PREVIEW SCROLL + COVER LETTER MEMBERSHIP LOGIC ===
 */
