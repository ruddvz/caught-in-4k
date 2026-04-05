'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CircleCheck } from 'lucide-react';
import { Slider } from '@/components/ui/slider';

// ---- minimal craft helpers (single-file) ----------------
import { cn } from '@/lib/utils';

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
// ---------------------------------------------------------

interface PricingCardProps {
    title: 'Basic' | 'Standard' | 'Pro';
    basePrice: number;
    pricePerUser: number;
    description?: string;
    features: string[];
    isPopular?: boolean;
}

// Pricing data based on 30, 90, 180 day system as requested
const pricingData: PricingCardProps[] = [
    {
        title: 'Basic',
        basePrice: 4.99,
        pricePerUser: 1.5,
        description: '30-day starter plan.',
        features: ['4K Streaming', 'Ad-Free', '1 Device Base'],
    },
    {
        title: 'Standard',
        basePrice: 13.49,
        pricePerUser: 2.5,
        description: '90-day seasonal value.',
        features: ['4K Streaming', 'Ad-Free', '2 Devices Base', 'Priority Support'],
        isPopular: true,
    },
    {
        title: 'Pro',
        basePrice: 24.99,
        pricePerUser: 3.5,
        description: '180-day master tier.',
        features: ['All Standard Features', '4 Devices Base', 'Offline Downloads'],
    }
];

function PricingCard({ plan, userCount }: { plan: PricingCardProps; userCount: number }) {
    const totalPriceCents = Math.round((plan.basePrice * 100) + (plan.pricePerUser * 100 * (userCount - 1)));
    const totalPrice = (totalPriceCents / 100).toFixed(2);

    return (
        <div
            className={cn(
                'relative flex flex-col rounded-lg border p-6 transition-all duration-200',
                plan.isPopular && 'z-10 scale-105 border-primary shadow-lg dark:border-gray-300'
            )}
        >
            <div className="text-center">
                <Badge variant={plan.isPopular ? 'default' : 'outline'}>
                    {plan.title}
                    {plan.isPopular && <span className="ml-2 text-xs font-normal">★ Popular</span>}
                </Badge>
                <h4 className="mb-2 mt-4 text-2xl font-bold text-primary">${totalPrice}</h4>
                {plan.description && <p className="text-sm opacity-70">{plan.description}</p>}
                <p className="mt-2 text-xs text-muted-foreground">
                    ${plan.basePrice.toFixed(2)} base + ${plan.pricePerUser.toFixed(2)}/extra user
                </p>
            </div>

            <div className="my-4 border-t" />

            <ul className="space-y-3 text-left flex-grow">
                {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start text-sm opacity-70">
                        <CircleCheck className="mr-2 h-4 w-4 text-primary mt-0.5" aria-hidden />
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function PricingSlider() {
    const [userCount, setUserCount] = useState(1);

    return (
        <Section>
            <Container className="flex flex-col items-center gap-4 text-center">
                <h2 className="!my-0 text-3xl font-bold">Customize Your Squad</h2>
                <p className="text-lg opacity-70 md:text-2xl">
                    Scale your plan based on simultaneous connections.
                </p>

                <div className="mt-8 w-full max-w-md">
                    <div className="mb-2 flex justify-between">
                        <span className="text-sm font-medium">Number of Users</span>
                        <span className="text-sm font-bold text-primary">
                            {userCount} {userCount === 1 ? 'user' : 'users'}
                        </span>
                    </div>
                    <Slider
                        defaultValue={[1]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value: number[]) => setUserCount(value[0])}
                        className="mb-6"
                    />
                </div>

                <div className="not-prose mt-4 grid grid-cols-1 gap-6 min-[850px]:grid-cols-3">
                    {pricingData.map((plan) => (
                        <PricingCard key={plan.title} plan={plan} userCount={userCount} />
                    ))}
                </div>

                <div className="mt-6 max-w-2xl rounded-2xl border border-border bg-card/50 p-4 text-sm text-muted-foreground">
                    Team pricing is a preview concept only. Live checkout currently supports the fixed 30, 90, and 180 day plans on the subscribe page.
                </div>

                <a href="/subscribe?plan=3mo" className="mt-4">
                    <Button size="sm">Open fixed-term checkout</Button>
                </a>
            </Container>
        </Section>
    );
}
