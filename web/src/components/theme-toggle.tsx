"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = theme ?? resolvedTheme ?? "system";
  const isDark = (resolvedTheme ?? theme) === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Switch to ${isDark ? "light" : "dark"} theme`}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-full"
      disabled={!mounted}
    >
      {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
      <span className="sr-only">Current theme: {current}</span>
    </Button>
  );
}
