"use client";

import { ArrowRight } from "lucide-react";
import { sampleSections } from "@/lib/sample-resume";
import { templates, type TemplateName } from "@/components/resume/templates";
import { templateRegistry } from "@/components/resume/templates";
import { AuthCTA } from "@/components/auth-cta";
import { cn } from "@/lib/utils";

interface TemplatePreviewCardProps {
  templateId: string;
  onPreview?: (templateId: string) => void;
}

export function TemplatePreviewCard({ templateId, onPreview }: TemplatePreviewCardProps) {
  const info = templateRegistry.find((t) => t.id === templateId);
  const TemplateComponent = templates[templateId as TemplateName];

  if (!info || !TemplateComponent) return null;

  const previewScale = 0.22;

  return (
    <div
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] transition-all duration-300 ease-out hover:-translate-y-2 hover:border-white/[0.15] hover:shadow-[0_0_40px_-12px_rgba(99,102,241,0.3)]"
    >
      <div
        role="button"
        tabIndex={0}
        onClick={() => onPreview?.(templateId)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onPreview?.(templateId);
          }
        }}
        className="relative flex h-[240px] cursor-pointer items-center justify-center overflow-hidden bg-dark-100"
      >
        <div className="flex items-center justify-center transition-transform duration-300 ease-out group-hover:scale-[1.04]">
          <div
            style={{
              width: 794,
              height: 1123,
              transform: `scale(${previewScale})`,
              transformOrigin: "center center",
            }}
          >
            <TemplateComponent sections={sampleSections} color={info.accent} />
          </div>
        </div>

        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50 group-hover:backdrop-blur-[1px]">
          <span className="flex translate-y-3 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-slate-900 opacity-0 shadow-lg transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            Use Template <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
        <div>
          <h3 className="text-sm font-bold text-white">{info.name}</h3>
          <span className="mt-0.5 block text-[10px] font-medium capitalize text-slate-500">
            {info.category}
          </span>
        </div>
        <AuthCTA
          guestHref={`/signup?template=${templateId}`}
          authHref={`/builder?template=${templateId}`}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-xl border-2 border-brand-500/30 bg-brand-500/15 px-4 py-2 text-xs font-bold text-brand-300 transition-all duration-300",
            "hover:bg-brand-500 hover:text-white hover:border-brand-500 hover:shadow-glow"
          )}
        >
          Use <ArrowRight className="h-3.5 w-3.5" />
        </AuthCTA>
      </div>
    </div>
  );
}
