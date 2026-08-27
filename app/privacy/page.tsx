import type { Metadata } from "next";
import { pageMetadata } from "@/lib/page-metadata";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description:
    "How OptimaCV collects, uses, stores and protects your personal data, including AI processing, advertising and your rights over your information.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main>
        {/* Page banner */}
        <section className="border-b border-white/[0.04] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-4 text-lg text-slate-400">
              Your privacy matters to us. Here&apos;s how we handle your data.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Last updated: March 14, 2026
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-10">
            {/* 1. Introduction */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                1. Introduction
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                Welcome to OptimaCV (&quot;we,&quot; &quot;our,&quot; or
                &quot;us&quot;). OptimaCV is an AI-powered resume builder
                Software-as-a-Service (SaaS) platform designed to help you
                create professional, job-winning resumes. This Privacy Policy
                explains how we collect, use, disclose, and safeguard your
                personal information when you use our website and services.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                By accessing or using OptimaCV, you agree to the terms of this
                Privacy Policy. If you do not agree, please discontinue use of
                our services.
              </p>
            </div>

            {/* 2. Information We Collect */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                2. Information We Collect
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                We collect the following types of information to provide and
                improve our services:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-400">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Account Information</strong>{" "}
                    — Your name, email address, and securely hashed password when
                    you create an account.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Resume Content</strong> —
                    The text, work history, education, skills, and other
                    information you enter into the resume builder.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Usage Data</strong> — Pages
                    visited, features used, session duration, and interaction
                    patterns that help us understand how our platform is used.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Payment Information</strong>{" "}
                    — Billing details are processed securely by Stripe. We do not
                    store your credit card numbers or full payment details on our
                    servers.
                  </span>
                </li>
              </ul>
            </div>

            {/* 3. How We Use Your Data */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                3. How We Use Your Data
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                We use the information we collect for the following purposes:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-400">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Provide, operate, and maintain our resume building services.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Generate AI-powered suggestions for your resume content using
                    the OpenAI API, including bullet point generation, resume
                    scoring, and keyword optimization.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Process payments and manage subscriptions through our payment
                    provider.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Send service-related communications such as account
                    confirmations, billing notices, and important updates about
                    our platform.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Improve and optimize our services based on usage patterns and
                    feedback.
                  </span>
                </li>
              </ul>
            </div>

            {/* 4. AI Processing */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                4. AI Processing
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                OptimaCV uses artificial intelligence to enhance your resume
                building experience. When you use AI-powered features — such as
                bullet point generation, resume scoring, keyword analysis, and
                cover letter generation — your resume data is sent to the OpenAI
                API for processing.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                Your data sent to OpenAI is used solely to generate responses for
                your requests. It is <strong className="text-slate-900">not</strong>{" "}
                used to train or improve AI models. We encourage you to review
                OpenAI&apos;s privacy policy for additional details on their data
                handling practices.
              </p>
            </div>

            {/* 5. Cookies and Analytics */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                5. Cookies and Analytics
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                We use cookies and similar technologies to enhance your
                experience:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-400">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Essential Cookies</strong>{" "}
                    — Required for authentication sessions and core platform
                    functionality. These cannot be disabled.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Analytics Cookies</strong>{" "}
                    — Help us understand usage patterns, popular features, and
                    areas for improvement. These are anonymized where possible.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">
                      Advertising Cookies
                    </strong>{" "}
                    — On the Free plan we display a sponsored message before each
                    export. These ads are served by Google AdSense, which uses
                    cookies to serve and measure them. Google may use the DoubleClick
                    cookie to show ads based on your visits to this and other sites.
                    You can opt out of personalized advertising in{" "}
                    <a
                      href="https://adssettings.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 underline hover:text-brand-300"
                    >
                      Google Ads Settings
                    </a>
                    , or opt out of third-party vendor cookies at{" "}
                    <a
                      href="https://www.aboutads.info/choices/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 underline hover:text-brand-300"
                    >
                      aboutads.info
                    </a>
                    . Pro and Export Access plans are ad-free.
                  </span>
                </li>
              </ul>
            </div>

            {/* 6. Third-Party Services */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                6. Third-Party Services
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                We rely on trusted third-party providers to deliver our services:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-400">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">OpenAI</strong> — Powers
                    our AI features including resume bullet generation, scoring,
                    keyword optimization, and cover letter writing.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Stripe</strong> — Handles
                    all payment processing securely. Stripe is PCI-DSS compliant.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Google AdSense</strong> —
                    Serves the sponsored message shown to Free plan users before
                    an export. Google is a third-party vendor that uses cookies
                    to serve ads. See{" "}
                    <a
                      href="https://policies.google.com/technologies/partner-sites"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 underline hover:text-brand-300"
                    >
                      how Google uses information from sites that use its services
                    </a>
                    .
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Hosting Provider</strong> —
                    Our application is hosted on infrastructure that provides
                    enterprise-grade security and uptime.
                  </span>
                </li>
              </ul>
              <p className="mt-4 text-base leading-relaxed text-slate-400">
                We do not sell your personal information, and we do not share your
                resume content with advertisers. Serving an ad is not a sale of
                your data.
              </p>
            </div>

            {/* 7. Data Security */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                7. Data Security
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                We take the security of your data seriously and implement
                industry-standard measures to protect it:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-400">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    All data is encrypted in transit using HTTPS/TLS protocols.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Data at rest is encrypted using modern encryption standards.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Passwords are securely hashed and never stored in plain text.
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                While we strive to protect your data, no method of electronic
                transmission or storage is 100% secure. We cannot guarantee
                absolute security but are committed to maintaining the highest
                practical standards.
              </p>
            </div>

            {/* 8. Your Rights */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                8. Your Rights
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                You have the following rights regarding your personal data:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-400">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Access</strong> — Request a
                    copy of the personal data we hold about you.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Deletion</strong> — Request
                    that we delete your account and associated personal data.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Export</strong> — Export
                    your resume data in multiple formats (PDF, DOCX, TXT, JSON).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Opt Out</strong> — Opt out
                    of marketing communications at any time.
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                To exercise any of these rights, please contact us at{" "}
                <a
                  href="mailto:support@optimacv.io"
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  support@optimacv.io
                </a>
                .
              </p>
            </div>

            {/* 9. Data Retention */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                9. Data Retention
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                We retain your personal data for as long as your account is
                active or as needed to provide you with our services. If you
                request account deletion, we will delete your personal data and
                resume content within 30 days of the request, except where we are
                required to retain certain information by law.
              </p>
            </div>

            {/* 10. Children's Privacy */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                10. Children&apos;s Privacy
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                OptimaCV is not intended for use by individuals under the age of
                13. We do not knowingly collect personal information from children
                under 13. If we become aware that a child under 13 has provided
                us with personal data, we will take steps to delete that
                information promptly. If you believe a child under 13 has
                provided us with personal data, please contact us at{" "}
                <a
                  href="mailto:support@optimacv.io"
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  support@optimacv.io
                </a>
                .
              </p>
            </div>

            {/* 11. Changes to This Policy */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                11. Changes to This Policy
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or for other operational, legal, or
                regulatory reasons. When we make material changes, we will notify
                users via email or a prominent notice on our platform. We
                encourage you to review this page periodically for the latest
                information on our privacy practices.
              </p>
            </div>

            {/* 12. Contact Us */}
            <div>
              <h2 className="text-2xl font-bold text-white">
                12. Contact Us
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-400">
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </p>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-6">
                <p className="text-base font-medium text-slate-900">OptimaCV</p>
                <p className="mt-1 text-base text-slate-600">
                  Email:{" "}
                  <a
                    href="mailto:support@optimacv.io"
                    className="font-medium text-brand-600 hover:text-brand-700"
                  >
                    support@optimacv.io
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
