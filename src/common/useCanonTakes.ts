/**
 * Canon Takes Cache & API Hook
 * Uses Pollinations.AI (free, no key) as primary, Gemini proxy as fallback
 */

import { useCallback } from 'react';

const { generateCanonTakeWithFallbacks } = require('./pollinationsApi');

const CACHE_PREFIX = 'c4k_canon_take_';

export const useCanonTakes = () => {
    const getCacheKey = (title: string, year: string | number) => `${CACHE_PREFIX}${title}_${year}`;

    const getCached = useCallback((title: string, year: string | number) => {
        try {
            const key = getCacheKey(title, year);
            const cached = localStorage.getItem(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    }, []);

    const setCached = useCallback((title: string, year: string | number, canonTake: string) => {
        try {
            const key = getCacheKey(title, year);
            localStorage.setItem(key, JSON.stringify({ canonTake, timestamp: Date.now() }));
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }, []);

    const isCached = useCallback((title: string, year: string | number) => {
        return getCached(title, year) !== null;
    }, [getCached]);

    /**
     * Fetch Canon Take — tries Pollinations.AI first, then Gemini proxy fallback
     */
    const fetchCanonTake = useCallback(
        async (
            title: string,
            year: string | number,
            genres: string | string[] | undefined,
            imdbRating: string | number | null | undefined
        ) => {
            const cached = getCached(title, year);
            if (cached) {
                return cached.canonTake;
            }

            const take = await generateCanonTakeWithFallbacks(title, year, genres, imdbRating);

            if (take) {
                setCached(title, year, take);
                return take;
            }

            return '';
        },
        [getCached, setCached]
    );

    return {
        getCached,
        setCached,
        isCached,
        fetchCanonTake,
    };
};

export default useCanonTakes;
