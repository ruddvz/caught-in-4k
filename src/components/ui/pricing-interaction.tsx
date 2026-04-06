import NumberFlow from '@number-flow/react';
import React from 'react';
import { cn } from '@/lib/utils';
const styles = require('./pricing-interaction.less');

export interface PricingInteractionProps {
    selectedPlanId?: string;
    onSelectPlan?: (planId: string) => void;
}

export function PricingInteraction({ selectedPlanId, onSelectPlan }: PricingInteractionProps) {
    const isMaxTier = selectedPlanId?.includes('-max') || false;
    const tierIndex = isMaxTier ? 1 : 0;

    const handleChangeTier = (index: number) => {
        if (!onSelectPlan) return;
        const isNewMaxTier = index === 1;
        const base = selectedPlanId ? selectedPlanId.replace('-max', '') : '3mo';
        onSelectPlan(isNewMaxTier ? `${base}-max` : base);
    };

    const activePlanIndex = selectedPlanId?.startsWith('1mo') ? 0 :
        selectedPlanId?.startsWith('6mo') ? 2 : 1;

    const handleChangePlan = (index: number) => {
        if (!onSelectPlan) return;
        const isMax = tierIndex === 1;
        let base = '3mo';
        if (index === 0) base = '1mo';
        if (index === 2) base = '6mo';
        onSelectPlan(isMax ? `${base}-max` : base);
    };

    const proPrices = { '1mo': 4.99, '3mo': 13.49, '6mo': 24.99 };
    const maxPrices = { '1mo': 8.99, '3mo': 24.99, '6mo': 44.99 };
    const currentPrices = isMaxTier ? maxPrices : proPrices;

    const plans = [
        { label: '30 Days', key: '1mo' as const, badge: null, idx: 0 },
        { label: '90 Days', key: '3mo' as const, badge: { text: 'Popular', mod: 'badge-popular' }, idx: 1 },
        { label: '180 Days', key: '6mo' as const, badge: { text: 'Best Value', mod: 'badge-best' }, idx: 2 },
    ];

    return (
        <div className={styles['pricing-widget']}>
            {/* Tier toggle */}
            <div className={styles['tier-toggle']}>
                {['Pro (2 Devices)', 'Max (4 Devices)'].map((label, i) => (
                    <button
                        key={label}
                        type="button"
                        className={cn(styles['tier-btn'], { [styles['active']]: tierIndex === i })}
                        onClick={() => handleChangeTier(i)}
                    >
                        {label}
                    </button>
                ))}
                <div
                    className={styles['tier-pill-wrap']}
                    style={{ transform: `translateX(${tierIndex * 100}%)` }}
                >
                    <div className={styles['tier-pill']} />
                </div>
            </div>

            {/* Plan rows */}
            <div className={styles['plans-list']}>
                {plans.map(({ label, key, badge, idx }) => {
                    const isActive = activePlanIndex === idx;
                    return (
                        <div
                            key={key}
                            role="button"
                            tabIndex={0}
                            className={cn(styles['plan-row'], { [styles['active']]: isActive })}
                            onClick={() => handleChangePlan(idx)}
                            onKeyDown={(e) => e.key === 'Enter' && handleChangePlan(idx)}
                        >
                            <div className={styles['plan-info']}>
                                <p className={styles['plan-label']}>
                                    {label}
                                    {badge && (
                                        <span className={cn(styles['plan-badge'], styles[badge.mod])}>
                                            {badge.text}
                                        </span>
                                    )}
                                </p>
                                <p className={styles['plan-price-row']}>
                                    <span className={styles['plan-price-amount']}>
                                        $<NumberFlow value={currentPrices[key]} />
                                    </span>
                                    <span className={styles['plan-price-period']}>
                                        / {label.toLowerCase()}
                                    </span>
                                </p>
                            </div>
                            <div className={cn(styles['radio-circle'], { [styles['active']]: isActive })}>
                                <div className={cn(styles['radio-dot'], { [styles['visible']]: isActive })} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
