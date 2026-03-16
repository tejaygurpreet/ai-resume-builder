"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  FileText,
  Loader2,
  Sparkles,
  LayoutTemplate,
  Copy,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

interface Section {
  id: string;
  type: string;
  order: number;
  content: unknown;
}

interface Resume {
  id: string;
  title: string;
  template: string;
  color: string;
  createdAt: string;
  updatedAt: string;
  sections: Section[];
}

interface UserSubscription {
  plan: string;
  status: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [status, router]);

  const fetchResumes = useCallback(async () => {
    try {
      const res = await fetch("/api/resumes");
      if (!res.ok) throw new Error("Failed to fetch resumes");
      const data = await res.json();
      setResumes(data.resumes);
      setSubscription(data.subscription);
    } catch {
      setResumes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      fetchResumes();
    }
  }, [status, fetchResumes]);

  async function handleCreate() {
    setCreating(true);
    try {
      const res = await fetch("/api/resumes", { method: "POST" });
      if (!res.ok) throw new Error("Failed to create resume");
      const data = await res.json();
      router.push(`/builder?id=${data.resume.id}`);
    } catch {
      setCreating(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/resumes/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete resume");
      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // Silently handle - user can retry
    } finally {
      setDeleting(false);
    }
  }

  async function handleDownload(resume: Resume) {
    try {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text(resume.title, 20, 25);

      doc.setFontSize(10);
      doc.setTextColor(120);
      doc.text(`Template: ${resume.template}`, 20, 35);
      doc.text(`Last updated: ${formatDate(resume.updatedAt)}`, 20, 42);

      let yOffset = 55;

      resume.sections
        .sort((a, b) => a.order - b.order)
        .forEach((section) => {
          if (yOffset > 270) {
            doc.addPage();
            yOffset = 20;
          }

          doc.setFontSize(14);
          doc.setFont("helvetica", "bold");
          doc.setTextColor(37, 99, 235);
          doc.text(
            section.type.charAt(0).toUpperCase() + section.type.slice(1),
            20,
            yOffset
          );
          yOffset += 8;

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(60);
          const content =
            typeof section.content === "string"
              ? section.content
              : JSON.stringify(section.content, null, 2);
          const lines = doc.splitTextToSize(content, 170);
          doc.text(lines, 20, yOffset);
          yOffset += lines.length * 5 + 10;
        });

      doc.save(`${resume.title.replace(/\s+/g, "_")}.pdf`);
    } catch {
      // PDF generation failed silently
    }
  }

  const templateLabels: Record<string, string> = {
    modern: "Modern",
    classic: "Classic",
    minimal: "Minimal",
    professional: "Professional",
    creative: "Creative",
  };

  if (status === "loading" || loading) {
    return (
      <>
        <Navbar />
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-surface">
          <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
        </main>
      </>
    );
  }

  if (status === "unauthenticated") return null;

  const [duplicating, setDuplicating] = useState<string | null>(null);

  async function handleDuplicate(resumeId: string) {
    setDuplicating(resumeId);
    try {
      const res = await fetch("/api/resumes/duplicate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId }),
      });
      if (!res.ok) throw new Error("Failed to duplicate");
      await fetchResumes();
    } catch {
      // Silently handle
    } finally {
      setDuplicating(null);
    }
  }

  const isPro = subscription?.plan === "pro";

  return (
    <>
      <Navbar />
      <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl bg-surface px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
                My Resumes
              </h1>
              <Badge variant={isPro ? "success" : "default"}>
                {isPro ? "Pro — $7/mo" : "Free Plan"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              {session?.user?.name
                ? `Welcome back, ${session.user.name}`
                : "Manage and create your resumes"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              <LayoutTemplate className="h-4 w-4" />
              Browse Templates
            </Link>
            <Button onClick={handleCreate} loading={creating}>
              <Plus className="h-4 w-4" />
              Create New Resume
            </Button>
          </div>
        </div>

        {/* Resume Grid or Empty State */}
        {resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200/60 bg-white px-6 py-20">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50">
              <FileText className="h-10 w-10 text-brand-500" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-slate-900">
              No resumes yet
            </h2>
            <p className="mt-2 max-w-sm text-center text-sm text-slate-500">
              Create your first AI-powered resume and land your dream job
              faster.
            </p>
            <Button onClick={handleCreate} loading={creating} className="mt-6">
              <Sparkles className="h-4 w-4" />
              Create Your First Resume
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Card
                key={resume.id}
                className="group relative transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover"
              >
                {/* Color accent bar */}
                <div
                  className="h-1.5 rounded-t-xl"
                  style={{ backgroundColor: resume.color }}
                />
                <CardContent className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <h3 className="truncate text-base font-semibold text-slate-900">
                      {resume.title}
                    </h3>
                    <Badge className="shrink-0 text-[11px]">
                      {templateLabels[resume.template] ?? resume.template}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-400">
                    Updated {formatDate(resume.updatedAt)}
                  </p>

                  <div className="mt-4 flex items-center gap-2">
                    <Link
                      href={`/builder?id=${resume.id}`}
                      className="flex-1"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicate(resume.id)}
                      disabled={duplicating === resume.id}
                      aria-label={`Duplicate ${resume.title}`}
                    >
                      {duplicating === resume.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(resume)}
                      aria-label={`Download ${resume.title}`}
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteTarget(resume)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Delete ${resume.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Delete Resume"
      >
        <p className="text-sm text-slate-600">
          Are you sure you want to delete{" "}
          <span className="font-medium text-slate-900">
            {deleteTarget?.title}
          </span>
          ? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            loading={deleting}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
