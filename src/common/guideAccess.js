// Copyright (C) 2026 Caught in 4K
//
// Products and access logic for the Stremio Setup Guide ($30 one-time) and the
// done-for-you Account Setup service ($120 one-time). These live behind the
// site-wide access-key gate; this module only governs which of the two paid
// products an authenticated member has unlocked.

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
// any device. The $120 covers setup + support for the initial term.
const SETUP_SERVICE = {
    id: 'setup',
    name: 'Done-for-You Account Setup',
    tagline: 'We set it up. You just log in and watch.',
    price: '$120',
    priceCents: 12000,
    oneTime: true,
    includedMonths: 6,
};

// The two streaming-server options the customer chooses for the setup service.
// The setup fee is the same; these differ in how many devices/IPs can stream at
// once and in the ongoing monthly server cost the customer carries afterwards.
const SERVER_TIERS = [
    {
        id: 'single-ip',
        name: 'Single IP',
        monthly: '$5/mo',
        monthlyCents: 500,
        concurrent: 1,
        devicesLabel: 'One network (single IP)',
        summary: 'Best for one household on one Wi-Fi. Streaming from a different IP can get the account blocked, so it is not for sharing.',
    },
    {
        id: 'multi-ip',
        name: 'Multi-Device',
        monthly: '$10/mo',
        monthlyCents: 1000,
        concurrent: 10,
        devicesLabel: 'Up to 10 concurrent devices / IPs',
        summary: 'Higher cost, but supports up to 10 devices streaming at the same time across different networks. Best if you want to share.',
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
// AuthProvider, so adding it server-side after a successful $30 checkout is the
// only backend work needed to flip real customers on.
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
