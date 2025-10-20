import { createClient, type Client } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

import { env } from "@/env";
import * as user from "./schemas/user";
import * as account from "./schemas/account";
import * as session from "./schemas/session";
import * as verification from "./schemas/verification";
import * as device from "./schemas/device";
import * as sensor from "./schemas/sensor";

const globalForDb = globalThis as unknown as {
  client: Client | undefined;
};

export const client =
  globalForDb.client ?? createClient({ url: env.DATABASE_URL });
if (env.NODE_ENV !== "production") globalForDb.client = client;

export const db = drizzle(client, {
  schema: {
    ...user,
    ...account,
    ...session,
    ...verification,
    ...device,
    ...sensor,
  },
});
