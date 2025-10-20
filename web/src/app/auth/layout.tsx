"use client";

import { useRequireGuest } from "@/hooks/auth";
import { Spinner } from "@/components/ui/spinner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading } = useRequireGuest();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  );
}
