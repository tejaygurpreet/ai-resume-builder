"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { PLANS } from "@/lib/stripe";

export interface PlanState {
  plan: "free" | "pro";
  /** True when user has Export Access without Pro */
  isExportOnly: boolean;
  isPro: boolean;
  hasOneTimeExport: boolean;
  exportsUsed: number;
  maxExportsPerMonth: number;
  aiGenerationsPerResume: number;
  canUsePremiumTemplates: boolean;
  loading: boolean;
  refetch: () => Promise<void>;
}

export function usePlan(resumeId?: string): PlanState & { aiGenerationsUsed?: number } {
  const { data: session, status } = useSession();
  const [subscription, setSubscription] = useState<{
    plan: string;
    exportsUsed?: number;
    oneTimeExport?: boolean;
  } | null>(null);
  const [aiGenerationsUsed, setAiGenerationsUsed] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchPlan = useCallback(async () => {
    if (status !== "authenticated") {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/resumes");
      if (!res.ok) return;
      const data = await res.json();
      setSubscription(data.subscription ?? null);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const fetchAiCount = useCallback(async () => {
    if (!resumeId || status !== "authenticated") return;
    try {
      const res = await fetch(`/api/resumes/${resumeId}`);
      if (!res.ok) return;
      const data = await res.json();
      const resume = data.resume ?? data;
      setAiGenerationsUsed(resume.aiGenerations ?? 0);
    } catch {}
  }, [resumeId, status]);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  useEffect(() => {
    fetchAiCount();
  }, [fetchAiCount]);

  const isPro = subscription?.plan === "pro";
  const hasOneTimeExport = !!subscription?.oneTimeExport;
  const isExportOnly = hasOneTimeExport && !isPro;
  const exportsUsed = subscription?.exportsUsed ?? 0;
  const maxExportsPerMonth = isPro ? Infinity : PLANS.free.maxExportsPerMonth;
  const aiGenerationsPerResume = isPro ? Infinity : PLANS.free.aiGenerationsPerResume;
  const canUsePremiumTemplates = isPro;

  return {
    plan: isPro ? "pro" : "free",
    isExportOnly,
    isPro,
    hasOneTimeExport,
    exportsUsed,
    maxExportsPerMonth,
    aiGenerationsPerResume,
    canUsePremiumTemplates,
    loading,
    refetch: fetchPlan,
    aiGenerationsUsed,
  };
}
