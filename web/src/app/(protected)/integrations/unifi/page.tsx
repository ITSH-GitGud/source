"use client";
import React, { useState } from "react";
import UnifiSetup from "@/components/custom/unifi-setup";
import UnifiDashboard from "@/components/custom/unifi-dashboard";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Wifi,
  Shield,
  Activity,
  BarChart3,
  Server,
  ArrowLeft,
} from "lucide-react";

export default function UnifiIntegrationPage() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [showSetup, setShowSetup] = useState(false);

  if (!isConfigured && !showSetup) {
    return (
      <div className="container mx-auto py-12">
        <Card className="mx-auto max-w-3xl border-2">
          <CardHeader className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
                <Wifi className="h-8 w-8 text-white" />
              </div>
              <Badge variant="secondary" className="text-sm">
                Network Integration
              </Badge>
            </div>
            <div>
              <CardTitle className="text-4xl font-bold">
                UniFi Network Integration
              </CardTitle>
              <CardDescription className="mt-2 text-base">
                Connect your UniFi network to monitor devices, clients, and
                network health in real-time with beautiful visualizations.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                  <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Real-time Monitoring</h4>
                  <p className="text-muted-foreground text-sm">
                    Track network health and performance metrics live
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-950">
                  <Server className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Device Tracking</h4>
                  <p className="text-muted-foreground text-sm">
                    Monitor all devices with detailed status information
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-950">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Visual Analytics</h4>
                  <p className="text-muted-foreground text-sm">
                    Beautiful charts and graphs for data insights
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg border p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold">Secure Storage</h4>
                  <p className="text-muted-foreground text-sm">
                    Your API keys are encrypted and stored safely
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowSetup(true)}
              className="w-full"
              size="lg"
            >
              <Wifi className="mr-2 h-5 w-5" />
              Get Started - Connect UniFi Network
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showSetup && !isConfigured) {
    return (
      <div className="container mx-auto space-y-6 py-8">
        <Button variant="outline" onClick={() => setShowSetup(false)} size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Overview
        </Button>
        <UnifiSetup />
        <div className="text-center">
          <Button
            variant="ghost"
            onClick={() => setIsConfigured(true)}
            className="text-muted-foreground"
          >
            Skip to dashboard (demo mode)
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            UniFi Network Dashboard
          </h1>
          <p className="text-muted-foreground">
            Real-time monitoring and analytics for your network
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setIsConfigured(false);
            setShowSetup(true);
          }}
        >
          <Wifi className="mr-2 h-4 w-4" />
          Reconfigure
        </Button>
      </div>
      <UnifiDashboard />
    </div>
  );
}
