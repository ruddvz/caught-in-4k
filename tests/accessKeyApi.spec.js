const { describe, expect, it, beforeEach, afterEach } = require('@jest/globals');

describe('verifyAccessKeyWithApi', () => {
    const originalFetch = global.fetch;

    beforeEach(() => {
        process.env.C4K_ACCESS_KEYS = 'abcd-1234-efgh';
        delete process.env.REACT_APP_API_BASE_URL;
    });

    afterEach(() => {
        global.fetch = originalFetch;
        delete process.env.C4K_ACCESS_KEYS;
        delete process.env.REACT_APP_API_BASE_URL;
        jest.resetModules();
    });

    it('uses local allowlist when no API base URL is configured', async () => {
        const { verifyAccessKeyWithApi } = require('../src/common/accessKeyApi');
        await expect(verifyAccessKeyWithApi('abcd-1234-efgh')).resolves.toBe(true);
        await expect(verifyAccessKeyWithApi('invalid-key-12')).resolves.toBe(false);
    });

    it('prefers API response when proxy is reachable', async () => {
        process.env.REACT_APP_API_BASE_URL = 'http://localhost:3001';
        global.fetch = jest.fn(async () => ({
            ok: true,
            json: async () => ({ valid: false, gateEnabled: true }),
        }));

        jest.resetModules();
        const { verifyAccessKeyWithApi } = require('../src/common/accessKeyApi');
        await expect(verifyAccessKeyWithApi('abcd-1234-efgh')).resolves.toBe(false);
        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:3001/api/access/verify',
            expect.objectContaining({ method: 'POST' })
        );
    });
});
