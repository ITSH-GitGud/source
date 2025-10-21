import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/server/db";
import { unifiConfig } from "@/server/db/schemas/unifi-config";
import { eq } from "drizzle-orm";
import { encrypt, decrypt } from "@/lib/crypto";

const API_BASE = "https://api.ui.com/v1" as const;

type UnifiSite = { _id: string; name: string; [key: string]: unknown };

function extractArray(val: unknown): unknown[] {
  if (Array.isArray(val)) return val;
  if (val && typeof val === "object") {
    const v = val as Record<string, unknown>;
    if (Array.isArray(v.data)) return v.data as unknown[];
    if (Array.isArray(v.sites)) return v.sites as unknown[];
    if (Array.isArray(v.result)) return v.result as unknown[];
    if (Array.isArray(v.items)) return v.items as unknown[];
  }
  return [];
}

async function fetchUnifiSites(apiKey: string): Promise<UnifiSite[]> {
  const response = await fetch(`${API_BASE}/sites`, {
    headers: { "X-API-KEY": apiKey, Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Failed to fetch networks");
  const raw = (await response.json()) as unknown;
  const arr = extractArray(raw);
  return arr
    .map((item) => {
      if (!item || typeof item !== "object") return undefined;
      const o = item as Record<string, unknown>;
      const idCandidate =
        o.siteId ?? o._id ?? o.id ?? o.site_id ?? o.uuid ?? o.uid ?? undefined;
      const meta =
        o.meta && typeof o.meta === "object"
          ? (o.meta as Record<string, unknown>)
          : undefined;
      const nameCandidate =
        o.name ??
        meta?.name ??
        meta?.desc ??
        o.site_name ??
        o.siteName ??
        o.display_name ??
        o.desc ??
        idCandidate;
      const id = typeof idCandidate === "string" ? idCandidate : undefined;
      const name =
        typeof nameCandidate === "string" ? nameCandidate : undefined;
      if (!id) return undefined;
      return { _id: id, name: name ?? id } satisfies UnifiSite;
    })
    .filter(Boolean) as UnifiSite[];
}

type UnifiAggregate = {
  siteId?: string;
  siteName?: string;
  siteDescription?: string;
  timezone?: string;
  gatewayMac?: string;
  statistics?: {
    counts?: Record<string, number>;
    gateway?: Record<string, unknown>;
    internetIssues?: Array<{
      highLatency?: boolean;
      index?: number;
      latencyAvgMs?: number;
      latencyMaxMs?: number;
      wanDowntime?: boolean;
      count?: number;
    }>;
    ispInfo?: { name?: string; organization?: string };
    percentages?: { txRetry?: number; wanUptime?: number };
    wans?: Record<string, unknown>;
  };
  devices?: unknown[];
  health?: Array<{ subsystem?: string; status?: string }>;
};

async function fetchUnifiSiteData(
  apiKey: string,
  siteId: string,
  siteName?: string,
): Promise<UnifiAggregate> {
  const headers = { "X-API-KEY": apiKey, Accept: "application/json" } as const;

  // Fetch all sites to get full statistics for the selected site
  const sitesRes = await fetch(`${API_BASE}/sites`, { headers });
  if (!sitesRes.ok) {
    return { health: [], devices: [] };
  }
  const sitesRaw = (await sitesRes.json()) as unknown;
  const allSites = extractArray(sitesRaw);

  // Find the selected site
  const selectedSite = allSites.find((s) => {
    if (!s || typeof s !== "object") return false;
    const o = s as Record<string, unknown>;
    return o.siteId === siteId;
  }) as Record<string, unknown> | undefined;

  // Fetch all devices across managed hosts
  const devicesRes = await fetch(`${API_BASE}/devices`, { headers });
  const devicesRaw = devicesRes.ok
    ? ((await devicesRes.json()) as unknown)
    : undefined;
  const allDevices = devicesRaw ? extractArray(devicesRaw) : [];

  // Filter devices for the selected site
  const filteredDevices = allDevices.filter((d) => {
    if (!d || typeof d !== "object") return false;
    const o = d as Record<string, unknown>;
    const candidates = (
      [o.site_id, o.siteId, o.site, o.site_name, o.siteName].filter(
        (v) => typeof v === "string",
      ) as unknown[]
    ).map((s) => s as string);
    return (
      candidates.includes(String(siteId)) ||
      (siteName ? candidates.includes(String(siteName)) : false)
    );
  });

  // Extract site metadata and statistics
  const meta = selectedSite?.meta as Record<string, unknown> | undefined;
  const statistics = selectedSite?.statistics as
    | Record<string, unknown>
    | undefined;

  // Compute health from devices and internet issues
  const offlineStates = new Set([
    "offline",
    "down",
    "disconnected",
    "disabled",
  ]);
  const hasOfflineDevice = filteredDevices.some((d) => {
    const o = d as Record<string, unknown>;
    const state = String(
      (o.state ?? o.status ?? o.device_state ?? "") as string,
    ).toLowerCase();
    return offlineStates.has(state);
  });

  const internetIssues = (statistics?.internetIssues ?? []) as Array<
    Record<string, unknown>
  >;
  const hasLatencyIssues = internetIssues.some(
    (issue) => issue.highLatency === true,
  );
  const hasDowntime = internetIssues.some(
    (issue) => issue.wanDowntime === true,
  );

  const health = [
    {
      subsystem: "devices",
      status: hasOfflineDevice ? "degraded" : "ok",
    },
    {
      subsystem: "internet",
      status: hasLatencyIssues || hasDowntime ? "degraded" : "ok",
    },
  ];

  return {
    siteId: selectedSite?.siteId as string | undefined,
    siteName: (meta?.name as string) ?? undefined,
    siteDescription: (meta?.desc as string) ?? undefined,
    timezone: (meta?.timezone as string) ?? undefined,
    gatewayMac: (meta?.gatewayMac as string) ?? undefined,
    statistics: statistics as UnifiAggregate["statistics"],
    devices: filteredDevices,
    health,
  };
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { apiKey?: string };
  const apiKey: string | undefined = body.apiKey;

  if (!apiKey)
    return NextResponse.json({ error: "Missing apiKey" }, { status: 400 });
  try {
    const networks = await fetchUnifiSites(apiKey);
    return NextResponse.json({ networks });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    apiKey?: string;
    networkId?: string;
    networkName?: string;
  };
  const apiKey: string | undefined = body.apiKey;
  const networkId: string | undefined = body.networkId;
  const networkName: string | undefined = body.networkName;

  if (!apiKey || !networkId)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    // Encrypt the API key before storing
    const encryptedApiKey = await encrypt(apiKey);

    // Check if config exists
    const [existing] = await db
      .select()
      .from(unifiConfig)
      .where(eq(unifiConfig.userId, session.user.id))
      .limit(1);

    if (existing) {
      // Update existing config
      await db
        .update(unifiConfig)
        .set({
          controllerUrl: "https://api.ui.com/v1",
          apiKey: encryptedApiKey,
          networkId,
          networkName,
        })
        .where(eq(unifiConfig.userId, session.user.id));
    } else {
      // Create new config
      await db.insert(unifiConfig).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        controllerUrl: "https://api.ui.com/v1",
        apiKey: encryptedApiKey,
        networkId,
        networkName,
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [config] = await db
      .select()
      .from(unifiConfig)
      .where(eq(unifiConfig.userId, session.user.id))
      .limit(1);

    if (!config)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Decrypt the API key before using it
    const decryptedApiKey = await decrypt(config.apiKey);

    const data = await fetchUnifiSiteData(
      decryptedApiKey,
      config.networkId,
      config.networkName ?? undefined,
    );
    const response = {
      siteId: data.siteId,
      siteName: data.siteName,
      siteDescription: data.siteDescription,
      timezone: data.timezone,
      gatewayMac: data.gatewayMac,
      statistics: data.statistics,
      health: Array.isArray(data.health) ? data.health : [],
      devices: Array.isArray(data.devices) ? data.devices : [],
    } as const;
    return NextResponse.json({ data: response });
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: errorMsg }, { status: 400 });
  }
}
