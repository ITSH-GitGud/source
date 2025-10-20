import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { registerSensorSchema } from "@/lib/validations/sensor";
import { createSensor, getUserSensors } from "@/server/db/queries/sensor";

export const GET = async (req: Request) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sensors = await getUserSensors(session.user.id);
    return NextResponse.json({
      success: true,
      count: sensors.length,
      sensors,
    });
  } catch (error) {
    console.error("Error retrieving sensors:", error);
    return NextResponse.json(
      { error: "Failed to retrieve sensors" },
      { status: 500 },
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json().catch(() => ({}) as unknown);
    const validation = registerSensorSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validation.error.flatten() },
        { status: 400 },
      );
    }

    const { id, name, measurementType, deviceId, location } = validation.data;

    const [sensor] = await createSensor({
      id,
      userId: session.user.id,
      name,
      measurementType,
      deviceId,
      location,
    });

    return NextResponse.json({
      success: true,
      sensor,
    });
  } catch (error) {
    console.error("Error creating sensor:", error);
    return NextResponse.json(
      { error: "Failed to create sensor" },
      { status: 500 },
    );
  }
};
