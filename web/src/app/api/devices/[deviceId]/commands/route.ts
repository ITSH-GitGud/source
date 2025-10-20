import { type NextRequest, NextResponse } from "next/server";
import { getPendingCommands } from "@/server/db/queries/device";

/**
 * GET endpoint - Retrieve pending commands for a device
 * Used by desktop client to check for commands
 */
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ deviceId: string }> },
) {
  try {
    const { deviceId } = await context.params;

    if (!deviceId) {
      return NextResponse.json(
        { error: "Device ID is required" },
        { status: 400 },
      );
    }

    // Get pending commands for this device
    const commands = await getPendingCommands(deviceId);

    // Transform to simple format for desktop client
    const formattedCommands = commands.map((cmd) => ({
      id: cmd.id,
      type: cmd.commandType,
      payload: cmd.payload,
      createdAt: cmd.createdAt,
    }));

    return NextResponse.json({
      success: true,
      deviceId,
      count: formattedCommands.length,
      commands: formattedCommands,
    });
  } catch (error) {
    console.error("Error retrieving commands:", error);
    return NextResponse.json(
      { error: "Failed to retrieve commands" },
      { status: 500 },
    );
  }
}
