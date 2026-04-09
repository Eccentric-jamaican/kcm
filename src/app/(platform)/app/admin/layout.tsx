import { fetchQuery } from "convex/nextjs"
import { notFound, redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { api } from "@/lib/convex-api"
import { ensureConvexViewer } from "@/lib/convex-server"
import { AdminShell } from "./components/admin-shell"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session.userId) {
    redirect("/sign-in?redirect_url=/app/admin")
  }

  const token = await session.getToken({ template: "convex" })
  if (!token) {
    redirect("/sign-in?redirect_url=/app/admin")
  }

  let viewer

  try {
    await ensureConvexViewer(token)
    viewer = await fetchQuery(api.admin.getViewer, {}, { token })
  } catch {
    notFound()
  }

  return <AdminShell viewer={viewer}>{children}</AdminShell>
}
