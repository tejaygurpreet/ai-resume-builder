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
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
            <Sparkles className="h-3.5 w-3.5" />
            {templateRegistry.length} Templates
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Resume Templates
          </h1>
          <p className="mt-3 text-lg text-gray-600">
            Choose from {templateRegistry.length} professionally designed,
            ATS-friendly templates. Click any template to start building.
          </p>
        </div>

        <TemplateGallery onSelect={handleSelect} columns={4} />
      </main>

      <Footer />
    </div>
  );
}
