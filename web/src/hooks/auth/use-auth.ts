"use client";

import { authClient } from "@/lib/auth-client";

/**
 * Hook to access Better Auth session data
 * Returns the current session, user, and loading state
 */
export function useAuth() {
  const session = authClient.useSession();

  return {
    user: session.data?.user ?? null,
    session: session.data?.session ?? null,
    isLoading: session.isPending,
    isAuthenticated: !!session.data?.user,
    error: session.error,
  };
}
