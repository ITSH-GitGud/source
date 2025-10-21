"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Users,
  Server,
  Wifi,
  AlertTriangle,
  Globe,
  TrendingUp,
} from "lucide-react";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#A020F0",
  "#FF6384",
];

type InternetIssue = {
  highLatency?: boolean;
  index?: number;
  latencyAvgMs?: number;
  latencyMaxMs?: number;
  wanDowntime?: boolean;
  count?: number;
};

type UnifiData = {
  siteId?: string;
  siteName?: string;
  siteDescription?: string;
  timezone?: string;
  gatewayMac?: string;
  statistics?: {
    counts?: Record<string, number>;
    gateway?: Record<string, unknown>;
    internetIssues?: InternetIssue[];
    ispInfo?: { name?: string; organization?: string };
    percentages?: { txRetry?: number; wanUptime?: number };
    wans?: Record<string, unknown>;
  };
  health?: Array<{ subsystem?: string; status?: string }>;
  devices?: Array<Record<string, unknown>>;
};

export default function UnifiDashboard() {
  const [data, setData] = useState<UnifiData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get<{ data?: UnifiData; error?: string }>(
          "/api/unifi",
        );
        if (response.data.data) {
          setData(response.data.data);
        } else {
          setError(response.data.error ?? "No data");
        }
      } catch {
        setError("Failed to load data");
      }
      setLoading(false);
    }
    void fetchData();
  }, []);

  const health = Array.isArray(data?.health) ? data.health : [];
  const stats = data?.statistics;
  const counts = stats?.counts ?? {};
  const ispInfo = stats?.ispInfo;
  const percentages = stats?.percentages;
  const internetIssues = stats?.internetIssues ?? [];
  const gateway = stats?.gateway;

  // Latency chart data from internet issues
  const latencyData = internetIssues
    .filter((issue) => issue.latencyAvgMs !== undefined)
    .map((issue, idx) => ({
      index: issue.index ?? idx,
      avgLatency: issue.latencyAvgMs ?? 0,
      maxLatency: issue.latencyMaxMs ?? 0,
    }));

  // WAN Uptime chart
  const uptimeData = [
    { name: "WAN Uptime", value: percentages?.wanUptime ?? 0 },
    { name: "Downtime", value: 100 - (percentages?.wanUptime ?? 0) },
  ];

  // Device status pie chart
  const deviceStatusData = [
    {
      name: "Online",
      value: (counts.totalDevice ?? 0) - (counts.offlineDevice ?? 0),
    },
    { name: "Offline", value: counts.offlineDevice ?? 0 },
  ];

  // Client breakdown
  const clientData = [
    { name: "Wi-Fi Clients", value: counts.wifiClient ?? 0 },
    { name: "Wired Clients", value: counts.wiredClient ?? 0 },
    { name: "Guest Clients", value: counts.guestClient ?? 0 },
  ];

  return (
    <div className="space-y-6">
      {loading && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <>
          {/* Site Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Overview
              </CardTitle>
              <CardDescription>
                {data?.siteName ?? "Unknown Site"} •{" "}
                {data?.siteDescription ?? "No description"}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-muted-foreground text-sm">Site ID</p>
                <p className="font-mono text-sm">{data?.siteId ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Timezone</p>
                <p className="text-sm">{data?.timezone ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Gateway MAC</p>
                <p className="font-mono text-sm">{data?.gatewayMac ?? "N/A"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">ISP</p>
                <p className="text-sm">{ispInfo?.name ?? "Unknown"}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Gateway</p>
                <p className="text-sm">
                  {(gateway?.shortname as string) ?? "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Devices
                </CardTitle>
                <Server className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {counts.totalDevice ?? 0}
                </div>
                <p className="text-muted-foreground text-xs">
                  {counts.offlineDevice ?? 0} offline
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Connected Clients
                </CardTitle>
                <Users className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(counts.wifiClient ?? 0) + (counts.wiredClient ?? 0)}
                </div>
                <p className="text-muted-foreground text-xs">
                  {counts.wifiClient ?? 0} Wi-Fi, {counts.wiredClient ?? 0}{" "}
                  wired
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  WAN Uptime
                </CardTitle>
                <TrendingUp className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {percentages?.wanUptime?.toFixed(1) ?? 0}%
                </div>
                <p className="text-muted-foreground text-xs">
                  {percentages?.txRetry?.toFixed(1) ?? 0}% tx retry
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Network Health
                </CardTitle>
                <Activity className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {health.filter((h) => h.status === "ok").length}/
                  {health.length}
                </div>
                <p className="text-muted-foreground text-xs">
                  Subsystems operational
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ISP & Internet Health Charts */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Internet Latency (ms)</CardTitle>
                <CardDescription>
                  Average and max latency from recent measurements
                </CardDescription>
              </CardHeader>
              <CardContent>
                {latencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={latencyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="index" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avgLatency"
                        stroke="#0088FE"
                        strokeWidth={2}
                        name="Avg Latency"
                      />
                      <Line
                        type="monotone"
                        dataKey="maxLatency"
                        stroke="#FF8042"
                        strokeWidth={2}
                        name="Max Latency"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-muted-foreground text-center text-sm">
                    No latency data available
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>WAN Uptime</CardTitle>
                <CardDescription>
                  Connection reliability percentage
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={uptimeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {uptimeData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={idx === 0 ? "#00C49F" : "#FF8042"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Device & Client Distribution */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Device Status</CardTitle>
                <CardDescription>Online vs Offline devices</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={deviceStatusData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {deviceStatusData.map((entry, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Distribution</CardTitle>
                <CardDescription>Connected clients by type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={clientData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#0088FE" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          {(counts.criticalNotification ?? 0) > 0 && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                  <AlertTriangle className="h-5 w-5" />
                  Critical Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900 dark:text-orange-100">
                  {counts.criticalNotification}
                </div>
                <p className="text-muted-foreground text-sm">
                  Active critical alerts requiring attention
                </p>
              </CardContent>
            </Card>
          )}

          {/* Network Configuration Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                Network Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-muted-foreground text-sm">Wi-Fi Networks</p>
                <p className="text-2xl font-bold">
                  {counts.wifiConfiguration ?? 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">LAN Configs</p>
                <p className="text-2xl font-bold">
                  {counts.lanConfiguration ?? 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">WAN Configs</p>
                <p className="text-2xl font-bold">
                  {counts.wanConfiguration ?? 0}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Pending Updates</p>
                <p className="text-2xl font-bold">
                  {counts.pendingUpdateDevice ?? 0}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Internet Issues List */}
          {internetIssues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Internet Issues</CardTitle>
                <CardDescription>
                  Latency spikes and downtime events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {internetIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="border-muted flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        {issue.highLatency && (
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                        )}
                        {issue.wanDowntime && (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <div>
                          <p className="text-sm font-medium">
                            {issue.highLatency && "High Latency"}
                            {issue.wanDowntime && "WAN Downtime"}
                            {!issue.highLatency &&
                              !issue.wanDowntime &&
                              "Other Issue"}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            Index: {issue.index ?? "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {issue.latencyAvgMs !== undefined && (
                          <p className="text-sm">
                            Avg: {issue.latencyAvgMs}ms / Max:{" "}
                            {issue.latencyMaxMs}ms
                          </p>
                        )}
                        {issue.count !== undefined && (
                          <p className="text-muted-foreground text-xs">
                            Count: {issue.count}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
