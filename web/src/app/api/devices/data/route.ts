import { type NextRequest, NextResponse } from "next/server";
import { DeviceDataRequestSchema } from "@/lib/validations/device-data-request";
import { type LaptopData } from "@/lib/validations/laptop";
import {
  upsertDevice,
  insertDeviceData,
  createDeviceAlert,
  getLatestDeviceData,
  getDevice,
} from "@/server/db/queries/device";

/**
 * Enterprise-level device data handler
 * Receives telemetry data from devices and stores in database
 * Monitors for alerts and anomalies
 */
export async function POST(req: NextRequest) {
  try {
    // Parse and validate incoming data
    const body = DeviceDataRequestSchema.parse(await req.json());
    const { deviceId, timestamp, hostname, data } = body;

    console.log("📊 Data received from:", deviceId);
    console.log("  Time:", timestamp);
    console.log("  Hostname:", hostname);

    // 1. Get existing device to preserve userId, or register new device
    const existingDevice = await getDevice(deviceId);
    const userId = existingDevice.length > 0 ? existingDevice[0]!.userId : null;

    // Register or update device
    await upsertDevice({
      id: deviceId,
      hostname,
      systemInfo: data.system_info,
      userId: userId ?? undefined,
    });

    // 2. Store telemetry data with all metrics
    await insertDeviceData({
      deviceId,
      timestamp: new Date(timestamp),

      // CPU metrics
      cpuUsage: Math.round(data.cpu_info.cpu_usage_percent),
      cpuFreqCurrent: data.cpu_info.cpu_freq_current
        ? Math.round(data.cpu_info.cpu_freq_current)
        : undefined,
      cpuCores: data.cpu_info.total_cores,
      cpuPerCoreUsage: data.cpu_info.per_cpu_usage,

      // Memory metrics
      memoryTotal: Math.round(data.memory_info.total_gb * 1000), // Store as MB
      memoryUsed: Math.round(data.memory_info.used_gb * 1000),
      memoryAvailable: Math.round(data.memory_info.available_gb * 1000),
      memoryPercent: Math.round(data.memory_info.percent),

      // Battery metrics
      batteryPercent: data.battery_info?.percent
        ? Math.round(data.battery_info.percent)
        : undefined,
      batteryPluggedIn: data.battery_info?.plugged_in,
      batteryTimeLeft: data.battery_info?.time_left_seconds ?? undefined,
      batteryStatus: data.battery_info?.battery_status,

      // Power metrics (voltage, charging rate, capacity)
      powerVoltage: data.power_info?.voltage_mv,
      powerCurrentRate: data.power_info?.current_rate_mw,
      powerRemainingCapacity: data.power_info?.remaining_capacity_mwh,
      powerFullChargeCapacity: data.power_info?.full_charge_capacity_mwh,
      powerDesignCapacity: data.power_info?.design_capacity_mwh,

      // Disk metrics
      diskInfo: data.disk_info,

      // Network metrics
      networkBytesSent: data.network_info.bytes_sent,
      networkBytesReceived: data.network_info.bytes_received,
      networkPacketsSent: data.network_info.packets_sent,
      networkPacketsReceived: data.network_info.packets_received,

      // Temperature metrics
      temperatureInfo: data.temperature_info ?? undefined,

      // Full data snapshot for detailed analysis
      fullDataSnapshot: data,
    });

    console.log("  ✅ Data saved to database");

    // 3. Monitor for alerts and create them
    await monitorAndCreateAlerts(deviceId, data);

    // 4. Log key metrics
    console.log("  📈 Metrics:");
    console.log(`     CPU: ${data.cpu_info.cpu_usage_percent}%`);
    console.log(`     Memory: ${data.memory_info.percent}%`);
    if (data.battery_info) {
      console.log(
        `     Battery: ${data.battery_info.percent}% (${data.battery_info.plugged_in ? "Charging" : "On Battery"})`,
      );
    }
    if (data.power_info?.voltage_v) {
      console.log(`     Voltage: ${data.power_info.voltage_v}V`);
    }
    if (data.power_info?.current_rate_w) {
      const rate = data.power_info.current_rate_w;
      const rateType = data.battery_info?.plugged_in ? "Charging" : "Discharge";
      console.log(`     ${rateType} Rate: ${Math.abs(rate).toFixed(2)}W`);
    }

    return NextResponse.json({
      success: true,
      receivedAt: new Date().toISOString(),
      message: "Data stored successfully",
    });
  } catch (error) {
    console.error("❌ Error processing device data:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: "Failed to process data",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Failed to process data" },
      { status: 500 },
    );
  }
}

/**
 * Monitor device metrics and create alerts for anomalies
 */
async function monitorAndCreateAlerts(deviceId: string, data: LaptopData) {
  const alerts: Array<{
    type: string;
    severity: "info" | "warning" | "critical";
    message: string;
    value?: number;
    threshold?: number;
  }> = [];

  // CPU alerts
  if (data.cpu_info.cpu_usage_percent > 90) {
    alerts.push({
      type: "cpu_high",
      severity: "critical",
      message: `CPU usage critically high: ${data.cpu_info.cpu_usage_percent}%`,
      value: data.cpu_info.cpu_usage_percent,
      threshold: 90,
    });
  } else if (data.cpu_info.cpu_usage_percent > 75) {
    alerts.push({
      type: "cpu_high",
      severity: "warning",
      message: `CPU usage high: ${data.cpu_info.cpu_usage_percent}%`,
      value: data.cpu_info.cpu_usage_percent,
      threshold: 75,
    });
  }

  // Memory alerts
  if (data.memory_info.percent > 90) {
    alerts.push({
      type: "memory_high",
      severity: "critical",
      message: `Memory usage critically high: ${data.memory_info.percent}%`,
      value: data.memory_info.percent,
      threshold: 90,
    });
  } else if (data.memory_info.percent > 80) {
    alerts.push({
      type: "memory_high",
      severity: "warning",
      message: `Memory usage high: ${data.memory_info.percent}%`,
      value: data.memory_info.percent,
      threshold: 80,
    });
  }

  // Battery alerts
  if (data.battery_info && !data.battery_info.plugged_in) {
    if (data.battery_info.percent < 10) {
      alerts.push({
        type: "battery_critical",
        severity: "critical",
        message: `Battery critically low: ${data.battery_info.percent}%`,
        value: data.battery_info.percent,
        threshold: 10,
      });
    } else if (data.battery_info.percent < 20) {
      alerts.push({
        type: "battery_low",
        severity: "warning",
        message: `Battery low: ${data.battery_info.percent}%`,
        value: data.battery_info.percent,
        threshold: 20,
      });
    }
  }

  // Disk space alerts
  if (data.disk_info && Array.isArray(data.disk_info)) {
    for (const disk of data.disk_info) {
      if (disk.percent > 90) {
        alerts.push({
          type: "disk_full",
          severity: "critical",
          message: `Disk ${disk.device} almost full: ${disk.percent}%`,
          value: disk.percent,
          threshold: 90,
        });
      } else if (disk.percent > 80) {
        alerts.push({
          type: "disk_full",
          severity: "warning",
          message: `Disk ${disk.device} running low: ${disk.percent}%`,
          value: disk.percent,
          threshold: 80,
        });
      }
    }
  }

  // Temperature alerts (if available)
  if (data.temperature_info) {
    for (const [sensorName, sensors] of Object.entries(data.temperature_info)) {
      if (Array.isArray(sensors)) {
        for (const sensor of sensors) {
          if (sensor.current > 85) {
            alerts.push({
              type: "temperature_high",
              severity: "critical",
              message: `${sensorName} temperature critical: ${sensor.current}°C`,
              value: sensor.current,
              threshold: 85,
            });
          } else if (sensor.current > 75) {
            alerts.push({
              type: "temperature_high",
              severity: "warning",
              message: `${sensorName} temperature high: ${sensor.current}°C`,
              value: sensor.current,
              threshold: 75,
            });
          }
        }
      }
    }
  }

  // Battery health alert (if power info available)
  if (
    data.power_info?.full_charge_capacity_mwh &&
    data.power_info?.design_capacity_mwh
  ) {
    const health =
      (data.power_info.full_charge_capacity_mwh /
        data.power_info.design_capacity_mwh) *
      100;
    if (health < 60) {
      alerts.push({
        type: "battery_health",
        severity: "warning",
        message: `Battery health degraded: ${health.toFixed(1)}%`,
        value: Math.round(health),
        threshold: 60,
      });
    }
  }

  // Create alerts in database
  for (const alert of alerts) {
    try {
      await createDeviceAlert({
        deviceId,
        alertType: alert.type,
        severity: alert.severity,
        message: alert.message,
        value: alert.value,
        threshold: alert.threshold,
      });
      console.log(`  ⚠️  Alert created: ${alert.message}`);
    } catch (error) {
      console.error("  ❌ Failed to create alert:", error);
    }
  }
}

/**
 * GET endpoint to retrieve device data
 * Query params: limit (default: 100), hours (default: 24)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const deviceId = searchParams.get("deviceId");
    const limit = parseInt(searchParams.get("limit") ?? "100");

    if (!deviceId) {
      return NextResponse.json(
        { error: "deviceId parameter required" },
        { status: 400 },
      );
    }

    const data = await getLatestDeviceData(deviceId, limit);

    return NextResponse.json({
      success: true,
      deviceId,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Error retrieving device data:", error);
    return NextResponse.json(
      { error: "Failed to retrieve data" },
      { status: 500 },
    );
  }
}
