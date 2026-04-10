"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BookOpen,
  File,
  LayoutDashboard,
  Play,
  Settings02Icon,
  View,
} from "@hugeicons/core-free-icons"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { title: "Dashboard", href: "/app/admin", icon: LayoutDashboard },
  { title: "Courses", href: "/app/admin/courses", icon: BookOpen },
]

export function AdminShell({
  children,
  viewer,
}: {
  children: React.ReactNode
  viewer: { name: string | null; email: string | null; role: string }
}) {
  const pathname = usePathname()

  return (
    <SidebarProvider defaultOpen>
      <Sidebar variant="inset" collapsible="offcanvas">
        <SidebarHeader className="gap-4 border-b border-sidebar-border px-3 py-4">
          <div className="flex items-center justify-between gap-3">
            <Link href="/app/admin" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm">
                KC
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-sidebar-foreground">KCM Maintainer</p>
                <p className="truncate text-xs text-sidebar-foreground/60">Live course control panel</p>
              </div>
            </Link>
            <SidebarTrigger className="md:hidden" />
          </div>
        </SidebarHeader>

        <SidebarContent className="px-2 py-3">
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={
                          <Link href={item.href}>
                            <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                            <span>{item.title}</span>
                          </Link>
                        }
                        isActive={isActive}
                        size="lg"
                      />
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarSeparator />

          <SidebarGroup>
            <SidebarGroupLabel className="text-[11px] font-medium tracking-wider text-muted-foreground">QUICK LINKS</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="grid gap-0.5 px-1.5">
                <Link href="/app/admin/courses/new" className="group flex flex-col gap-0.5 rounded-md px-2.5 py-2 transition-colors hover:bg-sidebar-accent">
                  <div className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
                    <HugeiconsIcon icon={File} strokeWidth={2} className="h-4 w-4" />
                    New Course
                  </div>
                  <p className="pl-6 text-xs text-sidebar-foreground/50 transition-colors group-hover:text-sidebar-foreground/70">Start a draft and default chapter.</p>
                </Link>
                <Link href="/app/courses" className="group flex flex-col gap-0.5 rounded-md px-2.5 py-2 transition-colors hover:bg-sidebar-accent">
                  <div className="flex items-center gap-2 text-sm font-medium text-sidebar-foreground group-hover:text-sidebar-accent-foreground">
                    <HugeiconsIcon icon={View} strokeWidth={2} className="h-4 w-4" />
                    Learner Library
                  </div>
                  <p className="pl-6 text-xs text-sidebar-foreground/50 transition-colors group-hover:text-sidebar-foreground/70">Jump to public course experience.</p>
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="flex flex-col gap-3 px-1 py-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{viewer.name ?? "Course Maintainer"}</p>
                <p className="truncate text-xs text-sidebar-foreground/60">{viewer.email ?? "No email available"}</p>
              </div>
              <Badge variant="secondary" className="rounded-md font-normal text-[10px] capitalize text-sidebar-foreground/70">
                {viewer.role}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Link href="/app" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 flex-1 justify-start gap-2 rounded-md font-medium text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground")}>
                <HugeiconsIcon icon={Play} strokeWidth={2} className="h-4 w-4" />
                Exit
              </Link>
              <Link href="/app/admin/courses" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "h-8 flex-1 justify-start gap-2 rounded-md font-medium text-sidebar-foreground/70 transition-colors hover:text-sidebar-foreground")}>
                <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} className="h-4 w-4" />
                Manage
              </Link>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-background">
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/90 px-4 backdrop-blur sm:px-6 md:hidden">
          <div>
            <p className="text-sm font-semibold">Maintainer Admin</p>
            <p className="text-xs text-muted-foreground">Course operations</p>
          </div>
          <SidebarTrigger />
        </div>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
