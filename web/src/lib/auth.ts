import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/server/db";
import { user } from "@/server/db/schemas/user";
import { account } from "@/server/db/schemas/account";
import { session } from "@/server/db/schemas/session";
import { verification } from "@/server/db/schemas/verification";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema: {
      user,
      account,
      session,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
});