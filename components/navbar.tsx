"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Menu,
  X,
  LogOut,
  User,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const navLinks = [
  { href: "/templates", label: "Templates" },
  { href: "/pricing", label: "Pricing" },
  { href: "/cover-letter", label: "Cover Letter" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href.startsWith("/#")) return false;
  return pathname === href || pathname.startsWith(href + "/");
}

export function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isAuthenticated = status === "authenticated" && !!session?.user;

  return (
    <header className="site-navbar sticky top-0 z-50 w-full border-b border-white/[0.05] bg-dark/80 backdrop-blur-2xl transition-colors duration-300">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="nav-logo flex items-center gap-3 transition-all duration-200 hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-violet shadow-glow">
            <FileText className="h-5 w-5 text-white" aria-hidden />
          </div>
          <div className="flex flex-col">
            <span className="nav-logo-text text-xl font-bold text-white tracking-tight">OptimaCV</span>
            <span className="text-[10px] font-medium text-slate-500">Your Optimal Career Advantage</span>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "nav-link group relative rounded-lg px-4 py-2.5 text-[14px] font-medium transition-all duration-[200ms] ease-out",
                  active ? "text-white" : "text-slate-400"
                )}
              >
                <span className="relative inline-block">
                  <span>{link.label}</span>
                  <span
                    className={cn(
                      "absolute inset-0 bg-gradient-to-r from-brand-400 to-accent-violet bg-clip-text text-transparent transition-opacity duration-[200ms]",
                      active ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                  >
                    {link.label}
                  </span>
                </span>
                <span
                  className={cn(
                    "absolute bottom-1 left-0 h-0.5 origin-left rounded-full bg-gradient-to-r from-brand-400 to-accent-violet transition-transform duration-[200ms] ease-out",
                    active ? "w-full scale-x-100" : "w-full scale-x-0 group-hover:scale-x-100"
                  )}
                />
              </Link>
            );
          })}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle variant="navbar" />
          {isAuthenticated ? (
            <>
              <Link href="/dashboard">
                <Button
                  variant={isActivePath(pathname, "/dashboard") ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="nav-profile-btn flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.04] p-1.5 pr-3 transition-all hover:border-white/[0.15] hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  {session?.user?.image ? (
                    <img src={session.user.image} alt="" className="h-7 w-7 rounded-lg object-cover" />
                  ) : (
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 text-brand-300">
                      <User className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <ChevronDown className={cn("h-3.5 w-3.5 text-slate-500 transition-transform", dropdownOpen && "rotate-180")} />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96, y: 4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.96, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="nav-dropdown absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-white/[0.08] bg-dark-100 py-1 shadow-glass-lg"
                      role="menu"
                    >
                      <div className="border-b border-white/[0.06] px-4 py-3">
                        <p className="truncate text-sm font-semibold text-white">{session?.user?.name ?? "User"}</p>
                        <p className="truncate text-xs text-slate-500">{session?.user?.email ?? ""}</p>
                      </div>
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-white/[0.05] hover:text-white lg:hidden"
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="nav-mobile overflow-hidden border-t border-white/[0.06] bg-dark-50 lg:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {navLinks.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-[15px] font-medium transition-colors",
                      active ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="my-3 border-t border-white/[0.06]" />
              <ThemeToggle
                variant="nav-mobile"
                onAfterToggle={() => setMobileOpen(false)}
              />
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-4 py-3 text-[15px] font-medium transition-colors",
                      isActivePath(pathname, "/dashboard") ? "bg-white/[0.08] text-white" : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { signOut(); setMobileOpen(false); }}
                    className="flex w-full items-center gap-2.5 rounded-xl px-4 py-3 text-left text-[15px] font-medium text-slate-400 hover:bg-white/[0.05] hover:text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full" size="lg">Log In</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full" size="lg">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
