"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { templates, type TemplateName } from "@/components/resume/templates";
import type { ResumeSection } from "@/hooks/use-resume-store";
import { sectionHasRenderableContent } from "@/lib/template-utils";

const DOC_WIDTH = 794;
const DOC_HEIGHT = 1123;

interface LivePreviewProps {
  template: string;
  sections: ResumeSection[];
  color: string;
  className?: string;
}

/**
 * Clean live resume preview — HTML/DOM only, no PDF, no iframe, no toolbar.
 * Renders the selected template with WYSIWYG editing feel.
 */
export function LivePreview({
  template,
  sections,
  color,
  className = "",
}: LivePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.65);

  const TemplateComponent = templates[template as TemplateName];

  /** Hide sections with no real data so the canvas starts clean (PDF/export still uses full `sections`). */
  const previewSections = useMemo(
    () => sections.filter((s) => sectionHasRenderableContent(s)),
    [sections]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const updateScale = () => {
      const { clientWidth, clientHeight } = el;
      const padding = 32;
      const maxW = Math.max(200, clientWidth - padding);
      const maxH = Math.max(300, clientHeight - padding);
      const scaleByWidth = maxW / DOC_WIDTH;
      const scaleByHeight = maxH / DOC_HEIGHT;
      const s = Math.min(1, scaleByWidth, scaleByHeight);
      setScale(Math.max(0.4, s));
    };

    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);

    return () => ro.disconnect();
  }, []);

  if (!TemplateComponent) {
    return (
      <div
        className={`flex min-h-[400px] items-center justify-center bg-white text-slate-500 ${className}`}
      >
        <p className="text-sm">Template &ldquo;{template}&rdquo; not found.</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`flex min-h-0 flex-1 items-start justify-center overflow-auto ${className}`}
    >
      <div
        style={{
          width: DOC_WIDTH,
          height: DOC_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: "top center",
        }}
        className="resume-preview-document shrink-0"
      >
        <TemplateComponent sections={previewSections} color={color} />
      </div>
    </div>
  );
}

/* === EDITOR FIXED: CLEAN EMPTY PREVIEW + SUMMARY MOVED BELOW EXPERIENCE/EDUCATION IN SIDEBAR === */
