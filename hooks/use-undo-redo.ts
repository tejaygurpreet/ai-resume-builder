"use client";

import { useCallback, useRef, useState } from "react";
import type { ResumeData } from "./use-resume-store";

const MAX_HISTORY = 50;

export function useUndoRedo(
  resume: ResumeData,
  setResume: (r: ResumeData) => void
) {
  const historyRef = useRef<ResumeData[]>([]);
  const futureRef = useRef<ResumeData[]>([]);
  const [, forceUpdate] = useState(0);

  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  const push = useCallback(
    (state: ResumeData) => {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY);
      historyRef.current.push(JSON.parse(JSON.stringify(state)));
      futureRef.current = [];
    },
    []
  );

  const undo = useCallback(() => {
    if (historyRef.current.length === 0) return false;
    const prev = historyRef.current.pop()!;
    futureRef.current.push(JSON.parse(JSON.stringify(resume)));
    setResume(prev);
    refresh();
    return true;
  }, [resume, setResume, refresh]);

  const redo = useCallback(() => {
    if (futureRef.current.length === 0) return false;
    const next = futureRef.current.pop()!;
    historyRef.current.push(JSON.parse(JSON.stringify(resume)));
    setResume(next);
    refresh();
    return true;
  }, [resume, setResume, refresh]);

  return {
    push,
    undo,
    redo,
    canUndo: historyRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
  };
}
