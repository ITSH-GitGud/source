"use client";

import { useTheme } from "next-themes";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [value, setValue] = useState<string>(
    theme ?? resolvedTheme ?? "system",
  );

  useEffect(() => {
    setValue(theme ?? resolvedTheme ?? "system");
  }, [theme, resolvedTheme]);

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-muted-foreground text-sm">
          Customize your experience.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-medium">Theme</h2>
        <RadioGroup
          value={value}
          onValueChange={(v) => {
            setValue(v);
            setTheme(v as "light" | "dark" | "system");
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <div className="flex items-center gap-2 rounded-md border p-3">
            <RadioGroupItem id="theme-light" value="light" />
            <Label htmlFor="theme-light">Light</Label>
          </div>
          <div className="flex items-center gap-2 rounded-md border p-3">
            <RadioGroupItem id="theme-dark" value="dark" />
            <Label htmlFor="theme-dark">Dark</Label>
          </div>
          <div className="flex items-center gap-2 rounded-md border p-3">
            <RadioGroupItem id="theme-system" value="system" />
            <Label htmlFor="theme-system">System</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
