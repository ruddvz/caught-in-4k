const { describe, expect, it } = require('@jest/globals');
const {
    canonTakeBodySchema,
    checkoutBodySchema,
    accessKeyBodySchema,
} = require('../api-proxy/schemas');

describe('api-proxy Zod schemas', () => {
    it('accepts valid canon-take payloads', () => {
        const result = canonTakeBodySchema.safeParse({
            title: 'Inception',
            year: 2010,
            genres: ['Sci-Fi'],
            imdbRating: 8.8,
        });
        expect(result.success).toBe(true);
    });

    it('rejects canon-take with unknown fields', () => {
        const result = canonTakeBodySchema.safeParse({
            title: 'Inception',
            year: 2010,
            genres: 'Sci-Fi',
            imdbRating: 8.8,
            extra: true,
        });
        expect(result.success).toBe(false);
    });

    it('accepts checkout plan enum', () => {
        expect(checkoutBodySchema.safeParse({ plan: 'monthly' }).success).toBe(true);
        expect(checkoutBodySchema.safeParse({ plan: 'invalid' }).success).toBe(false);
    });

    it('validates access key body shape', () => {
        expect(accessKeyBodySchema.safeParse({ key: 'abcd-1234-efgh' }).success).toBe(true);
        expect(accessKeyBodySchema.safeParse({}).success).toBe(false);
        expect(accessKeyBodySchema.safeParse({ key: '' }).success).toBe(false);
    });
});
