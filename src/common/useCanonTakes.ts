/**
 * Canon Takes Cache & API Hook
 * Uses Pollinations.AI (free, no key) as primary, Gemini proxy as fallback
 */

import { useCallback } from 'react';

const { generateCanonTake } = require('./pollinationsApi');

const CACHE_PREFIX = 'c4k_canon_take_';
const PROXY_URL = process.env.REACT_APP_CANON_PROXY_URL || '';

export const useCanonTakes = () => {
    const getCacheKey = (title, year) => `${CACHE_PREFIX}${title}_${year}`;

    const getCached = useCallback((title, year) => {
        try {
            const key = getCacheKey(title, year);
            const cached = localStorage.getItem(key);
            return cached ? JSON.parse(cached) : null;
        } catch (error) {
            console.error('Cache read error:', error);
            return null;
        }
    }, []);

    const setCached = useCallback((title, year, canonTake) => {
        try {
            const key = getCacheKey(title, year);
            localStorage.setItem(key, JSON.stringify({ canonTake, timestamp: Date.now() }));
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }, []);

    const isCached = useCallback((title, year) => {
        return getCached(title, year) !== null;
    }, [getCached]);

    /**
     * Fetch Canon Take — tries Pollinations.AI first, then Gemini proxy fallback
     */
    const fetchCanonTake = useCallback(
        async (title, year, genres, imdbRating) => {
            const cached = getCached(title, year);
            if (cached) {
                return cached.canonTake;
            }

            // Primary: Pollinations.AI (free, no key needed)
            try {
                const genresStr = Array.isArray(genres) ? genres.join(', ') : (genres || 'unknown');
                const take = await generateCanonTake(title, year, genresStr, imdbRating);
                if (take) {
                    setCached(title, year, take);
                    return take;
                }
            } catch (err) {
                console.warn('Pollinations Canon Take failed, trying proxy:', err.message);
            }

            // Fallback: Gemini proxy (if configured)
            if (!PROXY_URL) return '';

            try {
                const response = await fetch(PROXY_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title,
                        year,
                        genres: Array.isArray(genres) ? genres.join(', ') : genres,
                        imdbRating,
                    }),
                });

                if (!response.ok) throw new Error(`Proxy error: ${response.statusText}`);

                const data = await response.json();
                if (data.canonTake) {
                    setCached(title, year, data.canonTake);
                    return data.canonTake;
                }
                return '';
            } catch (error) {
                console.error('Canon Take fetch error:', error);
                return '';
            }
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
