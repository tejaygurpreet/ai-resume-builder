"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Mail, Clock, MessageSquare, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim() }) });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send message."); return; }
      setSubmitted(true);
    } catch { setError("Something went wrong. Please try again."); } finally { setSending(false); }
  }

  function handleReset() { setName(""); setEmail(""); setMessage(""); setSubmitted(false); setError(""); }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <section className="relative overflow-hidden py-20">
        <div className="orb orb-cyan absolute top-0 right-1/4 h-[400px] w-[400px] animate-pulse-glow" />
        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Get in Touch</h1>
          <p className="mt-4 text-lg text-slate-400">Have a question, suggestion, or just want to say hello? We&apos;d love to hear from you.</p>
        </div>
      </section>

      <section className="relative py-16">
        <div className="mx-auto grid max-w-5xl gap-12 px-4 sm:px-6 lg:grid-cols-5 lg:gap-16 lg:px-8">
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="flex flex-col items-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 px-8 py-16 text-center backdrop-blur-sm">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400"><CheckCircle2 className="h-8 w-8" /></div>
                <h2 className="text-2xl font-bold text-white">Thank You!</h2>
                <p className="mt-2 max-w-sm text-base text-slate-400">We&apos;ve received your message and will get back to you within 24 hours.</p>
                <button onClick={handleReset} className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-6 text-sm font-semibold text-white transition-colors hover:bg-white/[0.08]"><Send className="h-4 w-4" /> Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 shadow-glass backdrop-blur-sm">
                {error && (<div className="flex items-center gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"><AlertCircle className="h-4 w-4 flex-shrink-0" />{error}</div>)}

                <div>
                  <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">Name</label>
                  <input id="name" type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" disabled={sending} className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 hover:border-white/[0.15] disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
                  <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" disabled={sending} className="block w-full rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 hover:border-white/[0.15] disabled:cursor-not-allowed disabled:opacity-50" />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-slate-300">Message</label>
                  <textarea id="message" required rows={6} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="How can we help?" disabled={sending} className="block w-full resize-none rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-slate-500 transition-all focus:border-brand-500/50 focus:outline-none focus:ring-2 focus:ring-brand-500/20 hover:border-white/[0.15] disabled:cursor-not-allowed disabled:opacity-50" />
                </div>

                <button type="submit" disabled={sending} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 text-sm font-semibold text-white shadow-neon transition-all hover:shadow-glow-lg disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8">
                  {sending ? (<><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>) : (<><Send className="h-4 w-4" /> Send Message</>)}
                </button>
              </form>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-8 backdrop-blur-sm">
              <h2 className="text-lg font-semibold text-white">Contact Information</h2>
              <p className="mt-2 text-sm text-slate-500">Prefer to reach out directly? Here&apos;s how.</p>
              <div className="mt-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400"><Mail className="h-5 w-5" /></div>
                  <div><p className="text-sm font-medium text-white">Email</p><a href="mailto:support@resumeai.com" className="text-sm text-brand-400 hover:underline">support@resumeai.com</a></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400"><Clock className="h-5 w-5" /></div>
                  <div><p className="text-sm font-medium text-white">Response Time</p><p className="text-sm text-slate-500">We typically respond within 24 hours</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400"><MessageSquare className="h-5 w-5" /></div>
                  <div><p className="text-sm font-medium text-white">FAQ</p><p className="text-sm text-slate-500">Many questions answered on our <Link href="/faq" className="font-medium text-brand-400 hover:underline">FAQ page</Link>.</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
