import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Email preferences · OptimaCV",
  description: "How we use email and how to keep OptimaCV messages in your inbox.",
};

export default function EmailPreferencesPage() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-xl">
        <p className="text-xs font-medium uppercase tracking-wide text-violet-400">Email</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Email preferences</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          OptimaCV sends account-related messages (for example, password updates and security notices) to the
          address on your account. We do not send unsolicited marketing from your password-reset flow.
        </p>

        <h2 className="mt-10 text-lg font-semibold text-white">Stay out of spam</h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-slate-400">
          <li>
            Add <strong className="text-slate-200">support@optimacv.io</strong> and{" "}
            <strong className="text-slate-200">noreply@optimacv.io</strong> to your contacts or safe senders list
            (Gmail, Outlook, iCloud, etc.).
          </li>
          <li>
            If a message lands in Promotions or Spam, move it to Primary and confirm it is not junk—this helps
            your provider learn that mail from our domain is wanted.
          </li>
        </ul>

        <h2 className="mt-10 text-lg font-semibold text-white">List-Unsubscribe</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          Some messages include a <strong className="text-slate-200">List-Unsubscribe</strong> link for standards
          compliance. Account security emails may still be required for your login; for product questions,{" "}
          <Link href="/contact" className="font-medium text-violet-400 hover:text-violet-300">
            contact support
          </Link>
          .
        </p>

        <h2 className="mt-10 text-lg font-semibold text-white">Domain authentication</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          We send mail from <strong className="text-slate-200">optimacv.io</strong> with SPF, DKIM, and DMARC as
          configured in our DNS. Your IT team can verify records in the Resend dashboard for our domain.
        </p>

        <p className="mt-12 text-center text-sm text-slate-500">
          <Link href="/" className="text-violet-400 hover:text-violet-300">
            Back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
