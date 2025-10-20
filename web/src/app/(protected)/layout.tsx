"use client"

import type React from "react"

import { useRequireAuth } from "@/hooks/auth"
import { Spinner } from "@/components/ui/spinner"
import { SidebarInset, SidebarProvider, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app/app-sidebar"

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isLoading } = useRequireAuth()

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-8" />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="flex items-center gap-2 border-b px-3">
          <SidebarTrigger />
        </div>
        <div className="flex-1 p-3">{children}</div>
      </SidebarInset>
      <SidebarRail />
    </SidebarProvider>
  )
}
