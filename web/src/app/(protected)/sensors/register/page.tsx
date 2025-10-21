"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SensorRegisterPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  // Ensure session is loaded; redirect is handled by protected layout
  useAuth();

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/iot/sensors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, volts: 0 }),
      });
      const data: unknown = await res.json();
      if (!res.ok) {
        let msg = "Failed to register sensor";
        if (typeof data === "object" && data && "error" in data) {
          const errVal = (data as { error?: unknown }).error;
          if (typeof errVal === "string") msg = errVal;
          else if (errVal && typeof errVal === "object")
            msg = JSON.stringify(errVal);
        }
        throw new Error(msg);
      }
      router.push(`/devices/${id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Register Sensor</CardTitle>
          <CardDescription>
            Enter your sensor ID to register it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-3">
            <Input
              placeholder="Sensor ID"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" disabled={loading || !id}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
