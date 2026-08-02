import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import ToolsShowcase from "@/components/home/ToolsShowcase";
import Testimonials from "@/components/home/Testimonials";
import PricingPreview from "@/components/home/PricingPreview";
import FAQ from "@/components/home/FAQ";

export default function Home() {
  return (
    <>
      <Hero />
      <Features />
      <ToolsShowcase />
      <Testimonials />
      <PricingPreview />
      <FAQ />
    </>
  );
}
