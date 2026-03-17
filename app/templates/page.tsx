"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { TemplateGallery } from "@/components/resume/template-gallery";
import type { TemplateName } from "@/components/resume/templates";
import { templateRegistry } from "@/components/resume/templates";
import { Sparkles } from "lucide-react";

export default function TemplatesPage() {
  const router = useRouter();
  const { status } = useSession();

  function handleSelect(template: TemplateName) {
    if (status === "authenticated") {
      router.push(`/builder?template=${template}`);
    } else {
      router.push(`/signup?template=${template}`);
    }
  }

  return (
    <div className="min-h-screen bg-dark">
      <Navbar />

      <main className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="orb orb-blue absolute -top-20 left-1/4 h-[400px] w-[400px] animate-pulse-glow" />

        <div className="relative mx-auto mb-14 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            {templateRegistry.length} Templates
          </span>
          <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Resume Templates
          </h1>
          <p className="mt-3 text-lg text-slate-400">
            Choose from {templateRegistry.length} professionally designed,
            ATS-friendly templates. Click any template to start building.
          </p>
        </div>

        <div className="relative">
          <TemplateGallery onSelect={handleSelect} columns={4} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
