const { describe, expect, it } = require('@jest/globals');

const {
    isBlockedManagedAddonHostname,
    sanitizeManagedAddonUrl,
    validateManagedAddonUrl,
} = require('../src/common/managedAddonSecurity');

describe('managed addon security', () => {
    it('rejects local and private hosts', () => {
        expect(isBlockedManagedAddonHostname('localhost')).toBe(true);
        expect(isBlockedManagedAddonHostname('foo.localhost')).toBe(true);
        expect(isBlockedManagedAddonHostname('localhost.')).toBe(true);
        expect(isBlockedManagedAddonHostname('localtest.me')).toBe(true);
        expect(isBlockedManagedAddonHostname('192.168.1.20')).toBe(true);
        expect(isBlockedManagedAddonHostname('addons.c4k.live')).toBe(false);
    });

    it('normalizes safe https addon urls', () => {
        expect(sanitizeManagedAddonUrl(' https://addons.c4k.live/manifest.json#ignored '))
            .toBe('https://addons.c4k.live/manifest.json');
    });

    it('rejects unsafe addon urls with a user-facing validation message', () => {
        expect(sanitizeManagedAddonUrl('http://addons.c4k.live/manifest.json')).toBeNull();
        expect(sanitizeManagedAddonUrl('https://foo.localhost/manifest.json')).toBeNull();
        expect(sanitizeManagedAddonUrl('https://localtest.me/manifest.json')).toBeNull();
        expect(sanitizeManagedAddonUrl('https://localhost:7000/manifest.json')).toBeNull();
        expect(validateManagedAddonUrl('')).toBe('Transport URL is required.');
        expect(validateManagedAddonUrl('https://localhost:7000/manifest.json'))
            .toBe('Transport URL must use https and point to a public host.');
    });
});