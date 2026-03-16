import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AuthCTA } from "@/components/auth-cta";
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
} from "lucide-react";

/* ───────── static data ───────── */

const features = [
  {
    Icon: Sparkles,
    title: "AI-Powered Writing",
    description:
      "Let AI craft compelling bullet points and summaries tailored to your experience and target role.",
  },
  {
    Icon: FileCheck,
    title: "ATS-Friendly Templates",
    description:
      "Every template is optimized to pass Applicant Tracking Systems so your resume reaches real humans.",
  },
  {
    Icon: Eye,
    title: "Real-Time Preview",
    description:
      "See changes instantly as you type. What you see is exactly what recruiters will see.",
  },
  {
    Icon: Download,
    title: "One-Click PDF Export",
    description:
      "Download a perfectly formatted PDF ready to send to employers — no extra software needed.",
  },
  {
    Icon: GripVertical,
    title: "Drag & Drop Editor",
    description:
      "Rearrange sections effortlessly with an intuitive drag-and-drop interface built for speed.",
  },
  {
    Icon: Target,
    title: "Job Keyword Matching",
    description:
      "Paste a job description and instantly see which keywords are missing from your resume.",
  },
];

const landingTemplates = [
  { name: "Modern", key: "modern", from: "from-blue-500", to: "to-cyan-400" },
  { name: "Professional", key: "professional", from: "from-gray-700", to: "to-gray-500" },
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
      "ResumeAI is an AI-powered resume builder that helps you create professional, ATS-optimized resumes in minutes. Our platform uses advanced language models to suggest impactful bullet points, match job keywords, and ensure your resume stands out to both humans and automated screening systems.",
  },
  {
    question: "Is it free to use?",
    answer:
      "Yes! Our free plan includes AI-powered writing, 5 templates, and 3 exports per month. For unlimited exports, job tailoring, cover letter generation, and all 20+ templates, upgrade to Pro for $7/month.",
  },
  {
    question: "Are the resumes ATS-compatible?",
    answer:
      "Absolutely. Every template is built from the ground up to be ATS-friendly. We use clean formatting, standard section headings, and proper document structure to ensure your resume passes through Applicant Tracking Systems without issues.",
  },
  {
    question: "How do you handle my data?",
    answer:
      "Your privacy is our top priority. All data is encrypted in transit and at rest. We never sell your personal information or share it with third parties. You can delete your account and all associated data at any time from your dashboard.",
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer:
      "Yes, you can cancel your Pro subscription at any time with no questions asked. You will continue to have access to Pro features until the end of your current billing period. After that, your account will revert to the free plan.",
  },
];

const freePlanFeatures = [
  "AI resume builder",
  "3 AI generations per resume",
  "5 basic templates",
  "3 exports per month",
  "PDF, DOCX, TXT, JSON, MD export",
];

const proPlanFeatures = [
  "Unlimited AI generations",
  "All 20+ premium templates",
  "Unlimited exports — no ads",
  "Job description tailoring",
  "Cover letter generator",
  "ATS score analysis",
  "Custom color themes",
];

/* ───────── helper components (server) ───────── */

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-base font-medium text-gray-900 transition-colors hover:text-blue-600">
        {question}
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-5 text-sm leading-relaxed text-gray-600">
        {answer}
      </div>
    </details>
  );
}

/* ───────── page ───────── */

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-12 px-4 pb-24 pt-20 sm:px-6 md:flex-row md:pb-32 md:pt-28 lg:px-8">
          {/* copy */}
          <div className="flex-1 text-center md:text-left">
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              <Sparkles className="h-3.5 w-3.5" />
              Powered by AI
            </span>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Build Your Perfect{" "}
              <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Resume with AI
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
              Create professional, ATS-friendly resumes in minutes with our
              AI-powered builder. Stand out from the crowd and land your dream
              job.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
              <AuthCTA
                guestHref="/signup"
                authHref="/templates"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                Start Building Free
                <ArrowRight className="h-4 w-4" />
              </AuthCTA>
              <Link
                href="/#templates"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-6 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
              >
                See Templates
              </Link>
            </div>

            <p className="mt-4 text-xs text-gray-500">
              No credit card required · Free forever plan available
            </p>
          </div>

          {/* resume mockup illustration */}
          <div className="relative flex-1" aria-hidden="true">
            <div className="mx-auto w-full max-w-sm">
              <div className="relative rounded-2xl border border-gray-200/60 bg-white p-8 shadow-2xl shadow-gray-200/60">
                <div className="mb-6 flex items-center gap-4">
                  <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-gray-900" />
                    <div className="h-3 w-1/2 rounded bg-gray-300" />
                  </div>
                </div>
                <div className="mb-5 space-y-2">
                  <div className="h-3 w-1/3 rounded bg-blue-500" />
                  <div className="h-2.5 w-full rounded bg-gray-200" />
                  <div className="h-2.5 w-5/6 rounded bg-gray-200" />
                  <div className="h-2.5 w-4/6 rounded bg-gray-200" />
                </div>
                <div className="mb-5 space-y-2">
                  <div className="h-3 w-1/4 rounded bg-blue-500" />
                  <div className="h-2.5 w-full rounded bg-gray-200" />
                  <div className="h-2.5 w-5/6 rounded bg-gray-200" />
                  <div className="h-2.5 w-3/6 rounded bg-gray-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-2/5 rounded bg-blue-500" />
                  <div className="flex gap-2">
                    <div className="h-6 w-16 rounded-full bg-blue-100" />
                    <div className="h-6 w-20 rounded-full bg-blue-100" />
                    <div className="h-6 w-14 rounded-full bg-blue-100" />
                  </div>
                </div>
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-blue-400/20 blur-2xl" />
                <div className="absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Features
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything You Need to Land the Job
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Our tools are designed to give you an unfair advantage in
              today&apos;s competitive job market.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ Icon, title, description }) => (
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

      {/* ── TEMPLATES ── */}
      <section id="templates" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Templates
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Professional Templates for Every Industry
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose from our curated collection of recruiter-approved
              templates.
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {landingTemplates.map(({ name, key, from, to }) => (
              <div
                key={name}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all hover:shadow-lg"
              >
                <div
                  className={`flex h-56 items-end bg-gradient-to-br ${from} ${to} p-5`}
                >
                  <div className="w-full rounded-t-lg bg-white/90 px-4 pb-0 pt-4 shadow-lg backdrop-blur">
                    <div className="mb-3 flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gray-200" />
                      <div className="space-y-1">
                        <div className="h-2.5 w-20 rounded bg-gray-300" />
                        <div className="h-2 w-14 rounded bg-gray-200" />
                      </div>
                    </div>
                    <div className="space-y-1.5 pb-2">
                      <div className="h-2 w-full rounded bg-gray-200" />
                      <div className="h-2 w-4/5 rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-5">
                  <span className="font-semibold text-gray-900">{name}</span>
                  <AuthCTA
                    guestHref="/signup"
                    authHref="/templates"
                    className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    Use Template
                    <ArrowRight className="h-3 w-3" />
                  </AuthCTA>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <AuthCTA
              guestHref="/templates"
              authHref="/templates"
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-6 py-3 text-sm font-semibold text-blue-700 transition-all hover:bg-blue-100 hover:shadow-md"
            >
              Browse All 20 Templates
              <ArrowRight className="h-4 w-4" />
            </AuthCTA>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Pricing
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, Transparent Pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start for free — upgrade when you&apos;re ready to unlock the full
              power of AI.
            </p>
          </div>

          <div className="mx-auto mt-16 grid max-w-4xl gap-8 lg:grid-cols-2">
            {/* Free tier */}
            <div className="relative rounded-2xl border border-gray-200 bg-white p-8">
              <h3 className="text-lg font-semibold text-gray-900">Free</h3>
              <p className="mt-1 text-sm text-gray-500">
                Perfect for getting started
              </p>
              <p className="mt-6">
                <span className="text-5xl font-extrabold text-gray-900">
                  $0
                </span>
                <span className="ml-1 text-sm text-gray-500">/month</span>
              </p>
              <ul className="mt-8 space-y-3">
                {freePlanFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <Check className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <AuthCTA
                guestHref="/signup"
                authHref="/templates"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-xl border border-gray-300 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Get Started Free
              </AuthCTA>
            </div>

            {/* Pro tier */}
            <div className="relative rounded-2xl border-2 border-blue-600 bg-white p-8 shadow-lg shadow-blue-100">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-1 text-xs font-semibold text-white">
                Most Popular
              </span>
              <h3 className="text-lg font-semibold text-gray-900">Pro</h3>
              <p className="mt-1 text-sm text-gray-500">
                Everything you need to land the job
              </p>
              <p className="mt-6">
                <span className="text-5xl font-extrabold text-gray-900">
                  $7
                </span>
                <span className="ml-1 text-sm text-gray-500">/month</span>
              </p>
              <ul className="mt-8 space-y-3">
                {proPlanFeatures.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-3 text-sm text-gray-700"
                  >
                    <Check className="h-4 w-4 flex-shrink-0 text-blue-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <AuthCTA
                guestHref="/signup"
                authHref="/pricing"
                className="mt-8 flex h-11 w-full items-center justify-center rounded-xl bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all hover:bg-blue-700"
              >
                Upgrade to Pro
              </AuthCTA>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Testimonials
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Loved by Job Seekers Worldwide
            </h2>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {testimonials.map(({ quote, name, title, stars }) => (
              <div
                key={name}
                className="rounded-2xl border border-gray-200 bg-white p-8"
              >
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-5 w-5 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-gray-700">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-sm font-semibold text-white">
                    {name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {name}
                    </p>
                    <p className="text-xs text-gray-500">{title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-white py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              FAQ
            </span>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 divide-y divide-gray-200 rounded-2xl border border-gray-200">
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

      {/* ── FINAL CTA ── */}
      <section className="relative overflow-hidden bg-blue-600 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_120%,rgba(255,255,255,0.15),transparent)]" />

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Build Your Perfect Resume?
          </h2>
          <p className="mt-4 text-lg text-blue-100">
            Join thousands of job seekers who have already landed their dream
            jobs with ResumeAI. Start building for free today.
          </p>
          <AuthCTA
            guestHref="/signup"
            authHref="/templates"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-white px-8 text-sm font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </AuthCTA>
        </div>
      </section>

      <Footer />
    </div>
  );
}
