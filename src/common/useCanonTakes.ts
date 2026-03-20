/**
 * Canon Takes Cache & API Hook
 * Manages localStorage caching and Gemini API calls via proxy
 */

import { useCallback } from 'react';

const CACHE_PREFIX = 'c4k_canon_take_';
const PROXY_URL = process.env.REACT_APP_CANON_PROXY_URL || 'http://localhost:3001/api/canon-take';

export const useCanonTakes = () => {
    const getCacheKey = (title, year) => `${CACHE_PREFIX}${title}_${year}`;

    /**
   * Get cached Canon Take
   */
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

    /**
   * Store Canon Take in cache
   */
    const setCached = useCallback((title, year, canonTake) => {
        try {
            const key = getCacheKey(title, year);
            localStorage.setItem(key, JSON.stringify({ canonTake, timestamp: Date.now() }));
        } catch (error) {
            console.error('Cache write error:', error);
        }
    }, []);

    /**
   * Check if Canon Take is cached
   */
    const isCached = useCallback((title, year) => {
        return getCached(title, year) !== null;
    }, [getCached]);

    /**
   * Fetch Canon Take from API (if not cached)
   */
    const fetchCanonTake = useCallback(
        async (title, year, genres, imdbRating) => {
            // Check cache first
            const cached = getCached(title, year);
            if (cached) {
                return cached.canonTake;
            }

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

                if (!response.ok) {
                    throw new Error(`API error: ${response.statusText}`);
                }

                const data = await response.json();
                const { canonTake } = data;

                // Cache the result
                if (canonTake) {
                    setCached(title, year, canonTake);
                }

                return canonTake || '';
            } catch (error) {
                console.error('Canon Take fetch error:', error);
                return ''; // Graceful fallback
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
