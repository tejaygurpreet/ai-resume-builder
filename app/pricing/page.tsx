"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Check, X, ChevronDown, Sparkles } from "lucide-react";

const freeFeatures = [
  "AI resume builder",
  "AI writing suggestions",
  "2 resume templates",
  "Export after watching 3 ads",
  "PDF, DOCX, TXT, JSON export",
];

const proFeatures = [
  "AI resume builder",
  "AI writing suggestions",
  "All 8 resume templates",
  "Unlimited exports — no ads",
  "PDF, DOCX, TXT, JSON export",
  "Priority support",
];

const comparisonRows = [
  { feature: "AI-powered writing", free: true, pro: true },
  { feature: "Resume scoring", free: true, pro: true },
  { feature: "Cover letter generator", free: true, pro: true },
  { feature: "Keyword optimization", free: true, pro: true },
  { feature: "Resume templates", free: "2", pro: "All 8" },
  { feature: "Export formats", free: "PDF, DOCX, TXT, JSON", pro: "PDF, DOCX, TXT, JSON" },
  { feature: "Ad-free exports", free: false, pro: true },
  { feature: "Unlimited exports", free: false, pro: true },
  { feature: "Priority support", free: false, pro: true },
];

const faqItems = [
  {
    question: "How does billing work?",
    answer:
      "The Free plan is always free with no credit card required. The Pro plan is billed monthly at $2.99/month. You can upgrade or downgrade at any time from your dashboard.",
  },
  {
    question: "Can I cancel my Pro subscription anytime?",
    answer:
      "Yes, you can cancel your Pro subscription at any time with no questions asked. You'll continue to have access to Pro features until the end of your current billing period. After that, your account will revert to the free plan.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards (Visa, Mastercard, American Express) and debit cards through our secure payment processor, Stripe. All transactions are encrypted and PCI compliant.",
  },
  {
    question: "Is there a free trial for Pro?",
    answer:
      "You can try our Free plan with no time limit — it includes full AI features. If you want ad-free unlimited exports and all templates, upgrade to Pro for just $2.99/month. Cancel anytime.",
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
    <details className="group border-b border-gray-200 last:border-b-0">
      <summary className="flex cursor-pointer items-center justify-between py-5 text-left text-base font-medium text-gray-900 transition-colors hover:text-blue-600 [&::-webkit-details-marker]:hidden">
        {question}
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-5 pr-12 text-sm leading-relaxed text-gray-600">
        {answer}
      </div>
    </details>
  );
}

export default function PricingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  const handleUpgradeToPro = async () => {
    if (!isAuthenticated) {
      router.push("/signup");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "pro" }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err) {
      console.error(err);
      setIsLoading(false);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="relative overflow-hidden">
        {/* Hero gradient background */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.08),transparent)]" />

        {/* Header */}
        <section className="px-4 pt-16 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Simple pricing
            </span>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
              Choose Your Plan
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Start free and upgrade when you need more power
            </p>
          </div>
        </section>

        {/* Pricing cards */}
        <section className="px-4 pb-20 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-4xl flex-col items-center justify-center gap-8 lg:flex-row">
            {/* Free Plan */}
            <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-shadow hover:shadow-md">
              <h3 className="text-xl font-semibold text-gray-900">Free</h3>
              <p className="mt-1 text-sm text-gray-500">
                Perfect for getting started
              </p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-gray-900">
                  $0
                </span>
                <span className="ml-1 text-gray-500">/month</span>
              </p>
              <ul className="mt-8 space-y-4">
                {freeFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
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
            <div className="relative w-full max-w-md rounded-2xl border-2 border-blue-500 bg-white p-8 shadow-xl shadow-blue-100/50 transition-all hover:shadow-2xl hover:shadow-blue-100/60">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md">
                Most Popular
              </span>
              <h3 className="text-xl font-semibold text-gray-900">Pro</h3>
              <p className="mt-1 text-sm text-gray-500">
                Everything you need to land the job
              </p>
              <p className="mt-6">
                <span className="text-4xl font-extrabold text-gray-900">$2.99</span>
                <span className="ml-1 text-gray-500">/month</span>
              </p>
              <ul className="mt-8 space-y-4">
                {proFeatures.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-gray-700">
                    <Check className="h-5 w-5 flex-shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="mt-8 w-full"
                size="lg"
                loading={isLoading}
                onClick={handleUpgradeToPro}
              >
                Upgrade to Pro
              </Button>
            </div>
          </div>
        </section>

        {/* Feature comparison table */}
        <section className="border-t border-gray-200 bg-gray-50/50 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Compare Plans
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-gray-600">
              See exactly what&apos;s included in each plan
            </p>

            <div className="mt-12 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                        Feature
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                        Free
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-blue-600">
                        Pro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map((row) => (
                      <tr
                        key={row.feature}
                        className="border-b border-gray-100 last:border-b-0"
                      >
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {row.feature}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {typeof row.free === "boolean" ? (
                            row.free ? (
                              <Check className="mx-auto h-5 w-5 text-emerald-500" />
                            ) : (
                              <X className="mx-auto h-5 w-5 text-gray-300" />
                            )
                          ) : (
                            <span className="text-sm text-gray-600">
                              {row.free}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {typeof row.pro === "boolean" ? (
                            row.pro ? (
                              <Check className="mx-auto h-5 w-5 text-blue-500" />
                            ) : (
                              <X className="mx-auto h-5 w-5 text-gray-300" />
                            )
                          ) : (
                            <span className="text-sm font-medium text-gray-900">
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
            <h2 className="text-center text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Pricing FAQ
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-gray-600">
              Common questions about billing and plans
            </p>

            <div className="mt-12 rounded-2xl border border-gray-200 bg-white px-6 shadow-sm">
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
