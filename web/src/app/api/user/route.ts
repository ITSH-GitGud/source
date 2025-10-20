import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { user as userTable } from "@/server/db/schemas/user";
import { eq } from "drizzle-orm";
import {
  updateProfileSchema,
  updateSettingsSchema,
} from "@/lib/validations/user";

export const GET = async (req: Request) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [u] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.id, session.user.id))
    .limit(1);
  if (!u) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({
    success: true,
    user: {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      // settings could be extended later; theme is via next-themes client side
    },
  });
};

export const PATCH = async (req: Request) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body: unknown = await req.json().catch(() => ({}) as unknown);
  const profileParse = updateProfileSchema.safeParse(body);
  const settingsParse = updateSettingsSchema.safeParse(body);

  if (!profileParse.success && !settingsParse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const data: Partial<{ name: string; image?: string | null }> = {};
  if (profileParse.success) {
    data.name = profileParse.data.name;
    if (typeof profileParse.data.image !== "undefined") {
      data.image = profileParse.data.image || null;
    }
  }

  // Settings would normally map to a settings table; theme is handled on client, so no-op here
  // Included to allow future expansion without breaking clients

  if (Object.keys(data).length > 0) {
    await db
      .update(userTable)
      .set(data)
      .where(eq(userTable.id, session.user.id));
  }

  return NextResponse.json({ success: true });
};
