const { describe, expect, it } = require('@jest/globals');

const {
    hashSecurityCode,
    validateSecurityCode,
    verifySecurityAction,
} = require('../src/common/profileSecurity');

describe('profile security rules', () => {
    it('accepts only four-digit numeric codes', () => {
        expect(validateSecurityCode('2642')).toEqual({ valid: true });
        expect(validateSecurityCode('111')).toEqual({ valid: false, error: 'Codes must be exactly 4 digits.' });
        expect(validateSecurityCode('11a1')).toEqual({ valid: false, error: 'Codes must be exactly 4 digits.' });
        expect(validateSecurityCode('11111')).toEqual({ valid: false, error: 'Codes must be exactly 4 digits.' });
    });

    it('unlocks a profile only with that profile code', () => {
        const profileHash = hashSecurityCode('2642');
        const masterHash = hashSecurityCode('8972');

        expect(verifySecurityAction({ mode: 'unlock', code: '2642', profileHash, masterHash })).toBe(true);
        expect(verifySecurityAction({ mode: 'unlock', code: '8972', profileHash, masterHash })).toBe(false);
        expect(verifySecurityAction({ mode: 'unlock', code: '0000', profileHash, masterHash })).toBe(false);
    });

    it('requires the master code for destructive delete actions', () => {
        const profileHash = hashSecurityCode('2642');
        const masterHash = hashSecurityCode('8972');

        expect(verifySecurityAction({ mode: 'delete', code: '8972', profileHash, masterHash })).toBe(true);
        expect(verifySecurityAction({ mode: 'delete', code: '2642', profileHash, masterHash })).toBe(false);
    });

    it('allows pin removal with either the profile code or the account master code', () => {
        const profileHash = hashSecurityCode('2642');
        const masterHash = hashSecurityCode('8972');

        expect(verifySecurityAction({ mode: 'remove', code: '2642', profileHash, masterHash })).toBe(true);
        expect(verifySecurityAction({ mode: 'remove', code: '8972', profileHash, masterHash })).toBe(true);
        expect(verifySecurityAction({ mode: 'remove', code: '1111', profileHash, masterHash })).toBe(false);
    });
});