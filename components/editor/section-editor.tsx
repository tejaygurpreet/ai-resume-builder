"use client";

import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Trash2, Sparkles, Loader2, AlertCircle, Crown, Wand2, Copy, BarChart2, Minus, Lock, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { v4 as uuid } from "uuid";
import { useResumeStore } from "@/hooks/use-resume-store";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface SectionEditorProps {
  sectionId: string;
  type: string;
  content: any;
  resumeId?: string;
  isPro?: boolean;
  /** false for Export-only — AI actions show upgrade */
  canUseAI?: boolean;
  onLimitReached?: () => void;
  onImproveProLocked?: () => void;
  onExportAiLocked?: () => void;
}

export function SectionEditor({
  sectionId,
  type,
  content,
  resumeId,
  isPro,
  canUseAI = true,
  onLimitReached,
  onImproveProLocked,
  onExportAiLocked,
}: SectionEditorProps) {
  const updateSection = useResumeStore((s) => s.updateSection);

  const update = useCallback(
    (newContent: any) => updateSection(sectionId, newContent),
    [sectionId, updateSection]
  );

  switch (type) {
    case "personal":
      return <PersonalEditor content={content} onChange={update} />;
    case "summary":
      return (
        <SummaryEditor
          content={content}
          onChange={update}
          resumeId={resumeId}
          isPro={isPro}
          canUseAI={canUseAI}
          onLimitReached={onLimitReached}
          onImproveProLocked={onImproveProLocked}
          onExportAiLocked={onExportAiLocked}
        />
      );
    case "experience":
      return (
        <ExperienceEditor
          content={content}
          onChange={update}
          resumeId={resumeId}
          isPro={isPro}
          canUseAI={canUseAI}
          onLimitReached={onLimitReached}
          onImproveProLocked={onImproveProLocked}
          onExportAiLocked={onExportAiLocked}
        />
      );
    case "education":
      return <EducationEditor content={content} onChange={update} />;
    case "skills":
      return (
        <SkillsEditor
          content={content}
          onChange={update}
          resumeId={resumeId}
          isPro={isPro}
          canUseAI={canUseAI}
          onLimitReached={onLimitReached}
          onImproveProLocked={onImproveProLocked}
          onExportAiLocked={onExportAiLocked}
        />
      );
    case "projects":
      return <ProjectsEditor content={content} onChange={update} />;
    case "certifications":
      return <CertificationsEditor content={content} onChange={update} />;
    case "languages":
      return <LanguagesEditor content={content} onChange={update} />;
    case "awards":
      return <CertificationsEditor content={content} onChange={update} awardMode />;
    case "volunteer":
      return <VolunteerEditor content={content} onChange={update} />;
    case "interests":
      return <InterestsEditor content={content} onChange={update} />;
    default:
      return (
        <p className="text-sm text-slate-500">
          No editor available for section type &ldquo;{type}&rdquo;.
        </p>
      );
  }
}

/* ─── AI Generate Hook ────────────────────────────────────────── */

function useAIGenerate(canUseAI: boolean, onExportAiLocked?: () => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = useCallback(
    async (
      type: "summary" | "experience" | "skills",
      data: Record<string, string>,
      resumeId?: string
    ): Promise<{ result?: string; limitReached?: boolean }> => {
      if (!canUseAI) {
        onExportAiLocked?.();
        return {};
      }
      if (!resumeId) {
        setError("Resume must be saved first");
        return {};
      }
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type, data, resumeId }),
        });

        const json = await res.json();

        if (!res.ok) {
          if (json.limitReached) {
            setError("Free limit reached — upgrade to Pro for unlimited AI.");
            return { limitReached: true };
          }
          setError(json.error || "AI generation failed. Please try again.");
          return {};
        }

        if (json.remaining !== null && json.remaining !== undefined) {
          toast.success(`Generated! ${json.remaining} free AI uses left.`);
        } else {
          toast.success("Generated!");
        }

        return { result: json.result };
      } catch {
        setError("AI generation failed. Please try again.");
        return {};
      } finally {
        setLoading(false);
      }
    },
    [canUseAI, onExportAiLocked]
  );

  return { generate, loading, error, clearError: () => setError("") };
}

function AIErrorBanner({ error, onDismiss }: { error: string; onDismiss: () => void }) {
  if (!error) return null;
  const isLimit = error.toLowerCase().includes("limit") || error.toLowerCase().includes("upgrade");

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2 text-xs",
        isLimit
          ? "border-amber-500/30 bg-amber-500/10 text-amber-300"
          : "border-red-500/30 bg-red-500/10 text-red-300"
      )}
    >
      {isLimit ? (
        <Crown className="h-3.5 w-3.5 flex-shrink-0" />
      ) : (
        <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      )}
      <span className="flex-1">{error}</span>
      <button onClick={onDismiss} className="ml-1 rounded p-0.5 text-slate-400 transition-colors hover:bg-white/5 hover:text-white">
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

function AIButton({
  onClick,
  loading,
  children,
  disabled,
}: {
  onClick: () => void;
  loading: boolean;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={loading || disabled}
      className="editor-ai-btn group gap-1.5 border-violet-500/45 bg-gradient-to-br from-violet-500/15 to-purple-600/10 text-violet-200 shadow-sm shadow-violet-900/20 hover:border-violet-400/60 hover:from-violet-500/25 hover:to-purple-600/15 hover:text-white disabled:opacity-45"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Sparkles className="h-3.5 w-3.5 text-violet-400 group-hover:text-violet-200" />
      )}
      {loading ? "Generating…" : children}
    </Button>
  );
}

/* ─── Personal ─────────────────────────────────────────────────── */

function getPersonalDisplayName(content: any) {
  const fn = (content?.firstName ?? "").trim();
  const ln = (content?.lastName ?? "").trim();
  if (fn || ln) return { firstName: fn, lastName: ln };
  const full = (content?.fullName ?? "").trim();
  const parts = full.split(/\s+/);
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" ") ?? "",
  };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function capitalizeWord(s: string) {
  const t = s.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

function PersonalEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const { theme } = useTheme();
  const inputVariant = theme === "light" ? "light" : "dark";
  const { firstName, lastName } = getPersonalDisplayName(content);
  const email = (content.email ?? "").trim();
  const emailValid = email.length > 0 && EMAIL_RE.test(email);

  const set = (field: string, value: string) => {
    const next = { ...content, [field]: value };
    if (field === "firstName" || field === "lastName") {
      const fn = field === "firstName" ? value : (content.firstName ?? firstName);
      const ln = field === "lastName" ? value : (content.lastName ?? lastName);
      next.fullName = `${fn} ${ln}`.trim();
    }
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name *"
          value={firstName}
          onChange={(e) => set("firstName", e.target.value)}
          onBlur={() => {
            const v = (content.firstName ?? firstName ?? "").trim();
            if (v) set("firstName", capitalizeWord(v));
          }}
          placeholder="John"
          variant={inputVariant}
        />
        <Input
          label="Last Name *"
          value={lastName}
          onChange={(e) => set("lastName", e.target.value)}
          onBlur={() => {
            const v = (content.lastName ?? lastName ?? "").trim();
            if (v) set("lastName", capitalizeWord(v));
          }}
          placeholder="Doe"
          variant={inputVariant}
        />
      </div>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <Input
            label="Email *"
            type="email"
            value={content.email ?? ""}
            onChange={(e) => set("email", e.target.value)}
            placeholder="john@example.com"
            variant={inputVariant}
            error={email.length > 0 && !emailValid ? "Enter a valid email address" : undefined}
          />
        </div>
        {emailValid && (
          <CheckCircle2
            className="mt-9 h-5 w-5 shrink-0 text-emerald-500"
            aria-label="Valid email"
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Phone"
          type="tel"
          value={content.phone ?? ""}
          onChange={(e) => set("phone", e.target.value)}
          placeholder="(555) 123-4567"
          variant={inputVariant}
        />
        <Input
          label="Location"
          value={content.location ?? ""}
          onChange={(e) => set("location", e.target.value)}
          placeholder="New York, NY"
          variant={inputVariant}
        />
      </div>
      <p className="text-xs text-slate-500">Optional links for recruiters</p>
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="LinkedIn"
          value={content.linkedin ?? ""}
          onChange={(e) => set("linkedin", e.target.value)}
          placeholder="linkedin.com/in/johndoe"
          variant={inputVariant}
        />
        <Input
          label="GitHub"
          value={content.github ?? ""}
          onChange={(e) => set("github", e.target.value)}
          placeholder="github.com/johndoe"
          variant={inputVariant}
        />
        <Input
          label="Portfolio"
          value={content.portfolio ?? ""}
          onChange={(e) => set("portfolio", e.target.value)}
          placeholder="portfolio.johndoe.dev"
          variant={inputVariant}
        />
        <Input
          label="Website"
          value={content.website ?? ""}
          onChange={(e) => set("website", e.target.value)}
          placeholder="johndoe.dev"
          variant={inputVariant}
        />
      </div>
    </div>
  );
}

/* ─── Summary ──────────────────────────────────────────────────── */

function SummaryEditor({
  content,
  onChange,
  resumeId,
  isPro,
  canUseAI = true,
  onLimitReached,
  onImproveProLocked,
  onExportAiLocked,
}: {
  content: any;
  onChange: (c: any) => void;
  resumeId?: string;
  isPro?: boolean;
  canUseAI?: boolean;
  onLimitReached?: () => void;
  onImproveProLocked?: () => void;
  onExportAiLocked?: () => void;
}) {
  const { theme } = useTheme();
  const taVariant = theme === "light" ? "light" : "dark";
  const { generate, loading, error, clearError } = useAIGenerate(canUseAI, onExportAiLocked);
  const resume = useResumeStore((s) => s.resume);
  const [transformLoading, setTransformLoading] = useState<"improve" | "shorten" | null>(null);

  const personal = resume.sections.find((s) => s.type === "personal")?.content;
  const skills = resume.sections.find((s) => s.type === "skills")?.content;
  const experience = resume.sections.find((s) => s.type === "experience")?.content;

  const handleGenerate = async () => {
    const yearsExp = experience?.items?.length
      ? `${experience.items.length} position(s)`
      : "Not specified";
    const workExpDetail = (experience?.items ?? [])
      .map((it: any) => `${it.title || "Role"} at ${it.company || "Company"}: ${(it.bullets ?? []).filter(Boolean).join("; ")}`)
      .join(" | ") || "Not provided";

    const { result, limitReached } = await generate("summary", {
      name: personal?.fullName || [personal?.firstName, personal?.lastName].filter(Boolean).join(" ") || "",
      target_role: experience?.items?.[0]?.title || "",
      years_experience: yearsExp,
      work_experience: workExpDetail,
      skills: (skills?.items ?? []).filter(Boolean).join(", "),
    }, resumeId);

    if (limitReached) {
      onLimitReached?.();
      return;
    }
    if (result) {
      onChange({ ...content, text: result });
    }
  };

  const handleTransform = async (action: "improve" | "shorten") => {
    if (!canUseAI) {
      onExportAiLocked?.();
      return;
    }
    const text = (content.text ?? "").trim();
    if (text.length < 20) {
      toast.error("Write at least 20 characters before improving or shortening.");
      return;
    }
    if (!resumeId) {
      toast.error("Save your resume first.");
      return;
    }
    setTransformLoading(action);
    try {
      const res = await fetch("/api/ai/summary-transform", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ summary: text, action, resumeId }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "EXPORT_NO_AI" || json.exportOnlyNoAI) {
          onExportAiLocked?.();
          return;
        }
        if (json.limitReached) {
          onLimitReached?.();
          return;
        }
        toast.error(json.error || "Failed to transform.");
        return;
      }
      if (json.result) {
        onChange({ ...content, text: json.result });
        if (json.remaining != null) toast.success(`Done! ${json.remaining} free AI uses left.`);
        else toast.success("Done!");
      }
    } catch {
      toast.error("AI failed. Please try again.");
    } finally {
      setTransformLoading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="editor-ai-toolbar flex flex-wrap items-center gap-2">
        <AIButton onClick={handleGenerate} loading={loading} disabled={!canUseAI}>
          Generate Summary
        </AIButton>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!canUseAI) {
              onExportAiLocked?.();
              return;
            }
            if (!isPro) {
              onImproveProLocked?.();
              return;
            }
            handleTransform("improve");
          }}
          disabled={transformLoading !== null || !(content.text ?? "").trim() || !canUseAI}
          className={cn(
            "gap-1.5 border-purple-500/40 text-purple-300 hover:border-purple-400/50",
            isPro ? "bg-purple-500/10 hover:bg-purple-500/20" : "bg-amber-500/10 hover:bg-amber-500/20"
          )}
        >
          {transformLoading === "improve" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : !isPro ? <Lock className="h-3.5 w-3.5" /> : <span className="text-purple-400">✦</span>}
          Improve with AI PRO
          {!isPro && <span className="ml-1 rounded bg-amber-500/30 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">Pro</span>}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (!canUseAI) {
              onExportAiLocked?.();
              return;
            }
            handleTransform("shorten");
          }}
          disabled={transformLoading !== null || !(content.text ?? "").trim() || !canUseAI}
          className="gap-1.5 border-purple-500/40 bg-purple-500/10 text-purple-300 hover:border-purple-400/50 hover:bg-purple-500/20"
        >
          {transformLoading === "shorten" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Minus className="h-3.5 w-3.5" />}
          Shorten
        </Button>
      </div>

      <AIErrorBanner error={error} onDismiss={clearError} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          Professional Summary <span className="text-amber-400">*</span>
        </label>
        <p className="mb-2 text-xs text-slate-500">3–4 lines highlighting your experience, skills, and value. At least 20 characters.</p>
        <Textarea
          value={content.text ?? ""}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          placeholder="Results-driven software engineer with 6+ years building scalable web applications. Passionate about clean code and mentoring teams."
          className="min-h-[140px]"
          variant={taVariant}
        />
      </div>
    </div>
  );
}

/* ─── Experience ───────────────────────────────────────────────── */

function ExperienceEditor({
  content,
  onChange,
  resumeId,
  isPro,
  canUseAI = true,
  onLimitReached,
  onImproveProLocked,
  onExportAiLocked,
}: {
  content: any;
  onChange: (c: any) => void;
  resumeId?: string;
  isPro?: boolean;
  canUseAI?: boolean;
  onLimitReached?: () => void;
  onImproveProLocked?: () => void;
  onExportAiLocked?: () => void;
}) {
  const { generate, loading, error, clearError } = useAIGenerate(canUseAI, onExportAiLocked);
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null);
  const items: any[] = content.items ?? [];

  const updateItem = (index: number, field: string, value: any) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `exp-${uuid().slice(0, 8)}`,
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          bullets: [""],
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  const updateBullet = (itemIdx: number, bulletIdx: number, value: string) => {
    const updated = items.map((item, i) => {
      if (i !== itemIdx) return item;
      const bullets = [...(item.bullets ?? [])];
      bullets[bulletIdx] = value;
      return { ...item, bullets };
    });
    onChange({ ...content, items: updated });
  };

  const addBullet = (itemIdx: number) => {
    const updated = items.map((item, i) => {
      if (i !== itemIdx) return item;
      return { ...item, bullets: [...(item.bullets ?? []), ""] };
    });
    onChange({ ...content, items: updated });
  };

  const removeBullet = (itemIdx: number, bulletIdx: number) => {
    const updated = items.map((item, i) => {
      if (i !== itemIdx) return item;
      return {
        ...item,
        bullets: (item.bullets ?? []).filter(
          (_: string, bi: number) => bi !== bulletIdx
        ),
      };
    });
    onChange({ ...content, items: updated });
  };

  const [improvingBullet, setImprovingBullet] = useState<string | null>(null);
  const [addingMetrics, setAddingMetrics] = useState<string | null>(null);

  const duplicateItem = (index: number) => {
    const item = items[index];
    if (!item) return;
    const newItem = { ...item, id: `exp-${uuid().slice(0, 8)}`,
      bullets: [...(item.bullets ?? [])],
    };
    const updated = [...items];
    updated.splice(index + 1, 0, newItem);
    onChange({ ...content, items: updated });
  };

  const handleAddMetrics = async (itemIdx: number, bulletIdx: number) => {
    if (!canUseAI) {
      onExportAiLocked?.();
      return;
    }
    const item = items[itemIdx];
    const bullet = item?.bullets?.[bulletIdx];
    if (!bullet || bullet.trim().length < 5) {
      toast.error("Write at least a few words before adding metrics.");
      return;
    }
    const key = `${itemIdx}-${bulletIdx}`;
    setAddingMetrics(key);
    try {
      const res = await fetch("/api/ai/add-metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet,
          jobTitle: item.title || "",
          resumeId,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.code === "EXPORT_NO_AI" || json.exportOnlyNoAI) {
          onExportAiLocked?.();
          return;
        }
        if (json.limitReached) {
          onLimitReached?.();
          return;
        }
        toast.error(json.error || "Failed to add metrics.");
        return;
      }
      if (json.result) {
        const cleaned = json.result.replace(/^[-•*"]\s*/, "").replace(/["']$/, "").trim();
        updateBullet(itemIdx, bulletIdx, cleaned);
        if (json.remaining != null) toast.success(`Done! ${json.remaining} free AI uses left.`);
        else toast.success("Metrics added!");
      }
    } catch {
      toast.error("AI failed. Please try again.");
    } finally {
      setAddingMetrics(null);
    }
  };

  const handleGenerateBullets = async (idx: number) => {
    const item = items[idx];
    if (!item) return;
    setGeneratingIdx(idx);
    try {
      const { result, limitReached } = await generate("experience", {
        job_title: item.title || "",
        company: item.company || "",
        start_date: item.startDate || "",
        end_date: item.endDate || "",
        current: String(!!item.current),
        responsibilities: (item.bullets ?? []).filter(Boolean).join("; ") || "General duties",
      }, resumeId);

      if (limitReached) {
        onLimitReached?.();
        return;
      }
      if (result) {
        const bullets = result
          .split("\n")
          .map((b: string) => b.replace(/^[-•*]\s*/, "").trim())
          .filter(Boolean);

        if (bullets.length > 0) {
          const updated = items.map((it, i) =>
            i === idx ? { ...it, bullets } : it
          );
          onChange({ ...content, items: updated });
        }
      }
    } finally {
      setGeneratingIdx(null);
    }
  };

  const handleImproveBullet = async (itemIdx: number, bulletIdx: number) => {
    if (!canUseAI) {
      onExportAiLocked?.();
      return;
    }
    if (!isPro) {
      onImproveProLocked?.();
      return;
    }
    const item = items[itemIdx];
    const bullet = item?.bullets?.[bulletIdx];
    if (!bullet || bullet.trim().length < 5) {
      toast.error("Write at least a few words before improving.");
      return;
    }

    const key = `${itemIdx}-${bulletIdx}`;
    setImprovingBullet(key);

    try {
      const res = await fetch("/api/ai/improve-bullet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bullet,
          jobTitle: item.title || "",
          resumeId,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.code === "EXPORT_NO_AI" || json.exportOnlyNoAI) {
          onExportAiLocked?.();
          return;
        }
        if (json.limitReached) {
          onLimitReached?.();
          return;
        }
        toast.error(json.error || "Failed to improve bullet.");
        return;
      }

      if (json.result) {
        const cleaned = json.result.replace(/^[-•*"]\s*/, "").replace(/["']$/, "").trim();
        updateBullet(itemIdx, bulletIdx, cleaned);
        if (json.remaining !== null && json.remaining !== undefined) {
          toast.success(`Improved! ${json.remaining} free AI uses left.`);
        } else {
          toast.success("Bullet improved!");
        }
      }
    } catch {
      toast.error("AI generation failed. Please try again.");
    } finally {
      setImprovingBullet(null);
    }
  };

  const { theme } = useTheme();
  const inputVariant = theme === "light" ? "light" : "dark";

  return (
    <div className="space-y-6">
      <AIErrorBanner error={error} onDismiss={clearError} />

      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Position {idx + 1}
            </span>
            <div className="flex items-center gap-2">
              <AIButton
                onClick={() => handleGenerateBullets(idx)}
                loading={loading && generatingIdx === idx}
                disabled={!canUseAI}
              >
                Generate Bullets
              </AIButton>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => duplicateItem(idx)}
                className="h-7 px-2 text-xs text-slate-400 hover:bg-white/[0.06] hover:text-white"
                title="Duplicate job"
              >
                <Copy className="mr-1 h-3 w-3" />
                Duplicate
              </Button>
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(idx)}
                  className="h-7 px-2 text-xs text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                >
                  <Trash2 className="mr-1 h-3 w-3" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Job Title *"
              value={item.title ?? ""}
              onChange={(e) => updateItem(idx, "title", e.target.value)}
              placeholder="Software Engineer"
              variant={inputVariant}
            />
            <Input
              label="Company *"
              value={item.company ?? ""}
              onChange={(e) => updateItem(idx, "company", e.target.value)}
              placeholder="Acme Inc."
              variant={inputVariant}
            />
            <Input
              label="Location"
              value={item.location ?? ""}
              onChange={(e) => updateItem(idx, "location", e.target.value)}
              placeholder="San Francisco, CA"
              variant={inputVariant}
            />
            <div className="col-span-2 grid grid-cols-2 gap-4">
              <Input
                label="Start Date"
                value={item.startDate ?? ""}
                onChange={(e) => updateItem(idx, "startDate", e.target.value)}
                placeholder="Jan 2022"
                variant={inputVariant}
              />
              <Input
                label="End Date"
                value={item.current ? "Present" : item.endDate ?? ""}
                onChange={(e) => updateItem(idx, "endDate", e.target.value)}
                placeholder="Dec 2023"
                disabled={item.current}
                variant={inputVariant}
              />
            </div>
          </div>

          {(item.title ?? "").trim() && (item.company ?? "").trim() && (
            <div className="rounded-xl border border-violet-500/25 bg-gradient-to-br from-violet-500/10 to-purple-600/5 px-4 py-3">
              <p className="text-xs font-semibold text-violet-200/90">Suggested bullet angles</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">
                {!isPro && canUseAI
                  ? "Try: quantified outcomes for this role, tech stack you used, leadership scope, and business impact. Use “Generate Bullets” to apply AI (free tier: 3 uses per resume)."
                  : !canUseAI
                    ? "Upgrade to Pro to generate tailored bullets. Export Access includes exports only."
                    : "Led cross-functional initiatives that improved [metric] by [%]. Owned [system] serving [scale] users. Partnered with stakeholders to deliver [outcome]."}
              </p>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={item.current ?? false}
              onChange={(e) => updateItem(idx, "current", e.target.checked)}
              className="h-4 w-4 rounded border-white/20 bg-white/5 text-brand-500 focus:ring-brand-500/50"
            />
            I currently work here
          </label>

          <div className="space-y-3">
            <span className="text-sm font-medium text-slate-300">
              Bullet Points <span className="text-amber-400">*</span>
            </span>
            <p className="text-xs text-slate-500">Use action verbs and metrics. Start with strong verbs like Led, Achieved, Increased.</p>
            {(item.bullets ?? []).map((bullet: string, bi: number) => {
              const bulletKey = `${idx}-${bi}`;
              const isImproving = improvingBullet === bulletKey;
              const isAddingMetrics = addingMetrics === bulletKey;
              return (
                <div key={bi} className="flex items-start gap-2">
                  <span className="mt-2.5 text-slate-400">&bull;</span>
                  <Textarea
                    value={bullet}
                    onChange={(e) => updateBullet(idx, bi, e.target.value)}
                    placeholder="Led migration of monolith to microservices, reducing deploy times by 70%"
                    className="min-h-[60px]"
                    variant="dark"
                  />
                  <div className="mt-1 flex flex-col gap-1">
                    <button
                      onClick={() => handleImproveBullet(idx, bi)}
                      disabled={isImproving || !bullet.trim()}
                      title={isPro ? "Improve with AI PRO" : "Improve with AI PRO — Upgrade to Pro"}
                      className={cn(
                        "flex h-7 shrink-0 items-center gap-0.5 rounded-lg border px-1.5 transition-colors",
                        isImproving
                          ? "border-purple-500/40 bg-purple-500/20"
                          : isPro
                            ? "border-white/[0.1] text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/10"
                            : "border-amber-500/40 text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10"
                      )}
                    >
                      {isImproving ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" />
                      ) : isPro ? (
                        <Wand2 className="h-3.5 w-3.5" />
                      ) : (
                        <>
                          <Lock className="h-3 w-3" />
                          <span className="text-[9px] font-semibold text-amber-300">Pro</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAddMetrics(idx, bi)}
                      disabled={isAddingMetrics || !bullet.trim()}
                      title="Add metrics with AI"
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-colors",
                        isAddingMetrics
                          ? "border-purple-500/40 bg-purple-500/20"
                          : "border-white/[0.1] text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/10"
                      )}
                    >
                      {isAddingMetrics ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-purple-500" />
                      ) : (
                        <BarChart2 className="h-3.5 w-3.5" />
                      )}
                    </button>
                    {(item.bullets ?? []).length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeBullet(idx, bi)}
                        className="h-7 w-7 shrink-0 p-0 text-slate-400 hover:text-red-500"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => addBullet(idx)}
              className="text-brand-400 hover:bg-brand-500/10 hover:text-brand-300"
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              Add Bullet
            </Button>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem} className="w-full border-white/[0.12] text-slate-300 hover:bg-white/[0.06] hover:text-white">
        <Plus className="mr-1.5 h-4 w-4" />
        Add Experience
      </Button>
    </div>
  );
}

/* ─── Education ────────────────────────────────────────────────── */

function EducationEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const items: any[] = content.items ?? [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `edu-${uuid().slice(0, 8)}`,
          degree: "",
          school: "",
          field: "",
          location: "",
          startDate: "",
          endDate: "",
          gpa: "",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Education {idx + 1}
            </span>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(idx)}
                className="h-6 px-2 text-xs text-slate-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Degree *"
              value={item.degree ?? ""}
              onChange={(e) => updateItem(idx, "degree", e.target.value)}
              placeholder="B.S. Computer Science"
              variant="dark"
            />
            <Input
              label="School *"
              value={item.school ?? ""}
              onChange={(e) => updateItem(idx, "school", e.target.value)}
              placeholder="MIT"
              variant="dark"
            />
            <Input
              label="Field / Program"
              value={item.field ?? ""}
              onChange={(e) => updateItem(idx, "field", e.target.value)}
              placeholder="Software Engineering"
              variant="dark"
            />
            <Input
              label="Location"
              value={item.location ?? ""}
              onChange={(e) => updateItem(idx, "location", e.target.value)}
              placeholder="Cambridge, MA"
              variant="dark"
            />
            <Input
              label="GPA"
              value={item.gpa ?? ""}
              onChange={(e) => updateItem(idx, "gpa", e.target.value)}
              placeholder="3.8/4.0"
              variant="dark"
            />
            <Input
              label="Start Date"
              value={item.startDate ?? ""}
              onChange={(e) => updateItem(idx, "startDate", e.target.value)}
              placeholder="Aug 2018"
              variant="dark"
            />
            <Input
              label="End Date"
              value={item.endDate ?? ""}
              onChange={(e) => updateItem(idx, "endDate", e.target.value)}
              placeholder="May 2022"
              variant="dark"
            />
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem} className="w-full border-white/[0.12] text-slate-300 hover:bg-white/[0.06] hover:text-white">
        <Plus className="mr-1.5 h-4 w-4" />
        Add Education
      </Button>
    </div>
  );
}

/* ─── Skills ───────────────────────────────────────────────────── */

const SKILL_SUGGESTIONS_BY_ROLE: Record<string, string[]> = {
  default: [
    "JavaScript", "TypeScript", "React", "Node.js", "Python", "SQL",
    "Project Management", "Agile", "Communication", "Problem Solving",
    "AWS", "Docker", "Git", "REST APIs", "GraphQL",
  ],
  engineering: [
    "TypeScript", "React", "Node.js", "Python", "PostgreSQL", "AWS",
    "Docker", "Kubernetes", "CI/CD", "System Design", "REST APIs",
    "GraphQL", "Unit Testing", "Code Review", "Agile",
  ],
  design: [
    "Figma", "Adobe XD", "User Research", "Wireframing", "Prototyping",
    "Design Systems", "Accessibility", "UI/UX", "Responsive Design",
  ],
  product: [
    "Product Strategy", "Roadmap Planning", "Stakeholder Management",
    "User Research", "Analytics", "A/B Testing", "Agile", "Jira",
  ],
};

function SkillsEditor({
  content,
  onChange,
  resumeId,
  isPro,
  canUseAI = true,
  onLimitReached,
  onImproveProLocked,
  onExportAiLocked,
}: {
  content: any;
  onChange: (c: any) => void;
  resumeId?: string;
  isPro?: boolean;
  canUseAI?: boolean;
  onLimitReached?: () => void;
  onImproveProLocked?: () => void;
  onExportAiLocked?: () => void;
}) {
  const { theme } = useTheme();
  const inputVariant = theme === "light" ? "light" : "dark";
  const { generate, loading, error, clearError } = useAIGenerate(canUseAI, onExportAiLocked);
  const resume = useResumeStore((s) => s.resume);

  const skills: string[] = (content.items ?? []).filter(
    (s: string) => s !== ""
  );
  const [inputValue, setInputValue] = React.useState("");

  const experience = resume.sections.find((s) => s.type === "experience")?.content;

  const isValidSkill = (s: string): boolean => {
    const t = s.trim();
    if (t.length < 2 || t.length > 40) return false;
    if (/^\d+$/.test(t) || /^[^a-zA-Z]+$/.test(t)) return false;
    const junk = ["skill", "example", "placeholder", "etc", "n/a", "tbd", "todo"];
    if (junk.some((j) => t.toLowerCase().includes(j))) return false;
    return true;
  };

  const addSkill = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || skills.includes(trimmed)) return;
    if (!isValidSkill(trimmed)) {
      toast.error("Please enter a valid skill (2–40 characters, no placeholders)");
      return;
    }
    onChange({ ...content, items: [...skills, trimmed] });
    setInputValue("");
  };

  const removeSkill = (index: number) => {
    onChange({
      ...content,
      items: skills.filter((_, i) => i !== index),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleGenerateSkills = async () => {
    const targetRole = experience?.items?.[0]?.title || "";

    const { result, limitReached } = await generate("skills", {
      target_role: targetRole,
      industry: "Technology",
    }, resumeId);

    if (limitReached) {
      onLimitReached?.();
      return;
    }
    if (result) {
      const newSkills = result
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean)
        .filter(isValidSkill);

      if (newSkills.length > 0) {
        const merged = Array.from(new Set([...skills, ...newSkills]));
        onChange({ ...content, items: merged });
      }
    }
  };

  const targetRole = (experience?.items?.[0]?.title ?? "").toLowerCase();
  const suggestionKey = targetRole.includes("engineer") || targetRole.includes("developer") ? "engineering"
    : targetRole.includes("design") ? "design"
    : targetRole.includes("product") ? "product"
    : "default";
  const suggestions = SKILL_SUGGESTIONS_BY_ROLE[suggestionKey] ?? SKILL_SUGGESTIONS_BY_ROLE.default;
  const availableSuggestions = suggestions.filter((s) => !skills.includes(s));

  const addSuggestion = (skill: string) => {
    if (skills.includes(skill)) return;
    onChange({ ...content, items: [...skills, skill] });
  };

  return (
    <div className="space-y-4">
      <div className="editor-ai-toolbar flex flex-wrap items-center gap-2">
        <AIButton onClick={handleGenerateSkills} loading={loading} disabled={!canUseAI}>
          {isPro ? "AI: expand skills" : "AI: suggest skills"}
        </AIButton>
        {isPro && (
          <span className="text-[10px] font-medium uppercase tracking-wide text-violet-400/80">Pro quality</span>
        )}
      </div>

      {(experience?.items?.[0]?.title ?? "").trim() && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5">
          <p className="text-[11px] text-slate-400">
            <span className="font-medium text-emerald-400/90">Tip for {experience?.items?.[0]?.title}: </span>
            Add tools (e.g. AWS, Figma), methodologies (Agile, A/B tests), and soft skills recruiters search for.
            {!isPro && canUseAI && " Free: 3 AI uses per resume — generating merges suggestions into your list."}
          </p>
        </div>
      )}

      <AIErrorBanner error={error} onDismiss={clearError} />

      <div>
        <label className="mb-1.5 block text-sm font-medium text-slate-300">
          Add skills <span className="text-amber-400">*</span>
        </label>
        <p className="mb-2 text-xs text-slate-500">At least 3 required. Type and press Enter, or click a suggestion.</p>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. React, Project Management"
            variant={inputVariant}
            className="flex-1"
          />
          <Button variant="outline" size="sm" onClick={addSkill} className="shrink-0 border-white/[0.12] text-slate-300 hover:bg-white/[0.06] hover:text-white">
            <Plus className="mr-1 h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>

      {availableSuggestions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {availableSuggestions.slice(0, 12).map((skill) => (
              <button
                key={skill}
                onClick={() => addSuggestion(skill)}
                className="rounded-lg border border-white/[0.1] bg-white/[0.04] px-3 py-1.5 text-xs text-slate-400 transition-colors hover:border-brand-500/30 hover:bg-brand-500/10 hover:text-brand-300"
              >
                + {skill}
              </button>
            ))}
          </div>
        </div>
      )}

      {skills.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">
            Your skills ({skills.length}/3 min)
          </p>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, idx) => (
              <Badge key={idx} className="gap-1 border-white/[0.12] bg-white/[0.08] pr-1.5 py-1.5 text-slate-300">
                {skill}
                <button
                  onClick={() => removeSkill(idx)}
                  className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-red-500/20 hover:text-red-400"
                  aria-label={`Remove ${skill}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Projects ─────────────────────────────────────────────────── */

function ProjectsEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const items: any[] = content.items ?? [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `proj-${uuid().slice(0, 8)}`,
          name: "",
          description: "",
          technologies: "",
          link: "",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              Project {idx + 1}
            </span>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(idx)}
                className="h-6 px-2 text-xs text-slate-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Project Name"
              value={item.name ?? ""}
              onChange={(e) => updateItem(idx, "name", e.target.value)}
              placeholder="My Awesome Project"
              variant="dark"
            />
            <Input
              label="Technologies"
              value={item.technologies ?? ""}
              onChange={(e) => updateItem(idx, "technologies", e.target.value)}
              placeholder="React, Node.js, PostgreSQL"
              variant="dark"
            />
            <div className="col-span-2">
              <Textarea
                label="Description"
                value={item.description ?? ""}
                onChange={(e) => updateItem(idx, "description", e.target.value)}
                placeholder="Brief description of the project and your role…"
                className="min-h-[70px]"
                variant="dark"
              />
            </div>
            <div className="col-span-2">
              <Input
                label="Link"
                value={item.link ?? ""}
                onChange={(e) => updateItem(idx, "link", e.target.value)}
                placeholder="https://github.com/johndoe/project"
                variant="dark"
              />
            </div>
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem} className="border-white/[0.12] text-slate-300 hover:bg-white/[0.06] hover:text-white">
        <Plus className="mr-1.5 h-4 w-4" />
        Add Project
      </Button>
    </div>
  );
}

/* ─── Certifications ───────────────────────────────────────────── */

function CertificationsEditor({
  content,
  onChange,
  awardMode,
}: {
  content: any;
  onChange: (c: any) => void;
  /** Reuse form for Awards section */
  awardMode?: boolean;
}) {
  const items: any[] = content.items ?? [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `${awardMode ? "award" : "cert"}-${uuid().slice(0, 8)}`,
          name: "",
          issuer: "",
          date: "",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div
          key={item.id}
          className="relative space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">
              {awardMode ? "Award" : "Certification"} {idx + 1}
            </span>
            {items.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(idx)}
                className="h-6 px-2 text-xs text-slate-500 hover:bg-red-500/10 hover:text-red-400"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Remove
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label={awardMode ? "Award / honor" : "Certification Name"}
              value={item.name ?? ""}
              onChange={(e) => updateItem(idx, "name", e.target.value)}
              placeholder={awardMode ? "Employee of the Year" : "AWS Solutions Architect"}
              variant="dark"
            />
            <Input
              label={awardMode ? "Organization" : "Issuer"}
              value={item.issuer ?? ""}
              onChange={(e) => updateItem(idx, "issuer", e.target.value)}
              placeholder={awardMode ? "Acme Corp" : "Amazon Web Services"}
              variant="dark"
            />
            <Input
              label="Date"
              value={item.date ?? ""}
              onChange={(e) => updateItem(idx, "date", e.target.value)}
              placeholder="Jun 2023"
              variant="dark"
            />
          </div>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem} className="border-white/[0.12] text-slate-300 hover:bg-white/[0.06] hover:text-white">
        <Plus className="mr-1.5 h-4 w-4" />
        {awardMode ? "Add Award" : "Add Certification"}
      </Button>
    </div>
  );
}

function VolunteerEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const items: any[] = content.items ?? [];
  const updateItem = (index: number, field: string, value: any) => {
    const updated = items.map((item, i) => (i === index ? { ...item, [field]: value } : item));
    onChange({ ...content, items: updated });
  };
  const updateBullet = (itemIdx: number, bi: number, value: string) => {
    const updated = items.map((item, i) => {
      if (i !== itemIdx) return item;
      const bullets = [...(item.bullets ?? [])];
      bullets[bi] = value;
      return { ...item, bullets };
    });
    onChange({ ...content, items: updated });
  };
  const addItem = () =>
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `vol-${uuid().slice(0, 8)}`,
          role: "",
          organization: "",
          startDate: "",
          endDate: "",
          current: false,
          bullets: [""],
        },
      ],
    });
  const removeItem = (i: number) =>
    onChange({ ...content, items: items.filter((_, j) => j !== i) });

  return (
    <div className="space-y-6">
      {items.map((item, idx) => (
        <div key={item.id} className="space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Volunteer role {idx + 1}</span>
            {items.length > 1 && (
              <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} className="h-6 text-xs text-red-400">
                Remove
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Role" value={item.role ?? ""} onChange={(e) => updateItem(idx, "role", e.target.value)} variant="dark" />
            <Input label="Organization" value={item.organization ?? ""} onChange={(e) => updateItem(idx, "organization", e.target.value)} variant="dark" />
            <Input label="Start" value={item.startDate ?? ""} onChange={(e) => updateItem(idx, "startDate", e.target.value)} variant="dark" />
            <Input label="End" value={item.current ? "Present" : item.endDate ?? ""} onChange={(e) => updateItem(idx, "endDate", e.target.value)} disabled={item.current} variant="dark" />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <input type="checkbox" checked={!!item.current} onChange={(e) => updateItem(idx, "current", e.target.checked)} className="h-4 w-4 rounded border-white/20" />
            Ongoing
          </label>
          {(item.bullets ?? [""]).map((b: string, bi: number) => (
            <Textarea key={bi} value={b} onChange={(e) => updateBullet(idx, bi, e.target.value)} placeholder="Impact or scope…" className="min-h-[52px]" variant="dark" />
          ))}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addItem} className="border-white/[0.12] text-slate-300">
        <Plus className="mr-1 h-4 w-4" /> Add volunteer experience
      </Button>
    </div>
  );
}

function InterestsEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const { theme } = useTheme();
  const v = theme === "light" ? "light" : "dark";
  const text = (content.items ?? []).filter(Boolean).join(", ");
  return (
    <div>
      <p className="mb-2 text-xs text-slate-500">Optional — comma-separated (e.g. Open source, Mentoring, Photography)</p>
      <Textarea
        value={text}
        onChange={(e) =>
          onChange({
            items: e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
          })
        }
        placeholder="Photography, tech talks, community volunteering…"
        className="min-h-[100px]"
        variant={v}
      />
    </div>
  );
}

/* ─── Languages ────────────────────────────────────────────────── */

const proficiencyLevels = [
  "Native",
  "Fluent",
  "Advanced",
  "Intermediate",
  "Basic",
] as const;

function LanguagesEditor({
  content,
  onChange,
}: {
  content: any;
  onChange: (c: any) => void;
}) {
  const items: any[] = content.items ?? [];

  const updateItem = (index: number, field: string, value: string) => {
    const updated = items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange({ ...content, items: updated });
  };

  const addItem = () => {
    onChange({
      ...content,
      items: [
        ...items,
        {
          id: `lang-${uuid().slice(0, 8)}`,
          language: "",
          proficiency: "Native",
        },
      ],
    });
  };

  const removeItem = (index: number) => {
    onChange({ ...content, items: items.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4">
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-end gap-3">
          <Input
            label={idx === 0 ? "Language" : undefined}
            value={item.language ?? ""}
            onChange={(e) => updateItem(idx, "language", e.target.value)}
            placeholder="Spanish"
            variant="dark"
          />
          <div className="w-full">
            {idx === 0 && (
              <label className="mb-1.5 block text-sm font-medium text-slate-300">
                Proficiency
              </label>
            )}
            <select
              value={item.proficiency ?? "Native"}
              onChange={(e) => updateItem(idx, "proficiency", e.target.value)}
              className="flex h-10 w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-3.5 py-2 text-sm text-white transition-colors focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {proficiencyLevels.map((level) => (
                <option key={level} value={level} className="bg-dark-100 text-white">
                  {level}
                </option>
              ))}
            </select>
          </div>
          {items.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeItem(idx)}
              className="mb-0.5 h-8 w-8 shrink-0 p-0 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={addItem} className="border-white/[0.12] text-slate-300 hover:bg-white/[0.06] hover:text-white">
        <Plus className="mr-1.5 h-4 w-4" />
        Add Language
      </Button>
    </div>
  );
}
