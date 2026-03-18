import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Sparkles, Target, FileText, Zap, Shield, Brain, Heart, Users, GraduationCap, Briefcase, Code, ArrowRight } from "lucide-react";

export const metadata: Metadata = { title: "About | OptimaCV", description: "Learn about OptimaCV — the AI-powered resume builder helping job seekers land their dream jobs." };

const aiFeatures = [
  { Icon: Sparkles, title: "Smart Bullet Points", description: "AI analyzes your experience and generates impactful, quantified bullet points that highlight your achievements." },
  { Icon: Target, title: "Keyword Matching", description: "Paste a job description and instantly see which keywords you're missing — then let AI weave them in naturally." },
  { Icon: FileText, title: "Cover Letter Writer", description: "Generate tailored cover letters that complement your resume and speak directly to the role you're applying for." },
  { Icon: Zap, title: "Resume Scoring", description: "Get an instant ATS compatibility score with actionable suggestions to improve your resume before you apply." },
];

const audiences = [
  { Icon: GraduationCap, title: "Students & New Grads", description: "Turn coursework, internships, and projects into a compelling resume — even with limited work experience." },
  { Icon: Briefcase, title: "Career Changers", description: "Reframe your transferable skills for a new industry with AI-powered suggestions that bridge the gap." },
  { Icon: Users, title: "Experienced Professionals", description: "Condense years of experience into a focused, results-driven resume that highlights your greatest impact." },
  { Icon: Code, title: "Freelancers & Contractors", description: "Showcase diverse projects and clients in a polished format that demonstrates the breadth of your expertise." },
];

const values = [
  { Icon: Shield, title: "Privacy First", description: "Your data is yours. We encrypt everything, never sell your information, and you can delete your account at any time." },
  { Icon: Brain, title: "AI as a Tool", description: "AI assists — you decide. Every suggestion is a starting point. You're always in control of your resume." },
  { Icon: Heart, title: "Accessible to All", description: "Our free plan is available forever. Everyone deserves access to professional resume-building tools, regardless of budget." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <section className="relative overflow-hidden py-24">
        <div className="orb orb-blue absolute top-0 left-1/3 h-[500px] w-[500px] animate-pulse-glow" />
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300"><Sparkles className="h-3.5 w-3.5" /> Our Story</span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">About <span className="gradient-text">OptimaCV</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400">We&apos;re on a mission to help everyone create the perfect resume. No more staring at a blank page — just smart tools that get you hired faster.</p>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-brand-400">Our Story</span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">We Built OptimaCV Because Writing a Resume Shouldn&apos;t Take Hours</h2>
              <p className="mt-6 text-base leading-relaxed text-slate-400">We&apos;ve all been there — staring at a blank document, trying to condense years of experience into a single page. Rewording the same bullet points over and over.</p>
              <p className="mt-4 text-base leading-relaxed text-slate-400">OptimaCV was born from that frustration. Our AI-powered platform helps job seekers create professional, ATS-optimized resumes in minutes — not hours.</p>
            </div>
            <div className="relative" aria-hidden="true">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-10 shadow-glass backdrop-blur-sm">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400"><Zap className="h-6 w-6" /></div>
                    <div><div className="h-3 w-32 rounded bg-white/20" /><div className="mt-2 h-2 w-24 rounded bg-white/10" /></div>
                  </div>
                  <div className="space-y-2"><div className="h-2.5 w-full rounded bg-white/[0.06]" /><div className="h-2.5 w-5/6 rounded bg-white/[0.06]" /><div className="h-2.5 w-4/6 rounded bg-white/[0.06]" /></div>
                  <div className="flex gap-2"><div className="h-8 rounded-full bg-brand-500/10 px-4" /><div className="h-8 rounded-full bg-brand-500/10 px-6" /><div className="h-8 rounded-full bg-brand-500/10 px-3" /></div>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-brand-500/20 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-cyan-500/15 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative border-t border-white/[0.04] py-24">
        <div className="orb orb-violet absolute right-0 top-1/4 h-[400px] w-[400px] animate-pulse-glow" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-400">AI-Powered</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">How AI Supercharges Your Resume</h2>
            <p className="mt-4 text-lg text-slate-400">Our AI doesn&apos;t just fill in blanks — it understands what recruiters and ATS systems look for.</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {aiFeatures.map(({ Icon, title, description }) => (
              <div key={title} className="glass-card p-8 group">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 transition-colors group-hover:bg-brand-500 group-hover:text-white"><Icon className="h-6 w-6" /></div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-400">Built For You</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Who It&apos;s For</h2>
            <p className="mt-4 text-lg text-slate-400">No matter where you are in your career, OptimaCV has your back.</p>
          </div>
          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map(({ Icon, title, description }) => (
              <div key={title} className="glass-card p-8 text-center">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400"><Icon className="h-7 w-7" /></div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-brand-400">What We Stand For</span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Our Values</h2>
          </div>
          <div className="mx-auto mt-16 grid max-w-5xl gap-6 md:grid-cols-3">
            {values.map(({ Icon, title, description }) => (
              <div key={title} className="glass-card p-8 text-center">
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-400"><Icon className="h-7 w-7" /></div>
                <h3 className="text-lg font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-dark to-accent-violet/20" />
        <div className="orb orb-blue absolute left-1/3 top-0 h-[500px] w-[500px] animate-pulse-glow" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to Build Your Resume?</h2>
          <p className="mt-4 text-lg text-slate-400">Pick from 20 professional templates and let AI do the heavy lifting.</p>
          <Link href="/templates" className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-dark shadow-lg transition-all hover:bg-slate-100 hover:-translate-y-[1px]">Browse Templates <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
