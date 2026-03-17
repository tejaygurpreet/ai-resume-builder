"use client";

import React, { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Download,
  Sparkles,
  Palette,
  LayoutTemplate,
  Loader2,
  CloudOff,
  Cloud,
  List,
  FileText,
  Target,
  FileSignature,
  Search,
  FileSearch,
  User,
  Briefcase,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ResumePreview from "@/components/resume/resume-preview";
import { templates, templateRegistry, type TemplateName } from "@/components/resume/templates";
import { TemplateGallery } from "@/components/resume/template-gallery";
import { Modal } from "@/components/ui/modal";
import { useResumeStore, type ResumeSection } from "@/hooks/use-resume-store";
import { useAutosave } from "@/hooks/use-autosave";
import { SectionEditor } from "@/components/editor/section-editor";
import {
  BulletGeneratorModal,
  ScoreModal,
  CoverLetterModal,
  KeywordMatchModal,
} from "@/components/editor/ai-tools-modal";
import { ATSScorePanel } from "@/components/editor/ats-score-panel";
import { ResumeAnalyticsPanel } from "@/components/editor/resume-analytics-panel";
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
import { validateResumeCompletion } from "@/lib/resume-validation";
import { BUILDER_STEPS, type BuilderStepId } from "@/lib/builder-steps";
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

const STEP_ICONS: Record<string, React.ElementType> = {
  user: User,
  "file-text": FileText,
  briefcase: Briefcase,
  "graduation-cap": GraduationCap,
  sparkles: Sparkles,
  "check-circle": CheckCircle2,
};

export default function BuilderPageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-dark">
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
    setResume,
    updateTitle,
    updateTemplate,
    updateColor,
    removeSection,
  } = useResumeStore();

  useAutosave();

  const sections = resume?.sections ?? [];

  const previewRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [aiToolsOpen, setAiToolsOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [tailorOpen, setTailorOpen] = useState(false);
  const [userPlan, setUserPlan] = useState<"free" | "pro">("free");
  const [exportsUsed, setExportsUsed] = useState(0);
  const [hasOneTimeExport, setHasOneTimeExport] = useState(false);

  const validation = validateResumeCompletion(sections);

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
        fetch("/api/resumes")
          .then((r) => r.json())
          .then((d) => {
            if (d.subscription?.plan === "pro") setUserPlan("pro");
            if (d.subscription?.exportsUsed) setExportsUsed(d.subscription.exportsUsed);
            if (d.subscription?.oneTimeExport) setHasOneTimeExport(true);
          })
          .catch(() => {});

        if (resumeId) {
          const res = await fetch(`/api/resumes/${resumeId}`);
          if (!res.ok) throw new Error("Failed to load resume");
          const data = await res.json();
          const loaded = data.resume ?? data;
          const sections = (loaded.sections ?? []).map((s: any) => {
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
          setResume({ ...loaded, sections });
          if (templateParam && templateParam in templates) {
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
  }, [resumeId, templateParam, exportParam, status, setResume, router]);

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
        case "md":
          exportToMarkdown(sections, name);
          break;
      }
    },
    [resume.title, resume.template, resume.color, sections]
  );

  const getSection = (type: string) => sections.find((s) => s.type === type);

  const handleNext = () => {
    if (currentStep < BUILDER_STEPS.length - 1) setCurrentStep((s) => s + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep((s) => s - 1);
  };

  const handleExportClick = () => {
    if (validation.isComplete) {
      setExportOpen(true);
    } else {
      setCompletionModalOpen(true);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-dark">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          <p className="text-sm text-slate-500">Loading builder…</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  const step = BUILDER_STEPS[currentStep];
  const isReviewStep = step.id === "review";

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-dark">
      {/* Top bar */}
      <header className="z-30 flex shrink-0 items-center gap-2 border-b border-white/[0.06] bg-dark/95 backdrop-blur-xl px-4 py-2.5">
        <Link
          href="/dashboard"
          className="mr-1 rounded-xl p-2 text-slate-500 transition-all duration-200 hover:bg-white/[0.05] hover:text-white"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <input
          type="text"
          value={resume.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="min-w-0 max-w-[180px] rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold text-white transition-all duration-200 hover:border-white/[0.1] focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          aria-label="Resume title"
        />

        <div className="mx-1 h-5 w-px bg-white/[0.08]" />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setTemplateGalleryOpen(true)}
          className="gap-1.5 text-slate-400"
        >
          <LayoutTemplate className="h-4 w-4" />
          <span className="hidden sm:inline">{TEMPLATE_LABEL_MAP[resume.template] ?? "Template"}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>

        <div className="relative" data-dropdown>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setColorOpen((o) => !o)}
            className="gap-1.5 text-slate-400"
          >
            <Palette className="h-4 w-4" />
            <span className="h-4 w-4 rounded-full border border-white/[0.15]" style={{ backgroundColor: resume.color }} />
            <ChevronDown className="h-3 w-3" />
          </Button>
          {colorOpen && (
            <div className="absolute left-0 top-full z-40 mt-1.5 w-56 rounded-xl border border-white/[0.08] bg-dark-100 p-3 shadow-glass-lg">
              <p className="mb-2 text-xs font-medium text-slate-500">Accent Color</p>
              <div className="mb-3 grid grid-cols-8 gap-1.5">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => updateColor(color)}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 transition-all duration-200 hover:scale-110",
                      resume.color === color ? "border-white ring-2 ring-white/20" : "border-transparent"
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`Color ${color}`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-500">Custom:</label>
                <input type="color" value={resume.color} onChange={(e) => updateColor(e.target.value)} className="h-7 w-10 cursor-pointer rounded-lg border border-white/[0.1] bg-transparent" />
              </div>
            </div>
          )}
        </div>

        <div className="mx-1 h-5 w-px bg-white/[0.08]" />

        <div
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium",
            validation.isComplete ? "bg-emerald-500/15 text-emerald-400" : "bg-amber-500/15 text-amber-400"
          )}
        >
          {validation.percentage}% Complete
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          {isSaving ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" /><span className="text-brand-400">Saving…</span></>
          ) : isDirty ? (
            <><CloudOff className="h-3.5 w-3.5 text-amber-500" /><span className="text-amber-400">Unsaved</span></>
          ) : (
            <><Cloud className="h-3.5 w-3.5 text-emerald-500" /><span className="text-emerald-400">Saved</span></>
          )}
        </div>

        <div className="flex-1" />

        <div className="relative" data-dropdown>
          <Button variant="ghost" size="sm" onClick={() => setAiToolsOpen((o) => !o)} className="gap-1.5 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">AI Tools</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
          {aiToolsOpen && (
            <div className="absolute right-0 top-full z-40 mt-1.5 w-56 rounded-xl border border-white/[0.08] bg-dark-100 py-1 shadow-glass-lg">
              <button onClick={() => { setActiveModal("bullets"); setAiToolsOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white">
                <List className="h-4 w-4 text-violet-500" /> Generate Bullets
              </button>
              <button onClick={() => { setActiveModal("score"); setAiToolsOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white">
                <Target className="h-4 w-4 text-violet-500" /> Score Resume
              </button>
              <button onClick={() => { setActiveModal("coverLetter"); setAiToolsOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white">
                <FileSignature className="h-4 w-4 text-violet-500" /> Generate Cover Letter
              </button>
              <button onClick={() => { setActiveModal("keywords"); setAiToolsOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white">
                <Search className="h-4 w-4 text-violet-500" /> Keyword Match
              </button>
              <div className="mx-2 my-1 border-t border-white/[0.06]" />
              <button onClick={() => { setTailorOpen(true); setAiToolsOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white">
                <FileSearch className="h-4 w-4 text-violet-500" /> Tailor for Job
                {userPlan !== "pro" && <span className="ml-auto rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">PRO</span>}
              </button>
            </div>
          )}
        </div>

        <Button size="sm" onClick={handleExportClick} className="gap-1.5">
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export</span>
        </Button>
      </header>

      {/* Step progress */}
      <div className="shrink-0 border-b border-white/[0.06] bg-dark-50/50 px-4 py-2">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {BUILDER_STEPS.map((s, i) => {
            const Icon = STEP_ICONS[s.icon] ?? FileText;
            const isActive = i === currentStep;
            const isPast = i < currentStep;
            return (
              <button
                key={s.id}
                onClick={() => setCurrentStep(i)}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  isActive && "bg-brand-500/20 text-brand-300 ring-1 ring-brand-500/30",
                  isPast && !isActive && "text-slate-400 hover:bg-white/[0.05] hover:text-white",
                  !isActive && !isPast && "text-slate-500 hover:bg-white/[0.05] hover:text-slate-400"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Guided editing panel */}
        <div className="flex w-[50%] flex-col overflow-y-auto border-r border-white/[0.06] bg-dark scrollbar-thin">
          <div className="flex-1 p-6">
            {isReviewStep ? (
              <ReviewStep
                sections={sections}
                validation={validation}
                onExportClick={handleExportClick}
                onGoToStep={(stepIndex) => setCurrentStep(stepIndex)}
              />
            ) : (
              <div className="mx-auto max-w-xl">
                <h2 className="mb-2 text-lg font-semibold text-white">{step.label}</h2>
                <p className="mb-6 text-sm text-slate-400">
                  {step.id === "personal" && "Enter your contact information. First name, last name, and email are required."}
                  {step.id === "summary" && "Write a brief professional summary. Use AI to generate or improve it."}
                  {step.id === "experience" && "Add your work history. Include job title, company, dates, and achievement bullets."}
                  {step.id === "education" && "Add your education. School, degree, and dates are required."}
                  {step.id === "skills" && "Add at least 3 professional skills. Use AI to suggest relevant skills."}
                </p>
                {getSection(step.id) && (
                  <SectionEditor
                    sectionId={getSection(step.id)!.id}
                    type={step.id}
                    content={getSection(step.id)!.content}
                    resumeId={resume.id}
                    isPro={userPlan === "pro"}
                  />
                )}
              </div>
            )}
          </div>

          {/* Step navigation */}
          {!isReviewStep && (
            <div className="flex shrink-0 items-center justify-between border-t border-white/[0.06] px-6 py-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                disabled={currentStep === 0}
                className="gap-1.5 border-white/[0.12] text-slate-400 hover:bg-white/[0.06] disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                size="sm"
                onClick={handleNext}
                disabled={currentStep >= BUILDER_STEPS.length - 1}
                className="gap-1.5"
              >
                {currentStep === BUILDER_STEPS.length - 2 ? "Review" : "Next"}
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Right: Live preview */}
        <div className="flex w-[50%] flex-col overflow-y-auto bg-dark p-6 scrollbar-thin">
          <div className="mx-auto w-full max-w-[600px] space-y-5">
            <div className="rounded-2xl border border-white/[0.08] bg-dark-50/50 p-6 shadow-glass">
              <div className="rounded-xl border border-white/[0.06] bg-[#fafaf9] p-4 shadow-inner" style={{ boxShadow: "inset 0 1px 2px rgba(0,0,0,0.04)" }}>
                <ResumePreview
                  ref={previewRef}
                  template={resume.template as TemplateName}
                  sections={sections}
                  color={resume.color}
                  scale={0.55}
                />
              </div>
            </div>
            <ResumeAnalyticsPanel sections={sections} />
            <ATSScorePanel sections={sections} />
          </div>
        </div>
      </div>

      <Modal isOpen={templateGalleryOpen} onClose={() => setTemplateGalleryOpen(false)} title="Choose a Template" size="xl">
        <div className="max-h-[70vh] overflow-y-auto -mx-2 px-2">
          <TemplateGallery
            selected={resume.template as TemplateName}
            onSelect={(t) => { updateTemplate(t); setTemplateGalleryOpen(false); }}
            columns={3}
            selectionMode="direct"
          />
        </div>
      </Modal>

      <ResumeCompletionModal
        isOpen={completionModalOpen}
        onClose={() => setCompletionModalOpen(false)}
        validation={validation}
        onGoToStep={(idx) => { setCurrentStep(idx); setCompletionModalOpen(false); }}
        getStepForMissing={getStepForMissing}
      />

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        isPro={userPlan === "pro"}
        hasOneTimeExport={hasOneTimeExport}
        exportsUsed={exportsUsed}
        maxExports={3}
        onExport={handleExport}
        resumeTitle={resume.title}
        templateName={TEMPLATE_LABEL_MAP[resume.template] ?? resume.template}
      />

      <BulletGeneratorModal isOpen={activeModal === "bullets"} onClose={() => setActiveModal(null)} />
      <ScoreModal isOpen={activeModal === "score"} onClose={() => setActiveModal(null)} />
      <CoverLetterModal isOpen={activeModal === "coverLetter"} onClose={() => setActiveModal(null)} />
      <KeywordMatchModal isOpen={activeModal === "keywords"} onClose={() => setActiveModal(null)} />
      <TailorResumeModal isOpen={tailorOpen} onClose={() => setTailorOpen(false)} sections={sections} isPro={userPlan === "pro"} />
    </div>
  );
}

function getStepForMissing(item: string): number | null {
  if (item.includes("name") || item.includes("Email")) return 0;
  if (item.includes("summary")) return 1;
  if (item.includes("experience")) return 2;
  if (item.includes("education")) return 3;
  if (item.includes("skill")) return 4;
  return null;
}

function ReviewStep({
  sections,
  validation,
  onExportClick,
  onGoToStep,
}: {
  sections: ResumeSection[];
  validation: ReturnType<typeof validateResumeCompletion>;
  onExportClick: () => void;
  onGoToStep: (stepIndex: number) => void;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-8">
      <h2 className="text-xl font-semibold text-white">Review & Export</h2>

      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-400">Resume Score</span>
          <div className="flex items-center gap-2">
            <div className="h-2 w-28 overflow-hidden rounded-full bg-white/10">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  validation.percentage >= 100 ? "bg-emerald-500" : "bg-amber-500"
                )}
                style={{ width: `${validation.percentage}%` }}
              />
            </div>
            <span className="text-sm font-bold text-white">{validation.percentage}%</span>
          </div>
        </div>

        {validation.isComplete ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
            <div>
              <p className="font-medium text-emerald-300">Your resume is ready to export</p>
              <p className="text-sm text-slate-400">Download as PDF, DOCX, or other formats.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-medium text-amber-400">Complete these to export:</p>
            <ul className="space-y-2">
              {validation.missingItems.map((item) => {
                const stepIdx = getStepForMissing(item);
                return (
                  <li key={item} className="flex items-center justify-between gap-2 text-sm text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                      {item}
                    </span>
                    {stepIdx !== null && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onGoToStep(stepIdx)}
                        className="h-7 shrink-0 text-xs text-brand-400 hover:bg-brand-500/10 hover:text-brand-300"
                      >
                        Go to step
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      <Button size="lg" onClick={onExportClick} className="w-full gap-2" disabled={!validation.isComplete}>
        <Download className="h-5 w-5" />
        {validation.isComplete ? "Export Resume" : "Complete Required Fields to Export"}
      </Button>
    </div>
  );
}
