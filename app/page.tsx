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
  Users,
} from "lucide-react";

const features = [
  {
    Icon: Sparkles,
    title: "AI-Powered Writing",
    description: "AI crafts compelling bullet points and summaries tailored to your experience and target role.",
    color: "from-blue-500 to-cyan-400",
  },
  {
    Icon: FileCheck,
    title: "ATS-Friendly Templates",
    description: "Every template passes Applicant Tracking Systems so your resume reaches real humans.",
    color: "from-violet-500 to-purple-400",
  },
  {
    Icon: Eye,
    title: "Real-Time Preview",
    description: "See changes instantly as you type. What you see is what recruiters will see.",
    color: "from-emerald-500 to-teal-400",
  },
  {
    Icon: Download,
    title: "Multi-Format Export",
    description: "Download as PDF, DOCX, TXT, JSON, or Markdown — perfectly formatted.",
    color: "from-amber-500 to-orange-400",
  },
  {
    Icon: GripVertical,
    title: "Drag & Drop Editor",
    description: "Rearrange sections effortlessly with an intuitive drag-and-drop interface.",
    color: "from-pink-500 to-rose-400",
  },
  {
    Icon: Target,
    title: "Job Keyword Matching",
    description: "Paste a job description and see which keywords are missing from your resume.",
    color: "from-indigo-500 to-blue-400",
  },
];

const landingTemplates = [
  { name: "Modern", from: "from-blue-600", to: "to-cyan-500" },
  { name: "Professional", from: "from-slate-600", to: "to-slate-400" },
  { name: "Minimal", from: "from-emerald-600", to: "to-teal-500" },
  { name: "Executive", from: "from-amber-600", to: "to-orange-500" },
  { name: "Creative", from: "from-purple-600", to: "to-pink-500" },
  { name: "Elegant", from: "from-yellow-600", to: "to-amber-500" },
  { name: "Timeline", from: "from-teal-600", to: "to-cyan-500" },
  { name: "Bold", from: "from-red-600", to: "to-orange-500" },
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

const freePlanFeatures = ["AI resume builder", "3 AI generations per resume", "5 basic templates", "3 exports per month", "ATS scoring"];
const proPlanFeatures = ["Unlimited AI generations", "All 20+ premium templates", "Unlimited exports — no ads", "Job description tailoring", "Cover letter generator", "ATS score analysis", "Priority support"];

const stats = [
  { value: "50K+", label: "Resumes Created" },
  { value: "89%", label: "Interview Rate" },
  { value: "20+", label: "ATS Templates" },
  { value: "4.9★", label: "User Rating" },
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
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ═══ HERO (Dark) ═══ */}
      <section className="relative overflow-hidden section-dark">
        <div className="absolute inset-0 bg-grid-dark bg-grid" />
        <div className="orb orb-blue absolute -top-40 left-1/4 h-[600px] w-[600px] animate-pulse-glow" />
        <div className="orb orb-violet absolute -top-20 right-1/4 h-[500px] w-[500px] animate-pulse-glow [animation-delay:2s]" />
        <div className="orb orb-cyan absolute top-1/2 left-1/2 -translate-x-1/2 h-[400px] w-[400px] animate-pulse-glow [animation-delay:4s]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-dark/50 to-dark" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-16 px-4 pb-32 pt-24 sm:px-6 md:flex-row md:pb-40 md:pt-32 lg:px-8">
          <div className="flex-1 text-center md:text-left">
            <FadeUp>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-300 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Powered by GPT-4o
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                Build Resumes That{" "}
                <span className="gradient-text">Actually Get Interviews</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-400">
                AI writes your content, optimizes for ATS, and formats everything beautifully. Stop getting ghosted by recruiters.
              </p>
            </FadeUp>
            <FadeUp delay={0.3}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
                <AuthCTA
                  guestHref="/signup"
                  authHref="/templates"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-7 text-sm font-semibold text-white shadow-neon transition-all duration-300 hover:shadow-glow-lg hover:-translate-y-[1px] active:translate-y-0"
                >
                  Start Building Free
                  <ArrowRight className="h-4 w-4" />
                </AuthCTA>
                <Link
                  href="/#templates"
                  className="inline-flex h-13 items-center justify-center gap-2 rounded-xl border border-white/[0.12] bg-white/[0.04] px-7 text-sm font-semibold text-slate-300 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.2] hover:text-white hover:-translate-y-[1px]"
                >
                  See Templates
                </Link>
              </div>
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="mt-6 flex items-center gap-4 text-xs text-slate-500 md:justify-start justify-center">
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" /> No credit card</span>
                <span className="h-3 w-px bg-white/10" />
                <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> 50K+ users</span>
                <span className="h-3 w-px bg-white/10" />
                <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> 4.9 rating</span>
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.3} className="relative flex-1">
            <div aria-hidden="true" className="mx-auto w-full max-w-sm">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative rounded-2xl border border-white/[0.08] glass p-8 shadow-glass-lg"
              >
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500 to-accent-violet shadow-glow" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded-lg bg-white/20" />
                    <div className="h-3 w-1/2 rounded-lg bg-white/10" />
                  </div>
                </div>
                <div className="mb-5 space-y-2">
                  <div className="h-3 w-1/3 rounded-lg bg-brand-500/50" />
                  <div className="h-2.5 w-full rounded bg-white/[0.06]" />
                  <div className="h-2.5 w-5/6 rounded bg-white/[0.06]" />
                  <div className="h-2.5 w-4/6 rounded bg-white/[0.06]" />
                </div>
                <div className="mb-5 space-y-2">
                  <div className="h-3 w-1/4 rounded-lg bg-brand-500/50" />
                  <div className="h-2.5 w-full rounded bg-white/[0.06]" />
                  <div className="h-2.5 w-5/6 rounded bg-white/[0.06]" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-2/5 rounded-lg bg-brand-500/50" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-brand-500/15 border border-brand-500/20" />
                    <div className="h-6 w-20 rounded-full bg-accent-cyan/15 border border-accent-cyan/20" />
                    <div className="h-6 w-14 rounded-full bg-accent-violet/15 border border-accent-violet/20" />
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                  className="absolute -right-5 -top-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.1] bg-dark-50 shadow-glow"
                >
                  <Sparkles className="h-5 w-5 text-brand-400" />
                </motion.div>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 180 }}
                  className="absolute -left-4 bottom-12 flex items-center gap-2 rounded-xl border border-white/[0.08] glass px-3 py-2"
                >
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20">
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  </div>
                  <span className="text-xs font-medium text-emerald-400">ATS Score: 94</span>
                </motion.div>
              </motion.div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section className="relative -mt-12 z-10 px-4 sm:px-6 lg:px-8">
        <FadeUp>
          <div className="mx-auto max-w-4xl rounded-2xl glass p-6 shadow-glass">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ═══ FEATURES (Light Section) ═══ */}
      <section id="features" className="relative section-light py-32">
        <div className="divider-wave divider-wave-top" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              <Zap className="h-3 w-3" /> Features
            </span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              Everything You Need to <span className="gradient-text">Land the Job</span>
            </h2>
            <p className="mt-4 text-lg text-slate-600">Tools that give you an unfair advantage in today&apos;s job market.</p>
          </FadeUp>

          <Stagger className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, description, color }) => (
              <StaggerChild key={title}>
                <div className="group card-light p-8">
                  <div className={`mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{description}</p>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══ TEMPLATES (Dark Section) ═══ */}
      <section id="templates" className="relative section-darker py-32">
        <div className="divider-wave divider-wave-dark-top" />
        <div className="orb orb-blue absolute left-0 top-1/3 h-[500px] w-[500px] animate-pulse-glow" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">Templates</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Professional Templates for <span className="gradient-text">Every Industry</span>
            </h2>
            <p className="mt-4 text-lg text-slate-400">Recruiter-approved designs built for ATS compatibility.</p>
          </FadeUp>

          <Stagger className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {landingTemplates.map(({ name, from, to }) => (
              <StaggerChild key={name}>
                <div className="group overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 hover:border-white/[0.14] hover:bg-white/[0.05] hover:-translate-y-3 hover:shadow-glass-lg">
                  <div className={`flex h-56 items-end bg-gradient-to-br ${from} ${to} p-4`}>
                    <div className="w-full rounded-t-xl bg-white/95 px-4 pb-0 pt-4 shadow-xl backdrop-blur">
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
                    <span className="text-sm font-semibold text-white">{name}</span>
                    <AuthCTA
                      guestHref="/signup"
                      authHref="/templates"
                      className="inline-flex items-center gap-1 rounded-xl border border-brand-500/25 bg-brand-500/10 px-4 py-2 text-xs font-semibold text-brand-300 transition-all duration-200 group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 group-hover:shadow-glow"
                    >
                      Use <ArrowRight className="h-3 w-3" />
                    </AuthCTA>
                  </div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>

          <FadeUp className="mt-14 text-center">
            <AuthCTA
              guestHref="/templates"
              authHref="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-white/[0.1] bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/[0.08] hover:border-white/[0.18] hover:-translate-y-[1px]"
            >
              Browse All 20+ Templates <ArrowRight className="h-4 w-4" />
            </AuthCTA>
          </FadeUp>
        </div>
      </section>

      {/* ═══ PRICING (Light Section) ═══ */}
      <section id="pricing" className="relative section-light py-32">
        <div className="divider-wave divider-wave-dark-top" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Pricing</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Simple, <span className="gradient-text">Transparent</span> Pricing
            </h2>
            <p className="mt-4 text-lg text-slate-600">Start for free. Upgrade when you&apos;re ready.</p>
          </FadeUp>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
            <FadeUp delay={0.1}>
              <div className="card-light p-8">
                <h3 className="text-xl font-semibold text-slate-900">Free</h3>
                <p className="mt-1 text-sm text-slate-500">Perfect for getting started</p>
                <p className="mt-6">
                  <span className="text-5xl font-extrabold text-slate-900">$0</span>
                  <span className="ml-1.5 text-sm text-slate-500">/month</span>
                </p>
                <ul className="mt-8 space-y-3.5">
                  {freePlanFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                      <Check className="h-4 w-4 flex-shrink-0 text-brand-500" />{f}
                    </li>
                  ))}
                </ul>
                <AuthCTA
                  guestHref="/signup"
                  authHref="/templates"
                  className="mt-8 flex h-12 w-full items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-all duration-300 hover:border-slate-300 hover:bg-slate-50"
                >
                  Get Started Free
                </AuthCTA>
              </div>
            </FadeUp>

            <FadeUp delay={0.2}>
              <div className="gradient-border relative rounded-[1.25rem] p-8 bg-white">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-accent-violet px-4 py-1.5 text-xs font-semibold text-white shadow-glow">Most Popular</span>
                <h3 className="text-xl font-semibold text-slate-900">Pro</h3>
                <p className="mt-1 text-sm text-slate-500">Everything you need to land the job</p>
                <p className="mt-6">
                  <span className="text-5xl font-extrabold text-slate-900">$7</span>
                  <span className="ml-1.5 text-sm text-slate-500">/month</span>
                </p>
                <ul className="mt-8 space-y-3.5">
                  {proPlanFeatures.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-slate-700">
                      <Check className="h-4 w-4 flex-shrink-0 text-brand-500" />{f}
                    </li>
                  ))}
                </ul>
                <AuthCTA
                  guestHref="/signup"
                  authHref="/pricing"
                  className="mt-8 flex h-12 w-full items-center justify-center rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-sm font-semibold text-white shadow-neon transition-all duration-300 hover:shadow-glow-lg"
                >
                  Upgrade to Pro
                </AuthCTA>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS (Dark Section) ═══ */}
      <section className="relative section-darker py-32">
        <div className="divider-wave divider-wave-dark-top" />
        <div className="divider-wave divider-wave-dark-bottom" />
        <div className="orb orb-violet absolute right-0 top-1/4 h-[400px] w-[400px] animate-pulse-glow" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">Testimonials</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Loved by Job Seekers <span className="gradient-text">Worldwide</span>
            </h2>
          </FadeUp>

          <Stagger className="mt-16 grid gap-6 md:grid-cols-3">
            {testimonials.map(({ quote, name, title, stars }) => (
              <StaggerChild key={name}>
                <div className="glass-card p-8">
                  <div className="mb-4 flex gap-0.5">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-slate-400">&ldquo;{quote}&rdquo;</p>
                  <div className="mt-6 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet text-sm font-semibold text-white shadow-lg">
                      {name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{name}</p>
                      <p className="text-xs text-slate-500">{title}</p>
                    </div>
                  </div>
                </div>
              </StaggerChild>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ═══ FAQ (Light Section) ═══ */}
      <section id="faq" className="relative section-light py-32">
        <div className="divider-wave divider-wave-top" />
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">FAQ</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Questions & Answers</h2>
          </FadeUp>

          <FadeUp delay={0.1} className="mt-12 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-card">
            {faqItems.map((item) => (
              <FAQItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </FadeUp>
        </div>
      </section>

      {/* ═══ FINAL CTA (Dark) ═══ */}
      <section className="relative overflow-hidden section-dark py-32">
        <div className="divider-wave divider-wave-dark-top" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950/50 via-dark to-accent-violet/10" />
        <div className="orb orb-blue absolute left-1/3 top-0 h-[600px] w-[600px] animate-pulse-glow" />
        <div className="orb orb-violet absolute right-1/4 bottom-0 h-[500px] w-[500px] animate-pulse-glow [animation-delay:2s]" />
        <div className="absolute inset-0 bg-grid-dark bg-grid" />

        <FadeUp className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Ready to Build Your <span className="gradient-text">Perfect Resume</span>?
          </h2>
          <p className="mt-4 text-lg text-slate-400">
            Join thousands of job seekers who landed their dream jobs with ResumeAI.
          </p>
          <AuthCTA
            guestHref="/signup"
            authHref="/templates"
            className="mt-8 inline-flex h-13 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-slate-900 shadow-xl transition-all duration-300 hover:bg-slate-100 hover:shadow-2xl hover:-translate-y-[1px]"
          >
            Get Started Free <ArrowRight className="h-4 w-4" />
          </AuthCTA>
        </FadeUp>
      </section>

      <Footer />
    </div>
  );
}
