"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Check, X, ChevronDown, Sparkles, Zap, Star, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

type ActivePlan =
  | "free"
  | "pro_monthly"
  | "pro_annual"
  | "pro_lifetime"
  | "one_time_export";

const freeFeatures = [
  "5 exports/month",
  "10 basic templates",
  "3 AI generations per resume",
  "No ads",
  "PDF, DOCX, TXT, JSON, Markdown export",
];

const proFeatures = [
  "Unlimited AI generations",
  "All 50+ premium templates",
  "Job tailoring",
  "Cover letter generator",
  "ATS score analysis",
  "Unlimited clean exports",
  "Priority support",
];

const oneTimeFeatures = [
  "Unlimited exports forever",
  "No ads",
  "All formats (PDF, DOCX, TXT, JSON, MD)",
];

type ProInterval = "monthly" | "annual" | "lifetime";

const proOptions: { id: ProInterval; label: string; price: string; badge?: string }[] = [
  { id: "monthly", label: "Monthly", price: "$7.99/month" },
  { id: "annual", label: "Annual", price: "$69.99/year", badge: "Best value" },
  { id: "lifetime", label: "Lifetime", price: "$129.99 one-time" },
];

const comparisonCompetitors = [
  { name: "Us", price: "$7.99/mo", highlight: true },
  { name: "Teal", price: "$29/mo", highlight: false },
  { name: "Rezi", price: "$29/mo", highlight: false },
  { name: "Kickresume", price: "$19–24/mo", highlight: false },
];

const faqItems = [
  { question: "How does billing work?", answer: "Free: $0/month – 5 exports/month, 10 basic templates, 3 AI generations per resume, no ads. Pro: $7.99/month or $69.99/year (best value) or $129.99 lifetime – unlimited AI, all 50+ premium templates, unlimited exports. One-Time Export: $19.99 one-time – unlimited exports forever, no ads, all formats (no Pro AI features)." },
  { question: "Can I cancel my Pro subscription anytime?", answer: "Yes, you can cancel your Pro subscription at any time with no questions asked. You'll continue to have access to Pro features until the end of your current billing period." },
  { question: "What is the one-time export option?", answer: "Pay $19.99 once to unlock unlimited exports permanently. This gives you all export formats (PDF, DOCX, TXT, JSON, Markdown) without a subscription. Pro AI features (tailoring, cover letters, ATS score) are not included." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor, Stripe." },
  { question: "Is there a free trial for Pro?", answer: "You can try our Free plan with no time limit — it includes 5 exports/month, 10 basic templates, and 3 AI generations per resume. Upgrade to Pro for $7.99/month for unlimited access. Cancel anytime." },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return (
    <details
      className={cn(
        "group border-b last:border-b-0",
        isLight ? "border-slate-200" : "border-white/[0.04]"
      )}
    >
      <summary
        className={cn(
          "flex cursor-pointer items-center justify-between py-5 text-left text-base font-medium transition-colors [&::-webkit-details-marker]:hidden",
          isLight
            ? "text-slate-900 hover:text-brand-700"
            : "text-white hover:text-brand-300"
        )}
      >
        {question}
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 transition-transform duration-300 group-open:rotate-180",
            isLight
              ? "text-slate-500 group-open:text-brand-600"
              : "text-slate-600 group-open:text-brand-400"
          )}
        />
      </summary>
      <div
        className={cn(
          "pb-5 pr-12 text-sm leading-relaxed",
          isLight ? "text-slate-600" : "text-slate-400"
        )}
      >
        {answer}
      </div>
    </details>
  );
}

function deriveActivePlan(sub: {
  plan?: string;
  planInterval?: string | null;
  stripeSubscriptionId?: string | null;
  oneTimeExport?: boolean;
  currentPeriodEnd?: string | Date | null;
  status?: string;
} | null): ActivePlan {
  if (!sub) return "free";
  if (sub.oneTimeExport && sub.plan !== "pro") return "one_time_export";
  if (sub.plan !== "pro") return "free";
  const isLifetime = !sub.stripeSubscriptionId;
  if (isLifetime) return "pro_lifetime";
  const isActive =
    sub.status === "active" &&
    (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > new Date());
  if (!isActive) return "free";
  if (sub.planInterval === "annual" || sub.planInterval === "yearly") return "pro_annual";
  if (sub.planInterval === "monthly") return "pro_monthly";
  return "pro_monthly";
}

export default function PricingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [proInterval, setProInterval] = useState<ProInterval>("monthly");
  const [subscription, setSubscription] = useState<{
    plan?: string;
    planInterval?: string | null;
    stripeSubscriptionId?: string | null;
    oneTimeExport?: boolean;
    currentPeriodEnd?: string | Date | null;
    status?: string;
  } | null>(null);
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const activePlan = deriveActivePlan(subscription);
  const { theme } = useTheme();
  const isLight = theme === "light";

  const [exportWarningOpen, setExportWarningOpen] = useState(false);
  const [currentPlanModalOpen, setCurrentPlanModalOpen] = useState(false);
  const [cancelConfirmModalOpen, setCancelConfirmModalOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (status !== "authenticated") return;
    try {
      const res = await fetch("/api/resumes");
      if (!res.ok) return;
      const data = await res.json();
      setSubscription(data.subscription ?? null);
    } catch {
      setSubscription(null);
    }
  }, [status]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  useEffect(() => {
    if (activePlan === "pro_lifetime") setProInterval("lifetime");
    else if (activePlan === "pro_annual" && proInterval === "monthly") setProInterval("annual");
  }, [activePlan, proInterval]);

  const isCurrentPlan = (plan: "pro" | "one-time") =>
    (plan === "pro" && ((activePlan === "pro_monthly" && proInterval === "monthly") || (activePlan === "pro_annual" && proInterval === "annual") || activePlan === "pro_lifetime")) ||
    (plan === "one-time" && activePlan === "one_time_export");

  const handleCheckout = async (plan: "pro" | "one-time") => {
    if (!isAuthenticated) {
      router.push("/signup");
      return;
    }
    if (activePlan === "pro_lifetime") return;

    if (plan === "one-time" && (activePlan === "pro_monthly" || activePlan === "pro_annual")) {
      setExportWarningOpen(true);
      return;
    }

    if (isCurrentPlan(plan)) {
      setCurrentPlanModalOpen(true);
      return;
    }

    setIsLoading(plan);

    try {
      if (plan === "pro" && proInterval === "annual" && activePlan === "pro_monthly") {
        const res = await fetch("/api/stripe/change-plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ interval: "annual" }),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          alert(data.message || "Your plan will switch to Annual at renewal.");
          fetchSubscription();
        } else {
          throw new Error(data.error || "Failed");
        }
        setIsLoading(null);
        return;
      }

      if (plan === "pro" && proInterval === "annual" && activePlan === "pro_annual") {
        setIsLoading(null);
        return;
      }

      const endpoint = plan === "pro" ? "/api/stripe/checkout" : "/api/stripe/one-time-export";
      const bodyPayload =
        plan === "pro" ? { plan: "pro", interval: proInterval } : {};
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (err) {
      console.error(err);
      setIsLoading(null);
      alert(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const proceedWithExportCheckout = async () => {
    setExportWarningOpen(false);
    if (!isAuthenticated) return;
    setIsLoading("one-time");
    try {
      const res = await fetch("/api/stripe/one-time-export", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (err) {
      console.error(err);
      setIsLoading(null);
      alert(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  const handleCancelMembership = async () => {
    setCurrentPlanModalOpen(false);
    setCancelConfirmModalOpen(true);
  };

  const confirmCancelMembership = async () => {
    setCanceling(true);
    try {
      const res = await fetch("/api/stripe/cancel-subscription", { method: "POST" });
      const data = await res.json();
      if (res.ok && data.success) {
        setCancelConfirmModalOpen(false);
        alert(data.message || "Your subscription will cancel at the end of your billing period.");
        fetchSubscription();
      } else {
        throw new Error(data.error || "Failed");
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to cancel.");
    } finally {
      setCanceling(false);
    }
  };

  const canCancelMembership =
    (activePlan === "pro_monthly" || activePlan === "pro_annual") &&
    subscription?.stripeSubscriptionId;

  const isCurrentProInterval = (opt: ProInterval) =>
    (activePlan === "pro_monthly" && opt === "monthly") ||
    (activePlan === "pro_annual" && opt === "annual") ||
    (activePlan === "pro_lifetime" && opt === "lifetime");
  const canUpgradeToPro = activePlan !== "pro_lifetime";
  const canUpgradeToInterval = (opt: ProInterval) => {
    if (activePlan === "pro_lifetime") return false;
    if (activePlan === "pro_monthly" && opt === "monthly") return false;
    if (activePlan === "pro_annual" && opt === "annual") return false;
    if (activePlan === "pro_annual" && opt === "monthly") return false; // no downgrade
    return true;
  };
  const canUpgradeOneTime = activePlan !== "one_time_export";

  return (
    <div className={cn("min-h-screen", isLight ? "bg-slate-50" : "bg-[#010409]")}>
      <Navbar />

      <main className="relative overflow-hidden">
        {!isLight && (
          <>
            <div className="orb orb-cyan absolute right-1/4 top-0 h-[500px] w-[500px] animate-pulse-glow" />
            <div className="orb orb-violet absolute left-0 top-1/2 h-[400px] w-[400px] animate-pulse-glow [animation-delay:2s]" />
          </>
        )}

        <section className="relative px-4 pt-20 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                isLight
                  ? "border-violet-200 bg-violet-50 text-violet-800"
                  : "border-brand-500/20 bg-brand-500/10 text-brand-300"
              )}
            >
              <Sparkles className="h-3.5 w-3.5" /> Simple pricing
            </span>
            <h1
              className={cn(
                "mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl",
                isLight ? "text-[#111827]" : "text-white"
              )}
            >
              Choose Your Plan
            </h1>
            <p className={cn("mt-4 text-lg", isLight ? "text-[#374151]" : "text-slate-400")}>
              Start free and upgrade when you need more power
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-stretch justify-center gap-8 lg:flex-row lg:items-start">
            {/* Free */}
            <div
              className={cn(
                "flex w-full max-w-md flex-col rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 lg:max-w-[340px]",
                isLight
                  ? "border-slate-200 bg-white shadow-sm hover:border-slate-300 hover:shadow-md"
                  : "border-white/[0.06] bg-white/[0.03] hover:border-white/[0.12] hover:bg-white/[0.05]"
              )}
            >
              <h3 className={cn("text-xl font-semibold", isLight ? "text-[#111827]" : "text-white")}>
                Free
              </h3>
              <p className={cn("mt-1 text-sm", isLight ? "text-[#6b7280]" : "text-slate-500")}>
                Perfect for getting started
              </p>
              <p className="mt-6">
                <span className={cn("text-4xl font-extrabold", isLight ? "text-[#111827]" : "text-white")}>
                  $0
                </span>
                <span className={cn("ml-1", isLight ? "text-[#6b7280]" : "text-slate-500")}>/month</span>
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {freeFeatures.map((f) => (
                  <li
                    key={f}
                    className={cn(
                      "flex items-center gap-3 text-sm",
                      isLight ? "text-[#374151]" : "text-slate-400"
                    )}
                  >
                    <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={isAuthenticated ? "/dashboard" : "/signup"} className="mt-8 block">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full transition-all duration-200",
                    isLight
                      ? "border-slate-200 bg-white text-[#374151] hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm"
                      : "border-white/[0.15] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  )}
                  size="lg"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                </Button>
              </Link>
            </div>

            {/* Pro - elevated, larger */}
            <div
              className={cn(
                "relative flex w-full max-w-md flex-col rounded-[1.25rem] border-2 p-8 transition-all duration-300 lg:-mt-2 lg:max-w-[380px] lg:scale-[1.02]",
                isLight
                  ? "border-violet-200 bg-gradient-to-b from-violet-50 via-white to-indigo-50/95 shadow-[0_8px_40px_-12px_rgba(79,70,229,0.18)] hover:border-violet-300 hover:shadow-[0_12px_48px_-12px_rgba(79,70,229,0.22)]"
                  : "border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-dark-50 shadow-[0_0_40px_-12px_rgba(139,92,246,0.25)] hover:border-purple-500/50 hover:shadow-[0_0_50px_-12px_rgba(139,92,246,0.35)]"
              )}
            >
              <span
                className={cn(
                  "absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/30",
                  isLight && "[text-shadow:0_1px_2px_rgba(0,0,0,0.25)]"
                )}
              >
                Most Popular
              </span>
              {activePlan === "pro_monthly" && (
                <div
                  className={cn(
                    "mb-3 rounded-xl border px-3 py-2 text-xs font-medium",
                    isLight
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  )}
                >
                  You are currently on Pro Monthly
                </div>
              )}
              {activePlan === "pro_annual" && (
                <div
                  className={cn(
                    "mb-3 rounded-xl border px-3 py-2 text-xs font-medium",
                    isLight
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  )}
                >
                  You are currently on Pro Annual
                </div>
              )}
              {activePlan === "pro_lifetime" && (
                <div
                  className={cn(
                    "mb-3 rounded-xl border px-3 py-2 text-sm font-medium",
                    isLight
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  )}
                >
                  You are all set for Lifetime. No need to worry about plans.
                </div>
              )}
              <div className="mt-1 flex items-center gap-2">
                <h3 className={cn("text-xl font-semibold", isLight ? "text-[#111827]" : "text-white")}>
                  Pro
                </h3>
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              </div>
              <p className={cn("mt-1 text-sm", isLight ? "text-[#374151]" : "text-slate-400")}>
                Everything you need to land the job
              </p>
              <p className="mt-6">
                <span className={cn("text-4xl font-extrabold", isLight ? "text-[#111827]" : "text-white")}>
                  $7.99
                </span>
                <span className={cn("ml-1", isLight ? "text-[#6b7280]" : "text-slate-500")}>/month</span>
              </p>
              <div className="mt-4 space-y-2">
                {proOptions.map((opt) => {
                  const isCurrent = isCurrentProInterval(opt.id);
                  const canSelect = canUpgradeToInterval(opt.id);
                  const isLifetimeLocked = activePlan === "pro_lifetime";
                  return (
                    <button
                      key={opt.id}
                      onClick={() => !isLifetimeLocked && canSelect && setProInterval(opt.id)}
                      disabled={isCurrent || isLifetimeLocked}
                      className={cn(
                        "flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-all duration-200",
                        isCurrent
                          ? isLight
                            ? "cursor-default border-emerald-200 bg-emerald-50 text-emerald-800"
                            : "cursor-default border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : proInterval === opt.id
                            ? isLight
                              ? "border-violet-300 bg-[#f5f3ff] text-[#111827]"
                              : "border-purple-500/50 bg-purple-500/20 text-white"
                            : isLight
                              ? "border-slate-200 bg-white text-[#374151] hover:border-slate-300"
                              : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15] hover:text-slate-300"
                      )}
                    >
                      <span>
                        {isCurrent ? (
                          <>
                            Current Plan —{" "}
                            <span
                              className={cn(
                                "font-semibold",
                                isLight ? "text-emerald-900" : "text-emerald-300"
                              )}
                            >
                              {opt.price}
                            </span>
                          </>
                        ) : (
                          <>
                            {opt.id === "annual" && activePlan === "pro_monthly"
                              ? "Switch to Annual at renewal"
                              : opt.id === "lifetime" && (activePlan === "pro_monthly" || activePlan === "pro_annual")
                                ? "Upgrade to Lifetime"
                                : opt.id === "lifetime" && activePlan !== "free" && activePlan !== "one_time_export"
                                  ? "Upgrade to Lifetime"
                                  : opt.label}
                            {" — "}
                            <span
                              className={cn(
                                "font-semibold",
                                isLight ? "text-[#111827]" : "text-white"
                              )}
                            >
                              {opt.price}
                            </span>
                          </>
                        )}
                      </span>
                      {opt.badge && !isCurrent && (
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            isLight
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-emerald-500/20 text-emerald-400"
                          )}
                        >
                          {opt.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <ul className="mt-8 flex-1 space-y-4">
                {proFeatures.map((f) => (
                  <li
                    key={f}
                    className={cn(
                      "flex items-center gap-3 text-sm",
                      isLight ? "text-[#374151]" : "text-slate-300"
                    )}
                  >
                    <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              {activePlan === "pro_lifetime" ? (
                <Button
                  className={cn(
                    "mt-8 w-full cursor-not-allowed text-base font-bold",
                    isLight
                      ? "bg-slate-200 text-slate-500"
                      : "bg-slate-600/50 text-slate-400"
                  )}
                  size="lg"
                  disabled
                >
                  Lifetime Active
                </Button>
              ) : (
                <Button
                  className={cn(
                    "mt-8 w-full text-base font-bold transition-all duration-200",
                    isLight
                      ? "bg-gradient-to-r from-[#4f46e5] to-violet-600 text-white shadow-md shadow-indigo-500/20 hover:scale-[1.01] hover:from-[#4338ca] hover:to-violet-700 hover:shadow-lg"
                      : "bg-gradient-to-r from-purple-600 to-violet-600 shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-violet-500 hover:shadow-purple-500/30"
                  )}
                  size="lg"
                  loading={isLoading === "pro"}
                  disabled={false}
                  onClick={() => handleCheckout("pro")}
                >
                  {(activePlan === "pro_monthly" && proInterval === "monthly") ||
                  (activePlan === "pro_annual" && proInterval === "annual")
                    ? "Current Plan"
                    : activePlan === "free" || activePlan === "one_time_export"
                      ? "Upgrade to Pro"
                      : proInterval === "annual"
                        ? "Upgrade to Annual"
                        : proInterval === "lifetime"
                          ? "Upgrade to Lifetime"
                          : "Upgrade to Pro"}
                </Button>
              )}
            </div>

            {/* One-Time Export */}
            <div
              className={cn(
                "flex w-full max-w-md flex-col rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 lg:max-w-[340px]",
                isLight
                  ? "border-amber-200 bg-amber-50/90 shadow-sm hover:border-amber-300 hover:shadow-md"
                  : "border-amber-500/20 bg-amber-500/5 hover:border-amber-500/30 hover:bg-amber-500/[0.08]"
              )}
            >
              {activePlan === "one_time_export" && (
                <div
                  className={cn(
                    "mb-3 rounded-xl border px-3 py-2 text-xs font-medium",
                    isLight
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  )}
                >
                  You already have Export Access
                </div>
              )}
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3 className={cn("text-xl font-semibold", isLight ? "text-[#111827]" : "text-white")}>
                  One-Time Export
                </h3>
              </div>
              <p className={cn("mt-1 text-sm", isLight ? "text-[#374151]" : "text-slate-500")}>
                $19.99 one-time – unlimited exports forever, no ads, all formats
              </p>
              <p className="mt-6">
                <span className={cn("text-4xl font-extrabold", isLight ? "text-[#111827]" : "text-white")}>
                  $19.99
                </span>
                <span className={cn("ml-1", isLight ? "text-[#6b7280]" : "text-slate-500")}>one-time</span>
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {oneTimeFeatures.map((f) => (
                  <li
                    key={f}
                    className={cn(
                      "flex items-center gap-3 text-sm",
                      isLight ? "text-[#374151]" : "text-slate-400"
                    )}
                  >
                    <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
                <li
                  className={cn(
                    "flex items-center gap-3 text-sm",
                    isLight ? "text-[#6b7280]" : "text-slate-500"
                  )}
                >
                  <X className="h-5 w-5 flex-shrink-0 text-red-500" />
                  No Pro AI features (tailoring, cover letter, ATS)
                </li>
              </ul>
              <Button
                variant="outline"
                className={cn(
                  "mt-8 w-full transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
                  isLight
                    ? "border-amber-300 bg-white text-amber-900 hover:scale-[1.02] hover:border-amber-400 hover:bg-amber-100 hover:shadow-md"
                    : "border-amber-500/40 text-amber-300 hover:border-amber-500/50 hover:bg-amber-900/30 hover:text-amber-100"
                )}
                size="lg"
                loading={isLoading === "one-time"}
                disabled={activePlan === "pro_lifetime"}
                onClick={() => handleCheckout("one-time")}
              >
                {activePlan === "one_time_export" ? "Current Plan" : "Buy Export Access"}
              </Button>
            </div>
          </div>
        </section>

        {/* Competitor comparison */}
        <section
          className={cn(
            "relative border-t px-4 py-16 sm:px-6 lg:px-8",
            isLight ? "border-slate-200" : "border-white/[0.04]"
          )}
        >
          <div className="mx-auto max-w-2xl">
            <h2
              className={cn(
                "text-center text-xl font-bold tracking-tight sm:text-2xl",
                isLight ? "text-[#111827]" : "text-white"
              )}
            >
              Compare Our Price
            </h2>
            <p
              className={cn(
                "mx-auto mt-2 max-w-md text-center text-sm",
                isLight ? "text-[#6b7280]" : "text-slate-500"
              )}
            >
              Professional resume builders at a fraction of the cost
            </p>
            <div
              className={cn(
                "mt-8 overflow-hidden rounded-2xl border",
                isLight
                  ? "border-slate-200 bg-white shadow-sm"
                  : "border-white/[0.06] bg-white/[0.02]"
              )}
            >
              <table className="w-full">
                <thead>
                  <tr
                    className={cn(
                      "border-b",
                      isLight ? "border-slate-200 bg-slate-50" : "border-white/[0.06] bg-white/[0.03]"
                    )}
                  >
                    <th
                      className={cn(
                        "px-6 py-4 text-left text-sm font-semibold",
                        isLight ? "text-[#374151]" : "text-slate-400"
                      )}
                    >
                      Resume Builder
                    </th>
                    <th
                      className={cn(
                        "px-6 py-4 text-right text-sm font-semibold",
                        isLight ? "text-[#374151]" : "text-slate-400"
                      )}
                    >
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonCompetitors.map((row) => (
                    <tr
                      key={row.name}
                      className={cn(
                        "border-b last:border-b-0",
                        isLight ? "border-slate-100" : "border-white/[0.04]",
                        row.highlight && (isLight ? "bg-violet-50/80" : "bg-brand-500/10")
                      )}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "font-medium",
                            row.highlight
                              ? isLight
                                ? "text-[#4f46e5]"
                                : "text-brand-300"
                              : isLight
                                ? "text-[#374151]"
                                : "text-slate-300"
                          )}
                        >
                          {row.name}
                          {row.highlight && (
                            <span
                              className={cn(
                                "ml-2 rounded-full px-2 py-0.5 text-[10px] font-medium",
                                isLight
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-emerald-500/20 text-emerald-400"
                              )}
                            >
                              You
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={cn(
                            "font-semibold",
                            row.highlight
                              ? isLight
                                ? "text-emerald-700"
                                : "text-emerald-400"
                              : isLight
                                ? "text-[#6b7280]"
                                : "text-slate-400"
                          )}
                        >
                          {row.price}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2
              className={cn(
                "text-center text-2xl font-bold tracking-tight sm:text-3xl",
                isLight ? "text-[#111827]" : "text-white"
              )}
            >
              Pricing FAQ
            </h2>
            <p
              className={cn(
                "mx-auto mt-2 max-w-xl text-center",
                isLight ? "text-[#6b7280]" : "text-slate-500"
              )}
            >
              Common questions about billing and plans
            </p>
            <div
              className={cn(
                "mt-12 rounded-2xl border px-6",
                isLight
                  ? "border-slate-200 bg-white shadow-sm"
                  : "border-white/[0.06] bg-white/[0.02]"
              )}
            >
              {faqItems.map((item) => (
                <FAQItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Export warning modal: Pro user buying Export */}
      <Modal
        isOpen={exportWarningOpen}
        onClose={() => setExportWarningOpen(false)}
        title="Switch to Export Plan?"
        size="sm"
      >
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-amber-400" />
            <p className="text-sm text-slate-300">
              This will cancel your current Pro plan and activate only Export features.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-end">
            <Button
              variant="outline"
              className="border-white/20 text-slate-300 hover:bg-white/10"
              onClick={proceedWithExportCheckout}
            >
              Continue with Export Plan
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500"
              onClick={() => setExportWarningOpen(false)}
            >
              Go Back
            </Button>
          </div>
        </div>
      </Modal>

      {/* Current plan modal: user clicked their current plan */}
      <Modal
        isOpen={currentPlanModalOpen}
        onClose={() => setCurrentPlanModalOpen(false)}
        title="Current Plan"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-300">
            {canCancelMembership
              ? "You are already on this plan. Would you like to go back or cancel membership?"
              : "You are already on this plan. Would you like to go back?"}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-end">
            {canCancelMembership && (
              <Button
                variant="outline"
                className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                onClick={handleCancelMembership}
              >
                Cancel Membership
              </Button>
            )}
            <Button
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500"
              onClick={() => setCurrentPlanModalOpen(false)}
            >
              Go Back
            </Button>
          </div>
        </div>
      </Modal>

      {/* Cancel confirmation modal */}
      <Modal
        isOpen={cancelConfirmModalOpen}
        onClose={() => setCancelConfirmModalOpen(false)}
        title="Cancel Membership?"
        size="sm"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-300">
            Are you sure you want to cancel your membership?
          </p>
          <div className="flex flex-col gap-2 sm:flex-row-reverse sm:justify-end">
            <Button
              variant="outline"
              className="border-white/20 text-slate-300 hover:bg-white/10"
              onClick={confirmCancelMembership}
              loading={canceling}
            >
              Yes
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500"
              onClick={() => setCancelConfirmModalOpen(false)}
            >
              No
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}

/* === ALL UPDATES COMPLETE: 5 EXPORTS FREE + TEMPLATE FIX + EDITOR ORDER + DASHBOARD BUTTON + GPT-4o TEXT + 50+ TEMPLATES + $7.99 / $19.99 PRICING === */
