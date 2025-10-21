import { getAllDevices } from "@/server/db/queries/device";
import { getUserSensors } from "@/server/db/queries/sensor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const devices = await getAllDevices();

  // Get user-scoped sensors count
  const sensors = session?.user?.id
    ? await getUserSensors(session.user.id)
    : [];
  const sensorsCount = sensors.length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Devices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{devices.length}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Sensors</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{sensorsCount}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Welcome back!</p>
        </CardContent>
      </Card>
    </div>
  );
}
