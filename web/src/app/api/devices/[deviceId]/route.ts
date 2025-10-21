import { type NextRequest, NextResponse } from "next/server";
import {
  getDevice,
  getLatestDeviceData,
  getDeviceStats,
  getDeviceAlerts,
} from "@/server/db/queries/device";

/**
 * GET /api/devices/{deviceId}
 * Retrieve device information, latest data, and statistics
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ deviceId: string }> },
) {
  try {
    const { deviceId } = await context.params;

    // Get device info
    const deviceInfo = await getDevice(deviceId);
    if (deviceInfo.length === 0) {
      return NextResponse.json({ error: "Device not found" }, { status: 404 });
    }

    // Get latest data point
    const latestData = await getLatestDeviceData(deviceId, 1);

    // Get statistics (last 24 hours)
    const stats = await getDeviceStats(deviceId, 24);

    // Get active alerts
    const alerts = await getDeviceAlerts(deviceId, false);

    return NextResponse.json({
      success: true,
      device: deviceInfo[0],
      latestData: latestData[0] ?? null,
      statistics: stats,
      activeAlerts: alerts,
    });
  } catch (error) {
    console.error("Error retrieving device:", error);
    return NextResponse.json(
      { error: "Failed to retrieve device" },
      { status: 500 },
    );
  }
}
