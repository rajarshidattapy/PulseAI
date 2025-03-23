"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  Brain,
  ClipboardList,
  Database,
  FileWarning,
  Microscope,
  Stethoscope,
  Settings,
  BarChart3,
  Coins,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const mainModules = [
  {
    title: "Dashboard",
    icon: Activity,
    path: "/dashboard",
  },
  {
    title: "COMPOUNDER AI",
    icon: Microscope,
    path: "/diagnostics",
  },
  {
    title: "DOCTOR AI",
    icon: Stethoscope,
    path: "/query-assistant",
  },
  {
    title: "DIETICIAN AI",
    icon: ClipboardList,
    path: "/care-plans",
  },
  {
    title: "Gym Trainer AI",
    icon: BarChart3,
    path: "/webpage.html",
  },
  {
    title: "GET FIT COINS",
    icon: Coins,
    href: "https://v0-solidity-frontend-integration.vercel.app/token",
  },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar className="border-r border-border">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="text-md font-semibold text-primary font-sans">Health Hub</span>
            <span className="text-xs text-muted-foreground">AI-Powered Healthcare</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainModules.map((module) => (
                <SidebarMenuItem key={module.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === module.path}
                    className="group transition-all duration-200 hover:bg-primary/10 data-[active=true]:bg-primary/15 data-[active=true]:text-primary"
                  >
                    <a href={module.path || module.href || '#'} target={module.href ? "_blank" : undefined} rel="noopener noreferrer">
                    <module.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110 data-[active=true]:text-primary" />
                    <span>{module.title}</span>
                    </a>


                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="px-4 pb-4">

      </div>
    </Sidebar>
  )
}