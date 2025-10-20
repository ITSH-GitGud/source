import { redirect } from "next/navigation";

export default function SignUpPage() {
  // Redirect legacy /auth/sign-up to the unified /auth page
  redirect("/auth?tab=sign-up");
}
