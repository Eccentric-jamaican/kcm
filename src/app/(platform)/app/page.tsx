import { DashboardHero } from "./components/dashboard-hero";
import { CourseGrid } from "./components/course-grid";

export default function AppHome() {
  return (
    <div className="min-h-[calc(100vh-5rem)]">
      <DashboardHero />
      <CourseGrid />
    </div>
  );
}
