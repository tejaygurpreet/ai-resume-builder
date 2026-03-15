"use client";

import { useEffect, useRef, useCallback } from "react";
import { useResumeStore } from "./use-resume-store";
import toast from "react-hot-toast";

export function useAutosave() {
  const { resume, isDirty, setIsSaving, markClean } = useResumeStore();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const save = useCallback(async () => {
    if (!resume.id) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(resume),
      });

      if (!response.ok) throw new Error("Failed to save");
      markClean();
    } catch {
      toast.error("Failed to save resume");
    } finally {
      setIsSaving(false);
    }
  }, [resume, setIsSaving, markClean]);

  useEffect(() => {
    if (!isDirty || !resume.id) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, 2000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isDirty, resume, save]);

  return { save };
}
