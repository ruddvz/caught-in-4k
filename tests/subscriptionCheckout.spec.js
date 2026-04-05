const { describe, expect, it } = require('@jest/globals');

const {
    buildCheckoutSessionRequest,
    shouldContinueCheckoutRefresh,
    trimTrailingSlash,
} = require('../src/common/subscriptionCheckout');

describe('subscription checkout helpers', () => {
    it('builds an authenticated checkout request without exposing caller identity in the body', () => {
        const request = buildCheckoutSessionRequest({
            accessToken: 'token-123',
            apiBaseUrl: 'https://api.c4k.live/',
            plan: '3mo',
        });

        expect(request).toEqual({
            options: {
                body: JSON.stringify({ plan: '3mo' }),
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer token-123',
                },
                method: 'POST',
            },
            url: 'https://api.c4k.live/api/stripe/create-checkout-session',
        });
    });

    it('stops checkout polling when access is restored or blocked', () => {
        expect(shouldContinueCheckoutRefresh({ attemptCount: 1, isSubscribed: false, isSuspended: false })).toBe(true);
        expect(shouldContinueCheckoutRefresh({ attemptCount: 1, isSubscribed: true, isSuspended: false })).toBe(false);
        expect(shouldContinueCheckoutRefresh({ attemptCount: 1, isSubscribed: false, isSuspended: true })).toBe(false);
        expect(shouldContinueCheckoutRefresh({ attemptCount: 5, isSubscribed: false, isSuspended: false })).toBe(false);
    });

    it('removes trailing slashes from configured api bases', () => {
        expect(trimTrailingSlash('https://api.c4k.live///')).toBe('https://api.c4k.live');
    });
});