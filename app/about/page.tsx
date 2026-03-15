import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Sparkles,
  Target,
  FileText,
  Zap,
  Shield,
  Brain,
  Heart,
  Users,
  GraduationCap,
  Briefcase,
  Code,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "About | ResumeAI",
  description:
    "Learn about ResumeAI — the AI-powered resume builder helping job seekers land their dream jobs.",
};

const aiFeatures = [
  {
    Icon: Sparkles,
    title: "Smart Bullet Points",
    description:
      "AI analyzes your experience and generates impactful, quantified bullet points that highlight your achievements.",
  },
  {
    Icon: Target,
    title: "Keyword Matching",
    description:
      "Paste a job description and instantly see which keywords you're missing — then let AI weave them in naturally.",
  },
  {
    Icon: FileText,
    title: "Cover Letter Writer",
    description:
      "Generate tailored cover letters that complement your resume and speak directly to the role you're applying for.",
  },
  {
    Icon: Zap,
    title: "Resume Scoring",
    description:
      "Get an instant ATS compatibility score with actionable suggestions to improve your resume before you apply.",
  },
];

const audiences = [
  {
    Icon: GraduationCap,
    title: "Students & New Grads",
    description:
      "Turn coursework, internships, and projects into a compelling resume — even with limited work experience.",
  },
  {
    Icon: Briefcase,
    title: "Career Changers",
    description:
      "Reframe your transferable skills for a new industry with AI-powered suggestions that bridge the gap.",
  },
  {
    Icon: Users,
    title: "Experienced Professionals",
    description:
      "Condense years of experience into a focused, results-driven resume that highlights your greatest impact.",
  },
  {
    Icon: Code,
    title: "Freelancers & Contractors",
    description:
      "Showcase diverse projects and clients in a polished format that demonstrates the breadth of your expertise.",
  },
];

const values = [
  {
    Icon: Shield,
    title: "Privacy First",
    description:
      "Your data is yours. We encrypt everything, never sell your information, and you can delete your account at any time.",
  },
  {
    Icon: Brain,
    title: "AI as a Tool",
    description:
      "AI assists — you decide. Every suggestion is a starting point. You're always in control of your resume.",
  },
  {
    Icon: Heart,
    title: "Accessible to All",
    description:
      "Our free plan is available forever. Everyone deserves access to professional resume-building tools, regardless of budget.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
        <div className="relative mx-auto max-w-4xl px-4 pb-20 pt-20 text-center sm:px-6 md:pb-28 md:pt-28 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Our Story
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            About{" "}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              ResumeAI
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
            We&apos;re on a mission to help everyone create the perfect resume.
            No more staring at a blank page — just smart tools that get you
            hired faster.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Our Story
              </span>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                We Built ResumeAI Because Writing a Resume Shouldn&apos;t Take
                Hours
              </h2>
              <p className="mt-6 text-base leading-relaxed text-gray-600">
                We&apos;ve all been there — staring at a blank document, trying
                to condense years of experience into a single page. Rewording
                the same bullet points over and over. Wondering if a recruiter
                will even see your application.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-600">
                ResumeAI was born from that frustration. Our AI-powered platform
                helps job seekers create professional, ATS-optimized resumes in
                minutes — not hours. Whether you&apos;re a first-time applicant
                or a seasoned professional, our tools meet you where you are and
                help you put your best foot forward.
              </p>
            </div>
            <div className="relative" aria-hidden="true">
              <div className="rounded-2xl border border-gray-200/60 bg-gradient-to-br from-blue-50 to-white p-10 shadow-lg">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <Zap className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="h-3 w-32 rounded bg-gray-900" />
                      <div className="mt-2 h-2 w-24 rounded bg-gray-300" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 w-full rounded bg-gray-200" />
                    <div className="h-2.5 w-5/6 rounded bg-gray-200" />
                    <div className="h-2.5 w-4/6 rounded bg-gray-200" />
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 rounded-full bg-blue-100 px-4" />
                    <div className="h-8 rounded-full bg-blue-100 px-6" />
                    <div className="h-8 rounded-full bg-blue-100 px-3" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-2.5 w-full rounded bg-gray-200" />
                    <div className="h-2.5 w-3/4 rounded bg-gray-200" />
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-400/20 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How AI Helps */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              AI-Powered
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How AI Supercharges Your Resume
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our AI doesn&apos;t just fill in blanks — it understands what
              recruiters and ATS systems look for.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {aiFeatures.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-blue-200 hover:shadow-lg hover:shadow-blue-50"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Built For You
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Who It&apos;s For
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              No matter where you are in your career, ResumeAI has your back.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {audiences.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-8 text-center transition-all hover:shadow-lg"
              >
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              What We Stand For
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Our Values
            </h2>
          </div>

          <div className="mx-auto mt-16 grid max-w-5xl gap-8 md:grid-cols-3">
            {values.map(({ Icon, title, description }) => (
              <div
                key={title}
                className="rounded-2xl border border-gray-200 bg-white p-8 text-center transition-all hover:shadow-lg"
              >
                <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-blue-600 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(255,255,255,0.15),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Build Your Resume?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Pick from 20 professional templates and let AI do the heavy lifting.
            Your dream job is one resume away.
          </p>
          <Link
            href="/templates"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50"
          >
            Browse Templates
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
