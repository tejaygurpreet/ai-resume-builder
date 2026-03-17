"use client";

import { useState, useMemo } from "react";
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
  Users,
  FileText,
  TrendingUp,
  LayoutTemplate,
} from "lucide-react";
import { HeroProductPreview } from "@/components/landing/hero-product-preview";
import { AnimatedStat } from "@/components/landing/animated-counter";
import { TemplatePreviewCard } from "@/components/landing/template-preview-card";
import { TemplatePreviewModal } from "@/components/landing/template-preview-modal";
import { templateRegistry } from "@/components/resume/templates";
import { cn } from "@/lib/utils";

const features = [
  { Icon: Sparkles, title: "AI-Powered Writing", description: "AI crafts compelling bullet points and summaries tailored to your experience and target role.", color: "from-blue-500 to-cyan-400" },
  { Icon: FileCheck, title: "ATS-Friendly Templates", description: "Every template passes Applicant Tracking Systems so your resume reaches real humans.", color: "from-violet-500 to-purple-400" },
  { Icon: Eye, title: "Real-Time Preview", description: "See changes instantly as you type. What you see is what recruiters will see.", color: "from-emerald-500 to-teal-400" },
  { Icon: Download, title: "Multi-Format Export", description: "Download as PDF, DOCX, TXT, JSON, or Markdown — perfectly formatted.", color: "from-amber-500 to-orange-400" },
  { Icon: GripVertical, title: "Drag & Drop Editor", description: "Rearrange sections effortlessly with an intuitive drag-and-drop interface.", color: "from-pink-500 to-rose-400" },
  { Icon: Target, title: "Job Keyword Matching", description: "Paste a job description and see which keywords are missing from your resume.", color: "from-indigo-500 to-blue-400" },
];

const testimonials = [
  { quote: "ResumeAI helped me land interviews at three FAANG companies within two weeks. The AI suggestions were spot-on!", name: "Sarah Chen", title: "Software Engineer at Google", stars: 5 },
  { quote: "I went from getting zero callbacks to five interview requests in one week. The ATS optimization made all the difference.", name: "Marcus Johnson", title: "Marketing Manager", stars: 5 },
  { quote: "As a career changer, I struggled to frame my experience. ResumeAI rewrote my bullets perfectly for my new field.", name: "Emily Rodriguez", title: "UX Designer at Shopify", stars: 5 },
];

const faqItems = [
  { question: "What is ResumeAI?", answer: "ResumeAI is an AI-powered resume builder that helps you create professional, ATS-optimized resumes in minutes using advanced language models." },
  { question: "Is it free to use?", answer: "Yes! Our free plan includes AI-powered writing, 5 templates, and 3 exports per month. Upgrade to Pro for $7/month for unlimited access." },
  { question: "Are the resumes ATS-compatible?", answer: "Absolutely. Every template uses clean formatting, standard section headings, and proper document structure to pass ATS systems." },
  { question: "How do you handle my data?", answer: "Your privacy is our top priority. All data is encrypted. We never sell your information. Delete your account and data at any time." },
  { question: "Can I cancel anytime?", answer: "Yes. Cancel your Pro subscription at any time. Keep access until the end of your billing period." },
];

/** 6 featured templates for homepage - one per major category */
const FEATURED_TEMPLATE_IDS = ["modern", "professional", "minimal", "tech", "creative", "executive"] as const;

const freePlanFeatures = ["AI resume builder", "3 AI generations per resume", "5 basic templates", "3 exports per month", "ATS scoring"];
const proPlanFeatures = ["Unlimited AI generations", "All 50+ premium templates", "Unlimited exports — no ads", "Job description tailoring", "Cover letter generator", "ATS score analysis", "Priority support"];

const stats = [
  { value: 50, suffix: "K+", label: "Resumes Created", icon: FileText },
  { value: 89, suffix: "%", label: "Interview Rate", icon: TrendingUp },
  { value: 50, suffix: "+", label: "ATS Templates", icon: LayoutTemplate },
  { value: 4.9, suffix: "★", label: "User Rating", icon: Star },
];

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

export default function Home() {
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
            <FadeUp>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/15 px-5 py-2 text-xs font-bold uppercase tracking-wider text-brand-300 backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                Powered by GPT-4o
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-4 text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-7xl lg:leading-[1.05]">
                Resumes That{" "}
                <span className="gradient-text">Get You Hired</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-6 max-w-xl text-xl leading-relaxed text-slate-400">
                AI writes your content, optimizes for ATS, and formats everything. Stop getting ghosted — start getting interviews.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <AuthCTA
                  guestHref="/signup"
                  authHref="/templates"
                  className="btn-premium relative inline-flex h-14 items-center justify-center gap-2.5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#6366F1] bg-[length:200%_100%] bg-[position:0%_50%] px-8 text-base font-bold text-white shadow-[0_0_24px_-8px_rgba(99,102,241,0.5)] ring-1 ring-white/20 transition-all duration-300 hover:scale-[1.03] hover:bg-[position:100%_50%] hover:shadow-[0_0_40px_-6px_rgba(99,102,241,0.6),0_0_0_1px_rgba(139,92,246,0.4)] hover:ring-white/30 active:scale-[0.99]"
                >
                  Start Building Free
                  <ArrowRight className="h-5 w-5" />
                </AuthCTA>
                <Link
                  href="/#templates"
                  className="inline-flex h-14 items-center justify-center gap-2.5 rounded-2xl border-2 border-white/20 bg-white/[0.03] px-8 text-base font-bold text-slate-300 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08] hover:border-white/30 hover:text-white hover:-translate-y-[1px]"
                >
                  See Templates
                </Link>
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 lg:justify-start">
                <span className="flex items-center gap-2"><Shield className="h-4 w-4 text-slate-600" /> No credit card</span>
                <span className="h-4 w-px bg-white/15" />
                <span className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-600" /> 50K+ users</span>
                <span className="h-4 w-px bg-white/15" />
                <span className="flex items-center gap-2"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 rating</span>
              </div>
            </FadeUp>
          </div>

          {/* Right: Real resume preview with ATS badge & AI suggestions */}
          <FadeUp delay={0.25} className="relative flex-1 lg:flex-[1.1]">
            <HeroProductPreview />
          </FadeUp>
        </div>
      </section>

      {/* ═══ TRUST SIGNALS — Below hero ═══ */}
      <section className="relative z-10 px-4 py-8 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="mx-auto max-w-4xl rounded-2xl border border-white/[0.06] bg-white/[0.02] px-8 py-6 shadow-[0_2px_16px_-8px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <p className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-slate-500">
              Trusted by job seekers worldwide
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {testimonials.slice(0, 3).map(({ name, title }) => (
                <div key={name} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-500/30 to-accent-violet/30 text-sm font-bold text-white ring-2 ring-white/10">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{name}</p>
                    <p className="text-xs text-slate-500">{title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ═══ STATS — Animated counters, glowing icons ═══ */}
      <section className="relative -mt-12 z-10 px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="mx-auto max-w-5xl rounded-3xl glass p-10 shadow-[0_2px_24px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)_inset]">
            <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
              {stats.map((stat, i) => (
                <AnimatedStat
                  key={stat.label}
                  value={stat.value}
                  suffix={stat.suffix}
                  label={stat.label}
                  icon={<stat.icon className="h-5 w-5" />}
                  delay={i * 0.1}
                />
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ═══ FEATURES — Pure white section, strong contrast ═══ */}
      <section id="features" className="relative section-light py-36">
        <div className="divider-wave divider-wave-top" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-700">
              <Zap className="h-3.5 w-3.5" /> Features
            </span>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Everything You Need to <span className="gradient-text">Land the Job</span>
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
              Explore All 50+ Templates <ArrowRight className="h-5 w-5" />
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
                  <span className="text-6xl font-black text-slate-900">$7</span>
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

      {/* ═══ TESTIMONIALS — Darker, elevated cards ═══ */}
      <section className="relative section-darker py-36">
        <div className="divider-wave divider-wave-dark-top" />
        <div className="divider-wave divider-wave-dark-bottom" />
        <div className="orb orb-violet absolute -right-40 top-1/4 h-[500px] w-[500px] animate-pulse-glow" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-brand-300">Testimonials</span>
            <h2 className="mt-6 text-4xl font-black tracking-tight text-white sm:text-5xl">
              Loved by Job Seekers <span className="gradient-text">Worldwide</span>
            </h2>
          </FadeUp>

          <Stagger className="mt-20 grid gap-8 md:grid-cols-3">
            {testimonials.map(({ quote, name, title, stars }) => (
              <StaggerChild key={name}>
                <div className="glass-card p-10">
                  <div className="mb-5 flex gap-1">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-base leading-relaxed text-slate-400">&ldquo;{quote}&rdquo;</p>
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-violet text-base font-bold text-white shadow-lg">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-white">{name}</p>
                      <p className="text-sm text-slate-500">{title}</p>
                    </div>
                  </div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
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
            Join thousands of job seekers who landed their dream jobs with ResumeAI.
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
