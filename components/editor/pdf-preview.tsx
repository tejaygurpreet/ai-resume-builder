"use client";

import React, { useEffect, useState, useRef } from "react";
import type { ResumeSection } from "@/hooks/use-resume-store";

interface PDFPreviewProps {
  sections: ResumeSection[];
  color?: string;
  className?: string;
}

export function PDFPreview({ sections, color = "#2563eb", className }: PDFPreviewProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const prevRef = useRef<string>("");
  const debounceRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const key = JSON.stringify({ sections, color });
    if (key === prevRef.current && blobUrl) return;
    prevRef.current = key;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { pdf } = await import("@react-pdf/renderer");
        const { ResumePDFDocument } = await import("@/components/resume/resume-pdf-document");
        const blob = await pdf(
          <ResumePDFDocument sections={sections} color={color} />
        ).toBlob();
        const url = URL.createObjectURL(blob);
        setBlobUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return url;
        });
      } catch (err) {
        console.error("PDF preview error:", err);
      } finally {
        setLoading(false);
      }
    }, 600);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sections, color]);

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  if (loading && !blobUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 ${className ?? ""}`}
        style={{ minHeight: 400 }}
      >
        <p className="text-sm text-slate-500">Generating preview…</p>
      </div>
    );
  }

  if (!blobUrl) return null;

  return (
    <iframe
      src={blobUrl}
      title="Resume preview"
      className={`w-full border-0 bg-white ${className ?? ""}`}
      style={{ minHeight: "800px" }}
    />
  );
}
