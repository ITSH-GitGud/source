"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./use-auth";

/**
 * Hook to protect routes - redirects to sign-in if not authenticated
 * Use this in protected page components or layouts
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth");
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
