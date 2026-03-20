import { notFound } from "next/navigation";
import Link from "next/link";

/**
 * Development-only helper: explains where to find the printed reset URL.
 * Not available in production (404).
 */
export default function DevResetFlowPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100">
      <div className="mx-auto max-w-lg">
        <p className="text-xs font-medium uppercase tracking-wide text-violet-400">Development only</p>
        <h1 className="mt-2 text-2xl font-semibold text-white">Password reset — local testing</h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          After you submit <strong className="text-slate-200">Forgot password</strong>, the server prints the full
          HTTPS reset link in the terminal where <code className="rounded bg-slate-800 px-1.5 py-0.5 text-violet-300">next dev</code>{" "}
          is running. Look for a line starting with{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-violet-300">[forgot-password] DEV</code>.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-slate-400">
          This page is hidden in production. For real inboxes, add{" "}
          <code className="rounded bg-slate-800 px-1.5 py-0.5">noreply@yourdomain</code> to contacts and check Spam /
          Promotions (Gmail).
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/forgot-password"
            className="inline-flex rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-violet-500"
          >
            Open forgot password
          </Link>
          <Link href="/" className="inline-flex rounded-lg border border-slate-700 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-900">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
