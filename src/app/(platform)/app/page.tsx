import { fetchQuery } from "convex/nextjs"
import { DashboardHero } from "./components/dashboard-hero"
import { CourseGrid } from "./components/course-grid"
import { api } from "@/lib/convex-api"
import { getConvexServerToken } from "@/lib/convex-server"

export default async function AppHome() {
  const token = await getConvexServerToken()
  const courses = token ? await fetchQuery(api.courses.listPublished, {}, { token }) : []

  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <DashboardHero />
      <CourseGrid courses={courses} />
    </div>
  )
}
