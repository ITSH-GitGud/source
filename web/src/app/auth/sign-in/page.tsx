import { redirect } from "next/navigation";

export default function SignInPage() {
  // Redirect legacy /auth/sign-in to the unified /auth page
  redirect("/auth?tab=sign-in");
}
