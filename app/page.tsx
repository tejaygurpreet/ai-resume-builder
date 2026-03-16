"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthCTA } from "@/components/auth-cta";
import { FadeUp, Stagger, StaggerChild } from "@/components/ui/motion";
import {
  Sparkles,
  FileCheck,
  Eye,
  Download,
  GripVertical,
  Target,
  Star,
  Check,
  ArrowRight,
  ChevronDown,
  Zap,
  Shield,
} from "lucide-react";

/* ───────── static data ───────── */

const features = [
  {
    Icon: Sparkles,
    title: "AI-Powered Writing",
    description:
      "Let AI craft compelling bullet points and summaries tailored to your experience and target role.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    Icon: FileCheck,
    title: "ATS-Friendly Templates",
    description:
      "Every template is optimized to pass Applicant Tracking Systems so your resume reaches real humans.",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    Icon: Eye,
    title: "Real-Time Preview",
    description:
      "See changes instantly as you type. What you see is exactly what recruiters will see.",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    Icon: Download,
    title: "Multi-Format Export",
    description:
      "Download as PDF, DOCX, TXT, JSON, or Markdown — perfectly formatted and ready to send.",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    Icon: GripVertical,
    title: "Drag & Drop Editor",
    description:
      "Rearrange sections effortlessly with an intuitive drag-and-drop interface built for speed.",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    Icon: Target,
    title: "Job Keyword Matching",
    description:
      "Paste a job description and instantly see which keywords are missing from your resume.",
    gradient: "from-indigo-500 to-blue-600",
  },
];

const landingTemplates = [
  { name: "Modern", key: "modern", from: "from-brand-500", to: "to-cyan-400" },
  { name: "Professional", key: "professional", from: "from-slate-700", to: "to-slate-500" },
  { name: "Minimal", key: "minimal", from: "from-emerald-500", to: "to-teal-400" },
  { name: "Executive", key: "executive", from: "from-amber-500", to: "to-orange-400" },
  { name: "Creative", key: "creative", from: "from-purple-500", to: "to-pink-400" },
  { name: "Elegant", key: "elegant", from: "from-yellow-600", to: "to-amber-400" },
  { name: "Timeline", key: "timeline", from: "from-teal-500", to: "to-cyan-400" },
  { name: "Bold", key: "bold", from: "from-red-500", to: "to-orange-400" },
];

const testimonials = [
  {
    quote:
      "ResumeAI helped me land interviews at three FAANG companies within two weeks. The AI suggestions were spot-on!",
    name: "Sarah Chen",
    title: "Software Engineer at Google",
    stars: 5,
  },
  {
    quote:
      "I went from getting zero callbacks to five interview requests in one week. The ATS optimization made all the difference.",
    name: "Marcus Johnson",
    title: "Marketing Manager",
    stars: 5,
  },
  {
    quote:
      "As a career changer, I struggled to frame my experience. ResumeAI rewrote my bullets perfectly for my new field.",
    name: "Emily Rodriguez",
    title: "UX Designer at Shopify",
    stars: 5,
  },
];

const faqItems = [
  {
    question: "What is ResumeAI?",
    answer:
      "ResumeAI is an AI-powered resume builder that helps you create professional, ATS-optimized resumes in minutes. Our platform uses advanced language models to suggest impactful bullet points, match job keywords, and ensure your resume stands out.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes! Our free plan includes AI-powered writing, 5 templates, and 3 exports per month. For unlimited exports, job tailoring, cover letter generation, and all 20+ templates, upgrade to Pro for $7/month.",
  },
  {
    question: "Are the resumes ATS-compatible?",
    answer:
      "Absolutely. Every template is built from the ground up to be ATS-friendly. We use clean formatting, standard section headings, and proper document structure.",
  },
  {
    question: "How do you handle my data?",
    answer:
      "Your privacy is our top priority. All data is encrypted in transit and at rest. We never sell your personal information. You can delete your account and data at any time.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your Pro subscription at any time. You keep access to Pro features until the end of your billing period.",
  },
];

const freePlanFeatures = [
  "AI resume builder",
  "3 AI generations per resume",
  "5 basic templates",
  "3 exports per month",
  "ATS scoring",
];

const proPlanFeatures = [
  "Unlimited AI generations",
  "All 20+ premium templates",
  "Unlimited exports — no ads",
  "Job description tailoring",
  "Cover letter generator",
  "ATS score analysis",
  "Priority support",
];

const stats = [
  { value: "50K+", label: "Resumes Created" },
  { value: "89%", label: "Interview Rate" },
  { value: "20+", label: "ATS Templates" },
  { value: "4.9★", label: "User Rating" },
];

/* ───────── helper components ───────── */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between rounded-xl px-6 py-5 text-left text-[15px] font-medium text-slate-900 transition-all hover:bg-slate-50/80">
        {question}
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600">
        {answer}
      </div>
    </details>
  );
}

/* ───────── page ───────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/60 via-surface to-surface" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(99,102,241,0.08),transparent)]" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full bg-brand-200/20 blur-3xl" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 pb-28 pt-20 sm:px-6 md:flex-row md:pb-36 md:pt-28 lg:px-8">
          {/* Copy */}
          <div className="flex-1 text-center md:text-left">
            <FadeUp>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white/80 px-4 py-1.5 text-xs font-medium text-brand-700 shadow-soft backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Powered by AI
              </span>
            </FadeUp>

            <FadeUp delay={0.1}>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.5rem] lg:leading-[1.1]">
                Build Your Perfect{" "}
                <span className="gradient-text">Resume with AI</span>
              </h1>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                Create professional, ATS-friendly resumes in minutes. Our AI
                crafts compelling content while you focus on landing your dream job.
              </p>
            </FadeUp>

            <FadeUp delay={0.3}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                <AuthCTA
                  guestHref="/signup"
                  authHref="/templates"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand-600 px-7 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all duration-200 hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-600/25 hover:-translate-y-[1px] active:translate-y-0"
                >
                  Start Building Free
                  <ArrowRight className="h-4 w-4" />
                </AuthCTA>
                <Link
                  href="/#templates"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-7 text-sm font-semibold text-slate-700 shadow-soft transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-card hover:-translate-y-[1px]"
                >
                  See Templates
                </Link>
              </div>
            </FadeUp>

            <FadeUp delay={0.4}>
              <p className="mt-5 flex items-center gap-2 text-xs text-slate-500 md:justify-start justify-center">
                <Shield className="h-3.5 w-3.5" />
                No credit card required &middot; Free forever plan
              </p>
            </FadeUp>
          </div>

          {/* Resume mockup */}
          <FadeUp delay={0.3} className="relative flex-1">
            <div aria-hidden="true" className="mx-auto w-full max-w-sm">
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-card-hover"
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-violet-500 shadow-glow" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-lg bg-slate-900" />
                    <div className="h-3 w-1/2 rounded-lg bg-slate-200" />
                  </div>
                </div>
                <div className="mb-5 space-y-2">
                  <div className="h-3 w-1/3 rounded-lg bg-brand-500" />
                  <div className="h-2.5 w-full rounded bg-slate-100" />
                  <div className="h-2.5 w-5/6 rounded bg-slate-100" />
                  <div className="h-2.5 w-4/6 rounded bg-slate-100" />
                </div>
                <div className="mb-5 space-y-2">
                  <div className="h-3 w-1/4 rounded-lg bg-brand-500" />
                  <div className="h-2.5 w-full rounded bg-slate-100" />
                  <div className="h-2.5 w-5/6 rounded bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-2/5 rounded-lg bg-brand-500" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-brand-50 border border-brand-100" />
                    <div className="h-6 w-20 rounded-full bg-brand-50 border border-brand-100" />
                    <div className="h-6 w-14 rounded-full bg-brand-50 border border-brand-100" />
                  </div>
                </div>

                {/* AI sparkle badge */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: "spring", stiffness: 200 }}
                  className="absolute -right-4 -top-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-card-hover border border-slate-200/60"
                >
                  <Sparkles className="h-5 w-5 text-brand-600" />
                </motion.div>

                <div className="absolute -right-8 top-20 h-32 w-32 rounded-full bg-brand-200/30 blur-3xl" />
                <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-violet-200/30 blur-3xl" />
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="relative -mt-8 z-10 px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="mx-auto max-w-4xl rounded-2xl border border-slate-200/60 bg-white p-6 shadow-card">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-slate-900 sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              <Zap className="h-3 w-3" />
              Features
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Everything You Need to Land the Job
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Our tools give you an unfair advantage in today&apos;s competitive job market.
            </p>
          </FadeUp>

          <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, description, gradient }) => (
              <StaggerChild key={title}>
                <div className="group relative rounded-2xl border border-slate-200/60 bg-white p-7 transition-all duration-300 hover:border-brand-200/60 hover:shadow-card-hover">
                  <div
                    className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} text-white shadow-sm transition-transform duration-300 group-hover:scale-110`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {description}
                  </p>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── TEMPLATES ── */}
      <section id="templates" className="bg-slate-50/80 py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              Templates
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Professional Templates for Every Industry
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Choose from our curated collection of recruiter-approved templates.
            </p>
          </FadeUp>

          <Stagger className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {landingTemplates.map(({ name, from, to }) => (
              <StaggerChild key={name}>
                <div className="group overflow-hidden rounded-2xl border border-slate-200/60 bg-white transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1">
                  <div
                    className={`flex h-52 items-end bg-gradient-to-br ${from} ${to} p-4`}
                  >
                    <div className="w-full rounded-t-xl bg-white/90 px-4 pb-0 pt-4 shadow-lg backdrop-blur-sm">
                      <div className="mb-3 flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="h-2.5 w-20 rounded bg-slate-300" />
                          <div className="h-2 w-14 rounded bg-slate-200" />
                        </div>
                      </div>
                      <div className="space-y-1.5 pb-2">
                        <div className="h-2 w-full rounded bg-slate-200" />
                        <div className="h-2 w-4/5 rounded bg-slate-200" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-sm font-semibold text-slate-900">{name}</span>
                    <AuthCTA
                      guestHref="/signup"
                      authHref="/templates"
                      className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition-all duration-200 hover:bg-brand-100 group-hover:bg-brand-600 group-hover:text-white group-hover:shadow-sm"
                    >
                      Use
                      <ArrowRight className="h-3 w-3" />
                    </AuthCTA>
                  </div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>

          <FadeUp className="mt-12 text-center">
            <AuthCTA
              guestHref="/templates"
              authHref="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-soft transition-all duration-200 hover:shadow-card hover:border-brand-300 hover:-translate-y-[1px]"
            >
              Browse All 20+ Templates
              <ArrowRight className="h-4 w-4" />
            </AuthCTA>
          </FadeUp>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              Pricing
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Start for free — upgrade when you&apos;re ready to unlock the full
              power of AI.
            </p>
          </FadeUp>

          <div className="mx-auto mt-16 grid max-w-4xl gap-6 lg:grid-cols-2">
            <FadeUp delay={0.1}>
              <div className="relative rounded-2xl border border-slate-200/60 bg-white p-8 shadow-card">
                <h3 className="text-lg font-semibold text-slate-900">Free</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Perfect for getting started
                </p>
                <p className="mt-6">
                  <span className="text-5xl font-extrabold text-slate-900">$0</span>
                  <span className="ml-1.5 text-sm text-slate-500">/month</span>
                </p>
                <ul className="mt-8 space-y-3.5">
                  {freePlanFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                      <Check className="h-4 w-4 flex-shrink-0 text-brand-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <AuthCTA
                  guestHref="/signup"
                  authHref="/templates"
                  className="mt-8 flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-soft transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-card"
                >
                  Get Started Free
                </AuthCTA>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="relative rounded-2xl border-2 border-brand-500 bg-white p-8 shadow-card-hover">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brand-600 px-4 py-1 text-xs font-semibold text-white shadow-md shadow-brand-600/20">
                  Most Popular
                </span>
                <h3 className="text-lg font-semibold text-slate-900">Pro</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Everything you need to land the job
                </p>
                <p className="mt-6">
                  <span className="text-5xl font-extrabold text-slate-900">$7</span>
                  <span className="ml-1.5 text-sm text-slate-500">/month</span>
                </p>
                <ul className="mt-8 space-y-3.5">
                  {proPlanFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                      <Check className="h-4 w-4 flex-shrink-0 text-brand-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <AuthCTA
                  guestHref="/signup"
                  authHref="/pricing"
                  className="mt-8 flex h-11 w-full items-center justify-center rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-md shadow-brand-600/20 transition-all duration-200 hover:bg-brand-700 hover:shadow-lg"
                >
                  Upgrade to Pro
                </AuthCTA>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-slate-50/80 py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              Testimonials
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Loved by Job Seekers Worldwide
            </h2>
          </FadeUp>

          <Stagger className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map(({ quote, name, title, stars }) => (
              <StaggerChild key={name}>
                <div className="rounded-2xl border border-slate-200/60 bg-white p-7 shadow-card transition-all duration-300 hover:shadow-card-hover">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">
                    &ldquo;{quote}&rdquo;
                  </p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 text-sm font-semibold text-white shadow-sm">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500">{title}</p>
                    </div>
                  </div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-28">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
              FAQ
            </span>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </FadeUp>

          <FadeUp delay={0.1} className="mt-12 divide-y divide-slate-200/60 rounded-2xl border border-slate-200/60 bg-white shadow-card">
            {faqItems.map((item) => (
              <FAQItem
                key={item.question}
                question={item.question}
                answer={item.answer}
              />
            ))}
          </FadeUp>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-violet-700 py-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_120%,rgba(255,255,255,0.1),transparent)]" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />

        <FadeUp className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="mt-4 text-lg text-brand-100">
            Join thousands of job seekers who landed their dream jobs with ResumeAI.
          </p>
          <AuthCTA
            guestHref="/signup"
            authHref="/templates"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-brand-700 shadow-lg transition-all duration-200 hover:bg-brand-50 hover:shadow-xl hover:-translate-y-[1px]"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </AuthCTA>
        </FadeUp>
      </section>

      <Footer />
    </div>
  );
}
