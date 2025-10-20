"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Gauge, Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Sensor {
  id: string;
  name: string;
  measurementType: string;
  deviceId?: string | null;
  location?: string | null;
  status: string;
  createdAt: Date;
}

export default function SensorsPage() {
  const router = useRouter();
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchSensors = async () => {
    try {
      const response = await fetch("/api/sensors");
      const data: unknown = await response.json();

      if (
        data &&
        typeof data === "object" &&
        "success" in data &&
        data.success &&
        "sensors" in data &&
        Array.isArray(data.sensors)
      ) {
        setSensors(data.sensors);
      }
    } catch (error) {
      console.error("Error fetching sensors:", error);
      toast.error("Failed to load sensors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSensors();
  }, []);

  const handleDelete = async (sensorId: string) => {
    try {
      const response = await fetch(`/api/sensors/${sensorId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete sensor");
      }

      toast.success("Sensor deleted successfully");
      setSensors((prev) => prev.filter((s) => s.id !== sensorId));
    } catch (error) {
      console.error("Error deleting sensor:", error);
      toast.error("Failed to delete sensor");
    } finally {
      setDeleteId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "inactive":
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
      case "offline":
        return "bg-red-500/10 text-red-700 dark:text-red-400";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <div className="container min-w-full space-y-6 py-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sensors</h1>
          <p className="text-muted-foreground">
            Manage your IoT sensors and their configurations
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/sensors/register")}>
          <Plus className="mr-2 h-4 w-4" />
          Register Sensor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Your Sensors
          </CardTitle>
          <CardDescription>
            {sensors.length} sensor{sensors.length !== 1 ? "s" : ""} registered
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
            </div>
          ) : sensors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Gauge className="text-muted-foreground mb-4 h-12 w-12" />
              <h3 className="mb-2 text-lg font-semibold">No sensors yet</h3>
              <p className="text-muted-foreground mb-4 text-sm">
                Get started by registering your first IoT sensor
              </p>
              <Button
                onClick={() => router.push("/dashboard/sensors/register")}
              >
                <Plus className="mr-2 h-4 w-4" />
                Register Sensor
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Device</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sensors.map((sensor) => (
                  <TableRow key={sensor.id}>
                    <TableCell className="font-medium">{sensor.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {sensor.measurementType
                          .replace(/_/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Badge>
                    </TableCell>
                    <TableCell>{sensor.location ?? "—"}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {sensor.deviceId ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={getStatusColor(sensor.status)}
                      >
                        {sensor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(sensor.id)}
                      >
                        <Trash2 className="text-destructive h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sensor</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this sensor? This action cannot be
              undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
