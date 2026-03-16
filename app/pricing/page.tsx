"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronDown, Sparkles, Zap } from "lucide-react";

const freeFeatures = [
  "AI resume builder",
  "3 AI generations per resume",
  "5 basic templates",
  "3 exports per month",
  "Ads before export",
  "PDF, DOCX, TXT, JSON, Markdown export",
];

const proFeatures = [
  "Unlimited AI generations",
  "All 20+ premium templates",
  "Unlimited exports — no ads",
  "Job description resume tailoring",
  "Cover letter generator",
  "ATS score analysis",
  "PDF, DOCX, TXT, JSON, Markdown export",
  "Priority support",
];

const comparisonRows = [
  { feature: "AI-powered writing", free: true, pro: true },
  { feature: "AI generations", free: "3 per resume", pro: "Unlimited" },
  { feature: "Resume templates", free: "5 basic", pro: "All 20+" },
  { feature: "Monthly exports", free: "3", pro: "Unlimited" },
  { feature: "Job description tailoring", free: false, pro: true },
  { feature: "Cover letter generator", free: false, pro: true },
  { feature: "ATS score analysis", free: true, pro: true },
  { feature: "Resume scoring", free: true, pro: true },
  { feature: "Export formats", free: "PDF, DOCX, TXT, JSON, MD", pro: "PDF, DOCX, TXT, JSON, MD" },
  { feature: "Ad-free exports", free: false, pro: true },
  { feature: "Priority support", free: false, pro: true },
];

const faqItems = [
  {
    question: "How does billing work?",
    answer:
      "The Free plan is always free with no credit card required. The Pro plan is billed monthly at $7/month. You can upgrade or downgrade at any time from your dashboard.",
  },
  {
    question: "Can I cancel my Pro subscription anytime?",
    answer:
      "Yes, you can cancel your Pro subscription at any time with no questions asked. You'll continue to have access to Pro features until the end of your current billing period.",
  },
  {
    question: "What is the one-time export option?",
    answer:
      "If you don't want a monthly subscription, you can pay $9 once to unlock unlimited exports permanently. This gives you all export features without needing a Pro subscription.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor, Stripe.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer:
      "You can try our Free plan with no time limit — it includes AI features and 3 exports per month. Upgrade to Pro for $7/month for unlimited access. Cancel anytime.",
  },
];

function FAQItem({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return (
    <details className="group border-b border-slate-200 last:border-b-0">
      <summary className="flex cursor-pointer items-center justify-between py-5 text-left text-base font-medium text-slate-900 transition-colors hover:text-brand-600 [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-5 pr-12 text-sm leading-relaxed text-slate-600">
        {answer}
      </div>
    </details>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  const handleCheckout = async (plan: "pro" | "one-time") => {
    if (!isAuthenticated) {
      router.push("/signup");
      return;
    }

    setIsLoading(plan);
    try {
      const endpoint =
        plan === "pro" ? "/api/stripe/checkout" : "/api/stripe/one-time-export";
      const bodyPayload = plan === "pro" ? { plan: "pro" } : {};

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err) {
      console.error(err);
      setIsLoading(null);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(99,102,241,0.06),transparent)]" />

        {/* Header */}
        <section className="px-4 pt-16 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Sparkles className="h-3.5 w-3.5" />
              Simple pricing
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Start free and upgrade when you need more power
            </p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="px-4 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-5xl flex-col items-stretch justify-center gap-8 lg:flex-row">
            {/* Free Plan */}
            <div className="flex w-full max-w-md flex-col rounded-2xl border border-slate-200/60 bg-white p-8 shadow-card transition-all duration-300 hover:shadow-card-hover lg:max-w-sm">
              <h3 className="text-xl font-semibold text-slate-900">Free</h3>
              <p className="mt-1 text-sm text-slate-500">
                Perfect for getting started
              </p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-slate-900">$0</span>
                <span className="ml-1 text-slate-500">/month</span>
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={isAuthenticated ? "/dashboard" : "/signup"} className="mt-8 block">
                <Button variant="outline" className="w-full" size="lg">
                  {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                </Button>
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="relative flex w-full max-w-md flex-col rounded-2xl border-2 border-brand-500 bg-white p-8 shadow-card transition-all duration-300 hover:shadow-card-hover lg:max-w-sm">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md">
                Most Popular
              </span>
              <h3 className="text-xl font-semibold text-slate-900">Pro</h3>
              <p className="mt-1 text-sm text-slate-500">
                Everything you need to land the job
              </p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-slate-900">$7</span>
                <span className="ml-1 text-slate-500">/month</span>
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                    <Check className="h-5 w-5 flex-shrink-0 text-brand-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                size="lg"
                loading={isLoading === "pro"}
                onClick={() => handleCheckout("pro")}
              >
                Upgrade to Pro
              </Button>
            </div>

            {/* One-Time Export */}
            <div className="flex w-full max-w-md flex-col rounded-2xl border border-slate-200/60 bg-gradient-to-b from-amber-50/50 to-white p-8 shadow-card transition-all duration-300 hover:shadow-card-hover lg:max-w-sm">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                <h3 className="text-xl font-semibold text-slate-900">One-Time Export</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">
                Pay once, export forever
              </p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-slate-900">$9</span>
                <span className="ml-1 text-slate-500">one-time</span>
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="h-5 w-5 flex-shrink-0 text-amber-500" />
                  Unlimited exports forever
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="h-5 w-5 flex-shrink-0 text-amber-500" />
                  No ads on export
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <Check className="h-5 w-5 flex-shrink-0 text-amber-500" />
                  All export formats
                </li>
                <li className="flex items-center gap-3 text-sm text-slate-700">
                  <X className="h-5 w-5 flex-shrink-0 text-slate-300" />
                  Pro AI features not included
                </li>
              </ul>
              <Button
                variant="outline"
                className="mt-8 w-full border-amber-300 text-amber-700 hover:bg-amber-50"
                size="lg"
                loading={isLoading === "one-time"}
                onClick={() => handleCheckout("one-time")}
              >
                Buy Export Access
              </Button>
            </div>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="border-t border-slate-200 bg-slate-50/80 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Compare Plans
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
              See exactly what&apos;s included in each plan
            </p>

            <div className="mt-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                        Feature
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-slate-900">
                        Free
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-brand-600">
                        Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr
                        key={row.feature}
                        className="border-b border-slate-100 last:border-b-0"
                      >
                        <td className="px-6 py-4 text-sm text-slate-700">
                          {row.feature}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {typeof row.free === "boolean" ? (
                            row.free ? (
                              <Check className="mx-auto h-5 w-5 text-emerald-500" />
                            ) : (
                              <X className="mx-auto h-5 w-5 text-slate-300" />
                            )
                          ) : (
                            <span className="text-sm text-slate-600">
                              {row.free}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {typeof row.pro === "boolean" ? (
                            row.pro ? (
                              <Check className="mx-auto h-5 w-5 text-brand-500" />
                            ) : (
                              <X className="mx-auto h-5 w-5 text-slate-300" />
                            )
                          ) : (
                            <span className="text-sm font-medium text-slate-900">
                              {row.pro}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Pricing FAQ
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-slate-600">
              Common questions about billing and plans
            </p>

            <div className="mt-12 rounded-2xl border border-slate-200 bg-white px-6 shadow-sm">
              {faqItems.map((item) => (
                <FAQItem
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
