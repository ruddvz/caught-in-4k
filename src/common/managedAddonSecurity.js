const BLOCKED_LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

const BLOCKED_LOCAL_HOST_SUFFIXES = ['.localhost', '.local', '.localtest.me', '.lvh.me', '.nip.io', '.sslip.io'];

const PRIVATE_IPV4_PATTERNS = [
    /^10\./,
    /^127\./,
    /^169\.254\./,
    /^172\.(1[6-9]|2\d|3[0-1])\./,
    /^192\.168\./,
];

const isBlockedManagedAddonHostname = (hostname) => {
    if (typeof hostname !== 'string' || hostname.length === 0) {
        return true;
    }

    const normalizedHostname = hostname.toLowerCase().replace(/\.$/, '');
    if (
        BLOCKED_LOCAL_HOSTS.has(normalizedHostname)
        || BLOCKED_LOCAL_HOST_SUFFIXES.some((suffix) => normalizedHostname === suffix.slice(1) || normalizedHostname.endsWith(suffix))
        || PRIVATE_IPV4_PATTERNS.some((pattern) => pattern.test(normalizedHostname))
    ) {
        return true;
    }

    return normalizedHostname.startsWith('[') || normalizedHostname.endsWith(']');
};

const sanitizeManagedAddonUrl = (value) => {
    if (typeof value !== 'string') {
        return null;
    }

    const trimmedValue = value.trim();
    if (trimmedValue.length === 0) {
        return null;
    }

    try {
        const parsedUrl = new URL(trimmedValue);
        if (parsedUrl.protocol !== 'https:' || parsedUrl.username || parsedUrl.password) {
            return null;
        }

        if (isBlockedManagedAddonHostname(parsedUrl.hostname)) {
            return null;
        }

        parsedUrl.hash = '';
        return parsedUrl.toString();
    } catch (_error) {
        return null;
    }
};

const validateManagedAddonUrl = (value) => {
    if (typeof value !== 'string' || value.trim().length === 0) {
        return 'Transport URL is required.';
    }

    return sanitizeManagedAddonUrl(value)
        ? null
        : 'Transport URL must use https and point to a public host.';
};

module.exports = {
    isBlockedManagedAddonHostname,
    sanitizeManagedAddonUrl,
    validateManagedAddonUrl,
};