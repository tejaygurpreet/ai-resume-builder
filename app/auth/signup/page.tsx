import { redirect } from "next/navigation";

/** Canonical sign-up lives at /signup */
export default function AuthSignUpRedirect() {
  redirect("/signup");
}
