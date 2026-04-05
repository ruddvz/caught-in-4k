// Copyright (C) 2024 Caught In 4K

const SUBSCRIPTION_PLANS = [
    {
        id: '1mo',
        label: '1 Month',
        days: 30,
        durationLabel: '30 days',
        price: '$4.99',
        priceCents: 499,
        period: '/month',
        badge: null,
        savings: null,
    },
    {
        id: '3mo',
        label: '3 Months',
        days: 90,
        durationLabel: '90 days',
        price: '$13.99',
        priceCents: 1399,
        period: '/quarter',
        badge: 'Popular',
        savings: 'Save 7%',
    },
    {
        id: '6mo',
        label: '6 Months',
        days: 180,
        durationLabel: '180 days',
        price: '$24.99',
        priceCents: 2499,
        period: '/half-year',
        badge: 'Best Value',
        savings: 'Save 17%',
    },
];

const DEFAULT_SUBSCRIPTION_PLAN_ID = '3mo';

const SUBSCRIPTION_PLAN_MAP = SUBSCRIPTION_PLANS.reduce((accumulator, plan) => {
    accumulator[plan.id] = plan;
    return accumulator;
}, {});

const getSubscriptionPlan = (planId) => {
    if (typeof planId !== 'string') {
        return null;
    }

    return SUBSCRIPTION_PLAN_MAP[planId] || null;
};

module.exports = {
    DEFAULT_SUBSCRIPTION_PLAN_ID,
    SUBSCRIPTION_PLANS,
    getSubscriptionPlan,
};
