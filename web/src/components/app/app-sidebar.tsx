"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuAction,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { AccountMenu } from "@/components/app";
import {
  Home,
  PanelLeft,
  Settings,
  HardDrive,
  ChevronDown,
  Gauge,
  Wifi,
  type LucideIcon,
} from "lucide-react";

function NavItem({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip={label}>
        <Link href={href} className="flex items-center gap-2">
          <Icon className="size-4" />
          <span>{label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1 text-sm font-semibold">
          <PanelLeft className="size-4" />
          GitGud
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Overview</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <NavItem href="/dashboard" icon={Home} label="Dashboard" />
              <DeviceGroup />
              <SensorGroup />
              <NavItem
                href="/integrations/unifi"
                icon={Wifi}
                label="UniFi Network"
              />
              <NavItem href="/settings" icon={Settings} label="Settings" />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2">
          <AccountMenu />
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

function DeviceGroup() {
  const pathname = usePathname();
  const isActive =
    pathname === "/dashboard/devices" ||
    pathname.startsWith("/dashboard/devices/");
  const [open, setOpen] = useState<boolean>(isActive);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip="Devices">
        <Link href="/dashboard/devices" className="flex items-center gap-2">
          <HardDrive className="size-4" />
          <span>Devices</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuAction
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="Toggle devices submenu"
        className={cn(open && "rotate-180")}
      >
        <ChevronDown className="size-4" />
      </SidebarMenuAction>
      {open && (
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton
              asChild
              isActive={pathname === "/dashboard/devices"}
            >
              <Link href="/dashboard/devices">List</Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton
              asChild
              isActive={pathname.startsWith("/dashboard/devices/register")}
            >
              <Link href="/dashboard/devices/register">Register</Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

function SensorGroup() {
  const pathname = usePathname();
  const isActive =
    pathname === "/dashboard/sensors" ||
    pathname.startsWith("/dashboard/sensors/");
  const [open, setOpen] = useState<boolean>(isActive);

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive} tooltip="Sensors">
        <Link href="/dashboard/sensors" className="flex items-center gap-2">
          <Gauge className="size-4" />
          <span>Sensors</span>
        </Link>
      </SidebarMenuButton>
      <SidebarMenuAction
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        aria-label="Toggle sensors submenu"
        className={cn(open && "rotate-180")}
      >
        <ChevronDown className="size-4" />
      </SidebarMenuAction>
      {open && (
        <SidebarMenuSub>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton
              asChild
              isActive={pathname === "/dashboard/sensors"}
            >
              <Link href="/dashboard/sensors">List</Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
          <SidebarMenuSubItem>
            <SidebarMenuSubButton
              asChild
              isActive={pathname.startsWith("/dashboard/sensors/register")}
            >
              <Link href="/dashboard/sensors/register">Register</Link>
            </SidebarMenuSubButton>
          </SidebarMenuSubItem>
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}
