"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronDown, Sparkles, Zap, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const freeFeatures = [
  "AI resume builder",
  "3 AI generations per resume",
  "10 basic templates",
  "10 exports per month",
  "No ads on export",
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

const oneTimeFeatures = [
  "Unlimited exports forever",
  "No ads on export",
  "All export formats",
];

type ProInterval = "monthly" | "annual" | "lifetime";

const proOptions: { id: ProInterval; label: string; price: string; badge?: string }[] = [
  { id: "monthly", label: "Monthly", price: "$7" },
  { id: "annual", label: "Annual", price: "$59/year", badge: "Best value — save 30%" },
  { id: "lifetime", label: "Lifetime", price: "$99 one-time" },
];

const comparisonCompetitors = [
  { name: "Us", price: "$7/mo", highlight: true },
  { name: "Teal", price: "$29/mo", highlight: false },
  { name: "Rezi", price: "$29/mo", highlight: false },
  { name: "Kickresume", price: "$19–24/mo", highlight: false },
];

const faqItems = [
  { question: "How does billing work?", answer: "The Free plan is always free with no credit card required. Pro is $7/month, $59/year (save 30%), or $99 lifetime. The One-Time Export is $19 for unlimited exports forever. Upgrade or downgrade anytime from your dashboard." },
  { question: "Can I cancel my Pro subscription anytime?", answer: "Yes, you can cancel your Pro subscription at any time with no questions asked. You'll continue to have access to Pro features until the end of your current billing period." },
  { question: "What is the one-time export option?", answer: "Pay $19 once to unlock unlimited exports permanently. This gives you all export features without a subscription. Pro AI features (tailoring, cover letters, ATS) are not included." },
  { question: "What payment methods do you accept?", answer: "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor, Stripe." },
  { question: "Is there a free trial for Pro?", answer: "You can try our Free plan with no time limit — it includes AI features and 10 exports per month. Upgrade to Pro for $7/month for unlimited access. Cancel anytime." },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-white/[0.04] last:border-b-0">
      <summary className="flex cursor-pointer items-center justify-between py-5 text-left text-base font-medium text-white transition-colors hover:text-brand-300 [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-600 transition-transform duration-300 group-open:rotate-180 group-open:text-brand-400" />
      </summary>
      <div className="pb-5 pr-12 text-sm leading-relaxed text-slate-400">{answer}</div>
    </details>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [proInterval, setProInterval] = useState<ProInterval>("monthly");
  const isAuthenticated = status === "authenticated" && !!session?.user;

  const handleCheckout = async (plan: "pro" | "one-time") => {
    if (!isAuthenticated) {
      router.push("/signup");
      return;
    }
    setIsLoading(plan);
    try {
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
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#010409]">
      <Navbar />

      <main className="relative overflow-hidden">
        <div className="orb orb-cyan absolute right-1/4 top-0 h-[500px] w-[500px] animate-pulse-glow" />
        <div className="orb orb-violet absolute left-0 top-1/2 h-[400px] w-[400px] animate-pulse-glow [animation-delay:2s]" />

        <section className="relative px-4 pt-20 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
              <Sparkles className="h-3.5 w-3.5" /> Simple pricing
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Start free and upgrade when you need more power
            </p>
          </div>
        </section>

        <section className="relative px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-stretch justify-center gap-8 lg:flex-row lg:items-start">
            {/* Free */}
            <div className="flex w-full max-w-md flex-col rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-sm transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.05] lg:max-w-[340px]">
              <h3 className="text-xl font-semibold text-white">Free</h3>
              <p className="mt-1 text-sm text-slate-500">Perfect for getting started</p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-white">$0</span>
                <span className="ml-1 text-slate-500">/month</span>
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={isAuthenticated ? "/dashboard" : "/signup"} className="mt-8 block">
                <Button
                  variant="outline"
                  className="w-full border-white/[0.15] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  size="lg"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                </Button>
              </Link>
            </div>

            {/* Pro - elevated, larger */}
            <div className="relative flex w-full max-w-md flex-col rounded-[1.25rem] border-2 border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-dark-50 p-8 shadow-[0_0_40px_-12px_rgba(139,92,246,0.25)] transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_50px_-12px_rgba(139,92,246,0.35)] lg:-mt-2 lg:max-w-[380px] lg:scale-[1.02]">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/30">
                Most Popular
              </span>
              <div className="mt-1 flex items-center gap-2">
                <h3 className="text-xl font-semibold text-white">Pro</h3>
                <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
              </div>
              <p className="mt-1 text-sm text-slate-400">Everything you need to land the job</p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-white">$7</span>
                <span className="ml-1 text-slate-500">/month</span>
              </p>
              <div className="mt-4 space-y-2">
                {proOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setProInterval(opt.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-left text-sm transition-all",
                      proInterval === opt.id
                        ? "border-purple-500/50 bg-purple-500/20 text-white"
                        : "border-white/[0.08] bg-white/[0.03] text-slate-400 hover:border-white/[0.15] hover:text-slate-300"
                    )}
                  >
                    <span>
                      {opt.label} — <span className="font-semibold text-white">{opt.price}</span>
                    </span>
                    {opt.badge && (
                      <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        {opt.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <ul className="mt-8 flex-1 space-y-4">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full bg-gradient-to-r from-purple-600 to-violet-600 text-base font-bold shadow-lg shadow-purple-500/25 hover:from-purple-500 hover:to-violet-500 hover:shadow-purple-500/30"
                size="lg"
                loading={isLoading === "pro"}
                onClick={() => handleCheckout("pro")}
              >
                Upgrade to Pro
              </Button>
            </div>

            {/* One-Time Export */}
            <div className="flex w-full max-w-md flex-col rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 backdrop-blur-sm transition-all duration-300 hover:border-amber-500/30 hover:bg-amber-500/[0.08] lg:max-w-[340px]">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-400" />
                <h3 className="text-xl font-semibold text-white">One-Time Export</h3>
              </div>
              <p className="mt-1 text-sm text-slate-500">Pay once, export forever</p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-white">$19</span>
                <span className="ml-1 text-slate-500">one-time</span>
              </p>
              <ul className="mt-8 flex-1 space-y-4">
                {oneTimeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-400">
                    <Check className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm text-slate-500">
                  <X className="h-5 w-5 flex-shrink-0 text-red-500" />
                  Pro AI features not included
                </li>
              </ul>
              <Button
                variant="outline"
                className="mt-8 w-full border-amber-500/40 text-amber-300 hover:bg-amber-500/15 hover:border-amber-500/50 hover:text-amber-200"
                size="lg"
                loading={isLoading === "one-time"}
                onClick={() => handleCheckout("one-time")}
              >
                Buy Export Access
              </Button>
            </div>
          </div>
        </section>

        {/* Competitor comparison */}
        <section className="relative border-t border-white/[0.04] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-xl font-bold tracking-tight text-white sm:text-2xl">
              Compare Our Price
            </h2>
            <p className="mx-auto mt-2 max-w-md text-center text-sm text-slate-500">
              Professional resume builders at a fraction of the cost
            </p>
            <div className="mt-8 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.03]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-400">
                      Resume Builder
                    </th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-slate-400">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonCompetitors.map((row) => (
                    <tr
                      key={row.name}
                      className={cn(
                        "border-b border-white/[0.04] last:border-b-0",
                        row.highlight && "bg-brand-500/10"
                      )}
                    >
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "font-medium",
                            row.highlight ? "text-brand-300" : "text-slate-300"
                          )}
                        >
                          {row.name}
                          {row.highlight && (
                            <span className="ml-2 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                              You
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={cn(
                            "font-semibold",
                            row.highlight ? "text-emerald-400" : "text-slate-400"
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
            <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Pricing FAQ
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-slate-500">
              Common questions about billing and plans
            </p>
            <div className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-6">
              {faqItems.map((item) => (
                <FAQItem key={item.question} question={item.question} answer={item.answer} />
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
