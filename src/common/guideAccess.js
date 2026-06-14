// Copyright (C) 2026 Caught in 4K
//
// Products and access logic for the Stremio Setup Guide ($30 one-time) and the
// done-for-you Account Setup service ($120 one-time). These live behind the
// site-wide access-key gate; this module governs which of the two paid products
// an authenticated member has unlocked.
//
// NOTE: This is entirely separate from the site's Pro/Max streaming
// subscription (see subscriptionPlans.js) — do not conflate the two.

// One-time purchase that unlocks the Guide hub + Wizard.
const GUIDE_PRODUCT = {
    id: 'guide',
    name: 'Stremio Setup Guide',
    tagline: 'Do it yourself, the right way.',
    price: '$30',
    priceCents: 3000,
    oneTime: true,
};

// One-time, done-for-you account setup. We provision a streaming account and
// hand over login credentials; the customer logs into the real Stremio apps on
// any device. The $120 covers setup + an included streaming term that depends on
// the server tier they choose.
const SETUP_SERVICE = {
    id: 'setup',
    name: 'Done-for-You Account Setup',
    tagline: 'We set it up. You just log in and watch.',
    price: '$120',
    priceCents: 12000,
    oneTime: true,
};

// The two streaming-server options for the setup service. The $120 fee is the
// same for both — what differs is the number of concurrent streams and how many
// months of streaming are included for that price.
const SERVER_TIERS = [
    {
        id: 'single-ip',
        name: 'Single IP',
        mostPopular: true,
        includedMonths: 6,
        includedDays: 180,
        concurrent: 1,
        termLabel: '6 months included',
        devicesLabel: 'One network / one IP at a time',
        monthlyAfter: '~$5/mo',
        summary: 'Best for one household on one Wi-Fi. Streaming from a different IP can get the account blocked, so it is not for sharing.',
    },
    {
        id: 'multi-ip',
        name: 'Multi-Stream',
        includedMonths: 3,
        includedDays: 90,
        concurrent: 10,
        termLabel: '3 months included',
        devicesLabel: 'Up to 10 concurrent streams',
        monthlyAfter: '~$10/mo',
        summary: 'Stream on up to 10 devices/networks at the same time. Costs more per month, so $120 covers a shorter term. Best if you want to share.',
    },
];

const DEFAULT_SERVER_TIER_ID = 'single-ip';

const SERVER_TIER_MAP = SERVER_TIERS.reduce((accumulator, tier) => {
    accumulator[tier.id] = tier;
    return accumulator;
}, {});

const getServerTier = (tierId) => {
    if (typeof tierId !== 'string') {
        return null;
    }
    const normalized = tierId.trim().toLowerCase();
    return SERVER_TIER_MAP[normalized] || null;
};

// Whether the member can read the Guide + use the Wizard.
//
// Admins always have access. A paid unlock is reflected on the profile row
// (`guide_unlocked` boolean) — the column is read with `select('*')` in
// AuthProvider, so the $30 Stripe webhook (or an admin fulfilling a setup
// request) flipping that column is all that gates real customers.
const getGuideAccessState = ({ profile, isAdmin = false } = {}) => {
    const profileUnlocked = profile?.guide_unlocked === true || profile?.guide_access === true;
    const guideUnlocked = Boolean(isAdmin || profileUnlocked);

    return { guideUnlocked };
};

module.exports = {
    GUIDE_PRODUCT,
    SETUP_SERVICE,
    SERVER_TIERS,
    DEFAULT_SERVER_TIER_ID,
    getServerTier,
    getGuideAccessState,
};
