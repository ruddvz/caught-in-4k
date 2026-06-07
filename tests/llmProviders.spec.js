const { describe, expect, it, afterEach } = require('@jest/globals');

const { generateCanonTakeText } = require('../api-proxy/llmProviders');

describe('llmProviders', () => {
    const originalFetch = global.fetch;
    const originalEnv = { ...process.env };

    afterEach(() => {
        global.fetch = originalFetch;
        process.env = { ...originalEnv };
        jest.resetModules();
    });

    it('falls through providers until one returns text', async () => {
        process.env.GEMINI_API_KEY = 'gemini-key';
        process.env.GROQ_API_KEY = 'groq-key';

        global.fetch = jest.fn(async (url) => {
            if (String(url).includes('generativelanguage.googleapis.com')) {
                return {
                    ok: false,
                    json: async () => ({ error: { message: 'Gemini down' } }),
                };
            }

            if (String(url).includes('api.groq.com')) {
                return {
                    ok: true,
                    json: async () => ({
                        choices: [{ message: { content: 'certified midnight classic' } }],
                    }),
                };
            }

            throw new Error(`Unexpected fetch: ${url}`);
        });

        const result = await generateCanonTakeText({
            title: 'Test Movie',
            year: '2024',
            genres: 'thriller',
            imdbRating: '7.8',
        });

        expect(result).toEqual({
            canonTake: 'certified midnight classic',
            provider: 'Groq',
        });
        expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('returns empty text when every provider fails', async () => {
        process.env.GEMINI_API_KEY = 'gemini-key';

        global.fetch = jest.fn(async () => ({
            ok: false,
            json: async () => ({ error: { message: 'provider unavailable' } }),
        }));

        const result = await generateCanonTakeText({
            title: 'Flop',
            year: '2020',
            genres: 'drama',
            imdbRating: '4.1',
        });

        expect(result).toEqual({ canonTake: '', provider: null });
    });
});
