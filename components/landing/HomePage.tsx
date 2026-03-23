"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
  Check,
  ArrowRight,
  ChevronDown,
  Zap,
  Shield,
} from "lucide-react";
import { HeroProductPreview } from "@/components/landing/hero-product-preview";
import { TemplatePreviewCard } from "@/components/landing/template-preview-card";
import { TemplatePreviewModal } from "@/components/landing/template-preview-modal";
import { templateRegistry } from "@/components/resume/templates";
import { PLANS_COPY, PRICING } from "@/lib/plans";

const features = [
  { Icon: Sparkles, title: "AI-Powered Writing", description: "AI crafts compelling bullet points and summaries tailored to your experience and target role.", color: "from-blue-500 to-cyan-400" },
  { Icon: FileCheck, title: "ATS-Friendly Templates", description: "Every template passes Applicant Tracking Systems so your resume reaches real humans.", color: "from-violet-500 to-purple-400" },
  { Icon: Eye, title: "Real-Time Preview", description: "See changes instantly as you type. What you see is what recruiters will see.", color: "from-emerald-500 to-teal-400" },
  { Icon: Download, title: "Multi-Format Export", description: "Download as PDF, DOCX, TXT, JSON, or Markdown — perfectly formatted.", color: "from-amber-500 to-orange-400" },
  { Icon: GripVertical, title: "Drag & Drop Editor", description: "Rearrange sections effortlessly with an intuitive drag-and-drop interface.", color: "from-pink-500 to-rose-400" },
  { Icon: Target, title: "Job Keyword Matching", description: "Paste a job description and see which keywords are missing from your resume.", color: "from-indigo-500 to-blue-400" },
];

const faqItems = [
  { question: "What is OptimaCV?", answer: "OptimaCV is an AI-powered resume builder that helps you create professional, ATS-optimized resumes in minutes using advanced language models." },
  {
    question: "Is it free to use?",
    answer: `Yes! Free: $0/month – ${PLANS_COPY.free.features.slice(0, 4).join(", ")}. Pro: $${PRICING.proMonthly}/month or $${PRICING.proAnnual}/year or $${PRICING.proLifetime} lifetime – unlimited AI, all templates, tailoring, cover letter, ATS. Export Access: $${PRICING.exportOneTime} one-time – unlimited exports, no AI.`,
  },
  { question: "Are the resumes ATS-compatible?", answer: "Absolutely. Every template uses clean formatting, standard section headings, and proper document structure to pass ATS systems." },
  { question: "How do you handle my data?", answer: "Your privacy is our top priority. All data is encrypted. We never sell your information. Delete your account and data at any time." },
  { question: "Can I cancel anytime?", answer: "Yes. Cancel your Pro subscription at any time. Keep access until the end of your billing period." },
];

/** 6 featured templates for homepage - one per major category */
const FEATURED_TEMPLATE_IDS = ["modern", "professional", "minimal", "tech", "creative", "executive"] as const;

const freePlanFeatures = ["$0/month", ...PLANS_COPY.free.features];
const proPlanFeatures = [...PLANS_COPY.pro.features];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between rounded-xl px-6 py-5 text-left text-[15px] font-semibold text-slate-900 transition-all hover:bg-slate-50">
        {question}
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-400 transition-transform duration-300 group-open:rotate-180 group-open:text-brand-600" />
      </summary>
      <div className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{answer}</div>
    </details>
  );
}

export default function HomePage() {
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  const featuredTemplates = useMemo(() => {
    return FEATURED_TEMPLATE_IDS.map((id) => templateRegistry.find((t) => t.id === id)).filter(Boolean);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ═══ HERO — Premium layered background, real product preview ═══ */}
      <section className="relative min-h-[90vh] overflow-hidden section-dark-rich">
        <div className="hero-gradient-overlay" aria-hidden />
        <div className="absolute inset-0 bg-grid-dark bg-grid opacity-60" />
        <div className="orb orb-blob-1 absolute -top-40 -left-32 h-[600px] w-[600px]" />
        <div className="orb orb-blob-2 absolute top-1/3 -right-32 h-[550px] w-[550px]" />
        <div className="orb orb-blue absolute -top-60 -left-20 h-[700px] w-[700px] animate-pulse-glow" />
        <div className="orb orb-violet absolute -top-40 -right-20 h-[600px] w-[600px] animate-pulse-glow [animation-delay:1.5s]" />
        <div className="orb orb-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] animate-pulse-glow [animation-delay:3s]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark/30 to-dark" />

        <div className="relative mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center gap-12 px-4 py-20 sm:px-6 lg:flex-row lg:gap-20 lg:px-8 lg:py-28">
          {/* Left: Copy */}
          <div className="flex-1 text-center lg:text-left">
            {/* Updated AI badge to GPT-4o */}
            <FadeUp>
              <span className="hero-ai-badge mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/15 px-5 py-2 text-xs font-bold uppercase tracking-wider text-brand-300 backdrop-blur-md transition-all duration-300 ease-out">
                <Sparkles className="h-4 w-4" />
                AI POWERED BY GPT-4o
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl lg:leading-[1.05]">
                AI Resume Builder
              </h1>
            </FadeUp>
            <FadeUp delay={0.15}>
              <h2 className="mt-3 text-2xl font-semibold text-slate-300 sm:text-3xl lg:text-4xl">
                Create Professional Resumes Online
              </h2>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-6 max-w-xl text-xl leading-relaxed text-slate-400">
                AI tailors your CV perfectly to any job — boost ATS scores, generate standout bullets & cover letters, land more interviews. Free to start, no credit card required.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <AuthCTA
                  guestHref="/signup"
                  authHref="/templates"
                  className="btn-premium relative inline-flex h-14 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#6366F1] bg-[length:200%_100%] bg-[position:0%_50%] px-8 text-base font-bold text-white shadow-[0_0_24px_-8px_rgba(99,102,241,0.5)] ring-1 ring-white/20 transition-all duration-300 hover:scale-[1.03] hover:bg-[position:100%_50%] hover:shadow-[0_0_40px_-6px_rgba(99,102,241,0.6),0_0_0_1px_rgba(139,92,246,0.4)] hover:ring-white/30 active:scale-[0.99]"
                >
                  Build Optimal Resume
                  <ArrowRight className="h-5 w-5" />
                </AuthCTA>
                <Link
                  href="/#templates"
                  className="hero-secondary-btn inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl border-2 border-white/20 bg-white/[0.03] px-8 text-base font-bold text-slate-300 backdrop-blur-sm transition-all duration-300 ease-out hover:bg-white/[0.08] hover:border-white/30 hover:text-white hover:-translate-y-[1px]"
                >
                  See Templates
                </Link>
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <p className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-500 lg:justify-start">
                <Shield className="h-4 w-4 shrink-0 text-slate-600" aria-hidden />
                No credit card • Join 0 early users • First 100 get lifetime 50% off
              </p>
            </FadeUp>
          </div>

          {/* Right: Real resume preview with ATS badge & AI suggestions */}
          <FadeUp delay={0.25} className="relative flex-1 lg:flex-[1.1]">
            <HeroProductPreview />
          </FadeUp>
        </div>
      </section>

      {/* ═══ FEATURES — Pure white section, strong contrast ═══ */}
      <section id="features" className="relative z-10 -mt-8 section-light py-36 sm:-mt-12">
        <div className="divider-wave divider-wave-top" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Zap className="h-3.5 w-3.5" /> Features
            </span>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Everything You Need for Your <span className="gradient-text">Optimal Career Move</span>
            </h2>
            <p className="mt-5 text-xl text-slate-600">Tools that give you an unfair advantage in today&apos;s job market.</p>
          </FadeUp>

          <Stagger className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, description, color }) => (
              <StaggerChild key={title}>
                <div className="group card-light p-10">
                  <div className={`mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-xl transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">{title}</h3>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">{description}</p>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══ TEMPLATES — 6 featured, curated section ═══ */}
      <section id="templates" className="relative section-darker py-36">
        <div className="divider-wave divider-wave-dark-top" />
        <div className="orb orb-blue absolute -left-40 top-1/3 h-[600px] w-[600px] animate-pulse-glow" />
        <div className="orb orb-violet absolute -right-40 top-2/3 h-[500px] w-[500px] animate-pulse-glow [animation-delay:2s]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">Templates</span>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Professional Templates for <span className="gradient-text">Every Industry</span>
            </h2>
            <p className="mt-5 text-xl text-slate-400">Recruiter-approved designs built for ATS compatibility.</p>
          </FadeUp>

          <Stagger className="mt-12 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {featuredTemplates.map((t) => (
              t && (
                <StaggerChild key={t.id}>
                  <TemplatePreviewCard templateId={t.id} onPreview={setPreviewTemplateId} />
                </StaggerChild>
              )
            ))}
          </Stagger>

          <FadeUp className="mt-16 text-center">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2.5 rounded-2xl border-2 border-white/[0.12] bg-white/[0.04] px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:bg-white/[0.1] hover:border-white/[0.25] hover:-translate-y-[2px]"
            >
              Explore 55 ATS-friendly templates <ArrowRight className="h-5 w-5" />
            </Link>
          </FadeUp>
        </div>
      </section>

      <TemplatePreviewModal templateId={previewTemplateId} onClose={() => setPreviewTemplateId(null)} />

      {/* ═══ PRICING — Pure white, strong cards ═══ */}
      <section id="pricing" className="relative section-light py-36">
        <div className="divider-wave divider-wave-dark-top" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">Pricing</span>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h2>
            <p className="mt-5 text-xl text-slate-600">Start for free. Upgrade when you&apos;re ready.</p>
          </FadeUp>

          <div className="mx-auto mt-20 grid max-w-4xl gap-10 lg:grid-cols-2">
            <FadeUp delay={0.1}>
              <div className="card-light p-10">
                <h3 className="text-2xl font-bold text-slate-900">Free</h3>
                <p className="mt-2 text-base text-slate-500">Perfect for getting started</p>
                <p className="mt-8">
                  <span className="text-6xl font-black text-slate-900">$0</span>
                  <span className="ml-2 text-base text-slate-500">/month</span>
                </p>
                <ul className="mt-10 space-y-4">
                  {freePlanFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-4 text-base text-slate-700">
                      <Check className="h-5 w-5 flex-shrink-0 text-brand-500" />{f}
                    </li>
                  ))}
                </ul>
                <AuthCTA
                  guestHref="/signup"
                  authHref="/templates"
                  className="mt-10 flex h-14 w-full items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-base font-bold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50 hover:-translate-y-[1px]"
                >
                  Get Started Free
                </AuthCTA>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="gradient-border relative rounded-[1.5rem] p-10 bg-white">
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-5 py-2 text-xs font-bold text-white shadow-glow">Most Popular</span>
                <h3 className="text-2xl font-bold text-slate-900">Pro</h3>
                <p className="mt-2 text-base text-slate-500">Everything you need to land the job</p>
                <p className="mt-8">
                  <span className="text-6xl font-black text-slate-900">${PRICING.proMonthly}</span>
                  <span className="ml-2 text-base text-slate-500">/month</span>
                </p>
                <ul className="mt-10 space-y-4">
                  {proPlanFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-4 text-base text-slate-700">
                      <Check className="h-5 w-5 flex-shrink-0 text-brand-500" />{f}
                    </li>
                  ))}
                </ul>
                <AuthCTA
                  guestHref="/signup"
                  authHref="/pricing"
                  className="mt-10 flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-base font-bold text-white shadow-neon transition-all duration-300 hover:shadow-neon-hover hover:-translate-y-[2px]"
                >
                  Upgrade to Pro
                </AuthCTA>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══ FAQ — Clean, elevated ═══ */}
      <section id="faq" className="relative section-light py-36">
        <div className="divider-wave divider-wave-top" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">FAQ</span>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Questions & Answers</h2>
          </FadeUp>

          <FadeUp delay={0.1} className="mt-16 divide-y divide-slate-200 rounded-3xl border-2 border-slate-200 bg-white shadow-card">
            {faqItems.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </FadeUp>
        </div>
      </section>

      {/* ═══ FINAL CTA — Rich gradient, strong glow ═══ */}
      <section className="relative overflow-hidden section-dark py-36">
        <div className="divider-wave divider-wave-dark-top" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/60 via-dark to-accent-violet/15" />
        <div className="orb orb-blue absolute left-1/4 top-0 h-[700px] w-[700px] animate-pulse-glow" />
        <div className="orb orb-violet absolute right-1/4 bottom-0 h-[600px] w-[600px] animate-pulse-glow [animation-delay:2s]" />
        <div className="absolute inset-0 bg-grid-dark bg-grid" />

        <FadeUp className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ready to Build Your <span className="gradient-text">Perfect Resume</span>?
          </h2>
          <p className="mt-6 text-xl text-slate-400">
            Start free, refine with AI, and export when you&apos;re ready — no inflated claims, just the tools.
          </p>
          <AuthCTA
            guestHref="/signup"
            authHref="/templates"
            className="mt-10 inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl bg-white px-10 text-base font-bold text-slate-900 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.4)] transition-all duration-300 hover:bg-slate-100 hover:shadow-[0_30px_60px_-16px_rgba(0,0,0,0.5)] hover:-translate-y-[2px]"
          >
            Get Started Free <ArrowRight className="h-5 w-5" />
          </AuthCTA>
        </FadeUp>
      </section>

      <Footer />
    </div>
  );
}
