/**
 * Optional server-side access-key verification via api-proxy.
 */

const { resolveApiBaseUrl } = require('./apiBaseUrl');
const { verifyAccessKey } = require('./accessKey');

async function verifyAccessKeyWithApi(rawKey) {
    const localValid = verifyAccessKey(rawKey);
    const apiBaseUrl = resolveApiBaseUrl();
    if (!apiBaseUrl) {
        return localValid;
    }

    try {
        const response = await fetch(`${apiBaseUrl}/api/access/verify`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: rawKey }),
        });
        if (!response.ok) {
            return false;
        }
        const payload = await response.json();
        if (typeof payload.valid === 'boolean') {
            return payload.valid;
        }
    } catch (_error) {
        // Offline or proxy unavailable — fall back to build-time allowlist
    }

    return localValid;
}

module.exports = {
    verifyAccessKeyWithApi,
};
