// src/components/ui/pricing-section.tsx
import * as React from "react";
import { CircleCheck } from "lucide-react";

// shadcn/ui bits
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ---- minimal craft-ds inline (single-file helper) ----------------
import { cn } from "@/lib/utils";

type SectionProps = { children: React.ReactNode; className?: string; id?: string };
type ContainerProps = { children: React.ReactNode; className?: string; id?: string };

const Section = ({ children, className, id }: SectionProps) => (
  <section className={cn("py-8 md:py-12", className)} id={id}>
    {children}
  </section>
);

const Container = ({ children, className, id }: ContainerProps) => (
  <div className={cn("mx-auto max-w-5xl p-6 sm:p-8", className)} id={id}>
    {children}
  </div>
);
// ------------------------------------------------------------------

type PlanTier = "Basic" | "Standard" | "Pro";

interface PricingCardProps {
  title: PlanTier;
  price: string;
  description?: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

// Pricing data based on 30, 90, 180 day system as requested
const pricingData: PricingCardProps[] = [
  {
    title: "Basic",
    price: "$4.99 / 30 Days",
    description: "Perfect for casual viewers.",
    features: ["4K Streaming", "Ad-Free", "1 Device", "Standard Support"],
    cta: "Choose Basic",
    href: "/subscribe?plan=1mo",
  },
  {
    title: "Standard",
    price: "$13.49 / 90 Days",
    description: "Our most popular quarterly value.",
    features: ["4K Streaming", "Ad-Free", "2 Devices", "Priority Support", "Offline Downloads"],
    cta: "Choose Standard",
    href: "/subscribe?plan=3mo",
    featured: true,
  },
  {
    title: "Pro",
    price: "$24.99 / 180 Days",
    description: "Best for dedicated binge-watchers.",
    features: ["All Standard Features", "4 Devices", "Family Sharing", "Early Access to Beta Features"],
    cta: "Choose Pro",
    href: "/subscribe?plan=6mo",
  }
];

export default function Pricing() {
  return (
    <Section>
      <Container className="flex flex-col items-center gap-4 text-center">
        <h2 className="!my-0 text-3xl font-bold">Pricing</h2>
        <p className="text-lg opacity-70 md:text-2xl">Select the plan that best suits your needs.</p>

        <div className="not-prose mt-4 grid grid-cols-1 gap-6 min-[900px]:grid-cols-3">
          {pricingData.map((plan) => (
            <PricingCard key={plan.title} plan={plan} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

function PricingCard({ plan }: { plan: PricingCardProps }) {
  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border p-6 text-left",
        plan.featured && "border-primary shadow-sm ring-1 ring-primary/10"
      )}
      aria-label={`${plan.title} plan`}
    >
      <div className="text-center">
        <div className="inline-flex items-center gap-2">
          <Badge variant={plan.featured ? "default" : "secondary"}>{plan.title}</Badge>
          {plan.featured && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Most popular</span>
          )}
        </div>
        <h4 className="mb-2 mt-4 text-2xl text-primary font-bold">{plan.price}</h4>
        {plan.description && <p className="text-sm opacity-70">{plan.description}</p>}
      </div>

      <div className="my-4 border-t" />

      <ul className="space-y-3 flex-grow">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start text-sm opacity-80">
            <CircleCheck className="mr-2 h-4 w-4 mt-0.5 text-primary" aria-hidden />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-6">
        <a href={plan.href}>
          <Button size="sm" className="w-full" variant={plan.featured ? "default" : "secondary"}>
            {plan.cta}
          </Button>
        </a>
      </div>
    </div>
  );
}
