import type { Metadata } from "next";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ChevronDown, Sparkles, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "FAQ | ResumeAI",
  description:
    "Frequently asked questions about ResumeAI's AI resume builder, pricing, exports, and data privacy.",
};

const faqItems = [
  {
    question: "How does the AI resume builder work?",
    answer:
      "Getting started is simple. First, choose from one of our 20 professionally designed templates. Then enter your information — work experience, education, skills, and more. As you type, our AI suggests compelling bullet points, rewrites summaries, and optimizes your wording for impact. When you're happy with the result, export your resume as a PDF, DOCX, TXT, or JSON file. The entire process takes just minutes, not hours.",
  },
  {
    question: "Is ResumeAI free to use?",
    answer:
      "Yes! Our free plan gives you full access to the AI-powered resume builder, including AI writing suggestions, resume scoring, keyword matching, and cover letter generation. Free users have access to 2 templates and can export their resumes after watching 3 short ads. If you'd like ad-free unlimited exports and access to all 20 templates, you can upgrade to our Pro plan for just $2.99/month.",
  },
  {
    question: "What export formats are available?",
    answer:
      "ResumeAI supports four export formats: PDF (the standard format for job applications), DOCX (for editing in Microsoft Word or Google Docs), TXT (plain text for online application forms that strip formatting), and JSON (a structured data format useful for developers or programmatic workflows). All formats are available on both the Free and Pro plans.",
  },
  {
    question: "How do subscriptions work?",
    answer:
      "Our Pro plan is billed monthly at $2.99/month through Stripe, a secure and trusted payment processor. You can cancel at any time from your account settings — no questions asked. When you cancel, you'll continue to enjoy Pro features until the end of your current billing period. After that, your account reverts to the free plan and you keep all your resumes.",
  },
  {
    question: "Is my resume data private?",
    answer:
      "Absolutely. Privacy is a core value at ResumeAI. All data is encrypted both in transit (TLS) and at rest. We never sell your personal information or share it with third parties. Our AI processing is stateless — your resume content is not used to train or fine-tune any models. You can delete your account and all associated data at any time from your dashboard.",
  },
  {
    question: "Can I use ResumeAI for multiple resumes?",
    answer:
      "Yes! You can create and manage as many resumes as you need from your dashboard. This is especially useful if you're applying to different types of roles and want to tailor each resume to a specific job description. Each resume can use a different template and have its own customized content.",
  },
  {
    question: "Are the templates ATS-friendly?",
    answer:
      "Yes, all 20 of our templates are designed from the ground up to be compatible with Applicant Tracking Systems (ATS). We use clean formatting, standard section headings, proper document structure, and avoid elements that confuse ATS parsers like tables, columns embedded in text boxes, or unusual fonts. Your resume will look great to humans and pass through automated screening systems without issues.",
  },
  {
    question: "How does the AI generate content?",
    answer:
      "ResumeAI uses OpenAI's language models to analyze your input and generate professional content. When you provide your job title, company, and a brief description, the AI produces impactful bullet points with quantified achievements. It can also write professional summaries, generate cover letters tailored to specific job descriptions, score your resume's ATS compatibility, and identify missing keywords. All AI suggestions are fully editable — you always have final say.",
  },
  {
    question: "Can I cancel my Pro subscription?",
    answer:
      "Yes, you can cancel your Pro subscription at any time from your account settings. There are no cancellation fees or penalties. After canceling, you'll continue to have access to all Pro features (ad-free exports, all templates, priority support) until the end of your current billing period. Your resumes and data will remain intact on the free plan.",
  },
  {
    question: "How do I contact support?",
    answer:
      "You can reach our support team by emailing support@resumeai.com or by using our contact page. We typically respond within 24 hours on business days. For common questions, we recommend checking this FAQ page first — you might find your answer here!",
  },
];

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

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.12),transparent)]" />
        <div className="relative mx-auto max-w-3xl px-4 pb-16 pt-20 text-center sm:px-6 md:pt-28 lg:px-8">
          <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            Got questions?
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Frequently Asked Questions
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about ResumeAI. Can&apos;t find what
            you&apos;re looking for?{" "}
            <Link
              href="/contact"
              className="font-medium text-blue-600 underline-offset-4 hover:underline"
            >
              Contact our team
            </Link>
            .
          </p>
        </div>
      </section>

      {/* FAQ List */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200 shadow-sm">
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

      {/* CTA */}
      <section className="bg-gray-50 py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Still Have Questions?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Our support team is happy to help. Reach out and we&apos;ll get back
            to you within 24 hours.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 text-sm font-semibold text-white shadow-lg shadow-blue-600/25 transition-all hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-600/30"
          >
            Contact Us
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
