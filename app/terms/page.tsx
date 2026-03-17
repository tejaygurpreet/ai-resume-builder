import type { Metadata } from "next";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms of Service | ResumeAI",
  description:
    "Read the terms and conditions for using ResumeAI's resume builder platform.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main>
        {/* Page banner */}
        <section className="border-b border-white/[0.04] px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mt-4 text-lg text-slate-600">
              Please read these terms carefully before using ResumeAI.
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Last updated: March 14, 2026
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-10">
            {/* 1. Acceptance of Terms */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                By accessing or using ResumeAI (&quot;the Service&quot;), you
                agree to be bound by these Terms of Service (&quot;Terms&quot;).
                If you do not agree to all of these Terms, you may not access or
                use the Service. These Terms constitute a legally binding
                agreement between you and ResumeAI.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                We may update these Terms from time to time. Your continued use
                of the Service after any changes constitutes acceptance of the
                revised Terms.
              </p>
            </div>

            {/* 2. Description of Service */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                2. Description of Service
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                ResumeAI is an AI-powered resume builder platform that provides:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Professional resume templates with customizable layouts and
                    designs.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    AI-powered writing assistance, including bullet point
                    generation, content suggestions, and resume scoring.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Keyword optimization to help your resume pass Applicant
                    Tracking Systems (ATS).
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    AI-generated cover letters tailored to specific job
                    descriptions.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Export capabilities in multiple formats including PDF, DOCX,
                    TXT, and JSON.
                  </span>
                </li>
              </ul>
            </div>

            {/* 3. User Accounts */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                3. User Accounts
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                To use certain features of ResumeAI, you must create an account.
                When creating an account, you agree to:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Provide accurate, current, and complete information during
                    registration.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Maintain the security and confidentiality of your account
                    credentials. You are responsible for all activities that occur
                    under your account.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Notify us immediately of any unauthorized use of your
                    account.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Be at least 13 years of age. Users under 13 are not permitted
                    to use our Service.
                  </span>
                </li>
              </ul>
            </div>

            {/* 4. Acceptable Use */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                4. Acceptable Use
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                You agree to use ResumeAI only for lawful purposes and in
                accordance with these Terms. You agree not to:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Misuse the Service, including attempting to gain unauthorized
                    access to our systems or other users&apos; accounts.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Use automated scripts, bots, or scrapers to access or
                    extract data from the Service.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Create resumes containing intentionally false or misleading
                    information for the purpose of fraud or deception.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    Interfere with or disrupt the integrity or performance of the
                    Service.
                  </span>
                </li>
              </ul>
            </div>

            {/* 5. Intellectual Property */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                5. Intellectual Property
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                <strong className="text-slate-900">Your Content:</strong> You
                retain full ownership of the resumes and content you create using
                ResumeAI. We do not claim any intellectual property rights over
                the materials you provide or the documents you generate.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                <strong className="text-slate-900">Our Property:</strong> The
                ResumeAI platform, including its templates, user interface,
                design, branding, logos, and underlying technology, is owned by
                ResumeAI and protected by applicable intellectual property laws.
                You may not copy, modify, distribute, or reverse-engineer any
                part of our platform without prior written consent.
              </p>
            </div>

            {/* 6. Subscription and Payments */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                6. Subscription and Payments
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                ResumeAI offers the following plans:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Free Plan</strong> — Access
                    to core features including AI writing, limited templates, and
                    ad-supported exports.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">Pro Plan</strong> — Access
                    to all templates, unlimited ad-free exports, and priority
                    support for a monthly subscription fee.
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                All payments are processed securely through Stripe. Pro
                subscriptions automatically renew each billing cycle unless
                cancelled. You may cancel your subscription at any time from your
                dashboard, and you will retain access to Pro features until the
                end of your current billing period.
              </p>
            </div>

            {/* 7. AI-Generated Content */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                7. AI-Generated Content
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                ResumeAI uses artificial intelligence to generate suggestions for
                your resume, including bullet points, summaries, skills, and
                cover letters. You acknowledge and agree that:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    AI-generated content is provided as suggestions only. You are
                    responsible for reviewing, editing, and verifying the accuracy
                    of all content before using it.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    AI suggestions may not always be accurate, complete, or
                    appropriate for your specific situation.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    ResumeAI does not guarantee any specific outcomes, including
                    but not limited to job interviews, job offers, or employment
                    placement.
                  </span>
                </li>
              </ul>
            </div>

            {/* 8. Export and Data */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                8. Export and Data
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                You may export your resume data at any time. ResumeAI supports
                the following export formats:
              </p>
              <ul className="mt-4 space-y-3 text-base leading-relaxed text-slate-600">
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">PDF</strong> — Polished,
                    print-ready documents.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">DOCX</strong> — Editable
                    Microsoft Word format.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">TXT</strong> — Plain text
                    for ATS compatibility.
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-500" />
                  <span>
                    <strong className="text-slate-900">JSON</strong> — Structured
                    data format for portability and backups.
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                We are committed to data portability. Your data belongs to you,
                and you can take it with you at any time.
              </p>
            </div>

            {/* 9. Termination */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                9. Termination
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                We reserve the right to suspend or terminate your account if you
                violate these Terms or engage in conduct that we determine, in
                our sole discretion, to be harmful to the Service, other users,
                or third parties.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                You may delete your account at any time through your account
                settings. Upon deletion, your personal data and resume content
                will be removed in accordance with our Privacy Policy.
              </p>
            </div>

            {/* 10. Disclaimer of Warranties */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                10. Disclaimer of Warranties
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                The Service is provided on an &quot;as is&quot; and &quot;as
                available&quot; basis without warranties of any kind, whether
                express or implied, including but not limited to implied
                warranties of merchantability, fitness for a particular purpose,
                and non-infringement.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                We do not warrant that the Service will be uninterrupted,
                error-free, or secure, or that any defects will be corrected. We
                make no guarantees regarding the accuracy or reliability of
                AI-generated content.
              </p>
            </div>

            {/* 11. Limitation of Liability */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                11. Limitation of Liability
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                To the maximum extent permitted by applicable law, ResumeAI and
                its officers, directors, employees, and agents shall not be
                liable for any indirect, incidental, special, consequential, or
                punitive damages, including but not limited to loss of profits,
                data, or business opportunities arising from your use of the
                Service.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                In no event shall our total liability exceed the amount you have
                paid to ResumeAI in the twelve (12) months preceding the claim.
              </p>
            </div>

            {/* 12. Governing Law */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                12. Governing Law
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                These Terms shall be governed by and construed in accordance with
                the laws of the United States, without regard to conflict of law
                principles. Any disputes arising under or in connection with
                these Terms shall be subject to the exclusive jurisdiction of the
                courts located within the United States.
              </p>
            </div>

            {/* 13. Changes to Terms */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                13. Changes to Terms
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                We reserve the right to modify these Terms at any time. When we
                make material changes, we will notify users via email or a
                prominent notice on our platform. Your continued use of the
                Service after such changes constitutes your acceptance of the
                revised Terms.
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                We encourage you to review these Terms periodically to stay
                informed of any updates.
              </p>
            </div>

            {/* 14. Contact Information */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                14. Contact Information
              </h2>
              <p className="mt-3 text-base leading-relaxed text-slate-600">
                If you have any questions or concerns about these Terms of
                Service, please contact us:
              </p>
              <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-6">
                <p className="text-base font-medium text-slate-900">ResumeAI</p>
                <p className="mt-1 text-base text-slate-600">
                  Email:{" "}
                  <a
                    href="mailto:support@resumeai.com"
                    className="font-medium text-brand-600 hover:text-brand-700"
                  >
                    support@resumeai.com
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
