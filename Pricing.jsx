import { Link } from "react-router-dom";
import { Check } from "lucide-react";
import PricingPreview from "@/components/home/PricingPreview";

export default function Pricing() {
  return (
    <div className="pt-12">
      <div className="max-w-3xl mx-auto px-5 text-center mb-4">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
          Choose your <span className="gradient-text">plan</span>
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Powerful AI tools at every tier. Cancel anytime.
        </p>
      </div>
      <PricingPreview />
      <div className="max-w-3xl mx-auto px-5 pb-12 text-center">
        <p className="text-muted-foreground">Still have questions?</p>
        <Link to="/contact" className="btn-ghost mt-4 text-sm">Contact us</Link>
      </div>
    </div>
  );
}
