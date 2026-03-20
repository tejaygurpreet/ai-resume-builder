"use client";

import { ThemeToggle } from "@/components/theme-toggle";

/** Fixed top-right theme toggle for auth pages that don't use the main Navbar. */
export function AuthThemeCorner() {
  return (
    <div className="absolute right-4 top-4 z-20">
      <ThemeToggle variant="navbar" />
    </div>
  );
}
