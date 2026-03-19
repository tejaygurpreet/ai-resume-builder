"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus, Pencil, Trash2, Download, FileText, Loader2, Sparkles, LayoutTemplate, Copy, Crown,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";
import { templateRegistry } from "@/components/resume/templates";
import { PLANS } from "@/lib/stripe";
import { validateResumeCompletion } from "@/lib/resume-validation";
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

const TEMPLATE_LABELS: Record<string, string> = {};
templateRegistry.forEach((t) => { TEMPLATE_LABELS[t.id] = t.name; });

interface Section { id: string; type: string; order: number; content: unknown; }
interface Resume { id: string; title: string; template: string; color: string; createdAt: string; updatedAt: string; sections: Section[]; }
interface UserSubscription {
  plan: string;
  planInterval?: string | null;
  status: string;
  stripeSubscriptionId?: string | null;
  exportsUsed?: number;
  oneTimeExport?: boolean;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [duplicating, setDuplicating] = useState<string | null>(null);
  const [exportResume, setExportResume] = useState<Resume | null>(null);
  const [completionModalResume, setCompletionModalResume] = useState<Resume | null>(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  useEffect(() => { if (status === "unauthenticated") router.replace("/login"); }, [status, router]);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      const data = await res.json();
      setResumes(data.resumes);
      setSubscription(data.subscription);
    } catch { setResumes([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { if (status === "authenticated") fetchResumes(); }, [status, fetchResumes]);

  // Refetch when returning from checkout (webhook may have just processed)
  useEffect(() => {
    if (status !== "authenticated") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true" || params.get("exportUnlocked") === "true" || params.get("success") === "true") {
      fetchResumes();
      window.history.replaceState({}, "", "/dashboard");
    }
  }, [status, fetchResumes]);

  function handleCreate() {
    router.push("/templates");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/resumes/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete resume");
      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {} finally { setDeleting(false); }
  }

  const isPro = subscription?.plan === "pro";
  const hasOneTimeExport = !!subscription?.oneTimeExport;
  const isLifetimePro = isPro && !subscription?.stripeSubscriptionId;
  const planInterval = subscription?.planInterval ?? "monthly";
  const proBadgeLabel =
    !isPro
      ? "Free — 5 exports/mo"
      : isLifetimePro
        ? "Pro — Lifetime"
        : planInterval === "annual" || planInterval === "yearly"
          ? "Pro — $69.99/yr"
          : "Pro — $7.99/mo";
  const exportsUsed = subscription?.exportsUsed ?? 0;
  const maxExports = PLANS.free.maxExportsPerMonth;
  const canExport = isPro || hasOneTimeExport || exportsUsed < maxExports;

  function handleExport(resume: Resume) {
    const sections = resume.sections ?? [];
    const validation = validateResumeCompletion(sections);
    const isComplete = validation.isComplete || validation.percentage >= 70;

    if (!isComplete) {
      setCompletionModalResume(resume);
      return;
    }
    if (!canExport) {
      setUpgradeModalOpen(true);
      return;
    }
    setExportResume(resume);
  }

  const handleDashboardExport = useCallback(
    async (format: ExportFormat, filename: string) => {
      if (!exportResume) return;
      const sections = exportResume.sections ?? [];
      const name = filename || exportResume.title;
      switch (format) {
        case "pdf":
          await exportToPdf(sections, name, exportResume.color);
          break;
        case "txt":
          exportToTxt(sections, name);
          break;
        case "json":
          exportToJson(sections, name, exportResume.template, exportResume.color);
          break;
        case "docx":
          await exportToDocx(sections, name);
          break;
        case "md":
          exportToMarkdown(sections, name);
          break;
      }
      if (!isPro && !hasOneTimeExport) {
        const incRes = await fetch("/api/resumes/increment-export", { method: "POST" });
        if (incRes.ok) await fetchResumes();
      }
    },
    [exportResume, isPro, hasOneTimeExport, fetchResumes]
  );


  if (status === "loading" || loading) {
    return (
      <>
        <Navbar />
        <main className="dashboard-page flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[#010409] transition-colors duration-200">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </main>
      </>
    );
  }

  if (status === "unauthenticated") return null;

  async function handleDuplicate(resumeId: string) {
    setDuplicating(resumeId);
    try {
      const res = await fetch("/api/resumes/duplicate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resumeId }) });
      if (!res.ok) throw new Error("Failed to duplicate");
      await fetchResumes();
    } catch {} finally { setDuplicating(null); }
  }

  const completionValidation = completionModalResume
    ? validateResumeCompletion(completionModalResume.sections ?? [])
    : { isComplete: false, percentage: 0, missingItems: [] as string[], suggestions: [] as string[] };

  return (
    <>
      <Navbar />
      <main className="dashboard-page mx-auto min-h-[calc(100vh-4rem)] max-w-7xl bg-[#010409] px-4 py-10 sm:px-6 lg:px-8 transition-colors duration-200">
        {!isPro && !hasOneTimeExport && (
          <div className="dashboard-banner mb-6 flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 transition-colors duration-200">
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-400">
                Free plan: {exportsUsed}/{maxExports} exports used this month
              </span>
              <Link href="/pricing">
                <Badge className="dashboard-badge-upgrade cursor-pointer bg-purple-500/20 text-purple-300 hover:bg-purple-500/30">
                  <Crown className="mr-1 h-3 w-3" /> Upgrade to Pro
                </Badge>
              </Link>
            </div>
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="dashboard-btn dashboard-btn-outline border-white/[0.12] text-slate-300">
                Upgrade
              </Button>
            </Link>
          </div>
        )}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white sm:text-3xl">My Resumes</h1>
              <Badge variant={isPro ? "success" : "default"} className={isPro ? "dashboard-badge-plan dashboard-badge-plan-pro" : "dashboard-badge-plan"}>
                {proBadgeLabel}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {session?.user?.name ? `Welcome back, ${session.user.name}` : "Manage and create your resumes"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/templates">
              <Button variant="outline" size="md" className="dashboard-btn dashboard-btn-outline gap-2">
                <LayoutTemplate className="h-4 w-4" /> Browse Templates
              </Button>
            </Link>
            <Button onClick={handleCreate} className="dashboard-btn dashboard-btn-primary">
              <Plus className="h-4 w-4" /> Create New Resume
            </Button>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="dashboard-empty flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/[0.08] bg-white/[0.02] px-6 py-20 transition-colors duration-200">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-500/10">
              <FileText className="h-10 w-10 text-brand-400" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-white">No resumes yet</h2>
            <p className="mt-2 max-w-sm text-center text-sm text-slate-500">Create your first AI-powered resume and land your dream job faster.</p>
            <Button onClick={handleCreate} className="dashboard-btn dashboard-btn-primary mt-6">
              <Sparkles className="h-4 w-4" /> Create Your First Resume
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card key={resume.id} className="dashboard-resume-card group relative overflow-hidden border-white/[0.06] bg-white/[0.03] transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:-translate-y-2 hover:shadow-glass-lg">
                <div className="h-1.5 rounded-t-xl" style={{ backgroundColor: resume.color }} />
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="truncate text-base font-semibold text-white">{resume.title}</h3>
                    <Badge className="dashboard-badge-template shrink-0 text-[11px]">{TEMPLATE_LABELS[resume.template] ?? resume.template}</Badge>
                  </div>
                  <p className="text-xs text-slate-500">Updated {formatDate(resume.updatedAt)}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Link href={`/builder?id=${resume.id}`} className="flex-1">
                      <Button variant="secondary" size="sm" className="dashboard-btn dashboard-btn-secondary w-full"><Pencil className="h-3.5 w-3.5" /> Edit</Button>
                    </Link>
                    <Button variant="secondary" size="sm" className="dashboard-btn dashboard-btn-secondary" onClick={() => handleDuplicate(resume.id)} disabled={duplicating === resume.id} aria-label={`Duplicate ${resume.title}`}>
                      {duplicating === resume.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="secondary" size="sm" className="dashboard-btn dashboard-btn-secondary" onClick={() => handleExport(resume)} aria-label={`Export ${resume.title}`}>
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="dashboard-btn dashboard-btn-ghost dashboard-btn-delete" onClick={() => setDeleteTarget(resume)} aria-label={`Delete ${resume.title}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} title="Delete Resume">
        <p className="text-sm text-slate-400">
          Are you sure you want to delete <span className="font-medium text-white">{deleteTarget?.title}</span>? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>Cancel</Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>Delete</Button>
        </div>
      </Modal>

      <ResumeCompletionModal
        isOpen={!!completionModalResume}
        onClose={() => setCompletionModalResume(null)}
        validation={completionValidation}
        onGoToStep={() => {
          if (completionModalResume) router.push(`/builder?id=${completionModalResume.id}`);
          setCompletionModalResume(null);
        }}
        getStepForMissing={() => null}
      />

      <ExportModal
        isOpen={!!exportResume}
        onClose={() => setExportResume(null)}
        isPro={isPro}
        hasOneTimeExport={hasOneTimeExport}
        exportsUsed={exportsUsed}
        maxExports={maxExports}
        onExport={handleDashboardExport}
        onAfterExport={fetchResumes}
        resumeTitle={exportResume?.title ?? "Resume"}
        templateName={TEMPLATE_LABELS[exportResume?.template ?? ""] ?? exportResume?.template ?? "modern"}
      />

      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
        reason="export_limit"
      />
    </>
  );
}

/* === DASHBOARD EXPORT LOGIC FIXED + COUNTER + CREATE NEW RESUME FLOW === */
/* === DASHBOARD LIGHT MODE FIXED: HOVER VISIBILITY + BUTTONS + PILLS + PROFILE === */
