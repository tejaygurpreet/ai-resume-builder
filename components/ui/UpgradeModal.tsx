"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Crown, Zap, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export type UpgradeReason =
  | "ai_limit"
  | "export_limit"
  | "template_lock"
  | "pro_feature"
  | "improve_pro"
  | "cover_letter";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason: UpgradeReason;
  /** Optional: for template lock, show which template */
  templateName?: string;
}

const REASON_CONFIG: Record<
  UpgradeReason,
  { title: string; message: string; icon: React.ElementType }
> = {
  ai_limit: {
    title: "AI Limit Reached",
    message:
      "You've used all 3 free AI generations. Upgrade to Pro for unlimited AI tailoring & rewriting – only $7.99/month",
    icon: Sparkles,
  },
  export_limit: {
    title: "Export Limit Reached",
    message:
      "You've reached your 5 free exports this month. Upgrade to Pro for unlimited exports + premium features",
    icon: Zap,
  },
  template_lock: {
    title: "Premium Template",
    message:
      "Unlock all 50+ premium templates with Pro – only $7.99/month",
    icon: Crown,
  },
  pro_feature: {
    title: "Pro Feature",
    message:
      "Upgrade to Pro for unlimited AI generations, all templates, job tailoring, cover letters, ATS score – only $7.99/month",
    icon: Crown,
  },
  improve_pro: {
    title: "Improve with AI PRO",
    message:
      "Upgrade to Pro to unlock Improve with AI PRO, unlimited generations, and better quality AI.",
    icon: Sparkles,
  },
  cover_letter: {
    title: "Cover Letter Generator",
    message:
      "Upgrade to Pro to generate cover letters. Pro includes unlimited AI generations, cover letter generator, job tailoring, and more.",
    icon: Crown,
  },
};

export function UpgradeModal({
  isOpen,
  onClose,
  reason,
  templateName,
}: UpgradeModalProps) {
  const { status } = useSession();
  const [loading, setLoading] = useState(false);
  const config = REASON_CONFIG[reason];
  const Icon = config.icon;

  const message = templateName && reason === "template_lock"
    ? `Unlock "${templateName}" and all 50+ premium templates with Pro – only $7.99/month`
    : config.message;

  const handleUpgrade = async () => {
    if (status !== "authenticated") {
      window.location.href = "/signup";
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro", interval: "monthly" }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        window.location.href = "/pricing";
      }
    } catch {
      window.location.href = "/pricing";
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={config.title} size="md">
      <div className="space-y-6">
        <div className="flex items-start gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-purple-600/20 to-violet-600/20">
            <Icon className="h-6 w-6 text-purple-400" />
          </div>
          <p className="text-sm leading-relaxed text-slate-400">{message}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            onClick={handleUpgrade}
            loading={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 font-semibold hover:from-purple-500 hover:to-violet-500"
          >
            <Crown className="mr-2 h-4 w-4" />
            Upgrade to Pro — $7.99/month
          </Button>
          <Link href="/pricing" onClick={onClose}>
            <Button
              variant="outline"
              className="w-full border-white/[0.12] text-slate-300 hover:bg-white/[0.06]"
            >
              View all plans ($59/year or $99 lifetime)
            </Button>
          </Link>
        </div>
      </div>
    </Modal>
  );
}
