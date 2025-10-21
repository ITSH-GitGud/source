import { NextResponse } from "next/server";
import { getSensorById } from "@/server/db/queries/sensor";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const OPTIONS = async () =>
  new NextResponse(null, { headers: corsHeaders });

// Unauthenticated endpoint for hardware to register a sensor
export const POST = async (req: Request) => {
  try {
    const raw: unknown = await req.json().catch(() => ({}) as unknown);
    // Accept only { id, volts } from payload
    if (
      typeof raw !== "object" ||
      raw === null ||
      !("id" in raw) ||
      !("volts" in raw)
    ) {
      return NextResponse.json(
        { error: "Invalid input. Must include 'id' and 'volts'." },
        { status: 400, headers: corsHeaders },
      );
    }
    const { id, volts } = raw as { id: string; volts: number };

    // Check if sensor exists in the sensors table
    const existing = await getSensorById(id);

    if (existing.length === 0) {
      // Sensor doesn't exist - reject the data
      return NextResponse.json(
        { error: "Sensor not found. Please register the sensor first." },
        { status: 404, headers: corsHeaders },
      );
    }

    const sensor = existing[0];

    // Insert sensor data reading only if sensor exists
    const { insertSensorData } = await import("@/server/db/queries/sensor");
    await insertSensorData({
      sensorId: id,
      timestamp: new Date(),
      value: String(volts),
      unit: "V",
      metadata: {},
    });

    return NextResponse.json(
      { success: true, sensor, dataInserted: true },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("[IOT] Register sensor error:", error);
    return NextResponse.json(
      { error: "Failed to register sensor" },
      { status: 500, headers: corsHeaders },
    );
  }
};
