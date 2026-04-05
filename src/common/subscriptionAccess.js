const computeDaysRemaining = (subscription, now = new Date()) => {
    if (!subscription || !subscription.expires_at) return 0;

    const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
    const expiryTime = new Date(subscription.expires_at).getTime();

    if (Number.isNaN(currentTime) || Number.isNaN(expiryTime)) {
        return 0;
    }

    return Math.max(0, Math.ceil((expiryTime - currentTime) / (1000 * 60 * 60 * 24)));
};

const getSubscriptionAccessState = ({ profile, subscription, now = new Date() } = {}) => {
    const isSuspended = profile?.status === 'suspended';
    const isAdmin = profile?.is_admin === true && !isSuspended;
    const isApproved = isAdmin || profile?.status === 'approved';
    const daysRemaining = computeDaysRemaining(subscription, now);
    const hasActiveSubscription = Boolean(subscription && daysRemaining > 0);
    const isEntitled = Boolean(isApproved && !isSuspended && (isAdmin || hasActiveSubscription));

    return {
        daysRemaining,
        hasActiveSubscription,
        isAdmin,
        isApproved,
        isEntitled,
        isSubscribed: Boolean(isApproved && !isSuspended && hasActiveSubscription),
        isSuspended,
    };
};

module.exports = { computeDaysRemaining, getSubscriptionAccessState };