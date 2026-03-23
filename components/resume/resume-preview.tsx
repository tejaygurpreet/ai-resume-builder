"use client";

import React, { forwardRef } from "react";
import { templates, type TemplateName } from "./templates";

interface ResumePreviewProps {
  template: TemplateName;
  sections: Array<{
    id: string;
    type: string;
    order: number;
    content: any;
  }>;
  color: string;
  scale?: number;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(
  ({ template, sections, color, scale }, ref) => {
    const TemplateComponent = templates[template];

    if (!TemplateComponent) {
      return (
        <div style={{ padding: "24px", color: "#888", textAlign: "center" }}>
          Template &ldquo;{template}&rdquo; not found.
        </div>
      );
    }

    const previewScale = scale ?? 0.5;

    return (
      <div
        style={{
          width: `${794 * previewScale}px`,
          height: `${1123 * previewScale}px`,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#fff",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08)",
          borderRadius: "4px",
        }}
      >
        <div
          ref={ref}
          className="resume-pdf-root bg-white"
          style={{
            width: "794px",
            height: "1123px",
            transform: `scale(${previewScale}) translateZ(0)`,
            transformOrigin: "top left",
          }}
        >
          <TemplateComponent sections={sections} color={color} />
        </div>
      </div>
    );
  }
);

ResumePreview.displayName = "ResumePreview";

export default ResumePreview;
