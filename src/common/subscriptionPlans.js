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
        price: '$13.49',
        priceCents: 1349,
        period: '/quarter',
        badge: 'Popular',
        savings: 'Save 10%',
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

const SUBSCRIPTION_PLAN_ALIASES = {
    basic: '1mo',
    standard: '3mo',
    pro: '6mo',
};

const SUBSCRIPTION_PLAN_MAP = SUBSCRIPTION_PLANS.reduce((accumulator, plan) => {
    accumulator[plan.id] = plan;
    return accumulator;
}, {});

const resolveSubscriptionPlanId = (planId) => {
    if (typeof planId !== 'string') {
        return null;
    }

    const normalizedPlanId = planId.trim().toLowerCase();
    if (!normalizedPlanId) {
        return null;
    }

    return SUBSCRIPTION_PLAN_MAP[normalizedPlanId]
        ? normalizedPlanId
        : (SUBSCRIPTION_PLAN_ALIASES[normalizedPlanId] || null);
};

const getSubscriptionPlan = (planId) => {
    const resolvedPlanId = resolveSubscriptionPlanId(planId);

    return resolvedPlanId ? SUBSCRIPTION_PLAN_MAP[resolvedPlanId] : null;
};

module.exports = {
    DEFAULT_SUBSCRIPTION_PLAN_ID,
    SUBSCRIPTION_PLANS,
    getSubscriptionPlan,
    resolveSubscriptionPlanId,
};
