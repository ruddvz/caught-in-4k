const { describe, expect, it } = require('@jest/globals');

const { computeDaysRemaining, getSubscriptionAccessState } = require('../src/common/subscriptionAccess');

const NOW = new Date('2025-01-01T00:00:00.000Z');

describe('subscription access state', () => {
    it('treats approved users with an active term as subscribed', () => {
        const accessState = getSubscriptionAccessState({
            now: NOW,
            profile: { status: 'approved', is_admin: false },
            subscription: { expires_at: '2025-01-04T00:00:00.000Z' },
        });

        expect(accessState.isApproved).toBe(true);
        expect(accessState.isSubscribed).toBe(true);
        expect(accessState.daysRemaining).toBe(3);
    });

    it('does not grant access to suspended users with remaining time', () => {
        const accessState = getSubscriptionAccessState({
            now: NOW,
            profile: { status: 'suspended', is_admin: false },
            subscription: { expires_at: '2025-01-04T00:00:00.000Z' },
        });

        expect(accessState.daysRemaining).toBe(3);
        expect(accessState.hasActiveSubscription).toBe(true);
        expect(accessState.isSubscribed).toBe(false);
        expect(accessState.isSuspended).toBe(true);
    });

    it('does not grant access to pending users with remaining time', () => {
        const accessState = getSubscriptionAccessState({
            now: NOW,
            profile: { status: 'pending', is_admin: false },
            subscription: { expires_at: '2025-01-04T00:00:00.000Z' },
        });

        expect(accessState.hasActiveSubscription).toBe(true);
        expect(accessState.isApproved).toBe(false);
        expect(accessState.isSubscribed).toBe(false);
    });

    it('treats approved admins as entitled even without a paid term', () => {
        const accessState = getSubscriptionAccessState({
            now: NOW,
            profile: { status: 'approved', is_admin: true },
            subscription: null,
        });

        expect(accessState.hasActiveSubscription).toBe(false);
        expect(accessState.isEntitled).toBe(true);
        expect(accessState.isSubscribed).toBe(false);
    });

    it('treats suspended admins as non-admin and non-entitled', () => {
        const accessState = getSubscriptionAccessState({
            now: NOW,
            profile: { status: 'suspended', is_admin: true },
            subscription: null,
        });

        expect(accessState.isAdmin).toBe(false);
        expect(accessState.isApproved).toBe(false);
        expect(accessState.isEntitled).toBe(false);
    });

    it('returns zero days for expired or invalid timestamps', () => {
        expect(computeDaysRemaining({ expires_at: '2024-12-31T00:00:00.000Z' }, NOW)).toBe(0);
        expect(computeDaysRemaining({ expires_at: 'not-a-date' }, NOW)).toBe(0);
    });
});