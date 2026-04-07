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
            <SidebarGroupLabel>Quick Links</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="grid gap-2 px-1">
                <Link href="/app/admin/courses/new" className="rounded-2xl border bg-card px-3 py-3 text-sm transition-colors hover:bg-muted">
                  <div className="flex items-center gap-2 font-medium">
                    <HugeiconsIcon icon={File} strokeWidth={2} className="h-4 w-4" />
                    New Course
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Start a draft and create its default chapter automatically.</p>
                </Link>
                <Link href="/app/courses" className="rounded-2xl border bg-card px-3 py-3 text-sm transition-colors hover:bg-muted">
                  <div className="flex items-center gap-2 font-medium">
                    <HugeiconsIcon icon={View} strokeWidth={2} className="h-4 w-4" />
                    Learner Library
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Jump to the public course experience.</p>
                </Link>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t border-sidebar-border p-3">
          <div className="rounded-[1.25rem] border bg-card p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{viewer.name ?? "Course Maintainer"}</p>
                <p className="truncate text-xs text-muted-foreground">{viewer.email ?? "No email available"}</p>
              </div>
              <Badge variant="outline" className="rounded-full capitalize">
                {viewer.role}
              </Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Link href="/app" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-9 flex-1 rounded-full")}>
                <HugeiconsIcon icon={Play} strokeWidth={2} className="h-4 w-4" />
                Exit
              </Link>
              <Link href="/app/admin/courses" className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "h-9 flex-1 rounded-full")}>
                <HugeiconsIcon icon={Settings02Icon} strokeWidth={2} className="h-4 w-4" />
                Manage
              </Link>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset className="bg-[#f2f2f4]">
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-[#f2f2f4]/90 px-4 backdrop-blur sm:px-6 md:hidden">
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
