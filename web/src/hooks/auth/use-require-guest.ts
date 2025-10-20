"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./use-auth";

/**
 * Hook for reverse protection - redirects to dashboard if already authenticated
 * Use this in sign-in and sign-up pages
 */
export function useRequireGuest() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading };
}
