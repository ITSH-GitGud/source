import { NextResponse } from "next/server";
import { getUserDevices } from "@/server/db/queries/device";
import { auth } from "@/lib/auth";

export const GET = async (req: Request) => {
  try {
    const session = await auth.api.getSession({ headers: req.headers });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;
    const devices = await getUserDevices(userId);
    return NextResponse.json({
      success: true,
      count: devices.length,
      devices,
    });
  } catch (error) {
    console.error("Error retrieving devices:", error);
    return NextResponse.json(
      { error: "Failed to retrieve devices" },
      { status: 500 },
    );
  }
};
