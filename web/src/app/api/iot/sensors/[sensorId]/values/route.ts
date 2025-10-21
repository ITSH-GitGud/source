import { type NextRequest, NextResponse } from "next/server";
import { sensorReadingSchema } from "@/lib/validations/sensor";
import { getSensorById, insertSensorData } from "@/server/db/queries/sensor";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const OPTIONS = async () =>
  new NextResponse(null, { headers: corsHeaders });

// Unauthenticated endpoint: push a reading for a sensor
export const POST = async (
  req: NextRequest,
  context: { params: Promise<{ sensorId: string }> },
) => {
  try {
    const { sensorId } = await context.params;

    // Verify sensor exists (avoid orphan data)
    const existing = await getSensorById(sensorId);
    if (existing.length === 0) {
      return NextResponse.json(
        { error: "Sensor not found" },
        { status: 404, headers: corsHeaders },
      );
    }

    const raw: unknown = await req.json().catch(() => ({}) as unknown);
    const parse = sensorReadingSchema.safeParse(raw);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parse.error.flatten() },
        { status: 400, headers: corsHeaders },
      );
    }

    const { value, unit, metadata } = parse.data;

    // Normalize timestamp: allow seconds, ms, or ISO string; default now
    let ts = new Date();
    const t = parse.data.timestamp;
    if (typeof t === "number") {
      ts = new Date(t < 2_000_000_000 ? t * 1000 : t);
    } else if (typeof t === "string") {
      const d = new Date(t);
      if (!isNaN(d.getTime())) ts = d;
    }

    await insertSensorData({
      sensorId,
      timestamp: ts,
      value: typeof value === "object" ? JSON.stringify(value) : String(value),
      unit,
      metadata,
    });

    return NextResponse.json(
      { success: true },
      { status: 201, headers: corsHeaders },
    );
  } catch (error) {
    console.error("[IOT] Insert sensor value error:", error);
    return NextResponse.json(
      { error: "Failed to insert value" },
      { status: 500, headers: corsHeaders },
    );
  }
};
