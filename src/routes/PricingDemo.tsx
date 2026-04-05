
import React from 'react';
import PricingSection from '@/components/ui/pricing-section';
import PricingSliderDemo from '@/components/ui/pricing-slider-demo';

const PricingDemo = () => {
    return (
        <div className="min-h-screen bg-background text-foreground p-8 overflow-auto">
            <div className="max-w-6xl mx-auto space-y-24">
                <section>
                    <h1 className="text-4xl font-bold text-center mb-4 text-primary">Static Pricing Section</h1>
                    <p className="text-center text-muted-foreground mb-12">
                        Transparent pricing for 30, 90, and 180 day billing cycles.
                    </p>
                    <PricingSection />
                </section>

                <section className="bg-card/50 p-8 rounded-3xl border border-border shadow-2xl">
                    <h2 className="text-3xl font-bold text-center mb-4 text-primary">Dynamic Pricing Slider</h2>
                    <p className="text-center text-muted-foreground mb-12">
                        Scale your plan based on the number of users in your organization.
                    </p>
                    <div className="max-w-4xl mx-auto">
                        <PricingSliderDemo />
                    </div>
                </section>
                
                <footer className="text-center py-12 text-sm text-muted-foreground border-t border-border">
                    <p>© 2024 Caught In 4K - Premium AI Streaming</p>
                </footer>
            </div>
        </div>
    );
};

export default PricingDemo;
