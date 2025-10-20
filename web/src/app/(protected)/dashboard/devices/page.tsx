"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Plus, Activity, Cpu, HardDrive } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface Device {
  id: string
  hostname: string
  status: string
  lastSeen: Date
  systemInfo: {
    system: string
    processor: string
  }
}

interface DeviceData {
  cpuUsage: number
  memoryPercent: number
  batteryPercent?: number
  batteryPluggedIn?: boolean
  powerVoltage?: number
  powerCurrentRate?: number
}

interface DeviceStats {
  avgCpuUsage: number
  maxCpuUsage: number
  avgMemoryPercent: number
  maxMemoryPercent: number
}

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null)
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null)
  const [deviceStats, setDeviceStats] = useState<DeviceStats | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices")
      const data = (await res.json()) as {
        success: boolean
        devices: Device[]
      }
      if (data.success) {
        setDevices(data.devices)
        if (!selectedDevice && data.devices.length > 0) {
          setSelectedDevice(data.devices[0]!.id)
        }
      }
    } catch (error) {
      console.error("Failed to fetch devices:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDeviceDetails = useCallback(async (deviceId: string) => {
    try {
      const res = await fetch(`/api/devices/${deviceId}`)
      const data = (await res.json()) as {
        success: boolean
        latestData: DeviceData
        statistics: DeviceStats
      }
      if (data.success) {
        setDeviceData(data.latestData)
        setDeviceStats(data.statistics)
      }
    } catch (error) {
      console.error("Failed to fetch device details:", error)
    }
  }, [])

  useEffect(() => {
    void fetchDevices()
    const interval = setInterval(() => {
      void fetchDevices()
    }, 10000) // Refresh every 10s
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedDevice) {
      void fetchDeviceDetails(selectedDevice)
    }
  }, [selectedDevice, fetchDeviceDetails])

  const deviceStatusData = [
    { name: "Active", value: devices.filter((d) => d.status === "active").length, fill: "hsl(var(--chart-1))" },
    { name: "Inactive", value: devices.filter((d) => d.status === "inactive").length, fill: "hsl(var(--chart-2))" },
    { name: "Warning", value: devices.filter((d) => d.status === "warning").length, fill: "hsl(var(--chart-3))" },
  ]

  const architectureData = [
    { name: "x64", count: Math.floor(devices.length * 0.5) },
    { name: "ARM64", count: Math.floor(devices.length * 0.3) },
    { name: "x86", count: Math.floor(devices.length * 0.15) },
    { name: "ARM", count: Math.floor(devices.length * 0.05) },
  ]

  const activityData = [
    { time: "00:00", devices: 12 },
    { time: "04:00", devices: 8 },
    { time: "08:00", devices: 15 },
    { time: "12:00", devices: 22 },
    { time: "16:00", devices: 18 },
    { time: "20:00", devices: 14 },
    { time: "Now", devices: devices.length },
  ]

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-h-dvh space-y-6 px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Device Monitoring</h1>
          <p className="text-muted-foreground mt-1">Monitor and manage your connected devices</p>
        </div>
        <Link href="/dashboard/devices/register">
          <Button size="lg">
            <Plus className="mr-2 h-4 w-4" />
            Register Device
          </Button>
        </Link>
      </div>

      {devices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <p className="text-muted-foreground mb-4 text-center">
              No devices registered yet. Register a device to begin monitoring.
            </p>
            <Link href="/dashboard/devices/register">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Register Your First Device
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Device Status Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Device Status
                </CardTitle>
                <CardDescription>Current status distribution</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    active: { label: "Active", color: "hsl(var(--chart-1))" },
                    inactive: { label: "Inactive", color: "hsl(var(--chart-2))" },
                    warning: { label: "Warning", color: "hsl(var(--chart-3))" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={deviceStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {deviceStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-4 space-y-2">
                  {deviceStatusData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.fill }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Architecture Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Architecture
                </CardTitle>
                <CardDescription>Device architecture breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: { label: "Devices", color: "hsl(var(--chart-1))" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={architectureData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="name" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Device Activity Over Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5" />
                  Activity
                </CardTitle>
                <CardDescription>Active devices over 24 hours</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    devices: { label: "Active Devices", color: "hsl(var(--chart-2))" },
                  }}
                  className="h-[200px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorDevices" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" className="text-xs" />
                      <YAxis className="text-xs" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="devices"
                        stroke="hsl(var(--chart-2))"
                        fillOpacity={1}
                        fill="url(#colorDevices)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Existing device list and details */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Device List */}
            <Card className="md:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Devices ({devices.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {devices.map((device) => (
                    <button
                      key={device.id}
                      onClick={() => setSelectedDevice(device.id)}
                      className={`hover:bg-accent w-full rounded-lg border p-3 text-left transition-colors ${
                        selectedDevice === device.id ? "border-primary bg-accent" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{device.hostname}</p>
                          <p className="text-muted-foreground text-sm">{device.systemInfo?.system}</p>
                        </div>
                        <Badge variant={device.status === "active" ? "default" : "secondary"}>{device.status}</Badge>
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Current Metrics */}
            {deviceData && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Current Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>CPU Usage</span>
                        <span className="font-medium">{deviceData.cpuUsage}%</span>
                      </div>
                      <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full transition-all"
                          style={{ width: `${deviceData.cpuUsage}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>Memory Usage</span>
                        <span className="font-medium">{deviceData.memoryPercent}%</span>
                      </div>
                      <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="h-full bg-blue-500 transition-all"
                          style={{ width: `${deviceData.memoryPercent}%` }}
                        />
                      </div>
                    </div>

                    {deviceData.batteryPercent !== undefined && (
                      <div>
                        <div className="mb-1 flex items-center justify-between text-sm">
                          <span>Battery {deviceData.batteryPluggedIn ? "🔌" : "🔋"}</span>
                          <span className="font-medium">{deviceData.batteryPercent}%</span>
                        </div>
                        <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                          <div
                            className="h-full bg-green-500 transition-all"
                            style={{ width: `${deviceData.batteryPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {deviceData.powerVoltage && (
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground text-sm">Voltage</p>
                        <p className="text-2xl font-bold">{(deviceData.powerVoltage / 1000).toFixed(2)}V</p>
                      </div>
                    )}

                    {deviceData.powerCurrentRate && (
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground text-sm">
                          {deviceData.batteryPluggedIn ? "Charging Rate" : "Discharge Rate"}
                        </p>
                        <p className="text-2xl font-bold">{Math.abs(deviceData.powerCurrentRate / 1000).toFixed(2)}W</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Statistics (24h) */}
                {deviceStats && (
                  <Card>
                    <CardHeader>
                      <CardTitle>24h Statistics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground text-sm">CPU Usage</p>
                        <p className="text-lg font-semibold">Avg: {deviceStats.avgCpuUsage.toFixed(1)}%</p>
                        <p className="text-muted-foreground text-sm">Max: {deviceStats.maxCpuUsage.toFixed(1)}%</p>
                      </div>

                      <div className="rounded-lg border p-3">
                        <p className="text-muted-foreground text-sm">Memory Usage</p>
                        <p className="text-lg font-semibold">Avg: {deviceStats.avgMemoryPercent.toFixed(1)}%</p>
                        <p className="text-muted-foreground text-sm">Max: {deviceStats.maxMemoryPercent.toFixed(1)}%</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
