import {
  MarketingHeader,
  HeroSection,
  FeaturesSection,
  MentorSection,
  TestimonialsSection,
  CoursesSection,
  CTASection,
  MarketingFooter,
} from "@/components/marketing";

export default function MarketingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <MentorSection />
        <TestimonialsSection />
        <CoursesSection />
        <CTASection />
      </main>
      <MarketingFooter />
    </div>
  );
}
