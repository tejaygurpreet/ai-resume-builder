"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import toast from "react-hot-toast";
import { AuthThemeCorner } from "@/components/auth-theme-corner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Request failed");
        return;
      }
      setSent(true);
      toast.success("Check your email for a reset link.");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-dark px-4">
      <AuthThemeCorner />
      <div className="absolute inset-0 bg-grid-dark bg-grid opacity-50" />
      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-violet shadow-glow">
            <FileText className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">OptimaCV</span>
        </Link>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-glass-lg backdrop-blur-sm">
          <h1 className="mb-2 text-2xl font-semibold text-white">Reset password</h1>
          <p className="mb-6 text-sm text-slate-500">
            Enter your email and we&apos;ll send a secure link (expires in 1 hour).
          </p>

          {sent ? (
            <p className="text-sm text-slate-400">
              If an account exists for that email, you&apos;ll receive instructions shortly.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={loading}
              />
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send reset link
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/login" className="font-medium text-brand-400 hover:text-brand-300">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
