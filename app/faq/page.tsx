import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChevronDown, Sparkles, ArrowRight } from "lucide-react";
import { PLANS_COPY, PRICING } from "@/lib/plans";

export const metadata: Metadata = { title: "FAQ | OptimaCV", description: "Frequently asked questions about OptimaCV's AI resume builder, pricing, exports, and data privacy." };

const faqItems = [
  { question: "How does the AI resume builder work?", answer: "Getting started is simple. First, choose from one of our 55 professionally designed, ATS-friendly templates. Then enter your information — work experience, education, skills, and more. As you type, our AI suggests compelling bullet points, rewrites summaries, and optimizes your wording for impact. When you're happy with the result, export your resume as a PDF, DOCX, TXT, or JSON file. The entire process takes just minutes, not hours." },
  {
    question: "Is OptimaCV free to use?",
    answer: `Yes! Free: $0/month – ${PLANS_COPY.free.features.join("; ")}. Pro: $${PRICING.proMonthly}/month or $${PRICING.proAnnual}/year or $${PRICING.proLifetime} lifetime – unlimited AI and ad-free exports. Export Access: $${PRICING.exportOneTime} one-time – unlimited exports, no ads, no AI.`,
  },
  { question: "What export formats are available?", answer: "OptimaCV supports PDF, DOCX, TXT, JSON, and Markdown exports. All formats are available on Free (with fair-use limits), Export Access, and Pro." },
  {
    question: "How do subscriptions work?",
    answer: `Free includes basic AI and a sponsor step before export. Pro is $${PRICING.proMonthly}/mo, $${PRICING.proAnnual}/yr, or $${PRICING.proLifetime} lifetime. Export Access is $${PRICING.exportOneTime} one-time (exports only). Cancel Pro anytime.`,
  },
  { question: "Is my resume data private?", answer: "Absolutely. Privacy is a core value at OptimaCV. All data is encrypted both in transit (TLS) and at rest. We never sell your personal information or share it with third parties. Our AI processing is stateless — your resume content is not used to train or fine-tune any models. You can delete your account and all associated data at any time from your dashboard." },
  { question: "Can I use OptimaCV for multiple resumes?", answer: "Yes! You can create and manage as many resumes as you need from your dashboard. This is especially useful if you're applying to different types of roles and want to tailor each resume to a specific job description. Each resume can use a different template and have its own customized content." },
  { question: "Are the templates ATS-friendly?", answer: "Yes. All 55 templates are designed for Applicant Tracking Systems (ATS). We use clean formatting, standard section headings, proper document structure, and avoid elements that confuse ATS parsers like tables, columns embedded in text boxes, or unusual fonts." },
  { question: "How does the AI generate content?", answer: "OptimaCV uses OpenAI's language models to analyze your input and generate professional content. When you provide your job title, company, and a brief description, the AI produces impactful bullet points with quantified achievements. It can also write professional summaries, generate cover letters tailored to specific job descriptions, score your resume's ATS compatibility, and identify missing keywords. All AI suggestions are fully editable." },
  { question: "Can I cancel my Pro subscription?", answer: "Yes, you can cancel your Pro subscription at any time from your account settings. There are no cancellation fees or penalties. After canceling, you'll continue to have access to all Pro features until the end of your current billing period. Your resumes and data will remain intact on the free plan." },
  { question: "How do I contact support?", answer: "You can reach our support team by emailing support@optimacv.com or by using our contact page. We typically respond within 24 hours on business days. For common questions, we recommend checking this FAQ page first." },
];

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-left text-base font-medium text-white transition-colors hover:bg-white/[0.03]">
        {question}
        <ChevronDown className="h-5 w-5 flex-shrink-0 text-slate-600 transition-transform duration-300 group-open:rotate-180 group-open:text-brand-400" />
      </summary>
      <div className="px-6 pb-5 text-sm leading-relaxed text-slate-400">{answer}</div>
    </details>
  );
}

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <section className="relative overflow-hidden py-20">
        <div className="orb orb-violet absolute top-0 left-1/3 h-[400px] w-[400px] animate-pulse-glow" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300"><Sparkles className="h-3.5 w-3.5" /> Got questions?</span>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Frequently Asked Questions</h1>
          <p className="mt-4 text-lg text-slate-400">Everything you need to know about OptimaCV. Can&apos;t find what you&apos;re looking for?{" "}<Link href="/contact" className="font-medium text-brand-400 underline-offset-4 hover:underline">Contact our team</Link>.</p>
        </div>
      </section>

      <section className="relative py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="divide-y divide-white/[0.04] rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm">
            {faqItems.map((item) => (<FAQItem key={item.question} question={item.question} answer={item.answer} />))}
          </div>
        </div>
      </section>

      <section className="relative py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Still Have Questions?</h2>
          <p className="mt-4 text-lg text-slate-400">Our support team is happy to help. Reach out and we&apos;ll get back to you within 24 hours.</p>
          <Link href="/contact" className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-8 text-sm font-semibold text-white shadow-neon transition-all hover:shadow-glow-lg hover:-translate-y-[1px]">Contact Us <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
