import { type NextRequest, NextResponse } from "next/server";
import { CommandAcknowledgementSchema } from "@/lib/validations/command";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ deviceId: string; commandId: string }> },
) {
  try {
    const { deviceId, commandId } = await context.params;
    const body = CommandAcknowledgementSchema.parse(await req.json());

    console.log("✅ Command acknowledged:", {
      deviceId,
      commandId,
      status: body.status,
      timestamp: body.timestamp,
    });

    // TODO: Mark command as executed in your database
    // Example with Drizzle:
    // await db
    //   .update(deviceCommands)
    //   .set({
    //     executed: true,
    //     executedAt: new Date(body.timestamp),
    //     status: body.status,
    //   })
    //   .where(eq(deviceCommands.id, commandId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error acknowledging command:", error);
    return NextResponse.json(
      { error: "Failed to acknowledge command" },
      { status: 500 },
    );
  }
}
