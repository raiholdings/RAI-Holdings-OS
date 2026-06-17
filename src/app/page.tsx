import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getHomeMetrics } from "@/lib/home";
import { LiveProvider } from "@/components/home/LiveProvider";
import { Hero } from "@/components/home/Hero";
import { LiveDashboard } from "@/components/home/LiveDashboard";
import { Pillars, FeatureGrid, FeaturedPortfolio, FeaturedPlan, EnterpriseAxes, Impact, FinalCta } from "@/components/home/Sections";

export const dynamic = "force-dynamic";

export default function HomePage() {
  // SSR-seed the live metrics so the dashboard renders real numbers with no layout shift.
  const initial = getHomeMetrics();
  return (
    <>
      <Navbar />
      <LiveProvider initial={initial}>
        <main id="top">
          <Hero />
          <LiveDashboard />
          <Pillars />
          <FeatureGrid />
          <FeaturedPortfolio />
          <FeaturedPlan />
          <EnterpriseAxes />
          <Impact />
          <FinalCta />
        </main>
      </LiveProvider>
      <Footer />
    </>
  );
}
