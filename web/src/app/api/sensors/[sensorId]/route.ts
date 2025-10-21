import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { updateSensorSchema } from "@/lib/validations/sensor";
import {
  getSensorById,
  updateSensor,
  deleteSensor,
  getLatestSensorData,
} from "@/server/db/queries/sensor";

export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ sensorId: string }> },
) => {
  try {
    const { sensorId } = await context.params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [sensor] = await getSensorById(sensorId);
    if (!sensor) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    if (sensor.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get latest sensor data (last 10 readings)
    const latestData = await getLatestSensorData(sensorId, 10);

    return NextResponse.json({
      success: true,
      sensor,
      latestData,
    });
  } catch (error) {
    console.error("Error retrieving sensor:", error);
    return NextResponse.json(
      { error: "Failed to retrieve sensor" },
      { status: 500 },
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  context: { params: Promise<{ sensorId: string }> },
) => {
  try {
    const { sensorId } = await context.params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [sensor] = await getSensorById(sensorId);
    if (!sensor) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    if (sensor.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body: unknown = await req.json().catch(() => ({}) as unknown);
    const validation = updateSensorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const [updatedSensor] = await updateSensor(sensorId, validation.data);

    return NextResponse.json({
      success: true,
      sensor: updatedSensor,
    });
  } catch (error) {
    console.error("Error updating sensor:", error);
    return NextResponse.json(
      { error: "Failed to update sensor" },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<{ sensorId: string }> },
) => {
  try {
    const { sensorId } = await context.params;
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [sensor] = await getSensorById(sensorId);
    if (!sensor) {
      return NextResponse.json({ error: "Sensor not found" }, { status: 404 });
    }

    if (sensor.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteSensor(sensorId);

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Error deleting sensor:", error);
    return NextResponse.json(
      { error: "Failed to delete sensor" },
      { status: 500 },
    );
  }
};
