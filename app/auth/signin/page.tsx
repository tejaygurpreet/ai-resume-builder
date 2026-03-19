import { redirect } from "next/navigation";

/** Canonical sign-in lives at /login; keeps /auth/signin links working */
export default function AuthSignInRedirect() {
  redirect("/login");
}
