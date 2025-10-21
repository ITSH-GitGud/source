"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gauge, Loader2, Activity } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Sensor {
  id: string;
  name: string;
  measurementType: string;
  deviceId?: string | null;
  location?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface SensorData {
  id: number;
  sensorId: string;
  timestamp: string;
  value: string;
  unit?: string | null;
  receivedAt: string;
}

export default function SensorDetailPage() {
  const router = useRouter();
  const params = useParams();
  const sensorId = params.sensorId as string;

  const [sensor, setSensor] = useState<Sensor | null>(null);
  const [latestData, setLatestData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSensorDetails = async () => {
      try {
        const response = await axios.get<{
          success: boolean;
          sensor: Sensor;
          latestData: SensorData[];
        }>(`/api/sensors/${sensorId}`);

        if (response.data.success) {
          setSensor(response.data.sensor);
          setLatestData(response.data.latestData);
        }
      } catch (error) {
        console.error("Error fetching sensor details:", error);
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          toast.error("Sensor not found");
          router.push("/dashboard/sensors");
        } else {
          toast.error("Failed to load sensor details");
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (sensorId) {
      void fetchSensorDetails();
    }
  }, [sensorId, router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "inactive":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      case "offline":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const formatTimeShort = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Prepare chart data (reverse to show oldest to newest)
  const chartData = [...latestData].reverse().map((data) => ({
    time: formatTimeShort(data.timestamp),
    voltage: parseFloat(data.value),
    fullTime: formatDateTime(data.timestamp),
  }));

  if (isLoading) {
    return (
      <div className="container min-w-full space-y-6 py-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!sensor) {
    return null;
  }

  return (
    <div className="container min-w-full space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/dashboard/sensors")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {sensor.name || sensor.id}
            </h1>
            <p className="text-muted-foreground">
              Sensor details and latest readings
            </p>
          </div>
        </div>
        <Badge variant="secondary" className={getStatusColor(sensor.status)}>
          {sensor.status}
        </Badge>
      </div>

      {/* Sensor Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Sensor Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-muted-foreground text-sm">Sensor ID</p>
            <p className="font-mono text-sm">{sensor.id}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Measurement Type</p>
            <Badge variant="outline">
              {sensor.measurementType
                .replace(/_/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
            </Badge>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Location</p>
            <p className="text-sm">{sensor.location ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Device ID</p>
            <p className="font-mono text-sm">{sensor.deviceId ?? "—"}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Created At</p>
            <p className="text-sm">{formatDateTime(sensor.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Last Updated</p>
            <p className="text-sm">{formatDateTime(sensor.updatedAt)}</p>
          </div>
        </CardContent>
      </Card>

      {/* Voltage Graph Card */}
      {latestData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Voltage Over Time
            </CardTitle>
            <CardDescription>
              Visual representation of the last {chartData.length} voltage
              readings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="time"
                  tick={{ fill: "var(--foreground)", fontSize: 12 }}
                  stroke="hsl(var(--border))"
                />
                <YAxis
                  label={{
                    value: "Voltage (V)",
                    angle: -90,
                    position: "insideLeft",
                    style: {
                      fill: "var(--foreground)",
                      fontSize: 14,
                      fontWeight: 500,
                    },
                  }}
                  tick={{ fill: "var(--foreground)", fontSize: 12 }}
                  stroke="hsl(var(--border))"
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px",
                    color: "hsl(var(--foreground))",
                  }}
                  labelStyle={{
                    color: "hsl(var(--foreground))",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                  formatter={(value: number) => [
                    `${value.toFixed(2)} V`,
                    "Voltage",
                  ]}
                  labelFormatter={(label, payload) => {
                    const data = payload?.[0]?.payload as
                      | { fullTime?: string }
                      | undefined;
                    return data?.fullTime ?? String(label);
                  }}
                />
                <Legend
                  wrapperStyle={{
                    color: "hsl(var(--foreground))",
                    fontSize: "14px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="voltage"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", r: 5 }}
                  activeDot={{ r: 7, fill: "#2563eb" }}
                  name="Voltage (V)"
                  connectNulls
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Latest Sensor Data Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Latest Readings
          </CardTitle>
          <CardDescription>
            {latestData.length > 0
              ? `Last ${latestData.length} readings from this sensor`
              : "No data available"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No data yet</h3>
              <p className="text-muted-foreground text-sm">
                This sensor hasn&apos;t sent any data yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Received At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {latestData.map((data) => (
                  <TableRow key={data.id}>
                    <TableCell>{formatDateTime(data.timestamp)}</TableCell>
                    <TableCell className="font-mono font-medium">
                      {data.value}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{data.unit ?? "—"}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDateTime(data.receivedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
