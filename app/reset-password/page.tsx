"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import toast from "react-hot-toast";
import { AuthThemeCorner } from "@/components/auth-theme-corner";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (!token) {
      toast.error("Invalid or missing reset link.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Reset failed");
        return;
      }
      toast.success("Password updated. You can sign in.");
      router.replace("/login");
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <p className="text-sm text-slate-400">
        Invalid link.{" "}
        <Link href="/forgot-password" className="text-brand-400 hover:text-brand-300">
          Request a new reset
        </Link>
        .
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Input
        label="New password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
        disabled={loading}
      />
      <Input
        label="Confirm password"
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        required
        minLength={6}
        autoComplete="new-password"
        disabled={loading}
      />
      <Button type="submit" className="w-full" size="lg" loading={loading}>
        Update password
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
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
          <h1 className="mb-2 text-2xl font-semibold text-white">Choose a new password</h1>
          <p className="mb-6 text-sm text-slate-500">Use at least 6 characters.</p>

          <Suspense fallback={<div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />}>
            <ResetForm />
          </Suspense>

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
