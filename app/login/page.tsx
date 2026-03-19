"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get("template");
  const { status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const dest = templateParam ? `/builder?template=${templateParam}` : "/dashboard";
      router.replace(dest);
    }
  }, [status, router, templateParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) { toast.error(result.error); setLoading(false); return; }
      toast.success("Welcome back!");
      router.push(templateParam ? `/builder?template=${templateParam}` : "/dashboard");
      router.refresh();
    } catch { toast.error("Something went wrong. Please try again."); setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="absolute inset-0 bg-grid-dark bg-grid opacity-50" />
      <div className="orb orb-blue absolute top-1/4 left-1/3 h-[500px] w-[500px] animate-pulse-glow" />
      <div className="orb orb-violet absolute bottom-1/4 right-1/3 h-[400px] w-[400px] animate-pulse-glow [animation-delay:2s]" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-violet shadow-glow">
            <FileText className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">OptimaCV</span>
        </Link>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-glass-lg backdrop-blur-sm">
          <h1 className="mb-2 text-2xl font-semibold text-white">Sign in to your account</h1>
          <p className="mb-6 text-sm text-slate-500">Enter your credentials to access your resumes</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" disabled={loading} />
            <div>
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" disabled={loading} />
              <div className="mt-2 text-right">
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-brand-400 hover:text-brand-300"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" loading={loading} disabled={loading}>Sign In</Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link
              href={templateParam ? `/signup?template=${templateParam}` : "/signup"}
              className="font-medium text-brand-400 transition-colors hover:text-brand-300"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-dark"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
