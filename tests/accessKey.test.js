/**
 * @jest-environment node
 */

describe('accessKey', () => {
    const originalKeys = process.env.C4K_ACCESS_KEYS;

    afterEach(() => {
        process.env.C4K_ACCESS_KEYS = originalKeys;
        jest.resetModules();
    });

    it('normalizeAccessKey strips non-alphanumeric and uppercases', () => {
        jest.resetModules();
        const { normalizeAccessKey } = require('../src/common/accessKey');
        expect(normalizeAccessKey('ab12-cd34-ef56')).toBe('AB12CD34EF56');
        expect(normalizeAccessKey('')).toBe('');
    });

    it('verifyAccessKey accepts keys from C4K_ACCESS_KEYS', () => {
        process.env.C4K_ACCESS_KEYS = 'ABCD1234EFGH,ZZZZYYYYXXXX';
        jest.resetModules();
        const { verifyAccessKey, isAccessKeyGateEnabled } = require('../src/common/accessKey');
        expect(isAccessKeyGateEnabled()).toBe(true);
        expect(verifyAccessKey('abcd-1234-efgh')).toBe(true);
        expect(verifyAccessKey('ZZZZ-YYYY-XXXX')).toBe(true);
        expect(verifyAccessKey('AAAAAAAAAAAA')).toBe(false);
    });

    it('isAccessKeyGateEnabled is false when env is empty', () => {
        process.env.C4K_ACCESS_KEYS = '';
        jest.resetModules();
        const { isAccessKeyGateEnabled } = require('../src/common/accessKey');
        expect(isAccessKeyGateEnabled()).toBe(false);
    });
});
