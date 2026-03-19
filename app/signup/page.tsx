"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateParam = searchParams.get("template");
  const { status } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      const dest = templateParam ? `/builder?template=${templateParam}` : "/dashboard";
      router.replace(dest);
    }
  }, [status, router, templateParam]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, phone, name: name || undefined }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "Registration failed"); setLoading(false); return; }
      const signInResult = await signIn("credentials", { email, password, redirect: false });
      if (signInResult?.error) {
        toast.success("Account created! Please sign in.");
        router.push(templateParam ? `/login?template=${templateParam}` : "/login");
        router.refresh();
        setLoading(false);
        return;
      }
      toast.success("Account created successfully!");
      router.push(templateParam ? `/builder?template=${templateParam}` : "/dashboard");
      router.refresh();
    } catch { toast.error("Something went wrong. Please try again."); setLoading(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark px-4">
      <div className="absolute inset-0 bg-grid-dark bg-grid opacity-50" />
      <div className="orb orb-violet absolute top-1/4 right-1/3 h-[500px] w-[500px] animate-pulse-glow" />
      <div className="orb orb-cyan absolute bottom-1/3 left-1/4 h-[400px] w-[400px] animate-pulse-glow [animation-delay:2s]" />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-violet shadow-glow">
            <FileText className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-2xl font-bold text-white">OptimaCV</span>
        </Link>

        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 shadow-glass-lg backdrop-blur-sm">
          <h1 className="mb-2 text-2xl font-semibold text-white">Create your account</h1>
          <p className="mb-6 text-sm text-slate-500">Get started building professional resumes with AI</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Name" type="text" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" disabled={loading} />
            <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" disabled={loading} />
            <Input label="Phone" type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} required autoComplete="tel" disabled={loading} />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete="new-password" disabled={loading} />
            <Input label="Confirm Password" type="password" placeholder="••••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} autoComplete="new-password" disabled={loading} />
            <Button type="submit" className="w-full" size="lg" loading={loading} disabled={loading}>Create Account</Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href={templateParam ? `/login?template=${templateParam}` : "/login"}
              className="font-medium text-brand-400 transition-colors hover:text-brand-300"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-dark"><div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" /></div>}>
      <SignupForm />
    </Suspense>
  );
}
