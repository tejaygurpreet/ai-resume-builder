import React from "react";
import Link from "next/link";
import { FileText, Twitter, Linkedin, Github } from "lucide-react";

const productLinks = [
  { href: "/#features", label: "Resume Builder" },
  { href: "/templates", label: "Templates" },
  { href: "/cover-letter", label: "Cover Letters" },
  { href: "/pricing", label: "Pricing" },
];

const companyLinks = [
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
];

const legalLinks = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

const socialLinks = [
  { href: "https://twitter.com", label: "Twitter", Icon: Twitter },
  { href: "https://linkedin.com", label: "LinkedIn", Icon: Linkedin },
  { href: "https://github.com", label: "GitHub", Icon: Github },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950 text-white">
      {/* Gradient top border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-600">
                <FileText className="h-4 w-4 text-white" aria-hidden />
              </div>
              <span className="text-lg font-bold tracking-tight">ResumeAI</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
              Build professional, ATS-optimized resumes in minutes with the power
              of AI. Land your dream job faster.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map(({ href, label, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/60 text-slate-400 transition-all hover:bg-slate-800 hover:text-white"
                  aria-label={label}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Product column */}
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400">
              Product
            </h3>
            <ul className="mt-4 space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400">
              Company
            </h3>
            <ul className="mt-4 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-[13px] font-semibold uppercase tracking-wider text-slate-400">
              Legal
            </h3>
            <ul className="mt-4 space-y-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-slate-400 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-slate-800/80 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {currentYear} ResumeAI. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built with AI for job seekers worldwide
          </p>
        </div>
      </div>
    </footer>
  );
}
