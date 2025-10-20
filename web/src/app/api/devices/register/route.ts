import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { upsertDevice } from "@/server/db/queries/device";
import { deviceRegisterSchema } from "@/lib/validations/device";
import { ZodError } from "zod";

export const POST = async (req: Request) => {
  try {
    const body = (await req.json()) as unknown;

    // Validate input
    const validatedData = deviceRegisterSchema.parse(body);

    const session = await auth.api.getSession({
        query: {
        disableCookieCache: true,
      },
      headers: req.headers, // pass the headers
    });

    const userId = session?.user?.id;

    console.log("🔐 Registration attempt:");
    console.log("  Device ID:", validatedData.deviceId);
    console.log("  Session exists:", !!session);
    console.log("  User ID:", userId);

    // Prepare system info
    const systemInfo = validatedData.systemInfo ?? {};

    // Register/update the device
    const result = await upsertDevice({
      id: validatedData.deviceId,
      hostname: validatedData.hostname,
      systemInfo: systemInfo,
      userId
    });

    console.log("  ✅ Device registered with userId:", result[0]?.userId);

    return NextResponse.json({
      success: true,
      message: "Device registered successfully",
      device: result[0],
    });
  } catch (error) {
    console.error("Error registering device:", error);

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation error",
          details: error.errors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to register device" },
      { status: 500 },
    );
  }
};
