"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

interface AuthCTAProps {
  guestHref: string;
  authHref: string;
  className?: string;
  children: React.ReactNode;
}

export function AuthCTA({
  guestHref,
  authHref,
  className,
  children,
}: AuthCTAProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user;
  const href = isAuthenticated ? authHref : guestHref;

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
