import { getAllDevices, getDeviceAlerts } from "@/server/db/queries/device";
import { getUserSensors } from "@/server/db/queries/sensor";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Server,
  Thermometer,
  TrendingUp,
  Wifi,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const devices = await getAllDevices();

  // Get user-scoped sensors
  const sensors = session?.user?.id
    ? await getUserSensors(session.user.id)
    : [];

  // Calculate device statistics
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const onlineDevices = devices.filter(
    (d) => d.lastSeen && new Date(d.lastSeen) > fiveMinutesAgo,
  );
  const offlineDevices = devices.filter(
    (d) => !d.lastSeen || new Date(d.lastSeen) <= fiveMinutesAgo,
  );

  // Get recent alerts across all devices
  const recentAlerts = (
    await Promise.all(
      devices.slice(0, 10).map((d) => getDeviceAlerts(d.id, false)),
    )
  ).flat();

  // Calculate sensor statistics
  const activeSensors = sensors.filter((s) => s.status === "active");
  const inactiveSensors = sensors.filter((s) => s.status !== "active");

  // Get most recent devices
  const recentDevices = devices.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
        <CardHeader>
          <CardTitle className="text-2xl">
            Welcome back, {session?.user?.name ?? "User"}!
          </CardTitle>
          <CardDescription>
            Here&apos;s an overview of your IoT infrastructure
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Server className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices.length}</div>
            <p className="text-muted-foreground text-xs">
              {onlineDevices.length} online, {offlineDevices.length} offline
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sensors
            </CardTitle>
            <Thermometer className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSensors.length}</div>
            <p className="text-muted-foreground text-xs">
              {inactiveSensors.length} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAlerts.length}</div>
            <p className="text-muted-foreground text-xs">
              Unresolved notifications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="text-muted-foreground h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {offlineDevices.length === 0 && recentAlerts.length === 0 ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">
                    Healthy
                  </span>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    Attention
                  </span>
                </>
              )}
            </div>
            <p className="text-muted-foreground text-xs">Overall status</p>
          </CardContent>
        </Card>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Devices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Recent Devices
            </CardTitle>
            <CardDescription>Latest activity from your devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDevices.length > 0 ? (
                recentDevices.map((device) => {
                  const isOnline =
                    device.lastSeen &&
                    new Date(device.lastSeen) > fiveMinutesAgo;
                  return (
                    <div
                      key={device.id}
                      className="border-muted flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
                        />
                        <div>
                          <p className="font-medium">{device.hostname}</p>
                          <p className="text-muted-foreground text-xs">
                            {device.status ?? "Unknown Status"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={isOnline ? "default" : "secondary"}>
                          {isOnline ? "Online" : "Offline"}
                        </Badge>
                        {device.lastSeen && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            {new Date(device.lastSeen).toLocaleTimeString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center text-sm">
                  No devices found
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>
              Unresolved notifications requiring attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentAlerts.length > 0 ? (
                recentAlerts.slice(0, 5).map((alert) => (
                  <div
                    key={alert.id}
                    className="border-muted flex items-start justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-start gap-3">
                      <AlertTriangle
                        className={`mt-0.5 h-4 w-4 ${
                          alert.severity === "critical"
                            ? "text-red-500"
                            : alert.severity === "warning"
                              ? "text-orange-500"
                              : "text-yellow-500"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium">{alert.alertType}</p>
                        <p className="text-muted-foreground text-xs">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        alert.severity === "critical"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">
                    No active alerts
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sensors Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5" />
              Sensors Overview
            </CardTitle>
            <CardDescription>Your configured sensor endpoints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sensors.length > 0 ? (
                sensors.slice(0, 5).map((sensor) => (
                  <div
                    key={sensor.id}
                    className="border-muted flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-2 w-2 rounded-full ${sensor.status === "active" ? "bg-green-500" : "bg-gray-400"}`}
                      />
                      <div>
                        <p className="font-medium">{sensor.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {sensor.measurementType}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        sensor.status === "active" ? "default" : "secondary"
                      }
                    >
                      {sensor.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center text-sm">
                  No sensors configured
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Quick Statistics
            </CardTitle>
            <CardDescription>Summary of your infrastructure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">Device Uptime</span>
                </div>
                <span className="text-sm font-bold">
                  {devices.length > 0
                    ? `${((onlineDevices.length / devices.length) * 100).toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">Sensor Utilization</span>
                </div>
                <span className="text-sm font-bold">
                  {sensors.length > 0
                    ? `${((activeSensors.length / sensors.length) * 100).toFixed(1)}%`
                    : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">Alert Rate</span>
                </div>
                <span className="text-sm font-bold">
                  {recentAlerts.length} active
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="text-muted-foreground h-4 w-4" />
                  <span className="text-sm">Last Updated</span>
                </div>
                <span className="text-muted-foreground text-xs">
                  {new Date().toLocaleTimeString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
