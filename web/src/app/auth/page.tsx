"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthFooter } from "@/components/auth/auth-footer";
import { SignInForm } from "@/components/auth/sign-in-form";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/theme-toggle";

type AuthTab = "sign-in" | "sign-up";

export default function AuthPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialTab: AuthTab = useMemo(() => {
    const tab = (searchParams.get("tab") ?? "sign-in").toLowerCase();
    return tab === "sign-up" ? "sign-up" : "sign-in";
  }, [searchParams]);

  // Keep the URL in sync when the tab changes for shareable links
  const setTab = (value: AuthTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", value);
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Ensure the tab param exists for canonical URLs
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setTab(initialTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthCard>
      <div className="flex items-center justify-end">
        <ThemeToggle />
      </div>
      <Tabs
        value={initialTab}
        onValueChange={(v: string) => setTab((v as AuthTab) ?? "sign-in")}
      >
        <TabsList className="w-full">
          <TabsTrigger value="sign-in">Sign in</TabsTrigger>
          <TabsTrigger value="sign-up">Sign up</TabsTrigger>
        </TabsList>

        <TabsContent value="sign-in" className="mt-6">
          <div className="space-y-6">
            <AuthHeader
              title="Welcome back"
              description="Sign in to your account to continue"
            />
            <SignInForm />
            <AuthFooter
              text="Don't have an account?"
              linkText="Sign up"
              linkHref="/auth?tab=sign-up"
            />
          </div>
        </TabsContent>

        <TabsContent value="sign-up" className="mt-6">
          <div className="space-y-6">
            <AuthHeader
              title="Create an account"
              description="Enter your details to get started"
            />
            <SignUpForm />
            <AuthFooter
              text="Already have an account?"
              linkText="Sign in"
              linkHref="/auth?tab=sign-in"
            />
          </div>
        </TabsContent>
      </Tabs>
    </AuthCard>
  );
}
