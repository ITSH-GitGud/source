"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  registerSensorSchema,
  type RegisterSensorInput,
  measurementTypes,
} from "@/lib/validations/sensor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Gauge, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterSensorPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState<
    Array<{ id: string; hostname: string }>
  >([]);

  const form = useForm<RegisterSensorInput>({
    resolver: zodResolver(registerSensorSchema),
    defaultValues: {
      id: "",
      name: "",
      measurementType: "temperature",
      deviceId: undefined,
      location: "",
    },
  });

  useEffect(() => {
    // Fetch user's devices for the dropdown
    fetch("/api/devices")
      .then((res) => res.json())
      .then((data: unknown) => {
        if (
          data &&
          typeof data === "object" &&
          "success" in data &&
          data.success &&
          "devices" in data &&
          Array.isArray(data.devices)
        ) {
          setDevices(data.devices);
        }
      })
      .catch(console.error);
  }, []);

  const onSubmit = async (data: RegisterSensorInput) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/sensors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = (await response.json()) as {
        error?: string;
        success?: boolean;
      };

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to register sensor");
      }

      toast.success("Sensor registered successfully!");
      router.push("/dashboard/sensors");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to register sensor",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex min-w-full flex-col items-center justify-center py-20">
      <div className="mb-8 max-w-1/2">
        <h1 className="text-4xl font-bold tracking-tight text-balance">
          Register New Sensor
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Add a new IoT sensor to your monitoring dashboard
        </p>
      </div>

      <Alert className="border-primary/20 bg-primary/5 mb-8 max-w-1/2">
        <Info className="text-primary h-5 w-5" />
        <AlertDescription className="text-base leading-relaxed">
          Register your IoT sensor (temperature, air conditioner, TV, etc.) to
          start tracking its data. The sensor ID must be unique across all your
          sensors.
        </AlertDescription>
      </Alert>

      <Card className="max-w-1/2 border-2">
        <CardHeader className="space-y-3 pb-8">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Gauge className="text-primary h-6 w-6" />
            Sensor Information
          </CardTitle>
          <CardDescription className="text-base">
            Enter the details of the sensor you want to register
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                {/* Sensor ID */}
                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Sensor ID
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="sensor_living_room_temp"
                          className="h-11 text-base"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription className="text-sm">
                        A unique identifier for this sensor. Use only letters,
                        numbers, hyphens, and underscores.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Living Room Temperature"
                          className="h-11 text-base"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription className="text-sm">
                        A friendly name for your sensor
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Measurement Type */}
                <FormField
                  control={form.control}
                  name="measurementType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Measurement Type
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 text-base">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {measurementTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type
                                .replace(/_/g, " ")
                                .replace(/\b\w/g, (c) => c.toUpperCase())}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm">
                        The type of measurement this sensor provides
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Device Association (Optional) */}
                <FormField
                  control={form.control}
                  name="deviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Associated Device{" "}
                        <span className="text-muted-foreground font-normal">
                          (Optional)
                        </span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger className="h-11 text-base">
                            <SelectValue placeholder="Select device (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {devices.map((device) => (
                            <SelectItem key={device.id} value={device.id}>
                              {device.hostname} ({device.id})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription className="text-sm">
                        Link this sensor to a monitored device (if applicable)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Location (Optional) */}
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Location{" "}
                        <span className="text-muted-foreground font-normal">
                          (Optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Living Room"
                          className="h-11 text-base"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription className="text-sm">
                        Where is this sensor located?
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 border-t pt-6">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={() => router.back()}
                  disabled={isLoading}
                  className="min-w-[120px]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoading}
                  className="min-w-[160px]"
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Registering..." : "Register Sensor"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
