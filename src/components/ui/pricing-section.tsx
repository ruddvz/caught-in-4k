// src/components/ui/pricing-section.tsx
import * as React from 'react';
import { CircleCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ---- layout helpers -----------------------------------------------
type SectionProps = { children: React.ReactNode; className?: string; id?: string };
type ContainerProps = { children: React.ReactNode; className?: string; id?: string };

const Section = ({ children, className, id }: SectionProps) => (
    <section className={cn('py-8 md:py-12', className)} id={id}>
        {children}
    </section>
);

const Container = ({ children, className, id }: ContainerProps) => (
    <div className={cn('mx-auto max-w-5xl p-6 sm:p-8', className)} id={id}>
        {children}
    </div>
);
// -------------------------------------------------------------------

type PlanTier = 'Basic' | 'Standard' | 'Pro';

interface PricingCardData {
    planId: string;
    title: PlanTier;
    price: string;
    description?: string;
    features: string[];
    cta: string;
    featured?: boolean;
    badge?: string;
}

const pricingData: PricingCardData[] = [
    {
        planId: '1mo',
        title: 'Basic',
        price: '$4.99 / 30 Days',
        description: 'Perfect for casual viewers.',
        features: ['4K Streaming', 'Ad-Free', '1 Device', 'Standard Support'],
        cta: 'Choose Basic',
    },
    {
        planId: '3mo',
        title: 'Standard',
        price: '$13.49 / 90 Days',
        description: 'Our most popular quarterly value.',
        features: ['4K Streaming', 'Ad-Free', '2 Devices', 'Priority Support', 'Offline Downloads'],
        cta: 'Choose Standard',
        featured: true,
        badge: 'Popular',
    },
    {
        planId: '6mo',
        title: 'Pro',
        price: '$24.99 / 180 Days',
        description: 'Best for dedicated binge-watchers.',
        features: ['All Standard Features', '4 Devices', 'Family Sharing', 'Early Access to Beta Features'],
        cta: 'Choose Pro',
        badge: 'Best Value',
    },
];

// ---- Interactive plan selector (used inside Subscribe page) -------

export interface PricingCardsProps {
    selectedPlanId?: string;
    onSelectPlan?: (planId: string) => void;
}

export function PricingCards({ selectedPlanId, onSelectPlan }: PricingCardsProps) {
    return (
        <div className="grid grid-cols-1 gap-3 min-[640px]:grid-cols-3">
            {pricingData.map((plan) => (
                <InteractivePricingCard
                    key={plan.planId}
                    plan={plan}
                    selected={selectedPlanId === plan.planId}
                    onSelect={onSelectPlan ? () => onSelectPlan(plan.planId) : undefined}
                />
            ))}
        </div>
    );
}

interface InteractivePricingCardProps {
    plan: PricingCardData;
    selected?: boolean;
    onSelect?: () => void;
}

function InteractivePricingCard({ plan, selected, onSelect }: InteractivePricingCardProps) {
    return (
        <div
            className={cn(
                'flex flex-col rounded-xl border p-4 text-left transition-all duration-200',
                'bg-white/[0.04] text-white',
                plan.featured && !selected && 'border-[#7ecec4]/30',
                selected
                    ? 'border-[#7ecec4] bg-[#7ecec4]/10 scale-[1.02] shadow-lg shadow-[#7ecec4]/10'
                    : 'border-white/10 hover:border-white/20 hover:bg-white/[0.07] cursor-pointer',
            )}
            aria-label={`${plan.title} plan`}
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect?.()}
        >
            <div className="text-center">
                <div className="inline-flex items-center gap-1.5 flex-wrap justify-center">
                    <Badge
                        variant={plan.featured ? 'default' : 'secondary'}
                        className={cn(
                            plan.featured
                                ? 'bg-[#7ecec4] text-[#0f0f0f] border-transparent hover:bg-[#7ecec4]/90'
                                : 'bg-white/10 text-white/80 border-transparent hover:bg-white/20',
                        )}
                    >
                        {plan.title}
                    </Badge>
                    {plan.badge && (
                        <span className="rounded-full bg-[#7ecec4]/15 px-2 py-0.5 text-[10px] font-semibold text-[#7ecec4]">
                            {plan.badge}
                        </span>
                    )}
                </div>
                <p className="mb-1 mt-3 text-lg font-bold text-white leading-tight">{plan.price}</p>
                {plan.description && <p className="text-[11px] text-white/45">{plan.description}</p>}
            </div>

            <div className="my-3 border-t border-white/10" />

            <ul className="space-y-2 flex-grow">
                {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-[11px] text-white/65">
                        <CircleCheck
                            className={cn('h-3.5 w-3.5 mt-0.5 shrink-0', selected ? 'text-[#7ecec4]' : 'text-[#7ecec4]/70')}
                            aria-hidden
                        />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>

            {selected && (
                <div className="mt-3 pt-3 border-t border-[#7ecec4]/20">
                    <p className="text-[11px] text-center font-semibold text-[#7ecec4]">✓ Selected</p>
                </div>
            )}
        </div>
    );
}

// ---- Standalone display component (no interaction) ----------------

export default function Pricing() {
    return (
        <Section>
            <Container className="flex flex-col items-center gap-4 text-center">
                <h2 className="!my-0 text-3xl font-bold text-white">Pricing</h2>
                <p className="text-lg text-white/70 md:text-2xl">Select the plan that best suits your needs.</p>
                <div className="not-prose mt-4 w-full">
                    <PricingCards />
                </div>
            </Container>
        </Section>
    );
}
