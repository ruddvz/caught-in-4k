// Copyright (C) 2024 Caught In 4K

const SUBSCRIPTION_PLANS = [
    {
        id: '1mo',
        label: 'Pro 30 Days',
        days: 30,
        durationLabel: '30 days',
        price: '$4.99',
        priceCents: 499,
        period: '/30 days',
        badge: null,
        savings: null,
    },
    {
        id: '3mo',
        label: 'Pro 90 Days',
        days: 90,
        durationLabel: '90 days',
        price: '$13.49',
        priceCents: 1349,
        period: '/90 days',
        badge: 'Popular',
        savings: 'Save 10%',
    },
    {
        id: '6mo',
        label: 'Pro 180 Days',
        days: 180,
        durationLabel: '180 days',
        price: '$24.99',
        priceCents: 2499,
        period: '/180 days',
        badge: 'Best Value',
        savings: 'Save 17%',
    },
    {
        id: '1mo-max',
        label: 'Max 30 Days',
        days: 30,
        durationLabel: '30 days',
        price: '$8.99',
        priceCents: 899,
        period: '/30 days',
        badge: null,
        savings: null,
    },
    {
        id: '3mo-max',
        label: 'Max 90 Days',
        days: 90,
        durationLabel: '90 days',
        price: '$24.99',
        priceCents: 2499,
        period: '/90 days',
        badge: 'Popular',
        savings: 'Save 7%',
    },
    {
        id: '6mo-max',
        label: 'Max 180 Days',
        days: 180,
        durationLabel: '180 days',
        price: '$44.99',
        priceCents: 4499,
        period: '/180 days',
        badge: 'Best Value',
        savings: 'Save 17%',
    },
];

const DEFAULT_SUBSCRIPTION_PLAN_ID = '3mo';

const SUBSCRIPTION_PLAN_ALIASES = {
    basic: '1mo',
    standard: '3mo',
    pro: '6mo',
    max: '6mo-max',
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
