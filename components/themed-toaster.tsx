"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "@/components/theme-provider";

const darkToastOptions = {
  duration: 4000,
  style: {
    background: "#1e293b",
    color: "#f1f5f9",
    border: "1px solid rgba(255,255,255,0.08)",
    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
  },
  success: {
    duration: 3500,
    iconTheme: { primary: "#34d399", secondary: "#1e293b" },
  },
  error: {
    duration: 5000,
    iconTheme: { primary: "#f87171", secondary: "#1e293b" },
  },
};

const lightToastOptions = {
  duration: 4000,
  style: {
    background: "#ffffff",
    color: "#111827",
    border: "1px solid #e5e7eb",
    boxShadow: "0 10px 40px -12px rgba(15, 23, 42, 0.12)",
  },
  success: {
    duration: 3500,
    style: {
      background: "#ecfdf5",
      color: "#065f46",
      border: "1px solid #a7f3d0",
    },
    iconTheme: { primary: "#059669", secondary: "#ecfdf5" },
  },
  error: {
    duration: 5000,
    style: {
      background: "#fef2f2",
      color: "#991b1b",
      border: "1px solid #fecaca",
    },
    iconTheme: { primary: "#dc2626", secondary: "#fef2f2" },
  },
  loading: {
    style: {
      background: "#ffffff",
      color: "#111827",
      border: "1px solid #e5e7eb",
    },
  },
};

/** Use with `toast(msg, { icon: '⚠️', style: toastWarningStyleLight })` for WCAG-friendly warnings in light mode */
export const toastWarningStyleLight = {
  background: "#fffbeb",
  color: "#92400e",
  border: "1px solid #fcd34d",
  boxShadow: "0 10px 40px -12px rgba(15, 23, 42, 0.12)",
} as const;

export const toastWarningStyleDark = {
  background: "#422006",
  color: "#fef3c7",
  border: "1px solid rgba(251, 191, 36, 0.35)",
  boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
} as const;

export function ThemedToaster() {
  const { theme } = useTheme();
  const opts = theme === "light" ? lightToastOptions : darkToastOptions;

  return (
    <Toaster
      position="top-right"
      toastOptions={opts}
      containerClassName="!z-[100]"
    />
  );
}
