"use client";
import React, { useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, Wifi, Network } from "lucide-react";

type UnifiNetwork = { _id: string; name: string };

export default function UnifiSetup() {
  const [apiKey, setApiKey] = useState("");
  const [networks, setNetworks] = useState<UnifiNetwork[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState("");
  const [step, setStep] = useState<"input" | "select" | "done">("input");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApiKeySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await axios.post<{
        networks?: UnifiNetwork[];
        error?: string;
      }>("/api/unifi", { apiKey });
      if (response.data.networks) {
        setNetworks(response.data.networks);
        setStep("select");
      } else {
        setError(response.data.error ?? "Failed to fetch networks");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkSave = async () => {
    setError("");
    setLoading(true);
    try {
      const selectedNetworkData = networks.find(
        (n) => n._id === selectedNetwork,
      );
      const response = await axios.put<{ success?: boolean; error?: string }>(
        "/api/unifi",
        {
          apiKey,
          networkId: selectedNetwork,
          networkName: selectedNetworkData?.name,
        },
      );
      if (response.data.success) {
        setStep("done");
      } else {
        setError(response.data.error ?? "Failed to save network");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 flex h-12 w-12 items-center justify-center rounded-lg">
            <Wifi className="text-primary h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-2xl">
              Connect your UniFi Network
            </CardTitle>
            <CardDescription>
              {step === "input" && "Enter your UniFi API key to get started"}
              {step === "select" && "Select your network to monitor"}
              {step === "done" && "Successfully configured!"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {step === "input" && (
          <form onSubmit={handleApiKeySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">UniFi API Key</Label>
              <Input
                id="apiKey"
                type="password"
                placeholder="Paste your UniFi API Key here"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                required
                className="font-mono"
              />
              <p className="text-muted-foreground text-sm">
                Your API key is encrypted and stored securely
              </p>
            </div>
            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? "Fetching Networks..." : "Fetch Networks"}
            </Button>
          </form>
        )}

        {step === "select" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="network">Select Network</Label>
              <Select
                value={selectedNetwork}
                onValueChange={setSelectedNetwork}
              >
                <SelectTrigger id="network">
                  <SelectValue placeholder="Choose a network to monitor" />
                </SelectTrigger>
                <SelectContent>
                  {networks.map((n) => (
                    <SelectItem key={n._id} value={n._id}>
                      <div className="flex items-center gap-2">
                        <Network className="h-4 w-4" />
                        {n.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("input")}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                className="flex-1"
                disabled={!selectedNetwork || loading}
                onClick={handleNetworkSave}
                size="lg"
              >
                {loading ? "Saving..." : "Save to Profile"}
              </Button>
            </div>
          </div>
        )}

        {step === "done" && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <AlertDescription className="ml-2 text-green-800 dark:text-green-200">
              <strong>Success!</strong> Your UniFi network has been connected.
              You can now access your dashboard to view real-time network data
              and analytics.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
