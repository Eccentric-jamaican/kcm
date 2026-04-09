import { auth } from "@clerk/nextjs/server"
import { fetchMutation } from "convex/nextjs"
import { api } from "@/lib/convex-api"

export async function getConvexServerToken() {
  const session = await auth()

  if (!session.userId) {
    return null
  }

  return await session.getToken({ template: "convex" })
}

export async function requireConvexServerToken() {
  const token = await getConvexServerToken()

  if (!token) {
    throw new Error("Missing Convex auth token")
  }

  return token
}

export async function ensureConvexViewer(token: string) {
  await fetchMutation(api.users.upsertCurrentUser, {}, { token })
}
