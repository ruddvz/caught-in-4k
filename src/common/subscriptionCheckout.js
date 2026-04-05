const CHECKOUT_STATUS_REFRESH_INTERVAL_MS = 1500;
const MAX_CHECKOUT_STATUS_REFRESH_ATTEMPTS = 5;

const trimTrailingSlash = (value = '') => value.replace(/\/+$/, '');

const buildCheckoutSessionRequest = ({ apiBaseUrl, accessToken, plan }) => {
    const normalizedApiBaseUrl = trimTrailingSlash(apiBaseUrl || '');
    const normalizedAccessToken = typeof accessToken === 'string' ? accessToken.trim() : '';

    return {
        url: `${normalizedApiBaseUrl}/api/stripe/create-checkout-session`,
        options: {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(normalizedAccessToken ? { Authorization: `Bearer ${normalizedAccessToken}` } : {}),
            },
            body: JSON.stringify({ plan }),
        },
    };
};

const shouldContinueCheckoutRefresh = ({
    attemptCount,
    isSubscribed,
    isSuspended,
    maxAttempts = MAX_CHECKOUT_STATUS_REFRESH_ATTEMPTS,
}) => {
    return !isSubscribed && !isSuspended && attemptCount < maxAttempts;
};

module.exports = {
    buildCheckoutSessionRequest,
    CHECKOUT_STATUS_REFRESH_INTERVAL_MS,
    MAX_CHECKOUT_STATUS_REFRESH_ATTEMPTS,
    shouldContinueCheckoutRefresh,
    trimTrailingSlash,
};