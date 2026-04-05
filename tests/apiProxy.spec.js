const { describe, expect, it } = require('@jest/globals');

const {
    calculateSubscriptionExpiry,
    buildAppUrl,
    extractStripePaymentIntentId,
    getAppOriginConfig,
    resolveBearerToken,
    resolveCheckoutBaseUrl,
    resolveCheckoutOrigin,
    shouldCancelSubscriptionForStripeEvent,
    shouldRevokeAccessForStripeEvent,
    validateCheckoutSessionForProvisioning,
    verifyCheckoutRequest,
} = require('../api-proxy');

describe('api proxy helpers', () => {
    it('allows configured frontend origins and falls back to the primary app origin', () => {
        const config = getAppOriginConfig({
            ALLOWED_APP_ORIGINS: 'https://preview.c4k.live',
            APP_BASE_URL: 'https://c4k.live',
            NODE_ENV: 'production',
        });

        expect(config.allowedOrigins).toEqual(['https://c4k.live', 'https://preview.c4k.live']);
        expect(resolveCheckoutOrigin('https://preview.c4k.live', config)).toBe('https://preview.c4k.live');
        expect(resolveCheckoutOrigin('https://evil.example', config)).toBe('https://c4k.live');
    });

    it('keeps the configured app base path in Stripe return urls', () => {
        const config = getAppOriginConfig({
            ALLOWED_APP_ORIGINS: 'https://preview.c4k.live',
            APP_BASE_URL: 'https://c4k.live/app',
            NODE_ENV: 'production',
        });

        expect(resolveCheckoutBaseUrl('https://preview.c4k.live', config)).toBe('https://preview.c4k.live/app');
        expect(buildAppUrl(resolveCheckoutBaseUrl('https://preview.c4k.live', config), '/subscribe', { success: '1' }))
            .toBe('https://preview.c4k.live/app/subscribe?success=1');
        expect(buildAppUrl(resolveCheckoutBaseUrl('https://preview.c4k.live', config), '/subscribe', { cancelled: '1', plan: '6mo' }))
            .toBe('https://preview.c4k.live/app/subscribe?cancelled=1&plan=6mo');
    });

    it('extracts bearer tokens from request headers', () => {
        expect(resolveBearerToken({ authorization: 'Bearer token-123' })).toBe('token-123');
        expect(resolveBearerToken({ authorization: 'Basic token-123' })).toBeNull();
    });

    it('validates paid checkout sessions against plan price and verified email', () => {
        const paidSession = {
            amount_subtotal: 1349,
            currency: 'usd',
            customer_email: 'user@example.com',
            mode: 'payment',
            payment_status: 'paid',
        };

        expect(validateCheckoutSessionForProvisioning({
            expectedEmail: 'user@example.com',
            planConfig: { priceCents: 1349 },
            session: paidSession,
        })).toEqual({ reason: null, valid: true });

        expect(validateCheckoutSessionForProvisioning({
            expectedEmail: 'user@example.com',
            planConfig: { priceCents: 1349 },
            session: { ...paidSession, payment_status: 'unpaid' },
        }).valid).toBe(false);

        expect(validateCheckoutSessionForProvisioning({
            expectedEmail: 'user@example.com',
            planConfig: { priceCents: 1349 },
            session: { ...paidSession, amount_subtotal: 499 },
        }).valid).toBe(false);
    });

    it('extends subscriptions from the later of now or the current expiry', () => {
        const expiresFromNow = calculateSubscriptionExpiry({
            days: 30,
            latestExpiryIso: '2024-12-20T00:00:00.000Z',
            now: '2025-01-01T00:00:00.000Z',
        });
        const extendsExistingTerm = calculateSubscriptionExpiry({
            days: 30,
            latestExpiryIso: '2025-01-10T00:00:00.000Z',
            now: '2025-01-01T00:00:00.000Z',
        });

        expect(expiresFromNow.toISOString()).toBe('2025-01-31T00:00:00.000Z');
        expect(extendsExistingTerm.toISOString()).toBe('2025-02-09T00:00:00.000Z');
    });

    it('requires a valid bearer token for checkout verification', async () => {
        const supabaseClient = {
            auth: {
                getUser: jest.fn(async (token) => ({
                    data: { user: { email: 'user@example.com', id: 'user-1' } },
                    error: null,
                    token,
                })),
            },
        };

        const verifiedRequest = await verifyCheckoutRequest({
            headers: { authorization: 'Bearer token-123' },
            supabaseClient,
        });
        const rejectedRequest = await verifyCheckoutRequest({
            headers: {},
            supabaseClient,
        });

        expect(verifiedRequest.user).toEqual({ email: 'user@example.com', id: 'user-1' });
        expect(rejectedRequest.error).toEqual({ message: 'Please sign in again before checkout.', status: 401 });
    });

    it('identifies negative Stripe events by payment intent', () => {
        expect(extractStripePaymentIntentId({ object: 'charge', payment_intent: 'pi_123' })).toBe('pi_123');
        expect(shouldCancelSubscriptionForStripeEvent('charge.refunded')).toBe(true);
        expect(shouldCancelSubscriptionForStripeEvent('checkout.session.completed')).toBe(false);
        expect(shouldRevokeAccessForStripeEvent({
            type: 'charge.refunded',
            data: { object: { amount: 1349, amount_refunded: 500, refunded: false } },
        })).toBe(false);
        expect(shouldRevokeAccessForStripeEvent({
            type: 'charge.refunded',
            data: { object: { amount: 1349, amount_refunded: 1349, refunded: true } },
        })).toBe(true);
    });
});