"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { deviceRegisterSchema, type DeviceRegisterInput } from "@/lib/validations/device"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, Monitor, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function RegisterDevicePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<DeviceRegisterInput>({
    resolver: zodResolver(deviceRegisterSchema),
    defaultValues: {
      hostname: "",
      deviceId: "",
      notes: "",
      systemInfo: {
        os: "",
        osVersion: "",
        processor: "",
        totalMemory: undefined,
        architecture: "",
      },
    },
  })

  const onSubmit = async (data: DeviceRegisterInput) => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/devices/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = (await response.json()) as {
        error?: string
        success?: boolean
      }

      if (!response.ok) {
        throw new Error(result.error ?? "Failed to register device")
      }

      toast.success("Device registered successfully!")
      router.push("/dashboard/devices")
    } catch (error) {
      console.error("Registration error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to register device")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex flex-col min-w-full justify-center items-center py-20">
      <div className="mb-8 max-w-1/2">
        <h1 className="text-4xl font-bold tracking-tight text-balance">Register New Device</h1>
        <p className="text-muted-foreground mt-3 text-lg">Add a new device to your monitoring dashboard</p>
      </div>

      <Alert className="mb-8 border-primary/20 bg-primary/5 max-w-1/2">
        <Info className="h-5 w-5 text-primary" />
        <AlertDescription className="text-base leading-relaxed">
          Register your laptop or desktop to start monitoring its performance, battery status, and system metrics. The
          device ID must be unique across all your devices.
        </AlertDescription>
      </Alert>

      <Card className="border-2 max-w-1/2">
        <CardHeader className="space-y-3 pb-8">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Monitor className="h-6 w-6 text-primary" />
            Device Information
          </CardTitle>
          <CardDescription className="text-base">Enter the details of the device you want to register</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                {/* Hostname */}
                <FormField
                  control={form.control}
                  name="hostname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Hostname</FormLabel>
                      <FormControl>
                        <Input placeholder="my-laptop" className="h-11 text-base" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription className="text-sm">
                        A friendly name for your device (e.g., &ldquo;Work Laptop&rdquo;, &ldquo;Home Desktop&rdquo;)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Device ID - Removed Generate button */}
                <FormField
                  control={form.control}
                  name="deviceId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">Device ID</FormLabel>
                      <FormControl>
                        <Input placeholder="laptop_abc123" className="h-11 text-base" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormDescription className="text-sm">
                        A unique identifier for this device. Use only letters, numbers, hyphens, and underscores.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Notes <span className="text-muted-foreground font-normal">(Optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Additional information about this device..."
                          className="resize-none min-h-[100px] text-base"
                          {...field}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription className="text-sm">
                        Any additional notes or description for this device
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* System Info Section */}
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-2 border-b pb-3">
                  <h3 className="text-xl font-semibold">System Information</h3>
                  <span className="text-sm text-muted-foreground">(Optional)</span>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="systemInfo.os"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Operating System</FormLabel>
                        <FormControl>
                          <Input placeholder="Windows 11" className="h-11 text-base" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="systemInfo.osVersion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">OS Version</FormLabel>
                        <FormControl>
                          <Input placeholder="22H2" className="h-11 text-base" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="systemInfo.processor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Processor</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Intel Core i7-12700H"
                            className="h-11 text-base"
                            {...field}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="systemInfo.totalMemory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Total Memory (GB)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="16"
                            className="h-11 text-base"
                            {...field}
                            onChange={(e) =>
                              field.onChange(e.target.value ? Number.parseInt(e.target.value) : undefined)
                            }
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="systemInfo.architecture"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base">Architecture</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger className="h-11 text-base">
                              <SelectValue placeholder="Select architecture" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Unknown">Unknown</SelectItem>
                            <SelectItem value="x32">x32</SelectItem>
                            <SelectItem value="x64">x64</SelectItem>
                            <SelectItem value="x86">x86</SelectItem>
                            <SelectItem value="ARM64">ARM64</SelectItem>
                            <SelectItem value="ARM">ARM</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
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
                <Button type="submit" size="lg" disabled={isLoading} className="min-w-[160px]">
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Registering..." : "Register Device"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}
