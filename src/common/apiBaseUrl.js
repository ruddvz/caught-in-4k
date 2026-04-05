// Copyright (C) 2024 Caught In 4K

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1']);

const trimTrailingSlash = (value) => {
    return typeof value === 'string' ? value.replace(/\/$/, '') : value;
};

const getOriginFromUrlString = (value) => {
    if (typeof value !== 'string' || value.length === 0) {
        return null;
    }

    try {
        return new URL(value).origin;
    } catch (_error) {
        return null;
    }
};

const isAllowedApiBaseUrl = (value, locationObject) => {
    if (typeof value !== 'string' || value.length === 0) {
        return false;
    }

    try {
        const parsedUrl = new URL(value);
        if (parsedUrl.protocol === 'https:') {
            return true;
        }

        const runtimeLocation = locationObject || (typeof window !== 'undefined' ? window.location : null);
        return parsedUrl.protocol === 'http:'
            && isLocalHost(parsedUrl.hostname)
            && (!runtimeLocation || isLocalHost(runtimeLocation.hostname));
    } catch (_error) {
        return false;
    }
};

const isLocalHost = (hostname) => {
    return typeof hostname === 'string' && (LOCAL_HOSTS.has(hostname) || hostname.endsWith('.local'));
};

const resolveApiBaseUrl = (locationObject) => {
    const explicitApiBaseUrl = trimTrailingSlash(process.env.REACT_APP_API_BASE_URL || '');
    if (explicitApiBaseUrl && isAllowedApiBaseUrl(explicitApiBaseUrl, locationObject)) {
        return explicitApiBaseUrl;
    }

    const runtimeLocation = locationObject || (typeof window !== 'undefined' ? window.location : null);
    if (runtimeLocation && isLocalHost(runtimeLocation.hostname)) {
        return 'http://localhost:3001';
    }

    return null;
};

module.exports = {
    getOriginFromUrlString,
    isAllowedApiBaseUrl,
    isLocalHost,
    resolveApiBaseUrl,
};
