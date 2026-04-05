const { afterEach, describe, expect, it } = require('@jest/globals');

const { resolveApiBaseUrl, getOriginFromUrlString, isAllowedApiBaseUrl, isLocalHost } = require('../src/common/apiBaseUrl');
const {
    DEFAULT_SUBSCRIPTION_PLAN_ID,
    SUBSCRIPTION_PLANS,
    getSubscriptionPlan,
    resolveSubscriptionPlanId,
} = require('../src/common/subscriptionPlans');

describe('subscription plans', () => {
    it('uses a valid default plan id', () => {
        expect(getSubscriptionPlan(DEFAULT_SUBSCRIPTION_PLAN_ID)).not.toBeNull();
    });

    it('keeps ids aligned with the supported fixed-term plans', () => {
        expect(SUBSCRIPTION_PLANS.map((plan) => plan.id)).toEqual(['1mo', '3mo', '6mo']);
    });

    it('keeps display pricing aligned with the supported fixed-term plans', () => {
        expect(SUBSCRIPTION_PLANS.map(({ id, days, price, priceCents }) => ({ id, days, price, priceCents }))).toEqual([
            { id: '1mo', days: 30, price: '$4.99', priceCents: 499 },
            { id: '3mo', days: 90, price: '$13.49', priceCents: 1349 },
            { id: '6mo', days: 180, price: '$24.99', priceCents: 2499 },
        ]);
    });

    it('resolves pricing CTA aliases to the supported plan ids', () => {
        expect(resolveSubscriptionPlanId('basic')).toBe('1mo');
        expect(resolveSubscriptionPlanId('standard')).toBe('3mo');
        expect(resolveSubscriptionPlanId('pro')).toBe('6mo');
        expect(resolveSubscriptionPlanId('3mo')).toBe('3mo');
    });

    it('returns null for unknown plans', () => {
        expect(getSubscriptionPlan('lifetime')).toBeNull();
    });
});

describe('api base resolution', () => {
    const originalApiBaseUrl = process.env.REACT_APP_API_BASE_URL;
    const originalCanonProxyUrl = process.env.REACT_APP_CANON_PROXY_URL;

    afterEach(() => {
        process.env.REACT_APP_API_BASE_URL = originalApiBaseUrl;
        process.env.REACT_APP_CANON_PROXY_URL = originalCanonProxyUrl;
    });

    it('prefers an explicit API base url', () => {
        process.env.REACT_APP_API_BASE_URL = 'https://api.c4k.live/';
        process.env.REACT_APP_CANON_PROXY_URL = 'https://canon.c4k.live/api/canon-take';

        expect(resolveApiBaseUrl({ hostname: 'c4k.live' })).toBe('https://api.c4k.live');
    });

    it('rejects insecure remote API bases but allows local http during development', () => {
        expect(isAllowedApiBaseUrl('http://api.c4k.live', { hostname: 'c4k.live' })).toBe(false);
        expect(isAllowedApiBaseUrl('http://localhost:3001', { hostname: 'localhost' })).toBe(true);
    });

    it('does not reuse the canon proxy origin for authenticated billing requests', () => {
        process.env.REACT_APP_API_BASE_URL = '';
        process.env.REACT_APP_CANON_PROXY_URL = 'https://canon.c4k.live/api/canon-take';

        expect(resolveApiBaseUrl({ hostname: 'c4k.live' })).toBeNull();
    });

    it('only falls back to localhost during local development', () => {
        process.env.REACT_APP_API_BASE_URL = '';
        process.env.REACT_APP_CANON_PROXY_URL = '';

        expect(resolveApiBaseUrl({ hostname: 'localhost' })).toBe('http://localhost:3001');
        expect(resolveApiBaseUrl({ hostname: 'c4k.live' })).toBeNull();
    });

    it('parses valid proxy origins and ignores invalid urls', () => {
        expect(getOriginFromUrlString('https://canon.c4k.live/api/canon-take')).toBe('https://canon.c4k.live');
        expect(getOriginFromUrlString('not-a-url')).toBeNull();
        expect(isLocalHost('127.0.0.1')).toBe(true);
        expect(isLocalHost('c4k.live')).toBe(false);
    });
});
