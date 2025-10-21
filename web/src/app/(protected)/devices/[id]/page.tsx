import { notFound } from "next/navigation";
import { getDevice, getLatestDeviceData } from "@/server/db/queries/device";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DevicePage({
  params,
}: {
  params: { id: string };
}) {
  const [device] = await getDevice(params.id);
  if (!device) return notFound();

  const latest = await getLatestDeviceData(params.id, 10);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Device {device.id}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p>
                <strong>Hostname:</strong> {device.hostname}
              </p>
              <p>
                <strong>Status:</strong> {device.status}
              </p>
              <p>
                <strong>Last Seen:</strong>{" "}
                {new Date(device.lastSeen).toLocaleString()}
              </p>
            </div>
            <div>
              <p>
                <strong>System Info:</strong>
              </p>
              <pre className="bg-muted overflow-auto rounded p-2 text-xs">
                {JSON.stringify(device.systemInfo, null, 2)}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Latest Telemetry</CardTitle>
        </CardHeader>
        <CardContent>
          {latest.length === 0 ? (
            <p className="text-muted-foreground text-sm">No data yet.</p>
          ) : (
            <div className="space-y-2">
              {latest.map((row) => (
                <div
                  key={row.timestamp as unknown as string}
                  className="text-sm"
                >
                  <span className="mr-2">
                    {new Date(row.timestamp).toLocaleString()}
                  </span>
                  <span>
                    CPU: {row.cpuUsage}% | Mem: {row.memoryPercent}% | Battery:{" "}
                    {row.batteryPercent ?? "-"}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
